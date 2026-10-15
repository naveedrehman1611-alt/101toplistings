# Claude in Chrome — social profiles + Organization `sameAs` (master prompt)

## Why this is browser work, not code work

The site already outputs the schema this needs. `src/app/layout.tsx` renders one site-wide
JSON-LD `@graph` on every page: an `Organization` node (name, url, description, 512 px logo,
contact point) and a `WebSite` node with a SearchAction. Its `sameAs` array, and the footer's
social icons, are built from **Admin → Settings → Social links** (`social.facebook`,
`social.instagram`, `social.x`, `social.linkedin`, `social.youtube`). An empty setting is
left out, so `sameAs` stays empty until those settings are filled in.

**Do not paste a second hand-written `Organization` script into the site.** Two Organization
entities with different logos (`logo.png` vs `logo-512.png`) and no shared `@id` give Google
conflicting signals. Filling in the settings is the whole fix.

The Claude Code session cannot reach the live site, Facebook, Instagram or the Supabase project
because its container's network blocks them. Claude in Chrome runs in your own signed-in browser,
so it can do every step below.

## How to use

1. In one Chrome profile, sign in to the site admin (`/admin`), Facebook (as the page admin) and
   Instagram (as the account owner).
2. Check the `MY VALUES` block. Leave a line empty if that profile does not exist yet.
   **Never let Claude guess a social URL.**
3. Open a new Claude in Chrome conversation, paste everything inside the code block, and send it.
   It stops and asks you before saving anything.
4. When it finishes, copy its final report into a file and upload it to the Code session.

---

```
You are helping me connect my brand's social profiles to my website's structured data. The
website code already outputs Organization JSON-LD whose "sameAs" list is built from the
site admin's Social links settings. Your job: verify the profiles, enter them in the admin,
and confirm Google can see them. Work through the phases IN ORDER. Open a NEW TAB for each
site you visit, and keep my existing tabs untouched.

MY VALUES (use exactly these; never invent, guess or "fix" a URL):
- SITE = https://www.rankyousite.com
- BRAND = RankYouSite
- SOCIAL_FACEBOOK = https://www.facebook.com/rankyousite/
- SOCIAL_INSTAGRAM = https://www.instagram.com/rankyousite
- SOCIAL_X = <https://x.com/... or leave empty>
- SOCIAL_LINKEDIN = <https://www.linkedin.com/company/... or leave empty>
- SOCIAL_YOUTUBE = <https://www.youtube.com/@... or leave empty>

GROUND RULES
- Before you click Save, Submit or Publish anywhere, show me exactly what will change and wait
  for my "yes".
- Never delete or change a setting that is not one of the social.* fields named below.
- If a page asks for a login, 2FA or a captcha, stop and ask me to do it.
- If something does not match what this prompt expects, stop and tell me; do not improvise.

PHASE 1 — Verify each profile is real and ours
For each non-empty SOCIAL_ value:
1. Open it in a new tab.
2. Record: does it load (not "page isn't available" / "sorry, this page isn't available")?
   Exact display name and handle? Profile picture is the BRAND logo? Is there a website link
   in the bio/About, and what is it?
3. If a profile does not load or clearly belongs to someone else, mark it FAILED and leave it
   out of every later phase.

PHASE 2 — Link the profiles back to the site (two-way verification)
Google trusts sameAs more when the profile also points to the site.
1. Facebook: Page → About / Edit details → Website. If it is not SITE, propose setting it to
   SITE, and wait for my "yes" before saving.
2. Instagram: Edit profile → Website (or Links). Same: propose SITE, wait for "yes", save.
3. Same for X / LinkedIn / YouTube if those values are filled in.
4. Check that each profile's display name is exactly BRAND (report any difference; do not
   rename anything without my "yes").

PHASE 3 — Enter the URLs in the site admin
1. Open SITE/admin/settings in a new tab.
2. Find the "Social links" group: social.facebook, social.instagram, social.x,
   social.linkedin, social.youtube. Record the CURRENT value of each (old seed data could
   still hold a "smartbizdir" URL; if any field has a URL that is not ours, it must be
   replaced or cleared).
3. Propose the new values: each field gets its SOCIAL_ value (Phase 1 PASS only); a field
   whose SOCIAL_ value is empty or FAILED is set to empty. Show a before → after table.
4. After my "yes", save. Report the save confirmation message.

PHASE 4 — Confirm the live site outputs them
1. Open SITE/ in a new tab and do a hard reload (Ctrl+Shift+R). If the page still looks old,
   wait 2 minutes and reload again (pages are cached; saving settings should refresh them).
2. Scroll to the footer: list each social icon and the exact href it links to.
3. Open view-source:SITE/ and find <script type="application/ld+json">. Copy the
   Organization node exactly. Check:
   - "@id" is SITE/#organization, "name" is BRAND, "url" is SITE.
   - "logo".url is SITE/logo-512.png, and opening that URL shows the logo.
   - "sameAs" lists exactly the Phase 3 URLs, no more, no less.
   - There is only ONE Organization node on the page.
4. Repeat step 3 on one inner page (e.g. SITE/about) — the same Organization should be there.

PHASE 5 — Validate with Google's tools
1. Open https://search.google.com/test/rich-results, test SITE/. Report detected items and
   any errors or warnings word-for-word.
2. Open https://validator.schema.org/, test SITE/. Report errors/warnings for Organization
   and WebSite word-for-word.
3. If I am signed in to Google Search Console for SITE: run URL Inspection on SITE/ and ask me
   before clicking "Request indexing".

FINAL REPORT (plain text, in this order)
1. Per profile: URL, PASS/FAILED, display name, website link before/after.
2. Admin settings: before → after table, and whether the save succeeded.
3. Footer icons found on the live site, with hrefs.
4. The live Organization JSON-LD node, pasted exactly.
5. Rich Results Test and Schema Validator results, word-for-word.
6. Anything that did not match this prompt, and what you did instead (should be "nothing").
```
