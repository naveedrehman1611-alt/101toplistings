'use client';

/*
 * listings.social_links is a jsonb array of {label, url}. The form posts it as
 * two parallel repeated fields — `social_label` and `social_url` — and
 * rawListingPayload() zips them back together by index. Each row renders both
 * inputs, so document order keeps the pairs aligned; that is the whole contract.
 */

import { useState } from 'react';
import { MAX_SOCIAL_LINKS, type SocialLink } from '@/lib/listing-schema';

type Row = SocialLink & { key: string };

function newRow(link: SocialLink = { label: '', url: '' }): Row {
  return { ...link, key: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` };
}

export function SocialLinksField({
  initial,
  error,
}: {
  initial: SocialLink[];
  error?: string | string[];
}) {
  const [rows, setRows] = useState<Row[]>(() =>
    initial.length > 0 ? initial.map((link) => newRow(link)) : [newRow()],
  );

  const update = (key: string, patch: Partial<SocialLink>) => {
    setRows((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  };

  const remove = (key: string) => {
    // Never drop to zero rows: an empty pair posts nothing (it is filtered out
    // server-side), and keeping one visible row means "add" is never the only
    // way back from an empty list.
    setRows((current) => {
      const next = current.filter((row) => row.key !== key);
      return next.length > 0 ? next : [newRow()];
    });
  };

  const messages = Array.isArray(error) ? error : error ? [error] : [];
  const atLimit = rows.length >= MAX_SOCIAL_LINKS;

  return (
    <div className="flex flex-col gap-3">
      {messages.length > 0 ? (
        <p role="alert" className="text-xs font-medium text-red-700">
          {messages.join(' ')}
        </p>
      ) : null}

      <ul className="flex flex-col gap-2">
        {rows.map((row, index) => (
          <li key={row.key} className="flex flex-col gap-2 sm:flex-row sm:items-start">
            <div className="sm:w-44">
              <label className="sr-only" htmlFor={`social-label-${index}`}>
                Social link {index + 1} label
              </label>
              <input
                id={`social-label-${index}`}
                name="social_label"
                type="text"
                value={row.label}
                maxLength={40}
                placeholder="Instagram"
                onChange={(event) => update(row.key, { label: event.currentTarget.value })}
                className="h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-base sm:text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="sr-only" htmlFor={`social-url-${index}`}>
                Social link {index + 1} URL
              </label>
              <input
                id={`social-url-${index}`}
                name="social_url"
                type="url"
                inputMode="url"
                value={row.url}
                placeholder="https://instagram.com/example"
                onChange={(event) => update(row.key, { url: event.currentTarget.value })}
                className="h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-base sm:text-sm"
              />
            </div>
            <button
              type="button"
              onClick={() => remove(row.key)}
              aria-label={`Remove social link ${index + 1}`}
              className="focus-visible:outline-brand-700 inline-flex h-11 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] px-3 text-sm transition-colors hover:bg-[var(--surface-2)] focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={atLimit}
          onClick={() => setRows((current) => [...current, newRow()])}
          className="focus-visible:outline-brand-700 inline-flex h-9 items-center rounded-lg border border-[var(--border)] px-3 text-sm font-medium transition-colors hover:bg-[var(--surface-2)] focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Add link
        </button>
        <p className="text-xs text-[var(--text-muted)]">
          {rows.length} of {MAX_SOCIAL_LINKS}. Links must be full https:// URLs.
        </p>
      </div>
    </div>
  );
}
