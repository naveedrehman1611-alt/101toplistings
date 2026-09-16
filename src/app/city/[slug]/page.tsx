import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCities, getCityBySlug, searchListings } from '@/lib/queries';
import { Results, parsePage, parseSort } from '@/components/results';
import { Breadcrumbs } from '@/components/ui';
import { SITE_URL } from '@/lib/supabase';

export const revalidate = 600;
const PER_PAGE = 12;
// §7.5.7 / criterion 47 — below this density the page is noindex rather than thin.
const MIN_LISTINGS_TO_INDEX = 3;

export async function generateStaticParams() {
  const cities = await getCities();
  return cities.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
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
    robots: count < MIN_LISTINGS_TO_INDEX ? { index: false, follow: true } : undefined,
    openGraph: { title, description, url: `${SITE_URL}/city/${city.slug}` },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function CityPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; sort?: string }>;
}) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const city = await getCityBySlug(slug);
  if (!city) notFound();

  const page = parsePage(sp.page);
  const sort = parseSort(sp.sort);
  const [cities, listings] = await Promise.all([
    getCities(),
    searchListings({ cityId: city.id, sort, limit: PER_PAGE, offset: (page - 1) * PER_PAGE }),
  ]);

  return (
    <div className="container-page py-12">
      <Breadcrumbs trail={[{ label: 'Home', href: '/' }, { label: city.name }]} />
      <h1 className="text-3xl font-bold sm:text-4xl">Businesses in {city.name}</h1>
      {city.intro_copy ? <p className="mt-3 max-w-2xl text-[var(--text-muted)]">{city.intro_copy}</p> : null}
      <div className="mt-10">
        <Results
          listings={listings}
          basePath={`/city/${city.slug}`}
          page={page}
          perPage={PER_PAGE}
          sort={sort}
          cityNames={new Map(cities.map((c) => [c.id, c.name]))}
          emptyTitle={`Nothing listed in ${city.name} yet`}
          emptyBody="Be the first to add a business here."
        />
      </div>
    </div>
  );
}
