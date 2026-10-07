import type { Metadata } from 'next';
import Link from 'next/link';
import { findSection, getPageSections, getSettings, settingText } from '@/lib/queries';
import { Breadcrumbs } from '@/components/ui';
import { Icon } from '@/components/icon';
import { JsonLd, breadcrumbSchema } from '@/components/json-ld';
import { SERVICE_PAGES } from '@/lib/service-pages';
import { SITE_URL } from '@/lib/supabase';
import { seoMetadata } from '@/lib/seo';

export const revalidate = 3600;

const TITLE = 'SEO Services | Rank Higher & Grow Online';
const DESCRIPTION =
  'Improve rankings, organic traffic, authority, and leads with technical SEO, on-page SEO, local SEO, link building, and content.';

export async function generateMetadata(): Promise<Metadata> {
  return seoMetadata('/seo-services', {
    title: TITLE,
    description: DESCRIPTION,
    openGraph: { title: TITLE, description: DESCRIPTION },
    twitter: { card: 'summary_large_image', title: TITLE },
  });
}

const STEPS: { title: string; body: string }[] = [
  {
    title: 'Free audit',
    body: 'Tell us about your business and website. We look at where you rank today and what is holding you back.',
  },
  {
    title: 'A plan you can read',
    body: 'You get a short, prioritised plan: what we will fix, what it is for, and what you can expect.',
  },
  {
    title: 'Work and reporting',
    body: 'We do the work and report on rankings, enquiries and visits, so you can see what your budget is doing.',
  },
];

export default async function ServicesPage() {
  const [sections, settings] = await Promise.all([getPageSections('services'), getSettings()]);
  const header = findSection(sections, 'header');
  const brand = settingText(settings, 'brand.name', 'RankYouSite');
  const heading = header?.heading ?? 'SEO services';
  const subheading =
    header?.subheading ??
    `${brand} is an SEO agency and SEO company offering professional, affordable SEO services for small business and growing brands worldwide. We help you rank higher, earn more organic traffic and turn visits into leads.`;

  const trail = [{ label: 'Home', href: '/' }, { label: 'SEO services' }];
  // Built from SERVICE_PAGES so the structured data always matches the cards.
  const offerCatalog = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'SEO services',
      itemListElement: SERVICE_PAGES.map((s) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: s.name,
          serviceType: s.name,
          description: s.description,
          url: `${SITE_URL}${s.path}`,
          areaServed: 'Worldwide',
        },
      })),
    },
  };

  return (
    <div className="container-page py-12">
      <JsonLd data={breadcrumbSchema(trail, '/seo-services')} />
      <JsonLd data={offerCatalog} />
      <Breadcrumbs trail={trail} />
      <div className="max-w-3xl">
        <h1 className="font-headline-lg text-headline-lg">{heading}</h1>
        <p className="mt-4 text-lg text-[var(--text-muted)]">{subheading}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/seo-audit"
            className="bg-primary-container text-on-primary hover:bg-primary focus-visible:ring-primary-container inline-flex items-center gap-2 rounded-xl px-6 py-3.5 font-semibold shadow-md transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden"
          >
            <Icon name="fact_check" size={20} />
            Get an SEO audit
          </Link>
          <Link
            href="/contact?subject=SEO%20services"
            className="bg-surface-card text-on-surface hover:border-primary-container inline-flex items-center gap-2 rounded-xl border border-[var(--border)] px-6 py-3.5 font-semibold transition-colors"
          >
            <Icon name="mail" size={20} />
            Request a quote
          </Link>
        </div>
      </div>

      <h2 className="font-headline-md text-headline-md mt-16">What we do</h2>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {SERVICE_PAGES.map((s) => (
          <Link
            key={s.slug}
            href={s.path}
            className="surface-card hover:border-primary-container flex flex-col p-6 transition-colors"
          >
            <div className="bg-surface-container-low text-primary-container mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
              <Icon name={s.icon} size={26} />
            </div>
            <h3 className="font-title-md text-title-md">{s.name}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{s.description}</p>
            <span className="text-primary-container mt-4 inline-flex items-center gap-1 text-sm font-semibold">
              Learn more
              <Icon name="arrow_forward" size={16} />
            </span>
          </Link>
        ))}
      </div>

      <h2 className="font-headline-md text-headline-md mt-16">How it works</h2>
      <ol className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        {STEPS.map((s, i) => (
          <li key={s.title} className="surface-card p-6">
            <span className="text-primary-container font-semibold">Step {i + 1}</span>
            <h3 className="font-title-md text-title-md mt-1">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{s.body}</p>
          </li>
        ))}
      </ol>

      <div className="surface-card mt-16 flex flex-col items-start justify-between gap-6 p-8 md:flex-row md:items-center">
        <div className="max-w-2xl">
          <h2 className="font-headline-sm text-headline-sm">Want more traffic from search?</h2>
          <p className="mt-2 text-[var(--text-muted)]">
            Send us your website. We will reply with what we would fix first.
          </p>
        </div>
        <Link
          href="/contact?subject=SEO%20services"
          className="bg-primary-container text-on-primary hover:bg-primary inline-flex shrink-0 items-center gap-2 rounded-xl px-6 py-3.5 font-semibold shadow-md transition-colors"
        >
          Request a quote
          <Icon name="arrow_forward" size={20} />
        </Link>
      </div>
    </div>
  );
}
