-- 0013 — promote the site owner to super_admin
-- The account already exists (created out of band on 2026-09-10). This migration
-- makes that promotion reproducible on a fresh project instead of a manual step
-- nobody remembers.
--
-- It can only promote an EXISTING auth.users row: auth.users needs a password hash
-- that only GoTrue can produce, so the bootstrap order on a new environment is
--   1. sign up as the owner (Supabase dashboard, or the app's /login)
--   2. handle_new_user (0010) creates the profiles row with role 'user'
--   3. run this migration to promote it
-- Idempotent: re-running it changes nothing once the role is already set.

update public.profiles p
   set role = 'super_admin',
       display_name = coalesce(p.display_name, 'Site owner')
  from auth.users u
 where u.id = p.id
   and lower(u.email) = lower('naveedrehman1611@gmail.com')
   and p.role <> 'super_admin';
