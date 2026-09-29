import type { Metadata } from 'next';
import Link from 'next/link';
import { findSection, getCategories, getPageSections } from '@/lib/queries';
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
  return (
    <div className="container-page py-12">
      <Breadcrumbs
        trail={[{ label: 'Home', href: '/' }, { label: header?.heading ?? 'Categories' }]}
      />
      <h1 className="font-headline-lg text-headline-lg">{header?.heading}</h1>
      {header?.subheading ? (
        <p className="mt-3 text-[var(--text-muted)]">{header.subheading}</p>
      ) : null}
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/category/${c.slug}`}
            className="surface-card hover:border-brand-500 p-5"
          >
            <p className="font-title-md text-title-md">{c.name}</p>
            {c.description ? (
              <p className="mt-1 text-sm text-[var(--text-muted)]">{c.description}</p>
            ) : null}
          </Link>
        ))}
      </div>
    </div>
  );
}
