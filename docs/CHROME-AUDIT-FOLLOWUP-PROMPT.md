# Claude in Chrome — audit follow-up (master prompt)

The Claude Code session that fixed the site audit cannot reach Supabase, Search Console,
PageSpeed Insights or the live site (its container's network policy blocks them). Claude in
Chrome runs in your own browser, signed in as you, so it can do the four remaining steps.

## Before you start

1. **The code must be live for phase 4.** The fixes are on branch
   `claude/loving-fermi-ybsc9y`. Merge it into `main` (or ask the Code session for a pull
   request) and wait for the Vercel production deploy to finish. Phases 1–3 can run before that.
2. Be signed in, in the same Chrome profile, to: Supabase, GitHub, the site's admin
   (`/admin`), Google Search Console, and your audit tool.
3. Fill in the four values in the `MY VALUES` block below. Leave a social line empty if that
   profile does not exist. **Never let Claude guess a social URL.**
4. Open a fresh Claude in Chrome conversation, paste everything inside the code block, and
   send it. It stops and asks you before anything that changes data.
5. When it finishes, copy its final report into a file and upload it to the Code session.

---

```
You are helping me finish an SEO audit clean-up on my website. A developer session already
changed the code; your job is the four steps that need my browser: a database migration,
admin settings, Google Search Console, and re-measuring. Work through the phases IN ORDER.

MY VALUES (use exactly these; never invent or guess any URL):
- SITE = https://www.rankyousite.com
- SUPABASE_PROJECT = cwnqvngpjxvodbvdhpzf
- GITHUB_REPO = naveedrehman1611-alt/101toplistings
- BRANCH = claude/loving-fermi-ybsc9y
- AUDIT_TOOL = <name and URL of the audit tool that produced the issue list>
- SOCIAL_FACEBOOK = <https://... or leave empty>
- SOCIAL_INSTAGRAM = <https://... or leave empty>
- SOCIAL_X = <https://x.com/... or leave empty>
- SOCIAL_LINKEDIN = <https://... or leave empty>
- SOCIAL_YOUTUBE = <https://... or leave empty>

RULES
- STOP AND ASK ME before anything that writes data: running the migration, saving a setting,
  submitting a sitemap, requesting indexing. Read-only checks need no confirmation.
- If a page asks you to sign in, stop and tell me. Never type passwords.
- Never invent a URL, a number or a result. If you cannot see something, write "not visible".
- Quote numbers exactly as the page shows them.
- If a step fails, record the exact error text, skip the step, and carry on.

PHASE 1 — Database migration (Supabase)
1. Open https://supabase.com/dashboard/project/SUPABASE_PROJECT/sql/new
2. BEFORE: run this read-only query and record every number:
   select
     (select count(*) from menu_items where not is_external
        and (url ~* '^/(listings|categories|services|submission|about-us|contact-us|listing-category/|listing-location/|listing-top-filter|dashboard)'
             or url ~ '.+/$')) as stale_menu_links,
     (select count(*) from page_sections
        where cta_url ~* '^/(listings|categories|services|submission|dashboard)') as stale_section_ctas,
     (select count(*) from listings where slug ~ '[A-Z]') as upper_listing_slugs,
     (select count(*) from categories where slug ~ '[A-Z]') as upper_category_slugs,
     (select count(*) from cities where slug ~ '[A-Z]') as upper_city_slugs,
     (select count(*) from blog_posts where slug ~ '[A-Z]') as upper_blog_slugs,
     (select count(*) from redirects) as redirect_rows;
3. In a NEW TAB open
   https://github.com/GITHUB_REPO/blob/BRANCH/supabase/migrations/0028_final_link_urls_and_lowercase_slugs.sql
   and click "Raw". Check that the file starts with "-- 0028" and ends with "commit;".
4. ASK ME to copy the whole raw file (Ctrl+A, Ctrl+C) and paste it into a new SQL Editor
   query (Ctrl+V). Do not retype it yourself: it is long and a single typo breaks it.
5. Once I confirm the paste, check that the editor's first line is "-- 0028" and its last is
   "commit;". Then ASK ME for the go-ahead and click Run. Record the result message exactly.
   If it errors, stop Phase 1, record the full error, and do not retry.
6. AFTER: run the query from step 2 again and record every number. Expected: the four
   upper_*_slugs counts and the two stale_* counts are 0, or as low as the migration allows (it
   skips a slug whose lowercase form is already taken), and redirect_rows has grown by the
   number of slugs renamed.

PHASE 2 — Social profile links (site admin)
1. If every SOCIAL_ value is empty, skip to Phase 3 and say so in the report.
2. Open SITE/admin/settings and find the "Social links" group (keys social.facebook,
   social.instagram, social.x, social.linkedin, social.youtube).
3. For each non-empty SOCIAL_ value: open the URL in a new tab first, check it is a live
   profile for this business (name or logo matches), then close the tab. If it does not load or
   looks like a different business, do not save it; report it.
4. ASK ME to confirm the list, then enter each verified URL in its field exactly as given
   (full https:// address) and save. Record any validation message.
5. Open SITE/ in a new tab, scroll to the footer, and list the social icons you see and the
   URL each one links to.

PHASE 3 — Google Search Console ("Page has 0 impressions", 75 pages)
1. Open https://search.google.com/search-console and select the property for SITE (prefer the
   Domain property if there is one). If there is no property for SITE, stop the phase and say so.
2. Sitemaps: record each submitted sitemap with its status, last read date and discovered URL
   count. If SITE/sitemap.xml is not listed, ASK ME, then submit "sitemap.xml".
3. Pages (Indexing → Pages): record the "Indexed" and "Not indexed" totals, and every reason
   under "Why pages aren't indexed" with its count. For the 3 largest reasons, write down 5
   example URLs each.
4. Performance → Search results, last 3 months: record total clicks, impressions, and the top
   10 pages by impressions.
5. URL Inspection: inspect these, recording for each "URL is on Google" yes/no, the coverage
   status, the user-declared canonical and the Google-selected canonical:
   SITE/ , SITE/business-directory , SITE/seo-services , SITE/free-tools ,
   SITE/business-categories , SITE/locations
6. For any of those six that are NOT on Google and show no error, ASK ME, then click
   "Request indexing" (Google allows only a few per day; stop when it refuses).
   Do not request indexing for any other URL.

PHASE 4 — Re-measure (only after the branch is live in production)
1. Check it is live: open SITE/ and view the page source (Ctrl+U). Report yes/no for each:
   a) <title> appears before </head>;
   b) a <meta property="og:url"> tag and a <meta name="twitter:image"> tag appear before </head>;
   c) the header "Add Listing" button links to /add-business (not /dashboard/listings/new).
   If (c) is "no", the new code is not deployed: stop Phase 4 and say so.
2. Response headers: open DevTools → Network, reload SITE/, click the document request and
   record the values of content-security-policy, x-frame-options, x-content-type-options and
   referrer-policy (or "missing").
3. PageSpeed: open https://pagespeed.web.dev/ , analyse SITE/ , and on the MOBILE tab record
   the Performance score, LCP, INP or TBT, CLS, FCP and Speed Index, plus the top 5
   "Diagnose performance issues" items with their estimated savings. Run it twice and report
   both runs (scores vary between runs). Then record the Desktop score.
4. Audit tool: open AUDIT_TOOL and start a new crawl of SITE. If the crawl takes a long time,
   do not wait more than 15 minutes: record that it is running and finish the report without
   it. When it finishes, record the current count for each of these issues (write "gone" if
   it is no longer listed):
   Title is missing · Canonical outside of head · Meta robots found outside of <head> ·
   Canonical points to a noindex URL · Canonical is missing · Open Graph tags incomplete ·
   Twitter card incomplete · Page has internal links to 3xx pages · URL contains upper case
   characters · Avoid excessive DOM width · Page has identical headings · Missing alt text ·
   Page has an anchored image with no alt text · Add dimensions to images · Defer offscreen
   images · XSS defence not implemented · Click-jacking defence not implemented · MIME
   sniffing defence not implemented · Home page has no links to social media pages ·
   Page has 0 impressions · Home page Mobile PageSpeed score.
   Also list any NEW issue that was not in that list, with its count and 3 example URLs.
   For any issue still present, give 3 example URLs from the tool's detail view.

FINAL REPORT — output exactly this, in markdown, nothing else:

# Audit follow-up report
## Phase 1 — Migration
| Check | Before | After |
(one row per number from the query)
Result message: ...
## Phase 2 — Social links
| Network | URL entered | Verified live? | Saved? | Shown in footer? |
## Phase 3 — Search Console
Sitemaps: ...
Indexed / Not indexed: ...
| Not-indexed reason | Count | Example URLs |
Performance (3 months): clicks ..., impressions ...
| URL | On Google? | Coverage | Declared canonical | Google canonical | Indexing requested? |
## Phase 4 — Re-measure
Live checks: a) ... b) ... c) ...
| Header | Value |
| PageSpeed run | Device | Score | LCP | TBT/INP | CLS | FCP | SI |
Top PageSpeed opportunities: ...
| Audit issue | Count now | Example URLs if still present |
New issues: ...
## Problems and things I skipped
(every error message, verbatim, and every step you skipped and why)
```

---

## After the run

Upload the report to the Claude Code session. Anything still listed in the audit, with its
example URLs, is enough for the next round of fixes.
