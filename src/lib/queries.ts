import { cache } from 'react';
import { supabase } from './supabase';

/**
 * Every read below used to end in `data ?? []`, which makes a failed request
 * indistinguishable from an empty table: if the project is restricted, the key
 * is rotated or RLS changes, the site renders its empty states and reports
 * nothing. Routing every read through here keeps the graceful fallback but
 * makes the failure visible in the server logs.
 */
function reportError(what: string, error: { message: string; code?: string } | null): void {
  if (!error) return;
  console.error(`[supabase] ${what} failed: ${error.message}${error.code ? ` (${error.code})` : ''}`);
}

type Result<T> = { data: T | null; error: { message: string; code?: string } | null };

async function read<T>(what: string, q: PromiseLike<Result<T>>): Promise<T | null> {
  const { data, error } = await q;
  reportError(what, error);
  return data;
}

async function readList<T>(what: string, q: PromiseLike<Result<T[]>>): Promise<T[]> {
  return (await read(what, q)) ?? [];
}

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
export const getSettings = cache(async function getSettings(): Promise<Record<string, unknown>> {
  const data = await readList('settings.select', supabase.from('settings').select('key, value'));
  const out: Record<string, unknown> = {};
  for (const row of data) out[row.key as string] = row.value;
  return out;
});

export function settingText(
  settings: Record<string, unknown>,
  key: string,
  fallback = '',
): string {
  const v = settings[key];
  return typeof v === 'string' ? v : fallback;
}

/**
 * One round trip, not two: the menu row is matched through an inner join rather
 * than fetched first and joined in JS. The root layout renders four menus on
 * every route, so the saving is four requests per render.
 */
export const getMenu = cache(async function getMenu(
  location: string,
  name?: string,
): Promise<MenuItem[]> {
  let q = supabase
    .from('menu_items')
    .select('label, url, sort_order, menus!inner(location, name)')
    .eq('menus.location', location)
    .eq('is_visible', true)
    .order('sort_order');
  if (name) q = q.eq('menus.name', name);
  const rows = await readList('menu_items.select', q);
  return rows.map(({ label, url, sort_order }) => ({ label, url, sort_order })) as MenuItem[];
});

export const getPageSections = cache(async function getPageSections(
  slug: string,
): Promise<PageSection[]> {
  const rows = await readList(
    'page_sections.select',
    supabase
      .from('page_sections')
      .select(
        'section_key, section_type, sort_order, heading, subheading, body, cta_label, cta_url, item_limit, pages!inner(slug)',
      )
      .eq('pages.slug', slug)
      .eq('is_enabled', true)
      .order('sort_order'),
  );
  // The joined `pages` row is a filter, not payload — drop it before it reaches
  // the components.
  return rows.map((row) => {
    const { pages, ...section } = row as PageSection & { pages: unknown };
    void pages;
    return section;
  }) as PageSection[];
});

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
  // Deliberately throws rather than returning []. A failed search that renders
  // "No listings yet" is indistinguishable from an empty directory; throwing
  // surfaces the failure in the runtime error tracker, and on an ISR route it
  // keeps the last good page being served instead of replacing it with an
  // empty one.
  if (error) throw new Error(`search_listings failed: ${error.message}`);
  return (data ?? []) as ListingCard[];
}

export const getCategories = cache(async function getCategories(
  featuredOnly = false,
): Promise<Category[]> {
  let q = supabase
    .from('categories')
    .select('id, slug, name, description, icon, is_featured')
    .order('sort_order');
  if (featuredOnly) q = q.eq('is_featured', true);
  return (await readList('categories.select', q)) as Category[];
});

export const getCategoryBySlug = cache(async function getCategoryBySlug(
  slug: string,
): Promise<Category | null> {
  const data = await read(
    'categories.bySlug',
    supabase
      .from('categories')
      .select('id, slug, name, description, icon, is_featured')
      .eq('slug', slug)
      .maybeSingle(),
  );
  return (data as Category | null) ?? null;
});

export const getCities = cache(async function getCities(featuredOnly = false): Promise<City[]> {
  let q = supabase
    .from('cities')
    .select('id, slug, name, latitude, longitude, intro_copy, is_featured')
    .order('name');
  if (featuredOnly) q = q.eq('is_featured', true);
  return (await readList('cities.select', q)) as City[];
});

export const getCityBySlug = cache(async function getCityBySlug(slug: string): Promise<City | null> {
  const data = await read(
    'cities.bySlug',
    supabase
      .from('cities')
      .select('id, slug, name, latitude, longitude, intro_copy, is_featured')
      .eq('slug', slug)
      .maybeSingle(),
  );
  return (data as City | null) ?? null;
});

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
export const getListing = cache(async function getListing(
  slug: string,
): Promise<ListingDetail | null> {
  const data = await read(
    'public_listings.bySlug',
    supabase
    .from('public_listings')
    .select(
      'id, slug, name, tagline, description, category_id, city_id, phone_primary, phone_secondary, email, website, address, postal_code, latitude, longitude, social_links, rating_average, review_count, verification, published_at, seo_title, seo_description',
    )
      .eq('slug', slug)
      .maybeSingle(),
  );
  return (data as ListingDetail | null) ?? null;
});

export async function getOpeningHours(listingId: string): Promise<OpeningHour[]> {
  return (await readList(
    'opening_hours.select',
    supabase
      .from('opening_hours')
      .select('day_of_week, opens_at, closes_at, is_closed, is_24h')
      .eq('listing_id', listingId)
      .order('day_of_week'),
  )) as OpeningHour[];
}

/**
 * Slugs only, and always bounded. An unbounded select over the largest table on
 * the site is how a sitemap or a build quietly turns into the biggest egress
 * item there is; callers that prerender pass a small limit and let ISR cover
 * the rest.
 */
export async function getAllListingSlugs(limit = 5000): Promise<string[]> {
  const rows = await readList(
    'public_listings.slugs',
    supabase
      .from('public_listings')
      .select('slug')
      .order('published_at', { ascending: false })
      .limit(limit),
  );
  return rows.map((r) => (r as { slug: string }).slug);
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

/** Everything about a post except the article body. */
export type BlogPostSummary = Omit<BlogPost, 'body'>;

const POST_SUMMARY_COLUMNS =
  'id, slug, title, standfirst, read_minutes, is_featured, published_at, category_id';

/**
 * The index, the related-articles rail and the sitemap all need titles and
 * slugs, never the article text. Selecting `body` there shipped every post in
 * full on pages that render none of it — the single largest over-fetch in the
 * read path.
 */
export const getBlogPosts = cache(async function getBlogPosts(
  limit = 50,
): Promise<BlogPostSummary[]> {
  return (await readList(
    'blog_posts.select',
    supabase
      .from('blog_posts')
      .select(POST_SUMMARY_COLUMNS)
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(limit),
  )) as BlogPostSummary[];
});

/** The one place the body is needed: the article page itself. */
export const getBlogPost = cache(async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const data = await read(
    'blog_posts.bySlug',
    supabase
      .from('blog_posts')
      .select(`${POST_SUMMARY_COLUMNS}, body`)
      .eq('slug', slug)
      .eq('is_published', true)
      .maybeSingle(),
  );
  return (data as BlogPost | null) ?? null;
});
