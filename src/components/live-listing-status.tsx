'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Keeps the owner's dashboard current: when a moderator approves or rejects
 * one of their listings, Supabase Realtime (migration 0029) reports the change
 * and the page re-renders from the server. The change's payload is not used;
 * the server render is the only source of what the page shows.
 *
 * RLS limits the events to the owner's own rows; the filter keeps the
 * subscription to them as well.
 */
export function LiveListingStatus({ userId }: { userId: string }) {
  const router = useRouter();
  const [live, setLive] = useState(false);

  useEffect(() => {
    let stop = () => {};
    let cancelled = false;
    import('@supabase/ssr').then(({ createBrowserClient }) => {
      if (cancelled) return;
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      );
      const channel = supabase
        .channel(`owner-listings-${userId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'listings',
            filter: `owner_user_id=eq.${userId}`,
          },
          () => router.refresh(),
        )
        .subscribe((state) => setLive(state === 'SUBSCRIBED'));
      stop = () => {
        void supabase.removeChannel(channel);
      };
    });
    return () => {
      cancelled = true;
      stop();
    };
  }, [userId, router]);

  return live ? (
    <p className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
      <span aria-hidden className="bg-primary-container size-2 animate-pulse rounded-full" />
      Status updates live
    </p>
  ) : null;
}
