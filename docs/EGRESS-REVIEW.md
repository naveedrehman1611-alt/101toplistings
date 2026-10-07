# Egress review — checking RankYouSite against the mrmedicoedu.com incident

A free-plan Supabase project on another site (mrmedicoedu.com) burned 15.53 GB
against a 5 GB monthly Cached Egress allowance and was restricted. Every
PostgREST call then returned `402 Payment Required`, and because every call site
was written as `const { data } = await …; data ?? []`, the site rendered its
empty states and reported nothing. It looked deployed and healthy while serving
no real content.

This document is the result of auditing this repository for the same defects:
what was found, what was fixed, and what is still open. Reviewed at commit
`9e05539`, against the schema in `supabase/migrations/`.

## Summary

The headline cause there — a one-hour `Cache-Control` on immutable Storage
objects — **cannot happen here today**: this repo has no Storage bucket, no
upload path, no `<img>` or `next/image` usage, no Realtime channel and no
client-side Supabase call. The browser never talks to `*.supabase.co` at all.
Every byte of Supabase egress on this site is server-side reads made during
render. That is a much smaller surface, and it is worth keeping it that way.

What _was_ present is the second half of that incident: the read path was
completely uncached, the layout re-queried on every render, several reads
fetched more than they needed, and — most importantly — **every failure was
silent in exactly the way described in the case study.**

## Found and fixed

### 1. Every read failed silently (the real lesson of the incident)

Twelve of the thirteen reads in `src/lib/queries.ts` discarded `error` and
returned `data ?? []`. A restricted project, a rotated key, a dropped RLS policy
and a genuinely empty table were all indistinguishable — the site would render
"No listings yet" and log nothing.

Every read now goes through `read()` / `readList()`, which keep the graceful
fallback but log the failure with the table name, the message and the PostgREST
code. The proof that it is not a no-op: running a build without network access
to Supabase now prints, per read,

```
[supabase] menu_items.select failed: Host not in allowlist: …
```

where the previous code printed nothing and produced a page of empty states.

`searchListings()` used to throw instead, on the theory that ISR would keep
serving the last good page. In practice most listing routes read `searchParams`
and render per request, so there was no cached page: when Supabase became
unreachable (`TypeError: fetch failed`, September 2026) home, listings, search,
category, city and listing detail all showed "This page couldn't load". It now
retries once on a network failure, then logs via `reportError` and returns `[]`.

### 2. The read path had no cache at all

Next.js 16 does not cache `fetch` by default, and this app caches nothing
explicitly. The route-level `revalidate` exports only cache rendered HTML, so
every dynamic route (`/search`, `/listings`, all of `/admin`, `/login`) went to
PostgREST for every request, and every ISR revalidation did the same.

`src/lib/supabase.ts` now installs a `fetch` on the anon client that opts GET
requests into the Data Cache with a 10-minute lifetime and tags each one with
its table (`pg:settings`, `pg:categories`, …). Admin writes call
`updateTag(tableTag(…))` so an edit is still visible immediately.

Two deliberate details:

- Only the **anon** client gets this. The cookie-bound client in
  `supabase-server.ts` is per-user and must never share a cache entry.
- Non-GET requests are passed through **untouched**, not marked `no-store`.
  Marking them `no-store` is the intuitive move and is wrong: it opts the whole
  route out of static rendering. Doing so turned `/`, `/category/[slug]`,
  `/city/[slug]` and `/listing/[slug]` from prerendered into per-request
  renders — the exact opposite of the goal. This was caught by the build's
  route table, which is the thing to re-read after any change here.

### 3. The root layout cost nine queries on every render

`app/layout.tsx` renders four menus plus settings on every route. `getMenu()`
ran two queries per menu (fetch the menu row, then its items), so the chrome
alone was 9 round trips — repeated for every dynamic route, and again in
`generateMetadata`.

- `getMenu()` now matches the menu through an inner join: 1 query, not 2.
- `getPageSections()` does the same for its `pages` lookup.
- `getSettings`, `getMenu`, `getCategories`, `getCities`, `getListing`,
  `getBlogPost(s)` and `getCurrentUser` are wrapped in React's `cache()`, so
  `generateMetadata` and the render body share one request, and the admin layout
  and the page under it share one `auth.getUser()` round trip instead of two.

Chrome cost per render: 9 queries → 5, and those 5 are now served from the Data
Cache between revalidations.

### 4. Over-fetching

