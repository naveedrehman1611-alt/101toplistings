/**
 * Old URLs that answer with a redirect, and the link normaliser built on them.
 *
 * Every internal link should point at the final 200 URL: a link to a redirect
 * costs crawlers a hop, and site audits flag every page that carries one. Code
 * links are written that way, but menu items and edited page copy come from the
 * database, where an old URL can outlive the route change. `canonicalHref()`
 * rewrites those at read time (getMenu, getPageSections, getPageContent and
 * Markdown links), so a stale stored link never reaches the page.
 *
 * next.config.ts spreads LEGACY_REDIRECTS into `redirects()` (after its host
 * redirect), so this is the only copy of the table. Keep this file free of
 * imports: next.config.ts loads it before the app is built.
 */

export type LegacyRedirect = { source: string; destination: string };

export const LEGACY_REDIRECTS: readonly LegacyRedirect[] = [
  // The reference site ran on WordPress; its public URLs map onto this app's routes.
  { source: '/listing-category/:slug', destination: '/category/:slug' },
  { source: '/listing-location/:slug', destination: '/city/:slug' },
  { source: '/listing-top-filter', destination: '/business-directory' },
  // The SEO strategy's URL structure (migration 0022).
  { source: '/listings', destination: '/business-directory' },
  { source: '/categories', destination: '/business-categories' },
  { source: '/services', destination: '/seo-services' },
  { source: '/submission', destination: '/dashboard/listings/new' },
  { source: '/about-us', destination: '/about' },
  { source: '/contact-us', destination: '/contact' },
  // Service pages merged into the page with the same search intent, and one slug renamed.
  { source: '/seo-services/global-seo', destination: '/seo-services/international-seo' },
  { source: '/seo-services/multilingual-seo', destination: '/seo-services/international-seo' },
  { source: '/seo-services/seo-reseller', destination: '/seo-services/white-label-seo' },
  { source: '/seo-services/bespoke-seo', destination: '/seo-services/custom-seo' },
  { source: '/seo-services/seo-for-online-stores', destination: '/seo-services/ecommerce-seo' },
  { source: '/seo-services/nationwide-seo', destination: '/seo-services/multi-location-seo' },
];

/** The public page that explains listing a business: the target of every "Add listing" CTA. */
export const ADD_BUSINESS_HREF = '/add-business';

/**
 * The listing form itself, for a button that starts it. /dashboard/listings/new
 * is a 307 to sign-in for every signed-out visitor (and every crawler), so the
 * link goes to sign-up first; a signed-in visitor is passed straight through.
 */
export const CREATE_LISTING_HREF = '/register?next=/dashboard/listings/new';

/**
 * A path for a `?next=` value. Slashes stay readable and any remaining percent
 * escapes use lowercase hex, so the URL carries no capitals ("%2F" would be
 * flagged by audits as an upper-case URL). Both forms decode to the same value.
 */
export function nextParam(path: string): string {
  return encodeURIComponent(path)
    .replace(/%2F/gi, '/')
    .replace(/%[0-9A-F]{2}/g, (m) => m.toLowerCase());
}

/** The sign-in (or sign-up) page, returning to `path` afterwards. */
export function signInHref(path: string, page: '/login' | '/register' = '/login'): string {
  return `${page}?next=${nextParam(path)}`;
}

function matchRedirect(path: string): string | null {
  const parts = path.split('/');
  for (const { source, destination } of LEGACY_REDIRECTS) {
    const want = source.split('/');
    if (want.length !== parts.length) continue;
    const params: Record<string, string> = {};
    const ok = want.every((seg, i) => {
      if (seg.startsWith(':')) {
        if (!parts[i]) return false;
        params[seg.slice(1)] = parts[i];
        return true;
      }
      return seg.toLowerCase() === parts[i].toLowerCase();
    });
    if (ok) return destination.replace(/:(\w+)/g, (_, name: string) => params[name] ?? '');
  }
  return null;
}

/** Sign-in-only areas: a signed-out visitor is redirected to /login (proxy.ts, auth.ts). */
function isGated(path: string): boolean {
  return /^\/(dashboard|admin)(\/|$)/i.test(path);
}

/**
 * The final URL of a same-site link: a trailing slash dropped (Next.js 308s
 * "/a/" to "/a"), static redirects followed, and a sign-in-only page swapped
 * for a page a signed-out visitor can open. External URLs, fragments and
 * anything else that is not a "/path" come back unchanged, and the query string
 * and fragment are kept (Next.js carries the query across its redirects too).
 */
export function canonicalHref(href: string): string {
  if (!href.startsWith('/') || href.startsWith('//')) return href;
  const cut = href.search(/[?#]/);
  let path = cut === -1 ? href : href.slice(0, cut);
  const rest = cut === -1 ? '' : href.slice(cut);
  if (path.length > 1) path = path.replace(/\/+$/, '') || '/';

  // Bounded: a redirect may lead to another (/submission → the listing form).
  for (let hop = 0; hop < 5; hop++) {
    const next = matchRedirect(path);
    if (next === null || next === path) break;
    path = next;
  }

  if (isGated(path)) {
    if (path.toLowerCase() === '/dashboard/listings/new') return CREATE_LISTING_HREF;
    const query = rest.startsWith('?') ? rest.split('#')[0] : '';
    return signInHref(`${path}${query}`);
  }
  return `${path}${rest}`;
}
