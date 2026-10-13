import {
  definePage,
  defineSection,
  icon,
  link,
  list,
  text,
  textarea,
  toggle,
  type Fields,
  type SectionSpec,
} from '../schema';
import { FREE_TOOLS, TOOLS_BASE, TOOL_CATEGORIES, getTool, toolHref } from '@/lib/free-tools';

/**
 * The free SEO tools: the /free-tools hub and one page per live tool.
 *
 * Only copy lives here. Tool slugs, categories and status stay in
 * lib/free-tools.ts, and anything the tools compute with (limits, regexes,
 * option values, the generated output) stays in the tool code. Labels that
 * show a number say where it goes with a {placeholder}, such as {count}.
 */

// ---------------------------------------------------------------------------
// Shared hints
// ---------------------------------------------------------------------------

const RICH_HINT =
  'Wrap code in `backticks`, bold in **double asterisks**, and links as [text](/path).';
const BLOCKS_HINT = `Leave a blank line between paragraphs. Lines that start with "- " become a bulleted list. ${RICH_HINT}`;

// ---------------------------------------------------------------------------
// Sections every tool page has
// ---------------------------------------------------------------------------

type Step = { title: string; body: string };
type Guide = { heading: string; body: string };
type Faq = { question: string; answer: string };

function heroSection(d: { eyebrow: string; heading: string; intro: string }) {
  return defineSection({
    label: 'Hero',
    description: 'The navy banner at the top: small label, page title, intro and badge.',
    hideable: false,
    fields: {
      eyebrow: text('Small label above the title', d.eyebrow, { max: 60 }),
      heading: text('Page title (H1)', d.heading, { max: 120 }),
      intro: textarea('Intro', d.intro, {
        max: 600,
        hint: 'Also used as the tool’s description for search engines (WebApplication structured data).',
      }),
      badge: text('Badge', 'Free · No signup', { max: 60 }),
    },
  });
}

function stepsSection(steps: Step[]) {
  return defineSection({
    label: 'How it works',
    description: 'The numbered cards under the tool.',
    fields: {
      heading: text('Heading', 'How it works', { max: 80 }),
      items: list('Steps', {
        noun: 'step',
        max: 6,
        item: {
          title: text('Title', '', { max: 80 }),
          body: textarea('Text', '', { max: 400 }),
        },
        default: steps,
      }),
    },
  });
}

function guideSection(guide: Guide[]) {
  return defineSection({
    label: 'Guide',
    description: 'The long explainer under the steps: a heading and a few paragraphs per part.',
    fields: {
      parts: list('Guide parts', {
        noun: 'part',
        max: 10,
        item: {
          heading: text('Heading', '', { max: 120 }),
          body: textarea('Text', '', { max: 4000, hint: BLOCKS_HINT }),
        },
        default: guide,
      }),
    },
  });
}

function faqSection(faqs: Faq[]) {
  return defineSection({
    label: 'Frequently asked questions',
    description:
      'The questions that open on click. They also feed the FAQ structured data Google reads, so keep the answers plain text.',
    fields: {
      heading: text('Heading', 'Frequently asked questions', { max: 80 }),
      items: list('Questions', {
        noun: 'question',
        max: 16,
        item: {
          question: text('Question', '', { max: 200 }),
          answer: textarea('Answer', '', { max: 1200 }),
        },
        default: faqs,
      }),
    },
  });
}

function relatedSection() {
  return defineSection({
    label: 'More free tools',
    description:
      'Cards linking to other live tools. Their names and summaries come from the tool cards on the Free SEO Tools hub.',
    fields: {
      heading: text('Heading', 'More free SEO tools', { max: 80 }),
      all: link('Link under the cards', { label: 'View all free tools', href: TOOLS_BASE }),
    },
  });
}

/** Lighthouse progress, error and real-user panels, shared by the speed and mobile tests. */
function lighthouseFields() {
  return {
    progress: text('While testing: heading', 'Testing… {seconds}s', {
      max: 60,
      hint: '{seconds} becomes the seconds elapsed.',
    }),
    cancel: text('While testing: cancel button', 'Cancel', { max: 30 }),
    stage_1: text(
      'While testing: message (0–5 s)',
      'Sending your page to Google’s Lighthouse servers…',
      { max: 120 },
    ),
    stage_2: text(
      'While testing: message (5–15 s)',
      'Loading the page on a throttled test device…',
      { max: 120 },
    ),
    stage_3: text(
      'While testing: message (15–30 s)',
      'Measuring paint, layout shift and blocking time…',
      { max: 120 },
    ),
    stage_4: text(
      'While testing: message (30–50 s)',
      'Running accessibility, SEO and best-practice audits…',
      { max: 120 },
    ),
    stage_5: text(
      'While testing: message (after 50 s)',
      'Still working: heavy pages can take up to a minute and a half…',
      { max: 120 },
    ),
    progress_note: text(
      'While testing: note',
      'Tests usually take 10–60 seconds. You can keep reading below while you wait.',
      { max: 200 },
    ),
    error_heading: text('Error: heading', 'The test could not finish', { max: 80 }),
    retry: text('Error: retry button', 'Try again', { max: 30 }),
    field_heading: text('Real-user data: heading', 'Real-user data (Chrome UX Report)', {
      max: 80,
    }),
    field_origin: text('Real-user data: whole-site badge', 'whole site (origin)', { max: 40 }),
    field_intro: textarea(
      'Real-user data: intro',
      '75th-percentile experience of real Chrome users over the last 28 days. This is what Google uses for the Core Web Vitals ranking signal.',
      { max: 400 },
    ),
    field_none: textarea(
      'Real-user data: when there is none',
      'Not enough real-user traffic for Google to publish field data for this page or site yet. Use the lab data below as your guide.',
      { max: 400 },
    ),
  };
}

function toolSection<const F extends Fields>(fields: F): SectionSpec<F> {
  return defineSection({
    label: 'Tool',
    description:
      'Labels, placeholders, buttons and help text inside the tool. Where a label shows a number or name, keep its {placeholder}.',
    hideable: false,
    fields,
  });
}

function toolPage<const F extends Fields>(
  slug: string,
  d: {
    heading: string;
    intro: string;
    tool: SectionSpec<F>;
    steps: Step[];
    guide: Guide[];
    faqs: Faq[];
  },
) {
  const tool = getTool(slug);
  const eyebrow = TOOL_CATEGORIES.find((c) => c.id === tool.category)?.label ?? 'Free SEO Tool';
  return definePage({
    label: `Free tool: ${tool.name}`,
    path: toolHref(tool),
    sections: {
      hero: heroSection({ eyebrow, heading: d.heading, intro: d.intro }),
      tool: d.tool,
      steps: stepsSection(d.steps),
      guide: guideSection(d.guide),
      faq: faqSection(d.faqs),
      related: relatedSection(),
    },
  });
}

// ---------------------------------------------------------------------------
// /free-tools hub
// ---------------------------------------------------------------------------

/** Field keys for the category headings ("site-audit" → "site_audit"). */
export const categoryField = (id: string) => id.replace(/-/g, '_');

function cardSection(slug: string) {
  const tool = getTool(slug);
  return defineSection({
    label: `Tool card: ${tool.name}`,
    description:
      tool.status === 'live'
        ? 'This tool’s name, one-line summary and icon on the hub, in “More free SEO tools” and in the tool page’s breadcrumb and badge. Hiding it removes the card from the hub and those lists; the tool page itself stays online.'
        : 'A tool that is not live yet, shown greyed out as “Coming soon”. Hiding it removes the card from the hub.',
    fields: {
      name: text('Name', tool.name, { max: 60 }),
      summary: text('One-line summary', tool.summary, { max: 160 }),
      icon: icon('Icon', tool.icon),
      is_new: toggle(
        'Show the “New” badge',
        Boolean(tool.isNew),
        'Only shown on live tools; tools that are not live show “Coming soon”.',
      ),
    },
  });
}

/** One card section per tool, keyed "card-<slug>". */
const CARDS = Object.fromEntries(
  FREE_TOOLS.map((t) => [`card-${t.slug}`, cardSection(t.slug)]),
) as Record<`card-${string}`, ReturnType<typeof cardSection>>;

