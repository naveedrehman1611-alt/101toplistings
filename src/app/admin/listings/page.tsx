import Link from 'next/link';
import { createClient } from '@/lib/supabase-server';
import { requireRole } from '@/lib/auth';
import { setListingStatus } from '@/lib/admin-actions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Listings' };

const STATUSES = ['all', 'pending', 'approved', 'rejected', 'suspended', 'draft'] as const;

export default async function AdminListings({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  await requireRole('moderator');
  const sp = await searchParams;
  const status = STATUSES.includes(sp.status as (typeof STATUSES)[number])
    ? (sp.status as string)
    : 'all';
  const q = sp.q?.trim() ?? '';

  const supabase = await createClient();
  // Reads `listings`, not `public_listings`: moderation needs the rows the
  // public view deliberately hides, and the internal status columns with them.
  let query = supabase
    .from('listings')
    .select('id, slug, name, status, verification, city_id, created_at')
    .order('created_at', { ascending: false })
    .limit(50);

  if (status !== 'all') query = query.eq('status', status);
  if (q) query = query.ilike('name', `%${q}%`);

  const { data: listings, error } = await query;
  const { data: cities } = await supabase.from('cities').select('id, name');
  const cityName = new Map((cities ?? []).map((c) => [c.id, c.name as string]));

  return (
    <div>
      <h1 className="text-2xl font-semibold">Listings</h1>

      <form className="mt-4 flex flex-wrap gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search by name"
          aria-label="Search listings"
          className="h-10 flex-1 rounded-lg border border-[var(--border)] px-3 text-sm outline-none focus:border-brand-500"
        />
        <input type="hidden" name="status" value={status} />
        <button
          type="submit"
          className="h-10 rounded-lg bg-brand-700 px-4 text-sm font-medium text-white"
        >
          Search
        </button>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/listings?status=${s}${q ? `&q=${encodeURIComponent(q)}` : ''}`}
            className={`rounded-lg border px-3 py-1.5 text-sm ${
              status === s
                ? 'border-brand-500 bg-brand-50 text-brand-800'
                : 'border-[var(--border)] hover:bg-[var(--surface-2)]'
            }`}
          >
            {s}
          </Link>
        ))}
      </div>

      {error ? (
        <p role="alert" className="mt-6 text-sm text-red-700">
          Could not load listings: {error.message}
        </p>
      ) : null}

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[40rem] text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-left">
              <th className="py-2 font-medium">Business</th>
              <th className="py-2 font-medium">City</th>
              <th className="py-2 font-medium">Status</th>
              <th className="py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(listings ?? []).map((l) => (
              <tr key={l.id} className="border-b border-[var(--border)] last:border-0">
                <td className="py-3">
                  <Link href={`/listing/${l.slug}`} className="font-medium hover:text-brand-700">
                    {l.name}
                  </Link>
                  {l.verification === 'verified' ? (
                    <span className="ml-2 text-xs text-brand-700">verified</span>
                  ) : null}
                </td>
                <td className="py-3 text-[var(--text-muted)]">
                  {cityName.get(l.city_id as string) ?? '—'}
                </td>
                <td className="py-3">{l.status}</td>
                <td className="py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {l.status !== 'approved' ? (
                      <form
                        action={async () => {
                          'use server';
                          await setListingStatus(l.id as string, 'approved');
                        }}
                      >
                        <button
                          type="submit"
                          className="rounded-lg bg-brand-700 px-2.5 py-1 text-xs font-medium text-white"
                        >
                          Approve
                        </button>
                      </form>
                    ) : null}
                    {l.status !== 'rejected' ? (
                      <form
                        action={async () => {
                          'use server';
                          await setListingStatus(l.id as string, 'rejected');
                        }}
                      >
                        <button
                          type="submit"
                          className="rounded-lg border border-[var(--border)] px-2.5 py-1 text-xs"
                        >
                          Reject
                        </button>
                      </form>
                    ) : null}
                    {l.status === 'approved' ? (
                      <form
                        action={async () => {
                          'use server';
                          await setListingStatus(l.id as string, 'suspended');
                        }}
                      >
                        <button
                          type="submit"
                          className="rounded-lg border border-[var(--border)] px-2.5 py-1 text-xs"
                        >
                          Suspend
                        </button>
                      </form>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(listings ?? []).length === 0 ? (
          <p className="mt-6 text-sm text-[var(--text-muted)]">
            Nothing matches this filter.
          </p>
        ) : null}
      </div>
    </div>
  );
}
