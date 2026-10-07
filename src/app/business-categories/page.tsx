import type { Metadata } from 'next';
// Up to ~165 links to per-request pages: prefetch on intent only.
import { HoverPrefetchLink as Link } from '@/components/hover-prefetch-link';
import { findSection, getCategories, getPageSections, type Category } from '@/lib/queries';
import { Breadcrumbs } from '@/components/ui';
import { JsonLd, breadcrumbSchema } from '@/components/json-ld';
import { seoMetadata } from '@/lib/seo';

export const revalidate = 600;
const TITLE = 'Business Categories | Find Companies by Industry';
const DESCRIPTION =
  'Browse businesses by industry and category. Discover companies, services, and local providers in the directory.';

export async function generateMetadata(): Promise<Metadata> {
  return seoMetadata('/business-categories', {
    title: TITLE,
    description: DESCRIPTION,
    openGraph: { title: TITLE, description: DESCRIPTION },
    twitter: { card: 'summary_large_image', title: TITLE },
  });
}

export default async function CategoriesPage() {
  const [sections, categories] = await Promise.all([
    getPageSections('categories'),
    getCategories(),
  ]);
  const header = findSection(sections, 'header');

  // Top-level categories as cards, each listing its subcategories, so a tree of
  // 18 parents and ~150 children reads as 18 groups rather than one long grid.
  const ids = new Set(categories.map((c) => c.id));
  const childrenOf = new Map<string, Category[]>();
  for (const c of categories) {
    if (!c.parent_id || !ids.has(c.parent_id)) continue;
    childrenOf.set(c.parent_id, [...(childrenOf.get(c.parent_id) ?? []), c]);
  }
  const roots = categories.filter((c) => !c.parent_id || !ids.has(c.parent_id));

  const trail = [{ label: 'Home', href: '/' }, { label: header?.heading ?? 'Categories' }];

  return (
    <div className="container-page py-12">
      <JsonLd data={breadcrumbSchema(trail, '/business-categories')} />
      <Breadcrumbs trail={trail} />
      <h1 className="font-headline-lg text-headline-lg">{header?.heading ?? 'Business categories'}</h1>
      {header?.subheading ? (
        <p className="mt-3 text-[var(--text-muted)]">{header.subheading}</p>
      ) : null}
      <p className="mt-3 max-w-2xl text-[var(--text-muted)]">
        This business directory by category groups companies by the industry they work in. Pick a
        category to see the businesses listed under it, or{' '}
        <Link href="/add-business" className="text-brand-700 hover:underline">
          list your business
        </Link>{' '}
        in the category that fits.
      </p>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {roots.map((c) => {
          const kids = childrenOf.get(c.id) ?? [];
          return (
            <section key={c.id} className="surface-card p-5">
              <h2 className="font-title-md text-title-md">
                <Link href={`/category/${c.slug}`} className="hover:text-brand-700">
                  {c.name}
                </Link>
              </h2>
              {c.description ? (
                <p className="mt-1 text-sm text-[var(--text-muted)]">{c.description}</p>
              ) : null}
              {kids.length ? (
                <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5 text-sm">
                  {kids.map((k) => (
                    <li key={k.id}>
                      <Link
                        href={`/category/${k.slug}`}
                        className="hover:text-brand-700 text-[var(--text-muted)] hover:underline"
                      >
                        {k.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          );
        })}
      </div>
    </div>
  );
}
