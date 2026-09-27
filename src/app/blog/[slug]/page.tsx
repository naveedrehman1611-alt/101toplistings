import type { Metadata } from 'next';
import Link from 'next/link';
import { getBlogPost, getBlogPosts } from '@/lib/queries';
import { Breadcrumbs } from '@/components/ui';
import { SITE_URL } from '@/lib/supabase';
import { Markdown } from '@/components/markdown';
import { redirectOrNotFound } from '@/lib/redirects';

export const revalidate = 600;

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return { title: 'Not found' };
  const title = post.seo_title ?? post.title;
  const description = post.seo_description ?? post.standfirst ?? '';
  const url = `${SITE_URL}/blog/${post.slug}`;
  return {
    title,
    description,
    // Self-canonical unless the editor set an override (validated as http(s) on save).
    alternates: { canonical: post.canonical_url ?? url },
    openGraph: { title, description, url, type: 'article' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  // A retired slug may have a stored redirect; otherwise this renders the 404.
  if (!post) return redirectOrNotFound(`/blog/${encodeURIComponent(slug)}`);

  const all = await getBlogPosts();
  const related = all.filter((p) => p.slug !== post.slug).slice(0, 3);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.standfirst ?? undefined,
    datePublished: post.published_at ?? undefined,
    url: `${SITE_URL}/blog/${post.slug}`,
  };

  return (
    <div className="container-page py-12">
      {/* The title is editor-written: escape "<" so a "</script>" in it cannot close the tag. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <Breadcrumbs
        trail={[
          { label: 'Home', href: '/' },
          { label: 'Blog', href: '/blog' },
          { label: post.title },
        ]}
      />
      <article className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold sm:text-4xl">{post.title}</h1>
        {post.standfirst ? (
          <p className="mt-4 text-lg text-[var(--text-muted)]">{post.standfirst}</p>
        ) : null}
        {post.read_minutes ? (
          <p className="mt-3 text-sm text-[var(--text-muted)]">{post.read_minutes} min read</p>
        ) : null}
        <div className="mt-8">{post.body ? <Markdown source={post.body} /> : null}</div>
      </article>

      {related.length > 0 ? (
        <section className="mx-auto mt-16 max-w-2xl">
          <h2 className="text-xl font-semibold">Related articles</h2>
          <ul className="mt-4 space-y-2">
            {related.map((p) => (
              <li key={p.id}>
                <Link href={`/blog/${p.slug}`} className="text-brand-700 hover:underline">
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
