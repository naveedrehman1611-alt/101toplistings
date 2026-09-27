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
        <h1 className="text-3xl font-bold">Choose a new password</h1>

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
                className="mt-6 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800"
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
                  className="focus:border-brand-500 mt-1 h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 outline-none"
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
                  className="focus:border-brand-500 mt-1 h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 outline-none"
                />
              </div>
              <button
                type="submit"
                className="bg-brand-700 hover:bg-brand-800 h-11 w-full rounded-lg font-medium text-white"
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
