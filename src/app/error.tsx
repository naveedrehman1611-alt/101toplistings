'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-page grid min-h-[60vh] place-items-center py-20 text-center">
      <div className="max-w-md">
        <p className="font-display text-sm font-semibold tracking-widest text-brand-700">Error</p>
        <h1 className="mt-3 text-3xl font-bold sm:text-4xl">This page didn&apos;t load</h1>
        <p className="mt-4 text-[var(--text-muted)]">
          Something went wrong on our side. It is usually temporary, so try again in a moment.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => retry()}
            className="h-11 rounded-lg bg-brand-700 px-5 font-medium text-white hover:bg-brand-800"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex h-11 items-center rounded-lg border border-[var(--border)] px-5 font-medium hover:bg-[var(--surface-2)]"
          >
            Home
          </Link>
        </div>
        {error.digest && (
          <p className="mt-6 text-xs text-[var(--text-muted)]">Reference: {error.digest}</p>
        )}
      </div>
    </div>
  );
}
