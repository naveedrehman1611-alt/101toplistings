-- 0002 — categories and the location hierarchy
-- §7.5.3 requires countries -> regions -> cities -> areas as relational entities,
-- each indexed, never a bare text address.
--
-- Design note. The reference site models place as ONE flat self-referencing table:
-- /region/north-america, /region/united-states and /region/california all sit at the
-- same URL depth (reference-analysis.md, "URL patterns"). That is genuinely good for
-- linkability. The spec, however, locks a four-level relational model. We honour the
-- spec for storage and reproduce the flat linkability with location_slugs below, so
-- any level resolves from a single route without a path rewrite.

-- ---------------------------------------------------------------------------
-- Categories
-- ---------------------------------------------------------------------------

create table categories (
  id            uuid primary key default gen_random_uuid(),
  parent_id     uuid references categories(id) on delete set null,
  slug          text not null unique,
  name          text not null,
  description   text,
  icon          text,
  sort_order    integer not null default 0,
  is_featured   boolean not null default false,
  seo_title     text,
  seo_description text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint categories_not_own_parent check (id <> parent_id)
);

create index categories_parent_idx   on categories(parent_id);
create index categories_featured_idx on categories(is_featured) where is_featured;
create index categories_sort_idx     on categories(sort_order, name);

-- ---------------------------------------------------------------------------
-- Location hierarchy: countries -> regions -> cities -> areas
-- ---------------------------------------------------------------------------

create table countries (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  name         text not null,
  iso2         char(2) unique,
  iso3         char(3) unique,
  phone_code   text,
  latitude     double precision,
  longitude    double precision,
  hero_image_id uuid,          -- FK added in 0006 once media exists
  intro_copy   text,
  is_featured  boolean not null default false,
  seo_title    text,
  seo_description text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table regions (
  id          uuid primary key default gen_random_uuid(),
  country_id  uuid not null references countries(id) on delete cascade,
  slug        text not null,
  name        text not null,
  code        text,
  latitude    double precision,
  longitude   double precision,
  hero_image_id uuid,
  intro_copy  text,
  is_featured boolean not null default false,
  seo_title   text,
  seo_description text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (country_id, slug)
);

create table cities (
  id         uuid primary key default gen_random_uuid(),
  region_id  uuid not null references regions(id) on delete cascade,
  slug       text not null,
  name       text not null,
  latitude   double precision,
  longitude  double precision,
  hero_image_id uuid,
  intro_copy text,
  is_featured boolean not null default false,
  seo_title  text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (region_id, slug)
);

create table areas (
  id         uuid primary key default gen_random_uuid(),
  city_id    uuid not null references cities(id) on delete cascade,
  slug       text not null,
  name       text not null,
  latitude   double precision,
  longitude  double precision,
  hero_image_id uuid,
  intro_copy text,
  is_featured boolean not null default false,
  seo_title  text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (city_id, slug)
);

-- §7.5.3 "Index all foreign keys"
create index regions_country_idx on regions(country_id);
create index cities_region_idx   on cities(region_id);
create index areas_city_idx      on areas(city_id);

create index countries_featured_idx on countries(is_featured) where is_featured;
create index cities_featured_idx    on cities(is_featured)    where is_featured;

-- ---------------------------------------------------------------------------
-- Flat slug resolution across all four levels
-- ---------------------------------------------------------------------------
-- Lets /location/[slug] resolve a country, region, city or area from one route,
-- reproducing the reference site's flat linkability on top of the spec's hierarchy.

create view location_slugs as
  select 'country'::text as level, id, slug, name, null::uuid as parent_id,
         latitude, longitude
    from countries
  union all
  select 'region', id, slug, name, country_id, latitude, longitude from regions
  union all
  select 'city',   id, slug, name, region_id,  latitude, longitude from cities
  union all
  select 'area',   id, slug, name, city_id,    latitude, longitude from areas;

-- Slugs must be unique across levels for the flat route to be unambiguous.
-- Enforced by trigger in 0007 rather than a constraint, since it spans four tables.
