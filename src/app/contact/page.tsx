import type { Metadata } from 'next';
import { findSection, getPageSections, getSettings, settingText } from '@/lib/queries';
import { Breadcrumbs } from '@/components/ui';
import { submitContact } from '@/lib/public-actions';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Questions, corrections and listing requests.',
  openGraph: { title: 'Contact', description: 'Questions, corrections and listing requests.' },
  twitter: { card: 'summary_large_image', title: 'Contact' },
};

const input =
  'mt-1 h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 outline-none focus:border-brand-500';

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  // Reading ?sent / ?error makes this page render per request.
  const sp = await searchParams;
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
        {sp.sent ? (
          <p
            role="status"
            className="mt-8 rounded-lg border border-brand-500/40 bg-brand-50 px-4 py-3 text-sm text-brand-800"
          >
            Thanks — your message has been sent. We will reply by email.
          </p>
        ) : (
          <form action={submitContact} className="mt-8 space-y-4">
            {sp.error ? (
              <p
                role="alert"
                className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800"
              >
                {sp.error}
              </p>
            ) : null}
            <label className="block text-sm">
              <span className="font-medium">Your name</span>
              <input name="name" required autoComplete="name" className={input} />
            </label>
            <label className="block text-sm">
              <span className="font-medium">Email</span>
              <input name="email" type="email" required autoComplete="email" className={input} />
            </label>
            <label className="block text-sm">
              <span className="font-medium">Subject</span>
              <input name="subject" className={input} />
            </label>
            <label className="block text-sm">
              <span className="font-medium">Message</span>
              <textarea
                name="message"
                required
                rows={6}
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 outline-none focus:border-brand-500"
              />
            </label>
            {/* Honeypot: hidden from people and assistive tech, filled in by bots. */}
            <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
              <label>
                Website
                <input name="website" tabIndex={-1} autoComplete="off" />
              </label>
            </div>
            <button
              type="submit"
              className="h-11 rounded-lg bg-brand-700 px-6 font-medium text-white hover:bg-brand-800"
            >
              Send message
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
