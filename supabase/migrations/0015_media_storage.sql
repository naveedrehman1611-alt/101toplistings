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
