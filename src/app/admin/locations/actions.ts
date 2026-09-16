'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

/**
 * The four-level geography (0002): countries -> regions -> cities -> areas.
 *
 * Role note: 'editor', because that is what the *_editor_write policies in 0008
 * require. Gating on 'moderator' here would only turn an authorisation decision
 * into a mystery save failure. Deletes are admin-only — a country delete cascades
 * through three tables.
 */

const BASE = '/admin/locations';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const LEVELS = ['country', 'region', 'city', 'area'] as const;
type Level = (typeof LEVELS)[number];

const TABLE: Record<Level, string> = {
  country: 'countries',
  region: 'regions',
  city: 'cities',
  area: 'areas',
};

const PARENT_COLUMN: Record<Level, string | null> = {
  country: null,
  region: 'country_id',
  city: 'region_id',
  area: 'city_id',
};

function isLevel(value: unknown): value is Level {
  return typeof value === 'string' && (LEVELS as readonly string[]).includes(value);
}

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

/** Empty stays null; a non-numeric entry is a validation failure, not a zero. */
function coordinate(formData: FormData, key: string): number | null | 'invalid' {
  const raw = text(formData, key);
  if (raw.length === 0) return null;
  const n = Number(raw);
  if (!Number.isFinite(n)) return 'invalid';
  const limit = key === 'latitude' ? 90 : 180;
  if (Math.abs(n) > limit) return 'invalid';
  return n;
}

/**
 * assert_location_slug_unique() (0007) enforces slug uniqueness ACROSS all four
 * tables, because /location/[slug] resolves any level from one route. It raises
 * unique_violation with the clashing level in the message, which is the one piece
 * of that message worth keeping — mapped here to a code so the page can say
 * "already used by a city" without ever printing Postgres text.
 */
function slugErrorCode(message: string): string {
  const match = /already used by a (country|region|city|area)/.exec(message);
  return match ? `slug_${match[1]}` : 'slug_taken';
}

/**
 * /city/[slug] is the only public route that renders a location directly; the
 * home and listing archives show city and region names in their filters. All are
 * ISR, so all are rebuilt.
 */
function revalidateLocationSurfaces(level: Level, slugs: (string | null)[]): void {
  revalidatePath('/');
  revalidatePath('/listings');
  if (level === 'city') {
    for (const slug of slugs) if (slug) revalidatePath(`/city/${slug}`);
  }
}

/** Only the columns that level actually has — never a blanket object. */
function valuesFor(level: Level, formData: FormData, slug: string, parentId: string | null) {
  const lat = coordinate(formData, 'latitude');
  const lng = coordinate(formData, 'longitude');
  if (lat === 'invalid' || lng === 'invalid') return null;

  const common = {
    slug,
    name: text(formData, 'name'),
    latitude: lat,
    longitude: lng,
    intro_copy: optional(formData, 'intro_copy'),
    is_featured: formData.get('is_featured') === 'on',
    seo_title: optional(formData, 'seo_title'),
    seo_description: optional(formData, 'seo_description'),
  };

  if (level === 'country') {
    return {
      ...common,
      iso2: optional(formData, 'iso2')?.toUpperCase() ?? null,
      iso3: optional(formData, 'iso3')?.toUpperCase() ?? null,
      phone_code: optional(formData, 'phone_code'),
    };
  }

  const parentColumn = PARENT_COLUMN[level];
  const withParent = { ...common, [parentColumn as string]: parentId };
  return level === 'region' ? { ...withParent, code: optional(formData, 'code') } : withParent;
}

const SELECT: Record<Level, string> = {
  country:
    'id, slug, name, iso2, iso3, phone_code, latitude, longitude, intro_copy, is_featured, seo_title, seo_description',
  region:
    'id, slug, name, code, country_id, latitude, longitude, intro_copy, is_featured, seo_title, seo_description',
  city: 'id, slug, name, region_id, latitude, longitude, intro_copy, is_featured, seo_title, seo_description',
  area: 'id, slug, name, city_id, latitude, longitude, intro_copy, is_featured, seo_title, seo_description',
};

