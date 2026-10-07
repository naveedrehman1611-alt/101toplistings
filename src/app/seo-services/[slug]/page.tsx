import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSettings, settingText } from '@/lib/queries';
import { ServicePageView } from '@/components/service-page';
import { SERVICE_PAGES, servicePage } from '@/lib/service-pages';
import { seoMetadata, type SeoRoute } from '@/lib/seo';

export const revalidate = 3600;
export const dynamicParams = false;

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return SERVICE_PAGES.filter((p) => p.path.startsWith('/seo-services/')).map((p) => ({
    slug: p.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = servicePage(slug);
  if (!page || !page.path.startsWith('/seo-services/')) return {};
  return seoMetadata(page.path as SeoRoute, {
    title: page.title,
    description: page.description,
    openGraph: { title: page.title, description: page.description },
    twitter: { card: 'summary_large_image', title: page.title },
  });
}

export default async function SeoServicePage({ params }: Props) {
  const { slug } = await params;
  const page = servicePage(slug);
  if (!page || !page.path.startsWith('/seo-services/')) notFound();
  const settings = await getSettings();
  return <ServicePageView page={page} brand={settingText(settings, 'brand.name', 'RankYouSite')} />;
}
