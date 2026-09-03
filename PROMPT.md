# MASTER PROMPT — FULL WEBSITE RECREATION (CLAUDE CODE)

> **How to use this file:** say to Claude Code: *"Read PROMPT.md and execute it completely, following every rule."*

---

## 0. CONFIG

```
REFERENCE_SITE      = https://101toplistings.com/
NEW_BRAND_NAME      = 101 Top Listings
NEW_DOMAIN          = 101toplistings.com
BRAND_COLORS        = primary #0D5C63 (deep teal) / ink #12212B / accent #F0A202 (amber)
TECH_STACK          = Next.js (App Router) + React + TypeScript (strict) + Tailwind CSS + Framer Motion
                      — LOCKED. See Section 1.5. Do not substitute.
DATABASE            = Supabase (PostgreSQL) + PostGIS for geo queries — LOCKED
AUTH                = Supabase Auth (email/password + OAuth) with RLS — LOCKED
STORAGE             = Supabase Storage (listing images, logos, media library)
HOSTING             = Hostinger
CDN / EDGE          = Cloudflare (HTTP/3 enabled)
DEPLOY_TARGET       = Hostinger + Cloudflare
REPO_PATH           = repository root
```

Brand name, domain and colours were delegated to Claude and chosen in an earlier session;
see `docs/OPEN-QUESTIONS.md` (decisions D-2 and D-3). They live in a `settings` database row,
never hardcoded, so renaming the site is one admin edit.

---

## 1. MISSION

This is **NOT** a homepage redesign. This is **NOT** a landing-page demo.
This is a **COMPLETE, PRODUCTION-GRADE RECREATION** of the entire reference website as a new,
independently branded product.

The reference site is the **PRIMARY SOURCE OF TRUTH** for:
information architecture · page hierarchy · navigation · layout structure · component placement ·
content hierarchy · user flows · search behaviour · filters · sorting · pagination · listing cards ·
listing detail layouts · category layouts · location layouts · blog layouts · forms · CTA placement ·
footer structure · responsive behaviour · mobile navigation · empty states · error states ·
loading states · breadcrumbs · internal linking · URL structure.

**The only things that must be intentionally different:**
- Brand name and logo
- Brand identity, colours, and typography
- All copy (must be original, written fresh)
- All imagery and assets (original, licensed, or generated placeholders)
- Visual styling required to establish the new brand

**Structure and UX stay faithful. Content and branding are 100% original.**

### Originality guardrail (non-negotiable)

Do **not** copy any text, marketing copy, blog article, business description, review text, logo,
photograph, or icon set from the reference site into the new codebase. Extract **structure, layout,
field types, and flow logic** only. Every string that ships must be written fresh or generated as
clearly synthetic seed data.

---

## 1.5 MANDATORY TECHNOLOGY STACK

A Wappalyzer scan of the reference site returned the technologies below. **Locked requirements.**
No Vite, no Remix, no Astro, no styled-components, no CSS Modules instead of Tailwind, no GSAP
instead of Framer Motion. If a substitution seems necessary, write it in `docs/OPEN-QUESTIONS.md`
and ask — do not swap unilaterally.

| Layer | Technology | Notes |
|---|---|---|
| Web framework | **Next.js** | App Router. Also the web server and static/SSG layer. |
| JS framework | **React** | Bundled with Next.js. |
| UI framework | **Tailwind CSS** | The only styling system. All design tokens in Tailwind config. |
| JS library | **Framer Motion** | The only animation library. |
| Rendering | **Next.js SSG/SSR/ISR** | Prefer static/ISR for listing, category, location, blog; SSR for search and authenticated routes. |
| CDN / edge | **Cloudflare** | Proxy, caching, TLS. |
| Hosting | **Hostinger** | Origin host. |
| Protocol | **HTTP/3** | Enabled at the edge. |
| Performance | **Priority Hints** | `fetchPriority="high"` on LCP images; `preload` critical fonts. |
| Metadata | **Open Graph** | Full OG coverage on every route via the Metadata API. |

### Language / tooling
- **TypeScript**, strict mode, zero `any` in shipped code
- ESLint + Prettier
- `next/image` for all images, `next/font` for fonts

