'use server';

import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

/**
 * Ownership claims (0004). A claim never changes anything a visitor can see —
 * it is a request for a human decision — so there is nothing here to revalidate;
 * handing a listing over to its owner happens on the listings screen.
 */

const BASE = '/admin/claims';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const STATUSES = ['new', 'in_progress', 'resolved', 'spam'] as const;
type ClaimStatus = (typeof STATUSES)[number];

function isClaimStatus(value: unknown): value is ClaimStatus {
  return typeof value === 'string' && (STATUSES as readonly string[]).includes(value);
}

/** submission_status onto the audit_action enum from 0001. */
const AUDIT_ACTION: Record<ClaimStatus, 'approve' | 'reject' | 'update' | 'restore'> = {
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

type ClaimRow = { id: string; status: string; listing_id: string };

export async function setClaimStatus(formData: FormData): Promise<void> {
  // First statement, always: this action is a POST endpoint of its own.
  const actor = await requireRole('moderator', BASE);

  const back = safeReturn(formData.get('returnTo'));
  const id = String(formData.get('id') ?? '');
  const next = formData.get('status');

  if (!UUID.test(id) || !isClaimStatus(next)) redirect(withError(back, 'bad_input'));

  const supabase = await createClient();

  const { data: beforeRow } = await supabase
    .from('claims')
    .select('id, status, listing_id')
    .eq('id', id)
    .maybeSingle();

  const before = (beforeRow ?? null) as ClaimRow | null;
  if (!before) redirect(withError(back, 'not_found'));

  const { error } = await supabase
    .from('claims')
    .update({
      status: next,
      handled_by: actor.id,
      handled_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) redirect(withError(back, 'save_failed'));

  await supabase.rpc('log_audit', {
    p_action: AUDIT_ACTION[next],
    p_entity_type: 'claim',
    p_entity_id: id,
    p_before: { status: before.status },
    p_after: { status: next, handled_by: actor.id },
  });

  redirect(back);
}
