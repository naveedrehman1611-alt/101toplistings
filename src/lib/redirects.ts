import 'server-only';
import { notFound, permanentRedirect, redirect } from 'next/navigation';
import { supabase } from './supabase';

/**
 * Admin-managed redirects are looked up only when a request would otherwise
 * 404, never in proxy.ts: a redirect table is consulted by a tiny share of
 * requests, and proxy would put a database round trip in front of every page,
 * including the ISR-cached ones that currently cost nothing.
 *
 * Why not app/not-found.tsx: it receives no props, so it would have to read the
 * path from headers(), and a dynamic API in the root not-found boundary turns
 * every route in the app dynamic (checked with `next build` on 16.3.1).
 */

export const MAX_SOURCE_LENGTH = 500;

/** Looks up and counts a redirect in one round trip (see migration 0016). */
async function findRedirect(path: string) {
  const { data } = await supabase.rpc('resolve_redirect', { p_path: path });
  const rows = (data ?? []) as { destination: string; status_code: number }[];
  return rows[0] ?? null;
}

/**
 * Sends a slug with capitals to its lowercase URL when a record answers to the
 * lowercase slug, and does nothing otherwise. Slugs are saved lowercase
 * (slugify, migration 0028), so "/listing/Acme-Plumbing" is the same page as
 * "/listing/acme-plumbing" typed or linked with different case; a 308 merges
 * the two instead of a 404. Called by a dynamic route before
 * redirectOrNotFound, with the route's own lookup, so it costs a query only for
 * a URL that has capitals and missed.
 *
 * `search` carries the query string over, as Next.js does for its redirects.
 */
export async function redirectToLowercase(
  base: string,
  slug: string,
  find: (slug: string) => Promise<unknown>,
  search?: Record<string, string | string[] | undefined>,
): Promise<void> {
  const lower = slug.toLowerCase();
  if (lower === slug || !(await find(lower))) return;
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(search ?? {})) {
    for (const v of Array.isArray(value) ? value : value === undefined ? [] : [value]) {
      qs.append(key, v);
    }
  }
  const query = qs.toString();
  permanentRedirect(`${base}/${encodeURIComponent(lower)}${query ? `?${query}` : ''}`);
}

/**
 * Follows a stored redirect for `path`, or renders the 404 page.
 *
 * Next.js can only send 307 or 308 from render code, so the stored code picks
 * the class: 301/308 are permanent (308), 302/307 temporary (307). Search
 * engines treat 308 like 301 and 307 like 302.
 */
export async function redirectOrNotFound(path: string): Promise<never> {
  // Bots probe very long junk URLs; no stored source is that long (the admin
  // form caps it), so skip the round trip.
  const hit = path.length <= MAX_SOURCE_LENGTH ? await findRedirect(path) : null;
  if (!hit) notFound();
  if (hit.status_code === 301 || hit.status_code === 308) permanentRedirect(hit.destination);
  redirect(hit.destination);
}
