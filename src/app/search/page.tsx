import type { Metadata } from 'next';
import Link from 'next/link';
import { getCategories, getCities, searchListings } from '@/lib/queries';
import { ListingFilters } from '@/components/listing-filters';
import { Results, parsePage, parseSort } from '@/components/results';
import { Breadcrumbs } from '@/components/ui';
import { seoMetadata } from '@/lib/seo';

// SSR — query-dependent, never cached (§1.5 rendering table).
export const dynamic = 'force-dynamic';
const PER_PAGE = 12;

export async function generateMetadata(): Promise<Metadata> {
  return seoMetadata('/search', {
    title: 'Search',
    description: 'Find a business by name, category or city.',
    robots: { index: false, follow: true },
    openGraph: { title: 'Search', description: 'Find a business by name, category or city.' },
    twitter: { card: 'summary_large_image', title: 'Search' },
  });
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    page?: string;
    sort?: string;
    category?: string;
    city?: string;
    lat?: string;
    lng?: string;
    radius?: string;
  }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim().slice(0, 100) ?? '';
  const page = parsePage(sp.page);
  const near = parseNear(sp.lat, sp.lng, sp.radius);
  // "Nearest" means nothing without an origin; fall back to the default order.
  const sort = parseSort(sp.sort ?? (near ? 'nearest' : undefined));
  const effectiveSort = !near && sort === 'nearest' ? 'newest' : sort;

  const [categories, cities] = await Promise.all([getCategories(), getCities()]);
  const cat = categories.find((c) => c.slug === sp.category);
  const city = cities.find((c) => c.slug === sp.city);
  // Any one of keyword, category, city or a location is enough to run a search.
  const active = Boolean(q || cat || city || near);
  const listings = active
    ? await searchListings({
        query: q || undefined,
        categoryId: cat?.id,
        cityId: city?.id,
        lat: near?.lat,
        lng: near?.lng,
        radiusKm: near?.radius,
        sort: effectiveSort,
        limit: PER_PAGE,
        offset: (page - 1) * PER_PAGE,
      })
    : [];
  const scope = [cat?.name, city ? `in ${city.name}` : null].filter(Boolean).join(' ');
  const where = near ? `within ${near.radius} km of you` : null;
  const heading = q
    ? `Results for “${q}”${scope ? ` · ${scope}` : ''}${where ? ` · ${where}` : ''}`
    : near
      ? `${cat?.name ?? 'Businesses'} near you`
      : scope || 'Search';
  const nearParams: Record<string, string> = near
    ? { lat: String(near.lat), lng: String(near.lng), radius: String(near.radius) }
    : {};

  return (
    <div className="container-page py-12">
      <Breadcrumbs trail={[{ label: 'Home', href: '/' }, { label: 'Search' }]} />
      <h1 className="text-3xl font-bold sm:text-4xl">{heading}</h1>

      <div className="mt-6">
        <ListingFilters
          action="/search"
          q={q}
          category={cat?.slug}
          city={city?.slug}
          sort={effectiveSort}
          categories={categories}
          cities={cities}
          nearMe
          near={near ?? undefined}
        />
      </div>

      {near ? (
        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-[var(--text-muted)]">Distance:</span>
          {RADII.map((r) => (
            <Link
              key={r}
              href={`/search?${new URLSearchParams({
                ...(q ? { q } : {}),
                ...(cat ? { category: cat.slug } : {}),
                ...(city ? { city: city.slug } : {}),
                ...nearParams,
                radius: String(r),
                sort: effectiveSort,
              }).toString()}`}
              className={`rounded-lg border px-3 py-1 ${
                near.radius === r
                  ? 'border-brand-500 bg-brand-50 text-brand-800'
                  : 'border-[var(--border)] hover:bg-[var(--surface-2)]'
              }`}
            >
              {r} km
            </Link>
          ))}
        </div>
      ) : null}

      <div className="mt-10">
        {active ? (
          <Results
            listings={listings}
            basePath="/search"
            page={page}
            perPage={PER_PAGE}
            sort={effectiveSort}
            query={q || undefined}
            params={{ category: cat?.slug, city: city?.slug, ...nearParams }}
            nearest={Boolean(near)}
            cityNames={new Map(cities.map((c) => [c.id, c.name]))}
            emptyTitle={near ? 'Nothing nearby yet' : 'No matches'}
            emptyBody={
              near
                ? `Nothing within ${near.radius} km of you matches. Try a wider distance, or browse by city.`
                : 'Nothing matched. Try a shorter keyword, another city, or clear a filter.'
            }
          />
        ) : (
          <p className="text-[var(--text-muted)]">
            Type a keyword, pick a category or city, or press Near me to see what&apos;s close by.
          </p>
        )}
      </div>
    </div>
  );
}

const RADII = [2, 5, 10, 25, 50] as const;

/**
 * Reads ?lat=&lng=&radius= from the Near me button. Anything out of range is
 * ignored rather than trusted: this goes straight into a PostGIS query.
 */
function parseNear(lat?: string, lng?: string, radius?: string) {
  const la = Number(lat);
  const lo = Number(lng);
  if (!lat || !lng || !Number.isFinite(la) || !Number.isFinite(lo)) return null;
  if (la < -90 || la > 90 || lo < -180 || lo > 180) return null;
  const r = Number(radius);
  const km = (RADII as readonly number[]).includes(r) ? r : 10;
  return { lat: Math.round(la * 1000) / 1000, lng: Math.round(lo * 1000) / 1000, radius: km };
}
