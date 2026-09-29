import Link from 'next/link';
import { createClient } from '@/lib/supabase-server';
import { requireUser } from '@/lib/auth';
import { Notice } from '@/components/admin-ui';

export const metadata = { title: 'My listings' };

const STATUS_TEXT: Record<string, string> = {
  pending: 'Waiting for review',
  approved: 'Live',
  rejected: 'Not approved',
  suspended: 'Suspended',
  draft: 'Draft',
};

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const user = await requireUser('/dashboard');
  const sp = await searchParams;
  const supabase = await createClient();
  const savedRequest = getSavedListings(supabase, user.id);
  const { data } = await supabase
    .from('listings')
    .select('id, slug, name, status, rejection_note, created_at')
    .eq('owner_user_id', user.id)
    .order('created_at', { ascending: false });
  const listings = data ?? [];
  const saved = await savedRequest;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">My listings</h1>
        <Link
          href="/dashboard/listings/new"
          className="bg-primary-container font-label-md text-label-md text-on-primary hover:bg-primary focus-visible:ring-primary-container inline-flex h-10 items-center rounded-lg px-4 shadow-xs transition hover:shadow-[0_4px_12px_rgba(4,120,87,0.25)] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden"
        >
          Add your business
        </Link>
      </div>
      <Notice ok={sp.ok} error={sp.error} />

      {listings.length === 0 ? (
        <p className="mt-8 rounded-lg border border-dashed border-[var(--border)] p-8 text-center text-sm text-[var(--text-muted)]">
          You have not added a business yet. It is free, and every listing is checked by our team
          before it goes live.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {listings.map((l) => (
            <li
              key={l.id}
              className="surface-card flex flex-wrap items-center justify-between gap-3 p-4"
            >
              <div>
                <p className="font-medium">{l.name}</p>
                <p className="text-sm text-[var(--text-muted)]">
                  {STATUS_TEXT[l.status as string] ?? l.status}
                  {l.status === 'rejected' && l.rejection_note ? ` — ${l.rejection_note}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-3 text-sm">
                {l.status === 'approved' ? (
                  <Link href={`/listing/${l.slug}`} className="text-brand-700 hover:underline">
                    View
                  </Link>
                ) : null}
                <Link
                  href={`/dashboard/listings/${l.id}`}
                  className="rounded-lg border border-[var(--border)] px-3 py-1.5"
                >
                  Edit
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}

      <section className="mt-12">
        <h2 className="text-xl font-semibold">Saved listings</h2>
        {saved.length === 0 ? (
          <p className="mt-6 rounded-lg border border-dashed border-[var(--border)] p-8 text-center text-sm text-[var(--text-muted)]">
            Listings you save appear here.
          </p>
        ) : (
          <ul className="mt-6 space-y-3">
            {saved.map((l) => (
              <li
                key={l.id}
                className="surface-card flex flex-wrap items-center justify-between gap-3 p-4"
              >
                <div>
                  <p className="font-medium">{l.name}</p>
                  {l.tagline ? (
                    <p className="text-sm text-[var(--text-muted)]">{l.tagline}</p>
                  ) : null}
                </div>
                <Link
                  href={`/listing/${l.slug}`}
                  className="text-brand-700 text-sm hover:underline"
                >
                  View<span className="sr-only"> {l.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

type SavedListing = { id: string; slug: string; name: string; tagline: string | null };

/**
 * The visitor's favourites, newest first. RLS (favourites_own) returns only
 * their own rows; public_listings drops any listing that is no longer live, so
 * a saved listing that was suspended or removed simply stops showing here.
 */
async function getSavedListings(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<SavedListing[]> {
  const { data: favourites, error } = await supabase
    .from('favourites')
    .select('listing_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) console.error(`[supabase] favourites.byUser failed: ${error.message}`);
  const ids = (favourites ?? []).map((f) => f.listing_id as string);
  if (ids.length === 0) return [];

  const { data: rows, error: listingsError } = await supabase
    .from('public_listings')
    .select('id, slug, name, tagline')
    .in('id', ids);
  if (listingsError) {
    console.error(`[supabase] public_listings.saved failed: ${listingsError.message}`);
  }
  const byId = new Map(((rows ?? []) as SavedListing[]).map((l) => [l.id, l]));
  return ids.flatMap((id) => byId.get(id) ?? []);
}
