import type { MetadataRoute } from 'next';
import {
  getCategories,
  getCategoryListingCounts,
  getCities,
  getCityListingCounts,
  getSitemapListings,
  getSitemapPosts,
} from '@/lib/queries';
import { SITE_URL, supabase } from '@/lib/supabase';
import { LIVE_TOOLS, TOOLS_BASE, toolHref } from '@/lib/free-tools';
import {
  MIN_CATEGORY_LISTINGS_TO_INDEX,
  MIN_CITY_LISTINGS_TO_INDEX,
  getSitemapExclusions,
} from '@/lib/seo';
import { SERVICE_PAGES, WEB_DEVELOPMENT_BASE } from '@/lib/service-pages';
import { BLOG_CLUSTERS, getClusterPostCounts } from '@/lib/blog-clusters';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [listings, cats, cities, posts, excluded] = await Promise.all([
    getSitemapListings(),
    getCategories(),
    getCities(),
    getSitemapPosts(),
    getSitemapExclusions(),
  ]);
  // A guide cluster with no published posts is noindex (see blog-clusters.ts),
  // so it joins the sitemap only once it has something to show.
  // /featured-businesses is noindex while nothing is featured; same rule.
  const [clusterCounts, featured] = await Promise.all([
    getClusterPostCounts(),
    supabase
      .from('public_listings')
      .select('id', { count: 'exact', head: true })
      .eq('is_featured', true),
  ]);
  const hasFeatured = !featured.error && (featured.count ?? 0) > 0;

  // Pages switched off, or set to noindex, in the admin SEO manager are left out.
  const staticRoutes = [
    '',
    '/business-directory',
    '/add-business',
    '/business-categories',
    '/locations',
    '/claim-business',
    ...(hasFeatured ? ['/featured-businesses'] : []),
    '/seo-services',
    ...SERVICE_PAGES.map((s) => s.path),
    '/seo-audit',
    '/pricing',
    // The blog index is noindex while it has no posts, as the guide hubs are.
    ...(posts.length > 0 ? ['/blog'] : []),
    ...BLOG_CLUSTERS.filter((c) => (clusterCounts.get(c.slug) ?? 0) > 0).map((c) => c.path),
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
  const [cityCounts, catCounts] = await Promise.all([
    getCityListingCounts(cities.map((c) => c.id)),
    getCategoryListingCounts(cats.map((c) => c.id)),
  ]);
  const indexableCities = cities.filter(
    (c) => (cityCounts.get(c.id) ?? 0) >= MIN_CITY_LISTINGS_TO_INDEX,
  );
  // Empty categories are noindex (see category/[slug]); same rule as cities.
  const indexableCats = cats.filter(
    (c) => (catCounts.get(c.id) ?? 0) >= MIN_CATEGORY_LISTINGS_TO_INDEX,
  );

  return [
    ...staticRoutes.map((p) => ({
      url: `${SITE_URL}${p}`,
      changeFrequency: 'weekly' as const,
      priority:
        p === ''
          ? 1
          : p === '/business-directory' || p === '/seo-services' || p === WEB_DEVELOPMENT_BASE
            ? 0.9
            : p === '/privacy' || p === '/terms'
              ? 0.3
              : 0.7,
    })),
    ...indexableCats.map((c) => ({
      url: `${SITE_URL}/category/${c.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...indexableCities.map((c) => ({
      url: `${SITE_URL}/city/${c.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...listings.map((l) => ({
      url: `${SITE_URL}/listing/${l.slug}`,
      lastModified: l.updated_at ?? undefined,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    ...posts.map((p) => ({
      url: `${SITE_URL}/blog/${p.slug}`,
      lastModified: p.updated_at ?? p.published_at ?? undefined,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    })),
  ];
}
