import type { Metadata } from 'next';
// Up to ~165 links to per-request pages: prefetch on intent only.
import { HoverPrefetchLink as Link } from '@/components/hover-prefetch-link';
import {
  getCategories,
  getCategoryBySlug,
  getCategoryListingCounts,
  getCities,
  searchListings,
} from '@/lib/queries';
import { Results, parsePage, parseSort } from '@/components/results';
import { ListingFilters } from '@/components/listing-filters';
import { MIN_CATEGORY_LISTINGS_TO_INDEX, pageMetadata, resultsPageSeo } from '@/lib/seo';
import { JsonLd, breadcrumbSchema, itemListSchema } from '@/components/json-ld';
import { PageHero } from '@/components/page-hero';
import { redirectOrNotFound, redirectToLowercase } from '@/lib/redirects';
import { getPageContent } from '@/lib/content/get';
import { fill } from '@/components/browse/fill';
import { InlineMarkdown } from '@/components/markdown';
import { stripMarkdown } from '@/lib/markdown-links';

export const revalidate = 600;
const PER_PAGE = 12;

export async function generateStaticParams() {
  const cats = await getCategories();
  return cats.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; sort?: string; q?: string; city?: string }>;
}): Promise<Metadata> {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const cat = await getCategoryBySlug(slug);
  if (!cat) return { title: 'Not found' };
  const title = `${cat.name} businesses`;
  // The description is inline markdown (links, emphasis); meta tags take plain text.
  const description =
    stripMarkdown(cat.description ?? '') || `Browse ${cat.name.toLowerCase()} businesses.`;
  // A failed count leaves the page indexable rather than noindex it on a blip.
  const count = (await getCategoryListingCounts([cat.id])).get(cat.id);
  // ?sort= alone is the same listings reordered (canonical to the plain page);
  // a search or city filter is a different subset (noindex).
  const filtered = Boolean(sp.q?.trim() || sp.city);
  const path = `/category/${cat.slug}`;
  return pageMetadata(path, {
    title,
    description,
    ...resultsPageSeo(
      path,
      parsePage(sp.page),
      filtered,
      count !== undefined && count < MIN_CATEGORY_LISTINGS_TO_INDEX,
    ),
  });
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
  if (!cat) {
    await redirectToLowercase('/category', slug, getCategoryBySlug, sp);
    return redirectOrNotFound(`/category/${encodeURIComponent(slug)}`);
  }

  const page = parsePage(sp.page);
  const sort = parseSort(sp.sort);
  const q = sp.q?.trim().slice(0, 100) || undefined;
  const [cities, categories, { hero, empty }, shared] = await Promise.all([
    getCities(),
    getCategories(),
    getPageContent('category_page'),
    getPageContent('directory_shared'),
  ]);
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
    { label: hero.crumb, href: '/business-categories' },
    ...(parent ? [{ label: parent.name, href: `/category/${parent.slug}` }] : []),
    { label: cat.name },
  ];
  const path = `/category/${cat.slug}`;

  // Shown only for the unfiltered category, so the figure is the category's own total.
  const total = filtered ? 0 : Number(listings[0]?.total_count ?? 0);
  const stats = [
    ...(total > 0 ? [{ value: total, label: hero.stat_listings }] : []),
    ...(children.length ? [{ value: children.length, label: hero.stat_subcategories }] : []),
  ];

  return (
    <>
      <JsonLd data={breadcrumbSchema(trail, path)} />
      {listings.length > 0 ? (
        <JsonLd data={itemListSchema(cat.name, listings, (page - 1) * PER_PAGE)} />
      ) : null}
      <PageHero
        trail={trail}
        eyebrow={hero.eyebrow}
        heading={cat.name}
        subheading={
          cat.description ? (
            // Emphasis is styled for light surfaces; keep it legible on the navy hero.
            <span className="[&_strong]:text-white">
              <InlineMarkdown
                text={cat.description}
                linkClassName="text-hero-green-light underline decoration-hero-green-light/40 underline-offset-2 hover:decoration-hero-green-light"
              />
            </span>
          ) : null
        }
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
            labels={shared.filters}
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
            emptyTitle={fill(filtered ? empty.filtered_title : empty.empty_title, {
              category: cat.name.toLowerCase(),
            })}
            emptyBody={
              filtered
                ? city
                  ? fill(empty.city_body, { city: city.name })
                  : empty.search_body
                : empty.empty_body
            }
            labels={shared.results}
            cardLabels={shared.cards}
          />
        </div>
      </div>
    </>
  );
}
