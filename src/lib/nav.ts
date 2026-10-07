import type { MenuItem } from './queries';

/**
 * The navigation from the SEO strategy. Migration 0023 writes these into the
 * header and mobile menus (Admin → Menus); the layout falls back to them only
 * when a menu comes back empty, so the header never shows a lone "Home".
 *
 * The desktop bar holds the four hubs that fit beside the logo, the free-tools
 * menu and the two header buttons (the logo is its home link); the drawer
 * carries the full list, Home and Blog included.
 */
export const DEFAULT_PRIMARY_NAV: MenuItem[] = [
  { label: 'Find Businesses', url: '/business-directory', sort_order: 20 },
  { label: 'Categories', url: '/business-categories', sort_order: 30 },
  { label: 'Locations', url: '/locations', sort_order: 40 },
  { label: 'SEO Services', url: '/seo-services', sort_order: 50 },
];

export const DEFAULT_MOBILE_NAV: MenuItem[] = [
  { label: 'Find Businesses', url: '/business-directory', sort_order: 20 },
  { label: 'Add Your Business', url: '/add-business', sort_order: 30 },
  { label: 'Categories', url: '/business-categories', sort_order: 40 },
  { label: 'Locations', url: '/locations', sort_order: 50 },
  { label: 'Featured', url: '/featured-businesses', sort_order: 60 },
  { label: 'SEO Services', url: '/seo-services', sort_order: 70 },
  { label: 'Digital Marketing', url: '/digital-marketing', sort_order: 80 },
  { label: 'Blog', url: '/blog', sort_order: 90 },
];

/** Header buttons (strategy: "Add Your Business" + "Get an SEO Audit"). */
export const ADD_BUSINESS_HREF = '/dashboard/listings/new';
export const SEO_AUDIT_HREF = '/seo-audit';
