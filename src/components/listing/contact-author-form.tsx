'use client';

import { useActionState } from 'react';
import { sendListingMessage, type ListingMessageState } from '@/lib/listing-message-actions';

const initialState: ListingMessageState = { status: 'idle', message: '' };

const input =
  'focus:border-primary-container focus:ring-primary-container/20 font-body-md text-body-md mt-1 h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 outline-hidden focus:ring-2';
const textarea =
  'focus:border-primary-container focus:ring-primary-container/20 font-body-md text-body-md mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 outline-hidden focus:ring-2';

/**
 * Private message to the business, sent through RankYouSite (see
 * sendListingMessage). On error the typed values come back from the action and
 * are restored through defaultValue, because React resets the form after
 * every submission.
 */
export function ContactAuthorForm({
  listingId,
  slug,
  name,
}: {
  listingId: string;
  slug: string;
  name: string;
}) {
  const [state, formAction, pending] = useActionState(sendListingMessage, initialState);
  const sent = state.status === 'ok';
  const f = state.status === 'error' ? (state.fields ?? {}) : {};

  return (
    <section id="contact-author" className="surface-card scroll-mt-24 p-5">
      <h2 className="font-title-md text-title-md text-on-surface">Contact Author</h2>
      <h3 className="font-label-md text-label-md text-secondary mt-1">Send message to “{name}”</h3>

      {/* Always mounted so screen readers announce the confirmation when it appears. */}
      <div role="status">
        {sent ? (
          <p className="border-brand-500/40 bg-brand-50 text-brand-800 mt-4 rounded-lg border px-4 py-3 text-sm">
            {state.message}
          </p>
        ) : null}
      </div>

      {sent ? null : (
        <form action={formAction} className="mt-4 space-y-4">
          {state.status === 'error' ? (
            <p
              role="alert"
              className="border-error/30 bg-error-container/40 text-on-error-container rounded-lg border px-4 py-3 text-sm"
            >
              {state.message}
            </p>
          ) : null}

          <input type="hidden" name="listing_id" value={listingId} />
          <input type="hidden" name="listing_slug" value={slug} />
          <input type="hidden" name="listing_name" value={name} />

          <label className="block">
            <span className="font-label-md text-label-md">Name</span>
            <input
              name="name"
              required
              maxLength={120}
              autoComplete="name"
              defaultValue={f.name}
              className={input}
            />
          </label>
          <label className="block">
            <span className="font-label-md text-label-md">Email</span>
            <input
              name="email"
              type="email"
              required
              maxLength={200}
              autoComplete="email"
              defaultValue={f.email}
              className={input}
            />
          </label>
          <label className="block">
            <span className="font-label-md text-label-md">Phone (optional)</span>
            <input
              name="phone"
              type="tel"
              maxLength={40}
              autoComplete="tel"
              defaultValue={f.phone}
              className={input}
            />
          </label>
          <label className="block">
            <span className="font-label-md text-label-md">Message</span>
            <textarea
              name="message"
              required
              rows={4}
              minLength={10}
              maxLength={3000}
              defaultValue={f.message}
              className={textarea}
            />
          </label>
          <label className="font-body-md text-body-md flex items-start gap-2">
            <input
              type="checkbox"
              name="terms"
              required
              defaultChecked={f.terms === 'on'}
              className="accent-primary-container mt-1 size-4 shrink-0"
            />
            <span>I agree to share these details with {name} so they can reply.</span>
          </label>

          {/* Honeypot: hidden from people, filled in by bots. */}
          <input
            type="text"
            name="website"
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden
          />

          <button
            type="submit"
            disabled={pending}
            className="bg-primary-container text-on-primary hover:bg-primary font-label-md text-label-md focus-visible:ring-primary-container inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg px-5 shadow-xs transition hover:shadow-[0_4px_12px_rgba(12,130,38,0.25)] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:opacity-60"
          >
            {pending ? 'Sending…' : 'Send Private Message'}
          </button>
        </form>
      )}
    </section>
  );
}
