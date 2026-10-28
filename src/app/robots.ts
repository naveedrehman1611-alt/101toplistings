import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/supabase';

// /search and /dashboard are not disallowed on purpose: public pages link to
// them, and a blocked URL can still be indexed from those links ("Indexed,
// though blocked by robots.txt") because Google never sees its noindex. Left
// crawlable, their noindex (search/page.tsx, dashboard/layout.tsx) keeps them
// out of the index. /admin is not linked publicly, so it stays blocked.

// Sort and filter variants of category/city pages are near-duplicates of the
// canonical page; letting bots crawl every combination rendered and cached
// thousands of pages nobody reads.
const DISALLOW = ['/admin', '/*?*sort=', '/*?*q=', '/*?*city=', '/*?*category='];

// Scrapers and crawlers that bring no search or AI-answer visibility but
// crawl hard. Every request costs hosting credits, and the site was paused
// on Vercel once already for crawl volume.
//
// Deliberately NOT here: Googlebot, Bingbot, and the AI-answer crawlers
// (GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot,
// PerplexityBot, Google-Extended, Applebot) — RankYouSite sells SEO and AI
// visibility, so being read by them is the point.
const BLOCKED_BOTS = [
  'Bytespider',
  'PetalBot',
  'BLEXBot',
  'DataForSeoBot',
  'Barkrowler',
  'SeekportBot',
  'serpstatbot',
  'ImagesiftBot',
  'MegaIndex.ru',
];

// SEO-tool crawlers whose metrics (Ahrefs DR, Moz DA/PA, Semrush AS, Majestic
// TF) clients look at, so they stay allowed, but slowed down. All four honour
// Crawl-delay. A bot that matches its own group ignores the `*` group, so the
// same disallow list is repeated here.
const THROTTLED_BOTS = ['AhrefsBot', 'SemrushBot', 'DotBot', 'rogerbot', 'MJ12bot'];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: DISALLOW },
      { userAgent: THROTTLED_BOTS, allow: '/', disallow: DISALLOW, crawlDelay: 10 },
      { userAgent: BLOCKED_BOTS, disallow: '/' },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
