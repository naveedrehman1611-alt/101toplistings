import { degrade } from './degrade';
import { supabase } from './supabase';

export type Setting = Record<string, unknown>;

export type ListingCard = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  category_id: string | null;
  city_id: string | null;
  latitude: number | null;
  longitude: number | null;
  rating_average: number | null;
  review_count: number;
  is_featured: boolean;
  published_at: string | null;
  distance_km: number | null;
  total_count: number;
};

export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  is_featured: boolean;
};

export type City = {
  id: string;
  slug: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
  intro_copy: string | null;
  is_featured: boolean;
};

export type PageSection = {
  section_key: string;
  section_type: string;
  sort_order: number;
  heading: string | null;
  subheading: string | null;
  body: string | null;
  cta_label: string | null;
  cta_url: string | null;
  item_limit: number | null;
};

export type MenuItem = { label: string; url: string; sort_order: number };

/** Every user-visible string comes from the database (§9.5.1). */
export async function getSettings(): Promise<Record<string, unknown>> {
  const { data, error } = await supabase.from('settings').select('key, value');
  degrade('settings', error, null);
  const out: Record<string, unknown> = {};
  for (const row of data ?? []) out[row.key as string] = row.value;
  return out;
}

export function settingText(
  settings: Record<string, unknown>,
  key: string,
  fallback = '',
): string {
  const v = settings[key];
  return typeof v === 'string' ? v : fallback;
}

export async function getMenu(location: string, name?: string): Promise<MenuItem[]> {
  const { data: menus, error: menusError } = await supabase
    .from('menus')
    .select('id, name')
    .eq('location', location);
  degrade('menus', menusError, null);
  const menu = name ? menus?.find((m) => m.name === name) : menus?.[0];
  if (!menu) return [];
  const { data, error } = await supabase
    .from('menu_items')
    .select('label, url, sort_order')
    .eq('menu_id', menu.id)
    .eq('is_visible', true)
    .order('sort_order');
  return degrade('menu_items', error, (data ?? []) as MenuItem[]);
}

export async function getPageSections(slug: string): Promise<PageSection[]> {
  const { data: page, error: pageError } = await supabase
    .from('pages')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();
  degrade('pages', pageError, null);
  if (!page) return [];
  const { data, error } = await supabase
    .from('page_sections')
    .select(
      'section_key, section_type, sort_order, heading, subheading, body, cta_label, cta_url, item_limit',
    )
    .eq('page_id', page.id)
    .eq('is_enabled', true)
    .order('sort_order');
  return degrade('page_sections', error, (data ?? []) as PageSection[]);
}

export function findSection(sections: PageSection[], key: string): PageSection | undefined {
  return sections.find((s) => s.section_key === key);
}

export type SearchArgs = {
  query?: string;
  categoryId?: string;
  cityId?: string;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  sort?: 'nearest' | 'newest' | 'oldest' | 'rating' | 'alphabetical';
  limit?: number;
  offset?: number;
};

/**
 * Single entry point for listing search (§7.5.6). Keyword, category, location,
 * radius, rating, sort and paging all resolve server-side in one Postgres call —
 * no distance is ever computed in the browser (§7.5.4).
 */
export async function searchListings(args: SearchArgs): Promise<ListingCard[]> {
  const { data, error } = await supabase.rpc('search_listings', {
    p_query: args.query ?? null,
    p_category_id: args.categoryId ?? null,
    p_city_id: args.cityId ?? null,
    p_lat: args.lat ?? null,
    p_lng: args.lng ?? null,
    p_radius_km: args.radiusKm ?? null,
    p_sort: args.sort ?? 'newest',
    p_limit: args.limit ?? 12,
    p_offset: args.offset ?? 0,
  });
  // Used to throw. One restricted project then meant a 500 on the homepage and
  // a build that could not export at all, so it degrades now and the page says so.
  return degrade('search_listings', error, (data ?? []) as ListingCard[]);
}

/**
 * Single-entity reads must not turn an outage into a 404.
 *
 * These pages answer notFound() when the row is missing, which is right for a
 * slug that never existed and wrong for one the database simply would not
 * return: a real, indexed URL would 404 itself out of search results while the
 * quota is exhausted. So a transport or service error throws, the route renders
 * an error instead of a 404, and any previously built ISR page keeps serving.
 */
