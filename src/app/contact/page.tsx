import type { Metadata } from 'next';
import { findSection, getPageSections, getSettings, settingText } from '@/lib/queries';
import { Breadcrumbs } from '@/components/ui';

export const revalidate = 3600;
export const metadata: Metadata = {
  title: 'Contact',
  description: 'Questions, corrections and listing requests.',
  openGraph: { title: 'Contact', description: 'Questions, corrections and listing requests.' },
  twitter: { card: 'summary_large_image', title: 'Contact' },
};

export default async function ContactPage() {
  const [sections, settings] = await Promise.all([getPageSections('contact'), getSettings()]);
  const header = findSection(sections, 'header');
  const email = settingText(settings, 'contact.email');
  return (
    <div className="container-page py-12">
      <Breadcrumbs trail={[{ label: 'Home', href: '/' }, { label: header?.heading ?? 'Contact' }]} />
      <div className="max-w-xl">
        <h1 className="text-3xl font-bold sm:text-4xl">{header?.heading}</h1>
        {header?.subheading ? <p className="mt-3 text-[var(--text-muted)]">{header.subheading}</p> : null}
        {email ? (
          <p className="mt-6 text-[var(--text-muted)]">
            Email us directly at{' '}
            <a href={`mailto:${email}`} className="text-brand-700 hover:underline">
              {email}
            </a>
            .
          </p>
        ) : null}
        <p className="mt-8 rounded-lg border border-dashed border-[var(--border)] p-5 text-sm text-[var(--text-muted)]">
          The submission form is not wired up yet — the <code>form_submissions</code> table and its
          insert policy exist, but the server action is part of the next phase. Until then the email
          address above is the working route.
        </p>
      </div>
    </div>
  );
}
