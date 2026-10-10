-- 0024 — header menu order: Home, Services, Listing, Free SEO Tools, Blog, About Us, Contact
--
-- The header renders the Services and Free SEO Tools menus in place of a menu
-- link to their hub (/seo-services, /free-tools), so adding those two links
-- lets them sit between the other items instead of after them. The mobile
-- drawer follows the same rule for its sections. "Contact Us" becomes "Contact".
--
-- Safe to re-run, and it never overwrites an admin edit: a menu is changed only
-- while it still holds exactly the links 0021 seeded (with 0022's URLs).

begin;

with pristine as (
  select m.id, d.location
    from menus m
    join (values
      ('header', 'Primary', array['Home /', 'About Us /about', 'Blog /blog',
                                  'Listing /business-directory', 'Contact Us /contact']),
      ('mobile', 'Mobile',  array['Home /', 'About us /about', 'Blog /blog',
                                  'Listing /business-directory', 'Contact us /contact'])
    ) as d(location, name, items)
      on m.location = d.location::menu_location and m.name = d.name
   where (select array_agg(i.label || ' ' || i.url order by i.url collate "C")
            from menu_items i where i.menu_id = m.id) = d.items
),
moved as (
  update menu_items i
     set label = coalesce(t.label, i.label), sort_order = t.sort_order
    from pristine p
    join (values
      ('/',                  null::text, 10),
      ('/business-directory', null,      30),
      ('/blog',               null,      50),
      ('/about',              null,      60),
      ('/contact',            'Contact', 70)
    ) as t(url, label, sort_order) on true
   where i.menu_id = p.id and i.url = t.url
  returning i.id
)
insert into menu_items (menu_id, label, url, sort_order)
select p.id, n.label, n.url, n.sort_order
  from pristine p
  cross join (values
    ('Services',       '/seo-services', 20),
    ('Free SEO Tools', '/free-tools',   40)
  ) as n(label, url, sort_order);

commit;
