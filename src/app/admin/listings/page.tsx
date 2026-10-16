import Link from 'next/link';
import { createClient } from '@/lib/supabase-server';
import { requireRole, roleAtLeast } from '@/lib/auth';
import { bulkListingAction } from '@/lib/listing-bulk-actions';
import { Notice } from '@/components/admin-ui';
import { BulkControls, SelectAll } from '@/components/admin/bulk-select';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Listings' };

const STATUSES = ['all', 'pending', 'approved', 'rejected', 'suspended', 'draft'] as const;
const PAGE_SIZES = [50, 100, 200] as const;
const BULK_FORM = 'bulk-listings';

const STATUS_STYLE: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-900',
  approved: 'bg-brand-50 text-brand-800',
  rejected: 'bg-red-100 text-red-900',
  suspended: 'bg-zinc-200 text-zinc-800',
  draft: 'bg-zinc-100 text-zinc-700',
};

export default async function AdminListings({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    q?: string;
    page?: string;
    size?: string;
    ok?: string;
    error?: string;
  }>;
}) {
  const user = await requireRole('moderator');
  const canDelete = roleAtLeast(user.role, 'admin');
  const sp = await searchParams;
  const status = STATUSES.includes(sp.status as (typeof STATUSES)[number])
    ? (sp.status as string)
    : 'all';
  const q = sp.q?.trim() ?? '';
  const size = PAGE_SIZES.find((s) => String(s) === sp.size) ?? PAGE_SIZES[0];
  const page = Math.max(1, Number.parseInt(sp.page ?? '1', 10) || 1);

  /** This page's URL with some parameters changed; ok/error are always dropped. */
  const href = (change: Record<string, string | number | null>) => {
    const params = new URLSearchParams();
    const merged: Record<string, string | number | null> = {
      status: status === 'all' ? null : status,
      q: q || null,
      size: size === PAGE_SIZES[0] ? null : size,
      page: page > 1 ? page : null,
      ...change,
    };
    for (const [k, v] of Object.entries(merged))
      if (v !== null && v !== '') params.set(k, String(v));
    const qs = params.toString();
    return `/admin/listings${qs ? `?${qs}` : ''}`;
  };
  const here = href({});

  const supabase = await createClient();
  // Reads `listings`, not `public_listings`: moderation needs the rows the
  // public view deliberately hides, and the internal status columns with them.
  let query = supabase
    .from('listings')
    .select(
      'id, slug, name, status, verification, is_featured, owner_user_id, created_at, cities(name)',
      {
        count: 'exact',
      },
    )
    .order('created_at', { ascending: false })
    .order('id')
    .range((page - 1) * size, page * size - 1);

  if (status !== 'all') query = query.eq('status', status);
  if (q) query = query.ilike('name', `%${q}%`);

  const { data: listings, error, count } = await query;
  const total = count ?? 0;
  const pages = Math.max(1, Math.ceil(total / size));
  const exportHref = `/admin/listings/export?${new URLSearchParams({
    ...(status !== 'all' ? { status } : {}),
    ...(q ? { q } : {}),
  }).toString()}`;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Listings</h1>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/listings/import"
            className="inline-flex h-10 items-center rounded-lg border border-[var(--border)] px-4 text-sm font-medium hover:bg-[var(--surface-2)]"
          >
            Import CSV
          </Link>
          {/* A plain download link: next/link would prefetch, and so build, the file. */}
          <a
            href={exportHref}
            className="inline-flex h-10 items-center rounded-lg border border-[var(--border)] px-4 text-sm font-medium hover:bg-[var(--surface-2)]"
          >
            Export CSV
          </a>
          <Link
            href="/admin/listings/new"
            className="bg-primary-container text-on-primary hover:bg-primary inline-flex h-10 items-center rounded-lg px-4 text-sm font-medium"
          >
            Add listing
          </Link>
        </div>
      </div>
      <Notice ok={sp.ok} error={sp.error} />

      <form className="mt-4 flex flex-wrap gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search by name"
          aria-label="Search listings"
          className="focus:border-primary-container focus:ring-primary-container/20 h-10 flex-1 rounded-lg border border-[var(--border)] px-3 text-sm outline-hidden focus:ring-2"
        />
        {status !== 'all' ? <input type="hidden" name="status" value={status} /> : null}
        <select
          name="size"
          defaultValue={String(size)}
          aria-label="Listings per page"
          className="h-10 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm"
        >
          {PAGE_SIZES.map((s) => (
            <option key={s} value={s}>
              {s} per page
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="bg-primary-container text-on-primary h-10 rounded-lg px-4 text-sm font-medium"
        >
          Search
        </button>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={href({ status: s === 'all' ? null : s, page: null })}
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
        <p role="alert" className="text-error mt-6 text-sm">
          Could not load listings: {error.message}
        </p>
      ) : null}

      {/* The bulk form holds no table markup: the row checkboxes join it with
          form="bulk-listings", so the per-row forms below are never nested. */}
      <form
        id={BULK_FORM}
        action={bulkListingAction}
        className="surface-card mt-6 flex flex-wrap items-center justify-between gap-3 p-3"
      >
        <input type="hidden" name="back" value={here} />
        <BulkControls formId={BULK_FORM} canDelete={canDelete} />
        <p className="text-sm text-[var(--text-muted)]">
          {total} listing{total === 1 ? '' : 's'}
        </p>
      </form>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[48rem] text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-left">
              <th className="w-8 py-2">
                <SelectAll formId={BULK_FORM} />
              </th>
              <th className="py-2 font-medium">Business</th>
              <th className="py-2 font-medium">City</th>
              <th className="py-2 font-medium">Status</th>
              <th className="py-2 font-medium">Submitted</th>
              <th className="py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(listings ?? []).map((l) => {
              const id = l.id as string;
              const city = l.cities as unknown as { name: string } | null;
              return (
                <tr key={id} className="border-b border-[var(--border)] align-top last:border-0">
                  <td className="py-3">
                    <input
                      type="checkbox"
                      name="ids"
                      value={id}
                      form={BULK_FORM}
                      aria-label={`Select ${l.name}`}
                      className="size-4 accent-[var(--color-primary-container)]"
                    />
                  </td>
                  <td className="py-3">
                    <Link
                      href={`/admin/listings/${id}`}
                      className="hover:text-brand-700 font-medium"
                    >
                      {l.name}
                    </Link>
                    <span className="ml-2 text-xs text-[var(--text-muted)]">
                      {[
                        l.verification === 'verified' ? 'verified' : null,
                        l.is_featured ? 'featured' : null,
                        l.owner_user_id ? 'owner submitted' : null,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                  </td>
                  <td className="py-3 text-[var(--text-muted)]">{city?.name ?? '—'}</td>
                  <td className="py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[l.status as string] ?? ''}`}
                    >
                      {l.status}
                    </span>
                  </td>
                  <td className="py-3 whitespace-nowrap text-[var(--text-muted)]">
                    {new Date(l.created_at as string).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="py-3">
                    <div className="flex flex-wrap items-start gap-1.5">
                      {l.status !== 'approved' ? (
                        <RowAction id={id} back={here} op="approve" primary>
                          Approve
                        </RowAction>
                      ) : null}
                      {l.status !== 'rejected' ? (
                        <details className="group">
                          <summary className="cursor-pointer list-none rounded-lg border border-[var(--border)] px-2.5 py-1 text-xs">
                            Reject
                          </summary>
                          <form action={bulkListingAction} className="mt-1.5 flex gap-1.5">
                            <input type="hidden" name="ids" value={id} />
                            <input type="hidden" name="op" value="reject" />
                            <input type="hidden" name="back" value={here} />
                            <input
                              name="reason"
                              required
                              maxLength={1000}
                              placeholder="Reason for the owner"
                              aria-label={`Reason for rejecting ${l.name}`}
                              className="h-8 w-48 rounded-lg border border-[var(--border)] px-2 text-xs"
                            />
                            <button
                              type="submit"
                              className="rounded-lg border border-red-300 px-2.5 text-xs text-red-800"
                            >
                              Send
                            </button>
                          </form>
                        </details>
                      ) : null}
                      {l.status === 'approved' ? (
                        <RowAction id={id} back={here} op="suspend">
                          Suspend
                        </RowAction>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {(listings ?? []).length === 0 ? (
          <p className="mt-6 text-sm text-[var(--text-muted)]">Nothing matches this filter.</p>
        ) : null}
      </div>

      {pages > 1 ? (
        <nav aria-label="Pages" className="mt-6 flex items-center justify-between gap-3 text-sm">
          {page > 1 ? (
            <Link
              href={href({ page: page - 1 })}
              className="rounded-lg border border-[var(--border)] px-3 py-1.5"
            >
              ← Previous
            </Link>
          ) : (
            <span />
          )}
          <span className="text-[var(--text-muted)]">
            Page {page} of {pages}
          </span>
          {page < pages ? (
            <Link
              href={href({ page: page + 1 })}
              className="rounded-lg border border-[var(--border)] px-3 py-1.5"
            >
              Next →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      ) : null}
    </div>
  );
}

function RowAction({
  id,
  back,
  op,
  primary,
  children,
}: {
  id: string;
  back: string;
  op: string;
  primary?: boolean;
  children: React.ReactNode;
}) {
  return (
    <form action={bulkListingAction}>
      <input type="hidden" name="ids" value={id} />
      <input type="hidden" name="op" value={op} />
      <input type="hidden" name="back" value={back} />
      <button
        type="submit"
        className={
          primary
            ? 'bg-primary-container text-on-primary rounded-lg px-2.5 py-1 text-xs font-medium'
            : 'rounded-lg border border-[var(--border)] px-2.5 py-1 text-xs'
        }
      >
        {children}
      </button>
    </form>
  );
}
