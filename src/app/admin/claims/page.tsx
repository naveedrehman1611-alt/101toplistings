import Link from 'next/link';
import { createClient } from '@/lib/supabase-server';
import { requireRole } from '@/lib/auth';
import { decideClaim } from '@/lib/moderation-actions';
import { Notice } from '@/components/admin-ui';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Claims' };

const FILTERS = ['open', 'resolved', 'all'] as const;

type Row = {
  id: string;
  listing_id: string;
  claimant_id: string;
  message: string | null;
  evidence_url: string | null;
  status: string;
  created_at: string;
  handled_at: string | null;
  listings: { name: string; slug: string; owner_user_id: string | null } | null;
  claimant: { display_name: string | null } | null;
};

export default async function AdminClaims({
  searchParams,
}: {
  searchParams: Promise<{ show?: string; ok?: string; error?: string }>;
}) {
  await requireRole('moderator');
  const sp = await searchParams;
  const show = FILTERS.includes(sp.show as (typeof FILTERS)[number]) ? sp.show! : 'open';

  const supabase = await createClient();
  let q = supabase
    .from('claims')
    .select(
      // Two FKs point claims at profiles (claimant_id, handled_by), so the
      // embed has to name the one it means.
      'id, listing_id, claimant_id, message, evidence_url, status, created_at, handled_at, listings(name, slug, owner_user_id), claimant:profiles!claims_claimant_id_fkey(display_name)',
    )
    .order('created_at', { ascending: false })
    .limit(100);
  if (show === 'open') q = q.in('status', ['new', 'in_progress']);
  else if (show === 'resolved') q = q.in('status', ['resolved', 'spam']);
  const { data, error } = await q;
  const claims = (data ?? []) as unknown as Row[];

  return (
    <div>
      <h1 className="text-2xl font-semibold">Claims</h1>
      <p className="mt-2 text-sm text-[var(--text-muted)]">
        People asking to manage an existing listing. Call the number they gave (ideally the one on
        the listing) before approving. Approving makes them the listing&apos;s owner, so they can
        edit it from their dashboard.
      </p>
      <Notice ok={sp.ok} error={sp.error ?? error?.message} />

      <div className="mt-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={`/admin/claims?show=${f}`}
            className={`rounded-lg border px-3 py-1.5 text-sm capitalize ${
              show === f
                ? 'border-brand-500 bg-brand-50 text-brand-800'
                : 'border-[var(--border)] hover:bg-[var(--surface-2)]'
            }`}
          >
            {f}
          </Link>
        ))}
      </div>

      <ul className="mt-6 space-y-4">
        {claims.map((c) => {
          const owner = c.listings?.owner_user_id ?? null;
          const open = c.status === 'new' || c.status === 'in_progress';
          // No outcome column: a resolved claim was approved exactly when its
          // claimant now owns the listing.
          const outcome = open ? null : owner === c.claimant_id ? 'Approved' : 'Rejected';
          const ownedByOther = Boolean(owner && owner !== c.claimant_id);
          return (
            <li key={c.id} className="surface-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">
                  {c.listings ? (
                    <Link href={`/listing/${c.listings.slug}`} className="hover:text-brand-700">
                      {c.listings.name}
                    </Link>
                  ) : (
                    'Deleted listing'
                  )}
                </p>
                <span className="text-xs text-[var(--text-muted)]">
                  {new Date(c.created_at).toLocaleString('en-GB')} ·{' '}
                  {outcome ?? c.status.replace('_', ' ')}
                </span>
              </div>
              <p className="mt-1 text-sm">
                Claimed by{' '}
                <span className="font-medium">{c.claimant?.display_name ?? 'Unnamed user'}</span>{' '}
                <span className="font-mono text-xs text-[var(--text-muted)]">
                  {c.claimant_id.slice(0, 8)}
                </span>
              </p>
              {c.message ? <p className="mt-2 text-sm whitespace-pre-line">{c.message}</p> : null}
              {c.evidence_url ? (
                <p className="mt-2 text-sm">
                  Proof:{' '}
                  <a
                    href={c.evidence_url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="text-brand-700 break-all hover:underline"
                  >
                    {c.evidence_url}
                  </a>
                </p>
              ) : null}
              {open && ownedByOther ? (
                <p className="mt-2 text-sm text-red-800">
                  This listing is already managed by another account.
                </p>
              ) : null}

              {open ? (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {!ownedByOther ? (
                    <form action={decideClaim} className="flex flex-wrap items-center gap-2">
                      <input type="hidden" name="id" value={c.id} />
                      <input type="hidden" name="show" value={show} />
                      <input type="hidden" name="decision" value="approve" />
                      <button
                        type="submit"
                        className="bg-brand-700 hover:bg-brand-800 rounded-lg px-3 py-1 text-xs font-medium text-white"
                      >
                        Approve
                      </button>
                      <label className="flex items-center gap-1.5 text-xs">
                        <input type="checkbox" name="verify" defaultChecked className="size-3.5" />
                        Also mark Verified
                      </label>
                    </form>
                  ) : null}
                  {c.status === 'new' ? (
                    <DecisionButton id={c.id} show={show} decision="in_progress">
                      In progress
                    </DecisionButton>
                  ) : null}
                  <DecisionButton id={c.id} show={show} decision="reject">
                    Reject
                  </DecisionButton>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
      {claims.length === 0 ? (
        <p className="mt-6 text-sm text-[var(--text-muted)]">Nothing here.</p>
      ) : null}
    </div>
  );
}

function DecisionButton({
  id,
  show,
  decision,
  children,
}: {
  id: string;
  show: string;
  decision: string;
  children: React.ReactNode;
}) {
  return (
    <form action={decideClaim}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="show" value={show} />
      <input type="hidden" name="decision" value={decision} />
      <button
        type="submit"
        className={`rounded-lg border px-2.5 py-1 text-xs ${
          decision === 'reject'
            ? 'border-red-300 text-red-800 hover:bg-red-50'
            : 'border-[var(--border)] hover:bg-[var(--surface-2)]'
        }`}
      >
        {children}
      </button>
    </form>
  );
}
