import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { findSection, getPageSections, getSettings, settingText } from '@/lib/queries';
import { PageHero } from '@/components/page-hero';
import { submitContact } from '@/lib/public-actions';
import { seoMetadata } from '@/lib/seo';

const TITLE = 'Contact Us | SEO Services & Business Listings';
const DESCRIPTION =
  'Contact us about SEO services, digital marketing, business listings, listing corrections and partnerships. Send a message and we will get back to you.';

export async function generateMetadata(): Promise<Metadata> {
  return seoMetadata('/contact', {
    title: TITLE,
    description: DESCRIPTION,
    openGraph: { title: TITLE, description: DESCRIPTION },
    twitter: { card: 'summary_large_image', title: TITLE },
  });
}

// Stored as-is in form_submissions.payload.subject, which the admin inbox shows.
const SUBJECTS = [
  'General question',
  'Listing issue or correction',
  'Help with my account',
  'Partnership or advertising',
  'Report a problem',
  'SEO services',
  'Digital marketing',
  'Guest posting',
  'Link building',
  'Other',
];

/**
 * ?subject=SEO%20services (the home hero's service links) preselects that
 * subject. Matched case-insensitively against SUBJECTS; anything else keeps the
 * "Select a subject" placeholder.
 */
function presetSubject(param: string | string[] | undefined): string {
  const wanted = (Array.isArray(param) ? param[0] : param)?.trim().toLowerCase();
  return SUBJECTS.find((s) => s.toLowerCase() === wanted) ?? '';
}

const FAQ: { q: string; a: string; link?: { label: string; href: string } }[] = [
  {
    q: 'How do I list my business?',
    a: "It's free and takes just a couple of minutes. Fill in your details and submit — every listing is reviewed before it goes live.",
    link: { label: 'Add your listing', href: '/dashboard/listings/new' },
  },
  {
    q: 'Is it free to use?',
    a: 'Yes. Browsing the directory and listing your business are both completely free — no pay-to-rank tricks or hidden fees.',
  },
  {
    q: 'How do I edit my listing?',
    a: 'Sign in and open My listings from your dashboard, then choose the listing you want to update.',
    link: { label: 'Go to my listings', href: '/dashboard' },
  },
  {
    q: 'What areas do you cover?',
    a: "Every city and category currently in the directory — browse by category to see what's listed near you.",
    link: { label: 'Browse categories', href: '/business-categories' },
  },
];

// Floating label: the label sits inside the field as a placeholder and moves up
// once the field has focus or a value (placeholder=" " drives :placeholder-shown).
const field =
  'peer block w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 pt-5 pb-2 text-sm outline-hidden transition-colors placeholder-transparent hover:border-brand-300 focus:border-primary-container focus:bg-[var(--surface)] focus:ring-4 focus:ring-primary-container/20';
const floatLabel =
  'pointer-events-none absolute left-4 top-2 text-xs text-[var(--text-muted)] transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs peer-focus:text-brand-700';

function Required() {
  return (
    <span aria-hidden className="text-error">
      {' '}
      *
    </span>
  );
}

function Icon({ children, className = 'size-5' }: { children: ReactNode; className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {children}
    </svg>
  );
}

const MailIcon = ({ className }: { className?: string }) => (
  <Icon className={className}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </Icon>
);
const ChatIcon = ({ className }: { className?: string }) => (
  <Icon className={className}>
    <path d="M21 12a8 8 0 0 1-8 8H4l2.5-3A8 8 0 1 1 21 12Z" />
  </Icon>
);
const HelpIcon = ({ className }: { className?: string }) => (
  <Icon className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5v.2" />
    <path d="M12 17h.01" />
  </Icon>
);
const SendIcon = ({ className }: { className?: string }) => (
  <Icon className={className}>
    <path d="m22 2-7 20-4-9-9-4 20-7Z" />
    <path d="M22 2 11 13" />
  </Icon>
);
const ChevronIcon = ({ className }: { className?: string }) => (
  <Icon className={className}>
    <path d="m6 9 6 6 6-6" />
  </Icon>
);
const CheckIcon = ({ className }: { className?: string }) => (
  <Icon className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="m8 12 3 3 5-6" />
  </Icon>
);

function ArrowLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="group/link text-brand-700 hover:text-brand-800 mt-3 inline-flex items-center gap-1 text-sm font-semibold"
    >
      {children}
      <span aria-hidden className="transition-transform group-hover/link:translate-x-0.5">
        →
      </span>
    </Link>
  );
}

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string; subject?: string | string[] }>;
}) {
  // Reading ?sent / ?error / ?subject makes this page render per request.
  const sp = await searchParams;
  const subject = presetSubject(sp.subject);
  const [sections, settings] = await Promise.all([getPageSections('contact'), getSettings()]);
  const header = findSection(sections, 'header');
  const email = settingText(settings, 'contact.email');
  const label = header?.heading ?? 'Contact us';

  return (
    <>
      <PageHero
        trail={[{ label: 'Home', href: '/' }, { label }]}
        eyebrow="We reply by email"
        heading={
          <>
            Get in <span className="text-hero-green-light">touch</span>
          </>
        }
        subheading={
          header?.subheading ||
          "Have a question, a listing issue, or a partnership idea? Send us a message and we'll get back to you."
        }
      />

      <div className="container-page grid grid-cols-1 items-start gap-8 py-12 sm:py-16 lg:grid-cols-[minmax(0,5fr)_minmax(0,11fr)]">
        <aside className="space-y-8 lg:sticky lg:top-24">
          <div className="surface-card p-6 shadow-sm sm:p-7">
            <h2 className="font-headline-sm text-headline-sm flex items-center gap-2.5">
              <ChatIcon className="text-brand-700 size-5" />
              Contact information
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">
              Questions about the directory, your account, or how listings work — email us and
              we&apos;ll get back to you.
            </p>
            {email ? (
              <a
                href={`mailto:${email}`}
                className="hover:border-brand-300 hover:bg-brand-50 mt-5 flex items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 transition-colors"
              >
                <span className="bg-primary-container text-on-primary grid size-11 shrink-0 place-items-center rounded-full">
                  <MailIcon className="size-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs text-[var(--text-muted)]">Email us</span>
                  <span className="block truncate font-semibold">{email}</span>
                </span>
              </a>
            ) : null}
            <div className="mt-6 border-t border-[var(--border)] pt-6">
              <p className="font-title-md text-title-md">Ready to get listed?</p>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                It only takes a couple of minutes, and it&apos;s free.
              </p>
              <ArrowLink href="/dashboard/listings/new">Add your listing</ArrowLink>
            </div>
          </div>

          <div className="surface-card p-6 shadow-sm sm:p-7">
            <h2 className="font-headline-sm text-headline-sm flex items-center gap-2.5">
              <HelpIcon className="text-brand-700 size-5" />
              Quick help
            </h2>
            <div className="mt-4 divide-y divide-[var(--border)]">
              {FAQ.map((item) => (
                <details key={item.q} open className="group py-4 first:pt-2 last:pb-0">
                  <summary className="hover:text-brand-700 flex cursor-pointer list-none items-center justify-between gap-3 font-semibold marker:content-none [&::-webkit-details-marker]:hidden">
                    {item.q}
                    <ChevronIcon className="size-4 shrink-0 text-[var(--text-muted)] transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{item.a}</p>
                  {item.link ? (
                    <ArrowLink href={item.link.href}>{item.link.label}</ArrowLink>
                  ) : null}
                </details>
              ))}
            </div>
          </div>
        </aside>

        <section
          className="surface-card order-first p-6 shadow-sm sm:p-10 lg:order-none"
          aria-labelledby="contact-form-heading"
        >
          <h2
            id="contact-form-heading"
            className="font-headline-sm text-headline-sm flex items-center gap-2.5"
          >
            <MailIcon className="text-brand-700 size-5" />
            Send us a message
          </h2>

          {sp.sent ? (
            <div
              role="status"
              className="border-brand-200 bg-brand-50 mt-8 flex flex-col items-center rounded-xl border px-6 py-12 text-center"
            >
              <CheckIcon className="text-brand-700 size-12" />
              <p className="font-display text-brand-800 mt-4 text-xl font-semibold">
                Thanks — your message has been sent.
              </p>
              <p className="mt-2 text-sm text-[var(--text-muted)]">We will reply by email.</p>
              <Link
                href="/contact"
                className="text-brand-700 mt-6 text-sm font-semibold hover:underline"
              >
                Send another message
              </Link>
            </div>
          ) : (
            <form action={submitContact} className="mt-8 space-y-5">
              {sp.error ? (
                <p
                  role="alert"
                  className="border-error/30 bg-error-container/40 text-on-error-container rounded-xl border px-4 py-3 text-sm"
                >
                  {sp.error}
                </p>
              ) : null}
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="relative">
                  <input
                    id="contact-name"
                    name="name"
                    required
                    maxLength={120}
                    autoComplete="name"
                    placeholder=" "
                    className={`${field} h-14`}
                  />
                  <label htmlFor="contact-name" className={floatLabel}>
                    Your name
                    <Required />
                  </label>
                </div>
                <div className="relative">
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    required
                    maxLength={200}
                    autoComplete="email"
                    placeholder=" "
                    className={`${field} h-14`}
                  />
                  <label htmlFor="contact-email" className={floatLabel}>
                    Email address
                    <Required />
                  </label>
                </div>
              </div>
              <div className="relative">
                <select
                  // A ?subject change on this same route keeps the page mounted, and an
                  // uncontrolled select ignores a new defaultValue; the key remounts it.
                  key={subject}
                  id="contact-subject"
                  name="subject"
                  required
                  defaultValue={subject}
                  className={`${field} h-14 cursor-pointer appearance-none pr-10`}
                >
                  <option value="" disabled>
                    Select a subject
                  </option>
                  {SUBJECTS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <label
                  htmlFor="contact-subject"
                  className="pointer-events-none absolute top-2 left-4 text-xs text-[var(--text-muted)]"
                >
                  Subject
                  <Required />
                </label>
                <ChevronIcon className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-[var(--text-muted)]" />
              </div>
              <div className="relative">
                <textarea
                  id="contact-message"
                  name="message"
                  required
                  rows={7}
                  maxLength={5000}
                  placeholder=" "
                  className={`${field} resize-y pt-7`}
                />
                <label htmlFor="contact-message" className={floatLabel}>
                  Message
                  <Required />
                </label>
              </div>
              {/* Honeypot: hidden from people and assistive tech, filled in by bots. */}
              <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                <label>
                  Website
                  <input name="website" tabIndex={-1} autoComplete="off" />
                </label>
              </div>
              <button
                type="submit"
                className="bg-primary-container font-label-md text-label-md text-on-primary hover:bg-primary focus-visible:ring-primary-container inline-flex h-12 items-center justify-center gap-2 rounded-xl px-7 shadow-xs transition hover:shadow-[0_4px_12px_rgba(12,130,38,0.25)] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden"
              >
                Send message
                <SendIcon className="size-4" />
              </button>
            </form>
          )}
        </section>
      </div>
    </>
  );
}
