import { cache } from 'react';

/**
 * How the site behaves when the database will not answer.
 *
 * The first time this mattered in production, Supabase restricted the project
 * for exceeding its egress quota. Every read started failing at once, and
 * because searchListings threw on error, the homepage returned a 500 and the
 * build could not even be exported — one exhausted quota took the whole site
 * down, navigation and all.
 *
 * So reads degrade instead of throwing. A failed collection read returns an
 * empty collection and records that it failed; the page still renders with its
 * header, navigation, footer and an honest notice. That distinction matters:
 * "no listings match" and "we cannot reach the database" look identical to a
 * visitor unless the page says which one happened, and an empty state shown
 * during an outage is a lie the reader will act on.
 *
 * Single-entity reads are the exception — see readOneOrThrow in queries.ts.
 * Answering "this business does not exist" while the database is merely
 * unreachable would let a real, indexed URL 404 itself out of the index.
 */

export type ReadFailure = { context: string; message: string };

/**
 * Per-request, not per-process: React's cache() gives each request its own
 * object, so one visitor's outage cannot leak into the next visitor's page.
 */
export const readFailures = cache((): ReadFailure[] => []);

/** True when any read in this request degraded. Pages use it to explain themselves. */
export function hasReadFailures(): boolean {
  return readFailures().length > 0;
}

/**
 * Records a failed read and returns the fallback the caller should use.
 * The real message goes to the server log, never to the page: Postgres and
 * platform errors carry column names, constraint names and billing detail.
 */
export function degrade<T>(context: string, error: { message: string } | null, fallback: T): T {
  if (error) {
    readFailures().push({ context, message: error.message });
    console.error(`[read:${context}] ${error.message}`);
  }
  return fallback;
}
