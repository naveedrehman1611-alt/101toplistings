-- 0018 — SmartBizDir homepage: page builder fields, taxonomy, content, newsletter
--
-- The homepage is now rendered section by section from page_sections in
-- sort_order, by section_type (src/lib/home.ts), so editors can reorder,
-- disable, add and fill sections from Admin → Pages & sections. This migration:
--
--   1. adds the per-item fields the section editor needs (subtitle, icon,
--      enabled flag) and a newsletter_subscribers table;
--   2. loads the SmartBizDir category tree (18 parents) and the cities the
--      reference site lists, adopting matching 0017 starter rows;
--   3. makes search_listings match a parent category's children, so choosing
--      "Health & Medical" in the hero search also finds "Doctors";
--   4. seeds the homepage sections, their items, the menus and the settings the
--      header and footer read.
--
-- Safe to re-run, and it never overwrites an admin edit: rows are inserted only
-- when missing, and existing rows are changed only while they still hold the
-- exact default values an earlier migration wrote. Copy may contain the token
-- {brand}, which the site replaces with the brand.name setting when rendering.

-- ===========================================================================
-- 1. Schema
-- ===========================================================================

alter table section_items add column if not exists subtitle   text;
alter table section_items add column if not exists icon       text;
alter table section_items add column if not exists is_enabled boolean not null default true;
alter table section_items add column if not exists created_at timestamptz not null default now();
alter table section_items add column if not exists updated_at timestamptz not null default now();

do $$ begin
  alter table section_items add constraint section_items_ref_type_check
    check (ref_type is null or ref_type in ('listing', 'category', 'city', 'blog_post'));
exception when duplicate_object then null;
end $$;

drop trigger if exists section_items_updated_touch on section_items;
create trigger section_items_updated_touch before update on section_items
  for each row execute function touch_updated_at();

-- What a business card needs beyond search_listings: the phone number and a
-- short excerpt. Cut to 200 characters in the database so a card never pulls a
-- full description across the wire. security_invoker keeps the caller's RLS.
create or replace view public_listing_cards
with (security_invoker = true)
as
  select id,
         phone_primary,
         left(btrim(regexp_replace(coalesce(description, ''), '\s+', ' ', 'g')), 200) as excerpt
    from public_listings;

grant select on public_listing_cards to anon, authenticated;

-- Newsletter sign-ups from the footer form. Its own table rather than
-- form_submissions: an address should be stored once, which needs a unique
-- constraint, and the inbox is for messages that need a reply.
create table if not exists newsletter_subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique,
  source     text,
  status     text not null default 'active',
  created_at timestamptz not null default now(),
  constraint newsletter_email_format check (
    email = lower(email) and length(email) <= 254 and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  ),
  constraint newsletter_status_check check (status in ('active', 'unsubscribed'))
);

create index if not exists newsletter_subscribers_recent_idx
  on newsletter_subscribers(created_at desc);

alter table newsletter_subscribers enable row level security;

-- Anyone may subscribe, but only as an active subscriber; nobody but staff can
-- read the list back, so the insert endpoint cannot be used to test addresses.
drop policy if exists newsletter_public_insert on newsletter_subscribers;
create policy newsletter_public_insert on newsletter_subscribers
  for insert with check (status = 'active');

drop policy if exists newsletter_staff_read on newsletter_subscribers;
create policy newsletter_staff_read on newsletter_subscribers
  for select using (has_min_role('moderator'));

drop policy if exists newsletter_staff_update on newsletter_subscribers;
create policy newsletter_staff_update on newsletter_subscribers
  for update using (has_min_role('moderator')) with check (has_min_role('moderator'));

drop policy if exists newsletter_admin_delete on newsletter_subscribers;
create policy newsletter_admin_delete on newsletter_subscribers
  for delete using (has_min_role('admin'));

-- ===========================================================================
-- 2. Taxonomy — SmartBizDir's 18 parent categories and their children
-- ===========================================================================
-- Parent slugs match the reference site's category URLs. Its duplicated
-- children are merged: Catering lives under Food & Restaurant, Rent a Car under
-- Automotive, and Electricians/Plumbers under Home Services.

insert into categories (slug, name, sort_order)
values
  ('agriculture-farming',      'Agriculture & Farming',      10),
  ('automotive',               'Automotive',                 20),
  ('beauty-spa',               'Beauty & Spa',               30),
  ('construction-real-estate', 'Construction & Real Estate', 40),
  ('education-training',       'Education & Training',       50),
  ('events-entertainment',     'Events & Entertainment',     60),
  ('finance-banking',          'Finance & Banking',          70),
  ('food-restaurant',          'Food & Restaurant',          80),
  ('health-medical',           'Health & Medical',           90),
  ('home-services',            'Home Services',             100),
  ('hotels-travel',            'Hotels & Travel',           110),
  ('it-technology',            'IT & Technology',           120),
  ('law-legal-services',       'Law & Legal Services',      130),
  ('manufacturing-industry',   'Manufacturing & Industry',  140),
  ('media-advertising',        'Media & Advertising',       150),
  ('professional-services',    'Professional Services',     160),
  ('retail-shopping',          'Retail & Shopping',         170),
  ('sports-fitness',           'Sports & Fitness',          180)
on conflict (slug) do nothing;

