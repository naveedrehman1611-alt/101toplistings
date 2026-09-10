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
