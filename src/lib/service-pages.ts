import type { IconName } from '@/components/icon';
import { CORE_PAGES, TECHNICAL_PAGES } from '@/lib/services/core';
import { LINKS_AI_PAGES } from '@/lib/services/links-ai';
import { PLATFORM_ECOMMERCE_PAGES } from '@/lib/services/platform-ecommerce';
import { SPECIALTY_PAGES } from '@/lib/services/specialty';
import { INDUSTRY_PAGES_1 } from '@/lib/services/industries-1';
import { INDUSTRY_PAGES_2 } from '@/lib/services/industries-2';
import { INDUSTRY_PAGES_3 } from '@/lib/services/industries-3';
import { INDUSTRY_PAGES_4 } from '@/lib/services/industries-4';

/**
 * The SEO and digital marketing service pages: one list that drives each page
 * (/seo-services/<slug> and /digital-marketing), the /seo-services hub cards, the
 * header's Services menu, the OfferCatalog JSON-LD and the sitemap.
 */

export type ServiceCategoryId = 'seo' | 'links' | 'marketing';

/** Section on the /seo-services hub. */
export type HubCategoryId =
  'core' | 'technical' | 'links' | 'ai' | 'platform' | 'ecommerce' | 'specialty' | 'industry';

export type ServicePage = {
  slug: string;
  /** Public URL path, e.g. /seo-services/local-seo. */
  path: string;
  /** Short name for cards, breadcrumbs and schema. */
  name: string;
  /** Meta title, without the brand suffix (the root layout adds it). */
  title: string;
  /** Meta description. */
  description: string;
  h1: string;
  /** Answer-first definition shown under the H1. */
  intro: string;
  icon: IconName;
  /** Column in the header's Services menu. */
  category: ServiceCategoryId;
  /** Section on the /seo-services hub. */
  hub: HubCategoryId;
  /** Short badge on the hub card. */
  tag: string;
  includes: { title: string; body: string }[];
  steps?: { title: string; body: string }[];
  /** Visible on the page only; there is deliberately no FAQPage markup. */
  faq: { q: string; a: string }[];
  ctaLabel: string;
  ctaHref: string;
  /** Slugs of sibling services. */
  related: string[];
  guides: { label: string; href: string }[];
};

const SEO_QUOTE = '/contact?subject=SEO%20services';
const SEO_GUIDES = { label: 'SEO guides and how-tos', href: '/blog/seo' };
const MARKETING_GUIDES = { label: 'Digital marketing guides', href: '/blog/digital-marketing' };

