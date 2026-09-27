'use client';

import { startTransition, useActionState, useEffect, useId, useRef, type FormEvent } from 'react';
import { subscribeNewsletter, type NewsletterState } from '@/lib/newsletter-actions';
import { SvgIcon } from '@/components/svg-icon';
import { loaderCircleIcon } from '@/components/icon-nodes';

const INITIAL: NewsletterState = { status: 'idle', message: '' };

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

/** The footer newsletter sign-up; the result is shown inline, without a page load. */
export function NewsletterForm({
  placeholder,
  buttonLabel,
}: {
  placeholder: string;
  buttonLabel: string;
}) {
  const [state, formAction, pending] = useActionState(subscribe, INITIAL);
  const formRef = useRef<HTMLFormElement>(null);
  const id = useId();
  const statusId = `${id}-status`;

  // Clear the field once the address is in; after an error it stays, to be fixed.
  useEffect(() => {
    if (state.status === 'ok') formRef.current?.reset();
  }, [state]);

  // React resets a form after every action it runs from `action`, which would
  // also wipe a mistyped address, so submissions are dispatched here and the
  // reset is left to the effect above. `action` stays set so that a submit
  // before hydration goes nowhere rather than putting the address in a GET URL.
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    const data = new FormData(e.currentTarget);
    startTransition(() => formAction(data));
  }

  return (
    <form ref={formRef} action={formAction} onSubmit={onSubmit} className="mt-5">
      <div className="flex gap-2">
        <label htmlFor={`${id}-email`} className="sr-only">
          Email address
        </label>
        <input
          id={`${id}-email`}
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder={placeholder}
          aria-describedby={statusId}
          className="h-12 min-w-0 flex-1 rounded-lg border border-white/15 bg-white/10 px-4 text-[15px] text-white transition-colors placeholder:text-white/60 hover:border-white/30 focus:border-white/40"
        />
        <button
          type="submit"
          disabled={pending}
          aria-disabled={pending}
          className="text-navy-900 hover:bg-brand-50 relative h-12 shrink-0 rounded-lg bg-white px-6 text-[15px] font-medium transition-colors disabled:cursor-wait disabled:hover:bg-white"
        >
          <span className={pending ? 'invisible' : undefined}>{buttonLabel}</span>
          {pending ? (
            <span className="absolute inset-0 grid place-items-center">
              <SvgIcon
                node={loaderCircleIcon}
                size={20}
                strokeWidth={2}
                title="Subscribing"
                className="motion-safe:animate-spin"
              />
            </span>
          ) : null}
        </button>
      </div>

      {/* Honeypot: hidden from people and assistive tech; bots fill in every field. */}
      <div aria-hidden className="sr-only">
        <label>
          Company
          <input type="text" name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {/* Emptied while a submission is pending, so the old result is not left
          on screen and a repeated message is announced again. */}
      <p
        id={statusId}
        role="status"
        aria-live="polite"
        className={`mt-3 text-sm empty:mt-0 ${state.status === 'error' ? 'text-red-300' : 'text-emerald-300'}`}
      >
        {pending ? '' : state.message}
      </p>
    </form>
  );
}
