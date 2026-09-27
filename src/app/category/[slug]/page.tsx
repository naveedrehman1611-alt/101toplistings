import type { Metadata } from 'next';
import { getCategories, getCategoryBySlug, getCities, searchListings } from '@/lib/queries';
import { Results, parsePage, parseSort } from '@/components/results';
import { Breadcrumbs } from '@/components/ui';
import { ListingFilters } from '@/components/listing-filters';
import { SITE_URL } from '@/lib/supabase';
import { redirectOrNotFound } from '@/lib/redirects';

export const revalidate = 600;
const PER_PAGE = 12;

export async function generateStaticParams() {
  const cats = await getCategories();
  return cats.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cat = await getCategoryBySlug(slug);
  if (!cat) return { title: 'Not found' };
  const title = `${cat.name} businesses`;
  const description = cat.description ?? `Browse ${cat.name.toLowerCase()} businesses.`;
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/category/${cat.slug}` },
    openGraph: { title, description, url: `${SITE_URL}/category/${cat.slug}` },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; sort?: string; q?: string; city?: string }>;
}) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const cat = await getCategoryBySlug(slug);
  // A retired slug may have a stored redirect; otherwise this renders the 404.
  if (!cat) return redirectOrNotFound(`/category/${encodeURIComponent(slug)}`);

  const page = parsePage(sp.page);
  const sort = parseSort(sp.sort);
  const q = sp.q?.trim().slice(0, 100) || undefined;
  const cities = await getCities();
  const city = cities.find((c) => c.slug === sp.city);
  const listings = await searchListings({
    query: q,
    categoryId: cat.id,
    cityId: city?.id,
    sort,
    limit: PER_PAGE,
    offset: (page - 1) * PER_PAGE,
  });
  const filtered = Boolean(q || city);

  return (
    <div className="container-page py-12">
      <Breadcrumbs
        trail={[
          { label: 'Home', href: '/' },
          { label: 'Categories', href: '/categories' },
          { label: cat.name },
        ]}
      />
      <h1 className="text-3xl font-bold sm:text-4xl">{cat.name}</h1>
      {cat.description ? (
        <p className="mt-3 max-w-2xl text-[var(--text-muted)]">{cat.description}</p>
      ) : null}
      <div className="mt-8">
        <ListingFilters
          action={`/category/${cat.slug}`}
          q={q}
          city={city?.slug}
          sort={sort}
          cities={cities}
        />
      </div>
      <div className="mt-8">
        <Results
          listings={listings}
          basePath={`/category/${cat.slug}`}
          page={page}
          perPage={PER_PAGE}
          sort={sort}
          query={q}
          params={{ city: city?.slug }}
          cityNames={new Map(cities.map((c) => [c.id, c.name]))}
          emptyTitle={
            filtered
              ? `No ${cat.name.toLowerCase()} match`
              : `No ${cat.name.toLowerCase()} listed yet`
          }
          emptyBody={
            filtered
              ? city
                ? `Nothing in ${city.name} yet. Try another city or clear the filters.`
                : 'Nothing matches that search. Try a shorter keyword.'
              : 'Nothing has been approved in this category so far.'
          }
        />
      </div>
    </div>
  );
}
