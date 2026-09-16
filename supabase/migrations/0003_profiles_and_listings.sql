-- 0003 — user profiles and the listings core
-- §7.5.1 business profile fields, §7.5.2 ownership/audit fields.

-- ---------------------------------------------------------------------------
-- Profiles (public mirror of auth.users)
-- ---------------------------------------------------------------------------
-- Supabase Auth owns auth.users. Role and public-facing profile data live here so
-- RLS policies can join against them without touching the auth schema.

create table profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  role          user_role not null default 'user',
  display_name  text,
  avatar_url    text,
  is_suspended  boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index profiles_role_idx on profiles(role);

-- ---------------------------------------------------------------------------
-- Listings
-- ---------------------------------------------------------------------------
-- Nullability is driven by the 13 variations recorded in reference-analysis.md
-- ("Variations observed across examples"). Only name, slug and status are required;
-- every other field was observed absent on at least one real record, or is optional
-- by the spec. Criterion 32 requires the seed to exercise these sparse cases.

create table listings (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,

  -- §7.5.1 identity
  name            text not null,
  tagline         text,                   -- variation 4: absent on some records
  description     text,

  -- §7.5.1 taxonomy
  category_id     uuid references categories(id) on delete set null,
  subcategory_id  uuid references categories(id) on delete set null,

  -- §7.5.1 contact
  phone_primary   text,                   -- §7.5.1 click-to-call, prominent on mobile
  phone_secondary text,
  email           text,                   -- variation 5: absent on some records
  website         text,

  -- §7.5.1 location: relational hierarchy + free-text address + coordinates
  address         text,
  postal_code     text,
  country_id      uuid references countries(id) on delete set null,
  region_id       uuid references regions(id)   on delete set null,
  city_id         uuid references cities(id)    on delete set null,
  area_id         uuid references areas(id)     on delete set null,
  latitude        double precision,
  longitude       double precision,
  -- Generated geography column: the spatial index and every radius query use this.
  -- Kept in sync automatically so it can never drift from latitude/longitude.
  geo             geography(Point, 4326)
                  generated always as (
                    case
                      when latitude is not null and longitude is not null
                      then st_setsrid(st_makepoint(longitude, latitude), 4326)::geography
                    end
                  ) stored,

  -- §7.5.2 ownership and audit — INTERNAL ONLY.
  -- Criterion 50: none of these may appear in any public payload. Enforced by the
  -- public_listings view in 0007 and the RLS policies in 0008.
  owner_user_id   uuid references profiles(id) on delete set null,
  created_by      uuid references profiles(id) on delete set null,
  last_updated_by uuid references profiles(id) on delete set null,
  status          listing_status not null default 'draft',
  verification    verification_status not null default 'unverified',
  rejection_note  text,

  -- Presentation
  is_featured     boolean not null default false,
  social_links    jsonb not null default '[]'::jsonb,  -- variation: 7 on one record, 0 on others

  -- Denormalised rating aggregates, recalculated by trigger in 0007.
  -- The reference emits no aggregateRating at all; §7.5.8 requires we emit it only
  -- where it is real, so review_count = 0 must mean no rating is rendered.
  rating_average  numeric(2,1),
  review_count    integer not null default 0,

  seo_title       text,
  seo_description text,

  published_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  constraint listings_lat_range  check (latitude  is null or (latitude  between -90  and 90)),
  constraint listings_lng_range  check (longitude is null or (longitude between -180 and 180)),
  -- Coordinates are meaningful only as a pair; a half-set pair would silently break
  -- distance display (§7.5.5 forbids fabricated distances).
  constraint listings_coords_paired check (
    (latitude is null and longitude is null) or
    (latitude is not null and longitude is not null)
  ),
  constraint listings_rating_range check (
    rating_average is null or (rating_average between 1.0 and 5.0)
  ),
  -- A rating may exist only when reviews do, and vice versa.
  constraint listings_rating_consistent check (
    (review_count = 0 and rating_average is null) or
    (review_count > 0 and rating_average is not null)
  )
);