### NOT detected — deliberately absent
No analytics, tag manager, live chat, cookie-consent tool, A/B testing, CRM, marketing automation,
advertising, or CMS. **Do not add any of these.**

### Backend — LOCKED
- **Supabase (PostgreSQL)** with **PostGIS** enabled
- **Supabase Auth**, with **Row Level Security** on every table
- **Supabase Storage** for listing images, logos, media library
- Server-side data access only; the service role key never reaches the client

### Deployment reality check
Hostinger runs Next.js as a Node process, not serverless. Confirm the plan/runtime before Phase 5:
- Node hosting available → standard `next build` + `next start` behind Cloudflare.
- Static hosting only → flag immediately; SSR, auth, and forms will not work.
Write the answer into `docs/DEPLOYMENT.md` **before** implementation begins.

---

## 2. ABSOLUTE RULES

1. **NEVER SKIP A STEP.** Every phase runs in order. No phase is complete until its exit criteria are met and written to disk.
2. **NEVER SILENTLY DOWNSCOPE.** If something should be cut, write it in `docs/OPEN-QUESTIONS.md` and ask.
3. **NO PLACEHOLDERS.** Never ship "coming soon", "Lorem ipsum", "TODO", or an empty route.
4. **NO SIMPLIFIED CLONE.** Not just the homepage. Not just 5–10 pages. No faked category or listing pages.
5. **MULTIPLE EXAMPLES, ALWAYS.** For every dynamic route pattern, inspect **at least 5 real, different examples**.
6. **MOBILE IS NOT OPTIONAL.** Every page type inspected and implemented at mobile widths too.
7. **WRITE EVERYTHING DOWN.** All research output goes under `docs/`.
8. **USE SUB-AGENTS.** See Section 3.
9. **VERIFY, DON'T ASSUME.** Run the build, the typecheck, the lint, open the routes.
10. **DO NOT SUBSTITUTE THE STACK.** Section 1.5 is locked.
11. **DO NOT STOP EARLY.** Continue until Section 14 is satisfied. Stop only for a genuine blocker, and batch those questions.

---

## 3. SUB-AGENT ORCHESTRATION — MANDATORY

Operate as an **orchestrator** dispatching specialised sub-agents, in parallel where work is independent.

### Protocol
- Every sub-agent receives: exact scope, files it may read, the file path it must write, and that file's format.
- Sub-agents do not share context. Each writes full findings to a file under `docs/` and returns only: file path, a ≤10-line summary, and anything blocking another agent.
- Never let two sub-agents write to the same file. One owner per file.
- After each wave, read the produced files, reconcile conflicts, update `docs/PROGRESS.md`.
- If a sub-agent returns thin output, **re-dispatch with sharper instructions.**

### Wave A — Discovery (parallel)
| Agent | Scope | Writes to |
|---|---|---|
| `crawler-agent` | Exhaustive route discovery: sitemap.xml, robots.txt, nav, footer, breadcrumbs, internal links, pagination, category/location/listing/blog links, CTA targets, form actions | `docs/route-inventory.md` |
| `ia-agent` | Page hierarchy tree, parent/child relationships, URL patterns, internal linking graph | `docs/information-architecture.md` |
| `template-agent` | Distinct page **templates** and which routes map to each | `docs/page-templates.md` |
| `seo-agent` | Title/meta patterns, heading hierarchy, JSON-LD types, canonical rules, OG tags, sitemap structure, robots rules | `docs/seo-spec.md` |

### Wave B — Deep page analysis (one agent per template)
Use the *actual* discovered list. Typical: `home-agent` · `listings-index-agent` · `listing-detail-agent` ·
`category-agent` · `location-agent` · `blog-index-agent` · `blog-post-agent` · `search-agent` · `auth-agent` ·
`submit-listing-agent` · `dashboard-agent` · `static-pages-agent`.
Each writes `docs/pages/<template>.md` using the Section 6 template.

