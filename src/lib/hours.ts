import type { OpeningHour } from './queries';

/**
 * Every listing on the site is in Pakistan (migration 0017), and opening hours
 * are stored as local wall-clock times there. Open/closed is always worked out
 * in this zone, never the server's (UTC) or the visitor's.
 */
export const BUSINESS_TIME_ZONE = 'Asia/Karachi';

export const DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

/** Monday-first, the way the business week reads. day_of_week itself stays 0 = Sunday. */
export function mondayFirst<T extends { day_of_week: number }>(rows: T[]): T[] {
  return [...rows].sort((a, b) => ((a.day_of_week + 6) % 7) - ((b.day_of_week + 6) % 7));
}

/** "09:30:00" → "9:30 AM". */
export function formatTime(t: string | null): string {
  if (!t) return '';
  const [h, m] = t.split(':');
  const hour = Number(h);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:${m} ${suffix}`;
}

/** The text for one day's row: real times, never "Open All Day" for a range. */
export function hoursLabel(h: OpeningHour): string {
  if (h.is_closed) return 'Closed';
  if (h.is_24h) return 'Open 24 hours';
  return `${formatTime(h.opens_at)} – ${formatTime(h.closes_at)}`;
}

function toMinutes(t: string): number {
  const [h, m] = t.split(':');
  return Number(h) * 60 + Number(m);
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Weekday (0 = Sunday) and minutes since midnight at `date`, in `timeZone`. */
export function localClock(
  date: Date,
  timeZone: string = BUSINESS_TIME_ZONE,
): { day: number; minute: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  return {
    day: WEEKDAYS.indexOf(get('weekday')),
    minute: Number(get('hour')) * 60 + Number(get('minute')),
  };
}

export type OpenStatus = {
  open: boolean;
  /** Short qualifier such as "Closes 6:00 PM"; null when there is nothing useful to add. */
  detail: string | null;
};

/**
 * Open or closed at `date`. A range that closes at or before it opens (18:00 –
 * 02:00) runs past midnight, so yesterday's row can still be open in the small
 * hours. Returns null when the listing has no row for today: that is unknown,
 * not closed, and nothing is shown rather than a guess.
 */
export function openStatus(
  hours: OpeningHour[],
  date: Date,
  timeZone: string = BUSINESS_TIME_ZONE,
): OpenStatus | null {
  if (hours.length === 0) return null;
  const { day, minute } = localClock(date, timeZone);
  const byDay = new Map(hours.map((h) => [h.day_of_week, h]));

  const yesterday = byDay.get((day + 6) % 7);
  if (yesterday?.opens_at && yesterday.closes_at && !yesterday.is_closed && !yesterday.is_24h) {
    const opens = toMinutes(yesterday.opens_at);
    const closes = toMinutes(yesterday.closes_at);
    if (closes <= opens && minute < closes) {
      return { open: true, detail: `Closes ${formatTime(yesterday.closes_at)}` };
    }
  }

  const today = byDay.get(day);
  if (!today) return null;
  if (today.is_closed) return { open: false, detail: 'Closed today' };
  if (today.is_24h) return { open: true, detail: 'Open 24 hours' };
  if (!today.opens_at || !today.closes_at) return null;

  const opens = toMinutes(today.opens_at);
  const closes = toMinutes(today.closes_at);
  const overnight = closes <= opens;
  const isOpen = overnight ? minute >= opens : minute >= opens && minute < closes;
  if (isOpen) return { open: true, detail: `Closes ${formatTime(today.closes_at)}` };
  if (minute < opens) return { open: false, detail: `Opens ${formatTime(today.opens_at)}` };
  return { open: false, detail: null };
}
