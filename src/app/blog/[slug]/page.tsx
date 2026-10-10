import type { Metadata } from 'next';
import Link from 'next/link';
import { getBlogPost, getBlogPosts } from '@/lib/queries';
import { PageHero } from '@/components/page-hero';
import { SITE_URL } from '@/lib/supabase';
import { SHARE_IMAGE } from '@/lib/seo';
import { Markdown } from '@/components/markdown';
import { redirectOrNotFound } from '@/lib/redirects';
import { jsonLdHtml } from '@/lib/json-ld';
import { JsonLd, breadcrumbSchema } from '@/components/json-ld';

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
    openGraph: { title, description, url, type: 'article', images: [SHARE_IMAGE] },
    twitter: { card: 'summary_large_image', title, description, images: [SHARE_IMAGE] },
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

  const trail = [
    { label: 'Home', href: '/' },
    { label: 'Blog', href: '/blog' },
    { label: post.title },
  ];

  return (
    <>
      <JsonLd data={breadcrumbSchema(trail, `/blog/${post.slug}`)} />
      {/* The title is editor-written: escape "<" so a "</script>" in it cannot close the tag. */}
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdHtml(jsonLd)} />
      <PageHero
        trail={trail}
        eyebrow="From the blog"
        heading={post.title}
        subheading={post.standfirst || undefined}
      >
        {post.read_minutes ? (
          <p className="text-sm text-white/70">{post.read_minutes} min read</p>
        ) : null}
      </PageHero>
      <div className="container-page py-10 md:py-12">
        <article className="mx-auto max-w-2xl">
          <div>{post.body ? <Markdown source={post.body} /> : null}</div>
          <p className="border-border-subtle mt-10 border-t pt-6 text-[var(--text-muted)]">
            <Link href="/seo-services" className="text-brand-700 font-semibold hover:underline">
              Need help with SEO?
            </Link>{' '}
            or{' '}
            <Link href="/add-business" className="text-brand-700 font-semibold hover:underline">
              list your business
            </Link>
            .
          </p>
        </article>

        {related.length > 0 ? (
          <section className="mx-auto mt-16 max-w-2xl">
            <h2 className="font-headline-sm text-headline-sm">Related articles</h2>
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
    </>
  );
}
