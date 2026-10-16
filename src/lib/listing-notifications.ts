import 'server-only';
import { after } from 'next/server';
import { SITE_URL, supabase as publicClient } from './supabase';
import { getSettings, settingText } from './queries';
import { whatsappHref } from './whatsapp';
import {
  adminEmails,
  escapeHtml,
  escapeSlack,
  postToSlack,
  sendEmail,
  sendEmails,
  type Email,
} from './notify';
import type { createClient } from './supabase-server';

/**
 * What a listing's owner and the site's admins are told as it moves through
 * review: Submitted -> Under review -> Live (or Not approved).
 *
 * Sending happens in after(), once the response is on its way, so a slow
 * mail or Slack API never delays the redirect the user is waiting for. The
 * data the messages need is gathered before that, inside the request.
 */

type Supabase = Awaited<ReturnType<typeof createClient>>;

const BRAND_COLOR = '#0c8226';

async function siteInfo() {
  const settings = await getSettings().catch(() => ({}) as Record<string, unknown>);
  const brand = settingText(settings, 'brand.name', 'RankYouSite').trim() || 'RankYouSite';
  const contactEmail = settingText(settings, 'contact.email').trim();
  return { brand, replyTo: contactEmail || adminEmails()[0] || null };
}

/** A plain, table-based layout: the one HTML structure every mail client renders. */
function layout(brand: string, heading: string, bodyHtml: string): string {
  return `<!doctype html><html><body style="margin:0;background:#f4f6f5;font-family:Arial,Helvetica,sans-serif;color:#12212b">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f5;padding:24px 12px">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden">
<tr><td style="background:${BRAND_COLOR};color:#ffffff;padding:18px 24px;font-size:18px;font-weight:bold">${escapeHtml(brand)}</td></tr>
<tr><td style="padding:24px">
<h1 style="margin:0 0 16px;font-size:20px;line-height:1.3">${heading}</h1>
${bodyHtml}
</td></tr>
<tr><td style="padding:16px 24px;border-top:1px solid #e3e8e5;font-size:12px;color:#5b6b66">
${escapeHtml(brand)} · <a href="${SITE_URL}" style="color:#5b6b66">${escapeHtml(SITE_URL.replace(/^https?:\/\//, ''))}</a>
</td></tr>
</table>
</td></tr></table></body></html>`;
}

function button(href: string, label: string): string {
  return `<p style="margin:20px 0"><a href="${href}" style="display:inline-block;background:${BRAND_COLOR};color:#ffffff;text-decoration:none;font-weight:bold;padding:12px 20px;border-radius:8px">${escapeHtml(label)}</a></p>`;
}

function p(html: string): string {
  return `<p style="margin:0 0 12px;font-size:15px;line-height:1.55">${html}</p>`;
}

