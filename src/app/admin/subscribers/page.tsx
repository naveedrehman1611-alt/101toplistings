import Link from 'next/link';
import { createClient } from '@/lib/supabase-server';
import { requireRole, roleAtLeast } from '@/lib/auth';
import { deleteSubscriber, setSubscriberStatus } from '@/lib/subscriber-actions';
import { DangerButton, Notice } from '@/components/admin-ui';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Subscribers' };

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'unsubscribed', label: 'Unsubscribed' },
] as const;

type Filter = (typeof FILTERS)[number]['value'];

// The page is for looking people up and changing a status; the CSV has everyone.
const LIMIT = 200;

type Row = {
  id: string;
  email: string;
  source: string | null;
  status: 'active' | 'unsubscribed';
  created_at: string;
};

const listHref = (filter: Filter) =>
  filter === 'all' ? '/admin/subscribers' : `/admin/subscribers?status=${filter}`;

export default async function AdminSubscribers({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; ok?: string; error?: string }>;
}) {
  const user = await requireRole('moderator');
  const sp = await searchParams;
  const filter: Filter = sp.status === 'active' || sp.status === 'unsubscribed' ? sp.status : 'all';
  const canDelete = roleAtLeast(user.role, 'admin');

  const supabase = await createClient();
  let list = supabase
    .from('newsletter_subscribers')
    .select('id, email, source, status, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .limit(LIMIT);
  if (filter !== 'all') list = list.eq('status', filter);
  const [total, matching] = await Promise.all([
    supabase.from('newsletter_subscribers').select('id', { count: 'exact', head: true }),
    list,
  ]);
  const rows = (matching.data ?? []) as Row[];
  const more = (matching.count ?? 0) > rows.length;
  const count = (n: number | null) => (n ?? 0).toLocaleString('en-GB');

  return (
    <div>
      <h1 className="text-2xl font-semibold">Newsletter subscribers</h1>
      <p className="mt-2 text-sm text-[var(--text-muted)]">
        Everyone who signed up with the newsletter form in the site footer. {count(total.count)} in
        total.
      </p>
      <Notice ok={sp.ok} error={sp.error ?? matching.error?.message ?? total.error?.message} />

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.value}
            href={listHref(f.value)}
            aria-current={filter === f.value ? 'page' : undefined}
            className={`rounded-lg border px-3 py-1.5 text-sm ${
              filter === f.value
                ? 'border-brand-500 bg-brand-50 text-brand-800'
                : 'border-[var(--border)] hover:bg-[var(--surface-2)]'
            }`}
          >
            {f.label}
          </Link>
        ))}
        {/* A plain download link: next/link would prefetch, and so build, the file. */}
        <a
          href="/admin/subscribers/export"
          download
          className="text-brand-700 ml-auto rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm font-medium hover:bg-[var(--surface-2)]"
        >
          Export CSV
        </a>
      </div>

      {matching.error ? null : rows.length === 0 ? (
        <p className="mt-6 text-sm text-[var(--text-muted)]">
          {filter === 'all' ? 'No one has subscribed yet.' : 'No subscribers match.'}
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[40rem] text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left">
                <th className="py-2 pr-4 font-medium">Email</th>
                <th className="py-2 pr-4 font-medium">Subscribed</th>
                <th className="py-2 pr-4 font-medium">Source</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                <th className="py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => {
                const active = s.status === 'active';
                return (
                  <tr key={s.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-4 font-medium break-all">{s.email}</td>
                    <td className="py-2 pr-4 whitespace-nowrap text-[var(--text-muted)]">
                      <time dateTime={s.created_at}>
                        {new Date(s.created_at).toLocaleDateString('en-GB', {
                          timeZone: 'Asia/Karachi',
                        })}
                      </time>
                    </td>
                    <td className="py-2 pr-4 text-[var(--text-muted)]">{s.source ?? '—'}</td>
                    <td className="py-2 pr-4">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          active
                            ? 'bg-emerald-50 text-emerald-800'
                            : 'bg-[var(--surface-2)] text-[var(--text-muted)]'
                        }`}
                      >
                        {active ? 'Active' : 'Unsubscribed'}
                      </span>
                    </td>
                    <td className="py-2">
                      <div className="flex flex-wrap gap-2">
                        <form action={setSubscriberStatus}>
                          <input type="hidden" name="id" value={s.id} />
                          <input
                            type="hidden"
                            name="status"
                            value={active ? 'unsubscribed' : 'active'}
                          />
                          <input type="hidden" name="view" value={filter} />
                          <button
                            type="submit"
                            className="rounded-lg border border-[var(--border)] px-2.5 py-1 text-xs hover:bg-[var(--surface-2)]"
                          >
                            {active ? 'Unsubscribe' : 'Reactivate'}
                            <span className="sr-only"> {s.email}</span>
                          </button>
                        </form>
                        {canDelete ? (
                          <form action={deleteSubscriber}>
                            <input type="hidden" name="id" value={s.id} />
                            <input type="hidden" name="view" value={filter} />
                            <DangerButton>
                              Delete<span className="sr-only"> {s.email}</span>
                            </DangerButton>
                          </form>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {more ? (
        <p className="mt-4 text-sm text-[var(--text-muted)]">
          Showing the newest {count(rows.length)} of {count(matching.count)}. Export the CSV for the
          full list.
        </p>
      ) : null}
    </div>
  );
}
