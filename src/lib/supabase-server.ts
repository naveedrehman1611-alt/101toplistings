import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Auth-aware Supabase client for Server Components, Server Actions and Route
 * Handlers. A new client per request — never share one across requests.
 *
 * `getAll`/`setAll` are both implemented: the @supabase/ssr docs are explicit
 * that the deprecated get/set/remove trio causes random logouts and early
 * session termination.
 *
 * Server Components cannot set cookies, so `setAll` throws there; the catch is
 * deliberate. Token refresh is handled by proxy.ts, which *can* write cookies.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component. proxy.ts refreshes the session.
        }
      },
    },
  });
}
