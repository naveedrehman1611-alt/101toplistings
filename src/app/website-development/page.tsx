import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
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

/** Copy is editable as this page's section under "Service pages" in Admin → Content. */
export default async function WebsiteDevelopmentPage() {
  if (!PAGE) notFound();
  return <ServicePageView page={PAGE} />;
}
