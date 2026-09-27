'use client';

import { useSyncExternalStore } from 'react';
import type { OpeningHourVM } from '@/lib/home-types';

/**
 * The Open / Closed pill on a business card. Hours are stored in Pakistan time,
 * so "now" is read in Asia/Karachi whatever the visitor's clock says. The page
 * around it is static, so the status can only be worked out in the browser: the
 * server snapshot is null, which keeps the server HTML and the hydrating render
 * identical, and the pill appears once the client takes over.
 */

type Status = 'open' | 'closed' | null;

const WEEKDAY: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
const DAY_MINUTES = 24 * 60;

let karachiClock: Intl.DateTimeFormat | undefined;

/** Day of the week (0 = Sunday) and minutes since midnight, in Pakistan. */
function karachiNow(date: Date): { day: number; minutes: number } {
  karachiClock ??= new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Karachi',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
  let day = 0;
  let minutes = 0;
  for (const part of karachiClock.formatToParts(date)) {
    if (part.type === 'weekday') day = WEEKDAY[part.value] ?? 0;
    else if (part.type === 'hour') minutes += (Number(part.value) % 24) * 60;
    else if (part.type === 'minute') minutes += Number(part.value);
  }
  return { day, minutes };
}

/** "HH:MM" as minutes since midnight; "24:00" is the end of the day. */
function toMinutes(value: string | null): number | null {
  const match = value ? /^(\d{1,2}):(\d{2})/.exec(value) : null;
  if (!match) return null;
  const minutes = Number(match[1]) * 60 + Number(match[2]);
  return minutes <= DAY_MINUTES ? minutes : null;
}

function statusAt(hours: OpeningHourVM[], now: { day: number; minutes: number }): Status {
  const yesterday = (now.day + 6) % 7;
  let known = false;
  for (const h of hours) {
    if (h.closed || h.allDay) {
      known = true;
      if (h.allDay && h.day === now.day) return 'open';
      continue;
    }
    const opens = toMinutes(h.opens);
    const closes = toMinutes(h.closes);
    if (opens === null || closes === null) continue;
    known = true;
    // Closing at or before the opening time means the day runs past midnight.
    const overnight = closes <= opens;
    if (h.day === now.day) {
      if (now.minutes >= opens && (overnight || now.minutes < closes)) return 'open';
    } else if (overnight && h.day === yesterday && now.minutes < closes) {
      return 'open';
    }
  }
  // Hours that say nothing usable show no badge rather than a guess.
  return known ? 'closed' : null;
}

// One timer for every pill on the page, running only while one is mounted.
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | undefined;

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  timer ??= setInterval(() => listeners.forEach((listener) => listener()), 60_000);
  return () => {
    listeners.delete(onChange);
    if (listeners.size === 0 && timer !== undefined) {
      clearInterval(timer);
      timer = undefined;
    }
  };
}

const serverSnapshot = (): Status => null;

export function OpenStatus({
  hours,
  className = '',
}: {
  hours: OpeningHourVM[];
  className?: string;
}) {
  const status = useSyncExternalStore(
    subscribe,
    () => (hours.length ? statusAt(hours, karachiNow(new Date())) : null),
    serverSnapshot,
  );
  if (!status) return null;
  const open = status === 'open';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-0.5 text-xs font-medium text-white ring-1 ring-white/30 backdrop-blur-sm ${className}`}
    >
      <span
        aria-hidden
        className={`size-1.5 rounded-full ${open ? 'bg-emerald-400' : 'bg-red-400'}`}
      />
      {open ? 'Open' : 'Closed'}
      <span className="sr-only"> now</span>
    </span>
  );
}