/** The original service pages: the only ones in the header menu and on /digital-marketing. */
export const MENU_SERVICE_PAGES: ServicePage[] = [
  {
    slug: 'local-seo',
    path: '/seo-services/local-seo',
    name: 'Local SEO',
    title: 'Local SEO Services | Get Found in Local Search',
    description:
      'Improve your local visibility with optimized business listings, local SEO, citations, content and review-building strategies that bring nearby customers to you.',
    h1: 'Local SEO services',
    intro:
      'Local SEO is the work of making a business easy to find when people search for it by place, such as "plumber near me" or "dentist in Dubai". As a local SEO agency we combine accurate listings, consistent citations, location pages and reviews so search engines trust your business for the area you serve and customers can contact you quickly.',
    icon: 'location_on',
    category: 'seo',
    hub: 'core',
    tag: 'Most Popular',
    includes: [
      {
        title: 'Business listing clean-up',
        body: 'We check your name, address and phone details across directories and maps, fix inconsistencies and complete the listings that matter for your market. Duplicate and outdated entries are merged or removed, and opening hours and categories are kept accurate.',
      },
      {
        title: 'Local search optimization',
        body: 'Categories, services, descriptions, photos and posts are set up so your profile matches how customers search in your area. We also check attributes and service lists, so the profile answers common questions before anyone needs to call.',
      },
      {
        title: 'Citations and directory listings',
        body: 'Relevant, trusted citations that confirm who you are and where you operate, without bulk submissions to low-quality sites. We prioritise general, industry and regional directories where your customers actually look, and record each one so details stay consistent.',
      },
      {
        title: 'Location and service pages',
        body: 'Pages written for each city or service area you cover, with real local detail rather than copied templates. Each page covers the services offered there, local proof such as projects or reviews, and a clear way to call or book.',
      },
      {
        title: 'Review strategy',
        body: 'A simple, honest process for asking happy customers for reviews and replying to them, in line with each platform’s rules. We draft guidance for answering positive and negative feedback and suggest the right moment to ask after a job or visit.',
      },
      {
        title: 'Local rankings and call tracking',
        body: 'We track visibility in map and organic results across the places you serve, not just one central point. Calls, direction requests and form fills are tied back to your profile and pages, so you can see which areas bring real enquiries.',
      },
    ],
    steps: [
      {
        title: 'Local audit',
        body: 'We review your listings, site and local rankings to see where you appear and where you do not. We also compare your profile with the businesses that show up ahead of you in nearby searches.',
      },
      {
        title: 'Fix and build',
        body: 'We correct listing data, improve key pages and add the citations and content that are missing. Quick corrections go first, so wrong details stop confusing customers and search engines.',
      },
      {
        title: 'Grow reviews and local links',
        body: 'We set up the review process and look for local links, such as sponsorships, chambers and community sites, that confirm your connection to the area you serve.',
      },
      {
        title: 'Track and refine',
        body: 'We report on local visibility, calls and visits, then adjust what we do based on what is moving. You get a plain monthly summary rather than a list of raw positions.',
      },
    ],
    faq: [
      {
        q: 'What is local SEO?',
        a: 'Local SEO helps a business appear in results for searches tied to a location, including map results and "near me" queries. It relies on accurate listings, relevant content, reviews and links, and it suits any business that serves people in a defined area.',
      },
      {
        q: 'Is local SEO right for my business?',
        a: 'If customers find you by city, neighbourhood or "near me" searches, it usually is. It is SEO for a local business that serves a defined area, whether you have one shop or several branches. Online-only sellers often need a broader approach.',
      },
      {
        q: 'How long does local SEO take?',
        a: 'Fixing listings can show results within weeks, while competitive markets take longer. We cannot promise specific rankings, but we will show you what changed and how visibility is moving. Review volume, the strength of local competitors and the state of your current profile all affect the pace.',
      },
      {
        q: 'Can you help a business with several locations?',
        a: 'Yes. Each branch needs its own listing, its own page and its own reviews, with consistent branding across them. We set up a repeatable structure, so new locations can be added without duplicating content or confusing search engines about which branch is which.',
      },
      {
        q: 'Do I need a shop front to rank locally?',
        a: 'Not always. Service-area businesses that travel to customers can still rank, but platform rules differ on showing or hiding an address. We check the current guidelines for your business type and set up your profile to follow them, so it is not suspended.',
      },
    ],
    ctaLabel: 'Get Local SEO Audit',
    ctaHref: '/seo-audit',
    related: ['on-page-seo', 'link-building', 'content-marketing'],
    guides: [
      SEO_GUIDES,
      { label: 'Business directory guides', href: '/blog/business-directory' },
      { label: 'Meta Tags & SERP Preview tool', href: '/free-tools/meta-tag-generator' },
    ],
  },
  {
    slug: 'technical-seo',
    path: '/seo-services/technical-seo',
    name: 'Technical SEO',
    title: 'Technical SEO Services | Fix & Grow Your Website',
    description:
      'Improve crawlability, indexing, site speed, Core Web Vitals, architecture and structured data with technical SEO fixes ranked by impact and explained clearly.',
    h1: 'Technical SEO services',
    intro:
      'Technical SEO makes sure search engines can crawl, understand and index your website, and that visitors get a fast, stable page. As a technical SEO agency we find the problems holding a site back, fix them in priority order and explain each change in plain language, so your team knows what was done and why.',
    icon: 'build',
    category: 'seo',
    hub: 'technical',
    tag: 'Foundation',
    includes: [
      {
        title: 'Crawl and indexing review',
        body: 'We check what search engines can reach and what they actually index, then resolve blocked pages, duplicates and wasted crawl paths. Robots rules, sitemaps and status codes are checked against your real page list, so nothing important is hidden by accident.',
      },
      {
        title: 'Site speed and Core Web Vitals',
        body: 'Loading, interactivity and layout stability are measured on real pages, with specific fixes for images, scripts and server response. We separate lab test results from field data, so effort goes into problems your visitors actually experience.',
      },
      {
        title: 'Site architecture and internal links',
        body: 'Clear URL structure and internal linking so important pages are easy to find and authority flows to them. We look for orphan pages, deep click paths and confusing navigation, then suggest changes that fit how your site is built.',
      },
      {
        title: 'Structured data',
        body: 'Valid schema markup for the content types you publish, so search engines read your pages accurately. We test each template for errors and only mark up what is visible on the page, which keeps the markup honest and eligible for rich results.',
      },
      {
        title: 'Mobile and security checks',
        body: 'Mobile usability, HTTPS, redirects and canonical tags reviewed and corrected. We trace redirect chains, mixed-content warnings and conflicting canonical signals, since small mistakes there can quietly split ranking signals across several versions of the same page.',
      },
      {
        title: 'Monitoring after release',
        body: 'Scheduled crawls and Search Console checks catch new errors after releases, migrations or plugin updates. You receive a short note when something breaks, with the affected URLs and a suggested fix, so small issues do not grow unnoticed for months.',
      },
    ],
    steps: [
      {
        title: 'Crawl and test',
        body: 'We crawl the site and test speed and mobile usability to build a full picture of the issues. Search Console and server data are checked alongside, so we see what Google reports as well.',
      },
      {
        title: 'Prioritised fix list',
        body: 'Problems are ranked by impact and effort, so the most valuable fixes go first. Each item states the affected pages, why it matters and what a developer needs to change.',
      },
      {
        title: 'Implement and verify',
        body: 'We make or hand over the fixes, then re-crawl to confirm they worked. Anything that did not behave as expected goes back on the list with notes on what we found.',
      },
      {
        title: 'Monitor and maintain',
        body: 'Scheduled crawls and alerts keep running, so regressions from new releases are caught early and the technical foundation stays healthy as the site grows.',
      },
    ],
    faq: [
      {
        q: 'What does technical SEO cover?',
        a: 'Crawling, indexing, site speed, Core Web Vitals, mobile usability, redirects, canonical tags, sitemaps, structured data and site architecture. In short, it covers everything that decides whether search engines can reach, read and trust your pages before content quality comes into play.',
      },
      {
        q: 'Can I check some of this myself first?',
        a: 'Yes. Our free website speed test, mobile-friendly test and schema markup generator cover the basics, and we pick up from there. They will not catch every issue, but they show whether speed, mobile layout and markup need attention before a full audit.',
      },
      {
        q: 'Will you edit my website directly?',
        a: 'That depends on your setup. We can work with your developers using clear tickets, or make changes ourselves where you give us access. Either way, changes are documented and tested on a staging copy where one exists, so live pages are not put at risk.',
      },
      {
        q: 'How do I know if I have a technical SEO problem?',
        a: 'Common signs are pages missing from search results, traffic dropping after a redesign or migration, slow loading on phones, and Search Console warnings about coverage or experience. An audit confirms the cause, since several different issues can produce the same symptoms.',
      },
      {
        q: 'Is technical SEO a one-off project?',
        a: 'The first round of fixes is usually a project, but sites change constantly. New templates, plugins and content can reintroduce errors, so periodic checks are sensible. How often depends on how frequently your site changes and how large it is.',
      },
    ],
    ctaLabel: 'Request SEO Audit',
    ctaHref: '/seo-audit',
    related: ['on-page-seo', 'local-seo', 'content-marketing'],
    guides: [
      SEO_GUIDES,
      { label: 'Website Speed Test', href: '/free-tools/website-speed-test' },
      { label: 'Mobile-Friendly Test', href: '/free-tools/mobile-friendly-test' },
      { label: 'Schema Markup Generator', href: '/free-tools/schema-markup-generator' },
    ],
  },
  {
    slug: 'on-page-seo',
    path: '/seo-services/on-page-seo',
    name: 'On-Page SEO',
    title: 'On-Page SEO Services | Optimize Your Website',
    description:
      'Build stronger pages with search intent research, keyword targeting, clear content structure, internal links, titles and meta descriptions that earn clicks.',
    h1: 'On-page SEO services',
    intro:
      'On-page SEO is the work done on the pages of your own site: matching each page to what searchers want, and getting titles, headings, content and internal links right. As an on-page SEO agency we focus on pages that can earn traffic and leads, written for people first and refined for search engines second.',
    icon: 'fact_check',
    category: 'seo',
    hub: 'technical',
    tag: 'On-Page',
    includes: [
      {
        title: 'Keyword and intent mapping',
        body: 'Each page is matched to one clear search intent, so pages support each other instead of competing. We note where two pages chase the same query and decide whether to merge, differentiate or redirect them.',
      },
      {
        title: 'Titles and meta descriptions',
        body: 'Clear, accurate titles and descriptions that earn the click and reflect what the page delivers. We keep them within display limits, lead with the main topic and write them as honest invitations rather than lists of keywords.',
      },
      {
        title: 'Headings and content structure',
        body: 'Answer-first copy, logical headings and scannable sections that serve readers and search engines. We add the missing detail competitors cover, such as examples, comparisons and common questions, so the page becomes the most useful result on its topic.',
      },
      {
        title: 'Internal linking',
        body: 'Links between related pages with descriptive anchor text, so visitors and crawlers can follow the topic. We add links from strong pages to the ones that need support and fix links pointing at redirected or removed URLs.',
      },
      {
        title: 'Images and schema',
        body: 'Alt text, file sizes and structured data that support the page’s content. Images are named and compressed sensibly, and markup is added only for content visible on the page, so nothing misleads visitors or search engines.',
      },
      {
        title: 'Conversion-focused page elements',
        body: 'Traffic only helps if visitors act, so we review calls to action, trust signals, forms and layout alongside the SEO changes. Suggestions are small and testable, such as clearer buttons or proof placed near the decision point.',
      },
    ],
    steps: [
      {
        title: 'Page review',
        body: 'We look at your key pages against search intent and the results that currently rank. Search Console data shows which queries each page already earns impressions for.',
      },
      {
        title: 'Optimization plan',
        body: 'You get page-by-page recommendations for titles, structure, content and links. Each is ordered by likely benefit, so you can approve the biggest improvements first.',
      },
      {
        title: 'Apply the changes',
        body: 'We make the edits ourselves or give your editors clear instructions, keeping tone, facts and branding consistent with the rest of your site.',
      },
      {
        title: 'Measure and improve',
        body: 'We watch impressions, clicks and rankings after each change to see what worked, then plan the next round on the pages with the most potential.',
      },
    ],
    faq: [
      {
        q: 'What is the difference between on-page and off-page SEO?',
        a: 'On-page SEO covers what is on your own pages, such as content, titles and internal links. Off-page SEO covers signals from elsewhere, mainly links and mentions from other websites. Most sites need both, but on-page work is fully in your control.',
      },
      {
        q: 'Do you rewrite my content?',
        a: 'Where it helps, yes. Sometimes a title or heading change is enough, and sometimes a page needs a fuller rewrite. We tell you which before we start, and we keep your brand voice and any facts that must stay accurate or compliant.',
      },
      {
        q: 'Can I try some on-page checks myself?',
        a: 'Yes. The meta tags tool with a live SERP preview and the keyword density checker are free to use. They help you spot missing titles, overlong descriptions and heavy repetition, though they cannot judge search intent, which is where a page-by-page review adds value.',
      },
      {
        q: 'How many keywords should a page target?',
        a: 'There is no fixed number. A page should focus on one main topic and the closely related phrases people use for it. Covering unrelated topics on one page weakens it, so we map separate searches to separate pages where the intent differs.',
      },
      {
        q: 'Will changing my page titles hurt my rankings?',
        a: 'Title changes can move rankings in either direction, which is why we update them deliberately, starting with pages that have clear weaknesses. We record the old versions and watch the results, so a change that backfires can be reversed quickly.',
      },
    ],
    ctaLabel: 'Request SEO Audit',
    ctaHref: '/seo-audit',
    related: ['technical-seo', 'content-marketing', 'off-page-seo'],
    guides: [
      SEO_GUIDES,
      { label: 'Meta Tags & SERP Preview', href: '/free-tools/meta-tag-generator' },
      { label: 'Keyword Density Checker', href: '/free-tools/keyword-density-checker' },
    ],
  },
  {
    slug: 'off-page-seo',
    path: '/seo-services/off-page-seo',
    name: 'Off-Page SEO',
    title: 'Off-Page SEO Services | Build Website Authority',
    description:
      'Strengthen your website authority with ethical off-page SEO: backlink reviews, digital PR, relevant link acquisition, outreach and brand mention building.',
    h1: 'Off-page SEO services',
    intro:
      'Off-page SEO covers the signals that come from outside your website, mainly links, brand mentions and citations from other trusted sites. We build that authority ethically, with relevant outreach and useful content, and avoid the shortcuts that put rankings at risk. The aim is a reputation that search engines can verify across the web.',
    icon: 'public',
    category: 'seo',
    hub: 'technical',
    tag: 'Off-Page',
    includes: [
      {
        title: 'Backlink profile review',
        body: 'We look at who links to you and to your competitors, and flag risky or low-value links. The review covers anchor text patterns, lost links and sudden spikes, so we know whether to build, clean up or simply monitor.',
      },
      {
        title: 'Link acquisition',
        body: 'Relevant links earned through outreach and genuinely useful resources, in line with search engine guidelines. We pitch pages that deserve links, such as guides, data and tools, to sites whose audiences would genuinely benefit from them.',
      },
      {
        title: 'Digital PR',
        body: 'Story ideas and data-led content that give publishers a reason to mention and link to you. We look for angles tied to news, seasonal interest or original research your business can credibly offer, then pitch them to journalists and editors.',
      },
      {
        title: 'Brand mentions and citations',
        body: 'Consistent, accurate mentions of your business on credible sites and directories. We also find unlinked mentions of your brand and politely ask publishers whether they would add a link where that makes sense for readers.',
      },
      {
        title: 'Competitor gap analysis',
        body: 'We find the sites that link to similar businesses but not to you, and decide which are worth approaching. Each target is rated by relevance and effort, so the plan starts with achievable wins rather than unrealistic names.',
      },
      {
        title: 'Risky link clean-up',
        body: 'Where the review finds manipulative or spammy links that could cause harm, we document them and advise whether to ignore, request removal or disavow. We only recommend the disavow tool when there is a real reason, since it is rarely needed.',
      },
    ],
    steps: [
      {
        title: 'Authority audit',
        body: 'We review your current links and mentions against the sites you compete with. The result is a clear picture of your strengths, gaps and any links that need attention.',
      },
      {
        title: 'Outreach plan',
        body: 'We choose realistic targets and the content or angle that gives each one a reason to link. You approve the shortlist and the assets before any outreach begins.',
      },
      {
        title: 'Outreach',
        body: 'We contact editors, publishers and site owners with personal messages, follow up politely and keep a record of every conversation and outcome.',
      },
      {
        title: 'Report and refine',
        body: 'We report on the links and mentions earned, not just activity, and show how they connect to visibility, so the next round targets what is helping.',
      },
    ],
    faq: [
      {
        q: 'What counts as off-page SEO?',
        a: 'Backlinks, brand mentions, citations, digital PR and other signals from beyond your own site that show others trust you. Social sharing and reviews can support these, though links and mentions from credible publishers are the signals search engines lean on most.',
      },
      {
        q: 'Do you buy links?',
        a: 'No. We do not use paid link schemes, private blog networks or automated link blasts. We earn links through outreach and useful content. Buying links breaks search engine guidelines and can cost you visibility, so we build fewer links that hold up over time.',
      },
      {
        q: 'Can you guarantee a ranking?',
        a: 'No one honestly can. We can show you the authority work we do and how your visibility and links change over time. Rankings depend on competitors, content, technical health and search engine updates, so we report on what we control and explain the rest.',
      },
      {
        q: 'How do I know if my backlinks are bad?',
        a: 'Warning signs include many links from unrelated foreign-language sites, exact-match anchor text repeated across low-quality pages, and sudden unexplained spikes. A profile review looks at relevance and context, not just tool scores, because a link that looks odd may still be harmless.',
      },
      {
        q: 'How is off-page SEO different from link building?',
        a: 'Link building is one part of off-page SEO. Off-page work also includes digital PR, brand mentions, citations and reputation, which together build trust beyond links. We usually plan them as one programme, so each effort supports the others and nothing is done in isolation.',
      },
    ],
    ctaLabel: 'Build Authority',
    ctaHref: SEO_QUOTE,
    related: ['link-building', 'guest-posting', 'content-marketing'],
    guides: [SEO_GUIDES, { label: 'Business directory guides', href: '/blog/business-directory' }],
  },
  {
    slug: 'link-building',
    path: '/seo-services/link-building',
    name: 'Link building',
    title: 'Link Building Services | Earn Quality Backlinks',
    description:
      'Grow website authority with relevant, quality-focused link building: opportunity research, personal outreach, linkable content and clear link reporting.',
    h1: 'Link building services',
    intro:
      'Link building is the practice of earning links from other websites to yours, because search engines treat relevant links as a sign of trust. Our SEO link building services follow a white hat link building approach: real outreach, useful content and relevant sites, with no paid schemes or link farms. Every link we pursue has a reason to exist.',
    icon: 'link',
    category: 'links',
    hub: 'links',
    tag: 'High Impact',
    includes: [
      {
        title: 'Link opportunity research',
        body: 'We find relevant sites, resource pages and publications where a link would genuinely help readers. Each prospect is checked for topical fit, real traffic and editorial standards before it goes on the outreach list.',
      },
      {
        title: 'Outreach campaigns',
        body: 'Personal, honest outreach to editors and site owners, with a clear reason for the link. Messages are written individually, follow-ups are polite and limited, and we stop contacting a site when its owner says no.',
      },
      {
        title: 'Linkable content',
        body: 'Guides, data and tools worth linking to, so links come from value rather than favours. We look at what already attracts links in your sector and create something clearer, newer or more useful to offer.',
      },
      {
        title: 'Competitor backlink gaps',
        body: 'We compare your links with competitors’ to spot achievable opportunities. Sites that already link to several rivals but not to you are often the best starting point, since they have shown interest in the topic.',
      },
      {
        title: 'Link quality reporting',
        body: 'You see each link we earn, where it comes from and why it is relevant. Reports include the linked page, the type of site and the status of every active outreach conversation, so nothing is hidden behind totals.',
      },
      {
        title: 'Broken link and reclamation work',
        body: 'We look for dead pages that others still link to, unlinked mentions of your brand and links pointing at old URLs. Redirecting or reclaiming these is often the quickest way to recover authority you have already earned.',
      },
    ],
    steps: [
      {
        title: 'Strategy',
        body: 'We review your link profile and agree which pages and topics to build links for. Priorities follow your commercial goals, so links support the pages that matter to the business.',
      },
      {
        title: 'Prepare assets',
        body: 'We create or improve the guides, data and tools worth linking to, so outreach has something genuinely useful to offer the sites we contact, and each asset has a clear target page.',
      },
      {
        title: 'Outreach',
        body: 'We contact relevant sites and publishers with content or resources worth referencing, follow up politely and record each response. Replies, declines and live links are logged, so you can see progress at any point.',
      },
      {
        title: 'Report',
        body: 'Each month you get a list of earned links and a summary of what is working, along with any changes we recommend to the plan.',
      },
    ],
    faq: [
      {
        q: 'Is link building still worth doing?',
        a: 'Relevant links remain one of several signals search engines use to judge authority. Quality and relevance matter far more than volume. A few links from respected, related sites usually do more than hundreds from sites with no connection to your topic.',
      },
      {
        q: 'What is white hat link building?',
        a: 'It means earning links in ways that follow search engine guidelines: genuine outreach, helpful content and relevant sites, without payment for links or manipulation. If a tactic would look embarrassing when explained to an editor, we do not use it.',
      },
      {
        q: 'How many links will you build?',
        a: 'It depends on your market and goals. We focus on a smaller number of relevant links rather than a quota, and we set expectations in the strategy. Competitive niches generally need more sustained effort, while quieter ones may need fewer links to compete.',
      },
      {
        q: 'What makes a link good?',
        a: 'A good link comes from a site relevant to your topic, with real readers and editorial control, placed where it helps the reader. Domain scores are a rough guide, but we also look at traffic, content quality and whether the site links out naturally.',
      },
      {
        q: 'Can links to my site disappear later?',
        a: 'Yes, publishers can change or delete pages, so some links disappear over time. We monitor the links we earn, follow up where a valuable one drops, and favour sites with stable content so that the links keep their value over the long term. Regular checks also help us spot problems early.',
      },
    ],
    ctaLabel: 'Get Link Building Strategy',
    ctaHref: '/contact?subject=Link%20building',
    related: ['guest-posting', 'off-page-seo', 'content-marketing'],
    guides: [SEO_GUIDES],
  },
  {
    slug: 'guest-posting',
    path: '/seo-services/guest-posting',
    name: 'Guest posting',
    title: 'Guest Posting Services | SEO Outreach & Backlinks',
    description:
      'Reach relevant websites with targeted guest post outreach and original articles, built to strengthen authority, visibility and trust with real audiences.',
    h1: 'Guest posting services',
    intro:
      'Guest posting means writing a useful article for another website in your field, with a link back to yours where it fits. Our guest post outreach services focus on relevant sites with real readers, editorial standards and content that earns its place, so each article builds your reputation as well as a link.',
    icon: 'handshake',
    category: 'links',
    hub: 'links',
    tag: 'Outreach',
    includes: [
      {
        title: 'Site selection',
        body: 'We shortlist relevant publications that have real audiences and editorial standards, not sites that sell posts in bulk. Checks cover topical fit, genuine traffic, content quality and whether the site links out to others naturally.',
      },
      {
        title: 'Topic pitching',
        body: 'Ideas matched to what each site publishes, pitched personally to the right editor. We study recent articles first, so each pitch fills a real gap instead of repeating something the site has already covered.',
      },
      {
        title: 'Article writing',
        body: 'Original, well-researched articles that offer something readers cannot get elsewhere. We include examples, sources and a clear point of view, and match the host site’s style guide, length and formatting requirements.',
      },
      {
        title: 'Natural link placement',
        body: 'Links added only where they help the reader, with descriptive anchor text and disclosure where required. Most articles link to a relevant guide or resource on your site, not always the homepage or a sales page.',
      },
      {
        title: 'Placement reporting',
        body: 'A clear record of pitches, published articles and the links they earned. You see which sites accepted, which declined and the live URL of each piece, so every result can be checked at any time.',
      },
      {
        title: 'Author profile and expertise',
        body: 'Editors prefer contributors who can show real expertise, so we help prepare a short author bio and supporting profile links. Where you have a subject expert on your team, we involve them to add genuine insight to articles.',
      },
    ],
    steps: [
      {
        title: 'Outreach plan',
        body: 'We agree your topics, target sites and the pages worth linking to. The plan also sets how many pitches are sent, so expectations stay realistic from the start.',
      },
      {
        title: 'Pitch editors',
        body: 'We send personal pitches with a specific angle for each site, follow up politely and keep track of every reply.',
      },
      {
        title: 'Write and approve',
        body: 'We write the articles that are accepted and share each draft with you for approval before it goes to the editor.',
      },
      {
        title: 'Publish and report',
        body: 'Once articles go live we report on placements and links, check that the links work as agreed and note which topics editors responded to best.',
      },
    ],
    faq: [
      {
        q: 'Is guest posting good for SEO?',
        a: 'It can be, when the site is relevant and the article is genuinely useful. Mass-produced guest posts on low-quality sites can hurt more than they help. We choose fewer, better placements, because one article readers value is worth more than many ignored ones.',
      },
      {
        q: 'Do you publish on blog networks?',
        a: 'No. We do not use private blog networks or sites that exist to sell links. We pitch real publications and industry sites. A site that advertises guaranteed posts for a fee with no editorial review fails our checks before we ever contact it.',
      },
      {
        q: 'Can I approve articles before they go out?',
        a: 'Yes. You see the topic and the draft first, and nothing is submitted without your sign-off. Editors sometimes request changes, and we share those with you too, so the final published version never contains a surprise. If an editor changes the text heavily, you see that too.',
      },
      {
        q: 'Do guest posts have to link to my site?',
        a: 'Not always, and many strong placements link only in the author bio. Editors decide what is acceptable. We aim for a contextual link where it genuinely helps readers, but a respected mention with a bio link can still build visibility and trust.',
      },
      {
        q: 'Are guest posts labelled as sponsored?',
        a: 'It depends on the arrangement. Where money or a product changes hands, search engine guidelines expect links to carry a sponsored attribute, and the site may add a disclosure. Where an editor accepts an article purely on merit, no label is usually needed. We follow each site’s policy.',
      },
    ],
    ctaLabel: 'Request Outreach Plan',
    ctaHref: '/contact?subject=Guest%20posting',
    related: ['link-building', 'off-page-seo', 'content-marketing'],
    guides: [SEO_GUIDES],
  },
  {
    slug: 'content-marketing',
    path: '/seo-services/content-marketing',
    name: 'Content marketing',
    title: 'Content Marketing Services | Content That Ranks & Converts',
    description:
      'SEO content marketing that targets real search demand: topic research, well-researched articles and content built to earn traffic, trust and qualified leads.',
    h1: 'Content marketing services',
    intro:
      'SEO content marketing is publishing pages and articles that answer what your customers search for, so they find you before they decide. We plan topics around real search demand, write clear and accurate content, and connect it to the pages that turn readers into enquiries, so every piece has a defined job to do.',
    icon: 'campaign',
    category: 'marketing',
    hub: 'specialty',
    tag: 'Content',
    includes: [
      {
        title: 'Topic and keyword research',
        body: 'We find the questions and searches your customers use and choose topics you can realistically rank for. Each topic is checked against what already ranks, so we know what format and depth are needed to compete.',
      },
      {
        title: 'Content strategy',
        body: 'A plan that groups related articles around your main services, so content supports the pages that earn revenue. It sets priorities, formats and a publishing order, with ideas tied to the stages of the buying journey.',
      },
      {
        title: 'Article and page writing',
        body: 'Clear, accurate, answer-first content written for your audience and reviewed for quality. Drafts include sources where claims need support, plain headings and examples, and are edited for tone before you see them.',
      },
      {
        title: 'Updating existing content',
        body: 'Older pages are refreshed, merged or removed where that will help, often a quicker win than new posts. We start with pages that already earn impressions and fix outdated facts, weak introductions and thin sections.',
      },
      {
        title: 'Internal links and calls to action',
        body: 'Every piece links onward to related content and a clear next step. We link articles up to the service pages they support and add calls to action that match what the reader is trying to do.',
      },
      {
        title: 'Editorial calendar and workflow',
        body: 'A shared calendar with topics, owners, deadlines and review steps, so publishing stays steady without last-minute rushes. Briefs are written in advance and approvals are kept simple, which helps busy teams stay on schedule.',
      },
    ],
    steps: [
      {
        title: 'Research',
        body: 'We study your market, your audience and the content already ranking. Customer questions from sales calls, support emails and reviews feed straight into the topic list.',
      },
      {
        title: 'Plan',
        body: 'We agree a topic plan and priorities, with a brief for each piece covering the search intent, outline, sources and the page it should support.',
      },
      {
        title: 'Write and publish',
        body: 'We write, edit and publish in a steady rhythm, with your approval wherever you want it, and link each piece into the rest of your site.',
      },
      {
        title: 'Review and update',
        body: 'We track what performs and refresh content so it stays accurate and useful, doubling down on the formats and topics that attract real enquiries.',
      },
    ],
    faq: [
      {
        q: 'How is SEO content different from ordinary blogging?',
        a: 'It starts from what people actually search for and what they need to decide, rather than from what we would like to say, and it is structured so search engines understand it. Each article also has a defined goal, such as supporting a service page.',
      },
      {
        q: 'Do you use AI to write content?',
        a: 'Content is planned and reviewed by people for accuracy and usefulness. We do not publish anything we would not stand behind. Every piece is checked by a human editor for facts, clarity and tone before it goes live on your site.',
      },
      {
        q: 'How often should we publish?',
        a: 'Consistency matters more than volume. We agree a pace you can sustain and that matches your goals. A smaller number of thorough, well-maintained articles usually serves a business better than frequent thin posts that never earn any visibility. We review the pace every quarter and adjust it if your goals or capacity change.',
      },
      {
        q: 'How do you choose topics?',
        a: 'We combine keyword research, Search Console data, competitor content and the real questions your customers ask. Topics are scored by relevance to your services, search demand and how realistic it is to compete, so the plan favours content that can support revenue.',
      },
      {
        q: 'Can you work with our subject experts?',
        a: 'Yes, and it often improves the result. A short interview or review with your own specialist adds first-hand detail that generic articles lack. We handle the writing and editing, so your expert only spends a little time checking accuracy and adding examples.',
      },
    ],
    ctaLabel: 'Get Content Strategy',
    ctaHref: SEO_QUOTE,
    related: ['on-page-seo', 'link-building', 'local-seo'],
    guides: [
      MARKETING_GUIDES,
      SEO_GUIDES,
      { label: 'Keyword Density Checker', href: '/free-tools/keyword-density-checker' },
    ],
  },
  {
    slug: 'digital-marketing',
    path: '/digital-marketing',
    name: 'Digital marketing',
    title: 'Digital Marketing Services | Grow Your Business Online',
    description:
      'Grow your online presence with search-led digital marketing: SEO, content marketing, local search, link building and a clear plan with plain-language reporting.',
    h1: 'Digital marketing services',
    intro:
      'Digital marketing is how a business gets found, trusted and chosen online. As a digital marketing agency offering online marketing services, we start with search, because it captures people already looking, and build outward with content, local presence and authority, guided by a plan tied to your goals so each channel supports the others.',
    icon: 'rocket_launch',
    category: 'marketing',
    hub: 'specialty',
    tag: 'Full Funnel',
    includes: [
      {
        title: 'Search engine optimization',
        body: 'Technical, on-page and local SEO so your site can be found for the searches that matter to you. We fix the biggest gaps first, then build steadily on the pages and topics closest to revenue.',
      },
      {
        title: 'Content marketing',
        body: 'Helpful articles and pages that answer customer questions and support your services. Topics follow real search demand, and each piece links to the page where a reader can take the next step.',
      },
      {
        title: 'Local search presence',
        body: 'Accurate listings, reviews and location pages that bring customers in your area to you. We keep business details consistent across directories and help you ask for reviews in line with platform rules.',
      },
      {
        title: 'Link building and outreach',
        body: 'Ethical outreach and digital PR that build the authority behind your rankings. We earn links from relevant sites through useful resources and personal outreach, and never use paid link schemes.',
      },
      {
        title: 'Strategy and reporting',
        body: 'A plain-language plan tied to your goals, with reports that show what is working and what is next. Calls, enquiries and sales are tracked alongside visibility, so decisions rest on business results.',
      },
      {
        title: 'Website and conversion review',
        body: 'Traffic is only useful if visitors can act on it, so we review key pages, forms and tracking. Small changes to messaging, layout and calls to action can lift enquiries without needing any extra traffic.',
      },
    ],
    steps: [
      {
        title: 'Understand your goals',
        body: 'We learn what you sell, who you sell to and what a good result looks like for you. We also review your site, analytics and competitors to see where you stand today.',
      },
      {
        title: 'Build the plan',
        body: 'We choose the channels and priorities that fit your budget and market, and agree the measures that will show whether the plan is working.',
      },
      {
        title: 'Do the work',
        body: 'We carry out the work month by month, starting with the changes closest to revenue, and keep you informed of what is being done and why.',
      },
      {
        title: 'Report and adjust',
        body: 'We measure the outcomes that matter and adjust the plan as we learn, so effort moves toward whatever is actually producing results.',
      },
    ],
    faq: [
      {
        q: 'What do your online marketing services include?',
        a: 'Our focus is search-led growth: SEO, content marketing, local search and link building. The sections above explain each one. We do not sell a bundle for its own sake, because the mix depends on your goals, your market and the gaps found in the first audit.',
      },
      {
        q: 'Where should a small business start?',
        a: 'Usually with an audit to find the biggest gaps, then local and on-page SEO so the basics are working before investing in more. A clear listing, a fast site and accurate service pages come before advanced tactics for most small businesses.',
      },
      {
        q: 'Do you work with businesses outside one country?',
        a: 'Yes. We work with businesses in the UK, US and UAE, and in other markets too. Search behaviour, language and competition differ by country, so we research each market separately rather than applying one template everywhere. Where you serve several countries, we also plan language versions and country pages.',
      },
      {
        q: 'How do you measure digital marketing results?',
        a: 'We agree measures at the start, such as organic visits, calls, form submissions and sales, and track them in analytics and Search Console. Rankings are shown for context, but business outcomes lead the report, since a high position that brings no enquiries is not success.',
      },
      {
        q: 'Do you run paid ads or social media?',
        a: 'Our core work is search-led: SEO, content, local search and links. If paid or social channels would help your goals, we say so and explain where they fit, but we keep our own services focused on what we do well rather than offering everything.',
      },
    ],
    ctaLabel: 'Get Marketing Strategy',
    ctaHref: '/contact?subject=Digital%20marketing',
    related: ['local-seo', 'content-marketing', 'link-building'],
    guides: [MARKETING_GUIDES, SEO_GUIDES, { label: 'Free SEO tools', href: '/free-tools' }],
  },
];

