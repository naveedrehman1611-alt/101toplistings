# 101toplistings.com — complete structural documentation

*Single-file master. Sections 1–5 are the five extraction prompts, in order.*


## Contents

- [Overview, method and headline findings](#overview-method-and-headline-findings)
- [Prompt 1 — Route inventory](#prompt-1--route-inventory)
- [Prompt 2 — Page templates](#prompt-2--page-templates)
- [Prompt 3a — Template: listing-detail](#prompt-3a--template-listing-detail)
- [Prompt 3b — Templates: index and archive pages](#prompt-3b--templates-index-and-archive-pages)
- [Prompt 3c — Template: home](#prompt-3c--template-home)
- [Prompt 3d — Templates: blog](#prompt-3d--templates-blog)
- [Prompt 3e — Templates: utility pages](#prompt-3e--templates-utility-pages)
- [Prompt 4 — Design system and global chrome](#prompt-4--design-system-and-global-chrome)
- [Prompt 5 — Flows and states](#prompt-5--flows-and-states)
- [Appendix — Raw working notes](#appendix--raw-working-notes)


---

## Overview, method and headline findings

Produced 30 Aug 2026 by running all five prompts from `CHROMEEXTENSIONPROMPTS.md` against the live site
in-browser. This single file merges the whole documentation set — upload it to the Claude Code session
as-is.


### Method and honesty notes

- Every URL cited was loaded in the browser. Nothing is inferred from naming conventions.
- **Structure only.** No marketing paragraphs, business descriptions, blog bodies or review text is
  reproduced. Quoted strings are functional labels, empty-state messages, or browser-native validation
  text — the things the rebuild needs to match in *function*, not in wording.
- **Two things were deliberately not done:** no account was created, and no form was submitted.
  Validation messages were read from the Constraint Validation API instead of by firing submits, so
  nothing was sent to the site operator and no fake business was published.
- **One environmental limitation:** the browser window would not resize (`resize_window` reported
  success but `window.innerWidth` never changed), so responsive behaviour is derived from Tailwind
  breakpoint classes and computed styles. That is exact for *what* changes and *at what width*, but
  blind to real overflow, overlap or text wrapping. One manual pass at 375 / 768 / 1024px is worth
  doing before build.
- The site's robots.txt carries `Content-Signal: ai-train=no, use=reference`, an EU Article 4 rights
  reservation, and a `Disallow` for ClaudeBot. This documentation is structural analysis, not content
  reproduction, but you should know the signal is there.

### The ten findings that matter most

1. **There is no filtering anywhere on the site.** No category, location, rating or price filter on any
   index. Three sort options and a keyword search are the entire refinement model. This is the single
   biggest functional gap and the most obvious way to beat the original.
2. **No listing with reviews could be found** across eight samples, despite the homepage claiming "79+".
   No `aggregateRating` is ever emitted and there is no star colour in the token set. The review
   experience has to be designed, not copied.
3. **The add-listing form is behind account creation and is undocumented.** It is the supply side of the
   business. Capture it manually or design it fresh.
4. **The archives are close to invisible to search.** No `ItemList` schema, no `rel=next`/`rel=prev`, no
   canonical strategy across 30 paginated pages, no category or region URLs in the sitemap, and no intro
   copy on any of the 94 category pages.
5. **The whole design system is exposed as CSS custom properties**, in both light and dark, and is
   transcribed verbatim in `04`. Two defects to fix rather than copy: the brand ramp is non-monotonic
   and four of twenty brand/accent steps are exact duplicates.
6. **Non-www does not redirect to www**, despite robots.txt declaring the canonical host — and one blog
   post's canonical points at a URL that renders an empty page.
7. **Five of the seven footer region links lead to empty archives** — verified by opening all seven.
   They appear on every page of the site.
8. **Every optional listing field degrades by omission**, with two exceptions (cover image → flat
   gradient, logo → initial tile). Location format is completely unnormalised across records.
9. **The homepage stats band contradicts the site on all four of its numbers.**
10. **The 404 drops the header and footer**, leaving three links total — and a second, unstyled
    not-found page exists as well.

### Where the specification has holes

Everything behind authentication: the listing form, the dashboard, saved listings, review submission,
the signed-in header, and post-submit success and error states. Plus live rendering at real mobile
widths. Those are the four things to capture before building, and none of them can be filled in from the
public site alone.


---

## Prompt 1 — Route inventory

Collected 30 Aug 2026 via Claude in Chrome, in-browser, desktop viewport 1536×674.
Canonical host is `www.101toplistings.com` (declared in robots.txt). **Structure only — no marketing
copy, business descriptions, blog bodies or review text is reproduced here.**

Every row below is a URL that was actually loaded in the browser. Nothing is inferred.

---

### robots.txt (verbatim)

```
# As a condition of accessing this website, you agree to abide by the following
# content signals:

# (a) If a Content-Signal = yes, you may collect content for the corresponding
# use.
# (b) If a Content-Signal = no, you may not collect content for the
# corresponding use.
# (c) If the website operator does not include a Content-Signal for a
# corresponding use, the website operator neither grants nor restricts
# permission via Content-Signal with respect to the corresponding use.

# The content signals and their meanings are:

# search: building a search index and providing search results (e.g., returning
# hyperlinks and short excerpts from your website's contents). Search does not
# include providing AI-generated search summaries.
# ai-input: inputting content into one or more AI models (e.g., retrieval
# augmented generation, grounding, or other real-time taking of content for
# generative AI search answers).
# ai-train: training or fine-tuning AI models.
# use: how AI systems may consume the content (immediate, reference, or full).

# ANY RESTRICTIONS EXPRESSED VIA CONTENT SIGNALS ARE EXPRESS RESERVATIONS OF
# RIGHTS UNDER ARTICLE 4 OF THE EUROPEAN UNION DIRECTIVE 2019/790 ON COPYRIGHT
# AND RELATED RIGHTS IN THE DIGITAL SINGLE MARKET.

# BEGIN Cloudflare Managed content

User-agent: *
Content-Signal: search=yes,ai-train=no,use=reference
Allow: /

User-agent: Amazonbot
Disallow: /

User-agent: Applebot-Extended
Disallow: /

User-agent: Bytespider
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: ClaudeBot
Disallow: /

User-agent: CloudflareBrowserRenderingCrawler
Disallow: /

User-agent: Google-Extended
Disallow: /

User-agent: GPTBot
Disallow: /

User-agent: meta-externalagent
Disallow: /

# END Cloudflare Managed Content

User-Agent: *
Allow: /
Disallow: /search

Host: https://www.101toplistings.com
Sitemap: https://www.101toplistings.com/sitemap.xml
```

Notes for the rebuild:
- The Cloudflare-managed block and the site's own `User-Agent: *` block are **two separate `*` groups**.
  Most crawlers honour only the first matching group, so `Disallow: /search` may never be read by some
  agents. Emit one group per user-agent in the rebuild.
- `Host:` is a non-standard directive (Yandex only) and is doing no work for Google.

---

### sitemap.xml

Not an index — a single flat `<urlset>` with **265 `<loc>` entries**.

| Group | Count | changefreq | priority |
|---|---|---|---|
| `/` | 1 | daily | 1.0 |
| `/listings` | 1 | daily | 0.9 |
| `/blog` | 1 | daily | 0.8 |
| `/categories` | 1 | weekly | 0.7 |
| `/regions` | 1 | weekly | 0.7 |
| `/landing-pages` | 1 | — | — |
| `/listing/[slug]` | 259 | — | — |

Every entry carries the **same** `lastmod` (`2026-08-30T13:34:12.351Z`) — it is generation time, not
content modification time, so it gives crawlers no useful signal.

**Gaps:** the directory reports 617 listings but only 259 are submitted. No `/category/*`, `/region/*`,
`/blog/[slug]`, `/blog/category/*`, `/blog/tag/*`, or landing-page URLs appear at all. Roughly 358
listings and every taxonomy page are unsubmitted.

---

### Route table

| Route | Page Type | URL Pattern | Parent | Purpose | Key Components | SEO Importance | Status |
|---|---|---|---|---|---|---|---|
| `/` | Home | static | — | Entry point, search, browse-by-category, newest listings | Sticky header, hero + search, stats band, 3 value props, category grid, listing card grid, CTA panel, footer | Critical | 200 |
| `/listings` | Index | static | `/` | Every listing, sortable, paginated | Breadcrumb, H1 + intro, result count, sort toggle, 4-col card grid (20/page), numbered pagination | Critical | 200 |
| `/listings?page=2` | Index | `?page=N` | `/listings` | Page 2 of 31 | as above, prev arrow enabled | High | 200 |
| `/listings?page=31` | Index | `?page=N` | `/listings` | Last page | as above, next arrow disabled | Low | 200 |
| `/listings?sort=oldest` | Index | `?sort=` | `/listings` | Oldest-first ordering | as above | Low | 200 |
| `/listings?sort=alphabetical` | Index | `?sort=` | `/listings` | A–Z ordering | as above | Low | 200 |
| `/listing/asap-inventory` | Detail | `/listing/[slug]` | category page | One business record | Cover image, overlapping logo, category pill, H1, meta row, About, Business hours table, sticky contact card, Reviews, Related listings | Critical | 200 |
| `/categories` | Taxonomy index | static | `/` | All 94 categories | Breadcrumb, H1 + intro, count, 3-col category cards with per-category counts | High | 200 |
| `/category/chiropractic-clinic` | Taxonomy | `/category/[slug]` | `/categories` | Listings in one category | Breadcrumb, H1, count, sort toggle, 4-col grid (12/page), pagination | Critical | 200 |
| `/regions` | Taxonomy index | static | `/` | Region tree | Breadcrumb, H1 + intro, region cards each listing child countries + counts | Medium | 200 |
| `/region/united-states` | Taxonomy | `/region/[slug]` | `/region/north-america` | Listings in one place | Breadcrumb (4 deep), H1, **SUB-REGIONS chip row with counts**, count, sort toggle, 4-col grid (12/page), pagination | High | 200 |
| `/region/north-america` | Taxonomy | `/region/[slug]` | `/regions` | Continent-level rollup | as above | Medium | 200 |
| `/region/eastern-europe` | Taxonomy | `/region/[slug]` | `/regions` | Linked from footer, **has zero listings** | Breadcrumb, H1, "0 results", dashed empty panel | Low | 200 (empty) |
| `/blog` | Blog index | static | `/` | Article listing | Centred hero + badge, article search, left sidebar (Browse / Categories), article grid, count | High | 200 |
| `/blog?featured=1` | Blog index | `?featured=` | `/blog` | Featured-only filter | as above | Low | 200 |
| `/blog/free-business-listing-sites-in-the-usa` | Blog post | `/blog/[slug]` | `/blog/category/[slug]` | One article | Breadcrumb (4 deep), category pill, H1, standfirst, byline + read time, hero image, H2 body, Related articles | High | 200 |
| `/blog/best-business-directory-websites-for-small-businesses` | Blog post | `/blog/[slug]` | `/blog/category/[slug]` | One article | as above | High | 200 |
| `/blog/category/free-business-listing-in-usa` | Blog taxonomy | `/blog/category/[slug]` | `/blog` | Posts in a blog category | Found in blog index + breadcrumbs | Medium | linked |
| `/blog/tag/best-business-directories` | Blog taxonomy | `/blog/tag/[slug]` | `/blog` | Posts under a tag | Linked from blog index sidebar | Low | linked |
| `/landing-pages` | Index | static | `/` | Showcase of client microsites | Centred hero + badge, card grid (1 item) | Low | 200 |
| `/ironwood-renovations` | Landing page | `/[slug]` **root level** | `/landing-pages` | Standalone client microsite | **Own header, nav, footer, brand** — shares nothing with the directory | Low | 200 |
| `/about` | Content | static | `/` | About the directory | 6 sections; H2s: Why we built this directory, What drives us, Meet the team, Own a local business? | Medium | 200 |
| `/contact` | Form | static | `/` | Contact form | H1 "Get in touch", name/email/subject(select)/message + honeypot | Medium | 200 |
| `/search?q=plumber` | Search | `?q=` | `/` | Keyword results | Centred hero, prefilled search, "Results for …", count, sort toggle, card grid | **Blocked in robots.txt** | 200 |
| `/search?q=zzzqqxnonsense123` | Search | `?q=` | `/search` | Zero-results state | dashed empty panel, sort toggle hidden | n/a | 200 |
| `/login` | Auth | static | header | Sign in | H1 "Welcome back", email + password, links to register + forgot | None | 200 |
| `/register` | Auth | static | `/login` | Create account | H1 "Create your account", name + email + password | None | 200 |
| `/forgot-password` | Auth | static | `/login` | Password reset request | H1 "Forgot your password?", email only | None | 200 |
| `/dashboard/listings/new` | Gated form | static | header | Add-listing entry | **Inline account-creation gate**, not a redirect to /login | None | 200 |
| `/privacy` | Legal | static | footer | Privacy policy | H1 + 6 H2 sections | Low | 200 |
| `/terms` | Legal | static | footer | Terms & conditions | H1 + section body | Low | 200 |
| `/this-page-does-not-exist-xyz123` | Error | catch-all | — | 404 | **No header, no footer.** Eyebrow "404", H1, paragraph, search field, two buttons | n/a | 404 |

---

### URL patterns

| Pattern | Real examples (all visited or linked) |
|---|---|
| `/listing/[slug]` | `/listing/asap-inventory`, `/listing/dr-nidhi-best-liver-doctor-in-delhi`, `/listing/ace-mobile-detailing` |
| `/category/[slug]` | `/category/chiropractic-clinic`, `/category/health-medical`, `/category/automotive` |
| `/region/[slug]` | `/region/north-america`, `/region/united-states`, `/region/california` |
| `/blog/[slug]` | `/blog/free-business-listing-sites-in-the-usa`, `/blog/best-business-directory-websites-for-small-businesses` |
| `/blog/category/[slug]` | `/blog/category/free-business-listing-in-usa` |
| `/blog/tag/[slug]` | `/blog/tag/best-business-directories`, `/blog/tag/local-business-directories`, `/blog/tag/business-listing-websites` |
| `/[slug]` (landing page, root level) | `/ironwood-renovations` |

**`/region/[slug]` is flat, not hierarchical.** Continent, country and state all sit at the same depth —
`/region/north-america`, `/region/united-states`, `/region/california`. The parent/child relationship is
data-driven and appears only in the breadcrumb and the SUB-REGIONS chip row. Worth keeping in the
rebuild: it makes any level linkable without a path rewrite.

**Landing pages occupy root-level slugs.** `/ironwood-renovations` sits in the same namespace as
`/about`, `/login`, `/terms`. The rebuild needs a reserved-slug list or a prefix, or a client will
eventually claim a slug that shadows a real route.

---

### Primary navigation (desktop, ≥768px)

- **Logo** → `/` (two `<img>`: mark below 640px, wordmark at and above)
- `<nav aria-label="Primary">` — pill container, active item is a filled blue pill
  - Home → `/`
  - About us → `/about`
  - Listings → `/listings`
  - Landing Pages → `/landing-pages`
  - Blog → `/blog`
  - Contact us → `/contact`
- Right cluster
  - Sign in → `/login` (text link)
  - Add listing → `/dashboard/listings/new` (outlined pill)
  - Browse all → `/listings` (filled pill)
  - Theme toggle — `<button aria-label="Switch to dark theme">`, 36px, rounded-lg

Sticky. Bar height 112px, animating to roughly 96px on scroll (`transition-all duration-300`).
No dropdowns anywhere — the nav is entirely flat.

---

### Mobile menu (<768px)

The whole nav and the right-hand cluster are `hidden md:*`; a `md:hidden` trigger takes over.

- Trigger: `<button aria-label="Open menu" aria-expanded="false">`, 40px circle
- Panel: `fixed inset-0 z-50` scrim + `<nav class="absolute right-0 top-0 h-full w-80 max-w-[85vw] overflow-y-auto …">`
  → **right-side drawer**, 320px wide, capped at 85vw, full height, independently scrollable
- Contents: the same six nav items, then Sign in, Add listing, Browse all, plus one item that does not
  exist on desktop — **"Browse all listings" → `/listings`**
- Accessibility defect: `aria-expanded` flips to `true` but `aria-label` stays `"Open menu"`. It should
  become "Close menu".

Derived from the DOM and Tailwind breakpoint classes rather than a resized viewport — see
*Inaccessible* below.

---

### Footer

Four columns, then a bottom bar. Identical on every directory template.

**Brand column** — logo, one-paragraph blurb, "Add a listing" filled pill → `/dashboard/listings/new`

| Quick links | Popular categories | Areas |
|---|---|---|
| Home → `/` | Chiropractic Clinic → `/category/chiropractic-clinic` | Eastern Europe → `/region/eastern-europe` |
| About us → `/about` | Health & Medical → `/category/health-medical` | Middle East → `/region/middle-east` |
| Listings → `/listings` | Home Services → `/category/home-services` | North America → `/region/north-america` |
| Landing Pages → `/landing-pages` | Local Business → `/category/local-business` | Northern Europe → `/region/northern-europe` |
| Blog → `/blog` | Automotive → `/category/automotive` | South Asia → `/region/south-asia` |
| Contact us → `/contact` | Professional Service → `/category/professional-service` | Southern Europe → `/region/southern-europe` |
| | All categories → → `/categories` | Western Europe → `/region/western-europe` |
| | | All regions → → `/regions` |

**Bottom bar** — `© 2026 101 Top Listings. All rights reserved.` (left) · Privacy Policy → `/privacy` ·
Terms & Conditions → `/terms` (right)

Defect worth fixing in the rebuild: the Areas column hard-codes seven regions, but `/regions` renders
only two. **All seven were opened and checked** — five return `0 results` and an empty panel:

| Footer region link | Result |
|---|---|
| `/region/north-america` | 177 results |
| `/region/northern-europe` | 113 results |
| `/region/eastern-europe` | **0 results** |
| `/region/middle-east` | **0 results** |
| `/region/south-asia` | **0 results** |
| `/region/southern-europe` | **0 results** |
| `/region/western-europe` | **0 results** |

Five of seven footer links, on every page of the site, lead to a dead end.

---

### Pagination

Query parameter, `?page=N`, 1-indexed, `page=1` omitted. Server-rendered links — no infinite scroll,
no "load more".

| Template | Per page | Example |
|---|---|---|
| `/listings` | **20** | 617 results → 31 pages · `/listings?page=2` … `/listings?page=31` |
| `/category/[slug]` | **12** | 84 results → 7 pages · `/category/chiropractic-clinic?page=2` … `?page=7` |
| `/region/[slug]` | **12** | 177 results → 15 pages · `/region/united-states?page=2` … `?page=15` |
| `/search` | **12** | 85 results for `q=chiropractic` → 8 pages · `/search?q=chiropractic&page=2` |
| `/categories`, `/regions`, `/blog` | no pagination | all items on one page |

Control: `‹ [1] [2] … [31] ›`. With ≤7 pages every number is rendered; beyond that it collapses to
first, second, ellipsis, last. Prev arrow is disabled on page 1, next arrow on the last page.

The 20-vs-12 split between the global index and the taxonomy pages is inconsistent and worth
standardising in the rebuild.

---

### Query parameters

| Parameter | Where | Allowed values observed | Notes |
|---|---|---|---|
| `page` | `/listings`, `/category/[slug]`, `/region/[slug]` | positive integer | omitted for page 1 |
| `sort` | `/listings`, `/category/[slug]`, `/region/[slug]`, `/search` | `oldest`, `alphabetical` | default (newest) emits **no** parameter |
| `q` | `/search` | free text | `/search` is `Disallow`ed in robots.txt |
| `featured` | `/blog` | `1` | from the blog sidebar |
| `q` | `/blog` | free text | separate blog-article search, `<form action="/blog" method="get">` |

Real combined examples:

- `https://www.101toplistings.com/listings?sort=alphabetical`
- `https://www.101toplistings.com/category/chiropractic-clinic?page=4`
- `https://www.101toplistings.com/region/united-states?page=15`
- `https://www.101toplistings.com/search?q=chiropractic&sort=alphabetical&page=3` — parameters compose correctly
- `https://www.101toplistings.com/blog?q=zzzznothing` — blog-only search, zero state

**There is no filtering anywhere.** No category, location, rating, price or open-now parameter exists on
any index page. Sorting by three fixed options is the only refinement in the entire product, and the
three sort options are identical on every index. The homepage search box and `/search` are the only way
to narrow by keyword. For a directory this is the single largest functional gap, and the most obvious
place for the rebuild to beat the original.

---

### Inaccessible / not determined

| Item | Why |
|---|---|
| The real add-listing form | `/dashboard/listings/new` gates behind account creation. I do not create accounts, so I stopped at the gate. Everything before it is documented. |
| Any signed-in view (`/dashboard/*`, saved listings, review submission) | Same reason. The signed-out shells of all of them are documented. |
| Live viewport testing at 375 / 768 / 1024px | `resize_window` reported success but `window.innerWidth` stayed 1536 — the browser window would not resize in this environment. Responsive behaviour in this document is derived from Tailwind breakpoint classes and DOM structure, which is exact for breakpoints and layout but cannot catch visual overflow or overlap. **Flagged again in each template file. Worth one manual pass at real widths.** |
| Whether `/blog/category/*` and `/blog/tag/*` share a layout | Both were found as links and their patterns confirmed, but I did not open enough of each to be sure they are one template rather than two. Recorded as an open question, not an assumption. |
| Total category count vs. sitemap | `/categories` renders 94; none are in the sitemap. Cannot tell whether that is deliberate or an oversight. |


---

## Prompt 2 — Page templates

Derived from the route inventory in `01-routes.md`. Every template below was verified by loading
multiple real URLs and comparing structure in the DOM (breadcrumb depth, presence of a sort control,
grid class, sidebar, container max-width, header/footer presence, section count) rather than by
eyeballing screenshots. **Structure only — no marketing copy, business descriptions, blog bodies or
review text.**

Where a candidate turned out to be two templates, or where I could not confirm, it says so.

---

### The templates

#### 1. `home`
- **Routes:** `/`
- **Examples:** `/` — only one URL exists.
- Entry point. Hero with the primary keyword search, an animated stats band, three value propositions,
  a category grid, a grid of the newest listings, and a closing "list your business" panel. It is the
  only page that uses count-up number animation and the only one whose hero carries an illustration.
- Header and footer: standard.
- **Sections top to bottom: 6.**

#### 2. `listings-index`
- **Routes:** `/listings`, `/listings?page=N`, `/listings?sort=…`
- **Examples:** `/listings`, `/listings?page=2`, `/listings?page=31`, `/listings?sort=oldest`, `/listings?sort=alphabetical`
- The full directory. Breadcrumb, H1, one intro line, result count, a three-way sort toggle, a card
  grid at **20 per page**, and numbered pagination. The only index that carries an intro sentence.
- Header and footer: standard.
- **Sections: 4** (breadcrumb+heading, controls row, grid, pagination).

#### 3. `listing-detail`
- **Routes:** `/listing/[slug]`
- **Examples:** `/listing/asap-inventory`, `/listing/dr-nidhi-best-liver-doctor-in-delhi`,
  `/listing/ace-mobile-detailing`, `/listing/todd-matthews-air-conditioning-heating-llc`,
  `/listing/digital-ai-cards`
- The product's core page and the only one carrying `LocalBusiness` structured data. Cover image with an
  overlapping logo, category pill, business name, meta row, then a two-column body — content left,
  sticky contact card right — followed by a full-width related-listings strip.
- Header and footer: standard. Breadcrumb is the only one in the site whose middle crumb is the
  **category**, not the parent index.
- **Sections: 6** (hero/identity, About, Business hours, Contact card, Reviews, Related listings).

#### 4. `category-archive`
- **Routes:** `/category/[slug]`
- **Examples:** `/category/chiropractic-clinic`, `/category/health-medical`, `/category/automotive`,
  `/category/home-services`, `/category/local-business`
- Listings filtered to one category. Breadcrumb, H1, count, sort toggle, card grid at **12 per page**,
  pagination. **No intro paragraph and no category description** — a content gap, since these are the
  pages most likely to rank.
- Header and footer: standard.
- **Sections: 3.**

#### 5. `region-archive`
- **Routes:** `/region/[slug]`
- **Examples:** `/region/north-america`, `/region/united-states`, `/region/california`,
  `/region/eastern-europe` (empty), `/region/northern-europe`
- Structurally `category-archive` **plus** a "SUB-REGIONS" chip row above the controls, each chip
  carrying a count, and a breadcrumb that can run four deep. Confirmed present at every level of the
  tree, including `/region/california` (8 city chips).
- I am recording this as a **separate template** rather than a variant of `category-archive`, because
  the chip row is a real component with its own data requirement. If the rebuild treats archives
  generically, it can be one template with an optional children slot — but that is a decision, not
  something the original tells you.
- **Sections: 4.**

#### 6. `taxonomy-index`
- **Routes:** `/categories`, `/regions`
- **Examples:** `/categories`, `/regions` — only two URLs exist.
- **These are two different layouts and should probably be two templates.** `/categories` renders a
  flat three-column grid of 94 single-line cards, each with an icon, name and count. `/regions` renders
  two wide cards, each containing a nested list of child countries with counts. They share the
  breadcrumb + H1 + intro + count header and nothing below it.
- Recorded as one entry with the difference flagged, because the header block genuinely is shared.
- **Sections: 2.**

#### 7. `search-results`
- **Routes:** `/search?q=…`
- **Examples:** `/search?q=plumber`, `/search?q=zzzqqxnonsense123` (zero state), `/search` (no query)
- Centred hero with a prefilled search field, a "Results for …" line, count, sort toggle, card grid.
  Uses a **narrower content column** than `/listings`. `Disallow`ed in robots.txt.
- Header and footer: standard.
- **Sections: 3.**

#### 8. `blog-index`
- **Routes:** `/blog`, `/blog?featured=1`
- **Examples:** `/blog`, `/blog?featured=1`
- The first template with a **two-column body**: a left sidebar (Browse: All articles / Featured
  articles; Categories) beside the article grid. Centred hero with an eyebrow badge and a two-tone H1 —
  a heading treatment used nowhere else except `/landing-pages`. Carries its own article search field.
- **Sections: 3.**

#### 9. `blog-archive`
- **Routes:** `/blog/category/[slug]`, `/blog/tag/[slug]`
- **Examples:** `/blog/category/free-business-listing-in-usa`, `/blog/tag/best-business-directories`,
  `/blog/tag/local-business-directories`, `/blog/tag/business-listing-websites`,
  `/blog/tag/free-business-listing-sites-usa`
- Verified: category and tag pages are **one template**, not two. Both render the same sidebar and the
  same article grid; only the H1 differs (`<Name> articles` vs `#<tag> articles`). Neither has the hero
  search field that `/blog` carries, which is why this is separated from `blog-index`.
- **Sections: 2.**

#### 10. `blog-post`
- **Routes:** `/blog/[slug]`
- **Examples:** `/blog/free-business-listing-sites-in-the-usa`,
  `/blog/best-business-directory-websites-for-small-businesses` — **only two posts exist.** Fewer than
  five; noted as required.
- Single-column article. Four-deep breadcrumb, category pill, H1, standfirst, byline row with author,
  publish timestamp, updated date and read time, hero image, H2-structured body, related articles.
  Carries `BlogPosting` structured data.
- **Sections: 4.**

#### 11. `landing-page-index`
- **Routes:** `/landing-pages`
- **Examples:** `/landing-pages` — only one URL exists.
- Shares the centred hero + eyebrow badge + two-tone H1 treatment with `blog-index`, then a card grid.
  Currently holds a single item. Cards fall back to a gradient tile with the client's initials when no
  image is set.
- **Sections: 2.**

#### 12. `landing-page`
- **Routes:** `/[slug]` — **root level**
- **Examples:** `/ironwood-renovations` — **only one exists.**
- **Shares nothing with the rest of the site.** No site header, no site footer, its own colour palette,
  its own typefaces, its own nav (all in-page anchors), its own footer with its own social and
  service-area links, its own copyright line. A full-bleed hero with an overlaid lead-capture form and
  a floating chat bubble.
- This is effectively a second product living on the same domain: agency-built client microsites. Treat
  it as an entirely separate design system in the rebuild, not as a page of the directory.
- **Sections: 8.**

#### 13. `auth`
- **Routes:** `/login`, `/register`, `/forgot-password`
- **Examples:** all three.
- Verified identical shell: a centred `glass-card` panel, 32px padding, header and footer both present.
  Only the heading, field set and secondary links differ.
- **Sections: 1.**

#### 14. `legal`
- **Routes:** `/privacy`, `/terms`
- **Examples:** both.
- Verified identical: a single `glass-card` prose column capped at **768px**, 32px padding rising to
  40px at the `sm` breakpoint. `/privacy` has 6 H2s, `/terms` has 7 H2s and 3 H3s.
- **Sections: 1.**

#### 15. `content-page`
- **Routes:** `/about`
- **Examples:** `/about` — only one URL exists.
- Six stacked full-width sections with their own headings (Why we built this directory / What drives us
  / Meet the team / Own a local business?). Closes with the same CTA panel component the homepage uses.
- **Sections: 6.**

#### 16. `contact`
- **Routes:** `/contact`
- **Examples:** `/contact` — only one URL exists.
- The only form on the public site that submits without an account. Name, email, subject select and
  message, plus a honeypot text field and a hidden timestamp for spam scoring.
- **Sections: 1–2.**

#### 17. `add-listing-gate`
- **Routes:** `/dashboard/listings/new`
- **Examples:** `/dashboard/listings/new` — only one URL exists.
- Notable because it does **not** redirect to `/login`. It renders an inline account-creation card —
  email, password with an "At least 8 characters" hint, and a button reading "Continue to the listing
  form". The actual listing form is behind it.
- Header and footer: standard. **Not entered** — no account was created.
- **Sections: 1.**

#### 18. `error-404`
- **Routes:** any unmatched path
- **Examples:** `/this-page-does-not-exist-xyz123`, plus `/blog/free-business-listing-sites-usa`
  (the dead canonical target) rendered a similarly bare page.
- **The only template with no header and no footer.** A centred column: "404" eyebrow, headline,
  explanatory line, a search field, and two buttons.
- **Sections: 1.**

---

### Header and footer differences

| Template | Site header | Site footer |
|---|---|---|
| `landing-page` | **absent** — own header | **absent** — own footer |
| `error-404` | **absent** | **absent** |
| everything else | standard, sticky | standard, four columns + bottom bar |

The header is otherwise byte-identical across templates; only the active-item pill moves. The footer is
identical everywhere it appears.

---

### Shared components (used by three or more templates)

`SiteHeader` · `SiteFooter` · `Breadcrumb` · `ListingCard` · `CardGrid`
(`grid-cols-2 md:grid-cols-3 lg:grid-cols-4`) · `SortToggle` (Newest / Oldest / A–Z) ·
`ResultCount` · `Pagination` · `EmptyPanel` (dashed border) · `GlassCard` · `CtaPanel` ·
`BackToTopButton` · `ThemeToggle`

---

### Templates requiring deep analysis

Ordered by how much they matter to the rebuild. This is the list Prompt 3 works through.

1. **`listing-detail`** — the product. Most fields, most variation, the only structured data that matters.
2. **`home`** — first impression, and the source of most shared components.
3. **`category-archive`** — the highest-volume SEO surface (94 pages), and the emptiest.
4. **`listings-index`** — the main browse path; defines the card grid and pagination.
5. **`region-archive`** — same base as category plus the sub-region navigation.
6. **`search-results`** — the only keyword path, and the only zero-results state.
7. **`taxonomy-index`** — two layouts under one header; both entry points into the archives.
8. **`blog-post`** — carries the site's only editorial SEO, and its worst SEO defect.
9. **`blog-index`** — introduces the sidebar pattern.
10. **`blog-archive`** — reuses the sidebar; low unique content.
11. **`auth`** — small but blocks every account flow.
12. **`add-listing-gate`** — the supply-side funnel entry; commercially important, structurally tiny.
13. **`contact`** — the one working public form, including its spam defences.
14. **`content-page`** (`/about`) — reuses homepage components.
15. **`legal`** — trivial, but needed for parity.
16. **`error-404`** — small, distinct chrome, easy to forget.
17. **`landing-page-index`** — thin.
18. **`landing-page`** — a separate product. Needs its own analysis, but not as part of the directory rebuild.

---

### Open questions

- `/blog?featured=1` was confirmed as a link but I did not verify that its rendered result set differs
  from `/blog`. If it is a no-op, that is worth knowing.
- Only two blog posts and one landing page exist, so `blog-post` and `landing-page` variation cannot be
  characterised from five examples the way the listing templates can.
- Whether `taxonomy-index` is truly one template with two bodies or two templates that happen to share a
  header is a judgement call the original does not settle.


---

## Prompt 3a — Template: listing-detail

**Structure only.** No business descriptions, taglines, review text or marketing copy is reproduced.
Where a data value is quoted it is a functional label or a defect illustration, never content.

### Routes covered

`/listing/[slug]` — the only route. 617 listings live; 259 are in the sitemap.

### Examples inspected

1. `/listing/asap-inventory` — most complete record
2. `/listing/dr-nidhi-best-liver-doctor-in-delhi` — has a gallery, full contact set, 7 social links
3. `/listing/the-joint-chiropractic-oxford` — no tagline, no email, country-only location
4. `/listing/toi-et-moi-engagement-rings` — **no business hours at all**
5. `/listing/vcard-link-card` — **no cover image, no logo**, name is a raw URL

Additionally sampled for review state: `/listing/zivak-realty-group`, `/listing/eacpa-pro`,
`/listing/action-janitorial`, `/listing/cudek-ai`.

---

### Section order — desktop

Measured by element offset on `/listing/dr-nidhi-best-liver-doctor-in-delhi` at 1536px wide.
Content container is 1216px (`max-w-7xl` minus 32px gutters).

1. **Breadcrumb** — `Home › [Category] › [Business name]`. Roughly 0.05vh. The middle crumb is the
   listing's category, not "Listings". On the no-cover example the third crumb was the business's raw
   name string, so a bad name flows into the breadcrumb unfiltered.
2. **Cover image** — full width of the container, `aspect-[3/1]` rising to `sm:aspect-[4/1]`, 16px
   radius. At desktop that is 1216×304. Roughly 0.45vh.
3. **Identity block** — a 102×102 square logo tile overlapping the cover's bottom-left corner, then a
   category pill, then the H1, then a meta row: location-pin icon + location string, and a date label.
   Roughly 0.25vh.
4. **Two-column body** — `grid grid-cols-1 gap-8 lg:grid-cols-3`, left column `lg:col-span-2`, right
   `lg:col-span-1`. 32px gap. Left column stacks its sections with a 40px gap (`flex flex-col gap-10`).
   - **Left column, in order:** *Gallery* (conditional) → *About* → *Business hours* (conditional) →
     *Reviews*
   - **Right column:** a single card, `lg:sticky lg:top-24` — sticky **only at ≥1024px**, offset 96px
     from the top, which matches the header's scrolled height.
5. **Related listings** — full-width band with a "KEEP EXPLORING" eyebrow above an H2, then 4 listing
   cards. Roughly 0.7vh.
6. **Footer** — standard.

Right-hand card contents, top to bottom: **Save** (outline button, heart icon) · **Call now** (primary
filled) · **Visit website** (secondary, external-link icon) · then icon+value rows for phone, email,
website and full address. Absent fields are simply not rendered — there is no "not provided" state.

### Section order — mobile

Below 1024px the body grid collapses to one column and the contact card **loses its sticky
positioning**, so the order becomes: cover → identity → Gallery → About → Business hours → contact card
→ Reviews → Related listings.

That puts the contact card — the page's only conversion path — **below the description and the full
seven-row opening-hours table**. On a phone that is a long scroll before a user can tap "Call now". The
rebuild should hoist a call/website action into the identity block or a sticky bottom bar on mobile.

Derived from breakpoint classes rather than a live narrow viewport — see *Open questions*.

### Components used

**Reusable (appear on other templates)**

- `SiteHeader` / `SiteFooter` — identical everywhere except 404 and landing pages
- `Breadcrumb` — chevron-separated, last crumb unlinked
- `ListingCard` — the related-listings strip uses the same card as every index
- `CardGrid` — `grid-cols-2 md:grid-cols-3 lg:grid-cols-4`
- `EmptyPanel` — dashed-border panel, reused for the reviews empty state
- `BackToTopButton` — floating circular button, bottom-right
- `SectionEyebrow` — small uppercase label above an H2 ("KEEP EXPLORING")

**Unique to this template**

- `CoverImage` — 3:1 → 4:1 responsive banner with a gradient fallback when no image exists
- `LogoTile` — 102×102 rounded square overlapping the cover; falls back to a single initial on a solid tint
- `CategoryPill` — links to the category archive
- `MetaRow` — location + date line under the H1
- `ContactCard` — the sticky sidebar
- `HoursTable` — seven rows, day left, range right, one row per weekday
- `Gallery` — 3-column square image grid
- `ReviewList` + `ReviewPrompt` — signed-out prompt and empty state

### Data fields displayed

| Field | Example value type | Always present? | Where it appears |
|---|---|---|---|
| Business name | short string | **yes** | H1, breadcrumb, `<title>`, og:title, JSON-LD `name` |
| Slug | kebab string | yes | URL, canonical |
| Category | label | yes (all 5) | breadcrumb crumb 2, category pill, JSON-LD `additionalType` |
| Cover image | ImageKit URL | **no** — absent on `vcard-link-card` | hero banner, og:image |
| Logo | ImageKit URL | **no** — absent on `vcard-link-card` | overlapping tile, JSON-LD `logo` |
| Tagline | one line | **no** — absent on `the-joint-chiropractic-oxford` | under the meta row, meta description, og:description |
| Description | paragraphs | yes on all 5 | About section, JSON-LD `description` |
| Location string | free text | yes, but **format varies wildly** | meta row |
| Date | date | yes, but the **label switches** between "Added" and "Updated" | meta row |
| Phone | string | yes on all 5 | contact card row, "Call now", JSON-LD `telephone` |
| Email | string | **no** — absent on `the-joint-chiropractic-oxford` | contact card row, JSON-LD `email` |
| Website | URL | yes on all 5 | "Visit website", contact card row, JSON-LD `url` |
| Street address | free text | yes on all 5 | contact card, JSON-LD `address` (full PostalAddress) |
| Business hours | 7 day/range pairs | **no** — absent on `toi-et-moi-engagement-rings` | Hours table, JSON-LD `openingHoursSpecification` |
| Gallery images | ImageKit URLs | **no** — present on 3 of 5 | Gallery section |
| Social links | URLs | varies — 7 on one example, 0 on others | JSON-LD `sameAs` (not visibly rendered) |
| Reviews | list | **zero on all 8 sampled** | Reviews section |

Fields that were missing on at least one example — and therefore drive the empty states — are
**cover image, logo, tagline, email, business hours, gallery, social links, reviews**.

### Variations observed across examples

This is the section that matters most. Every difference below was observed directly.

| # | Variation | Where seen | What renders |
|---|---|---|---|
| 1 | **No cover image** | `vcard-link-card` | The 4:1 banner area fills with a flat blue gradient. No `<img>` element at all, no icon, no label. |
| 2 | **No logo** | `vcard-link-card` | The 102×102 tile shows a single letter on a solid blue fill — the first character of the name. |
| 3 | **Name is a raw URL** | `vcard-link-card` | H1 renders `https://vcard.link/card/lnVZ` verbatim; it also becomes the breadcrumb crumb, and the initials tile derives "H" from "https". Nothing sanitises or truncates it. |
| 4 | **No tagline** | `the-joint-chiropractic-oxford` | The line under the meta row is omitted and About begins immediately. The meta description then falls back to something else — worth checking per-record. |
| 5 | **No email** | `the-joint-chiropractic-oxford` | The email row simply disappears from the contact card. No placeholder, no greyed row. |
| 6 | **No business hours** | `toi-et-moi-engagement-rings` | The entire Business hours section — heading included — is absent. Section order closes up. |
| 7 | **Closed days in hours** | `the-joint-chiropractic-oxford`, `vcard-link-card` | Rows read "Closed" instead of a time range. |
| 8 | **Placeholder-looking hours** | `asap-inventory` | All seven days read 12:00 AM – 11:59 PM, i.e. "always open" used as a default. Renders identically to real hours, so users can't tell it is unset. |
| 9 | **Gallery present vs absent** | present on 3 of 5 | 3-column square grid above About. Absent on `asap-inventory` and `the-joint-chiropractic-oxford`. |
| 10 | **Location format is inconsistent** | all 5 differ | "Anaheim, California, United States" (city/state/country) · "Delhi, Delhi, India" (duplicated) · "United States" (country only) · "Santa Rosa" (city only) · a full UK street address with postcode. There is no normalised location model. |
| 11 | **Date label switches** | `vcard-link-card` shows "Updated", the other four show "Added" | Same slot, different verb, no visual distinction. |
| 12 | **Zero reviews everywhere** | 8 of 8 sampled | The populated review list could not be observed. See *Open questions*. |
| 13 | **Cover images are frequently generic stock** | the three "The Joint Chiropractic" listings | The same unrelated stock photo appears as the cover on multiple listings and as their card image on every index. |

### Interactions

- **Sticky contact card** at ≥1024px, 96px offset. Not sticky below that.
- **Save** — the only button on the page. Signed out, it is present but the review area's prompt implies
  account-gated behaviour; not exercised, since that needs an account.
- **Call now** → `tel:` link. **Visit website** → external `https` link.
- **Related listing cards** — hover lift plus a gradient border treatment (`neon-border`, a 2px gradient
  ring around each card).
- **Back-to-top** — floating circular button, appears after scrolling.
- **Scroll-reveal** — sections fade/translate in via IntersectionObserver as they enter the viewport.
  Programmatic `scrollTo` outruns it and leaves content invisible, which also means anything relying on
  JS-off or fast scroll sees blank regions. The site does ship two `prefers-reduced-motion` media
  blocks, so reduced motion is at least partly handled — verify coverage rather than assuming it.
- No tabs, no modal, no carousel, no map, no lightbox on the gallery, no infinite scroll.

### Forms and validation

The only form is the review composer, and signed out it renders as a prompt — a panel reading
"Sign in to write a review." with "Sign in" as a link to `/login`. No fields, no star input, nothing to
validate. **The review form itself is behind authentication and was not reached** (no account created).

### States

- **Loading** — the scroll-reveal wrapper means sections below the fold render as empty space until they
  intersect. On archive pages this manifests as visible card outlines with no content; on the detail
  page the effect is a blank column.
- **Missing data** — every optional field degrades by *omission*, never by placeholder. Two exceptions:
  the cover image becomes a flat gradient and the logo becomes an initial tile.
- **Zero reviews** — "No reviews yet. Be the first to review this business." plus the sign-in prompt.
- **Error** — an invalid slug does not produce a listing-specific error; it falls through to the global
  404 template (no header, no footer).

### SEO

Measured on `/listing/dr-nidhi-best-liver-doctor-in-delhi` and `/listing/asap-inventory`.

- **`<title>`** — pattern is `<Business name> | 101 Top Listings`
- **Meta description** — the **tagline field verbatim**, unedited and unvalidated. One sampled listing's
  tagline contains a plain misspelling that ships straight into the description. No fallback and no
  length control, so descriptions run from a few words to over-long.
- **H1** — the business name. Exactly one H1 per page.
- **Heading outline** — H1 name → H2 Gallery (cond.) → H2 About → H2 Business hours (cond.) → H2 Contact
  → H2 Reviews → H2 Related listings → H3 per related card. Clean and consistent.
- **Canonical** — self-referencing and correct on both examples.
- **OG / Twitter** — `og:title` (name), `og:description` (tagline), `og:image` (ImageKit URL),
  `og:type` **`website`** (should be a business type), `og:url`, `twitter:card=summary_large_image`
- **Robots** — `index, follow`
- **JSON-LD** — one `application/ld+json` script containing an array of two objects:

  | `@type` | Populated fields |
  |---|---|
  | `LocalBusiness` | `@id`, `name`, `url`, `description`, `image`, `logo`, `telephone`, `email`, `sameAs` (7 on one example), `address` (full `PostalAddress`: streetAddress / addressLocality / addressRegion / postalCode / addressCountry), `additionalType`, `openingHoursSpecification` (7 entries) |
  | `BreadcrumbList` | `itemListElement` |

  Two defects: **`aggregateRating` is never emitted** even though a Reviews section exists, so no star
  rich result is possible; and **`additionalType` carries the plain category label** rather than a
  schema.org URL, which makes it inert.

- **Images** — all served from ImageKit (`ik.imagekit.io/101toplistings/user-uploads/…`), so the rebuild
  needs an equivalent transform/CDN layer.

### Breadcrumbs

Pattern: `Home › [Category] › [Business name]`

Real example: `Home › Aircraft › ASAP Inventory` — `/` → `/category/aircraft` → current (unlinked).

Notably the breadcrumb skips `/listings` entirely and routes authority into the category archive.
Mirrored in `BreadcrumbList` structured data.

### Internal links out

| Destination template | From which section |
|---|---|
| `home` | breadcrumb crumb 1; header logo |
| `category-archive` | breadcrumb crumb 2; the category pill; each related card's category pill |
| `listing-detail` | 4 related listing cards |
| external site | "Visit website", the website row, `tel:` and `mailto:` |
| every footer destination | footer |

The page emits **no link to `/listings`, no link to a region archive, and no link to the blog.** Related
listings are the only lateral path, and they are category-matched.

### Responsive notes

From breakpoint classes and computed styles.

| Width | What changes |
|---|---|
| ~375px | Body is one column. Cover switches to `aspect-[3/1]` (taller). Card body padding drops to 12px. Related listings render **2 across**, roughly 170px per card — the tightest point in the design and the most likely place for the card title to wrap badly. |
| 640px (`sm`) | Cover becomes `aspect-[4/1]`. Grid gap 12px → 24px. Card padding 12px → 20px. Card title 14px → 16px. Header logo swaps mark → wordmark. |
| 768px (`md`) | Header nav and the Sign in / Add listing / Browse all cluster appear; mobile drawer trigger disappears. Related listings go to 3 across. |
| 1024px (`lg`) | Body splits 2:1. **Contact card becomes sticky** at `top: 96px`. Related listings go to 4 across. Page gutters 24px → 32px. |
| 1440px | No change — the container caps at 1280px (`max-w-7xl`) and centres. Content column stays 1216px. |

### Open questions

1. **No listing with reviews was found.** Eight sampled listings all show the zero state, while the
   homepage stats band claims "79+ Customer reviews". The populated review list — its sort, pagination,
   rating breakdown and star display — could not be documented. Either reviews are extremely sparse or
   the homepage figure is not derived from real data. **This is a genuine hole in the spec; the rebuild
   needs a review design decided from scratch rather than copied.**
2. The star/rating display is unobserved for the same reason, and no `aggregateRating` exists to infer
   it from.
3. What the meta description falls back to when a listing has no tagline was not isolated.
4. Whether "Save" works signed-out, or prompts, is untested — it needs an account.
5. Live rendering at 375 / 768 / 1024px was not possible: `resize_window` reported success but
   `window.innerWidth` never changed in this environment. Breakpoint behaviour above is read from
   Tailwind classes, which is exact for *what* changes and *where*, but cannot reveal actual overflow,
   overlap or wrapping defects. **One manual pass at real widths is worth doing before build.**


---

## Prompt 3b — Templates: index and archive pages

Covers `listings-index`, `category-archive`, `region-archive`, `search-results` and `taxonomy-index`.
They share so much machinery that documenting them together shows the differences clearly.
**Structure only.**

### Routes and examples inspected

| Template | Routes | Examples opened |
|---|---|---|
| `listings-index` | `/listings` | `/listings`, `?page=2`, `?page=31`, `?sort=oldest`, `?sort=alphabetical` |
| `category-archive` | `/category/[slug]` | `chiropractic-clinic`, `health-medical`, `automotive`, `home-services`, `local-business` |
| `region-archive` | `/region/[slug]` | `north-america`, `united-states`, `california`, `northern-europe`, `eastern-europe` (empty) |
| `search-results` | `/search` | `?q=plumber`, `?q=chiropractic`, `?q=chiropractic&sort=alphabetical&page=3`, `?q=zzzqqxnonsense123` |
| `taxonomy-index` | `/categories`, `/regions` | both |

---

### Section order — desktop

**`listings-index`**

1. Breadcrumb — `Home › All Listings`
2. H1 + one intro line. **The only index with an intro sentence.**
3. Controls row — result count left, three-way sort toggle right
4. Card grid — 4 across, **20 per page**
5. Pagination

**`category-archive`** — identical minus the intro line. **12 per page.**

**`region-archive`** — as category, plus a `SUB-REGIONS` block between the H1 and the controls row: an
uppercase eyebrow followed by a wrapped row of chips, each `Name` + a count in muted type. Present at
every level (8 city chips on `/region/california`, 33 state chips on `/region/united-states`).
**12 per page.**

**`search-results`** — centred rather than left-aligned. Hero heading + subtitle, a prefilled search
field, then `Results for "…"`, count, sort toggle, grid, pagination. **12 per page.** Narrower content
column than the other indexes.

**`taxonomy-index`** — shared header block (breadcrumb, H1, intro, count) then two different bodies:
`/categories` renders a 3-column grid of 94 single-row cards (icon tile, name, count); `/regions`
renders 2 wide cards, each holding a nested list of child countries with counts.

### Section order — mobile

The grid drops to 3 columns at `md` and **2 columns below 640px**. The controls row wraps so the sort
toggle sits under the count. Sub-region chips wrap to as many rows as needed and are not collapsed
behind a "show more" — on a category like `/region/united-states` that is 33 chips stacked above the
results on a phone. Everything else stacks in source order.

### Components used

**Reusable:** `SiteHeader`, `SiteFooter`, `Breadcrumb`, `ListingCard`, `CardGrid`, `SortToggle`,
`ResultCount`, `Pagination`, `EmptyPanel`, `BackToTopButton`

**Unique:** `SubRegionChips` (region only) · `SearchHero` (search only) · `CategoryTile` and
`RegionRollupCard` (taxonomy index only)

### Data fields displayed

| Field | Example value | Always present? | Where |
|---|---|---|---|
| Result count | `617 results`, `84 results`, `0 results` | yes | controls row |
| Card image | ImageKit URL | **no** — falls back to a flat tint | card top, 16:10 |
| Category label | `Chiropractic Clinic` | yes | gradient pill on the card |
| Business name | string | yes | card H3 |
| Tagline | one line | **no** — omitted when absent | card, 2-line clamp |
| Location | free text | **no** — omitted when absent | card footer with pin icon |
| Sub-region name + count | `California 17` | region only | chip row |
| Category name + count | `Automotive 32 listings` | taxonomy index only | category tile |

### Variations observed across examples

1. **Per-page count is inconsistent.** 20 on `/listings`, 12 on category, region and search. Same card,
   same grid, different page size.
2. **Intro copy exists only on `/listings`.** Category and region archives have no description at all —
   the 94 category pages are the site's biggest SEO surface and each carries an H1 and nothing else.
3. **Sub-region chips only on region pages.** Category archives have no equivalent "related categories"
   navigation.
4. **Pagination shape changes with length.** ≤7 pages renders every number; beyond that it collapses to
   `‹ 1 2 … 31 ›`. Prev disabled on page 1, next disabled on the last.
5. **Empty archive** (`/region/eastern-europe`): `0 results` and a dashed panel reading "No listings in
   this region yet." No CTA, no suggestions, no link back to `/regions`.
6. **Empty search** (`?q=zzzqqxnonsense123`): `0 results` and a dashed panel — "No results for "…"." /
   "Try a different word, or check the spelling." **The sort toggle disappears entirely at 0 results.**
7. **Cards degrade differently.** A card with no tagline closes up; a card with no location loses the
   pin row; a card with no image shows a flat tint. Card height stays fixed at 350px, so short cards
   have visible dead space.
8. **Duplicate images across cards.** Multi-location chains reuse one image, and several unrelated
   listings share the same stock photo, so an archive can show four identical thumbnails in a row —
   most visible on `/category/chiropractic-clinic`.
9. **Region totals do not reconcile.** `/regions` shows 177 + 113 = 290, against 617 listings total.
   Over half the directory has no region at all. All seven footer region links were opened: North
   America (177) and Northern Europe (113) have listings; Eastern Europe, Middle East, South Asia,
   Southern Europe and Western Europe **all return 0 results**.

### Interactions

- Sort toggle — three real links, not JS state. Active option gets a filled brand pill.
- Pagination — real links; full page loads.
- Card hover — lift plus the animated gradient border (`neon-border-flow`, 5s linear infinite).
- Scroll reveal — cards fade in on intersection. Scrolling fast leaves visible empty card outlines,
  which reads as a skeleton state.
- No filter panel, no map view, no list/grid toggle, no "load more", no infinite scroll, no saved search.

### Forms and validation

Only `search-results` has a form: `<form action="/search" method="get">` with `<input name="q" type="search">`,
label "Search query" (visually hidden), placeholder `Search the directory…` on the 404 variant and
`Try "plumber", "dental clinic", "Los Angeles"…` in the homepage hero. **No validation at all** — an
empty submit is allowed and lands on `/search` with no query.

### States

- **Loading** — card outlines with no content, courtesy of the reveal animation.
- **Zero results** — dashed `EmptyPanel`, wording differs per template (see variation 5 and 6).
- **Error** — invalid category or region slug falls through to the global 404.

### SEO

| | `listings-index` | `category-archive` | `region-archive` | `search-results` |
|---|---|---|---|---|
| `<title>` | `All Listings \| 101 Top Listings` | `<Category> \| 101 Top Listings` | `<Region> \| 101 Top Listings` | `Search \| 101 Top Listings` |
| H1 | `All Listings` | category name | region name | `Search listings` |
| Intro copy | one line | **none** | **none** | one line |
| JSON-LD | none observed | none observed | none observed | none observed |
| In sitemap | yes | **no** | **no** | n/a (`Disallow`ed) |
| Pagination rel next/prev | **not present** | not present | not present | n/a |

Three compounding problems worth fixing rather than reproducing: **no `ItemList` structured data on any
archive**, **no `rel=next`/`rel=prev`**, and **no canonical strategy for paginated URLs** — so
`?page=2` through `?page=31` are 30 near-duplicate pages with nothing telling a crawler how they relate.
Combined with the taxonomy pages being absent from the sitemap, the archives are close to invisible.

### Breadcrumbs

| Template | Pattern | Real example |
|---|---|---|
| `listings-index` | `Home › All Listings` | — |
| `category-archive` | `Home › Categories › <Category>` | `Home › Categories › Chiropractic Clinic` |
| `region-archive` | `Home › Regions › <Parent> › <Region>` | `Home › Regions › North America › United States` |
| `search-results` | none | — |
| `taxonomy-index` | `Home › Categories` / `Home › Regions` | — |

### Internal links out

`listing-detail` (every card) · `category-archive` (every card's pill) · `region-archive` (chips) ·
paginated siblings · the whole footer. Archives **do not** link to the blog or to each other laterally.

### Responsive notes

| Width | Change |
|---|---|
| ~375px | Grid 2 across at ~170px per card; card padding 12px; title 14px. Sub-region chip rows can run very long. |
| 640px `sm` | Gap 12px → 24px, card padding → 20px, title → 16px. |
| 768px `md` | Grid → 3 columns. Header nav appears. |
| 1024px `lg` | Grid → 4 columns. Gutters → 32px. |
| 1440px | Container caps at 1280px and centres. |

### Open questions

- Whether `search-results` paginates at 12 or another size was confirmed at 12 (85 results → 8 pages) —
  but only for one query.
- Whether `/categories` and `/regions` are one template or two is a judgement call; their bodies share
  nothing.
- Live narrow-viewport rendering was not possible in this environment (see `01-routes.md`), so chip-row
  overflow and card-title wrapping at 375px are predicted from classes, not observed.


---

## Prompt 3c — Template: home

**Structure only.** Route: `/` — one URL, so the "five examples" rule does not apply; instead this is
documented against the live page in both light and dark themes.

### Section order — desktop (measured heights at 1536×674)

| # | Section | Height | Layout | ~viewports |
|---|---|---|---|---|
| 1 | **Hero** | 764px | Two columns: content left, illustration right | ~1.1 |
| 2 | **Stats band** | 346px | 4 equal cards in a row | ~0.5 |
| 3 | **Value propositions** | 148px | 3 columns, icon + heading + one line each | ~0.2 |
| 4 | **Explore by category** | 467px | Eyebrow + H2 + sub-line, "All categories →" right-aligned, then 8 tiles in a 4×2 grid | ~0.7 |
| 5 | **Recently listed** | 1040px | Eyebrow + H2 + sub-line, "View all listings →" right-aligned, then 8 listing cards in a 4×2 grid | ~1.5 |
| 6 | **CTA panel** | 444px | Single bordered panel, centred content | ~0.65 |

Then the standard footer.

**Hero contents in order:** a pill badge with a live count ("617 businesses listed") · H1 across three
lines with the middle line in a brand→accent gradient · a one-line subtitle · the search field with an
inline "Search" button · a "List your business free →" outlined pill · a "Popular:" row of **6 category
chips** · a scroll-cue chevron at the bottom. The right half is a flat isometric illustration with a
6s `float` animation.

**Stats band:** four cards — Businesses listed, Categories covered, Regions & countries, Customer
reviews — each with a gradient icon tile, a large count-up number and a label. The numbers animate from
a low value on scroll into view (captured mid-animation at "12+" and "2+" before settling).

**Explore by category:** 8 tiles, each an icon tile + category name + "N listings". Links to
`/category/[slug]`; the trailing link goes to `/categories`.

**Recently listed:** 8 standard `ListingCard`s. Trailing link to `/listings`.

### Section order — mobile

Hero becomes one column with the illustration below or hidden; the category and listing grids drop to
**2 across** below 640px and 3 at `md`; the stats band and value props stack. Section order does not
change. *(Derived from breakpoint classes — see Open questions.)*

### Components used

**Reusable:** `SiteHeader`, `SiteFooter`, `ListingCard`, `CardGrid`, `SectionEyebrow`, `CtaPanel`
(reused verbatim on `/about`), `BackToTopButton`, `ThemeToggle`

**Unique to home:** `HeroSearch` (the only search entry point outside `/search` and the 404) ·
`CountBadge` · `StatsBand` with count-up · `ValueProps` · `CategoryTile` grid · `HeroIllustration` with
`float` animation · `ScrollCue` chevron

### Data fields displayed

| Field | Example | Always present? | Where |
|---|---|---|---|
| Total listing count | `617 businesses listed` | yes | hero badge |
| Stat values | `487+`, `74+`, `126+`, `79+` | yes | stats band |
| Popular category names | 6 labels | yes | hero chips |
| Featured category name + count | `Chiropractic Clinic — 84 listings` | yes | category tiles ×8 |
| Newest listings | 8 records | yes | card grid |

### Variations observed

Only one URL exists, so variation is limited to theme and scroll state:

1. **Light vs dark.** `data-theme="dark"` on `<html>` inverts the ink scale semantically and lifts
   brand/accent to lighter tints. The hero illustration and background wash both survive the switch.
2. **Header scroll state.** 112px at rest, shrinking to ~96px on scroll with a 300ms transition; the nav
   pill gains a solid surface.
3. **Pre-reveal state.** Every section below the fold renders invisible until it intersects the
   viewport, so a fast scroll shows blank bands. The stats numbers are caught mid-count.

### Interactions

Hero search submits on Enter (verified) and via the button — `<form action="/search" method="get">`,
field `name="q"`. Category chips and tiles are plain links. Cards lift on hover with the animated
gradient border. Theme toggle flips `data-theme` and correctly updates its own `aria-label`
("Switch to dark theme" ↔ "Switch to light theme"). Back-to-top appears on scroll. Scroll-cue chevron
at the hero's foot. No carousel, no modal, no video, no map.

### Forms and validation

One form — the hero search. `GET /search`, single `q` field, **no validation**: an empty submit is
accepted and lands on `/search` with no query and no message.

### States

- **Loading / pre-reveal** — blank bands below the fold until intersection.
- **Zero data** — not reachable; the homepage always has listings.
- **Error** — no error state exists for this route.

### SEO

- `<title>`: `101 Top Listings — Find Top Local Businesses & Services`
- H1: one, `Find the best local businesses & services`
- Outline: H1 → H3 ×3 (value props) → H2 Explore by category → H2 Recently listed → H3 ×8 (card titles)
  → H2 Own a local business?
- **The value-prop headings are H3 with no H2 above them**, so the outline jumps H1 → H3. Minor, easily
  fixed in the rebuild.
- No JSON-LD observed on the homepage — **no `Organization` or `WebSite` schema**, so no sitelinks
  search box and no knowledge-panel signal. A clear miss.
- In the sitemap at priority 1.0, `changefreq: daily`.

### Breadcrumbs

None — this is the root.

### Internal links out

| Destination | From |
|---|---|
| `search-results` | hero search form |
| `category-archive` | 6 hero chips + 8 category tiles |
| `taxonomy-index` (`/categories`) | "All categories →" |
| `listing-detail` | 8 cards |
| `listings-index` | "View all listings →", header "Browse all" |
| `add-listing-gate` | "List your business free →", CTA panel, header, footer |
| everything else | header and footer |

The homepage links to **no region page, no blog post and no `/regions`** except through the footer.

### Responsive notes

| Width | Change |
|---|---|
| ~375px | Grids 2 across (~170px cards). Hero H1 at `text-4xl` (36px). Gutters 16px. |
| 640px `sm` | H1 → 48px. Grid gap 12px → 24px. Logo swaps mark → wordmark. |
| 768px `md` | Grids → 3 columns. Header nav and right cluster appear. |
| 1024px `lg` | Grids → 4 columns. H1 → 60px. Gutters → 32px. |
| 1440px | Container caps at 1280px. |

### Open questions

1. **The stats band does not reconcile with the site.** It claims 74+ categories (`/categories` shows
   **94**), 126+ regions and countries (`/regions` renders **2** top-level regions), 487+ businesses
   (the hero badge on the same page says **617**), and 79+ customer reviews (**8 of 8** sampled listings
   have zero). Whether these are stale constants, a different data source, or hard-coded could not be
   determined from the front end — but the rebuild should derive them from real queries or drop them.
2. Whether the hero illustration is hidden or stacked below 768px was not observed live.
3. Live narrow-viewport rendering was not possible in this environment; responsive behaviour above is
   read from Tailwind classes.


---

## Prompt 3d — Templates: blog

Covers `blog-index`, `blog-archive` and `blog-post`. **Structure only — no article text is reproduced.**

### Routes and examples inspected

| Template | Routes | Examples |
|---|---|---|
| `blog-index` | `/blog`, `/blog?q=`, `/blog?featured=1` | `/blog`, `/blog?q=zzzznothing` (zero state), `/blog?featured=1` |
| `blog-archive` | `/blog/category/[slug]`, `/blog/tag/[slug]` | `/blog/category/free-business-listing-in-usa`, `/blog/tag/best-business-directories` |
| `blog-post` | `/blog/[slug]` | `/blog/free-business-listing-sites-in-the-usa`, `/blog/best-business-directory-websites-for-small-businesses` — **only two posts exist** |

### Section order — desktop

**`blog-index`**

1. Breadcrumb `Home › Blog`
2. **Centred** hero: eyebrow badge "Blog", H1 with the second word in a brand→accent gradient, subtitle.
   This centred treatment appears only here and on `/landing-pages`.
3. Article search — `<form action="/blog" method="get">`, `name="q"`, placeholder
   `Search articles by title, topic, author…`
4. Two columns: left sidebar (~280px) + article grid
   - Sidebar: **BROWSE** (All articles, Featured articles) · **CATEGORIES** (name + count) ·
     **TAGS** (`#tag` list) · recent post links
   - Right: "Latest articles" heading, count right-aligned, then article cards

**`blog-archive`** — same sidebar and grid, **no hero search**, H1 is `<Category> articles` or
`#<tag> articles`. Confirmed that category and tag pages are one template.

**`blog-post`**

1. Breadcrumb `Home › Blog › <Category> › <Post title>` — four deep
2. Category pill (gradient)
3. H1
4. Standfirst paragraph in larger muted type
5. Byline row: author · publish date and time · `Updated <date>` · clock icon + `N min read`
6. Hero image
7. Article body, H2-structured
8. "Related articles"

### Section order — mobile

The sidebar drops below the article grid (or above it — not verified live). Everything else stacks in
source order.

### Components used

**Reusable:** `SiteHeader`, `SiteFooter`, `Breadcrumb`, `CardGrid`, `EmptyPanel`, `BackToTopButton`

**Unique:** `BlogSidebar` (shared by `blog-index` and `blog-archive`) · `ArticleCard` ·
`CentredHero` (shared with `landing-page-index`) · `ArticleSearch` · `ByLine` · `CategoryPill` ·
`RelatedArticles`

### Data fields displayed

| Field | Type | Always present? | Where |
|---|---|---|---|
| Title | string | yes | H1, card, `<title>`, `BlogPosting.headline` |
| Slug | kebab | yes | URL, canonical |
| Category | one label | yes on both posts | pill, breadcrumb, sidebar |
| Tags | list | yes | sidebar; 5 distinct tags across 2 posts |
| Excerpt / standfirst | paragraph | yes | under H1, meta description, `BlogPosting.description` |
| Hero image | URL | yes on both | under byline, `og:image` |
| Author name | string | yes | byline, `BlogPosting.author` |
| Published date + time | datetime | yes | byline, `datePublished` |
| Updated date | date | yes on both | byline, `dateModified` |
| Read time | `N min read` | yes | byline |
| Featured flag | boolean | implied by `?featured=1` | sidebar filter |

### Variations observed

1. **Canonical is a free-text field with no validation, and one post's is wrong.**
   `/blog/free-business-listing-sites-in-the-usa` declares
   `canonical = https://101toplistings.com/blog/free-business-listing-sites-usa/` — wrong host
   (non-www), wrong slug, trailing slash. **Visiting that URL renders a page with no H1 and the generic
   site title**, so the canonical points at a dead target. The other post self-references correctly.
   This is the single worst defect found on the site.
2. **Title-tag length is uncontrolled.** One post's `<title>` runs 85 characters before the ` | 101 Top
   Listings` suffix and truncates mid-word in the tab.
3. **`?q=` zero state** — "Results for "…"" / "0 articles" / "No articles match "…"." / "Try a different
   search term." Cleanly handled, and better worded than the listing search's equivalent.
4. **Only two posts exist**, so grid overflow, pagination and multi-page archive behaviour are all
   unobserved — there is not enough content to trigger them.
5. Tag pages and category pages render identically apart from the H1 prefix (`#` for tags). Verified
   across five tag URLs and one category URL.
6. **`?featured=1` genuinely filters** — the grid heading changes to "Featured articles" and, with
   neither post flagged, it renders a **fourth distinct empty state**: "No featured articles yet."
   So the site has four empty-state wordings (listing search, blog search, region archive, featured
   filter), none of which offers a recovery action.

### Interactions

Sidebar links, article cards, and the two search forms are plain links and GET forms. No comments, no
share buttons, no table of contents, no reading-progress bar, no newsletter capture. Cards lift on
hover. Scroll reveals apply as elsewhere.

### Forms and validation

Two GET forms, both `name="q"`, both with **no validation** — `/blog` (article search) and the
site-wide `/search`. Empty submits are permitted.

### States

- **Zero results** — handled, wording above.
- **Loading** — reveal-animation blanks.
- **Error** — invalid post slug falls through to the global 404. Notably, the dead canonical target
  rendered a *bare* page rather than the styled 404, which suggests two different not-found paths.

### SEO

- `<title>`: `<Post title> | 101 Top Listings`
- Meta description: the excerpt
- H1: the post title. Body uses sequential H2s.
- **JSON-LD:** one script, array of `[BreadcrumbList, BlogPosting]`. `BlogPosting` populates `headline`,
  `description`, `url`, `image`, `datePublished`, `dateModified`, `author`, `publisher`.
- OG and `twitter:card=summary_large_image` present.
- **Not in the sitemap** — no blog post, category or tag URL is submitted.

Fix list for the rebuild: validate or auto-generate canonicals, cap title length, add blog URLs to the
sitemap, and add `rel=next/prev` before the archive grows past one page.

### Breadcrumbs

`Home › Blog › <Category> › <Post title>` — real example: `Home › Blog › Free business listing in USA ›
Top 10 Free Business Listing Sites in the USA (2026)`. Archives use `Home › Blog › <Name>`.

### Internal links out

`blog-post` (cards, related, sidebar recents) · `blog-archive` (category pill, tag list) · `blog-index`
(breadcrumb, "All articles") · the footer. **No blog page links to a listing, a category archive or the
directory itself** beyond the header and footer — the blog is a closed loop, which wastes its authority.

### Responsive notes

Card grid follows the site-wide `2 / 3 / 4` pattern. Sidebar and content stack below `lg`. Centred hero
type scales with the same `text-4xl sm:text-5xl lg:text-6xl` ramp as the homepage.

### Open questions

1. Whether the sidebar renders above or below the grid on mobile.
2. Pagination on blog archives is unobserved; there is not enough content to trigger it.
3. Why the dead canonical URL renders a bare page rather than the styled 404 — there appear to be two
   not-found behaviours.
4. Whether "featured" is an editor-set flag or derived — with zero featured posts, only the empty state
   is observable.


---

## Prompt 3e — Templates: utility pages

Covers `auth`, `add-listing-gate`, `contact`, `content-page`, `legal`, `error-404`,
`landing-page-index` and `landing-page`. Small templates, grouped. **Structure only.**

---

### `auth` — `/login`, `/register`, `/forgot-password`

All three verified as one shell: a centred `glass-card`, 16px radius, 32px padding, standard header and
footer present. One section.

| Route | H1 | Fields | Helper | Secondary links |
|---|---|---|---|---|
| `/login` | Welcome back | `email` (required), `password` (required) | — | `/forgot-password`, `/register` |
| `/register` | Create your account | `name` (required), `email` (required), `password` (required, `minlength=8`) | "At least 8 characters." | `/login` |
| `/forgot-password` | Forgot your password? | `email` | — | — |

`autocomplete` is set correctly throughout (`name`, `email`, `new-password`) — keep that.
Validation is **native browser constraint validation only**: `"Please fill out this field."` and
`"Please include an '@' in the email address…"`. No inline error text, no field-level error styling, no
password strength meter, no confirm-password field.

**Not submitted.** No account was created, so post-submit behaviour, the signed-in header state, and
every `/dashboard/*` view are undocumented.

---

### `add-listing-gate` — `/dashboard/listings/new`

The most interesting small template on the site, and the supply-side funnel entry.

It **does not redirect to `/login`.** It renders a card: H2 "Add a listing", a line explaining that
entering an email and password creates a free account and takes you straight to the form, then `email`
and `password` (`minlength=8`, helper "At least 8 characters."), a full-width primary button
**"Continue to the listing form"**, and beneath it "Already signed in elsewhere? **Sign in instead**".

Structurally it is `/register` minus the name field, re-framed as a step in the listing flow rather than
as a sign-up. That framing is the good idea worth keeping: the user never appears to leave the
add-listing task.

**The listing form itself sits behind this gate and was not reached** — creating accounts is off-limits
for me. Field list, step count, image upload, category and region pickers, and hours entry are all
undocumented. This is the single largest gap in the specification and needs to be designed from scratch
or captured manually by someone with an account.

---

### `contact` — `/contact`

H1 "Get in touch". One form, and the only public form that submits without an account.

| Field | Type | Required | Label |
|---|---|---|---|
| `company` | text | no | "Company" — **honeypot**, hidden from users |
| `startedAt` | hidden | — | timestamp, for time-to-submit spam scoring |
| `name` | text | yes | "Your name *" |
| `email` | email | yes | "Email address *" |
| `subject` | select | yes | "Subject *" |
| `message` | textarea (`maxlength=5000`) | yes | "Message *" |

Subject options, in order: `Select a subject` · General enquiry · Listing issue · Report a listing ·
Partnership · Feedback · Other.

Two-layer spam defence — a honeypot field plus a submit-timing check — with no CAPTCHA. Worth copying;
it is cheaper and less hostile than a challenge.

Validation is native only. **The form was not submitted** — validation messages were read from the
Constraint Validation API rather than by firing it, so no message was sent to the site operator.
Post-submit success and error states are therefore undocumented.

---

### `content-page` — `/about`

Six full-width stacked sections, no images:

| # | Section | Height |
|---|---|---|
| 1 | Hero — H1 "Built for local discovery", 1 link | 449px |
| 2 | **Stats band — the same component as the homepage**, identical 346px height | 346px |
| 3 | Why we built this directory | 551px |
| 4 | What drives us | 511px |
| 5 | Meet the team | 723px |
| 6 | **CTA panel — the same component as the homepage**, identical 444px height | 444px |

Two of six sections are homepage components reused verbatim, which is a useful signal for how the
rebuild should factor its shared blocks.

---

### `legal` — `/privacy`, `/terms`

Verified identical: a single `glass-card` prose column, `max-w-3xl` (**768px**), 16px radius, 32px
padding rising to 40px at `sm`. `/privacy` has 6 H2s; `/terms` has 7 H2s and 3 H3s. Standard header and
footer. No table of contents, no last-updated stamp visible in the structure, no anchor links.

---

### `error-404`

**The only directory template with no header and no footer.** Centred single column:

1. `404` eyebrow in brand colour
2. H1 "We couldn't find that page"
3. One explanatory paragraph
4. `<form action="/search" method="get">` with `name="q"`, placeholder `Search the directory…`, and a
   Search button
5. Two buttons — "Go to homepage" → `/`, "Browse all listings" → `/listings`

Those two links plus the search box are **the only navigation on the page**. With the header and footer
gone there is no route to categories, regions, the blog or contact. That is a real dead end and an easy
improvement for the rebuild — a 404 is a page users land on from stale search results, so it should keep
the site chrome.

A second, unstyled not-found behaviour also exists: the dead canonical target
`/blog/free-business-listing-sites-usa` rendered a page with no H1 and the generic site title rather
than this template.

---

### `landing-page-index` — `/landing-pages`

Breadcrumb, then the same **centred hero** used by `blog-index`: eyebrow badge "Landing Pages", H1 with
a gradient second half, subtitle. Then a card grid holding **one** item.

Card image fallback is a **gradient tile with the client's initials** — a different fallback from the
listing card's flat tint, so the site has two no-image treatments.

---

### `landing-page` — `/ironwood-renovations`

**A separate product on the same domain.** No site header, no site footer, its own palette (purple),
its own typefaces, its own everything. Treat it as an independent design system.

Route sits at **root level** — `/ironwood-renovations`, not `/landing-pages/[slug]` — so client slugs
share a namespace with `/about`, `/login`, `/terms`. The rebuild needs a reserved-slug guard.

**Eight sections:**

1. Utility topbar — phone and email
2. Own sticky nav — brand wordmark, Home / About / Services / Why Us / Gallery / Reviews (all in-page
   anchors: `#about`, `#services`, `#why-choose-us`, `#gallery`, `#testimonials`, `#lead-form`), plus a
   "Get a Free Quote" pill
3. Full-bleed hero — headline + subhead + two CTAs left; a **glass lead-capture card** right with
   Full Name / Phone Number / Email / Message and a "Request a Quote" gradient button
4. About block
5. Services
6. Differentiators
7. Testimonials
8. Gallery, then a closing CTA

Plus a **floating WhatsApp bubble**, bottom-left, and its own footer with social links, quick links,
service areas and the line `© 2026 | Ironwood Renovations | All Rights Reserved | Developed By 101 Top
Listings`.

**Unfinished-template signals worth noting:** the footer's social links are the raw placeholders
(`facebook.com/yourpage`, `instagram.com/yourpage`, `linkedin.com/company/yourpage`,
`g.page/yourbusiness`) and every service-area link is a dead `#`. The published page ships with the
template's default values still in place.

Canonical is correct and self-referencing.

---

### Open questions across all utility templates

1. **Everything behind authentication is undocumented** — the listing form, the dashboard, the signed-in
   header, saved listings, and review submission. This is deliberate: no account was created.
2. Contact-form success and error states were not observed, because the form was not submitted.
3. Whether `/about`'s stats band pulls the same (unreconciled) numbers as the homepage was not checked
   value-by-value, only structurally.
4. Live narrow-viewport rendering was unavailable in this environment.


---

## Prompt 4 — Design system and global chrome

Everything below is **measured** — read from CSS custom properties or `getComputedStyle` in the live
page, not estimated by eye — unless a line is explicitly marked *(estimated)*.

The best find: the site exposes its **entire colour system as CSS custom properties on `:root`**, with a
second set under `[data-theme="dark"]`. Those are transcribed verbatim below, so the rebuild can swap
values without re-deriving the roles.

---

### 1. Layout

| Property | Value |
|---|---|
| Container | `max-w-7xl` → **1280px** max width, centred |
| Gutters | 16px (base) · 24px (`sm`, 640px) · 32px (`lg`, 1024px) |
| Effective content width at desktop | **1216px** |
| Section vertical rhythm | **80px top and bottom** is the standard; measured exceptions of 64px and 40px on two homepage bands |
| Footer offset | `margin-top: 80px` |
| Listing detail body | `grid-cols-1 gap-8 lg:grid-cols-3` — content `col-span-2`, sidebar `col-span-1`, **32px** gap |
| Blog body | sidebar + content, two columns |
| Prose pages (`/privacy`, `/terms`) | capped at **768px** (`max-w-3xl`) |

**Listing card grid — one grid, used on every index:**

```
grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:grid-cols-4
```

| Breakpoint | Columns | Gap | Card width at that width |
|---|---|---|---|
| base (<640px) | **2** | 12px | ~170px at 375px |
| `sm` 640px | 2 | 24px | ~290px |
| `md` 768px | 3 | 24px | ~230px |
| `lg` 1024px+ | 4 | 24px | **286px** at 1536px |

Two columns at 375px is aggressive — it is the tightest point in the whole design and the most likely
source of title wrapping and truncation. Worth reconsidering in the rebuild.

Category cards use a 3-column grid; the footer uses `md:grid-cols-5` with a 40px gap.

---

### 2. Typography

Two families, both loaded as webfonts with local fallback stacks:

- **Space Grotesk** — display (`--font-display`), used for H1 and H2 only
- **Inter** — everything else

| Role | Size / line-height | Weight | Letter-spacing | Family |
|---|---|---|---|---|
| Hero H1 | **36 / 48 / 60px** (`text-4xl sm:text-5xl lg:text-6xl`), lh 1.0 at 60px | 800 | −1.5px | Space Grotesk |
| Page H1 (listing, archive) | 30 / 36px | 700 | −0.75px | Space Grotesk |
| Section H2 | 30 / 36px | 700 | −0.75px | Space Grotesk |
| Sub-heading H2 (in-card) | 18 / 28px | 600 | — | Space Grotesk |
| Card title H3 | 16 / 24px | 600 | — | Inter |
| Body paragraph | **14 / 20px** | 500 | — | Inter |
| Nav link, input text | 16 / 24px | 400 | — | Inter |
| Eyebrow label | 14 / 20px | 600 | **+0.35px**, uppercase | Inter |
| Footer column heading | 14 / 20px | 600 | — | Inter |
| Category pill | 12px | 600 *(estimated weight)* | — | Inter |
| Button label | 14px | 600 | — | Inter |

**Scale ratio:** roughly **1.25 (major third)** through the body range (12 → 14 → 16 → 18), then a jump
to 30px and a second to 60px for display. It is not a single continuous ratio — display and text are
two separate scales, which is a sound choice and worth keeping.

Note that body copy is **14px**, not 16px. Given the muted secondary text colour this is the site's
weakest accessibility point.

---

### 3. Colour

Verbatim from `:root`. Roles are named in the token, which makes them directly reusable.

#### Light theme

| Token | Hex | Used for |
|---|---|---|
| `--color-ink-50` | `#f8fafc` | page background, footer background, text on dark buttons |
| `--color-ink-100` | `#f1f5f9` | card surface, input fill |
| `--color-ink-200` | `#e2e8f0` | subtle fills |
| `--color-ink-300` | `#cbd5e1` | input border |
| `--color-ink-400` | `#94a3b8` | disabled / faint |
| `--color-ink-500` | `#64748b` | secondary text, meta rows, counts |
| `--color-ink-600` | `#475569` | icon default |
| `--color-ink-700` | `#334155` | ghost-button text |
| `--color-ink-800` | `#1e293b` | body text |
| `--color-ink-900` | `#0f172a` | headings, primary text |
| `--color-brand-50…900` | `#f0f9ff` `#e0f2fe` `#bae6fd` `#38bdf8` `#0ea5e9` `#0284c7` `#0284c7` `#0369a1` `#7dd3fc` `#0c4a6e` | primary / links / active states |
| `--color-accent-50…900` | `#f5f3ff` `#ede9fe` `#ddd6fe` `#c4b5fd` `#7c3aed` `#6d28d9` `#7c3aed` `#6d28d9` `#5b21b6` `#4c1d95` | gradients, pills, borders |
| `--color-line` | `#e2e8f0` | dividers |
| `--color-line-soft` | `#eef2f7` | faint dividers |
| `--color-hover` | `#0f172a0d` | hover wash (5% ink-900) |
| `--color-danger` / `-soft` / `-line` | `#dc2626` / `#dc262614` / `#dc262638` | errors |
| `--color-success` / `-soft` / `-line` | `#15803d` / `#16a34a14` / `#16a34a38` | success |
| `--color-warning` / `-soft` / `-line` | `#b45309` / `#d977061a` / `#d9770640` | warnings |
| `--color-info` / `-soft` / `-line` | `#1d4ed8` / `#2563eb14` / `#2563eb38` | info |
| `--glass-bg` | `#ffffffb8` | frosted card fill |
| `--glass-border` | `#0f172a14` | frosted card edge |
| `--hero-scrim` | `linear-gradient(180deg,#fff9,#ffffff40,#fff9)` | hero overlay |
| `--ambient-blend` / `--ambient-filter` | `multiply` / `saturate(1.6)` | background wash |

**Practical roles:** primary brand **`#0284c7`** (sky), accent **`#7c3aed`** (violet). Signature gradient
is `linear-gradient(120deg, #38bdf8, #7c3aed, #38bdf8)` — used for card borders and pills.

**There is no star / rating colour token.** Consistent with the finding that no rating UI was observed
anywhere on the site.

#### Dark theme (`[data-theme="dark"]` on `<html>`)

The ink scale **inverts semantically** — `ink-50` stays "page background" and `ink-900` stays "primary
text", the hex values simply flip. This is a genuinely good pattern; copy it.

| Token | Dark value |
|---|---|
| `--color-ink-50` | `#0a0f1c` (page bg) |
| `--color-ink-100` | `#1e293b` (surface) |
| `--color-ink-200` | `#334155` |
| `--color-ink-300` → `900` | `#475569` `#64748b` `#94a3b8` `#cbd5e1` `#e2e8f0` `#f1f5f9` `#f8fafc` |
| `--color-brand-500` | `#38bdf8` (lifted for contrast) |
| `--color-accent-600` | `#8b5cf6` |
| `--color-line` / `-soft` | `#24334c` / `#1a2438` |
| `--color-hover` | `#ffffff14` |
| `--glass-bg` / `--glass-border` | `#1e293b99` / `#ffffff14` |
| `--color-danger` / `success` | `#f87171` / `#4ade80` |

#### Defects in the token set — fix these in the rebuild

1. **`brand-800` is `#7dd3fc`** — a *light* tint sitting where the ramp should be dark. Same in dark
   theme (`brand-700` = `#7dd3fc`). The ramp is non-monotonic.
2. **`brand-500` and `brand-600` are identical** (`#0284c7`). So are `accent-400`/`accent-600`
   (`#7c3aed`) and `accent-500`/`accent-700` (`#6d28d9`). Four of twenty brand/accent steps are
   duplicates, so the scale has less range than it appears to.

---

### 4. Cards

#### Listing card

| Property | Value |
|---|---|
| Outer wrapper | `<article>`, radius **16px**, `padding: 2px` |
| Wrapper background | `linear-gradient(120deg, #38bdf8, #7c3aed, #38bdf8)` — the 2px padding is what makes it a gradient border |
| Border animation | `neon-border-flow`, **5s linear, infinite** |
| Inner surface | radius 16px, ink-50 at 90% alpha |
| Card size at `lg` | **286 × 350px** |
| Image | **282 × 176px**, `aspect-ratio: 16/10`, `object-fit: cover` |
| Body padding | 12px, rising to **20px** at `sm` |
| Shadow | `shadow-lg` on the wrapper |

Contents in order: image → category pill → H3 name → tagline (2-line clamp, omitted when absent) →
location row with pin icon.

#### Category card
Single row: 40px rounded-square gradient icon tile, name (16px/600), count beneath in ink-500. Three per
row. No image.

#### Blog / landing-page card
Image on top, then title and meta. When a landing page has no image the tile falls back to a **gradient
block with the client's initials** centred.

---

### 5. Buttons

| Variant | Height | Padding | Radius | Fill | Text | Where |
|---|---|---|---|---|---|---|
| Primary pill | **36px** | 8px 16px | full | `#0284c7` | `#f8fafc`, 14px/600 | header "Browse all", search Search |
| Outline pill | 36px | 8px 12px | full | transparent, brand ring at 30% | `#0284c7` | header "Add listing" |
| Ghost | 36px | 8px 12px | full | none | `#334155` | header "Sign in" |
| Form submit | **44px** | 12px 24px | **12px** | gradient | white, 14px | "Send message" |
| Icon button | 36px (`size-9`) | — | 8px | none | ink-600 | theme toggle |
| Mobile menu trigger | 40px (`size-10`) | — | full | `--color-hover` | ink-900 | `<768px` |
| Back to top | ~48px *(estimated)* | — | full | brand | white | floating, bottom-right |

Note the inconsistency: navigation buttons are 36px pills, form submits are 44px with a 12px radius.
Two button systems coexist.

---

### 6. Header

| Property | Value |
|---|---|
| Position | `fixed`, `z-index: 40` |
| Height | **112px**, animating to ~96px on scroll (`transition-all duration-300`) |
| Outer background | transparent — the inner pill carries the surface |
| Contents, left to right | logo → nav pill (Home · About us · Listings · Landing Pages · Blog · Contact us) → Sign in · Add listing · Browse all · theme toggle |
| Active state | filled brand pill behind the current item |
| Logo | two `<img>`: compact mark below 640px, full wordmark at and above |
| Scroll behaviour | bar shortens; the nav pill gains a solid surface |
| Below 768px | nav and the whole right cluster hide; a 40px circular trigger opens a **right-side drawer**, `w-80` (320px) capped at `85vw`, full height, scrollable, behind a full-screen scrim at `z-50` |

Sticky-offset constant: the listing sidebar uses `top: 96px`, matching the scrolled header height.

---

### 7. Footer

- Background `#f8fafc` (ink-50), `margin-top: 80px`
- Top border: **0.8px** in the accent violet at **30% opacity** — a distinctive touch
- Grid: `md:grid-cols-5`, **40px** gap. Brand column spans two; three link columns follow
- Brand column: logo, blurb, "Add a listing" filled pill
- Column headings: 14px / 600, uppercase-ish sentence case — "Quick links", "Popular categories", "Areas"
- Bottom bar: copyright left; Privacy Policy and Terms & Conditions right

---

### 8. Forms

| Property | Value |
|---|---|
| Input / select height | **50px** |
| Textarea height | 154px |
| Radius | **8px** |
| Border | **0.8px** solid `#cbd5e1` (ink-300) |
| Fill | `#f1f5f9` (ink-100) |
| Padding | `20px 12px 8px` — top-heavy, i.e. a **floating-label** pattern |
| Select padding | `20px 36px 8px 12px` (room for the chevron) |
| Font size | 14px |
| Required marker | asterisk in the label: "Your name *" |
| Focus state | ring transition at 150ms *(colour not isolated)* |

**Validation is entirely native browser constraint validation.** Read directly from the Constraint
Validation API without submitting anything:

- empty required field → `"Please fill out this field."`
- empty select → `"Please select an item in the list."`
- malformed email → `"Please include an '@' in the email address. 'x' is missing an '@'."`

No custom messages, no inline error text, no error styling on the field, no `minlength` anywhere except
password (`minLength=8`, helper text "At least 8 characters."). The message textarea has
`maxlength=5000`. Autocomplete attributes are correct throughout (`name`, `email`, `new-password`) —
worth keeping.

Adding real inline validation is one of the cheapest wins available to the rebuild.

---

### 9. Icons

**Lucide** (or an identical fork): 24×24 viewBox, `stroke-width: 2`, no fill, rendered at **20px**
default, `size-4`/`size-5` in context. Colour follows text (`ink-600` default, brand for accents).
Observed: search, map-pin, phone, mail, external-link, clock, heart, chevron-right, arrow-right,
arrow-up, moon/sun, grid, tag, shield-check.

---

### 10. Motion

Measured across every animated element on the homepage.

| Animation | Duration | Easing | Count | What it is |
|---|---|---|---|---|
| colour / background / border / opacity | **0.15s** | `cubic-bezier(0.4, 0, 0.2, 1)` | 41 | hover states — the default transition |
| transform / translate / scale / rotate | **0.3s** | `cubic-bezier(0.4, 0, 0.2, 1)` | 30 | card hover lift, header resize |
| `neon-border-flow` | **5s** | `linear`, **infinite** | 14 | the animated gradient card border |
| `all` | 0.3s | `cubic-bezier(0.4, 0, 0.2, 1)` | 9 | header shrink on scroll |
| opacity | 0.3s | `cubic-bezier(0.4, 0, 0.2, 1)` | 8 | scroll-reveal fade-in |
| `float` | **6s** | `ease-in-out` | 2 | hero illustration bob |
| box-shadow | 0.3s | `ease` | 1 | card elevation |

Also present:

- **Scroll reveals** via IntersectionObserver — sections fade and translate in as they enter view.
  Programmatic scrolling outruns them and leaves regions blank, so anything that jumps the page can land
  on empty space.
- **Count-up numbers** in the homepage stats band (observed mid-animation at "12+" and "2+" before
  settling at 487+ / 74+ / 126+ / 79+).
- **Two `prefers-reduced-motion` media blocks** exist, so reduced motion is at least partly handled —
  worth verifying that the 5s infinite border animation is among the things they disable, since a
  perpetually animating border on 14 elements is the most likely motion complaint.

Easing is `cubic-bezier(0.4, 0, 0.2, 1)` almost everywhere — Tailwind's default ease-in-out. It reads as
eased, not linear, apart from the deliberately linear gradient flow.

---

### Open questions

- Focus-ring colour and offset were not isolated; the transition exists but the focus state itself was
  not captured.
- Hover elevation delta on cards (shadow before/after) was not measured numerically.
- All breakpoint behaviour is read from Tailwind classes and computed styles rather than a live narrow
  viewport — `resize_window` reported success but `window.innerWidth` never changed in this environment.
  Exact for *what* changes and *where*; blind to real overflow or overlap.


---

## Prompt 5 — Flows and states

Each flow was walked in the browser. **Structure and behaviour only.** Where a step required creating an
account, entering personal data, or submitting a form that would send a message to the site operator, I
stopped and said so — those are marked **STOPPED** and the reason is given.

---

### 1. Search

**Steps walked**

| # | Action | URL after |
|---|---|---|
| 1 | Load homepage | `/` |
| 2 | Click the hero search field, type `chiropractic`, press **Enter** | `/search?q=chiropractic` |
| 3 | Result: **85 results**, 12 cards on page 1, 8 pages | — |
| 4 | Click **A–Z** in the sort toggle (on `/listings`, same control) | `/listings?sort=alphabetical` |
| 5 | Click pagination **2** | `/listings?sort=alphabetical&page=2` |
| 6 | Click a listing card | `/listing/…` |
| 7 | Browser **Back** | `/listings?sort=alphabetical&page=2` |

**How the URL changes.** Every piece of state is a query parameter and every control is a real link, so
the whole thing is server-rendered and shareable. Parameters compose correctly:
`?q=chiropractic&sort=alphabetical&page=3` was loaded directly and rendered exactly the expected state —
search field repopulated, A–Z shown as the active sort, page 3 of results.

**Survives refresh:** **yes.** F5 on `?q=chiropractic&sort=alphabetical&page=3` returned an identical
page — query text, active sort and page position all intact. This is a direct benefit of keeping state
in the URL and is worth preserving.

**Survives Back:** **yes for state, no for position.** Back from a listing returned to
`/listings?sort=alphabetical&page=2` with sort and page intact — but **`scrollY` was 0**. The user is
dropped at the top of page 2 and has to scroll back to where they were. On a 12- or 20-card grid that is
a meaningful annoyance and the most fixable thing in this flow.

**There is no filtering.** The prompt asked me to narrow by category and then by location. **Neither
control exists.** No index page on the site has a category filter, a location filter, a rating filter,
or anything other than the three-option sort. The only ways to narrow are to start from a category or
region page, or to type a keyword. For a directory this is the defining functional gap.

**Breakages or surprises**

- Sort options are Newest (default, no parameter) / Oldest / A–Z. There is no relevance sort, even on
  the search page — a keyword search returns results ordered by date.
- `/search` is `Disallow`ed in robots.txt, so the keyword surface earns nothing organically.
- Page size differs by template: 20 on `/listings`, 12 on category, region and search.
- Scroll-reveal animation means fast scrolling shows empty card outlines, which reads as a broken grid
  rather than a loading state.

---

### 2. Zero results

**Steps walked:** `/search?q=zzzqqxnonsense123`

**What is shown:** `Results for "zzzqqxnonsense123"` → `0 results` → a dashed-border panel containing
"No results for "zzzqqxnonsense123"." and, beneath it, "Try a different word, or check the spelling."

**Actions offered: none.** No suggested categories, no popular searches, no "browse all listings" link,
no "add this business" prompt. The **sort toggle disappears entirely** at zero results, which is correct
but leaves the page very bare.

The blog's equivalent is better written — "No articles match "…"." / "Try a different search term." —
but equally actionless.

The region empty state is different again: "No listings in this region yet." with no CTA. And
`/blog?featured=1` produces a fourth: "No featured articles yet."

**Four empty states, four different wordings, none offering a next step.** One consistent empty-state
component with a real recovery action is a cheap improvement.

---

### 3. Listing detail, contact action, related listings

**Steps walked**

1. From a result, opened `/listing/asap-inventory`
2. Inspected the contact actions in the sticky sidebar
3. Followed a related-listings card

**Contact actions.** The sidebar offers **Save**, **Call now** (a `tel:` link), **Visit website** (an
external `https` link opening the business's own site), and then plain rows for phone, email
(`mailto:`), website and full postal address.

There is **no contact form, no message-the-business flow, and no lead capture of any kind.** Every
contact action hands the user straight off to the business. The directory captures no signal that a
lead occurred — no click tracking is visible in the markup. For a business model built on listings that
is a significant miss, and the ironic contrast is that the client landing page (`/ironwood-renovations`)
*does* have a lead-capture form.

**Save, signed out.** Clicking Save navigates to **`/login`** — with **no return parameter**. The URL is
a bare `/login`, so after signing in the user does not come back to the listing they were trying to
save. Round-tripping the intent through a `?next=` parameter is a small, obvious fix.

**Related listings.** Four cards under a "KEEP EXPLORING / Related listings" heading, matched by
category. Clicking one loads that listing normally. Related listings are the **only** lateral navigation
on a detail page — it links to no region, no `/listings`, and no blog.

---

### 4. Registration and login — **STOPPED before submission**

I do not create accounts or enter passwords. Both forms are fully documented structurally; neither was
submitted, and no account exists.

**`/login`** — centred `glass-card`. H1 "Welcome back", sub-line "Sign in to your account", labelled
Email and Password fields (both required), a full-width "Sign in" primary button, "Forgot your
password?" inside the card, and "Don't have an account? **Create one**" below it.

**`/register`** — H1 "Create your account". Fields: `name`, `email`, `password` (required,
`minlength=8`, helper "At least 8 characters."). Link back to `/login`. **No confirm-password field, no
strength meter, no terms checkbox.**

**`/forgot-password`** — H1 "Forgot your password?", a single email field.

**Validation**, read from the Constraint Validation API without firing a submit: native browser messages
only — `"Please fill out this field."`, `"Please select an item in the list."`, and
`"Please include an '@' in the email address. 'x' is missing an '@'."` No custom copy, no inline error
text, no field-level error styling. `autocomplete` attributes are correct throughout.

**Undocumented, and it needs an account to capture:** what happens after submit, whether email
verification exists, what the header looks like signed in, and everything under `/dashboard/*`.

---

### 5. Add a listing — **STOPPED at the account gate**

**Does it require login?** Effectively yes, but it does not *redirect* to login — which is the
interesting part.

`/dashboard/listings/new` loads for a signed-out visitor and renders an **inline account-creation card**:
H2 "Add a listing", a line explaining that an email and password will create a free account and take you
straight to the form, then `email` and `password` (`minlength=8`, "At least 8 characters."), a
full-width **"Continue to the listing form"** button, and "Already signed in elsewhere? **Sign in
instead**".

So the funnel is: *Add listing → create account inline → listing form*, with no visible detour to a
sign-up page. Framing account creation as step one of the listing task rather than as a separate
sign-up is a good pattern and worth keeping.

**I stopped here.** Creating the account was necessary to go further and I do not do that. Consequently
**the listing form itself is entirely undocumented** — single vs multi-step, field list, required
fields, image upload, category and region pickers, opening-hours entry, validation, and what happens on
submit (immediate publish vs moderation queue). One of the homepage value propositions asserts that listings are
reviewed before publication, which implies a moderation step — but that was not verified.

**This is the largest gap in the whole specification.** Someone with an account should capture it
manually, or the rebuild should design it from first principles.

---

### 6. Reviews — **could not be observed**

**What was tried:** eight listings were opened looking for a populated review list —
`asap-inventory`, `the-joint-chiropractic-oxford`, `dr-nidhi-best-liver-doctor-in-delhi`,
`toi-et-moi-engagement-rings`, `vcard-link-card`, `zivak-realty-group`, `eacpa-pro`,
`action-janitorial`, `cudek-ai`.

**All of them show the zero state.** Every one renders "No reviews yet. Be the first to review this
business." above a panel reading "**Sign in** to write a review."

So:

- **How reviews are displayed: unknown.** No review card, no star rendering, no author line was observed.
- **Sorting: unknown.** **Pagination: unknown.** **Rating breakdown: unknown** — no histogram or average
  appears anywhere.
- **The review form: not reached** — it is behind authentication.

Two corroborating signals that this is not just bad sampling: the listing JSON-LD **never emits
`aggregateRating`**, and the design-token set contains **no star or rating colour**. A product that
rendered ratings would almost certainly have both. Meanwhile the homepage stats band claims "79+
Customer reviews".

**Practical consequence:** the rebuild cannot copy the review experience, because there is nothing to
copy. It has to be designed — and doing it properly (visible average, count, breakdown, and
`aggregateRating` in the structured data) is one of the clearest ways the rebuild can beat the original
in search results.

---

### 7. 404

**Steps walked:** `/this-page-does-not-exist-xyz123`, `/definitely-not-a-real-page`

`<title>` is `Page not found | 101 Top Listings`. The page is a centred column: a `404` eyebrow in brand
colour, H1 "We couldn't find that page", one explanatory line, a search form
(`GET /search`, `name="q"`, placeholder "Search the directory…"), and two buttons — **Go to homepage**
→ `/` and **Browse all listings** → `/listings`.

**Navigation options: those three, and nothing else.** The 404 renders with **no site header and no site
footer** — the only directory template that does. A user landing here from a stale search result has no
route to categories, regions, the blog or contact. Restoring the chrome is a one-line fix and an obvious
improvement.

**Surprise:** a *second* not-found behaviour exists. `/blog/free-business-listing-sites-usa` — the URL
one of the blog posts declares as its own canonical — renders neither the article nor this styled 404,
but a page with no H1 and the generic site title. Two different not-found paths, one of them unstyled.

---

### Breakages and surprises — consolidated

| # | Finding | Where |
|---|---|---|
| 1 | **No filtering exists anywhere.** Sort-only, three options, no relevance sort. | every index |
| 2 | Scroll position is lost on Back; sort and page are preserved. | all indexes |
| 3 | Save signed-out redirects to a bare `/login` with **no return URL**. | listing detail |
| 4 | No contact form or lead capture on listings — every action hands off to the business. | listing detail |
| 5 | **Four** empty states, four wordings, **none with a recovery action**. | listing search, blog search, region, featured |
| 6 | Page size is 20 on `/listings` but 12 on category, region and search. | all indexes |
| 7 | The add-listing form is behind inline account creation; not documented. | add-listing |
| 8 | Zero reviews on 8 of 8 listings, against a claimed "79+". | listing detail |
| 9 | 404 drops the header and footer, leaving three links total. | 404 |
| 10 | A second, unstyled not-found page exists. | dead canonical target |
| 11 | Five of the seven footer region links lead to empty archives. | footer |
| 12 | Non-www does not redirect to www, despite robots.txt declaring the canonical host. | site-wide |
| 13 | One blog post's canonical points at a URL that renders an empty page. | blog post |
| 14 | Homepage stats reconcile with nothing — 4 of 4 numbers contradict the live site. | home, about |

### What was deliberately not done

- **No account was created**, so no password was entered anywhere.
- **No form was submitted.** Validation messages were read from the Constraint Validation API instead,
  so the contact form sent nothing to the site operator.
- **Nothing was published**, and no fake business was submitted.


---

## Appendix — Raw working notes

> These are the unedited notes taken while browsing. Everything here is already folded
> into the sections above — kept only for traceability.

Crawled 2026-08-30 via Claude in Chrome, desktop viewport 1536x730 unless noted.

### Tech signals
- Next.js App Router + Server Actions (hidden inputs $ACTION_REF_1, $ACTION_1:0, $ACTION_1:1, $ACTION_KEY on every form)
- Images served from ImageKit: https://ik.imagekit.io/101toplistings/user-uploads/...
- Cloudflare in front (robots.txt has Cloudflare Managed Content block)
- Scroll-reveal animations (IntersectionObserver); programmatic scrollTo bypasses them, elements stay invisible
- Dark-mode toggle (moon icon) in header, far right

### Counts observed
- /listings says 617 results, 31 pages @ 20/page
- sitemap.xml has 265 URLs: 259 /listing/[slug] + 6 statics -> ~358 listings NOT in sitemap
- /categories: 94 categories, single page, no pagination
- /regions: only 2 top regions rendered (North America 177, Northern Europe 113) = 290; footer links 7 regions
- Category & region pages: 12 per page. /listings and /search: 20 per page (listings), search grid narrower
- Homepage hero badge says "617 businesses listed"; stats band says "487+ Businesses listed" (INCONSISTENT)
- /categories subtitle count reads "94 listings" but they are categories (MISLABELED)

### Routes confirmed visited
/, /listings, /listings?page=2, /listings?page=31, /listings?sort=oldest, /listings?sort=alphabetical
/categories, /category/chiropractic-clinic (+?page=2..7, ?sort=)
/regions, /region/eastern-europe (EMPTY), /region/united-states (+?page=2, ?page=15), /region/north-america
/blog, /blog?featured=1, /blog/category/[slug], /blog/tag/[slug], /blog/[post-slug]
/landing-pages, /ironwood-renovations (ROOT-LEVEL slug, not nested)
/about, /contact, /privacy, /terms
/login, /register, /forgot-password, /dashboard/listings/new
/search?q=plumber, /search?q=zzzqqxnonsense123 (zero state)
/this-page-does-not-exist-xyz123 (404)
/listing/asap-inventory

### Query parameters
- page=N   (listings, category, region; 1-indexed, page=1 omitted)
- sort=oldest | sort=alphabetical  (default newest = no param)
- q=<text> (search only)
- featured=1 (blog only)
NO category/location/price filter params anywhere. Sort is the only refinement on index pages.

### Footer (3 link columns + brand column + bottom bar)
Brand col: logo, blurb, "Add a listing" button
Quick links: Home /, About us /about, Listings /listings, Landing Pages /landing-pages, Blog /blog, Contact us /contact
Popular categories: Chiropractic Clinic, Health & Medical, Home Services, Local Business, Automotive, Professional Service, "All categories →" /categories
Areas: Eastern Europe, Middle East, North America, Northern Europe, South Asia, Southern Europe, Western Europe, "All regions →" /regions
Bottom bar: "© 2026 101 Top Listings. All rights reserved." | Privacy Policy /privacy | Terms & Conditions /terms

### Header (desktop)
Logo -> / ; Home, About us, Listings, Landing Pages, Blog, Contact us ; Sign in /login ; Add listing /dashboard/listings/new ; Browse all /listings ; dark-mode toggle
Sticky, pill-shaped nav container, active item filled blue pill.

### 404
No header, no footer. Centered: "404" eyebrow / H1 "We couldn't find that page" / paragraph / search input ph "Search the directory..." + Search button / "Go to homepage" + "Browse all listings"
Title: "Page not found | 101 Top Listings"

### Search zero state
"Results for "x"" / "0 results" / dashed panel: "No results for "x"." + "Try a different word, or check the spelling." Sort toggle hidden at 0 results.

### Region empty state
"0 results" / dashed panel "No listings in this region yet." No CTA.

### Listing detail (/listing/asap-inventory)
Breadcrumb: Home > [Category] > [Business name]  (category, NOT "Listings")
Cover image full-width ~16:5, avatar/logo thumb overlapping bottom-left
Category pill -> H1 business name -> meta row (pin + location, "Added <date>")
2-col: LEFT = tagline, About, Business hours table (7 rows Mon-Sun), Reviews
       RIGHT = sticky card: Save button, primary CTA, "Visit website", phone, email, website, address
Then full-width "KEEP EXPLORING / Related listings" 4 cards
Only interactive button: "Save"
JSON-LD: one script, array of [LocalBusiness, BreadcrumbList]
 LocalBusiness keys: @id name url description image logo telephone email sameAs address additionalType openingHoursSpecification
 NO aggregateRating even though Reviews section exists
canonical present; og:title/description/image/type=website/url; twitter:card=summary_large_image; robots=index, follow
Reviews signed-out: "Sign in to write a review." + "No reviews yet. Be the first to review this business."

### Forms
/contact: name(req,text) email(req,email) subject(req,select) message(req,textarea) + HONEYPOT text field name="company" + hidden startedAt timestamp
/login: email(req) password(req); links /forgot-password, /register; H1 "Welcome back"
/register: name(req) email(req) password(req); link /login; H1 "Create your account"
/forgot-password: email; H1 "Forgot your password?"
/dashboard/listings/new: NOT redirected to login. Shows inline account gate card:
  H2 "Add a listing" / "Enter an email and password to get started — we'll set up a free account for you and take you straight to the form."
  Email + Password (helper "At least 8 characters.") / "Continue to the listing form" / "Already signed in elsewhere? Sign in instead"
  >>> Real listing form is behind account creation. NOT ATTEMPTED (no account creation).

### Mobile / responsive (derived from Tailwind classes + DOM, NOT from a resized viewport — resize_window had no effect in this environment)
- header inner container: `mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8` -> max 1280px, gutters 16/24/32px
- header bar: `flex items-center justify-between gap-4 transition-all duration-300 h-28` -> 112px, animates to shorter on scroll (observed ~96px)
- logo: two <img>, one `sm:hidden` (mark), one `hidden sm:block` (wordmark) -> swaps at 640px
- <nav aria-label="Primary"> is `hidden md:block` -> primary nav hidden below 768px
- Sign in / Add listing / Browse all: `hidden ... md:inline-block` -> hidden below 768px
- mobile trigger: <button aria-label="Open menu" aria-expanded="false"> size-10 rounded-full bg-hover, inside a `md:hidden` div
- theme toggle: <button aria-label="Switch to dark theme"> size-9 rounded-lg text-ink-600
- mobile drawer: `fixed inset-0 z-50` scrim + <nav class="absolute right-0 top-0 flex h-full w-80 max-w-[85vw] flex-col overflow-y-auto bg-ink-100 shadow-2xl ring-1 ...">
  -> right-side drawer, 320px wide capped at 85vw, full height, scrollable
- drawer links = same 6 nav items + Sign in + Add listing + Browse all + extra "Browse all listings"
- A11Y NIT: aria-label stays "Open menu" after opening (aria-expanded flips to true, label does not)
- Design tokens seen in classes: ink-50/100/500/600/700/900, brand-500/600/700, accent-500, `bg-hover`, `font-display`

### Blog post template (/blog/[slug])
Breadcrumb: Home > Blog > [Category] > [Post title]
Category pill (gradient) -> H1 -> standfirst paragraph -> byline row (author, publish date+time, "Updated <date>", clock + "N min read") -> hero image -> body H2s -> "Related articles"
JSON-LD: [BreadcrumbList, BlogPosting{headline description url image datePublished dateModified author publisher}]

#### CONFIRMED SEO DEFECTS
1. /blog/free-business-listing-sites-in-the-usa declares
   canonical = https://101toplistings.com/blog/free-business-listing-sites-usa/
   -> wrong host (non-www), wrong slug, trailing slash. Visiting it renders a page with NO H1 and the
   generic site title -> canonical points at a dead/soft-404 URL.
   The other post (/blog/best-business-directory-websites-for-small-businesses) self-references correctly.
   => canonical is a free-text per-post field with no validation.
2. Non-www host does NOT redirect to www. https://101toplistings.com/... serves content directly,
   despite robots.txt declaring Host: https://www.101toplistings.com. Duplicate-content exposure.
3. Title tags run long (85 chars on one post; another truncates as "...Best Free Busin | 101 Top Listings")
4. Listing JSON-LD has no aggregateRating despite a Reviews section
5. og:type = "website" on listing detail pages (business.business would fit better)
6. 358 of ~617 listings are absent from sitemap.xml; no category/region/blog URLs in it at all

### Landing page template (/[slug], e.g. /ironwood-renovations) — STANDALONE MICROSITE
- NO site header. NO site footer. Entirely its own chrome and brand (purple, different type).
- Own topbar: phone + email
- Own nav: Home / About / Services / Why Us / Gallery / Reviews, all in-page anchors (#about, #services,
  #why-choose-us, #gallery, #testimonials, #lead-form) + "Get a Free Quote" pill CTA
- Hero: full-bleed photo, left headline + subhead + two CTAs, right glass lead-capture card
  (Full Name / Phone Number / Email / Message -> "Request a Quote")
- Floating WhatsApp bubble, bottom-left
- 8 sections; H2s: Two Decades of Trusted Craftsman... / Our Services / What Sets Us Apart /
  What Our Clients Say / Take a Look at Our Craftsmanship / Ready to Start Your Project?
- Own footer: social links, quick links, service areas, "© 2026 | Ironwood Renovations | All Rights
  Reserved | Developed By 101 Top Listings"
- NOTE: social links are unedited placeholders (facebook.com/yourpage, g.page/yourbusiness);
  service-area links are dead "#"
- Route lives at ROOT level (/ironwood-renovations), NOT /landing-pages/[slug] -> collides with the
  reserved static route namespace
