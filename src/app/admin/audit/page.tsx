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
import { Input, Select } from '@/components/form';
import { EmptyState } from '@/components/ui';

export const metadata: Metadata = { title: 'Audit log' };

const PER_PAGE = 25;
const BASE = '/admin/audit';

/**
 * The entity types the back office writes. audit_logs.entity_type is free text,
 * so this is a curated list for the tabs rather than a constraint — a row with an
 * unlisted type is still visible under "All".
 */
const ENTITY_TYPES = [
  'listing',
  'review',
  'claim',
  'form_submission',
  'category',
  'country',
  'region',
  'city',
  'area',
  'profile',
] as const;

const ENTITY_LABELS: Record<string, string> = {
  listing: 'Listings',
  review: 'Reviews',
  claim: 'Claims',
  form_submission: 'Inbox',
  category: 'Categories',
  country: 'Countries',
  region: 'Regions',
  city: 'Cities',
  area: 'Areas',
  profile: 'Profiles',
};

type AuditRow = {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  before: unknown;
  after: unknown;
  created_at: string;
};

function parseEntityType(raw: string | undefined): string {
  return (ENTITY_TYPES as readonly string[]).includes(raw ?? '') ? (raw as string) : '';
}

function parsePage(raw: string | undefined): number {
  const n = Number.parseInt(raw ?? '1', 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

/** Only an exact YYYY-MM-DD is accepted; anything else is treated as no filter. */
function parseDate(raw: string | undefined): string | null {
  if (!raw || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  const parsed = new Date(`${raw}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? null : raw;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  });
}

/** Compact, readable, and still just text by the time React renders it. */
function snapshot(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const json = JSON.stringify(value, null, 1);
  return json.length > 4000 ? `${json.slice(0, 4000)}…` : json;
}

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{
    entity_type?: string;
    actor?: string;
    from?: string;
    to?: string;
    page?: string;
  }>;
}) {
  // audit_logs_staff_read (0008) requires 'admin', so anything less would render
  // an empty table and look like "nothing ever happened" instead of "not for you".
  await requireRole('admin', BASE);
  const sp = await searchParams;

  const entityType = parseEntityType(sp.entity_type);
  const fromDate = parseDate(sp.from);
  const toDate = parseDate(sp.to);
  const page = parsePage(sp.page);
  const offset = (page - 1) * PER_PAGE;

  const supabase = await createClient();

  const { data: staffData } = await supabase
    .from('profiles')
    .select('id, display_name, role')
    .in('role', ['moderator', 'editor', 'admin', 'super_admin'])
    .order('display_name', { ascending: true });
  const staff = (staffData ?? []) as { id: string; display_name: string | null; role: string }[];
  const actorId = staff.some((p) => p.id === sp.actor) ? (sp.actor as string) : '';
  const actorNames = new Map(staff.map((p) => [p.id, p.display_name]));

  // The actor and date filters scope the tab counts too, so a count always
  // describes the list the tab would actually show.
  const since = fromDate ? `${fromDate}T00:00:00.000Z` : null;
  const until = toDate ? `${toDate}T23:59:59.999Z` : null;

  const tabs = [
    { value: '', label: 'All' },
    ...ENTITY_TYPES.map((t) => ({ value: t, label: ENTITY_LABELS[t] })),
  ];

  const counts = await Promise.all(
    tabs.map(async (option) => {
      let q = supabase.from('audit_logs').select('id', { count: 'exact', head: true });
      if (actorId) q = q.eq('actor_id', actorId);
      if (since) q = q.gte('created_at', since);
      if (until) q = q.lte('created_at', until);
      if (option.value) q = q.eq('entity_type', option.value);
      const { count } = await q;
      return { ...option, count: count ?? 0 };
    }),
  );

  let rowsQuery = supabase
    .from('audit_logs')
    .select('id, actor_id, action, entity_type, entity_id, before, after, created_at', {
      count: 'exact',
    });
  if (actorId) rowsQuery = rowsQuery.eq('actor_id', actorId);
  if (since) rowsQuery = rowsQuery.gte('created_at', since);
  if (until) rowsQuery = rowsQuery.lte('created_at', until);
  if (entityType) rowsQuery = rowsQuery.eq('entity_type', entityType);

  const { data, count } = await rowsQuery
    .order('created_at', { ascending: false })
    .range(offset, offset + PER_PAGE - 1);

  const rows = (data ?? []) as AuditRow[];
  const total = count ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PER_PAGE));

  const query = {
    entity_type: entityType || undefined,
    actor: actorId || undefined,
    from: fromDate ?? undefined,
    to: toDate ?? undefined,
    page: page > 1 ? String(page) : undefined,
  };

  return (
    <>
      <PageHeader
        title="Audit log"
        description="Every back-office write, newest first, with the before and after values. Append-only: nothing here can be edited or removed."
      />

      {/* Tabs rebuild the URL from scratch, so switching entity type clears the
          actor and date filters below. */}
      <FilterTabs basePath={BASE} param="entity_type" current={entityType} options={counts} />

      <Card className="p-4">
        <form method="get" action={BASE} className="flex flex-wrap items-end gap-4">
          <input type="hidden" name="entity_type" value={entityType} />
          <Select
            name="actor"
            label="Actor"
            placeholder="Anyone"
            defaultValue={actorId}
            className="min-w-52"
            options={staff.map((p) => ({
              value: p.id,
              label: `${p.display_name ?? 'Unnamed'} · ${p.role}`,
            }))}
          />
          <Input name="from" label="From" type="date" defaultValue={fromDate ?? ''} />
          <Input name="to" label="To" type="date" defaultValue={toDate ?? ''} />
          <AdminButton type="submit" variant="secondary">
            Apply
          </AdminButton>
          <AdminButton href={BASE} variant="secondary">
            Reset
          </AdminButton>
        </form>
      </Card>

      {rows.length === 0 ? (
        <EmptyState
          title="No entries"
          body="Nothing matches these filters. Widen the date range or clear the actor."
        />
      ) : (
        <TableShell>
          <thead>
            <tr>
              <Th>When</Th>
              <Th>Actor</Th>
              <Th>Action</Th>
              <Th>Entity</Th>
              <Th>Change</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const before = snapshot(row.before);
              const after = snapshot(row.after);
              return (
                <tr key={row.id} className="align-top">
                  <Td className="text-xs whitespace-nowrap tabular-nums">
                    {formatDateTime(row.created_at)}
                  </Td>
                  <Td className="text-sm">
                    {row.actor_id ? (
                      (actorNames.get(row.actor_id) ?? (
                        <span className="font-mono text-xs">{row.actor_id.slice(0, 8)}</span>
                      ))
                    ) : (
                      <span className="text-[var(--text-muted)]">System</span>
                    )}
                  </Td>
                  <Td>
                    <StatusPill status={row.action} />
                  </Td>
                  <Td className="text-sm">
                    {ENTITY_LABELS[row.entity_type] ?? row.entity_type}
                    {row.entity_id ? (
                      <span className="mt-0.5 block font-mono text-xs text-[var(--text-muted)]">
                        {row.entity_id.slice(0, 8)}
                      </span>
                    ) : null}
                  </Td>
                  <Td className="max-w-96 min-w-64">
                    {before === null && after === null ? (
                      <span className="text-xs text-[var(--text-muted)]">No snapshot recorded</span>
                    ) : (
                      <details>
                        <summary className="text-brand-700 cursor-pointer text-xs font-medium">
                          Before and after
                        </summary>
                        <div className="mt-2 grid gap-2">
                          {before !== null ? (
                            <pre className="overflow-x-auto rounded-lg bg-[var(--surface-2)] p-2 text-[11px] leading-snug">
                              {before}
                            </pre>
                          ) : null}
                          {after !== null ? (
                            <pre className="overflow-x-auto rounded-lg bg-[var(--surface-2)] p-2 text-[11px] leading-snug">
                              {after}
                            </pre>
                          ) : null}
                        </div>
                      </details>
                    )}
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </TableShell>
      )}

      <Pager basePath={BASE} query={query} page={page} pageCount={pageCount} />
    </>
  );
}
