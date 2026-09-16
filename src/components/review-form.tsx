'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { Input, RadioGroup, SubmitButton, Textarea } from '@/components/form';
import { submitReview, type ReviewFormState } from '@/app/listing/[slug]/review-actions';

/**
 * Public review form. Anyone may write one (migration 0015) — there is no
 * account, so the only things standing between this control and the moderation
 * queue are the two quiet spam checks below and the validation the action
 * repeats server-side.
 *
 * The moderation step is stated *before* the visitor types: finding out after
 * submitting that nothing will appear is the kind of surprise that produces a
 * second, angrier review.
 */

const RATINGS = [
  { value: '5', label: '5 — Excellent' },
  { value: '4', label: '4 — Good' },
  { value: '3', label: '3 — Average' },
  { value: '2', label: '2 — Poor' },
  { value: '1', label: '1 — Terrible' },
];

const BODY_MIN = 20;

/* Lives here rather than beside the action: a 'use server' module can only
   export async functions. */
const INITIAL_STATE: ReviewFormState = { status: 'idle', message: null, fieldErrors: {} };

export function ReviewForm({
  listingId,
  listingName,
}: {
  listingId: string;
  listingName?: string;
}) {
  const [state, formAction] = useActionState<ReviewFormState, FormData>(
    submitReview,
    INITIAL_STATE,
  );
  const [bodyLength, setBodyLength] = useState(0);

  // Time-to-submit check. The initial value comes from render so a visitor with
  // JavaScript disabled still posts a usable timestamp; the effect then replaces
  // it with the real page-load time, because the listing page is cached and its
  // rendered timestamp can be minutes old.
  const startedAtRef = useRef<HTMLInputElement>(null);
  const [renderedAt] = useState(() => Date.now());
  useEffect(() => {
    if (startedAtRef.current) startedAtRef.current.value = String(Date.now());
  }, []);

  if (state.status === 'success') {
    return (
      <div
        role="status"
        className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface-2)] p-5"
      >
        <p className="font-display font-semibold">Review received</p>
        <p className="mt-2 text-sm text-[var(--text-muted)]">{state.message}</p>
      </div>
    );
  }

  const remaining = BODY_MIN - bodyLength;

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-5">
      <input type="hidden" name="listingId" value={listingId} />

      {/* Spam trap: hidden from people (and from screen readers), filled in by
          bots that parse the DOM. tabIndex/autoComplete keep it out of the way
          of anyone tabbing through the form. */}
      <div aria-hidden className="hidden">
        <label htmlFor="company">Company</label>
        <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <input
        ref={startedAtRef}
        type="hidden"
        name="startedAt"
        defaultValue={renderedAt}
        suppressHydrationWarning
      />

      <p className="text-sm text-[var(--text-muted)]">
        {listingName
          ? `Tell others about your experience with ${listingName}.`
          : 'Tell others about your experience.'}{' '}
        No account needed. Every review is read by a moderator before it appears on this page.
      </p>

      {state.status === 'error' && state.message ? (
        <p role="alert" className="text-sm font-medium text-red-700">
          {state.message}
        </p>
      ) : null}

      <RadioGroup
        name="rating"
        label="Your rating"
        required
        options={RATINGS}
        error={state.fieldErrors.rating}
        columns={2}
      />

      <Input
        name="authorName"
        label="Your name"
        required
        minLength={2}
        maxLength={80}
        autoComplete="name"
        hint="Shown next to your review."
        error={state.fieldErrors.authorName}
      />

      <Input
        name="authorEmail"
        label="Email"
        type="email"
        autoComplete="email"
        hint="Optional. Never shown publicly — it is only so a moderator can reach you."
        error={state.fieldErrors.authorEmail}
      />

      <Input
        name="title"
        label="Headline"
        maxLength={120}
        hint="Optional. A short summary, e.g. “Quick, friendly, fair price”."
        error={state.fieldErrors.title}
      />

      <Textarea
        name="body"
        label="Your review"
        required
        rows={6}
        minLength={BODY_MIN}
        maxLength={5000}
        showCount
        hint={`At least ${BODY_MIN} characters.`}
        error={state.fieldErrors.body}
        onChange={(event) => setBodyLength(event.currentTarget.value.length)}
      />

      {/* Live, separate from the character counter: the counter says how much has
          been written, this says how much is still missing. */}
      <p aria-live="polite" className="-mt-3 text-xs text-[var(--text-muted)]">
        {remaining > 0
          ? `${remaining} more ${remaining === 1 ? 'character' : 'characters'} needed.`
          : 'Long enough — thank you.'}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton pendingLabel="Sending…">Submit review</SubmitButton>
        <span className="text-xs text-[var(--text-muted)]">
          Checked by a moderator before it appears.
        </span>
      </div>
    </form>
  );
}
