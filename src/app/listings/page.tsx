import type { Metadata } from 'next';
import { findSection, getCities, getPageSections, searchListings } from '@/lib/queries';
import { Results, parsePage, parseSort } from '@/components/results';
import { Breadcrumbs } from '@/components/ui';
import { ServiceNotice } from '@/components/service-notice';

export const revalidate = 300;
const PER_PAGE = 12;

export const metadata: Metadata = {
  title: 'All listings',
  description: 'Every approved business, newest first.',
  openGraph: { title: 'All listings', description: 'Every approved business, newest first.' },
  twitter: { card: 'summary_large_image', title: 'All listings' },
};

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; sort?: string }>;
}) {
  const sp = await searchParams;
  const page = parsePage(sp.page);
  const sort = parseSort(sp.sort);

  const [sections, cities, listings] = await Promise.all([
    getPageSections('listings'),
    getCities(),
    searchListings({ sort, limit: PER_PAGE, offset: (page - 1) * PER_PAGE }),
  ]);

  const header = findSection(sections, 'header');
  const cityNames = new Map(cities.map((c) => [c.id, c.name]));

  return (
    <div className="container-page py-12">
      <ServiceNotice />
      <Breadcrumbs trail={[{ label: 'Home', href: '/' }, { label: header?.heading ?? 'Listings' }]} />
      <h1 className="text-3xl font-bold sm:text-4xl">{header?.heading}</h1>
      {header?.subheading ? (
        <p className="mt-3 max-w-2xl text-[var(--text-muted)]">{header.subheading}</p>
      ) : null}
      <div className="mt-10">
        <Results
          listings={listings}
          basePath="/listings"
          page={page}
          perPage={PER_PAGE}
          sort={sort}
          cityNames={cityNames}
          emptyTitle="No listings yet"
          emptyBody="Nothing has been approved for this view."
        />
      </div>
    </div>
  );
}
