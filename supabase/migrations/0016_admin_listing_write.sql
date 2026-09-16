-- 0016 — atomic listing write + audit helper
-- A listing spans four tables (listings, opening_hours, listing_amenities,
-- listing_images). Writing them as four PostgREST calls from the admin form means a
-- half-saved listing whenever the second call fails. One RPC = one transaction.
--
-- SECURITY INVOKER, deliberately: authorisation stays with RLS under the admin's own
-- JWT (listings_staff_all et al). A SECURITY DEFINER function here would become a
-- privilege-escalation hole reachable over the REST API by any signed-in user.

-- ---------------------------------------------------------------------------
-- slug helpers
-- ---------------------------------------------------------------------------

create or replace function slugify(p_text text)
returns text
language sql
stable
set search_path = public, pg_temp
as $$
  -- STABLE, not IMMUTABLE: unaccent()'s one-argument form is STABLE (it reads the
  -- unaccent dictionary), so this cannot be marked IMMUTABLE. It is never used in
  -- an index, so STABLE is all it needs to be.
  select trim(both '-' from
           regexp_replace(
             regexp_replace(lower(unaccent(coalesce(p_text, ''))), '[^a-z0-9]+', '-', 'g'),
             '-{2,}', '-', 'g'
           )
         );
$$;

-- Returns a slug free against listings.slug, ignoring p_keep (the row being edited).
-- Called INSIDE the write transaction: a pre-flight "is it taken?" query from the
-- client is a time-of-check/time-of-use gap against listings_slug_key.
create or replace function unique_listing_slug(p_base text, p_keep uuid default null)
returns text
language plpgsql
set search_path = public, pg_temp
as $$
declare
  base      text := nullif(slugify(p_base), '');
  candidate text;
  n         integer := 1;
begin
  if base is null then
    base := 'listing';
  end if;
  candidate := base;

  loop
    exit when not exists (
      select 1 from listings l
       where l.slug = candidate
         and (p_keep is null or l.id <> p_keep)
    );
    n := n + 1;
    candidate := base || '-' || n;
  end loop;

  return candidate;
end;
$$;

-- ---------------------------------------------------------------------------
-- audit writer
-- ---------------------------------------------------------------------------
-- audit_logs_staff_insert (0011) pins actor_id to auth.uid(), so this cannot
-- attribute an entry to anyone else even if called with a different value.

create or replace function log_audit(
  p_action      audit_action,
  p_entity_type text,
  p_entity_id   uuid,
  p_before      jsonb default null,
  p_after       jsonb default null
)
returns void
language sql
set search_path = public, pg_temp
as $$
  insert into audit_logs (actor_id, action, entity_type, entity_id, before, after)
  values (auth.uid(), p_action, p_entity_type, p_entity_id, p_before, p_after);
$$;

-- ---------------------------------------------------------------------------
-- admin_save_listing
-- ---------------------------------------------------------------------------
-- p_listing   : object of listings columns. 'id' present => update, absent => insert.
-- p_hours     : array of {day_of_week, opens_at, closes_at, is_closed, is_24h}.
--               Days omitted from the array get no row at all, which is how
--               "this business publishes no hours" is represented (0003).
-- p_amenities : array of amenity uuids.
-- p_images    : array of {media_id, kind, sort_order}.
--
-- Child rows are deleted and re-inserted rather than diffed. opening_hours has a
-- unique (listing_id, day_of_week) and listing_images has partial unique indexes
-- permitting one cover and one logo; an in-place update would transiently violate
-- those, while delete-then-insert inside one transaction never does.

create or replace function admin_save_listing(
  p_listing   jsonb,
  p_hours     jsonb default '[]'::jsonb,
  p_amenities jsonb default '[]'::jsonb,
  p_images    jsonb default '[]'::jsonb
)
returns uuid
language plpgsql
set search_path = public, pg_temp
as $$
declare
  v_id        uuid := nullif(p_listing ->> 'id', '')::uuid;
  v_is_new    boolean := v_id is null;
  v_slug      text;
  v_before    jsonb;
  v_after     jsonb;
  v_old_status listing_status;
  v_status    listing_status := coalesce((p_listing ->> 'status')::listing_status, 'draft');
