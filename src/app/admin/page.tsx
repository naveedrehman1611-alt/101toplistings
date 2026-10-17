import Link from 'next/link';
import { createClient } from '@/lib/supabase-server';
import { requireRole, roleAtLeast } from '@/lib/auth';
import { AREA_COLOR, AUDIT_SELECT, describeAudit, type AuditRow } from '@/lib/admin-activity';
import { PageHeader, ago, card } from '@/components/admin/kit';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Dashboard' };

const DAY = 86_400_000;
const C = {
  navy: '#062347',
  green: '#0C8226',
  logo: '#14A833',
  blue: '#1884E7',
  teal: '#0E7A7C',
  gold: '#F59E0B',
  red: '#B91C1C',
};

/** Now, the start of the 14-day chart window (midnight), and one week ago. */
function timeWindow() {
  const now = Date.now();
  const since14 = new Date(now - 13 * DAY);
  since14.setHours(0, 0, 0, 0);
  return {
    now,
    since14,
    since7: new Date(now - 7 * DAY).toISOString(),
    since30: new Date(now - 30 * DAY).toISOString(),
  };
}

export default async function AdminDashboard() {
  const user = await requireRole('moderator');
  const isEditor = roleAtLeast(user.role, 'editor');
  const isAdmin = roleAtLeast(user.role, 'admin');
  const supabase = await createClient();

  const head = (table: string) => supabase.from(table).select('*', { count: 'exact', head: true });
  const n = async (q: PromiseLike<{ count: number | null }>) => (await q).count ?? 0;

  const { now, since14, since7, since30 } = timeWindow();

  const [
    pending,
    approved,
    rejected,
    suspended,
    total,
    approvedWeek,
    rejected30,
    categories,
    topCategories,
    cities,
    areas,
    posts,
    published,
    reviews,
    claims,
    inbox,
    { data: recent },
    { data: audit },
  ] = await Promise.all([
    n(head('listings').eq('status', 'pending')),
    n(head('listings').eq('status', 'approved')),
    n(head('listings').eq('status', 'rejected')),
    n(head('listings').eq('status', 'suspended')),
    n(head('listings')),
    n(head('listings').eq('status', 'approved').gte('published_at', since7)),
    n(head('listings').eq('status', 'rejected').gte('updated_at', since30)),
    n(head('categories')),
    n(head('categories').is('parent_id', null)),
    n(head('cities')),
    n(head('areas')),
    n(head('blog_posts')),
    n(head('blog_posts').eq('is_published', true)),
    n(head('reviews').eq('status', 'pending')),
    n(head('claims').eq('status', 'new')),
    n(head('form_submissions').eq('status', 'new')),
    supabase
      .from('listings')
      .select('created_at')
      .gte('created_at', since14.toISOString())
      .limit(5000),
    supabase
      .from('audit_logs')
      .select(AUDIT_SELECT)
      .order('created_at', { ascending: false })
      .limit(7),
  ]);

  const kpis = [
    {
      label: 'Pending listings',
      value: pending,
      sub: 'Needs review',
      color: C.gold,
      href: '/admin/listings?status=pending',
      warn: true,
    },
    {
      label: 'Approved',
      value: approved,
      sub: `+${approvedWeek} this week`,
      color: C.green,
      href: '/admin/listings?status=approved',
    },
    {
      label: 'Rejected',
      value: rejected30,
      sub: 'Last 30 days',
      color: C.red,
      href: '/admin/listings?status=rejected',
    },
    {
      label: 'Total listings',
      value: total,
      sub: 'All statuses',
      color: C.navy,
      href: '/admin/listings',
    },
    {
      label: 'Pending reviews',
      value: reviews,
      sub: 'Needs review',
      color: C.gold,
      href: '/admin/reviews?status=pending',
      warn: true,
    },
    {
      label: 'Categories',
      value: categories,
      sub: `${topCategories} top-level`,
      color: C.blue,
      href: isEditor ? '/admin/categories' : undefined,
    },
    {
      label: 'Cities',
      value: cities,
      sub: `${areas} areas`,
      color: C.teal,
      href: isEditor ? '/admin/locations' : undefined,
    },
    {
      label: 'Blog posts',
      value: posts,
      sub: `${published} published`,
      color: C.logo,
      href: isEditor ? '/admin/blog' : undefined,
    },
  ];

  // New submissions per day for the last 14 days, today last.
  const buckets = Array.from({ length: 14 }, (_, i) => ({
    d: new Date(since14.getTime() + i * DAY),
    n: 0,
  }));
  for (const r of recent ?? []) {
    const i = Math.floor((new Date(r.created_at as string).getTime() - since14.getTime()) / DAY);
    if (i >= 0 && i < 14) buckets[i]!.n++;
  }
  const max = Math.max(1, ...buckets.map((b) => b.n));
  const barTotal = buckets.reduce((a, b) => a + b.n, 0);
  const day = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

  const statusTotal = Math.max(1, approved + pending + rejected + suspended);
  const statusBars = [
    { label: 'Approved', key: 'approved', n: approved, color: C.green },
    { label: 'Pending', key: 'pending', n: pending, color: C.gold },
    { label: 'Rejected', key: 'rejected', n: rejected, color: '#EF4444' },
    { label: 'Suspended', key: 'suspended', n: suspended, color: '#94A3B8' },
  ].map((s) => ({ ...s, pct: `${Math.round((s.n / statusTotal) * 100)}%` }));

  const queue = [
    { label: 'Listings waiting for approval', n: pending, href: '/admin/listings?status=pending' },
    { label: 'Reviews to moderate', n: reviews, href: '/admin/reviews?status=pending' },
    { label: 'Ownership claims', n: claims, href: '/admin/claims' },
    { label: 'New inbox messages', n: inbox, href: '/admin/inbox?status=new' },
  ].filter((q) => q.n > 0);

  const activity = ((audit ?? []) as unknown as AuditRow[]).map((r) => ({
    id: r.id,
    when: ago(r.created_at, now),
    ...describeAudit(r),
  }));

  const h3 = 'font-display m-0 text-[15px] font-bold text-[#062347]';

  return (
    <>
      <PageHeader title="Dashboard" description="What needs attention today." />

      <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3.5">
        {kpis.map((k) => {
          const inner = (
            <>
              <div className="flex items-center gap-2 text-[13px] font-medium text-[#64748B]">
                <span className="size-2 rounded-[2px]" style={{ background: k.color }} />
                {k.label}
              </div>
              <div className="font-display text-[28px] font-bold tracking-[-.02em] text-[#062347]">
                {k.value.toLocaleString('en-GB')}
              </div>
              <div
                className="text-xs font-medium"
                style={{ color: k.warn && k.value ? '#92400E' : '#64748B' }}
              >
                {k.sub}
              </div>
            </>
          );
          const cls = `${card} flex flex-col gap-2 px-[18px] py-4 text-left`;
          return k.href ? (
            <Link
              key={k.label}
              href={k.href}
              className={`${cls} hover:border-[#CBD5E1] hover:no-underline`}
            >
              {inner}
            </Link>
          ) : (
            <div key={k.label} className={cls}>
              {inner}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] gap-3.5">
        <div className={`${card} px-5 py-[18px]`}>
          <div className="flex items-baseline gap-2.5">
            <h3 className={h3}>New listings submitted</h3>
            <span className="text-xs text-[#64748B]">Last 14 days</span>
            <span className="ml-auto text-[13px] font-semibold">{barTotal} total</span>
          </div>
          <div className="mt-[18px] flex h-[170px] items-end gap-2 border-b border-[#E2E8F0]">
            {buckets.map((b, i) => (
              <div
                key={i}
                title={`${day(b.d)}: ${b.n}`}
                className="flex h-full flex-1 flex-col items-center justify-end gap-1"
              >
                <span className="text-[11px] text-[#64748B]">{b.n}</span>
                <div
                  className="w-full rounded-t"
                  style={{
                    height: Math.max(2, Math.round((b.n / max) * 130)),
                    background: i === buckets.length - 1 ? C.green : '#B7E4C2',
                  }}
                />
              </div>
            ))}
          </div>
          <div className="mt-1.5 flex gap-2">
            {buckets.map((b, i) => (
              <div
                key={i}
                className="flex-1 text-center text-[10.5px] whitespace-nowrap text-[#94A3B8]"
              >
                {i % 2 ? '' : day(b.d)}
              </div>
            ))}
          </div>
        </div>

        <div className={`${card} flex flex-col gap-3.5 px-5 py-[18px]`}>
          <h3 className={h3}>Listings by status</h3>
          <div className="flex h-3 gap-0.5 overflow-hidden rounded">
            {statusBars.map((s) => (
              <div key={s.key} style={{ width: s.pct, background: s.color }} />
            ))}
          </div>
          <div className="flex flex-col gap-2.5">
            {statusBars.map((s) => (
              <Link
                key={s.key}
                href={`/admin/listings?status=${s.key}`}
                className="flex items-center gap-2.5 text-[13.5px] text-[#062347] hover:text-[#062347] hover:no-underline"
              >
                <span className="size-2.5 rounded-[3px]" style={{ background: s.color }} />
                <span className="flex-1">{s.label}</span>
                <span className="font-semibold">{s.n}</span>
                <span className="w-10 text-right text-xs text-[#64748B]">{s.pct}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] gap-3.5">
        <div className={card}>
          <h3 className={`${h3} border-b border-[#E2E8F0] px-5 py-4`}>Needs your attention</h3>
          {queue.map((q) => (
            <Link
              key={q.label}
              href={q.href}
              className="flex items-center gap-3 border-b border-[#F1F5F9] px-5 py-[13px] text-[13.5px] text-[#062347] hover:bg-[#F8FAFC] hover:text-[#062347] hover:no-underline"
            >
              <span className="flex-1">{q.label}</span>
              <span className="rounded-full bg-[#FEF3C7] px-2 py-0.5 text-xs font-bold text-[#92400E]">
                {q.n}
              </span>
              <span className="text-[#94A3B8]">›</span>
            </Link>
          ))}
          {queue.length === 0 ? (
            <p className="m-0 px-5 py-6 text-[13.5px] text-[#64748B]">All caught up.</p>
          ) : null}
        </div>
        <div className={card}>
          <div className="flex items-center border-b border-[#E2E8F0] px-5 py-4">
            <h3 className={`${h3} flex-1`}>Recent activity</h3>
            {isAdmin ? (
              <Link href="/admin/audit-log" className="text-[13px] font-semibold text-[#1884E7]">
                View audit log
              </Link>
            ) : null}
          </div>
          {activity.map((a) => (
            <div
              key={a.id}
              className="flex items-center gap-3 border-b border-[#F1F5F9] px-5 py-3 text-[13.5px]"
            >
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ background: AREA_COLOR[a.area] }}
              />
              <span className="min-w-0 flex-1">
                <b className="font-semibold">{a.user}</b>{' '}
                <span className="text-[#475569]">{a.action}</span>{' '}
                <b className="font-semibold">{a.target}</b>
              </span>
              <span className="text-xs whitespace-nowrap text-[#94A3B8]">{a.when}</span>
            </div>
          ))}
          {activity.length === 0 ? (
            <p className="m-0 px-5 py-6 text-[13.5px] text-[#64748B]">
              No admin changes recorded yet. Every write from this panel is logged here.
            </p>
          ) : null}
        </div>
      </div>
    </>
  );
}
