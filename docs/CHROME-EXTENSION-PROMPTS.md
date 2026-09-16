# Claude in Chrome — extraction prompts

The Claude Code session runs in a cloud container whose egress policy blocks
`101toplistings.com` (blocker B-1). Claude in Chrome runs in the user's own browser on
their own network, so it can reach the site. It is a separate Claude with no connection
to the Code session, so its output has to be relayed back by hand.

These prompts are written so that relay is one copy-paste per run.

## How to run

1. Install Claude in Chrome, open `https://101toplistings.com` in a tab.
2. Run the prompts **in order**. Prompt 1 first — later prompts depend on its route list.
3. Start each run in a **fresh conversation** so earlier output does not crowd the context.
4. Copy each full output into a `.md` file (`01-routes.md`, `02-templates.md`, …) and upload
   the files to the Claude Code session. Pasting into chat also works but files survive better.
5. Prompt 3 is run **once per template** — roughly 8–12 runs. This is the bulk of the work
   and the part that most determines whether the rebuild is faithful.

## Originality rule — applies to every prompt

Capture **structure**, not creative content. Functional labels are needed and fine: nav items,
button text, field labels, filter names, sort options, tab names. Do **not** reproduce marketing
paragraphs, business descriptions, blog article bodies, or review text — for those, record only
their purpose, approximate length, and position. The rebuild ships original copy; copied strings
would be a defect.

---

## PROMPT 1 — Route discovery

> Run with any page of the site open. Expect a long output.

```
You are helping me document the structure of the website 101toplistings.com so it can be
rebuilt as a new, independently branded product. I need STRUCTURE ONLY — never copy marketing
paragraphs, business descriptions, blog article text, or review text. Functional labels (nav
items, button text, field labels, filter names, sort options) are exactly what I need.

Do this in order:

1. Open https://101toplistings.com/robots.txt and quote it verbatim.
2. Open https://101toplistings.com/sitemap.xml. If it is an index pointing at nested sitemaps,
   open each nested sitemap too. List every URL you find, grouped by the pattern it belongs to.
3. Open the homepage. Record every link in the primary navigation, every dropdown item, the
   mobile menu (narrow the window to ~390px wide to see it), and every footer link with its
   column heading.
4. Follow the listings/directory index. Record its URL, how pagination works (query parameter
   or path segment), and the URLs of pages 1, 2, 3 and the last page.
5. Record the URL format for: a single business/listing detail page, a category page, a
   location/city page, a blog index, a single blog post, search results, login, register,
   add-listing, about, contact, and any legal pages.
6. Record what a filter or sort action does to the URL — give me 3 real example URLs with
   filters or sorting applied.

Output as a markdown table with these exact columns, one row per distinct URL you actually
visited or found:

| Route | Page Type | URL Pattern | Parent | Purpose | Key Components | SEO Importance | Status |

Then add these sections below the table:
- "URL patterns" — every dynamic pattern, e.g. /listing/[slug], with 3 real example URLs each
- "Primary navigation" — nested list, exact labels and hrefs
- "Mobile menu" — how it differs from desktop
- "Footer" — every column heading and its links
- "Pagination" — how it works, with example URLs
- "Query parameters" — every filter/sort/search parameter you observed and its allowed values
- "Inaccessible" — anything that 404'd, required login, or would not load, and why

Rules: only list URLs you actually saw. Do not invent plausible routes. If you are unsure
whether two URLs share a layout, say so rather than assuming.
```

---

## PROMPT 2 — Template identification

> Run after Prompt 1. Paste Prompt 1's output into this run first.

```
Here is a route inventory for 101toplistings.com that I collected earlier:

[PASTE PROMPT 1 OUTPUT HERE]

Group these routes into distinct PAGE TEMPLATES — a template is a layout shared by many
routes, not an individual page. For example all /listing/* pages are probably one template.

To verify, actually open at least 3 different URLs for each candidate template and confirm
they share a layout. If two URLs under the same pattern have materially different layouts,
that is two templates, not one — say so.

For each template give me:
- Template name (short, lowercase-hyphenated, e.g. listing-detail)
- Which routes/patterns map to it
- 5 real example URLs (fewer only if fewer exist — say so)
- One-paragraph description of what the page is for
- Whether the header or footer differs from other templates
- Rough section count top to bottom

Finish with a single list: "Templates requiring deep analysis", ordered by how important they
are to the site. This list drives the next stage, so be complete — missing a template means it
never gets built.
```

---

## PROMPT 3 — Per-template deep analysis

> **Run once per template** from Prompt 2's final list. Replace `<TEMPLATE>` and the URLs.
> This is the most important prompt. Do not skip templates.