| Read                                         | Was                                                                                                                              | Now                                                                        |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `getBlogPosts()`                             | selected `body` — the full article text — for the blog index, the related-articles rail and the sitemap, none of which render it | `BlogPostSummary` without `body`; only `getBlogPost()` fetches the article |
| `getAllListingSlugs()`                       | unbounded `select('slug')` over the largest table                                                                                | bounded, `limit` argument, newest first                                    |
| `generateStaticParams` for `/listing/[slug]` | prerendered _every_ listing, so build time and build-time egress grow with the directory                                         | newest 200; the rest are rendered on first request and then held by ISR    |

### 5. Result size was the caller's choice, including an anonymous caller's

`search_listings` is `security definer` and anon holds EXECUTE on it, so anyone
with the publishable key can POST to `/rest/v1/rpc/search_listings` directly.
The function ended in `limit greatest(p_limit, 0)`, which has no upper bound —
and `p_limit => null` means `LIMIT NULL`, which in Postgres means _no limit_.
A single crafted request could pull the entire approved table.

**Superseded.** This branch originally added `0012_bound_search_result_size.sql`
(clamping to 60 rows). `main` independently shipped `0012_search_performance.sql`,
which rewrites the same function with per-filter plans and clamps `p_limit` to 100
and the offset to non-negative. That migration is the one in `full_setup.sql` and
on production, so the bound-size file was dropped when the branches were merged —
applying it after 0012_search_performance would have reverted the index work.

On the application side, `parsePage()` now clamps `?page=` to 500 instead of
passing any integer through to a deep `OFFSET`, and the pagination control
renders a window around the current page rather than one link per page (at 800
pages that was kilobytes of markup on every request).

### 6. Open redirect in the sign-in action (not egress, found on the way)

`app/login/page.tsx` accepted any `next` starting with `/`. `//evil.example`
starts with `/` and is a protocol-relative URL, so a successful sign-in could be
redirected off-site. Now rejected.

## Still open — deliberate, with reasons

- **`/listings` ignores its own `revalidate = 300`.** Reading `searchParams`
  makes a route dynamic under the current rendering model, so the export has no
  effect there; the build's route table shows it as `ƒ`. It is now much cheaper
  per request (chrome and taxonomy come from the Data Cache, only the search RPC
  is live), so this is left as is rather than restructured.
- **RPC responses can never be cached by the fetch layer.** PostgREST RPC is a
  POST. If listing search ever becomes the dominant cost, the options are
  `unstable_cache` around `searchListings`, or migrating the app to Cache
  Components (`cacheComponents: true` + `use cache`), which is the direction
  Next.js 16 is pointing and is a whole-app change, not a patch.
- **Keyword search is `ILIKE '%…%'` across three columns**, which cannot use an
  index and scans the table. At 20 listings this is free. It is the first thing
  to fix if search traffic grows — the schema already has a tsvector-shaped
  answer available.
- **`revalidatePath('/', 'layout')` on any settings change** invalidates the
  entire site. Correct (brand and contact render in the layout) but it means one
  settings edit re-renders everything on next visit.
- **Error boundaries.** `src/app/error.tsx` (inside the site chrome, with a
  retry button) and `src/app/global-error.tsx` replace the framework's default
  error page for anything that still throws.

## Rules to keep this from coming back

