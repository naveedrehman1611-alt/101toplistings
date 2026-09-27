import { redirectOrNotFound } from '@/lib/redirects';

// Matches only URLs no other route claims, so the redirect lookup runs for
// would-be 404s and nothing else. Every other route keeps its ISR caching.
//
// Rendered per request: a cached result would keep serving an old redirect (or
// an old 404) after the table changes, and the lookup also counts the hit.
export const dynamic = 'force-dynamic';

export default async function MaybeRedirect({ params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  // Segments arrive percent-encoded, matching how sources are stored.
  await redirectOrNotFound(`/${path.join('/')}`);
}
