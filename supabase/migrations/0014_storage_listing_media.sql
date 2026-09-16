-- 0014 — Storage bucket for listing images
-- This is the ONE real permission gap found while planning: the project has no
-- storage bucket at all, so nothing can be uploaded. Everything else the admin
-- panel needs was already permitted (verified by probing as the real admin role).
--
-- Public read: these are published business photos on public pages.
-- Writes are staff-only, matching media_staff_write in 0008.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'listing-media',
  'listing-media',
  true,
  5242880,                                             -- 5 MiB
  array['image/jpeg','image/png','image/webp','image/avif']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Anyone may read. The bucket is public, so this mirrors that intent explicitly
-- rather than relying on the bucket flag alone.
drop policy if exists listing_media_public_read on storage.objects;
create policy listing_media_public_read on storage.objects
  for select using (bucket_id = 'listing-media');

-- Writes: editor and above. has_min_role() lives in `public` and 0009 revoked its
-- EXECUTE from anon/authenticated. A revoked EXECUTE does not block evaluation
-- inside a policy the database itself runs -- verified on public tables -- but
-- storage.objects is owned by supabase_storage_admin, so if that revoke does bite
-- here every upload will fail with "permission denied for function has_min_role".
-- The role test is therefore written as a direct profiles lookup instead, which
-- depends on no grant at all and cannot be broken by a future hardening pass.
drop policy if exists listing_media_staff_write on storage.objects;
create policy listing_media_staff_write on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'listing-media'
    and exists (
      select 1 from public.profiles p
       where p.id = auth.uid()
         and not p.is_suspended
         and p.role in ('editor','admin','super_admin')
    )
  );

drop policy if exists listing_media_staff_update on storage.objects;
create policy listing_media_staff_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'listing-media'
    and exists (
      select 1 from public.profiles p
       where p.id = auth.uid()
         and not p.is_suspended
         and p.role in ('editor','admin','super_admin')
    )
  );

drop policy if exists listing_media_staff_delete on storage.objects;
create policy listing_media_staff_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'listing-media'
    and exists (
      select 1 from public.profiles p
       where p.id = auth.uid()
         and not p.is_suspended
         and p.role in ('editor','admin','super_admin')
    )
  );

-- NOTE: this bucket is PUBLIC. It must never be reused for claim evidence or
-- contact-form attachments; those need a separate private bucket.