```
I am documenting the "<TEMPLATE>" page template on 101toplistings.com so it can be rebuilt
with original branding and copy. STRUCTURE ONLY — do not reproduce marketing paragraphs,
business descriptions, blog bodies, or review text. Functional labels are needed.

Open and compare these URLs, all of them:
<URL 1>
<URL 2>
<URL 3>
<URL 4>
<URL 5>

View each at desktop width, then narrow the browser to ~390px and view each again.

Produce exactly this markdown structure:

# Template: <TEMPLATE>
## Routes covered
## Examples inspected (list the URLs)
## Section order — desktop
Numbered list, top to bottom. For each section: what it contains, its layout (grid/columns/
carousel/full-width), and roughly how tall it is relative to the viewport.
## Section order — mobile
Only if it differs. Note sections that reorder, collapse, become a carousel, or disappear.
## Components used
Two lists: components that also appear on other templates (reusable), and components unique
to this template. Describe each in one line by its function.
## Data fields displayed
A table: Field | Example value type | Always present? | Where it appears on the page.
Cover every distinct piece of information the page shows. Mark fields that were missing on
at least one of the 5 examples — those drive the empty states.
## Variations observed across examples
The single most important section. Compare the 5 examples and record every structural
difference: missing images, no rating, zero reviews, different opening-hours formats, absent
contact fields, short vs long descriptions, missing social links, extra badges. Say which
example showed which variation.
## Interactions
Hover, click, expand/collapse, modal, carousel, map, tabs, sticky elements, infinite scroll.
## Forms and validation
Every form: each field, its input type, whether required, placeholder text, and any validation
message you can trigger by submitting bad input.
## States
How the page looks while loading, with zero results, and on error. Trigger these if you can —
e.g. a search with nonsense text for zero-results, an invalid slug for the error state.
## SEO
Exact <title>, meta description, the H1, and the H2/H3 outline. Any JSON-LD structured data —
give me the @type values and which fields are populated. Canonical URL and OG tags.
## Breadcrumbs
Exact pattern with a real example.
## Internal links out
Which other templates this page links to, and from which section.
## Responsive notes
What changes at roughly 375px, 768px, 1024px and 1440px. Note anything that overflows,
overlaps, or becomes unusable.
## Open questions
Anything you could not determine, and why.

Be concrete. "Shows business info" is useless — I need "shows business name as H1, then a
star rating with numeric average and review count in parentheses, then category as a link".
```

---

## PROMPT 4 — Design system and global chrome

> Run once, with the homepage open.

```
I am rebuilding 101toplistings.com with a different brand identity but the same structural
proportions. Document its visual system. Use DevTools (computed styles) where you can, so the
values are measured rather than guessed — mark anything you estimated by eye.

1. Layout: max content container width in px; page gutters at desktop and mobile; the grid used
   for listing cards at each breakpoint (columns and gap); vertical spacing between major sections.
2. Typography: font families actually loaded; the sizes, weights and line-heights used for H1,
   H2, H3, body, small text, and buttons; approximate scale ratio.
3. Colour: every distinct colour with its hex — background, surface/card, primary text,
   secondary text, borders, primary brand, accent, link, star/rating, success, error. Say where
   each is used. (I am replacing these, but I need to know the roles.)
4. Cards: listing card dimensions and image aspect ratio; border radius; shadow; padding;
   what elements it contains and in what order. Do the same for category and blog cards.
5. Buttons: every variant with its height, padding, radius, and where each is used.
6. Header: height, whether it is sticky, what it contains left-to-right, how it changes on
   scroll, and how it collapses on mobile.
7. Footer: column structure, what is in each column, and what is in the bottom bar.
8. Forms: input height, radius, border, focus state.
9. Icons: which icon set it appears to use, and typical icon size.
10. Motion: describe every animation you can observe — section reveals on scroll, card hover
    effects, menu open/close, carousel transitions, page transitions. Note rough durations and
    whether easing feels linear or eased.

Output as markdown with one section per numbered item above, values in a table where possible.
```

---

## PROMPT 5 — Flows and states

> Run once. Some steps need a throwaway account — skip any you are not comfortable doing and say so.

```
Document the user journeys on 101toplistings.com. Structure and behaviour only.

Walk each of these end to end, recording every screen, every URL change, every form field, every
validation message, and every success or failure state:

1. Search: type a keyword in the homepage search, submit, then narrow with a category filter,
   then a location filter, then change the sort order, then go to page 2. Record how the URL
   changes at each step, and whether the state survives a page refresh and the browser back button.
2. Zero results: search for nonsense text. Describe exactly what is shown and what actions are offered.
3. Listing detail: from a result, open a listing, then use its contact action, and follow any
   "related listings" link.
4. Registration and login: go through the flow. Record fields, validation, what happens after
   submit, and what the logged-in state changes in the header. Use a throwaway email.
5. Add a listing: open the submit flow. Record whether it requires login, whether it is single or
   multi-step, every field with its type and whether it is required, and what happens on submit.
   Do not actually publish a fake business — stop before final submission and say where you stopped.
6. Reviews: find a listing with reviews. Record how they are displayed, sorting, pagination, the
   rating breakdown, and the review submission form's fields.
7. 404: visit a deliberately invalid URL. Describe the page and its navigation options.

For each flow output: numbered steps, the URL at each step, screenshots where useful, and a
"breakages or surprises" note.
```

---

## After the runs

Upload the resulting files to the Claude Code session. With Prompts 1–3 complete, Phase 1 and
Phase 2 of `PROMPT.md` can be marked done and implementation can start. Prompts 4 and 5 feed
Phase 4 and Phase 6.

Minimum viable set if time is short: **Prompt 1, Prompt 2, and Prompt 3 for the four highest-value
templates** (home, listings index, listing detail, category). Everything else can follow, but
those four determine whether the rebuild resembles the original at all.
