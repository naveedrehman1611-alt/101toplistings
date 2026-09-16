import type { Metadata } from 'next';
import { safeNextPath } from '@/lib/auth';
import { LoginForm } from './login-form';

export const metadata: Metadata = {
  title: 'Sign in',
  // The back office is not content: keep it out of the index entirely.
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="container-page py-16 md:py-24">
      <div className="surface-card mx-auto w-full max-w-md p-6 md:p-8">
        <h1 className="font-display text-2xl font-bold tracking-tight">Sign in</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Staff and business owners only. Use the email address your account was created with.
        </p>

        <div className="mt-6">
          <LoginForm next={safeNextPath(next)} />
        </div>
      </div>
    </div>
  );
}
