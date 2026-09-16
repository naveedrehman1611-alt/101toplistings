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
