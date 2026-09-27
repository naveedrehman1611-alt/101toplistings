import type { Metadata } from 'next';
import Link from 'next/link';
import { requireUser, roleAtLeast } from '@/lib/auth';
import { signOut } from '@/lib/admin-actions';

// Per-user pages: never cached, never indexed.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: { default: 'Your account', template: '%s · Your account' },
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser('/dashboard');

  return (
    <div className="container-page py-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div>
          <p className="font-display text-xl font-bold">Your account</p>
          <p className="text-sm text-[var(--text-muted)]">{user.displayName ?? user.email}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-brand-700 text-sm hover:underline">
            My listings
          </Link>
          {roleAtLeast(user.role, 'moderator') ? (
            <Link href="/admin" className="text-brand-700 text-sm hover:underline">
              Admin
            </Link>
          ) : null}
          <form action={signOut}>
            <button
              type="submit"
              className="h-9 rounded-lg border border-[var(--border)] px-3 text-sm hover:bg-[var(--surface-2)]"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
      {children}
    </div>
  );
}
