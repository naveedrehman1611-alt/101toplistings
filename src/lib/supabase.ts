import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Copy .env.example to .env.local.',
  );
}

/**
 * Anon-key client. RLS is what protects the data, so this is safe on the server
 * and in the browser. The service role key is never imported here — see
 * docs/DEPLOYMENT.md.
 */
export const supabase = createClient(url, anonKey, {
  auth: { persistSession: false },
});

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
