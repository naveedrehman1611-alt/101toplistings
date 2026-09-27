import type { Metadata, ResolvingMetadata } from 'next';
import { supabase } from './supabase';

/**
 * Per-route SEO overrides for the static public routes (§9.5.4), stored in
 * seo_meta by `route`. Pages keep their own defaults in code; an override only
 * replaces the fields an editor actually filled in, so an empty row changes
 * nothing.
 */

export const SEO_ROUTES = [
  { route: '/', label: 'Home' },
  { route: '/listings', label: 'All listings' },
  { route: '/categories', label: 'Categories' },
  { route: '/blog', label: 'Blog' },
  { route: '/about', label: 'About' },
  { route: '/contact', label: 'Contact' },
  { route: '/privacy', label: 'Privacy Policy' },
  { route: '/terms', label: 'Terms of Service' },
  // Always noindex and disallowed in robots.ts: result pages are thin and
  // endless. Its title and description can still be changed.
  { route: '/search', label: 'Search' },
] as const;

export type SeoRoute = (typeof SEO_ROUTES)[number]['route'];

export function isSeoRoute(value: string): value is SeoRoute {
  return SEO_ROUTES.some((r) => r.route === value);
}

export type SeoOverride = {
  title: string | null;
  description: string | null;
  noindex: boolean;
  inSitemap: boolean;
};

/** The stored robots value for the "hide from search engines" toggle. */
export const NOINDEX_ROBOTS = 'noindex, follow';

/** The override for one route, or null when there is none (or it cannot be read). */
export async function getSeoOverride(route: SeoRoute): Promise<SeoOverride | null> {
  const { data } = await supabase
    .from('seo_meta')
    .select('title, description, robots, in_sitemap')
    .eq('route', route)
    .maybeSingle();
  if (!data) return null;
  return {
    title: data.title,
    description: data.description,
    noindex: typeof data.robots === 'string' && data.robots.includes('noindex'),
    inSitemap: data.in_sitemap,
  };
}

/**
 * The page's own metadata with the stored override laid over it. Open Graph
 * and Twitter are merged too, because Next.js merges metadata shallowly: a
 * page that sets openGraph replaces the layout's whole object, so its title
 * has to change there as well or share cards keep the old one.
 *
 * A page with no metadata of its own (the home page) passes `parent`, so the
 * replacement Open Graph object can keep the layout's site name.
 */
export async function seoMetadata(
  route: SeoRoute,
  base: Metadata,
  parent?: ResolvingMetadata,
): Promise<Metadata> {
  const o = await getSeoOverride(route);
  if (!o) return base;

  const text: { title?: string; description?: string } = {};
  if (o.title) text.title = o.title;
  if (o.description) text.description = o.description;

  const merged: Metadata = { ...base };
  // The home page's default title is the full site title, not "x · Brand",
  // so its override escapes the layout's template the same way.
  if (text.title) merged.title = route === '/' ? { absolute: text.title } : text.title;
  if (text.description) merged.description = text.description;
  if (text.title || text.description) {
    if (base.openGraph) {
      merged.openGraph = { ...base.openGraph, ...text };
    } else if (parent) {
      const { openGraph } = await parent;
      merged.openGraph = { siteName: openGraph?.siteName, type: 'website', url: '/', ...text };
    }
    if (base.twitter || parent) {
      merged.twitter = { card: 'summary_large_image', ...base.twitter, ...text };
    }
  }
  if (o.noindex) merged.robots = { index: false, follow: true };
  return merged;
}

/**
 * Static routes the sitemap should leave out: those switched off in the SEO
 * manager, and those set to noindex — listing a page we ask crawlers not to
 * index only sends them mixed signals.
 */
export async function getSitemapExclusions(): Promise<Set<string>> {
  const { data } = await supabase
    .from('seo_meta')
    .select('route, robots, in_sitemap')
    .not('route', 'is', null);
  const out = new Set<string>();
  for (const row of data ?? []) {
    const noindex = typeof row.robots === 'string' && row.robots.includes('noindex');
    if (!row.in_sitemap || noindex) out.add(row.route as string);
  }
  return out;
}
