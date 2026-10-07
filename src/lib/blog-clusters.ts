import { reportError, type BlogPostSummary } from './queries';
import { supabase } from './supabase';

type ClusterLink = { label: string; href: string };

/**
 * The three guide hubs under /blog. Each maps to a blog_categories row with the
 * same slug (seeded by migration 0022); the hub lists that category's posts and
 * links on to the service pages that sell the same thing.
 */
export const BLOG_CLUSTERS = [
  {
    slug: 'business-directory',
    path: '/blog/business-directory',
    name: 'Business directory guides',
    title: 'Business Directory Guides | Listings & Local Visibility',
    description:
      'Guides to business directories: how business listings and citations help customers find you, and how to get your business found online.',
    h1: 'Business directory guides',
    intro:
      'A business directory is an online listing site where companies are organised by category and location, so customers can find them and compare options. These guides explain how business listings and directory citations help your business get found online, and how to set yours up properly.',
    cta: { label: 'Add Business', href: '/add-business' },
    moneyLinks: [
      { label: 'Add your business', href: '/add-business' },
      { label: 'Browse the business directory', href: '/business-directory' },
      { label: 'Claim your business listing', href: '/claim-business' },
      { label: 'Local SEO services', href: '/seo-services/local-seo' },
    ] satisfies ClusterLink[],
  },
  {
    slug: 'seo',
    path: '/blog/seo',
    name: 'SEO guides',
    title: 'SEO Guides | How to Rank a Website',
    description:
      'Practical SEO guides on how to rank a website: technical and on-page SEO, citations for local SEO, backlinks and guest posting for SEO.',
    h1: 'SEO guides',
    intro:
      'SEO (search engine optimisation) is the work of making a website easier for search engines to understand and more worth recommending, so it earns more organic traffic. These guides cover how to rank a website, from technical and on-page fixes to local citations, backlinks and guest posting.',
    cta: { label: 'Get SEO Help', href: '/seo-services' },
    moneyLinks: [
      { label: 'SEO services', href: '/seo-services' },
      { label: 'Free SEO audit', href: '/seo-audit' },
      { label: 'Link building services', href: '/seo-services/link-building' },
      { label: 'Local SEO services', href: '/seo-services/local-seo' },
    ] satisfies ClusterLink[],
  },
  {
    slug: 'digital-marketing',
    path: '/blog/digital-marketing',
    name: 'Digital marketing guides',
    title: 'Digital Marketing Guides | Grow Your Business Online',
    description:
      'Digital marketing guides for business owners: how SEO, content, local search and link building work together to grow your online presence.',
    h1: 'Digital marketing guides',
    intro:
      'Digital marketing is how a business earns attention and customers online, through search, content, local listings and outreach. These guides show how the channels fit together so you can decide where to spend your time first.',
    cta: { label: 'Contact', href: '/contact?subject=Digital%20marketing' },
    moneyLinks: [
      { label: 'Digital marketing services', href: '/digital-marketing' },
      { label: 'SEO services', href: '/seo-services' },
      { label: 'Content marketing services', href: '/seo-services/content-marketing' },
    ] satisfies ClusterLink[],
  },
] as const;

export type BlogCluster = (typeof BLOG_CLUSTERS)[number];

/** Published posts in the blog category whose slug is `slug`, newest first. Empty on error. */
export async function getClusterPosts(slug: string): Promise<BlogPostSummary[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select(
      'id, slug, title, standfirst, read_minutes, is_featured, published_at, category_id, ' +
        'category:blog_categories!blog_posts_category_id_fkey!inner(slug)',
    )
    .eq('is_published', true)
    .eq('category.slug', slug)
    .order('published_at', { ascending: false })
    .limit(50);
  reportError('blog_posts.clusterPosts', error);
  if (error || !data) return [];
  return (data as unknown as (BlogPostSummary & { category?: unknown })[]).map((row) => {
    const post: BlogPostSummary & { category?: unknown } = { ...row };
    delete post.category;
    return post;
  });
}

/** Number of published posts per cluster slug; empty when the read fails. */
export async function getClusterPostCounts(): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  const { data, error } = await supabase
    .from('blog_posts')
    .select('category:blog_categories!blog_posts_category_id_fkey(slug)')
    .eq('is_published', true)
    .limit(1000);
  reportError('blog_posts.clusterCounts', error);
  if (error || !data) return counts;
  for (const row of data as unknown as { category: { slug: string } | null }[]) {
    const slug = row.category?.slug;
    if (slug) counts.set(slug, (counts.get(slug) ?? 0) + 1);
  }
  return counts;
}
