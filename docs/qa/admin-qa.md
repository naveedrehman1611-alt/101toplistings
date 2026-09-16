# Admin / security QA — partial

Only the database half of §9.5.6 exists so far; there is no admin UI yet, so route-layer guards
are not testable. RLS results below are real.

## Criterion 55 — privilege escalation attempts

Each test ran inside its own transaction as a **non-superuser** role (`authenticated` / `anon`)
with `request.jwt.claim.sub` set, then rolled back.

| # | Attempt | As | Result |
|---|---|---|---|
| T1 | Approve own listing (`status → approved`) | business_owner | ❌ **blocked** — `new row violates row-level security policy for table "listings"` |
| T2 | Promote self to `super_admin` | user | ❌ **blocked** — `... policy for table "profiles"` |
| T3 | Read non-approved listings | anonymous | ❌ **blocked** — 0 rows |
| T4 | Read the forms inbox | anonymous | ❌ **blocked** — 0 rows |
| T5 | Insert a listing already `approved` | business_owner | ❌ **blocked** — `... policy for table "listings"` |
| T6 | Insert own review already `approved` | user | ❌ **blocked** — `... policy for table "reviews"` |

All six correctly denied.

## Method note

A first run of these tests produced false passes and is recorded here so the mistake is not
repeated. `SET LOCAL` outside a transaction block is a no-op — PostgreSQL only warns — so the
role never switched and every statement executed as the `postgres` superuser, which **bypasses
RLS entirely**. The escalation in T2 actually succeeded and was briefly misread as a pass.

Any future RLS test must therefore: wrap each case in `begin; … rollback;`, use a non-superuser
role, and assert on the resulting state rather than on the absence of an error.

## Not yet covered

- Route-layer guards and admin middleware (no admin UI exists yet)
- Service-role key isolation — verified by inspection only once server code exists
- Admin auth rate limiting (§9.5.6)
- Audit log population — the table and policies exist; no writes are generated yet
