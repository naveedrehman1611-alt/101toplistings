import type { MetadataRoute } from 'next';
import {
  getAllListingSlugs,
  getBlogPosts,
  getCategories,
  getCities,
  getCityListingCounts,
} from '@/lib/queries';
import { SITE_URL } from '@/lib/supabase';
import { LIVE_TOOLS, TOOLS_BASE, toolHref } from '@/lib/free-tools';
import { MIN_CITY_LISTINGS_TO_INDEX, getSitemapExclusions } from '@/lib/seo';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [slugs, cats, cities, posts, excluded] = await Promise.all([
    getAllListingSlugs(),
    getCategories(),
    getCities(),
    getBlogPosts(),
    getSitemapExclusions(),
  ]);

  // Pages switched off, or set to noindex, in the admin SEO manager are left out.
  const staticRoutes = [
    '',
    '/services',
    '/listings',
    '/categories',
    '/blog',
    '/about',
    '/contact',
    TOOLS_BASE,
    ...LIVE_TOOLS.map(toolHref),
    '/privacy',
    '/terms',
  ].filter((p) => !excluded.has(p || '/'));

  // City pages below the listing threshold are noindex (see city/[slug]), so
  // they stay out until they have enough listings to be indexed. A city whose
  // count could not be read is left out too rather than risk a noindex URL.
  const cityCounts = await getCityListingCounts(cities.map((c) => c.id));
  const indexableCities = cities.filter(
    (c) => (cityCounts.get(c.id) ?? 0) >= MIN_CITY_LISTINGS_TO_INDEX,
  );

  return [
    ...staticRoutes.map((p) => ({
      url: `${SITE_URL}${p}`,
      changeFrequency: 'weekly' as const,
      priority:
        p === '' ? 1 : p === '/services' ? 0.9 : p === '/privacy' || p === '/terms' ? 0.3 : 0.7,
    })),
    ...cats.map((c) => ({
      url: `${SITE_URL}/category/${c.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...indexableCities.map((c) => ({
      url: `${SITE_URL}/city/${c.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...slugs.map((s) => ({
      url: `${SITE_URL}/listing/${s}`,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    ...posts.map((p) => ({
      url: `${SITE_URL}/blog/${p.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    })),
  ];
}
