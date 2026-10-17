import Link from 'next/link';
import { createClient } from '@/lib/supabase-server';
import { requireRole } from '@/lib/auth';
import { setSubmissionStatus } from '@/lib/moderation-actions';
import { REPORT_REASONS } from '@/lib/report-reasons';
import { CellText, ErrorNotice, PageHeader, Pill, ago, label, rowAct, toneOf } from '@/components/admin/kit';
import { DataTable, type TableRow } from '@/components/admin/data-table';
import { InfoDialog } from '@/components/admin/dialog';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Inbox' };

const FILTERS = ['all', 'new', 'in_progress', 'resolved', 'spam'] as const;
type F = (typeof FILTERS)[number];

type Payload = {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  // Contact Author on a listing page (form_type 'contact') also sends these.
  phone?: string;
  // Report form (form_type 'report').
  reason?: string;
  listing_slug?: string;
  listing_name?: string;
};

const TYPE_LABEL: Record<string, string> = {
  contact: 'Contact',
  report: 'Report a problem',
  claim: 'Claim',
  review_flag: 'Flagged review',
};

function SetStatus({
  id,
  status,
  className,
  children,
}: {
  id: string;
  status: 'in_progress' | 'resolved' | 'spam';
  className: string;
  children: React.ReactNode;
}) {
  return (
    <form action={setSubmissionStatus}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button type="submit" className={className}>
        {children}
      </button>
    </form>
  );
}

export default async function AdminInbox({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireRole('moderator');
  const sp = await searchParams;
  const status: F = FILTERS.includes(sp.status as F) ? (sp.status as F) : 'all';

  const supabase = await createClient();
  let q = supabase
    .from('form_submissions')
    .select('id, form_type, payload, status, is_spam, created_at')
    .order('created_at', { ascending: false })
    .limit(300);
  if (status !== 'all') q = q.eq('status', status);
  const countOf = async (f: F) => {
    let c = supabase.from('form_submissions').select('*', { count: 'exact', head: true });
    if (f !== 'all') c = c.eq('status', f);
    return (await c).count ?? 0;
  };
  const [{ data, error }, counts] = await Promise.all([q, Promise.all(FILTERS.map(countOf))]);

  const rows: TableRow[] = (data ?? []).map((m) => {
    const p = (m.payload ?? {}) as Payload;
    const type = m.form_type as string;
    const from = p.name ?? (type === 'report' ? 'Visitor' : 'Unknown');
    const subject =
      type === 'report'
        ? `${REPORT_REASONS[p.reason as keyof typeof REPORT_REASONS] ?? 'Report'}${
            p.listing_name ? ` — ${p.listing_name}` : ''
          }`
        : p.listing_name
          ? `Message for ${p.listing_name}`
          : p.subject || 'No subject';
    const st = m.status as string;
    const id = m.id as string;
    return {
      id,
      emphasis: st === 'new',
      search: [from, p.email, subject, p.message].join(' '),
      sort: { from, subject, type, status: st, date: m.created_at as string },
      cells: [
        <CellText key="f" sub={p.email}>
          {from}
        </CellText>,
        <CellText key="s" bold={st === 'new'} sub={p.message?.slice(0, 120)}>
          {subject}
        </CellText>,
        <Pill key="t" tone={type === 'report' ? 'gold' : 'slate'}>
          {TYPE_LABEL[type] ?? label(type)}
        </Pill>,
        <Pill key="st" tone={toneOf(st)}>
          {label(st)}
        </Pill>,
        <CellText key="d">{ago(m.created_at as string)}</CellText>,
      ],
      actions: (
        <>
          <InfoDialog trigger="Open" triggerClassName={rowAct.base} title={subject}>
            <p className="m-0 text-[13px] text-[#64748B]">
              {from}
              {p.email ? (
                <>
                  {' · '}
                  <a href={`mailto:${p.email}`}>{p.email}</a>
                </>
              ) : null}
              {p.phone ? (
                <>
                  {' · '}
                  <a href={`tel:${p.phone.replace(/\s+/g, '')}`}>{p.phone}</a>
                </>
              ) : null}
              {' · '}
              {new Date(m.created_at as string).toLocaleString('en-GB')}
            </p>
            {p.listing_slug ? (
              <p className="m-0 text-[13px]">
                Listing:{' '}
                <Link href={`/listing/${p.listing_slug}`} target="_blank">
                  {p.listing_name ?? p.listing_slug} ↗
                </Link>
              </p>
            ) : null}
            <p className="m-0 text-sm whitespace-pre-line text-[#062347]">
              {p.message || '(no message)'}
            </p>
          </InfoDialog>
          {st === 'new' ? (
            <SetStatus id={id} status="in_progress" className={rowAct.base}>
              In progress
            </SetStatus>
          ) : null}
          {st !== 'resolved' ? (
            <SetStatus id={id} status="resolved" className={rowAct.ok}>
              Resolve
            </SetStatus>
          ) : null}
          {st !== 'spam' ? (
            <SetStatus id={id} status="spam" className={rowAct.bad}>
              Spam
            </SetStatus>
          ) : null}
        </>
      ),
    };
  });

  return (
    <>
      <PageHeader
        title="Inbox"
        description="Contact form and “Report a problem” messages. Deal with each one, then mark it resolved."
      />
      {error ? <ErrorNotice>Could not load messages: {error.message}</ErrorNotice> : null}
      <DataTable
        columns={[
          { key: 'from', label: 'From', width: 'minmax(160px,1fr)' },
          { key: 'subject', label: 'Subject', width: 'minmax(240px,2fr)' },
          { key: 'type', label: 'Type', width: '160px' },
          { key: 'status', label: 'Status', width: '120px' },
          { key: 'date', label: 'Received', width: '110px' },
        ]}
        rows={rows}
        filters={FILTERS.map((f, i) => ({
          value: f,
          label: label(f),
          count: counts[i],
          href: f === 'all' ? '/admin/inbox' : `/admin/inbox?status=${f}`,
        }))}
        activeFilter={status}
        searchPlaceholder="Search sender or subject…"
        actionsWidth="270px"
        bulk={[
          { label: 'Resolve', tone: 'ok', op: 'inbox_status', arg: 'resolved' },
          { label: 'Mark in progress', op: 'inbox_status', arg: 'in_progress' },
          { label: 'Mark spam', tone: 'bad', op: 'inbox_status', arg: 'spam' },
        ]}
      />
    </>
  );
}
