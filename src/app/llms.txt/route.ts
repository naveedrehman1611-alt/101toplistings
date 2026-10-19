import { getBlogPosts, getSettings, settingText } from '@/lib/queries';
import { getPageContent } from '@/lib/content/get';
import { SITE_URL } from '@/lib/supabase';
import { SERVICE_PAGES, WEB_DEVELOPMENT_BASE } from '@/lib/service-pages';
import { LIVE_TOOLS, TOOLS_BASE, toolHref } from '@/lib/free-tools';

/**
 * /llms.txt (llmstxt.org): a plain Markdown map of the site for AI assistants
 * and answer engines, built from the same lists as the sitemap so it never
 * names a page that does not exist.
 */

export const revalidate = 3600;

const line = (name: string, path: string, note?: string) =>
  `- [${name}](${SITE_URL}${path})${note ? `: ${note}` : ''}`;

export async function GET() {
  const [settings, posts, about] = await Promise.all([
    getSettings(),
    getBlogPosts(),
    getPageContent('about'),
  ]);
  const brand = settingText(settings, 'brand.name', 'RankYouSite');
  const summary =
    settingText(settings, 'seo.default_description').trim() ||
    'A free worldwide business directory and an SEO agency for small and growing businesses.';
  const founder = about.founder.visible && about.founder.name ? about.founder : null;
  const webPages = SERVICE_PAGES.filter((s) => s.category === 'web');
  const seoPages = SERVICE_PAGES.filter((s) => s.category !== 'web');

  const sections = [
    `# ${brand}`,
    `> ${summary}`,
    [
      `${brand} has two parts: a free business directory where any real business can list itself, and paid SEO services (technical SEO, content, link building, local SEO, and AEO/GEO for AI search) and web development (WordPress, Next.js and ecommerce sites), delivered remotely to businesses worldwide.`,
      founder
        ? `It is run by ${founder.name}, ${founder.role}${founder.experience ? ` (${founder.experience})` : ''}.`
        : '',
    ]
      .filter(Boolean)
      .join(' '),
    [
      '## Key pages',
      line('About', '/about', 'who runs the business and how it works'),
      line('SEO services', '/seo-services', 'every service, grouped by type'),
      line('Web development', WEB_DEVELOPMENT_BASE, 'websites built for search'),
      line('Pricing', '/pricing'),
      line('Free SEO audit', '/seo-audit'),
      line('Contact', '/contact'),
      line('Business directory', '/business-directory', 'search listed businesses'),
      line('Add a business (free)', '/add-business'),
    ].join('\n'),
    ['## SEO services', ...seoPages.map((s) => line(s.name, s.path, s.description))].join('\n'),
    [
      '## Web development services',
      ...webPages.map((s) => line(s.name, s.path, s.description)),
    ].join('\n'),
    [
      '## Free SEO tools',
      line('All free tools', TOOLS_BASE),
      ...LIVE_TOOLS.map((t) => line(t.name, toolHref(t), t.summary)),
    ].join('\n'),
    ...(posts.length > 0
      ? [
          [
            '## Guides',
            ...posts.map((p) => line(p.title, `/blog/${p.slug}`, p.standfirst ?? undefined)),
          ].join('\n'),
        ]
      : []),
  ];

  return new Response(`${sections.join('\n\n')}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