begin
  -- Friendly gate. The real boundary is RLS below; this only turns a bare
  -- "new row violates row-level security policy" into something readable.
  if not exists (
    select 1 from profiles p
     where p.id = auth.uid()
       and not p.is_suspended
       and p.role in ('moderator','editor','admin','super_admin')
  ) then
    raise exception 'not authorised to write listings' using errcode = '42501';
  end if;

  if v_is_new then
    v_slug := unique_listing_slug(coalesce(nullif(p_listing ->> 'slug', ''), p_listing ->> 'name'));

    insert into listings (
      slug, name, tagline, description,
      category_id, subcategory_id,
      phone_primary, phone_secondary, email, website,
      address, postal_code,
      country_id, region_id, city_id, area_id,
      latitude, longitude,
      social_links, video_url,
      seo_title, seo_description,
      is_featured, status, verification,
      created_by, last_updated_by,
      published_at
    )
    values (
      v_slug,
      p_listing ->> 'name',
      nullif(p_listing ->> 'tagline', ''),
      nullif(p_listing ->> 'description', ''),
      nullif(p_listing ->> 'category_id', '')::uuid,
      nullif(p_listing ->> 'subcategory_id', '')::uuid,
      nullif(p_listing ->> 'phone_primary', ''),
      nullif(p_listing ->> 'phone_secondary', ''),
      nullif(p_listing ->> 'email', ''),
      nullif(p_listing ->> 'website', ''),
      nullif(p_listing ->> 'address', ''),
      nullif(p_listing ->> 'postal_code', ''),
      nullif(p_listing ->> 'country_id', '')::uuid,
      nullif(p_listing ->> 'region_id', '')::uuid,
      nullif(p_listing ->> 'city_id', '')::uuid,
      nullif(p_listing ->> 'area_id', '')::uuid,
      nullif(p_listing ->> 'latitude', '')::double precision,
      nullif(p_listing ->> 'longitude', '')::double precision,
      coalesce(p_listing -> 'social_links', '[]'::jsonb),
      nullif(p_listing ->> 'video_url', ''),
      nullif(p_listing ->> 'seo_title', ''),
      nullif(p_listing ->> 'seo_description', ''),
      coalesce((p_listing ->> 'is_featured')::boolean, false),
      v_status,
      coalesce((p_listing ->> 'verification')::verification_status, 'unverified'),
      auth.uid(),
      auth.uid(),
      case when v_status = 'approved' then now() end
    )
    returning id into v_id;

  else
    select to_jsonb(l), l.status into v_before, v_old_status
      from listings l where l.id = v_id;

    if v_before is null then
      raise exception 'listing % not found', v_id using errcode = 'no_data_found';
    end if;

    v_slug := unique_listing_slug(coalesce(nullif(p_listing ->> 'slug', ''), p_listing ->> 'name'), v_id);

    update listings set
      slug            = v_slug,
      name            = p_listing ->> 'name',
      tagline         = nullif(p_listing ->> 'tagline', ''),
      description     = nullif(p_listing ->> 'description', ''),
      category_id     = nullif(p_listing ->> 'category_id', '')::uuid,
      subcategory_id  = nullif(p_listing ->> 'subcategory_id', '')::uuid,
      phone_primary   = nullif(p_listing ->> 'phone_primary', ''),
      phone_secondary = nullif(p_listing ->> 'phone_secondary', ''),
      email           = nullif(p_listing ->> 'email', ''),
      website         = nullif(p_listing ->> 'website', ''),
      address         = nullif(p_listing ->> 'address', ''),
      postal_code     = nullif(p_listing ->> 'postal_code', ''),
      country_id      = nullif(p_listing ->> 'country_id', '')::uuid,
      region_id       = nullif(p_listing ->> 'region_id', '')::uuid,
      city_id         = nullif(p_listing ->> 'city_id', '')::uuid,
      area_id         = nullif(p_listing ->> 'area_id', '')::uuid,
      latitude        = nullif(p_listing ->> 'latitude', '')::double precision,
      longitude       = nullif(p_listing ->> 'longitude', '')::double precision,
      social_links    = coalesce(p_listing -> 'social_links', '[]'::jsonb),
      video_url       = nullif(p_listing ->> 'video_url', ''),
      seo_title       = nullif(p_listing ->> 'seo_title', ''),
      seo_description = nullif(p_listing ->> 'seo_description', ''),
      is_featured     = coalesce((p_listing ->> 'is_featured')::boolean, false),
      status          = v_status,
      verification    = coalesce((p_listing ->> 'verification')::verification_status, verification),
      rejection_note  = nullif(p_listing ->> 'rejection_note', ''),
      last_updated_by = auth.uid(),
      -- Stamp on the first crossing into 'approved' only. Re-approving must not
      -- reshuffle listings_public_recent_idx ordering.
      published_at    = case
                          when v_status = 'approved' and published_at is null then now()
                          else published_at
                        end
    where id = v_id;
  end if;

  -- Opening hours ---------------------------------------------------------
  delete from opening_hours where listing_id = v_id;

  insert into opening_hours (listing_id, day_of_week, opens_at, closes_at, is_closed, is_24h)
  select
    v_id,
    (h ->> 'day_of_week')::smallint,
    nullif(h ->> 'opens_at', '')::time,
    nullif(h ->> 'closes_at', '')::time,
    coalesce((h ->> 'is_closed')::boolean, false),
    coalesce((h ->> 'is_24h')::boolean, false)
  from jsonb_array_elements(coalesce(p_hours, '[]'::jsonb)) as h;

  -- Amenities -------------------------------------------------------------
  delete from listing_amenities where listing_id = v_id;

  insert into listing_amenities (listing_id, amenity_id)
  select v_id, (a #>> '{}')::uuid
    from jsonb_array_elements(coalesce(p_amenities, '[]'::jsonb)) as a
   where nullif(a #>> '{}', '') is not null
  on conflict do nothing;

  -- Images ----------------------------------------------------------------
  delete from listing_images where listing_id = v_id;

  insert into listing_images (listing_id, media_id, kind, sort_order)
  select
    v_id,
    (i ->> 'media_id')::uuid,
    coalesce((i ->> 'kind')::media_kind, 'gallery'),
    coalesce((i ->> 'sort_order')::integer, 0)
  from jsonb_array_elements(coalesce(p_images, '[]'::jsonb)) as i
  where nullif(i ->> 'media_id', '') is not null;

  select to_jsonb(l) into v_after from listings l where l.id = v_id;

  perform log_audit(
    case when v_is_new then 'create'::audit_action else 'update'::audit_action end,
    'listing', v_id, v_before, v_after
  );

  return v_id;
end;
$$;

revoke execute on function admin_save_listing(jsonb, jsonb, jsonb, jsonb) from anon;
revoke execute on function log_audit(audit_action, text, uuid, jsonb, jsonb) from anon;
revoke execute on function unique_listing_slug(text, uuid) from anon;
