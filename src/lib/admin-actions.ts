'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from './supabase/server';
import { requireRole, type Role } from './auth';

export type ActionResult = { ok: true; message: string } | { ok: false; error: string };

/**
 * Criterion 56: every admin write records who changed what, with before/after.
 * Called inside the action rather than by a database trigger so the actor and
 * the intent ("approve" vs a bare "update") are both captured.
 */
async function writeAudit(
  actorId: string,
  action: string,
  entityType: string,
  entityId: string,
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

/**
 * Moderates a listing. The role check runs here as well as in RLS — a Server
 * Action is a public HTTP endpoint, so it must never assume the caller came
 * from the admin UI.
 */
export async function setListingStatus(
  listingId: string,
  status: 'approved' | 'rejected' | 'suspended' | 'pending',
): Promise<ActionResult> {
  const user = await requireRole('moderator');
  const supabase = await createClient();

  const { data: before } = await supabase
    .from('listings')
    .select('id, name, status, published_at')
    .eq('id', listingId)
    .maybeSingle();

  if (!before) return { ok: false, error: 'Listing not found.' };

  const patch: Record<string, unknown> = { status, last_updated_by: user.id };
  // Approving is what publishes a listing, so stamp published_at on the way in
  // and leave it alone afterwards — re-approving must not reorder the feed.
  if (status === 'approved' && !before.published_at) {
    patch.published_at = new Date().toISOString();
  }

  const { data: after, error } = await supabase
    .from('listings')
    .update(patch)
    .eq('id', listingId)
    .select('id, name, status, published_at')
    .maybeSingle();

  if (error) return { ok: false, error: error.message };

  await writeAudit(user.id, status === 'approved' ? 'approve' : 'update', 'listing', listingId, before, after);

  // The public pages are ISR-cached, so a moderation decision would otherwise
  // not surface until the revalidate window elapsed.
  revalidatePath('/');
  revalidatePath('/listings');
  revalidatePath(`/listing/${after?.id ?? ''}`);
  revalidatePath('/admin/listings');

  return { ok: true, message: `${before.name} is now ${status}.` };
}

/** Updates one settings row. Settings drive brand, contact and SEO defaults. */
export async function updateSetting(key: string, value: string): Promise<ActionResult> {
  const user = await requireRole('admin');
  const supabase = await createClient();

  const { data: before } = await supabase
    .from('settings')
    .select('key, value')
    .eq('key', key)
    .maybeSingle();

  if (!before) return { ok: false, error: `Unknown setting: ${key}` };

  // settings.value is jsonb. Numbers stay numbers so thresholds keep comparing
  // correctly; everything else is stored as a JSON string.
  const trimmed = value.trim();
  const jsonValue: unknown = /^-?\d+(\.\d+)?$/.test(trimmed) ? Number(trimmed) : trimmed;

  const { data: after, error } = await supabase
    .from('settings')
    .update({ value: jsonValue, updated_by: user.id, updated_at: new Date().toISOString() })
    .eq('key', key)
    .select('key, value')
    .maybeSingle();

  if (error) return { ok: false, error: error.message };

  await writeAudit(user.id, 'update', 'setting', key, before, after);

  // Brand name and contact details render in the root layout, so every route
  // is stale after this.
  revalidatePath('/', 'layout');

  return { ok: true, message: `Saved ${key}.` };
}

/** Enables or disables one page section — §9.5.3's per-section on/off control. */
export async function setSectionEnabled(
  sectionId: string,
  enabled: boolean,
  pagePath: string,
): Promise<ActionResult> {
  const user = await requireRole('editor');
  const supabase = await createClient();

  const { data: before } = await supabase
    .from('page_sections')
    .select('id, section_key, is_enabled')
    .eq('id', sectionId)
    .maybeSingle();

  if (!before) return { ok: false, error: 'Section not found.' };

  const { data: after, error } = await supabase
    .from('page_sections')
    .update({ is_enabled: enabled })
    .eq('id', sectionId)
    .select('id, section_key, is_enabled')
    .maybeSingle();

  if (error) return { ok: false, error: error.message };

  await writeAudit(user.id, 'update', 'page_section', sectionId, before, after);
  revalidatePath(pagePath);
  revalidatePath('/admin/pages');

  return { ok: true, message: `${before.section_key} ${enabled ? 'enabled' : 'disabled'}.` };
}

/** Edits a section's copy and CTA — the rest of §9.5.3. */
export async function updateSection(
  sectionId: string,
  patch: { heading?: string; subheading?: string; ctaLabel?: string; ctaUrl?: string },
  pagePath: string,
): Promise<ActionResult> {
  const user = await requireRole('editor');
  const supabase = await createClient();

  const { data: before } = await supabase
    .from('page_sections')
    .select('id, section_key, heading, subheading, cta_label, cta_url')
    .eq('id', sectionId)
    .maybeSingle();

  if (!before) return { ok: false, error: 'Section not found.' };

  // Empty string means "clear this field", which is different from "leave it
  // alone" — so map blanks to null rather than storing an empty heading.
  const blankToNull = (v: string | undefined) =>
    v === undefined ? undefined : v.trim() === '' ? null : v.trim();

  const { data: after, error } = await supabase
    .from('page_sections')
    .update({
      heading: blankToNull(patch.heading),
      subheading: blankToNull(patch.subheading),
      cta_label: blankToNull(patch.ctaLabel),
      cta_url: blankToNull(patch.ctaUrl),
    })
    .eq('id', sectionId)
    .select('id, section_key, heading, subheading, cta_label, cta_url')
    .maybeSingle();

  if (error) return { ok: false, error: error.message };

  await writeAudit(user.id, 'update', 'page_section', sectionId, before, after);
  revalidatePath(pagePath);
  revalidatePath('/admin/pages');

  return { ok: true, message: `Saved ${before.section_key}.` };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
}

export type { Role };
