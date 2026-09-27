import Link from 'next/link';
import { createClient } from '@/lib/supabase-server';
import { requireUser } from '@/lib/auth';
import { removeFavourite } from '@/lib/favourite-actions';
import { Notice } from '@/components/admin-ui';

export const metadata = { title: 'My listings' };

/** A saved business; the listing is null once RLS hides it (no longer approved). */
type SavedRow = { listing_id: string; listings: { slug: string; name: string } | null };

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
  const [{ data }, favourites] = await Promise.all([
    supabase
      .from('listings')
      .select('id, slug, name, status, rejection_note, created_at')
      .eq('owner_user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('favourites')
      .select('listing_id, listings(slug, name)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50),
  ]);
  const listings = data ?? [];
  if (favourites.error) console.error('[favourites] dashboard read failed:', favourites.error);
  const saved = ((favourites.data ?? []) as unknown as SavedRow[]).flatMap((f) =>
    f.listings ? [{ id: f.listing_id, ...f.listings }] : [],
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">My listings</h1>
        <Link
          href="/dashboard/listings/new"
          className="bg-brand-700 hover:bg-brand-800 inline-flex h-10 items-center rounded-lg px-4 text-sm font-medium text-white"
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

      <section aria-labelledby="saved-heading" className="mt-12">
        <h2 id="saved-heading" className="text-xl font-semibold">
          Saved businesses
        </h2>
        {favourites.error ? (
          <p
            role="alert"
            className="mt-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            Your saved businesses could not be loaded right now. Please try again later.
          </p>
        ) : saved.length === 0 ? (
          <p className="mt-4 rounded-lg border border-dashed border-[var(--border)] p-8 text-center text-sm text-[var(--text-muted)]">
            You have not saved any businesses yet.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {saved.map((s) => (
              <li
                key={s.id}
                className="surface-card flex flex-wrap items-center justify-between gap-3 p-4"
              >
                <Link
                  href={`/listing/${s.slug}`}
                  className="hover:text-brand-700 font-medium hover:underline"
                >
                  {s.name}
                </Link>
                <form action={removeFavourite}>
                  <input type="hidden" name="listing_id" value={s.id} />
                  <button
                    type="submit"
                    aria-label={`Remove ${s.name} from saved businesses`}
                    className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm hover:bg-[var(--surface-2)]"
                  >
                    Remove
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
