'use server';

import { createClient } from './supabase-server';
import { text } from './form-data';

export type NewsletterState = { status: 'idle' | 'ok' | 'error'; message: string };

// The newsletter_email_format check in migration 0021, so an address accepted
// here is not then refused by the table.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const subscribed = (): NewsletterState => ({
  status: 'ok',
  message: "Thanks — you're subscribed.",
});

const invalid = (): NewsletterState => ({
  status: 'error',
  message: 'Please enter a valid email address.',
});

/**
 * The footer newsletter form. Subscribing goes through the subscribe_newsletter
 * RPC (migration 0021), which answers the same for a new address and one
 * already on the list, and only staff can read the list back — so neither this
 * form nor the public API tells anyone who has subscribed. Nothing public
 * changes, so nothing is revalidated.
 */
export async function subscribeNewsletter(
  _prev: NewsletterState,
  fd: FormData,
): Promise<NewsletterState> {
  // Honeypot: people never see the "company" field; bots fill in every field.
  // They are thanked like anyone else, so there is nothing to learn from it.
  if (text(fd, 'company', 200)) return subscribed();

  const email = (text(fd, 'email', 1000) ?? '').toLowerCase();
  if (email.length > 254 || !EMAIL.test(email)) return invalid();

  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc('subscribe_newsletter', {
      p_email: email,
      p_source: 'footer',
    });
    // 22023: the function's own format check, stricter for some non-ASCII input.
    if (error?.code === '22023') return invalid();
    if (error) throw error;
  } catch (e) {
    const err = e as { message?: string; code?: string } | null;
    console.error(
      `[newsletter] subscribe failed: ${err?.message ?? String(e)}${err?.code ? ` (${err.code})` : ''}`,
    );
    return { status: 'error', message: 'Subscription failed. Please try again.' };
  }
  return subscribed();
}
