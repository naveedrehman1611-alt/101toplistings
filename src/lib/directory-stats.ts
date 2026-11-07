import 'server-only';
import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import { SEARCH_TAG, tableTag } from './supabase';
import { reportError } from './queries';

/**
 * The one source for every directory-wide figure on the site: the homepage
 * strip and story, the /business-directory header and "at a glance" box, and
 * the About page. Before this, each of those counted on its own (some all
 * taxonomy rows, some only rows with listings) and cached the result at a
 * different time, so the same site printed different numbers.
 *
 * "Live" means a row of the public_listings view, which is listings with
 * status = 'approved' (migration 0007).
 *
 * Each figure is null when its read failed, so pages hide that figure rather
 * than print 0.
 */
export type DirectoryStats = {
  /** Live listings. */
  businessesListed: number | null;
  /** Distinct cities that have at least one live listing. */
  citiesWithListings: number | null;
  /** Distinct categories that have at least one live listing (listings.category_id). */
  categoriesWithListings: number | null;
  /** Every row of cities, with or without listings. */
  citiesAvailable: number | null;
  /** Every row of categories, subcategories included. */
  categoriesAvailable: number | null;
};

/** About an hour; any admin write to listings or taxonomy expires it sooner (SEARCH_TAG). */
export const DIRECTORY_STATS_REVALIDATE_SECONDS = 3600;

const STATS_TAGS = [
  SEARCH_TAG,
  tableTag('public_listings'),
  tableTag('listings'),
  tableTag('cities'),
  tableTag('categories'),
];

/**
 * The shared anon client keeps reads for 24 hours. These counts are meant to
 * be at most an hour old, so their reads use the same cache with a shorter
 * lifetime and the tags admin writes expire.
 */
const statsFetch: typeof fetch = (input, init) =>
  fetch(input, {
    ...init,
    cache: 'force-cache',
    next: { revalidate: DIRECTORY_STATS_REVALIDATE_SECONDS, tags: STATS_TAGS },
  });

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false }, global: { fetch: statsFetch } },
);

const HEAD_COUNT = { count: 'exact', head: true } as const;

// PostgREST caps a response at 1000 rows on Supabase, so the view is read a
// page at a time. Ten pages bound the work at 10,000 listings; past that the
// distinct counts should move to a SQL aggregate.
const PAGE_SIZE = 1000;
const MAX_PAGES = 10;

async function countRows(table: 'cities' | 'categories'): Promise<number | null> {
  const { count, error } = await db.from(table).select('id', HEAD_COUNT);
  reportError(`${table}.count`, error);
  return error ? null : count;
}

type LiveRow = { city_id: string | null; category_id: string | null };

/** Live listings, plus the distinct cities and categories they sit in. */
async function countLive(): Promise<{
  listings: number;
  cities: number;
  categories: number;
} | null> {
  const cities = new Set<string>();
  const categories = new Set<string>();
  let listings = 0;
  for (let page = 0; page < MAX_PAGES; page++) {
    const from = page * PAGE_SIZE;
    const { data, error } = await db
      .from('public_listings')
      .select('city_id, category_id')
      .order('id')
      .range(from, from + PAGE_SIZE - 1);
    if (error) {
      reportError('public_listings.stats', error);
      return null;
    }
    const rows = (data ?? []) as LiveRow[];
    for (const row of rows) {
      listings++;
      if (row.city_id) cities.add(row.city_id);
      if (row.category_id) categories.add(row.category_id);
    }
    if (rows.length < PAGE_SIZE) break;
  }
  return { listings, cities: cities.size, categories: categories.size };
}

async function loadDirectoryStats(): Promise<DirectoryStats> {
  const [live, citiesAvailable, categoriesAvailable] = await Promise.all([
    countLive(),
    countRows('cities'),
    countRows('categories'),
  ]);
  const stats: DirectoryStats = {
    businessesListed: live?.listings ?? null,
    citiesWithListings: live?.cities ?? null,
    categoriesWithListings: live?.categories ?? null,
    citiesAvailable,
    categoriesAvailable,
  };
  // A failed read is not cached: throwing makes unstable_cache keep nothing,
  // so the next request tries again instead of serving nulls for an hour.
  if (Object.values(stats).some((v) => v === null)) throw new PartialStats(stats);
  return stats;
}

class PartialStats extends Error {
  constructor(readonly stats: DirectoryStats) {
    super('directory stats incomplete');
  }
}

const cachedDirectoryStats = unstable_cache(loadDirectoryStats, ['directory-stats'], {
  revalidate: DIRECTORY_STATS_REVALIDATE_SECONDS,
  tags: STATS_TAGS,
});

/** Directory-wide figures, cached for about an hour and shared by every page. */
export const getDirectoryStats = cache(async function getDirectoryStats(): Promise<DirectoryStats> {
  try {
    return await cachedDirectoryStats();
  } catch (e) {
    if (e instanceof PartialStats) return e.stats;
    reportError('directory-stats', { message: e instanceof Error ? e.message : String(e) });
    return {
      businessesListed: null,
      citiesWithListings: null,
      categoriesWithListings: null,
      citiesAvailable: null,
      categoriesAvailable: null,
    };
  }
});
