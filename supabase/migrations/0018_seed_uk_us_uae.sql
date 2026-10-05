-- 0018 — starter locations for the launch markets: UK, US and UAE
--
-- The site no longer targets Pakistan. This seeds the United Kingdom (its four
-- nations), the United States (the states of the starter cities) and the
-- United Arab Emirates (all seven emirates), each with its larger cities. It
-- mirrors src/lib/starter-data.ts, which the admin "Load starter data" button
-- inserts. All of it is ordinary content: admin can rename, feature or delete
-- any row.
--
-- Pakistan's rows from 0017 are kept (listings may point at them) but no
-- longer featured. countries has no active/published flag, so un-featuring is
-- the only switch; delete them in Admin -> Locations once nothing uses them.
--
-- Location slugs are unique across countries, regions and cities (0007
-- trigger), so where a region and its main city share a name the region slug
-- carries a suffix: new-york-state / new-york, dubai-emirate / dubai.
--
-- Safe to re-run. Locations use "where not exists" rather than
-- "on conflict", for the same reason as 0017: the cross-level slug trigger
-- raises before an ON CONFLICT arbiter would be consulted.
-- Coordinates are city centres, good enough for distance and "near me".

insert into countries (slug, name, iso2, iso3, phone_code, latitude, longitude)
select c.slug, c.name, c.iso2, c.iso3, c.phone_code, c.lat, c.lng
  from (values
    ('united-kingdom',       'United Kingdom',       'GB', 'GBR', '+44',  55.3781, -3.4360),
    ('united-states',        'United States',        'US', 'USA', '+1',   37.0902, -95.7129),
    ('united-arab-emirates', 'United Arab Emirates', 'AE', 'ARE', '+971', 23.4241, 53.8478)
  ) as c(slug, name, iso2, iso3, phone_code, lat, lng)
 where not exists (select 1 from location_slugs l where l.slug = c.slug)
   and not exists (select 1 from countries x where x.iso2 = c.iso2 or x.iso3 = c.iso3);

insert into regions (country_id, slug, name, code, latitude, longitude)
select c.id, r.slug, r.name, r.code, r.lat, r.lng
  from countries c
  join (values
    -- United Kingdom
    ('united-kingdom',       'england',                'England',              'ENG', 52.3555, -1.1743),
    ('united-kingdom',       'scotland',               'Scotland',             'SCT', 56.4907, -4.2026),
    ('united-kingdom',       'wales',                  'Wales',                'WLS', 52.1307, -3.7837),
    ('united-kingdom',       'northern-ireland',       'Northern Ireland',     'NIR', 54.7877, -6.4923),
    -- United States
    ('united-states',        'new-york-state',         'New York',             'NY',  43.2994, -74.2179),
    ('united-states',        'california',             'California',           'CA',  36.7783, -119.4179),
    ('united-states',        'illinois',               'Illinois',             'IL',  40.6331, -89.3985),
    ('united-states',        'texas',                  'Texas',                'TX',  31.9686, -99.9018),
    ('united-states',        'florida',                'Florida',              'FL',  27.6648, -81.5158),
    ('united-states',        'arizona',                'Arizona',              'AZ',  34.0489, -111.0937),
    ('united-states',        'washington',             'Washington',           'WA',  47.7511, -120.7401),
    ('united-states',        'massachusetts',          'Massachusetts',        'MA',  42.4072, -71.3824),
    ('united-states',        'nevada',                 'Nevada',               'NV',  38.8026, -116.4194),
    ('united-states',        'district-of-columbia',   'District of Columbia', 'DC',  38.9072, -77.0369),
    -- United Arab Emirates
    ('united-arab-emirates', 'abu-dhabi-emirate',      'Abu Dhabi',            'AZ',  23.4677, 53.7369),
    ('united-arab-emirates', 'dubai-emirate',          'Dubai',                'DU',  25.0657, 55.1713),
    ('united-arab-emirates', 'sharjah-emirate',        'Sharjah',              'SH',  25.2867, 55.6206),
    ('united-arab-emirates', 'ajman-emirate',          'Ajman',                'AJ',  25.4052, 55.5136),
    ('united-arab-emirates', 'umm-al-quwain-emirate',  'Umm Al Quwain',        'UQ',  25.5205, 55.7134),
    ('united-arab-emirates', 'ras-al-khaimah-emirate', 'Ras Al Khaimah',       'RK',  25.6741, 55.9804),
    ('united-arab-emirates', 'fujairah-emirate',       'Fujairah',             'FU',  25.4111, 56.2482)
  ) as r(country_slug, slug, name, code, lat, lng) on c.slug = r.country_slug
 where not exists (select 1 from location_slugs l where l.slug = r.slug);

