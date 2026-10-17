/**
 * GA4 events from the browser. gtag.js loads lazily (see google-analytics.tsx),
 * so an event raised before it exists waits for it, for up to 15 seconds;
 * with GA4 switched off (no measurement ID, or a preview deployment) gtag never
 * appears and the event is dropped.
 *
 * Mark generate_lead, listing_submitted and contact_click as key events in GA4
 * to count them as conversions.
 */

type Gtag = (command: 'event', name: string, params?: Record<string, unknown>) => void;

const WAIT_MS = 250;
const MAX_WAITS = 60;

export function sendEvent(name: string, params: Record<string, unknown> = {}, tries = 0): void {
  if (typeof window === 'undefined') return;
  const gtag = (window as unknown as { gtag?: Gtag }).gtag;
  if (gtag) {
    gtag('event', name, params);
    return;
  }
  if (tries < MAX_WAITS) setTimeout(() => sendEvent(name, params, tries + 1), WAIT_MS);
}

/** The contact method behind a link, for contact_click; null for an ordinary link. */
export function contactMethod(href: string): 'whatsapp' | 'phone' | 'email' | null {
  if (/^https?:\/\/(wa\.me|api\.whatsapp\.com|web\.whatsapp\.com)\//i.test(href)) return 'whatsapp';
  if (/^tel:/i.test(href)) return 'phone';
  if (/^mailto:/i.test(href)) return 'email';
  return null;
}
