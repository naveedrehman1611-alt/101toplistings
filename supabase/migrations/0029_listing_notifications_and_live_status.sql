-- 0029 — listing notifications, live status and resubmission
--
-- 1. listing_owner_contacts(ids): the sign-in email of each listing's owner,
--    for the "approved" and "not approved" emails. Emails live in auth.users,
--    which the app cannot read, so this SECURITY DEFINER function reads them
--    and returns rows only to moderators and above: anyone else gets nothing.
--
-- 2. Realtime on listings, so an owner's dashboard updates the moment a
--    moderator approves or rejects their listing. Realtime applies the same
--    RLS as a normal read: an owner receives changes to their own rows, the
--    public only to approved rows, which they can already read.
--
-- 3. An owner may resubmit a rejected listing: the owner update policy now
--    allows status rejected -> pending, and nothing else. Owners still can
--    never approve, verify or feature their own listing.
--
-- Safe to re-run: every statement replaces or checks before it adds.
-- Runs as-is in the Supabase SQL Editor.

-- 1 -------------------------------------------------------------------------

create or replace function public.listing_owner_contacts(p_ids uuid[])
returns table (listing_id uuid, email text, display_name text)
language sql
stable
security definer
set search_path = ''
as $$
  select l.id, u.email::text, p.display_name
    from public.listings l
    join auth.users u on u.id = l.owner_user_id
    left join public.profiles p on p.id = l.owner_user_id
   where l.id = any(p_ids)
     and public.has_min_role('moderator'::public.user_role);
$$;

revoke execute on function public.listing_owner_contacts(uuid[]) from public, anon;
grant execute on function public.listing_owner_contacts(uuid[]) to authenticated;

-- 2 -------------------------------------------------------------------------

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1 from pg_publication_tables
        where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'listings'
     ) then
    alter publication supabase_realtime add table public.listings;
  end if;
end $$;

-- 3 -------------------------------------------------------------------------

drop policy if exists listings_owner_update on listings;

create policy listings_owner_update on listings
  for update
  using (owner_user_id = auth.uid())
  with check (
    owner_user_id = auth.uid()
    and (
      status = (select l.status from listings l where l.id = listings.id)
      or (
        status = 'pending'
        and (select l.status from listings l where l.id = listings.id) = 'rejected'
      )
    )
    and verification = (select l.verification from listings l where l.id = listings.id)
    and is_featured  = (select l.is_featured  from listings l where l.id = listings.id)
  );
