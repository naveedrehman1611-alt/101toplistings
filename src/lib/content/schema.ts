/**
 * The editable-content model: what fields a page section has, their defaults,
 * and how a stored override is read back.
 *
 * Every section's defaults are the copy the page shipped with, so a missing or
 * malformed row in site_content renders exactly the original page. The admin
 * editor (src/app/admin/content) is generated from these specs, and the save
 * action (src/lib/content-actions.ts) validates against them, so a field the
 * admin offers is always one the page reads.
 *
 * Safe to import from client and server code: no data access here.
 */

import { isIconName, type IconName } from '@/components/icon';

type Base = { label: string; hint?: string };

export type TextField = Base & { kind: 'text'; default: string; max?: number };
/** Multi-line. Components split it into paragraphs on blank lines (see paragraphs()). */
export type TextareaField = Base & { kind: 'textarea'; default: string; max?: number };
export type LinkField = Base & { kind: 'link'; default: LinkValue };
/** `default.src` is a path under /public, used until an image is chosen from Media. */
export type ImageField = Base & { kind: 'image'; default: { src: string; alt: string } };
/** A Material Symbols name from src/components/icon.tsx, the set the public pages draw. */
export type IconField = Base & { kind: 'icon'; default: IconName };
export type BooleanField = Base & { kind: 'boolean'; default: boolean };

export type ScalarField =
  TextField | TextareaField | LinkField | ImageField | IconField | BooleanField;

export type ListField<I extends Record<string, ScalarField> = Record<string, ScalarField>> =
  Base & {
    kind: 'list';
    /** Singular noun for the add button, such as "card". */
    noun: string;
    max: number;
    item: I;
    default: readonly ItemDefault<I>[];
  };

export type Field = ScalarField | ListField;
export type Fields = Record<string, Field>;

export type SectionSpec<F extends Fields = Fields> = {
  label: string;
  description?: string;
  /** False for sections a page cannot do without, such as one holding the H1. */
  hideable?: boolean;
  fields: F;
};

export type PageSpec = {
  label: string;
  /** Public path, for the "View page" link. Dynamic pages give an example. */
  path: string;
  sections: Record<string, SectionSpec>;
};

export const TEXT_MAX = 300;
export const TEXTAREA_MAX = 5000;

// ---------------------------------------------------------------------------
// Values
// ---------------------------------------------------------------------------

export type LinkValue = { label: string; href: string };
/** A resolved image: a URL ready for next/image. */
export type ImageValue = { src: string; alt: string; width: number | null; height: number | null };
/** An image as stored: a media row, or null for the code default, plus alt text. */
export type StoredImage = { media_id: string | null; alt: string };

type ScalarValue<F> = F extends IconField
  ? IconName
  : F extends TextField | TextareaField
    ? string
    : F extends BooleanField
      ? boolean
      : F extends LinkField
        ? LinkValue
        : F extends ImageField
          ? ImageValue
          : never;

type ItemDefault<I> = { [K in keyof I]: I[K] extends ImageField ? StoredImage : ScalarValue<I[K]> };

type FieldValue<F> =
  F extends ListField<infer I> ? { [K in keyof I]: ScalarValue<I[K]> }[] : ScalarValue<F>;

/** What a component receives for a section: every field, resolved, plus `visible`. */
export type SectionValues<S> = S extends { fields: infer F }
  ? { [K in keyof F]: FieldValue<F[K]> } & { visible: boolean }
  : never;

/** Identity helpers: they only pin the generic so values and components stay typed. */
export function defineSection<const F extends Fields>(spec: SectionSpec<F>): SectionSpec<F> {
  return spec;
}

export function definePage<const S extends Record<string, SectionSpec>>(
  spec: Omit<PageSpec, 'sections'> & { sections: S },
): Omit<PageSpec, 'sections'> & { sections: S } {
  return spec;
}

// Field constructors, so page specs stay short and readable.
export const text = (label: string, def: string, opts: { max?: number; hint?: string } = {}) =>
  ({ kind: 'text', label, default: def, ...opts }) as const satisfies TextField;
export const textarea = (label: string, def: string, opts: { max?: number; hint?: string } = {}) =>
  ({ kind: 'textarea', label, default: def, ...opts }) as const satisfies TextareaField;
export const link = (label: string, def: LinkValue, hint?: string) =>
  ({ kind: 'link', label, default: def, hint }) as const satisfies LinkField;
