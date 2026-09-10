-- Applied in response to Supabase's security advisor after 0001-0008.

-- Advisor ERROR: location_slugs ran with the creator's rights instead of the
-- caller's, because the view was created without security_invoker.
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
--
-- NOTE: these three revokes DO NOT take effect, and are kept only so the intent
-- is visible. PostgreSQL grants EXECUTE on every function to PUBLIC by default,
-- and revoking from `authenticated` does not remove the PUBLIC grant — verified
-- afterwards with has_function_privilege(), which still reports true.
--
-- Revoking from PUBLIC is not the fix either: RLS policy expressions are
-- evaluated as the querying role, so every policy calling has_min_role() would
-- start failing with "permission denied for function".
--
-- The real fix is to move these helpers into a schema PostgREST does not expose
-- and have the policies call them there. Deferred rather than done here because
-- it means recreating ~30 policies. Residual risk is low: each function reports
-- only on auth.uid(), so a caller learns nothing about anyone else, and
-- recalc_listing_rating is a trigger body that errors if invoked directly.
revoke execute on function has_min_role(user_role) from anon, authenticated;
revoke execute on function current_role_is_staff() from anon, authenticated;
revoke execute on function recalc_listing_rating() from anon, authenticated;

-- search_listings, location_listing_count and is_location_page_indexable are
-- the intended public API surface, so their execute grants stay.

-- Advisor ERROR: spatial_ref_sys is PostGIS's own extension-owned table and
-- cannot have RLS added. Remove it from the exposed API instead — it holds only
-- SRID definitions, no application data.
revoke all on table spatial_ref_sys from anon, authenticated;
