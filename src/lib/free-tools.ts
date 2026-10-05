import type { IconName } from '@/components/icon';

/**
 * The free SEO tools: one list that drives the header mega-menu, the
 * /free-tools hub, each tool page's "related tools" and the sitemap.
 *
 * Every live tool runs entirely in the visitor's browser (or calls Google's
 * PageSpeed Insights API from the browser), so none of them adds a server
 * function, API route or database read on this site. Tools marked `soon` need
 * a URL-fetching backend that will live outside Vercel; they are listed in the
 * menu as "Soon" and are not linked until they ship.
 */

export const TOOLS_BASE = '/free-tools';

export type ToolCategoryId = 'site-audit' | 'on-page' | 'technical' | 'generators';

export type FreeTool = {
  slug: string;
  name: string;
  /** One line for menus and cards. */
  summary: string;
  icon: IconName;
  category: ToolCategoryId;
  status: 'live' | 'soon';
  isNew?: boolean;
};

export const TOOL_CATEGORIES: { id: ToolCategoryId; label: string }[] = [
  { id: 'site-audit', label: 'Site Audit' },
  { id: 'on-page', label: 'On-Page & Content' },
  { id: 'technical', label: 'Technical SEO' },
  { id: 'generators', label: 'Generators' },
];

export const FREE_TOOLS: FreeTool[] = [
  // Site Audit
  {
    slug: 'website-speed-test',
    name: 'Website Speed Test',
    summary: 'Lighthouse scores and Core Web Vitals for any URL, mobile or desktop.',
    icon: 'speed',
    category: 'site-audit',
    status: 'live',
  },
  {
    slug: 'mobile-friendly-test',
    name: 'Mobile-Friendly Test',
    summary: 'Check viewport, tap targets, font sizes and mobile performance.',
    icon: 'smartphone',
    category: 'site-audit',
    status: 'live',
    isNew: true,
  },
  {
    slug: 'seo-audit',
    name: 'SEO Audit (Lite)',
    summary: 'On-page checks for titles, headings, links and indexability.',
    icon: 'fact_check',
    category: 'site-audit',
    status: 'soon',
  },
  {
    slug: 'page-crawl-test',
    name: 'Page Crawl Test',
    summary: 'See the raw HTML a crawler receives before JavaScript runs.',
    icon: 'travel_explore',
    category: 'site-audit',
    status: 'soon',
  },

  // On-Page & Content
  {
    slug: 'keyword-density-checker',
    name: 'Keyword Density Checker',
    summary: 'Top one-, two- and three-word phrases in your text with density.',
    icon: 'percent',
    category: 'on-page',
    status: 'live',
  },
  {
    slug: 'meta-tag-generator',
    name: 'Meta Tags & SERP Preview',
    summary: 'Write titles and descriptions with a live Google result preview.',
    icon: 'sell',
    category: 'on-page',
    status: 'live',
    isNew: true,
  },
  {
    slug: 'meta-tags-checker',
    name: 'Meta Tags Checker',
    summary: 'Read every meta tag on a live page.',
    icon: 'find_in_page',
    category: 'on-page',
    status: 'soon',
  },
  {
    slug: 'internal-link-checker',
    name: 'Internal Link Checker',
    summary: 'Every internal link, anchor text and nofollow on a page.',
    icon: 'lan',
    category: 'on-page',
    status: 'soon',
  },

  // Technical SEO
  {
    slug: 'robots-txt-tester',
    name: 'Robots.txt Tester',
    summary: 'Fetch and parse a site’s robots.txt rules per crawler.',
    icon: 'smart_toy',
    category: 'technical',
    status: 'soon',
  },
  {
    slug: 'sitemap-finder',
    name: 'Sitemap Finder',
    summary: 'Discover a site’s sitemaps and count their URLs.',
    icon: 'account_tree',
    category: 'technical',
    status: 'soon',
  },
  {
    slug: 'url-redirect-checker',
    name: 'URL Redirect Checker',
    summary: 'Trace every 301/302 hop to the final URL.',
    icon: 'alt_route',
    category: 'technical',
    status: 'soon',
  },
  {
    slug: 'http-status-checker',
    name: 'HTTP Status Checker',
    summary: 'Status codes and headers for a list of URLs.',
    icon: 'http',
    category: 'technical',
    status: 'soon',
  },

  // Generators
  {
    slug: 'schema-markup-generator',
    name: 'Schema Markup Generator',
    summary: 'Build valid JSON-LD for 8 common schema types.',
    icon: 'data_object',
    category: 'generators',
    status: 'live',
    isNew: true,
  },
  {
    slug: 'robots-txt-generator',
    name: 'Robots.txt Generator',
    summary: 'Create a robots.txt with crawler and AI-bot rules.',
    icon: 'smart_toy',
    category: 'generators',
    status: 'live',
  },
  {
    slug: 'url-slug-generator',
    name: 'URL Slug Generator',
    summary: 'Turn any headline into a clean, SEO-friendly slug.',
    icon: 'link',
    category: 'generators',
    status: 'live',
  },
];

export const LIVE_TOOLS = FREE_TOOLS.filter((tool) => tool.status === 'live');

export function toolHref(tool: Pick<FreeTool, 'slug'>): string {
  return `${TOOLS_BASE}/${tool.slug}`;
}

export function getTool(slug: string): FreeTool {
  const tool = FREE_TOOLS.find((t) => t.slug === slug);
  if (!tool) throw new Error(`Unknown free tool: ${slug}`);
  return tool;
}

export function toolsByCategory(): { id: ToolCategoryId; label: string; tools: FreeTool[] }[] {
  return TOOL_CATEGORIES.map((category) => ({
    ...category,
    tools: FREE_TOOLS.filter((tool) => tool.category === category.id),
  }));
}

/** Up to `limit` other live tools, same category first. */
export function relatedTools(slug: string, limit = 4): FreeTool[] {
  const tool = getTool(slug);
  const others = LIVE_TOOLS.filter((t) => t.slug !== slug);
  return [
    ...others.filter((t) => t.category === tool.category),
    ...others.filter((t) => t.category !== tool.category),
  ].slice(0, limit);
}
