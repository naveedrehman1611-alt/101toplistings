# OPEN QUESTIONS, BLOCKERS & DECISIONS

Per §2 rule 2 and §2 rule 11: nothing is downscoped silently. Anything that cannot be built
as specified is recorded here rather than dropped.

---

## BLOCKERS — work cannot proceed until resolved

### B-1 — Reference site unreachable (CRITICAL)

**Status:** OPEN. Re-tested after the allowlist request; still denied.

`https://101toplistings.com` is refused by this session's network egress policy.

```
curl    → curl: (56) CONNECT tunnel failed, response 403
WebFetch→ {"error_type":"EGRESS_BLOCKED","domain":"101toplistings.com",
           "message":"Access to 101toplistings.com is blocked by the network egress proxy."}
proxy   → connect_rejected: "gateway answered 403 to CONNECT (policy denial or upstream failure)"
```

This is an organisation-level egress denial, not a transient network fault. The agent-proxy
README at `/root/.ccr/README.md` is explicit: *"The destination host is not allowed by your
organization's egress policy for this session. Do not retry or route around it — report the
blocked host."*

**Deliberately not attempted**, because each would be circumventing that policy rather than
resolving it: Wayback Machine or other archive mirrors, Google cache, text-extraction proxies,
alternate DNS, or reconstructing page content from search-engine snippets.

**What this blocks.** The reference site is named in §1 as the *primary source of truth* for
information architecture, page hierarchy, navigation, layout, component placement, content
hierarchy, user flows, search, filters, sorting, pagination, card and detail layouts, category
and location layouts, blog layouts, forms, CTA placement, footer structure, responsive
behaviour, mobile navigation, empty/error/loading states, breadcrumbs, internal linking and URL
structure. With no access:

- Phase 1 (crawl / Wave A) cannot run at all.
- Phase 2 (per-template analysis, minimum 5 examples per dynamic template) cannot run.
- Phase 8 (side-by-side visual comparison) cannot run.
- Phase 3's schema cannot be *derived from what the pages display*, as §7 requires.
- Phase 4's component inventory cannot be derived from *observed* recurring patterns.
- §9.5.2's `section_type` enum cannot be derived from real page templates, as it requires.
- Acceptance criteria 1, 2, 3 and 6 cannot be honestly satisfied.

**Resolution options.**

1. **Allowlist the domain** in the environment's network policy, then re-run Wave A as
   specified. Environment settings are documented at
   https://code.claude.com/docs/en/claude-code-on-the-web. *This is the chosen path — confirmed
   by the user — but has not taken effect yet.* A container restart or a new session may be
   required for a policy change to apply.
2. **Supply the source material directly** — an HTML export, a full screenshot set, the
   existing codebase, or a written IA description. Structure can be extracted from any of these.
3. Proceed from the self-contained parts of the spec only, accepting that structural fidelity
   is unverified. *Explicitly not chosen.*

### B-2 — Nominated Supabase project is not accessible

**Status:** OPEN.

The user nominated `https://cwnqvngpjxvodbvdhpzf.supabase.co`. That project ref is not
reachable with the Supabase account connected to this session:

```
get_project("cwnqvngpjxvodbvdhpzf")
  → MCP error -32600: You do not have permission to perform this action
```

`list_organizations` / `list_projects` for the connected account return exactly one org and one
project:

| Org | Project | Ref | Region | Status |
|---|---|---|---|---|
| `mr-medico` | mohammedrehman33's Project | `utfpmyolqdtpnbiknlvm` | ap-south-1 | ACTIVE_HEALTHY |

So `cwnqvngpjxvodbvdhpzf` either belongs to a different Supabase account, or this session's
Supabase connection lacks rights to it.

**What this blocks.** Phase 3 (migrations, seed), Phase 3B (PostGIS, geo RPCs, spatial
indexes), Phase 5B (admin panel persistence), and all of criteria 40–57.

**Resolution options.**

1. Reconnect the Supabase MCP integration using the account that owns `cwnqvngpjxvodbvdhpzf`.
2. Nominate a project the connected account can reach.
3. Have me create a fresh project under `mr-medico` — I will price it via `get_cost` and get
   explicit confirmation before creating anything billable.
4. I write and commit the full migration + seed SQL, verified against a local Postgres +
   PostGIS, and apply nothing remotely. Geo correctness and RLS then stay unverified against
   real infrastructure until someone runs them.

**Not done without instruction:** writing this schema into `utfpmyolqdtpnbiknlvm`. That project
belongs to a different product (`mr-medico`) and may be in use; adding a directory schema would
mean sharing a database, an auth user pool and a storage bucket across two products.

### B-3 — No write access to the GitHub repository

**Status:** OPEN. Phase 0 is committed locally but **cannot be pushed.**

Every available push path returns 403:

```
git push -u origin claude/website-recreation-reference-wjlht1
  → fatal: ... The requested URL returned error: 403

git -c http.extraheader="AUTHORIZATION: bearer $GITHUB_TOKEN" push ...
  → 403

GitHub MCP create_or_update_file
  → 403 Resource not accessible by integration
```

The failure is from GitHub, not the egress proxy — the proxy's `recentRelayFailures` contains
no `github.com` entries, only the blocked reference domain.

**Cause.** The GitHub identity connected to this session is **`mohammedrehman33`**
(Muhammad-Rehman, marham.pk). The repository is **`naveedrehman1611-alt/101toplistings`** — a
different account. That identity has read access but not write, and the GitHub App installation
is likewise read-only for this repo. `add_repo` with `access: "push"` reports the repo already
attached and does not change the result.

