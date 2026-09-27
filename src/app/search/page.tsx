import type { Metadata } from 'next';
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
  }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim().slice(0, 100) ?? '';
  const page = parsePage(sp.page);
  const sort = parseSort(sp.sort);

  const [categories, cities] = await Promise.all([getCategories(), getCities()]);
  const cat = categories.find((c) => c.slug === sp.category);
  const city = cities.find((c) => c.slug === sp.city);
  // Any one of keyword, category or city is enough to run a search.
  const active = Boolean(q || cat || city);
  const listings = active
    ? await searchListings({
        query: q || undefined,
        categoryId: cat?.id,
        cityId: city?.id,
        sort,
        limit: PER_PAGE,
        offset: (page - 1) * PER_PAGE,
      })
    : [];
  const scope = [cat?.name, city ? `in ${city.name}` : null].filter(Boolean).join(' ');
  const heading = q ? `Results for “${q}”${scope ? ` · ${scope}` : ''}` : scope || 'Search';

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
          sort={sort}
          categories={categories}
          cities={cities}
        />
      </div>

      <div className="mt-10">
        {active ? (
          <Results
            listings={listings}
            basePath="/search"
            page={page}
            perPage={PER_PAGE}
            sort={sort}
            query={q || undefined}
            params={{ category: cat?.slug, city: city?.slug }}
            cityNames={new Map(cities.map((c) => [c.id, c.name]))}
            emptyTitle="No matches"
            emptyBody="Nothing matched. Try a shorter keyword, another city, or clear a filter."
          />
        ) : (
          <p className="text-[var(--text-muted)]">
            Type a keyword or pick a category or city to get started.
          </p>
        )}
      </div>
    </div>
  );
}
