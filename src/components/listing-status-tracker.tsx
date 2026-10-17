import Link from 'next/link';

/**
 * Where an owner's listing is in review, and what happens next:
 * Submitted -> Under review -> Live. A rejected listing shows the reason and
 * the way back into review; suspended and draft explain themselves.
 */

type Props = {
  id: string;
  slug: string;
  status: string;
  rejectionNote: string | null;
  createdAt: string;
  publishedAt: string | null;
};

type StepState = 'done' | 'current' | 'todo' | 'failed';

const date = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export function ListingStatusTracker({
  id,
  slug,
  status,
  rejectionNote,
  createdAt,
  publishedAt,
}: Props) {
  const steps: { title: string; detail: string; state: StepState }[] = [
    { title: 'Submitted', detail: `Received on ${date(createdAt)}.`, state: 'done' },
    status === 'rejected'
      ? {
          title: 'Not approved',
          detail: rejectionNote
            ? `Reason: ${rejectionNote}`
            : 'Our team could not approve it yet. Reply to our email to find out why.',
          state: 'failed',
        }
      : {
          title: 'Under review',
          detail:
            status === 'pending'
              ? 'Our team is checking your details, usually within 24 to 48 hours.'
              : 'Checked by our team.',
          state: status === 'pending' ? 'current' : status === 'approved' ? 'done' : 'todo',
        },
    {
      title: 'Live',
      detail:
        status === 'approved'
          ? `Live since ${date(publishedAt ?? createdAt)}. Customers can find you in search.`
          : 'We email you the moment it goes live.',
      state: status === 'approved' ? 'done' : 'todo',
    },
  ];

  const next: Record<string, string> = {
    pending: 'What happens next: once approved, your listing goes live and we email you.',
    approved:
      'What happens next: follow up with us to get featured and reach more customers. Just reply to the approval email.',
    rejected:
      'What happens next: update your listing and save it. It goes straight back into review.',
    suspended: 'This listing is hidden for now. Contact us to have it restored.',
    draft: 'This listing is a draft and has not been sent for review.',
  };

  return (
    <div className="mt-3">
      <ol className="grid gap-2 sm:grid-cols-3" aria-label="Review progress">
        {steps.map((s, i) => (
          <li
            key={s.title}
            aria-current={s.state === 'current' ? 'step' : undefined}
            className={`rounded-lg border p-3 text-sm ${
              s.state === 'current'
                ? 'border-amber-400 bg-amber-50'
                : s.state === 'failed'
                  ? 'border-red-300 bg-red-50'
                  : s.state === 'done'
                    ? 'border-brand-500/40 bg-brand-50'
                    : 'border-[var(--border)]'
            }`}
          >
            <p className="flex items-center gap-2 font-medium">
              <span
                aria-hidden
                className={`inline-flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
                  s.state === 'done'
                    ? 'bg-primary-container'
                    : s.state === 'current'
                      ? 'bg-amber-500'
                      : s.state === 'failed'
                        ? 'bg-red-600'
                        : 'bg-zinc-300'
                }`}
              >
                {s.state === 'done' ? '✓' : s.state === 'failed' ? '!' : i + 1}
              </span>
              {s.title}
              {s.state === 'current' ? <span className="sr-only">(current step)</span> : null}
            </p>
            <p className="mt-1 text-[var(--text-muted)]">{s.detail}</p>
          </li>
        ))}
      </ol>
      <p className="mt-2 text-sm">
        {next[status] ?? ''}{' '}
        {status === 'rejected' ? (
          <Link
            href={`/dashboard/listings/${id}`}
            className="text-brand-700 font-medium hover:underline"
          >
            Fix and resubmit →
          </Link>
        ) : status === 'approved' ? (
          <Link href={`/listing/${slug}`} className="text-brand-700 font-medium hover:underline">
            View live listing →
          </Link>
        ) : null}
      </p>
    </div>
  );
}
