import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { findSection, getPageSections, getSettings, settingText } from '@/lib/queries';
import { PageHero } from '@/components/page-hero';
import { submitContact } from '@/lib/public-actions';
import { seoMetadata } from '@/lib/seo';
import { getPageContent } from '@/lib/content/get';
import type { SectionValues } from '@/lib/content/schema';
import type { CONTACT_PAGE } from '@/lib/content/pages/company';
import { HighlightedHeading } from '@/components/company/highlighted';

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

type Sections = (typeof CONTACT_PAGE)['sections'];
type Content = { [K in keyof Sections]: SectionValues<Sections[K]> };

/**
 * ?subject=SEO%20services (the home hero's service links) preselects that
 * subject. Matched case-insensitively against the form's subjects (stored
 * as-is in form_submissions.payload.subject, which the admin inbox shows);
 * anything else keeps the "Select a subject" placeholder.
 */
function presetSubject(param: string | string[] | undefined, subjects: string[]): string {
  const wanted = (Array.isArray(param) ? param[0] : param)?.trim().toLowerCase();
  return subjects.find((s) => s.toLowerCase() === wanted) ?? '';
}

/**
 * ?service=Plumber%20SEO (the service pages' quote links) prefills the message
 * with "I'm interested in Plumber SEO." Trimmed, capped at 100 characters, and
 * used only as a textarea default value, which React escapes.
 */
