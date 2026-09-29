'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from './auth';
import { createClient } from './supabase-server';
import { FormError, errorMessage, text, uuid } from './form-data';
import { REVIEW_CRITERIA, isMissingColumnError, type ReviewCriterionKey } from './review-criteria';

type ReviewField =
  'rating' | 'rating_service' | 'rating_hospitality' | 'rating_pricing' | 'title' | 'body';

export type ReviewFormState = {
  status: 'idle' | 'ok' | 'error' | 'signin';
  message: string;
  /** What was submitted, echoed back so the form can keep it after an error. */
  fields?: Partial<Record<ReviewField, string>>;
};

const STAR_FIELDS = ['rating', ...REVIEW_CRITERIA.map((c) => c.key)] as const;
const TEXT_FIELDS = [
  ['title', 120],
  ['body', 3000],
] as const;

const NO_OVERALL = 'Choose an overall rating from 1 to 5 stars.';

/** The submitted values as typed, capped at the form's own limits. */
function submittedFields(fd: FormData): NonNullable<ReviewFormState['fields']> {
  const fields: NonNullable<ReviewFormState['fields']> = {};
  for (const key of STAR_FIELDS) {
    const v = fd.get(key);
    if (typeof v === 'string' && /^[1-5]$/.test(v)) fields[key] = v;
  }
  for (const [key, max] of TEXT_FIELDS) {
    const v = fd.get(key);
    if (typeof v === 'string' && v !== '') fields[key] = v.slice(0, max);
  }
  return fields;
}

/** A whole number of stars from 1 to 5, or null when the field was left empty. */
function stars(fd: FormData, key: string, message: string): number | null {
  const v = text(fd, key, 8);
  if (v === null) return null;
  const n = Number(v);
  if (!Number.isInteger(n) || n < 1 || n > 5) throw new FormError(message);
  return n;
}

/**
 * A signed-in visitor reviews a listing from the listing page (or its review
 * page), through useActionState: it returns a state rather than redirecting, so
 * the static listing page can host the form. Always inserted as 'pending' — RLS
 * rejects anything else — and only counts toward the rating once approved.
 */
export async function submitListingReview(
  _prev: ReviewFormState,
  fd: FormData,
): Promise<ReviewFormState> {
  const fields = submittedFields(fd);
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        status: 'signin',
        message: 'Sign in to post your review. What you wrote is kept below.',
        fields,
      };
    }

    const listingId = uuid(fd, 'listing_id');
    if (!listingId) throw new FormError('Listing not found.');
    const rating = stars(fd, 'rating', NO_OVERALL);
    if (rating === null) throw new FormError(NO_OVERALL);
    const aspects: Partial<Record<ReviewCriterionKey, number | null>> = {};
    for (const { key, label } of REVIEW_CRITERIA) {
      aspects[key] = stars(
        fd,
        key,
        `Rate ${label.toLowerCase()} from 1 to 5 stars, or leave it blank.`,
      );
    }
    const body = text(fd, 'body', 3000);
    if (!body || body.length < 10)
      throw new FormError('Please write a few words about your visit.');

    const review = {
      listing_id: listingId,
      author_id: user.id,
      author_name: user.displayName ?? user.email?.split('@')[0] ?? null,
      rating,
      title: text(fd, 'title', 120),
      body,
      status: 'pending',
    };
    const supabase = await createClient();
    let { error } = await supabase.from('reviews').insert({ ...review, ...aspects });
    // Before migration 0018 the aspect columns do not exist: keep the review
    // itself rather than refusing it.
    if (isMissingColumnError(error)) ({ error } = await supabase.from('reviews').insert(review));
    if (error) {
      if (error.code === '23505') throw new FormError('You have already reviewed this business.');
      throw error;
    }
  } catch (e) {
    return { status: 'error', message: errorMessage(e), fields };
  }
  revalidatePath('/admin/reviews');
  return {
    status: 'ok',
    message: 'Thanks — your review was received. It will appear once our team has checked it.',
  };
}
