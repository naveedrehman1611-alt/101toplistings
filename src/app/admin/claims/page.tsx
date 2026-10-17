import { Fragment } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-server';
import { requireRole } from '@/lib/auth';
import { decideClaim } from '@/lib/moderation-actions';
import { CellText, ErrorNotice, PageHeader, Pill, ago, rowAct } from '@/components/admin/kit';
import { DataTable, type TableRow } from '@/components/admin/data-table';
import { ConfirmButton } from '@/components/admin/dialog';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Claims' };

type Row = {
  id: string;
  listing_id: string;
  claimant_id: string;
  message: string | null;
  evidence_url: string | null;
  status: string;
  created_at: string;
  listings: { name: string; slug: string; owner_user_id: string | null } | null;
  claimant: { display_name: string | null } | null;
};

type Shown = 'pending' | 'in_progress' | 'approved' | 'rejected';
const SHOWN_LABEL: Record<Shown, string> = {
  pending: 'Pending',
  in_progress: 'In progress',
  approved: 'Approved',
  rejected: 'Rejected',
};

function Decide({
  id,
  decision,
  className,
  children,
  confirm,
  fields,
}: {
  id: string;
  decision: 'approve' | 'in_progress' | 'reject';
  className: string;
  children: React.ReactNode;
  confirm?: { title: string; body: string; ok: string; danger?: boolean };
  fields?: React.ReactNode;
}) {
  return (
    <form action={decideClaim}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="show" value="all" />
      <input type="hidden" name="decision" value={decision} />
      {confirm ? (
        <ConfirmButton className={className} {...confirm} fields={fields}>
          {children}
        </ConfirmButton>
      ) : (
        <button type="submit" className={className}>
          {children}
        </button>
      )}
    </form>
  );
}

export default async function AdminClaims() {
  await requireRole('moderator');
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('claims')
    .select(
      // Two FKs point claims at profiles (claimant_id, handled_by), so the
      // embed has to name the one it means.
      'id, listing_id, claimant_id, message, evidence_url, status, created_at, listings(name, slug, owner_user_id), claimant:profiles!claims_claimant_id_fkey(display_name)',
    )
    .order('created_at', { ascending: false })
    .limit(300);
  const claims = (data ?? []) as unknown as Row[];

  const rows: TableRow[] = claims.map((c) => {
    const owner = c.listings?.owner_user_id ?? null;
    const open = c.status === 'new' || c.status === 'in_progress';
    // No outcome column: a resolved claim was approved exactly when its
    // claimant now owns the listing.
    const shown: Shown =
      c.status === 'new'
        ? 'pending'
        : c.status === 'in_progress'
          ? 'in_progress'
          : owner === c.claimant_id
            ? 'approved'
            : 'rejected';
    const ownedByOther = Boolean(owner && owner !== c.claimant_id);
    const listing = c.listings?.name ?? 'Deleted listing';
    const claimant = c.claimant?.display_name ?? 'Unnamed user';
    return {
      id: c.id,
      filter: shown,
      selectable: open,
      search: [listing, claimant, c.message].join(' '),
      sort: { listing, claimant, status: shown, date: c.created_at },
      cells: [
        <Fragment key="c17">
          {c.listings ? (
            <Link
              href={`/listing/${c.listings.slug}`}
              target="_blank"
              className="max-w-full truncate font-semibold text-[#062347] hover:text-[#1884E7] hover:no-underline"
            >
              {listing}
            </Link>
          ) : (
            <span className="font-semibold">{listing}</span>
          )}
          {open && ownedByOther ? (
            <div className="text-xs text-[#B91C1C]">Already managed by another account</div>
          ) : null}
        </Fragment>,
        <CellText key="c" sub={<code className="text-[11px]">{c.claimant_id.slice(0, 8)}</code>}>
          {claimant}
        </CellText>,
        <Fragment key="c718">
          <div className="line-clamp-2 max-w-full text-[13px] whitespace-pre-line">
            {c.message || '—'}
          </div>
          {c.evidence_url ? (
            <a
              href={c.evidence_url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="max-w-full truncate text-xs"
            >
              View proof ↗
            </a>
          ) : null}
        </Fragment>,
        <Pill key="s" tone={shown}>
          {SHOWN_LABEL[shown]}
        </Pill>,
        <CellText key="d">{ago(c.created_at)}</CellText>,
      ],
      actions: open ? (
        <>
          {!ownedByOther ? (
            <Decide
              id={c.id}
              decision="approve"
              className={rowAct.ok}
              confirm={{
                title: 'Approve claim?',
                body: `${claimant} will be able to manage ${listing} from their dashboard. Call the number they gave (ideally the one on the listing) first.`,
                ok: 'Approve claim',
              }}
              fields={
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="verify"
                    defaultChecked
                    className="size-4 accent-[#0E7A7C]"
                  />
                  Also mark the listing as Verified
                </label>
              }
            >
              Approve
            </Decide>
          ) : null}
          {c.status === 'new' ? (
            <Decide id={c.id} decision="in_progress" className={rowAct.base}>
              In progress
            </Decide>
          ) : null}
          <Decide
            id={c.id}
            decision="reject"
            className={rowAct.bad}
            confirm={{
              title: 'Reject this claim?',
              body: 'The listing stays with its current owner.',
              ok: 'Reject',
              danger: true,
            }}
          >
            Reject
          </Decide>
        </>
      ) : null,
    };
  });

  const n = (s: Shown) => rows.filter((r) => r.filter === s).length;

  return (
    <>
      <PageHeader
        title="Claims"
        description="Owners asking to manage a listing. Approving makes them its owner, so they can edit it from /dashboard."
      />
      {error ? <ErrorNotice>Could not load claims: {error.message}</ErrorNotice> : null}
      <DataTable
        columns={[
          { key: 'listing', label: 'Listing', width: 'minmax(200px,1.6fr)' },
          { key: 'claimant', label: 'Claimant' },
          { key: 'proof', label: 'Message & proof', width: 'minmax(200px,1.6fr)', sortable: false },
          { key: 'status', label: 'Status', width: '120px' },
          { key: 'date', label: 'Submitted', width: '110px' },
        ]}
        rows={rows}
        filters={[
          { value: 'all', label: 'All' },
          ...(['pending', 'in_progress', 'approved', 'rejected'] as Shown[]).map((s) => ({
            value: s,
            label: SHOWN_LABEL[s],
            count: n(s),
          })),
        ]}
        searchPlaceholder="Search listing or claimant…"
        actionsWidth="240px"
        bulk={[
          { label: 'Mark in progress', op: 'claim', arg: 'in_progress' },
          {
            label: 'Reject',
            tone: 'bad',
            op: 'claim',
            arg: 'reject',
            confirm: { title: 'Reject {n} claims?', ok: 'Reject', danger: true },
          },
        ]}
      />
    </>
  );
}
