-- 0017 — starter locations (Pakistan) and business categories
--
-- A fresh database has no cities, and the listing form needs a city, so
-- nobody could add a business. This seeds Pakistan's provinces and
-- territories with its larger cities, plus a set of common categories. All of
-- it is ordinary content: admin can rename, feature or delete any row.
--
-- Safe to re-run. Locations use "where not exists" rather than
-- "on conflict": the cross-level slug trigger (0007) raises before an
-- ON CONFLICT arbiter would be consulted, so a re-run would otherwise fail.
-- Coordinates are city centres, good enough for distance and "near me".

insert into countries (slug, name, iso2, iso3, phone_code, latitude, longitude)
select 'pakistan', 'Pakistan', 'PK', 'PAK', '+92', 30.3753, 69.3451
 where not exists (select 1 from countries where slug = 'pakistan');

insert into regions (country_id, slug, name, code, latitude, longitude)
select c.id, r.slug, r.name, r.code, r.lat, r.lng
  from countries c
 cross join (values
   ('punjab',                      'Punjab',                      'PB', 31.1704, 72.7097),
   ('sindh',                       'Sindh',                       'SD', 25.8943, 68.5247),
   ('khyber-pakhtunkhwa',          'Khyber Pakhtunkhwa',          'KP', 34.9526, 72.3311),
   ('balochistan',                 'Balochistan',                 'BA', 28.4907, 65.0958),
   ('islamabad-capital-territory', 'Islamabad Capital Territory', 'IS', 33.7205, 73.0405),
   ('gilgit-baltistan',            'Gilgit-Baltistan',            'GB', 35.8026, 74.9832),
   ('azad-kashmir',                'Azad Jammu and Kashmir',      'JK', 33.9259, 73.7810)
 ) as r(slug, name, code, lat, lng)
 where c.slug = 'pakistan'
   and not exists (select 1 from location_slugs l where l.slug = r.slug);

insert into cities (region_id, slug, name, latitude, longitude, is_featured)
select g.id, x.slug, x.name, x.lat, x.lng, x.featured
  from regions g
  join (values
    -- Punjab
    ('punjab', 'lahore',            'Lahore',            31.5204, 74.3587, true),
    ('punjab', 'faisalabad',        'Faisalabad',        31.4504, 73.1350, true),
    ('punjab', 'rawalpindi',        'Rawalpindi',        33.5651, 73.0169, true),
    ('punjab', 'multan',            'Multan',            30.1575, 71.5249, true),
    ('punjab', 'gujranwala',        'Gujranwala',        32.1877, 74.1945, false),
    ('punjab', 'sialkot',           'Sialkot',           32.4945, 74.5229, false),
    ('punjab', 'bahawalpur',        'Bahawalpur',        29.3544, 71.6911, false),
    ('punjab', 'sargodha',          'Sargodha',          32.0740, 72.6861, false),
    ('punjab', 'sheikhupura',       'Sheikhupura',       31.7167, 73.9850, false),
    ('punjab', 'gujrat',            'Gujrat',            32.5731, 74.1005, false),
    ('punjab', 'sahiwal',           'Sahiwal',           30.6682, 73.1114, false),
    ('punjab', 'rahim-yar-khan',    'Rahim Yar Khan',    28.4202, 70.2952, false),
    -- Sindh
    ('sindh', 'karachi',            'Karachi',           24.8607, 67.0011, true),
    ('sindh', 'hyderabad',          'Hyderabad',         25.3960, 68.3578, false),
    ('sindh', 'sukkur',             'Sukkur',            27.7052, 68.8574, false),
    ('sindh', 'larkana',            'Larkana',           27.5570, 68.2264, false),
    ('sindh', 'nawabshah',          'Nawabshah',         26.2442, 68.4100, false),
    -- Khyber Pakhtunkhwa
    ('khyber-pakhtunkhwa', 'peshawar',         'Peshawar',         34.0151, 71.5249, true),
    ('khyber-pakhtunkhwa', 'mardan',           'Mardan',           34.1989, 72.0231, false),
    ('khyber-pakhtunkhwa', 'abbottabad',       'Abbottabad',       34.1688, 73.2215, false),
    ('khyber-pakhtunkhwa', 'mingora',          'Mingora (Swat)',   34.7717, 72.3600, false),
    ('khyber-pakhtunkhwa', 'dera-ismail-khan', 'Dera Ismail Khan', 31.8314, 70.9019, false),
    -- Balochistan
    ('balochistan', 'quetta',       'Quetta',            30.1798, 66.9750, true),
    ('balochistan', 'gwadar',       'Gwadar',            25.1264, 62.3225, false),
    -- Territories
    ('islamabad-capital-territory', 'islamabad', 'Islamabad', 33.6844, 73.0479, true),
    ('gilgit-baltistan',            'gilgit',    'Gilgit',    35.9208, 74.3080, false),
    ('azad-kashmir',                'muzaffarabad', 'Muzaffarabad', 34.3700, 73.4711, false)
  ) as x(region_slug, slug, name, lat, lng, featured) on g.slug = x.region_slug
 where not exists (select 1 from location_slugs l where l.slug = x.slug);

-- Categories carry no cross-table slug trigger, so ON CONFLICT is enough.
insert into categories (slug, name, description, sort_order, is_featured) values
  ('restaurants',       'Restaurants',          'Restaurants, cafes, bakeries and takeaways.',            10, true),
  ('doctors',           'Doctors & Clinics',    'General physicians, specialists and clinics.',           20, true),
  ('dentists',          'Dentists',             'Dental clinics and orthodontists.',                      30, true),
  ('hospitals',         'Hospitals',            'Hospitals, labs and diagnostic centres.',                40, false),
  ('pharmacies',        'Pharmacies',           'Chemists and medical stores.',                           50, false),
  ('beauty-salons',     'Beauty Salons & Spas', 'Salons, barbers, spas and bridal makeup.',               60, true),
  ('gyms',              'Gyms & Fitness',       'Gyms, fitness studios and trainers.',                    70, false),
  ('schools',           'Schools & Academies',  'Schools, tuition centres and training institutes.',      80, true),
  ('real-estate',       'Real Estate',          'Property dealers, builders and developers.',             90, true),
  ('car-repair',        'Car Repair',           'Mechanics, workshops, tyres and car wash.',             100, false),
  ('car-dealers',       'Car Dealers',          'New and used car showrooms and rentals.',               110, false),
  ('plumbers',          'Plumbers',             'Plumbing, water tanks and sanitary work.',              120, true),
  ('electricians',      'Electricians',         'Electrical repair, wiring, solar and UPS.',             130, true),
  ('ac-repair',         'AC & Appliance Repair','Air conditioner, fridge and appliance servicing.',      140, false),
  ('lawyers',           'Lawyers',              'Law firms, advocates and legal consultants.',           150, false),
  ('accountants',       'Accountants & Tax',    'Accountants, tax consultants and auditors.',            160, false),
  ('hotels',            'Hotels & Guest Houses','Hotels, guest houses and short stays.',                 170, false),
  ('travel-agents',     'Travel Agents',        'Travel, tickets, visas, Hajj and Umrah.',               180, false),
  ('shopping',          'Shopping & Retail',    'Shops, supermarkets, clothing and electronics.',        190, false),
  ('it-services',       'IT & Web Services',    'Software houses, web design, repair and internet.',     200, false),
  ('event-services',    'Events & Wedding',     'Marquees, caterers, photographers and decorators.',     210, false),
  ('home-services',     'Home Services',        'Cleaning, pest control, movers and carpenters.',        220, false)
on conflict (slug) do nothing;
