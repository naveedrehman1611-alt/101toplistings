import type { Metadata } from 'next';
import { findSection, getPageSections, getSettings, settingText } from '@/lib/queries';
import { Breadcrumbs } from '@/components/ui';

export const revalidate = 3600;
export const metadata: Metadata = {
  title: 'About',
  description: 'Why this directory exists.',
  openGraph: { title: 'About', description: 'Why this directory exists.' },
  twitter: { card: 'summary_large_image', title: 'About' },
};

export default async function AboutPage() {
  const [sections, settings] = await Promise.all([getPageSections('about'), getSettings()]);
  const header = findSection(sections, 'header');
  const brand = settingText(settings, 'brand.name', 'RankYouSite');
  return (
    <div className="container-page py-12">
      <Breadcrumbs trail={[{ label: 'Home', href: '/' }, { label: header?.heading ?? 'About' }]} />
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold sm:text-4xl">{header?.heading}</h1>
        {header?.subheading ? <p className="mt-4 text-lg text-[var(--text-muted)]">{header.subheading}</p> : null}
        <h2 className="mt-10 text-2xl font-semibold">What we index</h2>
        <p className="mt-4 leading-relaxed text-[var(--text-muted)]">
          {brand} lists local businesses with the details that actually help someone decide: a real
          address, working opening hours, a phone number you can tap, and a description written for
          people rather than search engines.
        </p>
        <h2 className="mt-10 text-2xl font-semibold">How listings get here</h2>
        <p className="mt-4 leading-relaxed text-[var(--text-muted)]">
          Owners submit their own business, and every submission is reviewed before it appears. A
          listing stays editable by the owner afterwards, but its published status is not something
          an owner can set for themselves.
        </p>
        <h2 className="mt-10 text-2xl font-semibold">On distance</h2>
        <p className="mt-4 leading-relaxed text-[var(--text-muted)]">
          Where a business has real coordinates, distance is measured from them. Where it does not,
          no distance is shown at all — an estimate dressed up as a measurement is worse than nothing.
        </p>
      </div>
    </div>
  );
}
