import Link from 'next/link';
import type { Metadata } from 'next';
import { EmptyState } from '@/components/ui';
import { JsonLd, breadcrumbSchema } from '@/components/json-ld';
import { PageHero } from '@/components/page-hero';
import { getClusterPosts, type BlogCluster } from '@/lib/blog-clusters';
import { seoMetadata } from '@/lib/seo';
import { getPageContent } from '@/lib/content/get';
import type { BlogClusterContent } from '@/lib/content/pages/directory';
import { fill } from '@/components/browse/fill';

/** The Admin → Content section holding a hub's copy ("business-directory" → business_directory). */
export function clusterSection(
  content: Awaited<ReturnType<typeof getPageContent<'blog_clusters'>>>,
  slug: BlogCluster['slug'],
): BlogClusterContent {
  switch (slug) {
    case 'business-directory':
      return content.business_directory;
    case 'seo':
      return content.seo;
    case 'digital-marketing':
      return content.digital_marketing;
  }
}

/** Shared generateMetadata body: noindex (but followed) while the cluster has no posts. */
export async function clusterMetadata(cluster: BlogCluster): Promise<Metadata> {
  const posts = await getClusterPosts(cluster.slug);
  const base: Metadata = {
    title: cluster.title,
    description: cluster.description,
    openGraph: { title: cluster.title, description: cluster.description },
    twitter: { card: 'summary_large_image', title: cluster.title },
  };
  if (posts.length === 0) base.robots = { index: false, follow: true };
  return seoMetadata(cluster.path, base);
}

/** A guide hub: answer-first intro, the cluster's posts, related service pages and a CTA. */
export async function BlogClusterPage({ cluster }: { cluster: BlogCluster }) {
  const [posts, content] = await Promise.all([
    getClusterPosts(cluster.slug),
    getPageContent('blog_clusters'),
  ]);
  const { shared } = content;
  const c = clusterSection(content, cluster.slug);
  const links = c.links.filter((l) => l.link.label && l.link.href);
  const trail = [
    { label: 'Home', href: '/' },
    { label: shared.blog_crumb, href: '/blog' },
    { label: c.name },
  ];
  return (
    <>
      <JsonLd data={breadcrumbSchema(trail, cluster.path)} />
      <PageHero
        trail={trail}
        eyebrow={shared.eyebrow}
        heading={c.heading}
        subheading={c.intro || undefined}
        stats={
          posts.length > 0
            ? [
                {
                  value: posts.length,
                  label: posts.length === 1 ? shared.stat_guide : shared.stat_guides,
                },
              ]
            : undefined
        }
      />
      <div className="container-page py-10 md:py-12">
        <div>
          {posts.length === 0 ? (
            <EmptyState
              title={shared.empty_title}
              body={shared.empty_body}
              action={
                shared.empty_link.label && shared.empty_link.href ? (
                  <Link
                    href={shared.empty_link.href}
                    className="text-brand-700 font-semibold hover:underline"
                  >
                    {shared.empty_link.label}
                  </Link>
                ) : undefined
              }
            />
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
                      {fill(shared.read_time, { minutes: p.read_minutes })}
                    </p>
                  ) : null}
                </Link>
              ))}
            </div>
          )}
        </div>

        {links.length > 0 ? (
          <section className="mt-16">
            <h2 className="font-headline-md text-headline-md">{shared.related_heading}</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {links.map(({ link: l }, i) => (
                <li key={i}>
                  <Link href={l.href} className="surface-card hover:border-brand-500 block p-4">
                    <span className="font-title-md text-title-md">{l.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {c.cta.label && c.cta.href ? (
          <div className="mt-12">
            <Link
              href={c.cta.href}
              className="bg-primary-container text-on-primary hover:bg-primary focus-visible:ring-primary-container inline-flex items-center gap-2 rounded-xl px-6 py-3.5 font-semibold shadow-md transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden"
            >
              {c.cta.label}
            </Link>
          </div>
        ) : null}
      </div>
    </>
  );
}
