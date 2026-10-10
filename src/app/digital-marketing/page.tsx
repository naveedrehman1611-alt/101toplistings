import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSettings, settingText } from '@/lib/queries';
import { ServicePageView } from '@/components/service-page';
import { HubSectionHeader } from '@/components/services-hub/hub-section-header';
import { ServiceCard } from '@/components/services-hub/service-card';
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

export default async function DigitalMarketingPage() {
  if (!PAGE) notFound();
  const settings = await getSettings();
  const subServices = MENU_SERVICE_PAGES.filter((p) => p.path.startsWith('/seo-services/'));
  return (
    <ServicePageView
      page={PAGE}
      brand={settingText(settings, 'brand.name', 'RankYouSite')}
      extra={
        <section aria-labelledby="sp-sub-services">
          <HubSectionHeader
            id="sp-sub-services"
            icon="search"
            title="Our SEO services"
            count={`${subServices.length} Services`}
          />
          <p className="-mt-2 mb-6 max-w-3xl text-[var(--text-muted)]">
            Each part of digital marketing has its own page, so you can start with the one that fits
            your goal.
          </p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {subServices.map((s) => (
              <ServiceCard key={s.slug} service={s} tag={s.tag} />
            ))}
          </div>
        </section>
      }
    />
  );
}
