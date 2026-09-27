import { FormError, slugify, text } from './form-data';

/**
 * Pure parsers for the blog editor. Kept out of the 'use server' action file:
 * everything exported from there becomes a callable endpoint.
 */

const WORDS_PER_MINUTE = 200;

/** Estimated reading time. Null for an empty body so the "min read" line is hidden. */
export function readMinutes(body: string | null): number | null {
  if (!body) return null;
  const words = body.split(/\s+/).filter(Boolean).length;
  if (words === 0) return null;
  // read_minutes is a smallint; no real article gets near the cap.
  return Math.min(Math.max(1, Math.ceil(words / WORDS_PER_MINUTE)), 32767);
}

/**
 * Optional canonical override. Must be an absolute http(s) URL: a relative or
 * malformed value would emit a broken canonical, which is exactly the defect
 * the column exists to avoid (see 0005_blog.sql).
 */
export function canonicalUrl(fd: FormData): string | null {
  const v = text(fd, 'canonical_url', 500);
  if (!v) return null;
  let u: URL;
  try {
    u = new URL(v);
  } catch {
    throw new FormError('Canonical URL must be a full URL starting with http:// or https://.');
  }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') {
    throw new FormError('Canonical URL must start with http:// or https://.');
  }
  return u.toString();
}

export type TagInput = { slug: string; name: string };

const MAX_TAGS = 20;

/** "Local SEO, reviews, local seo" -> two tags, deduplicated by slug. */
export function parseTags(fd: FormData): TagInput[] {
  const raw = text(fd, 'tags', 2000) ?? '';
  const bySlug = new Map<string, TagInput>();
  for (const part of raw.split(',')) {
    const name = part.trim().replace(/\s+/g, ' ').slice(0, 50);
    if (!name) continue;
    const slug = slugify(name);
    if (!slug) throw new FormError(`"${name}" cannot be used as a tag.`);
    if (!bySlug.has(slug)) bySlug.set(slug, { slug, name });
  }
  if (bySlug.size > MAX_TAGS) throw new FormError(`Use at most ${MAX_TAGS} tags.`);
  return [...bySlug.values()];
}
