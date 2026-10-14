import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ServicePageView } from '@/components/service-page';
import { HubSectionHeader } from '@/components/services-hub/hub-section-header';
import { ServiceCard } from '@/components/services-hub/service-card';
import { getPageContent } from '@/lib/content/get';
import { serviceKey } from '@/lib/content/pages/services';
import { MENU_SERVICE_PAGES, servicePage } from '@/lib/service-pages';
import { seoMetadata } from '@/lib/seo';

export const revalidate = 3600;

const PAGE = servicePage('digital-marketing');

export async function generateMetadata(): Promise<Metadata> {
  if (!PAGE) return {};
  return seoMetadata('/digital-marketing', {
    title: PAGE.title,
    description: PAGE.description,
    openGraph: { title: PAGE.title, description: PAGE.description },
    twitter: { card: 'summary_large_image', title: PAGE.title },
  });
}

/**
 * The digital marketing service page plus a block listing the SEO service
 * pages. That block's copy is the "Digital marketing" page in Admin → Content;
 * the rest is its section under "Service pages".
 */
export default async function DigitalMarketingPage() {
  if (!PAGE) notFound();
  const [content, services, template] = await Promise.all([
    getPageContent('digital_marketing'),
    getPageContent('service'),
    getPageContent('service_template'),
  ]);
  const c = content.sub_services;
  const subServices = MENU_SERVICE_PAGES.filter((p) => p.path.startsWith('/seo-services/'));
  return (
    <ServicePageView
      page={PAGE}
      // Related services repeat sub-service cards; only a hidden block leaves them in.
      extraSlugs={c.visible ? subServices.map((s) => s.slug) : []}
      extra={
        c.visible ? (
          <section aria-labelledby="sp-sub-services">
            <HubSectionHeader
              id="sp-sub-services"
              icon={c.icon}
              title={c.heading}
              count={`${subServices.length} ${c.count}`}
            />
            {c.intro ? (
              <p className="-mt-2 mb-6 max-w-3xl text-[var(--text-muted)]">{c.intro}</p>
            ) : null}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {subServices.map((s) => (
                <ServiceCard
                  key={s.slug}
                  service={s}
                  tag={services[serviceKey(s.slug)]?.tag ?? s.tag}
                  learnMore={template.related.learn_more}
                />
              ))}
            </div>
          </section>
        ) : null
      }
    />
  );
}
