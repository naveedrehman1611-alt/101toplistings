import type { Metadata } from 'next';
import Link from 'next/link';
import { getBlogPost, getBlogPosts, getSettings, settingText } from '@/lib/queries';
import { PageHero } from '@/components/page-hero';
import { SITE_URL } from '@/lib/supabase';
import { SHARE_IMAGE, absoluteUrl, pageMetadata, withoutBrandSuffix } from '@/lib/seo';
import { FOUNDER_ID } from '@/lib/founder';
import { Markdown } from '@/components/markdown';
import { redirectOrNotFound, redirectToLowercase } from '@/lib/redirects';
import { jsonLdHtml } from '@/lib/json-ld';
import { JsonLd, breadcrumbSchema } from '@/components/json-ld';
import { InlineMarkdown } from '@/components/markdown';
import { getPageContent } from '@/lib/content/get';
import { fill } from '@/components/browse/fill';

export const revalidate = 3600;

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
  const [settings, author] = await Promise.all([getSettings(), postAuthor()]);
  const brand = settingText(settings, 'brand.name', 'RankYouSite');
  const title = withoutBrandSuffix(post.seo_title ?? post.title, brand);
  const description = post.seo_description ?? post.standfirst ?? '';
  return pageMetadata(`/blog/${post.slug}`, {
    title,
    description,
    // Self-canonical unless the editor set an override (validated as http(s) on save).
    alternates: post.canonical_url ? { canonical: post.canonical_url } : undefined,
    openGraph: {
      title,
      description,
      type: 'article',
      ...(post.published_at ? { publishedTime: post.published_at } : {}),
      ...(post.updated_at ? { modifiedTime: post.updated_at } : {}),
      ...(author ? { authors: [`${SITE_URL}/about`] } : {}),
    },
  });
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  // A retired slug may have a stored redirect; otherwise this renders the 404.
  if (!post) {
    await redirectToLowercase('/blog', slug, getBlogPost);
    return redirectOrNotFound(`/blog/${encodeURIComponent(slug)}`);
  }

  const [all, { hero, footer, related: relatedCopy }, author] = await Promise.all([
    getBlogPosts(),
    getPageContent('blog_post'),
    postAuthor(),
  ]);
  // Posts from the same guide hub first, then the newest of the rest.
  const others = all.filter((p) => p.slug !== post.slug);
  const related = [
    ...others.filter((p) => post.category_id && p.category_id === post.category_id),
    ...others.filter((p) => !post.category_id || p.category_id !== post.category_id),
  ].slice(0, 3);
  // Only a later edit counts as an update, not the save that published the post.
  const updated =
    post.updated_at && post.published_at && sameDay(post.updated_at, post.published_at)
      ? null
      : post.updated_at;

  const url = `${SITE_URL}/blog/${post.slug}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.standfirst ?? undefined,
    datePublished: post.published_at ?? undefined,
    dateModified: post.updated_at ?? post.published_at ?? undefined,
    url,
    mainEntityOfPage: url,
    image: absoluteUrl(SHARE_IMAGE.url),
    author: author
      ? { '@type': 'Person', '@id': FOUNDER_ID, name: author.name, url: `${SITE_URL}/about` }
      : { '@id': `${SITE_URL}/#organization` },
    publisher: { '@id': `${SITE_URL}/#organization` },
  };

  const trail = [
    { label: 'Home', href: '/' },
    { label: hero.blog_crumb, href: '/blog' },
    { label: post.title },
  ];

  return (
    <>
      <JsonLd data={breadcrumbSchema(trail, `/blog/${post.slug}`)} />
      {/* The title is editor-written: escape "<" so a "</script>" in it cannot close the tag. */}
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdHtml(jsonLd)} />
      <PageHero
        trail={trail}
        eyebrow={hero.eyebrow}
        heading={post.title}
        subheading={post.standfirst || undefined}
      >
        <p className="flex flex-wrap gap-x-2 text-sm text-white/70">
          {author ? (
            <span>
              By{' '}
              <Link href="/about" className="font-semibold text-white hover:underline">
                {author.name}
              </Link>
            </span>
          ) : null}
          {post.published_at ? (
            <span>
              {author ? '· ' : ''}Published{' '}
              <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
            </span>
          ) : null}
          {updated ? (
            <span>
              · Updated <time dateTime={updated}>{formatDate(updated)}</time>
            </span>
          ) : null}
          {post.read_minutes ? (
            <span>· {fill(hero.read_time, { minutes: post.read_minutes })}</span>
          ) : null}
        </p>
      </PageHero>
      <div className="container-page py-10 md:py-12">
        <article className="mx-auto max-w-2xl">
          <div>{post.body ? <Markdown source={post.body} /> : null}</div>
          {footer.visible && footer.text ? (
            <p className="border-border-subtle mt-10 border-t pt-6 text-[var(--text-muted)]">
              <InlineMarkdown
                text={footer.text}
                linkClassName="text-brand-700 font-semibold hover:underline"
              />
            </p>
          ) : null}
        </article>

        {related.length > 0 && relatedCopy.visible ? (
          <section className="mx-auto mt-16 max-w-2xl">
            <h2 className="font-headline-sm text-headline-sm">{relatedCopy.heading}</h2>
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

/** The byline author: the founder from the About page, unless that section is hidden. */
async function postAuthor(): Promise<{ name: string } | null> {
  const { founder } = await getPageContent('about');
  return founder.visible && founder.name ? { name: founder.name } : null;
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

const sameDay = (a: string, b: string) => a.slice(0, 10) === b.slice(0, 10);
