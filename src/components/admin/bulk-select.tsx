'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Progressive enhancement for the listings bulk form (form id `formId`):
 * a select-all checkbox, a live "N selected" count, a reason box that shows
 * only for Reject, and a confirm step before Delete. Without JavaScript the
 * per-row checkboxes and the bulk form still work.
 */

function boxes(formId: string): HTMLInputElement[] {
  return Array.from(
    document.querySelectorAll<HTMLInputElement>(
      `input[type="checkbox"][name="ids"][form="${formId}"]`,
    ),
  );
}

function useSelectedCount(formId: string): number {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const update = () => setCount(boxes(formId).filter((b) => b.checked).length);
    update();
    document.addEventListener('change', update);
    return () => document.removeEventListener('change', update);
  }, [formId]);
  return count;
}

export function SelectAll({ formId }: { formId: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const count = useSelectedCount(formId);
  useEffect(() => {
    const total = boxes(formId).length;
    if (!ref.current) return;
    ref.current.checked = total > 0 && count === total;
    ref.current.indeterminate = count > 0 && count < total;
  }, [count, formId]);
  return (
    <input
      ref={ref}
      type="checkbox"
      aria-label="Select every listing on this page"
      className="size-4 accent-[var(--color-primary-container)]"
      onChange={(e) => {
        for (const b of boxes(formId)) b.checked = e.target.checked;
        document.dispatchEvent(new Event('change'));
      }}
    />
  );
}

export function BulkControls({ formId, canDelete }: { formId: string; canDelete: boolean }) {
  const count = useSelectedCount(formId);
  const [op, setOp] = useState('');
  return (
    <div className="flex flex-wrap items-end gap-2">
      <p className="h-10 content-center text-sm font-medium" aria-live="polite">
        {count} selected
      </p>
      <label className="text-sm">
        <span className="sr-only">Bulk action</span>
        <select
          name="op"
          form={formId}
          required
          value={op}
          onChange={(e) => setOp(e.target.value)}
          className="h-10 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm"
        >
          <option value="">Bulk action…</option>
          <option value="approve">Approve</option>
          <option value="reject">Reject (with reason)</option>
          <option value="suspend">Suspend</option>
          <option value="pending">Move to pending</option>
          <option value="draft">Move to draft</option>
          <option value="feature">Feature</option>
          <option value="unfeature">Unfeature</option>
          <option value="verify">Mark verified</option>
          <option value="unverify">Mark unverified</option>
          {canDelete ? <option value="delete">Delete permanently</option> : null}
        </select>
      </label>
      {op === 'reject' ? (
        <label className="min-w-64 flex-1 text-sm">
          <span className="sr-only">Reason for rejecting</span>
          <input
            name="reason"
            form={formId}
            required
            maxLength={1000}
            placeholder="Reason (emailed to the owner)"
            className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm"
          />
        </label>
      ) : null}
      <button
        type="submit"
        form={formId}
        disabled={count === 0}
        onClick={(e) => {
          if (
            op === 'delete' &&
            !window.confirm(`Delete ${count} listing(s) permanently? This cannot be undone.`)
          ) {
            e.preventDefault();
          }
        }}
        className="bg-primary-container text-on-primary h-10 rounded-lg px-4 text-sm font-medium disabled:opacity-50"
      >
        Apply
      </button>
    </div>
  );
}
