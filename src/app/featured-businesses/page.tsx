import type { Metadata } from 'next';
import { cache } from 'react';
import { getCategories, getCities } from '@/lib/queries';
import { BROWSE_PER_PAGE, browseListings, type BrowseRow } from '@/lib/browse';
import { ListingRow } from '@/components/browse/listing-row';
import { Breadcrumbs, Button, EmptyState } from '@/components/ui';
import { JsonLd, breadcrumbSchema, itemListSchema } from '@/components/json-ld';
import { seoMetadata } from '@/lib/seo';

export const revalidate = 3600;

const TITLE = 'Featured Businesses | Top Business Listings';
const DESCRIPTION =
  'Browse featured business listings: companies that have chosen extra visibility in the directory, shown first in category and location results.';

/** Featured listings sort first, so the list ends at the first row that is not featured. */
const MAX_PAGES = 4;

const getFeatured = cache(async function getFeatured(): Promise<BrowseRow[]> {
  const [categories, cities] = await Promise.all([getCategories(), getCities()]);
  const now = new Date();
  const featured: BrowseRow[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const { rows } = await browseListings({ sort: 'featured', page, categories, cities, now });
    featured.push(...rows.filter((r) => r.isFeatured));
    if (rows.length < BROWSE_PER_PAGE || rows.some((r) => !r.isFeatured)) break;
  }
  return featured;
});

export async function generateMetadata(): Promise<Metadata> {
  const meta = await seoMetadata('/featured-businesses', {
    title: TITLE,
    description: DESCRIPTION,
    openGraph: { title: TITLE, description: DESCRIPTION },
    twitter: { card: 'summary_large_image', title: TITLE },
  });
  // A page with no featured listings has nothing to index.
  return (await getFeatured()).length === 0
    ? { ...meta, robots: { index: false, follow: true } }
    : meta;
}

export default async function FeaturedBusinessesPage() {
  const rows = await getFeatured();
  const trail = [{ label: 'Home', href: '/' }, { label: 'Featured businesses' }];

  return (
    <div className="container-page py-12">
      <JsonLd data={breadcrumbSchema(trail, '/featured-businesses')} />
      {rows.length > 0 ? (
        <JsonLd data={itemListSchema('Featured business listings', rows)} />
      ) : null}
      <Breadcrumbs trail={trail} />
      <div className="max-w-3xl">
        <h1 className="font-headline-lg text-headline-lg">Featured businesses</h1>
        <p className="mt-4 text-lg text-[var(--text-muted)]">
          A featured business listing is a directory listing that has been given extra visibility.
          Featured businesses are shown first in the business directory, ahead of other listings, so
          customers see them before they scroll. Featuring changes where a listing appears, not how
          it is reviewed: every listing is checked before it goes live.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href="/pricing">Get featured</Button>
          <Button href="/business-directory" variant="ghost">
            Browse businesses
          </Button>
        </div>
      </div>

      <section aria-labelledby="featured-heading" className="mt-12">
        <h2 id="featured-heading" className="font-headline-md text-headline-md">
          Featured business listings
        </h2>
        {rows.length > 0 ? (
          <ol className="mt-6 space-y-4">
            {rows.map((row, i) => (
              <li key={row.id}>
                <ListingRow row={row} rank={i + 1} />
              </li>
            ))}
          </ol>
        ) : (
          <div className="mt-6">
            <EmptyState
              title="No featured businesses yet"
              body="No listing is featured at the moment. Browse the full directory, or find out how to get your business featured."
              action={<Button href="/business-directory">Browse businesses</Button>}
            />
          </div>
        )}
      </section>
    </div>
  );
}
