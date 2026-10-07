import type { Metadata } from 'next';
import { findSection, getPageSections, getSettings, settingText } from '@/lib/queries';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui';
import { seoMetadata } from '@/lib/seo';

export const revalidate = 3600;

const TITLE = 'About Us | Business Directory & SEO Team';
const DESCRIPTION =
  'Meet the business directory and SEO team: how we review business listings, measure distance honestly, and help companies grow their online visibility.';
export async function generateMetadata(): Promise<Metadata> {
  return seoMetadata('/about', {
    title: TITLE,
    description: DESCRIPTION,
    openGraph: { title: TITLE, description: DESCRIPTION },
    twitter: { card: 'summary_large_image', title: TITLE },
  });
}

export default async function AboutPage() {
  const [sections, settings] = await Promise.all([getPageSections('about'), getSettings()]);
  const header = findSection(sections, 'header');
  const brand = settingText(settings, 'brand.name', 'RankYouSite');
  return (
    <div className="container-page py-12">
      <Breadcrumbs trail={[{ label: 'Home', href: '/' }, { label: header?.heading ?? 'About' }]} />
      <div className="max-w-2xl">
        <h1 className="font-headline-lg text-headline-lg">{header?.heading}</h1>
        {header?.subheading ? (
          <p className="mt-4 text-lg text-[var(--text-muted)]">{header.subheading}</p>
        ) : null}
        <h2 className="font-headline-md text-headline-md mt-10">What we index</h2>
        <p className="mt-4 leading-relaxed text-[var(--text-muted)]">
          {brand} lists local businesses with the details that actually help someone decide: a real
          address, working opening hours, a phone number you can tap, and a description written for
          people rather than search engines.
        </p>
        <h2 className="font-headline-md text-headline-md mt-10">How listings get here</h2>
        <p className="mt-4 leading-relaxed text-[var(--text-muted)]">
          Owners submit their own business, and every submission is reviewed before it appears. A
          listing stays editable by the owner afterwards, but its published status is not something
          an owner can set for themselves.
        </p>
        <h2 className="font-headline-md text-headline-md mt-10">On distance</h2>
        <p className="mt-4 leading-relaxed text-[var(--text-muted)]">
          Where a business has real coordinates, distance is measured from them. Where it does not,
          no distance is shown at all — an estimate dressed up as a measurement is worse than
          nothing.
        </p>
        <h2 className="font-headline-md text-headline-md mt-10">Work with us</h2>
        <p className="mt-4 leading-relaxed text-[var(--text-muted)]">
          Beyond the directory, we help businesses grow their visibility. You can{' '}
          <Link href="/add-business" className="text-brand-700 font-semibold hover:underline">
            add your business
          </Link>{' '}
          to {brand} or talk to us about{' '}
          <Link href="/seo-services" className="text-brand-700 font-semibold hover:underline">
            SEO services
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
