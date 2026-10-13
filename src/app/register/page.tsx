import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import { getCurrentUser } from '@/lib/auth';
import { SITE_URL } from '@/lib/supabase';
import { Breadcrumbs } from '@/components/ui';
import { GoogleSignIn } from '@/components/google-sign-in';
import { getPageContent } from '@/lib/content/get';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Create an account',
  description: 'Create an account to add your business or write a review.',
  robots: { index: false, follow: false },
};

function safeNext(v: unknown): string {
  const s = typeof v === 'string' ? v : '';
  return s.startsWith('/') && !s.startsWith('//') ? s : '/dashboard';
}

async function register(formData: FormData) {
  'use server';

  const name = String(formData.get('display_name') ?? '')
    .trim()
    .slice(0, 80);
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const next = safeNext(formData.get('next'));
  const back = (msg: string) =>
    redirect(`/register?next=${encodeURIComponent(next)}&error=${encodeURIComponent(msg)}`);

  if (!email || !password) back('Enter an email and a password.');
  if (password.length < 8) back('Use a password of at least 8 characters.');

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Role is never taken from here — the signup trigger always creates 'user'.
      data: name ? { display_name: name } : undefined,
      // /auth/callback redeems the confirmation code, so the link signs them in.
      emailRedirectTo: `${SITE_URL}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) back(error.message);

  // With email confirmation on, Supabase returns a user but no session. Say so
  // plainly instead of dropping them on a page that bounces them to sign in.
  if (!data.session) redirect('/register?sent=1');
  redirect(next);
}

/** Carries ?next= over to the sign-in page, so the visitor still lands where they were going. */
function withNext(href: string, next: string | undefined): string {
  if (!next) return href;
  return `${href}${href.includes('?') ? '&' : '?'}next=${encodeURIComponent(next)}`;
}

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string; sent?: string }>;
}) {
  const sp = await searchParams;
  if (await getCurrentUser()) redirect(safeNext(sp.next));
  const content = await getPageContent('auth');
  const c = content.register;

  return (
    <div className="container-page py-12">
      <Breadcrumbs trail={[{ label: 'Home', href: '/' }, { label: c.breadcrumb }]} />
      <div className="mx-auto max-w-sm">
        <h1 className="font-headline-lg text-headline-lg">{c.heading}</h1>
        {c.intro ? <p className="mt-3 text-[var(--text-muted)]">{c.intro}</p> : null}

        {sp.sent ? (
          <p
            role="status"
            className="border-brand-500/40 bg-brand-50 text-brand-800 mt-6 rounded-lg border px-4 py-3 text-sm"
          >
            {c.sent_notice}
          </p>
        ) : null}
        {sp.error ? (
          <p
            role="alert"
            className="border-error/30 bg-error-container/40 text-on-error-container mt-6 rounded-lg border px-4 py-3 text-sm"
          >
            {sp.error}
          </p>
        ) : null}

        <GoogleSignIn next={sp.next} from="register" content={content.google} />

        <form action={register} className="mt-6 space-y-4">
          <input type="hidden" name="next" value={safeNext(sp.next)} />
          <div>
            <label htmlFor="display_name" className="block text-sm font-medium">
              {c.name_label}
            </label>
            <input
              id="display_name"
              name="display_name"
              autoComplete="name"
              className="focus:border-primary-container focus:ring-primary-container/20 mt-1 h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 outline-hidden focus:ring-2"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              {c.email_label}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="focus:border-primary-container focus:ring-primary-container/20 mt-1 h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 outline-hidden focus:ring-2"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              {c.password_label}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              className="focus:border-primary-container focus:ring-primary-container/20 mt-1 h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 outline-hidden focus:ring-2"
            />
            {c.password_hint ? (
              <p className="mt-1 text-xs text-[var(--text-muted)]">{c.password_hint}</p>
            ) : null}
          </div>
          <button
            type="submit"
            className="bg-primary-container font-label-md text-label-md text-on-primary hover:bg-primary focus-visible:ring-primary-container h-11 w-full rounded-lg shadow-xs transition hover:shadow-[0_4px_12px_rgba(12,130,38,0.25)] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden"
          >
            {c.button}
          </button>
        </form>
        <p className="mt-6 text-sm text-[var(--text-muted)]">
          {c.login_before}{' '}
          <Link
            href={withNext(c.login_link.href, sp.next)}
            className="text-brand-700 hover:underline"
          >
            {c.login_link.label}
          </Link>
        </p>
      </div>
    </div>
  );
}
