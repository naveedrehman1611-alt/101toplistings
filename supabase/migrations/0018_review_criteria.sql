-- 0018 — per-aspect review ratings
--
-- The listing page asks for an overall rating plus three optional aspects:
-- service, hospitality and pricing. The overall score stays in reviews.rating,
-- which is the only column the rating aggregate trigger reads, so these columns
-- change no existing behaviour. They are nullable: reviews written before this
-- migration, and aspects a reviewer skips, have no value.

alter table reviews add column if not exists rating_service     smallint;
alter table reviews add column if not exists rating_hospitality smallint;
alter table reviews add column if not exists rating_pricing     smallint;

alter table reviews drop constraint if exists reviews_rating_service_range;
alter table reviews add constraint reviews_rating_service_range
  check (rating_service is null or rating_service between 1 and 5);

alter table reviews drop constraint if exists reviews_rating_hospitality_range;
alter table reviews add constraint reviews_rating_hospitality_range
  check (rating_hospitality is null or rating_hospitality between 1 and 5);

alter table reviews drop constraint if exists reviews_rating_pricing_range;
alter table reviews add constraint reviews_rating_pricing_range
  check (rating_pricing is null or rating_pricing between 1 and 5);