export async function saveLocation(formData: FormData): Promise<void> {
  await requireRole('editor', BASE);

  const back = safeReturn(formData.get('returnTo'));
  const level = formData.get('level');
  if (!isLevel(level)) redirect(withError(back, 'bad_input'));

  const id = text(formData, 'id');
  if (id && !UUID.test(id)) redirect(withError(back, 'bad_input'));

  const name = text(formData, 'name');
  if (name.length < 2) redirect(withError(back, 'name_required'));

  const slug = slugify(text(formData, 'slug') || name);
  if (slug.length === 0) redirect(withError(back, 'slug_required'));

  const parentColumn = PARENT_COLUMN[level];
  const parentId = text(formData, 'parent_id');
  if (parentColumn && !UUID.test(parentId)) redirect(withError(back, 'parent_required'));

  const values = valuesFor(level, formData, slug, parentColumn ? parentId : null);
  if (!values) redirect(withError(back, 'bad_coordinates'));

  const supabase = await createClient();
  const table = TABLE[level];

  if (id) {
    const { data: beforeRow } = await supabase
      .from(table)
      .select(SELECT[level])
      .eq('id', id)
      .maybeSingle();

    const before = (beforeRow ?? null) as Record<string, unknown> | null;
    if (!before) redirect(withError(back, 'not_found'));

    const { error } = await supabase.from(table).update(values).eq('id', id);
    if (error) {
      redirect(
        withError(back, error.code === '23505' ? slugErrorCode(error.message) : 'save_failed'),
      );
    }

    await supabase.rpc('log_audit', {
      p_action: 'update',
      p_entity_type: level,
      p_entity_id: id,
      p_before: before,
      p_after: { id, ...values },
    });

    revalidateLocationSurfaces(level, [before.slug as string | null, slug]);
    redirect(back);
  }

  const { data: createdRow, error } = await supabase
    .from(table)
    .insert(values)
    .select(SELECT[level])
    .maybeSingle();

  if (error) {
    redirect(
      withError(back, error.code === '23505' ? slugErrorCode(error.message) : 'save_failed'),
    );
  }

  const created = (createdRow ?? null) as { id: string } | null;
  if (!created) redirect(withError(back, 'save_failed'));

  await supabase.rpc('log_audit', {
    p_action: 'create',
    p_entity_type: level,
    p_entity_id: created.id,
    p_before: null,
    p_after: { id: created.id, ...values },
  });

  revalidateLocationSurfaces(level, [slug]);
  redirect(back);
}

/**
 * Admin-only. The child foreign keys are `on delete cascade` (0002), so deleting a
 * country really does take its regions, cities and areas with it; listings keep
 * existing but lose the reference, which is `on delete set null`.
 */
export async function deleteLocation(formData: FormData): Promise<void> {
  await requireRole('admin', BASE);

  const back = safeReturn(formData.get('returnTo'));
  const level = formData.get('level');
  if (!isLevel(level)) redirect(withError(back, 'bad_input'));

  const id = text(formData, 'id');
  if (!UUID.test(id)) redirect(withError(back, 'bad_input'));
  if (formData.get('confirm') !== 'on') redirect(withError(back, 'confirm_required'));

  const supabase = await createClient();
  const table = TABLE[level];

  const { data: beforeRow } = await supabase
    .from(table)
    .select(SELECT[level])
    .eq('id', id)
    .maybeSingle();

  const before = (beforeRow ?? null) as Record<string, unknown> | null;
  if (!before) redirect(withError(back, 'not_found'));

  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) redirect(withError(back, 'delete_failed'));

  await supabase.rpc('log_audit', {
    p_action: 'delete',
    p_entity_type: level,
    p_entity_id: id,
    p_before: before,
    p_after: null,
  });

  revalidateLocationSurfaces(level, [before.slug as string | null]);
  redirect(back);
}
