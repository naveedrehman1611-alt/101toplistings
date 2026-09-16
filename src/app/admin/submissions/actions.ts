'use server';

import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

/**
 * The contact-form inbox (form_submissions, 0006).
 *
 * form_submissions has an insert policy for everyone and read/update policies for
 * staff — there is no delete policy at all, deliberately: a submission is a record
 * of something the public sent, so it is triaged and flagged, never erased.
 */

const BASE = '/admin/submissions';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const STATUSES = ['new', 'in_progress', 'resolved', 'spam'] as const;
type SubmissionStatus = (typeof STATUSES)[number];

function isSubmissionStatus(value: unknown): value is SubmissionStatus {
  return typeof value === 'string' && (STATUSES as readonly string[]).includes(value);
}

const AUDIT_ACTION: Record<SubmissionStatus, 'approve' | 'reject' | 'update' | 'restore'> = {
  resolved: 'approve',
  spam: 'reject',
  in_progress: 'update',
  new: 'restore',
};

function safeReturn(raw: FormDataEntryValue | null): string {
  const value = typeof raw === 'string' ? raw : '';
  if (value === BASE) return BASE;
  if (value.startsWith(`${BASE}?`) && !value.includes('\\')) return value;
  return BASE;
}

function withError(back: string, code: string): string {
  return `${back}${back.includes('?') ? '&' : '?'}err=${code}`;
}

type SubmissionRow = { id: string; status: string; is_spam: boolean };

async function loadSubmission(id: string): Promise<SubmissionRow | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('form_submissions')
    .select('id, status, is_spam')
    .eq('id', id)
    .maybeSingle();
  return (data ?? null) as SubmissionRow | null;
}

export async function setSubmissionStatus(formData: FormData): Promise<void> {
  const actor = await requireRole('moderator', BASE);

  const back = safeReturn(formData.get('returnTo'));
  const id = String(formData.get('id') ?? '');
  const next = formData.get('status');

  if (!UUID.test(id) || !isSubmissionStatus(next)) redirect(withError(back, 'bad_input'));

  const before = await loadSubmission(id);
  if (!before) redirect(withError(back, 'not_found'));

  const supabase = await createClient();
  const { error } = await supabase
    .from('form_submissions')
    .update({
      status: next,
      handled_by: actor.id,
      handled_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) redirect(withError(back, 'save_failed'));

  await supabase.rpc('log_audit', {
    p_action: AUDIT_ACTION[next],
    p_entity_type: 'form_submission',
    p_entity_id: id,
    p_before: { status: before.status },
    p_after: { status: next, handled_by: actor.id },
  });

  redirect(back);
}

/**
 * The honeypot sets is_spam on the way in (0006). This lets a human correct it in
 * both directions, which is the point of keeping caught submissions instead of
 * discarding them silently.
 */
export async function setSubmissionSpam(formData: FormData): Promise<void> {
  const actor = await requireRole('moderator', BASE);

  const back = safeReturn(formData.get('returnTo'));
  const id = String(formData.get('id') ?? '');
  const raw = formData.get('is_spam');

  if (!UUID.test(id) || (raw !== 'true' && raw !== 'false')) {
    redirect(withError(back, 'bad_input'));
  }

  const isSpam = raw === 'true';
  const before = await loadSubmission(id);
  if (!before) redirect(withError(back, 'not_found'));

  const supabase = await createClient();
  const { error } = await supabase
    .from('form_submissions')
    .update({
      is_spam: isSpam,
      // Marking spam is a triage decision, so it closes the item too; clearing the
      // flag puts it back in front of a human.
      status: isSpam ? 'spam' : 'new',
      handled_by: actor.id,
      handled_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) redirect(withError(back, 'save_failed'));

  await supabase.rpc('log_audit', {
    p_action: isSpam ? 'reject' : 'restore',
    p_entity_type: 'form_submission',
    p_entity_id: id,
    p_before: { is_spam: before.is_spam, status: before.status },
    p_after: { is_spam: isSpam, status: isSpam ? 'spam' : 'new', handled_by: actor.id },
  });

  redirect(back);
}