export const image = (label: string, def: { src: string; alt: string }, hint?: string) =>
  ({ kind: 'image', label, default: def, hint }) as const satisfies ImageField;
export const icon = (label: string, def: IconName, hint?: string) =>
  ({ kind: 'icon', label, default: def, hint }) as const satisfies IconField;
export const toggle = (label: string, def: boolean, hint?: string) =>
  ({ kind: 'boolean', label, default: def, hint }) as const satisfies BooleanField;
export function list<const I extends Record<string, ScalarField>>(
  label: string,
  opts: { noun: string; max: number; item: I; default: readonly ItemDefault<I>[]; hint?: string },
): ListField<I> {
  return { kind: 'list', label, ...opts };
}

// ---------------------------------------------------------------------------
// Reading stored values
// ---------------------------------------------------------------------------

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID.test(value);
}

/** A same-site path or an http(s) URL; anything else could run script or leave the site oddly. */
export function isSafeHref(href: string): boolean {
  if (href.startsWith('/')) return !href.startsWith('//') && !href.includes('\\');
  if (href.startsWith('#')) return true;
  return /^https?:\/\/[^\s]+$/i.test(href) || /^(mailto|tel):[^\s]+$/i.test(href);
}

function obj(raw: unknown): Record<string, unknown> {
  return raw && typeof raw === 'object' && !Array.isArray(raw)
    ? (raw as Record<string, unknown>)
    : {};
}

/** The default an image field stores: no media row, the code default's alt text. */
export function defaultStoredImage(field: ImageField): StoredImage {
  return { media_id: null, alt: field.default.alt };
}

/**
 * A field's stored form, coerced: right type, right length, or the default.
 * Images stay as { media_id, alt } here; resolveImages() turns them into URLs.
 */
export function readStoredField(field: Field, raw: unknown): unknown {
  switch (field.kind) {
    case 'text':
    case 'textarea': {
      const max = field.max ?? (field.kind === 'text' ? TEXT_MAX : TEXTAREA_MAX);
      return typeof raw === 'string' ? raw.slice(0, max) : field.default;
    }
    case 'icon':
      return isIconName(raw) ? raw : field.default;
    case 'boolean':
      return typeof raw === 'boolean' ? raw : field.default;
    case 'link': {
      const o = obj(raw);
      const label = typeof o.label === 'string' ? o.label.slice(0, TEXT_MAX) : field.default.label;
      const href =
        typeof o.href === 'string' && (o.href === '' || isSafeHref(o.href))
          ? o.href
          : field.default.href;
      return { label, href };
    }
    case 'image': {
      if (raw === undefined) return defaultStoredImage(field);
      const o = obj(raw);
      return {
        media_id: isUuid(o.media_id) ? o.media_id : null,
        alt: typeof o.alt === 'string' ? o.alt.slice(0, TEXT_MAX) : field.default.alt,
      };
    }
    case 'list': {
      if (!Array.isArray(raw)) return field.default.map((item) => readStoredItem(field, item));
      return raw.slice(0, field.max).map((item) => readStoredItem(field, item));
    }
  }
}

function readStoredItem(field: ListField, raw: unknown): Record<string, unknown> {
  const o = obj(raw);
  const out: Record<string, unknown> = {};
  for (const [key, sub] of Object.entries(field.item)) out[key] = readStoredField(sub, o[key]);
  return out;
}

/** A whole section's stored form, with every field present. */
export function readStoredSection(spec: SectionSpec, raw: unknown): Record<string, unknown> {
  const o = obj(raw);
  const out: Record<string, unknown> = {};
  for (const [key, field] of Object.entries(spec.fields)) out[key] = readStoredField(field, o[key]);
  return out;
}

/** The section's defaults in stored form: what "Reset to default" goes back to. */
export function defaultSection(spec: SectionSpec): Record<string, unknown> {
  return readStoredSection(spec, {});
}

// ---------------------------------------------------------------------------
// Text helpers for components
// ---------------------------------------------------------------------------

/** Copy may say {brand}; it becomes the brand.name setting, so a rebrand is one edit. */
export function fillBrand(text: string, brand: string): string {
  return text.replaceAll('{brand}', brand);
}

/** Paragraphs are separated by a blank line. */
export function paragraphs(text: string | null | undefined): string[] {
  if (!text) return [];
  return text
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s*\n\s*/g, ' ').trim())
    .filter(Boolean);
}

/** One entry per non-empty line, for checklists and line-broken headings. */
export function lines(text: string | null | undefined): string[] {
  if (!text) return [];
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
}
