'use client';

import { useActionState } from 'react';
import { initialLoginState, signIn } from './actions';

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(signIn, initialLoginState);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="next" value={next} />

      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="focus:border-brand-700 focus:ring-brand-200 h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm outline-none focus:ring-2"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="focus:border-brand-700 focus:ring-brand-200 h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm outline-none focus:ring-2"
        />
      </div>

      {/* aria-live so screen readers announce the failure without a page change. */}
      <p aria-live="polite" className="min-h-5 text-sm text-red-700">
        {state.error}
      </p>

      <button
        type="submit"
        disabled={pending}
        className="bg-brand-700 hover:bg-brand-800 inline-flex h-11 w-full items-center justify-center rounded-lg px-4 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
