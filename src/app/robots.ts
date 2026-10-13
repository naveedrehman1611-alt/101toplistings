import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/supabase';

// /search and /dashboard are not disallowed on purpose: public pages link to
// them, and a blocked URL can still be indexed from those links ("Indexed,
// though blocked by robots.txt") because Google never sees its noindex. Left
// crawlable, their noindex (search/page.tsx, dashboard/layout.tsx) keeps them
// out of the index. /admin is not linked publicly, so it stays blocked.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin'] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
