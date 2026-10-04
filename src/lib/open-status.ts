/**
 * "Open now" from a listing's weekly hours. There are no runtime imports, so a
 * server component, a client component or a test can use it as it is.
 */

export type HoursRow = {
  day_of_week: number;
  opens_at: string | null;
  closes_at: string | null;
  is_closed: boolean;
  is_24h: boolean;
};

const WEEKDAYS: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

// Building a DateTimeFormat costs far more than formatting with one, and a page
// of results asks for the same zone once per row.
const formatters = new Map<string, Intl.DateTimeFormat>();

/** Weekday (0 = Sunday) and minutes since midnight at `now` in `timeZone`. */
function localTime(now: Date, timeZone: string): { day: number; minutes: number } {
  let format = formatters.get(timeZone);
  if (!format) {
    format = new Intl.DateTimeFormat('en-US', {
      timeZone,
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    });
    formatters.set(timeZone, format);
  }
  const parts = Object.fromEntries(format.formatToParts(now).map((p) => [p.type, p.value]));
  return { day: WEEKDAYS[parts.weekday], minutes: Number(parts.hour) * 60 + Number(parts.minute) };
}

/** Postgres returns 'HH:MM:SS'; the owner form sends 'HH:MM'. */
function toMinutes(time: string): number {
  const [hours, minutes] = time.split(':');
  return Number(hours) * 60 + Number(minutes);
}

/** A day's [opens, closes] in minutes; null when it is closed, 24h or has no times. */
function span(row: HoursRow | undefined): [number, number] | null {
  if (!row || row.is_closed || row.is_24h || !row.opens_at || !row.closes_at) return null;
  return [toMinutes(row.opens_at), toMinutes(row.closes_at)];
}

/**
 * Null when no hours are on file at all. Otherwise a day without a row counts
 * as closed: the owner form writes no row for a day it leaves unset. A range
 * that closes before it opens (22:00–02:00) runs past midnight into the next
 * day, and one that closes when it opens is empty.
 */
export function openStatus(
  hours: HoursRow[],
  now: Date,
  timeZone: string,
): 'open' | 'closed' | null {
  if (hours.length === 0) return null;
  const { day, minutes } = localTime(now, timeZone);
  const today = hours.find((h) => h.day_of_week === day);
  if (today?.is_24h) return 'open';

  const todaySpan = span(today);
  if (todaySpan) {
    const [opens, closes] = todaySpan;
    if (opens < closes && opens <= minutes && minutes < closes) return 'open';
    // Overnight: today's share runs from opening to midnight.
    if (opens > closes && minutes >= opens) return 'open';
  }

  // ...and the rest of yesterday's overnight range runs from midnight to closing.
  const yesterdaySpan = span(hours.find((h) => h.day_of_week === (day + 6) % 7));
  if (yesterdaySpan) {
    const [opens, closes] = yesterdaySpan;
    if (opens > closes && minutes < closes) return 'open';
  }
  return 'closed';
}
