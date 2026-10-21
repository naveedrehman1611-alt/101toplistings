import { SITE_URL } from '@/lib/supabase';

/**
 * The founder as a schema.org Person. The About page publishes the full entity
 * and the Organization and blog posts point at it by @id, so search engines and
 * AI answers see one consistent person behind the brand.
 */

export const FOUNDER_ID = `${SITE_URL}/about#founder`;

export type FounderFields = {
  name: string;
  role: string;
  profile_url: string;
  /** The photo's URL, absolute or a /public path. */
  photo?: { src: string };
};

export function founderPersonSchema(f: FounderFields): Record<string, unknown> {
  const profile = /^https?:\/\//.test(f.profile_url.trim()) ? f.profile_url.trim() : '';
  return {
    '@type': 'Person',
    '@id': FOUNDER_ID,
    name: f.name,
    ...(f.role ? { jobTitle: f.role } : {}),
    url: `${SITE_URL}/about`,
    ...(f.photo?.src
      ? { image: f.photo.src.startsWith('/') ? `${SITE_URL}${f.photo.src}` : f.photo.src }
      : {}),
    worksFor: { '@id': `${SITE_URL}/#organization` },
    ...(profile ? { sameAs: [profile] } : {}),
  };
}
