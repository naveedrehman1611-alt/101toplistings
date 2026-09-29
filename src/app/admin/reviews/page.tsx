import Link from 'next/link';
import { createClient } from '@/lib/supabase-server';
import { requireRole } from '@/lib/auth';
import { moderateReview } from '@/lib/moderation-actions';
import { Notice } from '@/components/admin-ui';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Reviews' };

const FILTERS = ['pending', 'approved', 'rejected', 'flagged', 'all'] as const;

export default async function AdminReviews({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; ok?: string; error?: string }>;
}) {
  await requireRole('moderator');
  const sp = await searchParams;
  const status = FILTERS.includes(sp.status as (typeof FILTERS)[number]) ? sp.status! : 'pending';
  const back = `/admin/reviews?status=${status}`;

  const supabase = await createClient();
  let q = supabase
    .from('reviews')
    .select(
      'id, rating, title, body, author_name, status, reply_body, created_at, listings(name, slug)',
    )
    .order('created_at', { ascending: false })
    .limit(100);
  if (status !== 'all') q = q.eq('status', status);
  const { data, error } = await q;

  return (
    <div>
      <h1 className="text-2xl font-semibold">Reviews</h1>
      <p className="mt-2 text-sm text-[var(--text-muted)]">
        New reviews wait here and only count toward a business’s rating once approved.
      </p>
      <Notice ok={sp.ok} error={sp.error ?? error?.message} />

      <div className="mt-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={`/admin/reviews?status=${f}`}
            className={`rounded-lg border px-3 py-1.5 text-sm ${
              status === f
                ? 'border-brand-500 bg-brand-50 text-brand-800'
                : 'border-[var(--border)] hover:bg-[var(--surface-2)]'
            }`}
          >
            {f}
          </Link>
        ))}
      </div>

      <ul className="mt-6 space-y-4">
        {(data ?? []).map((r) => {
          const listing = r.listings as unknown as { name: string; slug: string } | null;
          return (
            <li key={r.id} className="surface-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm">
                  <span className="text-badge-gold">{'★'.repeat(r.rating as number)}</span>{' '}
                  {listing ? (
                    <Link
                      href={`/listing/${listing.slug}`}
                      className="hover:text-brand-700 font-medium"
                    >
                      {listing.name}
                    </Link>
                  ) : null}
                </p>
                <span className="text-xs text-[var(--text-muted)]">
                  {r.author_name ?? 'Visitor'} ·{' '}
                  {new Date(r.created_at as string).toLocaleDateString('en-GB')} · {r.status}
                </span>
              </div>
              {r.title ? <p className="mt-2 font-medium">{r.title}</p> : null}
              {r.body ? <p className="mt-1 text-sm whitespace-pre-line">{r.body}</p> : null}

              <div className="mt-3 flex flex-wrap gap-2">
                {(['approve', 'reject', 'delete'] as const)
                  .filter(
                    (d) =>
                      !(d === 'approve' && r.status === 'approved') &&
                      !(d === 'reject' && r.status === 'rejected'),
                  )
                  .map((d) => (
                    <form key={d} action={moderateReview}>
                      <input type="hidden" name="id" value={r.id as string} />
                      <input type="hidden" name="decision" value={d} />
                      <input type="hidden" name="back" value={back} />
                      <button
                        type="submit"
                        className={
                          d === 'approve'
                            ? 'bg-primary-container text-on-primary rounded-lg px-2.5 py-1 text-xs font-medium'
                            : d === 'delete'
                              ? 'border-error/30 text-on-error-container rounded-lg border px-2.5 py-1 text-xs'
                              : 'rounded-lg border border-[var(--border)] px-2.5 py-1 text-xs'
                        }
                      >
                        {d[0].toUpperCase() + d.slice(1)}
                      </button>
                    </form>
                  ))}
              </div>

              <form action={moderateReview} className="mt-3 flex flex-wrap gap-2">
                <input type="hidden" name="id" value={r.id as string} />
                <input type="hidden" name="decision" value="reply" />
                <input type="hidden" name="back" value={back} />
                <input
                  name="reply_body"
                  defaultValue={(r.reply_body as string | null) ?? ''}
                  placeholder="Public reply (optional)"
                  aria-label="Reply"
                  className="h-9 min-w-0 flex-1 rounded-lg border border-[var(--border)] px-3 text-sm"
                />
                <button
                  type="submit"
                  className="h-9 rounded-lg border border-[var(--border)] px-3 text-xs"
                >
                  Save reply
                </button>
              </form>
            </li>
          );
        })}
      </ul>
      {(data ?? []).length === 0 ? (
        <p className="mt-6 text-sm text-[var(--text-muted)]">Nothing here.</p>
      ) : null}
    </div>
  );
}
