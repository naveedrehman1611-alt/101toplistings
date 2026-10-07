import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSettings, settingText } from '@/lib/queries';
import { ServicePageView } from '@/components/service-page';
import { Icon } from '@/components/icon';
import { SERVICE_PAGES, servicePage } from '@/lib/service-pages';
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
  const subServices = SERVICE_PAGES.filter((p) => p.path.startsWith('/seo-services/'));
  return (
    <ServicePageView
      page={PAGE}
      brand={settingText(settings, 'brand.name', 'RankYouSite')}
      extra={
        <>
          <h2 className="font-headline-md text-headline-md mt-16">Our SEO services</h2>
          <p className="mt-2 max-w-3xl text-[var(--text-muted)]">
            Each part of digital marketing has its own page, so you can start with the one that fits
            your goal.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {subServices.map((s) => (
              <Link
                key={s.slug}
                href={s.path}
                className="surface-card hover:border-primary-container flex flex-col p-6 transition-colors"
              >
                <div className="bg-surface-container-low text-primary-container mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
                  <Icon name={s.icon} size={26} />
                </div>
                <h3 className="font-title-md text-title-md">{s.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
                  {s.description}
                </p>
              </Link>
            ))}
          </div>
        </>
      }
    />
  );
}
