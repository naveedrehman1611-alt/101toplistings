import type { Metadata } from 'next';
import Link from 'next/link';
import { findSection, getCategories, getPageSections, type Category } from '@/lib/queries';
import { Breadcrumbs } from '@/components/ui';
import { seoMetadata } from '@/lib/seo';

export const revalidate = 600;
export async function generateMetadata(): Promise<Metadata> {
  return seoMetadata('/categories', {
    title: 'Categories',
    description: 'Browse businesses by what they do.',
    openGraph: { title: 'Categories', description: 'Browse businesses by what they do.' },
    twitter: { card: 'summary_large_image', title: 'Categories' },
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

  return (
    <div className="container-page py-12">
      <Breadcrumbs
        trail={[{ label: 'Home', href: '/' }, { label: header?.heading ?? 'Categories' }]}
      />
      <h1 className="text-3xl font-bold sm:text-4xl">{header?.heading}</h1>
      {header?.subheading ? (
        <p className="mt-3 text-[var(--text-muted)]">{header.subheading}</p>
      ) : null}
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {roots.map((c) => {
          const kids = childrenOf.get(c.id) ?? [];
          return (
            <section key={c.id} className="surface-card p-5">
              <h2 className="text-lg font-medium">
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
