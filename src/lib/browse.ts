/**
 * The /business-directory browse view: featured listings pinned first, 15 per page, each
 * row carrying category, city, open/closed state, phone, published date and a
 * short excerpt, plus a directory-wide summary (totals, top categories, top
 * cities).
 *
 * It reads the public_listings view directly rather than search_listings. The
 * RPC can neither pin featured listings nor return phone or description, and
 * changing it would need a migration applied to the database before this code
 * could deploy. Every read here is a GET, so it goes through the Data Cache.
 */
import { coverUrls, reportError, type Category, type City } from './queries';
import { openStatus, type HoursRow } from './open-status';
import { supabase } from './supabase';

export const BROWSE_PER_PAGE = 15;

/**
 * Listings carry no timezone of their own, and the directory is Pakistani, so
 * "open now" and every published date are read in Pakistan time. Fixing the
 * zone keeps the output the same on every server, whatever its locale.
 */
export const SITE_TIME_ZONE = 'Asia/Karachi';

export type BrowseSort = 'featured' | 'newest' | 'oldest' | 'rating' | 'alphabetical';

/** Toolbar order. The first entry is the default and is left out of URLs. */
export const BROWSE_SORTS: { key: BrowseSort; label: string }[] = [
  { key: 'featured', label: 'Featured first' },
  { key: 'newest', label: 'Newest' },
  { key: 'oldest', label: 'Oldest' },
  { key: 'rating', label: 'Highest rated' },
  { key: 'alphabetical', label: 'A–Z' },
];

export function parseBrowseSort(v: string | undefined): BrowseSort {
  return BROWSE_SORTS.find((s) => s.key === v)?.key ?? 'featured';
}

/** `null` means no opening hours are on file, so no badge is shown. */
export type OpenState = 'open' | 'closed' | null;

export type TaxonomyRef = { slug: string; name: string };

export type BrowseRow = {
  id: string;
  slug: string;
  name: string;
  /** Tagline, else the start of the description as plain text; null when neither exists. */
  excerpt: string | null;
  category: TaxonomyRef | null;
  city: TaxonomyRef | null;
  /** Trimmed; null when blank. Shown as entered, dialled only when it looks like a number. */
  phone: string | null;
  isFeatured: boolean;
  /** ISO timestamp. */
  publishedAt: string | null;
  rating: number | null;
  reviewCount: number;
  coverUrl: string | null;
  open: OpenState;
};

export type BrowseResult = { rows: BrowseRow[]; total: number };

export type FacetCount = TaxonomyRef & { count: number };

export type DirectoryFacets = {
  total: number;
  featured: number;
  withPhone: number;
  /** Categories and cities with at least one approved listing. */
  categoryCount: number;
  cityCount: number;
  /** Top 20 each, by count descending, then name ascending. */
  topCategories: FacetCount[];
  topCities: FacetCount[];
};

export type BrowseArgs = {
  query?: string;
  categoryId?: string;
  cityId?: string;
  sort: BrowseSort;
  /** 1-based, already bounded by parsePage. */
  page: number;
  /** Already loaded by the page; used to resolve ids to slugs and names. */
  categories: Category[];
  cities: City[];
  /** Passed in so "open now" is computed against one clock per request. */
  now: Date;
};

const LISTING_COLUMNS =
  'id, slug, name, tagline, description, category_id, city_id, phone_primary, is_featured, published_at, rating_average, review_count';

type ListingRow = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  category_id: string | null;
  city_id: string | null;
  phone_primary: string | null;
  is_featured: boolean;
  published_at: string | null;
  rating_average: number | null;
  review_count: number;
};

type Order = { column: string; ascending: boolean; nullsFirst?: boolean };

const NEWEST: Order = { column: 'published_at', ascending: false, nullsFirst: false };

/**
 * Every sort then falls back to id. Rows that tie (all the unrated listings,
 * say) otherwise come back in no fixed order, and OFFSET paging can show one of
 * them twice or never.
 */
const SORT_ORDER: Record<BrowseSort, Order[]> = {
  featured: [{ column: 'is_featured', ascending: false }, NEWEST],
  newest: [NEWEST],
  oldest: [{ column: 'published_at', ascending: true, nullsFirst: false }],
  rating: [{ column: 'rating_average', ascending: false, nullsFirst: false }],
  alphabetical: [{ column: 'name', ascending: true }],
};