const FREE_TOOLS_PAGE = definePage({
  label: 'Free SEO Tools hub',
  path: TOOLS_BASE,
  sections: {
    hero: defineSection({
      label: 'Hero',
      description: 'The navy banner at the top: label, title, intro, badge and the three figures.',
      hideable: false,
      fields: {
        breadcrumb: text('Breadcrumb name', 'Free SEO Tools', {
          max: 60,
          hint: 'This page’s name in breadcrumbs here and on every tool page.',
        }),
        eyebrow: text('Small label above the title', 'Browser-Based SEO Tools', { max: 60 }),
        heading: text('Title (H1)', 'Free', { max: 80 }),
        highlight: text('Title, green part', 'SEO Tools', {
          max: 60,
          hint: 'Follows the title in green. Leave blank for none.',
        }),
        intro: textarea(
          'Intro',
          'Quick, practical checks and generators for small businesses and SEOs. Every tool runs in your browser, so there is no account to create, no limit to hit and nothing saved on our side. Test a page’s speed, preview how it looks in Google, check keyword use or generate schema and robots.txt in seconds.',
          { max: 600 },
        ),
        badge: text('Badge', 'Free · No signup · Nothing stored', { max: 80 }),
        badge_icon: icon('Badge icon', 'rocket_launch'),
        stat_tools: text('Figure label: number of live tools', 'Live Tools', { max: 30 }),
        stat_categories: text('Figure label: number of categories', 'Categories', { max: 30 }),
        stat_free_value: text('Third figure', 'Free', { max: 20 }),
        stat_free_label: text('Third figure label', 'No Signup', { max: 30 }),
      },
    }),
    tools: defineSection({
      label: 'Tool grid',
      description:
        'Headings and badges of the tool cards. Each card’s own name and summary are in the “Tool card” sections below.',
      hideable: false,
      fields: {
        ...(Object.fromEntries(
          TOOL_CATEGORIES.map((c) => [
            categoryField(c.id),
            text(`Category heading: ${c.label}`, c.label, { max: 60 }),
          ]),
        ) as Record<string, ReturnType<typeof text>>),
        new_badge: text('“New” badge', 'New', { max: 20 }),
        soon_badge: text('“Coming soon” badge', 'Coming soon', { max: 30 }),
        open: text('Card link text', 'Open tool', { max: 30 }),
      },
    }),
    ...CARDS,
    why: defineSection({
      label: 'Why free and private',
      description: 'Three cards under the tool grid.',
      fields: {
        heading: text('Heading', 'Why these tools are free and private', { max: 100 }),
        items: list('Cards', {
          noun: 'card',
          max: 6,
          item: {
            icon: icon('Icon', 'check_circle'),
            title: text('Title', '', { max: 80 }),
            body: textarea('Text', '', { max: 500 }),
          },
          default: [
            {
              icon: 'speed',
              title: 'They run on your device',
              body: 'Text tools and generators work entirely in your browser tab. The speed and mobile tests ask Google’s public PageSpeed Insights service directly from your browser, so nothing passes through our servers.',
            },
            {
              icon: 'verified_user',
              title: 'Nothing is stored',
              body: 'We do not save the URLs, text or settings you enter. Close the tab and it is gone — there is no account, history or tracking pixel tied to what you check.',
            },
            {
              icon: 'check_circle',
              title: 'Free with no catch',
              body: 'Because the work happens in your browser, the tools cost us almost nothing to run. They exist to be useful; if you want a hand applying what they find, our SEO team is there.',
            },
          ],
        }),
      },
    }),
    cta: defineSection({
      label: 'Call to action',
      description: 'The white box at the bottom pointing to SEO services.',
      fields: {
        heading: text('Heading', 'Want the fixes done for you?', { max: 100 }),
        body: textarea(
          'Text',
          'The tools show what needs attention. Our SEO services handle the rest — technical fixes, on-page optimisation and local SEO for businesses worldwide.',
          { max: 500 },
        ),
        button: link('Button', { label: 'See SEO services', href: '/seo-services' }),
      },
    }),
  },
});

// ---------------------------------------------------------------------------
// Robots.txt Generator
// ---------------------------------------------------------------------------

const ROBOTS_PAGE = toolPage('robots-txt-generator', {
  heading: 'Robots.txt Generator',
  intro:
    'Create a clean, valid robots.txt file for your website. Set rules for all crawlers, block private folders, add your sitemap, and decide which search engines and AI bots (GPTBot, ClaudeBot, PerplexityBot and more) may crawl your pages. Everything runs in your browser.',
  tool: toolSection({
    rules_heading: text('Default rules: heading', 'Rules for all robots (User-agent: *)', {
      max: 100,
    }),
    allow_all: text('Policy “allow all”: label', 'Allow all', { max: 30 }),
    allow_all_hint: text('Policy “allow all”: hint', 'Crawl everything', { max: 60 }),
    disallow_all: text('Policy “disallow all”: label', 'Disallow all', { max: 30 }),
    disallow_all_hint: text('Policy “disallow all”: hint', 'Block the whole site', { max: 60 }),
    custom: text('Policy “custom”: label', 'Custom', { max: 30 }),
    custom_hint: text('Policy “custom”: hint', 'Choose paths', { max: 60 }),
    quick_add: text('Quick-add chips: label', 'Quick add common paths', { max: 80 }),
    disallow_label: text('Disallowed paths: label', 'Disallowed paths', { max: 60 }),
    disallow_hint: text(
      'Disallowed paths: hint',
      'Start with / . Use * as a wildcard and $ to match the end of a URL.',
      { max: 200 },
    ),
    disallow_placeholder: text('Disallowed paths: placeholder', '/private/', { max: 80 }),
    allow_label: text('Allowed paths: label', 'Allowed paths', { max: 60 }),
    allow_hint: text(
      'Allowed paths: hint',
      'Exceptions inside a disallowed folder. The longest matching rule wins.',
      { max: 200 },
    ),
    allow_placeholder: text('Allowed paths: placeholder', '/private/public-page.html', {
      max: 80,
    }),
    add_row: text('“Add” button under a path list', 'Add', { max: 30 }),
    crawl_delay_label: text('Crawl-delay: label', 'Crawl-delay in seconds (optional)', {
      max: 80,
    }),
    crawl_delay_placeholder: text('Crawl-delay: placeholder', 'e.g. 5', { max: 30 }),
    crawl_delay_note: textarea(
      'Crawl-delay: note',
      'Googlebot ignores Crawl-delay (Google adjusts its crawl rate automatically). Bing and Yandex respect it.',
      { max: 300 },
    ),
    search_heading: text('Search engine crawlers: heading', 'Search engine crawlers', {
      max: 80,
    }),
    search_intro: textarea(
      'Search engine crawlers: intro',
      '**Default** follows the * rules above. **Allow** gives the bot full access (it then ignores the * rules). **Block** disallows the whole site for that bot.',
      { max: 400, hint: RICH_HINT },
    ),
    rule_default: text('Per-bot rule button: default', 'default', { max: 20 }),
    rule_allow: text('Per-bot rule button: allow', 'allow', { max: 20 }),
    rule_block: text('Per-bot rule button: block', 'block', { max: 20 }),
    ai_heading: text('AI crawlers: heading', 'AI crawlers', { max: 80 }),
    ai_intro: textarea(
      'AI crawlers: intro',
      '**Training bots** (GPTBot, ClaudeBot, Google-Extended, CCBot…) collect pages to train AI models. Blocking them does not affect your search rankings.\n\n**AI search and user bots** (OAI-SearchBot, Claude-SearchBot, PerplexityBot, ChatGPT-User…) fetch pages to show and cite them in AI answers. Blocking them can remove your site from ChatGPT, Claude or Perplexity answers and the traffic they send.',
      { max: 1000, hint: `Leave a blank line between paragraphs. ${RICH_HINT}` },
    ),
    preset_allow: text('Preset button: allow everything', 'Allow everything', { max: 60 }),
    preset_training: text(
      'Preset button: block training only',
      'Block AI training, allow AI search',
      { max: 60 },
    ),
    preset_block: text('Preset button: block all AI', 'Block all AI bots', { max: 60 }),
    kind_training: text('Bot tag: training', 'Training', { max: 30 }),
    kind_search: text('Bot tag: AI search', 'AI search', { max: 30 }),
    kind_user: text('Bot tag: user fetch', 'User fetch', { max: 30 }),
    sitemaps_label: text('Sitemaps: label', 'Sitemap URLs', { max: 60 }),
    sitemaps_hint: text(
      'Sitemaps: hint',
      'Full URLs, e.g. https://example.com/sitemap.xml. They are listed at the end of the file.',
      { max: 200 },
    ),
    sitemaps_placeholder: text('Sitemaps: placeholder', 'https://example.com/sitemap.xml', {
      max: 100,
    }),
    output_heading: text('Output: heading', 'Your robots.txt', { max: 80 }),
    copy: text('Copy button', 'Copy', { max: 30 }),
    copied: text('Copy button after copying', 'Copied', { max: 30 }),
    download: text('Download button', 'Download', { max: 30 }),
    output_notes: textarea(
      'Output: notes',
      '- Save the file as `robots.txt` at the root of your domain (e.g. `https://example.com/robots.txt`). Crawlers ignore it anywhere else, and each subdomain needs its own.\n- robots.txt controls crawling, not indexing. A blocked URL can still appear in Google if other sites link to it. To keep a page out of results, use a `noindex` meta tag and leave it crawlable.',
      { max: 1000, hint: `One note per line, each starting with "- ". ${RICH_HINT}` },
    ),
  }),
  steps: [
    {
      title: 'Set the default rules',
      body: 'Choose Allow all, Disallow all, or Custom, then add the folders you want kept out of crawlers’ reach. Quick-add chips cover WordPress admin, cart, checkout and search pages.',
    },
    {
      title: 'Pick rules per crawler',
      body: 'Leave each bot on Default, or allow or block it individually. Use a preset to block AI training bots while keeping AI search bots that can cite and link to you.',
    },
    {
      title: 'Copy or download',
      body: 'Add your sitemap URL, check the warnings, then copy the file or download robots.txt and upload it to the root of your domain.',
    },
  ],
  guide: [
    {
      heading: 'What a robots.txt file does',
      body: 'robots.txt is a plain text file at `https://yourdomain.com/robots.txt` that tells crawlers which parts of a site they may request. Each block starts with one or more `User-agent` lines followed by `Allow` and `Disallow` rules. A crawler obeys only the most specific group that names it, falling back to the `User-agent: *` group otherwise.\n\nIt is a set of instructions, not a lock. Reputable crawlers follow it, but anyone can still open a blocked URL in a browser, so never rely on robots.txt to hide private or sensitive content. Use passwords or server rules for that.',
    },
    {
      heading: 'Crawling is not the same as indexing',
      body: 'Disallowing a URL stops Google from fetching it, but if other pages link to it, Google can still list the bare URL in results without a description. To remove a page from search, add `<meta name="robots" content="noindex">` and keep the page crawlable so Google can see that tag.\n\nAlso avoid blocking CSS, JavaScript or image folders that your pages need to render. Google renders pages like a browser, and blocked resources can make your content look broken or thin.',
    },
    {
      heading: 'AI training bots vs AI search bots',
      body: 'AI companies run different crawlers for different jobs. Training crawlers such as `GPTBot`, `ClaudeBot`, `Google-Extended` and `CCBot` collect content to train models. Blocking them keeps your content out of future training sets and has no effect on Google or Bing rankings.\n\nSearch and user-triggered crawlers such as `OAI-SearchBot`, `ChatGPT-User`, `Claude-SearchBot` and `PerplexityBot` fetch pages so AI assistants can quote and link to them in answers. For most businesses these bring visitors, so the “Block AI training, allow AI search” preset is a sensible middle ground.',
    },
    {
      heading: 'Wildcards, precedence and common mistakes',
      body: 'Google and Bing support `*` (any characters) and `$` (end of URL). `Disallow: /*?sort=` blocks every URL with a sort parameter, and `Disallow: /*.pdf$` blocks PDFs. When an Allow and a Disallow rule both match, the longer (more specific) rule wins, which is why `Allow: /wp-admin/admin-ajax.php` works inside a blocked `/wp-admin/`.\n\nThe costliest mistake is leaving `Disallow: /` live after a site launch, which blocks the entire site. Paths are case-sensitive, must start with a slash, and each subdomain (such as `shop.example.com`) needs its own file.',
    },
  ],
  faqs: [
    {
      question: 'Where do I upload robots.txt?',
      answer:
        'At the root of your domain, so it loads at https://yourdomain.com/robots.txt. Crawlers do not look for it in subfolders. On WordPress you can upload it by FTP or edit it with an SEO plugin; on most hosts it goes in the public_html folder.',
    },
    {
      question: 'Will blocking a page in robots.txt remove it from Google?',
      answer:
        'Not reliably. robots.txt stops crawling, not indexing, so a blocked URL that is linked from elsewhere can still appear in results. Use a noindex meta tag (and keep the page crawlable) or remove the page to take it out of Google.',
    },
    {
      question: 'Should I block AI bots like GPTBot and ClaudeBot?',
      answer:
        'It depends on your goals. Blocking training bots keeps your content out of model training without hurting search rankings. Blocking AI search bots such as OAI-SearchBot, Claude-SearchBot or PerplexityBot can stop AI assistants from citing and linking to you, which usually costs traffic.',
    },
    {
      question: 'Does blocking Google-Extended affect my Google rankings?',
      answer:
        'No. Google-Extended is a control token for Gemini training and grounding only. Google Search crawls with Googlebot, so blocking Google-Extended does not change how you rank or appear in Google Search.',
    },
    {
      question: 'Does Google respect Crawl-delay?',
      answer:
        'No. Googlebot ignores the Crawl-delay directive and sets its crawl rate automatically based on how your server responds. Bing and Yandex do respect it. If Googlebot is overloading your server, return 503 or 429 responses temporarily.',
    },
    {
      question: 'Do I need a robots.txt file at all?',
      answer:
        'It is not required. Without one, crawlers assume they can crawl everything. A short file is still useful to point crawlers to your sitemap, keep them out of cart, search and admin pages, and set rules for AI crawlers.',
    },
    {
      question: 'Should I add my sitemap to robots.txt?',
      answer:
        'Yes. A Sitemap line with the full URL helps every crawler find your sitemap, including ones where you have not submitted it manually. You can list several sitemaps or a sitemap index file.',
    },
    {
      question: 'Is this robots.txt generator free and private?',
      answer:
        'Yes. It is completely free with no sign-up, and the file is built in your browser. Nothing you enter is sent to our servers.',
    },
  ],
});

