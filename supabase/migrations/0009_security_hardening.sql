-- 0009 — security advisor fixes
-- Recovered into the repo from supabase_migrations.schema_migrations (applied
-- 2026-09-02 via MCP and never committed). Recorded verbatim so `supabase db push`
-- and the repo agree; re-running it is a no-op.

-- Advisor ERROR: location_slugs ran with the creator's rights instead of the caller's.
drop view if exists location_slugs;
create view location_slugs with (security_invoker = true) as
  select 'country'::text as level, id, slug, name, null::uuid as parent_id, latitude, longitude from countries
  union all
  select 'region', id, slug, name, country_id, latitude, longitude from regions
  union all
  select 'city', id, slug, name, region_id, latitude, longitude from cities
  union all
  select 'area', id, slug, name, city_id, latitude, longitude from areas;

-- Advisor WARN: trigger functions had a mutable search_path.
alter function touch_updated_at() set search_path = public, pg_temp;
alter function assert_location_slug_unique() set search_path = public, pg_temp;

-- Advisor WARN: SECURITY DEFINER helpers were callable over the REST API.
-- has_min_role and current_role_is_staff exist to be called inside RLS policies;
-- exposing them as RPC lets anyone probe role state. recalc_listing_rating is a
-- trigger body and must never be invoked directly.
revoke execute on function has_min_role(user_role) from anon, authenticated;
revoke execute on function current_role_is_staff() from anon, authenticated;
revoke execute on function recalc_listing_rating() from anon, authenticated;

-- search_listings, location_listing_count and is_location_page_indexable are the
-- intended public API surface, so their execute grants stay.

-- Advisor ERROR: spatial_ref_sys is PostGIS's own extension-owned table and cannot
-- have RLS added. Remove it from the exposed API instead - it holds only SRID
-- definitions, no application data.
revoke all on table spatial_ref_sys from anon, authenticated;
