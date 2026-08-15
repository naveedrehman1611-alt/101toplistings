# PROGRESS

Living status file. Updated after every phase. Do not delete criteria — mark them
`[x]` only with evidence, or annotate them `BLOCKED` with the reason.

**Last updated:** Phase 0 complete.

---

## Legend

- `[ ]` not started / not met
- `[x]` complete, with evidence recorded
- `[~]` in progress
- `[!]` **blocked** — cannot proceed, reason recorded in `docs/OPEN-QUESTIONS.md`

---

## Phases

- [x] **Phase 0 — Setup.** Scaffold on the locked stack, docs tree, gates green.
- [!] **Phase 1 — Full website crawl (Wave A).** Blocked: reference site unreachable (B-1).
- [!] **Phase 2 — Per-template deep analysis (Wave B).** Blocked by Phase 1.
- [!] **Phase 3 — Data model (Wave C).** Blocked by Phase 2 — schema must be derived from
      fields the reference pages actually display, not invented.
- [!] **Phase 3B — Location & geo system.** Partially specifiable from §7.5 (self-contained),
      but listing fields must be reconciled against Phase 2 findings. Also blocked on
      database access (B-2).
- [!] **Phase 4 — Design system.** Component inventory must come from observed recurring
      patterns (§8). Token/brand work is unblocked; inventory is not.
- [!] **Phase 5 — Implement every page.** Blocked by Phases 1–4.
- [!] **Phase 5B — Admin panel.** Spec is self-contained in §9.5, but `section_type` enum must
      be derived from `docs/page-templates.md` (§9.5.2), which is blocked. Also blocked on B-2.
- [ ] **Phase 6 — Query, search, and form states.**
- [ ] **Phase 7 — Responsive QA.**
- [!] **Phase 8 — Visual comparison pass.** Blocked: requires side-by-side access to the
      reference site (B-1).
- [ ] **Phase 9 — SEO, build, deploy.**

---

## Blockers gating the above

| ID | Blocker | Impact | Owner |
|---|---|---|---|
| B-1 | `101toplistings.com` denied by network egress policy (403 on CONNECT, both `curl` and `WebFetch`) | Phases 1, 2, 8; criteria 1, 2, 6 | User — allowlist domain in environment network policy |
| B-2 | Supabase project `cwnqvngpjxvodbvdhpzf` returns `You do not have permission to perform this action` | Phases 3, 3B, 5B; all DB/RLS/PostGIS criteria | User — connect the owning Supabase account, or nominate an accessible project |
| B-3 | No write access to `naveedrehman1611-alt/101toplistings` — push returns 403 on every path; session identity is `mohammedrehman33` | **All phases** — no work can be delivered to the remote | User — grant write access or authorise the GitHub App |

---

## Final acceptance criteria (§14)

Numbering matches the master prompt exactly.

| # | Criterion | Status | Evidence |
|---|---|---|---|
| 1 | Entire public website crawled | `[!]` | Blocked by B-1 |
| 2 | Complete route inventory created | `[!]` | Blocked by B-1 |
| 3 | Every important page type identified | `[!]` | Blocked by B-1 |
| 4 | Every important page type implemented | `[ ]` | |
| 5 | Dynamic pages implemented | `[ ]` | |
| 6 | Multiple examples of each dynamic page type tested | `[!]` | Blocked by B-1 |
| 7 | Desktop layouts tested | `[ ]` | |
| 8 | Mobile layouts tested | `[ ]` | |
| 9 | Search implemented | `[ ]` | |
| 10 | Filters implemented | `[ ]` | |
| 11 | Sorting implemented | `[ ]` | |
| 12 | Pagination implemented | `[ ]` | |
| 13 | All forms implemented | `[ ]` | |
| 14 | Authentication implemented | `[ ]` | |
| 15 | Listing submission implemented | `[ ]` | |
| 16 | Reviews implemented | `[ ]` | |
| 17 | Opening hours implemented | `[ ]` | |
| 18 | Blog/content pages implemented | `[ ]` | |
| 19 | Category pages implemented | `[ ]` | |
| 20 | Location pages implemented | `[ ]` | |
| 21 | SEO pages and metadata implemented | `[ ]` | |
| 22 | Header/footer consistent across all routes | `[ ]` | |
| 23 | No major route missing | `[ ]` | |
| 24 | No page is a placeholder | `[ ]` | |
| 25 | No important user flow broken | `[ ]` | |
| 26 | Production build passes | `[x]` | `npm run build` green on scaffold; must re-verify at each phase |
| 27 | TypeScript passes (strict, zero errors) | `[x]` | `tsc --noEmit` clean; `strict: true` in `tsconfig.json` |
| 28 | Lint passes (zero errors) | `[x]` | `npm run lint` clean |
| 29 | Critical routes manually verified | `[ ]` | |
| 30 | Deployment verified, or `DEPLOYMENT.md` written with reason | `[~]` | `docs/DEPLOYMENT.md` drafted; runtime question open (see D-1) |
| 31 | All copy and imagery original | `[~]` | Guardrail active; nothing copied to date (nothing fetched — B-1) |
| 32 | Seed data covers all documented variations incl. sparse records | `[ ]` | |
| 33 | Stack parity confirmed, no substituted/duplicate libraries | `[x]` | See "Stack parity" below |
| 34 | No analytics/tag manager/chat/consent/ads/CMS added | `[x]` | `package.json` audited — none present |
| 35 | OG + Twitter metadata on every route | `[ ]` | |
| 36 | Priority Hints on LCP images and critical fonts | `[ ]` | |
| 37 | Rendering strategy documented per route | `[ ]` | |
| 38 | `prefers-reduced-motion` respected across all animations | `[ ]` | |
| 39 | Hostinger runtime confirmed, Cloudflare/HTTP/3 documented | `[!]` | Open question D-1 in `docs/DEPLOYMENT.md` |
| 40 | All §7.5.1 business profile fields exist, editable, rendered | `[ ]` | |
| 41 | Click-to-call (`tel:`) works, prominent on mobile | `[ ]` | |
| 42 | Location hierarchy relational with indexes | `[ ]` | |
| 43 | PostGIS enabled; radius search server-side; no client-side distance | `[ ]` | |
| 44 | Displayed distances verified against real coordinates | `[ ]` | |
| 45 | Geolocation requested only on explicit user action | `[ ]` | |
| 46 | Keyword + category + location combined search, state in URL | `[ ]` | |
| 47 | Location / category+location SEO pages with density threshold | `[ ]` | |
| 48 | Structured data emitted only where data is real and visible | `[ ]` | |
| 49 | Map responsive, textual address always shown | `[ ]` | |
| 50 | No private data / precise coords / internal fields in public payloads | `[ ]` | |
| 51 | Admin panel with every module in §9.5.4 | `[ ]` | |
| 52 | Every page's every section editable from admin | `[ ]` | |
| 53 | Zero hardcoded user-visible strings in components | `[ ]` | |
| 54 | Role permission matrix documented and enforced by RLS + route guards | `[ ]` | |
| 55 | Privilege-escalation attempts fail, results recorded | `[ ]` | |
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
