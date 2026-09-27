import Link from 'next/link';
import { createClient } from '@/lib/supabase-server';
import { requireRole } from '@/lib/auth';
import { setSubmissionStatus } from '@/lib/moderation-actions';
import { Notice } from '@/components/admin-ui';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Inbox' };

const FILTERS = ['new', 'in_progress', 'resolved', 'spam', 'all'] as const;

type Payload = { name?: string; email?: string; subject?: string; message?: string };

export default async function AdminInbox({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; ok?: string; error?: string }>;
}) {
  await requireRole('moderator');
  const sp = await searchParams;
  const status = FILTERS.includes(sp.status as (typeof FILTERS)[number]) ? sp.status! : 'new';

  const supabase = await createClient();
  let q = supabase
    .from('form_submissions')
    .select('id, form_type, payload, status, is_spam, created_at')
    .order('created_at', { ascending: false })
    .limit(100);
  if (status !== 'all') q = q.eq('status', status);
  const { data, error } = await q;

  return (
    <div>
      <h1 className="text-2xl font-semibold">Inbox</h1>
      <p className="mt-2 text-sm text-[var(--text-muted)]">
        Messages from the contact form. Reply by email, then mark them resolved.
      </p>
      <Notice ok={sp.ok} error={sp.error ?? error?.message} />

      <div className="mt-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={`/admin/inbox?status=${f}`}
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

      <ul className="mt-6 space-y-4">
        {(data ?? []).map((m) => {
          const p = (m.payload ?? {}) as Payload;
          return (
            <li key={m.id} className="surface-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">
                  {p.subject || 'No subject'}{' '}
                  <span className="text-sm font-normal text-[var(--text-muted)]">
                    · {m.form_type}
                  </span>
                </p>
                <span className="text-xs text-[var(--text-muted)]">
                  {new Date(m.created_at as string).toLocaleString('en-GB')} · {m.status}
                </span>
              </div>
              <p className="mt-1 text-sm">
                {p.name ?? 'Unknown'}
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
