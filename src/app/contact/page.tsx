import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSettings, settingText } from '@/lib/queries';
import { createClient } from '@/lib/supabase-server';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Questions, corrections and listing requests.',
  openGraph: { title: 'Contact', description: 'Questions, corrections and listing requests.' },
  twitter: { card: 'summary_large_image', title: 'Contact' },
};

const SUBJECTS = [
  'General question',
  'Listing help',
  'Account & sign in',
  'Report a problem',
  'Partnership',
] as const;

const FAQS: { q: string; a: string; link?: { label: string; href: string } }[] = [
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
    link: { label: 'Go to my listings', href: '/dashboard/listings' },
  },
  {
    q: 'What areas do you cover?',
    a: "Every region and category currently in the directory — browse by region to see what's listed near you.",
    link: { label: 'Browse regions', href: '/listings' },
  },
];

async function sendMessage(formData: FormData) {
  'use server';

  const name = String(formData.get('name') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const subject = String(formData.get('subject') ?? '').trim();
  const message = String(formData.get('message') ?? '').trim();
  // Honeypot: real visitors never see this field, so anything in it is a bot.
  const website = String(formData.get('website') ?? '').trim();

  if (!name || !email || !subject || !message) {
    redirect(`/contact?error=${encodeURIComponent('Please fill in every required field.')}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.from('form_submissions').insert({
    form_type: 'contact',
    payload: { name, email, subject, message },
    is_spam: website.length > 0,
  });

  if (error) {
    redirect(
      `/contact?error=${encodeURIComponent('Something went wrong sending your message. Please email us instead.')}`,
    );
  }
  redirect('/contact?sent=1');
}

const card = 'rounded-2xl border border-[#263245] bg-[#161f2d]';
const field =
  'peer w-full rounded-lg border border-[#334155] bg-[#1b2535] px-3 text-sm text-slate-100 outline-none transition-colors placeholder-transparent focus:border-sky-400';
const floatLabel =
  'pointer-events-none absolute left-3 text-slate-400 transition-all ' +
  'top-1/2 -translate-y-1/2 text-sm ' +
  'peer-focus:top-1 peer-focus:translate-y-0 peer-focus:text-[11px] ' +
  'peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-[11px]';

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const [sp, settings] = await Promise.all([searchParams, getSettings()]);
  const email = settingText(settings, 'contact.email', '101toplistings@gmail.com');

  // -mb-20 pb-20 paints the dark background over <main>'s bottom padding so it meets the footer.
  return (
    <div className="-mb-20 bg-[#0b111b] pb-20 text-slate-100">
      <div className="container-page grid items-start gap-5 py-14 lg:grid-cols-[300px_minmax(0,740px)] lg:gap-6">
        {/* Left column */}
        <aside className="order-2 space-y-6 lg:order-1">
          <section className={`${card} p-5`}>
            <h2 className="flex items-center gap-2 text-base font-bold text-white">
              <ChatIcon />
              Contact information
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              Questions about the directory, your account, or how listings work — email us and
              we&apos;ll get back to you.
            </p>
            <a
              href={`mailto:${email}`}
              className="mt-3 flex items-center gap-3 rounded-xl border border-[#263245] bg-[#1b2535] p-3 transition-colors hover:border-sky-400/60"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-sky-400 to-violet-500 text-white">
                <MailIcon className="size-4" />
              </span>
              <span className="truncate text-sm font-semibold text-white">{email}</span>
            </a>
            <div className="mt-4 border-t border-[#263245] pt-4">
              <p className="text-sm font-bold text-white">Ready to get listed?</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-400">
                It only takes a couple of minutes, and it&apos;s free.
              </p>
              <Link
                href="/dashboard/listings/new"
                className="mt-3 inline-block text-sm font-medium text-sky-400 hover:underline"
              >
                Add your listing →
              </Link>
            </div>
          </section>

          <section className={`${card} p-5`}>
            <h2 className="flex items-center gap-2 text-base font-bold text-white">
              <HelpIcon />
              Quick help
            </h2>
            <div className="mt-3 divide-y divide-[#263245]">
              {FAQS.map((f) => (
                <details key={f.q} open className="group py-4 first:pt-1">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm font-bold text-white [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <ChevronIcon className="size-4 shrink-0 -rotate-90 text-slate-400 transition-transform group-open:rotate-0" />
                  </summary>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{f.a}</p>
                  {f.link ? (
                    <Link
                      href={f.link.href}
                      className="mt-2 inline-block text-sm font-medium text-sky-400 hover:underline"
                    >
                      {f.link.label} →
                    </Link>
                  ) : null}
                </details>
              ))}
            </div>
          </section>
        </aside>

        {/* Form */}
        <section className={`${card} order-1 p-7 lg:order-2`}>
          <h1 className="font-display flex items-center gap-2 text-base font-bold text-white">
            <MailIcon className="size-4 text-sky-400" />
            Send us a message
          </h1>

          {sp.sent ? (
            <p
              role="status"
              className="mt-5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"
            >
              Thanks — your message has been sent. We&apos;ll get back to you soon.
            </p>
          ) : null}
          {sp.error ? (
            <p
              role="alert"
              className="mt-5 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300"
            >
              {sp.error}
            </p>
          ) : null}

          <form action={sendMessage} className="mt-6 space-y-5">
            {/* Honeypot, hidden from people and assistive tech. */}
            <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
              <label>
                Website
                <input type="text" name="website" tabIndex={-1} autoComplete="off" />
              </label>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="relative">
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  placeholder="Your name"
                  className={`${field} h-11 pt-2`}
                />
                <label htmlFor="name" className={floatLabel}>
                  Your name <span className="text-red-400">*</span>
                </label>
              </div>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="Email address"
                  className={`${field} h-11 pt-2`}
                />
                <label htmlFor="email" className={floatLabel}>
                  Email address <span className="text-red-400">*</span>
                </label>
              </div>
            </div>

            <div className="relative">
              <label
                htmlFor="subject"
                className="pointer-events-none absolute top-1.5 left-3 text-[10px] text-slate-400"
              >
                Subject <span className="text-red-400">*</span>
              </label>
              <select
                id="subject"
                name="subject"
                required
                defaultValue=""
                className={`${field} h-11 appearance-none pt-3.5 pr-9 text-sm font-medium [color-scheme:dark]`}
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
              <ChevronIcon className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-slate-400" />
            </div>

            <div className="relative">
              <label
                htmlFor="message"
                className="pointer-events-none absolute top-3 left-3 text-sm text-slate-400"
              >
                Message <span className="text-red-400">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                className={`${field} min-h-32 pt-8 pb-2 leading-relaxed`}
              />
            </div>

            <button
              type="submit"
              className="mt-1 inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-sky-400 to-violet-500 px-5 text-sm font-semibold text-white shadow-[0_6px_20px_-4px_rgba(139,92,246,0.6)] transition-opacity hover:opacity-90"
            >
              Send message
              <SendIcon />
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

function ChatIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
      className="size-4 text-sky-400"
    >
      <path
        d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HelpIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
      className="size-4 text-sky-400"
    >
      <circle cx="12" cy="12" r="10" />
      <path
        d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
      className={className}
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-10 6L2 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
      className={className}
    >
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
      className="size-3.5"
    >
      <path d="M22 2 11 13M22 2l-7 20-4-9-9-4z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
