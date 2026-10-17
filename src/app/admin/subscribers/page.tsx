import { createClient } from '@/lib/supabase-server';
import { requireRole, roleAtLeast } from '@/lib/auth';
import { deleteSubscriber, setSubscriberStatus } from '@/lib/subscriber-actions';
import { CellText, ErrorNotice, PageHeader, Pill, ago, label, rowAct, toneOf } from '@/components/admin/kit';
import { DataTable, type BulkAction, type TableRow } from '@/components/admin/data-table';
import { ConfirmButton } from '@/components/admin/dialog';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Subscribers' };

const FILTERS = ['all', 'active', 'unsubscribed'] as const;
type F = (typeof FILTERS)[number];

// The page is for looking people up and changing a status; the CSV has everyone.
const LIMIT = 500;

type Row = {
  id: string;
  email: string;
  source: string | null;
  status: 'active' | 'unsubscribed';
  created_at: string;
};

export default async function AdminSubscribers({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const user = await requireRole('moderator');
  const sp = await searchParams;
  const filter: F = FILTERS.includes(sp.status as F) ? (sp.status as F) : 'all';
  const canDelete = roleAtLeast(user.role, 'admin');

  const supabase = await createClient();
  let list = supabase
    .from('newsletter_subscribers')
    .select('id, email, source, status, created_at')
    .order('created_at', { ascending: false })
    .limit(LIMIT);
  if (filter !== 'all') list = list.eq('status', filter);
  const countOf = async (f: F) => {
    let c = supabase.from('newsletter_subscribers').select('id', { count: 'exact', head: true });
    if (f !== 'all') c = c.eq('status', f);
    return (await c).count ?? 0;
  };
  const [{ data, error }, counts] = await Promise.all([list, Promise.all(FILTERS.map(countOf))]);
  const subs = (data ?? []) as Row[];

  const rows: TableRow[] = subs.map((s) => {
    const active = s.status === 'active';
    return {
      id: s.id,
      search: [s.email, s.source].join(' '),
      sort: { email: s.email, source: s.source, status: s.status, date: s.created_at },
      csv: [s.email, s.source, s.status, s.created_at.slice(0, 10)],
      cells: [
        <CellText key="e" bold>
          {s.email}
        </CellText>,
        <CellText key="s">{s.source ?? '—'}</CellText>,
        <Pill key="st" tone={toneOf(s.status)}>
          {label(s.status)}
        </Pill>,
        <CellText key="d">{ago(s.created_at)}</CellText>,
      ],
      actions: (
        <>
          <form action={setSubscriberStatus}>
            <input type="hidden" name="id" value={s.id} />
            <input type="hidden" name="status" value={active ? 'unsubscribed' : 'active'} />
            <input type="hidden" name="view" value={filter} />
            <button type="submit" className={active ? rowAct.bad : rowAct.ok}>
              {active ? 'Unsubscribe' : 'Reactivate'}
              <span className="sr-only"> {s.email}</span>
            </button>
          </form>
          {canDelete ? (
            <form action={deleteSubscriber}>
              <input type="hidden" name="id" value={s.id} />
              <input type="hidden" name="view" value={filter} />
              <ConfirmButton
                className={rowAct.bad}
                title="Delete this subscriber permanently?"
                body={`${s.email} is removed from the list. This can’t be undone; unsubscribe them instead to keep a record.`}
                ok="Delete permanently"
                danger
                ariaLabel={`Delete ${s.email}`}
              >
                Delete
              </ConfirmButton>
            </form>
          ) : null}
        </>
      ),
    };
  });

  const bulk: BulkAction[] = [
    { label: 'Unsubscribe', tone: 'bad', op: 'subscriber_status', arg: 'unsubscribed' },
    { label: 'Reactivate', tone: 'ok', op: 'subscriber_status', arg: 'active' },
    {
      label: 'Export selected',
      exportCsv: { filename: 'subscribers-selected.csv', header: ['Email', 'Source', 'Status', 'Joined'] },
    },
  ];
  if (canDelete)
    bulk.push({
      label: 'Delete permanently',
      tone: 'bad',
      op: 'subscriber_delete',
      confirm: {
        title: 'Delete {n} subscribers permanently?',
        body: 'This can’t be undone.',
        ok: 'Delete permanently',
        danger: true,
      },
    });

  return (
    <>
      <PageHeader
        title="Subscribers"
        description={`Newsletter list from the sign-up form in the site footer. ${counts[0]?.toLocaleString('en-GB')} in total.`}
        // A plain download link: next/link would prefetch, and so build, the file.
        actions={[{ label: 'Export CSV', href: '/admin/subscribers/export', primary: true, download: true }]}
      />
      {error ? <ErrorNotice>Could not load subscribers: {error.message}</ErrorNotice> : null}
      <DataTable
        columns={[
          { key: 'email', label: 'Email', width: 'minmax(240px,2fr)' },
          { key: 'source', label: 'Source' },
          { key: 'status', label: 'Status', width: '140px' },
          { key: 'date', label: 'Joined', width: '110px' },
        ]}
        rows={rows}
        filters={FILTERS.map((f, i) => ({
          value: f,
          label: label(f),
          count: counts[i],
          href: f === 'all' ? '/admin/subscribers' : `/admin/subscribers?status=${f}`,
        }))}
        activeFilter={filter}
        searchPlaceholder="Search email…"
        actionsWidth={canDelete ? '190px' : '140px'}
        bulk={bulk}
        footnote={
          (counts[FILTERS.indexOf(filter)] ?? 0) > LIMIT
            ? `newest ${LIMIT} loaded; the CSV export has everyone`
            : undefined
        }
      />
    </>
  );
}
