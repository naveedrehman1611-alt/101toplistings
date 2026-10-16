/**
 * Helpers for the admin markdown editor's internal linking: building a
 * [text](href) link and linking every (or the first) mention of a keyword.
 * Pure string functions, safe on server and client.
 */

// The same link shape src/components/markdown.tsx renders.
const LINK = /\[([^\]\n]+)\]\(\s*((?:[^()\s]|\([^()\s]*\))+)\s*\)/g;

/** Characters that would end the [text] part of a link early. */
export function cleanAnchorText(text: string): string {
  return text.replace(/[[\]\n\r]+/g, ' ').trim();
}

/**
 * Makes an href safe to sit inside (…): parentheses and spaces are encoded so
 * the renderer cannot read the link as ending early.
 */
export function encodeHref(href: string): string {
  return href.trim().replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/ /g, '%20');
}

export function markdownLink(text: string, href: string): string {
  return `[${cleanAnchorText(text)}](${encodeHref(href)})`;
}

/** Internal links start with "/" (not "//"); everything else counts as external. */
export function isInternalHref(href: string): boolean {
  return href.startsWith('/') && !href.startsWith('//');
}

export type FoundLink = { text: string; href: string; internal: boolean };

export function findLinks(source: string): FoundLink[] {
  return [...source.matchAll(LINK)].map((m) => ({
    text: m[1],
    href: m[2],
    internal: isInternalHref(m[2]),
  }));
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Wraps mentions of `keyword` in links to `href`. Matching ignores case and
 * keeps the text as written, needs whole words, and skips text that is
 * already a link or a heading line. With `all` false only the first mention
 * is linked, which is the usual internal-linking advice.
 */
export function linkKeyword(
  source: string,
  keyword: string,
  href: string,
  all = false,
): { text: string; count: number } {
  const word = cleanAnchorText(keyword);
  if (!word) return { text: source, count: 0 };

  // Ranges a new link must not touch: existing links, heading lines and bare URLs.
  const blocked: [number, number][] = [];
  for (const re of [LINK, /^[ \t]*#{1,6}[ \t].*$/gm, /https?:\/\/\S+/g]) {
    for (const m of source.matchAll(re)) blocked.push([m.index, m.index + m[0].length]);
  }
  const isBlocked = (start: number, end: number) => blocked.some(([a, b]) => start < b && end > a);

  const re = new RegExp(`(?<![\\p{L}\\p{N}_])${escapeRegExp(word)}(?![\\p{L}\\p{N}_])`, 'giu');
  const target = encodeHref(href);
  let out = '';
  let last = 0;
  let count = 0;
  for (const m of source.matchAll(re)) {
    const start = m.index;
    const end = start + m[0].length;
    if (isBlocked(start, end)) continue;
    out += `${source.slice(last, start)}[${m[0]}](${target})`;
    last = end;
    count++;
    if (!all) break;
  }
  return { text: out + source.slice(last), count };
}

/**
 * Inline markdown as plain text, for meta descriptions, Open Graph and other
 * places that cannot hold links: [text](href) becomes text and paired
 * **bold**, __bold__, *italic* and _italic_ markers are dropped. Mirrors the
 * inline grammar of src/components/markdown.tsx, so snake_case_words and a
 * lone "*" stay as written.
 */
export function stripMarkdown(source: string): string {
  return source
    .replace(LINK, '$1')
    .replace(/\*\*(.{1,500}?)\*\*/g, '$1')
    .replace(/__(.{1,500}?)__/g, '$1')
    .replace(/\*(?!\s)(.{1,500}?)\*/g, '$1')
    .replace(/(?<![A-Za-z0-9])_(?!\s)(.{1,500}?)_(?![A-Za-z0-9])/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}