export async function browseListings(args: BrowseArgs): Promise<BrowseResult> {
  let q = supabase.from('public_listings').select(LISTING_COLUMNS, { count: 'exact' });
  // Either column, as search_listings does. The id comes from our own category
  // list, never from the URL as typed, so it is safe inside the filter string.
  if (args.categoryId) {
    q = q.or(`category_id.eq.${args.categoryId},subcategory_id.eq.${args.categoryId}`);
  }
  if (args.cityId) q = q.eq('city_id', args.cityId);
  const query = args.query?.trim();
  if (query) {
    const pattern = containsPattern(query);
    // A second or=(…) is ANDed with the category one.
    q = q.or(`name.ilike.${pattern},tagline.ilike.${pattern},description.ilike.${pattern}`);
  }
  for (const { column, ascending, nullsFirst } of SORT_ORDER[args.sort]) {
    q = q.order(column, { ascending, nullsFirst });
  }
  const offset = (args.page - 1) * BROWSE_PER_PAGE;
  // No "fetch failed" retry here, unlike searchListings: postgrest-js already
  // retries a failed GET three times with backoff (it never retries the RPC's
  // POST), so another round would only double the wait before an outage
  // degrades the page.
  const { data, error, count } = await q.order('id').range(offset, offset + BROWSE_PER_PAGE - 1);
  if (error) {
    // A page past the end is a 416 (PGRST103), not a failure: the page renders
    // its own "nothing on this page" state, so it stays out of the error log.
    if (error.code !== 'PGRST103') reportError('public_listings.browse', error);
    return { rows: [], total: 0 };
  }
  const listings = (data ?? []) as ListingRow[];
  const total = count ?? 0;
  if (listings.length === 0) return { rows: [], total };

  const ids = listings.map((l) => l.id);
  // Covers and hours only decorate the rows: a failure in either costs the
  // images or the badges, never the results.
  const [covers, hours] = await Promise.all([coverUrls(ids), hoursByListing(ids)]);
  const categories = refsById(args.categories);
  const cities = refsById(args.cities);
  return {
    total,
    rows: listings.map((l) => ({
      id: l.id,
      slug: l.slug,
      name: l.name,
      excerpt: toExcerpt(l.tagline, l.description),
      category: (l.category_id && categories.get(l.category_id)) || null,
      city: (l.city_id && cities.get(l.city_id)) || null,
      phone: l.phone_primary?.trim() || null,
      isFeatured: l.is_featured,
      publishedAt: l.published_at,
      rating: l.rating_average === null ? null : Number(l.rating_average),
      reviewCount: l.review_count,
      coverUrl: covers.get(l.id) ?? null,
      open: openStatus(hours.get(l.id) ?? [], args.now, SITE_TIME_ZONE),
    })),
  };
}

/**
 * `"*value*"` for an ilike inside or=(…). Business names contain . , : ( ),
 * which that syntax reserves, so the value is double-quoted with \ and "
 * backslash-escaped; PostgREST still reads * as % inside the quotes. Before
 * that, \ % and _ are escaped for LIKE so they match as typed, as they do in
 * search_listings.
 */
function containsPattern(value: string): string {
  const literal = value.replace(/[\\%_]/g, '\\$&');
  return `"*${literal.replace(/[\\"]/g, '\\$&')}*"`;
}

/** Empty on failure, which only drops the open/closed badges. */
async function hoursByListing(ids: string[]): Promise<Map<string, HoursRow[]>> {
  const { data, error } = await supabase
    .from('opening_hours')
    .select('listing_id, day_of_week, opens_at, closes_at, is_closed, is_24h')
    .in('listing_id', ids);
  reportError('opening_hours.browse', error);
  const byListing = new Map<string, HoursRow[]>();
  for (const { listing_id, ...row } of (data ?? []) as (HoursRow & { listing_id: string })[]) {
    const rows = byListing.get(listing_id);
    if (rows) rows.push(row);
    else byListing.set(listing_id, [row]);
  }
  return byListing;
}

function refsById(items: { id: string; slug: string; name: string }[]): Map<string, TaxonomyRef> {
  return new Map(items.map((i) => [i.id, { slug: i.slug, name: i.name }]));
}

