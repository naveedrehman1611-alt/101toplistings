# Claude in Chrome — Week 1 SEO plan (master prompt, Vercel ke baghair)

Ye prompt **RankYouSite_3-Month_SEO_Plan.xlsx** ke Week 1 ke woh saare kaam karwata hai jinhein
Vercel nahi chahiye: Search Console, Bing, GA4, site admin, Google ke testing tools, Facebook,
Instagram, AI Visibility baseline aur KPI baseline.

Vercel wala kaam (`/seo-services/plumber-seo` aur `/seo-services/hvac-seo` ka live redirect) is
prompt main **nahi** hai. `/admin/redirects` se bhi ye theek nahi hoga: admin redirects sirf us URL
par chalte hain jo warna 404 deta, aur ye dono pages live site par abhi khul rahe hain. Ye tabhi
theek hoga jab `www.rankyousite.com` wale Vercel project par latest code deploy hoga.

## Kaise use karein

1. Ek hi Chrome profile main in sab main pehle se login kar lein:
   Google (Search Console + GA4 wala account), Bing Webmaster Tools, site admin
   (`https://www.rankyousite.com/admin`), Facebook (page admin), Instagram, ChatGPT, Perplexity,
   Gemini, Moz.
2. Neeche `MY VALUES` block main `<...>` wali jagah bhar dein. Jo cheez nahi pata, khaali chhod dein.
   **Claude ko koi URL ya address guess mat karne dein.**
3. Naya Claude in Chrome chat kholein, code block ke andar ka sara text paste kar ke bhej dein.
   Ye har save / submit / delete se pehle aap se poochhega.
4. Login, 2FA, OTP ya CAPTCHA aaye to wo ruk kar aap ko bolega. Wo khud aap karein.
5. Aakhir main jo report de, wo copy kar ke Claude Code session main paste kar dein, taake Excel
   main kaam "Done" mark ho aur KPI baseline bhar diya jaye.

Andaza: 2–3 ghante. Agar beech main ruk jaye to "continue from PHASE X" likh dein.

---

