import type { Metadata } from 'next';
// Up to ~165 links to per-request pages: prefetch on intent only.
import { HoverPrefetchLink as Link } from '@/components/hover-prefetch-link';
import { getCategories, getCategoryBySlug, getCities, searchListings } from '@/lib/queries';
import { Results, parsePage, parseSort } from '@/components/results';
import { ListingFilters } from '@/components/listing-filters';
import { SITE_URL } from '@/lib/supabase';
import { SHARE_IMAGE } from '@/lib/seo';
import { JsonLd, breadcrumbSchema, itemListSchema } from '@/components/json-ld';
import { PageHero } from '@/components/page-hero';
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
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/category/${cat.slug}`,
      images: [SHARE_IMAGE],
    },
    twitter: { card: 'summary_large_image', title, description, images: [SHARE_IMAGE] },
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
  const [cities, categories] = await Promise.all([getCities(), getCategories()]);
  const city = cities.find((c) => c.slug === sp.city);
  // A parent's results already include its children (search_listings, 0021);
  // the links below let visitors narrow to one of them.
  const parent = cat.parent_id ? categories.find((c) => c.id === cat.parent_id) : undefined;
  const children = categories.filter((c) => c.parent_id === cat.id);
  const listings = await searchListings({
    query: q,
    categoryId: cat.id,
    cityId: city?.id,
    sort,
    limit: PER_PAGE,
    offset: (page - 1) * PER_PAGE,
  });
  const filtered = Boolean(q || city);
  const trail = [
    { label: 'Home', href: '/' },
    { label: 'Categories', href: '/business-categories' },
    ...(parent ? [{ label: parent.name, href: `/category/${parent.slug}` }] : []),
    { label: cat.name },
  ];
  const path = `/category/${cat.slug}`;

  // Shown only for the unfiltered category, so the figure is the category's own total.
  const total = filtered ? 0 : Number(listings[0]?.total_count ?? 0);
  const stats = [
    ...(total > 0 ? [{ value: total, label: 'Listings' }] : []),
    ...(children.length ? [{ value: children.length, label: 'Subcategories' }] : []),
  ];

  return (
    <>
      <JsonLd data={breadcrumbSchema(trail, path)} />
      {listings.length > 0 ? (
        <JsonLd data={itemListSchema(cat.name, listings, (page - 1) * PER_PAGE)} />
      ) : null}
      <PageHero
        trail={trail}
        eyebrow="Business category"
        heading={cat.name}
        subheading={cat.description}
        stats={stats}
      >
        {children.length ? (
          <nav aria-label={`${cat.name} subcategories`}>
            <ul className="flex flex-wrap gap-2">
              {children.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/category/${c.slug}`}
                    className="inline-flex h-9 items-center rounded-full border border-white/10 bg-white/5 px-4 text-sm text-white/70 transition-colors hover:border-white/30 hover:text-white"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </PageHero>
      <div className="container-page py-10 md:py-12">
        <div>
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
    </>
  );
}
