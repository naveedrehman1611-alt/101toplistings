import type { Metadata } from 'next';
import Link from 'next/link';
import { findSection, getBlogPosts, getPageSections } from '@/lib/queries';
import { EmptyState } from '@/components/ui';
import { PageHero } from '@/components/page-hero';
import { seoMetadata } from '@/lib/seo';
import { BLOG_CLUSTERS } from '@/lib/blog-clusters';

const TITLE = 'Business, SEO & Digital Marketing Blog';
const DESCRIPTION =
  'A business directory, SEO and digital marketing blog: practical guides on listings, local visibility, rankings and growing your business online.';

export const revalidate = 600;
export async function generateMetadata(): Promise<Metadata> {
  return seoMetadata('/blog', {
    title: TITLE,
    description: DESCRIPTION,
    openGraph: { title: TITLE, description: DESCRIPTION },
    twitter: { card: 'summary_large_image', title: TITLE },
  });
}

export default async function BlogIndex() {
  const [sections, posts] = await Promise.all([getPageSections('blog'), getBlogPosts()]);
  const header = findSection(sections, 'header');
  return (
    <>
      <PageHero
        trail={[{ label: 'Home', href: '/' }, { label: header?.heading ?? 'Blog' }]}
        eyebrow="Guides & insights"
        heading={header?.heading}
        subheading={header?.subheading || undefined}
        stats={[
          { value: posts.length, label: posts.length === 1 ? 'Article' : 'Articles' },
          { value: BLOG_CLUSTERS.length, label: 'Guide Hubs' },
        ]}
      >
        <nav aria-label="Guides" className="flex flex-wrap gap-2">
          {BLOG_CLUSTERS.map((c) => (
            <Link
              key={c.slug}
              href={c.path}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-semibold text-white/80 transition-colors hover:border-white/30 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              {c.name}
            </Link>
          ))}
        </nav>
      </PageHero>
      <div className="container-page py-10 md:py-12">
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
    </>
  );
}