### Wave C — Design & data (parallel)
| Agent | Scope | Writes to |
|---|---|---|
| `design-system-agent` | Recurring UI patterns → component inventory, spacing scale, type scale, breakpoints, tokens | `docs/design-system.md` |
| `data-model-agent` | Every data field visible anywhere → entities, relationships, enums, indexes | `docs/data-model.md` |
| `flows-agent` | End-to-end journeys: search→filter→detail→contact, submit-listing, register→verify→dashboard, review submission | `docs/user-flows.md` |
| `states-agent` | Loading / empty / zero-result / error / validation / success states per template | `docs/ui-states.md` |

### Wave D — Implementation (partitioned by file ownership)
Shared components are built **first**, by a single agent, before feature agents start.

| Agent | Scope |
|---|---|
| `foundation-agent` | Repo setup, config, tokens, layout shell, header, footer, providers — runs ALONE, first |
| `component-agent` | Shared component library — runs ALONE, second |
| `db-agent` | Schema, migrations, seed script (min. 60 listings, 12 categories, 15 locations, 10 blog posts) |
| `listings-agent` | Listings index, filters, sorting, pagination, listing detail |
| `taxonomy-agent` | Category pages, location pages |
| `content-agent` | Blog index, blog post, static/legal pages |
| `auth-agent-impl` | Auth screens, session handling, protected routes, dashboard |
| `submit-agent` | Add-listing flow, multi-step form, validation |
| `reviews-agent` | Reviews list, submission, ratings aggregation |
| `search-agent-impl` | Search UI + query handling + result states |
| `geo-agent` | Location hierarchy, PostGIS geo search, "near me", distance display, map |
| `admin-core-agent` | Admin shell, auth/roles/RLS, dashboard, audit log, media library |
| `admin-content-agent` | Page & section content control, menu builder, footer builder, settings, SEO manager |
| `admin-data-agent` | Listings/categories/locations/reviews/users/blog moderation and CRUD |

### Wave E — QA (parallel)
`desktop-qa-agent` → `docs/qa/desktop-qa.md` · `mobile-qa-agent` (375/390/768px) → `docs/qa/mobile-qa.md` ·
`flow-qa-agent` → `docs/qa/flow-qa.md` · `seo-qa-agent` → `docs/qa/seo-qa.md` ·
`a11y-perf-agent` → `docs/qa/a11y-perf.md` · `geo-qa-agent` → `docs/qa/geo-qa.md` ·
`admin-qa-agent` → `docs/qa/admin-qa.md` · `privacy-qa-agent` → `docs/qa/privacy-qa.md`

QA agents **must not fix** — they only report. Fixes are a follow-up wave.

---

## 4. PHASE 0 — SETUP

1. Create `docs/`, `docs/pages/`, `docs/qa/`.
2. Create `docs/PROGRESS.md` with every phase and every Section 14 criterion as unchecked boxes. **Update after every phase.**
3. Create `docs/OPEN-QUESTIONS.md`.
4. Initialise with the locked stack: App Router + TypeScript strict + Tailwind + ESLint, then Framer Motion, Prettier, path aliases, `next/font`, `.env.example`.
5. Record database / auth / storage decisions in `docs/OPEN-QUESTIONS.md` and `docs/DEPLOYMENT.md`, with the Hostinger runtime question answered.
6. Confirm `npm run build`, `npm run lint`, and `tsc --noEmit` all pass on the empty scaffold.

**Exit criteria:** scaffold builds clean; no forbidden dependency; `docs/PROGRESS.md` populated.

---

## 5. PHASE 1 — FULL WEBSITE CRAWL

Dispatch Wave A. Discover routes from **all** of: `sitemap.xml` (and nested sitemaps) · `robots.txt` ·
primary navigation · dropdowns · mobile menu · footer (every column, every link) · breadcrumbs ·
all internal links · category/location/listing/blog links · pagination (page 1, 2, 3, last) ·
filter and sort URLs · search result URLs · CTA buttons · form actions · auth links · related-content modules.

**Rules:** follow pagination to the end (or a documented sample cap ≥ 5 pages). Do not assume two pages
sharing a URL pattern share a layout — verify. Record every inaccessible URL and why.

**`docs/route-inventory.md` columns:**
`Route | Page Type | URL Pattern | Parent | Purpose | Key Components | Data Required | SEO Importance | Responsive Notes | Status`

**Exit criteria:** inventory complete; every route assigned to a template; nothing marked "unknown".

