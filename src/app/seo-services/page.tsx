import type { Metadata } from 'next';
import { findSection, getPageSections, getSettings, settingText } from '@/lib/queries';
import { JsonLd, breadcrumbSchema } from '@/components/json-ld';
import { SERVICE_PAGES } from '@/lib/service-pages';
import { SITE_URL } from '@/lib/supabase';
import { seoMetadata } from '@/lib/seo';
import { HUB_CATEGORIES, UNFEATURED_HUBS } from '@/lib/services-hub';
import { PageHero } from '@/components/page-hero';
import { HubSectionHeader } from '@/components/services-hub/hub-section-header';
import { ServiceCard } from '@/components/services-hub/service-card';
import { IndustryTile } from '@/components/services-hub/industry-tile';
import { HubCtaBand } from '@/components/services-hub/hub-cta-band';

export const revalidate = 3600;

const QUOTE_HREF = '/contact?subject=SEO%20services';

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

export default async function ServicesPage() {
  const [sections, settings] = await Promise.all([getPageSections('services'), getSettings()]);
  const header = findSection(sections, 'header');
  const brand = settingText(settings, 'brand.name', 'RankYouSite');
  // An admin-set heading renders as plain text; the default carries a green accent.
  const heading = header?.heading ?? (
    <>
      Every <span className="text-hero-green-light">Professional SEO Service</span> Your Business
      Needs to Rank, Grow, and Get Found.
    </>
  );
  const subheading =
    header?.subheading ??
    `${brand} is an SEO agency and SEO company offering professional, affordable SEO services for small business and growing brands worldwide. We help you rank higher, earn more organic traffic and turn visits into leads.`;

  // Sections in HUB_CATEGORIES order; one with no services yet is skipped.
  const groups = HUB_CATEGORIES.map((c) => ({
    ...c,
    services: SERVICE_PAGES.filter((s) => s.hub === c.id),
  })).filter((c) => c.services.length > 0);
  const categories = groups.filter((c) => c.id !== 'industry');
  const industries = groups.find((c) => c.id === 'industry');
  const industryCount = industries?.services.length ?? 0;
  const serviceCount = SERVICE_PAGES.length - industryCount;

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
    <>
      <JsonLd data={breadcrumbSchema(trail, '/seo-services')} />
      <JsonLd data={offerCatalog} />
      <PageHero
        trail={trail}
        eyebrow="Complete SEO Services"
        heading={heading}
        subheading={subheading}
        stats={[
          { value: serviceCount, label: 'SEO Services' },
          {
            value: (
              <>
                {industryCount}
                <sup className="text-base">+</sup>
              </>
            ),
            label: 'Industries Served',
          },
          { value: 'Free', label: 'SEO Audit' },
        ]}
      />

      <div className="bg-white py-20 lg:py-[100px]">
        <div className="container-page">
          {categories.map(({ id, title, icon, services }) => (
            <section key={id} aria-labelledby={`hub-${id}`} className="mb-16">
              <HubSectionHeader
                id={`hub-${id}`}
                icon={icon}
                title={title}
                count={`${services.length} ${services.length === 1 ? 'Service' : 'Services'}`}
              />
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {services.map((s, i) => (
                  <ServiceCard
                    key={s.slug}
                    service={s}
                    tag={s.tag}
                    featured={i === 0 && !UNFEATURED_HUBS.includes(id)}
                  />
                ))}
              </div>
            </section>
          ))}

          {industries ? (
            <section aria-labelledby="hub-industry">
              <HubSectionHeader
                id="hub-industry"
                icon={industries.icon}
                title={industries.title}
                count={`${industryCount} Industries`}
              />
              <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                {industries.services.map((s) => (
                  <li key={s.slug}>
                    <IndustryTile name={s.name} icon={s.icon} href={s.path} />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </div>

      <HubCtaBand quoteHref={QUOTE_HREF} />
    </>
  );
}