The mrmedicoedu regression happened because a convention ("always pass
`STORAGE_CACHE_CONTROL` on upload") lived only in the other call sites, so the
next file written simply did not know about it. The equivalents here:

1. **Every Supabase read goes through `src/lib/queries.ts`, and every read there
   goes through `read()`/`readList()`.** A raw `const { data } = await
supabase.from(…)` in a page is the silent-failure bug being reinvented.
2. **Never `select('*')`, and never a list query without a `limit`.** Name the
   columns the page actually renders.
3. **If Storage is ever added** — listing photos are the obvious next feature —
   every `upload()` must pass `cacheControl: '31536000, immutable'` at the call
   site, because Supabase stores that header _with the object_ at upload time
   and there is no metadata-only edit afterwards; fixing it later means
   re-uploading every object. Add the prebuild check from the case study at the
   same time as the first upload path, not after the first bill.
4. **If a client component ever calls Supabase directly** (Realtime, polling, a
   browser-side query), the browser starts talking to `*.supabase.co` and
   Cloudflare and Vercel caching stop applying to that traffic entirely. A poll
   must be gated on the socket's actual status, and a Realtime event must not
   trigger a refetch of data the event already delivered.
5. **After any change to caching, read the route table `next build` prints.**
   `○`/`●` are cached; a route that silently became `ƒ` is a per-request render
   for every visitor.
6. **Budget check:** 5 GB ÷ 30 days ≈ 170 MB/day. The Supabase dashboard's daily
   egress chart is the only thing that actually confirms any of this.

## Homepage rebuild (0021) — what it adds to the read path

Re-checked when the homepage became a section builder (`docs/HOMEPAGE.md`).

- **Fixed cost per regeneration.** All sections, items and their images arrive in one embedded
  `page_sections` read; categories, cities, settings and menus are the layout's cached reads, shared
  through `cache()`. The business carousel adds one `search_listings` RPC and three bounded GETs (covers
  and logos, phone + excerpt from the new `public_listing_cards` view, opening hours); the blog carousel
  one GET. Adding sections in the admin does not add requests, except another carousel of the same kind.
- **No full descriptions on cards.** `public_listing_cards` cuts the description to 200 characters in
  the database, so a card never transfers a whole description.
- **`READ_REVALIDATE_SECONDS` 600 → 3600.** Every in-app write already expires the tags it touches
  (and `runAndReturn` revalidates the tree), so the lifetime only bounds how long a change made directly
  in the database takes to appear. The route table shows the effective interval: `/` is `○` with `1h`.
- **Scoped revalidation.** `runAndReturn` takes an optional scope; section edits expire only
  `pg:page_sections` / `pg:section_items` and re-render `/`, instead of the whole site.
- **Images.** `images.minimumCacheTTL` is 31 days. Uploaded objects are immutable (unique names,
  one-year `cacheControl`), so an optimised variant never goes stale, and each one is fetched from
  Storage about once a month at most.
- **Still no browser → Supabase traffic.** Search, newsletter and favourites are server-side.
- **Link prefetching was rendering dynamic pages for every visitor.** Next prefetches every
  `<Link>` that scrolls into view, and for a route rendered per request (`ƒ`: listings, category,
  city, sign-in, dashboard) with no `loading.js` it renders the whole page. Measured on the local
  stack, one scrolled homepage visit fired **50 prefetches and 7 `search_listings` calls**. The
  homepage, header, footer and `/categories` now use `HoverPrefetchLink`
  (`src/components/hover-prefetch-link.tsx`), the hover/touch/focus pattern from Next's prefetching
  guide: the same visit now makes **0 prefetches and 0 Supabase calls**, and a link the visitor
  points at is still prefetched before the click.
- **Browse searches are cached.** The "still open" item above — RPC results can never be cached by
  the fetch layer — is closed for browse views: `searchListingsResult` keeps results for a category /
  city / sort / page with no keyword and no location in `unstable_cache` (1 hour, tag
  `pg:search_listings`). `runAndReturn`'s default revalidation and `setListingStatus` expire the tag,
  so every listing, review, category and city write is visible at once. Failures throw inside the
  cached function, so an outage is never stored. Keyword and location searches stay live. Measured:
  repeated renders of a category or city page make no database call.

## Logo and photos on the new-listing form

`/dashboard/listings/new` takes an optional logo and up to three photos with the rest of the form,
in one Server Action request. The limits live in `src/lib/listing-image-limits.ts`, which both the
browser and the server import.

- **Shrunk in the browser before upload.** `ImageFileInput` runs `shrinkImage` (`src/lib/image-shrink.ts`)
  as soon as a file is picked: a logo is scaled to fit 512px and a photo to fit 1600px, then encoded as WebP
  down a fixed quality ladder (0.82 → 0.5) until it is at most 1 MB. Browsers without a WebP encoder fall back
  to PNG for logos and JPEG for photos. The steps are fixed, so the same picture always comes out the same.
  Measured in Chromium, an 8.5 MB 4000×3000 JPEG became a 294 KB 1600×1200 WebP, and a 5.4 MB 2000×2000
  PNG logo became 12 KB. Every file is re-encoded, even one already within the limits, which also drops EXIF
  data such as GPS position.
- **The 4.5 MB body cap holds.** The server allows each file at most 1 MB on this form, so four files and
  the text fields fit under Vercel's request limit. The edit page still uploads one file per request with the
  4 MB cap, and it uses the same shrinking input.
- **No duplicate bytes for the cover.** The first photo is both the cover and the first gallery image. Two
  `listing_images` rows point at one media row, so it is one object in Storage and one source image for the
  optimiser.
- **Bounded per listing.** Owners can keep at most 3 gallery photos plus a cover and a logo, and staff can keep
  up to 20 gallery photos. Every image is validated before the listing is inserted. An image that fails to
  store afterwards is reported in the success message instead of being retried.
- **Cache.** Unchanged: unique object names, a one-year `cacheControl` and a 31-day optimiser TTL.