---

## 6. PHASE 2 — PER-TEMPLATE DEEP ANALYSIS

Dispatch Wave B. Each agent performs 16 steps for its template: open the page (**minimum 5 examples**
for dynamic routes) · desktop layout · mobile layout · major components · interactions · navigation ·
CTAs · forms · data displayed and its source · header/footer differences · breadcrumbs · SEO structure ·
responsive behaviour · reusable components · page-specific components · write the file.

### Page Analysis Template (`docs/pages/<template>.md`)
```markdown
# Template: <name>
## Routes covered
## Examples inspected (URLs)
## Section order — desktop (top to bottom)
## Section order — mobile (if it differs)
## Components used  (reusable / page-specific)
## Data fields displayed  → maps to entity.field
## Variations observed across examples
## Interactions
## Forms & validation rules
## States: loading / empty / zero-result / error / success
## SEO: title pattern, meta pattern, headings, JSON-LD type
## Breadcrumb pattern
## Internal links out
## Responsive notes (375 / 768 / 1024 / 1440)
## Open questions
```

### Dynamic-page variation requirement
For listing detail pages, inspect examples differing in: name length · category · location ·
image count (0, 1, many) · rating present/absent · review count (0, few, many) · opening-hours structure
(standard, 24h, closed days, missing) · description length · contact completeness · social links ·
optional metadata. **The UI must handle every one of these gracefully.**

---

## 7. PHASE 3 — DATA MODEL

Derive the schema from what the pages actually display. Deliver in `docs/data-model.md`: entities,
fields with types and nullability, relationships, enums, slug strategy, indexes, and a field-level
mapping of which page renders which field.

Expected entities (verify against reality): `listings`, `categories`, `subcategories`, `countries`,
`regions`, `cities`, `areas`, `reviews`, `users`, `roles`, `listing_images`, `opening_hours`,
`amenities/attributes`, `favourites`, `blog_posts`, `blog_categories`, `contact_submissions`, `claims`,
plus the CMS content model from 9.5.2.

The schema must satisfy **7.5** and **9.5.2** in the same migration set.

Then implement: migrations, RLS policies, and a **seed script with realistic synthetic data** covering
all Phase 2 variations — including deliberately incomplete records (no images, no reviews, no hours).

---

## 7.5 PHASE 3B — BUSINESS PROFILE, LOCATION & GEO SYSTEM

### 7.5.1 Business profile fields
Business name · logo · description · primary contact number · secondary contact number · email ·
website · street address · country · region/state · city · area/locality · postal code · latitude ·
longitude · opening hours · category · subcategory · business owner · verification status.

**Business name visible on:** listing cards, search results, listing detail, category pages,
location pages, related businesses, saved/favourite listings.
**Primary contact number** renders as a click-to-call link (`tel:+XXXXXXXXXXX`), prominent on mobile.

### 7.5.2 Ownership & audit fields (internal only)
`owner_user_id` · `created_by` · `created_at` · `updated_at` · `last_updated_by` · `listing_status` ·
`verification_status`. The owner dashboard shows submissions, status, dates, edit history.
**None of these may appear in public responses.**

### 7.5.3 Location hierarchy
`countries` → `regions` → `cities` → `areas`, plus free-text `address`. Listings reference
`country_id`, `region_id`, `city_id`, `area_id`, and store `latitude` + `longitude`.
Geocode addresses on submission and admin edit. Index all foreign keys; spatial index on coordinates.

### 7.5.4 Geo search — server-side only
Enable **PostGIS**. Implement radius queries as Postgres functions/RPC using a geographic index.
**Never load all businesses into the browser to compute distance client-side.**

### 7.5.5 User location & "near me"
Users can select country/city/area, type a location, search by location, or use device location
**only after explicitly granting permission**. Never request geolocation on page load. If no location
is set, show a clear location-selection affordance.

Distances displayed as real values from actual coordinates (`0.8 km away`). **Never fabricate a distance.**
If coordinates are missing on either side, show no distance.

Sort options: **Nearest · Newest · Highest Rated · A–Z.**
Discovery surfaces: "Businesses Near You" · "Explore Local Businesses" · "Find Businesses Near [City]" ·
"Top Businesses Near [Area], [City]".

