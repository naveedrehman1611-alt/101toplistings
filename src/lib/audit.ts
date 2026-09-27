import 'server-only';
import { createClient } from './supabase-server';

type AuditAction = 'create' | 'update' | 'delete' | 'approve' | 'reject' | 'suspend' | 'restore';

/**
 * Criterion 56: every admin write records who changed what, with before/after.
 * Called inside each action rather than by a database trigger so the actor and
 * the intent ("approve" vs a bare "update") are both captured.
 *
 * Lives outside the 'use server' action files on purpose: anything exported
 * from those is a callable endpoint, and this must only run behind a role check.
 */
export async function writeAudit(
  actorId: string,
  action: AuditAction,
  entityType: string,
  // audit_logs.entity_id is a uuid. Rows keyed by text (settings) pass null
  // and keep their key in before/after instead.
  entityId: string | null,
  before: unknown,
  after: unknown,
) {
  const supabase = await createClient();
  await supabase.from('audit_logs').insert({
    actor_id: actorId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    before: before ?? null,
    after: after ?? null,
  });
}
