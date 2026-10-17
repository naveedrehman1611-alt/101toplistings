import { createClient } from '@/lib/supabase-server';
import { requireRole } from '@/lib/auth';
import { deleteRedirect, saveRedirect } from '@/lib/seo-actions';
import { CellText, PageHeader, Pill, ago, btn, rowAct } from '@/components/admin/kit';
import { RedirectFields } from '@/components/admin/redirect-fields';
import { DataTable, type TableRow } from '@/components/admin/data-table';
import { ConfirmButton, ModalForm } from '@/components/admin/dialog';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Redirects' };

type Row = {
  id: string;
  source: string;
  destination: string;
  status_code: number;
  hits: number;
  created_at: string;
};

export default async function AdminRedirects() {
  await requireRole('admin');
  const supabase = await createClient();
  const { data } = await supabase
    .from('redirects')
    .select('id, source, destination, status_code, hits, created_at')
    .order('source');
  const list = (data ?? []) as Row[];
  const codes = [301, 302, 307, 308];

  const rows: TableRow[] = list.map((r) => ({
    id: r.id,
    filter: String(r.status_code),
    search: `${r.source} ${r.destination}`,
    sort: { from: r.source, to: r.destination, type: r.status_code, hits: r.hits, date: r.created_at },
    cells: [
      <code key="f" className="max-w-full truncate rounded bg-[#F1F5F9] px-1.5 py-0.5 font-mono text-[12.5px]">
        {r.source}
      </code>,
      <code key="t" className="max-w-full truncate rounded bg-[#F1F5F9] px-1.5 py-0.5 font-mono text-[12.5px]">
        {r.destination}
      </code>,
      <Pill key="c" tone={r.status_code === 301 || r.status_code === 308 ? 'blue' : 'slate'}>
        {r.status_code}
      </Pill>,
      <CellText key="h">{r.hits.toLocaleString('en-GB')}</CellText>,
      <CellText key="d">{ago(r.created_at)}</CellText>,
    ],
    actions: (
      <form action={deleteRedirect}>
        <input type="hidden" name="id" value={r.id} />
        <ConfirmButton
          className={rowAct.bad}
          title="Delete this redirect?"
          body={`${r.source} will show “Page not found” again.`}
          ok="Delete"
          danger
        >
          Delete
        </ConfirmButton>
      </form>
    ),
  }));

  return (
    <>
      <PageHeader
        title="Redirects"
        description="Send old URLs to new ones. A rule only applies to a URL that would otherwise show “Page not found”, so it can’t hide a page that exists."
      >
        <ModalForm trigger="Add redirect" triggerClassName={btn.primary} title="Add redirect" action={saveRedirect} ok="Save redirect">
          <RedirectFields />
        </ModalForm>
      </PageHeader>
      <DataTable
        columns={[
          { key: 'from', label: 'From', width: 'minmax(200px,1.5fr)' },
          { key: 'to', label: 'To', width: 'minmax(220px,1.8fr)' },
          { key: 'type', label: 'Type', width: '90px' },
          { key: 'hits', label: 'Hits', width: '90px' },
          { key: 'date', label: 'Created', width: '110px' },
        ]}
        rows={rows}
        filters={[
          { value: 'all', label: 'All' },
          ...codes.map((c) => ({ value: String(c), label: String(c) })),
        ]}
        searchPlaceholder="Search URLs…"
        actionsWidth="120px"
        emptyText="No redirects yet."
        bulk={[
          {
            label: 'Delete',
            tone: 'bad',
            op: 'redirect_delete',
            confirm: { title: 'Delete {n} redirects?', ok: 'Delete', danger: true },
          },
        ]}
      />
    </>
  );
}