### 7.5.6 Combined query support
Keyword **+** category **+** location together, with search query, category, city, area, distance,
rating, sorting and pagination all reflected in the URL.

### 7.5.7 Location SEO pages
Indexable routes such as `/city/lahore`, and category+location combinations such as `/city/lahore/dentists`.
**Do not mass-generate thin pages.** Only render an indexable combination where there is genuine business
density; below that threshold return `noindex` or route to the parent. Document the threshold in `docs/seo-spec.md`.

Every indexable location page needs: unique title, unique meta description, H1, location description,
business listings, relevant categories, internal links, breadcrumbs, structured data.

### 7.5.8 Structured data
`LocalBusiness`, `Organization`, `PostalAddress`, `GeoCoordinates`, `OpeningHoursSpecification`,
`AggregateRating`, `Review` — **only where the data is real and visible on the page.**

### 7.5.9 Map section
When coordinates exist, a responsive map with a marker, the address, and a directions action.
The textual address is **always** shown. On mobile the map must not dominate.

### 7.5.10 Privacy rules
Never publicly expose a user's precise location, private account addresses, device coordinates, or
private profile details. Discovery location is a **search input**, not public profile data. For
businesses, display only the address the owner submitted for public listing. Enforce at the RLS/query
layer, not just in the UI.

---

## 8. PHASE 4 — DESIGN SYSTEM

Build reusable components for every recurring pattern, minimum: Header · Footer · Mobile menu ·
Search bar · Listing card · Category card · Location card · Blog card · Breadcrumb · Rating/stars ·
Pagination · Filter panel · Sort control · CTA section · Review list + form · Opening hours table ·
Contact info block · Image gallery/lightbox · Related listings · Badge/tag · Empty state · Error state ·
Skeleton loaders · Form primitives · Toast/alert · Modal · Tabs · Map embed.

**Rule:** never hand-code the same visual pattern twice. If it appears twice, it's a component.

Define tokens in the Tailwind config: colour scale, type scale, spacing scale, radii, shadows,
container widths, breakpoints. Brand identity applies here — but structural proportions (container
width, card ratios, section rhythm) track the reference. No inline style objects, no CSS-in-JS.

### Motion (Framer Motion)
Document in `docs/motion-spec.md`: hero/section entrance reveals, scroll-triggered fades, card hover
lifts, stagger on grids, mobile menu open/close, modal and drawer transitions, page transitions,
skeleton→content swaps. Implement with **shared variants and a shared easing/duration token set** —
not one-off `animate` props. Respect `prefers-reduced-motion`. Keep motion off the critical rendering path.

---

## 9. PHASE 5 — IMPLEMENT EVERY PAGE

For every template, implement the real page with real data from the database. Each reference template
maps 1:1 to a new equivalent with the same structural hierarchy.

**Also implement, without exception:** search · filters · sorting · pagination · all forms ·
authentication · listing submission · reviews · opening hours · related listings · breadcrumbs ·
internal linking · SEO pages · 404 · 500.

Mark each route `Done` in `docs/route-inventory.md` only when it renders real data at both desktop and
mobile widths.

---

## 9.5 PHASE 5B — ADMIN PANEL (FULL SITE CONTROL)

**The entire public website must be controllable from the admin panel.**

### 9.5.1 The governing rule — NO HARDCODED CONTENT
No user-visible string, heading, subheading, button label, image, icon choice, link, or section
ordering may be hardcoded in a component. Components receive content as props. A component containing
a literal marketing string is a **defect**. Ship a seeded default for every field — but the seed is a
database row, not a hardcoded fallback in JSX.

