import 'server-only';

/**
 * Outbound notifications: email through Resend and messages to a Slack
 * channel through an incoming webhook. Both are plain HTTPS calls, so there is
 * no SDK to ship.
 *
 * Every function here is best-effort: a missing key or a failed call is logged
 * and reported as `false`, never thrown, because the write that triggered the
 * notification (a submission, an approval) has already succeeded and must not
 * be reported to the user as failed.
 *
 * Environment (server-only, never NEXT_PUBLIC_):
 *   RESEND_API_KEY      Resend API key. Unset = no emails are sent.
 *   EMAIL_FROM          "Brand <noreply@your-domain>", on a domain verified in
 *                       Resend. Unset = Resend's test sender, which only
 *                       delivers to the Resend account's own address.
 *   ADMIN_NOTIFY_EMAIL  Where new-listing alerts go; commas for several.
 *   SLACK_WEBHOOK_URL   Slack incoming webhook. Unset = no Slack messages.
 */

const TIMEOUT_MS = 8000;

export type Email = {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string | null;
};

export function adminEmails(): string[] {
  return (process.env.ADMIN_NOTIFY_EMAIL ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function fromAddress(brand: string): string {
  const from = process.env.EMAIL_FROM?.trim();
  return from || `${brand.replace(/[<>"]/g, '')} <onboarding@resend.dev>`;
}

export async function sendEmail(brand: string, email: Email): Promise<boolean> {
  const key = process.env.RESEND_API_KEY?.trim();
  const to = (Array.isArray(email.to) ? email.to : [email.to]).filter(Boolean);
  if (!key) {
    console.warn(`[notify] RESEND_API_KEY is not set; skipped email "${email.subject}".`);
    return false;
  }
  if (to.length === 0) return false;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: fromAddress(brand),
        to,
        subject: email.subject,
        html: email.html,
        text: email.text,
        ...(email.replyTo ? { reply_to: email.replyTo } : {}),
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) {
      console.error(`[notify] Resend ${res.status} for "${email.subject}": ${await res.text()}`);
      return false;
    }
    return true;
  } catch (e) {
    console.error(`[notify] email "${email.subject}" failed:`, e);
    return false;
  }
}

/**
 * Sends many emails in as few requests as Resend allows (100 per batch call),
 * so a bulk approval of hundreds of listings stays inside its rate limit.
 * Returns how many were accepted.
 */
export async function sendEmails(brand: string, emails: Email[]): Promise<number> {
  const key = process.env.RESEND_API_KEY?.trim();
  if (emails.length === 0) return 0;
  if (!key) {
    console.warn(`[notify] RESEND_API_KEY is not set; skipped ${emails.length} email(s).`);
    return 0;
  }
  let sent = 0;
  for (let i = 0; i < emails.length; i += 100) {
    const chunk = emails.slice(i, i + 100);
    try {
      const res = await fetch('https://api.resend.com/emails/batch', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(
          chunk.map((e) => ({
            from: fromAddress(brand),
            to: Array.isArray(e.to) ? e.to : [e.to],
            subject: e.subject,
            html: e.html,
            text: e.text,
            ...(e.replyTo ? { reply_to: e.replyTo } : {}),
          })),
        ),
        signal: AbortSignal.timeout(TIMEOUT_MS * 2),
      });
      if (!res.ok) {
        console.error(`[notify] Resend batch ${res.status}: ${await res.text()}`);
        continue;
      }
      sent += chunk.length;
    } catch (e) {
      console.error('[notify] Resend batch failed:', e);
    }
  }
  return sent;
}

/** Posts to the Slack channel behind SLACK_WEBHOOK_URL. `text` is the notification fallback. */
export async function postToSlack(text: string, blocks?: unknown[]): Promise<boolean> {
  const url = process.env.SLACK_WEBHOOK_URL?.trim();
  if (!url) {
    console.warn('[notify] SLACK_WEBHOOK_URL is not set; skipped Slack message.');
    return false;
  }
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(blocks ? { text, blocks } : { text }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) {
      console.error(`[notify] Slack ${res.status}: ${await res.text()}`);
      return false;
    }
    return true;
  } catch (e) {
    console.error('[notify] Slack message failed:', e);
    return false;
  }
}

/** Text from users goes into HTML emails; escape it. */
export function escapeHtml(v: string): string {
  return v
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/** Slack mrkdwn control characters: a listing name must not become a link or mention. */
export function escapeSlack(v: string): string {
  return v.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}
