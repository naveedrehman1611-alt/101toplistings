import { Fragment } from 'react';
import { createClient } from '@/lib/supabase-server';
import { requireRole } from '@/lib/auth';
import { moderateReview } from '@/lib/moderation-actions';
import {
  CellText,
  ErrorNotice,
  FormField,
  NewBadge,
  PageHeader,
  Pill,
  ago,
  label,
  rowAct,
  stars,
  textareaCls,
  toneOf,
} from '@/components/admin/kit';
import { DataTable, type TableRow } from '@/components/admin/data-table';
import { ConfirmButton, ModalForm } from '@/components/admin/dialog';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Reviews' };

const FILTERS = ['all', 'pending', 'approved', 'rejected', 'flagged'] as const;
type F = (typeof FILTERS)[number];

type Row = {
  id: string;
  rating: number;
  rating_service: number | null;
  rating_hospitality: number | null;
  rating_pricing: number | null;
  title: string | null;
  body: string | null;
  author_name: string | null;
  status: string;
  reply_body: string | null;
  created_at: string;
  listings: { name: string; slug: string } | null;
};

function Decision({
  id,
  back,
  decision,
  children,
  className,
  confirm,
}: {
  id: string;
  back: string;
  decision: 'approve' | 'reject' | 'delete';
  children: React.ReactNode;
  className: string;
  confirm?: { title: string; body: string; ok: string };
}) {
  return (
    <form action={moderateReview}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="decision" value={decision} />
      <input type="hidden" name="back" value={back} />
      {confirm ? (
        <ConfirmButton className={className} {...confirm} danger>
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

export default async function AdminReviews({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  await requireRole('moderator');
  const sp = await searchParams;
  const status: F = FILTERS.includes(sp.status as F) ? (sp.status as F) : 'pending';
  const back = `/admin/reviews?status=${status}`;

  const supabase = await createClient();
  let q = supabase
    .from('reviews')
    .select(
      'id, rating, rating_service, rating_hospitality, rating_pricing, title, body, author_name, status, reply_body, created_at, listings(name, slug)',
    )
    .order('created_at', { ascending: false })
    .limit(300);
  if (status !== 'all') q = q.eq('status', status);
  const countOf = async (f: F) => {
    let c = supabase.from('reviews').select('*', { count: 'exact', head: true });
    if (f !== 'all') c = c.eq('status', f);
    return (await c).count ?? 0;
  };
  const [{ data, error }, counts] = await Promise.all([q, Promise.all(FILTERS.map(countOf))]);
  const reviews = (data ?? []) as unknown as Row[];

  const rows: TableRow[] = reviews.map((r) => {
    const listing = r.listings?.name ?? 'Deleted listing';
    const author = r.author_name ?? 'Visitor';
    const text = [r.title, r.body].filter(Boolean).join(' — ') || '(no text)';
    const aspects = [
      r.rating_service ? `Service ${r.rating_service}` : null,
      r.rating_hospitality ? `Hospitality ${r.rating_hospitality}` : null,
      r.rating_pricing ? `Pricing ${r.rating_pricing}` : null,
    ].filter(Boolean);
    return {
      id: r.id,
      search: [text, author, listing].join(' '),
      sort: { text, listing, rating: r.rating, status: r.status, date: r.created_at },
      cells: [
        <CellText key="t" sub={r.reply_body ? `↳ Replied: ${r.reply_body}` : `by ${author}`}>
          “{text}”
        </CellText>,
        <CellText key="l" bold>
          {listing}
        </CellText>,
        <Fragment key="c224">
          <div className="flex items-center gap-1 font-semibold">
            <span className="tracking-[1px] text-[#F59E0B]" aria-label={`${r.rating} of 5`}>
              {stars(r.rating)}
            </span>
            <span>{r.rating}.0</span>
          </div>
          {aspects.length ? (
            <div className="flex max-w-full items-center gap-1.5 text-xs text-[#64748B]">
              <span className="truncate">{aspects.join(' · ')}</span>
              <NewBadge />
            </div>
          ) : null}
        </Fragment>,
        <Pill key="s" tone={toneOf(r.status)}>
          {label(r.status)}
        </Pill>,
        <CellText key="d">{ago(r.created_at)}</CellText>,
      ],
      actions: (
        <>
          {r.status !== 'approved' ? (
            <Decision id={r.id} back={back} decision="approve" className={rowAct.ok}>
              Approve
            </Decision>
          ) : null}
          {r.status !== 'rejected' ? (
            <Decision
              id={r.id}
              back={back}
              decision="reject"
              className={rowAct.bad}
              confirm={{
                title: 'Reject this review?',
                body: 'It won’t be shown publicly and won’t count toward the rating.',
                ok: 'Reject',
              }}
            >
              Reject
            </Decision>
          ) : null}
          <ModalForm
            trigger={r.reply_body ? 'Edit reply' : 'Reply'}
            triggerClassName={rowAct.base}
            title="Public reply"
            body={`Shown under ${author}’s review on ${listing}. Leave it empty to remove the reply.`}
            action={moderateReview}
            ok="Post reply"
          >
            <input type="hidden" name="id" value={r.id} />
            <input type="hidden" name="decision" value="reply" />
            <input type="hidden" name="back" value={back} />
            <FormField label="Reply" htmlFor={`reply-${r.id}`}>
              <textarea
                id={`reply-${r.id}`}
                name="reply_body"
                rows={4}
                maxLength={2000}
                defaultValue={r.reply_body ?? ''}
                placeholder="Write a reply…"
                className={textareaCls}
              />
            </FormField>
          </ModalForm>
          <Decision
            id={r.id}
            back={back}
            decision="delete"
            className={rowAct.bad}
            confirm={{
              title: 'Delete this review permanently?',
              body: 'This can’t be undone. Reject it instead to keep a record.',
              ok: 'Delete permanently',
            }}
          >
            Delete
          </Decision>
        </>
      ),
    };
  });

  return (
    <>
      <PageHeader
        title="Reviews"
        description="Moderate reviews and reply publicly as the directory. A review only counts toward a business’s rating once approved."
      />
      {error ? <ErrorNotice>Could not load reviews: {error.message}</ErrorNotice> : null}
      <DataTable
        columns={[
          { key: 'text', label: 'Review', width: 'minmax(240px,2.4fr)' },
          { key: 'listing', label: 'Listing' },
          { key: 'rating', label: 'Rating', width: '200px' },
          { key: 'status', label: 'Status', width: '110px' },
          { key: 'date', label: 'Date', width: '100px' },
        ]}
        rows={rows}
        filters={FILTERS.map((f, i) => ({
          value: f,
          label: label(f),
          count: counts[i],
          href: `/admin/reviews?status=${f}`,
        }))}
        activeFilter={status}
        searchPlaceholder="Search listing, author, text…"
        initialQuery={sp.q ?? ''}
        actionsWidth="270px"
        bulk={[
          { label: 'Approve', tone: 'ok', op: 'review', arg: 'approve' },
          {
            label: 'Reject',
            op: 'review',
            arg: 'reject',
            confirm: { title: 'Reject {n} reviews?', ok: 'Reject', danger: true },
          },
          {
            label: 'Delete permanently',
            tone: 'bad',
            op: 'review',
            arg: 'delete',
            confirm: {
              title: 'Delete {n} reviews permanently?',
              body: 'This can’t be undone.',
              ok: 'Delete permanently',
              danger: true,
            },
          },
        ]}
      />
    </>
  );
}
