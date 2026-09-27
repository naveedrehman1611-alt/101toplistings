-- Migrations 0013–0016 in one transaction, for a database that already has 0001–0012
-- (the live RankYouSite project). Every part is safe to re-run, so it does no harm
-- if 0013 or 0014 were already applied. Paste into the Supabase SQL Editor and Run.

begin;

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

commit;