function throwIfUnavailable(context: string, error: { message: string } | null): void {
  if (!error) return;
  console.error(`[read:${context}] ${error.message}`);
  throw new Error(`${context} is temporarily unavailable`);
}

export async function getCategories(featuredOnly = false): Promise<Category[]> {
  let q = supabase
    .from('categories')
    .select('id, slug, name, description, icon, is_featured')
    .order('sort_order');
  if (featuredOnly) q = q.eq('is_featured', true);
  const { data, error } = await q;
  return degrade('categories', error, (data ?? []) as Category[]);
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const { data, error } = await supabase
    .from('categories')
    .select('id, slug, name, description, icon, is_featured')
    .eq('slug', slug)
    .maybeSingle();
  throwIfUnavailable('category', error);
  return (data as Category) ?? null;
}

export async function getCities(featuredOnly = false): Promise<City[]> {
  let q = supabase
    .from('cities')
    .select('id, slug, name, latitude, longitude, intro_copy, is_featured')
    .order('name');
  if (featuredOnly) q = q.eq('is_featured', true);
  const { data, error } = await q;
  return degrade('cities', error, (data ?? []) as City[]);
}

export async function getCityBySlug(slug: string): Promise<City | null> {
  const { data, error } = await supabase
    .from('cities')
    .select('id, slug, name, latitude, longitude, intro_copy, is_featured')
    .eq('slug', slug)
    .maybeSingle();
  throwIfUnavailable('city', error);
  return (data as City) ?? null;
}

export type ListingDetail = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  category_id: string | null;
  city_id: string | null;
  phone_primary: string | null;
  phone_secondary: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  postal_code: string | null;
  latitude: number | null;
  longitude: number | null;
  social_links: { label: string; url: string }[];
  video_url: string | null;
  rating_average: number | null;
  review_count: number;
  verification: string;
  published_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
};

export type OpeningHour = {
  day_of_week: number;
  opens_at: string | null;
  closes_at: string | null;
  is_closed: boolean;
  is_24h: boolean;
};

/** Reads the public projection, which omits every ownership/audit column (criterion 50). */
export async function getListing(slug: string): Promise<ListingDetail | null> {
  const { data, error } = await supabase
    .from('public_listings')
    .select(
      'id, slug, name, tagline, description, category_id, city_id, phone_primary, phone_secondary, email, website, address, postal_code, latitude, longitude, social_links, video_url, rating_average, review_count, verification, published_at, seo_title, seo_description',
    )
    .eq('slug', slug)
    .maybeSingle();
  throwIfUnavailable('listing', error);
  return (data as ListingDetail) ?? null;
}

export async function getOpeningHours(listingId: string): Promise<OpeningHour[]> {
  const { data, error } = await supabase
    .from('opening_hours')
    .select('day_of_week, opens_at, closes_at, is_closed, is_24h')
    .eq('listing_id', listingId)
    .order('day_of_week');
  return degrade('opening_hours', error, (data ?? []) as OpeningHour[]);
}

export async function getAllListingSlugs(): Promise<string[]> {
  const { data, error } = await supabase.from('public_listings').select('slug');
  // An empty list here means no listing pages are prerendered; they render on
  // demand instead. A throw would fail the whole build.
  return degrade('listing_slugs', error, (data ?? []).map((r) => r.slug as string));
}

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  standfirst: string | null;
  body: string | null;
  read_minutes: number | null;
  is_featured: boolean;
  published_at: string | null;
  category_id: string | null;
};

export async function getBlogPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('id, slug, title, standfirst, body, read_minutes, is_featured, published_at, category_id')
    .eq('is_published', true)
    .order('published_at', { ascending: false });
  return degrade('blog_posts', error, (data ?? []) as BlogPost[]);
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('id, slug, title, standfirst, body, read_minutes, is_featured, published_at, category_id')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();
  throwIfUnavailable('blog_post', error);
  return (data as BlogPost) ?? null;
}
