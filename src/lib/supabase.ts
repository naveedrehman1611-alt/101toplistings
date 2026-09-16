import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Copy .env.example to .env.local.',
  );
}

/**
 * How long a cached PostgREST read may serve stale data before Next.js
 * refetches it. Writes do not wait for this: every admin action calls
 * revalidateTag() for the tables it touched (see lib/admin-actions.ts).
 */
export const READ_REVALIDATE_SECONDS = 600;

/** Cache tag for one table/view. Admin writes revalidate by this name. */
export function tableTag(table: string): string {
  return `pg:${table}`;
}

/** `/rest/v1/categories?select=…` → `categories`. Null for anything else. */
function tableFromUrl(input: string): string | null {
  const path = input.split('?')[0];
  const at = path.indexOf('/rest/v1/');
  if (at === -1) return null;
  const rest = path.slice(at + '/rest/v1/'.length);
  // rpc/<name> is a POST and is never cached; everything else is a table/view.
  return rest.startsWith('rpc/') ? null : (rest.split('/')[0] || null);
}

/**
 * Next.js 16 does not cache `fetch` by default, so without this every render —
 * including every request to a dynamic route — would be a fresh round trip to
 * PostgREST. Reads are opted into the Data Cache and tagged with their table;
 * anything that is not a plain read is passed through untouched.
 *
 * Only the anon client below uses this. The cookie-bound client in
 * supabase-server.ts is per-user and must never share a cache entry.
 */
const cachedFetch: typeof fetch = (input, init) => {
  const method = (init?.method ?? 'GET').toUpperCase();
  const href = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  const table = method === 'GET' ? tableFromUrl(href) : null;

  // Writes and RPC (PostgREST uses POST for both) are left exactly as they came.
  // Marking them `no-store` would be the intuitive thing to do and is wrong: an
  // explicit no-store fetch opts the whole route out of static rendering, which
  // would silently turn every ISR page that runs a search into a per-request
  // render. Next.js does not cache a POST in the first place.
  if (!table) return fetch(input, init);

  return fetch(input, {
    ...init,
    cache: 'force-cache',
    next: { revalidate: READ_REVALIDATE_SECONDS, tags: [tableTag(table)] },
  });
};

/**
 * Anon-key client. RLS is what protects the data, so this is safe on the server
 * and in the browser. The service role key is never imported here — see
 * docs/DEPLOYMENT.md.
 */
export const supabase = createClient(url, anonKey, {
  auth: { persistSession: false },
  global: { fetch: cachedFetch },
});

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
