import { createClient } from '@/lib/supabase-server';
import { requireRole } from '@/lib/auth';
import { saveRedirect } from '@/lib/seo-actions';
import {
  CellText,
  ErrorNotice,
  PageHeader,
  Pill,
  PreviewNotice,
  ago,
  rowAct,
} from '@/components/admin/kit';
import { DataTable, type TableRow } from '@/components/admin/data-table';
import { ModalForm } from '@/components/admin/dialog';
import { RedirectFields } from '@/components/admin/redirect-fields';

export const dynamic = 'force-dynamic';
export const metadata = { title: '404 log' };

type Row = { path: string; hits: number; last_seen: string };

/** Paths compare without a trailing slash, as the redirect lookup does. */
const norm = (p: string) => (p.length > 1 ? p.replace(/\/+$/, '') : p).toLowerCase();

export default async function Admin404Log() {
  await requireRole('admin');
  const supabase = await createClient();
  const [{ data, error }, { data: redirects }] = await Promise.all([
    supabase
      .from('not_found_log')
      .select('path, hits, last_seen')
      .order('hits', { ascending: false })
      .limit(500),
    supabase.from('redirects').select('source, destination'),
  ]);
  const target = new Map(
    (redirects ?? []).map((r) => [norm(r.source as string), r.destination as string]),
  );

  const rows: TableRow[] = ((data ?? []) as Row[]).map((n, i) => {
    const to = target.get(norm(n.path));
    const status = to ? 'redirected' : 'open';
    return {
      id: n.path,
      filter: status,
      selectable: false,
      search: `${n.path} ${to ?? ''}`,
      sort: { path: n.path, hits: n.hits, status, seen: n.last_seen },
      cells: [
        <code
          key="p"
          className="max-w-full truncate rounded bg-[#F1F5F9] px-1.5 py-0.5 font-mono text-[12.5px]"
        >
          {n.path}
        </code>,
        <CellText key="h" bold>
          {n.hits.toLocaleString('en-GB')}
        </CellText>,
        <CellText key="t">{to ? `→ ${to}` : '—'}</CellText>,
        <Pill key="s" tone={status}>
          {to ? 'Redirected' : 'Open'}
        </Pill>,
        <CellText key="d">{ago(n.last_seen)}</CellText>,
      ],
      actions: to ? null : (
        <ModalForm
          trigger="Create redirect"
          triggerClassName={rowAct.ok}
          title="Create redirect"
          body="Visitors to this broken URL will be sent to the new one."
          action={saveRedirect}
          ok="Save redirect"
        >
          <RedirectFields source={n.path} k={`nf${i}`} />
        </ModalForm>
      ),
    };
  });

  const open = rows.filter((r) => r.filter === 'open').length;

  return (
    <>
      <PageHeader
        title="404 log"
        isNew
        description="Broken URLs visitors hit, most-hit first. Turn them into redirects; the saved redirect then appears under Redirects."
      />
      {rows.length === 0 && !error ? (
        <PreviewNotice>
          Nothing records broken URLs into this log yet (migration 0016 leaves it out on purpose),
          so it stays empty until 404 logging is switched on. Create redirect works as soon as rows
          appear.
        </PreviewNotice>
      ) : null}
      {error ? <ErrorNotice>Could not load the 404 log: {error.message}</ErrorNotice> : null}
      <DataTable
        columns={[
          { key: 'path', label: 'Broken URL', width: 'minmax(240px,2fr)' },
          { key: 'hits', label: 'Hits', width: '90px' },
          { key: 'to', label: 'Redirects to', width: 'minmax(160px,1fr)', sortable: false },
          { key: 'status', label: 'Status', width: '130px' },
          { key: 'seen', label: 'Last seen', width: '110px' },
        ]}
        rows={rows}
        filters={[
          { value: 'all', label: 'All' },
          { value: 'open', label: 'Open', count: open },
          { value: 'redirected', label: 'Redirected', count: rows.length - open },
        ]}
        searchPlaceholder="Search paths…"
        actionsWidth="150px"
        emptyText="No broken URLs logged yet."
      />
    </>
  );
}
