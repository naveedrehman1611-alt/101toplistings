-- Public redirect lookup for the admin-managed `redirects` table.
--
-- The site resolves a redirect only for a URL that no route matches
-- (src/app/[...path]/page.tsx), using the anon key. Anon can already read
-- `redirects` (0008), but cannot update it, so counting hits needs this
-- function. It is deliberately narrow: it can only add 1 to `hits` on a row
-- that already exists, and returns nothing else. RLS on `redirects` is not
-- loosened.
--
-- The lookup and the counter bump are one statement, so a redirect costs one
-- round trip rather than a select followed by an rpc.
--
-- The 404 log (not_found_log) is intentionally NOT written from here: every
-- write would be driven by arbitrary anonymous URLs, which lets anyone grow
-- the table without bound. It stays admin-only.
--
-- Re-runnable: create or replace, and grants are idempotent.

create or replace function resolve_redirect(p_path text)
returns table (destination text, status_code smallint)
language sql
volatile
security definer
set search_path = public, pg_temp
as $$
  update redirects r
     set hits = r.hits + 1
   where r.source = p_path
  returning r.destination, r.status_code;
$$;

-- Unlike the helpers in 0009, nothing in an RLS policy calls this, so revoking
-- the default PUBLIC grant is safe and actually takes effect.
revoke all on function resolve_redirect(text) from public;
grant execute on function resolve_redirect(text) to anon, authenticated;
