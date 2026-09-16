-- 0012 — one video link per listing
-- The owner asked for video on a listing, explicitly as a LINK, not an upload.
-- A single nullable column rather than a table: the requirement is exactly one
-- video, a table would add a join to every listing read for a 0-or-1 relationship,
-- and listing_images already covers the many-images case.

alter table listings add column video_url text;

-- Host allowlist. A free-text URL column on a public page is a stored-XSS and
-- open-redirect surface; constraining it to two known embed hosts means the
-- renderer can build an iframe src without trusting the value.
alter table listings add constraint listings_video_url_host check (
  video_url is null or video_url ~* '^https://(www\.)?(youtube\.com/watch\?v=|youtu\.be/|vimeo\.com/)[A-Za-z0-9_\-/?&=.]+$'
);

comment on column listings.video_url is
  'Optional YouTube or Vimeo watch URL. Host-constrained by listings_video_url_host.';

-- public_listings must expose it or the detail page cannot render it.
-- create or replace cannot add a column in the middle, and it cannot drop/reorder,
-- so the full column list from 0007 is restated verbatim with video_url appended
-- in the same position it occupies there (after social_links/is_featured group).
drop view if exists public_listings;
create view public_listings
with (security_invoker = true)
as
  select
    l.id, l.slug, l.name, l.tagline, l.description,
    l.category_id, l.subcategory_id,
    l.phone_primary, l.phone_secondary, l.email, l.website,
    l.address, l.postal_code,
    l.country_id, l.region_id, l.city_id, l.area_id,
    l.latitude, l.longitude, l.geo,
    l.social_links, l.is_featured,
    l.video_url,
    l.rating_average, l.review_count,
    l.seo_title, l.seo_description,
    l.verification,
    l.published_at, l.created_at, l.updated_at
  from listings l
  where l.status = 'approved';