insert into cities (region_id, slug, name, latitude, longitude, is_featured)
select g.id, x.slug, x.name, x.lat, x.lng, x.featured
  from regions g
  join countries c on c.id = g.country_id
  join (values
    -- United Kingdom
    ('united-kingdom',       'england',                'london',               'London',               51.5074,  -0.1278,   true),
    ('united-kingdom',       'england',                'manchester',           'Manchester',           53.4808,  -2.2426,   true),
    ('united-kingdom',       'england',                'birmingham',           'Birmingham',           52.4862,  -1.8904,   true),
    ('united-kingdom',       'england',                'leeds',                'Leeds',                53.8008,  -1.5491,   false),
    ('united-kingdom',       'england',                'liverpool',            'Liverpool',            53.4084,  -2.9916,   false),
    ('united-kingdom',       'england',                'bristol',              'Bristol',              51.4545,  -2.5879,   false),
    ('united-kingdom',       'england',                'sheffield',            'Sheffield',            53.3811,  -1.4701,   false),
    ('united-kingdom',       'england',                'newcastle-upon-tyne',  'Newcastle upon Tyne',  54.9783,  -1.6178,   false),
    ('united-kingdom',       'scotland',               'edinburgh',            'Edinburgh',            55.9533,  -3.1883,   true),
    ('united-kingdom',       'scotland',               'glasgow',              'Glasgow',              55.8642,  -4.2518,   true),
    ('united-kingdom',       'wales',                  'cardiff',              'Cardiff',              51.4816,  -3.1791,   false),
    ('united-kingdom',       'northern-ireland',       'belfast',              'Belfast',              54.5973,  -5.9301,   false),
    -- United States
    ('united-states',        'new-york-state',         'new-york',             'New York',             40.7128,  -74.0060,  true),
    ('united-states',        'california',             'los-angeles',          'Los Angeles',          34.0522,  -118.2437, true),
    ('united-states',        'california',             'san-francisco',        'San Francisco',        37.7749,  -122.4194, false),
    ('united-states',        'illinois',               'chicago',              'Chicago',              41.8781,  -87.6298,  true),
    ('united-states',        'texas',                  'houston',              'Houston',              29.7604,  -95.3698,  true),
    ('united-states',        'texas',                  'dallas',               'Dallas',               32.7767,  -96.7970,  false),
    ('united-states',        'florida',                'miami',                'Miami',                25.7617,  -80.1918,  true),
    ('united-states',        'arizona',                'phoenix',              'Phoenix',              33.4484,  -112.0740, false),
    ('united-states',        'washington',             'seattle',              'Seattle',              47.6062,  -122.3321, false),
    ('united-states',        'massachusetts',          'boston',               'Boston',               42.3601,  -71.0589,  false),
    ('united-states',        'nevada',                 'las-vegas',            'Las Vegas',            36.1699,  -115.1398, false),
    ('united-states',        'district-of-columbia',   'washington-dc',        'Washington, D.C.',     38.9072,  -77.0369,  false),
    -- United Arab Emirates
    ('united-arab-emirates', 'dubai-emirate',          'dubai',                'Dubai',                25.2048,  55.2708,   true),
    ('united-arab-emirates', 'abu-dhabi-emirate',      'abu-dhabi',            'Abu Dhabi',            24.4539,  54.3773,   true),
    ('united-arab-emirates', 'abu-dhabi-emirate',      'al-ain',               'Al Ain',               24.2075,  55.7447,   false),
    ('united-arab-emirates', 'sharjah-emirate',        'sharjah',              'Sharjah',              25.3463,  55.4209,   true),
    ('united-arab-emirates', 'ajman-emirate',          'ajman',                'Ajman',                25.4052,  55.5136,   false),
    ('united-arab-emirates', 'umm-al-quwain-emirate',  'umm-al-quwain',        'Umm Al Quwain',        25.5647,  55.5552,   false),
    ('united-arab-emirates', 'ras-al-khaimah-emirate', 'ras-al-khaimah',       'Ras Al Khaimah',       25.8007,  55.9762,   false),
    ('united-arab-emirates', 'fujairah-emirate',       'fujairah',             'Fujairah',             25.1288,  56.3265,   false)
  ) as x(country_slug, region_slug, slug, name, lat, lng, featured)
    on c.slug = x.country_slug and g.slug = x.region_slug
 where not exists (select 1 from location_slugs l where l.slug = x.slug);

-- Stop promoting Pakistan. Rows stay, so listings that reference them keep working.
update countries set is_featured = false where slug = 'pakistan' and is_featured;
update regions   set is_featured = false
 where is_featured and country_id in (select id from countries where slug = 'pakistan');
update cities    set is_featured = false
 where is_featured and region_id in (
   select r.id from regions r join countries c on c.id = r.country_id where c.slug = 'pakistan');
