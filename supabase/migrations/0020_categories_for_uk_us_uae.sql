-- 0020 — category descriptions for the UK, US and UAE
--
-- 0017 wrote category descriptions for the Pakistan market (property dealers,
-- solar and UPS, marquees, Hajj and Umrah). This rewords them for the new
-- markets. Slugs and names are unchanged, and a description is only replaced
-- while it still holds the original 0017 text, so admin edits are kept.

update categories c
   set description = v.new_description
  from (values
  ('schools', 'Schools, tuition centres and training institutes.', 'Schools, tutoring centres and training institutes.'),
  ('pharmacies', 'Chemists and medical stores.', 'Pharmacies, chemists and drugstores.'),
  ('real-estate', 'Property dealers, builders and developers.', 'Estate agents, realtors, builders and developers.'),
  ('plumbers', 'Plumbing, water tanks and sanitary work.', 'Plumbing, heating, boilers and bathroom fitting.'),
  ('electricians', 'Electrical repair, wiring, solar and UPS.', 'Electrical repair, wiring, EV chargers and solar panels.'),
  ('ac-repair', 'Air conditioner, fridge and appliance servicing.', 'Air conditioning, heating and appliance servicing.'),
  ('lawyers', 'Law firms, advocates and legal consultants.', 'Law firms, solicitors, attorneys and legal consultants.'),
  ('accountants', 'Accountants, tax consultants and auditors.', 'Accountants, tax advisers, CPAs and auditors.'),
  ('hotels', 'Hotels, guest houses and short stays.', 'Hotels, B&Bs, serviced apartments and short stays.'),
  ('travel-agents', 'Travel, tickets, visas, Hajj and Umrah.', 'Travel agents, tours, flights and visa services.'),
  ('it-services', 'Software houses, web design, repair and internet.', 'IT support, web design, software development and computer repair.'),
  ('event-services', 'Marquees, caterers, photographers and decorators.', 'Venues, caterers, photographers and event planners.')
  ) as v(slug, old_description, new_description)
 where c.slug = v.slug
   and c.description = v.old_description;
