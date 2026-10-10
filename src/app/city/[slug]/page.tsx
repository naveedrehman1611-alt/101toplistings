import type { Metadata } from 'next';
import { getCategories, getCities, getCityBySlug, searchListings } from '@/lib/queries';
import { Results, parsePage, parseSort } from '@/components/results';
import { ListingFilters } from '@/components/listing-filters';
import { SITE_URL } from '@/lib/supabase';
import { JsonLd, breadcrumbSchema, itemListSchema } from '@/components/json-ld';
import { PageHero } from '@/components/page-hero';
import { redirectOrNotFound } from '@/lib/redirects';
import { MIN_CITY_LISTINGS_TO_INDEX, SHARE_IMAGE } from '@/lib/seo';

export const revalidate = 600;
const PER_PAGE = 12;

export async function generateStaticParams() {
  const cities = await getCities();
  return cities.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const city = await getCityBySlug(slug);
  if (!city) return { title: 'Not found' };
  const listings = await searchListings({ cityId: city.id, limit: 1 });
  const count = Number(listings[0]?.total_count ?? 0);
  const title = `Businesses in ${city.name}`;
  const description = city.intro_copy ?? `Local businesses listed in ${city.name}.`;
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/city/${city.slug}` },
    robots: count < MIN_CITY_LISTINGS_TO_INDEX ? { index: false, follow: true } : undefined,
    openGraph: { title, description, url: `${SITE_URL}/city/${city.slug}`, images: [SHARE_IMAGE] },
    twitter: { card: 'summary_large_image', title, description, images: [SHARE_IMAGE] },
  };
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
  if (!city) return redirectOrNotFound(`/city/${encodeURIComponent(slug)}`);

  const page = parsePage(sp.page);
  const sort = parseSort(sp.sort);
  const q = sp.q?.trim().slice(0, 100) || undefined;
  const [cities, categories] = await Promise.all([getCities(), getCategories()]);
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
        eyebrow="Local business directory"
        heading={
          <>
            Businesses in <span className="text-hero-green-light">{city.name}</span>
          </>
        }
        subheading={city.intro_copy}
        stats={total > 0 ? [{ value: total, label: 'Listings' }] : undefined}
      />
      <div className="container-page py-10 md:py-12">
        <div>
          <ListingFilters
            action={`/city/${city.slug}`}
            q={q}
            category={cat?.slug}
            sort={sort}
            categories={categories}
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
            emptyTitle={filtered ? 'No matches' : `Nothing listed in ${city.name} yet`}
            emptyBody={
              filtered
                ? `Nothing in ${city.name} matches these filters. Try another category or clear them.`
                : 'Be the first to add a business here.'
            }
          />
        </div>
      </div>
    </>
  );
}
