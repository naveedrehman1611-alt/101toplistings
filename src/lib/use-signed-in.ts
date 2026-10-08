'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

function browserClient() {
  client ??= createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  return client;
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
 */
export function useSignedIn(): boolean | null {
  const pathname = usePathname();
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    let live = true;
    browserClient()
      .auth.getSession()
      .then(({ data }) => {
        if (live) setSignedIn(Boolean(data.session));
      })
      .catch(() => {
        if (live) setSignedIn(false);
      });
    return () => {
      live = false;
    };
  }, [pathname]);

  return signedIn;
}
