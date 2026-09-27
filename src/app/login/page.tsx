import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import { getCurrentUser, roleAtLeast } from '@/lib/auth';
import { Breadcrumbs } from '@/components/ui';
import { GoogleSignIn } from '@/components/google-sign-in';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to manage your listings.',
  robots: { index: false, follow: false },
};

async function signIn(formData: FormData) {
  'use server';

  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const next = String(formData.get('next') ?? '');

  if (!email || !password) {
    redirect(`/login?error=${encodeURIComponent('Enter an email and password.')}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Deliberately generic: distinguishing "no such user" from "wrong password"
    // would let anyone enumerate which emails have accounts.
    redirect(`/login?error=${encodeURIComponent('Those details did not match an account.')}`);
  }

  // Only same-site paths: "//evil.example" would be an open redirect.
  if (next.startsWith('/') && !next.startsWith('//')) redirect(next);
  const user = await getCurrentUser();
  redirect(user && roleAtLeast(user.role, 'moderator') ? '/admin' : '/dashboard');
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string; reset?: string }>;
}) {
  const sp = await searchParams;

  // Already signed in — no reason to show the form again.
  const user = await getCurrentUser();
  if (user) {
    if (sp.next?.startsWith('/') && !sp.next.startsWith('//')) redirect(sp.next);
    redirect(roleAtLeast(user.role, 'moderator') ? '/admin' : '/dashboard');
  }

  return (
    <div className="container-page py-12">
      <Breadcrumbs trail={[{ label: 'Home', href: '/' }, { label: 'Sign in' }]} />
      <div className="mx-auto max-w-sm">
        <h1 className="text-3xl font-bold">Sign in</h1>
        <p className="mt-3 text-[var(--text-muted)]">Manage listings, content and settings.</p>

        {sp.reset ? (
          <p
            role="status"
            className="border-brand-500/40 bg-brand-50 text-brand-800 mt-6 rounded-lg border px-4 py-3 text-sm"
          >
            Your password has been changed. Sign in with your new password.
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

        <GoogleSignIn next={sp.next} from="login" />

        <form action={signIn} className="mt-6 space-y-4">
          <input type="hidden" name="next" value={sp.next ?? ''} />
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
              autoComplete="current-password"
              required
              className="focus:border-brand-500 mt-1 h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 outline-none"
            />
          </div>
          <button
            type="submit"
            className="bg-brand-700 hover:bg-brand-800 h-11 w-full rounded-lg font-medium text-white"
          >
            Sign in
          </button>
        </form>
        <p className="mt-4 text-sm">
          <Link href="/forgot-password" className="text-brand-700 hover:underline">
            Forgot your password?
          </Link>
        </p>
        <p className="mt-6 text-sm text-[var(--text-muted)]">
          New here?{' '}
          <Link
            href={sp.next ? `/register?next=${encodeURIComponent(sp.next)}` : '/register'}
            className="text-brand-700 hover:underline"
          >
            Create an account
          </Link>{' '}
          to add your business or write a review.
        </p>
      </div>
    </div>
  );
}
