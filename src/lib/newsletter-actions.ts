'use server';

import { createClient } from './supabase-server';
import { text } from './form-data';

export type NewsletterState = { status: 'idle' | 'ok' | 'error'; message: string };

// The newsletter_email_format check in migration 0018, so an address accepted
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
 * The footer newsletter form. Anyone may subscribe (RLS: newsletter_public_insert)
 * and only staff can read the list back, so an address that is already on it
 * gets the same answer as a new one: the form never tells a visitor who has
 * subscribed. Nothing public changes, so nothing is revalidated.
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
    // A plain insert rather than upsert(ignoreDuplicates): PostgREST names the
    // conflict column, Postgres then needs SELECT on it, and RLS gives visitors
    // no SELECT, so the upsert is refused.
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({ email, source: 'footer' });
    // 23505: the address is already on the list, which is a success.
    // 23514: the table's own format check, stricter for some non-ASCII input.
    if (error?.code === '23514') return invalid();
    if (error && error.code !== '23505') throw error;
  } catch (e) {
    const err = e as { message?: string; code?: string } | null;
    console.error(
      `[newsletter] subscribe failed: ${err?.message ?? String(e)}${err?.code ? ` (${err.code})` : ''}`,
    );
    return { status: 'error', message: 'Subscription failed. Please try again.' };
  }
  return subscribed();
}
