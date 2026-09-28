'use client';

import { useSyncExternalStore } from 'react';
import type { OpeningHour } from '@/lib/queries';
import { openStatus } from '@/lib/hours';

const MINUTE = 60_000;

function subscribe(onChange: () => void) {
  const id = window.setInterval(onChange, MINUTE);
  return () => window.clearInterval(id);
}

const currentMinute = () => Math.floor(Date.now() / MINUTE);
const noMinuteOnServer = () => null;

/**
 * Live "Open now" / "Closed now" badge.
 *
 * Worked out in the browser, never at render: listing pages are ISR-cached for
 * minutes at a time and the server clock is UTC, so a server-rendered status
 * would be wrong for part of every day. The server snapshot is null, so the
 * badge renders nothing until hydration (no mismatch), then re-checks every
 * minute. The clock is the business's own time zone (see lib/hours.ts).
 */
export function OpenStatusBadge({
  hours,
  showDetail = false,
}: {
  hours: OpeningHour[];
  showDetail?: boolean;
}) {
  const minute = useSyncExternalStore(subscribe, currentMinute, noMinuteOnServer);
  if (minute === null) return null;
  const status = openStatus(hours, new Date(minute * MINUTE));
  if (!status) return null;

  return (
    <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
          status.open ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
        }`}
      >
        <span
          aria-hidden
          className={`size-1.5 rounded-full ${status.open ? 'bg-emerald-500' : 'bg-red-500'}`}
        />
        {status.open ? 'Open now' : 'Closed now'}
      </span>
      {showDetail && status.detail ? (
        <span className="text-xs text-[var(--text-muted)]">{status.detail}</span>
      ) : null}
    </span>
  );
}
