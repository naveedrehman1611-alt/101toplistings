'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { createClient } from './supabase-server';
import { SEARCH_TAG, tableTag } from './supabase';
import { requireRole, type Role } from './auth';
import { writeAudit } from './audit';
import { FormError, errorMessage } from './form-data';
import { checkLink } from './link-rules';

export type ActionResult = { ok: true; message: string } | { ok: false; error: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

  await writeAudit(
    user.id,
    status === 'approved' ? 'approve' : 'update',
    'listing',
    listingId,
    before,
    after,
  );

  // The public pages are ISR-cached and the reads behind them sit in the Data
  // Cache, so a moderation decision needs both cleared or it would not surface
  // until the revalidate window elapsed.
  updateTag(tableTag('public_listings'));
  updateTag(SEARCH_TAG);
  revalidatePath('/');
  revalidatePath('/listings');
  revalidatePath('/listing/[slug]', 'page');
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

  let jsonValue: unknown;
  try {
    jsonValue = await settingValue(supabase, key, value.trim());
  } catch (e) {
    return { ok: false, error: errorMessage(e) };
  }

  const { data: after, error } = await supabase
    .from('settings')
    .update({ value: jsonValue, updated_by: user.id, updated_at: new Date().toISOString() })
    .eq('key', key)
    .select('key, value')
    .maybeSingle();

  if (error) return { ok: false, error: error.message };

  await writeAudit(user.id, 'update', 'setting', null, before, after);

  // Brand name and contact details render in the root layout, so every route
  // is stale after this.
  updateTag(tableTag('settings'));
  revalidatePath('/', 'layout');

  return { ok: true, message: `Saved ${key}.` };
}

/**
 * The value to store for a setting, checked against how the site uses it
 * (src/lib/chrome.ts): logo ids must name a media row, social links are
 * external https links, and header links are paths on this site, which is all
 * the header renders. Anything else is stored as before: numbers stay numbers so
 * thresholds keep comparing correctly, everything else is a JSON string.
 *
 * Not exported: every export of a 'use server' file is a public endpoint.
 */
async function settingValue(
  supabase: Awaited<ReturnType<typeof createClient>>,
  key: string,
  value: string,
): Promise<unknown> {
  if (key.endsWith('_media_id')) {
    if (value === '') return '';
    if (!UUID.test(value)) throw new FormError('Choose an image from the list.');
    const { data, error } = await supabase.from('media').select('id').eq('id', value).maybeSingle();
    if (error) throw error;
    if (!data) throw new FormError('That image no longer exists. Choose another one.');
    return value;
  }
  if (key.startsWith('social.')) {
    if (value === '') return '';
    const link = checkLink(value, key);
    if (!link.url.startsWith('https://')) {
      throw new FormError(`${key} must be a full https:// address, or blank to hide the icon.`);
    }
    return link.url;
  }
  if (key.startsWith('header.') && key.endsWith('_url')) {
    if (!value.startsWith('/') || value.startsWith('//')) {
      throw new FormError(`${key} must be a path on this site starting with /, such as /login.`);
    }
    return checkLink(value, key).url;
  }
  return /^-?\d+(\.\d+)?$/.test(value) ? Number(value) : value;
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
}

export type { Role };