// ---------------------------------------------------------------------------
// Schema Markup Generator
// ---------------------------------------------------------------------------

const SCHEMA_PAGE = toolPage('schema-markup-generator', {
  heading: 'Schema Markup Generator',
  intro:
    "Fill in a simple form and get clean JSON-LD structured data for 8 common schema types, checked against Google's required and recommended properties as you type. Everything runs in your browser.",
  tool: toolSection({
    type_legend: text('Schema type picker: label', 'Schema type', { max: 60 }),
    load_example: text('“Load example” button', 'Load example', { max: 30 }),
    reset: text('“Reset” button', 'Reset', { max: 30 }),
    autosave_note: text('Autosave note', 'Drafts autosave in this browser.', { max: 120 }),
    details_heading: text('Form heading', '{type} details', {
      max: 80,
      hint: '{type} becomes the chosen schema type, such as LocalBusiness.',
    }),
    required_key: text('Key: required', 'required', { max: 40 }),
    recommended_key: text('Key: recommended', 'recommended by Google', { max: 60 }),
    weekdays: text('Opening days shortcut: weekdays', 'Mon–Fri', { max: 20 }),
    weekdays_sat: text('Opening days shortcut: weekdays and Saturday', 'Mon–Sat', { max: 20 }),
    every_day: text('Opening days shortcut: every day', 'Every day', { max: 20 }),
    output_heading: text('Output: heading', 'JSON-LD output', { max: 80 }),
    output_size: text('Output: size', '{count} characters', {
      max: 40,
      hint: '{count} becomes the number of characters.',
    }),
    copy_json: text('Copy JSON button', 'Copy JSON', { max: 40 }),
    copy_script: text('Copy script tag button', 'Copy <script> tag', { max: 40 }),
    copied: text('Copy buttons after copying', 'Copied', { max: 30 }),
    download_json: text('Download button', 'Download .json', { max: 40 }),
    rich_results: link('Link: Rich Results Test', {
      label: 'Test in Google Rich Results Test',
      href: 'https://search.google.com/test/rich-results',
    }),
    validator: link('Link: Schema.org validator', {
      label: 'Schema.org validator',
      href: 'https://validator.schema.org/',
    }),
    output_note: textarea(
      'Output: note',
      "Paste the script tag into the page's HTML (in the head or body), then run the test on the live URL or with the code snippet option.",
      { max: 400 },
    ),
    validation_heading: text('Validation: heading', 'Validation', { max: 60 }),
    validation_ok: text('Validation: when all is well', 'No errors or warnings', { max: 80 }),
  }),
  steps: [
    {
      title: 'Pick a schema type',
      body: 'Choose LocalBusiness, Organization, Article, Product, FAQ, HowTo, Event or Breadcrumbs. Use "Load example" to see a filled-in sample.',
    },
    {
      title: 'Fill in the details',
      body: 'Required fields are marked with a red star and recommended ones with a gold diamond. The JSON-LD and the validation list update on every keystroke.',
    },
    {
      title: 'Copy, paste and test',
      body: 'Copy the ready-made script tag into your page, publish it, then run Google’s Rich Results Test on the live URL to confirm it is picked up.',
    },
  ],
  guide: [
    {
      heading: 'What is schema markup?',
      body: 'Schema markup is structured data that describes what a page is about in a vocabulary search engines agree on, published at schema.org. Instead of guessing that “+92-42-35761234” is a phone number or that “4.6” is a rating, Google, Bing and AI assistants read it as a labelled fact: this business has this telephone, this address and these opening hours.\n\nMarkup does not directly raise rankings, but it makes a page eligible for rich results (stars, prices, event dates, breadcrumbs in the URL line) and helps search engines connect your website to your Google Business Profile and social profiles.',
    },
    {
      heading: 'JSON-LD vs microdata',
      body: 'There are three ways to add schema: JSON-LD, microdata and RDFa. Microdata and RDFa are attributes woven into your visible HTML, so a theme change or a page builder can silently break them. JSON-LD is a single block of JSON inside a `<script type="application/ld+json">` tag, separate from the layout.\n\nGoogle recommends JSON-LD, it is easier to generate and review, and it can be added by a plugin, tag manager or developer without touching the design. That is why this tool outputs JSON-LD only.',
    },
    {
      heading: 'Where to put the code',
      body: 'Paste the script tag into the HTML of the page it describes, either in the `<head>` or anywhere in the `<body>`. On WordPress, use a header/footer code plugin or your SEO plugin’s custom schema option; on Shopify or Wix, use the custom code or theme settings area.\n\nPut each schema on the right page: LocalBusiness on your home or contact page, Product on each product page, Article on each post, FAQPage only where the questions are visible. The markup must match what visitors can see; marking up hidden or invented content breaks Google’s guidelines and can lead to a manual action.',
    },
    {
      heading: 'Which types help local businesses most',
      body: 'For a shop, clinic, restaurant or service business, start with **LocalBusiness** (or a specific subtype like Restaurant, Dentist or AutoRepair) with your exact name, address and phone as shown on your Google Business Profile, map coordinates, opening hours and sameAs links to your social and directory profiles. Consistent NAP details across your site, Google and directories are a core local SEO signal.\n\nAdd **Organization** for your brand and logo, **BreadcrumbList** on deeper pages, **Product** if you sell online, and **Event** for workshops, sales or openings.',
    },
    {
      heading: 'Rich result eligibility: what to expect',
      body: 'Valid markup makes a page eligible for rich results; it does not guarantee them. Google decides per query and per site. A few changes are worth knowing:\n\n- Since August 2023, FAQ rich results are shown only for well-known, authoritative government and health websites.\n- HowTo rich results were retired in 2023 on both mobile and desktop.\n- Review stars are not shown for ratings a LocalBusiness or Organization publishes about itself (self-serving reviews).\n\nThe markup is still valid in all these cases and still helps search engines and AI tools understand your content, so it is worth keeping where it is accurate.',
    },
  ],
  faqs: [
    {
      question: 'Is this schema markup generator free?',
      answer:
        'Yes. It is free with no signup and no limits. The JSON-LD is built in your browser, and nothing you type is sent to a server. Drafts are saved only in your own browser’s local storage.',
    },
    {
      question: 'Will schema markup improve my Google rankings?',
      answer:
        'Not directly. Structured data is not a ranking factor on its own, but it can earn rich results that stand out and get more clicks, and it helps Google understand and trust details like your address, hours and products.',
    },
    {
      question: 'Which schema type should I use for my business?',
      answer:
        'Use LocalBusiness, or the most specific subtype available (Restaurant, Dentist, Store, ProfessionalService and so on), if customers visit you or you serve a local area. Use Organization for an online-only company or for your brand as a whole.',
    },
    {
      question: 'Can I use more than one schema type on a page?',
      answer:
        'Yes. You can add several script tags to one page, for example LocalBusiness plus BreadcrumbList, or Article plus FAQPage. Each must describe content that is actually on that page.',
    },
    {
      question: 'Why does the validator say a field is recommended but not required?',
      answer:
        'Google splits properties into required (the markup is invalid for rich results without them) and recommended (they improve eligibility and accuracy). Missing recommended fields are warnings: the code still works, but adding them makes it stronger.',
    },
    {
      question: 'How do I test my schema after adding it?',
      answer:
        'Use Google’s Rich Results Test to see which rich results the page is eligible for, and the Schema.org validator to check the markup against the full vocabulary. After publishing, the Enhancements reports in Google Search Console show errors across your whole site.',
    },
    {
      question: 'Is FAQ and HowTo schema still worth adding?',
      answer:
        'FAQ rich results are now limited to authoritative government and health sites, and HowTo rich results were retired in 2023. The markup is still valid and can help other search engines and AI answers read your content, but do not expect special display in Google.',
    },
    {
      question: 'Why should URLs be absolute?',
      answer:
        'Search engines read JSON-LD out of context, so relative paths like /logo.png can be misread. Use full URLs that start with https:// for your website, images, logo and profile links.',
    },
  ],
});

