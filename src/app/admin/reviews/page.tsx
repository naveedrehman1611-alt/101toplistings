import Link from 'next/link';
import type { Metadata } from 'next';
import { requireRole } from '@/lib/auth';
import { hasMinRole } from '@/lib/roles';
import { createClient } from '@/lib/supabase/server';
import {
  Card,
  FilterTabs,
  PageHeader,
  Pager,
  StatusPill,
  AdminButton,
} from '@/components/admin/chrome';
import { EmptyState } from '@/components/ui';
import { deleteReview, moderateReview, updateReviewReply } from './actions';

export const metadata: Metadata = { title: 'Reviews' };

const PER_PAGE = 25;
const BASE = '/admin/reviews';

const STATUSES = ['pending', 'approved', 'rejected', 'flagged'] as const;
type ReviewStatus = (typeof STATUSES)[number];

/**
 * Wording for the codes the actions redirect back with. Only these strings are
 * ever rendered, so a hand-crafted ?err= cannot put text of its own on screen,
 * and a Postgres message never reaches an operator.
 */
const ERRORS: Record<string, string> = {
  bad_input: 'That request was missing a review or a status, so nothing changed.',
  not_found: 'That review no longer exists — someone else may have deleted it.',
  save_failed: 'The change could not be saved. Try again.',
  delete_failed: 'The review could not be deleted. Try again.',
  reply_too_long: 'Replies are limited to 2000 characters.',
};

type ReviewRow = {
  id: string;
  listing_id: string;
  author_id: string | null;
  author_name: string | null;
  author_email: string | null;
  rating: number;
  title: string | null;
  body: string | null;
  status: string;
  reply_body: string | null;
  replied_at: string | null;
  moderated_at: string | null;
  created_at: string;
};

function parseStatus(raw: string | undefined): ReviewStatus {
  return (STATUSES as readonly string[]).includes(raw ?? '') ? (raw as ReviewStatus) : 'pending';
}

