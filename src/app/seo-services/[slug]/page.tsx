import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { getCategories, getCategoryListingCounts } from '@/lib/queries';
import { ServicePageView } from '@/components/service-page';
import { SERVICE_PAGES, servicePage } from '@/lib/service-pages';
import { MIN_CATEGORY_LISTINGS_TO_INDEX, seoMetadata, type SeoRoute } from '@/lib/seo';
import { MAX_DIRECTORY_LINKS, SERVICE_DIRECTORY_CATEGORIES } from '@/lib/service-directory';

export const revalidate = 3600;
// Every service page is prerendered below. Other slugs still reach the page
// (rather than a framework 404) only so a slug typed with capitals can 308 to
// its lowercase page; anything else is notFound() and cached like any page.
export const dynamicParams = true;

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
  if (!page || !page.path.startsWith('/seo-services/')) {
    const lower = servicePage(slug.toLowerCase());
    if (lower?.path.startsWith('/seo-services/')) permanentRedirect(lower.path);
    notFound();
  }
  const directory = await directoryLinks(slug);
  return <ServicePageView page={page} directory={directory} />;
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
