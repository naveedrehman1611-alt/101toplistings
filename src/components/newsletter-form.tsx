'use client';

import { useActionState, useId, useState } from 'react';
import { subscribeNewsletter } from '@/lib/public-actions';

type State = Awaited<ReturnType<typeof subscribeNewsletter>>;

const initialState: State = { ok: false, message: '' };

/** Footer newsletter sign-up. Stays on the page and reports the result inline. */
export function NewsletterForm() {
  const id = useId();
  const [state, formAction, pending] = useActionState(subscribeNewsletter, initialState);
  // React resets the form whenever the action returns, errors included. Using
  // the last address as the default value keeps a rejected one there to fix.
  const [lastEmail, setLastEmail] = useState('');

  return (
    <div>
      <form
        action={formAction}
        onSubmit={(event) =>
          setLastEmail(new FormData(event.currentTarget).get('email')?.toString() ?? '')
        }
        className="flex flex-col gap-2 pt-1 sm:flex-row"
      >
        <label htmlFor={`${id}-email`} className="sr-only">
          Email address
        </label>
        <input
          id={`${id}-email`}
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="Enter your email"
          defaultValue={state.ok ? '' : lastEmail}
          className="bg-surface-container-low text-on-surface font-body-sm text-body-sm focus:ring-primary-container min-w-0 flex-1 rounded-lg px-4 py-2.5 focus:ring-2 focus:outline-hidden"
        />
        {/* Honeypot, as on the contact form: people never see it, bots fill it in. */}
        <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label>
            Website
            <input name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
        <button
          type="submit"
          disabled={pending}
          className="bg-primary-container text-on-primary font-label-md text-label-md hover:bg-primary focus-visible:outline-primary-container shrink-0 rounded-lg px-5 py-2.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-wait disabled:opacity-70"
        >
          {pending ? 'Subscribing…' : 'Subscribe'}
        </button>
      </form>
      {/* Both regions are always in the page so screen readers announce changes. */}
      <p
        role="status"
        className="font-label-sm text-label-sm text-primary-container not-empty:mt-2"
      >
        {state.ok ? state.message : null}
      </p>
      <p role="alert" className="font-label-sm text-label-sm text-error not-empty:mt-2">
        {state.ok ? null : state.message}
      </p>
    </div>
  );
}
