-- 0028 — stored links point at final URLs; public slugs are lowercase
--
-- 1. Menu items, page section buttons, section items and the header CTA
--    setting can hold URLs that answer with a redirect: the paths moved by
--    next.config.ts (/listings, /categories, /services, /about-us, the
--    WordPress /listing-category/... paths, the merged service pages), a
--    trailing slash (Next.js 308s "/a/" to "/a"), and the sign-in-only listing
--    form /dashboard/listings/new, seeded as "Add your business" in 0013 and
--    as header.cta_url in 0021, which is a 307 to /login for every signed-out
--    visitor and crawler. Each is rewritten to the page that answers 200; the
--    listing form becomes /add-business, the public page that leads to it.
--    The site also rewrites these at read time (src/lib/legacy-redirects.ts),
--    so this only makes the stored data say what is rendered.
--
-- 2. Listing, category, city and blog post slugs are saved lowercase by the
--    app (slugify), but rows imported or edited by hand may carry capitals,
--    and audits flag those URLs. Each such slug is lowercased and a 301 from
--    the old path is stored in `redirects`, so old links keep working. A row is
--    left alone when its lowercase slug is already taken (another row in the
--    same table, or, for cities, any location level: see the
--    assert_location_slug_unique trigger in 0007), and when the slug has
--    characters a URL would percent-encode, since the stored redirect source
--    must match the encoded request path exactly.
--
-- Safe to re-run: every statement only touches rows that still need it.
--
-- Each step is one self-contained statement (no temp tables, no session-only
-- functions), so it gives the same result whether the script runs as one
-- transaction or the Supabase SQL Editor commits statement by statement.

begin;

-- ---------------------------------------------------------------------------
-- 1. Final URLs for stored links
-- ---------------------------------------------------------------------------

-- Mirrors LEGACY_REDIRECTS in src/lib/legacy-redirects.ts (and next.config.ts).
create or replace function public.m0028_final_url(u text) returns text
language plpgsql immutable as $$
declare
  path text;
  rest text;
begin
  if u is null or u !~ '^/' or u ~ '^//' then
    return u;
  end if;
  path := substring(u from '^[^?#]*');
  rest := substr(u, length(path) + 1);
  if length(path) > 1 then
    path := regexp_replace(path, '/+$', '');
    if path = '' then path := '/'; end if;
  end if;
  path := case
    when path ~* '^/listing-category/[^/]+$' then regexp_replace(path, '^/listing-category/', '/category/', 'i')
    when path ~* '^/listing-location/[^/]+$' then regexp_replace(path, '^/listing-location/', '/city/', 'i')
    when lower(path) = '/listing-top-filter' then '/business-directory'
    when lower(path) = '/listings' then '/business-directory'
    when lower(path) = '/categories' then '/business-categories'
    when lower(path) = '/services' then '/seo-services'
    when lower(path) in ('/submission', '/dashboard/listings/new') then '/add-business'
    when lower(path) = '/about-us' then '/about'
    when lower(path) = '/contact-us' then '/contact'
    when lower(path) in ('/seo-services/global-seo', '/seo-services/multilingual-seo')
      then '/seo-services/international-seo'
    when lower(path) = '/seo-services/seo-reseller' then '/seo-services/white-label-seo'
    when lower(path) = '/seo-services/bespoke-seo' then '/seo-services/custom-seo'
    when lower(path) = '/seo-services/seo-for-online-stores' then '/seo-services/ecommerce-seo'
    when lower(path) = '/seo-services/nationwide-seo' then '/seo-services/multi-location-seo'
    else path
  end;
  return path || rest;
end;
$$;

update menu_items
   set url = public.m0028_final_url(url)
 where not is_external
   and url is distinct from public.m0028_final_url(url);

update page_sections
   set cta_url = public.m0028_final_url(cta_url), updated_at = now()
 where cta_url is distinct from public.m0028_final_url(cta_url);

update section_items
   set url = public.m0028_final_url(url)
 where url is distinct from public.m0028_final_url(url);