/**
 * Tagline, else the start of the description as plain text. Descriptions can
 * hold markdown or pasted HTML, and a stray "**" or "<br>" in a list of results
 * reads as a bug. No locale APIs, so every runtime cuts the same text.
 */
export function toExcerpt(
  tagline: string | null,
  description: string | null,
  max = 320,
): string | null {
  const source = tagline?.trim() ? tagline : plainText(description ?? '');
  const text = source.replace(/\s+/g, ' ').trim();
  if (!text) return null;
  if (text.length <= max) return text;
  // Cut on a word boundary; a single unbroken run (a long URL) is cut where it is.
  const space = text.lastIndexOf(' ', max);
  return `${text.slice(0, space > 0 ? space : max).replace(/[\s,;:.–—-]+$/, '')}…`;
}

function plainText(markdown: string): string {
  return (
    markdown
      .replace(/!\[[^\]]*\]\((?:[^()]|\([^()]*\))*\)/g, ' ')
      .replace(/\[([^\]]*)\]\((?:[^()]|\([^()]*\))*\)/g, '$1')
      // A tag must start with a letter, so "under < 500" survives as text.
      .replace(/<\/?[a-z][^<>]*>/gi, ' ')
      .replace(/^[ \t]*(?:(?:#{1,6}|[-*+]|\d+[.)])[ \t]+|>[ \t]*)+/gm, '')
      // Underscores inside a word (snake_case, info_desk@…) are text, not emphasis.
      .replace(/[*`~]+|(?<![A-Za-z0-9])_+|_+(?![A-Za-z0-9])/g, '')
  );
}

type FacetRow = {
  category_id: string | null;
  city_id: string | null;
  is_featured: boolean;
  phone_primary: string | null;
};

// PostgREST caps a response at 1000 rows on Supabase, so the view is read a
// page at a time. Ten pages bound the work at 10,000 listings; past that the
// counts need a SQL aggregate instead of shipping every row here.
const FACET_PAGE_SIZE = 1000;
const FACET_MAX_PAGES = 10;
const TOP_FACETS = 20;

export async function getDirectoryFacets(
  categories: Category[],
  cities: City[],
): Promise<DirectoryFacets> {
  const categoryRefs = refsById(categories);
  const cityRefs = refsById(cities);
  const byCategory = new Map<string, FacetCount>();
  const byCity = new Map<string, FacetCount>();
  let total = 0;
  let featured = 0;
  let withPhone = 0;

  for (let page = 0; page < FACET_MAX_PAGES; page++) {
    const from = page * FACET_PAGE_SIZE;
    const { data, error } = await supabase
      .from('public_listings')
      .select('category_id, city_id, is_featured, phone_primary')
      .order('id')
      .range(from, from + FACET_PAGE_SIZE - 1);
    if (error) {
      // The counts so far are short but not wrong, and a summary is not worth
      // failing the page over.
      reportError('public_listings.facets', error);
      break;
    }
    const rows = (data ?? []) as FacetRow[];
    for (const row of rows) {
      total++;
      if (row.is_featured) featured++;
      if (row.phone_primary?.trim()) withPhone++;
      tally(byCategory, categoryRefs, row.category_id);
      tally(byCity, cityRefs, row.city_id);
    }
    if (rows.length < FACET_PAGE_SIZE) break;
  }

  return {
    total,
    featured,
    withPhone,
    categoryCount: byCategory.size,
    cityCount: byCity.size,
    topCategories: top(byCategory),
    topCities: top(byCity),
  };
}

/**
 * An id missing from the passed list (added after that list was cached, say)
 * has no slug to link to, so it is not counted.
 */
function tally(
  counts: Map<string, FacetCount>,
  refs: Map<string, TaxonomyRef>,
  id: string | null,
): void {
  if (!id) return;
  const facet = counts.get(id);
  if (facet) {
    facet.count++;
    return;
  }
  const ref = refs.get(id);
  if (ref) counts.set(id, { ...ref, count: 1 });
}

// Code-unit comparison rather than localeCompare, whose order depends on the
// runtime's ICU data, so ties come out in the same order on every server.
const byText = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

function top(counts: Map<string, FacetCount>): FacetCount[] {
  return [...counts.values()]
    .sort(
      (a, b) =>
        b.count - a.count ||
        byText(a.name.toLowerCase(), b.name.toLowerCase()) ||
        byText(a.slug, b.slug),
    )
    .slice(0, TOP_FACETS);
}
