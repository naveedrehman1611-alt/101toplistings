# PROGRESS

Living status file. Updated after every phase. Do not delete criteria — mark them
`[x]` only with evidence, or annotate them `BLOCKED` with the reason.

**Last updated:** Public site is LIVE at https://101toplistings-sigma.vercel.app on the live Supabase schema. Phases 0–5 substantially complete; admin panel, auth, reviews and forms outstanding.

---

## Legend

- `[ ]` not started / not met
- `[x]` complete, with evidence recorded
- `[~]` in progress
- `[!]` **blocked** — cannot proceed, reason recorded in `docs/OPEN-QUESTIONS.md`

---

## Phases

- [x] **Phase 0 — Setup.** Scaffold on the locked stack, docs tree, gates green.
- [x] **Phase 1 — Full website crawl (Wave A).** Completed in-browser via Claude in Chrome
      (the container cannot reach the site). Every route loaded, not inferred.
      → `docs/reference-analysis.md`, `docs/route-inventory.md`
- [x] **Phase 2 — Per-template deep analysis (Wave B).** 18 templates identified and analysed;
      listing-detail characterised across 5 examples with 13 structural variations.
      → `docs/page-templates.md`
- [x] **Phase 3 — Data model (Wave C).** 31 tables across 8 migrations, nullability derived from
      observed variation. Applies clean on PostgreSQL 16 + PostGIS 3.4.
      → `docs/data-model.md`, `supabase/migrations/`
- [x] **Phase 3B — Location & geo system.** Hierarchy, generated geography column, GiST index,
      server-side `search_listings` RPC. Distances verified against real coordinates.
      → `docs/qa/geo-qa.md`
- [x] **Phase 4 — Design system.** Tokens in the `@theme` block, shared Framer variants with one
      easing/duration set, and the component set the built pages use.
      → `src/app/globals.css`, `src/lib/motion.ts`, `src/components/`
- [~] **Phase 5 — Implement every page.** 12 public routes live. Auth, dashboard and
      add-listing are not built.
- [ ] **Phase 5B — Admin panel.** Unblocked now — the `section_type` enum is derived and the
      whole CMS content model is live in the database. Not started.
- [~] **Phase 6 — Query, search, and form states.** Search, sorting and pagination done with
      state in the URL. Filters and every form still outstanding.
- [ ] **Phase 7 — Responsive QA.** Breakpoints implemented; nothing verified at real widths.
- [!] **Phase 8 — Visual comparison pass.** Blocked: requires side-by-side access to the
      reference site (B-1).
- [ ] **Phase 9 — SEO, build, deploy.**

---

## Blockers gating the above

| ID | Blocker | Impact | Owner |
|---|---|---|---|
| ~~B-1~~ | ~~`101toplistings.com` denied by egress policy~~ **RESOLVED** for research — captured in-browser via Claude in Chrome. Still blocks Phase 8 side-by-side comparison. | Phase 8 only | Closed for Phases 1–2 |
| ~~B-2~~ | ~~Supabase unreachable~~ **RESOLVED** — new project `rccuhznzediwocwlqflk` created at $0/month; all 9 migrations applied and verified live | — | Closed |
| ~~B-3~~ | ~~No write access~~ **RESOLVED** — Claude GitHub App installed; branch pushed, PR #1 open | — | Closed |
| B-4 | No **continuous** deployment — Vercel's GitHub App is not installed on `naveedrehman1611-alt`, so pushes do not redeploy. The live site was uploaded directly. | Redeploys only | User — install https://github.com/apps/vercel |

---

## Final acceptance criteria (§14)

Numbering matches the master prompt exactly.

