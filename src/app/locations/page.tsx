import type { Metadata } from 'next';
// Hundreds of links to per-request pages: prefetch on intent only.
import { HoverPrefetchLink as Link } from '@/components/hover-prefetch-link';
import { getCityListingCounts } from '@/lib/queries';
import { getCitiesByCountry } from '@/lib/locations';
import { Breadcrumbs, Button, EmptyState } from '@/components/ui';
import { JsonLd, breadcrumbSchema } from '@/components/json-ld';
import { MIN_CITY_LISTINGS_TO_INDEX, seoMetadata } from '@/lib/seo';

export const revalidate = 3600;

const TITLE = 'Business Directory by Country & City';
const DESCRIPTION =
  'Find businesses by country and city, or list your company to improve online visibility and reach customers worldwide.';

export async function generateMetadata(): Promise<Metadata> {
  return seoMetadata('/locations', {
    title: TITLE,
    description: DESCRIPTION,
    openGraph: { title: TITLE, description: DESCRIPTION },
    twitter: { card: 'summary_large_image', title: TITLE },
  });
}

export default async function LocationsPage() {
  const groups = await getCitiesByCountry();
  const counts = await getCityListingCounts(groups.flatMap((g) => g.cities.map((c) => c.id)));

  const trail = [{ label: 'Home', href: '/' }, { label: 'Locations' }];

  return (
    <div className="container-page py-12">
      <JsonLd data={breadcrumbSchema(trail, '/locations')} />
      <Breadcrumbs trail={trail} />
      <div className="max-w-3xl">
        <h1 className="font-headline-lg text-headline-lg">Business directory by location</h1>
        <p className="mt-4 text-lg text-[var(--text-muted)]">
          Use this business directory by country and city to find companies near you or in the
          market you are researching. Choose a city to see the businesses listed there.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href="/add-business">List your business</Button>
          <Button href="/business-directory" variant="ghost">
            Browse all businesses
          </Button>
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="mt-12">
          <EmptyState
            title="No locations yet"
            body="Cities will appear here once they are added to the directory."
            action={<Button href="/business-directory">Browse businesses</Button>}
          />
        </div>
      ) : (
        groups.map((g) => (
          <section key={g.country.slug} aria-labelledby={`country-${g.country.slug}`}>
            <h2
              id={`country-${g.country.slug}`}
              className="font-headline-md text-headline-md mt-12"
            >
              Business directory in {g.country.name}
            </h2>
            <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {g.cities.map((c) => {
                const n = counts.get(c.id);
                const indexed = (n ?? 0) >= MIN_CITY_LISTINGS_TO_INDEX;
                return (
                  <li key={c.id}>
                    <Link
                      href={`/city/${c.slug}`}
                      className={
                        indexed
                          ? 'surface-card hover:border-primary-container flex items-center justify-between gap-3 p-4 font-semibold transition-colors'
                          : 'hover:border-primary-container flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] px-4 py-3 text-sm text-[var(--text-muted)] transition-colors'
                      }
                    >
                      <span>{c.name}</span>
                      {n !== undefined ? (
                        <span className="text-sm font-normal text-[var(--text-muted)]">
                          {n} {n === 1 ? 'listing' : 'listings'}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
