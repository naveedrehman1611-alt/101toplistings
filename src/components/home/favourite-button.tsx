'use client';

import { useState, useTransition } from 'react';
import { SvgIcon } from '@/components/svg-icon';
import { heartIcon, loaderCircleIcon } from '@/components/icon-nodes';
import { showToast, type ToastOptions } from '@/components/toast';
import { toggleFavourite, type FavouriteStatus } from '@/lib/favourite-actions';

const TOASTS: Record<FavouriteStatus, ToastOptions> = {
  added: { message: 'Saved to your businesses' },
  removed: { message: 'Removed from your saved businesses' },
  signin: {
    message: 'Sign in to save businesses',
    action: { label: 'Sign in', href: '/login?next=/' },
  },
  error: { message: 'Could not update saved businesses. Please try again.' },
};

/**
 * The heart on a business card. The page is static and the same for everyone,
 * so it cannot know what this visitor has saved: the button starts unsaved, the
 * server flips the real row, and the button follows its answer. The label stays
 * put and aria-pressed carries the state, as a toggle button should.
 */
export function FavouriteButton({
  listingId,
  name,
  className = '',
}: {
  listingId: string;
  name: string;
  className?: string;
}) {
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function toggle() {
    if (pending) return;
    startTransition(async () => {
      const { status } = await toggleFavourite(listingId).catch(() => ({
        status: 'error' as const,
      }));
      if (status === 'added' || status === 'removed') setSaved(status === 'added');
      showToast(TOASTS[status]);
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Save ${name}`}
      aria-pressed={saved}
      className={`${saved ? 'text-brand-700' : 'text-ink-700'} ${className}`}
    >
      {pending ? (
        <SvgIcon
          node={loaderCircleIcon}
          size={16}
          strokeWidth={2}
          className="motion-safe:animate-spin"
        />
      ) : (
        <SvgIcon node={heartIcon} size={16} fill={saved ? 'currentColor' : 'none'} />
      )}
    </button>
  );
}
