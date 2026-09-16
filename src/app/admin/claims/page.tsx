import Link from 'next/link';
import type { Metadata } from 'next';
import { requireRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
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
import { EmptyState } from '@/components/ui';
import { setClaimStatus } from './actions';

export const metadata: Metadata = { title: 'Claims' };

const PER_PAGE = 25;
const BASE = '/admin/claims';

const STATUSES = ['new', 'in_progress', 'resolved', 'spam'] as const;
type ClaimStatus = (typeof STATUSES)[number];

const LABELS: Record<ClaimStatus, string> = {
  new: 'New',
  in_progress: 'In progress',
  resolved: 'Resolved',
  spam: 'Spam',
};

const ERRORS: Record<string, string> = {
  bad_input: 'That request was missing a claim or a status, so nothing changed.',
  not_found: 'That claim no longer exists.',
  save_failed: 'The claim could not be updated. Try again.',
};

type ClaimRow = {
  id: string;
  listing_id: string;
  claimant_id: string;
  message: string | null;
  evidence_url: string | null;
  status: string;
  handled_at: string | null;
  created_at: string;
};

function parseStatus(raw: string | undefined): ClaimStatus {
  return (STATUSES as readonly string[]).includes(raw ?? '') ? (raw as ClaimStatus) : 'new';
}

function parsePage(raw: string | undefined): number {
  const n = Number.parseInt(raw ?? '1', 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/**
 * evidence_url is whatever the claimant typed. It is rendered as a link only
 * when it really is http(s) — that is what keeps a `javascript:` or `data:`
 * URL out of an href — and never with target="_blank", so a moderator chooses
 * when to visit it rather than the page opening it for them. The full address is
 * shown as text so it can be judged before it is clicked.
 */
function Evidence({ url }: { url: string | null }) {
  if (!url) return <span className="text-[var(--text-muted)]">—</span>;

  let safe: string | null = null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') safe = parsed.toString();
  } catch {
    safe = null;
  }

  if (!safe) {
    return (
      <span className="block max-w-56 break-all text-[var(--text-muted)]">
        Not a usable web address: {url}
      </span>
    );
  }

  return (
    <a
      href={safe}
      rel="noopener noreferrer nofollow external"
      className="text-brand-700 block max-w-56 break-all hover:underline"
    >
      {safe}
    </a>
  );
}

export default async function ClaimsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string; err?: string }>;
}) {
  await requireRole('moderator', BASE);
  const sp = await searchParams;

  const status = parseStatus(sp.status);
  const page = parsePage(sp.page);
  const from = (page - 1) * PER_PAGE;

  const supabase = await createClient();

  const counts = await Promise.all(
    STATUSES.map(async (value) => {
      const { count } = await supabase
        .from('claims')
        .select('id', { count: 'exact', head: true })
        .eq('status', value);
      return { value, count: count ?? 0 };
    }),
  );

  const { data, count } = await supabase
    .from('claims')
    .select('id, listing_id, claimant_id, message, evidence_url, status, handled_at, created_at', {
      count: 'exact',
    })
    .eq('status', status)
    .order('created_at', { ascending: false })
    .range(from, from + PER_PAGE - 1);

  const rows = (data ?? []) as ClaimRow[];
  const total = count ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PER_PAGE));

  const listingIds = [...new Set(rows.map((r) => r.listing_id))];
  const claimantIds = [...new Set(rows.map((r) => r.claimant_id))];

  const listingsResult = listingIds.length
    ? await supabase.from('listings').select('id, slug, name').in('id', listingIds)
    : { data: [] };
  const profilesResult = claimantIds.length
    ? await supabase.from('profiles').select('id, display_name').in('id', claimantIds)
    : { data: [] };

  const listings = new Map(
    ((listingsResult.data ?? []) as { id: string; slug: string; name: string }[]).map((l) => [
      l.id,
      l,
    ]),
  );
  const claimants = new Map(
    ((profilesResult.data ?? []) as { id: string; display_name: string | null }[]).map((p) => [
      p.id,
      p.display_name,
    ]),
  );

  const returnTo = `${BASE}?status=${status}${page > 1 ? `&page=${page}` : ''}`;
  const error = sp.err ? ERRORS[sp.err] : undefined;

  return (
    <>
      <PageHeader
        title="Claims"
        description="Business owners asserting ownership of an existing listing. Check the evidence before resolving one."
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
        options={counts.map((c) => ({ value: c.value, label: LABELS[c.value], count: c.count }))}
      />

      {rows.length === 0 ? (
        <EmptyState
          title="No claims here"
          body="Nothing currently has this status. Claims arrive from the listing pages."
        />
      ) : (
        <TableShell>
          <thead>
            <tr>
              <Th>Listing</Th>
              <Th>Claimant</Th>
              <Th>Message</Th>
              <Th>Evidence</Th>
              <Th>Status</Th>
              <Th>Decision</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const listing = listings.get(row.listing_id);
              return (
                <tr key={row.id} className="align-top">
                  <Td>
                    {listing ? (
                      <Link
                        href={`/listing/${listing.slug}`}
                        className="text-brand-700 font-medium hover:underline"
                      >
                        {listing.name}
                      </Link>
                    ) : (
                      <span className="text-[var(--text-muted)]">Unknown listing</span>
                    )}
                    <span className="mt-0.5 block text-xs text-[var(--text-muted)]">
                      {formatDate(row.created_at)}
                    </span>
                  </Td>
                  <Td>
                    <span className="font-medium">
                      {claimants.get(row.claimant_id) ?? 'Unnamed account'}
                    </span>
                    <span className="mt-0.5 block font-mono text-xs text-[var(--text-muted)]">
                      {row.claimant_id.slice(0, 8)}
                    </span>
                  </Td>
                  {/* Claimant-written text: escaped children only. */}
                  <Td className="max-w-80 min-w-56">
                    <span className="block text-sm whitespace-pre-line">
                      {row.message ?? <span className="text-[var(--text-muted)]">No message</span>}
                    </span>
                  </Td>
                  <Td>
                    <Evidence url={row.evidence_url} />
                  </Td>
                  <Td>
                    <StatusPill status={row.status} />
                    {row.handled_at ? (
                      <span className="mt-1 block text-xs text-[var(--text-muted)]">
                        {formatDate(row.handled_at)}
                      </span>
                    ) : null}
                  </Td>
                  <Td>
                    <form action={setClaimStatus} className="flex flex-wrap gap-1.5">
                      <input type="hidden" name="id" value={row.id} />
                      <input type="hidden" name="returnTo" value={returnTo} />
                      {STATUSES.filter((s) => s !== row.status).map((s) => (
                        <AdminButton
                          key={s}
                          type="submit"
                          name="status"
                          value={s}
                          variant={
                            s === 'resolved' ? 'primary' : s === 'spam' ? 'danger' : 'secondary'
                          }
                        >
                          {LABELS[s]}
                        </AdminButton>
                      ))}
                    </form>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </TableShell>
      )}

      <Card className="p-4 text-xs text-[var(--text-muted)]">
        Resolving a claim records the decision and who made it; it does not transfer the listing.
        Assign the owner on the listing itself.
      </Card>

      <Pager
        basePath={BASE}
        query={{ status, page: page > 1 ? String(page) : undefined }}
        page={page}
        pageCount={pageCount}
      />
    </>
  );
}