### 9.5.2 Content model
```
pages              id, slug, route_pattern, page_type, title, is_published, is_system
page_sections      id, page_id, section_key, section_type, sort_order, is_enabled,
                   heading, subheading, body, image_id, cta_label, cta_url,
                   background_variant, item_limit, settings (jsonb)
section_items      id, section_id, sort_order, ref_type, ref_id, title, body, image_id, url
settings           key, value (jsonb), group
menus              id, location (header|footer|mobile), name
menu_items         id, menu_id, parent_id, label, url, sort_order, is_external, icon, is_visible
media              id, path, alt, width, height, size, uploaded_by, folder
seo_meta           id, route_or_page_id, title, description, og_image_id, canonical,
                   robots, schema_overrides (jsonb)
redirects          id, source, destination, status_code, hits
form_submissions   id, form_type, payload (jsonb), status, handled_by, created_at
audit_logs         id, actor_id, action, entity_type, entity_id, before, after, created_at
```
`section_type` is an enum of block types actually found on the reference site during Phase 2 — e.g.
`hero_search`, `featured_categories`, `featured_listings`, `stats_band`, `how_it_works`, `popular_cities`,
`cta_banner`, `testimonials`, `latest_blog`, `rich_text`, `faq`, `image_text`, `logo_strip`.
**Derive this list from `docs/page-templates.md`, do not invent it.**

### 9.5.3 Per-section admin controls (minimum)
enable/disable · reorder (drag) · edit heading · edit subheading · edit body · replace image ·
set CTA label · set CTA URL · choose background/variant · set item limit · choose which items appear
(manual pick or automatic rule) · preview before publish.

### 9.5.4 Required admin modules
**Dashboard** — counts by status, pending approvals, new reviews, new users, recent submissions, recent audit entries.
**Listings** — full CRUD; approve/reject/suspend; verification; featured flag; image upload and reorder;
opening hours editor; category assignment; full location assignment with map pin and geocode; contact
fields; owner reassignment; bulk actions; CSV import/export; search and filter by every field.
**Categories & subcategories** — CRUD, parent/child, icon, description, sort order, featured, slug, SEO fields.
**Locations** — CRUD for countries/regions/cities/areas; coordinates; slug; featured; per-location page
content and SEO fields.
**Reviews** — moderation queue, approve/reject, flag handling, reply as owner or admin, rating recalculation.
**Users & roles** — list, search, role assignment, suspend, view owned listings, resend verification.
Roles: `super_admin`, `admin`, `editor`, `moderator`, `business_owner`, `user`, with a documented
permission matrix and RLS policies matching it exactly.
**Blog / content** — post CRUD, rich text editor, cover image, categories/tags, author, publish/schedule, SEO.
**Pages & sections** — the page builder from 9.5.2–9.5.3, covering **every** public template.
**Navigation** — header menu builder, mobile menu, footer builder, drag-orderable with nesting.
**Global settings** — brand name, logo (light/dark), favicon, brand colours, typography, default OG image,
contact email, phone, WhatsApp, address, social links, footer copyright, currency/locale, default map
centre, maintenance mode, feature toggles.
**SEO manager** — per-route title/meta/canonical/robots/OG image; sitemap toggles; JSON-LD toggles;
the location-page indexing threshold from 7.5.7.
**Media library** — upload to Supabase Storage, alt text, folders, search, replace, usage references,
delete protection when in use.
**Forms inbox** — contact submissions, claims, reports, review flags; status workflow; export.
**Announcements** — site-wide banner with copy, link, variant, date window.
**Redirects & 404 log** — create redirects, view most-hit 404s.
**Audit log** — who changed what, when, with before/after diffs. Every admin write produces an entry.

### 9.5.5 Admin UX
Separate `/admin` route group with its own layout, guarded by middleware and role checks. Sidebar nav.
Every list view has search, filters, sorting, pagination, bulk actions. Every form has inline validation,
unsaved-changes warning, optimistic feedback, and a toast. Destructive actions require confirmation.
"View on site" link from every editable entity, and a preview mode for unpublished content. Fully responsive.

### 9.5.6 Security
Enforce every permission at the database layer with RLS **and** at the route layer. Never trust a
client-supplied role. The service role key stays server-side only. Rate-limit admin auth. Attempt
privilege escalation as `business_owner` and anonymous, and record the results.

### 9.5.7 Note on a prior project
If a Mr-Medico admin spec is provided, match its module layout, naming, and permission model exactly.
**If no such spec has been provided, do not guess at it** — build to the specification above and list
assumptions in `docs/OPEN-QUESTIONS.md`.

---

## 10. PHASE 6 — QUERY, SEARCH, AND FORM STATES

