/**
 * Small, dependency-free readers for FormData in Server Actions. Every value
 * from a form is untrusted input, so these normalise rather than cast.
 */

/** Trimmed text, or null when blank — so an empty field clears a column. */
export function text(fd: FormData, key: string, max = 5000): string | null {
  const v = fd.get(key);
  if (typeof v !== 'string') return null;
  const t = v.trim().slice(0, max);
  return t === '' ? null : t;
}

export function required(fd: FormData, key: string, label: string, max = 500): string {
  const v = text(fd, key, max);
  if (!v) throw new FormError(`${label} is required.`);
  return v;
}

export function num(fd: FormData, key: string, label: string): number | null {
  const v = text(fd, key, 50);
  if (v === null) return null;
  const n = Number(v);
  if (!Number.isFinite(n)) throw new FormError(`${label} must be a number.`);
  return n;
}

export function bool(fd: FormData, key: string): boolean {
  return fd.get(key) === 'on' || fd.get(key) === 'true';
}

/** A uuid from a select, or null for the empty option. */
export function uuid(fd: FormData, key: string): string | null {
  const v = text(fd, key, 64);
  if (!v) return null;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)) {
    throw new FormError('Invalid selection.');
  }
  return v;
}

/** URL-safe slug: lowercase ASCII words joined by hyphens. */
export function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/** The slug field if given, otherwise derived from the name. */
export function slugFrom(fd: FormData, nameKey = 'name'): string {
  const s = slugify(text(fd, 'slug', 120) ?? text(fd, nameKey, 200) ?? '');
  if (!s) throw new FormError('A slug could not be made from that name.');
  return s;
}

/** A validation failure whose message is safe to show the user. */
export class FormError extends Error {}

/**
 * Turns a thrown error into a message for the ?error= query param. Postgres
 * errors are translated where the cause is something the user can fix.
 */
export function errorMessage(e: unknown): string {
  if (e instanceof FormError) return e.message;
  const pg = e as { code?: string; message?: string };
  if (pg?.code === '23505') {
    return pg.message?.includes('location slug')
      ? pg.message
      : 'That slug is already in use. Choose another.';
  }
  if (pg?.code === '23503') return 'It is still in use elsewhere, so it cannot be removed.';
  if (pg?.code === '42501') return 'You do not have permission to do that.';
  return pg?.message ?? 'Something went wrong.';
}