-- Spatial index — §7.5.3 "add a spatial index on coordinates", §7.5.4 radius queries.
create index listings_geo_idx on listings using gist (geo);

-- Location and taxonomy foreign keys, all indexed per §7.5.3.
create index listings_country_idx  on listings(country_id);
create index listings_region_idx   on listings(region_id);
create index listings_city_idx     on listings(city_id);
create index listings_area_idx     on listings(area_id);
create index listings_category_idx on listings(category_id);
create index listings_subcat_idx   on listings(subcategory_id);
create index listings_owner_idx    on listings(owner_user_id);

-- Public browse path: approved listings ordered by recency. Partial index keeps it
-- small, since drafts and rejects are never listed publicly.
create index listings_public_recent_idx
  on listings(published_at desc nulls last)
  where status = 'approved';

create index listings_featured_idx
  on listings(is_featured) where is_featured and status = 'approved';

create index listings_rating_idx
  on listings(rating_average desc nulls last) where status = 'approved';

create index listings_name_idx on listings(lower(name));

-- §7.5.6 keyword search. Trigram index supports partial matches, which the
-- reference site's search does not do well.
create index listings_search_trgm_idx
  on listings using gin ((coalesce(name,'') || ' ' || coalesce(tagline,'') || ' ' || coalesce(description,'')) gin_trgm_ops);

-- ---------------------------------------------------------------------------
-- Listing images — cover, logo and gallery are distinct roles (3a)
-- ---------------------------------------------------------------------------

create table listing_images (
  id         uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings(id) on delete cascade,
  media_id   uuid,                      -- FK added in 0006 once media exists
  kind       media_kind not null default 'gallery',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index listing_images_listing_idx on listing_images(listing_id, kind, sort_order);
-- At most one cover and one logo per listing; gallery is unbounded.
create unique index listing_images_single_cover_idx
  on listing_images(listing_id) where kind = 'cover';
create unique index listing_images_single_logo_idx
  on listing_images(listing_id) where kind = 'logo';

-- ---------------------------------------------------------------------------
-- Opening hours
-- ---------------------------------------------------------------------------
-- Modelled as rows rather than jsonb so OpeningHoursSpecification (§7.5.8) can be
-- emitted directly. The reference showed four shapes (3a, variations 6-8):
-- normal ranges, "Closed" days, all-day 00:00-23:59 defaults, and the whole section
-- absent. is_closed and is_24h make those explicit instead of encoding them as
-- magic times, so "always open" is distinguishable from an unset default.

create table opening_hours (
  id          uuid primary key default gen_random_uuid(),
  listing_id  uuid not null references listings(id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6),  -- 0 = Sunday
  opens_at    time,
  closes_at   time,
  is_closed   boolean not null default false,
  is_24h      boolean not null default false,
  sort_order  smallint generated always as (day_of_week) stored,
  unique (listing_id, day_of_week),
  constraint opening_hours_shape check (
    (is_closed and opens_at is null and closes_at is null and not is_24h) or
    (is_24h    and opens_at is null and closes_at is null and not is_closed) or
    (not is_closed and not is_24h and opens_at is not null and closes_at is not null)
  )
);

create index opening_hours_listing_idx on opening_hours(listing_id, day_of_week);

-- ---------------------------------------------------------------------------
-- Amenities / attributes
-- ---------------------------------------------------------------------------

create table amenities (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique,
  name       text not null,
  icon       text,
  sort_order integer not null default 0
);

create table listing_amenities (
  listing_id uuid not null references listings(id)  on delete cascade,
  amenity_id uuid not null references amenities(id) on delete cascade,
  primary key (listing_id, amenity_id)
);

create index listing_amenities_amenity_idx on listing_amenities(amenity_id);
