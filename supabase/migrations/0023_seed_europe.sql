-- 0023 — starter locations for Europe
--
-- The homepage "Browse Businesses by City" section groups the top cities by
-- market: Pakistan, the UK, the USA, the UAE and Europe. Pakistan, the UK, the
-- USA and the UAE are seeded by 0017, 0018 and 0021; this adds the European
-- cities so their tiles have city pages to link to. It mirrors
-- src/lib/starter-data.ts, which the admin "Load starter data" button inserts.
-- All of it is ordinary content: admin can rename, feature or delete any row.
--
-- Location slugs are unique across countries, regions and cities (0007
-- trigger), so where a region and its main city share a name the region slug
-- carries a suffix: berlin-state / berlin, madrid-community / madrid.
--
-- Safe to re-run. Locations use "where not exists" rather than
-- "on conflict", for the same reason as 0017: the cross-level slug trigger
-- raises before an ON CONFLICT arbiter would be consulted.
-- Coordinates are city centres, good enough for distance and "near me".

begin;

insert into countries (slug, name, iso2, iso3, phone_code, latitude, longitude)
select c.slug, c.name, c.iso2, c.iso3, c.phone_code, c.lat, c.lng
  from (values
    ('france',      'France',      'FR', 'FRA', '+33', 46.2276,  2.2137),
    ('germany',     'Germany',     'DE', 'DEU', '+49', 51.1657, 10.4515),
    ('spain',       'Spain',       'ES', 'ESP', '+34', 40.4637, -3.7492),
    ('italy',       'Italy',       'IT', 'ITA', '+39', 41.8719, 12.5674),
    ('netherlands', 'Netherlands', 'NL', 'NLD', '+31', 52.1326,  5.2913)
  ) as c(slug, name, iso2, iso3, phone_code, lat, lng)
 where not exists (select 1 from location_slugs l where l.slug = c.slug)
   and not exists (select 1 from countries x where x.iso2 = c.iso2 or x.iso3 = c.iso3);

insert into regions (country_id, slug, name, code, latitude, longitude)
select c.id, r.slug, r.name, r.code, r.lat, r.lng
  from countries c
  join (values
    ('france',      'ile-de-france',    'Île-de-France',        'IDF', 48.8499,  2.6370),
    ('germany',     'berlin-state',     'Berlin',               'BE',  52.5200, 13.4050),
    ('germany',     'bavaria',          'Bavaria',              'BY',  48.7904, 11.4979),
    ('spain',       'madrid-community', 'Community of Madrid',  'MD',  40.4168, -3.7038),
    ('spain',       'catalonia',        'Catalonia',            'CT',  41.5912,  1.5209),
    ('italy',       'lazio',            'Lazio',                '62',  41.6552, 12.9896),
    ('italy',       'lombardy',         'Lombardy',             '25',  45.4791,  9.8452),
    ('netherlands', 'north-holland',    'North Holland',        'NH',  52.5206,  4.7885)
  ) as r(country_slug, slug, name, code, lat, lng) on c.slug = r.country_slug
 where not exists (select 1 from location_slugs l where l.slug = r.slug);

insert into cities (region_id, slug, name, latitude, longitude, is_featured)
select g.id, x.slug, x.name, x.lat, x.lng, x.featured
  from regions g
  join countries c on c.id = g.country_id
  join (values
    ('france',      'ile-de-france',    'paris',     'Paris',     48.8566,  2.3522, true),
    ('germany',     'berlin-state',     'berlin',    'Berlin',    52.5200, 13.4050, true),
    ('germany',     'bavaria',          'munich',    'Munich',    48.1351, 11.5820, false),
    ('spain',       'madrid-community', 'madrid',    'Madrid',    40.4168, -3.7038, true),
    ('spain',       'catalonia',        'barcelona', 'Barcelona', 41.3874,  2.1686, false),
    ('italy',       'lazio',            'rome',      'Rome',      41.9028, 12.4964, true),
    ('italy',       'lombardy',         'milan',     'Milan',     45.4642,  9.1900, false),
    ('netherlands', 'north-holland',    'amsterdam', 'Amsterdam', 52.3676,  4.9041, true)
  ) as x(country_slug, region_slug, slug, name, lat, lng, featured)
    on c.slug = x.country_slug and g.slug = x.region_slug
 where not exists (select 1 from location_slugs l where l.slug = x.slug);

commit;
