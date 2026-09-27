import { FormError } from './form-data';

/**
 * URL rules shared by the menu builder and the redirects manager. Both store a
 * string that is later rendered as an href or sent as a Location header, so
 * anything other than a same-site path or a plain http(s) URL is refused:
 * `javascript:` and `data:` would run script, and `//host` or `/\host` are
 * read by browsers as a link to another site.
 */

// Whitespace and control characters: browsers strip some of them before
// parsing ("java\tscript:"), so allowing them would sneak past the checks below.
const UNSAFE_CHARS = /[\s\u0000-\u001f\u007f\\]/;

export type CheckedLink = { url: string; isExternal: boolean };

/** True for "/path" but not "//host" — the protocol-relative form leaves the site. */
function isSitePath(value: string): boolean {
  return value.startsWith('/') && !value.startsWith('//');
}

/** A same-site path, or an absolute http(s) URL. Throws a FormError otherwise. */
export function checkLink(raw: string, label: string): CheckedLink {
  const value = raw.trim();
  if (UNSAFE_CHARS.test(value)) {
    throw new FormError(`${label} must not contain spaces, backslashes or control characters.`);
  }
  if (isSitePath(value)) return { url: value, isExternal: false };

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new FormError(`${label} must start with / or be a full http(s):// address.`);
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new FormError(`${label} must be a path starting with / or an http(s) address.`);
  }
  if (!parsed.hostname) throw new FormError(`${label} needs a host name.`);
  // Stored normalised, so the saved value is exactly what a browser will
  // follow ("https:host" is lenient input for "https://host/").
  return { url: parsed.href, isExternal: true };
}

/**
 * A redirect source: the pathname of a URL that would otherwise 404. Query
 * strings and fragments are refused because only the pathname is matched, so
 * such a rule could never fire. A trailing slash is dropped because Next.js
 * already redirects "/a/" to "/a" before the lookup runs.
 */
export function checkRedirectSource(raw: string): string {
  let value = raw.trim();
  if (UNSAFE_CHARS.test(value)) {
    throw new FormError('Source must not contain spaces, backslashes or control characters.');
  }
  if (!isSitePath(value)) throw new FormError('Source must be a path starting with a single /.');
  if (/[?#]/.test(value)) throw new FormError('Source is a path only: no ? query or # fragment.');
  // The lookup compares against the request path as it arrives, which is
  // percent-encoded ("/caf%C3%A9"), so store the encoded form of what was typed.
  value = new URL(value, 'http://localhost').pathname.replace(/(.)\/+$/, '$1');
  if (value === '/') throw new FormError('The home page cannot be redirected.');
  return value;
}
