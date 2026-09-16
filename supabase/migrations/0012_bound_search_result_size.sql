-- ---------------------------------------------------------------------------
-- 0012 — bound the size of a search_listings response
-- ---------------------------------------------------------------------------
-- search_listings is part of the public API surface: anon holds EXECUTE on it,
-- so anyone with the publishable key can POST to /rest/v1/rpc/search_listings
-- with arguments the site itself would never send.
--
-- As written in 0007 the tail was:
--
--     limit greatest(p_limit, 0) offset greatest(p_offset, 0)
--
-- which has two problems. `p_limit => 1000000` returns the whole approved table
-- in one response, and `p_limit => null` makes it LIMIT NULL, which in Postgres
-- means no limit at all. Either one turns a single request into an arbitrarily
-- large egress event, and the account is billed for it.
--
-- The clamp below is the same defence the application already applies to its
-- own callers, moved to where it cannot be bypassed. MAX_PAGE_SIZE is well
-- above every page size the site uses (12, and 6 on the homepage rail).

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
   -- A null or oversized p_limit is clamped, never honoured. A null p_offset
   -- would likewise mean OFFSET NULL, so it is coalesced the same way.
   limit least(greatest(coalesce(p_limit, 20), 1), 60)
  offset least(greatest(coalesce(p_offset, 0), 0), 6000);
$$;

comment on function search_listings is
  'Public listing search. Result size is clamped to 60 rows and 6000 offset: the '
  'function is callable by anon, so its response size cannot be left to the caller.';
