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

`searchListings()` deliberately keeps throwing instead. On an ISR route a thrown
error means the last good page keeps being served and the failure reaches the
runtime error tracker — both better than replacing real results with an empty
grid.

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

`supabase/migrations/0012_bound_search_result_size.sql` clamps it to 60 rows and
an offset of 6000, well above anything the site itself asks for (12, and 6 on
the homepage rail). **This migration still has to be applied to the project** —
it has not been run against production from here.

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
- **No `error.tsx` anywhere.** A thrown read currently produces the framework's
  default error page.

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
