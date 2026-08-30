-- 0007 — helper functions, triggers, the geo RPC, and the public projection

-- ---------------------------------------------------------------------------
-- Role helper
-- ---------------------------------------------------------------------------
-- Used by every RLS policy in 0008. SECURITY DEFINER so a user can be checked
-- against profiles without needing select rights on the whole table, and pinned
-- search_path so it cannot be hijacked by a user-created schema.

create or replace function has_min_role(required user_role)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
      from profiles p
     where p.id = auth.uid()
       and not p.is_suspended
       and p.role >= required          -- enum ordinal comparison; see 0001 ordering
  );
$$;

create or replace function current_role_is_staff()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$ select has_min_role('moderator'); $$;

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------

create or replace function touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array[
    'profiles','categories','countries','regions','cities','areas',
    'listings','reviews','blog_posts','pages','page_sections'
  ] loop
    execute format(
      'create trigger %I_touch before update on %I
         for each row execute function touch_updated_at()', t || '_updated', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Rating aggregation
-- ---------------------------------------------------------------------------
-- §7.5.8: structured data may only claim a rating where one really exists, so the
-- aggregate must be null (not 0) when there are no approved reviews. The check
-- constraint in 0003 enforces that pairing; this keeps it true.

create or replace function recalc_listing_rating()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  target uuid := coalesce(new.listing_id, old.listing_id);
  cnt    integer;
  avg_r  numeric(2,1);
begin
  select count(*), round(avg(rating)::numeric, 1)
    into cnt, avg_r
    from reviews
   where listing_id = target and status = 'approved';

  update listings
     set review_count   = cnt,
         rating_average = case when cnt > 0 then avg_r end
   where id = target;

  return null;
end;
$$;

create trigger reviews_recalc_rating
  after insert or update of rating, status or delete on reviews
  for each row execute function recalc_listing_rating();

-- ---------------------------------------------------------------------------
-- Location slug uniqueness across all four levels
-- ---------------------------------------------------------------------------
-- The flat /location/[slug] route (see 0002) is only unambiguous if no slug repeats
-- across countries, regions, cities and areas. Spans four tables, so a constraint
-- cannot express it.

create or replace function assert_location_slug_unique()
returns trigger
language plpgsql
as $$
declare clash text;
begin
  select level into clash
    from location_slugs
   where slug = new.slug
     and id <> new.id
   limit 1;

  if clash is not null then
    raise exception 'location slug "%" already used by a %', new.slug, clash
      using errcode = 'unique_violation';
  end if;
  return new;
end;
$$;

create trigger countries_slug_unique before insert or update of slug on countries
  for each row execute function assert_location_slug_unique();
create trigger regions_slug_unique   before insert or update of slug on regions
  for each row execute function assert_location_slug_unique();
create trigger cities_slug_unique    before insert or update of slug on cities
  for each row execute function assert_location_slug_unique();
create trigger areas_slug_unique     before insert or update of slug on areas
  for each row execute function assert_location_slug_unique();

-- ---------------------------------------------------------------------------
-- Public projection — criterion 50
-- ---------------------------------------------------------------------------
-- §7.5.2: owner_user_id, created_by, last_updated_by, rejection_note and the raw
-- status columns are INTERNAL. Public queries select from here, never from listings,
-- so an internal field cannot leak by someone writing `select *`.
-- security_invoker so the caller's RLS still applies on the underlying table.

create view public_listings
with (security_invoker = true)
as
  select
    l.id, l.slug, l.name, l.tagline, l.description,
    l.category_id, l.subcategory_id,
    l.phone_primary, l.phone_secondary, l.email, l.website,
    l.address, l.postal_code,
    l.country_id, l.region_id, l.city_id, l.area_id,
    l.latitude, l.longitude, l.geo,
    l.social_links, l.is_featured,
    l.rating_average, l.review_count,
    l.seo_title, l.seo_description,
    l.verification,
    l.published_at, l.created_at, l.updated_at
  from listings l
  where l.status = 'approved';

-- ---------------------------------------------------------------------------
-- Radius search — §7.5.4, server-side only
-- ---------------------------------------------------------------------------
-- "Never load all businesses into the browser and compute distance client-side."
-- st_dwithin on the geography column uses listings_geo_idx.
--
-- §7.5.5: distance is returned only where BOTH sides have real coordinates; a
-- listing with no coordinates returns null distance and the UI must then render no
-- distance at all rather than a guess.
--
-- §7.5.6: keyword + category + location combine in one call, with pagination.

create or replace function search_listings(
  p_query       text default null,
  p_category_id uuid default null,
  p_country_id  uuid default null,
  p_region_id   uuid default null,
  p_city_id     uuid default null,
  p_area_id     uuid default null,
  p_lat         double precision default null,
  p_lng         double precision default null,
  p_radius_km   double precision default null,
  p_min_rating  numeric default null,
  p_sort        listing_sort default 'newest',
  p_limit       integer default 20,
  p_offset      integer default 0
)
returns table (
  id             uuid,
  slug           text,
  name           text,
  tagline        text,
  category_id    uuid,
  city_id        uuid,
  latitude       double precision,
  longitude      double precision,
  rating_average numeric,
  review_count   integer,
  is_featured    boolean,
  published_at   timestamptz,
  distance_km    double precision,
  total_count    bigint
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  with origin as (
    select case
             when p_lat is not null and p_lng is not null
             then st_setsrid(st_makepoint(p_lng, p_lat), 4326)::geography
           end as g
  ),
  filtered as (
    select l.*,
           case
             when o.g is not null and l.geo is not null
             then st_distance(l.geo, o.g) / 1000.0
           end as distance_km
      from listings l
      cross join origin o
     where l.status = 'approved'
       and (p_category_id is null
            or l.category_id = p_category_id
            or l.subcategory_id = p_category_id)
       and (p_country_id is null or l.country_id = p_country_id)
       and (p_region_id  is null or l.region_id  = p_region_id)
       and (p_city_id    is null or l.city_id    = p_city_id)
       and (p_area_id    is null or l.area_id    = p_area_id)
       and (p_min_rating is null or l.rating_average >= p_min_rating)
       and (
             p_query is null
             or l.name        ilike '%' || p_query || '%'
             or l.tagline     ilike '%' || p_query || '%'
             or l.description ilike '%' || p_query || '%'
           )
       -- Radius filter. st_dwithin is index-assisted; a listing with no geo is
       -- excluded when a radius is requested, because an unknown distance cannot
       -- be asserted to be inside it.
       and (
             p_radius_km is null
             or o.g is null
             or (l.geo is not null and st_dwithin(l.geo, o.g, p_radius_km * 1000.0))
           )
  )
  select f.id, f.slug, f.name, f.tagline, f.category_id, f.city_id,
         f.latitude, f.longitude, f.rating_average, f.review_count,
         f.is_featured, f.published_at, f.distance_km,
         count(*) over () as total_count
    from filtered f
   order by
     case when p_sort = 'nearest'      then f.distance_km end asc nulls last,
     case when p_sort = 'rating'       then f.rating_average end desc nulls last,
     case when p_sort = 'alphabetical' then lower(f.name) end asc,
     case when p_sort = 'oldest'       then f.published_at end asc,
     case when p_sort = 'newest'       then f.published_at end desc,
     f.id
   limit greatest(p_limit, 0)
  offset greatest(p_offset, 0);
$$;

-- ---------------------------------------------------------------------------
-- Location page density threshold — §7.5.7, criterion 47
-- ---------------------------------------------------------------------------
-- "Do not mass-generate thin pages." A category+location combination is indexable
-- only above a threshold; below it the page returns noindex or routes to the parent.
-- The threshold lives in settings so it is tunable from admin without a deploy.

create or replace function location_listing_count(
  p_city_id     uuid default null,
  p_area_id     uuid default null,
  p_category_id uuid default null
)
returns integer
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select count(*)::integer
    from listings l
   where l.status = 'approved'
     and (p_city_id     is null or l.city_id = p_city_id)
     and (p_area_id     is null or l.area_id = p_area_id)
     and (p_category_id is null or l.category_id = p_category_id
                                or l.subcategory_id = p_category_id);
$$;

create or replace function is_location_page_indexable(
  p_city_id     uuid default null,
  p_area_id     uuid default null,
  p_category_id uuid default null
)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select location_listing_count(p_city_id, p_area_id, p_category_id)
         >= coalesce(
              (select (value #>> '{}')::integer from settings
                where key = 'seo.location_page_min_listings'),
              5);
$$;