The repository is also completely empty: `list_branches` returns `[]` and there are no commits,
so the designated branch `claude/website-recreation-reference-wjlht1` does not exist on the
remote yet.

**Resolution options.**

1. Grant `mohammedrehman33` write access to `naveedrehman1611-alt/101toplistings` (invite as a
   collaborator with Write, or add via a team).
2. Install/authorise the Claude GitHub App on `naveedrehman1611-alt` with read **and write**
   for this repo. An admin can do this at https://claude.ai/admin-settings/claude-in-slack.
3. Re-run this work in a session connected to the `naveedrehman1611-alt` account.
4. Point the work at a repository owned by `mohammedrehman33` instead.

**Local state is safe meanwhile:** commit `5051ec9` holds all of Phase 0. Nothing is lost as
long as the container is not reclaimed — but this container *is* ephemeral, so the work is not
durable until a push succeeds.

---

## DECISIONS TAKEN (user delegated these)

### D-2 — Brand name and domain

- **NEW_BRAND_NAME:** `RankYouSite`
- **NEW_DOMAIN:** `rankyousite.com`

History, because it is the point of the architecture: a working name was chosen first
under the user's delegation, then rejected. Changing it touched **seven database rows and
three code fallbacks** — no component held the name, because §9.5.1 forbids hardcoded
user-visible strings. That is the rule earning its keep; a rebrand was minutes, not a
refactor.

Note this supersedes §1 of `PROMPT.md`, which required the new brand to differ from the
reference site's. The user directed otherwise, which is their call to make: it is their
domain and their repository.

**Live URL:** `rankyousite.vercel.app`. Vercel appended `-sigma` because the plain
`101toplistings.vercel.app` hostname is already claimed by another account — which is also
why visiting it returned a 404 earlier. A custom domain removes the suffix.

### D-3 — Brand colours and typography

The user delegated the choice. Full scales land in the `@theme` block in
`src/app/globals.css` at Phase 4; the direction is fixed now so the foundation can be built:

| Role | Value | Reasoning |
|---|---|---|
| CTA / primary | `#004d71` | Specified by the user. Set as `brand-700`, so every button, link, active state and gradient resolves to it without touching a component. |
| Ink / text | `#10222e` | Near-black with a cool cast, paired with `#5a6b78` for muted text. |
| Surface | `#ffffff` | Page background, unconditionally. |
| Surface 2 | `#f7fafb` | Section separation only. Near-white by design — a pure-white second surface would leave sections with no visual boundary at all. Say the word and it becomes `#ffffff`. |

**Dark mode was removed, not merely overridden.** The site previously followed
`prefers-color-scheme`, so a visitor whose system was set to dark saw dark backgrounds. There
is now no dark palette in the stylesheet, and `color-scheme: light` is pinned so form controls
and scrollbars stay light too. Verified in the deployed CSS.

Typography via `next/font`: **Plus Jakarta Sans** for headings, **Inter** for body/UI. Both are
preloaded to satisfy the Priority Hints requirement (§1.5, criterion 36).

Contrast to be validated against WCAG AA by `a11y-perf-agent` in Wave E; any pair that fails
gets adjusted then, and the change recorded here.

### D-4 — Structural proportions pending B-1

§8 requires that structural proportions — container width, card aspect ratios, section rhythm —
*track the reference*, while brand styling diverges. Those specific values cannot be set until
B-1 clears. Interim values will be marked `PENDING-REFERENCE` in the theme block so they are
easy to find and correct, rather than silently becoming permanent.

---

## ASSUMPTIONS LOGGED

### A-1 — Admin panel specification (§9.5.7)

§9.5.7 says that if a Mr-Medico admin spec is provided, match its module layout, naming and
permission model exactly — and that **if no such spec has been provided, do not guess at it**.

No such spec was pasted or attached in this conversation. The Supabase org connected here is
coincidentally named `mr-medico`, but an org name is not a specification, and I did not read
that project's schema to infer one.

**Therefore:** the admin panel will be built to the specification in §9.5.4 as written. If you
have the Mr-Medico admin spec, paste it and the module layout, naming and permission model will
be reconciled against it.

### A-2 — Tailwind v4 is CSS-first

§1.5 locks Tailwind CSS and §8 says tokens go "in the Tailwind config". Tailwind v4 (installed
by `create-next-app`) has no `tailwind.config.js`; tokens are declared in an `@theme` block in
`src/app/globals.css`. That file is treated as the Tailwind config for every requirement that
names it. Not a stack substitution — same library, current configuration format.

### A-3 — Next.js 16 differs from training data

`AGENTS.md`, generated by `create-next-app`, warns that this Next.js version has breaking
changes versus model training data and directs agents to `node_modules/next/dist/docs/` before
writing code. Implementation agents in Wave D **must** consult those bundled docs for App
Router, Metadata API, `next/image`, `next/font` and route handler APIs rather than relying on
recalled conventions. Recorded so it is not skipped under time pressure.

---

## QUESTIONS FOR THE USER

1. **B-1** — confirm when the allowlist for `101toplistings.com` is live (a session restart may
   be needed), or supply the source material directly.
2. **B-2** — which Supabase project should actually be used, given
   `cwnqvngpjxvodbvdhpzf` is not reachable from this session?
3. **D-1** (see `docs/DEPLOYMENT.md`) — which Hostinger plan is available? Node hosting or
   static-only? This changes the architecture and must be answered before Phase 5.
4. **A-1** — is there a Mr-Medico admin spec to match, or should §9.5.4 stand as the
   specification?
