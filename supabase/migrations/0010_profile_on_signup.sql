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
