import type { Metadata } from 'next';
import { SITE_URL, supabase } from './supabase';
import { getSettings, settingText } from './queries';

/**
 * Per-route SEO overrides for the static public routes (§9.5.4), stored in
 * seo_meta by `route`. Pages keep their own defaults in code; an override only
 * replaces the fields an editor actually filled in, so an empty row changes
 * nothing.
 */

export const SEO_ROUTES = [
  { route: '/', label: 'Home' },
  { route: '/business-directory', label: 'Business directory' },
  { route: '/add-business', label: 'Add your business' },
  { route: '/business-categories', label: 'Business categories' },
  { route: '/locations', label: 'Locations' },
  { route: '/claim-business', label: 'Claim your listing' },
  { route: '/featured-businesses', label: 'Featured businesses' },
  { route: '/seo-services', label: 'SEO services' },
  { route: '/seo-services/local-seo', label: 'Local SEO' },
  { route: '/seo-services/technical-seo', label: 'Technical SEO' },
  { route: '/seo-services/on-page-seo', label: 'On-page SEO' },
  { route: '/seo-services/link-building', label: 'Link building' },
  { route: '/seo-services/content-marketing', label: 'Content marketing' },
  { route: '/digital-marketing', label: 'Digital marketing' },
  { route: '/web-development-services', label: 'Web development' },
  {
    route: '/web-development-services/wordpress-development',
    label: 'Web development: WordPress',
  },
  {
    route: '/web-development-services/nextjs-react-development',
    label: 'Web development: Next.js & React',
  },
  {
    route: '/web-development-services/ecommerce-website-development',
    label: 'Web development: Ecommerce',
  },
  { route: '/seo-audit', label: 'SEO audit' },
  { route: '/pricing', label: 'Pricing' },
  { route: '/blog', label: 'Blog' },
  { route: '/blog/business-directory', label: 'Blog: directory guides' },
  { route: '/blog/seo', label: 'Blog: SEO guides' },
  { route: '/blog/digital-marketing', label: 'Blog: digital marketing guides' },
  { route: '/about', label: 'About' },
  { route: '/contact', label: 'Contact' },
  { route: '/privacy', label: 'Privacy policy' },
  { route: '/terms', label: 'Terms of use' },
  // Always noindex: result pages are thin and endless. Not disallowed in
  // robots.ts, so crawlers can read that noindex. Its title and description
  // can still be changed.
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

/**
 * §7.5.7 / criterion 47 — a city page with fewer published listings than this
 * is noindex rather than thin. The sitemap reads the same number, so a city is
 * never submitted while it asks not to be indexed, and it joins the sitemap on
 * its own once enough listings are approved.
 */
export const MIN_CITY_LISTINGS_TO_INDEX = 5;

/**
 * The same rule for category pages: one with only a handful of approved
 * listings is a near-empty page repeated across the taxonomy, so it is noindex
 * and out of the sitemap until enough listings are approved into it (or any of
 * its subcategories).
 */
export const MIN_CATEGORY_LISTINGS_TO_INDEX = 5;

/**
 * Canonical and robots for a city or category results page. A noindex page
 * never carries a canonical (see pageMetadata), so each case gets one or the
 * other:
 *
 * - `thin` (the listing threshold above): noindex, with every page, order and
 *   filter of it. No canonical: its only target would be a noindex URL.
 * - `filtered` (?q=, ?city=, ?category=): a different subset of listings, so
 *   not a duplicate of the plain page. Noindex, no canonical; the category and
 *   city pages are the indexable versions of those filters.
 * - Otherwise indexable. Page 2+ is its own canonical: pointing it at page 1
 *   tells Google the listings further down are duplicates, so they are never
 *   discovered there. A ?sort= copy is the same listings in another order, so
 *   the caller leaves it out of `filtered` and it canonicals to the plain page
 *   (an indexable URL) instead of being indexed once per order.
 */
export function resultsPageSeo(
  path: string,
  page: number,
  filtered: boolean,
  thin: boolean,
): Pick<Metadata, 'alternates' | 'robots'> {
  if (thin || filtered) return { robots: { index: false, follow: true } };
  return { alternates: { canonical: `${SITE_URL}${path}${page > 1 ? `?page=${page}` : ''}` } };
}

/**
 * The site-wide share image (src/app/opengraph-image.tsx). The root file only
 * reaches pages that set no openGraph of their own: Next.js replaces the whole
 * openGraph object per page, so pageMetadata() lists this again for any page
 * without an image of its own.
 */
export const SHARE_IMAGE = {
  url: '/opengraph-image',
  width: 1200,
  height: 630,
  alt: 'RankYouSite: add a free business listing and grow with SEO',
};

/** `${SITE_URL}/path` for a site path ("/" is SITE_URL itself); an absolute URL is kept. */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  const p = path.startsWith('/') ? path : `/${path}`;
  return p === '/' ? SITE_URL : `${SITE_URL}${p}`;
}

