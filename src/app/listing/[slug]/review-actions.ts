'use server';

import { createClient } from '@/lib/supabase/server';

/**
 * The only public write path in the application.
 *
 * A Server Action is a plain POST endpoint (see
 * node_modules/next/dist/docs/01-app/02-guides/server-actions.md — "Security"),
 * so nothing here trusts the form: every field is re-validated, `status` is
 * pinned server-side, and the moderation columns are simply never sent. The
 * shape below mirrors the constraints added in 0015 so a bad submission comes
 * back as a sentence rather than as a Postgres check violation.
 *
 * Spam defence copies the reference site's contact form (docs/reference-analysis.md
 * §`contact`): a honeypot field plus a submit-timing check, no CAPTCHA. Both
 * fail *silently* — a bot that is told it was caught is a bot that adapts.
 */

export type ReviewFieldErrors = {
  rating?: string;
  authorName?: string;
  authorEmail?: string;
  title?: string;
  body?: string;
};

/* A 'use server' module may only export async functions, so the initial state
   for useActionState lives in the client component rather than here. */
export type ReviewFormState = {
  status: 'idle' | 'error' | 'success';
  /** Rendered to the visitor. Never raw database text. */
  message: string | null;
  fieldErrors: ReviewFieldErrors;
};

/** Mirrors 0015's reviews_anon_body_required and the 5000-char textarea cap. */
const BODY_MIN = 20;
const BODY_MAX = 5000;
const NAME_MIN = 2;
const NAME_MAX = 80;
const TITLE_MAX = 120;

/** Same shape as reviews_author_email_shape in 0015. */
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/** A human cannot read a listing, form an opinion and type 20 words in 3 seconds. */
const MIN_FILL_MS = 3000;

const SUCCESS: ReviewFormState = {
  status: 'success',
  message:
    'Thank you — your review has been sent for moderation. It is not published yet; once a moderator approves it, it will appear on this page.',
  fieldErrors: {},
};

function fail(message: string, fieldErrors: ReviewFieldErrors = {}): ReviewFormState {
  return { status: 'error', message, fieldErrors };
}

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

export async function submitReview(
  _prev: ReviewFormState,
  formData: FormData,
): Promise<ReviewFormState> {
  // 1. Honeypot. `company` is hidden from people and irresistible to form-fillers.
  if (text(formData, 'company').length > 0) return SUCCESS;

  // 2. Timing. A missing or unparseable startedAt is treated as suspicious too,
  //    because a real page always ships one.
  const startedAt = Number(text(formData, 'startedAt'));
  if (!Number.isFinite(startedAt) || startedAt <= 0 || Date.now() - startedAt < MIN_FILL_MS) {
    return SUCCESS;
  }

  const listingId = text(formData, 'listingId');
  if (!listingId) {
    return fail('We could not tell which business this review is for. Please reload the page.');
  }

  const fieldErrors: ReviewFieldErrors = {};

  const rating = Number(text(formData, 'rating'));
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    fieldErrors.rating = 'Choose a rating from 1 to 5 stars.';
  }

  const authorName = text(formData, 'authorName');
  if (authorName.length < NAME_MIN || authorName.length > NAME_MAX) {
    fieldErrors.authorName = `Your name must be between ${NAME_MIN} and ${NAME_MAX} characters.`;
  }

  // Optional, but if it is there it has to satisfy the database's own pattern.
  const authorEmail = text(formData, 'authorEmail');
  if (authorEmail.length > 0 && !EMAIL_RE.test(authorEmail)) {
    fieldErrors.authorEmail = 'That does not look like an email address.';
  }

  const title = text(formData, 'title');
  if (title.length > TITLE_MAX) {
    fieldErrors.title = `Keep the headline under ${TITLE_MAX} characters.`;
  }

  const body = text(formData, 'body');
  if (body.length < BODY_MIN) {
    fieldErrors.body = `Please write at least ${BODY_MIN} characters so the review is useful.`;
  } else if (body.length > BODY_MAX) {
    fieldErrors.body = `Reviews are limited to ${BODY_MAX} characters.`;
  }

  if (Object.keys(fieldErrors).length > 0) {
    return fail('Please fix the highlighted fields and try again.', fieldErrors);
  }

  // The visitor is not signed in, so this is the anon role and reviews_anon_insert
  // (0015) is the policy that has to pass: author_id null, status 'pending', no
  // moderation columns, and a listing that is already approved.
  const supabase = await createClient();
  const { error } = await supabase.from('reviews').insert({
    listing_id: listingId,
    author_id: null,
    author_name: authorName,
    author_email: authorEmail.length > 0 ? authorEmail : null,
    rating,
    title: title.length > 0 ? title : null,
    body,
    status: 'pending',
  });

  if (error) {
    // The per-listing volume guard in 0015 raises check_violation. It is a
    // "come back later", not a mistake the visitor made.
    if (error.code === '23514' && error.message.includes('too many pending reviews')) {
      return fail(
        'We could not accept your review right now — there are already several reviews waiting to be checked for this business. Please try again later.',
      );
    }
    // Anything else (RLS refusal on an unapproved listing, a bad listing id, a
    // network blip) gets one neutral sentence. Postgres text never reaches the page.
    return fail('Sorry, we could not save your review. Please try again in a moment.');
  }

  // Deliberately no revalidation: a pending review changes nothing public, and
  // busting the listing page's cache would only cost a rerender.
  return SUCCESS;
}