```
You are helping me finish Week 1 of my website's 3-month SEO plan. Everything here is done in my
own signed-in browser. Work through the phases IN ORDER. Open a NEW TAB for each site and leave my
existing tabs alone.

MY VALUES (use exactly these; never invent, guess or "fix" any URL, address or number):
- SITE = https://www.rankyousite.com
- BRAND = RankYouSite
- SITEMAP = https://www.rankyousite.com/sitemap.xml
- EMAIL = hello@rankyousite.com
- WHATSAPP = <+92... number exactly as on the site footer>
- LOCATION (NAP) = <e.g. "Lahore, Pakistan — serving clients worldwide">
- BRAND_ONE_LINER = RankYouSite is a free worldwide business directory and SEO/AEO agency based in <city>.
- SOCIAL_FACEBOOK = https://www.facebook.com/rankyousite/
- SOCIAL_INSTAGRAM = https://www.instagram.com/rankyousite
- SOCIAL_LINKEDIN = <https://www.linkedin.com/company/... or leave empty>
- SOCIAL_X = <https://x.com/... or leave empty>
- SOCIAL_YOUTUBE = <https://www.youtube.com/@... or leave empty>

GROUND RULES
1. Before you click Save, Submit, Publish, Delete, Request indexing or Mark as key event anywhere,
   show me exactly what will change (before -> after) and wait for my "yes".
2. Do NOT open or change anything in Vercel, Hostinger DNS, Supabase or GitHub.
3. If a page asks for a login, password, 2FA, OTP or CAPTCHA, stop and ask me to do it.
4. Never write a fake review, fake listing, or anything that claims something untrue.
5. If a screen does not match what this prompt expects, stop and tell me. Do not improvise.
6. If one phase is blocked, write down why, and move on to the next phase.
7. Keep a running notes list of every number you read; you will need them for the final report.

PHASE 1 — Google Search Console (property for SITE; prefer the Domain property)
1. Sitemaps: is SITEMAP listed? Record its status, "Last read" date and "Discovered pages".
   Propose re-submitting SITEMAP; after my "yes", submit it.
2. Pages (Indexing -> Pages): record "Indexed" and "Not indexed" totals, and every reason row
   under "Why pages aren't indexed" with its count.
3. Performance -> Search results, last 28 days: record total clicks, total impressions, average
   CTR, average position. Then on the Queries tab record: how many queries have average position
   <= 10, the total number of queries, and the top 10 queries with clicks/impressions/position.
   Also note whether any query contains "rankyousite" or "rank you site".
4. URL Inspection, one at a time, for:
   - SITE/seo-services/off-page-seo
   - SITE/seo-services/fintech-seo
   - SITE/seo-services/roofer-seo
   - SITE/seo-services/seo-for-doctors
   For each: is it indexed, what "Page fetch" / "User-declared canonical" / "Google-selected
   canonical" say. Then click "Test live URL" and record whether Google sees a redirect and to
   which URL. Do NOT click "Request indexing" for these (they are redirects).
5. URL Inspection on SITE/ : record status. Ask me before clicking "Request indexing".
6. Links report: record "Top linking sites" count (external referring domains).

PHASE 2 — Bing Webmaster Tools (https://www.bing.com/webmasters)
1. If SITE is not added yet: use "Import from Google Search Console". Show me what will be
   imported, wait for "yes".
2. Sitemaps: submit SITEMAP if not already there (ask first). Record status.
3. Look for the IndexNow section and record whether it shows any URLs received from SITE.
4. Record any "Site Scan" / SEO errors Bing already shows (titles only).

PHASE 3 — Google Analytics 4 (property that tracks SITE)
1. Admin -> Data display -> Events. List all events seen in the last 28 days with counts.
   Look for these four: generate_lead, sign_up, listing_submitted, contact_click.
   For each one that appears and is not yet a key event: propose marking it as a key event,
   wait for "yes", then mark it. If an event is missing from the list, write "not seen yet"
   (it only appears after someone triggers it) — do NOT create it manually.
2. Admin -> Data display -> Channel groups. If there is no custom group with an "AI Traffic"
   channel: propose creating a new channel group (copy of the default group) named
   "Channels incl. AI", with a new channel "AI Traffic" where
   Source matches regex:  chatgpt\.com|perplexity\.ai|gemini\.google\.com|copilot\.microsoft\.com|claude\.ai
   and move "AI Traffic" ABOVE "Referral" in the order. Show me the setup, wait for "yes", save.
3. Reports -> Tech -> (add dimension "Hostname", or Explore with Hostname) for the last 28 days:
   list every hostname with its sessions. Flag anything that is not www.rankyousite.com
   (for example *.vercel.app).
4. Reports -> Acquisition -> Traffic acquisition, last 28 days: record total sessions and the
   sessions for each session source that is chatgpt.com, perplexity.ai, gemini.google.com,
   copilot.microsoft.com or claude.ai (0 if none).

PHASE 4 — Site admin (SITE/admin)
1. Listings (SITE/admin/listings): search "Stone Planet". Open it and record its city, address
   and website. Open the business's own website in a new tab and read where it is actually
   located. Propose the correct city/address (based only on what its website says), wait for
   "yes", save. Do NOT approve or invent anything else.
2. Search "marham". Open the listing and record: category, opening hours, description.
   Propose: category "Doctors" or "Health & Medical" (whichever exists in the category list),
   hours for all 7 days ONLY if marham.pk shows them (otherwise tell me), and fix
   "Pakistans" -> "Pakistan's" plus any obvious grammar in the description. Show before -> after,
   wait for "yes", save.
3. Reviews (SITE/admin/reviews): find every review on the marham.pk listing (and any other
   listing) written by the admin account (naveedrehman1611) or that is clearly a test.
   List them. After my "yes", delete only those.
4. Settings (SITE/admin/settings) -> Social links group (social.facebook, social.instagram,
   social.x, social.linkedin, social.youtube). Record current values. Before proposing, open each
   non-empty SOCIAL_ URL in a new tab and confirm it loads and is BRAND's profile. Propose: each
   field = its SOCIAL_ value if it loaded, else empty. Show a before -> after table, wait for
   "yes", save. Do not touch any other setting.
5. While in Settings, record the current site address / location / phone values (do not change
   them) so I can compare with LOCATION.

PHASE 5 — Testing tools (report only, nothing to save)
1. https://search.google.com/test/rich-results : test SITE/, SITE/seo-services/local-seo,
   one listing page (open SITE/ and pick the first listing link), and SITE/blog.
   For each: detected item types, and every error/warning word-for-word.
2. https://validator.schema.org/ : test SITE/. Record errors/warnings for Organization and
   WebSite. Copy the Organization node's "sameAs" list exactly.
3. https://pagespeed.web.dev/ : test SITE/ on Mobile. Record Performance, Accessibility,
   Best Practices, SEO scores, plus LCP, CLS, INP (or TBT) and the top 3 opportunities.
4. https://developers.facebook.com/tools/debug/ : debug SITE/. Click "Scrape Again" once.
   Record og:title, og:description, og:image URL and any warnings. Also open
   SITE/opengraph-image in a tab and tell me if an image shows and its size.

PHASE 6 — Facebook Page (SOCIAL_FACEBOOK, as page admin)
Record the CURRENT value of each item first, then propose changes as one before -> after table,
wait for "yes", and only then edit:
1. Category: "Marketing Agency" + "Business Service".
2. Intro/bio: BRAND_ONE_LINER (max length allowed).
3. Contact info: website SITE, email EMAIL, WhatsApp WHATSAPP, location/service area LOCATION.
   Name / address / phone must match the website exactly.
4. Action button: "Send WhatsApp message" (to WHATSAPP), or if not available "Book now" ->
   SITE/seo-audit?utm_source=facebook&utm_medium=cta
5. Services section: Local SEO, AEO, GEO, Technical SEO, Google Business Profile Optimization,
   Free Business Listing — each with a one-line description and a link to the matching SITE page
   (open SITE/seo-services to find the real URLs; never guess them).
6. Reviews / Recommendations: record whether they are ON. Propose turning them on.
7. Meta Business Suite (https://business.facebook.com): record whether the Instagram account
   SOCIAL_INSTAGRAM is linked to this Page. If not, start the linking flow and stop for me at
   any login step.

PHASE 7 — Instagram (instagram.com, web)
Record current values first, then one before -> after table, wait for "yes":
1. Name field: "RankYouSite | SEO & Business Directory" (username stays rankyousite).
2. Bio (3 lines):
   Free business listings worldwide 🌍
   SEO, AEO & Local SEO for small businesses
   Free SEO audit 👇
3. Website / link: SITE/seo-audit?utm_source=instagram&utm_medium=bio
4. Record: is it a Professional (Business/Creator) account? Which category? Is the email
   contact button set? (If these can only be changed in the mobile app, just tell me.)

PHASE 8 — AI Visibility baseline (20 prompts)
Engines: ChatGPT (use a Temporary chat so memory does not bias it, with web search on),
Perplexity, Gemini, and Google AI Mode (google.com -> "AI Mode"). Paste each prompt exactly.
A prompt is "Yes" if ANY engine mentions RankYouSite or links to rankyousite.com.
For every prompt record: Yes/No per engine, and the top 3 sites/brands each engine cited.
 1. What is RankYouSite?
 2. Best free business listing sites in Pakistan
 3. Free business directory to list my business worldwide
 4. Where can I list my business online for free?
 5. Best SEO company in Lahore
 6. Affordable SEO services for small business
 7. Who offers AEO (answer engine optimization) services?
 8. GEO / generative engine optimization agency
 9. White label SEO agency in Pakistan
10. Free SEO audit for my website
11. Free local business schema generator
12. llms.txt generator
13. How do I get my business mentioned in ChatGPT?
14. Difference between AEO, GEO and SEO
15. Free business listing sites UK
16. Software houses in Lahore
17. Digital marketing agencies in Lahore
18. How much does SEO cost in Pakistan?
19. Google Business Profile optimization service
20. Best local SEO agency for small businesses
AI Visibility Score = (number of Yes prompts / 20) x 100.
For prompt 1, also copy what each engine says RankYouSite is, word-for-word.

PHASE 9 — Authority + counts
1. https://moz.com/domain-analysis : rankyousite.com -> Domain Authority, linking root domains,
   ranking keywords.
2. Moz Link Explorer (if available on my account): Page Authority of SITE/.
3. https://ahrefs.com/website-authority-checker : rankyousite.com -> Domain Rating, backlinks,
   linking websites.
4. SITE/admin/listings: count of approved / live listings.
5. SITE/admin/blog: count of published posts.
6. Facebook Page followers and Instagram followers (current numbers).

FINAL REPORT (plain text, Roman Urdu is fine, in this order)
A. One table "Kaam -> Done / Not done / Blocked (why)" for every phase step above.
B. KPI BASELINE (Oct 2026), one line each:
   Moz DA | Homepage PA | Ahrefs DR | Referring domains (Ahrefs/Moz/GSC) | Indexed pages |
   GSC impressions 28d | GSC clicks 28d | Keywords in top 10 | Keywords total (GSC queries) |
   Real approved listings | Blog articles published | Leads 28d (generate_lead + contact_click
   counts) | AI referral sessions 28d | AI Visibility Score | Instagram followers |
   Facebook followers | Mobile PageSpeed score
C. GSC: Pages reasons table, top 10 queries, the 4 URL Inspection results.
D. GA4: events list with counts, which ones are now key events, hostname list, AI sources.
E. Admin: every before -> after you saved (Stone Planet, marham.pk, reviews deleted, social links).
F. Testing tools results word-for-word (Rich Results, Schema validator incl. sameAs, PageSpeed,
   Facebook debugger, opengraph-image).
G. Facebook + Instagram: before -> after tables, and anything that needs the mobile app.
H. AI Visibility: 20-row table (prompt | ChatGPT | Perplexity | Gemini | AI Mode | cited sites),
   the score, and the prompt-1 answers.
I. Anything that did not match this prompt, and what you did instead.
```
