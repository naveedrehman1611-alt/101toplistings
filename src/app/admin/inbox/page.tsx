import Link from 'next/link';
import { createClient } from '@/lib/supabase-server';
import { requireRole } from '@/lib/auth';
import { setSubmissionStatus } from '@/lib/moderation-actions';
import { Notice } from '@/components/admin-ui';
import { REPORT_REASONS } from '@/lib/report-reasons';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Inbox' };

const FILTERS = ['new', 'in_progress', 'resolved', 'spam', 'all'] as const;
const TYPES = ['all', 'contact', 'report'] as const;

type Payload = {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  // Report form (form_type 'report').
  reason?: string;
  listing_slug?: string;
  listing_name?: string;
};

export default async function AdminInbox({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string; ok?: string; error?: string }>;
}) {
  await requireRole('moderator');
  const sp = await searchParams;
  const status = FILTERS.includes(sp.status as (typeof FILTERS)[number]) ? sp.status! : 'new';
  const type = TYPES.includes(sp.type as (typeof TYPES)[number]) ? sp.type! : 'all';

  const supabase = await createClient();
  let q = supabase
    .from('form_submissions')
    .select('id, form_type, payload, status, is_spam, created_at')
    .order('created_at', { ascending: false })
    .limit(100);
  if (status !== 'all') q = q.eq('status', status);
  if (type !== 'all') q = q.eq('form_type', type);
  const { data, error } = await q;

  return (
    <div>
      <h1 className="text-2xl font-semibold">Inbox</h1>
      <p className="mt-2 text-sm text-[var(--text-muted)]">
        Messages from the contact form and problem reports on listings. Deal with each one, then
        mark it resolved.
      </p>
      <Notice ok={sp.ok} error={sp.error ?? error?.message} />

      <div className="mt-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={`/admin/inbox?status=${f}&type=${type}`}
            className={`rounded-lg border px-3 py-1.5 text-sm ${
              status === f
                ? 'border-brand-500 bg-brand-50 text-brand-800'
                : 'border-[var(--border)] hover:bg-[var(--surface-2)]'
            }`}
          >
            {f.replace('_', ' ')}
          </Link>
        ))}
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        {TYPES.map((t) => (
          <Link
            key={t}
            href={`/admin/inbox?status=${status}&type=${t}`}
            className={`rounded-lg border px-3 py-1 text-xs capitalize ${
              type === t
                ? 'border-brand-500 bg-brand-50 text-brand-800'
                : 'border-[var(--border)] hover:bg-[var(--surface-2)]'
            }`}
          >
            {t === 'all' ? 'all types' : t === 'report' ? 'reports' : t}
          </Link>
        ))}
      </div>

      <ul className="mt-6 space-y-4">
        {(data ?? []).map((m) => {
          const p = (m.payload ?? {}) as Payload;
          return (
            <li key={m.id} className="surface-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">
                  {m.form_type === 'report' ? (
                    <>
                      {REPORT_REASONS[p.reason as keyof typeof REPORT_REASONS] ?? 'Report'}
                      {p.listing_slug ? (
                        <>
                          {' — '}
                          <Link
                            href={`/listing/${p.listing_slug}`}
                            className="text-brand-700 hover:underline"
                          >
                            {p.listing_name ?? p.listing_slug}
                          </Link>
                        </>
                      ) : null}
                    </>
                  ) : (
                    p.subject || 'No subject'
                  )}{' '}
                  <span className="text-sm font-normal text-[var(--text-muted)]">
                    · {m.form_type}
                  </span>
                </p>
                <span className="text-xs text-[var(--text-muted)]">
                  {new Date(m.created_at as string).toLocaleString('en-GB')} · {m.status}
                </span>
              </div>
              <p className="mt-1 text-sm">
                {p.name ?? (m.form_type === 'report' ? 'Visitor' : 'Unknown')}
                {p.email ? (
                  <>
                    {' '}
                    ·{' '}
                    <a href={`mailto:${p.email}`} className="text-brand-700 hover:underline">
                      {p.email}
                    </a>
                  </>
                ) : null}
              </p>
              {p.message ? <p className="mt-2 text-sm whitespace-pre-line">{p.message}</p> : null}
              <div className="mt-3 flex flex-wrap gap-2">
                {(['in_progress', 'resolved', 'spam'] as const)
                  .filter((s) => s !== m.status)
                  .map((s) => (
                    <form key={s} action={setSubmissionStatus}>
                      <input type="hidden" name="id" value={m.id as string} />
                      <input type="hidden" name="status" value={s} />
                      <button
                        type="submit"
                        className="rounded-lg border border-[var(--border)] px-2.5 py-1 text-xs"
                      >
                        {s === 'in_progress'
                          ? 'In progress'
                          : s === 'resolved'
                            ? 'Resolved'
                            : 'Spam'}
                      </button>
                    </form>
                  ))}
              </div>
            </li>
          );
        })}
      </ul>
      {(data ?? []).length === 0 ? (
        <p className="mt-6 text-sm text-[var(--text-muted)]">Nothing here.</p>
      ) : null}
    </div>
  );
}
