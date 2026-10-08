import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import { SITE_URL } from '@/lib/supabase';
import { Breadcrumbs } from '@/components/ui';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Reset your password',
  description: 'Get a link to choose a new password.',
  robots: { index: false, follow: false },
};

async function requestReset(formData: FormData) {
  'use server';

  const email = String(formData.get('email') ?? '').trim();
  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+$/.test(email)) {
    redirect(`/forgot-password?error=${encodeURIComponent('Enter a valid email address.')}`);
  }

  const supabase = await createClient();
  // The PKCE verifier cookie is written here, so the link must be opened in
  // this same browser for /auth/callback to redeem it.
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${SITE_URL}/auth/callback?next=/reset-password`,
  });

  // Rate limiting says nothing about whether the account exists, so it is safe
  // to surface. Anything else gets the same answer as success: telling people
  // "no such account" would let anyone enumerate registered emails.
  if (error?.status === 429) {
    redirect(
      `/forgot-password?error=${encodeURIComponent('Too many requests. Wait a few minutes and try again.')}`,
    );
  }
  if (error) console.error('resetPasswordForEmail failed', error.message);

  redirect('/forgot-password?sent=1');
}

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string }>;
}) {
  const sp = await searchParams;

  return (
    <div className="container-page py-12">
      <Breadcrumbs
        trail={[
          { label: 'Home', href: '/' },
          { label: 'Sign in', href: '/login' },
          { label: 'Reset your password' },
        ]}
      />
      <div className="mx-auto max-w-sm">
        <h1 className="font-headline-lg text-headline-lg">Reset your password</h1>
        <p className="mt-3 text-[var(--text-muted)]">
          Enter the email you signed up with and we will send you a link to choose a new password.
        </p>

        {sp.sent ? (
          <p
            role="status"
            className="border-brand-500/40 bg-brand-50 text-brand-800 mt-6 rounded-lg border px-4 py-3 text-sm"
          >
            If an account exists for that email, we have sent a link to reset its password. Open it
            in this browser — it expires after a short while.
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

        <form action={requestReset} className="mt-6 space-y-4">
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
              className="focus:border-primary-container focus:ring-primary-container/20 mt-1 h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 outline-hidden focus:ring-2"
            />
          </div>
          <button
            type="submit"
            className="bg-primary-container font-label-md text-label-md text-on-primary hover:bg-primary focus-visible:ring-primary-container h-11 w-full rounded-lg shadow-xs transition hover:shadow-[0_4px_12px_rgba(12,130,38,0.25)] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden"
          >
            Send reset link
          </button>
        </form>
        <p className="mt-6 text-sm text-[var(--text-muted)]">
          Remembered it?{' '}
          <Link href="/login" className="text-brand-700 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
