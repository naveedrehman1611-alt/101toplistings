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
