'use client';

/*
 * Seven days, three legal shapes each — the UI twin of opening_hours_shape
 * (supabase/migrations/0003). The mode radio is what makes the shape explicit:
 * picking Closed or 24 hours disables and clears the time inputs, so the
 * database check can never fire from this form.
 *
 * A day whose mode is "Not set" posts an empty mode and is dropped before
 * validation, which is how "this business publishes no hours" is stored — the
 * row simply does not exist. That is a different statement from "closed".
 */

import { useState } from 'react';
import { DAY_NAMES, type HourMode } from '@/lib/listing-schema';

export type OpeningHourValue = {
  mode: HourMode | '';
  opensAt: string;
  closesAt: string;
};

export type OpeningHoursValue = OpeningHourValue[];

/** Seven "not set" rows — the default for a brand new listing. */
export function emptyOpeningHours(): OpeningHoursValue {
  return DAY_NAMES.map(() => ({ mode: '' as const, opensAt: '', closesAt: '' }));
}

const MODES: { value: HourMode | ''; label: string }[] = [
  { value: '', label: 'Not set' },
  { value: 'open', label: 'Open' },
  { value: 'closed', label: 'Closed' },
  { value: '24h', label: '24 hours' },
];

export function OpeningHoursField({
  initial,
  error,
}: {
  initial: OpeningHoursValue;
  error?: string | string[];
}) {
  const [days, setDays] = useState<OpeningHoursValue>(initial);

  const update = (index: number, patch: Partial<OpeningHourValue>) => {
    setDays((current) => current.map((day, i) => (i === index ? { ...day, ...patch } : day)));
  };

  const setMode = (index: number, mode: HourMode | '') => {
    // Clearing the times on the way out of "Open" is the whole point: leftover
    // times on a Closed row are exactly what the DB check rejects.
    update(index, mode === 'open' ? { mode } : { mode, opensAt: '', closesAt: '' });
  };

  /** Copies Monday's shape onto Tuesday–Friday, which is what most listings need. */
  const copyWeekdays = () => {
    setDays((current) => {
      const monday = current[1];
      return current.map((day, i) => (i >= 2 && i <= 5 ? { ...monday } : day));
    });
  };

  const messages = Array.isArray(error) ? error : error ? [error] : [];

  return (
    <div className="flex flex-col gap-3">
      {messages.length > 0 ? (
        <p role="alert" className="text-xs font-medium text-red-700">
          {messages.join(' ')}
        </p>
      ) : null}

      <ul className="flex flex-col gap-3">
        {DAY_NAMES.map((dayName, index) => {
          const day = days[index];
          const isOpen = day.mode === 'open';
          return (
            <li
              key={dayName}
              className="flex flex-col gap-2 rounded-lg border border-[var(--border)] p-3 sm:flex-row sm:items-center sm:gap-4"
            >
              <span className="w-24 shrink-0 text-sm font-medium">{dayName}</span>

              <fieldset className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                <legend className="sr-only">{dayName} opening mode</legend>
                {MODES.map((mode) => (
                  <label
                    key={`${dayName}-${mode.value || 'none'}`}
                    className="flex items-center gap-1.5 text-sm"
                  >
                    <input
                      type="radio"
                      name={`hours_mode_${index}`}
                      value={mode.value}
                      checked={day.mode === mode.value}
                      onChange={() => setMode(index, mode.value)}
                      className="accent-brand-700 size-4"
                    />
                    {mode.label}
                  </label>
                ))}
              </fieldset>

              <div className="flex items-center gap-2 sm:ml-auto">
                <label className="sr-only" htmlFor={`hours-open-${index}`}>
                  {dayName} opening time
                </label>
                <input
                  id={`hours-open-${index}`}
                  type="time"
                  name={`hours_open_${index}`}
                  value={day.opensAt}
                  disabled={!isOpen}
                  required={isOpen}
                  onChange={(event) => update(index, { opensAt: event.currentTarget.value })}
                  className="h-10 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 text-base disabled:bg-[var(--surface-2)] disabled:text-[var(--text-muted)] sm:text-sm"
                />
                <span aria-hidden className="text-[var(--text-muted)]">
                  –
                </span>
                <label className="sr-only" htmlFor={`hours-close-${index}`}>
                  {dayName} closing time
                </label>
                <input
                  id={`hours-close-${index}`}
                  type="time"
                  name={`hours_close_${index}`}
                  value={day.closesAt}
                  disabled={!isOpen}
                  required={isOpen}
                  onChange={(event) => update(index, { closesAt: event.currentTarget.value })}
                  className="h-10 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 text-base disabled:bg-[var(--surface-2)] disabled:text-[var(--text-muted)] sm:text-sm"
                />
              </div>
            </li>
          );
        })}
      </ul>

      <div>
        <button
          type="button"
          onClick={copyWeekdays}
          className="focus-visible:outline-brand-700 inline-flex h-9 items-center rounded-lg border border-[var(--border)] px-3 text-sm font-medium transition-colors hover:bg-[var(--surface-2)] focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Copy Monday to Tue–Fri
        </button>
      </div>

      <p className="text-xs text-[var(--text-muted)]">
        Leave a day on “Not set” to publish no hours for it. Setting every day to “Not set” means
        the listing shows no opening hours at all.
      </p>
    </div>
  );
}
