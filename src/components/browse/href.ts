import type { BrowseSort } from '@/lib/browse';

export type ListingsParams = {
  q?: string;
  category?: string;
  city?: string;
  sort?: BrowseSort;
  page?: number;
};

// Spelled out rather than read from BROWSE_SORTS so this module stays
// type-only against the data layer and is safe to import anywhere.
const DEFAULT_SORT: BrowseSort = 'featured';

/**
 * Every /business-directory link is built here. Keys always come out in the same order
 * and defaults are left out, so each view has exactly one URL.
 */
export function listingsHref(p: ListingsParams): string {
  const qs = new URLSearchParams();
  if (p.q) qs.set('q', p.q);
  if (p.category) qs.set('category', p.category);
  if (p.city) qs.set('city', p.city);
  if (p.sort && p.sort !== DEFAULT_SORT) qs.set('sort', p.sort);
  if (p.page && p.page > 1) qs.set('page', String(p.page));
  const s = qs.toString();
  return s ? `/business-directory?${s}` : '/business-directory';
}
