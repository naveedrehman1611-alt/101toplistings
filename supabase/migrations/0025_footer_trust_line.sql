-- 0025 — footer trust line
--
-- The text in the pill under the footer blurb, after the five stars, such as
-- "5.0 Google Rating · 500+ Clients Ranked". Blank hides the pill. Seeded
-- blank so the site never claims a rating nobody entered.
--
-- Safe to re-run: an existing value is left alone.

insert into settings (key, value, "group") values
  ('footer.trust_line', to_jsonb(''::text), 'footer')
on conflict (key) do nothing;
