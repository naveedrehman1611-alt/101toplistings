-- 0013 — base site content
--
-- The schema ships with no rows, and the site renders every heading, menu and
-- brand string from the database (§9.5.1). On a fresh project that meant a bare
-- header, an empty footer and a home page with no sections — and admin could not
-- fix it, because Settings and Pages only edit rows that already exist.
--
-- This inserts the structural content the code reads: settings keys, the pages
-- and section keys each route looks up, and the four menus the layout renders.
-- It adds no businesses, categories or cities; those are real content and are
-- entered through admin.
--
-- Safe to re-run: every insert skips rows that already exist, so admin edits are
-- never overwritten.

-- ---------------------------------------------------------------------------
-- Settings
-- ---------------------------------------------------------------------------

insert into settings (key, value, "group") values
  ('brand.name',                      to_jsonb('RankYouSite'::text), 'brand'),
  ('brand.tagline',                   to_jsonb('Find trusted local businesses near you.'::text), 'brand'),
  ('brand.domain',                    to_jsonb('rankyousite.com'::text), 'brand'),
  ('contact.email',                   to_jsonb('hello@rankyousite.com'::text), 'contact'),
  ('footer.copyright',                to_jsonb('RankYouSite'::text), 'general'),
  ('seo.default_title',               to_jsonb('RankYouSite — local business directory'::text), 'seo'),
  ('seo.default_description',         to_jsonb('Search local businesses by name, category and city, with real addresses, opening hours and reviews.'::text), 'seo'),
  ('seo.location_page_min_listings',  to_jsonb(3), 'seo')
on conflict (key) do nothing;

-- ---------------------------------------------------------------------------
-- Pages
-- ---------------------------------------------------------------------------

insert into pages (slug, route_pattern, page_type, title, is_system) values
  ('home',       '/',           'home',          'Home',       true),
  ('listings',   '/listings',   'listing_index', 'Listings',   true),
  ('categories', '/categories', 'taxonomy',      'Categories', true),
  ('blog',       '/blog',       'blog_index',    'Blog',       true),
  ('about',      '/about',      'static',        'About',      false),
  ('contact',    '/contact',    'contact',       'Contact',    false)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- Sections — keys match the findSection() calls in src/app
-- ---------------------------------------------------------------------------

insert into page_sections
  (page_id, section_key, section_type, sort_order, heading, subheading, cta_label, cta_url, item_limit)
select p.id, s.section_key, s.section_type::section_type, s.sort_order,
       s.heading, s.subheading, s.cta_label, s.cta_url, s.item_limit
  from (values
    ('home', 'hero', 'hero_search', 10,
       'Find trusted local businesses',
       'Search by name, category or city. Every listing is reviewed before it goes live.',
       null, null, null),
    ('home', 'categories', 'featured_categories', 20,
       'Browse by category', 'Start with what you need.',
       'All categories', '/categories', 8),
    ('home', 'featured', 'featured_listings', 30,
       'Newest listings', 'Recently added and approved.',
       'View all', '/listings', 6),
    ('home', 'cities', 'taxonomy_grid', 40,
       'Popular cities', 'Businesses near you.',
       null, null, 8),
    ('home', 'cta', 'cta_banner', 50,
       'Own a business?', 'Add it for free. We review every listing before it is published.',
       'Add your business', '/dashboard/listings/new', null),
    ('listings',   'header', 'page_header', 10, 'All listings',
       'Every approved business in the directory.', null, null, null),
    ('categories', 'header', 'page_header', 10, 'Categories',
       'Browse businesses by what they do.', null, null, null),
    ('blog',       'header', 'blog_hero',   10, 'Blog',
       'Guides and news for local businesses and the people who use them.', null, null, null),
    ('about',      'header', 'page_header', 10, 'About RankYouSite',
       'A directory of local businesses, checked by people before it is published.', null, null, null),
    ('contact',    'header', 'page_header', 10, 'Contact us',
       'Questions, corrections or a listing request — send us a message.', null, null, null)
  ) as s(page_slug, section_key, section_type, sort_order, heading, subheading, cta_label, cta_url, item_limit)
  join pages p on p.slug = s.page_slug
on conflict (page_id, section_key) do nothing;

-- ---------------------------------------------------------------------------
-- Menus — names match the getMenu() calls in src/app/layout.tsx
-- ---------------------------------------------------------------------------

insert into menus (location, name) values
  ('header', 'Primary'),
  ('mobile', 'Mobile'),
  ('footer', 'Explore'),
  ('footer', 'Company')
on conflict (location, name) do nothing;

-- menu_items has no natural key, so a menu is filled only while it is empty.
-- That keeps re-runs from duplicating links and leaves admin-edited menus alone.
insert into menu_items (menu_id, label, url, sort_order)
select m.id, i.label, i.url, i.sort_order
  from (values
    ('header', 'Primary', 'Listings',   '/listings',   10),
    ('header', 'Primary', 'Categories', '/categories', 20),
    ('header', 'Primary', 'Blog',       '/blog',       30),
    ('header', 'Primary', 'Contact',    '/contact',    40),
    ('mobile', 'Mobile',  'Listings',   '/listings',   10),
    ('mobile', 'Mobile',  'Categories', '/categories', 20),
    ('mobile', 'Mobile',  'Blog',       '/blog',       30),
    ('mobile', 'Mobile',  'About',      '/about',      40),
    ('mobile', 'Mobile',  'Contact',    '/contact',    50),
    ('mobile', 'Mobile',  'Add your business', '/dashboard/listings/new', 60),
    ('footer', 'Explore', 'Listings',   '/listings',   10),
    ('footer', 'Explore', 'Categories', '/categories', 20),
    ('footer', 'Explore', 'Search',     '/search',     30),
    ('footer', 'Company', 'About',      '/about',      10),
    ('footer', 'Company', 'Blog',       '/blog',       20),
    ('footer', 'Company', 'Contact',    '/contact',    30),
    ('footer', 'Company', 'Sign in',    '/login',      40)
  ) as i(location, menu_name, label, url, sort_order)
  join menus m on m.location = i.location::menu_location and m.name = i.menu_name
 where not exists (select 1 from menu_items x where x.menu_id = m.id);
