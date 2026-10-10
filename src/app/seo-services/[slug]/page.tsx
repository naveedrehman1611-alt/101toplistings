import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCategories, getCategoryListingCounts, getSettings, settingText } from '@/lib/queries';
import { ServicePageView } from '@/components/service-page';
import { SERVICE_PAGES, servicePage } from '@/lib/service-pages';
import { MIN_CATEGORY_LISTINGS_TO_INDEX, seoMetadata, type SeoRoute } from '@/lib/seo';
import { MAX_DIRECTORY_LINKS, SERVICE_DIRECTORY_CATEGORIES } from '@/lib/service-directory';

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
  const [settings, directory] = await Promise.all([getSettings(), directoryLinks(slug)]);
  return (
    <ServicePageView
      page={page}
      brand={settingText(settings, 'brand.name', 'RankYouSite')}
      directory={directory}
    />
  );
}

/**
 * The directory categories this industry page links to: the mapped candidates
 * that still exist and are indexable, so the page never points at an empty,
 * noindex category.
 */
async function directoryLinks(slug: string): Promise<{ label: string; href: string }[]> {
  const candidates = SERVICE_DIRECTORY_CATEGORIES[slug];
  if (!candidates) return [];
  const all = await getCategories();
  const found = candidates.flatMap((s) => all.find((c) => c.slug === s) ?? []);
  const counts = await getCategoryListingCounts(found.map((c) => c.id));
  return found
    .filter((c) => (counts.get(c.id) ?? 0) >= MIN_CATEGORY_LISTINGS_TO_INDEX)
    .slice(0, MAX_DIRECTORY_LINKS)
    .map((c) => ({ label: `${c.name} directory`, href: `/category/${c.slug}` }));
}
