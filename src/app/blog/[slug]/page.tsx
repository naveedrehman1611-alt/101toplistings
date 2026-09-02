import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getBlogPost, getBlogPosts } from '@/lib/queries';
import { Breadcrumbs } from '@/components/ui';
import { SITE_URL } from '@/lib/supabase';

export const revalidate = 600;

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return { title: 'Not found' };
  const description = post.standfirst ?? '';
  const url = `${SITE_URL}/blog/${post.slug}`;
  return {
    title: post.title,
    description,
    alternates: { canonical: url },
    openGraph: { title: post.title, description, url, type: 'article' },
    twitter: { card: 'summary_large_image', title: post.title, description },
  };
}

/** Minimal markdown: headings and paragraphs. Body copy is authored, not user input. */
function renderBody(body: string) {
  return body.split('\n\n').map((block, i) => {
    const t = block.trim();
    if (t.startsWith('## ')) {
      return (
        <h2 key={i} className="mt-10 text-2xl font-semibold">
          {t.slice(3)}
        </h2>
      );
    }
    if (t.startsWith('- ')) {
      return (
        <ul key={i} className="mt-4 list-disc space-y-1 pl-5 text-[var(--text-muted)]">
          {t.split('\n').map((li, j) => (
            <li key={j}>{li.replace(/^-\s*/, '')}</li>
          ))}
        </ul>
      );
    }
    return (
      <p key={i} className="mt-4 leading-relaxed text-[var(--text-muted)]">
        {t.replace(/\*\*(.+?)\*\*/g, '$1')}
      </p>
    );
  });
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) notFound();

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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumbs
        trail={[{ label: 'Home', href: '/' }, { label: 'Blog', href: '/blog' }, { label: post.title }]}
      />
      <article className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold sm:text-4xl">{post.title}</h1>
        {post.standfirst ? <p className="mt-4 text-lg text-[var(--text-muted)]">{post.standfirst}</p> : null}
        {post.read_minutes ? (
          <p className="mt-3 text-sm text-[var(--text-muted)]">{post.read_minutes} min read</p>
        ) : null}
        <div className="mt-8">{post.body ? renderBody(post.body) : null}</div>
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
