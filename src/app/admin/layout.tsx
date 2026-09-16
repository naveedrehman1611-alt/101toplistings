import Link from 'next/link';
import type { ReactNode } from 'react';
import { requireRole } from '@/lib/auth';
import { hasMinRole } from '@/lib/roles';

/**
 * The admin shell, and the second of three auth layers.
 *
 * Proxy already bounced anonymous requests, but that is optimistic UX, not a
 * boundary — so the role is resolved here, against the database, before any
 * admin page renders. The third layer is inside the Server Actions themselves,
 * because an action is a POST endpoint that does not have to arrive through
 * this layout at all. RLS underneath is the fourth.
 *
 * requireRole calls cookies(), which makes this whole subtree dynamic. That is
 * correct and deliberate: never add `export const revalidate` under /admin — a
 * cached moderation queue is a wrong moderation queue.
 */

const NAV = [
  { href: '/admin', label: 'Overview', exact: true, min: 'moderator' as const },
  { href: '/admin/listings', label: 'Listings', min: 'moderator' as const },
  { href: '/admin/reviews', label: 'Reviews', min: 'moderator' as const },
  { href: '/admin/claims', label: 'Claims', min: 'moderator' as const },
  { href: '/admin/submissions', label: 'Inbox', min: 'moderator' as const },
  { href: '/admin/categories', label: 'Categories', min: 'editor' as const },
  { href: '/admin/locations', label: 'Locations', min: 'editor' as const },
  { href: '/admin/media', label: 'Media', min: 'editor' as const },
  { href: '/admin/audit', label: 'Audit log', min: 'admin' as const },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await requireRole('moderator');
  const nav = NAV.filter((item) => hasMinRole(user.role, item.min));

  return (
    <div className="min-h-screen bg-[var(--surface-2)]">
      <header className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto flex max-w-[var(--container-page)] items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="font-display text-base font-bold tracking-tight">
              RankYouSite
            </Link>
            <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
              Admin
            </span>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <Link href="/" className="text-[var(--text-muted)] hover:text-brand-700">
              View site
            </Link>
            <span className="hidden text-[var(--text-muted)] sm:inline">
              {user.displayName ?? user.email}
            </span>
            {/* POST, not a link: a GET that ends a session can be triggered by
                any image tag on any page. */}
            <form action="/logout" method="post">
              <button
                type="submit"
                className="rounded-lg border border-[var(--border)] px-3 py-1.5 font-medium transition-colors hover:bg-[var(--surface-2)]"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>

        <div className="mx-auto max-w-[var(--container-page)] overflow-x-auto px-4">
          <nav aria-label="Admin" className="flex gap-1 pb-1">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="whitespace-nowrap rounded-t-lg px-3 py-2 text-sm font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-[var(--container-page)] px-4 py-8">
        <div className="flex flex-col gap-6">{children}</div>
      </main>
    </div>
  );
}
