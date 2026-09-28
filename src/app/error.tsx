'use client';

import { useEffect } from 'react';
import { Icon } from '@/components/icon';
import { Button } from '@/components/ui';

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
        <span className="bg-surface-container text-primary-container mx-auto grid size-14 place-items-center rounded-xl">
          <Icon name="error" size={28} />
        </span>
        <p className="font-label-sm text-label-sm text-primary-container mt-6 tracking-wider uppercase">
          Error
        </p>
        <h1 className="font-headline-lg text-headline-lg text-on-surface mt-2">
          This page didn&apos;t load
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-3">
          Something went wrong on our side. It is usually temporary, so try again in a moment.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {/* Same classes as the primary <Button>, which has no onClick prop. */}
          <button
            type="button"
            onClick={() => retry()}
            className="bg-primary-container font-label-md text-label-md text-on-primary hover:bg-primary focus-visible:ring-primary-container inline-flex h-11 items-center justify-center gap-2 rounded-lg px-5 shadow-xs transition hover:shadow-[0_4px_12px_rgba(4,120,87,0.25)] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden"
          >
            Try again
          </button>
          <Button href="/" variant="ghost">
            Home
          </Button>
        </div>
        {error.digest && (
          <p className="font-body-sm text-body-sm text-secondary mt-6">Reference: {error.digest}</p>
        )}
      </div>
    </div>
  );
}
