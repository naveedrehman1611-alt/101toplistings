import type { Metadata } from 'next';
// Hundreds of links to per-request pages: prefetch on intent only.
import { HoverPrefetchLink as Link } from '@/components/hover-prefetch-link';
import { getCityListingCounts } from '@/lib/queries';
import { getCitiesByCountry } from '@/lib/locations';
import { Button, EmptyState } from '@/components/ui';
import { JsonLd, breadcrumbSchema } from '@/components/json-ld';
import { PageHero } from '@/components/page-hero';
import { MIN_CITY_LISTINGS_TO_INDEX, seoMetadata } from '@/lib/seo';
import { getPageContent } from '@/lib/content/get';
import { fill } from '@/components/browse/fill';
import { chunk } from '@/lib/chunk';

/**
 * Cities per <ul>: Pakistan alone has 60+, past the 60 children an audit flags.
 * 48 fills whole rows of the 1-, 2- and 4-column grid, so the lists read as one.
 */
const CITIES_PER_LIST = 48;

export const revalidate = 600;

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
  const [groups, { hero, countries, empty }] = await Promise.all([
    getCitiesByCountry(),
    getPageContent('locations'),
  ]);
  const counts = await getCityListingCounts(groups.flatMap((g) => g.cities.map((c) => c.id)));

  const trail = [{ label: 'Home', href: '/' }, { label: hero.crumb }];

  const cityCount = groups.reduce((n, g) => n + g.cities.length, 0);

  return (
    <>
      <JsonLd data={breadcrumbSchema(trail, '/locations')} />
      <PageHero
        trail={trail}
        eyebrow={hero.eyebrow}
        heading={
          <>
            {hero.heading}
            {hero.highlight ? (
              <>
                {' '}
                <span className="text-hero-green-light">{hero.highlight}</span>
              </>
            ) : null}
          </>
        }
        subheading={hero.intro || undefined}
        stats={
          groups.length
            ? [
                {
                  value: groups.length,
                  label: groups.length === 1 ? hero.stat_country : hero.stat_countries,
                },
                { value: cityCount, label: cityCount === 1 ? hero.stat_city : hero.stat_cities },
              ]
            : undefined
        }
      >
        {(hero.primary.label && hero.primary.href) ||
        (hero.secondary.label && hero.secondary.href) ? (
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
      <div className="container-page pb-10 md:pb-12">
        {groups.length === 0 ? (
          <div className="mt-12">
            <EmptyState
              title={empty.title}
              body={empty.body}
              action={
                empty.button.label && empty.button.href ? (
                  <Button href={empty.button.href}>{empty.button.label}</Button>
                ) : undefined
              }
            />
          </div>
        ) : (
          groups.map((g) => (
            <section key={g.country.slug} aria-labelledby={`country-${g.country.slug}`}>
              <h2
                id={`country-${g.country.slug}`}
                className="font-headline-md text-headline-md mt-12"
              >
                {fill(countries.heading, { country: g.country.name })}
              </h2>
              {chunk(g.cities, CITIES_PER_LIST).map((run, i) => (
                <ul
                  key={i}
                  className={`${i === 0 ? 'mt-6' : 'mt-3'} grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4`}
                >
                  {run.map((c) => {
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
                              {fill(n === 1 ? countries.listing_one : countries.listing_many, {
                                count: n,
                              })}
                            </span>
                          ) : null}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ))}
            </section>
          ))
        )}
      </div>
    </>
  );
}
