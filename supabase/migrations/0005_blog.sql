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
