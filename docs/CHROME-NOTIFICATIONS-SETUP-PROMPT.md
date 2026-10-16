# Claude in Chrome: listing notifications setup (master prompt)

This prompt finishes the setup of the listing notifications that the code on branch
`claude/tender-turing-u8qyig` adds. Everything here happens in your own browser,
signed in as you, so Claude in Chrome can do it:

- Slack: create an Incoming Webhook so new-listing alerts post to a channel.
- Resend: verify the domain `rankyousite.com` so emails go out from
  `noreply@rankyousite.com`, and create an API key.
- Supabase: check that migration 0029 ran (you already ran it in the SQL Editor).
- Vercel: add the four environment variables, then merge and deploy.
- An end-to-end test of the whole flow.

**Order matters.** The migration is already run (Phase 1 only checks it). Add the
environment variables before the deploy, because Vercel only picks them up in a new
deployment.

## How to use

1. Sign in, in the same Chrome profile, to GitHub, Vercel, Supabase, Slack and Resend
   (create a free Resend account at https://resend.com/signup with
   naveedrehman1611@gmail.com if you do not have one). Also sign in to the account that
   manages the DNS for rankyousite.com (Vercel, Cloudflare or Hostinger: Phase 3 finds
   out which).
2. Fill in the two `<...>` values in the `MY VALUES` block.
3. Open a new Claude in Chrome conversation, paste everything inside the code block
   below and send it. It stops and asks you before every step that changes something.
4. When it finishes, copy its final report and upload it to the Claude Code session.

---

