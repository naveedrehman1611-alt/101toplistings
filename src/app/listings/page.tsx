import type { Metadata } from 'next';
import { findSection, getCategories, getCities, getPageSections } from '@/lib/queries';
import { BROWSE_PER_PAGE, browseListings, getDirectoryFacets, parseBrowseSort } from '@/lib/browse';
import { ListingFilters } from '@/components/listing-filters';
import { MAX_PAGE, parsePage } from '@/components/results';
import { Breadcrumbs, Button, EmptyState } from '@/components/ui';
import { DirectorySummary } from '@/components/browse/directory-summary';
import { listingsHref, type ListingsParams } from '@/components/browse/href';
import { ListingRow } from '@/components/browse/listing-row';
import { Pager } from '@/components/browse/pager';
import { ResultsToolbar } from '@/components/browse/results-toolbar';
import { seoMetadata } from '@/lib/seo';

export const revalidate = 300;

const DESCRIPTION = 'Every approved business, featured listings first, then the newest.';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; city?: string }>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const meta = await seoMetadata('/listings', {
    title: 'All listings',
    description: DESCRIPTION,
    alternates: { canonical: '/listings' },
    openGraph: { title: 'All listings', description: DESCRIPTION },
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
  const sort = parseBrowseSort(sp.sort);
  const q = sp.q?.trim().slice(0, 100) || undefined;

  const [sections, categories, cities] = await Promise.all([
    getPageSections('listings'),
    getCategories(),
    getCities(),
  ]);
  // Filters travel as slugs so the URL stays readable; unknown slugs are ignored.
  const cat = categories.find((c) => c.slug === sp.category);
  const city = cities.find((c) => c.slug === sp.city);
  // The summary describes the whole directory, so it is read once and shown on
  // the first page only rather than repeated above every page of results.
  const [{ rows, total }, facets] = await Promise.all([
    browseListings({
      query: q,
      categoryId: cat?.id,
      cityId: city?.id,
      sort,
      page,
      categories,
      cities,
      now: new Date(),
    }),
    page === 1 ? getDirectoryFacets(categories, cities) : null,
  ]);

  const filtered = Boolean(q || cat || city);
  const params: ListingsParams = { q, category: cat?.slug, city: city?.slug, sort };
  const pages = Math.min(MAX_PAGE, Math.max(1, Math.ceil(total / BROWSE_PER_PAGE)));
  const offset = (page - 1) * BROWSE_PER_PAGE;
  const header = findSection(sections, 'header');
  const heading = header?.heading ?? 'All listings';

  return (
    <div className="container-page py-12">
      <Breadcrumbs trail={[{ label: 'Home', href: '/' }, { label: heading }]} />
      <h1 className="font-headline-lg text-headline-lg">{heading}</h1>
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
          defaultSort="featured"
          categories={categories}
          cities={cities}
          nearMe
        />
      </div>

      {facets ? (
        <div className="mt-10">
          <DirectorySummary facets={facets} params={params} />
        </div>
      ) : null}

      <section aria-labelledby="results-heading" className="mt-10">
        <h2 id="results-heading" className="sr-only">
          Listings
        </h2>
        {rows.length > 0 ? (
          <>
            <ResultsToolbar
              total={total}
              page={page}
              perPage={BROWSE_PER_PAGE}
              sort={sort}
              params={params}
            />
            <ol start={offset + 1} className="mt-6 space-y-4">
              {rows.map((row, i) => (
                <li key={row.id}>
                  <ListingRow row={row} rank={offset + i + 1} />
                </li>
              ))}
            </ol>
            <div className="mt-10">
              <Pager page={page} pages={pages} params={params} />
            </div>
          </>
        ) : page > 1 ? (
          // A page number past the end of the list, usually from an old link.
          <EmptyState
            title="Nothing on this page"
            body="The list is shorter than this page number. Start again from the first page."
            action={
              <Button href={listingsHref({ ...params, page: undefined })}>Go to page 1</Button>
            }
          />
        ) : (
          <EmptyState
            title={filtered ? 'No matches' : 'No listings yet'}
            body={
              filtered
                ? 'Nothing matches these filters. Try another city or category, or clear the filters.'
                : 'Nothing has been approved for this view.'
            }
            action={
              filtered ? (
                <Button href="/listings" variant="ghost">
                  Clear filters
                </Button>
              ) : undefined
            }
          />
        )}
      </section>
    </div>
  );
}