update settings
   set value = to_jsonb(public.m0028_final_url(value #>> '{}'))
 where key in ('header.cta_url', 'header.login_url', 'header.register_url')
   and jsonb_typeof(value) = 'string'
   and value #>> '{}' is distinct from public.m0028_final_url(value #>> '{}');

drop function public.m0028_final_url(text);

-- ---------------------------------------------------------------------------
-- 2. Lowercase public slugs, with a 301 from each old path
-- ---------------------------------------------------------------------------
-- One statement per table. Every part of a statement reads the same snapshot,
-- so `r` (the rows to rename, taken before any change) drives the rename, the
-- repointing of stored redirects and menu links at the old path, and the new
-- 301 from the old path. For cities the clash check covers every location
-- level (location_slugs), matching the assert_location_slug_unique trigger.

with r as (
  select t.id, lower(t.slug) as new_slug,
         '/listing/' || t.slug as old_path, '/listing/' || lower(t.slug) as new_path
    from listings t
   where t.slug ~ '[A-Z]' and t.slug ~ '^[A-Za-z0-9._~-]+$'
     and not exists (select 1 from listings o where o.id <> t.id and lower(o.slug) = lower(t.slug))
),
renamed as (
  update listings t set slug = r.new_slug from r where t.id = r.id
),
repointed as (
  update redirects d set destination = r.new_path from r where d.destination = r.old_path
),
menus as (
  update menu_items m set url = r.new_path from r where m.url = r.old_path
)
insert into redirects (source, destination, status_code)
select old_path, new_path, 301 from r
on conflict (source) do nothing;

with r as (
  select t.id, lower(t.slug) as new_slug,
         '/category/' || t.slug as old_path, '/category/' || lower(t.slug) as new_path
    from categories t
   where t.slug ~ '[A-Z]' and t.slug ~ '^[A-Za-z0-9._~-]+$'
     and not exists (select 1 from categories o where o.id <> t.id and lower(o.slug) = lower(t.slug))
),
renamed as (
  update categories t set slug = r.new_slug from r where t.id = r.id
),
repointed as (
  update redirects d set destination = r.new_path from r where d.destination = r.old_path
),
menus as (
  update menu_items m set url = r.new_path from r where m.url = r.old_path
)
insert into redirects (source, destination, status_code)
select old_path, new_path, 301 from r
on conflict (source) do nothing;

with r as (
  select t.id, lower(t.slug) as new_slug,
         '/city/' || t.slug as old_path, '/city/' || lower(t.slug) as new_path
    from cities t
   where t.slug ~ '[A-Z]' and t.slug ~ '^[A-Za-z0-9._~-]+$'
     and not exists (select 1 from location_slugs o where o.id <> t.id and lower(o.slug) = lower(t.slug))
),
renamed as (
  update cities t set slug = r.new_slug from r where t.id = r.id
),
repointed as (
  update redirects d set destination = r.new_path from r where d.destination = r.old_path
),
menus as (
  update menu_items m set url = r.new_path from r where m.url = r.old_path
)
insert into redirects (source, destination, status_code)
select old_path, new_path, 301 from r
on conflict (source) do nothing;

with r as (
  select t.id, lower(t.slug) as new_slug,
         '/blog/' || t.slug as old_path, '/blog/' || lower(t.slug) as new_path
    from blog_posts t
   where t.slug ~ '[A-Z]' and t.slug ~ '^[A-Za-z0-9._~-]+$'
     and not exists (select 1 from blog_posts o where o.id <> t.id and lower(o.slug) = lower(t.slug))
),
renamed as (
  update blog_posts t set slug = r.new_slug from r where t.id = r.id
),
repointed as (
  update redirects d set destination = r.new_path from r where d.destination = r.old_path
),
menus as (
  update menu_items m set url = r.new_path from r where m.url = r.old_path
)
insert into redirects (source, destination, status_code)
select old_path, new_path, 301 from r
on conflict (source) do nothing;

commit;
