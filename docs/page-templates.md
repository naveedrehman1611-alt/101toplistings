# Page templates

Source: `docs/reference-analysis.md` → section "Prompt 2 — Page templates".

18 distinct templates were identified and verified by opening at least three URLs each. The
prioritised list the implementation works through is at `### Templates requiring deep analysis`.

Per-template deep analysis lives in the same file:

| Template group | Section |
|---|---|
| `listing-detail` | `## Prompt 3a` |
| `listings-index`, `category-archive`, `region-archive`, `taxonomy-index`, `search-results` | `## Prompt 3b` |
| `home` | `## Prompt 3c` |
| `blog-index`, `blog-archive`, `blog-post` | `## Prompt 3d` |
| `auth`, `add-listing-gate`, `contact`, `content-page`, `legal`, `error-404`, `landing-page-index`, `landing-page` | `## Prompt 3e` |

`section_type` enum for the admin page builder (§9.5.2 of `PROMPT.md`) must be derived from the
section orders documented in 3a–3e, not invented.