// ---------------------------------------------------------------------------
// Meta Tags & SERP Preview
// ---------------------------------------------------------------------------

const META_TAGS_PAGE = toolPage('meta-tag-generator', {
  heading: 'Meta Tag Generator & SERP Preview',
  intro:
    'See exactly how your page could look in Google before you publish. Type a title and meta description to get a live desktop and mobile preview measured in pixels, a social share card, and clean meta, Open Graph and Twitter tags ready to paste.',
  tool: toolSection({
    form_heading: text('Form: heading', 'Page details', { max: 60 }),
    example: text('“Example” button', 'Example', { max: 30 }),
    clear: text('“Clear” button', 'Clear', { max: 30 }),
    title_label: text('Title: label', 'Page title', { max: 60 }),
    title_placeholder: text('Title: placeholder', 'Primary keyword – benefit | Brand', {
      max: 100,
    }),
    meter_characters: text('Counter: characters', 'Characters', { max: 30 }),
    meter_pixels: text('Counter: pixels', 'Pixels', { max: 30 }),
    title_empty: text('Title note: empty', 'Aim for 30–60 characters and under 600 pixels.', {
      max: 200,
    }),
    title_good: text('Title note: good', 'Good length: it should show in full.', { max: 200 }),
    title_short: text('Title note: short', 'A little short: add a benefit, location or brand.', {
      max: 200,
    }),
    title_long: text('Title note: slightly long', 'Slightly long: the end may be cut off.', {
      max: 200,
    }),
    title_too_long: text(
      'Title note: too long',
      'Too long: Google will cut it off. Put the important words first.',
      { max: 200 },
    ),
    desc_label: text('Description: label', 'Meta description', { max: 60 }),
    desc_placeholder: text(
      'Description: placeholder',
      'One or two sentences that sell the click.',
      { max: 120 },
    ),
    desc_empty: text('Description note: empty', 'Aim for 70–160 characters.', { max: 200 }),
    desc_good: text('Description note: good', 'Good length.', { max: 200 }),
    desc_short: text(
      'Description note: short',
      'Short: there is room to say more about the page.',
      { max: 200 },
    ),
    desc_long: text(
      'Description note: long',
      'Long: Google will likely truncate it, so lead with the key message.',
      { max: 200 },
    ),
    url_label: text('Page URL: label', 'Page URL', { max: 60 }),
    url_placeholder: text('Page URL: placeholder', 'https://www.example.com/services/', {
      max: 100,
    }),
    site_label: text('Site name: label', 'Site name', { max: 60 }),
    site_placeholder: text('Site name: placeholder', 'Your brand', { max: 60 }),
    advanced: text(
      'Advanced options: toggle',
      'Advanced: robots, canonical, social image, language',
      { max: 100 },
    ),
    index_label: text('Indexing: label', 'Indexing', { max: 40 }),
    follow_label: text('Links: label', 'Links', { max: 40 }),
    noindex_warning: textarea(
      'Warning when noindex is chosen',
      'noindex keeps this page out of Google’s results entirely. Use it only for pages such as thank-you pages, internal search results or duplicates.',
      { max: 400 },
    ),
    canonical_label: text('Canonical: label', 'Canonical URL', { max: 60 }),
    canonical_placeholder: text('Canonical: placeholder', 'Usually the same as the page URL', {
      max: 100,
    }),
    image_label: text('Share image: label', 'Social share image URL', { max: 60 }),
    image_placeholder: text(
      'Share image: placeholder',
      'https://www.example.com/og-image.jpg (1200×630)',
      { max: 100 },
    ),
    og_type_label: text('og:type: label', 'og:type', { max: 40 }),
    card_label: text('Twitter card: label', 'Twitter card', { max: 40 }),
    card_large: text('Twitter card: large image option', 'Large image', { max: 40 }),
    card_summary: text('Twitter card: summary option', 'Summary', { max: 40 }),
    language_label: text('Language: label', 'Language', { max: 40 }),
    language_placeholder: text('Language: placeholder', 'en, en-PK, ur', { max: 60 }),
    preview_heading: text('Google preview: heading', 'Google preview', { max: 60 }),
    preview_title: text(
      'Google preview: title before one is typed',
      'Your page title appears here',
      {
        max: 100,
      },
    ),
    preview_desc: textarea(
      'Google preview: description before one is typed',
      'Your meta description appears here. Write one or two sentences that tell searchers what the page offers and why they should click.',
      { max: 300 },
    ),
    preview_note: textarea(
      'Google preview: note',
      'Widths are measured in pixels with the fonts Google uses, so wide letters (W, M) cut off sooner than narrow ones (i, l). Google may still rewrite titles and snippets.',
      { max: 400 },
    ),
    title_truncated: text('Google preview: title cut off', 'Your title is truncated.', {
      max: 100,
    }),
    desc_truncated: text('Google preview: description cut off', 'Your description is truncated.', {
      max: 100,
    }),
    social_heading: text('Social preview: heading', 'Social share preview', { max: 60 }),
    image_failed: text('Social preview: image failed', 'Image could not be loaded', { max: 80 }),
    image_missing: text('Social preview: no image', 'Add a 1200×630 image URL', { max: 80 }),
    social_title: text('Social preview: title before one is typed', 'Your page title', {
      max: 80,
    }),
    social_desc: text('Social preview: description before one is typed', 'Your description', {
      max: 80,
    }),
    tags_heading: text('Output: heading', 'Your meta tags', { max: 60 }),
    copy_html: text('Copy button', 'Copy HTML', { max: 30 }),
    copied: text('Copy button after copying', 'Copied', { max: 30 }),
    tags_note: textarea(
      'Output: note',
      'Paste inside the `<head>` of your page. Empty fields are left out and special characters are escaped for you.',
      { max: 400, hint: RICH_HINT },
    ),
  }),
  steps: [
    {
      title: 'Enter your page details',
      body: 'Add the title, meta description and page URL. Optionally set robots rules, a canonical URL, a share image and the page language.',
    },
    {
      title: 'Tune it with the live preview',
      body: 'Watch the Google result update as you type. The counters turn amber or red when a title or description is likely to be cut off.',
    },
    {
      title: 'Copy the HTML',
      body: 'Copy the generated tags into your page’s <head>, or into your CMS or SEO plugin fields. Values are escaped and empty fields are skipped.',
    },
  ],
  guide: [
    {
      heading: 'Why Google truncates by pixels, not characters',
      body: 'Google does not cut titles at a fixed number of characters. It cuts them when they run out of horizontal space, which on desktop is roughly 600 pixels of 20px Arial. A title full of wide letters such as “W” and “M” fits fewer characters than one full of narrow letters like “i” and “l”, which is why a 55-character title can be truncated while a 65-character one is shown in full.\n\nThis tool measures your text with the browser’s own font engine, the same way the result page does, so the preview is a close match. Treat 30–60 characters as a guide and the pixel meter as the real limit. Descriptions are measured the same way, with roughly 920 pixels on desktop and less on mobile.',
    },
    {
      heading: 'How to write a title tag that earns clicks',
      body: 'Lead with the words people search for, then add what makes you the better choice: a location, a price, a guarantee or a year. Keep the brand at the end, separated by a pipe or dash, unless your brand is what people search for.\n\nEvery page should have a unique title. Duplicate titles across service or city pages make it hard for Google to choose which page to show, and Google is more likely to rewrite titles that are vague, stuffed with keywords or much longer than the space available.',
    },
    {
      heading: 'Meta descriptions: not a ranking factor, still important',
      body: 'The meta description does not directly affect rankings, but it is often the text under your title in the results, so it shapes whether people click. Summarise what the page offers, include the main phrase (Google bolds matching words) and end with a reason to click, such as “Free quote in 24 hours”.\n\nGoogle rewrites descriptions when it thinks another passage from the page answers the search better. A specific, accurate description that matches the page content is the best way to have yours used.',
    },
    {
      heading: 'Robots, canonical and social tags explained',
      body: '**Robots** controls indexing. Pages are indexed and their links followed by default, so the tag is only added here when you choose noindex or nofollow. **Canonical** tells search engines which URL is the main version when the same content is reachable at several addresses, for example with tracking parameters.\n\n**Open Graph** tags control the title, description and image shown when the page is shared on Facebook, LinkedIn and WhatsApp, and **Twitter card** tags do the same on X. A 1200×630 pixel image works well across all of them.',
    },
  ],
  faqs: [
    {
      question: 'How long should a title tag be?',
      answer:
        'Aim for about 30–60 characters and under roughly 600 pixels wide on desktop. Longer titles are not penalised, but the end will be cut off with an ellipsis, so put the most important words first.',
    },
    {
      question: 'How long should a meta description be?',
      answer:
        'Around 70–160 characters is a good target. Google measures snippets in pixels and shows less on mobile, so make sure the first 120 characters carry the key message.',
    },
    {
      question: 'Why does Google show a different title or description than mine?',
      answer:
        'Google rewrites titles and snippets when it thinks they do not describe the page well, are stuffed with keywords, are duplicated across pages or do not match the search. Clear, unique and accurate tags are rewritten far less often.',
    },
    {
      question: 'How accurate is the SERP preview?',
      answer:
        'It uses the same fonts and pixel limits as Google’s result layout and measures your text in your browser, so it is a close approximation. Google changes its design from time to time and may add dates, ratings or other details, so treat it as a guide rather than a guarantee.',
    },
    {
      question: 'Do I need the meta keywords tag?',
      answer:
        'No. Google has ignored the meta keywords tag for ranking for well over a decade, and it can reveal your target keywords to competitors, so this generator does not include it.',
    },
    {
      question: 'Where do I paste the generated tags?',
      answer:
        'Inside the <head> section of your HTML, replacing any existing title and description tags. On WordPress, Shopify or Wix, enter the title and description in the SEO fields of the page settings or your SEO plugin instead.',
    },
    {
      question: 'What size should my Open Graph image be?',
      answer:
        '1200×630 pixels (a 1.91:1 ratio) is the safest size for Facebook, LinkedIn, WhatsApp and X large image cards. Keep important text away from the edges and the file under a few megabytes, and use an absolute https:// URL.',
    },
    {
      question: 'Is anything I type saved or sent anywhere?',
      answer:
        'No. The previews and HTML are generated in your browser. Nothing is uploaded or stored on our servers.',
    },
  ],
});

