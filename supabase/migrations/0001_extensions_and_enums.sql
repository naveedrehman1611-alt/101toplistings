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