/** Every service page: the menu pages, then the rest of the catalogue in hub order. */
export const SERVICE_PAGES: ServicePage[] = [
  ...MENU_SERVICE_PAGES,
  ...CORE_PAGES,
  ...TECHNICAL_PAGES,
  ...LINKS_AI_PAGES,
  ...PLATFORM_ECOMMERCE_PAGES,
  ...SPECIALTY_PAGES,
  ...INDUSTRY_PAGES_1,
  ...INDUSTRY_PAGES_2,
  ...INDUSTRY_PAGES_3,
  ...INDUSTRY_PAGES_4,
];

export function servicePage(slug: string): ServicePage | undefined {
  return SERVICE_PAGES.find((p) => p.slug === slug);
}

/** What the header's Services menu needs: no page copy, so the client bundle stays small. */
export type ServiceNavItem = Pick<ServicePage, 'slug' | 'path' | 'name' | 'icon' | 'category'>;

export function serviceNavItems(): ServiceNavItem[] {
  return MENU_SERVICE_PAGES.map(({ slug, path, name, icon, category }) => ({
    slug,
    path,
    name,
    icon,
    category,
  }));
}

/** The contact form with the SEO services subject and this service named in the message. */
export function quoteHref(name: string): string {
  return `/contact?subject=SEO%20services&service=${encodeURIComponent(name)}`;
}
