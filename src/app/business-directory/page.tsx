import type { Metadata } from 'next';
import { findSection, getCategories, getCities, getPageSections } from '@/lib/queries';
import { BROWSE_PER_PAGE, browseListings, getDirectoryFacets, parseBrowseSort } from '@/lib/browse';
import { ListingFilters } from '@/components/listing-filters';
import { MAX_PAGE, parsePage } from '@/components/results';
import { Button, EmptyState } from '@/components/ui';
import { PageHero } from '@/components/page-hero';
import { DirectorySummary } from '@/components/browse/directory-summary';
import { listingsHref, type ListingsParams } from '@/components/browse/href';
import { ListingRow } from '@/components/browse/listing-row';
import { Pager } from '@/components/browse/pager';
import { ResultsToolbar } from '@/components/browse/results-toolbar';
import { seoMetadata } from '@/lib/seo';
import { getPageContent } from '@/lib/content/get';

export const revalidate = 300;

const TITLE = 'Business Directory | Find & List Businesses';
const DESCRIPTION =
  'Discover businesses by category and location, or add your business listing to reach more customers online.';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; city?: string }>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const meta = await seoMetadata('/business-directory', {
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: '/business-directory' },
    openGraph: { title: TITLE, description: DESCRIPTION },
    twitter: { card: 'summary_large_image', title: TITLE },
  });
  // Filtered views are near-duplicates of /business-directory; category and city pages
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

  const [sections, categories, cities, content, shared] = await Promise.all([
    getPageSections('listings'),
    getCategories(),
    getCities(),
    getPageContent('business_directory'),
    getPageContent('directory_shared'),
  ]);
  const { hero, summary, empty } = content;
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
  // A header kept in Admin → Pages (the older page sections) is shown until the hero
  // is saved in Admin → Content; from then on the Content copy wins.
  const header = hero.edited ? undefined : findSection(sections, 'header');
  // A header kept in Admin → Pages still wins, as it did before the copy was editable here.
  const heading = header?.heading ?? hero.heading;

  return (
    <>
      <PageHero
        trail={[{ label: 'Home', href: '/' }, { label: heading }]}
        eyebrow={hero.eyebrow}
        heading={heading}
        subheading={header?.subheading ?? (hero.intro || undefined)}
        stats={
          filtered
            ? undefined
            : [
                { value: total, label: hero.stat_listings },
                { value: categories.length, label: hero.stat_categories },
                { value: cities.length, label: hero.stat_cities },
              ]
        }
      />
      <div className="container-page py-10 md:py-12">
        <div>
          <ListingFilters
            action="/business-directory"
            q={q}
            category={cat?.slug}
            city={city?.slug}
            sort={sort}
            defaultSort="featured"
            categories={categories}
            cities={cities}
            nearMe
            labels={shared.filters}
          />
        </div>

        {facets && summary.visible ? (
          <div className="mt-10">
            <DirectorySummary facets={facets} params={params} content={summary} />
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
                labels={shared.results}
              />
              <ol start={offset + 1} className="mt-6 space-y-4">
                {rows.map((row, i) => (
                  <li key={row.id}>
                    <ListingRow row={row} rank={offset + i + 1} labels={shared.cards} />
                  </li>
                ))}
              </ol>
              <div className="mt-10">
                <Pager page={page} pages={pages} params={params} labels={shared.results} />
              </div>
            </>
          ) : page > 1 ? (
            // A page number past the end of the list, usually from an old link.
            <EmptyState
              title={empty.past_end_title}
              body={empty.past_end_body}
              action={
                <Button href={listingsHref({ ...params, page: undefined })}>
                  {empty.past_end_button}
                </Button>
              }
            />
          ) : (
            <EmptyState
              title={filtered ? empty.filtered_title : empty.empty_title}
              body={filtered ? empty.filtered_body : empty.empty_body}
              action={
                filtered ? (
                  <Button href="/business-directory" variant="ghost">
                    {empty.clear_button}
                  </Button>
                ) : undefined
              }
            />
          )}
        </section>
      </div>
    </>
  );
}
