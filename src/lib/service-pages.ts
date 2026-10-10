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
      'Improve your local visibility with optimized business listings, local SEO, citations, content, and authority-building strategies.',
    h1: 'Local SEO services',
    intro:
      'Local SEO is the work of making a business easy to find when people search for it by place, such as "plumber near me" or "dentist in Dubai". As a local SEO agency we combine accurate listings, consistent citations, location pages and reviews so search engines trust your business for the area you serve.',
    icon: 'location_on',
    category: 'seo',
    hub: 'core',
    tag: 'Most Popular',
    includes: [
      {
        title: 'Business listing clean-up',
        body: 'We check your name, address and phone details across directories and maps, fix inconsistencies and complete the listings that matter for your market.',
      },
      {
        title: 'Local search optimization',
        body: 'Categories, services, descriptions, photos and posts are set up so your profile matches how customers search in your area.',
      },
      {
        title: 'Citations and directory listings',
        body: 'Relevant, trusted citations that confirm who you are and where you operate, without bulk submissions to low-quality sites.',
      },
      {
        title: 'Location and service pages',
        body: 'Pages written for each city or service area you cover, with real local detail rather than copied templates.',
      },
      {
        title: 'Review strategy',
        body: 'A simple, honest process for asking happy customers for reviews and replying to them, in line with each platform’s rules.',
      },
    ],
    steps: [
      {
        title: 'Local audit',
        body: 'We review your listings, site and local rankings to see where you appear and where you do not.',
      },
      {
        title: 'Fix and build',
        body: 'We correct listing data, improve key pages and add the citations and content that are missing.',
      },
      {
        title: 'Track and refine',
        body: 'We report on local visibility, calls and visits, then adjust what we do based on what is moving.',
      },
    ],
    faq: [
      {
        q: 'What is local SEO?',
        a: 'Local SEO helps a business appear in results for searches tied to a location, including map results and "near me" queries. It relies on accurate listings, relevant content, reviews and links.',
      },
      {
        q: 'Is local SEO right for my business?',
        a: 'If customers find you by city, neighbourhood or "near me" searches, it usually is. It is SEO for a local business that serves a defined area, whether you have one shop or several branches.',
      },
      {
        q: 'How long does local SEO take?',
        a: 'Fixing listings can show results within weeks, while competitive markets take longer. We cannot promise specific rankings, but we will show you what changed and how visibility is moving.',
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
      'Improve crawlability, indexing, site speed, Core Web Vitals, architecture, and technical SEO foundations.',
    h1: 'Technical SEO services',
    intro:
      'Technical SEO makes sure search engines can crawl, understand and index your website, and that visitors get a fast, stable page. As a technical SEO agency we find the problems holding a site back, fix them in priority order and explain each change in plain language.',
    icon: 'build',
    category: 'seo',
    hub: 'technical',
    tag: 'Foundation',
    includes: [
      {
        title: 'Crawl and indexing review',
        body: 'We check what search engines can reach and what they actually index, then resolve blocked pages, duplicates and wasted crawl paths.',
      },
      {
        title: 'Site speed and Core Web Vitals',
        body: 'Loading, interactivity and layout stability are measured on real pages, with specific fixes for images, scripts and server response.',
      },
      {
        title: 'Site architecture and internal links',
        body: 'Clear URL structure and internal linking so important pages are easy to find and authority flows to them.',
      },
      {
        title: 'Structured data',
        body: 'Valid schema markup for the content types you publish, so search engines read your pages accurately.',
      },
      {
        title: 'Mobile and security checks',
        body: 'Mobile usability, HTTPS, redirects and canonical tags reviewed and corrected.',
      },
    ],
    steps: [
      {
        title: 'Crawl and test',
        body: 'We crawl the site and test speed and mobile usability to build a full picture of the issues.',
      },
      {
        title: 'Prioritised fix list',
        body: 'Problems are ranked by impact and effort, so the most valuable fixes go first.',
      },
      {
        title: 'Implement and verify',
        body: 'We make or hand over the fixes, then re-crawl to confirm they worked.',
      },
    ],
    faq: [
      {
        q: 'What does technical SEO cover?',
        a: 'Crawling, indexing, site speed, Core Web Vitals, mobile usability, redirects, canonical tags, sitemaps, structured data and site architecture.',
      },
      {
        q: 'Can I check some of this myself first?',
        a: 'Yes. Our free website speed test, mobile-friendly test and schema markup generator cover the basics, and we pick up from there.',
      },
      {
        q: 'Will you edit my website directly?',
        a: 'That depends on your setup. We can work with your developers using clear tickets, or make changes ourselves where you give us access.',
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
      'Build stronger pages with search intent, keyword targeting, content structure, internal links, titles, and on-page optimization.',
    h1: 'On-page SEO services',
    intro:
      'On-page SEO is the work done on the pages of your own site: matching each page to what searchers want, and getting titles, headings, content and internal links right. As an on-page SEO agency we focus on pages that can earn traffic and leads, written for people first.',
    icon: 'fact_check',
    category: 'seo',
    hub: 'technical',
    tag: 'On-Page',
    includes: [
      {
        title: 'Keyword and intent mapping',
        body: 'Each page is matched to one clear search intent, so pages support each other instead of competing.',
      },
      {
        title: 'Titles and meta descriptions',
        body: 'Clear, accurate titles and descriptions that earn the click and reflect what the page delivers.',
      },
      {
        title: 'Headings and content structure',
        body: 'Answer-first copy, logical headings and scannable sections that serve readers and search engines.',
      },
      {
        title: 'Internal linking',
        body: 'Links between related pages with descriptive anchor text, so visitors and crawlers can follow the topic.',
      },
      {
        title: 'Images and schema',
        body: 'Alt text, file sizes and structured data that support the page’s content.',
      },
    ],
    steps: [
      {
        title: 'Page review',
        body: 'We look at your key pages against search intent and the results that currently rank.',
      },
      {
        title: 'Optimization plan',
        body: 'You get page-by-page recommendations for titles, structure, content and links.',
      },
      {
        title: 'Update and measure',
        body: 'We apply the changes, then watch impressions, clicks and rankings to see what to improve next.',
      },
    ],
    faq: [
      {
        q: 'What is the difference between on-page and off-page SEO?',
        a: 'On-page SEO covers what is on your own pages, such as content, titles and internal links. Off-page SEO covers signals from elsewhere, mainly links and mentions from other websites.',
      },
      {
        q: 'Do you rewrite my content?',
        a: 'Where it helps, yes. Sometimes a title or heading change is enough, and sometimes a page needs a fuller rewrite. We tell you which before we start.',
      },
      {
        q: 'Can I try some on-page checks myself?',
        a: 'Yes. The meta tags tool with a live SERP preview and the keyword density checker are free to use.',
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
      'Strengthen your website authority with ethical off-page SEO, digital PR, link acquisition, outreach, and brand mentions.',
    h1: 'Off-page SEO services',
    intro:
      'Off-page SEO covers the signals that come from outside your website, mainly links, brand mentions and citations from other trusted sites. We build that authority ethically, with relevant outreach and useful content, and avoid the shortcuts that put rankings at risk.',
    icon: 'public',
    category: 'seo',
    hub: 'technical',
    tag: 'Off-Page',
    includes: [
      {
        title: 'Backlink profile review',
        body: 'We look at who links to you and to your competitors, and flag risky or low-value links.',
      },
      {
        title: 'Link acquisition',
        body: 'Relevant links earned through outreach and genuinely useful resources, in line with search engine guidelines.',
      },
      {
        title: 'Digital PR',
        body: 'Story ideas and data-led content that give publishers a reason to mention and link to you.',
      },
      {
        title: 'Brand mentions and citations',
        body: 'Consistent, accurate mentions of your business on credible sites and directories.',
      },
      {
        title: 'Competitor gap analysis',
        body: 'We find the sites that link to similar businesses but not to you, and decide which are worth approaching.',
      },
    ],
    steps: [
      {
        title: 'Authority audit',
        body: 'We review your current links and mentions against the sites you compete with.',
      },
      {
        title: 'Outreach plan',
        body: 'We choose realistic targets and the content or angle that gives each one a reason to link.',
      },
      {
        title: 'Outreach and reporting',
        body: 'We run the outreach and report on the links and mentions earned, not just activity.',
      },
    ],
    faq: [
      {
        q: 'What counts as off-page SEO?',
        a: 'Backlinks, brand mentions, citations, digital PR and other signals from beyond your own site that show others trust you.',
      },
      {
        q: 'Do you buy links?',
        a: 'No. We do not use paid link schemes, private blog networks or automated link blasts. We earn links through outreach and useful content.',
      },
      {
        q: 'Can you guarantee a ranking?',
        a: 'No one honestly can. We can show you the authority work we do and how your visibility and links change over time.',
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
      'Grow website authority with relevant, quality-focused link building, outreach, digital PR, and strategic backlink campaigns.',
    h1: 'Link building services',
    intro:
      'Link building is the practice of earning links from other websites to yours, because search engines treat relevant links as a sign of trust. Our SEO link building services follow a white hat link building approach: real outreach, useful content and relevant sites, with no paid schemes or link farms.',
    icon: 'link',
    category: 'links',
    hub: 'links',
    tag: 'High Impact',
    includes: [
      {
        title: 'Link opportunity research',
        body: 'We find relevant sites, resource pages and publications where a link would genuinely help readers.',
      },
      {
        title: 'Outreach campaigns',
        body: 'Personal, honest outreach to editors and site owners, with a clear reason for the link.',
      },
      {
        title: 'Linkable content',
        body: 'Guides, data and tools worth linking to, so links come from value rather than favours.',
      },
      {
        title: 'Competitor backlink gaps',
        body: 'We compare your links with competitors’ to spot achievable opportunities.',
      },
      {
        title: 'Link quality reporting',
        body: 'You see each link we earn, where it comes from and why it is relevant.',
      },
    ],
    steps: [
      {
        title: 'Strategy',
        body: 'We review your link profile and agree which pages and topics to build links for.',
      },
      {
        title: 'Outreach',
        body: 'We contact relevant sites and publishers with content or resources worth referencing.',
      },
      {
        title: 'Report',
        body: 'Each month you get a list of earned links and a summary of what is working.',
      },
    ],
    faq: [
      {
        q: 'Is link building still worth doing?',
        a: 'Relevant links remain one of several signals search engines use to judge authority. Quality and relevance matter far more than volume.',
      },
      {
        q: 'What is white hat link building?',
        a: 'It means earning links in ways that follow search engine guidelines: genuine outreach, helpful content and relevant sites, without payment for links or manipulation.',
      },
      {
        q: 'How many links will you build?',
        a: 'It depends on your market and goals. We focus on a smaller number of relevant links rather than a quota, and we set expectations in the strategy.',
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
      'Reach relevant websites with targeted guest post outreach and content-led link building designed to strengthen authority and visibility.',
    h1: 'Guest posting services',
    intro:
      'Guest posting means writing a useful article for another website in your field, with a link back to yours where it fits. Our guest post outreach services focus on relevant sites with real readers, editorial standards and content that earns its place.',
    icon: 'handshake',
    category: 'links',
    hub: 'links',
    tag: 'Outreach',
    includes: [
      {
        title: 'Site selection',
        body: 'We shortlist relevant publications that have real audiences and editorial standards, not sites that sell posts in bulk.',
      },
      {
        title: 'Topic pitching',
        body: 'Ideas matched to what each site publishes, pitched personally to the right editor.',
      },
      {
        title: 'Article writing',
        body: 'Original, well-researched articles that offer something readers cannot get elsewhere.',
      },
      {
        title: 'Natural link placement',
        body: 'Links added only where they help the reader, with descriptive anchor text and disclosure where required.',
      },
      {
        title: 'Placement reporting',
        body: 'A clear record of pitches, published articles and the links they earned.',
      },
    ],
    steps: [
      {
        title: 'Outreach plan',
        body: 'We agree your topics, target sites and the pages worth linking to.',
      },
      {
        title: 'Pitch and write',
        body: 'We pitch editors and write the articles that are accepted.',
      },
      {
        title: 'Publish and report',
        body: 'Once articles go live we report on placements and links.',
      },
    ],
    faq: [
      {
        q: 'Is guest posting good for SEO?',
        a: 'It can be, when the site is relevant and the article is genuinely useful. Mass-produced guest posts on low-quality sites can hurt more than they help.',
      },
      {
        q: 'Do you publish on blog networks?',
        a: 'No. We do not use private blog networks or sites that exist to sell links. We pitch real publications and industry sites.',
      },
      {
        q: 'Can I approve articles before they go out?',
        a: 'Yes. You see the topic and the draft first, and nothing is submitted without your sign-off.',
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
      'SEO content marketing that targets real search demand: topic research, well-researched articles, and content built to earn traffic and leads.',
    h1: 'Content marketing services',
    intro:
      'SEO content marketing is publishing pages and articles that answer what your customers search for, so they find you before they decide. We plan topics around real search demand, write clear and accurate content, and connect it to the pages that turn readers into enquiries.',
    icon: 'campaign',
    category: 'marketing',
    hub: 'specialty',
    tag: 'Content',
    includes: [
      {
        title: 'Topic and keyword research',
        body: 'We find the questions and searches your customers use and choose topics you can realistically rank for.',
      },
      {
        title: 'Content strategy',
        body: 'A plan that groups related articles around your main services, so content supports the pages that earn revenue.',
      },
      {
        title: 'Article and page writing',
        body: 'Clear, accurate, answer-first content written for your audience and reviewed for quality.',
      },
      {
        title: 'Updating existing content',
        body: 'Older pages are refreshed, merged or removed where that will help, often a quicker win than new posts.',
      },
      {
        title: 'Internal links and calls to action',
        body: 'Every piece links onward to related content and a clear next step.',
      },
    ],
    steps: [
      {
        title: 'Research',
        body: 'We study your market, your audience and the content already ranking.',
      },
      {
        title: 'Plan and write',
        body: 'We agree a topic plan, then write and publish in a steady rhythm.',
      },
      {
        title: 'Review and update',
        body: 'We track what performs and refresh content so it stays accurate and useful.',
      },
    ],
    faq: [
      {
        q: 'How is SEO content different from ordinary blogging?',
        a: 'It starts from what people actually search for and what they need to decide, rather than from what we would like to say, and it is structured so search engines understand it.',
      },
      {
        q: 'Do you use AI to write content?',
        a: 'Content is planned and reviewed by people for accuracy and usefulness. We do not publish anything we would not stand behind.',
      },
      {
        q: 'How often should we publish?',
        a: 'Consistency matters more than volume. We agree a pace you can sustain and that matches your goals.',
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
      'Grow your online presence with SEO, content marketing, local search, link building, and digital growth strategies.',
    h1: 'Digital marketing services',
    intro:
      'Digital marketing is how a business gets found, trusted and chosen online. As a digital marketing agency offering online marketing services, we start with search, because it captures people already looking, and build outward with content, local presence and authority.',
    icon: 'rocket_launch',
    category: 'marketing',
    hub: 'specialty',
    tag: 'Full Funnel',
    includes: [
      {
        title: 'Search engine optimization',
        body: 'Technical, on-page and local SEO so your site can be found for the searches that matter to you.',
      },
      {
        title: 'Content marketing',
        body: 'Helpful articles and pages that answer customer questions and support your services.',
      },
      {
        title: 'Local search presence',
        body: 'Accurate listings, reviews and location pages that bring customers in your area to you.',
      },
      {
        title: 'Link building and outreach',
        body: 'Ethical outreach and digital PR that build the authority behind your rankings.',
      },
      {
        title: 'Strategy and reporting',
        body: 'A plain-language plan tied to your goals, with reports that show what is working and what is next.',
      },
    ],
    steps: [
      {
        title: 'Understand your goals',
        body: 'We learn what you sell, who you sell to and what a good result looks like for you.',
      },
      {
        title: 'Build the plan',
        body: 'We choose the channels and priorities that fit your budget and market.',
      },
      {
        title: 'Run and report',
        body: 'We do the work, measure the outcomes that matter and adjust the plan as we learn.',
      },
    ],
    faq: [
      {
        q: 'What do your online marketing services include?',
        a: 'Our focus is search-led growth: SEO, content marketing, local search and link building. The sections above explain each one.',
      },
      {
        q: 'Where should a small business start?',
        a: 'Usually with an audit to find the biggest gaps, then local and on-page SEO so the basics are working before investing in more.',
      },
      {
        q: 'Do you work with businesses outside one country?',
        a: 'Yes. We work with businesses in the UK, US and UAE, and in other markets too.',
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
