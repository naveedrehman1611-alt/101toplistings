import type { Metadata } from 'next';
import {
  findSection,
  getCategories,
  getCities,
  getPageSections,
  searchListings,
} from '@/lib/queries';
import { ListingFilters } from '@/components/listing-filters';
import { Results, parsePage, parseSort } from '@/components/results';
import { Breadcrumbs } from '@/components/ui';
import { seoMetadata } from '@/lib/seo';

export const revalidate = 300;
const PER_PAGE = 12;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; city?: string }>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const meta = await seoMetadata('/listings', {
    title: 'All listings',
    description: 'Every approved business, newest first.',
    alternates: { canonical: '/listings' },
    openGraph: { title: 'All listings', description: 'Every approved business, newest first.' },
    twitter: { card: 'summary_large_image', title: 'All listings' },
  });
  // Filtered views are near-duplicates of /listings; category and city pages
  // are the indexable versions of the same filters.
  return sp.q || sp.category || sp.city
    ? { ...meta, robots: { index: false, follow: true } }
    : meta;
}

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    sort?: string;
    q?: string;
    category?: string;
    city?: string;
  }>;
}) {
  const sp = await searchParams;
  const page = parsePage(sp.page);
  const sort = parseSort(sp.sort);

  const q = sp.q?.trim().slice(0, 100) || undefined;

  const [sections, categories, cities] = await Promise.all([
    getPageSections('listings'),
    getCategories(),
    getCities(),
  ]);
  // Filters travel as slugs so the URL stays readable; unknown slugs are ignored.
  const cat = categories.find((c) => c.slug === sp.category);
  const city = cities.find((c) => c.slug === sp.city);
  const listings = await searchListings({
    query: q,
    categoryId: cat?.id,
    cityId: city?.id,
    sort,
    limit: PER_PAGE,
    offset: (page - 1) * PER_PAGE,
  });
  const filtered = Boolean(q || cat || city);

  const header = findSection(sections, 'header');
  const cityNames = new Map(cities.map((c) => [c.id, c.name]));

  return (
    <div className="container-page py-12">
      <Breadcrumbs
        trail={[{ label: 'Home', href: '/' }, { label: header?.heading ?? 'Listings' }]}
      />
      <h1 className="text-3xl font-bold sm:text-4xl">{header?.heading}</h1>
      {header?.subheading ? (
        <p className="mt-3 max-w-2xl text-[var(--text-muted)]">{header.subheading}</p>
      ) : null}
      <div className="mt-8">
        <ListingFilters
          action="/listings"
          q={q}
          category={cat?.slug}
          city={city?.slug}
          sort={sort}
          categories={categories}
          cities={cities}
        />
      </div>
      <div className="mt-8">
        <Results
          listings={listings}
          basePath="/listings"
          page={page}
          perPage={PER_PAGE}
          sort={sort}
          query={q}
          params={{ category: cat?.slug, city: city?.slug }}
          cityNames={cityNames}
          emptyTitle={filtered ? 'No matches' : 'No listings yet'}
          emptyBody={
            filtered
              ? 'Nothing matches these filters. Try another city or category, or clear the filters.'
              : 'Nothing has been approved for this view.'
          }
        />
      </div>
    </div>
  );
}
