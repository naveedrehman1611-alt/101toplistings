# Homepage — SmartBizDir rebuild

The homepage recreates https://smartbizdir.com section by section, but every word, image, link and
section on it is data: editors change it in **Admin → Pages & sections**, **Admin → Settings**,
**Admin → Menus** and **Admin → Media**, and the page updates on save.

## 1. Deploying it

Run **`supabase/update_0017_to_0018.sql`** once in the Supabase SQL Editor (a fresh database uses
`supabase/full_setup.sql` instead). It is a single transaction, safe to re-run, and it only changes rows
that still hold an earlier migration's default values, so nothing an admin edited is overwritten. It:

- adds `section_items.subtitle / icon / is_enabled`, the `public_listing_cards` view (phone + a
  200-character excerpt per listing) and the `newsletter_subscribers` table with RLS;
- loads the SmartBizDir category tree (18 parents, 147 subcategories — the reference site's, with its
  duplicate Catering / Rent a Car / Electrician / Plumber entries merged), adopting the matching 0017
  starter categories and removing the eight starter categories the tree replaces (only if unused and
  unrenamed), and adds the 34 cities the reference lists that were missing (61 in total);
- makes `search_listings` match a parent category's subcategories, so searching "Health & Medical" finds
  listings filed under "Doctors";
- seeds the 14 homepage sections and their items, the header / mobile / footer menus, and the header,
  footer, social and contact settings; renames the untouched "RankYouSite" defaults to SmartBizDir.

The old reference URLs (`/listing-category/*`, `/listing-location/*`, `/submission`, `/about-us`,
`/contact-us`, `/listing-top-filter`) redirect permanently to this app's routes (`next.config.ts`).

## 2. How the page is built

`src/lib/home.ts` reads every enabled `page_sections` row of the `home` page (with its items and images,
in one request) and turns each into a typed view model (`src/lib/home-types.ts`);
`src/components/home/render-section.tsx` renders it by `section_type`. So editors can reorder, disable,
duplicate or add sections, and a new section of an existing type needs no code. The registry in
`src/lib/sections.ts` defines, per type, which fields the editor shows and which settings the page reads.

| # | Section (key) | Type | What it shows |
|---|---|---|---|
| 1 | `hero` | Hero with search | Photo, H1, What/Where search, six category tiles |
| 2 | `featured` | Business carousel | Highest-rated (or newest, or pinned) approved listings |
| 3 | `intro` | Image and text | "Find Trusted Local Businesses Across Pakistan" |
| 4 | `why_choose` | Icon cards | Three reasons, Title Case like the reference |
| 5 | `cities` | City mosaic | Lahore / Karachi / Multan / Islamabad photo cards |
| 6 | `categories` | Service cards carousel | Six popular services linked to their categories |
| 7 | `how_it_works` | Icon cards (grey band) | Search & Discover → Read Reviews & Compare → Connect & Visit |
| 8 | `grow` | Call to action (cards) | Profile explainer + checklist + "Add Your Business — It's Free" |
| 9 | `testimonials` | Testimonials carousel | Hidden until quotes are added (see §4) |
| 10 | `guidance` | Image and text (image right) | "Helping Customers Make Better Local Choices" |
| 11 | `listing_cta` | Call to action (banner, navy/photo) | "Get Your Business in Front of Thousands" |
| 12 | `faq` | FAQ accordion | 11 questions, first open, one at a time, FAQPage JSON-LD |
| 13 | `guides` | Blog carousel | Latest three published posts (or pinned posts) |
| 14 | `cta` | Call to action (banner, brand blue) | "Submit Your Listing Today!" |

Copy may contain `{brand}`, replaced with the `brand.name` setting, so a rebrand is one edit.

## 3. Images to upload (Admin → Media, then pick them in the section editor)

The reference site's photos could not be fetched from this environment (its host is blocked by the
session's network policy), so no photo ships with the code. Until one is chosen each slot falls back to a
plain design: navy hero, text-only intro, navy city cards with a pin icon, navy banner.

| Where | Pick it in | Suggested size |
|---|---|---|
| Hero background (market street) | Pages & sections → `hero` → Background photo | 1920 × 900 |
| Intro photo (bazaar) | `intro` → Photo | 1200 × 1200 |
| Lahore, Karachi, Multan, Islamabad | `cities` → each city item → Photo | 1400 × 700 (wide), 800 × 700 (narrow) |
| Guidance photo | `guidance` → Photo | 1200 × 1100 |
| "Get Your Business in Front of Thousands" background | `listing_cta` → Background photo | 1920 × 800 |
| Logo on dark backgrounds (homepage header, footer) | Settings → `brand.logo_dark_media_id` | ~360 × 88, transparent PNG/WebP |
| Logo on white backgrounds (inner pages) | Settings → `brand.logo_light_media_id` | ~360 × 88 |
| Testimonial photos | `testimonials` → each item → Photo | 300 × 300 |
| Blog covers | Admin → Blog → each post | 1200 × 800 |

Uploads are stored under unique names with a one-year cache header and optimised by Next.js with a
31-day cache, so each image is fetched from Supabase Storage rarely, not per visit.

## 4. Content that needs the owner's input

- **Testimonials.** The five people shown on the live site (Mudassir, Asad Saleem, Aqsa Asghar, Zunaira,
  Mateen Awan) are seeded with their names and roles only. Their quotes and photos are not copied, and a
  testimonial is never displayed without its quote, so the section stays hidden until the real quotes are
  pasted in.
- **Copy written for this rebuild** (the reference's text was not available): FAQ answers, the guidance
  paragraphs, the CTA sublines, descriptions for the last three service cards, and the section subtexts
  for Guidance, FAQ and Guides. All of it describes how this site actually works and is editable.
- **Pages the reference footer links to but this app does not have yet:** Privacy Policy and Terms and
  Conditions. Add them to the "Useful Links" menu once they exist.
- **Contact details** (`contact.phone`, `contact.address`) are empty until set; `contact.email` still holds
  the earlier value.

## 5. Egress and caching

- The homepage is ISR (`○` in the build output) and is revalidated on demand by every admin write; the
  one-hour timer is only a backstop. A regeneration costs a fixed set of reads whatever editors add:
  sections + items + images (1), settings, menus, categories, cities (shared with the layout), and for
  the business carousel one `search_listings` call plus three small reads (covers/phone+excerpt/logos/hours)
  — all but the RPC are tag-cached GETs. Measured payload with sample data: ≈45 KB per regeneration.
- Tag-cached reads now live for an hour (`READ_REVALIDATE_SECONDS`), up from ten minutes; every write made
  through the app expires the affected tags immediately, so the longer lifetime only affects edits made
  directly in the database.
- Nothing on the page talks to Supabase from the browser. The search bar navigates to `/search`; the
  newsletter form and the favourite button are Server Actions (one small write per submit/click).
- The search dropdowns receive categories and cities as props (≈8 KB of HTML), so typing never hits the
  database.
