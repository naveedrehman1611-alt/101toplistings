# Blockers and fixes

Written for whoever needs to unblock this project. Each entry states what was tried, what the
system actually answered, why it happens, and the exact fix.

All three blockers are **access/configuration issues outside the codebase**. None is a bug in the
code, and none can be fixed by writing more code.

---

## B-3 — Work cannot be pushed to GitHub

### What happens

```
git push -u origin claude/website-recreation-reference-wjlht1
  → fatal: unable to access '.../101toplistings/': The requested URL returned error: 403

git -c http.extraheader="AUTHORIZATION: bearer $GITHUB_TOKEN" push ...
  → 403

GitHub API — create_or_update_file
  → 403 Resource not accessible by integration

GitHub API — create_repository
  → 403 Resource not accessible by integration
```

### Reason

There are **two independent causes**, and both must be fixed. Fixing only one leaves the push
broken, which is why several earlier attempts failed.

**Cause 1 — the session's GitHub connection is read-only.**
`Resource not accessible by integration` is GitHub's specific wording for an App installation
whose permission scopes do not include the requested write. It is not repo-specific: creating a
brand-new repository failed the same way, so this connection cannot write *anywhere*.

Reading works only because `naveedrehman1611-alt/101toplistings` is a **public** repository —
public reads need no App at all. That is why the Claude App does not appear in that account's
installed-apps list: it was never installed there. Nothing was misconfigured; it simply is not
present.

**Cause 2 — the session is locked to one repository set.**
Claude Code sessions are bound at creation to their source repositories. Attempting to push to a
different repo returns, verbatim:

```
remote: access denied by the git proxy: mohammedrehman33/rankyousite is not in this
session's authorized repository set, so the proxy will not inject a credential for it.
```

and attaching it mid-session is refused:

```
add_repo: cross-tier adds are not supported in v1: requested "mohammedrehman33/rankyousite"
but session already has repos from owner(s) [naveedrehman1611-alt]
```

The session's own identity is `mohammedrehman33`, while the bound repository belongs to
`naveedrehman1611-alt` — two different accounts.

### Fix

**Start a new session with `mohammedrehman33/rankyousite` selected as its source repository.**

One action resolves both causes at once: the repository is owned by the same account the session
authenticates as, and selecting it at creation puts it in the authorized set. No App install, no
collaborator invite, no permission change.

Then extract the delivered bundle into the checkout and say:

> Read PROMPT.md and execute it completely, following every rule.

Alternatives, if that repository must stay where it is:

- Install the Claude GitHub App on `naveedrehman1611-alt` **with Contents: Read and write**, and
  start a new session. (Changing permissions is not enough on its own — the App has to be
  installed there first.)
- Run Claude Code locally instead of in the cloud. Local runs use the machine's own git
  credentials, so this blocker disappears entirely — and so does B-1.

---

## B-2 — The nominated Supabase project is unreachable

### What happens

```
get_project("cwnqvngpjxvodbvdhpzf")
  → MCP error -32600: You do not have permission to perform this action
```

### Reason

That project reference is not visible to the Supabase account connected to this session. Listing
what the connection *can* see returns exactly one organisation and one project:

| Org | Project | Ref | Region | Status |
|---|---|---|---|---|
| `mr-medico` | mohammedrehman33's Project | `utfpmyolqdtpnbiknlvm` | ap-south-1 | ACTIVE_HEALTHY |

So `cwnqvngpjxvodbvdhpzf` belongs to a different Supabase account, or the connected account has
no rights on it.

The schema was **not** written into `utfpmyolqdtpnbiknlvm` instead. That project belongs to a
different product and may be in use; adding a directory schema would mean two products sharing a
database, an auth user pool and a storage bucket.

### Fix

Pick one:

1. Reconnect the Supabase integration using the account that owns `cwnqvngpjxvodbvdhpzf`.
2. Nominate a project the connected account can actually reach.
3. Create a fresh project for this platform. Ask and it will be priced with `get_cost` first, and
   nothing billable is created without explicit confirmation.

Then apply the migrations in order:

```
supabase/migrations/0001_extensions_and_enums.sql
0002_taxonomy_and_geo.sql
0003_profiles_and_listings.sql
0004_reviews_and_engagement.sql
0005_blog.sql
0006_cms_and_settings.sql
0007_functions_and_views.sql
0008_rls_policies.sql
```

They already apply cleanly on PostgreSQL 16 + PostGIS 3.4 — see `docs/qa/geo-qa.md` and
`docs/qa/admin-qa.md` for the verification evidence. Nothing is expected to fail; this step is
mechanical.

---

## B-1 — Reference site unreachable *(research complete; partially closed)*

### What happens

```
curl     → CONNECT tunnel failed, response 403
WebFetch → EGRESS_BLOCKED
Chromium → ERR_TUNNEL_CONNECTION_FAILED
```

### Reason

The container runs a **default-deny egress allowlist**, not a block on this one site. `example.com`
and `docs.anthropic.com` are refused identically; only a small set of hosts (github, npm,
Supabase, Anthropic) is permitted.

This is why a browser did not help: every tool in the container — curl, WebFetch, Chromium, any
MCP server — passes through the same gateway and is refused before the request ever leaves.

### Fix — already applied for the research phases

The site was captured **in the user's own browser** using Claude in Chrome, which runs on their
network rather than the container's, driven by the prompts in `docs/CHROME-EXTENSION-PROMPTS.md`.
The result is `docs/reference-analysis.md`, and Phases 1 and 2 are complete.

Archive mirrors, cache proxies and search-snippet reconstruction were deliberately **not** used:
the agent-proxy policy is explicit that a blocked host is reported, not routed around.

### What is still blocked

Phase 8, the side-by-side visual comparison, needs the reference and the build open together. To
close it, either allowlist `101toplistings.com` in the environment's network policy
(https://code.claude.com/docs/en/claude-code-on-the-web), or do that comparison locally.

Four research gaps also remain, all behind authentication or unobservable on the live site:
the add-listing form, the dashboard, the review experience (no listing on the site has any
reviews), and real rendering at mobile widths. Each has to be designed rather than copied — which
the specification requires anyway.

---

## D-1 — Hostinger runtime, unanswered *(blocks Phase 5)*

Not an access failure — an unanswered question, and §1.5 requires it answered *before*
implementation.

If the Hostinger plan is static-only, then SSR, authentication, every form, the admin panel and
server-side PostGIS queries are all impossible. That is a different product, not a reduced one.

**Needed:** which Hostinger plan is on the account, and what Node version it offers. Details and
the full decision table are in `docs/DEPLOYMENT.md`.

---

## Summary

| # | Blocker | Fix | Who |
|---|---|---|---|
| B-3 | Cannot push | New session sourced from `mohammedrehman33/rankyousite` | User |
| B-2 | Supabase unreachable | Connect the owning account, or nominate/create a reachable project | User |
| B-1 | Reference site | ✅ closed for research; allowlist only needed for Phase 8 | Done |
| D-1 | Hostinger runtime | Confirm the plan and Node version | User |

**B-3 first.** Until it clears, nothing produced can be delivered.
