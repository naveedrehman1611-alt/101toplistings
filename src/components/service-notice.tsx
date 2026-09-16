import { hasReadFailures } from '@/lib/degrade';

/**
 * Shown when a read degraded during this request.
 *
 * Without it the page is indistinguishable from a genuinely empty directory:
 * the visitor concludes there are no businesses listed and leaves, and the
 * owner concludes their listings were deleted. The notice costs one line and
 * removes both wrong conclusions.
 *
 * It deliberately says nothing about quotas, billing or Postgres. That detail
 * belongs in the server log, where it is already written.
 */
export function ServiceNotice() {
  if (!hasReadFailures()) return null;

  return (
    <div
      role="status"
      className="mb-6 rounded-[var(--radius-card)] border border-accent-400 bg-accent-400/10 px-4 py-3 text-sm"
    >
      <p className="font-medium">Some listings could not be loaded just now.</p>
      <p className="mt-0.5 text-[var(--text-muted)]">
        This is a temporary problem on our side, not a change to the directory. Please try again in
        a few minutes.
      </p>
    </div>
  );
}
