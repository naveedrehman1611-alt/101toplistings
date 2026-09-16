'use client';

import { createBrowserClient } from '@supabase/ssr';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Copy .env.example to .env.local.',
  );
}

const SUPABASE_URL = url;
const SUPABASE_ANON_KEY = anonKey;

/**
 * Browser-side auth client. Unlike `@/lib/supabase` (which never persists a
 * session) this one stores the session in cookies so the server, the proxy and
 * the browser all read the same tokens. Anon key only — the service role key
 * must never reach a client bundle.
 */
export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
