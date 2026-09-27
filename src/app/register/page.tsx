import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import { getCurrentUser } from '@/lib/auth';
import { SITE_URL } from '@/lib/supabase';
import { Breadcrumbs } from '@/components/ui';

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
      emailRedirectTo: `${SITE_URL}/login?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) back(error.message);

  // With email confirmation on, Supabase returns a user but no session. Say so
  // plainly instead of dropping them on a page that bounces them to sign in.
  if (!data.session) redirect('/register?sent=1');
  redirect(next);
}

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string; sent?: string }>;
}) {
  const sp = await searchParams;
  if (await getCurrentUser()) redirect(safeNext(sp.next));

  return (
    <div className="container-page py-12">
      <Breadcrumbs trail={[{ label: 'Home', href: '/' }, { label: 'Create an account' }]} />
      <div className="mx-auto max-w-sm">
        <h1 className="text-3xl font-bold">Create an account</h1>
        <p className="mt-3 text-[var(--text-muted)]">
          Add your business for free, or review places you have been.
        </p>

        {sp.sent ? (
          <p
            role="status"
            className="border-brand-500/40 bg-brand-50 text-brand-800 mt-6 rounded-lg border px-4 py-3 text-sm"
          >
            Check your inbox — we sent a link to confirm your email address. After confirming, sign
            in to continue.
          </p>
        ) : null}
        {sp.error ? (
          <p
            role="alert"
            className="mt-6 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {sp.error}
          </p>
        ) : null}

        <form action={register} className="mt-6 space-y-4">
          <input type="hidden" name="next" value={safeNext(sp.next)} />
          <div>
            <label htmlFor="display_name" className="block text-sm font-medium">
              Your name
            </label>
            <input
              id="display_name"
              name="display_name"
              autoComplete="name"
              className="focus:border-brand-500 mt-1 h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 outline-none"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="focus:border-brand-500 mt-1 h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 outline-none"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              className="focus:border-brand-500 mt-1 h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 outline-none"
            />
            <p className="mt-1 text-xs text-[var(--text-muted)]">At least 8 characters.</p>
          </div>
          <button
            type="submit"
            className="bg-brand-700 hover:bg-brand-800 h-11 w-full rounded-lg font-medium text-white"
          >
            Create account
          </button>
        </form>
        <p className="mt-6 text-sm text-[var(--text-muted)]">
          Already have an account?{' '}
          <Link
            href={sp.next ? `/login?next=${encodeURIComponent(sp.next)}` : '/login'}
            className="text-brand-700 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
