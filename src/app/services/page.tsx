import type { Metadata } from 'next';
import Link from 'next/link';
import { findSection, getPageSections, getSettings, settingText } from '@/lib/queries';
import { Breadcrumbs } from '@/components/ui';
import { Icon, type IconName } from '@/components/icon';
import { JsonLd, breadcrumbSchema } from '@/components/json-ld';
import { SITE_URL } from '@/lib/supabase';
import { seoMetadata } from '@/lib/seo';

export const revalidate = 3600;

const TITLE = 'SEO services for local businesses in Pakistan';
const DESCRIPTION =
  'Local SEO, Google Business Profile optimisation, on-page and technical SEO, content and citations for businesses across Pakistan.';

export async function generateMetadata(): Promise<Metadata> {
  return seoMetadata('/services', {
    title: TITLE,
    description: DESCRIPTION,
    openGraph: { title: TITLE, description: DESCRIPTION },
    twitter: { card: 'summary_large_image', title: TITLE },
  });
}

// One source for the cards and the OfferCatalog JSON-LD, so the structured data
// always matches what is on the page.
const SERVICES: { icon: IconName; title: string; body: string }[] = [
  {
    icon: 'location_on',
    title: 'Local SEO',
    body: 'Rank for "near me" and city searches: location pages, local keywords and consistent name, address and phone details wherever your business appears.',
  },
  {
    icon: 'storefront',
    title: 'Google Business Profile optimisation',
    body: 'A complete, accurate profile with the right categories, services, hours, photos and posts, so you show up in the map pack and customers can call straight away.',
  },
  {
    icon: 'manage_search',
    title: 'Keyword research',
    body: 'Find the searches your customers actually make in your city and category, and decide which pages on your site should answer each one.',
  },
  {
    icon: 'fact_check',
    title: 'On-page SEO',
    body: 'Titles, descriptions, headings, internal links and schema markup written for people first, so search engines understand what each page offers.',
  },
  {
    icon: 'language',
    title: 'Technical SEO audit',
    body: 'Crawl errors, indexing, sitemaps, canonical tags, page speed and mobile usability checked and fixed, with a clear list of what changed.',
  },
  {
    icon: 'hub',
    title: 'Citations and link building',
    body: 'Listings on trusted Pakistani directories and relevant local sites that point back to you, without spam links that put your rankings at risk.',
  },
];

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
    body: 'We do the work and report on rankings, calls and visits, so you can see what your budget is doing.',
  },
];

export default async function ServicesPage() {
  const [sections, settings] = await Promise.all([getPageSections('services'), getSettings()]);
  const header = findSection(sections, 'header');
  const brand = settingText(settings, 'brand.name', 'RankYouSite');
  const heading = header?.heading ?? 'SEO services for local businesses';
  const subheading =
    header?.subheading ??
    `${brand} helps businesses across Pakistan get found on Google — in local search, on Maps and on the directory itself.`;

  const trail = [{ label: 'Home', href: '/' }, { label: 'Services' }];
  const offerCatalog = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: brand,
    url: SITE_URL,
    areaServed: { '@type': 'Country', name: 'Pakistan' },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'SEO services',
      itemListElement: SERVICES.map((s) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: s.title, description: s.body },
      })),
    },
  };

  return (
    <div className="container-page py-12">
      <JsonLd data={breadcrumbSchema(trail, '/services')} />
      <JsonLd data={offerCatalog} />
      <Breadcrumbs trail={trail} />
      <div className="max-w-3xl">
        <h1 className="font-headline-lg text-headline-lg">{heading}</h1>
        <p className="mt-4 text-lg text-[var(--text-muted)]">{subheading}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/contact"
            className="bg-primary-container text-on-primary hover:bg-primary focus-visible:ring-primary-container inline-flex items-center gap-2 rounded-xl px-6 py-3.5 font-semibold shadow-md transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden"
          >
            <Icon name="mail" size={20} />
            Get a free SEO audit
          </Link>
          <Link
            href="/dashboard/listings/new"
            className="bg-surface-card text-on-surface hover:border-primary-container inline-flex items-center gap-2 rounded-xl border border-[var(--border)] px-6 py-3.5 font-semibold transition-colors"
          >
            <Icon name="add_business" size={20} />
            List your business free
          </Link>
        </div>
      </div>

      <h2 className="font-headline-md text-headline-md mt-16">What we do</h2>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((s) => (
          <div key={s.title} className="surface-card flex flex-col p-6">
            <div className="bg-surface-container-low text-primary-container mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
              <Icon name={s.icon} size={26} />
            </div>
            <h3 className="font-title-md text-title-md">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{s.body}</p>
          </div>
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
          <h2 className="font-headline-sm text-headline-sm">Want more calls from Google?</h2>
          <p className="mt-2 text-[var(--text-muted)]">
            Send us your website and city. We will reply with what we would fix first.
          </p>
        </div>
        <Link
          href="/contact"
          className="bg-primary-container text-on-primary hover:bg-primary inline-flex shrink-0 items-center gap-2 rounded-xl px-6 py-3.5 font-semibold shadow-md transition-colors"
        >
          Contact us
          <Icon name="arrow_forward" size={20} />
        </Link>
      </div>
    </div>
  );
}
