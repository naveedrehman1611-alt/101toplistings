import type { Metadata } from 'next';
import { cache } from 'react';
import { getCategories, getCities } from '@/lib/queries';
import { BROWSE_PER_PAGE, browseListings, type BrowseRow } from '@/lib/browse';
import { ListingRow } from '@/components/browse/listing-row';
import { Button, EmptyState } from '@/components/ui';
import { JsonLd, breadcrumbSchema, itemListSchema } from '@/components/json-ld';
import { PageHero } from '@/components/page-hero';
import { seoMetadata } from '@/lib/seo';
import { getPageContent } from '@/lib/content/get';
import { HighlightedHeading } from '@/components/company/highlighted';

export const revalidate = 600;

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
  const [rows, content] = await Promise.all([getFeatured(), getPageContent('featured_businesses')]);
  const { hero, listings } = content;
  const trail = [{ label: 'Home', href: '/' }, { label: 'Featured businesses' }];

  return (
    <>
      <JsonLd data={breadcrumbSchema(trail, '/featured-businesses')} />
      {rows.length > 0 ? (
        <JsonLd data={itemListSchema('Featured business listings', rows)} />
      ) : null}
      <PageHero
        trail={trail}
        eyebrow={hero.eyebrow}
        heading={<HighlightedHeading c={hero} className="text-hero-green-light" />}
        subheading={hero.intro}
        stats={rows.length > 0 ? [{ value: rows.length, label: hero.stat_label }] : undefined}
      >
        {hero.primary.label || (hero.secondary.label && hero.secondary.href) ? (
          <div className="flex flex-wrap gap-3">
            {hero.primary.label && hero.primary.href ? (
              <Button href={hero.primary.href}>{hero.primary.label}</Button>
            ) : null}
            {hero.secondary.label && hero.secondary.href ? (
              <Button href={hero.secondary.href} variant="ghost">
                {hero.secondary.label}
              </Button>
            ) : null}
          </div>
        ) : null}
      </PageHero>
      <div className="container-page py-10 md:py-12">
        <section aria-labelledby="featured-heading">
          <h2 id="featured-heading" className="font-headline-md text-headline-md">
            {listings.heading}
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
                title={listings.empty_title}
                body={listings.empty_body}
                action={
                  listings.empty_button.label && listings.empty_button.href ? (
                    <Button href={listings.empty_button.href}>{listings.empty_button.label}</Button>
                  ) : undefined
                }
              />
            </div>
          )}
        </section>
      </div>
    </>
  );
}
