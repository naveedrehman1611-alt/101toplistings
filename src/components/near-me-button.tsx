'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * "Near me" (§7.5.4, criterion 45). The browser is only asked for a location
 * when the visitor presses this button — never on page load. The position is
 * rounded to ~100 m before it goes into the URL, which is enough to sort by
 * distance without putting someone's exact location in their history or logs.
 *
 * Inside a filter form it carries that form's keyword and category along, so
 * "plumbers near me" works in one step.
 */
export type NearMeMessages = {
  busy: string;
  unsupported: string;
  blocked: string;
  failed: string;
};

const NEAR_ME_MESSAGES: NearMeMessages = {
  busy: 'Finding you…',
  unsupported: 'Your browser cannot share its location. Pick a city instead.',
  blocked: 'Location is blocked for this site. Allow it in your browser settings, or pick a city.',
  failed: 'We could not find your location. Try again, or pick a city.',
};

export function NearMeButton({
  radius = 10,
  className,
  label = 'Near me',
  messageClassName = 'mt-1 max-w-xs text-xs text-on-error-container',
  messages = NEAR_ME_MESSAGES,
}: {
  radius?: number;
  className?: string;
  label?: string;
  /** Classes for the error line under the button, e.g. a light colour on a dark background. */
  messageClassName?: string;
  /** The busy label and error lines; defaults to the original wording. */
  messages?: NearMeMessages;
}) {
  const router = useRouter();
  const [state, setState] = useState<'idle' | 'locating' | 'error'>('idle');
  const [message, setMessage] = useState('');

  function locate(e: React.MouseEvent<HTMLButtonElement>) {
    if (!('geolocation' in navigator)) {
      setState('error');
      setMessage(messages.unsupported);
      return;
    }
    const form = e.currentTarget.closest('form');
    const fromForm = form ? new FormData(form) : null;
    setState('locating');
    setMessage('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const params = new URLSearchParams();
        for (const key of ['q', 'category']) {
          const v = fromForm?.get(key);
          if (typeof v === 'string' && v.trim()) params.set(key, v.trim());
        }
        params.set('lat', pos.coords.latitude.toFixed(3));
        params.set('lng', pos.coords.longitude.toFixed(3));
        params.set('radius', String(radius));
        params.set('sort', 'nearest');
        router.push(`/search?${params.toString()}`);
      },
      (err) => {
        setState('error');
        setMessage(err.code === err.PERMISSION_DENIED ? messages.blocked : messages.failed);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  }

  return (
    <span className="inline-flex flex-col">
      <button
        type="button"
        onClick={locate}
        disabled={state === 'locating'}
        className={
          className ??
          'inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-[var(--border)] px-4 text-sm font-medium whitespace-nowrap hover:bg-[var(--surface-2)] disabled:opacity-60'
        }
      >
        <svg aria-hidden viewBox="0 0 20 20" fill="currentColor" className="size-4">
          <path
            fillRule="evenodd"
            d="M10 2a6 6 0 0 0-6 6c0 4.4 6 10 6 10s6-5.6 6-10a6 6 0 0 0-6-6Zm0 8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"
            clipRule="evenodd"
          />
        </svg>
        {state === 'locating' ? messages.busy : label}
      </button>
      {message ? (
        <span role="alert" className={messageClassName}>
          {message}
        </span>
      ) : null}
    </span>
  );
}
