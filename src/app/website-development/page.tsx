import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSettings, settingText } from '@/lib/queries';
import { ServicePageView } from '@/components/service-page';
import { servicePage } from '@/lib/service-pages';
import { seoMetadata } from '@/lib/seo';

export const revalidate = 3600;

const PAGE = servicePage('website-development');

export async function generateMetadata(): Promise<Metadata> {
  if (!PAGE) return {};
  return seoMetadata('/website-development', {
    title: PAGE.title,
    description: PAGE.description,
    openGraph: { title: PAGE.title, description: PAGE.description },
    twitter: { card: 'summary_large_image', title: PAGE.title },
  });
}

export default async function WebsiteDevelopmentPage() {
  if (!PAGE) notFound();
  const settings = await getSettings();
  return <ServicePageView page={PAGE} brand={settingText(settings, 'brand.name', 'RankYouSite')} />;
}