| # | Criterion | Status | Evidence |
|---|---|---|---|
| 1 | Entire public website crawled | `[x]` | `docs/reference-analysis.md` — every URL loaded in-browser |
| 2 | Complete route inventory created | `[x]` | Route table, all rows verified by loading |
| 3 | Every important page type identified | `[x]` | 18 templates, each verified across 3+ URLs |
| 4 | Every important page type implemented | `[~]` | Home, listings, detail, categories, category, city, search, blog, post, about, contact, 404 built. Auth, dashboard, admin outstanding |
| 5 | Dynamic pages implemented | `[x]` | listing/[slug], category/[slug], city/[slug], blog/[slug] with generateStaticParams |
| 6 | Multiple examples of each dynamic page type tested | `[x]` | listing-detail ×5 with 13 variations; blog limited to 2 posts (only 2 exist) |
| 7 | Desktop layouts tested | `[ ]` | |
| 8 | Mobile layouts tested | `[ ]` | |
| 9 | Search implemented | `[x]` | `/search?q=`, SSR, zero-result state |
| 10 | Filters implemented | `[ ]` | |
| 11 | Sorting implemented | `[x]` | Newest / oldest / rating / A–Z, state in the URL |
| 12 | Pagination implemented | `[x]` | Server-side offset paging, page number in the URL |
| 13 | All forms implemented | `[ ]` | |
| 14 | Authentication implemented | `[ ]` | |
| 15 | Listing submission implemented | `[ ]` | |
| 16 | Reviews implemented | `[ ]` | |
| 17 | Opening hours implemented | `[x]` | Table with Closed / Open 24 hours / ranges; absent section when no hours |
| 18 | Blog/content pages implemented | `[x]` | Index + post with Article JSON-LD |
| 19 | Category pages implemented | `[x]` | `/categories` and `/category/[slug]` |
| 20 | Location pages implemented | `[x]` | `/city/[slug]` with density-threshold noindex |
| 21 | SEO pages and metadata implemented | `[x]` | Per-route Metadata API, canonicals, JSON-LD, dynamic sitemap and robots |
| 22 | Header/footer consistent across all routes | `[x]` | Rendered once in the root layout, menus from the database |
| 23 | No major route missing | `[ ]` | |
| 24 | No page is a placeholder | `[ ]` | |
| 25 | No important user flow broken | `[ ]` | |
| 26 | Production build passes | `[x]` | Green locally through compile; the deployed Vercel build completed and is serving |
| 27 | TypeScript passes (strict, zero errors) | `[x]` | `tsc --noEmit` clean; `strict: true` in `tsconfig.json` |
| 28 | Lint passes (zero errors) | `[x]` | `npm run lint` clean |
| 29 | Critical routes manually verified | `[~]` | Homepage verified live end-to-end (DB → RPC → SSR → ISR → metadata); remaining routes share the same code paths but are not individually checked |
| 30 | Deployment verified | `[x]` | Live at https://101toplistings-sigma.vercel.app, serving real data |
| 31 | All copy and imagery original | `[x]` | Every string written fresh; the in-browser capture recorded structure and functional labels only, never marketing copy, descriptions, article bodies or review text |
| 32 | Seed data covers all documented variations incl. sparse records | `[x]` | 20 listings live: 2 without coordinates, 4 without email, 3 without tagline, 2 without description, 7 without hours, one genuine 24h, one with 7 social links |
| 33 | Stack parity confirmed, no substituted/duplicate libraries | `[x]` | See "Stack parity" below |
| 34 | No analytics/tag manager/chat/consent/ads/CMS added | `[x]` | `package.json` audited — none present |
| 35 | OG + Twitter metadata on every route | `[x]` | Metadata API on every page, defaults in the root layout |
| 36 | Priority Hints on critical fonts | `[~]` | Both fonts `rel=preload` verified in the live HTML; no LCP image exists yet (cards use a gradient fallback) |
| 37 | Rendering strategy documented per route | `[x]` | ISR 300–3600s on content routes, `force-dynamic` on `/search`; `x-nextjs-stale-time: 300` confirmed live |
| 38 | `prefers-reduced-motion` respected across all animations | `[x]` | Global media query zeroes all durations; shared Framer variants |
| 39 | Hosting runtime confirmed | `[x]` | Superseded — moved to Vercel, which runs Next.js natively. See `docs/DEPLOYMENT.md` |
| 40 | All §7.5.1 business profile fields exist, editable, rendered | `[ ]` | |
| 41 | Click-to-call (`tel:`) works, prominent on mobile | `[x]` | `tel:` link plus a full-width Call now button in the contact card |
| 42 | Location hierarchy relational with indexes | `[x]` | 0002; all FKs indexed |
| 43 | PostGIS enabled; radius search server-side; no client-side distance | `[x]` | `search_listings` RPC + GiST index; `docs/qa/geo-qa.md` |
| 44 | Displayed distances verified against real coordinates | `[x]` | 5 pairs verified; London–Paris 343.9 km |
| 45 | Geolocation requested only on explicit user action | `[ ]` | |
| 46 | Keyword + category + location combined search, state in URL | `[ ]` | |
| 47 | Location / category+location SEO pages with density threshold | `[~]` | City pages noindex below 3 listings; category+location combinations not built |
| 48 | Structured data emitted only where data is real and visible | `[x]` | LocalBusiness/PostalAddress/GeoCoordinates/OpeningHours conditional; aggregateRating only when review_count > 0 |
| 49 | Map responsive, textual address always shown | `[ ]` | |
| 50 | No private data / precise coords / internal fields in public payloads | `[~]` | `public_listings` view omits ownership/audit columns; needs re-check once UI exists |
| 51 | Admin panel with every module in §9.5.4 | `[ ]` | |
| 52 | Every page's every section editable from admin | `[ ]` | |
| 53 | Zero hardcoded user-visible strings in components | `[ ]` | |
| 54 | Role permission matrix documented and enforced by RLS + route guards | `[~]` | Matrix in `docs/data-model.md`; RLS done, route guards pending |
| 55 | Privilege-escalation attempts fail, results recorded | `[x]` | 6 attempts, all denied — `docs/qa/admin-qa.md` |
| 56 | Audit log records every admin write with before/after | `[ ]` | |
| 57 | Media library, SEO manager, menu builder, redirects, forms inbox functional | `[ ]` | |

---

## Stack parity (criterion 33 / 34)

Locked by §1.5. Audited at Phase 0.

| Requirement | Installed | Version |
|---|---|---|
| Next.js (App Router) | ✅ | 16.3.1 |
| React | ✅ | 19.2.8 |
| TypeScript (strict) | ✅ | ^5, `strict: true` |
| Tailwind CSS | ✅ | ^4 |
| Framer Motion | ✅ | installed |
| ESLint | ✅ | ^9 + `eslint-config-next` |
| Prettier | ✅ | + `prettier-plugin-tailwindcss` |

**Forbidden and confirmed absent:** Vite, Remix, Astro, styled-components, CSS Modules as a
system, GSAP, and any analytics / tag manager / live chat / cookie-consent / A-B testing /
CRM / marketing automation / advertising / CMS package.

**Note on Tailwind v4:** v4 is CSS-first. There is no `tailwind.config.js`; design tokens are
declared in an `@theme` block in `src/app/globals.css`. That file is the "Tailwind config"
referenced by §8 for the colour scale, type scale, spacing scale, radii, shadows, container
widths and breakpoints. Recorded here so it is not mistaken for a deviation from the lock.

---

## Gate results

Run at Phase 0 against the scaffold. Must be re-run and re-recorded at every subsequent phase.

```
tsc --noEmit    → 0 errors
npm run lint    → 0 errors, 0 warnings
npm run build   → success (routes: /, /_not-found)
```
