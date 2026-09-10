import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCategories, getCategoryBySlug, getCities, searchListings } from '@/lib/queries';
import { Results, parsePage, parseSort } from '@/components/results';
import { Breadcrumbs } from '@/components/ui';
import { SITE_URL } from '@/lib/supabase';

export const revalidate = 600;
const PER_PAGE = 12;

export async function generateStaticParams() {
  const cats = await getCategories();
  return cats.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
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
  searchParams: Promise<{ page?: string; sort?: string }>;
}) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const cat = await getCategoryBySlug(slug);
  if (!cat) notFound();

  const page = parsePage(sp.page);
  const sort = parseSort(sp.sort);
  const [cities, listings] = await Promise.all([
    getCities(),
    searchListings({ categoryId: cat.id, sort, limit: PER_PAGE, offset: (page - 1) * PER_PAGE }),
  ]);

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
      {cat.description ? <p className="mt-3 max-w-2xl text-[var(--text-muted)]">{cat.description}</p> : null}
      <div className="mt-10">
        <Results
          listings={listings}
          basePath={`/category/${cat.slug}`}
          page={page}
          perPage={PER_PAGE}
          sort={sort}
          cityNames={new Map(cities.map((c) => [c.id, c.name]))}
          emptyTitle={`No ${cat.name.toLowerCase()} listed yet`}
          emptyBody="Nothing has been approved in this category so far."
        />
      </div>
    </div>
  );
}
