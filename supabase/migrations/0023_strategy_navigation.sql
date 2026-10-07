-- 0023 — header and mobile navigation from the SEO strategy
--
-- Replaces the header "Primary" and mobile "Mobile" menus only while they
-- still hold exactly the links 0021 seeded (Home, Listing, Blog, About Us,
-- Contact Us — with /listings as 0021 wrote it or /business-directory after
-- 0022), or are empty. A menu an admin has changed is left alone. The same
-- lists live in src/lib/nav.ts, which the layout uses if a menu is empty.
--
-- The desktop bar has room for four links beside the logo (its home link),
-- the free-tools menu and the two header buttons; the drawer has the rest.
--
-- Safe to re-run.

begin;

do $$
declare
  m record;
  current text[];
begin
  for m in
    select mn.id, mn.location::text as location
      from menus mn
     where (mn.location::text, mn.name) in (('header', 'Primary'), ('mobile', 'Mobile'))
  loop
    select coalesce(array_agg(url order by url), '{}') into current
      from menu_items where menu_id = m.id;
    if current = '{}'
       or current = array['/', '/about', '/blog', '/business-directory', '/contact']
       or current = array['/', '/about', '/blog', '/contact', '/listings'] then
      delete from menu_items where menu_id = m.id;
      if m.location = 'header' then
        insert into menu_items (menu_id, label, url, sort_order)
        select m.id, i.label, i.url, i.sort_order
          from (values
            ('Find Businesses', '/business-directory',  20),
            ('Categories',      '/business-categories', 30),
            ('Locations',       '/locations',           40),
            ('SEO Services',    '/seo-services',        50)
          ) as i(label, url, sort_order);
      else
        insert into menu_items (menu_id, label, url, sort_order)
        select m.id, i.label, i.url, i.sort_order
          from (values
            ('Home',              '/',                    10),
            ('Find Businesses',   '/business-directory',  20),
            ('Add Your Business', '/add-business',        30),
            ('Categories',        '/business-categories', 40),
            ('Locations',         '/locations',           50),
            ('Featured',          '/featured-businesses', 60),
            ('SEO Services',      '/seo-services',        70),
            ('Digital Marketing', '/digital-marketing',   80),
            ('Blog',              '/blog',                90)
          ) as i(label, url, sort_order);
      end if;
    end if;
  end loop;
end $$;

commit;
