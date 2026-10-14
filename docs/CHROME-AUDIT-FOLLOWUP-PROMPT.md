# Claude in Chrome — audit follow-up (master prompt)

The Claude Code session that fixed the site audit cannot reach Supabase, Search Console,
PageSpeed Insights, the Vercel preview or the live site (its container's network policy blocks
them). Claude in Chrome runs in your own browser, signed in as you, so it can do every
remaining step.

Status when this prompt was written:

- Migration 0028 has been run in the Supabase SQL Editor (Phase 1 only verifies it).
- The fixes are in pull request #55 (branch `claude/loving-fermi-ybsc9y`), not merged yet.
  Its Vercel preview is ready.

## How to use

1. Be signed in, in the same Chrome profile, to: GitHub, Vercel, Supabase, the site's admin
   (`/admin`), Google Search Console and your audit tool.
2. Fill in the `MY VALUES` block. Leave a social line empty if that profile does not exist.
   **Never let Claude guess a social URL.**
3. Open a fresh Claude in Chrome conversation, paste everything inside the code block and send
   it. It stops and asks you before anything that changes something (merging, saving a
   setting, submitting a sitemap, requesting indexing).
4. When it finishes, copy its final report into a file and upload it to the Code session.

---

```
You are helping me finish an SEO audit clean-up on my website. A developer session already
changed the code (GitHub pull request #55) and I already ran its database migration. Your
job is everything that needs my browser. Work through the phases IN ORDER.

MY VALUES (use exactly these; never invent or guess any URL):
- SITE = https://www.rankyousite.com
- PREVIEW = https://rankyousite-git-claude-lo-7a7948-naveedrehman1611-alts-projects.vercel.app
- PR = https://github.com/naveedrehman1611-alt/101toplistings/pull/55
- SUPABASE_PROJECT = cwnqvngpjxvodbvdhpzf
- AUDIT_TOOL = <name and URL of the audit tool that produced the issue list>
- SOCIAL_FACEBOOK = <https://... or leave empty>
- SOCIAL_INSTAGRAM = <https://... or leave empty>
- SOCIAL_X = <https://x.com/... or leave empty>
- SOCIAL_LINKEDIN = <https://... or leave empty>
- SOCIAL_YOUTUBE = <https://... or leave empty>

RULES
- STOP AND ASK ME before anything that changes something: merging the PR, saving a setting,
  submitting a sitemap, requesting indexing. Read-only checks need no confirmation.
- If a page asks you to sign in, stop and tell me. Never type passwords.
- Never invent a URL, a number or a result. If you cannot see something, write "not visible".
- Quote numbers and messages exactly as the page shows them.
- If a step fails, record the exact error text, skip the step and carry on, unless the
  phase says to stop.

PHASE 1 — Verify the migration (Supabase, read-only)
1. Open https://supabase.com/dashboard/project/SUPABASE_PROJECT/sql/new
2. Type and run this query, then record every number:
   select
     (select count(*) from listings   where slug ~ '[A-Z]') as upper_listings,
     (select count(*) from categories where slug ~ '[A-Z]') as upper_categories,
     (select count(*) from cities     where slug ~ '[A-Z]') as upper_cities,
     (select count(*) from blog_posts where slug ~ '[A-Z]') as upper_blog,
     (select count(*) from menu_items where not is_external
        and (url ~* '^/(listings|categories|services|submission|about-us|contact-us|listing-category/|listing-location/|listing-top-filter|dashboard)'
             or url ~ '.+/$')) as stale_menu_links,
     (select count(*) from page_sections
        where cta_url ~* '^/(listings|categories|services|submission|dashboard)') as stale_section_ctas,
     (select count(*) from redirects) as redirect_rows;
3. All values except redirect_rows should be 0. For any that is not 0, run the matching
   select (e.g. "select slug from cities where slug ~ '[A-Z]'") and list the rows. A slug left
   with capitals is expected only when its lowercase form is already used by another row.

PHASE 2 — Check the preview before merging (read-only)
1. Open PREVIEW. If it shows a Vercel login, sign-in wall or error, stop this phase and tell me.
2. On the home page, at normal desktop width, record yes/no for each:
   a) The header "Add Listing" button links to /add-business (hover it or inspect the link).
   b) The hero search's category dropdown shows categories grouped under parent headings, and
      the city dropdown shows cities grouped by first letter.
   c) The page looks complete: header, hero photo, sections and footer visible, nothing
      overlapping or blank.
3. Open the Services menu and the Free Tools menu in the header: each opens with a short
   fade, shows its links, and closes when you press Escape or click outside. Record yes/no.
4. Narrow the window to about 390px wide (or use DevTools device mode, iPhone size). Open the
   mobile menu (hamburger icon): it slides in, the links show, and it closes with the X button
   and with Escape. Record yes/no. Restore the normal width.
5. Open PREVIEW/business-directory and PREVIEW/locations. Each page loads and lists businesses
   or locations. Record yes/no. On /business-directory open the category and city filter
   dropdowns: options are grouped. Record yes/no.
6. Open one listing page from the directory and one city page. Each loads without an error.
   Record their URLs.
7. View the page source of PREVIEW/ (Ctrl+U). Record yes/no for each:
   - <title> appears before </head>
   - <link rel="canonical" appears before </head>
   - <meta property="og:url" and <meta name="twitter:image" appear before </head>
8. If ANY answer in steps 2–6 is "no", or a page shows an error, STOP: do not merge. Go
   straight to the final report and describe the problem exactly (page URL, what you saw).

PHASE 3 — Merge the pull request
1. Open PR. Record: the state (open/merged), whether GitHub shows "This branch has no
   conflicts with the base branch", and the status of each check.
2. If it is already merged, skip to step 4.
3. If there are no conflicts and no failing checks, ASK ME: "Phase 2 passed. Merge PR #55
   now?" Only after I say yes, click "Merge pull request", then "Confirm merge". Record the
   result. If I say no, skip Phases 4–7 except Phase 5, and go to the final report.
4. Wait for the production deploy: open the Vercel dashboard for project "rankyousite",
   Deployments tab, and wait until the newest Production deployment (from main) shows
   "Ready". Check every 30 seconds, up to 10 minutes. Record its status and time. If it shows
   "Error", open it, record the first error lines from the build log, and stop Phases 6–7.
5. Confirm it is live: open SITE/ in a new tab with a hard reload (Ctrl+Shift+R) and record
   whether the header "Add Listing" button links to /add-business. If not, wait 2 minutes,
   reload once more, and record the result.

PHASE 4 — Security headers on production (read-only)
1. On SITE/, open DevTools → Network, reload, click the first (document) request and record the
   response header values of: content-security-policy, x-frame-options,
   x-content-type-options, referrer-policy (write "missing" if absent).

PHASE 5 — Social profile links (site admin)
1. If every SOCIAL_ value is empty, skip this phase and say so in the report.
2. For each non-empty SOCIAL_ value: open it in a new tab and check it is a live profile for
   this business (name or logo matches the site). If it does not load or looks like a
   different business, do not use it; report it.
3. Open SITE/admin/settings and find the "Social links" fields (social.facebook,
   social.instagram, social.x, social.linkedin, social.youtube).
4. ASK ME to confirm the list of verified URLs, then enter each exactly as given (full
   https:// address) and save. Record any validation message.
5. Open SITE/ in a new tab with a hard reload, scroll to the footer and list each social icon
   you see with the URL it links to. (If they do not show yet, wait 1 minute and reload once.)

PHASE 6 — Google Search Console ("Page has 0 impressions", 75 pages)
1. Open https://search.google.com/search-console and select the property for SITE (prefer the
   Domain property if there is one). If there is none for SITE, stop this phase and say so.
2. Sitemaps: record each submitted sitemap with its status, last read date and discovered URL
   count. If SITE/sitemap.xml is not listed, or its status is not "Success", ASK ME, then
   submit "sitemap.xml".
3. Pages (Indexing → Pages): record the "Indexed" and "Not indexed" totals and every reason
   under "Why pages aren't indexed" with its count. For the 3 largest reasons, record 5
   example URLs each.
4. Performance → Search results, last 3 months: record total clicks and impressions, and the
   top 10 pages by impressions.
5. URL Inspection: inspect each URL below and record "URL is on Google" yes/no, the page
   indexing status, the user-declared canonical and the Google-selected canonical:
   SITE/ , SITE/business-directory , SITE/seo-services , SITE/free-tools ,
   SITE/business-categories , SITE/locations
6. For any of those six that is NOT on Google and shows no error, ASK ME, then click
   "Request indexing". Google allows only a few per day: stop when it refuses. Do not request
   indexing for any other URL.

PHASE 7 — Re-measure
1. PageSpeed: open https://pagespeed.web.dev/ , analyse SITE/ , and on the MOBILE tab record
   the Performance score, LCP, TBT (or INP), CLS, FCP and Speed Index, plus the top 5 items
   under "Diagnose performance issues" with their estimated savings. Run the analysis twice
   and report both runs (scores vary run to run). Then record the Desktop score.
2. Audit tool: open AUDIT_TOOL and start a new crawl of SITE. Do not wait more than 15
   minutes: if it is still running, say so and finish the report without it. When it
   finishes, record the current count for each issue below ("gone" if no longer listed):
   Title is missing · Canonical outside of head · Meta robots found outside of <head> ·
   Canonical points to a noindex URL · Canonical is missing · Open Graph tags incomplete ·
   Twitter card incomplete · Page has internal links to 3xx pages · URL contains upper case
   characters · Avoid excessive DOM width · Page has identical headings · Missing alt text ·
   Page has an anchored image with no alt text · Add dimensions to images · Defer offscreen
   images · Defence against cross-site scripting attacks is not implemented · Defence against
   click-jacking attacks is not implemented · Defence against MIME type sniffing is not
   implemented · Home page has no links to social media pages · Page has 0 impressions ·
   Home page Mobile PageSpeed score.
   For every issue still present, give 3 example URLs from the tool's detail view. Also list
   any NEW issue that was not on that list, with its count and 3 example URLs.

FINAL REPORT — output exactly this, in markdown, nothing else:

# Audit follow-up report
## Phase 1 — Migration check
| Check | Value |
Rows still with capitals (if any): ...
## Phase 2 — Preview
| Check | Result | Notes |
Listing page checked: ... City page checked: ...
## Phase 3 — Merge and deploy
PR state: ... Conflicts: ... Checks: ...
Merged: yes/no (time) · Production deploy: status (time) · Live check: yes/no
## Phase 4 — Security headers
| Header | Value |
## Phase 5 — Social links
| Network | URL | Verified live? | Saved? | Shown in footer? |
## Phase 6 — Search Console
Sitemaps: ...
Indexed / Not indexed: ...
| Not-indexed reason | Count | Example URLs |
Performance (3 months): clicks ..., impressions ...
Top pages by impressions: ...
| URL | On Google? | Status | Declared canonical | Google canonical | Indexing requested? |
## Phase 7 — Re-measure
| PageSpeed run | Device | Score | LCP | TBT/INP | CLS | FCP | SI |
Top PageSpeed issues: ...
| Audit issue | Count now | Example URLs if still present |
New issues: ...
## Problems and skipped steps
(every error message verbatim, and every step you skipped and why)
```

---

## After the run

Upload the report to the Claude Code session. Anything still listed in the audit, with its
example URLs, is enough for the next round of fixes.
