-- 0018 — one brand name, and the pages behind /services, /privacy and /terms
--
-- The brand was spelled three ways across the site ("Rank Your Site" in the home
-- title, "RankYouSite" in page titles, "RankYourSite" on the About page). Search
-- engines read those as different names, so every stored copy is normalised to
-- "RankYouSite", which matches the domain (rankyousite.com) and the code default.
--
-- It also adds the page rows for the new routes, so their headings can be edited
-- in admin (Pages only edits rows that already exist).
--
-- Safe to re-run: the renames only touch text that still has an old spelling,
-- and the inserts skip rows that already exist.

-- ---------------------------------------------------------------------------
-- Brand name
-- ---------------------------------------------------------------------------

update settings
   set value = to_jsonb(regexp_replace(value #>> '{}', 'Rank[ ]?Your[ ]?Site|Rank You Site', 'RankYouSite', 'gi')),
       updated_at = now()
 where jsonb_typeof(value) = 'string'
   and value #>> '{}' ~* 'Rank[ ]?Your[ ]?Site|Rank You Site';

update page_sections
   set heading    = regexp_replace(heading,    'Rank[ ]?Your[ ]?Site|Rank You Site', 'RankYouSite', 'gi'),
       subheading = regexp_replace(subheading, 'Rank[ ]?Your[ ]?Site|Rank You Site', 'RankYouSite', 'gi'),
       body       = regexp_replace(body,       'Rank[ ]?Your[ ]?Site|Rank You Site', 'RankYouSite', 'gi'),
       cta_label  = regexp_replace(cta_label,  'Rank[ ]?Your[ ]?Site|Rank You Site', 'RankYouSite', 'gi'),
       updated_at = now()
 where concat_ws(' ', heading, subheading, body, cta_label) ~* 'Rank[ ]?Your[ ]?Site|Rank You Site';

update seo_meta
   set title       = regexp_replace(title,       'Rank[ ]?Your[ ]?Site|Rank You Site', 'RankYouSite', 'gi'),
       description = regexp_replace(description, 'Rank[ ]?Your[ ]?Site|Rank You Site', 'RankYouSite', 'gi')
 where concat_ws(' ', title, description) ~* 'Rank[ ]?Your[ ]?Site|Rank You Site';

update menu_items
   set label = regexp_replace(label, 'Rank[ ]?Your[ ]?Site|Rank You Site', 'RankYouSite', 'gi')
 where label ~* 'Rank[ ]?Your[ ]?Site|Rank You Site';

-- ---------------------------------------------------------------------------
-- Pages for the new routes
-- ---------------------------------------------------------------------------

insert into pages (slug, route_pattern, page_type, title, is_system) values
  ('services', '/services', 'static', 'SEO services',   false),
  ('privacy',  '/privacy',  'static', 'Privacy policy', false),
  ('terms',    '/terms',    'static', 'Terms of use',   false)
on conflict (slug) do nothing;

insert into page_sections
  (page_id, section_key, section_type, sort_order, heading, subheading)
select p.id, 'header', 'page_header'::section_type, 10,
       'SEO services for local businesses',
       'RankYouSite helps businesses across Pakistan get found on Google — in local search, on Maps and on the directory itself.'
  from pages p
 where p.slug = 'services'
on conflict (page_id, section_key) do nothing;
