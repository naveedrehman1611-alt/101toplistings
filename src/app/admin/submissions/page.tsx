import type { Metadata } from 'next';
import { requireRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import {
  AdminButton,
  Card,
  FilterTabs,
  PageHeader,
  Pager,
  StatusPill,
} from '@/components/admin/chrome';
import { Select } from '@/components/form';
import { EmptyState } from '@/components/ui';
import { setSubmissionSpam, setSubmissionStatus } from './actions';

export const metadata: Metadata = { title: 'Inbox' };

const PER_PAGE = 25;
const BASE = '/admin/submissions';

const STATUSES = ['new', 'in_progress', 'resolved', 'spam'] as const;
type SubmissionStatus = (typeof STATUSES)[number];

const FORM_TYPES = ['contact', 'claim', 'report', 'review_flag'] as const;
type FormType = (typeof FORM_TYPES)[number];

const SPAM_VIEWS = ['hide', 'all', 'only'] as const;
type SpamView = (typeof SPAM_VIEWS)[number];

const STATUS_LABELS: Record<SubmissionStatus, string> = {
  new: 'New',
  in_progress: 'In progress',
  resolved: 'Resolved',
  spam: 'Spam',
};

const FORM_TYPE_LABELS: Record<FormType, string> = {
  contact: 'Contact',
  claim: 'Claim',
  report: 'Report',
  review_flag: 'Review flag',
};

const ERRORS: Record<string, string> = {
  bad_input: 'That request was missing a submission or a value, so nothing changed.',
  not_found: 'That submission no longer exists.',
  save_failed: 'The submission could not be updated. Try again.',
};

type SubmissionRow = {
  id: string;
  form_type: string;
  payload: unknown;
  status: string;
  is_spam: boolean;
  handled_at: string | null;
  created_at: string;
};

function parseStatus(raw: string | undefined): SubmissionStatus {
  return (STATUSES as readonly string[]).includes(raw ?? '') ? (raw as SubmissionStatus) : 'new';
}

function parseFormType(raw: string | undefined): FormType | '' {
  return (FORM_TYPES as readonly string[]).includes(raw ?? '') ? (raw as FormType) : '';
}

function parseSpamView(raw: string | undefined): SpamView {
  return (SPAM_VIEWS as readonly string[]).includes(raw ?? '') ? (raw as SpamView) : 'hide';
}

function parsePage(raw: string | undefined): number {
  const n = Number.parseInt(raw ?? '1', 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/** Turns any jsonb leaf into a string. Objects and arrays are shown as their
    JSON, which is still just text by the time React renders it. */
function leafText(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'string') return value.length > 0 ? value : '—';
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return JSON.stringify(value);
}

/**
 * payload is jsonb posted by a public form: arbitrary keys, arbitrary text,
 * written by whoever filled the form in. It is rendered as escaped children and
 * nothing else — no dangerouslySetInnerHTML, and no linkification, so a URL in a
 * submission stays inert text that a moderator has to copy deliberately.
 */
function Payload({ payload }: { payload: unknown }) {
  if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) {
    return <p className="text-sm break-words whitespace-pre-line">{leafText(payload)}</p>;
  }

  const entries = Object.entries(payload as Record<string, unknown>);
  if (entries.length === 0) {
    return <p className="text-sm text-[var(--text-muted)]">Empty submission.</p>;
  }

  return (
    <dl className="grid gap-x-4 gap-y-2 sm:grid-cols-[10rem_minmax(0,1fr)]">
      {entries.map(([key, value]) => (
        <div key={key} className="contents">
          <dt className="text-xs font-semibold tracking-wide text-[var(--text-muted)] uppercase">
            {key}
          </dt>
          <dd className="text-sm break-words whitespace-pre-line">{leafText(value)}</dd>
        </div>
      ))}
    </dl>
  );
}

export default async function SubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    form_type?: string;
    spam?: string;
    page?: string;
    err?: string;
  }>;
}) {
  await requireRole('moderator', BASE);
  const sp = await searchParams;

  const status = parseStatus(sp.status);
  const formType = parseFormType(sp.form_type);
  const spamView = parseSpamView(sp.spam);
  const page = parsePage(sp.page);
  const from = (page - 1) * PER_PAGE;

  const supabase = await createClient();

  // The two secondary filters are expressed as an equality object so the counts
  // and the page itself are scoped by exactly the same predicate — a tab count
  // that disagrees with what the tab then shows is worse than no count at all.
  const scope: Record<string, string | boolean> = {};
  if (formType) scope.form_type = formType;
  if (spamView === 'hide') scope.is_spam = false;
  if (spamView === 'only') scope.is_spam = true;

  const counts = await Promise.all(
    STATUSES.map(async (value) => {
      const { count } = await supabase
        .from('form_submissions')
        .select('id', { count: 'exact', head: true })
        .match({ ...scope, status: value });
      return { value, count: count ?? 0 };
    }),
  );

  const { data, count } = await supabase
    .from('form_submissions')
    .select('id, form_type, payload, status, is_spam, handled_at, created_at', {
      count: 'exact',
    })
    .match({ ...scope, status })
    .order('created_at', { ascending: false })
    .range(from, from + PER_PAGE - 1);

  const rows = (data ?? []) as SubmissionRow[];
  const total = count ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PER_PAGE));

  const query = {
    status,
    form_type: formType || undefined,
    spam: spamView !== 'hide' ? spamView : undefined,
    page: page > 1 ? String(page) : undefined,
  };
  const returnTo = `${BASE}?${new URLSearchParams(
    Object.entries(query).filter((e): e is [string, string] => typeof e[1] === 'string'),
  ).toString()}`;
  const error = sp.err ? ERRORS[sp.err] : undefined;

  return (
    <>
      <PageHeader
        title="Inbox"
        description="Everything the public sends through a form. Treat every field as untrusted text."
      />

      {error ? (
        <p
          role="alert"
          className="rounded-[var(--radius-card)] border border-[#ecc2be] bg-[#fbeceb] px-4 py-3 text-sm text-[#96231b]"
        >
          {error}
        </p>
      ) : null}

      {/* The tabs are the primary axis. They rebuild the URL from scratch, so
          switching status resets the two secondary filters below — which is the
          behaviour an inbox wants when triaging. */}
      <FilterTabs
        basePath={BASE}
        current={status}
        options={counts.map((c) => ({
          value: c.value,
          label: STATUS_LABELS[c.value],
          count: c.count,
        }))}
      />

      {/* A plain GET form: no client JavaScript, and the resulting URL is
          bookmarkable exactly like the tabs above. */}
      <Card className="p-4">
        <form method="get" action={BASE} className="flex flex-wrap items-end gap-4">
          <input type="hidden" name="status" value={status} />
          <Select
            name="form_type"
            label="Form"
            placeholder="All forms"
            defaultValue={formType}
            className="min-w-44"
            options={FORM_TYPES.map((t) => ({ value: t, label: FORM_TYPE_LABELS[t] }))}
          />
          <Select
            name="spam"
            label="Spam-flagged"
            defaultValue={spamView}
            className="min-w-44"
            options={[
              { value: 'hide', label: 'Hidden' },
              { value: 'all', label: 'Included' },
              { value: 'only', label: 'Only spam' },
            ]}
          />
          <AdminButton type="submit" variant="secondary">
            Apply
          </AdminButton>
        </form>
      </Card>

      {rows.length === 0 ? (
        <EmptyState
          title="Nothing to read"
          body="No submission matches these filters. Widen the form or spam filter to see more."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {rows.map((row) => (
            <Card key={row.id} className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-ink-100 text-ink-600 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
                    {FORM_TYPE_LABELS[row.form_type as FormType] ?? row.form_type}
                  </span>
                  <StatusPill status={row.status} />
                  {row.is_spam ? <StatusPill status="spam" /> : null}
                </div>
                <span className="text-xs text-[var(--text-muted)]">
                  {formatDate(row.created_at)}
                  {row.handled_at ? ` · handled ${formatDate(row.handled_at)}` : ''}
                </span>
              </div>

              <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3">
                <Payload payload={row.payload} />
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[var(--border)] pt-4">
                <form action={setSubmissionStatus} className="flex flex-wrap gap-1.5">
                  <input type="hidden" name="id" value={row.id} />
                  <input type="hidden" name="returnTo" value={returnTo} />
                  {STATUSES.filter((s) => s !== row.status && s !== 'spam').map((s) => (
                    <AdminButton
                      key={s}
                      type="submit"
                      name="status"
                      value={s}
                      variant={s === 'resolved' ? 'primary' : 'secondary'}
                    >
                      {STATUS_LABELS[s]}
                    </AdminButton>
                  ))}
                </form>

                <form action={setSubmissionSpam} className="ml-auto">
                  <input type="hidden" name="id" value={row.id} />
                  <input type="hidden" name="returnTo" value={returnTo} />
                  <input type="hidden" name="is_spam" value={row.is_spam ? 'false' : 'true'} />
                  <AdminButton type="submit" variant={row.is_spam ? 'secondary' : 'danger'}>
                    {row.is_spam ? 'Not spam' : 'Mark as spam'}
                  </AdminButton>
                </form>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Pager basePath={BASE} query={query} page={page} pageCount={pageCount} />
    </>
  );
}