/** The three review steps, with the current one highlighted. */
function stepsHtml(current: 1 | 2 | 3): string {
  const steps = ['Submitted', 'Under review', 'Live'];
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 16px;font-size:14px">${steps
    .map((s, i) => {
      const n = i + 1;
      const done = n < current || current === 3;
      const now = n === current && current !== 3;
      const mark = done ? '&#10003;' : String(n);
      const bg = done ? BRAND_COLOR : now ? '#f0a202' : '#d5dcd9';
      return `<tr><td style="padding:4px 10px 4px 0"><span style="display:inline-block;width:22px;height:22px;line-height:22px;text-align:center;border-radius:11px;background:${bg};color:#fff;font-size:12px;font-weight:bold">${mark}</span></td><td style="padding:4px 0;${now ? 'font-weight:bold' : ''}">${s}${now ? ' (now)' : ''}</td></tr>`;
    })
    .join('')}</table>`;
}

// ---------------------------------------------------------------------------
// New submission (and resubmission after a rejection)
// ---------------------------------------------------------------------------

export type Submission = {
  listingId: string;
  name: string;
  cityId: string | null;
  categoryId: string | null;
  submitter: { email: string | null; name: string | null };
  resubmitted?: boolean;
};

/**
 * Tells the admins (email + Slack) that a listing is waiting for review, and
 * tells the person who submitted it that it arrived and what happens next.
 */
export function notifyListingSubmitted(s: Submission): void {
  after(async () => {
    const [{ brand, replyTo }, city, category] = await Promise.all([
      siteInfo(),
      s.cityId ? publicClient.from('cities').select('name').eq('id', s.cityId).maybeSingle() : null,
      s.categoryId
        ? publicClient.from('categories').select('name').eq('id', s.categoryId).maybeSingle()
        : null,
    ]);
    const cityName = (city?.data?.name as string | undefined) ?? '—';
    const categoryName = (category?.data?.name as string | undefined) ?? '—';
    const reviewUrl = `${SITE_URL}/admin/listings/${s.listingId}`;
    const queueUrl = `${SITE_URL}/admin/listings?status=pending`;
    const who = [s.submitter.name, s.submitter.email].filter(Boolean).join(' · ') || 'Unknown';
    const what = s.resubmitted ? 'Listing resubmitted for review' : 'New listing to review';

    const rows: [string, string][] = [
      ['Business', s.name],
      ['City', cityName],
      ['Category', categoryName],
      ['Submitted by', who],
    ];

    const jobs: Promise<unknown>[] = [];
    const admins = adminEmails();
    if (admins.length) {
      jobs.push(
        sendEmail(brand, {
          to: admins,
          subject: `${what}: ${s.name}`,
          replyTo: s.submitter.email,
          text: `${what}\n\n${rows.map(([k, v]) => `${k}: ${v}`).join('\n')}\n\nReview it: ${reviewUrl}\nAll pending: ${queueUrl}`,
          html: layout(
            brand,
            escapeHtml(what),
            `<table role="presentation" cellpadding="0" cellspacing="0" style="font-size:15px;margin-bottom:8px">${rows
              .map(
                ([k, v]) =>
                  `<tr><td style="padding:4px 16px 4px 0;color:#5b6b66">${k}</td><td style="padding:4px 0;font-weight:bold">${escapeHtml(v)}</td></tr>`,
              )
              .join('')}</table>` +
              button(reviewUrl, 'Review listing') +
              p(`<a href="${queueUrl}" style="color:${BRAND_COLOR}">See every pending listing</a>`),
          ),
        }),
      );
    } else {
      console.warn('[notify] ADMIN_NOTIFY_EMAIL is not set; skipped the admin email.');
    }

    jobs.push(
      postToSlack(`${what}: ${s.name} (${cityName})`, [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `:bell: *${what}*\n*${escapeSlack(s.name)}*\n${escapeSlack(cityName)} · ${escapeSlack(categoryName)}\nBy ${escapeSlack(who)}`,
          },
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              style: 'primary',
              text: { type: 'plain_text', text: 'Review listing' },
              url: reviewUrl,
            },
            { type: 'button', text: { type: 'plain_text', text: 'All pending' }, url: queueUrl },
          ],
        },
      ]),
    );

    if (s.submitter.email) {
      const dashboard = `${SITE_URL}/dashboard`;
      jobs.push(
        sendEmail(brand, {
          to: s.submitter.email,
          replyTo,
          subject: `We received ${s.name}, and it is now under review`,
          text: `Thanks for submitting ${s.name} to ${brand}.\n\n1. Submitted - done\n2. Under review - now. Our team checks every listing, usually within 24 to 48 hours.\n3. Live - we will email you as soon as it is approved.\n\nTrack the status any time: ${dashboard}`,
          html: layout(
            brand,
            'Your listing is under review',
            p(
              `Thanks for submitting <strong>${escapeHtml(s.name)}</strong> to ${escapeHtml(brand)}.`,
            ) +
              stepsHtml(2) +
              p(
                'Our team checks every listing, usually within 24 to 48 hours. We will email you as soon as it is approved and live.',
              ) +
              button(dashboard, 'Track your listing'),
          ),
        }),
      );
    }

    await Promise.all(jobs);
  });
}

// ---------------------------------------------------------------------------
// Moderation decision
// ---------------------------------------------------------------------------

export type Decision = 'approved' | 'rejected';

/**
 * Emails each owner whose listing was just approved or rejected. Call it only
 * with listings whose status actually changed, so a re-save never re-sends.
 *
 * The owners' addresses are read here, inside the request, because the lookup
 * runs as the signed-in moderator (listing_owner_contacts, migration 0029).
 * Listings with no owner (added by staff) are skipped.
 */
export async function notifyListingDecisions(
  supabase: Supabase,
  listings: { id: string; name: string; slug: string }[],
  decision: Decision,
  reason: string | null,
): Promise<void> {
  if (listings.length === 0) return;
  const { data, error } = await supabase.rpc('listing_owner_contacts', {
    p_ids: listings.map((l) => l.id),
  });
  if (error) {
    console.error('[notify] owner lookup failed:', error.message);
    return;
  }
  const contacts = (data ?? []) as {
    listing_id: string;
    email: string | null;
    display_name: string | null;
  }[];
  if (contacts.length === 0) return;
  const byId = new Map(listings.map((l) => [l.id, l]));

  after(async () => {
    const { brand, replyTo } = await siteInfo();
    const emails: Email[] = contacts.flatMap((c) => {
      const l = byId.get(c.listing_id);
      if (!l || !c.email) return [];
      const hello = c.display_name ? `Hi ${c.display_name},` : 'Hi,';
      return [
        decision === 'approved'
          ? approvedEmail(brand, replyTo, c.email, hello, l)
          : rejectedEmail(brand, replyTo, c.email, hello, l, reason),
      ];
    });
    await sendEmails(brand, emails);
  });
}

function approvedEmail(
  brand: string,
  replyTo: string | null,
  to: string,
  hello: string,
  l: { id: string; name: string; slug: string },
): Email {
  const live = `${SITE_URL}/listing/${l.slug}`;
  const contact = `${SITE_URL}/contact`;
  const wa = whatsappHref(`Hi, my listing "${l.name}" was just approved on ${brand}.`);
  return {
    to,
    replyTo,
    subject: `Your listing has been approved: ${l.name} is now live`,
    text: `${hello}\n\nGood news: your listing ${l.name} has been approved and is now live on ${brand}.\n\nSee it here: ${live}\n\nWhat next? Follow up with us to get more from your listing: reply to this email, message us on WhatsApp (${wa}) or use ${contact}.\n\nThanks,\nThe ${brand} team`,
    html: layout(
      brand,
      'Your listing has been approved 🎉',
      p(escapeHtml(hello)) +
        p(
          `Good news: <strong>${escapeHtml(l.name)}</strong> has been approved and is now live on ${escapeHtml(brand)}.`,
        ) +
        stepsHtml(3) +
        button(live, 'View your live listing') +
        `<h2 style="margin:24px 0 8px;font-size:16px">Follow up with us</h2>` +
        p(
          'Want more customers from your listing? Our team can help you get featured, improve your profile and rank higher in search. Get in touch:',
        ) +
        p(
          `<a href="${wa}" style="color:${BRAND_COLOR};font-weight:bold">Message us on WhatsApp</a> · <a href="${contact}" style="color:${BRAND_COLOR};font-weight:bold">Contact us</a> · or simply reply to this email.`,
        ) +
        p(`Thanks,<br>The ${escapeHtml(brand)} team`),
    ),
  };
}

function rejectedEmail(
  brand: string,
  replyTo: string | null,
  to: string,
  hello: string,
  l: { id: string; name: string },
  reason: string | null,
): Email {
  const edit = `${SITE_URL}/dashboard/listings/${l.id}`;
  return {
    to,
    replyTo,
    subject: `Your listing ${l.name} was not approved yet`,
    text: `${hello}\n\nWe reviewed ${l.name} and could not approve it yet.\n\nReason: ${reason ?? 'not given'}\n\nYou can fix it and resubmit here: ${edit}\nQuestions? Just reply to this email.\n\nThe ${brand} team`,
    html: layout(
      brand,
      'Your listing needs a few changes',
      p(escapeHtml(hello)) +
        p(`We reviewed <strong>${escapeHtml(l.name)}</strong> and could not approve it yet.`) +
        `<div style="margin:0 0 16px;padding:12px 16px;border-left:4px solid #f0a202;background:#fff8e8;font-size:15px;line-height:1.55"><strong>Reason:</strong> ${escapeHtml(reason ?? 'No reason was given. Reply to this email and we will explain.')}</div>` +
        p('Update your listing and resubmit it. It goes straight back into review.') +
        button(edit, 'Fix and resubmit') +
        p('Questions? Just reply to this email.') +
        p(`The ${escapeHtml(brand)} team`),
    ),
  };
}
