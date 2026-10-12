import 'server-only';
import { cache } from 'react';
import { getMediaByIds, getSettings, reportError, settingText } from '../queries';
import { supabase } from '../supabase';
import { mediaUrl } from '../media';
import { CONTENT_PAGES, type PageId } from './registry';
import {
  fillBrand,
  isUuid,
  readStoredSection,
  type Field,
  type ImageField,
  type ImageValue,
  type SectionSpec,
  type SectionValues,
  type StoredImage,
} from './schema';

type Row = { key: string; data: unknown; is_enabled: boolean };

/**
 * Every override row, once per render. The table holds one row per edited
 * section, so it stays small; the anon client caches the read under
 * pg:site_content, which saveContent() expires. A failed read (the migration
 * not applied yet, say) is logged and the pages render their defaults.
 */
const getRows = cache(async function getRows(): Promise<Map<string, Row>> {
  const { data, error } = await supabase.from('site_content').select('key, data, is_enabled');
  reportError('site_content.select', error);
  return new Map(((data ?? []) as Row[]).map((r) => [r.key, r]));
});

function collectMediaIds(field: Field, value: unknown, out: Set<string>) {
  if (field.kind === 'image') {
    const id = (value as StoredImage).media_id;
    if (isUuid(id)) out.add(id);
  } else if (field.kind === 'list') {
    for (const item of value as Record<string, unknown>[]) {
      for (const [k, sub] of Object.entries(field.item)) collectMediaIds(sub, item[k], out);
    }
  }
}

type Media = Map<
  string,
  { path: string; alt: string | null; width: number | null; height: number | null }
>;

function resolveImage(
  field: ImageField,
  stored: StoredImage,
  media: Media,
  brand: string,
): ImageValue {
  const row = stored.media_id ? media.get(stored.media_id) : undefined;
  // Alt text written in the section wins; then the library's alt; then the default's.
  const alt = fillBrand(stored.alt.trim() || row?.alt?.trim() || '', brand);
  return row
    ? { src: mediaUrl(row.path), alt, width: row.width, height: row.height }
    : { src: field.default.src, alt, width: null, height: null };
}

function resolveField(field: Field, value: unknown, media: Media, brand: string): unknown {
  switch (field.kind) {
    case 'text':
    case 'textarea':
      return fillBrand(value as string, brand);
    case 'link': {
      const l = value as { label: string; href: string };
      return { label: fillBrand(l.label, brand), href: l.href };
    }
    case 'image':
      return resolveImage(field, value as StoredImage, media, brand);
    case 'list':
      return (value as Record<string, unknown>[]).map((item) => {
        const out: Record<string, unknown> = {};
        for (const [k, sub] of Object.entries(field.item)) {
          out[k] = resolveField(sub, item[k], media, brand);
        }
        return out;
      });
    default:
      return value;
  }
}

/**
 * Every section of one page, resolved: overrides over defaults, {brand}
 * filled in, images turned into URLs. Sections nobody edited come back as the
 * code defaults, so this never returns less than the original page had.
 */
export const getPageContent = cache(async function getPageContent<P extends PageId>(
  page: P,
): Promise<{
  [S in keyof (typeof CONTENT_PAGES)[P]['sections']]: SectionValues<
    (typeof CONTENT_PAGES)[P]['sections'][S]
  >;
}> {
  const spec = CONTENT_PAGES[page];
  const sections = spec.sections as Record<string, SectionSpec>;
  const [rows, settings] = await Promise.all([getRows(), getSettings()]);
  const brand = settingText(settings, 'brand.name', 'RankYouSite') || 'RankYouSite';

  const stored = Object.entries(sections).map(([name, section]) => {
    const row = rows.get(`${page}.${name}`);
    return {
      name,
      section,
      values: readStoredSection(section, row?.data),
      visible: section.hideable === false ? true : (row?.is_enabled ?? true),
    };
  });

  const ids = new Set<string>();
  for (const { section, values } of stored) {
    for (const [k, field] of Object.entries(section.fields)) collectMediaIds(field, values[k], ids);
  }
  const media: Media = new Map(
    (ids.size ? await getMediaByIds([...ids]) : []).map((m) => [m.id, m]),
  );

  const out: Record<string, Record<string, unknown>> = {};
  for (const { name, section, values, visible } of stored) {
    const resolved: Record<string, unknown> = { visible };
    for (const [k, field] of Object.entries(section.fields)) {
      resolved[k] = resolveField(field, values[k], media, brand);
    }
    out[name] = resolved;
  }
  // The mapped return type is what callers rely on; the loop above builds it from the same spec.
  return out as never;
});