// ---------------------------------------------------------------------------
// Website Speed Test
// ---------------------------------------------------------------------------

const SPEED_TEST_PAGE = toolPage('website-speed-test', {
  heading: 'Free Website Speed Test',
  intro:
    'Check how fast any web page loads on a phone or a desktop. You get Google Lighthouse scores for performance, accessibility, best practices and SEO, your Core Web Vitals from real Chrome users, and a ranked list of what to fix first.',
  tool: toolSection({
    url_label: text('URL: label', 'Page URL', { max: 60 }),
    url_placeholder: text('URL: placeholder', 'https://example.com', { max: 100 }),
    device_legend: text('Device: label', 'Device', { max: 40 }),
    mobile: text('Device: mobile', 'Mobile', { max: 30 }),
    desktop: text('Device: desktop', 'Desktop', { max: 30 }),
    run: text('Run button', 'Run test', { max: 30 }),
    running: text('Run button while testing', 'Testing…', { max: 30 }),
    results_heading: text('Results: heading', '{device} results', {
      max: 60,
      hint: '{device} becomes Mobile or Desktop (as set above).',
    }),
    tested: text('Results: when tested', 'Tested {date}', {
      max: 60,
      hint: '{date} becomes the date and time of the test.',
    }),
    cached: text('Results: cached note', 'cached result (under 10 minutes old)', { max: 80 }),
    rerun: text('Re-run button', 'Re-run', { max: 30 }),
    full_report: text('Full report link', 'View full report on PageSpeed Insights', {
      max: 80,
    }),
    warning: text('Lighthouse warning prefix', 'Warning:', { max: 30 }),
    lab_heading: text('Lab data: heading', 'Lab data (Lighthouse)', { max: 80 }),
    lab_intro: textarea(
      'Lab data: intro',
      'One simulated load on a {device} from Google’s servers. Great for debugging; it can differ from real users.',
      { max: 400, hint: '{device} becomes one of the two device phrases below.' },
    ),
    lab_mobile: text('Lab data: mobile device phrase', 'throttled mid-range phone', { max: 60 }),
    lab_desktop: text('Lab data: desktop device phrase', 'desktop', { max: 60 }),
    screenshot_caption: text('Screenshot caption', 'Final screenshot', { max: 60 }),
    opps_heading: text('Opportunities: heading', 'Opportunities', { max: 80 }),
    opps_intro: textarea(
      'Opportunities: intro',
      'Changes that could make the page load faster, biggest estimated saving first. Savings are estimates and do not directly add to the score.',
      { max: 400 },
    ),
    opps_none: text('Opportunities: none found', 'No significant load-time opportunities found.', {
      max: 120,
    }),
    diag_heading: text('Diagnostics: heading', 'Diagnostics & failed audits', { max: 80 }),
    diag_intro: textarea(
      'Diagnostics: intro',
      'Everything else Lighthouse flagged, grouped by category. Open a group to see details.',
      { max: 400 },
    ),
    ...lighthouseFields(),
  }),
  steps: [
    {
      title: 'Enter a page URL',
      body: 'Paste the full address of the page you want to test. Test your home page, but also your key landing, product and service pages; each page has its own speed.',
    },
    {
      title: 'Pick mobile or desktop',
      body: 'Mobile is the one that matters most, because Google indexes and ranks the mobile version of your site. Desktop is useful for comparison.',
    },
    {
      title: 'Read the scores and fix the top items',
      body: 'Google’s Lighthouse loads the page in 10–60 seconds. Start with the opportunities at the top of the list: they have the biggest estimated time savings.',
    },
  ],
  guide: [
    {
      heading: 'What Core Web Vitals measure',
      body: 'Core Web Vitals are the three user-experience metrics Google uses as part of its page experience ranking signals. Each is judged at the 75th percentile of real visits, so three out of four visitors need a good experience for the page to pass.\n\n- **Largest Contentful Paint (LCP)** — how long until the biggest image or text block is visible. Good is 2.5 seconds or less. Slow servers, large hero images and render-blocking CSS are the usual culprits.\n- **Interaction to Next Paint (INP)** — how quickly the page responds when someone taps, clicks or types, across the whole visit. Good is 200 ms or less. Heavy JavaScript, chat widgets and third-party tags are the common causes of poor INP.\n- **Cumulative Layout Shift (CLS)** — how much content jumps around while the page loads. Good is 0.1 or less. Give images, ads and embeds fixed dimensions and avoid inserting banners above existing content.\n\nLighthouse lab tests cannot measure INP because no real person interacts with the page, so the lab report shows Total Blocking Time (TBT) as a stand-in: if TBT is high, INP is usually poor too.',
    },
    {
      heading: 'How the Lighthouse performance score is calculated',
      body: 'The 0–100 performance score is a weighted blend of five lab metrics: Total Blocking Time and Largest Contentful Paint carry the most weight, followed by Cumulative Layout Shift, First Contentful Paint and Speed Index. Each metric is compared with data from real websites, so a score of 50 roughly means you are around the median of the web, and 90+ puts you among the fastest pages.\n\nThe accessibility, best practices and SEO scores work differently: they are the weighted share of pass/fail audits your page passes, such as image alt text, colour contrast, HTTPS, valid meta tags and crawlable links.',
    },
    {
      heading: 'Quick wins that fix most slow sites',
      body: '- Compress and resize images, serve them as WebP or AVIF, and lazy-load anything below the fold — but never lazy-load the main hero image.\n- Use a good host or a CDN so the server answers in well under a second (Time to First Byte). Cheap shared hosting is often the single biggest bottleneck for small business sites.\n- Remove plugins, sliders, chat widgets and tracking tags you do not really need. Each third-party script competes for the phone’s processor.\n- Turn on caching and text compression (gzip or Brotli), and minify CSS and JavaScript.\n- Preload the LCP image and the main web font, and use `font-display: swap` so text appears straight away.\n- Set width and height on images and video so the browser reserves space and the layout does not shift.',
    },
    {
      heading: 'Does page speed affect Google rankings?',
      body: 'Yes, but as a tie-breaker rather than a trump card. Relevance and content quality still come first, yet when several pages answer a search equally well, the faster one with better Core Web Vitals has an edge. The bigger effect is on people: slow pages lose visitors before they ever see your offer, and every extra second on mobile measurably reduces enquiries and sales. For local businesses competing in the map pack and organic results, a fast mobile site is one of the cheapest advantages you can buy.',
    },
  ],
  faqs: [
    {
      question: 'What is the difference between lab data and field data?',
      answer:
        'Lab data comes from a single Lighthouse test run on Google’s servers with a simulated mid-range phone and slow 4G connection. It is repeatable and great for debugging. Field data (the “Real-user data” panel) comes from the Chrome UX Report: anonymised measurements from real Chrome users who visited the page over the last 28 days on their own devices and networks. Google uses field data for rankings, so if the two disagree, trust field data for SEO and use lab data to find what to fix.',
    },
    {
      question: 'Why does my score change every time I run the test?',
      answer:
        'Lighthouse loads your page fresh each time, and small differences add up: server response time, network routing, third-party scripts and ads that load different content, A/B tests, and the load on Google’s test machines. A swing of 5–10 points between runs is normal. Run the test three times and look at the middle result, and focus on the metrics and opportunities rather than one number.',
    },
    {
      question: 'Why is there no real-user data for my site?',
      answer:
        'The Chrome UX Report only publishes data for pages and sites with enough traffic from Chrome users who have opted in to usage statistics. Newer or low-traffic sites often have no field data at page level, and sometimes not even for the whole origin. In that case rely on the lab metrics until traffic grows.',
    },
    {
      question: 'Is mobile or desktop speed more important?',
      answer:
        'Mobile. Google uses mobile-first indexing, meaning it crawls and ranks the mobile version of your pages, and in most markets the majority of visitors are on phones. Mobile scores are also usually lower because the test simulates a slower processor and network.',
    },
    {
      question: 'What is a good PageSpeed score?',
      answer:
        '90–100 is good, 50–89 needs improvement and below 50 is poor. Do not chase a perfect 100: a page scoring in the 80s that passes all three Core Web Vitals in field data is in excellent shape. Passing Core Web Vitals for real users matters more than the lab score.',
    },
    {
      question: 'Who runs the test and is my data stored?',
      answer:
        'The test is run by Google’s PageSpeed Insights service, called directly from your browser. We do not store the URLs you test or the results on our servers. Your last results are kept in your browser’s session storage for 10 minutes so refreshing the page does not repeat the test.',
    },
    {
      question: 'The test failed or says the quota is busy. What can I do?',
      answer:
        'Google’s free API has a shared rate limit, so at busy times you may need to wait a minute and try again. If the error says the page could not be loaded, check that the address is correct, that the site is publicly reachable, and that a firewall or security plugin is not blocking Google’s Lighthouse user agent.',
    },
    {
      question: 'Can I test pages behind a login or on localhost?',
      answer:
        'No. Google’s servers have to be able to load the page, so it must be public. For staging sites, temporarily allow public access or run Lighthouse locally from Chrome DevTools.',
    },
  ],
});

