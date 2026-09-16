import Link from 'next/link';
import { requireRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { EmptyState } from '@/components/ui';
import {
  AdminButton,
  Card,
  FilterTabs,
  PageHeader,
  Pager,
  StatusPill,
  TableShell,
  Td,
  Th,
} from '@/components/admin/chrome';
import { approveListing, restoreListing, suspendListing, rejectListing } from './actions';

/**
 * The moderation queue.
 *
 * Read with createClient() — the admin's own JWT — rather than the anonymous
 * client in @/lib/supabase, because listings_public_read only exposes
 * status = 'approved'. A queue that cannot see pending rows is not a queue.
 *
 * No `export const revalidate` here: /admin is dynamic by construction (see the
 * note in admin/layout.tsx).
 */

const PAGE_SIZE = 20;

const STATUSES = ['draft', 'pending', 'approved', 'rejected', 'suspended'] as const;
type Status = (typeof STATUSES)[number];

function isStatus(value: string): value is Status {
  return (STATUSES as readonly string[]).includes(value);
}

type Row = {
  id: string;
  slug: string;
  name: string;
  status: string;
  rating_average: number | null;
  review_count: number;
  updated_at: string;
  category: { name: string } | null;
  city: { name: string } | null;
  country: { name: string } | null;
};

/** `%` and `_` are ilike wildcards; a searched name must not become a pattern. */
function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (match) => `\\${match}`);
}

/**
 * `<form action>` and `formAction` are typed as void-returning, but the
 * moderation actions return a state object for useActionState callers. This
 * adapter is the bridge; each wrapped action still re-checks the role itself.
 */
async function moderateFromQueue(
  kind: 'approve' | 'reject' | 'suspend' | 'restore',
  formData: FormData,
): Promise<void> {
  'use server';
  if (kind === 'approve') await approveListing(formData);
  else if (kind === 'reject') await rejectListing(formData);
  else if (kind === 'suspend') await suspendListing(formData);
  else await restoreListing(formData);
}

export default async function AdminListingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireRole('moderator');
  const params = await searchParams;

  const first = (key: string): string => {
    const value = params[key];
    return (Array.isArray(value) ? value[0] : value) ?? '';
  };

  const statusParam = first('status');
  const status: Status | 'all' = isStatus(statusParam) ? statusParam : 'all';
  const q = first('q').trim().slice(0, 80);
  const page = Math.max(1, Number.parseInt(first('page'), 10) || 1);
  const savedId = first('saved');

  const supabase = await createClient();

  // Two FKs point at categories, so the embeds carry the `!column` hint.
  let query = supabase
    .from('listings')
    .select(
      'id, slug, name, status, rating_average, review_count, updated_at, ' +
        'category:categories!category_id (name), city:cities!city_id (name), ' +
        'country:countries!country_id (name)',
      { count: 'exact' },
    )
    .order('updated_at', { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  if (status !== 'all') query = query.eq('status', status);
  if (q) query = query.ilike('name', `%${escapeLike(q)}%`);

  // Counts drive the tabs. head:true asks PostgREST for the count only, so these
  // five round trips carry no rows; they run together rather than in sequence.
  const countFor = (value: Status | 'all') => {
    let counter = supabase.from('listings').select('id', { count: 'exact', head: true });
    if (value !== 'all') counter = counter.eq('status', value);
    if (q) counter = counter.ilike('name', `%${escapeLike(q)}%`);
    return counter;
  };

  const [listResult, all, draft, pending, approved, rejected, suspended] = await Promise.all([
    query,
    countFor('all'),
    countFor('draft'),
    countFor('pending'),
    countFor('approved'),
    countFor('rejected'),
    countFor('suspended'),
  ]);

  const rows = (listResult.data ?? []) as unknown as Row[];
  const total = listResult.count ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const tabs = [
    { value: '', label: 'All', count: all.count ?? 0 },
    { value: 'pending', label: 'Pending', count: pending.count ?? 0 },
    { value: 'draft', label: 'Draft', count: draft.count ?? 0 },
    { value: 'approved', label: 'Approved', count: approved.count ?? 0 },
    { value: 'rejected', label: 'Rejected', count: rejected.count ?? 0 },
    { value: 'suspended', label: 'Suspended', count: suspended.count ?? 0 },
  ];

  return (
    <>
      <PageHeader
        title="Listings"
        description="Create, edit and moderate every business on RankYouSite."
        action={<AdminButton href="/admin/listings/new">New listing</AdminButton>}
      />

      {savedId ? (
        <output className="rounded-lg border border-[#c4e0d0] bg-[#e6f2eb] px-4 py-3 text-sm text-[#15633c]">
          Listing saved.{' '}
          <Link href={`/admin/listings/${savedId}/edit`} className="font-medium underline">
            Open it again
          </Link>
        </output>
      ) : null}

      <div className="flex flex-col gap-4">
        <FilterTabs
          basePath="/admin/listings"
          current={status === 'all' ? '' : status}
          options={tabs}
        />

        {/* GET, so the search is bookmarkable and needs no JavaScript. The
            status carries across as a hidden field or the filter would reset. */}
        <form method="get" action="/admin/listings" className="flex flex-wrap gap-2">
          {status !== 'all' ? <input type="hidden" name="status" value={status} /> : null}
          <label htmlFor="listing-search" className="sr-only">
            Search listings by name
          </label>
          <input
            id="listing-search"
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search by name…"
            className="h-9 min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-base sm:max-w-xs sm:text-sm"
          />
          <AdminButton type="submit" variant="secondary">
            Search
          </AdminButton>
          {q ? (
            <AdminButton
              href={status === 'all' ? '/admin/listings' : `/admin/listings?status=${status}`}
              variant="secondary"
            >
              Clear
            </AdminButton>
          ) : null}
        </form>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="Nothing here"
          body={
            q
              ? `No listing matches “${q}” in this view.`
              : 'No listing has this status yet. New submissions arrive as pending.'
          }
          action={<AdminButton href="/admin/listings/new">New listing</AdminButton>}
        />
      ) : (
        <TableShell>
          <thead>
            <tr>
              <Th>Name</Th>
              <Th>Category</Th>
              <Th>Location</Th>
              <Th>Status</Th>
              <Th className="text-right">Rating</Th>
              <Th>Updated</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <Td>
                  <Link
                    href={`/admin/listings/${row.id}/edit`}
                    className="text-brand-700 font-medium hover:underline"
                  >
                    {row.name}
                  </Link>
                  <span className="block text-xs text-[var(--text-muted)]">/{row.slug}</span>
                </Td>
                <Td className="text-[var(--text-muted)]">{row.category?.name ?? '—'}</Td>
                <Td className="text-[var(--text-muted)]">
                  {[row.city?.name, row.country?.name].filter(Boolean).join(', ') || '—'}
                </Td>
                <Td>
                  <StatusPill status={row.status} />
                </Td>
                <Td className="text-right tabular-nums">
                  {/* review_count 0 means there is no rating to show, not 0.0. */}
                  {row.review_count > 0 && row.rating_average !== null
                    ? `${row.rating_average.toFixed(1)} (${row.review_count})`
                    : '—'}
                </Td>
                <Td className="whitespace-nowrap text-[var(--text-muted)]">
                  {new Date(row.updated_at).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </Td>
                <Td>
                  <div className="flex flex-wrap items-center justify-end gap-1.5">
                    <AdminButton href={`/admin/listings/${row.id}/edit`} variant="secondary">
                      Edit
                    </AdminButton>
                    <RowActions id={row.id} status={row.status} />
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      )}

      <Pager
        basePath="/admin/listings"
        query={{ status: status === 'all' ? undefined : status, q: q || undefined }}
        page={page}
        pageCount={pageCount}
      />

      <Card className="p-4 text-xs text-[var(--text-muted)]">
        Showing {rows.length} of {total} listing{total === 1 ? '' : 's'}. Approving a listing
        publishes it immediately and refreshes the home page, the directory, its category and its
        city.
      </Card>
    </>
  );
}

