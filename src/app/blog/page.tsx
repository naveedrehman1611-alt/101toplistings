import type { Metadata } from 'next';
import Link from 'next/link';
import { findSection, getBlogPosts, getPageSections } from '@/lib/queries';
import { Breadcrumbs, EmptyState } from '@/components/ui';

export const revalidate = 600;
export const metadata: Metadata = {
  title: 'Blog',
  description: 'Notes on getting found locally.',
  openGraph: { title: 'Blog', description: 'Notes on getting found locally.' },
  twitter: { card: 'summary_large_image', title: 'Blog' },
};

export default async function BlogIndex() {
  const [sections, posts] = await Promise.all([getPageSections('blog'), getBlogPosts()]);
  const header = findSection(sections, 'header');
  return (
    <div className="container-page py-12">
      <Breadcrumbs trail={[{ label: 'Home', href: '/' }, { label: header?.heading ?? 'Blog' }]} />
      <h1 className="text-3xl font-bold sm:text-4xl">{header?.heading}</h1>
      {header?.subheading ? <p className="mt-3 text-[var(--text-muted)]">{header.subheading}</p> : null}
      <div className="mt-10">
        {posts.length === 0 ? (
          <EmptyState title="No articles yet" body="Nothing has been published so far." />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <Link key={p.id} href={`/blog/${p.slug}`} className="surface-card p-5 hover:border-brand-500">
                <h2 className="font-display font-semibold leading-snug">{p.title}</h2>
                {p.standfirst ? (
                  <p className="mt-2 line-clamp-3 text-sm text-[var(--text-muted)]">{p.standfirst}</p>
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