// ---------------------------------------------------------------------------
// Mobile-Friendly Test
// ---------------------------------------------------------------------------

const MOBILE_TEST_PAGE = toolPage('mobile-friendly-test', {
  heading: 'Free Mobile-Friendly Test',
  intro:
    'See how your page looks and performs on a smartphone. We load it on an emulated phone with Google Lighthouse, show you a screenshot, and check the things that make or break a mobile visit: viewport, readable text, tap targets, content width, images and mobile speed.',
  tool: toolSection({
    url_label: text('URL: label', 'Page URL', { max: 60 }),
    url_placeholder: text('URL: placeholder', 'https://example.com', { max: 100 }),
    run: text('Run button', 'Test on mobile', { max: 30 }),
    running: text('Run button while testing', 'Testing…', { max: 30 }),
    verdict_yes: text('Verdict: mobile-friendly', 'Mobile-friendly', { max: 60 }),
    verdict_yes_body: textarea(
      'Verdict: mobile-friendly, explanation',
      'The page sets a responsive viewport and passes the critical layout checks Lighthouse reported.',
      { max: 400 },
    ),
    verdict_no: text('Verdict: not mobile-friendly', 'Not mobile-friendly', { max: 60 }),
    no_viewport: text('Verdict: no viewport tag', 'No working responsive viewport tag.', {
      max: 120,
    }),
    check_failed: text('Verdict: failed check', '{check}: failed', {
      max: 60,
      hint: '{check} becomes the name of the failed check.',
    }),
    verdict_unknown: text('Verdict: inconclusive', 'Inconclusive', { max: 60 }),
    verdict_unknown_body: textarea(
      'Verdict: inconclusive, explanation',
      'Lighthouse did not report the viewport check for this page, so we cannot give a verdict. Review the rows below or try again.',
      { max: 400 },
    ),
    tested: text('Results: when tested', 'Tested on an emulated phone {date}', {
      max: 80,
      hint: '{date} becomes the date and time of the test.',
    }),
    cached: text('Results: cached note', 'cached result (under 10 minutes old)', { max: 80 }),
    rerun: text('Re-run button', 'Re-run', { max: 30 }),
    full_report: text('Full report link', 'Full report on PageSpeed Insights', { max: 80 }),
    no_screenshot: text('Phone frame: no screenshot', 'No screenshot returned', { max: 80 }),
    layout_heading: text('Layout checks: heading', 'Mobile layout & usability', { max: 80 }),
    speed_heading: text('Speed checks: heading', 'Mobile speed (lab data)', { max: 80 }),
    speed_intro: text(
      'Speed checks: intro',
      'Measured by Lighthouse on a throttled mid-range phone.',
      { max: 200 },
    ),
    status_pass: text('Check result: pass', 'Pass', { max: 30 }),
    status_warn: text('Check result: needs work', 'Needs work', { max: 30 }),
    status_fail: text('Check result: fail', 'Fail', { max: 30 }),
    status_na: text('Check result: not applicable', 'Not applicable', { max: 30 }),
    status_missing: text('Check result: not reported', 'Not reported', { max: 30 }),
    missing_note: textarea(
      'Check not reported: note',
      'This Lighthouse version did not report this check, so it is not counted against the page.',
      { max: 300 },
    ),
    lighthouse_prefix: text('Lighthouse advice prefix', 'Lighthouse:', { max: 30 }),
    ...lighthouseFields(),
  }),
  steps: [
    {
      title: 'Enter your page URL',
      body: 'Paste the address of any public page. Test the pages customers land on most: home, services, contact and your top blog posts.',
    },
    {
      title: 'Google loads it on a phone',
      body: 'Lighthouse renders the page on an emulated mid-range phone over a throttled mobile connection. This takes 10–60 seconds.',
    },
    {
      title: 'Fix what fails',
      body: 'Read the verdict, then work through any failed or “needs work” rows. Each one explains what it means and how to fix it.',
    },
  ],
  guide: [
    {
      heading: 'Mobile-first indexing: why this matters for SEO',
      body: 'Google now crawls and indexes the web with a smartphone crawler. Whatever your site shows on a phone is what Google reads, ranks and shows in search results — the desktop version is effectively secondary. If content, links, structured data or images are missing or hidden on mobile, Google may not see them at all.\n\nThat makes a responsive, fast mobile site the baseline for ranking, especially for local searches like “plumber near me”, which happen overwhelmingly on phones.',
    },
    {
      heading: 'What makes a page mobile-friendly',
      body: '- **A responsive viewport.** Add `<meta name="viewport" content="width=device-width, initial-scale=1">` to the page head and use CSS that adapts to the screen width.\n- **Readable text.** Use a base font size of around 16px with comfortable line height; nobody should have to pinch-zoom to read.\n- **Comfortable tap targets.** Buttons and links need to be big enough for a thumb and spaced so people do not tap the wrong one.\n- **No sideways scrolling.** Fixed-width tables, wide images and embedded iframes are the usual causes of content spilling past the screen edge.\n- **Fast loading on mobile networks.** Phones have slower processors and connections than desktops, so heavy images and scripts hurt far more on mobile.\n- **No intrusive pop-ups.** Full-screen interstitials that cover content right after arriving from search frustrate users and can count against you.',
    },
    {
      heading: 'Mobile Core Web Vitals in plain English',
      body: 'Google’s Core Web Vitals are measured separately for mobile and desktop, and the mobile numbers are the ones that usually fail. Largest Contentful Paint (LCP) should be 2.5 seconds or less, Interaction to Next Paint (INP) 200 ms or less, and Cumulative Layout Shift (CLS) 0.1 or less, for at least 75% of real visits.\n\nThis test shows the lab versions (LCP, CLS and Total Blocking Time, which stands in for INP) and, when Google has enough traffic data, the real-user values from the Chrome UX Report. For a deeper performance breakdown with a list of fixes, run our [website speed test](/free-tools/website-speed-test).',
    },
    {
      heading: 'Google retired its own Mobile-Friendly Test — what now?',
      body: 'Google shut down its standalone Mobile-Friendly Test and the Search Console Mobile Usability report in late 2023, recommending Lighthouse instead. This tool uses exactly that: Google’s Lighthouse engine via the PageSpeed Insights API, with the mobile-relevant audits pulled together into one clear pass/fail view. Newer Lighthouse versions have also dropped some older audits (such as font size and tap targets); when an audit is not reported we say so instead of marking it as a failure.',
    },
  ],
  faqs: [
    {
      question: 'How is the mobile-friendly verdict decided?',
      answer:
        'A page is marked mobile-friendly when it has a working responsive viewport tag and none of the critical layout checks (legible font sizes, tap targets and content width) fail. Speed results and image checks are shown as improvements to make, but they do not on their own make a page “not mobile-friendly”.',
    },
    {
      question: 'Why do some checks say “not reported”?',
      answer:
        'Google keeps updating Lighthouse and has removed or renamed some mobile audits over time, such as font-size and tap-targets. If the version Google ran did not include a check, we show it as not reported rather than counting it against your page. Check those items by hand on a real phone.',
    },
    {
      question: 'What is the difference between lab data and field data?',
      answer:
        'Lab data is a single simulated load on Google’s servers using an emulated phone and throttled network; it is consistent and good for debugging. Field data comes from real Chrome users over the past 28 days (the Chrome UX Report) and reflects their actual devices and connections. Google uses field data for rankings, so treat it as the final word and use lab data to diagnose problems.',
    },
    {
      question: 'Why do my results change between runs?',
      answer:
        'Each run loads your page from scratch. Server response time, network conditions, ads and third-party scripts, and the load on Google’s test machines all vary, so speed metrics can move noticeably between runs. Layout checks like the viewport are stable. Run the test two or three times before drawing conclusions about speed.',
    },
    {
      question: 'My site looks fine on my phone. Why does it fail?',
      answer:
        'Your phone is probably faster and on a better connection than the mid-range device Lighthouse emulates, and you may have the site cached. The test also checks things you might not notice, like small tap targets or a small amount of sideways scrolling. Try the page on an older Android phone over mobile data to see what many visitors see.',
    },
    {
      question: 'Does being mobile-friendly improve rankings?',
      answer:
        'Google ranks the mobile version of your site, and page experience, including Core Web Vitals, is part of its ranking systems. Being mobile-friendly will not outrank better content on its own, but a poor mobile experience can hold good content back and drives visitors away before they contact you.',
    },
    {
      question: 'Is the URL I test saved anywhere?',
      answer:
        'No. The test runs from your browser straight to Google’s PageSpeed Insights API; our servers do not see or store the URL or results. The last result is cached in your browser for 10 minutes so a refresh does not run the test again.',
    },
  ],
});

