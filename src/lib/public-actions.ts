'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from './supabase-server';
import { requireUser } from './auth';
import { FormError, errorMessage, text, uuid } from './form-data';

/**
 * Contact form. Anyone may submit (RLS: form_submissions_insert). The hidden
 * "website" field is a honeypot — people never see it, bots fill it in. Caught
 * submissions are kept and flagged rather than dropped, so admin can see them.
 */
export async function submitContact(fd: FormData) {
  let dest = '/contact?sent=1';
  try {
    const name = text(fd, 'name', 120);
    const email = text(fd, 'email', 200);
    const message = text(fd, 'message', 5000);
    if (!name || !email || !message) throw new FormError('Please fill in every field.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new FormError('That email address does not look right.');
    }
    const isSpam = Boolean(text(fd, 'website', 200));

    const supabase = await createClient();
    const { error } = await supabase.from('form_submissions').insert({
      form_type: 'contact',
      payload: { name, email, message, subject: text(fd, 'subject', 200) },
      is_spam: isSpam,
      status: isSpam ? 'spam' : 'new',
    });
    if (error) throw error;
  } catch (e) {
    dest = `/contact?error=${encodeURIComponent(errorMessage(e))}`;
  }
  redirect(dest);
}

/**
 * A signed-in visitor reviews a listing. Always inserted as 'pending' — RLS
 * rejects anything else — and only counts toward the rating once approved.
 */
export async function submitReview(fd: FormData) {
  const slug = (text(fd, 'slug', 120) ?? '').replace(/[^a-z0-9-]/g, '');
  const page = `/listing/${slug}/review`;
  const user = await requireUser(page);

  let dest = `${page}?sent=1`;
  try {
    const listingId = uuid(fd, 'listing_id');
    if (!listingId) throw new FormError('Listing not found.');
    const rating = Number(text(fd, 'rating', 1));
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new FormError('Choose a rating from 1 to 5 stars.');
    }
    const body = text(fd, 'body', 3000);
    if (!body || body.length < 10)
      throw new FormError('Please write a few words about your visit.');

    const supabase = await createClient();
    const { error } = await supabase.from('reviews').insert({
      listing_id: listingId,
      author_id: user.id,
      author_name: user.displayName ?? user.email?.split('@')[0] ?? null,
      rating,
      title: text(fd, 'title', 120),
      body,
      status: 'pending',
    });
    if (error) {
      if ((error as { code?: string }).code === '23505') {
        throw new FormError('You have already reviewed this business.');
      }
      throw error;
    }
  } catch (e) {
    dest = `${page}?error=${encodeURIComponent(errorMessage(e))}`;
  }
  revalidatePath('/admin/reviews');
  redirect(dest);
}
