-- 0019 — profiles for Google (OAuth) sign-ins
--
-- 0010's handle_new_user() only read `display_name`, which our email signup
-- form sets. Google-created users carry `full_name` / `name` and
-- `avatar_url` / `picture` in raw_user_meta_data instead, so they ended up
-- named after their email prefix. Same trigger, same 'user' role (metadata is
-- still never trusted for role) — it just reads the provider's fields too.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  avatar text := coalesce(meta ->> 'avatar_url', meta ->> 'picture');
begin
  insert into public.profiles (id, role, display_name, avatar_url)
  values (
    new.id,
    'user',                                  -- never trust signup metadata for role
    left(coalesce(
      nullif(btrim(meta ->> 'display_name'), ''),
      nullif(btrim(meta ->> 'full_name'), ''),
      nullif(btrim(meta ->> 'name'), ''),
      split_part(new.email, '@', 1)
    ), 80),
    case when avatar like 'https://%' then avatar end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