// ---------------------------------------------------------------------------
// Keyword Density Checker
// ---------------------------------------------------------------------------

const KEYWORD_DENSITY_PAGE = toolPage('keyword-density-checker', {
  heading: 'Keyword Density Checker',
  intro:
    'Paste an article or a page’s HTML and instantly see which words and phrases it repeats most, how often your target keyword appears, and whether it is in the title and opening. Everything runs in your browser, so your content never leaves your device.',
  tool: toolSection({
    content_label: text('Content: label', 'Paste your content', { max: 60 }),
    sample: text('“Try a sample” button', 'Try a sample', { max: 30 }),
    clear: text('“Clear” button', 'Clear', { max: 30 }),
    content_placeholder: text(
      'Content: placeholder',
      'Paste article text, or the full HTML source of a page (View source → copy all).',
      { max: 200 },
    ),
    content_hint: textarea(
      'Content: hint',
      'Plain text or HTML. HTML is cleaned in your browser: scripts, styles and markup are removed. Nothing is uploaded.',
      { max: 300 },
    ),
    keyword_label: text('Target keyword: label', 'Target keyword', { max: 60 }),
    keyword_placeholder: text('Target keyword: placeholder', 'e.g. local SEO', { max: 60 }),
    title_label: text('Page title: label', 'Page title', { max: 60 }),
    title_placeholder: text('Page title: placeholder', 'Your page’s <title> or H1', { max: 80 }),
    optional: text('“Optional” marker', '(optional)', { max: 30 }),
    html_detected: text(
      'HTML detected: heading',
      'HTML detected: analysing the visible body text',
      { max: 120 },
    ),
    title_tag: text('HTML detected: title tag label', 'Title tag:', { max: 40 }),
    meta_description: text('HTML detected: description label', 'Meta description:', {
      max: 40,
    }),
    none_found: text('HTML detected: nothing found', 'none found', { max: 40 }),
    stat_words: text('Figure: words', 'Words', { max: 30 }),
    stat_unique: text('Figure: unique words', 'Unique words', { max: 30 }),
    stat_characters: text('Figure: characters', 'Characters', { max: 30 }),
    stat_sentences: text('Figure: sentences', 'Sentences', { max: 30 }),
    stat_reading: text('Figure: reading time', 'Reading time', { max: 30 }),
    keyword_heading: text('Keyword report: heading', 'Target keyword:', { max: 60 }),
    found: text('Keyword check: phrase used', 'The exact phrase appears in your content.', {
      max: 200,
    }),
    not_found: text(
      'Keyword check: phrase not used',
      'The exact phrase does not appear. Add it where it reads naturally, or check the spelling.',
      { max: 200 },
    ),
    in_title: text('Keyword check: in the title', 'It appears in the title.', { max: 200 }),
    not_in_title: text(
      'Keyword check: not in the title',
      'It is not in the title. Most pages benefit from the main topic in the title.',
      { max: 200 },
    ),
    no_title: text(
      'Keyword check: no title given',
      'Add a title above (or paste HTML with a <title>) to check it.',
      { max: 200 },
    ),
    in_opening: text(
      'Keyword check: in the first 100 words',
      'It appears within the first 100 words.',
      { max: 200 },
    ),
    not_in_opening: text(
      'Keyword check: not in the first 100 words',
      'It is not in the first 100 words. Mentioning the topic early helps readers and search engines.',
      { max: 200 },
    ),
    stuffing: text(
      'Keyword check: density above 3%',
      'Above 3% can read as keyword stuffing. Try synonyms, pronouns or related terms in some places.',
      { max: 200 },
    ),
    keyword_note: textarea(
      'Keyword report: note',
      'Keyword density is not a Google ranking factor and there is no ideal percentage. Use it as a sanity check: write for the reader, cover the topic fully, and make sure the phrase is not repeated unnaturally.',
      { max: 400 },
    ),
    phrases_heading: text('Phrases: heading', 'Top phrases', { max: 60 }),
    col_keyword: text('Phrases table: keyword column', 'Keyword', { max: 30 }),
    col_phrase: text('Phrases table: phrase column', 'Phrase', { max: 30 }),
    col_count: text('Phrases table: count column', 'Count', { max: 30 }),
    col_density: text('Phrases table: density column', 'Density', { max: 30 }),
    col_in_title: text('Phrases table: in-title column', 'In title', { max: 30 }),
    no_keywords: text(
      'Phrases: nothing yet (one word)',
      'No keywords yet. Paste some content above.',
      { max: 120 },
    ),
    no_phrases: text(
      'Phrases: nothing yet (2–3 words)',
      'No {n}-word phrase appears more than once yet.',
      { max: 120, hint: '{n} becomes 2 or 3.' },
    ),
    phrases_note: textarea(
      'Phrases: note',
      '**Density** = times the phrase appears ÷ total words × 100. Common words such as “the” and “and” are skipped as keywords, and phrases that start or end with one are left out. Numbers and single letters are not counted. Up to 50 phrases are shown; 2- and 3-word phrases must appear at least twice.',
      { max: 600, hint: RICH_HINT },
    ),
  }),
  steps: [
    {
      title: 'Paste your content',
      body: 'Paste plain text, or the full HTML source of a page. HTML is stripped of scripts, styles and tags automatically, and the title tag is picked up for you.',
    },
    {
      title: 'Add a target keyword',
      body: 'Optionally enter the phrase the page should rank for and its title. The tool shows how often the phrase is used, its density and where it appears.',
    },
    {
      title: 'Review the top phrases',
      body: 'Switch between one-, two- and three-word tabs to see what the page is really about, spot accidental repetition and find topics you have missed.',
    },
  ],
  guide: [
    {
      heading: 'What keyword density actually measures',
      body: 'Keyword density is the share of a text taken up by one word or phrase. This tool uses the common formula: the number of times a phrase appears, divided by the total number of words, multiplied by 100. A 500-word page that uses “plumber in Karachi” five times has a density of 1% for that phrase.\n\nNumbers and single letters are not counted as words, and very common words such as “the”, “and” and “for” are ignored as keywords. Phrases never run across the end of a sentence or a heading, so the counts reflect phrases a reader would actually see.',
    },
    {
      heading: 'Is there an ideal keyword density?',
      body: 'No. Google has said for years that it does not use keyword density as a ranking signal, and no percentage guarantees rankings. Modern search engines understand synonyms and topics, so a page can rank for a phrase it uses only once or twice.\n\nWhat density is good for is spotting extremes. If a single phrase is above roughly 3% of a normal-length page, the copy usually reads as forced and can look like keyword stuffing, which Google’s spam policies do penalise. If your main topic never appears at all, the page may not be clear about what it offers.',
    },
    {
      heading: 'How to use the phrase tables',
      body: 'The one-word tab shows the vocabulary of the page. The two- and three-word tabs are usually more revealing: they surface the phrases a search engine is most likely to associate with the page, such as “SEO audit” or “Google Business Profile”.\n\nCompare the top phrases with what you want the page to rank for. If the list is dominated by your brand name, generic words or a phrase you did not intend, rewrite those passages. The “in title” column shows which repeated phrases also appear in the title, the strongest on-page relevance signal you control.',
    },
    {
      heading: 'Better than density: placement and coverage',
      body: 'Put the main topic in the title tag, the H1 and early in the opening paragraph, which this tool checks for you within the first 100 words. After that, focus on covering the questions a searcher has: prices, locations, timings, comparisons and proof such as reviews.\n\nFor local businesses, naturally mentioning your city or area alongside the service (for example “bridal makeup in DHA Lahore”) matters more than repeating the service name. Variations and related terms make the copy read better and widen the range of searches the page can appear for.',
    },
  ],
  faqs: [
    {
      question: 'How is keyword density calculated?',
      answer:
        'Density = (number of times the phrase appears ÷ total words) × 100. The same total is used for one-, two- and three-word phrases, so a two-word phrase used 10 times in 1,000 words has a density of 1%.',
    },
    {
      question: 'What is a good keyword density for SEO?',
      answer:
        'There is no ideal number and density is not a Google ranking factor. Most well-written pages land between about 0.5% and 2.5% for their main phrase without trying. Above about 3% the text often reads as repetitive and may be treated as keyword stuffing.',
    },
    {
      question: 'Can I check a live web page?',
      answer:
        'Yes. Open the page, view its source (Ctrl+U or Cmd+Option+U), copy everything and paste it in. The tool detects HTML, removes scripts, styles and markup, analyses the visible text and reads the title and meta description.',
    },
    {
      question: 'Why are words like “the” and “and” missing?',
      answer:
        'They are stopwords: very common words that say nothing about the topic. They are skipped as single keywords, and two- or three-word phrases that start or end with one are left out, but they still count towards the total word count.',
    },
    {
      question: 'Why does a phrase I used once not appear in the 2- and 3-word tabs?',
      answer:
        'Multi-word phrases are only listed when they appear at least twice. A phrase used once is not a pattern, and including every one-off combination would bury the useful results.',
    },
    {
      question: 'Is my content stored or sent anywhere?',
      answer:
        'No. The analysis runs entirely in your browser with JavaScript. Nothing you paste is uploaded, saved or logged, so it is safe to check unpublished drafts.',
    },
    {
      question: 'Does it work with languages other than English?',
      answer:
        'Word counting, phrases and density work with any language that separates words with spaces, including Urdu written in Unicode and Roman Urdu. The stopword list is English, so common words in other languages will still show up in the results.',
    },
    {
      question: 'How is reading time estimated?',
      answer:
        'Reading time assumes an average adult silent reading speed of about 200 words per minute, rounded up to the next minute.',
    },
  ],
});