/** First path segments on x.com that are pages of X itself, not profiles. */
const X_RESERVED = new Set([
  'home',
  'i',
  'intent',
  'share',
  'search',
  'explore',
  'hashtag',
  'settings',
  'login',
  'signup',
  'messages',
  'notifications',
]);

/**
 * The "@handle" in an X (Twitter) profile URL such as https://x.com/handle or
 * twitter.com/@handle, for twitter:site and twitter:creator. Anything that is
 * not a profile URL gives undefined: no handle is better than a made-up one.
 */
export function xHandle(profileUrl: string): string | undefined {
  const value = profileUrl.trim();
  if (!value) return undefined;
  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
  } catch {
    return undefined;
  }
  if (!/^(?:www\.|mobile\.)?(?:x|twitter)\.com$/i.test(url.hostname)) return undefined;
  const name = url.pathname.split('/').filter(Boolean)[0]?.replace(/^@/, '');
  if (!name || !/^[A-Za-z0-9_]{1,15}$/.test(name) || X_RESERVED.has(name.toLowerCase())) {
    return undefined;
  }
  return `@${name}`;
}

/** True when a robots value asks not to be indexed. */
export function isNoindex(robots: Metadata['robots']): boolean {
  if (!robots) return false;
  if (typeof robots === 'string') return /\b(?:noindex|none)\b/i.test(robots);
  return robots.index === false;
}

type Alternates = NonNullable<Metadata['alternates']>;

function canonicalOf(canonical: Alternates['canonical']): string | undefined {
  if (!canonical) return undefined;
  if (typeof canonical === 'string') return canonical;
  if (canonical instanceof URL) return canonical.toString();
  return canonical.url.toString();
}

/** The plain text of a title that may be a template object. */
function plainTitle(title: Metadata['title']): string | undefined {
  if (!title) return undefined;
  if (typeof title === 'string') return title;
  if ('absolute' in title && title.absolute) return title.absolute;
  return 'default' in title ? title.default : undefined;
}

/**
 * Completes a page's metadata. Every public page's metadata goes through this
 * (seoMetadata() calls it), because Next.js merges metadata shallowly: a page
 * that sets openGraph or twitter replaces the layout's whole object, and with
 * it the site name, URL, image and X account.
 *
 * - Canonical: an indexable page keeps the canonical it set, or gets `path`
 *   (its own URL) as a self canonical. A noindex page gets none: a canonical
 *   on a noindex page, or one pointing at a noindex URL, is a contradictory
 *   signal, and Google advises against mixing the two. Both are absolute.
 * - Open Graph: title, description, url (the canonical, else `path`), type
 *   (website unless the page set one), site name, and images (the page's own,
 *   else SHARE_IMAGE with its size and alt text).
 * - Twitter: card, title, description and images, defaulting to the Open
 *   Graph values, plus site/creator from the X profile URL in Settings
 *   (social.x) when one is set.
 *
 * Fields the page set itself win over every default above, except og:url,
 * which always follows the canonical.
 */
