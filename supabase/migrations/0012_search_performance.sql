-- 0012 — search_listings performance
--
-- Measured against 100k seeded listings, every call to the 0007 version took
-- ~150–270 ms regardless of filters: each one was a sequential scan. Two causes:
--
-- 1. A single static plan for all filter combinations. Predicates written as
--    "p_x is null or col = p_x" cannot use an index, because the one cached plan
--    must also be correct when p_x is null. So the GiST index never served a
--    radius search and the FK indexes never served category/city pages.
-- 2. The keyword filter ran ilike on name, tagline and description separately,
--    but listings_search_trgm_idx indexes their concatenation. An index is only
--    used when the query repeats its exact expression, so it was never used.
--
-- The fix builds the WHERE clause from only the filters actually supplied and
-- runs it with EXECUTE, so each call is planned for its own filters. Values are
-- always bound as parameters, never concatenated into the SQL text.
--
-- Also:
-- - The total is counted in its own query instead of count(*) over (), so the
--   page query can stop after `limit` rows by walking a sorted index.
-- - "nearest" sorts with the KNN operator (<->), which the GiST index serves.
-- - % and _ in the user's keyword are escaped: they were matching as wildcards.
-- - p_limit is capped at 100 so one request cannot pull the whole table.
--
-- Signature and result columns are unchanged, so no application code changes and
-- the execute grants on the existing function are kept.

-- Category and city pages list approved listings newest first. These let that
-- query read just the first page from the index instead of sorting every match.
create index if not exists listings_category_recent_idx
  on listings(category_id, published_at desc nulls last)
  where status = 'approved';

create index if not exists listings_city_recent_idx
  on listings(city_id, published_at desc nulls last)
  where status = 'approved';

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
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_query  text := nullif(btrim(p_query), '');
  v_origin geography;
  v_where  text := 'l.status = ''approved''';
  v_order  text;
  v_total  bigint;
begin
  if p_lat is not null and p_lng is not null then
    v_origin := st_setsrid(st_makepoint(p_lng, p_lat), 4326)::geography;
  end if;

  -- Parameter slots: $1 keyword pattern, $2 category, $3 country, $4 region,
  -- $5 city, $6 area, $7 origin, $8 radius metres, $9 min rating.
  if v_query is not null then
    -- Must match the listings_search_trgm_idx expression exactly.
    v_where := v_where || ' and (coalesce(l.name,'''') || '' '' || coalesce(l.tagline,'''')'
                       || ' || '' '' || coalesce(l.description,'''')) ilike $1';
  end if;
  if p_category_id is not null then
    v_where := v_where || ' and (l.category_id = $2 or l.subcategory_id = $2)';
  end if;
  if p_country_id is not null then v_where := v_where || ' and l.country_id = $3'; end if;
  if p_region_id  is not null then v_where := v_where || ' and l.region_id = $4';  end if;
  if p_city_id    is not null then v_where := v_where || ' and l.city_id = $5';    end if;
  if p_area_id    is not null then v_where := v_where || ' and l.area_id = $6';    end if;
  if p_min_rating is not null then v_where := v_where || ' and l.rating_average >= $9'; end if;
  -- A listing with no geo is excluded when a radius is requested: an unknown
  -- distance cannot be asserted to be inside it.
  if p_radius_km is not null and v_origin is not null then
    v_where := v_where || ' and st_dwithin(l.geo, $7, $8)';
  end if;

  v_order := case p_sort
    when 'nearest' then
      case when v_origin is not null then 'l.geo <-> $7 nulls last, l.id' else 'l.id' end
    when 'rating'       then 'l.rating_average desc nulls last, l.id'
    when 'alphabetical' then 'lower(l.name), l.id'
    when 'oldest'       then 'l.published_at asc nulls last, l.id'
    else                     'l.published_at desc nulls last, l.id'
  end;

  execute 'select count(*) from listings l where ' || v_where
     into v_total
    using '%' || replace(replace(replace(v_query, '\', '\\'), '%', '\%'), '_', '\_') || '%',
          p_category_id, p_country_id, p_region_id, p_city_id, p_area_id,
          v_origin, p_radius_km * 1000.0, p_min_rating;

  if v_total = 0 then
    return;
  end if;

  return query execute
    'select l.id, l.slug, l.name, l.tagline, l.category_id, l.city_id,'
    || ' l.latitude, l.longitude, l.rating_average::numeric, l.review_count,'
    || ' l.is_featured, l.published_at,'
    || ' case when $7 is not null and l.geo is not null'
    || '      then st_distance(l.geo, $7) / 1000.0 end,'
    || ' $10'
    || ' from listings l where ' || v_where
    || ' order by ' || v_order
    || ' limit $11 offset $12'
    using '%' || replace(replace(replace(v_query, '\', '\\'), '%', '\%'), '_', '\_') || '%',
          p_category_id, p_country_id, p_region_id, p_city_id, p_area_id,
          v_origin, p_radius_km * 1000.0, p_min_rating,
          v_total,
          least(greatest(coalesce(p_limit, 20), 0), 100),
          greatest(coalesce(p_offset, 0), 0);
end;
$$;
