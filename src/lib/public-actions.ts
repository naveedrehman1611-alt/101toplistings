'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from './supabase-server';
import { requireUser } from './auth';
import { FormError, errorMessage, text, uuid } from './form-data';
import { REPORT_REASONS } from './report-reasons';

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
 * A signed-in user claims a listing as theirs. RLS (claims_own_insert) only
 * accepts status 'new' for the caller's own id; the unique (listing, claimant)
 * key stops duplicate claims. Staff approve it in /admin/claims, which is what
 * actually hands over ownership.
 */
export async function submitClaim(fd: FormData) {
  const slug = (text(fd, 'slug', 120) ?? '').replace(/[^a-z0-9-]/g, '');
  const page = `/listing/${slug}/claim`;
  const user = await requireUser(page);

  let dest = `${page}?sent=1`;
  try {
    const listingId = uuid(fd, 'listing_id');
    if (!listingId) throw new FormError('Listing not found.');
    const role = text(fd, 'role', 80);
    const phone = text(fd, 'phone', 40);
    const details = text(fd, 'message', 2000);
    if (!role) throw new FormError('Tell us your role at the business.');
    if (!phone) throw new FormError('Add a phone number we can reach you on.');
    const evidence = text(fd, 'evidence_url', 500);
    if (evidence && !/^https?:\/\//i.test(evidence)) {
      throw new FormError('The proof link must start with http:// or https://.');
    }

    const supabase = await createClient();
    const { error } = await supabase.from('claims').insert({
      listing_id: listingId,
      claimant_id: user.id,
      // No dedicated columns for these; staff read them together in admin.
      message: [`Role: ${role}`, `Phone: ${phone}`, details].filter(Boolean).join('\n'),
      evidence_url: evidence,
      status: 'new',
    });
    if (error) {
      if ((error as { code?: string }).code === '23505') {
        throw new FormError('You have already claimed this business. We will be in touch.');
      }
      throw error;
    }
  } catch (e) {
    dest = `${page}?error=${encodeURIComponent(errorMessage(e))}`;
  }
  revalidatePath('/admin/claims');
  redirect(dest);
}

/**
 * Anyone (signed in or not) reports a problem with a listing. Stored in the
 * shared form_submissions inbox as form_type 'report', with the same honeypot
 * as the contact form.
 */
export async function submitReport(fd: FormData) {
  const slug = (text(fd, 'slug', 120) ?? '').replace(/[^a-z0-9-]/g, '');
  const page = `/listing/${slug}/report`;

  let dest = `${page}?sent=1`;
  try {
    const listingId = uuid(fd, 'listing_id');
    if (!listingId) throw new FormError('Listing not found.');
    const reason = text(fd, 'reason', 40);
    if (!reason || !Object.hasOwn(REPORT_REASONS, reason))
      throw new FormError('Choose what is wrong.');
    const details = text(fd, 'details', 3000);
    if (reason === 'other' && !details) throw new FormError('Please describe the problem.');
    const email = text(fd, 'email', 200);
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new FormError('That email address does not look right.');
    }
    const isSpam = Boolean(text(fd, 'website', 200));

    const supabase = await createClient();
    const { error } = await supabase.from('form_submissions').insert({
      form_type: 'report',
      payload: {
        listing_id: listingId,
        listing_slug: slug,
        listing_name: text(fd, 'listing_name', 200),
        reason,
        message: details,
        email,
      },
      is_spam: isSpam,
      status: isSpam ? 'spam' : 'new',
    });
    if (error) throw error;
  } catch (e) {
    dest = `${page}?error=${encodeURIComponent(errorMessage(e))}`;
  }
  redirect(dest);
}

/**
 * Footer newsletter sign-up, via useActionState: it returns a message instead
 * of redirecting, because the form sits on every page. There is no newsletter
 * table and form_type has no 'newsletter' value, so a sign-up lands in the admin
 * Inbox as a contact message that says what it is. Same email check and
 * honeypot as the contact form.
 */
export async function subscribeNewsletter(
  _prev: { ok: boolean; message: string },
  fd: FormData,
): Promise<{ ok: boolean; message: string }> {
  try {
    const email = text(fd, 'email', 200);
    if (!email) throw new FormError('Please enter your email address.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new FormError('That email address does not look right.');
    }
    const isSpam = Boolean(text(fd, 'website', 200));

    const supabase = await createClient();
    const { error } = await supabase.from('form_submissions').insert({
      form_type: 'contact',
      payload: {
        name: 'Newsletter signup',
        email,
        subject: 'Newsletter subscription',
        message: 'Please add this address to the newsletter.',
      },
      is_spam: isSpam,
      status: isSpam ? 'spam' : 'new',
    });
    if (error) throw error;
    return { ok: true, message: "Thanks, you're on the list." };
  } catch (e) {
    if (e instanceof FormError) return { ok: false, message: e.message };
    // Database and network errors are logged, not shown to the visitor.
    console.error(`[newsletter] sign-up failed: ${errorMessage(e)}`);
    return { ok: false, message: 'Sorry, that did not go through. Please try again later.' };
  }
}
