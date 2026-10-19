import type { Metadata } from 'next';
import { findSection, getPageSections } from '@/lib/queries';
import { getPageContent } from '@/lib/content/get';
import { serviceKey } from '@/lib/content/pages/services';
import { JsonLd, breadcrumbSchema } from '@/components/json-ld';
import { DEFAULT_AREA_SERVED, SERVICE_PAGES } from '@/lib/service-pages';
import { SITE_URL } from '@/lib/supabase';
import { seoMetadata } from '@/lib/seo';
import { HUB_CATEGORIES, UNFEATURED_HUBS, hubIcon, hubTitle } from '@/lib/services-hub';
import { PageHero } from '@/components/page-hero';
import { HubSectionHeader } from '@/components/services-hub/hub-section-header';
import { ServiceCard } from '@/components/services-hub/service-card';
import { IndustryTile } from '@/components/services-hub/industry-tile';
import { HubCtaBand } from '@/components/services-hub/hub-cta-band';
import { chunk } from '@/lib/chunk';

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

export default async function ServicesPage() {
  const [sections, content, services] = await Promise.all([
    getPageSections('services'),
    getPageContent('seo_services'),
    getPageContent('service'),
  ]);
  const { hero, groups: g, industries: ind, cta } = content;
  // A header kept in Admin → Pages (the older page sections) is shown until the hero
  // is saved in Admin → Content; from then on the Content copy wins.
  const header = hero.edited ? undefined : findSection(sections, 'header');
  const heading = header?.heading ?? (
    <>
      {hero.heading_start ? `${hero.heading_start} ` : null}
      {hero.heading_highlight ? (
        <span className="text-hero-green-light">{hero.heading_highlight}</span>
      ) : null}
      {hero.heading_end ? ` ${hero.heading_end}` : null}
    </>
  );
  const subheading = header?.subheading ?? hero.intro;
  const tagOf = (slug: string, fallback: string) => services[serviceKey(slug)]?.tag ?? fallback;

  // Sections in HUB_CATEGORIES order; one with no services yet is skipped.
  const groups = HUB_CATEGORIES.map((c) => ({
    ...c,
    title: hubTitle(content, c.id),
    icon: hubIcon(content, c.id),
    services: SERVICE_PAGES.filter((s) => s.hub === c.id),
  })).filter((c) => c.services.length > 0);
  const categories = groups.filter((c) => c.id !== 'industry');
  const industries = groups.find((c) => c.id === 'industry');
  const industryCount = industries?.services.length ?? 0;
  // The "SEO Services" figure leaves out the web development pages shown on the hub too.
  const webCount = groups.find((c) => c.id === 'web')?.services.length ?? 0;
  const serviceCount = SERVICE_PAGES.length - industryCount - webCount;

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
          areaServed: s.areaServed ?? DEFAULT_AREA_SERVED,
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
        eyebrow={hero.eyebrow}
        heading={heading}
        subheading={subheading}
        stats={[
          { value: serviceCount, label: hero.stat_services },
          {
            value: (
              <>
                {industryCount}
                <sup className="text-base">+</sup>
              </>
            ),
            label: hero.stat_industries,
          },
          { value: hero.stat_audit_value, label: hero.stat_audit_label },
        ]}
      />

      {g.visible || (ind.visible && industries) ? (
        <div className="bg-white py-20 lg:py-[100px]">
          <div className="container-page">
            {g.visible
              ? categories.map(({ id, title, icon, services: list }) => (
                  <section key={id} aria-labelledby={`hub-${id}`} className="mb-16">
                    <HubSectionHeader
                      id={`hub-${id}`}
                      icon={icon}
                      title={title}
                      count={`${list.length} ${list.length === 1 ? g.count_one : g.count_many}`}
                    />
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {list.map((s, i) => (
                        <ServiceCard
                          key={s.slug}
                          service={s}
                          tag={tagOf(s.slug, s.tag)}
                          featured={i === 0 && !UNFEATURED_HUBS.includes(id)}
                          learnMore={g.learn_more}
                        />
                      ))}
                    </div>
                  </section>
                ))
              : null}

            {ind.visible && industries ? (
              <section aria-labelledby="hub-industry">
                <HubSectionHeader
                  id="hub-industry"
                  icon={industries.icon}
                  title={industries.title}
                  count={`${industryCount} ${ind.count}`}
                />
                {/* One <ul> per 48 tiles: 64+ in one list is past the 60 children an
                    audit flags, and 48 fills whole rows at 2, 3 and 4 columns. */}
                {chunk(industries.services, 48).map((run, i) => (
                  <ul
                    key={i}
                    className={`${i > 0 ? 'mt-3' : ''} grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4`}
                  >
                    {run.map((s) => (
                      <li key={s.slug}>
                        <IndustryTile name={s.name} icon={s.icon} href={s.path} />
                      </li>
                    ))}
                  </ul>
                ))}
              </section>
            ) : null}
          </div>
        </div>
      ) : null}

      {cta.visible ? (
        <HubCtaBand
          heading={cta.heading}
          body={cta.body}
          primary={cta.primary}
          primaryIcon={cta.primary_icon}
          quoteLabel={cta.secondary.label}
          quoteIcon={cta.secondary_icon}
          quoteHref={cta.secondary.href}
        />
      ) : null}
    </>
  );
}
