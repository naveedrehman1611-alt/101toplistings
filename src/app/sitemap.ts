import type { MetadataRoute } from 'next';
import { getAllListingSlugs, getBlogPosts, getCategories, getCities } from '@/lib/queries';
import { SITE_URL } from '@/lib/supabase';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [slugs, cats, cities, posts] = await Promise.all([
    getAllListingSlugs(),
    getCategories(),
    getCities(),
    getBlogPosts(),
  ]);

  const staticRoutes = ['', '/listings', '/categories', '/blog', '/about', '/contact'];

  return [
    ...staticRoutes.map((p) => ({ url: `${SITE_URL}${p}`, changeFrequency: 'weekly' as const, priority: p === '' ? 1 : 0.7 })),
    ...cats.map((c) => ({ url: `${SITE_URL}/category/${c.slug}`, changeFrequency: 'weekly' as const, priority: 0.8 })),
    ...cities.map((c) => ({ url: `${SITE_URL}/city/${c.slug}`, changeFrequency: 'weekly' as const, priority: 0.8 })),
    ...slugs.map((s) => ({ url: `${SITE_URL}/listing/${s}`, changeFrequency: 'monthly' as const, priority: 0.6 })),
    ...posts.map((p) => ({ url: `${SITE_URL}/blog/${p.slug}`, changeFrequency: 'monthly' as const, priority: 0.5 })),
  ];
}
