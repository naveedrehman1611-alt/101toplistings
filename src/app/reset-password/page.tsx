import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import { getCurrentUser } from '@/lib/auth';
import { Breadcrumbs } from '@/components/ui';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Choose a new password',
  description: 'Set a new password for your account.',
  robots: { index: false, follow: false },
};

async function updatePassword(formData: FormData) {
  'use server';

  const password = String(formData.get('password') ?? '');
  const confirm = String(formData.get('confirm') ?? '');
  const back = (msg: string) => redirect(`/reset-password?error=${encodeURIComponent(msg)}`);

  // The page hides the form without a session, but an action is a public
  // endpoint — re-check here rather than trusting that the form was rendered.
  if (!(await getCurrentUser())) {
    redirect(
      `/forgot-password?error=${encodeURIComponent('Your reset link has expired. Request a new one.')}`,
    );
  }
  if (password.length < 8) back('Use a password of at least 8 characters.');
  if (password !== confirm) back('The two passwords did not match.');

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  // Supabase's messages here are about the password itself (too weak, same as
  // the old one), never about other accounts, so they are safe to show.
  if (error) back(error.message);

  // Revoke every session, this one included. Someone resetting a password may
  // be locking out whoever else got in; signing in again with the new password
  // is a small cost for that.
  await supabase.auth.signOut({ scope: 'global' });
  redirect('/login?reset=1');
}

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  const user = await getCurrentUser();

  return (
    <div className="container-page py-12">
      <Breadcrumbs trail={[{ label: 'Home', href: '/' }, { label: 'Choose a new password' }]} />
      <div className="mx-auto max-w-sm">
        <h1 className="font-headline-lg text-headline-lg">Choose a new password</h1>

        {!user ? (
          <p className="mt-6 text-[var(--text-muted)]">
            This page only works from the link in a password reset email, and that link has expired
            or was opened in a different browser.{' '}
            <Link href="/forgot-password" className="text-brand-700 hover:underline">
              Request a new reset link
            </Link>
            .
          </p>
        ) : (
          <>
            <p className="mt-3 text-[var(--text-muted)]">
              Setting a new password for {user.email ?? 'your account'}. You will be signed out
              everywhere and asked to sign in again.
            </p>

            {sp.error ? (
              <p
                role="alert"
                className="border-error/30 bg-error-container/40 text-on-error-container mt-6 rounded-lg border px-4 py-3 text-sm"
              >
                {sp.error}
              </p>
            ) : null}

            <form action={updatePassword} className="mt-6 space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium">
                  New password
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
                <p className="mt-1 text-xs text-[var(--text-muted)]">At least 8 characters.</p>
              </div>
              <div>
                <label htmlFor="confirm" className="block text-sm font-medium">
                  Confirm new password
                </label>
                <input
                  id="confirm"
                  name="confirm"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  className="focus:border-primary-container focus:ring-primary-container/20 mt-1 h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 outline-hidden focus:ring-2"
                />
              </div>
              <button
                type="submit"
                className="bg-primary-container font-label-md text-label-md text-on-primary hover:bg-primary focus-visible:ring-primary-container h-11 w-full rounded-lg shadow-xs transition hover:shadow-[0_4px_12px_rgba(4,120,87,0.25)] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden"
              >
                Update password
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
