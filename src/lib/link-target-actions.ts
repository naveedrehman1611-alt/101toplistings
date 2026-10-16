'use server';

import { BLOG_CLUSTERS } from './blog-clusters';
import { LIVE_TOOLS, TOOLS_BASE, toolHref } from './free-tools';
import { getCurrentUser, roleAtLeast } from './auth';
import { SERVICE_PAGES } from './service-pages';
import { createClient } from './supabase-server';

/**
 * The page search behind the admin editor's link dialog. A Server Function is
 * reachable by direct POST, so the role is checked here; anyone below editor
 * gets an empty list rather than a redirect, since this runs from a button.
 */

export type LinkTarget = { kind: string; title: string; href: string };

const PER_KIND = 6;

const STATIC_PAGES: LinkTarget[] = [
  { kind: 'page', title: 'Home', href: '/' },
  { kind: 'page', title: 'Business directory', href: '/business-directory' },
  { kind: 'page', title: 'Business categories', href: '/business-categories' },
  { kind: 'page', title: 'Locations', href: '/locations' },
  { kind: 'page', title: 'Add your business', href: '/add-business' },
  { kind: 'page', title: 'Claim your business', href: '/claim-business' },
  { kind: 'page', title: 'Featured businesses', href: '/featured-businesses' },
  { kind: 'page', title: 'SEO services', href: '/seo-services' },
  { kind: 'page', title: 'Free SEO audit', href: '/seo-audit' },
  { kind: 'page', title: 'Pricing', href: '/pricing' },
  { kind: 'page', title: 'Blog', href: '/blog' },
  { kind: 'page', title: 'About', href: '/about' },
  { kind: 'page', title: 'Contact', href: '/contact' },
  { kind: 'page', title: 'Free SEO tools', href: TOOLS_BASE },
  ...SERVICE_PAGES.map((s) => ({ kind: 'service', title: s.name, href: s.path })),
  ...BLOG_CLUSTERS.map((c) => ({ kind: 'blog', title: c.name, href: c.path })),
  ...LIVE_TOOLS.map((t) => ({ kind: 'tool', title: t.name, href: toolHref(t) })),
];

/** A plain-text ilike pattern: the wildcards and escape character are taken literally. */
function contains(q: string): string {
  return `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
}

export async function searchLinkTargets(query: string): Promise<LinkTarget[]> {
  const q = typeof query === 'string' ? query.trim().slice(0, 100) : '';
  if (q.length < 2) return [];
  const user = await getCurrentUser();
  if (!user || !roleAtLeast(user.role, 'editor')) return [];

  const needle = q.toLowerCase();
  const pages = STATIC_PAGES.filter(
    (p) => p.title.toLowerCase().includes(needle) || p.href.includes(needle),
  ).slice(0, PER_KIND * 2);

  const supabase = await createClient();
  const pattern = contains(q);
  const [listings, categories, cities, posts] = await Promise.all([
    supabase.from('public_listings').select('slug, name').ilike('name', pattern).limit(PER_KIND),
    supabase.from('categories').select('slug, name').ilike('name', pattern).limit(PER_KIND),
    supabase.from('cities').select('slug, name').ilike('name', pattern).limit(PER_KIND),
    supabase
      .from('blog_posts')
      .select('slug, title')
      .eq('is_published', true)
      .ilike('title', pattern)
      .limit(PER_KIND),
  ]);
  for (const r of [listings, categories, cities, posts]) {
    if (r.error) console.error('searchLinkTargets', r.error.message);
  }

  const out: LinkTarget[] = [
    ...(categories.data ?? []).map((c) => ({
      kind: 'category',
      title: c.name as string,
      href: `/category/${c.slug}`,
    })),
    ...(cities.data ?? []).map((c) => ({
      kind: 'city',
      title: c.name as string,
      href: `/city/${c.slug}`,
    })),
    ...pages,
    ...(posts.data ?? []).map((p) => ({
      kind: 'blog',
      title: p.title as string,
      href: `/blog/${p.slug}`,
    })),
    ...(listings.data ?? []).map((l) => ({
      kind: 'listing',
      title: l.name as string,
      href: `/listing/${l.slug}`,
    })),
  ];
  // City slugs repeat across regions, so the same href can come back twice.
  const seen = new Set<string>();
  return out.filter((t) => !seen.has(t.href) && seen.add(t.href));
}
