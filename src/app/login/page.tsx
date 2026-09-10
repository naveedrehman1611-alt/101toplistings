import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import { getCurrentUser } from '@/lib/auth';
import { Breadcrumbs } from '@/components/ui';

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
  const next = String(formData.get('next') ?? '/admin');

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

  redirect(next.startsWith('/') ? next : '/admin');
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const sp = await searchParams;

  // Already signed in — no reason to show the form again.
  const user = await getCurrentUser();
  if (user) redirect(sp.next?.startsWith('/') ? sp.next : '/admin');

  return (
    <div className="container-page py-12">
      <Breadcrumbs trail={[{ label: 'Home', href: '/' }, { label: 'Sign in' }]} />
      <div className="mx-auto max-w-sm">
        <h1 className="text-3xl font-bold">Sign in</h1>
        <p className="mt-3 text-[var(--text-muted)]">
          Manage listings, content and settings.
        </p>

        {sp.error ? (
          <p
            role="alert"
            className="mt-6 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {sp.error}
          </p>
        ) : null}

        <form action={signIn} className="mt-6 space-y-4">
          <input type="hidden" name="next" value={sp.next ?? '/admin'} />
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
              className="mt-1 h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 outline-none focus:border-brand-500"
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
              className="mt-1 h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 outline-none focus:border-brand-500"
            />
          </div>
          <button
            type="submit"
            className="h-11 w-full rounded-lg bg-brand-700 font-medium text-white hover:bg-brand-800"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
