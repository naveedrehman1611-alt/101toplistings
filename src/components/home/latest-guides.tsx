import Link from 'next/link';
import { Icon } from '@/components/icon';
import { BLOG_CLUSTERS } from '@/lib/blog-clusters';
import type { PostCardRow } from '@/lib/queries';

/** The newest articles, linked to the guide clusters. Renders nothing until a post is published. */
export function LatestGuides({ posts }: { posts: PostCardRow[] }) {
  if (posts.length === 0) return null;
  return (
    <section className="container-page py-20">
      <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="max-w-2xl">
          <span className="font-label-sm text-label-sm text-primary-container font-semibold tracking-wider uppercase">
            Guides
          </span>
          <h2 className="font-headline-lg text-headline-lg-mobile text-on-surface md:text-headline-lg mt-1">
            Latest Business &amp; SEO Guides
          </h2>
          <nav aria-label="Guide topics" className="mt-4 flex flex-wrap gap-2">
            {BLOG_CLUSTERS.map((c) => (
              <Link
                key={c.slug}
                href={c.path}
                className="border-border-subtle hover:border-brand-500 text-brand-700 rounded-full border px-4 py-1.5 text-sm font-semibold"
              >
                {c.name}
              </Link>
            ))}
          </nav>
        </div>
        <Link
          href="/blog"
          className="font-label-md text-label-md text-primary-container inline-flex shrink-0 items-center gap-1 font-semibold hover:underline"
        >
          All articles
          <Icon name="arrow_forward" size={18} />
        </Link>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => (
          <Link
            key={p.id}
            href={`/blog/${p.slug}`}
            className="surface-card hover:border-brand-500 flex flex-col p-5"
          >
            {p.category ? (
              <span className="text-primary-container text-xs font-semibold tracking-wider uppercase">
                {p.category.name}
              </span>
            ) : null}
            <h3 className="font-title-md text-title-md mt-1 leading-snug">{p.title}</h3>
            {p.standfirst ? (
              <p className="mt-2 line-clamp-3 text-sm text-[var(--text-muted)]">{p.standfirst}</p>
            ) : null}
            {p.read_minutes ? (
              <p className="mt-auto pt-3 text-xs text-[var(--text-muted)]">
                {p.read_minutes} min read
              </p>
            ) : null}
          </Link>
        ))}
      </div>
    </section>
  );
}
