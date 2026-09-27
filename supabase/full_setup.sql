-- full_setup.sql — every migration in supabase/migrations/, 0001 through 0014, in order.
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

commit;
