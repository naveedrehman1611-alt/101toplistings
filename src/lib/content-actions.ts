'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from './supabase-server';
import { requireRole } from './auth';
import { writeAudit } from './audit';
import { FormError, errorMessage } from './form-data';
import { checkLink } from './link-rules';
import { tableTag } from './supabase';
import { isIconName } from '@/components/icon';
import { sectionFor } from './content/registry';
import {
  TEXTAREA_MAX,
  TEXT_MAX,
  isUuid,
  type Field,
  type ScalarField,
  type SectionSpec,
} from './content/schema';

// Admin → Content. Each action re-checks the role: a Server Action is a public
// endpoint, so the admin layout's check does not protect it. RLS (0027)
// enforces it a third time.

function editorUrl(page: string, section: string, outcome: { ok?: string; error?: string }) {
  const q = new URLSearchParams(outcome as Record<string, string>);
  return `/admin/content/${page}/${section}?${q.toString()}`;
}

function obj(raw: unknown, label: string): Record<string, unknown> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new FormError(`${label} is malformed. Reload the page and try again.`);
  }
  return raw as Record<string, unknown>;
}

function str(raw: unknown, label: string, max: number): string {
  if (typeof raw !== 'string') throw new FormError(`${label} is malformed.`);
  const v = raw.replace(/\r\n/g, '\n').trim();
  if (v.length > max) throw new FormError(`${label} is too long: at most ${max} characters.`);
  return v;
}

/**
 * The value to store for one field, checked strictly. Unlike the public read
 * (readStoredField), which quietly falls back to defaults, a save refuses bad
 * input with a message, so an editor never thinks something saved that did not.
 */
function cleanScalar(field: ScalarField, raw: unknown, label: string, media: Set<string>): unknown {
  switch (field.kind) {
    case 'text':
      return str(raw, label, field.max ?? TEXT_MAX);
    case 'textarea':
      return str(raw, label, field.max ?? TEXTAREA_MAX);
    case 'icon': {
      if (!isIconName(raw)) throw new FormError(`${label}: choose an icon from the list.`);
      return raw;
    }
    case 'boolean':
      if (typeof raw !== 'boolean') throw new FormError(`${label} is malformed.`);
      return raw;
    case 'link': {
      const o = obj(raw, label);
      const text = str(o.label, `${label} text`, TEXT_MAX);
      const href = str(o.href, `${label} address`, 2000);
      if (href === '') return { label: text, href: '' };
      // checkLink covers paths and http(s); mailto:, tel: and #anchors are allowed on top.
      if (/^(mailto|tel):[^\s\\]+$/i.test(href) || /^#[\w-]*$/.test(href)) {
        return { label: text, href };
      }
      return { label: text, href: checkLink(href, `${label} address`).url };
    }
    case 'image': {
      const o = obj(raw, label);
      const alt = str(o.alt, `${label} alt text`, TEXT_MAX);
      if (o.media_id === null || o.media_id === '') return { media_id: null, alt };
      if (!isUuid(o.media_id)) throw new FormError(`${label}: choose an image from the list.`);
      media.add(o.media_id);
      return { media_id: o.media_id, alt };
    }
  }
}

function cleanField(field: Field, raw: unknown, label: string, media: Set<string>): unknown {
  if (field.kind !== 'list') return cleanScalar(field, raw, label, media);
  if (!Array.isArray(raw)) throw new FormError(`${label} is malformed.`);
  if (raw.length > field.max) {
    throw new FormError(`${label}: at most ${field.max} ${field.noun}s.`);
  }
  return raw.map((item, i) => {
    const o = obj(item, `${label} ${i + 1}`);
    const out: Record<string, unknown> = {};
    for (const [key, sub] of Object.entries(field.item)) {
      out[key] = cleanScalar(sub, o[key], `${label} ${i + 1}: ${sub.label}`, media);
    }
    return out;
  });
}

function cleanSection(spec: SectionSpec, raw: unknown, media: Set<string>) {
  const o = obj(raw, 'The form');
  const out: Record<string, unknown> = {};
  for (const [key, field] of Object.entries(spec.fields)) {
    out[key] = cleanField(field, o[key], field.label, media);
  }
  return out;
}

/** Everything that renders site content: the public pages, all of them cached. */
function expire() {
  updateTag(tableTag('site_content'));
  revalidatePath('/', 'layout');
}

/** Saves one section. Bound to (page, section) by the editor page. */
export async function saveContent(page: string, section: string, fd: FormData): Promise<void> {
  const user = await requireRole('editor');
  const spec = sectionFor(page, section);
  if (!spec) redirect('/admin/content?error=Unknown%20section.');

  let outcome: { ok?: string; error?: string };
  try {
    let raw: unknown;
    try {
      raw = JSON.parse(String(fd.get('data') ?? ''));
    } catch {
      throw new FormError('The form did not send its data. Reload the page and try again.');
    }
    const media = new Set<string>();
    const data = cleanSection(spec, raw, media);
    const visible = spec.hideable === false ? true : fd.get('visible') === 'on';

    const supabase = await createClient();
    if (media.size) {
      const { data: found, error } = await supabase
        .from('media')
        .select('id')
        .in('id', [...media]);
      if (error) throw error;
      if ((found ?? []).length !== media.size) {
        throw new FormError('An image you chose no longer exists. Choose another one.');
      }
    }

    const key = `${page}.${section}`;
    const { data: before } = await supabase
      .from('site_content')
      .select('key, data, is_enabled')
      .eq('key', key)
      .maybeSingle();
    const { data: after, error } = await supabase
      .from('site_content')
      .upsert({
        key,
        data,
        is_enabled: visible,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .select('key, data, is_enabled')
      .single();
    if (error) throw error;

    await writeAudit(user.id, before ? 'update' : 'create', 'site_content', null, before, after);
    expire();
    outcome = { ok: `Saved ${spec.label}. The live site shows it now.` };
  } catch (e) {
    outcome = { error: errorMessage(e) };
  }
  redirect(editorUrl(page, section, outcome));
}

/** Deletes the override, so the section renders its built-in defaults again. */
export async function resetContent(page: string, section: string): Promise<void> {
  const user = await requireRole('editor');
  const spec = sectionFor(page, section);
  if (!spec) redirect('/admin/content?error=Unknown%20section.');

  let outcome: { ok?: string; error?: string };
  try {
    const supabase = await createClient();
    const key = `${page}.${section}`;
    const { data: before, error } = await supabase
      .from('site_content')
      .delete()
      .eq('key', key)
      .select('key, data, is_enabled')
      .maybeSingle();
    if (error) throw error;
    if (before) await writeAudit(user.id, 'delete', 'site_content', null, before, null);
    expire();
    outcome = { ok: `${spec.label} is back to its original content.` };
  } catch (e) {
    outcome = { error: errorMessage(e) };
  }
  redirect(editorUrl(page, section, outcome));
}