```
You are helping me set up email and Slack notifications for new business listings on my
website. The code is already written (GitHub branch claude/tender-turing-u8qyig). Your
job is everything that needs my browser. Work through the phases IN ORDER.

MY VALUES (use exactly these; never invent or guess any value):
- SITE = https://www.rankyousite.com
- DOMAIN = rankyousite.com
- REPO = https://github.com/naveedrehman1611-alt/101toplistings
- BRANCH = claude/tender-turing-u8qyig
- SUPABASE_PROJECT = cwnqvngpjxvodbvdhpzf
- VERCEL_PROJECT = rankyousite
- ADMIN_EMAIL = naveedrehman1611@gmail.com
- SLACK_WORKSPACE = <the Slack workspace name to use>
- SLACK_CHANNEL = <channel for alerts, e.g. #new-listings>

RULES
- STOP AND ASK ME before anything that changes something: creating an app, channel,
  domain, DNS record or API key, saving an environment variable, opening or merging a
  pull request, redeploying. Never run SQL that changes the database. Read-only
  checks need no confirmation.
- If a page asks you to sign in, stop and tell me. Never type passwords.
- SECRETS: the Slack webhook URL and the Resend API key are secrets. Copy them only
  into the Vercel field they belong in. Never paste them into this chat, a report, a
  GitHub page or anywhere else. In the report, show only their last 4 characters.
- A Resend API key is shown only once. Do not close that dialog until it is saved in
  Vercel (Phase 4). If it was lost, delete that key and create a new one.
- Never invent a value. If you cannot see something, write "not visible".
- Quote error messages exactly. If a step fails, record the exact error text, skip the
  step and carry on, unless the phase says to stop.

PHASE 1 — Supabase: verify migration 0029 (read-only; I already ran it)
1. Open https://supabase.com/dashboard/project/SUPABASE_PROJECT/sql/new
2. Type and run this read-only query, then record the three numbers:
   select
     (select count(*) from pg_proc where proname = 'listing_owner_contacts') as owner_fn,
     (select count(*) from pg_publication_tables
       where pubname = 'supabase_realtime' and tablename = 'listings') as realtime,
     (select count(*) from pg_policies
       where tablename = 'listings' and policyname = 'listings_owner_update') as owner_policy;
3. All three should be 1. If owner_fn or owner_policy is 0, STOP the whole task and tell
   me: the migration did not run. If only realtime is 0, run
   "select pubname from pg_publication;", record the result and carry on (live status
   updates will not work until it is fixed, everything else will).

PHASE 2 — Slack: create the incoming webhook
1. In Slack (SLACK_WORKSPACE), check whether SLACK_CHANNEL exists. If not, ask me, then
   create it.
2. Open https://api.slack.com/apps and click "Create New App", then "From scratch".
   App name: "RankYouSite Alerts". Workspace: SLACK_WORKSPACE. Ask me, then click
   "Create App".
3. In the left menu open "Incoming Webhooks" and switch "Activate Incoming Webhooks" On.
4. Click "Add New Webhook" (or "Add New Webhook to Workspace"), choose SLACK_CHANNEL
   and click "Allow". If Slack says an admin must approve the app, stop this phase and
   tell me the exact message.
5. Back on the Incoming Webhooks page, a URL starting https://hooks.slack.com/services/
   now appears next to SLACK_CHANNEL. Keep this tab open; you copy it in Phase 4.
   Record only its last 4 characters.

PHASE 3 — Resend: verify DOMAIN and create the API key
1. Find out who runs DNS for DOMAIN: open
   https://dns.google/resolve?name=rankyousite.com&type=NS and read the "data" values.
   - ns1.vercel-dns.com / ns2.vercel-dns.com  -> DNS is in Vercel
     (https://vercel.com/dashboard/domains, then rankyousite.com)
   - *.ns.cloudflare.com                      -> DNS is in Cloudflare
   - anything with hostinger or dns-parking   -> DNS is in Hostinger (hPanel -> Domains -> DNS / Nameservers)
   Record the nameservers and the provider.
2. Open https://resend.com/domains. If DOMAIN is already listed and "Verified", skip
   to step 6.
3. Ask me, then click "Add Domain", enter rankyousite.com, keep the default region, and
   add it. Resend then lists the DNS records to create (usually an MX and a TXT record
   on the "send" subdomain, and a TXT record named "resend._domainkey"). Record every
   record's Type, Name and Priority (do not copy the long DKIM value into the report).
   These records sit on the "send" and "resend._domainkey" names only, so they do not
   touch the site or any existing email on rankyousite.com.
4. In the DNS provider from step 1, first check that no existing record has the same
   Type and Name. If one does, stop and ask me. Otherwise ask me, then add each record
   exactly as Resend shows it (copy each value with Resend's copy button). In Cloudflare,
   set every one of these records to "DNS only" (grey cloud). Then, still in the DNS
   provider, check whether a TXT record named "_dmarc" exists. If it does not, ask me
   whether to add one: Type TXT, Name _dmarc, Value "v=DMARC1; p=none;". It helps
   Gmail trust the emails.
5. Back in Resend, open the domain and click "Verify DNS Records" (or "Restart"). DNS can
   take a few minutes: check again every 2 minutes, for up to 20 minutes. Record the final
   status of each record. If it is not verified after 20 minutes, say so and carry on:
   it often finishes later on its own.
6. Open https://resend.com/api-keys. Ask me, then click "Create API Key".
   Name: "rankyousite-production". Permission: "Sending access". Domain: rankyousite.com.
   Click Add. Keep the dialog with the key open and go straight to Phase 4.

PHASE 4 — Vercel: environment variables
1. Open https://vercel.com/dashboard, open the project VERCEL_PROJECT, then
   Settings -> Environment Variables.
2. Check whether any of these already exist and record what you find (names only):
   RESEND_API_KEY, EMAIL_FROM, ADMIN_NOTIFY_EMAIL, SLACK_WEBHOOK_URL.
3. Ask me, then add each of these for the Production and Preview environments
   (edit the existing one instead of adding a duplicate). Mark RESEND_API_KEY and
   SLACK_WEBHOOK_URL as "Sensitive" if Vercel offers that option:
   - RESEND_API_KEY      = the key from Phase 3 step 6 (copy it from the Resend dialog)
   - EMAIL_FROM          = RankYouSite <noreply@rankyousite.com>
   - ADMIN_NOTIFY_EMAIL  = naveedrehman1611@gmail.com
   - SLACK_WEBHOOK_URL   = the webhook URL from Phase 2 step 5
   Do NOT add a NEXT_PUBLIC_ prefix to any of them.
4. Reload the page and confirm all four names are listed for Production. Only now
   close the Resend API key dialog.
   If Phase 3 did NOT end with the domain verified, use
   EMAIL_FROM = RankYouSite <onboarding@resend.dev> for now and tell me in the report:
   until the domain is verified, Resend only delivers to the Resend account's own
   email address, so admin alerts work but listing owners get no emails.

PHASE 5 — Merge and deploy
1. Open REPO/pulls and look for an open pull request from BRANCH. If there is none, open
   REPO/compare/main...claude/tender-turing-u8qyig, ask me, then click
   "Create pull request" with the title
   "Bulk listing actions, CSV import/export, listing notifications and live status".
2. On the pull request, record whether it has conflicts and the status of every check.
   Open the Vercel preview link from the checks/comments and confirm the home page loads.
3. Ask me, then merge the pull request. Wait for the production deployment in Vercel
   (VERCEL_PROJECT -> Deployments) to show "Ready". Record its time.
   (If the pull request was already merged before the Phase 4 variables were saved,
   ask me, then use "Redeploy" on the latest production deployment instead.)

PHASE 6 — End-to-end test
Use two browser tabs. Tab A: SITE signed in as me (admin). Tab B: an incognito or
second-profile window signed in with a DIFFERENT, non-admin account whose inbox I can
see. If I do not have a second account, ask me what to do.
1. Tab B: open SITE/dashboard/listings/new and submit a test business:
   name "Test Listing - delete me", any city, any category. Ask me before submitting.
   Within one minute, check and record yes/no for each:
   a) A Slack message in SLACK_CHANNEL "New listing to review: Test Listing - delete me"
      with "Review listing" and "All pending" buttons.
   b) An email to ADMIN_EMAIL with the subject
      "New listing to review: Test Listing - delete me" (check Spam too).
   c) An email to the Tab B account: "We received Test Listing - delete me, and it is now
      under review". Record the sender address shown.
   d) Tab B's SITE/dashboard shows the listing with three steps: Submitted (done),
      Under review (current), Live, and the text "Status updates live".
2. Tab A: open SITE/admin/listings?status=pending. Keep Tab B on SITE/dashboard, visible.
   Click "Reject" on the test listing, enter the reason "Test rejection", click "Send".
   Record yes/no:
   a) Tab B updates by itself, without a reload, to "Not approved" with the reason.
   b) The Tab B account gets the email "Your listing Test Listing - delete me was not
      approved yet" containing the reason.
3. Tab B: click "Fix and resubmit", then click "Save and resubmit". Record yes/no: the
   status goes back to Under review, and a new Slack message and admin email say
   "Listing resubmitted for review".
4. Tab A: tick the checkbox next to the test listing, choose "Approve" in the bulk action
   menu, click "Apply". Record yes/no:
   a) Tab B shows all three steps done and "View live listing" without a reload.
   b) The Tab B account gets "Your listing has been approved: Test Listing - delete me is
      now live", with a "View your live listing" button and a "Follow up with us" section.
5. Tab A: on SITE/admin/listings, click "Export CSV" and confirm a CSV downloads (record
   its row count if visible). Open SITE/admin/listings/import, click
   "Download a blank template" and confirm it downloads. Do NOT import anything.
6. Clean up: ask me, then in Tab A open the test listing in admin and use
   "Delete listing permanently".

FINAL REPORT. Output exactly this, in markdown, nothing else:

# Listing notifications setup report
## Phase 1: Migration
owner_fn / realtime / owner_policy: ... / ... / ...
## Phase 2: Slack
App created: yes/no · Channel: ... · Webhook ends with: ....
## Phase 3: Resend
DNS provider: ... (nameservers ...)
| Record type | Name | Added? | Resend status |
DMARC: existing / added / skipped · Domain verified: yes/no · API key created: yes/no (ends with ....)
## Phase 4: Vercel variables
| Variable | Production | Preview | Value (secrets: last 4 only) |
## Phase 5: Merge and deploy
PR: URL · Conflicts: ... · Checks: ... · Merged: yes/no (time) · Production deploy: status (time)
## Phase 6: End-to-end test
| Step | Check | Result | Notes |
Sender address seen on emails: ...
Test listing deleted: yes/no
## Problems and skipped steps
(every error message verbatim, and every step you skipped and why)
```
