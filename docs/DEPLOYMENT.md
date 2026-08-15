# DEPLOYMENT

Target architecture, per §1.5 CONFIG: **Hostinger origin behind Cloudflare**, matching the
reference site's own hosting profile, with HTTP/3 enabled at the edge.

**Status:** not deployed. No Hostinger credentials are present in this environment, and the
runtime question below (D-1) is unanswered. §13 permits exactly this outcome provided the
document states it plainly rather than claiming deployment is done — so, plainly: **nothing has
been deployed.**

---

## D-1 — OPEN QUESTION: which Hostinger runtime? (blocks Phase 5)

§1.5 requires this be answered *before* implementation begins, not after, because the answer
changes the architecture rather than just the deploy script.

Hostinger sells several products, and only some run a Next.js server:

| Hostinger product | Node process? | Verdict |
|---|---|---|
| VPS Hosting | Yes — full root, run any Node version | ✅ Works. Preferred. |
| Cloud Hosting (Node.js app support) | Yes, managed | ✅ Works, if the Node version is current enough for Next.js 16 |
| Premium/Business shared hosting | Sometimes, via a Node.js selector in hPanel | ⚠️ Verify before committing — resource limits often make Next.js SSR impractical |
| Static / website-builder plans | No | ❌ **Fatal** — see below |

**If only static hosting is available**, this must be flagged loudly and the plan changed,
because these become impossible:

- Server-side rendering for search and authenticated routes (§1.5 rendering table)
- ISR revalidation for listing/category/location/blog pages
- Supabase Auth session handling and route guards (§9.5.5)
- Server Actions / Route Handlers — so every form breaks: contact, add-listing, reviews,
  claims, and the entire admin panel
- Server-side PostGIS radius queries (§7.5.4), which are explicitly required to run server-side
- Keeping the service role key off the client (§1.5) — there would be no server to hold it

That is not a degraded version of the product; it is a different product. The resolution is
either a Hostinger plan that runs Node, or a change of host — **your call, not mine to make
silently.**

**Answer needed:** which plan is on the account, and what Node version does it offer?

---

## Runtime requirements

- **Node.js ≥ 20.9** (Next.js 16 minimum). Local toolchain here is Node 22.22.2 — match it in
  production to avoid drift.
- Build: `npm ci && npm run build`
- Start: `npm run start` (defaults to port 3000; set `PORT` if the host assigns one)
- Keep the process alive with PM2 or a systemd unit; enable restart-on-boot.
- Reverse-proxy 80/443 → the Node port (nginx or Hostinger's built-in proxy).

---

## Environment variables

Never commit real values. `.env.example` in the repo root is the tracked template.

| Variable | Scope | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | client + server | Project URL. Safe to expose. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client + server | Anon/publishable key. Safe to expose — RLS is what protects the data. |
| `SUPABASE_SERVICE_ROLE_KEY` | **server only** | Bypasses RLS entirely. Must never reach the client bundle, never be prefixed `NEXT_PUBLIC_`, and never be imported into a Client Component. |
| `NEXT_PUBLIC_SITE_URL` | client + server | Canonical origin; used for canonicals, OG URLs, sitemap. |

Guard rule for review: any `SUPABASE_SERVICE_ROLE_KEY` reference must sit in a Server
Component, Route Handler, or Server Action — enforced by inspection in Wave E, since a leak here
exposes every table regardless of RLS.

---

## Cloudflare configuration

DNS proxied ("orange cloud") to the Hostinger origin.

- **SSL/TLS mode:** Full (strict). Requires a valid origin certificate — use a Cloudflare
  Origin CA cert on the Hostinger box.
- **HTTP/3 (QUIC):** enable in Network settings. Required by §1.5.
  Verify: `curl -I --http3 https://<domain>` — expect `HTTP/3 200`, or confirm in the
  Cloudflare dashboard. Also check `alt-svc: h3=":443"` on the response headers.
- **Always Use HTTPS:** on. **Automatic HTTPS Rewrites:** on. **Brotli:** on.
- **Minification:** leave off. Next.js already minifies; Cloudflare's HTML minifier can break
  hydration.

### Caching rules

Next.js sets correct `Cache-Control` headers per route. The safe default is to respect origin
headers and add targeted rules rather than a blanket cache-everything, which would serve one
user's authenticated HTML to another.

| Path | Rule |
|---|---|
| `/_next/static/*` | Cache everything, edge TTL 1 year (content-hashed, immutable) |
| `/_next/image*` | Cache everything, respect origin TTL |
| `/admin/*` | **Bypass cache** — authenticated, per-user |
| `/api/*`, `/auth/*` | **Bypass cache** |
| `/search*` | **Bypass cache** — query-dependent, SSR |
| everything else | Respect origin headers (lets ISR behave correctly) |

Never cache a response carrying a `Set-Cookie` for a Supabase session.

---

## Deployment sequence

Ordered so a schema change never lands after code that depends on it.

1. Answer D-1; provision a Node-capable plan.
2. Resolve blocker B-2 in `docs/OPEN-QUESTIONS.md` — a reachable Supabase project.
3. Apply migrations, enable PostGIS, apply RLS policies, run the seed.
4. Set environment variables on the origin.
5. `npm ci && npm run build` on the origin (or build in CI and ship the artifact).
6. Start under PM2/systemd; confirm the origin serves directly on its IP/port.
7. Point DNS at the origin; enable the Cloudflare proxy.
8. Enable HTTP/3; apply the caching rules above.
9. Verify `curl -I --http3` returns HTTP/3.
10. Re-verify every critical route on the live domain — real data, no console errors, no
    hydration warnings, no broken internal links.
11. Confirm no private data leaks in public payloads (§7.5.10, criterion 50).

---

## Rendering strategy per route (criterion 37)

Populated in Phase 5 once the route inventory exists. Target shape from §1.5:

| Route group | Strategy | Reasoning |
|---|---|---|
| Listing detail, category, location, blog, static/legal | SSG + ISR | Content-stable, SEO-critical, cacheable at the edge |
| Listings index | ISR, SSR when filtered | Base grid is cacheable; filter/sort permutations are not |
| Search | SSR | Query-dependent, must not be cached |
| Auth, dashboard, admin | SSR, no cache | Per-user and permission-gated |

Exact per-route entries land here once `docs/route-inventory.md` exists — blocked on B-1.
