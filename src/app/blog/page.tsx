import type { Metadata } from 'next';
import Link from 'next/link';
import { findSection, getBlogPosts, getPageSections } from '@/lib/queries';
import { EmptyState } from '@/components/ui';
import { PageHero } from '@/components/page-hero';
import { seoMetadata } from '@/lib/seo';
import { BLOG_CLUSTERS } from '@/lib/blog-clusters';
import { getPageContent } from '@/lib/content/get';
import { clusterSection } from '@/components/blog-cluster-page';
import { fill } from '@/components/browse/fill';

const TITLE = 'Business, SEO & Digital Marketing Blog';
const DESCRIPTION =
  'A business directory, SEO and digital marketing blog: practical guides on listings, local visibility, rankings and growing your business online.';

export const revalidate = 3600;
export async function generateMetadata(): Promise<Metadata> {
  const posts = await getBlogPosts();
  return seoMetadata('/blog', {
    title: TITLE,
    description: DESCRIPTION,
    openGraph: { title: TITLE, description: DESCRIPTION },
    twitter: { card: 'summary_large_image', title: TITLE },
    // Noindex (but followed) until the first post is published, like the guide hubs.
    ...(posts.length === 0 ? { robots: { index: false, follow: true } } : {}),
  });
}

export default async function BlogIndex() {
  const [sections, posts, { hero, posts: list }, clusters] = await Promise.all([
    getPageSections('blog'),
    getBlogPosts(),
    getPageContent('blog'),
    getPageContent('blog_clusters'),
  ]);
  // A header kept in Admin → Pages (the older page sections) is shown until the hero
  // is saved in Admin → Content; from then on the Content copy wins.
  const header = hero.edited ? undefined : findSection(sections, 'header');
  const heading = header?.heading ?? hero.heading;
  return (
    <>
      <PageHero
        trail={[{ label: 'Home', href: '/' }, { label: heading }]}
        eyebrow={hero.eyebrow}
        heading={heading}
        subheading={(header ? header.subheading : hero.intro) || undefined}
        stats={[
          {
            value: posts.length,
            label: posts.length === 1 ? hero.stat_article : hero.stat_articles,
          },
          { value: BLOG_CLUSTERS.length, label: hero.stat_hubs },
        ]}
      >
        <nav aria-label="Guides" className="flex flex-wrap gap-2">
          {BLOG_CLUSTERS.map((c) => (
            <Link
              key={c.slug}
              href={c.path}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-semibold text-white/80 transition-colors hover:border-white/30 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              {clusterSection(clusters, c.slug).name}
            </Link>
          ))}
        </nav>
      </PageHero>
      <div className="container-page py-10 md:py-12">
        {posts.length === 0 ? (
          <EmptyState title={list.empty_title} body={list.empty_body} />
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
                  <p className="mt-3 text-xs text-[var(--text-muted)]">
                    {fill(list.read_time, { minutes: p.read_minutes })}
                  </p>
                ) : null}
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
