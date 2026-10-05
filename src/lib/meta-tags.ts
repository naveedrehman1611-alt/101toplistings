/**
 * Pure helpers for the free Meta Tag Generator: HTML-escaping, the generated
 * <head> snippet and the breadcrumb-style URL Google shows in results.
 */

export type MetaInput = {
  title: string;
  description: string;
  url: string;
  siteName: string;
  index: 'index' | 'noindex';
  follow: 'follow' | 'nofollow';
  canonical: string;
  image: string;
  twitterCard: 'summary' | 'summary_large_image';
  ogType: string;
  language: string;
};

/** Escapes text for use inside an HTML attribute value or element text. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Collapses whitespace the way a browser does when it renders a tag. */
export const clean = (s: string) => s.replace(/\s+/g, ' ').trim();

/** The generated tags, one per line; tags for empty fields are left out. */
export function buildSnippet(m: MetaInput): string {
  const title = clean(m.title);
  const description = clean(m.description);
  // Absolute URLs: og:url and canonical must not be relative.
  const absolute = (raw: string) => (raw ? (parseUrl(raw)?.href ?? raw) : '');
  const canonical = absolute(clean(m.canonical));
  const url = canonical || absolute(clean(m.url));
  const image = clean(m.image);
  const siteName = clean(m.siteName);
  const language = clean(m.language);
  const meta = (attr: 'name' | 'property', key: string, value: string) =>
    value ? `<meta ${attr}="${key}" content="${escapeHtml(value)}">` : '';

  const head = [
    language
      ? `<!-- Set the page language on the html element: <html lang="${escapeHtml(language)}"> -->`
      : '',
    title ? `<title>${escapeHtml(title)}</title>` : '',
    meta('name', 'description', description),
    // index, follow is what search engines assume, so the tag is only needed to opt out.
    m.index === 'noindex' || m.follow === 'nofollow'
      ? meta('name', 'robots', `${m.index}, ${m.follow}`)
      : '',
    canonical ? `<link rel="canonical" href="${escapeHtml(canonical)}">` : '',
  ];
  const og = [
    '<!-- Open Graph -->',
    meta('property', 'og:type', clean(m.ogType) || 'website'),
    meta('property', 'og:title', title),
    meta('property', 'og:description', description),
    meta('property', 'og:url', url),
    meta('property', 'og:image', image),
    meta('property', 'og:site_name', siteName),
    // og:locale wants language_TERRITORY (en_PK); a bare "en" is left out.
    /^[a-z]{2,3}[-_][a-z]{2}$/i.test(language)
      ? meta(
          'property',
          'og:locale',
          `${language.slice(0, -3).toLowerCase()}_${language.slice(-2).toUpperCase()}`,
        )
      : '',
  ];
  const twitter = [
    '<!-- Twitter / X -->',
    meta('name', 'twitter:card', m.twitterCard),
    meta('name', 'twitter:title', title),
    meta('name', 'twitter:description', description),
    meta('name', 'twitter:image', image),
  ];
  return [head, og, twitter]
    .map((section) => section.filter(Boolean).join('\n'))
    .filter(Boolean)
    .join('\n\n');
}

/** Parses a user-typed URL, adding https:// when the scheme is missing. */
export function parseUrl(raw: string): URL | null {
  const v = raw.trim();
  if (!v) return null;
  try {
    return new URL(/^[a-z][a-z\d+.-]*:\/\//i.test(v) ? v : `https://${v}`);
  } catch {
    return null;
  }
}

/** "https://www.example.com › services › seo" style display URL. */
export function breadcrumbUrl(raw: string): { origin: string; path: string[] } {
  const u = parseUrl(raw);
  if (!u) return { origin: 'https://www.example.com', path: [] };
  const path = u.pathname
    .split('/')
    .filter(Boolean)
    .map((s) => {
      try {
        return decodeURIComponent(s);
      } catch {
        return s;
      }
    });
  return { origin: `${u.protocol}//${u.host}`, path };
}
