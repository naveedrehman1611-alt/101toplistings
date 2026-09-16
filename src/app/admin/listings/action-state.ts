import type { ListingFieldErrors } from '@/lib/listing-schema';

/**
 * The shapes the listing actions return, and the initial value useActionState
 * needs before the first submit.
 *
 * These live outside actions.ts because a 'use server' module may export
 * nothing but async functions — a plain object export there fails the build at
 * page-data collection, not at typecheck, so it is worth keeping the boundary
 * obvious. Types alone would be fine (they are erased), but the constant is
 * not, and splitting only half of it would invite the same mistake back.
 */

export type SaveListingState = {
  ok: boolean;
  /** Keyed by form field name; '_form' holds whole-form problems. */
  errors: ListingFieldErrors;
  message: string | null;
};

export const emptySaveListingState: SaveListingState = { ok: false, errors: {}, message: null };

export type ModerationState = { ok: boolean; message: string | null };