**Pagination:** page 1 · 2 · 3 · last · out-of-range.
**Combinations:** search + category · search + location · category + pagination · location + pagination ·
sorting + pagination · filters + sorting · filters + pagination · all filters cleared.
**Search results:** normal · zero results · very many · partial match · category search · location search.
**Forms:** initial · focus · filled · validating · invalid (field-level messages) · loading (disabled +
spinner) · success · server failure · network failure.

URL state must be shareable — filters, sort, page and query live in the URL and survive refresh and back/forward.

---

## 11. PHASE 7 — RESPONSIVE QA

Every important page type checked at **375px, 390px, 768px, 1024px, 1440px**.
Verify: header · navigation · mobile menu (open/close, scroll lock) · cards · search · filters
(drawer/sheet) · sorting · forms · listing details · reviews · galleries · footer · tap targets ≥ 44px ·
spacing · typography · no horizontal overflow · no overlapping elements.

Mobile follows the **same information architecture and interaction logic** as the reference.

---

## 12. PHASE 8 — VISUAL COMPARISON PASS

For every major template, place the reference page and the implementation side by side and compare:
overall structure · container width · section order · spacing rhythm · card dimensions and aspect ratios ·
typography hierarchy · icon positioning · button placement · image ratios · navigation · footer ·
responsive behaviour.

Record each comparison in `docs/qa/desktop-qa.md`: template · reference URL · local URL · differences ·
intentional (brand) vs. defect · fix status. **Fix every unintentional discrepancy.** Repeat after fixing.

---

## 13. PHASE 9 — SEO, BUILD, DEPLOY

**SEO:** per-route metadata via the Metadata API — title, description, canonical, and **full Open Graph +
Twitter card coverage on every route**. Semantic headings with exactly one H1. JSON-LD (`LocalBusiness`,
`BreadcrumbList`, `ItemList`, `Article`, `Organization`, `WebSite`+`SearchAction`). Dynamic `sitemap.xml`
and `robots.txt` via route handlers. Clean slugs. `next/image` with correct `sizes`, alt text on every image.

**Performance:** Priority Hints — `priority` / `fetchPriority="high"` on the LCP image of every template;
`next/font` with `preload`; no render-blocking third-party scripts. HTTP/3 at the Cloudflare edge (verify
with `curl -I --http3`). Correct rendering strategy per route. Framer Motion kept out of the initial
payload where possible (`dynamic()` for heavy motion-only components).

**Gates — all must pass with zero errors:**
```
tsc --noEmit
npm run lint
npm run build
```

**Manual verification:** start the production build and open every critical route. Confirm real data,
no console errors, no hydration warnings, no broken links, no 404s from internal links.

**Deploy:** Hostinger origin behind Cloudflare. If credentials are available: build, deploy, run
migrations and seed, point Cloudflare at the origin, enable HTTP/3 and caching rules, re-verify every
critical route live. If credentials are not available, finish `docs/DEPLOYMENT.md` with exact steps,
runtime requirements, env vars, Cloudflare settings and cache rules — and say so explicitly instead of
claiming deployment is done.

---

## 14. FINAL ACCEPTANCE CRITERIA

Not complete until every one is true and checked off in `docs/PROGRESS.md`:

