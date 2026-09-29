'use client';

import { useActionState, useId, useState } from 'react';
import { subscribeNewsletter, type NewsletterState } from '@/lib/newsletter-actions';

const initialState: NewsletterState = { status: 'idle', message: '' };

// A request that never reaches the server (offline, or a deploy that retired
// the action's ID) rejects here. useActionState would rethrow that while
// rendering, and from the root layout it would replace the whole page with
// the global error screen, so it is answered like any other failure.
async function subscribe(prev: NewsletterState, fd: FormData): Promise<NewsletterState> {
  try {
    return await subscribeNewsletter(prev, fd);
  } catch {
    return { status: 'error', message: 'Subscription failed. Please try again.' };
  }
}

/** Footer newsletter sign-up. Stays on the page and reports the result inline. */
export function NewsletterForm() {
  const id = useId();
  const [state, formAction, pending] = useActionState(subscribe, initialState);
  // React resets the form whenever the action returns, errors included. Using
  // the last address as the default value keeps a rejected one there to fix.
  const [lastEmail, setLastEmail] = useState('');
  const ok = state.status === 'ok';
  const failed = state.status === 'error';

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
          defaultValue={ok ? '' : lastEmail}
          className="bg-surface-container-low text-on-surface font-body-sm text-body-sm focus:ring-primary-container min-w-0 flex-1 rounded-lg px-4 py-2.5 focus:ring-2 focus:outline-hidden"
        />
        {/* Honeypot: people never see it, bots fill it in. */}
        <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label>
            Company
            <input name="company" tabIndex={-1} autoComplete="off" />
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
        {ok ? state.message : null}
      </p>
      <p role="alert" className="font-label-sm text-label-sm text-error not-empty:mt-2">
        {failed ? state.message : null}
      </p>
    </div>
  );
}