/**
 * One small form per row. Rejecting demands a reason, so the reason input is
 * `required` and the non-reject buttons opt out with formNoValidate — the
 * browser then blocks only the submit that actually needs it, and the action
 * re-checks the reason server-side regardless.
 */
function RowActions({ id, status }: { id: string; status: string }) {
  const canApprove = status === 'pending' || status === 'draft' || status === 'rejected';
  const canReject = status === 'pending' || status === 'approved' || status === 'draft';
  const canSuspend = status === 'approved';
  const canRestore = status === 'rejected' || status === 'suspended';

  // The form's own action is the one an implicit submit (Enter in the reason
  // box) should perform; every button then names its action explicitly.
  const primary = canApprove ? 'approve' : canReject ? 'reject' : 'restore';

  return (
    <form
      action={moderateFromQueue.bind(null, primary)}
      className="flex flex-wrap items-center justify-end gap-1.5"
    >
      <input type="hidden" name="id" value={id} />

      {canReject ? (
        <>
          <label htmlFor={`reason-${id}`} className="sr-only">
            Reason for rejecting
          </label>
          <input
            id={`reason-${id}`}
            name="rejection_note"
            type="text"
            required
            minLength={4}
            maxLength={1000}
            placeholder="Reason to reject"
            className="h-9 w-36 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 text-sm"
          />
        </>
      ) : null}

      {canApprove ? (
        <button
          type="submit"
          formNoValidate
          formAction={moderateFromQueue.bind(null, 'approve')}
          className="focus-visible:outline-brand-700 bg-brand-700 hover:bg-brand-800 inline-flex h-9 items-center rounded-lg px-3 text-sm font-medium text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Approve
        </button>
      ) : null}

      {canReject ? (
        <button
          type="submit"
          formAction={moderateFromQueue.bind(null, 'reject')}
          className="inline-flex h-9 items-center rounded-lg border border-[#ecc2be] bg-[#fbeceb] px-3 text-sm font-medium text-[#96231b] transition-colors hover:bg-[#f7dedc]"
        >
          Reject
        </button>
      ) : null}

      {canSuspend ? (
        <button
          type="submit"
          formNoValidate
          formAction={moderateFromQueue.bind(null, 'suspend')}
          className="inline-flex h-9 items-center rounded-lg border border-[var(--border)] px-3 text-sm font-medium transition-colors hover:bg-[var(--surface-2)]"
        >
          Suspend
        </button>
      ) : null}

      {canRestore ? (
        <button
          type="submit"
          formNoValidate
          formAction={moderateFromQueue.bind(null, 'restore')}
          className="inline-flex h-9 items-center rounded-lg border border-[var(--border)] px-3 text-sm font-medium transition-colors hover:bg-[var(--surface-2)]"
        >
          Restore
        </button>
      ) : null}
    </form>
  );
}