function presetMessage(param: string | string[] | undefined): string {
  const name = (Array.isArray(param) ? param[0] : param)?.trim().slice(0, 100).trim();
  return name ? `I'm interested in ${name}.` : '';
}

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
  searchParams: Promise<{
    sent?: string;
    error?: string;
    subject?: string | string[];
    service?: string | string[];
  }>;
}) {
  // Reading ?sent / ?error / ?subject makes this page render per request.
  const sp = await searchParams;
  const [content, sections, settings] = await Promise.all([
    getPageContent('contact'),
    getPageSections('contact'),
    getSettings(),
  ]);
  const { hero, info, help, form } = content;
  const subjects = form.subjects.map((s) => s.subject).filter(Boolean);
  const subject = presetSubject(sp.subject, subjects);
  const message = presetMessage(sp.service);
  // A header kept in Admin → Pages (the older page sections) is shown until the hero
  // is saved in Admin → Content; from then on the Content copy wins.
  const header = hero.edited ? undefined : findSection(sections, 'header');
  const email = settingText(settings, 'contact.email');
  const label = header?.heading ?? hero.breadcrumb;
  const aside = info.visible || help.visible;

  return (
    <>
      <PageHero
        trail={[{ label: 'Home', href: '/' }, { label }]}
        eyebrow={hero.eyebrow}
        heading={<HighlightedHeading c={hero} className="text-hero-green-light" />}
        subheading={header?.subheading || hero.intro}
      />

      <div
        className={`container-page grid grid-cols-1 items-start gap-8 py-12 sm:py-16 ${
          aside ? 'lg:grid-cols-[minmax(0,5fr)_minmax(0,11fr)]' : ''
        }`}
      >
        {aside ? (
          <aside className="space-y-8 lg:sticky lg:top-24">
            {info.visible ? <InfoCard c={info} email={email} /> : null}
            {help.visible ? <HelpCard c={help} /> : null}
          </aside>
        ) : null}

        <section
          className="surface-card order-first p-6 shadow-sm sm:p-10 lg:order-none"
          aria-labelledby="contact-form-heading"
        >
          <h2
            id="contact-form-heading"
            className="font-headline-sm text-headline-sm flex items-center gap-2.5"
          >
            <MailIcon className="text-brand-700 size-5" />
            {form.heading}
          </h2>

          {sp.sent ? (
            <div
              role="status"
              className="border-brand-200 bg-brand-50 mt-8 flex flex-col items-center rounded-xl border px-6 py-12 text-center"
            >
              <CheckIcon className="text-brand-700 size-12" />
              <p className="font-display text-brand-800 mt-4 text-xl font-semibold">
                {form.sent_heading}
              </p>
              {form.sent_text ? (
                <p className="mt-2 text-sm text-[var(--text-muted)]">{form.sent_text}</p>
              ) : null}
              {form.sent_link.label && form.sent_link.href ? (
                <Link
                  href={form.sent_link.href}
                  className="text-brand-700 mt-6 text-sm font-semibold hover:underline"
                >
                  {form.sent_link.label}
                </Link>
              ) : null}
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
                    {form.name_label}
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
                    {form.email_label}
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
                    {form.subject_placeholder}
                  </option>
                  {subjects.map((s, i) => (
                    <option key={`${s}-${i}`} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <label
                  htmlFor="contact-subject"
                  className="pointer-events-none absolute top-2 left-4 text-xs text-[var(--text-muted)]"
                >
                  {form.subject_label}
                  <Required />
                </label>
                <ChevronIcon className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-[var(--text-muted)]" />
              </div>
              <div className="relative">
                <textarea
                  // Same as the select: a new ?service on this route must remount the textarea.
                  key={message}
                  id="contact-message"
                  name="message"
                  required
                  rows={7}
                  maxLength={5000}
                  defaultValue={message}
                  placeholder=" "
                  className={`${field} resize-y pt-7`}
                />
                <label htmlFor="contact-message" className={floatLabel}>
                  {form.message_label}
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
                {form.button}
                <SendIcon className="size-4" />
              </button>
            </form>
          )}
        </section>
      </div>
    </>
  );
}

function InfoCard({ c, email }: { c: Content['info']; email: string }) {
  return (
    <div className="surface-card p-6 shadow-sm sm:p-7">
      <h2 className="font-headline-sm text-headline-sm flex items-center gap-2.5">
        <ChatIcon className="text-brand-700 size-5" />
        {c.heading}
      </h2>
      {c.body ? (
        <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">{c.body}</p>
      ) : null}
      {email ? (
        <a
          href={`mailto:${email}`}
          className="hover:border-brand-300 hover:bg-brand-50 mt-5 flex items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 transition-colors"
        >
          <span className="bg-primary-container text-on-primary grid size-11 shrink-0 place-items-center rounded-full">
            <MailIcon className="size-5" />
          </span>
          <span className="min-w-0">
            <span className="block text-xs text-[var(--text-muted)]">{c.email_label}</span>
            <span className="block truncate font-semibold">{email}</span>
          </span>
        </a>
      ) : null}
      {c.cta_heading || c.cta_text || (c.cta_link.label && c.cta_link.href) ? (
        <div className="mt-6 border-t border-[var(--border)] pt-6">
          {c.cta_heading ? <p className="font-title-md text-title-md">{c.cta_heading}</p> : null}
          {c.cta_text ? (
            <p className="mt-1 text-sm text-[var(--text-muted)]">{c.cta_text}</p>
          ) : null}
          {c.cta_link.label && c.cta_link.href ? (
            <ArrowLink href={c.cta_link.href}>{c.cta_link.label}</ArrowLink>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function HelpCard({ c }: { c: Content['help'] }) {
  return (
    <div className="surface-card p-6 shadow-sm sm:p-7">
      <h2 className="font-headline-sm text-headline-sm flex items-center gap-2.5">
        <HelpIcon className="text-brand-700 size-5" />
        {c.heading}
      </h2>
      <div className="mt-4 divide-y divide-[var(--border)]">
        {c.items.map((item, i) => (
          <details key={i} open className="group py-4 first:pt-2 last:pb-0">
            <summary className="hover:text-brand-700 flex cursor-pointer list-none items-center justify-between gap-3 font-semibold marker:content-none [&::-webkit-details-marker]:hidden">
              {item.question}
              <ChevronIcon className="size-4 shrink-0 text-[var(--text-muted)] transition-transform group-open:rotate-180" />
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{item.answer}</p>
            {item.link.label && item.link.href ? (
              <ArrowLink href={item.link.href}>{item.link.label}</ArrowLink>
            ) : null}
          </details>
        ))}
      </div>
    </div>
  );
}