function parsePage(raw: string | undefined): number {
  const n = Number.parseInt(raw ?? '1', 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

/** Fixed timezone so the server-rendered string is stable. */
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function Stars({ rating }: { rating: number }) {
  const value = Math.max(1, Math.min(5, rating));
  return (
    <span className="text-accent-500 text-sm" aria-label={`${value} out of 5`}>
      <span aria-hidden>{'★'.repeat(value)}</span>
      <span aria-hidden className="text-ink-300">
        {'★'.repeat(5 - value)}
      </span>
    </span>
  );
}

/**
 * The single most important distinction on this page.
 *
 * 0015 pins the two identities apart with a check constraint: a review carries
 * EITHER an author_id (a real account) OR an author_name (a visitor who typed a
 * name into a public form), never both. A moderator has to read those two rows
 * very differently — one is attributable, the other is not — so they are given
 * different labels, different colours and different contents rather than being
 * flattened into one "author" column.
 *
 * author_email is shown here and only here: it is the one contact route back to
 * an anonymous reviewer, and the public review query never selects it.
 */
function Reviewer({ row, profileName }: { row: ReviewRow; profileName: string | null }) {
  if (row.author_id) {
    return (
      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3">
        <span className="bg-brand-50 text-brand-700 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
          Account holder
        </span>
        <p className="mt-1.5 text-sm font-medium">{profileName ?? 'Deleted profile'}</p>
        <p className="text-xs text-[var(--text-muted)]">
          Signed in when the review was left; one review per account per listing.
        </p>
      </div>
    );
  }

  return (
    <div className="border-accent-400/50 bg-accent-400/10 rounded-lg border p-3">
      <span className="bg-accent-400/20 text-accent-600 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
        No account
      </span>
      <p className="mt-1.5 text-sm font-medium">{row.author_name ?? 'Unnamed visitor'}</p>
      <p className="text-xs text-[var(--text-muted)]">
        Left through the public form — the name is self-declared and unverified.
      </p>
      {row.author_email ? (
        <p className="mt-1.5 text-xs break-all text-[var(--text-muted)]">
          <span className="font-medium text-[var(--text)]">{row.author_email}</span>
          <span className="block">Moderation only — never rendered on the public site.</span>
        </p>
      ) : (
        <p className="mt-1.5 text-xs text-[var(--text-muted)]">No contact address given.</p>
      )}
    </div>
  );
}

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string; err?: string }>;
}) {
  // The layout gates this subtree too; re-reading it here keeps the page honest
  // about who is allowed to see moderation-only fields such as author_email.
  const actor = await requireRole('moderator', BASE);
  const sp = await searchParams;

  const status = parseStatus(sp.status);
  const page = parsePage(sp.page);
  const from = (page - 1) * PER_PAGE;

  const supabase = await createClient();

  // Live counts for the tabs: head-only, so Postgres returns a count and no rows.
  const counts = await Promise.all(
    STATUSES.map(async (value) => {
      const { count } = await supabase
        .from('reviews')
        .select('id', { count: 'exact', head: true })
        .eq('status', value);
      return { value, count: count ?? 0 };
    }),
  );

  const { data, count } = await supabase
    .from('reviews')
    .select(
      'id, listing_id, author_id, author_name, author_email, rating, title, body, status, reply_body, replied_at, moderated_at, created_at',
      { count: 'exact' },
    )
    .eq('status', status)
    .order('created_at', { ascending: false })
    .range(from, from + PER_PAGE - 1);

  const rows = (data ?? []) as ReviewRow[];
  const total = count ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PER_PAGE));

  // Separate lookups rather than embedded selects: reviews has three foreign keys
  // into profiles (author, reply_by, moderated_by), so an embed would have to be
  // disambiguated by constraint name for no gain over two small `in` queries.
  const listingIds = [...new Set(rows.map((r) => r.listing_id))];
  const authorIds = [...new Set(rows.map((r) => r.author_id).filter((id): id is string => !!id))];

  const listingsResult = listingIds.length
    ? await supabase.from('listings').select('id, slug, name').in('id', listingIds)
    : { data: [] };
  const profilesResult = authorIds.length
    ? await supabase.from('profiles').select('id, display_name').in('id', authorIds)
    : { data: [] };

  const listings = new Map(
    ((listingsResult.data ?? []) as { id: string; slug: string; name: string }[]).map((l) => [
      l.id,
      l,
    ]),
  );
  const profiles = new Map(
    ((profilesResult.data ?? []) as { id: string; display_name: string | null }[]).map((p) => [
      p.id,
      p.display_name,
    ]),
  );

  const query = { status, page: page > 1 ? String(page) : undefined };
  const returnTo = `${BASE}?status=${status}${page > 1 ? `&page=${page}` : ''}`;
  const error = sp.err ? ERRORS[sp.err] : undefined;
  // deleteReview re-checks for 'admin' itself; hiding the control from everyone
  // else is UX, not the boundary.
  const canDelete = hasMinRole(actor.role, 'admin');

  return (
    <>
      <PageHeader
        title="Reviews"
        description="Nothing a visitor writes reaches the public site until it is approved here. Approving recalculates the listing rating."
      />

      {error ? (
        <p
          role="alert"
          className="rounded-[var(--radius-card)] border border-[#ecc2be] bg-[#fbeceb] px-4 py-3 text-sm text-[#96231b]"
        >
          {error}
        </p>
      ) : null}

      <FilterTabs
        basePath={BASE}
        current={status}
        options={counts.map((c) => ({
          value: c.value,
          label: c.value === 'pending' ? 'Pending' : c.value.replace(/^./, (m) => m.toUpperCase()),
          count: c.count,
        }))}
      />

      {rows.length === 0 ? (
        <EmptyState
          title="Nothing in this queue"
          body={
            status === 'pending'
              ? 'No review is waiting for a decision. New submissions land here automatically.'
              : 'No review currently has this status.'
          }
        />
      ) : (
        <div className="flex flex-col gap-4">
          {rows.map((row) => {
            const listing = listings.get(row.listing_id);
            return (
              <Card key={row.id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    {listing ? (
                      <Link
                        href={`/listing/${listing.slug}`}
                        className="text-brand-700 font-medium hover:underline"
                      >
                        {listing.name}
                      </Link>
                    ) : (
                      <span className="font-medium text-[var(--text-muted)]">Unknown listing</span>
                    )}
                    <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                      Submitted {formatDate(row.created_at)}
                      {row.moderated_at ? ` · last moderated ${formatDate(row.moderated_at)}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Stars rating={row.rating} />
                    <StatusPill status={row.status} />
                  </div>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,1fr)_16rem]">
                  <div className="min-w-0">
                    {row.title ? <p className="font-medium">{row.title}</p> : null}
                    {/* Public text: rendered as escaped children, never as HTML. */}
                    <p className="mt-1 text-sm whitespace-pre-line text-[var(--text)]">
                      {row.body ?? <span className="text-[var(--text-muted)]">No body text.</span>}
                    </p>
                  </div>
                  <Reviewer row={row} profileName={profiles.get(row.author_id ?? '') ?? null} />
                </div>

                <form
                  action={updateReviewReply}
                  className="mt-4 border-t border-[var(--border)] pt-4"
                >
                  <input type="hidden" name="id" value={row.id} />
                  <input type="hidden" name="returnTo" value={returnTo} />
                  <label
                    htmlFor={`reply-${row.id}`}
                    className="text-xs font-semibold tracking-wide text-[var(--text-muted)] uppercase"
                  >
                    Reply as the business
                  </label>
                  <textarea
                    id={`reply-${row.id}`}
                    name="reply_body"
                    rows={2}
                    maxLength={2000}
                    defaultValue={row.reply_body ?? ''}
                    placeholder="Published under the review once the review is approved. Leave empty to remove."
                    className="placeholder:text-ink-400 focus:outline-brand-700 mt-1.5 min-h-16 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-base text-[var(--text)] focus:outline-2 focus:outline-offset-2 sm:text-sm"
                  />
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <span className="text-xs text-[var(--text-muted)]">
                      {row.replied_at ? `Replied ${formatDate(row.replied_at)}` : 'No reply yet'}
                    </span>
                    <AdminButton type="submit" variant="secondary">
                      Save reply
                    </AdminButton>
                  </div>
                </form>

                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[var(--border)] pt-4">
                  <form action={moderateReview} className="flex flex-wrap gap-2">
                    <input type="hidden" name="id" value={row.id} />
                    <input type="hidden" name="returnTo" value={returnTo} />
                    {row.status !== 'approved' ? (
                      <AdminButton type="submit" name="status" value="approved">
                        Approve
                      </AdminButton>
                    ) : null}
                    {row.status !== 'rejected' ? (
                      <AdminButton type="submit" name="status" value="rejected" variant="secondary">
                        Reject
                      </AdminButton>
                    ) : null}
                    {row.status !== 'flagged' ? (
                      <AdminButton type="submit" name="status" value="flagged" variant="secondary">
                        Flag
                      </AdminButton>
                    ) : null}
                    {row.status !== 'pending' ? (
                      <AdminButton type="submit" name="status" value="pending" variant="secondary">
                        Back to pending
                      </AdminButton>
                    ) : null}
                  </form>

                  {canDelete ? (
                    <details className="ml-auto">
                      <summary className="cursor-pointer text-sm font-medium text-[#96231b]">
                        Delete
                      </summary>
                      <form action={deleteReview} className="mt-2 flex items-center gap-2">
                        <input type="hidden" name="id" value={row.id} />
                        <input type="hidden" name="returnTo" value={returnTo} />
                        <span className="text-xs text-[var(--text-muted)]">
                          Permanent. Rejecting keeps the record instead.
                        </span>
                        <AdminButton type="submit" variant="danger">
                          Delete for good
                        </AdminButton>
                      </form>
                    </details>
                  ) : null}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Pager basePath={BASE} query={query} page={page} pageCount={pageCount} />
    </>
  );
}
