# Data model

Derived from `docs/reference-analysis.md` (what the reference pages actually display) plus the
fields the specification adds in §7.5 and §9.5.2. Implemented in `supabase/migrations/`.

## Migration set

| File | Contents |
|---|---|
| `0001_extensions_and_enums.sql` | PostGIS, pgcrypto, pg_trgm, unaccent; all enums |
| `0002_taxonomy_and_geo.sql` | categories; countries → regions → cities → areas; `location_slugs` view |
| `0003_profiles_and_listings.sql` | profiles; listings; listing_images; opening_hours; amenities |
| `0004_reviews_and_engagement.sql` | reviews; favourites; claims |
| `0005_blog.sql` | blog_categories; blog_tags; blog_posts; blog_post_tags |
| `0006_cms_and_settings.sql` | media; pages; page_sections; section_items; settings; menus; menu_items; seo_meta; redirects; not_found_log; form_submissions; announcements; audit_logs |
| `0007_functions_and_views.sql` | role helpers; triggers; `public_listings`; `search_listings`; SEO density threshold |
| `0008_rls_policies.sql` | RLS on all 31 tables |

## Nullability is driven by observed variation

The 13 variations in `reference-analysis.md` decide which listing columns are nullable. Only
`name`, `slug` and `status` are required. Every other field was seen absent on at least one real
record, so the UI must degrade for each — and criterion 32 requires the seed to exercise them.

| Column | Nullable | Evidence |
|---|---|---|
| `tagline` | yes | variation 4 — absent on `the-joint-chiropractic-oxford` |
| `email` | yes | variation 5 — row disappears from the contact card |
| cover image | yes | variation 1 — falls back to a flat gradient |
| logo | yes | variation 2 — falls back to an initial tile |
| opening hours | yes | variation 6 — whole section absent |
| gallery | yes | variation 9 — present on 3 of 5 |
| `social_links` | defaults `[]` | 7 on one record, 0 on others |
| `latitude`/`longitude` | yes, **paired** | a half-pair would break distance display |
| `rating_average` | yes, **null when `review_count` = 0** | §7.5.8 forbids claiming a rating that does not exist |

Two constraints encode rules that are easy to violate later:
`listings_coords_paired` (both coordinates or neither) and `listings_rating_consistent`
(a rating exists only alongside reviews).

## Opening hours

Rows, not jsonb, so `OpeningHoursSpecification` can be emitted directly. The reference showed
four shapes (3a, variations 6–8): normal ranges, `Closed` days, an all-day `12:00 AM – 11:59 PM`
default, and the section absent entirely. `is_closed` and `is_24h` are explicit booleans rather
than magic times, so "genuinely open 24h" stays distinguishable from "never set" — a defect the
reference has, where placeholder hours render identically to real ones.

## Location: hierarchy plus flat linkability

§7.5.3 locks countries → regions → cities → areas as four relational tables. The reference
instead uses one flat table where continent, country and state share a URL depth — good for
linkability, but it has no normalised location model at all (variation 10: five records, five
different location formats).

Both are kept: the spec's four tables for storage, and the `location_slugs` view so
`/location/[slug]` resolves any level from one route. A trigger enforces slug uniqueness across
all four tables, since a flat route is ambiguous otherwise.

## Geo

`listings.geo` is a **generated** `geography(Point,4326)` column, so it can never drift from
`latitude`/`longitude`. `listings_geo_idx` (GiST) backs every radius query.

`search_listings()` is the single entry point for §7.5.6 — keyword + category + location +
radius + rating + sort + pagination in one server-side call. Distance is computed in Postgres
and returned as `distance_km`; nothing is ever computed in the browser (§7.5.4).

`distance_km` is `null` unless **both** the origin and the listing have real coordinates. §7.5.5
forbids fabricated distances, so the UI must render no distance rather than a guess.

## Permission matrix

Roles are a PostgreSQL enum whose **declaration order is the authority ordering**;
`has_min_role()` compares ordinals.

| | user | business_owner | moderator | editor | admin | super_admin |
|---|---|---|---|---|---|---|
| Read approved listings | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create listing (as `pending`) | — | ✅ | ✅ | ✅ | ✅ | ✅ |
| Edit **own** listing | — | ✅ | ✅ | ✅ | ✅ | ✅ |
| Approve / suspend listing | — | — | ✅ | ✅ | ✅ | ✅ |
| Moderate reviews | — | — | ✅ | ✅ | ✅ | ✅ |
| Edit pages, sections, blog, media, SEO | — | — | — | ✅ | ✅ | ✅ |
| Global settings, users, roles, redirects | — | — | — | — | ✅ | ✅ |

**Assumption (A-4).** A single linear ordering forces `editor` to outrank `moderator`, so editors
inherit moderation rights. §9.5.4 lists the two as distinct rather than ranked, so if they should
be genuinely orthogonal this needs a join table instead of an enum. Flagged rather than decided.

Two escalation paths are closed explicitly, because they are the obvious ones:

- **Owners cannot self-approve.** `listings_owner_update` pins `status`, `verification` and
  `is_featured` to their existing values, and `listings_owner_insert` forces `status = 'pending'`.
- **Users cannot self-promote.** `profiles_self_update` pins `role` and `is_suspended`.

## Privacy — criterion 50

§7.5.2 marks `owner_user_id`, `created_by`, `last_updated_by`, `status`, `verification` and
`rejection_note` as internal. Public queries read the `public_listings` view, which omits the
ownership and audit columns and filters to `status = 'approved'`. A careless `select *` against
the view therefore cannot leak an internal field.

`settings` is world-readable by design — the public site renders brand name, logo and contact
details from it (§9.5.1). Nothing secret belongs there; secrets stay in environment variables.
