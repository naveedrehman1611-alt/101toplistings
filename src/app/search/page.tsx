import type { Metadata } from 'next';
import { getCities, searchListings } from '@/lib/queries';
import { Results, parsePage, parseSort } from '@/components/results';
import { Breadcrumbs } from '@/components/ui';

// SSR — query-dependent, never cached (§1.5 rendering table).
export const dynamic = 'force-dynamic';
const PER_PAGE = 12;

export const metadata: Metadata = {
  title: 'Search',
  description: 'Find a business by name, category or city.',
  robots: { index: false, follow: true },
  openGraph: { title: 'Search', description: 'Find a business by name, category or city.' },
  twitter: { card: 'summary_large_image', title: 'Search' },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; sort?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? '';
  const page = parsePage(sp.page);
  const sort = parseSort(sp.sort);

  const [cities, listings] = await Promise.all([
    getCities(),
    q ? searchListings({ query: q, sort, limit: PER_PAGE, offset: (page - 1) * PER_PAGE }) : Promise.resolve([]),
  ]);

  return (
    <div className="container-page py-12">
      <Breadcrumbs trail={[{ label: 'Home', href: '/' }, { label: 'Search' }]} />
      <h1 className="text-3xl font-bold sm:text-4xl">
        {q ? `Results for “${q}”` : 'Search'}
      </h1>

      <form action="/search" className="mt-6 flex max-w-2xl flex-col gap-3 sm:flex-row">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Business name, category or city"
          aria-label="Search businesses"
          className="h-12 flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
        />
        <button type="submit" className="h-12 rounded-lg bg-brand-700 px-6 font-medium text-white hover:bg-brand-800">
          Search
        </button>
      </form>

      <div className="mt-10">
        {q ? (
          <Results
            listings={listings}
            basePath="/search"
            page={page}
            perPage={PER_PAGE}
            sort={sort}
            query={q}
            cityNames={new Map(cities.map((c) => [c.id, c.name]))}
            emptyTitle="No matches"
            emptyBody={`Nothing matched “${q}”. Try a shorter search, or browse by category.`}
          />
        ) : (
          <p className="text-[var(--text-muted)]">Enter a search above to get started.</p>
        )}
      </div>
    </div>
  );
}