// ---------------------------------------------------------------------------
// URL Slug Generator
// ---------------------------------------------------------------------------

const URL_SLUG_PAGE = toolPage('url-slug-generator', {
  heading: 'URL Slug Generator',
  intro:
    'Convert any headline, product name or page title into a short, readable, SEO-friendly URL slug. Strip punctuation and emoji, transliterate accents, keep Urdu or Arabic words if you want them, and generate slugs for a whole list at once. It all runs in your browser.',
  tool: toolSection({
    text_label: text('Text: label', 'Text to slugify', { max: 60 }),
    bulk: text('Bulk mode: label', 'Bulk mode (one slug per line)', { max: 80 }),
    placeholder: text('Text: placeholder', 'Paste a headline or page title', { max: 100 }),
    placeholder_bulk: text('Text: placeholder in bulk mode', 'One title per line', { max: 100 }),
    separator: text('Separator: label', 'Separator', { max: 40 }),
    hyphen: text('Separator: hyphen', 'Hyphen (-) — recommended', { max: 60 }),
    underscore: text('Separator: underscore', 'Underscore (_)', { max: 60 }),
    lowercase: text('Option: lowercase', 'Lowercase', { max: 60 }),
    stop_words: text('Option: stop words', 'Remove stop words', { max: 60 }),
    stop_words_hint: text('Option: stop words, hint', 'a, the, and, of, in…', { max: 100 }),
    transliterate: text('Option: transliterate', 'Transliterate accents', { max: 60 }),
    transliterate_hint: text('Option: transliterate, hint', 'é → e, ß → ss, ł → l', {
      max: 100,
    }),
    non_latin: text('Option: non-Latin scripts', 'Keep non-Latin scripts', { max: 60 }),
    non_latin_hint: text('Option: non-Latin scripts, hint', 'Urdu, Arabic, Hindi, Cyrillic…', {
      max: 100,
    }),
    limit: text('Option: limit length', 'Limit length', { max: 60 }),
    limit_hint: text(
      'Option: limit length, hint',
      'Cuts at a word boundary. Around {max} characters or fewer is a good target.',
      { max: 200, hint: '{max} becomes the recommended maximum (60).' },
    ),
    base_label: text('Preview base URL: label', 'Preview base URL', { max: 60 }),
    base_placeholder: text('Preview base URL: placeholder', 'https://example.com/blog/', {
      max: 100,
    }),
    result_heading: text('Result: heading', 'Your slug', { max: 60 }),
    result_heading_bulk: text('Result: heading in bulk mode', 'Slugs ({count})', {
      max: 60,
      hint: '{count} becomes the number of slugs.',
    }),
    copy: text('Copy button', 'Copy', { max: 30 }),
    copy_all: text('Copy all button', 'Copy all', { max: 30 }),
    copied: text('Copy buttons after copying', 'Copied', { max: 30 }),
    empty_prompt: text('Result: no text yet', 'Type some text to generate a slug.', {
      max: 200,
    }),
    empty_result: text(
      'Result: nothing usable',
      'Nothing left to use as a slug. Try turning on “Keep non-Latin scripts”.',
      { max: 200 },
    ),
    empty_slug: text('Result: empty slug', '(empty)', { max: 30 }),
    length: text('Result: length', '{count} characters', {
      max: 60,
      hint: '{count} becomes the slug’s length.',
    }),
    too_long: text('Result: too long', 'over {max}, consider shortening', {
      max: 100,
      hint: '{max} becomes the recommended maximum (60).',
    }),
  }),
  steps: [
    {
      title: 'Paste your title',
      body: 'Type or paste a headline. Turn on bulk mode to paste many titles, one per line, and get one slug for each.',
    },
    {
      title: 'Adjust the options',
      body: 'Pick a separator, remove stop words, transliterate accents, keep non-Latin scripts, or cap the length at a word boundary.',
    },
    {
      title: 'Copy the slug',
      body: 'Check the character count and the full URL preview, then copy a single slug or copy all of them at once.',
    },
  ],
  guide: [
    {
      heading: 'What makes a good URL slug',
      body: 'The slug is the part of a URL that identifies a page, such as `best-restaurants-in-lahore`. Good slugs are short, lowercase, use hyphens between words and describe the page in a few keywords. People see them in search results and shared links, so a readable slug builds trust and can improve click-through.\n\nKeep the main keyword, drop filler, and avoid dates or numbers that will go stale (for example `/seo-checklist` ages better than `/seo-checklist-2026`). Around 3–6 words, or under about 60 characters, is a practical target.',
    },
    {
      heading: 'Hyphens, not underscores',
      body: 'Google treats a hyphen as a word separator, so `red-shoes` reads as “red shoes”. Underscores join words, so `red_shoes` may be read as a single term. Use hyphens for new URLs; there is no need to change existing underscore URLs only for this reason.',
    },
    {
      heading: 'Accents, apostrophes and non-English slugs',
      body: 'Transliteration turns `Café Crème` into `cafe-creme` and `Straße` into `strasse`. Apostrophes are removed rather than replaced, so `Google’s` becomes `googles` instead of the awkward `google-s`.\n\nUrdu, Arabic, Hindi and other scripts are valid in URLs and Google indexes them well. Browsers show them as readable text, though they are percent-encoded when copied in some apps. If your audience searches in Urdu, an Urdu slug can be the right choice; if links are mostly shared in English contexts, an English slug is easier to type and share.',
    },
    {
      heading: 'Changing slugs on live pages',
      body: 'Choose slugs carefully before publishing, because changing one later breaks existing links and bookmarks. If you must change a slug, add a 301 redirect from the old URL to the new one and update your internal links and sitemap so search engines pass the old page’s signals to the new address.',
    },
  ],
  faqs: [
    {
      question: 'What is a URL slug?',
      answer:
        'It is the readable part of a URL after the domain or folder that identifies a specific page, for example “url-slug-generator” in /free-tools/url-slug-generator. It is usually created from the page title.',
    },
    {
      question: 'How long should a URL slug be?',
      answer:
        'There is no hard limit, but short slugs are easier to read and share and are less likely to be cut off in search results. Aim for 3–6 meaningful words, roughly 60 characters or less.',
    },
    {
      question: 'Should I remove stop words like “the” and “and”?',
      answer:
        'Often yes, because they add length without meaning. Keep them when removing them changes the meaning or makes the slug hard to read. This tool never removes stop words if nothing else would be left.',
    },
    {
      question: 'Should I use hyphens or underscores in URLs?',
      answer:
        'Use hyphens. Google recommends hyphens to separate words in URLs, while underscores can cause words to be read as one term.',
    },
    {
      question: 'Can I use Urdu or Arabic characters in a slug?',
      answer:
        'Yes. Modern browsers and search engines support Unicode URLs. Turn on “Keep non-Latin scripts” to keep them. They are percent-encoded behind the scenes, so in some places they appear as long %D8%… strings.',
    },
    {
      question: 'Should I include the year in a slug?',
      answer:
        'Usually not. A year in the URL makes evergreen content look outdated and forces a redirect when you update it. Put the year in the title instead, which you can change without breaking links.',
    },
    {
      question: 'Does changing a slug hurt SEO?',
      answer:
        'It can temporarily, because the old URL’s links and history must transfer to the new one. Always set up a 301 redirect from the old slug and update internal links to limit the impact.',
    },
    {
      question: 'Is this slug generator free?',
      answer:
        'Yes, it is free with no sign-up and no limits. Slugs are generated in your browser, so your text is never sent to a server.',
    },
  ],
});

export const TOOLS_PAGES = {
  free_tools: FREE_TOOLS_PAGE,
  tool_speed_test: SPEED_TEST_PAGE,
  tool_mobile_friendly: MOBILE_TEST_PAGE,
  tool_keyword_density: KEYWORD_DENSITY_PAGE,
  tool_meta_tags: META_TAGS_PAGE,
  tool_schema_markup: SCHEMA_PAGE,
  tool_robots_txt: ROBOTS_PAGE,
  tool_url_slug: URL_SLUG_PAGE,
};
