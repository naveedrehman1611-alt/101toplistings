-- 0022 — URL structure from the SEO strategy
--
-- Three public routes moved (next.config.ts 301s the old paths):
--   /listings   -> /business-directory
--   /categories -> /business-categories
--   /services   -> /seo-services
-- This carries the SEO manager overrides (seo_meta.route) and any menu links
-- across, so an editor's title/description and the navigation keep working
-- without a redirect hop. It also creates the three blog categories that
-- back the guide clusters at /blog/business-directory, /blog/seo and
-- /blog/digital-marketing (src/lib/blog-clusters.ts).
--
-- Safe to re-run.

begin;

update seo_meta set route = '/business-directory'
 where route = '/listings'
   and not exists (select 1 from seo_meta where route = '/business-directory');
update seo_meta set route = '/business-categories'
 where route = '/categories'
   and not exists (select 1 from seo_meta where route = '/business-categories');
update seo_meta set route = '/seo-services'
 where route = '/services'
   and not exists (select 1 from seo_meta where route = '/seo-services');

-- Exact paths and their query-string variants (e.g. /listings?city=lahore).
update menu_items set url = regexp_replace(url, '^/listings(?=$|[?#])', '/business-directory')
 where url ~ '^/listings($|[?#])';
update menu_items set url = regexp_replace(url, '^/categories(?=$|[?#])', '/business-categories')
 where url ~ '^/categories($|[?#])';
update menu_items set url = regexp_replace(url, '^/services(?=$|[?#])', '/seo-services')
 where url ~ '^/services($|[?#])';

insert into blog_categories (slug, name, description, sort_order)
values
  ('business-directory', 'Business directory guides',
   'How business listings, directories and citations help customers find you.', 1),
  ('seo', 'SEO guides',
   'Practical guides to ranking a website: technical, on-page, local SEO and links.', 2),
  ('digital-marketing', 'Digital marketing guides',
   'Growing a business online with content, search and outreach.', 3)
on conflict (slug) do nothing;

-- The site-wide defaults, where nobody has edited them since 0013, become the
-- strategy's home title and description.
update settings set value = to_jsonb('RankYouSite | Business Directory & SEO Services'::text)
 where key = 'seo.default_title'
   and value = to_jsonb('RankYouSite — local business directory'::text);
update settings set value = to_jsonb('List your business, get discovered online, and grow with SEO and digital marketing. Explore businesses worldwide or promote your own.'::text)
 where key = 'seo.default_description'
   and value = to_jsonb('Search local businesses by name, category and city, with real addresses, opening hours and reviews.'::text);

commit;
