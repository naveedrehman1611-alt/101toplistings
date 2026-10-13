import type { Metadata } from 'next';
import {
  getCategories,
  getCities,
  getCityBySlug,
  getCityListingCounts,
  searchListings,
} from '@/lib/queries';
import { Results, parsePage, parseSort } from '@/components/results';
import { ListingFilters } from '@/components/listing-filters';
import { JsonLd, breadcrumbSchema, itemListSchema } from '@/components/json-ld';
import { PageHero } from '@/components/page-hero';
import { redirectOrNotFound, redirectToLowercase } from '@/lib/redirects';
import { MIN_CITY_LISTINGS_TO_INDEX, pageMetadata, resultsPageSeo } from '@/lib/seo';
import { getPageContent } from '@/lib/content/get';
import { fill, fillNodes } from '@/components/browse/fill';

export const revalidate = 600;
const PER_PAGE = 12;

export async function generateStaticParams() {
  const cities = await getCities();
  return cities.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; sort?: string; q?: string; category?: string }>;
}): Promise<Metadata> {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const city = await getCityBySlug(slug);
  if (!city) return { title: 'Not found' };
  // A count that failed to load is left undefined, so a database blip does not
  // noindex the page (the sitemap leaves such a city out for the same reason).
  const count = (await getCityListingCounts([city.id])).get(city.id);
  const title = `Businesses in ${city.name}`;
  const description = city.intro_copy ?? `Local businesses listed in ${city.name}.`;
  // ?sort= alone is the same listings reordered (canonical to the plain page);
  // a search or category filter is a different subset (noindex).
  const filtered = Boolean(sp.q?.trim() || sp.category);
  const path = `/city/${city.slug}`;
  return pageMetadata(path, {
    title,
    description,
    ...resultsPageSeo(
      path,
      parsePage(sp.page),
      filtered,
      count !== undefined && count < MIN_CITY_LISTINGS_TO_INDEX,
    ),
  });
}

export default async function CityPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; sort?: string; q?: string; category?: string }>;
}) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const city = await getCityBySlug(slug);
  // A retired slug may have a stored redirect; otherwise this renders the 404.
  if (!city) {
    await redirectToLowercase('/city', slug, getCityBySlug, sp);
    return redirectOrNotFound(`/city/${encodeURIComponent(slug)}`);
  }

  const page = parsePage(sp.page);
  const sort = parseSort(sp.sort);
  const q = sp.q?.trim().slice(0, 100) || undefined;
  const [cities, categories, { hero, empty }, shared] = await Promise.all([
    getCities(),
    getCategories(),
    getPageContent('city_page'),
    getPageContent('directory_shared'),
  ]);
  const cat = categories.find((c) => c.slug === sp.category);
  const listings = await searchListings({
    query: q,
    categoryId: cat?.id,
    cityId: city.id,
    sort,
    limit: PER_PAGE,
    offset: (page - 1) * PER_PAGE,
  });
  const filtered = Boolean(q || cat);
  const trail = [{ label: 'Home', href: '/' }, { label: city.name }];
  const path = `/city/${city.slug}`;

  // Shown only for the unfiltered city, so the figure is the city's own total.
  const total = filtered ? 0 : Number(listings[0]?.total_count ?? 0);

  return (
    <>
      <JsonLd data={breadcrumbSchema(trail, path)} />
      {listings.length > 0 ? (
        <JsonLd
          data={itemListSchema(`Businesses in ${city.name}`, listings, (page - 1) * PER_PAGE)}
        />
      ) : null}
      <PageHero
        trail={trail}
        eyebrow={hero.eyebrow}
        heading={fillNodes(hero.heading, {
          city: <span className="text-hero-green-light">{city.name}</span>,
        })}
        subheading={city.intro_copy}
        stats={total > 0 ? [{ value: total, label: hero.stat_listings }] : undefined}
      />
      <div className="container-page py-10 md:py-12">
        <div>
          <ListingFilters
            action={`/city/${city.slug}`}
            q={q}
            category={cat?.slug}
            sort={sort}
            categories={categories}
            labels={shared.filters}
          />
        </div>
        <div className="mt-8">
          <Results
            listings={listings}
            basePath={`/city/${city.slug}`}
            page={page}
            perPage={PER_PAGE}
            sort={sort}
            query={q}
            params={{ category: cat?.slug }}
            cityNames={new Map(cities.map((c) => [c.id, c.name]))}
            emptyTitle={fill(filtered ? empty.filtered_title : empty.empty_title, {
              city: city.name,
            })}
            emptyBody={fill(filtered ? empty.filtered_body : empty.empty_body, { city: city.name })}
            labels={shared.results}
            cardLabels={shared.cards}
          />
        </div>
      </div>
    </>
  );
}
