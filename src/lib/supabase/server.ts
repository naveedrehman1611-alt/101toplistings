import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

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
 * Request-scoped client for Server Components, Server Actions and Route
 * Handlers. It must be created per request (never hoisted to a module-level
 * singleton) because it closes over that request's cookie jar.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        // Server Components render after headers are sent, so cookie writes
        // throw there. Swallowing is safe: the proxy refreshes the session on
        // every request, so the rotated tokens still reach the browser.
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component — ignore.
        }
      },
    },
  });
}
