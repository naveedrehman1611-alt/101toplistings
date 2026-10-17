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
  { source: '/seo-services/bespoke-seo', destination: '/seo-services/seo-consulting' },
  { source: '/seo-services/seo-for-online-stores', destination: '/seo-services/ecommerce-seo' },
  { source: '/seo-services/nationwide-seo', destination: '/seo-services/multi-location-seo' },
  // Service pages retired in the October 2026 catalogue cut, each sent to the kept
  // page with the closest intent (a page with none goes to the hub).
  // Link work merged into link building.
  { source: '/seo-services/off-page-seo', destination: '/seo-services/link-building' },
  { source: '/seo-services/guest-posting', destination: '/seo-services/link-building' },
  { source: '/seo-services/white-hat-seo', destination: '/seo-services/link-building' },
  // Planning and management services merged into consulting.
  { source: '/seo-services/custom-seo', destination: '/seo-services/seo-consulting' },
  { source: '/seo-services/seo-strategy', destination: '/seo-services/seo-consulting' },
  { source: '/seo-services/seo-management', destination: '/seo-services/seo-consulting' },
  { source: '/seo-services/freelance-seo', destination: '/seo-services/seo-consulting' },
  { source: '/seo-services/enterprise-seo', destination: '/seo-services/seo-consulting' },
  // AI and voice search pages merged into GEO and AEO.
  { source: '/seo-services/ai-seo', destination: '/seo-services/geo-services' },
  { source: '/seo-services/voice-search-seo', destination: '/seo-services/aeo-services' },
  // Agency, reseller and outsourcing pages merged into white label SEO.
  { source: '/seo-services/outsourced-seo', destination: '/seo-services/white-label-seo' },
  { source: '/seo-services/offshore-seo', destination: '/seo-services/white-label-seo' },
  { source: '/seo-services/agency-seo', destination: '/seo-services/white-label-seo' },
  // Platform and store pages merged into the closest kept page.
  { source: '/seo-services/woocommerce-seo', destination: '/seo-services/wordpress-seo' },
  { source: '/seo-services/b2c-seo', destination: '/seo-services/ecommerce-seo' },
  { source: '/seo-services/retail-seo', destination: '/seo-services/ecommerce-seo' },
  { source: '/seo-services/fashion-seo', destination: '/seo-services/ecommerce-seo' },
  { source: '/seo-services/jeweler-seo', destination: '/seo-services/ecommerce-seo' },
  { source: '/seo-services/cosmetics-seo', destination: '/seo-services/ecommerce-seo' },
  { source: '/seo-services/furniture-store-seo', destination: '/seo-services/ecommerce-seo' },
  { source: '/seo-services/mobile-seo', destination: '/seo-services/technical-seo' },
  { source: '/seo-services/video-seo', destination: '/seo-services/content-marketing' },
  { source: '/seo-services/youtube-seo', destination: '/seo-services/content-marketing' },
  { source: '/seo-services/seo-for-bloggers', destination: '/seo-services/content-marketing' },
  // Business-type pages merged into small business, SaaS and multi-location SEO.
  { source: '/seo-services/lead-generation-seo', destination: '/seo-services/small-business-seo' },
  { source: '/seo-services/startup-seo', destination: '/seo-services/small-business-seo' },
  { source: '/seo-services/fintech-seo', destination: '/seo-services/saas-seo' },
  { source: '/seo-services/it-company-seo', destination: '/seo-services/saas-seo' },
  { source: '/seo-services/franchise-seo', destination: '/seo-services/multi-location-seo' },
  // Trade pages merged into the home services umbrella.
  { source: '/seo-services/contractor-seo', destination: '/seo-services/home-services-seo' },
  { source: '/seo-services/pest-control-seo', destination: '/seo-services/home-services-seo' },
  { source: '/seo-services/plumber-seo', destination: '/seo-services/home-services-seo' },
  { source: '/seo-services/electrician-seo', destination: '/seo-services/home-services-seo' },
  { source: '/seo-services/moving-company-seo', destination: '/seo-services/home-services-seo' },
  { source: '/seo-services/security-company-seo', destination: '/seo-services/home-services-seo' },
  { source: '/seo-services/hvac-seo', destination: '/seo-services/home-services-seo' },
  { source: '/seo-services/roofer-seo', destination: '/seo-services/home-services-seo' },
  { source: '/seo-services/landscaper-seo', destination: '/seo-services/home-services-seo' },
  { source: '/seo-services/restoration-seo', destination: '/seo-services/home-services-seo' },
  { source: '/seo-services/locksmith-seo', destination: '/seo-services/home-services-seo' },
  { source: '/seo-services/garage-door-seo', destination: '/seo-services/home-services-seo' },
  { source: '/seo-services/cleaning-company-seo', destination: '/seo-services/home-services-seo' },
  { source: '/seo-services/painter-seo', destination: '/seo-services/home-services-seo' },
  { source: '/seo-services/fencing-company-seo', destination: '/seo-services/home-services-seo' },
  { source: '/seo-services/appliance-repair-seo', destination: '/seo-services/home-services-seo' },
  { source: '/seo-services/window-cleaner-seo', destination: '/seo-services/home-services-seo' },
  // Legal, finance and advisory pages merged into the professional firms umbrella.
  { source: '/seo-services/seo-for-lawyers', destination: '/seo-services/professional-firms-seo' },
  {
    source: '/seo-services/personal-injury-seo',
    destination: '/seo-services/professional-firms-seo',
  },
  { source: '/seo-services/accounting-seo', destination: '/seo-services/professional-firms-seo' },
  { source: '/seo-services/architecture-seo', destination: '/seo-services/professional-firms-seo' },
  { source: '/seo-services/insurance-seo', destination: '/seo-services/professional-firms-seo' },
  { source: '/seo-services/banking-seo', destination: '/seo-services/professional-firms-seo' },
  {
    source: '/seo-services/financial-services-seo',
    destination: '/seo-services/professional-firms-seo',
  },
  // Dental specialties merged into the dental page.
  { source: '/seo-services/orthodontist-seo', destination: '/seo-services/seo-for-dentists' },
  { source: '/seo-services/periodontist-seo', destination: '/seo-services/seo-for-dentists' },
  // Single-location business pages merged into local SEO.
  { source: '/seo-services/real-estate-seo', destination: '/seo-services/local-seo' },
  { source: '/seo-services/seo-for-doctors', destination: '/seo-services/local-seo' },
  { source: '/seo-services/restaurant-seo', destination: '/seo-services/local-seo' },
  { source: '/seo-services/hotel-seo', destination: '/seo-services/local-seo' },
  { source: '/seo-services/car-dealer-seo', destination: '/seo-services/local-seo' },
  { source: '/seo-services/plastic-surgery-seo', destination: '/seo-services/local-seo' },
  { source: '/seo-services/photography-seo', destination: '/seo-services/local-seo' },
  { source: '/seo-services/funeral-home-seo', destination: '/seo-services/local-seo' },
  { source: '/seo-services/veterinarian-seo', destination: '/seo-services/local-seo' },
  { source: '/seo-services/acupuncturist-seo', destination: '/seo-services/local-seo' },
  { source: '/seo-services/chiropractor-seo', destination: '/seo-services/local-seo' },
  { source: '/seo-services/hospital-seo', destination: '/seo-services/local-seo' },
  { source: '/seo-services/body-shop-seo', destination: '/seo-services/local-seo' },
  { source: '/seo-services/self-storage-seo', destination: '/seo-services/local-seo' },
  { source: '/seo-services/food-delivery-seo', destination: '/seo-services/local-seo' },
  // Retired pages with no close match go to the services hub.
  { source: '/seo-services/national-seo', destination: '/seo-services' },
  { source: '/seo-services/travel-seo', destination: '/seo-services' },
  { source: '/seo-services/education-seo', destination: '/seo-services' },
  { source: '/seo-services/manufacturing-seo', destination: '/seo-services' },
  { source: '/seo-services/non-profit-seo', destination: '/seo-services' },
  { source: '/seo-services/logistics-seo', destination: '/seo-services' },
  { source: '/seo-services/igaming-seo', destination: '/seo-services' },
  { source: '/seo-services/crypto-seo', destination: '/seo-services' },
  { source: '/seo-services/industrial-seo', destination: '/seo-services' },
  { source: '/seo-services/app-store-optimization', destination: '/seo-services' },
  { source: '/seo-services/reverse-seo', destination: '/seo-services' },
  { source: '/seo-services/automated-seo', destination: '/seo-services' },
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
