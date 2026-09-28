'use client';

import { useActionState } from 'react';
import { sendListingMessage, type ListingMessageState } from '@/lib/listing-message-actions';

const initialState: ListingMessageState = { status: 'idle', message: '' };

const input =
  'focus:border-brand-500 mt-1 h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 outline-none';
const textarea =
  'focus:border-brand-500 mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 outline-none';

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
      <h2 className="font-display text-lg font-semibold">Contact Author</h2>
      <h3 className="mt-1 text-sm font-medium text-[var(--text-muted)]">
        Send message to “{name}”
      </h3>

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
              className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800"
            >
              {state.message}
            </p>
          ) : null}

          <input type="hidden" name="listing_id" value={listingId} />
          <input type="hidden" name="listing_slug" value={slug} />
          <input type="hidden" name="listing_name" value={name} />

          <label className="block text-sm">
            <span className="font-medium">Name</span>
            <input
              name="name"
              required
              maxLength={120}
              autoComplete="name"
              defaultValue={f.name}
              className={input}
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Email</span>
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
          <label className="block text-sm">
            <span className="font-medium">Phone (optional)</span>
            <input
              name="phone"
              type="tel"
              maxLength={40}
              autoComplete="tel"
              defaultValue={f.phone}
              className={input}
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Message</span>
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
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              name="terms"
              required
              defaultChecked={f.terms === 'on'}
              className="accent-brand-700 mt-0.5 size-4 shrink-0"
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
            className="bg-brand-700 hover:bg-brand-800 inline-flex h-11 w-full items-center justify-center rounded-lg px-5 text-sm font-medium text-white disabled:opacity-60"
          >
            {pending ? 'Sending…' : 'Send Private Message'}
          </button>
        </form>
      )}
    </section>
  );
}
