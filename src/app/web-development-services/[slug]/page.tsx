import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { ServicePageView } from '@/components/service-page';
import { SERVICE_PAGES, WEB_DEVELOPMENT_BASE, servicePage } from '@/lib/service-pages';
import { seoMetadata, type SeoRoute } from '@/lib/seo';

export const revalidate = 3600;
// Every web development page is prerendered below. Other slugs still reach the
// page (rather than a framework 404) only so a slug typed with capitals can 308
// to its lowercase page; anything else is notFound() and cached like any page.
export const dynamicParams = true;

type Props = { params: Promise<{ slug: string }> };

/** Pages under the landing page; the landing page itself is /web-development-services. */
const isWebSubPage = (path: string) => path.startsWith(`${WEB_DEVELOPMENT_BASE}/`);

export function generateStaticParams() {
  return SERVICE_PAGES.filter((p) => isWebSubPage(p.path)).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = servicePage(slug);
  if (!page || !isWebSubPage(page.path)) return {};
  return seoMetadata(page.path as SeoRoute, {
    title: page.title,
    description: page.description,
    openGraph: { title: page.title, description: page.description },
    twitter: { card: 'summary_large_image', title: page.title },
  });
}

export default async function WebDevelopmentServicePage({ params }: Props) {
  const { slug } = await params;
  const page = servicePage(slug);
  if (!page || !isWebSubPage(page.path)) {
    const lower = servicePage(slug.toLowerCase());
    if (lower && isWebSubPage(lower.path)) permanentRedirect(lower.path);
    notFound();
  }
  return <ServicePageView page={page} />;
}
