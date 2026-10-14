'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import type { SupabaseClient } from '@supabase/supabase-js';

let client: Promise<SupabaseClient> | null = null;

/**
 * The Supabase browser client, imported on first use so it ships as its own
 * chunk instead of in the header bundle every page loads.
 */
function browserClient(): Promise<SupabaseClient> {
  client ??= import('@supabase/ssr').then(({ createBrowserClient }) =>
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    ),
  );
  // A failed chunk load is retried on the next check rather than cached.
  client.catch(() => {
    client = null;
  });
  return client;
}

/** Runs `task` once the browser is idle (or after a short wait where idle callbacks are missing). */
function whenIdle(task: () => void): () => void {
  if (typeof window.requestIdleCallback === 'function') {
    const id = window.requestIdleCallback(task, { timeout: 2000 });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(task, 200);
  return () => window.clearTimeout(id);
}

/**
 * Whether the visitor has a session, for showing the right header controls.
 * `null` until known, so nothing auth-specific flashes before the check.
 *
 * Read in the browser on purpose: calling cookies() in the root layout would
 * turn every ISR page into a per-request render. This is display only and
 * reads the session cookie without revalidating it; the real checks stay in
 * lib/auth.ts and RLS. Sign-in and sign-out run as server actions that end in
 * a navigation, so re-reading on each path change keeps it current.
 *
 * Without a Supabase session cookie (sb-<ref>-auth-token, possibly chunked)
 * there is no session to read, so signed-out visitors never download the
 * client. With one, the client is loaded once the page is idle and asked.
 */
export function useSignedIn(): boolean | null {
  const pathname = usePathname();
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    let live = true;
    let cancel: (() => void) | undefined;
    const settle = (value: boolean) => {
      if (live) setSignedIn(value);
    };
    const ask = () => {
      browserClient()
        .then((supabase) => supabase.auth.getSession())
        .then(
          ({ data }) => settle(Boolean(data.session)),
          () => settle(false),
        );
    };
    if (!document.cookie.includes('-auth-token')) {
      // No session cookie, so no session: signed out, without the client.
      settle(false);
    } else if (client) {
      ask();
    } else {
      // The first load waits for idle so it never competes with the page's own.
      cancel = whenIdle(ask);
    }
    return () => {
      live = false;
      cancel?.();
    };
  }, [pathname]);

  return signedIn;
}
