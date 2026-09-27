import type { Metadata, ResolvingMetadata } from 'next';
import { getHomePage } from '@/lib/home';
import { getChrome } from '@/lib/chrome';
import { seoMetadata } from '@/lib/seo';
import { SITE_URL } from '@/lib/supabase';
import type { FaqVM } from '@/lib/home-types';
import { HomeSection } from '@/components/home/render-section';

// ISR. Every admin write that changes what this page shows (sections, items,
// settings, menus, listings, reviews, posts) revalidates "/" on demand, so the
// timer is only a backstop — and a long one keeps Supabase egress flat.
export const revalidate = 3600;

// The layout's defaults (from settings) are the home page's own title and
// description; the SEO manager can still override them for "/".
export async function generateMetadata(
  _props: unknown,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  return seoMetadata('/', { alternates: { canonical: '/' } }, parent);
}

/** Structured data only for what the page really shows. */
function jsonLd(
  brand: string,
  chrome: Awaited<ReturnType<typeof getChrome>>,
  faq: FaqVM | undefined,
) {
  const site = SITE_URL.replace(/\/+$/, '');
  const graph: Record<string, unknown>[] = [
    {
      '@type': 'WebSite',
      '@id': `${site}/#website`,
      url: `${site}/`,
      name: brand,
      // The hero search form submits to /search, so the sitelinks search box is real.
      potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: `${site}/search?q={search_term_string}` },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'Organization',
      '@id': `${site}/#organization`,
      name: brand,
      url: `${site}/`,
      ...(chrome.brand.logoOnLight ? { logo: chrome.brand.logoOnLight.url } : {}),
      ...(chrome.footer.social.length ? { sameAs: chrome.footer.social.map((s) => s.href) } : {}),
    },
  ];
  if (faq) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${site}/#faq`,
      mainEntity: faq.items.map((q) => ({
        '@type': 'Question',
        name: q.question,
        acceptedAnswer: { '@type': 'Answer', text: q.answer.join('\n\n') },
      })),
    });
  }
  return { '@context': 'https://schema.org', '@graph': graph };
}

export default async function HomePage() {
  const [home, chrome] = await Promise.all([getHomePage(), getChrome()]);
  const faq = home.sections.find((s): s is FaqVM => s.type === 'faq');

  return (
    <>
      {home.sections.map((section) => (
        <HomeSection key={section.id} section={section} />
      ))}
      <script
        type="application/ld+json"
        // "<" is escaped so copy can never close the script element.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd(home.brand, chrome, faq)).replace(/</g, '\\u003c'),
        }}
      />
    </>
  );
}
