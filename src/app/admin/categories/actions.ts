'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

/**
 * Category taxonomy (0002).
 *
 * Role note: the gate here is 'editor', not 'moderator'. categories_editor_write
 * (0008) is what actually authorises the write, so a moderator would only get as
 * far as an RLS rejection dressed up as a save failure. Gating on the role the
 * database will accept is both stricter and honest; deletes are admin-only.
 */

const BASE = '/admin/categories';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Mirrors slugify() in 0016 closely enough for a taxonomy label. */
function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '');
}

function safeReturn(raw: FormDataEntryValue | null): string {
  const value = typeof raw === 'string' ? raw : '';
  if (value === BASE) return BASE;
  if (value.startsWith(`${BASE}?`) && !value.includes('\\')) return value;
  return BASE;
}

function withError(back: string, code: string): string {
  return `${back}${back.includes('?') ? '&' : '?'}err=${code}`;
}

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? '').trim();
}

function optional(formData: FormData, key: string): string | null {
  const value = text(formData, key);
  return value.length > 0 ? value : null;
}

/** Public category surfaces are ISR (600s for the archives, 300s for home). */
function revalidateCategorySurfaces(slugs: (string | null)[]): void {
  revalidatePath('/');
  revalidatePath('/categories');
  revalidatePath('/listings');
  for (const slug of slugs) if (slug) revalidatePath(`/category/${slug}`);
}

type CategoryRow = {
  id: string;
  slug: string;
  name: string;
  parent_id: string | null;
  description: string | null;
  icon: string | null;
  sort_order: number;
  is_featured: boolean;
  seo_title: string | null;
  seo_description: string | null;
};

const COLUMNS =
  'id, slug, name, parent_id, description, icon, sort_order, is_featured, seo_title, seo_description';

/** Create when `id` is absent, update when it is present. */
export async function saveCategory(formData: FormData): Promise<void> {
  await requireRole('editor', BASE);

  const back = safeReturn(formData.get('returnTo'));
  const id = text(formData, 'id');
  const name = text(formData, 'name');

  if (id && !UUID.test(id)) redirect(withError(back, 'bad_input'));
  if (name.length < 2) redirect(withError(back, 'name_required'));

  const slug = slugify(text(formData, 'slug') || name);
  if (slug.length === 0) redirect(withError(back, 'slug_required'));

  const parentId = text(formData, 'parent_id');
  if (parentId && !UUID.test(parentId)) redirect(withError(back, 'bad_input'));
  // categories_not_own_parent would catch this, but a check-constraint violation is
  // not something an editor should ever have to read.
  if (parentId && parentId === id) redirect(withError(back, 'self_parent'));

  const sortRaw = text(formData, 'sort_order');
  const sortOrder = sortRaw.length > 0 ? Number.parseInt(sortRaw, 10) : 0;
  if (!Number.isFinite(sortOrder)) redirect(withError(back, 'bad_sort'));

  const values = {
    slug,
    name,
    parent_id: parentId.length > 0 ? parentId : null,
    description: optional(formData, 'description'),
    icon: optional(formData, 'icon'),
    sort_order: sortOrder,
    is_featured: formData.get('is_featured') === 'on',
    seo_title: optional(formData, 'seo_title'),
    seo_description: optional(formData, 'seo_description'),
  };

  const supabase = await createClient();

  if (id) {
    const { data: beforeRow } = await supabase
      .from('categories')
      .select(COLUMNS)
      .eq('id', id)
      .maybeSingle();

    const before = (beforeRow ?? null) as CategoryRow | null;
    if (!before) redirect(withError(back, 'not_found'));

    const { error } = await supabase.from('categories').update(values).eq('id', id);
    if (error) redirect(withError(back, error.code === '23505' ? 'slug_taken' : 'save_failed'));

    await supabase.rpc('log_audit', {
      p_action: 'update',
      p_entity_type: 'category',
      p_entity_id: id,
      p_before: before,
      p_after: { id, ...values },
    });

    // Renaming a slug orphans the old path, so both are rebuilt.
    revalidateCategorySurfaces([before.slug, slug]);
    redirect(back);
  }

  const { data: createdRow, error } = await supabase
    .from('categories')
    .insert(values)
    .select(COLUMNS)
    .maybeSingle();

  const created = (createdRow ?? null) as CategoryRow | null;
  if (error) redirect(withError(back, error.code === '23505' ? 'slug_taken' : 'save_failed'));
  if (!created) redirect(withError(back, 'save_failed'));

  await supabase.rpc('log_audit', {
    p_action: 'create',
    p_entity_type: 'category',
    p_entity_id: created.id,
    p_before: null,
    p_after: created,
  });

  revalidateCategorySurfaces([slug]);
  redirect(back);
}

/**
 * Admin-only, and genuinely lossy: listings.category_id and categories.parent_id
 * are both `on delete set null` (0002), so every listing filed here becomes
 * uncategorised and every child category becomes top level. The UI says so before
 * the button; this re-checks the operator typed the confirmation anyway, because
 * the button is not the only way to reach this function.
 */
export async function deleteCategory(formData: FormData): Promise<void> {
  await requireRole('admin', BASE);

  const back = safeReturn(formData.get('returnTo'));
  const id = text(formData, 'id');
  if (!UUID.test(id)) redirect(withError(back, 'bad_input'));
  if (formData.get('confirm') !== 'on') redirect(withError(back, 'confirm_required'));

  const supabase = await createClient();

  const { data: beforeRow } = await supabase
    .from('categories')
    .select(COLUMNS)
    .eq('id', id)
    .maybeSingle();

  const before = (beforeRow ?? null) as CategoryRow | null;
  if (!before) redirect(withError(back, 'not_found'));

  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) redirect(withError(back, 'delete_failed'));

  await supabase.rpc('log_audit', {
    p_action: 'delete',
    p_entity_type: 'category',
    p_entity_id: id,
    p_before: before,
    p_after: null,
  });

  revalidateCategorySurfaces([before.slug]);
  redirect(back);
}
