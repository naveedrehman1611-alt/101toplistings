import type { Metadata } from 'next';
import Link from 'next/link';
import { requireRole } from '@/lib/auth';
import { signOut } from '@/lib/admin-actions';

// Admin is per-user and permission-gated: never cached, never prerendered.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s · Admin' },
  robots: { index: false, follow: false },
};

const NAV = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/listings', label: 'Listings' },
  { href: '/admin/pages', label: 'Pages & sections' },
  { href: '/admin/settings', label: 'Settings' },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Enforced here in the layout so no admin route can render without a role,
  // and again inside every action — a layout check alone would not protect a
  // Server Action, which is reachable as its own endpoint.
  const user = await requireRole('moderator');

  return (
    <div className="container-page py-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div>
          <p className="font-display text-xl font-bold">Admin</p>
          <p className="text-sm text-[var(--text-muted)]">
            {user.displayName ?? user.email} · {user.role.replace('_', ' ')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/" className="text-sm text-brand-700 hover:underline">
            View site
          </Link>
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

      <div className="grid gap-8 lg:grid-cols-[12rem_1fr]">
        <nav aria-label="Admin" className="lg:sticky lg:top-24 lg:self-start">
          <ul className="flex flex-wrap gap-2 lg:flex-col">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block rounded-lg px-3 py-2 text-sm hover:bg-[var(--surface-2)]"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
