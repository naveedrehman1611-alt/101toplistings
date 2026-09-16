import Link from 'next/link';
import { requireRole } from '@/lib/auth';
import { hasMinRole } from '@/lib/roles';
import { createClient } from '@/lib/supabase/server';
import { Card, PageHeader, StatTile, TableShell, Td, Th } from '@/components/admin/chrome';

/**
 * The overview is a triage screen, not a report: every number on it is either
 * zero (nothing to do) or a link into the queue that will clear it.
 *
 * Counts are read through the request-scoped client, i.e. as the signed-in
 * staff member, so RLS hands back drafts, pending reviews and the inbox that an
 * anonymous read would never see. `head: true` means Postgres returns the count
 * without shipping any rows.
 */

type Actor = { display_name: string | null };

type AuditRow = {
  id: string;
  action: string;
  entity_type: string;
  created_at: string;
  // PostgREST returns an object for this to-one embed, but supabase-js types an
  // un-generated schema's embeds as arrays — accept both and normalise.
  actor: Actor | Actor[] | null;
};

function actorName(actor: AuditRow['actor']): string {
  const row = Array.isArray(actor) ? actor[0] : actor;
  return row?.display_name?.trim() || 'System';
}

function formatWhen(iso: string): string {
  // Fixed locale + UTC: the server and the client must format this identically
  // or React reports a hydration mismatch on a page that is rendered per request.
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  }).format(new Date(iso));
}

export default async function AdminOverviewPage() {
  // The layout already gated this subtree; re-asking is free (getCurrentUser is
  // cache()d for the render pass) and keeps the page honest on its own terms.
  const user = await requireRole('moderator');
  const supabase = await createClient();

  const rows = (table: string) => supabase.from(table).select('id', { count: 'exact', head: true });

  const [
    draft,
    pending,
    approved,
    rejected,
    suspended,
    reviewsPending,
    reviewsFlagged,
    claimsNew,
    submissionsNew,
    submissionsSpam,
    mediaTotal,
    mediaNoAlt,
  ] = await Promise.all([
    rows('listings').eq('status', 'draft'),
    rows('listings').eq('status', 'pending'),
    rows('listings').eq('status', 'approved'),
    rows('listings').eq('status', 'rejected'),
    rows('listings').eq('status', 'suspended'),
    rows('reviews').eq('status', 'pending'),
    rows('reviews').eq('status', 'flagged'),
    rows('claims').eq('status', 'new'),
    rows('form_submissions').eq('status', 'new'),
    rows('form_submissions').eq('status', 'new').eq('is_spam', true),
    rows('media'),
    // Whitespace-only alt text is as useless to a screen reader as none at all.
    rows('media').or('alt.is.null,alt.eq.'),
  ]);

  const n = (result: { count: number | null }) => result.count ?? 0;
  const pendingListings = n(pending);

  // audit_logs_staff_read (0008) requires 'admin'. A moderator asking anyway
  // gets an empty array, which is indistinguishable from "nothing happened yet"
  // — so do not ask, and say why the panel is empty instead.
  const canReadAudit = hasMinRole(user.role, 'admin');
  let audit: AuditRow[] = [];
  if (canReadAudit) {
    const { data } = await supabase
      .from('audit_logs')
      // reviews/listings give profiles several foreign keys, so the embed names
      // the constraint rather than letting PostgREST guess.
      .select(
        'id, action, entity_type, created_at, actor:profiles!audit_logs_actor_id_fkey(display_name)',
      )
      .order('created_at', { ascending: false })
      .limit(10);
    audit = (data ?? []) as AuditRow[];
  }

  return (
    <>
      <PageHeader title="Overview" description="What is waiting on a moderator right now." />

      {pendingListings > 0 ? (
        <Card className="border-accent-400 bg-accent-400/10 p-4">
          <p className="text-sm font-medium">
            <Link href="/admin/listings?status=pending" className="text-brand-700 hover:underline">
              {pendingListings} {pendingListings === 1 ? 'listing is' : 'listings are'} waiting for
              approval →
            </Link>
          </p>
        </Card>
      ) : null}

      <section>
        <h2 className="text-sm font-semibold tracking-wide text-[var(--text-muted)] uppercase">
          Listings
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <StatTile
            label="Pending"
            value={pendingListings}
            href="/admin/listings?status=pending"
            urgent
          />
          <StatTile label="Draft" value={n(draft)} href="/admin/listings?status=draft" />
          <StatTile label="Approved" value={n(approved)} href="/admin/listings?status=approved" />
          <StatTile label="Rejected" value={n(rejected)} href="/admin/listings?status=rejected" />
          <StatTile
            label="Suspended"
            value={n(suspended)}
            href="/admin/listings?status=suspended"
          />
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold tracking-wide text-[var(--text-muted)] uppercase">
          Queues
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <StatTile
            label="Reviews pending"
            value={n(reviewsPending)}
            href="/admin/reviews?status=pending"
            urgent
          />
          <StatTile
            label="Reviews flagged"
            value={n(reviewsFlagged)}
            href="/admin/reviews?status=flagged"
            urgent
          />
          <StatTile
            label="New claims"
            value={n(claimsNew)}
            href="/admin/claims?status=new"
            urgent
          />
          <StatTile
            label="New messages"
            value={n(submissionsNew)}
            href="/admin/submissions?status=new"
            urgent
          />
        </div>
        <p className="mt-2 text-xs text-[var(--text-muted)]">
          {n(submissionsSpam)} of the new messages {n(submissionsSpam) === 1 ? 'is' : 'are'} marked
          as spam.
        </p>
      </section>

      <section>
        <h2 className="text-sm font-semibold tracking-wide text-[var(--text-muted)] uppercase">
          Media
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <StatTile label="Files" value={n(mediaTotal)} href="/admin/media" />
          <StatTile label="Missing alt text" value={n(mediaNoAlt)} href="/admin/media" urgent />
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold tracking-wide text-[var(--text-muted)] uppercase">
          Recent activity
        </h2>
        <div className="mt-3">
          {!canReadAudit ? (
            <Card className="p-4">
              <p className="text-sm text-[var(--text-muted)]">
                The audit log is visible to administrators only. Everything else on this page is
                available to you.
              </p>
            </Card>
          ) : audit.length === 0 ? (
            <Card className="p-4">
              <p className="text-sm text-[var(--text-muted)]">Nothing has been logged yet.</p>
            </Card>
          ) : (
            <TableShell>
              <thead>
                <tr>
                  <Th>Who</Th>
                  <Th>Action</Th>
                  <Th>Entity</Th>
                  <Th>When</Th>
                </tr>
              </thead>
              <tbody>
                {audit.map((entry) => (
                  <tr key={entry.id}>
                    <Td>{actorName(entry.actor)}</Td>
                    <Td className="capitalize">{entry.action.replace(/_/g, ' ')}</Td>
                    <Td className="text-[var(--text-muted)]">{entry.entity_type}</Td>
                    <Td className="whitespace-nowrap text-[var(--text-muted)] tabular-nums">
                      {formatWhen(entry.created_at)}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </TableShell>
          )}
        </div>
      </section>
    </>
  );
}
