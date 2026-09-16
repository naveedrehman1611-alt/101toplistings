import Link from 'next/link';
import {
  findSection,
  getCategories,
  getCities,
  getPageSections,
  getSettings,
  searchListings,
  settingText,
} from '@/lib/queries';
import { ListingCard } from '@/components/listing-card';
import { SectionHeading } from '@/components/ui';
import { ServiceNotice } from '@/components/service-notice';

export const revalidate = 300; // ISR — §1.5 rendering table

export default async function HomePage() {
  const [sections, settings, categories, cities] = await Promise.all([
    getPageSections('home'),
    getSettings(),
    getCategories(true),
    getCities(true),
  ]);

  const hero = findSection(sections, 'hero');
  const catSection = findSection(sections, 'categories');
  const featured = findSection(sections, 'featured');
  const citySection = findSection(sections, 'cities');
  const cta = findSection(sections, 'cta');

  const listings = await searchListings({ limit: featured?.item_limit ?? 6, sort: 'newest' });
  const cityById = new Map(cities.map((c) => [c.id, c.name]));

  return (
    <>
      {hero ? (
        <section className="border-b border-[var(--border)] bg-[var(--surface-2)]">
          <div className="container-page py-16 sm:py-24">
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
              {hero.heading}
            </h1>
            {hero.subheading ? (
              <p className="mt-4 max-w-2xl text-lg text-[var(--text-muted)]">{hero.subheading}</p>
            ) : null}
            <form action="/search" className="mt-8 flex max-w-2xl flex-col gap-3 sm:flex-row">
              <input
                type="search"
                name="q"
                placeholder="Business name, category or city"
                aria-label="Search businesses"
                className="h-12 flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 text-base outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
              />
              <button
                type="submit"
                className="h-12 rounded-lg bg-brand-700 px-6 font-medium text-white hover:bg-brand-800"
              >
                Search
              </button>
            </form>
          </div>
        </section>
      ) : null}

      <div className="container-page pt-10">
        <ServiceNotice />
      </div>

      {catSection ? (
        <section className="container-page py-16">
          <SectionHeading
            heading={catSection.heading}
            subheading={catSection.subheading}
            cta={{ label: catSection.cta_label, url: catSection.cta_url }}
          />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {categories.slice(0, catSection.item_limit ?? 8).map((c) => (
              <Link
                key={c.id}
                href={`/category/${c.slug}`}
                className="surface-card p-5 transition-colors hover:border-brand-500"
              >
                <p className="font-display font-semibold">{c.name}</p>
                {c.description ? (
                  <p className="mt-1 line-clamp-2 text-sm text-[var(--text-muted)]">
                    {c.description}
                  </p>
                ) : null}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {featured ? (
        <section className="container-page py-16">
          <SectionHeading
            heading={featured.heading}
            subheading={featured.subheading}
            cta={{ label: featured.cta_label, url: featured.cta_url }}
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((l) => (
              <ListingCard key={l.id} listing={l} cityName={cityById.get(l.city_id ?? '')} />
            ))}
          </div>
        </section>
      ) : null}

      {citySection ? (
        <section className="container-page py-16">
          <SectionHeading heading={citySection.heading} subheading={citySection.subheading} />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {cities.slice(0, citySection.item_limit ?? 4).map((c) => (
              <Link
                key={c.id}
                href={`/city/${c.slug}`}
                className="surface-card p-5 transition-colors hover:border-brand-500"
              >
                <p className="font-display font-semibold">{c.name}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {cta ? (
        <section className="container-page pb-20">
          <div className="surface-card bg-brand-700 p-10 text-center text-white">
            <h2 className="text-2xl font-semibold sm:text-3xl">{cta.heading}</h2>
            {cta.subheading ? <p className="mt-3 text-brand-100">{cta.subheading}</p> : null}
            {cta.cta_label && cta.cta_url ? (
              <Link
                href={cta.cta_url}
                className="mt-6 inline-flex h-11 items-center rounded-lg bg-white px-6 font-medium text-brand-800"
              >
                {cta.cta_label}
              </Link>
            ) : null}
          </div>
        </section>
      ) : null}

      <span className="sr-only">{settingText(settings, 'brand.tagline')}</span>
    </>
  );
}
