import { createClient } from '@/lib/supabase-server';
import { requireRole } from '@/lib/auth';
import { AUDIT_SELECT, describeAudit, type AuditRow } from '@/lib/admin-activity';
import { CellText, ErrorNotice, PageHeader, Pill, ago, label } from '@/components/admin/kit';
import { DataTable, type TableRow } from '@/components/admin/data-table';
import { ExportCsvButton } from '@/components/admin/export-button';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Audit log' };

const LIMIT = 1000;
const AREAS = ['listing', 'review', 'content', 'user', 'settings'] as const;

export default async function AdminAuditLog() {
  await requireRole('admin');
  const supabase = await createClient();
  const [{ data, error }, { count }] = await Promise.all([
    supabase
      .from('audit_logs')
      .select(AUDIT_SELECT)
      .order('created_at', { ascending: false })
      .limit(LIMIT),
    supabase.from('audit_logs').select('id', { count: 'exact', head: true }),
  ]);
  const entries = ((data ?? []) as unknown as AuditRow[]).map((r) => ({ r, d: describeAudit(r) }));

  const rows: TableRow[] = entries.map(({ r, d }) => {
    const when = new Date(r.created_at);
    return {
      id: r.id,
      filter: d.area,
      selectable: false,
      search: [d.user, d.action, d.target, r.ip_address].join(' '),
      sort: { when: r.created_at, user: d.user, action: `${d.action} ${d.target}`, area: d.area },
      csv: [when.toISOString(), d.user, d.action, d.target, r.ip_address],
      cells: [
        <CellText
          key="w"
          sub={when.toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}
        >
          {ago(r.created_at)}
        </CellText>,
        <CellText key="u" bold>
          {d.user}
        </CellText>,
        <CellText key="a">
          {d.action} <b className="font-semibold">{d.target}</b>
        </CellText>,
        <Pill key="ar" tone="slate">
          {label(d.area)}
        </Pill>,
        r.ip_address ? (
          <code key="ip" className="rounded bg-[#F1F5F9] px-1.5 py-0.5 font-mono text-[12.5px]">
            {r.ip_address}
          </code>
        ) : (
          <CellText key="ip">—</CellText>
        ),
      ],
    };
  });

  return (
    <>
      <PageHeader
        title="Audit log"
        isNew
        description="Every change made in the admin, newest first, with who made it."
      >
        <ExportCsvButton
          filename="audit-log.csv"
          header={['When', 'User', 'Action', 'Target', 'IP']}
          rows={rows.map((r) => r.csv ?? [])}
        />
      </PageHeader>
      {error ? <ErrorNotice>Could not load the audit log: {error.message}</ErrorNotice> : null}
      <DataTable
        columns={[
          { key: 'when', label: 'When', width: '130px' },
          { key: 'user', label: 'User', width: 'minmax(150px,1fr)' },
          { key: 'action', label: 'Action', width: 'minmax(240px,2.2fr)' },
          { key: 'area', label: 'Area', width: '120px' },
          { key: 'ip', label: 'IP', width: '140px', sortable: false },
        ]}
        rows={rows}
        pageSize={25}
        filters={[
          { value: 'all', label: 'All' },
          ...AREAS.map((a) => ({ value: a, label: label(a) })),
        ]}
        searchPlaceholder="Search user, action, target…"
        emptyText="No admin changes recorded yet."
        footnote={(count ?? 0) > LIMIT ? `newest ${LIMIT} of ${count} entries` : undefined}
      />
    </>
  );
}