export async function pageMetadata(path: string, meta: Metadata): Promise<Metadata> {
  const settings = await getSettings();
  const siteName = settingText(settings, 'brand.name', 'RankYouSite');
  const handle = xHandle(settingText(settings, 'social.x'));

  const { canonical: ownCanonical, ...otherAlternates } = meta.alternates ?? {};
  const own = canonicalOf(ownCanonical);
  const canonical = isNoindex(meta.robots) ? undefined : absoluteUrl(own ?? path);

  const og = meta.openGraph ?? {};
  const title = plainTitle(og.title) ?? plainTitle(meta.title);
  const description = og.description ?? meta.description ?? undefined;
  const images = og.images ?? [SHARE_IMAGE];
  const openGraph = {
    ...og,
    type: ('type' in og && og.type) || 'website',
    siteName: og.siteName ?? siteName,
    url: canonical ?? (og.url ? og.url : absoluteUrl(path)),
    title,
    description,
    images,
  } as Metadata['openGraph'];

  const tw = meta.twitter ?? {};
  const twitter = {
    ...tw,
    card: ('card' in tw && tw.card) || 'summary_large_image',
    title: plainTitle(tw.title) ?? title,
    description: tw.description ?? description,
    images: tw.images ?? images,
    ...(handle ? { site: tw.site ?? handle, creator: tw.creator ?? handle } : {}),
  } as Metadata['twitter'];

  const out: Metadata = { ...meta, openGraph, twitter };
  delete out.alternates;
  if (canonical) out.alternates = { ...otherAlternates, canonical };
  else if (Object.keys(otherAlternates).length > 0) out.alternates = otherAlternates;
  return out;
}

/**
 * An editor-written title without a trailing brand ("Local SEO | RankYouSite"),
 * since the root layout's title template adds the brand itself; without this
 * the brand shows twice. The old spellings are matched too.
 */
export function withoutBrandSuffix(title: string, brand: string): string {
  const names = [brand, 'RankYouSite', 'RankYourSite', 'Rank Your Site', 'Rank You Site']
    .filter(Boolean)
    .map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const re = new RegExp(`\\s*[|\\-–—·:]\\s*(?:${names.join('|')})\\s*$`, 'i');
  const stripped = title.replace(re, '').trim();
  return stripped || title;
}

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
 * The page's own metadata with the stored override laid over it, completed by
 * pageMetadata(): the route is its own canonical (unless the page set one, or
 * the page is noindex) and its Open Graph and Twitter tags are filled in.
 *
 * The override's title and description replace the page's Open Graph and
 * Twitter copy too, or share cards would keep the old text. Set `robots` on
 * `base` (not on the result) for a page that is noindex in some states, so
 * pageMetadata() can leave its canonical out.
 */
export async function seoMetadata(route: SeoRoute, base: Metadata): Promise<Metadata> {
  const o = await getSeoOverride(route);
  const merged: Metadata = { ...base };
  if (o) {
    const text: { title?: string; description?: string } = {};
    if (o.title) {
      text.title =
        route === '/'
          ? o.title
          : withoutBrandSuffix(
              o.title,
              settingText(await getSettings(), 'brand.name', 'RankYouSite'),
            );
    }
    if (o.description) text.description = o.description;
    // The home page's default title is the full site title, not "x · Brand",
    // so its override escapes the layout's template the same way.
    if (text.title) merged.title = route === '/' ? { absolute: text.title } : text.title;
    if (text.description) merged.description = text.description;
    if (text.title || text.description) {
      merged.openGraph = { ...base.openGraph, ...text };
      merged.twitter = { ...base.twitter, ...text };
    }
    if (o.noindex) merged.robots = { index: false, follow: true };
  }
  return pageMetadata(route, merged);
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
