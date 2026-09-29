-- full_setup.sql — every migration in supabase/migrations/, 0001 through 0021, in order.
--
-- For rebuilding an EMPTY database in one step (paste into the Supabase SQL Editor
-- and Run). It is not a migration and must not be run on a database that already
-- has this schema: the create type / create table statements would fail.
--
-- Wrapped in one transaction, so a failure part-way leaves the database untouched.
-- Regenerate after adding a migration:
--   (header; for f in supabase/migrations/*.sql; do cat "$f"; done) > supabase/full_setup.sql

begin;


-- =====================================================================
-- 0001_extensions_and_enums.sql
-- =====================================================================

-- 0001 — extensions and enums
-- Locked stack: Supabase (PostgreSQL) + PostGIS (PROMPT.md §1.5, §7.5.4).

create extension if not exists "pgcrypto";      -- gen_random_uuid()
create extension if not exists "postgis";       -- §7.5.4 geographic queries
create extension if not exists "pg_trgm";       -- keyword search on name/description
create extension if not exists "unaccent";      -- accent-insensitive matching

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

-- §9.5.4 roles. Order matters: higher ordinal = more authority (see has_min_role()).
create type user_role as enum (
  'user',
  'business_owner',
  'moderator',
  'editor',
  'admin',
  'super_admin'
);

-- §7.5.2 listing lifecycle. The reference site exposes no status at all; the spec
-- requires approve/reject/suspend (§9.5.4), so the workflow is ours.
create type listing_status as enum ('draft', 'pending', 'approved', 'rejected', 'suspended');

create type verification_status as enum ('unverified', 'pending', 'verified', 'rejected');

create type review_status as enum ('pending', 'approved', 'rejected', 'flagged');

create type media_kind as enum ('cover', 'logo', 'gallery', 'blog_cover', 'og', 'generic');

-- Derived from the section orders observed across reference-analysis.md
-- sections 3a-3e. §9.5.2 requires this be derived, not invented.
create type section_type as enum (
  'hero_search',        -- home hero + search (3c)
  'stats_band',         -- home stats strip (3c)
  'value_props',        -- home 3-up "why" cards (3c)
  'featured_categories',-- home category grid (3c)
  'featured_listings',  -- home newest-listings grid (3c)
  'cta_banner',         -- home closing CTA panel (3c)
  'page_header',        -- archive H1 + intro + count (3b)
  'listing_grid',       -- paginated card grid (3b)
  'taxonomy_grid',      -- /categories, /regions card grids (3b)
  'subregion_chips',    -- region sub-region chip row (3b)
  'listing_hero',       -- detail cover + logo + meta (3a)
  'listing_about',      -- detail description (3a)
  'listing_gallery',    -- detail gallery (3a)
  'listing_hours',      -- detail opening hours table (3a)
  'listing_contact',    -- detail sticky contact card (3a)
  'listing_reviews',    -- detail reviews (3a)
  'related_listings',   -- detail related grid (3a)
  'listing_map',        -- NEW: §7.5.9, absent from the reference
  'blog_hero',          -- blog index hero (3d)
  'blog_sidebar',       -- blog browse/categories sidebar (3d)
  'blog_grid',          -- blog article grid (3d)
  'article_body',       -- blog post body (3d)
  'related_articles',   -- blog post related (3d)
  'rich_text',          -- /about, /privacy, /terms (3e)
  'contact_form',       -- /contact (3e)
  'auth_form',          -- /login, /register, /forgot-password (3e)
  'faq',
  'image_text',
  'logo_strip',
  'testimonials'
);

create type menu_location as enum ('header', 'footer', 'mobile');

create type form_type as enum ('contact', 'claim', 'report', 'review_flag');

create type submission_status as enum ('new', 'in_progress', 'resolved', 'spam');

create type audit_action as enum ('create', 'update', 'delete', 'approve', 'reject', 'suspend', 'restore', 'login');

-- §7.5.5 sort options. Kept as an enum so the URL contract is explicit.
create type listing_sort as enum ('nearest', 'newest', 'oldest', 'rating', 'alphabetical');

-- =====================================================================
-- 0002_taxonomy_and_geo.sql
-- =====================================================================

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

-- =====================================================================
-- 0003_profiles_and_listings.sql
-- =====================================================================

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

-- =====================================================================
-- 0004_reviews_and_engagement.sql
-- =====================================================================

-- 0004 — reviews, favourites, claims
-- The reference site has NO observable review experience: eight listings were sampled
-- and all showed the zero state, no aggregateRating is ever emitted, and the token set
-- contains no star colour (reference-analysis.md, Prompt 5 §6). Criterion 16 still
-- requires reviews, so this is designed rather than copied.

create table reviews (
  id           uuid primary key default gen_random_uuid(),
  listing_id   uuid not null references listings(id) on delete cascade,
  author_id    uuid references profiles(id) on delete set null,
  rating       smallint not null check (rating between 1 and 5),
  title        text,
  body         text,
  status       review_status not null default 'pending',
  -- Owner or admin reply, per §9.5.4 "reply as owner or admin"
  reply_body   text,
  reply_by     uuid references profiles(id) on delete set null,
  replied_at   timestamptz,
  moderated_by uuid references profiles(id) on delete set null,
  moderated_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  -- One review per person per business.
  unique (listing_id, author_id)
);

create index reviews_listing_idx  on reviews(listing_id, status, created_at desc);
create index reviews_author_idx   on reviews(author_id);
create index reviews_moderation_idx on reviews(status, created_at desc) where status in ('pending','flagged');

create table favourites (
  user_id    uuid not null references profiles(id) on delete cascade,
  listing_id uuid not null references listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

create index favourites_listing_idx on favourites(listing_id);

-- §7 "claims" — a business owner asserting ownership of an existing listing.
create table claims (
  id           uuid primary key default gen_random_uuid(),
  listing_id   uuid not null references listings(id) on delete cascade,
  claimant_id  uuid not null references profiles(id) on delete cascade,
  message      text,
  evidence_url text,
  status       submission_status not null default 'new',
  handled_by   uuid references profiles(id) on delete set null,
  handled_at   timestamptz,
  created_at   timestamptz not null default now(),
  unique (listing_id, claimant_id)
);

create index claims_status_idx  on claims(status, created_at desc);
create index claims_listing_idx on claims(listing_id);

-- =====================================================================
-- 0005_blog.sql
-- =====================================================================

-- 0005 — blog
-- Structure from reference-analysis.md Prompt 3d. The reference has /blog,
-- /blog/[slug], /blog/category/[slug] and /blog/tag/[slug], with a sidebar of
-- categories and tags, a featured filter, and a related-articles module.

create table blog_categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  description text,
  sort_order  integer not null default 0,
  seo_title   text,
  seo_description text,
  created_at  timestamptz not null default now()
);

create table blog_tags (
  id   uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null
);

create table blog_posts (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  title         text not null,
  standfirst    text,                    -- the deck under the H1 (3d)
  body          text,                    -- markdown
  category_id   uuid references blog_categories(id) on delete set null,
  author_id     uuid references profiles(id) on delete set null,
  cover_image_id uuid,                   -- FK added in 0006
  read_minutes  smallint,
  is_featured   boolean not null default false,
  is_published  boolean not null default false,
  published_at  timestamptz,
  -- The reference site has a real canonical defect here: one post's canonical points
  -- at a URL that renders empty (reference-analysis.md finding 6). Storing it
  -- explicitly and defaulting to null means we emit a self-canonical unless overridden.
  canonical_url text,
  seo_title     text,
  seo_description text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint blog_published_has_date check (
    (not is_published) or published_at is not null
  )
);

create table blog_post_tags (
  post_id uuid not null references blog_posts(id) on delete cascade,
  tag_id  uuid not null references blog_tags(id)  on delete cascade,
  primary key (post_id, tag_id)
);

create index blog_posts_published_idx on blog_posts(published_at desc) where is_published;
create index blog_posts_category_idx  on blog_posts(category_id);
create index blog_posts_featured_idx  on blog_posts(is_featured) where is_featured and is_published;
create index blog_post_tags_tag_idx   on blog_post_tags(tag_id);

-- =====================================================================
-- 0006_cms_and_settings.sql
-- =====================================================================

-- 0006 — CMS content model, settings, navigation, media, SEO, audit
-- Verbatim from PROMPT.md §9.5.2, which is what makes §9.5.1 possible: no
-- user-visible string may be hardcoded in a component. Every heading, label, image
-- and CTA on the public site is a row in here.

-- ---------------------------------------------------------------------------
-- Media library (§9.5.4)
-- ---------------------------------------------------------------------------

create table media (
  id          uuid primary key default gen_random_uuid(),
  path        text not null unique,       -- Supabase Storage object path
  alt         text,
  width       integer,
  height      integer,
  size_bytes  bigint,
  mime_type   text,
  folder      text,
  uploaded_by uuid references profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);

create index media_folder_idx on media(folder, created_at desc);

-- Deferred foreign keys — media is defined after the tables that reference it.
alter table countries      add constraint countries_hero_fk  foreign key (hero_image_id)  references media(id) on delete set null;
alter table regions        add constraint regions_hero_fk    foreign key (hero_image_id)  references media(id) on delete set null;
alter table cities         add constraint cities_hero_fk     foreign key (hero_image_id)  references media(id) on delete set null;
alter table areas          add constraint areas_hero_fk      foreign key (hero_image_id)  references media(id) on delete set null;
alter table listing_images add constraint listing_images_media_fk foreign key (media_id)  references media(id) on delete cascade;
alter table blog_posts     add constraint blog_posts_cover_fk foreign key (cover_image_id) references media(id) on delete set null;

-- ---------------------------------------------------------------------------
-- Pages and sections — the page builder (§9.5.2, §9.5.3)
-- ---------------------------------------------------------------------------

create table pages (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  route_pattern text not null,          -- e.g. '/', '/listing/[slug]'
  page_type     text not null,          -- matches a template name in page-templates.md
  title         text not null,
  is_published  boolean not null default true,
  -- is_system marks routes that must never be deleted from admin (home, 404, auth).
  -- Disabling them would break the site; §9.5.3 allows editing them, not removing them.
  is_system     boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table page_sections (
  id                 uuid primary key default gen_random_uuid(),
  page_id            uuid not null references pages(id) on delete cascade,
  section_key        text not null,
  section_type       section_type not null,
  sort_order         integer not null default 0,
  is_enabled         boolean not null default true,
  heading            text,
  subheading         text,
  body               text,
  image_id           uuid references media(id) on delete set null,
  cta_label          text,
  cta_url            text,
  background_variant text,
  item_limit         integer,
  settings           jsonb not null default '{}'::jsonb,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  unique (page_id, section_key)
);

create index page_sections_page_idx on page_sections(page_id, sort_order);

-- Manually curated items for a section, when the admin picks rather than
-- letting an automatic rule fill it (§9.5.3 "manual pick or automatic rule").
create table section_items (
  id         uuid primary key default gen_random_uuid(),
  section_id uuid not null references page_sections(id) on delete cascade,
  sort_order integer not null default 0,
  ref_type   text,                       -- 'listing' | 'category' | 'city' | 'blog_post'
  ref_id     uuid,
  title      text,
  body       text,
  image_id   uuid references media(id) on delete set null,
  url        text
);

create index section_items_section_idx on section_items(section_id, sort_order);

-- ---------------------------------------------------------------------------
-- Global settings (§9.5.4)
-- ---------------------------------------------------------------------------
-- Brand name, logo, colours, contact details, social links, feature toggles.
-- D-2 in OPEN-QUESTIONS.md: the brand name lives here, never in JSX, so renaming
-- the whole site is one admin edit.

create table settings (
  key        text primary key,
  value      jsonb not null,
  "group"    text not null default 'general',
  updated_by uuid references profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);

create index settings_group_idx on settings("group");

-- ---------------------------------------------------------------------------
-- Navigation (§9.5.4 menu builder)
-- ---------------------------------------------------------------------------

create table menus (
  id       uuid primary key default gen_random_uuid(),
  location menu_location not null,
  name     text not null,
  unique (location, name)
);

create table menu_items (
  id          uuid primary key default gen_random_uuid(),
  menu_id     uuid not null references menus(id) on delete cascade,
  parent_id   uuid references menu_items(id) on delete cascade,
  label       text not null,
  url         text not null,
  sort_order  integer not null default 0,
  is_external boolean not null default false,
  icon        text,
  is_visible  boolean not null default true,
  -- Footer columns are menu items whose children are the links (3 columns observed).
  column_heading text
);

create index menu_items_menu_idx   on menu_items(menu_id, sort_order);
create index menu_items_parent_idx on menu_items(parent_id);

-- ---------------------------------------------------------------------------
-- SEO manager (§9.5.4)
-- ---------------------------------------------------------------------------

create table seo_meta (
  id               uuid primary key default gen_random_uuid(),
  page_id          uuid references pages(id) on delete cascade,
  route            text,                  -- for routes without a pages row
  title            text,
  description      text,
  og_image_id      uuid references media(id) on delete set null,
  canonical        text,
  robots           text,
  in_sitemap       boolean not null default true,
  schema_overrides jsonb not null default '{}'::jsonb,
  updated_at       timestamptz not null default now(),
  constraint seo_meta_target check (page_id is not null or route is not null)
);

create unique index seo_meta_page_idx  on seo_meta(page_id) where page_id is not null;
create unique index seo_meta_route_idx on seo_meta(route)   where route is not null;

-- ---------------------------------------------------------------------------
-- Redirects and the 404 log (§9.5.4)
-- ---------------------------------------------------------------------------

create table redirects (
  id          uuid primary key default gen_random_uuid(),
  source      text not null unique,
  destination text not null,
  status_code smallint not null default 301 check (status_code in (301, 302, 307, 308)),
  hits        integer not null default 0,
  created_at  timestamptz not null default now()
);

create table not_found_log (
  path       text primary key,
  hits       integer not null default 1,
  last_seen  timestamptz not null default now()
);

create index not_found_hits_idx on not_found_log(hits desc);

-- ---------------------------------------------------------------------------
-- Forms inbox (§9.5.4)
-- ---------------------------------------------------------------------------

create table form_submissions (
  id         uuid primary key default gen_random_uuid(),
  form_type  form_type not null,
  payload    jsonb not null,
  status     submission_status not null default 'new',
  handled_by uuid references profiles(id) on delete set null,
  handled_at timestamptz,
  -- The reference contact form ships a honeypot field (3e). Keeping the flag lets
  -- admin see what was caught instead of silently discarding it.
  is_spam    boolean not null default false,
  created_at timestamptz not null default now()
);

create index form_submissions_inbox_idx on form_submissions(form_type, status, created_at desc);

-- ---------------------------------------------------------------------------
-- Announcements (§9.5.4 site-wide banner)
-- ---------------------------------------------------------------------------

create table announcements (
  id         uuid primary key default gen_random_uuid(),
  body       text not null,
  cta_label  text,
  cta_url    text,
  variant    text not null default 'info',
  starts_at  timestamptz,
  ends_at    timestamptz,
  is_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  constraint announcements_window check (
    starts_at is null or ends_at is null or ends_at > starts_at
  )
);

-- ---------------------------------------------------------------------------
-- Audit log (§9.5.4, criterion 56)
-- ---------------------------------------------------------------------------
-- Every admin write produces a row, with before/after values.

create table audit_logs (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid references profiles(id) on delete set null,
  action      audit_action not null,
  entity_type text not null,
  entity_id   uuid,
  before      jsonb,
  after       jsonb,
  ip_address  inet,
  created_at  timestamptz not null default now()
);

create index audit_logs_entity_idx on audit_logs(entity_type, entity_id, created_at desc);
create index audit_logs_actor_idx  on audit_logs(actor_id, created_at desc);
create index audit_logs_recent_idx on audit_logs(created_at desc);

-- =====================================================================
-- 0007_functions_and_views.sql
-- =====================================================================

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

-- =====================================================================
-- 0008_rls_policies.sql
-- =====================================================================

-- 0008 — Row Level Security
-- §9.5.6: every permission enforced at the database layer AND the route layer.
-- Never trust a client-supplied role — every policy resolves the role server-side
-- through has_min_role(), which reads profiles, not a JWT claim the client controls.
--
-- Criterion 55 requires that privilege escalation as business_owner and as an
-- anonymous user both fail. The shape that guarantees it: anon and authenticated get
-- SELECT on published rows only; writes are owner-scoped or staff-only, with no
-- policy anywhere that lets a row's own columns widen the caller's rights.

alter table profiles           enable row level security;
alter table categories         enable row level security;
alter table countries          enable row level security;
alter table regions            enable row level security;
alter table cities             enable row level security;
alter table areas              enable row level security;
alter table listings           enable row level security;
alter table listing_images     enable row level security;
alter table opening_hours      enable row level security;
alter table amenities          enable row level security;
alter table listing_amenities  enable row level security;
alter table reviews            enable row level security;
alter table favourites         enable row level security;
alter table claims             enable row level security;
alter table blog_categories    enable row level security;
alter table blog_tags          enable row level security;
alter table blog_posts         enable row level security;
alter table blog_post_tags     enable row level security;
alter table media              enable row level security;
alter table pages              enable row level security;
alter table page_sections      enable row level security;
alter table section_items      enable row level security;
alter table settings           enable row level security;
alter table menus              enable row level security;
alter table menu_items         enable row level security;
alter table seo_meta           enable row level security;
alter table redirects          enable row level security;
alter table not_found_log      enable row level security;
alter table form_submissions   enable row level security;
alter table announcements      enable row level security;
alter table audit_logs         enable row level security;

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------
-- A user reads and edits their own profile but CANNOT change their own role —
-- that is the primary escalation path, so role changes are staff-only and enforced
-- by the with-check clause comparing against the existing row.

create policy profiles_self_read on profiles
  for select using (id = auth.uid() or has_min_role('moderator'));

create policy profiles_self_update on profiles
  for update
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and role = (select p.role from profiles p where p.id = auth.uid())
    and is_suspended = (select p.is_suspended from profiles p where p.id = auth.uid())
  );

create policy profiles_admin_all on profiles
  for all using (has_min_role('admin')) with check (has_min_role('admin'));

-- ---------------------------------------------------------------------------
-- Public taxonomy — world-readable, staff-writable
-- ---------------------------------------------------------------------------

do $$
declare t text;
begin
  foreach t in array array[
    'categories','countries','regions','cities','areas','amenities',
    'blog_categories','blog_tags','menus','menu_items','redirects','announcements'
  ] loop
    execute format(
      'create policy %I on %I for select using (true)', t || '_public_read', t);
    execute format(
      'create policy %I on %I for all using (has_min_role(''editor''))
         with check (has_min_role(''editor''))', t || '_editor_write', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Listings
-- ---------------------------------------------------------------------------
-- Public sees approved only. Owners see and edit their own in any status, but may
-- not self-approve: status and verification are pinned to their current values on
-- owner updates, so an owner cannot publish or verify their own listing.

create policy listings_public_read on listings
  for select using (status = 'approved');

create policy listings_owner_read on listings
  for select using (owner_user_id = auth.uid() or has_min_role('moderator'));

create policy listings_owner_insert on listings
  for insert with check (
    owner_user_id = auth.uid()
    and status = 'pending'
    and verification = 'unverified'
  );

create policy listings_owner_update on listings
  for update
  using (owner_user_id = auth.uid())
  with check (
    owner_user_id = auth.uid()
    and status       = (select l.status       from listings l where l.id = listings.id)
    and verification = (select l.verification from listings l where l.id = listings.id)
    and is_featured  = (select l.is_featured  from listings l where l.id = listings.id)
  );

create policy listings_staff_all on listings
  for all using (has_min_role('moderator')) with check (has_min_role('moderator'));

-- Child tables inherit visibility from the parent listing.
create policy listing_images_read on listing_images
  for select using (exists (
    select 1 from listings l where l.id = listing_id
      and (l.status = 'approved' or l.owner_user_id = auth.uid() or has_min_role('moderator'))));

create policy listing_images_write on listing_images
  for all using (exists (
    select 1 from listings l where l.id = listing_id
      and (l.owner_user_id = auth.uid() or has_min_role('moderator'))))
  with check (exists (
    select 1 from listings l where l.id = listing_id
      and (l.owner_user_id = auth.uid() or has_min_role('moderator'))));

create policy opening_hours_read on opening_hours
  for select using (exists (
    select 1 from listings l where l.id = listing_id
      and (l.status = 'approved' or l.owner_user_id = auth.uid() or has_min_role('moderator'))));

create policy opening_hours_write on opening_hours
  for all using (exists (
    select 1 from listings l where l.id = listing_id
      and (l.owner_user_id = auth.uid() or has_min_role('moderator'))))
  with check (exists (
    select 1 from listings l where l.id = listing_id
      and (l.owner_user_id = auth.uid() or has_min_role('moderator'))));

create policy listing_amenities_read on listing_amenities
  for select using (exists (
    select 1 from listings l where l.id = listing_id and l.status = 'approved'));

create policy listing_amenities_write on listing_amenities
  for all using (exists (
    select 1 from listings l where l.id = listing_id
      and (l.owner_user_id = auth.uid() or has_min_role('moderator'))))
  with check (exists (
    select 1 from listings l where l.id = listing_id
      and (l.owner_user_id = auth.uid() or has_min_role('moderator'))));

-- ---------------------------------------------------------------------------
-- Reviews
-- ---------------------------------------------------------------------------
-- Anyone reads approved reviews. A signed-in user writes their own, always as
-- 'pending' — self-approval is the escalation to block here. Only the listing owner
-- or staff may set a reply.

create policy reviews_public_read on reviews
  for select using (status = 'approved' or author_id = auth.uid() or has_min_role('moderator'));

create policy reviews_author_insert on reviews
  for insert with check (author_id = auth.uid() and status = 'pending');

create policy reviews_author_update on reviews
  for update
  using (author_id = auth.uid())
  with check (
    author_id = auth.uid()
    and status = 'pending'
    and reply_body is null
  );

create policy reviews_author_delete on reviews
  for delete using (author_id = auth.uid());

create policy reviews_staff_all on reviews
  for all using (has_min_role('moderator')) with check (has_min_role('moderator'));

-- ---------------------------------------------------------------------------
-- Favourites and claims — strictly per-user
-- ---------------------------------------------------------------------------

create policy favourites_own on favourites
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy claims_own_read on claims
  for select using (claimant_id = auth.uid() or has_min_role('moderator'));

create policy claims_own_insert on claims
  for insert with check (claimant_id = auth.uid() and status = 'new');

create policy claims_staff_all on claims
  for all using (has_min_role('moderator')) with check (has_min_role('moderator'));

-- ---------------------------------------------------------------------------
-- Blog
-- ---------------------------------------------------------------------------

create policy blog_posts_public_read on blog_posts
  for select using (is_published or has_min_role('editor'));

create policy blog_posts_editor_write on blog_posts
  for all using (has_min_role('editor')) with check (has_min_role('editor'));

create policy blog_post_tags_read on blog_post_tags
  for select using (exists (
    select 1 from blog_posts b where b.id = post_id and (b.is_published or has_min_role('editor'))));

create policy blog_post_tags_write on blog_post_tags
  for all using (has_min_role('editor')) with check (has_min_role('editor'));

-- ---------------------------------------------------------------------------
-- CMS content — public reads only what is published and enabled
-- ---------------------------------------------------------------------------

create policy pages_public_read on pages
  for select using (is_published or has_min_role('editor'));

create policy pages_editor_write on pages
  for all using (has_min_role('editor')) with check (has_min_role('editor'));

create policy page_sections_public_read on page_sections
  for select using (
    (is_enabled and exists (select 1 from pages p where p.id = page_id and p.is_published))
    or has_min_role('editor'));

create policy page_sections_editor_write on page_sections
  for all using (has_min_role('editor')) with check (has_min_role('editor'));

create policy section_items_public_read on section_items
  for select using (exists (
    select 1 from page_sections s where s.id = section_id and (s.is_enabled or has_min_role('editor'))));

create policy section_items_editor_write on section_items
  for all using (has_min_role('editor')) with check (has_min_role('editor'));

create policy media_public_read on media for select using (true);
create policy media_editor_write on media
  for all using (has_min_role('editor')) with check (has_min_role('editor'));

create policy seo_meta_public_read on seo_meta for select using (true);
create policy seo_meta_editor_write on seo_meta
  for all using (has_min_role('editor')) with check (has_min_role('editor'));

-- Settings are world-readable because the public site renders brand name, logo and
-- contact details from them (§9.5.1). Anything secret belongs in env vars, never here.
create policy settings_public_read on settings for select using (true);
create policy settings_admin_write on settings
  for all using (has_min_role('admin')) with check (has_min_role('admin'));

-- ---------------------------------------------------------------------------
-- Submissions, logs and audit
-- ---------------------------------------------------------------------------
-- Anyone may submit a contact form; nobody but staff may read the inbox.

create policy form_submissions_insert on form_submissions
  for insert with check (true);

create policy form_submissions_staff_read on form_submissions
  for select using (has_min_role('moderator'));

create policy form_submissions_staff_write on form_submissions
  for update using (has_min_role('moderator')) with check (has_min_role('moderator'));

create policy not_found_staff on not_found_log
  for all using (has_min_role('admin')) with check (has_min_role('admin'));

-- Audit log is append-only from the application's perspective: staff read it,
-- nobody updates or deletes it. Writes come from SECURITY DEFINER server code.
create policy audit_logs_staff_read on audit_logs
  for select using (has_min_role('admin'));

-- =====================================================================
-- 0009_security_hardening.sql
-- =====================================================================

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

-- =====================================================================
-- 0010_profile_on_signup.sql
-- =====================================================================

-- Every auth user needs a matching profiles row: the role lives there, and
-- getCurrentUser() treats a missing profile as signed out. Without this trigger
-- a freshly registered user could authenticate but never be recognised.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id, role, display_name)
  values (
    new.id,
    'user',                                  -- never trust signup metadata for role
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

insert into public.profiles (id, role, display_name)
select u.id, 'user', split_part(u.email, '@', 1)
  from auth.users u
  left join public.profiles p on p.id = u.id
 where p.id is null;

-- =====================================================================
-- 0011_audit_log_insert_policy.sql
-- =====================================================================

-- Found by probing RLS as a real signed-in admin before shipping: audit_logs
-- had a SELECT policy but no INSERT policy, so with RLS enabled every insert
-- was denied. The admin actions would have appeared to succeed while silently
-- recording nothing, leaving criterion 56 unmet.
--
-- Staff may append. actor_id is pinned to auth.uid() so an entry cannot be
-- attributed to someone else. There is deliberately still no UPDATE or DELETE
-- policy: an audit trail that can be rewritten is not an audit trail.
create policy audit_logs_staff_insert on audit_logs
  for insert
  with check (has_min_role('moderator') and actor_id = auth.uid());

-- =====================================================================
-- 0012_search_performance.sql
-- =====================================================================

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

-- =====================================================================
-- 0013_base_content.sql
-- =====================================================================

-- 0013 — base site content
--
-- The schema ships with no rows, and the site renders every heading, menu and
-- brand string from the database (§9.5.1). On a fresh project that meant a bare
-- header, an empty footer and a home page with no sections — and admin could not
-- fix it, because Settings and Pages only edit rows that already exist.
--
-- This inserts the structural content the code reads: settings keys, the pages
-- and section keys each route looks up, and the four menus the layout renders.
-- It adds no businesses, categories or cities; those are real content and are
-- entered through admin.
--
-- Safe to re-run: every insert skips rows that already exist, so admin edits are
-- never overwritten.

-- ---------------------------------------------------------------------------
-- Settings
-- ---------------------------------------------------------------------------

insert into settings (key, value, "group") values
  ('brand.name',                      to_jsonb('RankYouSite'::text), 'brand'),
  ('brand.tagline',                   to_jsonb('Find trusted local businesses near you.'::text), 'brand'),
  ('brand.domain',                    to_jsonb('rankyousite.com'::text), 'brand'),
  ('contact.email',                   to_jsonb('hello@rankyousite.com'::text), 'contact'),
  ('footer.copyright',                to_jsonb('RankYouSite'::text), 'general'),
  ('seo.default_title',               to_jsonb('RankYouSite — local business directory'::text), 'seo'),
  ('seo.default_description',         to_jsonb('Search local businesses by name, category and city, with real addresses, opening hours and reviews.'::text), 'seo'),
  ('seo.location_page_min_listings',  to_jsonb(3), 'seo')
on conflict (key) do nothing;

-- ---------------------------------------------------------------------------
-- Pages
-- ---------------------------------------------------------------------------

insert into pages (slug, route_pattern, page_type, title, is_system) values
  ('home',       '/',           'home',          'Home',       true),
  ('listings',   '/listings',   'listing_index', 'Listings',   true),
  ('categories', '/categories', 'taxonomy',      'Categories', true),
  ('blog',       '/blog',       'blog_index',    'Blog',       true),
  ('about',      '/about',      'static',        'About',      false),
  ('contact',    '/contact',    'contact',       'Contact',    false)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- Sections — keys match the findSection() calls in src/app
-- ---------------------------------------------------------------------------

insert into page_sections
  (page_id, section_key, section_type, sort_order, heading, subheading, cta_label, cta_url, item_limit)
select p.id, s.section_key, s.section_type::section_type, s.sort_order,
       s.heading, s.subheading, s.cta_label, s.cta_url, s.item_limit
  from (values
    ('home', 'hero', 'hero_search', 10,
       'Find trusted local businesses',
       'Search by name, category or city. Every listing is reviewed before it goes live.',
       null, null, null),
    ('home', 'categories', 'featured_categories', 20,
       'Browse by category', 'Start with what you need.',
       'All categories', '/categories', 8),
    ('home', 'featured', 'featured_listings', 30,
       'Newest listings', 'Recently added and approved.',
       'View all', '/listings', 6),
    ('home', 'cities', 'taxonomy_grid', 40,
       'Popular cities', 'Businesses near you.',
       null, null, 8),
    ('home', 'cta', 'cta_banner', 50,
       'Own a business?', 'Add it for free. We review every listing before it is published.',
       'Add your business', '/dashboard/listings/new', null),
    ('listings',   'header', 'page_header', 10, 'All listings',
       'Every approved business in the directory.', null, null, null),
    ('categories', 'header', 'page_header', 10, 'Categories',
       'Browse businesses by what they do.', null, null, null),
    ('blog',       'header', 'blog_hero',   10, 'Blog',
       'Guides and news for local businesses and the people who use them.', null, null, null),
    ('about',      'header', 'page_header', 10, 'About RankYouSite',
       'A directory of local businesses, checked by people before it is published.', null, null, null),
    ('contact',    'header', 'page_header', 10, 'Contact us',
       'Questions, corrections or a listing request — send us a message.', null, null, null)
  ) as s(page_slug, section_key, section_type, sort_order, heading, subheading, cta_label, cta_url, item_limit)
  join pages p on p.slug = s.page_slug
on conflict (page_id, section_key) do nothing;

-- ---------------------------------------------------------------------------
-- Menus — names match the getMenu() calls in src/app/layout.tsx
-- ---------------------------------------------------------------------------

insert into menus (location, name) values
  ('header', 'Primary'),
  ('mobile', 'Mobile'),
  ('footer', 'Explore'),
  ('footer', 'Company')
on conflict (location, name) do nothing;

-- menu_items has no natural key, so a menu is filled only while it is empty.
-- That keeps re-runs from duplicating links and leaves admin-edited menus alone.
insert into menu_items (menu_id, label, url, sort_order)
select m.id, i.label, i.url, i.sort_order
  from (values
    ('header', 'Primary', 'Listings',   '/listings',   10),
    ('header', 'Primary', 'Categories', '/categories', 20),
    ('header', 'Primary', 'Blog',       '/blog',       30),
    ('header', 'Primary', 'Contact',    '/contact',    40),
    ('mobile', 'Mobile',  'Listings',   '/listings',   10),
    ('mobile', 'Mobile',  'Categories', '/categories', 20),
    ('mobile', 'Mobile',  'Blog',       '/blog',       30),
    ('mobile', 'Mobile',  'About',      '/about',      40),
    ('mobile', 'Mobile',  'Contact',    '/contact',    50),
    ('mobile', 'Mobile',  'Add your business', '/dashboard/listings/new', 60),
    ('footer', 'Explore', 'Listings',   '/listings',   10),
    ('footer', 'Explore', 'Categories', '/categories', 20),
    ('footer', 'Explore', 'Search',     '/search',     30),
    ('footer', 'Company', 'About',      '/about',      10),
    ('footer', 'Company', 'Blog',       '/blog',       20),
    ('footer', 'Company', 'Contact',    '/contact',    30),
    ('footer', 'Company', 'Sign in',    '/login',      40)
  ) as i(location, menu_name, label, url, sort_order)
  join menus m on m.location = i.location::menu_location and m.name = i.menu_name
 where not exists (select 1 from menu_items x where x.menu_id = m.id);

-- =====================================================================
-- 0014_review_author_name.sql
-- =====================================================================

-- 0014 — reviewer display name
--
-- Reviews are public but profiles are not (profiles_self_read), so an anonymous
-- visitor cannot join a review to its author's name. The name shown on a review
-- is copied onto the review when it is written, which also keeps it stable if
-- the author later renames their profile.

alter table reviews add column if not exists author_name text;

alter table reviews drop constraint if exists reviews_author_name_length;
alter table reviews add constraint reviews_author_name_length
  check (author_name is null or char_length(author_name) <= 80);

-- =====================================================================
-- 0015_media_storage.sql
-- =====================================================================

-- 0015: Supabase Storage for the media library and listing photos.
--
-- Two kinds of object live in one public bucket, told apart by path:
--
--   library/<yyyy>/<uuid>.<ext>                 the admin media library (editors)
--   listings/<uploader uid>/<listing id>/<uuid>.<ext>
--                                               a listing's cover, logo and gallery
--
-- The uploader's uid is in the listing path so an owner's write rights can be
-- expressed as a path prefix that RLS can check without a lookup. The listing id
-- is in it too, so the insert policy can confirm the uploader manages that listing.
--
-- Safe to re-run: the bucket insert does nothing if it exists, and every policy
-- is dropped before it is created.

-- ---------------------------------------------------------------------------
-- Bucket
-- ---------------------------------------------------------------------------
-- Public, so pages render images from the CDN URL
-- (/storage/v1/object/public/media/<path>) with no signed-URL round trip. Public
-- only affects reads; writes still go through the policies below.
--
-- The 5 MB limit and mime allowlist are a backstop enforced by Storage itself.
-- The app validates first (and more strictly, by magic bytes), because Server
-- Action bodies on Vercel are capped at 4.5 MB anyway.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  5 * 1024 * 1024,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- A policy helper that PostgREST does not expose
-- ---------------------------------------------------------------------------
-- 0009 notes that SECURITY DEFINER helpers in `public` are callable over the REST
-- API and that the real fix is a schema PostgREST does not serve. This helper is
-- new, so it starts there. It is SECURITY INVOKER: the listings lookup runs as
-- the caller under the caller's own RLS, which already lets an owner see their
-- listing and a moderator see every listing — the same rule as listing_images.
--
-- Returns true when `p_path` is a listing-photo path under the caller's own uid
-- prefix, for a listing the caller owns or moderates.
create schema if not exists private;
grant usage on schema private to authenticated;

create or replace function private.can_write_listing_photo(p_path text)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select
    p_path ~ '^listings/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[A-Za-z0-9._-]+$'
    and split_part(p_path, '/', 2) = auth.uid()::text
    and exists (
      select 1
        from public.listings l
       -- The regex above has already proved segment 3 is a uuid; the CASE keeps
       -- the cast from ever running on anything else, since AND does not
       -- guarantee evaluation order.
       where l.id = case
                      when p_path ~ '^listings/[^/]+/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/'
                      then split_part(p_path, '/', 3)::uuid
                    end
         and (l.owner_user_id = auth.uid() or public.has_min_role('moderator'))
    );
$$;

revoke execute on function private.can_write_listing_photo(text) from public, anon;
grant execute on function private.can_write_listing_photo(text) to authenticated;

-- ---------------------------------------------------------------------------
-- storage.objects policies
-- ---------------------------------------------------------------------------
-- Why public.has_min_role() works here: policy expressions are stored as parse
-- trees bound to function OIDs when the policy is created, so the caller's
-- search_path at evaluation time does not matter (it is schema-qualified anyway
-- for readability). The function still needs EXECUTE for the querying role, and
-- it has it: 0009's revokes from anon/authenticated never removed PostgreSQL's
-- default PUBLIC grant, as that migration documents. It is SECURITY DEFINER, so
-- its read of profiles is not blocked by the caller's rights. Storage evaluates
-- these policies as the `authenticated` role with the user's JWT, so auth.uid()
-- is the uploader.

drop policy if exists media_public_read on storage.objects;
create policy media_public_read on storage.objects
  for select using (bucket_id = 'media');

-- Editors and above manage the whole bucket, including the library/ folder.
drop policy if exists media_staff_insert on storage.objects;
create policy media_staff_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'media' and public.has_min_role('editor'));

drop policy if exists media_staff_update on storage.objects;
create policy media_staff_update on storage.objects
  for update to authenticated
  using (bucket_id = 'media' and public.has_min_role('editor'))
  with check (bucket_id = 'media' and public.has_min_role('editor'));

drop policy if exists media_staff_delete on storage.objects;
create policy media_staff_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'media' and public.has_min_role('editor'));

-- Owners (and moderators, who edit listings but are below editor) may write only
-- under listings/<their uid>/<a listing they manage>/.
drop policy if exists media_listing_photo_insert on storage.objects;
create policy media_listing_photo_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'media' and private.can_write_listing_photo(name));

drop policy if exists media_listing_photo_update on storage.objects;
create policy media_listing_photo_update on storage.objects
  for update to authenticated
  using (bucket_id = 'media' and private.can_write_listing_photo(name))
  with check (bucket_id = 'media' and private.can_write_listing_photo(name));

-- Deleting needs no listing check: an uploader may always clean up their own
-- prefix (even after the listing is gone or changes hands), and moderators may
-- remove any listing photo, since they can already remove the listing_images row.
drop policy if exists media_listing_photo_delete on storage.objects;
create policy media_listing_photo_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'media'
    and name like 'listings/%'
    and (split_part(name, '/', 2) = auth.uid()::text or public.has_min_role('moderator'))
  );

-- ---------------------------------------------------------------------------
-- public.media policies for listing photos
-- ---------------------------------------------------------------------------
-- 0008 keeps media editor-write. These add the narrow case where an owner or a
-- moderator records a photo they just uploaded for a listing they manage.

drop policy if exists media_listing_photo_insert on media;
create policy media_listing_photo_insert on media
  for insert to authenticated
  with check (
    uploaded_by = auth.uid()
    and folder = 'listings'
    and private.can_write_listing_photo(path)
  );

drop policy if exists media_listing_photo_delete on media;
create policy media_listing_photo_delete on media
  for delete to authenticated
  using (
    folder = 'listings'
    and path like 'listings/%'
    and (uploaded_by = auth.uid() or public.has_min_role('moderator'))
  );

-- =====================================================================
-- 0016_seo_redirects.sql
-- =====================================================================

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

-- =====================================================================
-- 0017_seed_pakistan_and_categories.sql
-- =====================================================================

-- 0017 — starter locations (Pakistan) and business categories
--
-- A fresh database has no cities, and the listing form needs a city, so
-- nobody could add a business. This seeds Pakistan's provinces and
-- territories with its larger cities, plus a set of common categories. All of
-- it is ordinary content: admin can rename, feature or delete any row.
--
-- Safe to re-run. Locations use "where not exists" rather than
-- "on conflict": the cross-level slug trigger (0007) raises before an
-- ON CONFLICT arbiter would be consulted, so a re-run would otherwise fail.
-- Coordinates are city centres, good enough for distance and "near me".

insert into countries (slug, name, iso2, iso3, phone_code, latitude, longitude)
select 'pakistan', 'Pakistan', 'PK', 'PAK', '+92', 30.3753, 69.3451
 where not exists (select 1 from countries where slug = 'pakistan');

insert into regions (country_id, slug, name, code, latitude, longitude)
select c.id, r.slug, r.name, r.code, r.lat, r.lng
  from countries c
 cross join (values
   ('punjab',                      'Punjab',                      'PB', 31.1704, 72.7097),
   ('sindh',                       'Sindh',                       'SD', 25.8943, 68.5247),
   ('khyber-pakhtunkhwa',          'Khyber Pakhtunkhwa',          'KP', 34.9526, 72.3311),
   ('balochistan',                 'Balochistan',                 'BA', 28.4907, 65.0958),
   ('islamabad-capital-territory', 'Islamabad Capital Territory', 'IS', 33.7205, 73.0405),
   ('gilgit-baltistan',            'Gilgit-Baltistan',            'GB', 35.8026, 74.9832),
   ('azad-kashmir',                'Azad Jammu and Kashmir',      'JK', 33.9259, 73.7810)
 ) as r(slug, name, code, lat, lng)
 where c.slug = 'pakistan'
   and not exists (select 1 from location_slugs l where l.slug = r.slug);

insert into cities (region_id, slug, name, latitude, longitude, is_featured)
select g.id, x.slug, x.name, x.lat, x.lng, x.featured
  from regions g
  join (values
    -- Punjab
    ('punjab', 'lahore',            'Lahore',            31.5204, 74.3587, true),
    ('punjab', 'faisalabad',        'Faisalabad',        31.4504, 73.1350, true),
    ('punjab', 'rawalpindi',        'Rawalpindi',        33.5651, 73.0169, true),
    ('punjab', 'multan',            'Multan',            30.1575, 71.5249, true),
    ('punjab', 'gujranwala',        'Gujranwala',        32.1877, 74.1945, false),
    ('punjab', 'sialkot',           'Sialkot',           32.4945, 74.5229, false),
    ('punjab', 'bahawalpur',        'Bahawalpur',        29.3544, 71.6911, false),
    ('punjab', 'sargodha',          'Sargodha',          32.0740, 72.6861, false),
    ('punjab', 'sheikhupura',       'Sheikhupura',       31.7167, 73.9850, false),
    ('punjab', 'gujrat',            'Gujrat',            32.5731, 74.1005, false),
    ('punjab', 'sahiwal',           'Sahiwal',           30.6682, 73.1114, false),
    ('punjab', 'rahim-yar-khan',    'Rahim Yar Khan',    28.4202, 70.2952, false),
    -- Sindh
    ('sindh', 'karachi',            'Karachi',           24.8607, 67.0011, true),
    ('sindh', 'hyderabad',          'Hyderabad',         25.3960, 68.3578, false),
    ('sindh', 'sukkur',             'Sukkur',            27.7052, 68.8574, false),
    ('sindh', 'larkana',            'Larkana',           27.5570, 68.2264, false),
    ('sindh', 'nawabshah',          'Nawabshah',         26.2442, 68.4100, false),
    -- Khyber Pakhtunkhwa
    ('khyber-pakhtunkhwa', 'peshawar',         'Peshawar',         34.0151, 71.5249, true),
    ('khyber-pakhtunkhwa', 'mardan',           'Mardan',           34.1989, 72.0231, false),
    ('khyber-pakhtunkhwa', 'abbottabad',       'Abbottabad',       34.1688, 73.2215, false),
    ('khyber-pakhtunkhwa', 'mingora',          'Mingora (Swat)',   34.7717, 72.3600, false),
    ('khyber-pakhtunkhwa', 'dera-ismail-khan', 'Dera Ismail Khan', 31.8314, 70.9019, false),
    -- Balochistan
    ('balochistan', 'quetta',       'Quetta',            30.1798, 66.9750, true),
    ('balochistan', 'gwadar',       'Gwadar',            25.1264, 62.3225, false),
    -- Territories
    ('islamabad-capital-territory', 'islamabad', 'Islamabad', 33.6844, 73.0479, true),
    ('gilgit-baltistan',            'gilgit',    'Gilgit',    35.9208, 74.3080, false),
    ('azad-kashmir',                'muzaffarabad', 'Muzaffarabad', 34.3700, 73.4711, false)
  ) as x(region_slug, slug, name, lat, lng, featured) on g.slug = x.region_slug
 where not exists (select 1 from location_slugs l where l.slug = x.slug);

-- Categories carry no cross-table slug trigger, so ON CONFLICT is enough.
insert into categories (slug, name, description, sort_order, is_featured) values
  ('restaurants',       'Restaurants',          'Restaurants, cafes, bakeries and takeaways.',            10, true),
  ('doctors',           'Doctors & Clinics',    'General physicians, specialists and clinics.',           20, true),
  ('dentists',          'Dentists',             'Dental clinics and orthodontists.',                      30, true),
  ('hospitals',         'Hospitals',            'Hospitals, labs and diagnostic centres.',                40, false),
  ('pharmacies',        'Pharmacies',           'Chemists and medical stores.',                           50, false),
  ('beauty-salons',     'Beauty Salons & Spas', 'Salons, barbers, spas and bridal makeup.',               60, true),
  ('gyms',              'Gyms & Fitness',       'Gyms, fitness studios and trainers.',                    70, false),
  ('schools',           'Schools & Academies',  'Schools, tuition centres and training institutes.',      80, true),
  ('real-estate',       'Real Estate',          'Property dealers, builders and developers.',             90, true),
  ('car-repair',        'Car Repair',           'Mechanics, workshops, tyres and car wash.',             100, false),
  ('car-dealers',       'Car Dealers',          'New and used car showrooms and rentals.',               110, false),
  ('plumbers',          'Plumbers',             'Plumbing, water tanks and sanitary work.',              120, true),
  ('electricians',      'Electricians',         'Electrical repair, wiring, solar and UPS.',             130, true),
  ('ac-repair',         'AC & Appliance Repair','Air conditioner, fridge and appliance servicing.',      140, false),
  ('lawyers',           'Lawyers',              'Law firms, advocates and legal consultants.',           150, false),
  ('accountants',       'Accountants & Tax',    'Accountants, tax consultants and auditors.',            160, false),
  ('hotels',            'Hotels & Guest Houses','Hotels, guest houses and short stays.',                 170, false),
  ('travel-agents',     'Travel Agents',        'Travel, tickets, visas, Hajj and Umrah.',               180, false),
  ('shopping',          'Shopping & Retail',    'Shops, supermarkets, clothing and electronics.',        190, false),
  ('it-services',       'IT & Web Services',    'Software houses, web design, repair and internet.',     200, false),
  ('event-services',    'Events & Wedding',     'Marquees, caterers, photographers and decorators.',     210, false),
  ('home-services',     'Home Services',        'Cleaning, pest control, movers and carpenters.',        220, false)
on conflict (slug) do nothing;

-- =====================================================================
-- 0018_brand_name_and_new_pages.sql
-- =====================================================================

-- 0018 — one brand name, and the pages behind /services, /privacy and /terms
--
-- The brand was spelled three ways across the site ("Rank Your Site" in the home
-- title, "RankYouSite" in page titles, "RankYourSite" on the About page). Search
-- engines read those as different names, so every stored copy is normalised to
-- "RankYouSite", which matches the domain (rankyousite.com) and the code default.
--
-- It also adds the page rows for the new routes, so their headings can be edited
-- in admin (Pages only edits rows that already exist).
--
-- Safe to re-run: the renames only touch text that still has an old spelling,
-- and the inserts skip rows that already exist.

-- ---------------------------------------------------------------------------
-- Brand name
-- ---------------------------------------------------------------------------

update settings
   set value = to_jsonb(regexp_replace(value #>> '{}', 'Rank[ ]?Your[ ]?Site|Rank You Site', 'RankYouSite', 'gi')),
       updated_at = now()
 where jsonb_typeof(value) = 'string'
   and value #>> '{}' ~* 'Rank[ ]?Your[ ]?Site|Rank You Site';

update page_sections
   set heading    = regexp_replace(heading,    'Rank[ ]?Your[ ]?Site|Rank You Site', 'RankYouSite', 'gi'),
       subheading = regexp_replace(subheading, 'Rank[ ]?Your[ ]?Site|Rank You Site', 'RankYouSite', 'gi'),
       body       = regexp_replace(body,       'Rank[ ]?Your[ ]?Site|Rank You Site', 'RankYouSite', 'gi'),
       cta_label  = regexp_replace(cta_label,  'Rank[ ]?Your[ ]?Site|Rank You Site', 'RankYouSite', 'gi'),
       updated_at = now()
 where concat_ws(' ', heading, subheading, body, cta_label) ~* 'Rank[ ]?Your[ ]?Site|Rank You Site';

update seo_meta
   set title       = regexp_replace(title,       'Rank[ ]?Your[ ]?Site|Rank You Site', 'RankYouSite', 'gi'),
       description = regexp_replace(description, 'Rank[ ]?Your[ ]?Site|Rank You Site', 'RankYouSite', 'gi')
 where concat_ws(' ', title, description) ~* 'Rank[ ]?Your[ ]?Site|Rank You Site';

update menu_items
   set label = regexp_replace(label, 'Rank[ ]?Your[ ]?Site|Rank You Site', 'RankYouSite', 'gi')
 where label ~* 'Rank[ ]?Your[ ]?Site|Rank You Site';

-- ---------------------------------------------------------------------------
-- Pages for the new routes
-- ---------------------------------------------------------------------------

insert into pages (slug, route_pattern, page_type, title, is_system) values
  ('services', '/services', 'static', 'SEO services',   false),
  ('privacy',  '/privacy',  'static', 'Privacy policy', false),
  ('terms',    '/terms',    'static', 'Terms of use',   false)
on conflict (slug) do nothing;

insert into page_sections
  (page_id, section_key, section_type, sort_order, heading, subheading)
select p.id, 'header', 'page_header'::section_type, 10,
       'SEO services for local businesses',
       'RankYouSite helps businesses across Pakistan get found on Google — in local search, on Maps and on the directory itself.'
  from pages p
 where p.slug = 'services'
on conflict (page_id, section_key) do nothing;

-- =====================================================================
-- 0018_review_criteria.sql
-- =====================================================================

-- 0018 — per-aspect review ratings
--
-- The listing page asks for an overall rating plus three optional aspects:
-- service, hospitality and pricing. The overall score stays in reviews.rating,
-- which is the only column the rating aggregate trigger reads, so these columns
-- change no existing behaviour. They are nullable: reviews written before this
-- migration, and aspects a reviewer skips, have no value.

alter table reviews add column if not exists rating_service     smallint;
alter table reviews add column if not exists rating_hospitality smallint;
alter table reviews add column if not exists rating_pricing     smallint;

alter table reviews drop constraint if exists reviews_rating_service_range;
alter table reviews add constraint reviews_rating_service_range
  check (rating_service is null or rating_service between 1 and 5);

alter table reviews drop constraint if exists reviews_rating_hospitality_range;
alter table reviews add constraint reviews_rating_hospitality_range
  check (rating_hospitality is null or rating_hospitality between 1 and 5);

alter table reviews drop constraint if exists reviews_rating_pricing_range;
alter table reviews add constraint reviews_rating_pricing_range
  check (rating_pricing is null or rating_pricing between 1 and 5);

-- =====================================================================
-- 0018_seed_uk_us_uae.sql
-- =====================================================================

-- 0018 — starter locations for the launch markets: UK, US and UAE
--
-- The site no longer targets Pakistan. This seeds the United Kingdom (its four
-- nations), the United States (the states of the starter cities) and the
-- United Arab Emirates (all seven emirates), each with its larger cities. It
-- mirrors src/lib/starter-data.ts, which the admin "Load starter data" button
-- inserts. All of it is ordinary content: admin can rename, feature or delete
-- any row.
--
-- Pakistan's rows from 0017 are kept (listings may point at them) but no
-- longer featured. countries has no active/published flag, so un-featuring is
-- the only switch; delete them in Admin -> Locations once nothing uses them.
--
-- Location slugs are unique across countries, regions and cities (0007
-- trigger), so where a region and its main city share a name the region slug
-- carries a suffix: new-york-state / new-york, dubai-emirate / dubai.
--
-- Safe to re-run. Locations use "where not exists" rather than
-- "on conflict", for the same reason as 0017: the cross-level slug trigger
-- raises before an ON CONFLICT arbiter would be consulted.
-- Coordinates are city centres, good enough for distance and "near me".

insert into countries (slug, name, iso2, iso3, phone_code, latitude, longitude)
select c.slug, c.name, c.iso2, c.iso3, c.phone_code, c.lat, c.lng
  from (values
    ('united-kingdom',       'United Kingdom',       'GB', 'GBR', '+44',  55.3781, -3.4360),
    ('united-states',        'United States',        'US', 'USA', '+1',   37.0902, -95.7129),
    ('united-arab-emirates', 'United Arab Emirates', 'AE', 'ARE', '+971', 23.4241, 53.8478)
  ) as c(slug, name, iso2, iso3, phone_code, lat, lng)
 where not exists (select 1 from location_slugs l where l.slug = c.slug)
   and not exists (select 1 from countries x where x.iso2 = c.iso2 or x.iso3 = c.iso3);

insert into regions (country_id, slug, name, code, latitude, longitude)
select c.id, r.slug, r.name, r.code, r.lat, r.lng
  from countries c
  join (values
    -- United Kingdom
    ('united-kingdom',       'england',                'England',              'ENG', 52.3555, -1.1743),
    ('united-kingdom',       'scotland',               'Scotland',             'SCT', 56.4907, -4.2026),
    ('united-kingdom',       'wales',                  'Wales',                'WLS', 52.1307, -3.7837),
    ('united-kingdom',       'northern-ireland',       'Northern Ireland',     'NIR', 54.7877, -6.4923),
    -- United States
    ('united-states',        'new-york-state',         'New York',             'NY',  43.2994, -74.2179),
    ('united-states',        'california',             'California',           'CA',  36.7783, -119.4179),
    ('united-states',        'illinois',               'Illinois',             'IL',  40.6331, -89.3985),
    ('united-states',        'texas',                  'Texas',                'TX',  31.9686, -99.9018),
    ('united-states',        'florida',                'Florida',              'FL',  27.6648, -81.5158),
    ('united-states',        'arizona',                'Arizona',              'AZ',  34.0489, -111.0937),
    ('united-states',        'washington',             'Washington',           'WA',  47.7511, -120.7401),
    ('united-states',        'massachusetts',          'Massachusetts',        'MA',  42.4072, -71.3824),
    ('united-states',        'nevada',                 'Nevada',               'NV',  38.8026, -116.4194),
    ('united-states',        'district-of-columbia',   'District of Columbia', 'DC',  38.9072, -77.0369),
    -- United Arab Emirates
    ('united-arab-emirates', 'abu-dhabi-emirate',      'Abu Dhabi',            'AZ',  23.4677, 53.7369),
    ('united-arab-emirates', 'dubai-emirate',          'Dubai',                'DU',  25.0657, 55.1713),
    ('united-arab-emirates', 'sharjah-emirate',        'Sharjah',              'SH',  25.2867, 55.6206),
    ('united-arab-emirates', 'ajman-emirate',          'Ajman',                'AJ',  25.4052, 55.5136),
    ('united-arab-emirates', 'umm-al-quwain-emirate',  'Umm Al Quwain',        'UQ',  25.5205, 55.7134),
    ('united-arab-emirates', 'ras-al-khaimah-emirate', 'Ras Al Khaimah',       'RK',  25.6741, 55.9804),
    ('united-arab-emirates', 'fujairah-emirate',       'Fujairah',             'FU',  25.4111, 56.2482)
  ) as r(country_slug, slug, name, code, lat, lng) on c.slug = r.country_slug
 where not exists (select 1 from location_slugs l where l.slug = r.slug);

insert into cities (region_id, slug, name, latitude, longitude, is_featured)
select g.id, x.slug, x.name, x.lat, x.lng, x.featured
  from regions g
  join countries c on c.id = g.country_id
  join (values
    -- United Kingdom
    ('united-kingdom',       'england',                'london',               'London',               51.5074,  -0.1278,   true),
    ('united-kingdom',       'england',                'manchester',           'Manchester',           53.4808,  -2.2426,   true),
    ('united-kingdom',       'england',                'birmingham',           'Birmingham',           52.4862,  -1.8904,   true),
    ('united-kingdom',       'england',                'leeds',                'Leeds',                53.8008,  -1.5491,   false),
    ('united-kingdom',       'england',                'liverpool',            'Liverpool',            53.4084,  -2.9916,   false),
    ('united-kingdom',       'england',                'bristol',              'Bristol',              51.4545,  -2.5879,   false),
    ('united-kingdom',       'england',                'sheffield',            'Sheffield',            53.3811,  -1.4701,   false),
    ('united-kingdom',       'england',                'newcastle-upon-tyne',  'Newcastle upon Tyne',  54.9783,  -1.6178,   false),
    ('united-kingdom',       'scotland',               'edinburgh',            'Edinburgh',            55.9533,  -3.1883,   true),
    ('united-kingdom',       'scotland',               'glasgow',              'Glasgow',              55.8642,  -4.2518,   true),
    ('united-kingdom',       'wales',                  'cardiff',              'Cardiff',              51.4816,  -3.1791,   false),
    ('united-kingdom',       'northern-ireland',       'belfast',              'Belfast',              54.5973,  -5.9301,   false),
    -- United States
    ('united-states',        'new-york-state',         'new-york',             'New York',             40.7128,  -74.0060,  true),
    ('united-states',        'california',             'los-angeles',          'Los Angeles',          34.0522,  -118.2437, true),
    ('united-states',        'california',             'san-francisco',        'San Francisco',        37.7749,  -122.4194, false),
    ('united-states',        'illinois',               'chicago',              'Chicago',              41.8781,  -87.6298,  true),
    ('united-states',        'texas',                  'houston',              'Houston',              29.7604,  -95.3698,  true),
    ('united-states',        'texas',                  'dallas',               'Dallas',               32.7767,  -96.7970,  false),
    ('united-states',        'florida',                'miami',                'Miami',                25.7617,  -80.1918,  true),
    ('united-states',        'arizona',                'phoenix',              'Phoenix',              33.4484,  -112.0740, false),
    ('united-states',        'washington',             'seattle',              'Seattle',              47.6062,  -122.3321, false),
    ('united-states',        'massachusetts',          'boston',               'Boston',               42.3601,  -71.0589,  false),
    ('united-states',        'nevada',                 'las-vegas',            'Las Vegas',            36.1699,  -115.1398, false),
    ('united-states',        'district-of-columbia',   'washington-dc',        'Washington, D.C.',     38.9072,  -77.0369,  false),
    -- United Arab Emirates
    ('united-arab-emirates', 'dubai-emirate',          'dubai',                'Dubai',                25.2048,  55.2708,   true),
    ('united-arab-emirates', 'abu-dhabi-emirate',      'abu-dhabi',            'Abu Dhabi',            24.4539,  54.3773,   true),
    ('united-arab-emirates', 'abu-dhabi-emirate',      'al-ain',               'Al Ain',               24.2075,  55.7447,   false),
    ('united-arab-emirates', 'sharjah-emirate',        'sharjah',              'Sharjah',              25.3463,  55.4209,   true),
    ('united-arab-emirates', 'ajman-emirate',          'ajman',                'Ajman',                25.4052,  55.5136,   false),
    ('united-arab-emirates', 'umm-al-quwain-emirate',  'umm-al-quwain',        'Umm Al Quwain',        25.5647,  55.5552,   false),
    ('united-arab-emirates', 'ras-al-khaimah-emirate', 'ras-al-khaimah',       'Ras Al Khaimah',       25.8007,  55.9762,   false),
    ('united-arab-emirates', 'fujairah-emirate',       'fujairah',             'Fujairah',             25.1288,  56.3265,   false)
  ) as x(country_slug, region_slug, slug, name, lat, lng, featured)
    on c.slug = x.country_slug and g.slug = x.region_slug
 where not exists (select 1 from location_slugs l where l.slug = x.slug);

-- Stop promoting Pakistan. Rows stay, so listings that reference them keep working.
update countries set is_featured = false where slug = 'pakistan' and is_featured;
update regions   set is_featured = false
 where is_featured and country_id in (select id from countries where slug = 'pakistan');
update cities    set is_featured = false
 where is_featured and region_id in (
   select r.id from regions r join countries c on c.id = r.country_id where c.slug = 'pakistan');

-- =====================================================================
-- 0019_profile_from_oauth.sql
-- =====================================================================

-- 0019 — profiles for Google (OAuth) sign-ins
--
-- 0010's handle_new_user() only read `display_name`, which our email signup
-- form sets. Google-created users carry `full_name` / `name` and
-- `avatar_url` / `picture` in raw_user_meta_data instead, so they ended up
-- named after their email prefix. Same trigger, same 'user' role (metadata is
-- still never trusted for role) — it just reads the provider's fields too.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  avatar text := coalesce(meta ->> 'avatar_url', meta ->> 'picture');
begin
  insert into public.profiles (id, role, display_name, avatar_url)
  values (
    new.id,
    'user',                                  -- never trust signup metadata for role
    left(coalesce(
      nullif(btrim(meta ->> 'display_name'), ''),
      nullif(btrim(meta ->> 'full_name'), ''),
      nullif(btrim(meta ->> 'name'), ''),
      split_part(new.email, '@', 1)
    ), 80),
    case when avatar like 'https://%' then avatar end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- =====================================================================
-- 0020_categories_for_uk_us_uae.sql
-- =====================================================================

-- 0020 — category descriptions for the UK, US and UAE
--
-- 0017 wrote category descriptions for the Pakistan market (property dealers,
-- solar and UPS, marquees, Hajj and Umrah). This rewords them for the new
-- markets. Slugs and names are unchanged, and a description is only replaced
-- while it still holds the original 0017 text, so admin edits are kept.

update categories c
   set description = v.new_description
  from (values
  ('schools', 'Schools, tuition centres and training institutes.', 'Schools, tutoring centres and training institutes.'),
  ('pharmacies', 'Chemists and medical stores.', 'Pharmacies, chemists and drugstores.'),
  ('real-estate', 'Property dealers, builders and developers.', 'Estate agents, realtors, builders and developers.'),
  ('plumbers', 'Plumbing, water tanks and sanitary work.', 'Plumbing, heating, boilers and bathroom fitting.'),
  ('electricians', 'Electrical repair, wiring, solar and UPS.', 'Electrical repair, wiring, EV chargers and solar panels.'),
  ('ac-repair', 'Air conditioner, fridge and appliance servicing.', 'Air conditioning, heating and appliance servicing.'),
  ('lawyers', 'Law firms, advocates and legal consultants.', 'Law firms, solicitors, attorneys and legal consultants.'),
  ('accountants', 'Accountants, tax consultants and auditors.', 'Accountants, tax advisers, CPAs and auditors.'),
  ('hotels', 'Hotels, guest houses and short stays.', 'Hotels, B&Bs, serviced apartments and short stays.'),
  ('travel-agents', 'Travel, tickets, visas, Hajj and Umrah.', 'Travel agents, tours, flights and visa services.'),
  ('it-services', 'Software houses, web design, repair and internet.', 'IT support, web design, software development and computer repair.'),
  ('event-services', 'Marquees, caterers, photographers and decorators.', 'Venues, caterers, photographers and event planners.')
  ) as v(slug, old_description, new_description)
 where c.slug = v.slug
   and c.description = v.old_description;

-- =====================================================================
-- 0021_smartbizdir_homepage.sql
-- =====================================================================

-- 0021 — homepage rebuild (SmartBizDir layout): page builder fields, taxonomy, content, newsletter
--
-- The homepage is now rendered section by section from page_sections in
-- sort_order, by section_type (src/lib/home.ts), so editors can reorder,
-- disable, add and fill sections from Admin → Pages & sections. This migration:
--
--   1. adds the per-item fields the section editor needs (subtitle, icon,
--      enabled flag) and a newsletter_subscribers table;
--   2. loads the SmartBizDir category tree (18 parents) and the cities the
--      reference site lists, adopting matching 0017 starter rows;
--   3. makes search_listings match a parent category's children, so choosing
--      "Health & Medical" in the hero search also finds "Doctors";
--   4. seeds the homepage sections, their items, the menus and the settings the
--      header and footer read.
--
-- Safe to re-run, and it never overwrites an admin edit: rows are inserted only
-- when missing, and existing rows are changed only while they still hold the
-- exact default values an earlier migration wrote. Copy may contain the token
-- {brand}, which the site replaces with the brand.name setting when rendering.

-- ===========================================================================
-- 1. Schema
-- ===========================================================================

alter table section_items add column if not exists subtitle   text;
alter table section_items add column if not exists icon       text;
alter table section_items add column if not exists is_enabled boolean not null default true;
alter table section_items add column if not exists created_at timestamptz not null default now();
alter table section_items add column if not exists updated_at timestamptz not null default now();

do $$ begin
  alter table section_items add constraint section_items_ref_type_check
    check (ref_type is null or ref_type in ('listing', 'category', 'city', 'blog_post'));
exception when duplicate_object then null;
end $$;

drop trigger if exists section_items_updated_touch on section_items;
create trigger section_items_updated_touch before update on section_items
  for each row execute function touch_updated_at();

-- What a business card needs beyond search_listings: the phone number and a
-- short excerpt. Cut to 200 characters in the database so a card never pulls a
-- full description across the wire. security_invoker keeps the caller's RLS.
create or replace view public_listing_cards
with (security_invoker = true)
as
  select id,
         phone_primary,
         left(btrim(regexp_replace(coalesce(description, ''), '\s+', ' ', 'g')), 200) as excerpt
    from public_listings;

grant select on public_listing_cards to anon, authenticated;

-- Newsletter sign-ups from the footer form. Its own table rather than
-- form_submissions: an address should be stored once, which needs a unique
-- constraint, and the inbox is for messages that need a reply.
create table if not exists newsletter_subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique,
  source     text,
  status     text not null default 'active',
  created_at timestamptz not null default now(),
  constraint newsletter_email_format check (
    email = lower(email) and length(email) <= 254 and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  ),
  constraint newsletter_status_check check (status in ('active', 'unsubscribed'))
);

create index if not exists newsletter_subscribers_recent_idx
  on newsletter_subscribers(created_at desc);

alter table newsletter_subscribers enable row level security;

-- Visitors never write the table directly: a plain insert answers 201 for a
-- new address and 409 for a known one, so anyone holding the public key could
-- test whether an address is on the list. They subscribe through
-- subscribe_newsletter() below, which answers identically either way.
drop policy if exists newsletter_public_insert on newsletter_subscribers;

drop policy if exists newsletter_staff_read on newsletter_subscribers;
create policy newsletter_staff_read on newsletter_subscribers
  for select using (has_min_role('moderator'));

drop policy if exists newsletter_staff_update on newsletter_subscribers;
create policy newsletter_staff_update on newsletter_subscribers
  for update using (has_min_role('moderator')) with check (has_min_role('moderator'));

drop policy if exists newsletter_admin_delete on newsletter_subscribers;
create policy newsletter_admin_delete on newsletter_subscribers
  for delete using (has_min_role('admin'));

create or replace function subscribe_newsletter(p_email text, p_source text default null)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_email text := lower(btrim(coalesce(p_email, '')));
begin
  if length(v_email) > 254 or v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    raise exception 'invalid email address' using errcode = '22023';
  end if;
  -- An address already on the list, subscribed or not, is left as it is:
  -- typing it in again must not undo somebody's unsubscribe.
  insert into newsletter_subscribers (email, source)
  values (v_email, left(nullif(btrim(p_source), ''), 40))
  on conflict (email) do nothing;
end;
$$;

revoke execute on function subscribe_newsletter(text, text) from public;
grant execute on function subscribe_newsletter(text, text) to anon, authenticated;

-- ===========================================================================
-- 2. Taxonomy — SmartBizDir's 18 parent categories and their children
-- ===========================================================================
-- Parent slugs match the reference site's category URLs. Its duplicated
-- children are merged: Catering lives under Food & Restaurant, Rent a Car under
-- Automotive, and Electricians/Plumbers under Home Services.

insert into categories (slug, name, sort_order)
values
  ('agriculture-farming',      'Agriculture & Farming',      10),
  ('automotive',               'Automotive',                 20),
  ('beauty-spa',               'Beauty & Spa',               30),
  ('construction-real-estate', 'Construction & Real Estate', 40),
  ('education-training',       'Education & Training',       50),
  ('events-entertainment',     'Events & Entertainment',     60),
  ('finance-banking',          'Finance & Banking',          70),
  ('food-restaurant',          'Food & Restaurant',          80),
  ('health-medical',           'Health & Medical',           90),
  ('home-services',            'Home Services',             100),
  ('hotels-travel',            'Hotels & Travel',           110),
  ('it-technology',            'IT & Technology',           120),
  ('law-legal-services',       'Law & Legal Services',      130),
  ('manufacturing-industry',   'Manufacturing & Industry',  140),
  ('media-advertising',        'Media & Advertising',       150),
  ('professional-services',    'Professional Services',     160),
  ('retail-shopping',          'Retail & Shopping',         170),
  ('sports-fitness',           'Sports & Fitness',          180)
on conflict (slug) do nothing;

-- A child whose slug already exists as a top-level 0017 starter row, still under
-- its starter name, is adopted into the tree (and renamed to the tree's name)
-- rather than duplicated. Anything an editor has renamed or re-parented is left
-- exactly as it is.
insert into categories (parent_id, slug, name, sort_order)
select p.id, c.slug, c.name, c.sort_order
  from (values
    ('agriculture-farming', 'agricultural-machinery', 'Agricultural Machinery', 10),
    ('agriculture-farming', 'dairy-farms',            'Dairy Farms',            20),
    ('agriculture-farming', 'fertilizers',            'Fertilizers',            30),
    ('agriculture-farming', 'fish-farms',             'Fish Farms',             40),
    ('agriculture-farming', 'livestock',              'Livestock',              50),
    ('agriculture-farming', 'poultry-farms',          'Poultry Farms',          60),
    ('agriculture-farming', 'seeds',                  'Seeds',                  70),
    ('automotive', 'auto-electricians', 'Auto Electricians', 10),
    ('automotive', 'auto-workshops',    'Auto Workshops',    20),
    ('automotive', 'bike-dealers',      'Bike Dealers',      30),
    ('automotive', 'car-dealers',       'Car Dealers',       40),
    ('automotive', 'car-wash',          'Car Wash',          50),
    ('automotive', 'oil-change',        'Oil Change',        60),
    ('automotive', 'rent-a-car',        'Rent a Car',        70),
    ('automotive', 'spare-parts',       'Spare Parts',       80),
    ('automotive', 'tyre-shops',        'Tyre Shops',        90),
    ('beauty-spa', 'barbers',       'Barbers',       10),
    ('beauty-spa', 'beauty-salons', 'Beauty Salons', 20),
    ('beauty-spa', 'bridal-makeup', 'Bridal Makeup', 30),
    ('beauty-spa', 'hair-salons',   'Hair Salons',   40),
    ('beauty-spa', 'makeup-artists','Makeup Artists',50),
    ('beauty-spa', 'nail-salons',   'Nail Salons',   60),
    ('beauty-spa', 'skin-clinics',  'Skin Clinics',  70),
    ('beauty-spa', 'spa',           'Spa',           80),
    ('construction-real-estate', 'architects',            'Architects',            10),
    ('construction-real-estate', 'builders',              'Builders',              20),
    ('construction-real-estate', 'construction-material', 'Construction Material', 30),
    ('construction-real-estate', 'contractors',           'Contractors',           40),
    ('construction-real-estate', 'interior-designers',    'Interior Designers',    50),
    ('construction-real-estate', 'paint-services',        'Paint Services',        60),
    ('construction-real-estate', 'real-estate-agents',    'Real Estate Agents',    70),
    ('education-training', 'coaching-centers',    'Coaching Centers',    10),
    ('education-training', 'colleges',            'Colleges',            20),
    ('education-training', 'it-training',         'IT Training',         30),
    ('education-training', 'language-institutes', 'Language Institutes', 40),
    ('education-training', 'online-courses',      'Online Courses',      50),
    ('education-training', 'quran-academies',     'Quran Academies',     60),
    ('education-training', 'schools',             'Schools',             70),
    ('education-training', 'tuition-centers',     'Tuition Centers',     80),
    ('education-training', 'universities',        'Universities',        90),
    ('events-entertainment', 'decorators',            'Decorators',            10),
    ('events-entertainment', 'djs',                   'DJs',                   20),
    ('events-entertainment', 'event-planners',        'Event Planners',        30),
    ('events-entertainment', 'marquee-banquet-halls', 'Marquee/Banquet Halls', 40),
    ('events-entertainment', 'photographers',         'Photographers',         50),
    ('events-entertainment', 'videographers',         'Videographers',         60),
    ('events-entertainment', 'wedding-planners',      'Wedding Planners',      70),
    ('finance-banking', 'accountants',        'Accountants',        10),
    ('finance-banking', 'banks',              'Banks',              20),
    ('finance-banking', 'insurance',          'Insurance',          30),
    ('finance-banking', 'investment-advisors','Investment Advisors',40),
    ('finance-banking', 'loan-services',      'Loan Services',      50),
    ('finance-banking', 'microfinance',       'Microfinance',       60),
    ('finance-banking', 'money-transfer',     'Money Transfer',     70),
    ('finance-banking', 'tax-consultants',    'Tax Consultants',    80),
    ('food-restaurant', 'bakeries',        'Bakeries',        10),
    ('food-restaurant', 'bbq',             'BBQ',             20),
    ('food-restaurant', 'cafes',           'Cafes',           30),
    ('food-restaurant', 'catering',        'Catering',        40),
    ('food-restaurant', 'fast-food',       'Fast Food',       50),
    ('food-restaurant', 'home-chefs',      'Home Chefs',      60),
    ('food-restaurant', 'ice-cream-shops', 'Ice Cream Shops', 70),
    ('food-restaurant', 'pizza',           'Pizza',           80),
    ('food-restaurant', 'restaurants',     'Restaurants',     90),
    ('food-restaurant', 'sweet-shops',     'Sweet Shops',    100),
    ('health-medical', 'ambulance-services', 'Ambulance Services', 10),
    ('health-medical', 'clinics',            'Clinics',            20),
    ('health-medical', 'dental-clinics',     'Dental Clinics',     30),
    ('health-medical', 'doctors',            'Doctors',            40),
    ('health-medical', 'eye-clinics',        'Eye Clinics',        50),
    ('health-medical', 'hospitals',          'Hospitals',          60),
    ('health-medical', 'labs',               'Labs',               70),
    ('health-medical', 'medical-stores',     'Medical Stores',     80),
    ('health-medical', 'pharmacies',         'Pharmacies',         90),
    ('health-medical', 'physiotherapy',      'Physiotherapy',     100),
    ('home-services', 'ac-repair',        'AC Repair',        10),
    ('home-services', 'appliance-repair', 'Appliance Repair', 20),
    ('home-services', 'carpenter',        'Carpenter',        30),
    ('home-services', 'electricians',     'Electricians',     40),
    ('home-services', 'home-cleaning',    'Home Cleaning',    50),
    ('home-services', 'mason',            'Mason',            60),
    ('home-services', 'painter',          'Painter',          70),
    ('home-services', 'pest-control',     'Pest Control',     80),
    ('home-services', 'plumbers',         'Plumbers',         90),
    ('hotels-travel', 'guest-houses',        'Guest Houses',        10),
    ('hotels-travel', 'hotels',              'Hotels',              20),
    ('hotels-travel', 'ticketing-agents',    'Ticketing Agents',    30),
    ('hotels-travel', 'tour-operators',      'Tour Operators',      40),
    ('hotels-travel', 'travel-agencies',     'Travel Agencies',     50),
    ('hotels-travel', 'umrah-hajj-services', 'Umrah/Hajj Services', 60),
    ('hotels-travel', 'visa-consultants',    'Visa Consultants',    70),
    ('it-technology', 'app-development',   'App Development',   10),
    ('it-technology', 'computer-shops',    'Computer Shops',    20),
    ('it-technology', 'cyber-security',    'Cyber Security',    30),
    ('it-technology', 'digital-marketing', 'Digital Marketing', 40),
    ('it-technology', 'hosting-companies', 'Hosting Companies', 50),
    ('it-technology', 'it-support',        'IT Support',        60),
    ('it-technology', 'seo-agencies',      'SEO Agencies',      70),
    ('it-technology', 'software-houses',   'Software Houses',   80),
    ('it-technology', 'web-development',   'Web Development',   90),
    ('law-legal-services', 'advocates',         'Advocates',         10),
    ('law-legal-services', 'corporate-lawyers', 'Corporate Lawyers', 20),
    ('law-legal-services', 'family-lawyers',    'Family Lawyers',    30),
    ('law-legal-services', 'law-firms',         'Law Firms',         40),
    ('law-legal-services', 'legal-consultants', 'Legal Consultants', 50),
    ('law-legal-services', 'notary-public',     'Notary Public',     60),
    ('law-legal-services', 'property-lawyers',  'Property Lawyers',  70),
    ('law-legal-services', 'tax-lawyers',       'Tax Lawyers',       80),
    ('manufacturing-industry', 'factories',           'Factories',           10),
    ('manufacturing-industry', 'industrial-supplies', 'Industrial Supplies', 20),
    ('manufacturing-industry', 'machinery',           'Machinery',           30),
    ('manufacturing-industry', 'packaging',           'Packaging',           40),
    ('manufacturing-industry', 'plastic-products',    'Plastic Products',    50),
    ('manufacturing-industry', 'printing-press',      'Printing Press',      60),
    ('manufacturing-industry', 'steel-works',         'Steel Works',         70),
    ('manufacturing-industry', 'textile',             'Textile',             80),
    ('media-advertising', 'advertising-agencies',    'Advertising Agencies',    10),
    ('media-advertising', 'content-writing',         'Content Writing',         20),
    ('media-advertising', 'pr-agencies',             'PR Agencies',             30),
    ('media-advertising', 'printing-agencies',       'Printing Agencies',       40),
    ('media-advertising', 'signboards',              'Signboards',              50),
    ('media-advertising', 'social-media-marketing',  'Social Media Marketing',  60),
    ('media-advertising', 'video-production',        'Video Production',        70),
    ('professional-services', 'business-consultants',  'Business Consultants',  10),
    ('professional-services', 'consultants',           'Consultants',           20),
    ('professional-services', 'freelancers',           'Freelancers',           30),
    ('professional-services', 'graphic-designers',     'Graphic Designers',     40),
    ('professional-services', 'hr-services',           'HR Services',           50),
    ('professional-services', 'recruitment-agencies',  'Recruitment Agencies',  60),
    ('professional-services', 'translation-services',  'Translation Services',  70),
    ('retail-shopping', 'book-stores',    'Book Stores',    10),
    ('retail-shopping', 'clothing',       'Clothing',       20),
    ('retail-shopping', 'electronics',    'Electronics',    30),
    ('retail-shopping', 'furniture',      'Furniture',      40),
    ('retail-shopping', 'general-stores', 'General Stores', 50),
    ('retail-shopping', 'gift-shops',     'Gift Shops',     60),
    ('retail-shopping', 'jewelry',        'Jewelry',        70),
    ('retail-shopping', 'mobile-shops',   'Mobile Shops',   80),
    ('retail-shopping', 'shoes',          'Shoes',          90),
    ('retail-shopping', 'supermarkets',   'Supermarkets',  100),
    ('sports-fitness', 'fitness-centers',   'Fitness Centers',   10),
    ('sports-fitness', 'gyms',              'Gyms',              20),
    ('sports-fitness', 'martial-arts',      'Martial Arts',      30),
    ('sports-fitness', 'personal-trainers', 'Personal Trainers', 40),
    ('sports-fitness', 'sports-shops',      'Sports Shops',      50),
    ('sports-fitness', 'swimming-pools',    'Swimming Pools',    60),
    ('sports-fitness', 'yoga-centers',      'Yoga Centers',      70)
  ) as c(parent_slug, slug, name, sort_order)
  join categories p on p.slug = c.parent_slug
on conflict (slug) do update
   set parent_id  = excluded.parent_id,
       name       = excluded.name,
       sort_order = excluded.sort_order
 where categories.parent_id is null
   and categories.name in (
     'Restaurants', 'Doctors & Clinics', 'Hospitals', 'Pharmacies', 'Beauty Salons & Spas',
     'Gyms & Fitness', 'Schools & Academies', 'Car Dealers', 'Plumbers', 'Electricians',
     'AC & Appliance Repair', 'Accountants & Tax', 'Hotels & Guest Houses'
   );

-- 0017 starter categories the tree replaces. Removed only while unused by any
-- listing and still under their starter name; otherwise they stay for an editor
-- to merge by hand.
delete from categories c
 where (c.slug, c.name) in (
         ('dentists',       'Dentists'),
         ('real-estate',    'Real Estate'),
         ('car-repair',     'Car Repair'),
         ('lawyers',        'Lawyers'),
         ('travel-agents',  'Travel Agents'),
         ('shopping',       'Shopping & Retail'),
         ('it-services',    'IT & Web Services'),
         ('event-services', 'Events & Wedding'))
   and c.parent_id is null
   and not exists (select 1 from categories k where k.parent_id = c.id)
   and not exists (select 1 from listings l where l.category_id = c.id or l.subcategory_id = c.id);

-- ===========================================================================
-- 2b. Cities the reference site lists that 0017 did not seed
-- ===========================================================================
-- District headquarters are used for district-level entries (Diamer → Chilas,
-- Ghizer → Gahkuch, Jaffarabad → Dera Allah Yar, Lasbela → Uthal).

insert into cities (region_id, slug, name, latitude, longitude)
select g.id, x.slug, x.name, x.lat, x.lng
  from regions g
  join (values
    ('punjab', 'chakwal',          'Chakwal',          32.9328, 72.8630),
    ('punjab', 'dera-ghazi-khan',  'Dera Ghazi Khan',  30.0561, 70.6348),
    ('punjab', 'jhang',            'Jhang',            31.2681, 72.3181),
    ('punjab', 'khanewal',         'Khanewal',         30.3017, 71.9321),
    ('punjab', 'layyah',           'Layyah',           30.9693, 70.9428),
    ('punjab', 'mandi-bahauddin',  'Mandi Bahauddin',  32.5861, 73.4917),
    ('punjab', 'muzaffargarh',     'Muzaffargarh',     30.0736, 71.1805),
    ('punjab', 'okara',            'Okara',            30.8138, 73.4534),
    ('punjab', 'rawat',            'Rawat',            33.4960, 73.1960),
    ('punjab', 'toba-tek-singh',   'Toba Tek Singh',   30.9709, 72.4827),
    ('punjab', 'vehari',           'Vehari',           30.0452, 72.3489),
    ('sindh', 'badin',             'Badin',            24.6559, 68.8370),
    ('sindh', 'jacobabad',         'Jacobabad',        28.2769, 68.4514),
    ('sindh', 'khairpur',          'Khairpur',         27.5295, 68.7592),
    ('sindh', 'mirpur-khas',       'Mirpur Khas',      25.5276, 69.0111),
    ('sindh', 'thatta',            'Thatta',           24.7461, 67.9235),
    ('khyber-pakhtunkhwa', 'bannu',     'Bannu',     32.9854, 70.6027),
    ('khyber-pakhtunkhwa', 'charsadda', 'Charsadda', 34.1482, 71.7406),
    ('khyber-pakhtunkhwa', 'haripur',   'Haripur',   33.9946, 72.9106),
    ('khyber-pakhtunkhwa', 'kohat',     'Kohat',     33.5869, 71.4429),
    ('khyber-pakhtunkhwa', 'mansehra',  'Mansehra',  34.3300, 73.1968),
    ('khyber-pakhtunkhwa', 'swat',      'Swat',      34.7470, 72.3570),
    ('balochistan', 'chaman',     'Chaman',     30.9210, 66.4597),
    ('balochistan', 'jaffarabad', 'Jaffarabad', 28.3736, 68.3502),
    ('balochistan', 'khuzdar',    'Khuzdar',    27.8119, 66.6100),
    ('balochistan', 'lasbela',    'Lasbela',    25.8000, 66.6200),
    ('balochistan', 'panjgur',    'Panjgur',    26.9644, 64.0903),
    ('balochistan', 'sibi',       'Sibi',       29.5430, 67.8773),
    ('balochistan', 'turbat',     'Turbat',     26.0023, 63.0440),
    ('balochistan', 'zhob',       'Zhob',       31.3406, 69.4494),
    ('gilgit-baltistan', 'diamer', 'Diamer', 35.4206, 74.0950),
    ('gilgit-baltistan', 'ghizer', 'Ghizer', 36.1667, 73.7667),
    ('gilgit-baltistan', 'hunza',  'Hunza',  36.3167, 74.6500),
    ('gilgit-baltistan', 'skardu', 'Skardu', 35.2971, 75.6333)
  ) as x(region_slug, slug, name, lat, lng) on g.slug = x.region_slug
 where not exists (select 1 from location_slugs l where l.slug = x.slug);

-- ===========================================================================
-- 3. search_listings — a category filter also matches its child categories
-- ===========================================================================
-- Identical to 0012_search_performance.sql except for the category predicate.
-- Same signature and result columns, so existing grants and callers are kept.
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
    -- A parent category also matches listings filed under its children. The
    -- subquery is planned per call like the rest of this WHERE clause, and
    -- category_id = any(...) can still use listings_category_recent_idx.
    v_where := v_where || ' and (l.category_id = any(array(select c.id from categories c'
                       || ' where c.id = $2 or c.parent_id = $2))'
                       || ' or l.subcategory_id = $2)';
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

-- ===========================================================================
-- 4. Settings read by the header, footer and homepage
-- ===========================================================================

insert into settings (key, value, "group") values
  ('brand.name_accent',          to_jsonb(''::text), 'brand'),
  ('brand.logo_light_media_id',  to_jsonb(''::text), 'brand'),
  ('brand.logo_dark_media_id',   to_jsonb(''::text), 'brand'),
  ('header.login_label',         to_jsonb('Login'::text), 'header'),
  ('header.login_url',           to_jsonb('/login'::text), 'header'),
  ('header.register_label',      to_jsonb('Sign Up'::text), 'header'),
  ('header.register_url',        to_jsonb('/register'::text), 'header'),
  ('header.cta_label',           to_jsonb('Add Listing'::text), 'header'),
  ('header.cta_url',             to_jsonb('/dashboard/listings/new'::text), 'header'),
  ('footer.tagline',             to_jsonb('Covering All of Pakistan From Karachi to Lahore, Islamabad to Peshawar'::text), 'footer'),
  ('footer.locations_heading',   to_jsonb('Locations'::text), 'footer'),
  ('footer.links_heading',       to_jsonb('Useful Links'::text), 'footer'),
  ('footer.newsletter_heading',  to_jsonb('Newsletter'::text), 'footer'),
  ('footer.newsletter_text',     to_jsonb('Subscribe for local business updates'::text), 'footer'),
  ('footer.newsletter_placeholder', to_jsonb('Email'::text), 'footer'),
  ('footer.newsletter_button',   to_jsonb('Subscribe'::text), 'footer'),
  ('contact.phone',              to_jsonb(''::text), 'contact'),
  ('contact.address',            to_jsonb(''::text), 'contact'),
  ('social.facebook',            to_jsonb(''::text), 'social'),
  ('social.instagram',           to_jsonb(''::text), 'social'),
  ('social.x',                   to_jsonb(''::text), 'social'),
  ('social.linkedin',            to_jsonb(''::text), 'social'),
  ('social.youtube',             to_jsonb(''::text), 'social')
on conflict (key) do nothing;

-- The site keeps the RankYouSite brand. An earlier draft of this migration
-- (shipped as update_0017_to_0018.sql) renamed the 0013 defaults to SmartBizDir
-- and pointed the social links at SmartBizDir's accounts; if that draft was
-- run, put back exactly what it changed. Rows an admin has edited since are
-- left alone.
update settings set value = to_jsonb('RankYouSite'::text)
 where key = 'brand.name' and value = to_jsonb('SmartBizDir'::text);
update settings set value = to_jsonb('rankyousite.com'::text)
 where key = 'brand.domain' and value = to_jsonb('smartbizdir.com'::text);
update settings set value = to_jsonb('Find trusted local businesses near you.'::text)
 where key = 'brand.tagline'
   and value = to_jsonb('Discover, compare, and contact local businesses across Pakistan.'::text);
update settings set value = to_jsonb('RankYouSite'::text)
 where key = 'footer.copyright' and value = to_jsonb('Smart Biz Dir – All rights reserved'::text);
update settings set value = to_jsonb('RankYouSite — local business directory'::text)
 where key = 'seo.default_title'
   and value = to_jsonb('Business Directory Pakistan | Find Local Services'::text);
update settings set value = to_jsonb('Search local businesses by name, category and city, with real addresses, opening hours and reviews.'::text)
 where key = 'seo.default_description'
   and value = to_jsonb('Explore Business Directory Pakistan to find restaurants, doctors, shops, professionals, and local services by category, city, or area.'::text);
update settings set value = to_jsonb(''::text)
 where key = 'brand.name_accent' and value = to_jsonb('Dir'::text);
update settings set value = to_jsonb(''::text)
 where (key, value) in (
   ('social.facebook',  to_jsonb('https://www.facebook.com/smartbizdir/'::text)),
   ('social.instagram', to_jsonb('https://www.instagram.com/smartbizdir/'::text)),
   ('social.x',         to_jsonb('https://x.com/smartbizdir'::text)));

-- The draft also seeded SmartBizDir's customers as testimonial names (no
-- quotes). Remove them while they still have no quote.
delete from section_items i
 using page_sections s, pages p
 where i.section_id = s.id and s.page_id = p.id and p.slug = 'home'
   and s.section_key = 'testimonials' and i.body is null and i.image_id is null
   and (i.title, i.subtitle) in (
     ('Mudassir', 'Business Owner'), ('Asad Saleem', 'Business Owner'),
     ('Aqsa Asghar', 'Developer'), ('Zunaira', 'Business Owner'),
     ('Mateen Awan', 'Business Owner'));

-- ===========================================================================
-- 5. Menus
-- ===========================================================================
-- The header and mobile menus are replaced only while they still hold exactly
-- the 0013 default links. The two footer columns become "Locations" and
-- "Useful Links"; "Explore" is removed only if it is still the 0013 default.

do $$
declare
  m        record;
  current  text[];
  defaults text[];
begin
  for m in
    select mn.id, mn.location::text as location
      from menus mn
     where (mn.location::text, mn.name) in (('header', 'Primary'), ('mobile', 'Mobile'))
  loop
    select coalesce(array_agg(url order by url), '{}') into current
      from menu_items where menu_id = m.id;
    if m.location = 'header' then
      defaults := array['/blog', '/categories', '/contact', '/listings'];
    else
      defaults := array['/about', '/blog', '/categories', '/contact', '/dashboard/listings/new', '/listings'];
    end if;
    if current = defaults then
      delete from menu_items where menu_id = m.id;
    end if;
  end loop;
end $$;

insert into menus (location, name) values
  ('footer', 'Locations'),
  ('footer', 'Useful Links')
on conflict (location, name) do nothing;

delete from menus mn
 where mn.location = 'footer'
   and (mn.name, (select coalesce(array_agg(url order by url), '{}') from menu_items where menu_id = mn.id))
       in (('Explore', array['/categories', '/listings', '/search']),
           ('Company', array['/about', '/blog', '/contact', '/login']));

-- Filled only while empty, like 0013, so admin edits are never duplicated.
insert into menu_items (menu_id, label, url, sort_order)
select m.id, i.label, i.url, i.sort_order
  from (values
    ('header', 'Primary',      'Home',       '/',         10),
    ('header', 'Primary',      'Listing',    '/listings', 20),
    ('header', 'Primary',      'Blog',       '/blog',     30),
    ('header', 'Primary',      'About Us',   '/about',    40),
    ('header', 'Primary',      'Contact Us', '/contact',  50),
    ('mobile', 'Mobile',       'Home',       '/',         10),
    ('mobile', 'Mobile',       'Listing',    '/listings', 20),
    ('mobile', 'Mobile',       'Blog',       '/blog',     30),
    ('mobile', 'Mobile',       'About us',   '/about',    40),
    ('mobile', 'Mobile',       'Contact us', '/contact',  50),
    ('footer', 'Useful Links', 'About us',   '/about',    10),
    ('footer', 'Useful Links', 'Contact us', '/contact',  20),
    ('footer', 'Useful Links', 'FAQ',        '/#faq',     30)
  ) as i(location, menu_name, label, url, sort_order)
  join menus m on m.location = i.location::menu_location and m.name = i.menu_name
 where not exists (select 1 from menu_items x where x.menu_id = m.id);

-- Location links only for cities that exist, so the footer never links to a 404.
insert into menu_items (menu_id, label, url, sort_order)
select m.id, c.name, '/city/' || c.slug, i.sort_order
  from (values ('karachi', 10), ('lahore', 20), ('multan', 30), ('rawalpindi', 40), ('islamabad', 50))
       as i(slug, sort_order)
  join cities c on c.slug = i.slug
  join menus m on m.location = 'footer' and m.name = 'Locations'
 where not exists (select 1 from menu_items x where x.menu_id = m.id);

-- ===========================================================================
-- 6. Homepage sections
-- ===========================================================================
-- Existing 0013 sections keep their keys and are rewritten only while they still
-- carry their 0013 heading. New sections are inserted when missing.

update page_sections s
   set heading = x.heading, subheading = x.subheading, cta_label = x.cta_label,
       cta_url = x.cta_url, item_limit = x.item_limit, sort_order = x.sort_order,
       background_variant = x.background_variant, settings = x.settings::jsonb
  from pages p,
       (values
         ('hero', 'Find trusted local businesses',
            'Pakistan''s #1 Business Directory – Find Local Businesses',
            'Business Directory Pakistan helps you find verified businesses, restaurants, shops, and local services across Pakistan.',
            null, null, null::int, 10, 'navy',
            '{"what_label":"What","what_placeholder":"Ex: restaurant, lawyer, gym...","where_label":"Where","where_placeholder":"City or Area","button_label":"Search listings","overlay":"medium"}'),
         ('featured', 'Newest listings',
            'Top-Rated Businesses in Your Area',
            'Find trusted local businesses reviewed by real customers across Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad, and other cities of Pakistan.',
            null, null, 6, 20, 'white',
            '{"sort":"rating","autoplay":true,"show_phone":true,"show_status":true,"empty_title":"No businesses listed yet","empty_text":"Be the first to add your business to the directory."}'),
         ('cities', 'Popular cities',
            'Browse Businesses by City',
            'Find local businesses and service providers in major cities across Pakistan. Select a city to explore available categories and business listings.',
            null, null, 4, 50, 'white', '{}'),
         ('categories', 'Browse by category',
            'Popular Services People Search for in Pakistan',
            'From daily essentials to specialized services, these are the categories people search for most often across Pakistan.',
            null, null, null::int, 60, 'white', '{"title_case":true}'),
         ('cta', 'Own a business?',
            'Submit Your Listing Today!',
            'List your business on {brand} for free and start reaching customers who are searching for services like yours.',
            'Add Your Business — It''s Free', '/dashboard/listings/new', null::int, 140, 'brand',
            '{"layout":"banner"}')
       ) as x(section_key, old_heading, heading, subheading, cta_label, cta_url, item_limit,
              sort_order, background_variant, settings)
 where p.id = s.page_id and p.slug = 'home'
   and s.section_key = x.section_key and s.heading = x.old_heading;

insert into page_sections
  (page_id, section_key, section_type, sort_order, heading, subheading, body,
   cta_label, cta_url, item_limit, background_variant, settings)
select p.id, x.section_key, x.section_type::section_type, x.sort_order, x.heading, x.subheading,
       x.body, x.cta_label, x.cta_url, x.item_limit, x.background_variant, x.settings::jsonb
  from pages p
  cross join (values
    ('hero', 'hero_search', 10,
       'Pakistan''s #1 Business Directory – Find Local Businesses',
       'Business Directory Pakistan helps you find verified businesses, restaurants, shops, and local services across Pakistan.',
       null, null, null, null::int, 'navy',
       '{"what_label":"What","what_placeholder":"Ex: restaurant, lawyer, gym...","where_label":"Where","where_placeholder":"City or Area","button_label":"Search listings","overlay":"medium"}'),
    ('featured', 'featured_listings', 20,
       'Top-Rated Businesses in Your Area',
       'Find trusted local businesses reviewed by real customers across Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad, and other cities of Pakistan.',
       null, null, null, 6, 'white',
       '{"sort":"rating","autoplay":true,"show_phone":true,"show_status":true,"empty_title":"No businesses listed yet","empty_text":"Be the first to add your business to the directory."}'),
    ('intro', 'image_text', 30,
       'Find Trusted Local Businesses Across Pakistan',
       'Explore verified listings, compare services, and connect with the right business in your city — all in one place.',
       E'{brand} is a trusted Business Directory Pakistan platform that helps residents discover reliable local businesses and services in their city. Whether you need a restaurant in Lahore, a doctor in Islamabad, a plumber in Rawalpindi, a travel agency in Karachi, or a local shop near your area, this online business directory helps you explore relevant listings from one convenient place. With listings covering major cities as well as smaller towns across Pakistan, users can quickly narrow down their search by category, location, or service type.\n\nEach business profile on this business search platform provides useful details such as the business name, category, location, phone number, opening status, services offered, website link, and customer reviews. Instead of searching through multiple websites and social media pages, visitors can compare verified businesses side by side and contact them directly, saving time and effort. This makes it easier to make informed decisions before visiting a shop, booking a service, or reaching out to a professional.\n\n{brand} also gives Pakistani business owners an opportunity to build an online presence and reach customers who are already searching for their services. Adding a business listing is simple and free, and businesses can showcase their important details, working hours, and contact information to customers across Pakistan through this local business directory. This helps small and local businesses compete alongside larger, more established brands online.',
       null, null, null::int, 'white', '{"image_position":"left"}'),
    ('why_choose', 'value_props', 40,
       'Why Choose {brand} for Local Business Search?',
       'Looking for a business shouldn''t mean scrolling through endless results. {brand} sorts listings by category and location for faster, more relevant results.',
       null, null, null, null::int, 'white', '{"title_case":true,"numbered":false}'),
    ('cities', 'taxonomy_grid', 50,
       'Browse Businesses by City',
       'Find local businesses and service providers in major cities across Pakistan. Select a city to explore available categories and business listings.',
       null, null, null, 4, 'white', '{}'),
    ('categories', 'featured_categories', 60,
       'Popular Services People Search for in Pakistan',
       'From daily essentials to specialized services, these are the categories people search for most often across Pakistan.',
       null, null, null, null::int, 'white', '{"title_case":true}'),
    ('how_it_works', 'value_props', 70,
       'How Does {brand} Work?',
       '{brand} is a trusted Business Directory Pakistan — helping users search, compare, and connect with local businesses quickly and easily.',
       null, null, null, null::int, 'muted', '{"title_case":true,"numbered":false}'),
    ('grow', 'cta_banner', 80,
       'Grow your local visibility with a business listing',
       'Customers search online before choosing a local service provider. A complete profile helps them find you first.',
       null, 'Add Your Business — It''s Free', '/dashboard/listings/new', null::int, 'white',
       '{"layout":"cards"}'),
    ('testimonials', 'testimonials', 90,
       'What Our Users Are Saying',
       'Business owners and customers across Pakistan trust {brand} for finding reliable local services and businesses.',
       null, null, null, null::int, 'white', '{}'),
    ('guidance', 'image_text', 100,
       'Helping Customers Make Better Local Choices',
       'Use each listing to compare your options, then confirm the details that matter before you visit or book.',
       E'Every profile on {brand} brings together the details people usually look for across several websites: what a business does, where it is, when it is open and how to reach it. Business owners provide and update this information, so it is always worth checking that it is current.\n\nFor medical, financial, legal and other important services, confirm opening hours, prices, qualifications or licences, availability and service terms with the business directly before you visit, book or pay.\n\nIf you notice a phone number, address, opening time or any other detail that is wrong or out of date, let us know through our contact page so we can review and correct the listing.',
       'Report incorrect information', '/contact', null::int, 'white', '{"image_position":"right"}'),
    ('listing_cta', 'cta_banner', 110,
       'Get Your Business in Front of Thousands',
       'Create a free profile on {brand} and reach customers across Pakistan who are already searching for businesses like yours.',
       null, 'Add Your Business — It''s Free', '/dashboard/listings/new', null::int, 'navy',
       '{"layout":"banner"}'),
    ('faq', 'faq', 120,
       'Frequently Asked Questions',
       'Answers to common questions about finding businesses and listing your business on {brand}.',
       null, null, null, null::int, 'white', '{"open_first":true,"single_open":true}'),
    ('guides', 'blog_grid', 130,
       'Business Tips & Local Guides',
       'Practical advice for customers and business owners, from choosing a trusted service provider to growing your local visibility.',
       null, 'View all articles', '/blog', 3, 'white', '{"show_dates":true}'),
    ('cta', 'cta_banner', 140,
       'Submit Your Listing Today!',
       'List your business on {brand} for free and start reaching customers who are searching for services like yours.',
       null, 'Add Your Business — It''s Free', '/dashboard/listings/new', null::int, 'brand',
       '{"layout":"banner"}')
  ) as x(section_key, section_type, sort_order, heading, subheading, body, cta_label, cta_url,
         item_limit, background_variant, settings)
 where p.slug = 'home'
on conflict (page_id, section_key) do nothing;

-- ===========================================================================
-- 7. Homepage section items
-- ===========================================================================
-- Seeded only into a section that has no items yet. ref_id is looked up by
-- slug; when the category or city does not exist the item keeps working through
-- its fallback link (see src/lib/home.ts) until an editor points it elsewhere.

insert into section_items (section_id, sort_order, ref_type, ref_id, title, subtitle, body, icon, url)
select s.id, i.sort_order, i.ref_type,
       case i.ref_type
         when 'category' then (select c.id from categories c where c.slug = i.ref_slug)
         when 'city'     then (select c.id from cities c where c.slug = i.ref_slug)
       end,
       i.title, i.subtitle, i.body, i.icon, i.url
  from (values
    -- Hero category tiles
    ('hero', 10, 'category', 'food-restaurant',          'Restaurants',          null, null, 'utensils',       null),
    ('hero', 20, 'category', 'retail-shopping',          'Shopping & Retail',    null, null, 'shopping-bag',   null),
    ('hero', 30, 'category', 'education-training',       'Education & Training', null, null, 'tent',           null),
    ('hero', 40, 'category', 'hotels-travel',            'Hotels & Travel',      null, null, 'bed-double',     null),
    ('hero', 50, 'category', 'construction-real-estate', 'Real Estate',          null, null, 'house',          null),
    ('hero', 60, 'category', 'law-legal-services',       'Legal Services',       null, null, 'gavel',          null),
    -- Why choose
    ('why_choose', 10, null, null, 'Filter by Location and Service', null,
       'Select the exact service you''re looking for along with your city or nearby area. This helps you skip unrelated listings and reach businesses that actually match your needs.',
       'search-check', null),
    ('why_choose', 20, null, null, 'Check Complete Business Info', null,
       'View contact numbers, categories, addresses, current opening status, photos, and other profile details — all before you decide to reach out.',
       'message-circle', null),
    ('why_choose', 30, null, null, 'Reach Out Directly', null,
       'Contact the business by phone, visit their website, or check their exact location on the map. No third-party booking or unnecessary steps involved in the process.',
       'calendar-check', null),
    -- City mosaic: Lahore (wide), Karachi / Multan, Islamabad (wide)
    ('cities', 10, 'city', 'lahore',    null, null, null, null, null),
    ('cities', 20, 'city', 'karachi',   null, null, null, null, null),
    ('cities', 30, 'city', 'multan',    null, null, null, null, null),
    ('cities', 40, 'city', 'islamabad', null, null, null, null, null),
    -- Popular services
    ('categories', 10, 'category', 'food-restaurant', 'Restaurants and Food Services', null,
       'Find restaurants, cafés, bakeries, fast-food outlets, caterers, home chefs, and other food businesses in your city.',
       'utensils', null),
    ('categories', 20, 'category', 'health-medical', 'Health and Medical Services', null,
       'Explore doctors, clinics, dental practices, laboratories, pharmacies, physiotherapists, and other healthcare-related listings.',
       'hand-heart', null),
    ('categories', 30, 'category', 'home-services', 'Home Repair and Maintenance', null,
       'Find plumbers, electricians, AC technicians, carpenters, painters, and other home service providers near you.',
       'house', null),
    ('categories', 40, 'category', 'education-training', 'Education and Training', null,
       'Discover schools, colleges, tuition centers, language institutes, and training academies for every stage of learning.',
       'graduation-cap', null),
    ('categories', 50, 'category', 'hotels-travel', 'Travel and Accommodation', null,
       'Compare hotels, guest houses, travel agencies, tour operators, and Umrah and Hajj services for your next trip.',
       'plane', null),
    ('categories', 60, 'category', 'professional-services', 'Professional and Business Services', null,
       'Connect with consultants, designers, recruitment agencies, translators, and other professionals who help businesses grow.',
       'briefcase', null),
    -- How it works
    ('how_it_works', 10, null, null, 'Search & Discover', null,
       'Type in what you''re looking for — a restaurant, doctor, lawyer, or any local service. Filter by city, category, or rating to find exactly what you need.',
       'search-check', null),
    ('how_it_works', 20, null, null, 'Read Reviews & Compare', null,
       'Browse detailed business profiles with real customer reviews, contact info, and location maps — all in one place. Fast, free, and trusted across Pakistan.',
       'message-circle', null),
    ('how_it_works', 30, null, null, 'Connect & Visit', null,
       'Call, message, or get directions to the business directly from the listing. No middleman, no hassle — just direct connection.',
       'calendar-check', null),
    -- Grow your visibility: one paragraph card, one checklist card (icon = bullet)
    ('grow', 10, null, null, 'Why a Complete Profile Matters', null,
       E'Customers increasingly search online before choosing a local service provider. A complete business profile helps potential customers understand what your business offers, where it operates, and how they can contact you.\n\nBusiness owners can use {brand} to present their company name, service category, business description, phone number, address, operating hours, images, website, and other useful details. Accurate and complete information can make a listing more helpful to customers and improve confidence before they make contact.',
       null, null),
    ('grow', 20, null, null, 'What Should a Complete Business Profile Include?', null,
       E'Accurate business name and category\nOriginal service description\nCurrent phone number and address\nOpening and closing hours\nClear business or service images\nWebsite and social media details\nService areas and available facilities',
       'check', null),
    -- FAQ
    ('faq', 10, null, null, 'What is {brand}?', null,
       '{brand} is an online business directory for Pakistan. It helps people find local businesses and service providers by category and city, and gives business owners a free way to be found online.',
       null, null),
    ('faq', 20, null, null, 'Is {brand} free to use?', null,
       'Yes. Searching the directory, browsing categories and cities, and viewing business profiles is free. You do not need an account to look up a business.',
       null, null),
    ('faq', 30, null, null, 'Is {brand} free for business submissions?', null,
       'Yes. Creating an account and submitting your business listing costs nothing. Each new listing is reviewed by our team before it is published.',
       null, null),
    ('faq', 40, null, null, 'How can I find a business near me?', null,
       'Use the search bar at the top of the homepage: choose what you are looking for, select your city, and press Search. You can also browse businesses by city or by category.',
       null, null),
    ('faq', 50, null, null, 'What information is available on a business listing?', null,
       'A listing can show the business name, category, address, city, phone number, email, website, opening hours, photos, social media links and customer reviews. Each business decides which details to provide, so some profiles are more complete than others.',
       null, null),
    ('faq', 60, null, null, 'Which cities does {brand} cover?', null,
       '{brand} lists businesses across Pakistan, from large cities such as Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar and Quetta to smaller towns. You can browse the businesses listed in any city from its city page.',
       null, null),
    ('faq', 70, null, null, 'Does {brand} verify every business listing?', null,
       'Every new listing is reviewed by our team before it goes live, and a listing marked as verified has had its details confirmed. Details can still change, so contact the business to confirm prices and availability before you visit.',
       null, null),
    ('faq', 80, null, null, 'How should I choose a local service provider?', null,
       'Compare a few businesses in the same category: look at their services, location, opening hours, photos and reviews, then contact your shortlist to ask about prices, experience and availability before you decide.',
       null, null),
    ('faq', 90, null, null, 'How can I update my business listing?', null,
       'Sign in and open your dashboard, where you can edit your listing details, opening hours and photos at any time.',
       null, null),
    ('faq', 100, null, null, 'How can incorrect business information be reported?', null,
       'Send us a message through the contact page with the business name and the detail that needs correcting. Our team reviews every report and updates the listing.',
       null, null),
    ('faq', 110, null, null, 'Can I contact businesses directly?', null,
       'Yes. {brand} does not act as a middleman. Use the phone number, email, website or address on a business profile to contact the business directly.',
       null, null)
  ) as i(section_key, sort_order, ref_type, ref_slug, title, subtitle, body, icon, url)
  join page_sections s on s.section_key = i.section_key
  join pages p on p.id = s.page_id and p.slug = 'home'
 where not exists (select 1 from section_items x where x.section_id = s.id);

commit;
