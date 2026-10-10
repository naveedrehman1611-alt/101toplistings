import Link from 'next/link';
import type { Metadata } from 'next';
import { EmptyState } from '@/components/ui';
import { JsonLd, breadcrumbSchema } from '@/components/json-ld';
import { PageHero } from '@/components/page-hero';
import { getClusterPosts, type BlogCluster } from '@/lib/blog-clusters';
import { seoMetadata } from '@/lib/seo';

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
  const posts = await getClusterPosts(cluster.slug);
  const trail = [
    { label: 'Home', href: '/' },
    { label: 'Blog', href: '/blog' },
    { label: cluster.name },
  ];
  return (
    <>
      <JsonLd data={breadcrumbSchema(trail, cluster.path)} />
      <PageHero
        trail={trail}
        eyebrow="Guide hub"
        heading={cluster.h1}
        subheading={cluster.intro}
        stats={
          posts.length > 0
            ? [{ value: posts.length, label: posts.length === 1 ? 'Guide' : 'Guides' }]
            : undefined
        }
      />
      <div className="container-page py-10 md:py-12">
        <div>
          {posts.length === 0 ? (
            <EmptyState
              title="Guides coming soon"
              body="No guides are published here yet. Check back soon, or browse the rest of the blog."
              action={
                <Link href="/blog" className="text-brand-700 font-semibold hover:underline">
                  Browse all articles
                </Link>
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
                      {p.read_minutes} min read
                    </p>
                  ) : null}
                </Link>
              ))}
            </div>
          )}
        </div>

        <section className="mt-16">
          <h2 className="font-headline-md text-headline-md">Related services</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {cluster.moneyLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="surface-card hover:border-brand-500 block p-4">
                  <span className="font-title-md text-title-md">{l.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-12">
          <Link
            href={cluster.cta.href}
            className="bg-primary-container text-on-primary hover:bg-primary focus-visible:ring-primary-container inline-flex items-center gap-2 rounded-xl px-6 py-3.5 font-semibold shadow-md transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden"
          >
            {cluster.cta.label}
          </Link>
        </div>
      </div>
    </>
  );
}
