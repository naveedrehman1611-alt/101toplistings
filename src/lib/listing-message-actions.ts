'use server';

import { createClient } from './supabase-server';
import { FormError, errorMessage, text, uuid } from './form-data';

export type ListingMessageState = {
  status: 'idle' | 'ok' | 'error';
  message: string;
  /** What was typed, returned on error so the form can put it back. */
  fields?: Partial<Record<'name' | 'email' | 'phone' | 'message' | 'terms', string>>;
};

/**
 * "Contact Author" on a listing page. Anyone may send one (RLS:
 * form_submissions_insert); it lands in the admin inbox as a contact message
 * tagged with the listing, and staff pass it on to the business. The listing's
 * name and slug are read from the public projection by id rather than trusted
 * from the form, so a message can only be filed against a live listing. The
 * hidden "website" field is the same honeypot as the contact form: caught
 * submissions are kept and flagged, not dropped.
 */
export async function sendListingMessage(
  _prev: ListingMessageState,
  fd: FormData,
): Promise<ListingMessageState> {
  const name = text(fd, 'name', 120);
  const email = text(fd, 'email', 200);
  const phone = text(fd, 'phone', 40);
  // Browsers send textarea line breaks as CRLF; count and store them as one character.
  const message = text(fd, 'message', 6000)?.replace(/\r\n?/g, '\n') ?? null;
  const terms = fd.get('terms') === 'on';

  try {
    const listingId = uuid(fd, 'listing_id');
    if (!listingId) throw new FormError('Listing not found.');
    if (!name) throw new FormError('Please enter your name.');
    if (!email) throw new FormError('Please enter your email address.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new FormError('That email address does not look right.');
    }
    if (phone && !/^[+\d][\d\s-]{6,}$/.test(phone)) {
      throw new FormError('That phone number does not look right.');
    }
    if (!message || message.length < 10) {
      throw new FormError('Please write a message of at least 10 characters.');
    }
    if (message.length > 3000) {
      throw new FormError('Please keep your message under 3,000 characters.');
    }
    if (!terms) throw new FormError('Please accept the terms to send your message.');
    const isSpam = Boolean(text(fd, 'website', 200));

    const supabase = await createClient();
    const { data: listing, error: lookupError } = await supabase
      .from('public_listings')
      .select('slug, name')
      .eq('id', listingId)
      .maybeSingle();
    if (lookupError) throw lookupError;
    if (!listing) throw new FormError('This listing is no longer available.');
    const { slug, name: listingName } = listing as { slug: string; name: string };

    const { error } = await supabase.from('form_submissions').insert({
      form_type: 'contact',
      payload: {
        name,
        email,
        phone,
        message,
        subject: `Message for ${listingName}`,
        listing_id: listingId,
        listing_slug: slug,
        listing_name: listingName,
      },
      is_spam: isSpam,
      status: isSpam ? 'spam' : 'new',
    });
    if (error) throw error;
  } catch (e) {
    return {
      status: 'error',
      message: errorMessage(e),
      fields: {
        name: name ?? '',
        email: email ?? '',
        phone: phone ?? '',
        message: message ?? '',
        terms: terms ? 'on' : '',
      },
    };
  }

  return {
    status: 'ok',
    message:
      'Thanks — your message was sent. RankYouSite passes it to the business, who will reply by email.',
  };
}