-- A child whose slug already exists as a top-level 0017 starter row, still under
-- its starter name, is adopted into the tree (and renamed to the tree's name)
-- rather than duplicated. Anything an editor has renamed or re-parented is left
-- exactly as it is.
insert into categories (parent_id, slug, name, sort_order)
select p.id, c.slug, c.name, c.sort_order
  from (values
    ('agriculture-farming', 'agricultural-machinery', 'Agricultural Machinery', 10),
    ('agriculture-farming', 'dairy-farms',            'Dairy Farms',            20),
    ('agriculture-farming', 'fertilizers',            'Fertilizers',            30),
    ('agriculture-farming', 'fish-farms',             'Fish Farms',             40),
    ('agriculture-farming', 'livestock',              'Livestock',              50),
    ('agriculture-farming', 'poultry-farms',          'Poultry Farms',          60),
    ('agriculture-farming', 'seeds',                  'Seeds',                  70),
    ('automotive', 'auto-electricians', 'Auto Electricians', 10),
    ('automotive', 'auto-workshops',    'Auto Workshops',    20),
    ('automotive', 'bike-dealers',      'Bike Dealers',      30),
    ('automotive', 'car-dealers',       'Car Dealers',       40),
    ('automotive', 'car-wash',          'Car Wash',          50),
    ('automotive', 'oil-change',        'Oil Change',        60),
    ('automotive', 'rent-a-car',        'Rent a Car',        70),
    ('automotive', 'spare-parts',       'Spare Parts',       80),
    ('automotive', 'tyre-shops',        'Tyre Shops',        90),
    ('beauty-spa', 'barbers',       'Barbers',       10),
    ('beauty-spa', 'beauty-salons', 'Beauty Salons', 20),
    ('beauty-spa', 'bridal-makeup', 'Bridal Makeup', 30),
    ('beauty-spa', 'hair-salons',   'Hair Salons',   40),
    ('beauty-spa', 'makeup-artists','Makeup Artists',50),
    ('beauty-spa', 'nail-salons',   'Nail Salons',   60),
    ('beauty-spa', 'skin-clinics',  'Skin Clinics',  70),
    ('beauty-spa', 'spa',           'Spa',           80),
    ('construction-real-estate', 'architects',            'Architects',            10),
    ('construction-real-estate', 'builders',              'Builders',              20),
    ('construction-real-estate', 'construction-material', 'Construction Material', 30),
    ('construction-real-estate', 'contractors',           'Contractors',           40),
    ('construction-real-estate', 'interior-designers',    'Interior Designers',    50),
    ('construction-real-estate', 'paint-services',        'Paint Services',        60),
    ('construction-real-estate', 'real-estate-agents',    'Real Estate Agents',    70),
    ('education-training', 'coaching-centers',    'Coaching Centers',    10),
    ('education-training', 'colleges',            'Colleges',            20),
    ('education-training', 'it-training',         'IT Training',         30),
    ('education-training', 'language-institutes', 'Language Institutes', 40),
    ('education-training', 'online-courses',      'Online Courses',      50),
    ('education-training', 'quran-academies',     'Quran Academies',     60),
    ('education-training', 'schools',             'Schools',             70),
    ('education-training', 'tuition-centers',     'Tuition Centers',     80),
    ('education-training', 'universities',        'Universities',        90),
    ('events-entertainment', 'decorators',            'Decorators',            10),
    ('events-entertainment', 'djs',                   'DJs',                   20),
    ('events-entertainment', 'event-planners',        'Event Planners',        30),
    ('events-entertainment', 'marquee-banquet-halls', 'Marquee/Banquet Halls', 40),
    ('events-entertainment', 'photographers',         'Photographers',         50),
    ('events-entertainment', 'videographers',         'Videographers',         60),
    ('events-entertainment', 'wedding-planners',      'Wedding Planners',      70),
    ('finance-banking', 'accountants',        'Accountants',        10),
    ('finance-banking', 'banks',              'Banks',              20),
    ('finance-banking', 'insurance',          'Insurance',          30),
    ('finance-banking', 'investment-advisors','Investment Advisors',40),
    ('finance-banking', 'loan-services',      'Loan Services',      50),
    ('finance-banking', 'microfinance',       'Microfinance',       60),
    ('finance-banking', 'money-transfer',     'Money Transfer',     70),
    ('finance-banking', 'tax-consultants',    'Tax Consultants',    80),
    ('food-restaurant', 'bakeries',        'Bakeries',        10),
    ('food-restaurant', 'bbq',             'BBQ',             20),
    ('food-restaurant', 'cafes',           'Cafes',           30),
    ('food-restaurant', 'catering',        'Catering',        40),
    ('food-restaurant', 'fast-food',       'Fast Food',       50),
    ('food-restaurant', 'home-chefs',      'Home Chefs',      60),
    ('food-restaurant', 'ice-cream-shops', 'Ice Cream Shops', 70),
    ('food-restaurant', 'pizza',           'Pizza',           80),
    ('food-restaurant', 'restaurants',     'Restaurants',     90),
    ('food-restaurant', 'sweet-shops',     'Sweet Shops',    100),
    ('health-medical', 'ambulance-services', 'Ambulance Services', 10),
    ('health-medical', 'clinics',            'Clinics',            20),
    ('health-medical', 'dental-clinics',     'Dental Clinics',     30),
    ('health-medical', 'doctors',            'Doctors',            40),
    ('health-medical', 'eye-clinics',        'Eye Clinics',        50),
    ('health-medical', 'hospitals',          'Hospitals',          60),
    ('health-medical', 'labs',               'Labs',               70),
    ('health-medical', 'medical-stores',     'Medical Stores',     80),
    ('health-medical', 'pharmacies',         'Pharmacies',         90),
    ('health-medical', 'physiotherapy',      'Physiotherapy',     100),
    ('home-services', 'ac-repair',        'AC Repair',        10),
    ('home-services', 'appliance-repair', 'Appliance Repair', 20),
    ('home-services', 'carpenter',        'Carpenter',        30),
    ('home-services', 'electricians',     'Electricians',     40),
    ('home-services', 'home-cleaning',    'Home Cleaning',    50),
    ('home-services', 'mason',            'Mason',            60),
    ('home-services', 'painter',          'Painter',          70),
    ('home-services', 'pest-control',     'Pest Control',     80),
    ('home-services', 'plumbers',         'Plumbers',         90),
    ('hotels-travel', 'guest-houses',        'Guest Houses',        10),
    ('hotels-travel', 'hotels',              'Hotels',              20),
    ('hotels-travel', 'ticketing-agents',    'Ticketing Agents',    30),
    ('hotels-travel', 'tour-operators',      'Tour Operators',      40),
    ('hotels-travel', 'travel-agencies',     'Travel Agencies',     50),
    ('hotels-travel', 'umrah-hajj-services', 'Umrah/Hajj Services', 60),
    ('hotels-travel', 'visa-consultants',    'Visa Consultants',    70),
    ('it-technology', 'app-development',   'App Development',   10),
    ('it-technology', 'computer-shops',    'Computer Shops',    20),
    ('it-technology', 'cyber-security',    'Cyber Security',    30),
    ('it-technology', 'digital-marketing', 'Digital Marketing', 40),
    ('it-technology', 'hosting-companies', 'Hosting Companies', 50),
    ('it-technology', 'it-support',        'IT Support',        60),
    ('it-technology', 'seo-agencies',      'SEO Agencies',      70),
    ('it-technology', 'software-houses',   'Software Houses',   80),
    ('it-technology', 'web-development',   'Web Development',   90),
    ('law-legal-services', 'advocates',         'Advocates',         10),
    ('law-legal-services', 'corporate-lawyers', 'Corporate Lawyers', 20),
    ('law-legal-services', 'family-lawyers',    'Family Lawyers',    30),
    ('law-legal-services', 'law-firms',         'Law Firms',         40),
    ('law-legal-services', 'legal-consultants', 'Legal Consultants', 50),
    ('law-legal-services', 'notary-public',     'Notary Public',     60),
    ('law-legal-services', 'property-lawyers',  'Property Lawyers',  70),
    ('law-legal-services', 'tax-lawyers',       'Tax Lawyers',       80),
    ('manufacturing-industry', 'factories',           'Factories',           10),
    ('manufacturing-industry', 'industrial-supplies', 'Industrial Supplies', 20),
    ('manufacturing-industry', 'machinery',           'Machinery',           30),
    ('manufacturing-industry', 'packaging',           'Packaging',           40),
    ('manufacturing-industry', 'plastic-products',    'Plastic Products',    50),
    ('manufacturing-industry', 'printing-press',      'Printing Press',      60),
    ('manufacturing-industry', 'steel-works',         'Steel Works',         70),
    ('manufacturing-industry', 'textile',             'Textile',             80),
    ('media-advertising', 'advertising-agencies',    'Advertising Agencies',    10),
    ('media-advertising', 'content-writing',         'Content Writing',         20),
    ('media-advertising', 'pr-agencies',             'PR Agencies',             30),
    ('media-advertising', 'printing-agencies',       'Printing Agencies',       40),
    ('media-advertising', 'signboards',              'Signboards',              50),
    ('media-advertising', 'social-media-marketing',  'Social Media Marketing',  60),
    ('media-advertising', 'video-production',        'Video Production',        70),
    ('professional-services', 'business-consultants',  'Business Consultants',  10),
    ('professional-services', 'consultants',           'Consultants',           20),
    ('professional-services', 'freelancers',           'Freelancers',           30),
    ('professional-services', 'graphic-designers',     'Graphic Designers',     40),
    ('professional-services', 'hr-services',           'HR Services',           50),
    ('professional-services', 'recruitment-agencies',  'Recruitment Agencies',  60),
    ('professional-services', 'translation-services',  'Translation Services',  70),
    ('retail-shopping', 'book-stores',    'Book Stores',    10),
    ('retail-shopping', 'clothing',       'Clothing',       20),
    ('retail-shopping', 'electronics',    'Electronics',    30),
    ('retail-shopping', 'furniture',      'Furniture',      40),
    ('retail-shopping', 'general-stores', 'General Stores', 50),
    ('retail-shopping', 'gift-shops',     'Gift Shops',     60),
    ('retail-shopping', 'jewelry',        'Jewelry',        70),
    ('retail-shopping', 'mobile-shops',   'Mobile Shops',   80),
    ('retail-shopping', 'shoes',          'Shoes',          90),
    ('retail-shopping', 'supermarkets',   'Supermarkets',  100),
    ('sports-fitness', 'fitness-centers',   'Fitness Centers',   10),
    ('sports-fitness', 'gyms',              'Gyms',              20),
    ('sports-fitness', 'martial-arts',      'Martial Arts',      30),
    ('sports-fitness', 'personal-trainers', 'Personal Trainers', 40),
    ('sports-fitness', 'sports-shops',      'Sports Shops',      50),
    ('sports-fitness', 'swimming-pools',    'Swimming Pools',    60),
    ('sports-fitness', 'yoga-centers',      'Yoga Centers',      70)
  ) as c(parent_slug, slug, name, sort_order)
  join categories p on p.slug = c.parent_slug
on conflict (slug) do update
   set parent_id  = excluded.parent_id,
       name       = excluded.name,
       sort_order = excluded.sort_order
 where categories.parent_id is null
   and categories.name in (
     'Restaurants', 'Doctors & Clinics', 'Hospitals', 'Pharmacies', 'Beauty Salons & Spas',
     'Gyms & Fitness', 'Schools & Academies', 'Car Dealers', 'Plumbers', 'Electricians',
     'AC & Appliance Repair', 'Accountants & Tax', 'Hotels & Guest Houses'
   );

-- 0017 starter categories the tree replaces. Removed only while unused by any
-- listing and still under their starter name; otherwise they stay for an editor
-- to merge by hand.
delete from categories c
 where (c.slug, c.name) in (
         ('dentists',       'Dentists'),
         ('real-estate',    'Real Estate'),
         ('car-repair',     'Car Repair'),
         ('lawyers',        'Lawyers'),
         ('travel-agents',  'Travel Agents'),
         ('shopping',       'Shopping & Retail'),
         ('it-services',    'IT & Web Services'),
         ('event-services', 'Events & Wedding'))
   and c.parent_id is null
   and not exists (select 1 from categories k where k.parent_id = c.id)
   and not exists (select 1 from listings l where l.category_id = c.id or l.subcategory_id = c.id);

-- ===========================================================================
-- 2b. Cities the reference site lists that 0017 did not seed
-- ===========================================================================
-- District headquarters are used for district-level entries (Diamer → Chilas,
-- Ghizer → Gahkuch, Jaffarabad → Dera Allah Yar, Lasbela → Uthal).

insert into cities (region_id, slug, name, latitude, longitude)
select g.id, x.slug, x.name, x.lat, x.lng
  from regions g
  join (values
    ('punjab', 'chakwal',          'Chakwal',          32.9328, 72.8630),
    ('punjab', 'dera-ghazi-khan',  'Dera Ghazi Khan',  30.0561, 70.6348),
    ('punjab', 'jhang',            'Jhang',            31.2681, 72.3181),
    ('punjab', 'khanewal',         'Khanewal',         30.3017, 71.9321),
    ('punjab', 'layyah',           'Layyah',           30.9693, 70.9428),
    ('punjab', 'mandi-bahauddin',  'Mandi Bahauddin',  32.5861, 73.4917),
    ('punjab', 'muzaffargarh',     'Muzaffargarh',     30.0736, 71.1805),
    ('punjab', 'okara',            'Okara',            30.8138, 73.4534),
    ('punjab', 'rawat',            'Rawat',            33.4960, 73.1960),
    ('punjab', 'toba-tek-singh',   'Toba Tek Singh',   30.9709, 72.4827),
    ('punjab', 'vehari',           'Vehari',           30.0452, 72.3489),
    ('sindh', 'badin',             'Badin',            24.6559, 68.8370),
    ('sindh', 'jacobabad',         'Jacobabad',        28.2769, 68.4514),
    ('sindh', 'khairpur',          'Khairpur',         27.5295, 68.7592),
    ('sindh', 'mirpur-khas',       'Mirpur Khas',      25.5276, 69.0111),
    ('sindh', 'thatta',            'Thatta',           24.7461, 67.9235),
    ('khyber-pakhtunkhwa', 'bannu',     'Bannu',     32.9854, 70.6027),
    ('khyber-pakhtunkhwa', 'charsadda', 'Charsadda', 34.1482, 71.7406),
    ('khyber-pakhtunkhwa', 'haripur',   'Haripur',   33.9946, 72.9106),
    ('khyber-pakhtunkhwa', 'kohat',     'Kohat',     33.5869, 71.4429),
    ('khyber-pakhtunkhwa', 'mansehra',  'Mansehra',  34.3300, 73.1968),
    ('khyber-pakhtunkhwa', 'swat',      'Swat',      34.7470, 72.3570),
    ('balochistan', 'chaman',     'Chaman',     30.9210, 66.4597),
    ('balochistan', 'jaffarabad', 'Jaffarabad', 28.3736, 68.3502),
    ('balochistan', 'khuzdar',    'Khuzdar',    27.8119, 66.6100),
    ('balochistan', 'lasbela',    'Lasbela',    25.8000, 66.6200),
    ('balochistan', 'panjgur',    'Panjgur',    26.9644, 64.0903),
    ('balochistan', 'sibi',       'Sibi',       29.5430, 67.8773),
    ('balochistan', 'turbat',     'Turbat',     26.0023, 63.0440),
    ('balochistan', 'zhob',       'Zhob',       31.3406, 69.4494),
    ('gilgit-baltistan', 'diamer', 'Diamer', 35.4206, 74.0950),
    ('gilgit-baltistan', 'ghizer', 'Ghizer', 36.1667, 73.7667),
    ('gilgit-baltistan', 'hunza',  'Hunza',  36.3167, 74.6500),
    ('gilgit-baltistan', 'skardu', 'Skardu', 35.2971, 75.6333)
  ) as x(region_slug, slug, name, lat, lng) on g.slug = x.region_slug
 where not exists (select 1 from location_slugs l where l.slug = x.slug);

-- ===========================================================================
-- 3. search_listings — a category filter also matches its child categories
-- ===========================================================================
-- Identical to 0012_search_performance.sql except for the category predicate.
-- Same signature and result columns, so existing grants and callers are kept.
create or replace function search_listings(
  p_query       text default null,
  p_category_id uuid default null,
  p_country_id  uuid default null,
  p_region_id   uuid default null,
  p_city_id     uuid default null,
  p_area_id     uuid default null,
  p_lat         double precision default null,
  p_lng         double precision default null,
  p_radius_km   double precision default null,
  p_min_rating  numeric default null,
  p_sort        listing_sort default 'newest',
  p_limit       integer default 20,
  p_offset      integer default 0
)
returns table (
  id             uuid,
  slug           text,
  name           text,
  tagline        text,
  category_id    uuid,
  city_id        uuid,
  latitude       double precision,
  longitude      double precision,
  rating_average numeric,
  review_count   integer,
  is_featured    boolean,
  published_at   timestamptz,
  distance_km    double precision,
  total_count    bigint
)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_query  text := nullif(btrim(p_query), '');
  v_origin geography;
  v_where  text := 'l.status = ''approved''';
  v_order  text;
  v_total  bigint;
begin
  if p_lat is not null and p_lng is not null then
    v_origin := st_setsrid(st_makepoint(p_lng, p_lat), 4326)::geography;
  end if;

  -- Parameter slots: $1 keyword pattern, $2 category, $3 country, $4 region,
  -- $5 city, $6 area, $7 origin, $8 radius metres, $9 min rating.
  if v_query is not null then
    -- Must match the listings_search_trgm_idx expression exactly.
    v_where := v_where || ' and (coalesce(l.name,'''') || '' '' || coalesce(l.tagline,'''')'
                       || ' || '' '' || coalesce(l.description,'''')) ilike $1';
  end if;
  if p_category_id is not null then
    -- A parent category also matches listings filed under its children. The
    -- subquery is planned per call like the rest of this WHERE clause, and
    -- category_id = any(...) can still use listings_category_recent_idx.
    v_where := v_where || ' and (l.category_id = any(array(select c.id from categories c'
                       || ' where c.id = $2 or c.parent_id = $2))'
                       || ' or l.subcategory_id = $2)';
  end if;
  if p_country_id is not null then v_where := v_where || ' and l.country_id = $3'; end if;
  if p_region_id  is not null then v_where := v_where || ' and l.region_id = $4';  end if;
  if p_city_id    is not null then v_where := v_where || ' and l.city_id = $5';    end if;
  if p_area_id    is not null then v_where := v_where || ' and l.area_id = $6';    end if;
  if p_min_rating is not null then v_where := v_where || ' and l.rating_average >= $9'; end if;
  -- A listing with no geo is excluded when a radius is requested: an unknown
  -- distance cannot be asserted to be inside it.
  if p_radius_km is not null and v_origin is not null then
    v_where := v_where || ' and st_dwithin(l.geo, $7, $8)';
  end if;

  v_order := case p_sort
    when 'nearest' then
      case when v_origin is not null then 'l.geo <-> $7 nulls last, l.id' else 'l.id' end
    when 'rating'       then 'l.rating_average desc nulls last, l.id'
    when 'alphabetical' then 'lower(l.name), l.id'
    when 'oldest'       then 'l.published_at asc nulls last, l.id'
    else                     'l.published_at desc nulls last, l.id'
  end;

  execute 'select count(*) from listings l where ' || v_where
     into v_total
    using '%' || replace(replace(replace(v_query, '\', '\\'), '%', '\%'), '_', '\_') || '%',
          p_category_id, p_country_id, p_region_id, p_city_id, p_area_id,
          v_origin, p_radius_km * 1000.0, p_min_rating;

  if v_total = 0 then
    return;
  end if;

  return query execute
    'select l.id, l.slug, l.name, l.tagline, l.category_id, l.city_id,'
    || ' l.latitude, l.longitude, l.rating_average::numeric, l.review_count,'
    || ' l.is_featured, l.published_at,'
    || ' case when $7 is not null and l.geo is not null'
    || '      then st_distance(l.geo, $7) / 1000.0 end,'
    || ' $10'
    || ' from listings l where ' || v_where
    || ' order by ' || v_order
    || ' limit $11 offset $12'
    using '%' || replace(replace(replace(v_query, '\', '\\'), '%', '\%'), '_', '\_') || '%',
          p_category_id, p_country_id, p_region_id, p_city_id, p_area_id,
          v_origin, p_radius_km * 1000.0, p_min_rating,
          v_total,
          least(greatest(coalesce(p_limit, 20), 0), 100),
          greatest(coalesce(p_offset, 0), 0);
end;
$$;

-- ===========================================================================
-- 4. Settings read by the header, footer and homepage
-- ===========================================================================

insert into settings (key, value, "group") values
  ('brand.name_accent',          to_jsonb('Dir'::text), 'brand'),
  ('brand.logo_light_media_id',  to_jsonb(''::text), 'brand'),
  ('brand.logo_dark_media_id',   to_jsonb(''::text), 'brand'),
  ('header.login_label',         to_jsonb('Login'::text), 'header'),
  ('header.login_url',           to_jsonb('/login'::text), 'header'),
  ('header.register_label',      to_jsonb('Sign Up'::text), 'header'),
  ('header.register_url',        to_jsonb('/register'::text), 'header'),
  ('header.cta_label',           to_jsonb('Add Listing'::text), 'header'),
  ('header.cta_url',             to_jsonb('/dashboard/listings/new'::text), 'header'),
  ('footer.tagline',             to_jsonb('Covering All of Pakistan From Karachi to Lahore, Islamabad to Peshawar'::text), 'footer'),
  ('footer.locations_heading',   to_jsonb('Locations'::text), 'footer'),
  ('footer.links_heading',       to_jsonb('Useful Links'::text), 'footer'),
  ('footer.newsletter_heading',  to_jsonb('Newsletter'::text), 'footer'),
  ('footer.newsletter_text',     to_jsonb('Subscribe for local business updates'::text), 'footer'),
  ('footer.newsletter_placeholder', to_jsonb('Email'::text), 'footer'),
  ('footer.newsletter_button',   to_jsonb('Subscribe'::text), 'footer'),
  ('contact.phone',              to_jsonb(''::text), 'contact'),
  ('contact.address',            to_jsonb(''::text), 'contact'),
  ('social.facebook',            to_jsonb('https://www.facebook.com/smartbizdir/'::text), 'social'),
  ('social.instagram',           to_jsonb('https://www.instagram.com/smartbizdir/'::text), 'social'),
  ('social.x',                   to_jsonb('https://x.com/smartbizdir'::text), 'social'),
  ('social.linkedin',            to_jsonb(''::text), 'social'),
  ('social.youtube',             to_jsonb(''::text), 'social')
on conflict (key) do nothing;

-- Rebrand the 0013 defaults, and only those: a value an admin has already
-- changed is not touched.
update settings set value = to_jsonb('SmartBizDir'::text)
 where key = 'brand.name' and value = to_jsonb('RankYouSite'::text);
update settings set value = to_jsonb('smartbizdir.com'::text)
 where key = 'brand.domain' and value = to_jsonb('rankyousite.com'::text);
update settings set value = to_jsonb('Discover, compare, and contact local businesses across Pakistan.'::text)
 where key = 'brand.tagline' and value = to_jsonb('Find trusted local businesses near you.'::text);
update settings set value = to_jsonb('Smart Biz Dir – All rights reserved'::text)
 where key = 'footer.copyright' and value = to_jsonb('RankYouSite'::text);
update settings set value = to_jsonb('Business Directory Pakistan | Find Local Services'::text)
 where key = 'seo.default_title' and value = to_jsonb('RankYouSite — local business directory'::text);
update settings set value = to_jsonb('Explore Business Directory Pakistan to find restaurants, doctors, shops, professionals, and local services by category, city, or area.'::text)
 where key = 'seo.default_description'
   and value = to_jsonb('Search local businesses by name, category and city, with real addresses, opening hours and reviews.'::text);

-- ===========================================================================
-- 5. Menus
-- ===========================================================================
-- The header and mobile menus are replaced only while they still hold exactly
-- the 0013 default links. The two footer columns become "Locations" and
-- "Useful Links"; "Explore" is removed only if it is still the 0013 default.

do $$
declare
  m        record;
  current  text[];
  defaults text[];
begin
  for m in
    select mn.id, mn.location::text as location
      from menus mn
     where (mn.location::text, mn.name) in (('header', 'Primary'), ('mobile', 'Mobile'))
  loop
    select coalesce(array_agg(url order by url), '{}') into current
      from menu_items where menu_id = m.id;
    if m.location = 'header' then
      defaults := array['/blog', '/categories', '/contact', '/listings'];
    else
      defaults := array['/about', '/blog', '/categories', '/contact', '/dashboard/listings/new', '/listings'];
    end if;
    if current = defaults then
      delete from menu_items where menu_id = m.id;
    end if;
  end loop;
end $$;

insert into menus (location, name) values
  ('footer', 'Locations'),
  ('footer', 'Useful Links')
on conflict (location, name) do nothing;

delete from menus mn
 where mn.location = 'footer'
   and (mn.name, (select coalesce(array_agg(url order by url), '{}') from menu_items where menu_id = mn.id))
       in (('Explore', array['/categories', '/listings', '/search']),
           ('Company', array['/about', '/blog', '/contact', '/login']));

-- Filled only while empty, like 0013, so admin edits are never duplicated.
insert into menu_items (menu_id, label, url, sort_order)
select m.id, i.label, i.url, i.sort_order
  from (values
    ('header', 'Primary',      'Home',       '/',         10),
    ('header', 'Primary',      'Listing',    '/listings', 20),
    ('header', 'Primary',      'Blog',       '/blog',     30),
    ('header', 'Primary',      'About Us',   '/about',    40),
    ('header', 'Primary',      'Contact Us', '/contact',  50),
    ('mobile', 'Mobile',       'Home',       '/',         10),
    ('mobile', 'Mobile',       'Listing',    '/listings', 20),
    ('mobile', 'Mobile',       'Blog',       '/blog',     30),
    ('mobile', 'Mobile',       'About us',   '/about',    40),
    ('mobile', 'Mobile',       'Contact us', '/contact',  50),
    ('footer', 'Useful Links', 'About us',   '/about',    10),
    ('footer', 'Useful Links', 'Contact us', '/contact',  20),
    ('footer', 'Useful Links', 'FAQ',        '/#faq',     30)
  ) as i(location, menu_name, label, url, sort_order)
  join menus m on m.location = i.location::menu_location and m.name = i.menu_name
 where not exists (select 1 from menu_items x where x.menu_id = m.id);

-- Location links only for cities that exist, so the footer never links to a 404.
insert into menu_items (menu_id, label, url, sort_order)
select m.id, c.name, '/city/' || c.slug, i.sort_order
  from (values ('karachi', 10), ('lahore', 20), ('multan', 30), ('rawalpindi', 40), ('islamabad', 50))
       as i(slug, sort_order)
  join cities c on c.slug = i.slug
  join menus m on m.location = 'footer' and m.name = 'Locations'
 where not exists (select 1 from menu_items x where x.menu_id = m.id);

-- ===========================================================================
-- 6. Homepage sections
-- ===========================================================================
-- Existing 0013 sections keep their keys and are rewritten only while they still
-- carry their 0013 heading. New sections are inserted when missing.

update page_sections s
   set heading = x.heading, subheading = x.subheading, cta_label = x.cta_label,
       cta_url = x.cta_url, item_limit = x.item_limit, sort_order = x.sort_order,
       background_variant = x.background_variant, settings = x.settings::jsonb
  from pages p,
       (values
         ('hero', 'Find trusted local businesses',
            'Pakistan''s #1 Business Directory – Find Local Businesses',
            'Business Directory Pakistan helps you find verified businesses, restaurants, shops, and local services across Pakistan.',
            null, null, null::int, 10, 'navy',
            '{"what_label":"What","what_placeholder":"Ex: restaurant, lawyer, gym...","where_label":"Where","where_placeholder":"City or Area","button_label":"Search listings","overlay":"medium"}'),
         ('featured', 'Newest listings',
            'Top-Rated Businesses in Your Area',
            'Find trusted local businesses reviewed by real customers across Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad, and other cities of Pakistan.',
            null, null, 6, 20, 'white',
            '{"sort":"rating","autoplay":true,"show_phone":true,"show_status":true,"empty_title":"No businesses listed yet","empty_text":"Be the first to add your business to the directory."}'),
         ('cities', 'Popular cities',
            'Browse Businesses by City',
            'Find local businesses and service providers in major cities across Pakistan. Select a city to explore available categories and business listings.',
            null, null, 4, 50, 'white', '{}'),
         ('categories', 'Browse by category',
            'Popular Services People Search for in Pakistan',
            'From daily essentials to specialized services, these are the categories people search for most often across Pakistan.',
            null, null, null::int, 60, 'white', '{"title_case":true}'),
         ('cta', 'Own a business?',
            'Submit Your Listing Today!',
            'List your business on {brand} for free and start reaching customers who are searching for services like yours.',
            'Add Your Business — It''s Free', '/dashboard/listings/new', null::int, 140, 'brand',
            '{"layout":"banner"}')
       ) as x(section_key, old_heading, heading, subheading, cta_label, cta_url, item_limit,
              sort_order, background_variant, settings)
 where p.id = s.page_id and p.slug = 'home'
   and s.section_key = x.section_key and s.heading = x.old_heading;

insert into page_sections
  (page_id, section_key, section_type, sort_order, heading, subheading, body,
   cta_label, cta_url, item_limit, background_variant, settings)
select p.id, x.section_key, x.section_type::section_type, x.sort_order, x.heading, x.subheading,
       x.body, x.cta_label, x.cta_url, x.item_limit, x.background_variant, x.settings::jsonb
  from pages p
  cross join (values
    ('hero', 'hero_search', 10,
       'Pakistan''s #1 Business Directory – Find Local Businesses',
       'Business Directory Pakistan helps you find verified businesses, restaurants, shops, and local services across Pakistan.',
       null, null, null, null::int, 'navy',
       '{"what_label":"What","what_placeholder":"Ex: restaurant, lawyer, gym...","where_label":"Where","where_placeholder":"City or Area","button_label":"Search listings","overlay":"medium"}'),
    ('featured', 'featured_listings', 20,
       'Top-Rated Businesses in Your Area',
       'Find trusted local businesses reviewed by real customers across Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad, and other cities of Pakistan.',
       null, null, null, 6, 'white',
       '{"sort":"rating","autoplay":true,"show_phone":true,"show_status":true,"empty_title":"No businesses listed yet","empty_text":"Be the first to add your business to the directory."}'),
    ('intro', 'image_text', 30,
       'Find Trusted Local Businesses Across Pakistan',
       'Explore verified listings, compare services, and connect with the right business in your city — all in one place.',
       E'{brand} is a trusted Business Directory Pakistan platform that helps residents discover reliable local businesses and services in their city. Whether you need a restaurant in Lahore, a doctor in Islamabad, a plumber in Rawalpindi, a travel agency in Karachi, or a local shop near your area, this online business directory helps you explore relevant listings from one convenient place. With listings covering major cities as well as smaller towns across Pakistan, users can quickly narrow down their search by category, location, or service type.\n\nEach business profile on this business search platform provides useful details such as the business name, category, location, phone number, opening status, services offered, website link, and customer reviews. Instead of searching through multiple websites and social media pages, visitors can compare verified businesses side by side and contact them directly, saving time and effort. This makes it easier to make informed decisions before visiting a shop, booking a service, or reaching out to a professional.\n\n{brand} also gives Pakistani business owners an opportunity to build an online presence and reach customers who are already searching for their services. Adding a business listing is simple and free, and businesses can showcase their important details, working hours, and contact information to customers across Pakistan through this local business directory. This helps small and local businesses compete alongside larger, more established brands online.',
       null, null, null::int, 'white', '{"image_position":"left"}'),
    ('why_choose', 'value_props', 40,
       'Why Choose {brand} for Local Business Search?',
       'Looking for a business shouldn''t mean scrolling through endless results. {brand} sorts listings by category and location for faster, more relevant results.',
       null, null, null, null::int, 'white', '{"title_case":true,"numbered":false}'),
    ('cities', 'taxonomy_grid', 50,
       'Browse Businesses by City',
       'Find local businesses and service providers in major cities across Pakistan. Select a city to explore available categories and business listings.',
       null, null, null, 4, 'white', '{}'),
    ('categories', 'featured_categories', 60,
       'Popular Services People Search for in Pakistan',
       'From daily essentials to specialized services, these are the categories people search for most often across Pakistan.',
       null, null, null, null::int, 'white', '{"title_case":true}'),
    ('how_it_works', 'value_props', 70,
       'How Does {brand} Work?',
       '{brand} is a trusted Business Directory Pakistan — helping users search, compare, and connect with local businesses quickly and easily.',
       null, null, null, null::int, 'muted', '{"title_case":true,"numbered":false}'),
    ('grow', 'cta_banner', 80,
       'Grow your local visibility with a business listing',
       'Customers search online before choosing a local service provider. A complete profile helps them find you first.',
       null, 'Add Your Business — It''s Free', '/dashboard/listings/new', null::int, 'white',
       '{"layout":"cards"}'),
    ('testimonials', 'testimonials', 90,
       'What Our Users Are Saying',
       'Business owners and customers across Pakistan trust {brand} for finding reliable local services and businesses.',
       null, null, null, null::int, 'white', '{}'),
    ('guidance', 'image_text', 100,
       'Helping Customers Make Better Local Choices',
       'Use each listing to compare your options, then confirm the details that matter before you visit or book.',
       E'Every profile on {brand} brings together the details people usually look for across several websites: what a business does, where it is, when it is open and how to reach it. Business owners provide and update this information, so it is always worth checking that it is current.\n\nFor medical, financial, legal and other important services, confirm opening hours, prices, qualifications or licences, availability and service terms with the business directly before you visit, book or pay.\n\nIf you notice a phone number, address, opening time or any other detail that is wrong or out of date, let us know through our contact page so we can review and correct the listing.',
       'Report incorrect information', '/contact', null::int, 'white', '{"image_position":"right"}'),
    ('listing_cta', 'cta_banner', 110,
       'Get Your Business in Front of Thousands',
       'Create a free profile on {brand} and reach customers across Pakistan who are already searching for businesses like yours.',
       null, 'Add Your Business — It''s Free', '/dashboard/listings/new', null::int, 'navy',
       '{"layout":"banner"}'),
    ('faq', 'faq', 120,
       'Frequently Asked Questions',
       'Answers to common questions about finding businesses and listing your business on {brand}.',
       null, null, null, null::int, 'white', '{"open_first":true,"single_open":true}'),
    ('guides', 'blog_grid', 130,
       'Business Tips & Local Guides',
       'Practical advice for customers and business owners, from choosing a trusted service provider to growing your local visibility.',
       null, 'View all articles', '/blog', 3, 'white', '{"show_dates":true}'),
    ('cta', 'cta_banner', 140,
       'Submit Your Listing Today!',
       'List your business on {brand} for free and start reaching customers who are searching for services like yours.',
       null, 'Add Your Business — It''s Free', '/dashboard/listings/new', null::int, 'brand',
       '{"layout":"banner"}')
  ) as x(section_key, section_type, sort_order, heading, subheading, body, cta_label, cta_url,
         item_limit, background_variant, settings)
 where p.slug = 'home'
on conflict (page_id, section_key) do nothing;

-- ===========================================================================
-- 7. Homepage section items
-- ===========================================================================
-- Seeded only into a section that has no items yet. ref_id is looked up by
-- slug; when the category or city does not exist the item keeps working through
-- its fallback link (see src/lib/home.ts) until an editor points it elsewhere.

insert into section_items (section_id, sort_order, ref_type, ref_id, title, subtitle, body, icon, url)
select s.id, i.sort_order, i.ref_type,
       case i.ref_type
         when 'category' then (select c.id from categories c where c.slug = i.ref_slug)
         when 'city'     then (select c.id from cities c where c.slug = i.ref_slug)
       end,
       i.title, i.subtitle, i.body, i.icon, i.url
  from (values
    -- Hero category tiles
    ('hero', 10, 'category', 'food-restaurant',          'Restaurants',          null, null, 'utensils',       null),
    ('hero', 20, 'category', 'retail-shopping',          'Shopping & Retail',    null, null, 'shopping-bag',   null),
    ('hero', 30, 'category', 'education-training',       'Education & Training', null, null, 'tent',           null),
    ('hero', 40, 'category', 'hotels-travel',            'Hotels & Travel',      null, null, 'bed-double',     null),
    ('hero', 50, 'category', 'construction-real-estate', 'Real Estate',          null, null, 'house',          null),
    ('hero', 60, 'category', 'law-legal-services',       'Legal Services',       null, null, 'gavel',          null),
    -- Why choose
    ('why_choose', 10, null, null, 'Filter by Location and Service', null,
       'Select the exact service you''re looking for along with your city or nearby area. This helps you skip unrelated listings and reach businesses that actually match your needs.',
       'search-check', null),
    ('why_choose', 20, null, null, 'Check Complete Business Info', null,
       'View contact numbers, categories, addresses, current opening status, photos, and other profile details — all before you decide to reach out.',
       'message-circle', null),
    ('why_choose', 30, null, null, 'Reach Out Directly', null,
       'Contact the business by phone, visit their website, or check their exact location on the map. No third-party booking or unnecessary steps involved in the process.',
       'calendar-check', null),
    -- City mosaic: Lahore (wide), Karachi / Multan, Islamabad (wide)
    ('cities', 10, 'city', 'lahore',    null, null, null, null, null),
    ('cities', 20, 'city', 'karachi',   null, null, null, null, null),
    ('cities', 30, 'city', 'multan',    null, null, null, null, null),
    ('cities', 40, 'city', 'islamabad', null, null, null, null, null),
    -- Popular services
    ('categories', 10, 'category', 'food-restaurant', 'Restaurants and Food Services', null,
       'Find restaurants, cafés, bakeries, fast-food outlets, caterers, home chefs, and other food businesses in your city.',
       'utensils', null),
    ('categories', 20, 'category', 'health-medical', 'Health and Medical Services', null,
       'Explore doctors, clinics, dental practices, laboratories, pharmacies, physiotherapists, and other healthcare-related listings.',
       'hand-heart', null),
    ('categories', 30, 'category', 'home-services', 'Home Repair and Maintenance', null,
       'Find plumbers, electricians, AC technicians, carpenters, painters, and other home service providers near you.',
       'house', null),
    ('categories', 40, 'category', 'education-training', 'Education and Training', null,
       'Discover schools, colleges, tuition centers, language institutes, and training academies for every stage of learning.',
       'graduation-cap', null),
    ('categories', 50, 'category', 'hotels-travel', 'Travel and Accommodation', null,
       'Compare hotels, guest houses, travel agencies, tour operators, and Umrah and Hajj services for your next trip.',
       'plane', null),
    ('categories', 60, 'category', 'professional-services', 'Professional and Business Services', null,
       'Connect with consultants, designers, recruitment agencies, translators, and other professionals who help businesses grow.',
       'briefcase', null),
    -- How it works
    ('how_it_works', 10, null, null, 'Search & Discover', null,
       'Type in what you''re looking for — a restaurant, doctor, lawyer, or any local service. Filter by city, category, or rating to find exactly what you need.',
       'search-check', null),
    ('how_it_works', 20, null, null, 'Read Reviews & Compare', null,
       'Browse detailed business profiles with real customer reviews, contact info, and location maps — all in one place. Fast, free, and trusted across Pakistan.',
       'message-circle', null),
    ('how_it_works', 30, null, null, 'Connect & Visit', null,
       'Call, message, or get directions to the business directly from the listing. No middleman, no hassle — just direct connection.',
       'calendar-check', null),
    -- Grow your visibility: one paragraph card, one checklist card (icon = bullet)
    ('grow', 10, null, null, 'Why a Complete Profile Matters', null,
       E'Customers increasingly search online before choosing a local service provider. A complete business profile helps potential customers understand what your business offers, where it operates, and how they can contact you.\n\nBusiness owners can use {brand} to present their company name, service category, business description, phone number, address, operating hours, images, website, and other useful details. Accurate and complete information can make a listing more helpful to customers and improve confidence before they make contact.',
       null, null),
    ('grow', 20, null, null, 'What Should a Complete Business Profile Include?', null,
       E'Accurate business name and category\nOriginal service description\nCurrent phone number and address\nOpening and closing hours\nClear business or service images\nWebsite and social media details\nService areas and available facilities',
       'check', null),
    -- Testimonials: names and roles as published on the reference site. The
    -- quotes and photos are not copied here; a testimonial only renders once an
    -- editor adds its quote in Admin, so nothing is shown that was not said.
    ('testimonials', 10, null, null, 'Mudassir',    'Business Owner', null, null, null),
    ('testimonials', 20, null, null, 'Asad Saleem', 'Business Owner', null, null, null),
    ('testimonials', 30, null, null, 'Aqsa Asghar', 'Developer',      null, null, null),
    ('testimonials', 40, null, null, 'Zunaira',     'Business Owner', null, null, null),
    ('testimonials', 50, null, null, 'Mateen Awan', 'Business Owner', null, null, null),
    -- FAQ
    ('faq', 10, null, null, 'What is {brand}?', null,
       '{brand} is an online business directory for Pakistan. It helps people find local businesses and service providers by category and city, and gives business owners a free way to be found online.',
       null, null),
    ('faq', 20, null, null, 'Is {brand} free to use?', null,
       'Yes. Searching the directory, browsing categories and cities, and viewing business profiles is free. You do not need an account to look up a business.',
       null, null),
    ('faq', 30, null, null, 'Is {brand} free for business submissions?', null,
       'Yes. Creating an account and submitting your business listing costs nothing. Each new listing is reviewed by our team before it is published.',
       null, null),
    ('faq', 40, null, null, 'How can I find a business near me?', null,
       'Use the search bar at the top of the homepage: choose what you are looking for, select your city, and press Search. You can also browse businesses by city or by category.',
       null, null),
    ('faq', 50, null, null, 'What information is available on a business listing?', null,
       'A listing can show the business name, category, address, city, phone number, email, website, opening hours, photos, social media links and customer reviews. Each business decides which details to provide, so some profiles are more complete than others.',
       null, null),
    ('faq', 60, null, null, 'Which cities does {brand} cover?', null,
       '{brand} lists businesses across Pakistan, from large cities such as Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar and Quetta to smaller towns. You can browse the businesses listed in any city from its city page.',
       null, null),
    ('faq', 70, null, null, 'Does {brand} verify every business listing?', null,
       'Every new listing is reviewed by our team before it goes live, and a listing marked as verified has had its details confirmed. Details can still change, so contact the business to confirm prices and availability before you visit.',
       null, null),
    ('faq', 80, null, null, 'How should I choose a local service provider?', null,
       'Compare a few businesses in the same category: look at their services, location, opening hours, photos and reviews, then contact your shortlist to ask about prices, experience and availability before you decide.',
       null, null),
    ('faq', 90, null, null, 'How can I update my business listing?', null,
       'Sign in and open your dashboard, where you can edit your listing details, opening hours and photos at any time.',
       null, null),
    ('faq', 100, null, null, 'How can incorrect business information be reported?', null,
       'Send us a message through the contact page with the business name and the detail that needs correcting. Our team reviews every report and updates the listing.',
       null, null),
    ('faq', 110, null, null, 'Can I contact businesses directly?', null,
       'Yes. {brand} does not act as a middleman. Use the phone number, email, website or address on a business profile to contact the business directly.',
       null, null)
  ) as i(section_key, sort_order, ref_type, ref_slug, title, subtitle, body, icon, url)
  join page_sections s on s.section_key = i.section_key
  join pages p on p.id = s.page_id and p.slug = 'home'
 where not exists (select 1 from section_items x where x.section_id = s.id);
