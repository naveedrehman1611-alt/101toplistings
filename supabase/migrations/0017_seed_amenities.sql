-- 0017 — a starting amenity vocabulary
-- The table shipped empty, so the form's Amenities step had nothing to render.
-- These are generic across the directory's categories (clinics, home services,
-- automotive, professional services). The owner edits or replaces them from
-- /admin later; slugs are the stable key, names are free to change.

insert into amenities (slug, name, icon, sort_order) values
  ('parking',             'Parking available',      'car',            10),
  ('free-parking',        'Free parking',           'circle-parking', 20),
  ('wheelchair-access',   'Wheelchair accessible',  'accessibility',  30),
  ('wifi',                'Free Wi-Fi',             'wifi',           40),
  ('card-payment',        'Card payment',           'credit-card',    50),
  ('cash-only',           'Cash only',              'banknote',       60),
  ('online-booking',      'Online booking',         'calendar-check', 70),
  ('walk-ins',            'Walk-ins welcome',       'door-open',      80),
  ('appointment-only',    'Appointment only',       'calendar-clock', 90),
  ('home-visits',         'Home visits',            'house',         100),
  ('delivery',            'Delivery',               'truck',         110),
  ('emergency-service',   'Emergency service',      'siren',         120),
  ('open-24-7',           'Open 24/7',              'clock',         130),
  ('free-consultation',   'Free consultation',      'message-circle',140),
  ('free-estimates',      'Free estimates',         'calculator',    150),
  ('licensed-insured',    'Licensed & insured',     'shield-check',  160),
  ('warranty',            'Work guaranteed',        'badge-check',   170),
  ('women-owned',         'Women owned',            'users',         180),
  ('family-owned',        'Family owned',           'heart',         190),
  ('eco-friendly',        'Eco friendly',           'leaf',          200),
  ('pet-friendly',        'Pet friendly',           'paw-print',     210),
  ('kid-friendly',        'Kid friendly',           'baby',          220),
  ('multilingual-staff',  'Multilingual staff',     'languages',     230),
  ('senior-discount',     'Senior discount',        'percent',       240)
on conflict (slug) do nothing;
