'use client';

import Link from 'next/link';
import { useActionState, useEffect, useRef, useState } from 'react';
import { submitListingReview } from '@/lib/review-actions';
import type { ReviewFormState } from '@/lib/review-actions';
import { REVIEW_CRITERIA } from '@/lib/review-criteria';

const INITIAL_STATE: ReviewFormState = { status: 'idle', message: '' };

const INPUT_CLASS =
  'focus:border-primary-container focus:ring-primary-container/20 font-body-md text-body-md mt-1 h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 outline-hidden focus:ring-2';

/**
 * The review form used on the listing page and on /listing/[slug]/review. It
 * works for everyone to fill in; the action decides whether the visitor is
 * signed in and, if not, sends back what they wrote so nothing is lost.
 */
export function ReviewForm({ listingId, slug }: { listingId: string; slug: string }) {
  const [state, formAction, pending] = useActionState(submitListingReview, INITIAL_STATE);
  const messageRef = useRef<HTMLDivElement>(null);

  // Each result moves focus to its message: it scrolls into view and keyboard
  // and screen-reader users land on it (and on the sign-in link) directly.
  useEffect(() => {
    if (state.status !== 'idle') messageRef.current?.focus();
  }, [state]);

  if (state.status === 'ok') {
    return (
      <div
        ref={messageRef}
        tabIndex={-1}
        role="status"
        className="border-brand-500/40 bg-brand-50 text-brand-800 rounded-lg border px-4 py-3 text-sm outline-hidden"
      >
        {state.message}
      </div>
    );
  }

  const fields = state.fields ?? {};
  const back = encodeURIComponent(`/listing/${slug}#reviews`);

  return (
    <form action={formAction} className="space-y-5">
      {state.status === 'error' ? (
        <div
          ref={messageRef}
          tabIndex={-1}
          role="alert"
          className="border-error/30 bg-error-container/40 text-on-error-container rounded-lg border px-4 py-3 text-sm outline-hidden"
        >
          {state.message}
        </div>
      ) : state.status === 'signin' ? (
        <div
          ref={messageRef}
          tabIndex={-1}
          role="alert"
          className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm outline-hidden"
        >
          <p>{state.message}</p>
          <p className="mt-1">
            <Link
              href={`/login?next=${back}`}
              className="text-primary-container font-medium hover:underline"
            >
              Sign in
            </Link>{' '}
            or{' '}
            <Link
              href={`/register?next=${back}`}
              className="text-primary-container font-medium hover:underline"
            >
              create an account
            </Link>{' '}
            — you will come straight back to the reviews.
          </p>
        </div>
      ) : null}

      <input type="hidden" name="listing_id" value={listingId} />
      <input type="hidden" name="slug" value={slug} />

      <StarRating name="rating" legend="Overall rating" required initial={fields.rating} />

      <fieldset>
        <legend className="font-label-md text-label-md">
          Rate the details <span className="text-secondary font-normal">(optional)</span>
        </legend>
        <div className="mt-2 grid gap-4 sm:grid-cols-3">
          {REVIEW_CRITERIA.map(({ key, label }) => (
            <StarRating key={key} name={key} legend={label} initial={fields[key]} small />
          ))}
        </div>
      </fieldset>

      <label className="block">
        <span className="font-label-md text-label-md">
          Title <span className="text-secondary font-normal">(optional)</span>
        </span>
        <input name="title" maxLength={120} defaultValue={fields.title} className={INPUT_CLASS} />
      </label>

      <label className="block">
        <span className="font-label-md text-label-md">Your review</span>
        <textarea
          name="body"
          required
          minLength={10}
          maxLength={3000}
          rows={5}
          defaultValue={fields.body}
          className="focus:border-primary-container focus:ring-primary-container/20 font-body-md text-body-md mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 outline-hidden focus:ring-2"
        />
      </label>

      <p className="font-body-sm text-body-sm text-secondary">
        Reviews are posted from your RankYouSite account and checked before they appear.
      </p>

      <button
        type="submit"
        disabled={pending}
        className="bg-primary-container text-on-primary hover:bg-primary font-label-md text-label-md focus-visible:ring-primary-container inline-flex h-11 items-center justify-center gap-2 rounded-lg px-5 shadow-xs transition hover:shadow-[0_4px_12px_rgba(4,120,87,0.25)] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:opacity-60"
      >
        {pending ? 'Submitting…' : 'Submit Review'}
      </button>
    </form>
  );
}

/**
 * Five radio inputs drawn as stars. The radios stay uncontrolled: `defaultChecked`
 * follows the chosen value, so React's automatic reset after the action puts the
 * same choice back instead of clearing it.
 */
function StarRating({
  name,
  legend,
  initial,
  required = false,
  small = false,
}: {
  name: string;
  legend: string;
  initial?: string;
  required?: boolean;
  small?: boolean;
}) {
  const [value, setValue] = useState(() => Number(initial) || 0);
  const groupRef = useRef<HTMLFieldSetElement>(null);

  function clear() {
    const inputs = groupRef.current?.querySelectorAll('input') ?? [];
    for (const input of inputs) input.checked = false;
    setValue(0);
    inputs[0]?.focus();
  }

  return (
    <fieldset ref={groupRef}>
      <legend className="font-label-md text-label-md">{legend}</legend>
      <div className="mt-1 flex items-center gap-2">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className="relative cursor-pointer">
              <input
                type="radio"
                name={name}
                value={n}
                required={required}
                defaultChecked={value === n}
                onChange={() => setValue(n)}
                className="peer sr-only"
              />
              <span
                aria-hidden
                className={`peer-focus-visible:ring-primary-container block rounded px-0.5 leading-none transition-colors peer-focus-visible:ring-2 ${
                  small ? 'text-2xl' : 'text-3xl'
                } ${n <= value ? 'text-rating-star' : 'text-ink-400'}`}
              >
                ★
              </span>
              <span className="sr-only">
                {n} {n === 1 ? 'star' : 'stars'}
              </span>
            </label>
          ))}
        </div>
        {!required && value > 0 ? (
          <button
            type="button"
            onClick={clear}
            className="font-label-sm text-label-sm text-secondary hover:underline"
          >
            Clear<span className="sr-only"> {legend.toLowerCase()} rating</span>
          </button>
        ) : null}
      </div>
    </fieldset>
  );
}