1. Entire public website crawled.
2. Complete route inventory created.
3. Every important page type identified.
4. Every important page type implemented.
5. Dynamic pages implemented.
6. Multiple examples of each dynamic page type tested.
7. Desktop layouts tested.
8. Mobile layouts tested.
9. Search implemented.
10. Filters implemented.
11. Sorting implemented.
12. Pagination implemented.
13. All forms implemented.
14. Authentication implemented.
15. Listing submission implemented.
16. Reviews implemented.
17. Opening hours implemented.
18. Blog/content pages implemented.
19. Category pages implemented.
20. Location pages implemented.
21. SEO pages and metadata implemented.
22. Header and footer consistent across all routes.
23. No major route missing.
24. No page is a placeholder.
25. No important user flow broken.
26. Production build passes.
27. TypeScript passes (strict, zero errors).
28. Lint passes (zero errors).
29. Critical routes manually verified.
30. Deployment verified, or `docs/DEPLOYMENT.md` written with a stated reason.
31. All copy and imagery original.
32. Seed data covers all documented listing variations, including sparse records.
33. Stack parity confirmed, no substituted or duplicate-purpose libraries.
34. No third-party analytics, tag manager, chat, consent, ads, or CMS added.
35. Open Graph and Twitter metadata present on every route.
36. Priority Hints applied to LCP images and critical fonts on every template.
37. Rendering strategy documented per route and matching the plan.
38. `prefers-reduced-motion` respected across all animations.
39. Hostinger runtime confirmed and Cloudflare/HTTP/3 configuration documented.
40. All business profile fields from 7.5.1 exist, are editable, and render where specified.
41. Click-to-call works and is prominent on mobile.
42. Location hierarchy implemented relationally with indexes.
43. PostGIS enabled; radius search server-side; no client-side distance computation.
44. Displayed distances verified against real coordinates.
45. Geolocation requested only on explicit user action.
46. Keyword + category + location combined search works, with all state in the URL.
47. Location and category+location SEO pages implemented, with a documented density threshold.
48. Structured data emitted only where the data is real and visible.
49. Map section responsive, with textual address always shown.
50. No private user data, precise coordinates, or internal fields exposed in any public payload.
51. Admin panel implemented with every module in 9.5.4.
52. Every page's every section editable from admin, and changes appear on the public site.
53. Zero hardcoded user-visible strings in components.
54. Role permission matrix documented and enforced by RLS **and** route guards.
55. Privilege-escalation attempts as business_owner and anonymous both fail, with results recorded.
56. Audit log records every admin write with before/after values.
57. Media library, SEO manager, menu builder, redirects, and forms inbox all functional.

---

## 15. REQUIRED WORKFLOW ORDER

```
CRAWL ENTIRE WEBSITE
→ DISCOVER ALL ROUTES
→ IDENTIFY ALL PAGE TYPES
→ INSPECT ALL UI/UX PATTERNS
→ MAP DATA REQUIREMENTS
→ DESIGN DATABASE (+ LOCATION HIERARCHY + POSTGIS + CMS CONTENT MODEL)
→ BUILD COMPONENT SYSTEM
→ IMPLEMENT ALL PAGES (CONTENT-DRIVEN, NOTHING HARDCODED)
→ IMPLEMENT GEO / NEAR-ME DISCOVERY
→ IMPLEMENT ADMIN PANEL (FULL SITE CONTROL)
→ IMPLEMENT ALL FLOWS
→ TEST ALL STATES
→ RESPONSIVE QA
→ SEO QA
→ PRODUCTION BUILD
→ DEPLOY
→ VERIFY
```

---

## 16. REPORTING CADENCE

After each phase, post a short status: phase name · sub-agents dispatched · files written · counts
(routes found / templates found / pages implemented / issues open) · what's next. Then **continue
immediately**. Do not wait for approval between phases.

At the end, produce `docs/FINAL-REPORT.md`: every route with status, every acceptance criterion with
evidence, known gaps, and next steps.

---

## 17. KNOWN BLOCKERS CARRIED FORWARD

Read `docs/OPEN-QUESTIONS.md` first. As of Phase 0 these were open:

- **B-1** — `101toplistings.com` is denied by the network egress policy (403 on CONNECT via curl,
  WebFetch and headless Chromium alike; `example.com` is blocked too, so the environment runs a
  default-deny allowlist). Phases 1, 2 and 8 cannot run until the domain is allowlisted in the
  environment's network policy, or the site's HTML/screenshots are supplied directly.
  **Do not route around this** via archives, caches or search snippets.
- **B-2** — the nominated Supabase project was unreachable from the session's Supabase account.
  Confirm a project that the connected account can actually access before Phase 3.
- **D-1** — the Hostinger runtime question in `docs/DEPLOYMENT.md` is unanswered. It must be resolved
  before Phase 5, because static-only hosting makes SSR, auth, forms and the admin panel impossible.

**THE FINAL PRODUCT MUST FEEL LIKE A COMPLETE, INDEPENDENT PRODUCTION WEBSITE — NOT A DEMO, NOT A
HOMEPAGE MOCKUP, NOT A PARTIAL CLONE.**
