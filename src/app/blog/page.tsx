import type { Metadata } from 'next';
import Link from 'next/link';
import { findSection, getBlogPosts, getPageSections } from '@/lib/queries';
import { Breadcrumbs, EmptyState } from '@/components/ui';
import { seoMetadata } from '@/lib/seo';

export const revalidate = 600;
export async function generateMetadata(): Promise<Metadata> {
  return seoMetadata('/blog', {
    title: 'Blog',
    description: 'Notes on getting found locally.',
    openGraph: { title: 'Blog', description: 'Notes on getting found locally.' },
    twitter: { card: 'summary_large_image', title: 'Blog' },
  });
}

export default async function BlogIndex() {
  const [sections, posts] = await Promise.all([getPageSections('blog'), getBlogPosts()]);
  const header = findSection(sections, 'header');
  return (
    <div className="container-page py-12">
      <Breadcrumbs trail={[{ label: 'Home', href: '/' }, { label: header?.heading ?? 'Blog' }]} />
      <h1 className="font-headline-lg text-headline-lg">{header?.heading}</h1>
      {header?.subheading ? (
        <p className="mt-3 text-[var(--text-muted)]">{header.subheading}</p>
      ) : null}
      <div className="mt-10">
        {posts.length === 0 ? (
          <EmptyState title="No articles yet" body="Nothing has been published so far." />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <Link
                key={p.id}
                href={`/blog/${p.slug}`}
                className="surface-card hover:border-brand-500 p-5"
              >
                <h2 className="font-title-md text-title-md leading-snug">{p.title}</h2>
                {p.standfirst ? (
                  <p className="mt-2 line-clamp-3 text-sm text-[var(--text-muted)]">
                    {p.standfirst}
                  </p>
                ) : null}
                {p.read_minutes ? (
                  <p className="mt-3 text-xs text-[var(--text-muted)]">{p.read_minutes} min read</p>
                ) : null}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
