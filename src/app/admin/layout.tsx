import type { Metadata } from 'next';
import { Suspense } from 'react';
import { requireRole } from '@/lib/auth';
import { signOut } from '@/lib/admin-actions';
import { setPreviewRole } from '@/lib/preview-role-actions';
import { createClient } from '@/lib/supabase-server';
import { getSettings, settingText } from '@/lib/queries';
import { AdminShell, type NavCounts } from '@/components/admin/shell';
import { FlashToast, Toaster } from '@/components/admin/toaster';

// Admin is per-user and permission-gated: never cached, never prerendered.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s · Admin' },
  robots: { index: false, follow: false },
};

/** The sidebar badges: work waiting in each moderation queue. */
async function queueCounts(): Promise<NavCounts> {
  const supabase = await createClient();
  const count = async (table: string, column: string, value: string) => {
    const { count: n } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true })
      .eq(column, value);
    return n ?? 0;
  };
  const [listings, reviews, claims, inbox] = await Promise.all([
    count('listings', 'status', 'pending'),
    count('reviews', 'status', 'pending'),
    count('claims', 'status', 'new'),
    count('form_submissions', 'status', 'new'),
  ]);
  return { listings, reviews, claims, inbox };
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Enforced here in the layout so no admin route can render without a role,
  // and again inside every action — a layout check alone would not protect a
  // Server Action, which is reachable as its own endpoint.
  const user = await requireRole('moderator');
  const [counts, settings] = await Promise.all([queueCounts(), getSettings()]);

  return (
    <AdminShell
      brand={settingText(settings, 'brand.name', 'RankYouSite')}
      role={user.role}
      actualRole={user.actualRole}
      setPreviewRole={setPreviewRole}
      userName={user.displayName ?? user.email ?? 'Signed in'}
      counts={counts}
      signOut={signOut}
    >
      {children}
      <Toaster />
      <Suspense>
        <FlashToast />
      </Suspense>
    </AdminShell>
  );
}
