import type { ReactNode } from 'react';

/**
 * A deliberately small markdown renderer for blog bodies: paragraphs, headings,
 * bold, italic, links and flat lists. It builds React elements rather than an
 * HTML string, so every piece of text is escaped by React and raw HTML in the
 * source is shown as text, never parsed. That is why there is no
 * dangerouslySetInnerHTML here and no markdown dependency to keep patched.
 */
export function Markdown({ source }: { source: string }) {
  return <>{parseBlocks(source).map(renderBlock)}</>;
}

type Block =
  | { kind: 'heading'; level: 2 | 3; text: string }
  | { kind: 'paragraph'; text: string }
  | { kind: 'list'; ordered: boolean; items: string[] };

const HEADING = /^(#{1,3})\s+(.*)$/;
const BULLET = /^\s*[-*+]\s+(.*)$/;
const NUMBERED = /^\s*\d{1,9}[.)]\s+(.*)$/;

function parseBlocks(source: string): Block[] {
  const blocks: Block[] = [];
  let para: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;

  const flush = () => {
    if (para.length) blocks.push({ kind: 'paragraph', text: para.join(' ') });
    if (list) blocks.push({ kind: 'list', ...list });
    para = [];
    list = null;
  };

  for (const raw of source.replace(/\r\n?/g, '\n').split('\n')) {
    const line = raw.trim();
    if (!line) {
      flush();
      continue;
    }
    const h = HEADING.exec(line);
    if (h) {
      flush();
      // The post title is the page's only h1, so "#" and "##" both become h2.
      blocks.push({ kind: 'heading', level: h[1].length === 3 ? 3 : 2, text: h[2] });
      continue;
    }
    const bullet = BULLET.exec(raw);
    const numbered = bullet ? null : NUMBERED.exec(raw);
    const item = bullet ?? numbered;
    if (item) {
      const ordered = Boolean(numbered);
      if (para.length || (list && list.ordered !== ordered)) flush();
      list ??= { ordered, items: [] };
      list.items.push(item[1].trim());
      continue;
    }
    if (list) {
      // An indented line under a list item continues that item.
      if (/^\s/.test(raw)) {
        list.items[list.items.length - 1] += ` ${line}`;
        continue;
      }
      flush();
    }
    para.push(line);
  }
  flush();
  return blocks;
}

function renderBlock(block: Block, i: number) {
  switch (block.kind) {
    case 'heading':
      return block.level === 2 ? (
        <h2 key={i} className="font-headline-md text-headline-md mt-10">
          {inline(block.text)}
        </h2>
      ) : (
        <h3 key={i} className="font-headline-sm text-headline-sm mt-8">
          {inline(block.text)}
        </h3>
      );
    case 'list': {
      const Tag = block.ordered ? 'ol' : 'ul';
      return (
        <Tag
          key={i}
          className={`mt-4 space-y-1 pl-5 text-[var(--text-muted)] ${
            block.ordered ? 'list-decimal' : 'list-disc'
          }`}
        >
          {block.items.map((item, j) => (
            <li key={j}>{inline(item)}</li>
          ))}
        </Tag>
      );
    }
    default:
      return (
        <p key={i} className="mt-4 leading-relaxed text-[var(--text-muted)]">
          {inline(block.text)}
        </p>
      );
  }
}

// Links first so "*" inside a URL is not read as emphasis; one level of
// balanced parentheses is allowed in the URL for addresses like Wikipedia's.
// Underscore emphasis must sit on word boundaries so snake_case_words stay as
// written. Emphasis spans are capped at 500 characters so an unclosed marker
// costs a bounded scan, not one to the end of the paragraph (quadratic overall).
const INLINE =
  /\[([^\]\n]+)\]\(\s*((?:[^()\s]|\([^()\s]*\))+)\s*\)|\*\*(.{1,500}?)\*\*|__(.{1,500}?)__|\*(?!\s)(.{1,500}?)\*|(?<![A-Za-z0-9])_(?!\s)(.{1,500}?)_(?![A-Za-z0-9])/;

function inline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  let rest = text;
  let key = 0;
  while (rest) {
    const m = INLINE.exec(rest);
    if (!m) {
      out.push(rest);
      break;
    }
    if (m.index > 0) out.push(rest.slice(0, m.index));
    const [whole, linkText, href, strong, strong2, em, em2] = m;
    if (linkText !== undefined) {
      const safe = safeHref(href);
      out.push(
        safe ? (
          <a key={key++} href={safe} className="text-brand-700 underline hover:no-underline">
            {inline(linkText)}
          </a>
        ) : (
          // An unsafe link keeps its text and loses the href.
          <span key={key++}>{inline(linkText)}</span>
        ),
      );
    } else if (strong !== undefined || strong2 !== undefined) {
      out.push(
        <strong key={key++} className="font-semibold text-[var(--text)]">
          {inline(strong ?? strong2)}
        </strong>,
      );
    } else {
      out.push(<em key={key++}>{inline(em ?? em2)}</em>);
    }
    rest = rest.slice(m.index + whole.length);
  }
  return out;
}

/**
 * Only http(s) and same-site relative links. Anything with a scheme
 * (javascript:, data:, vbscript:...) or a protocol-relative "//host" is refused.
 * Control characters and whitespace are rejected outright because browsers
 * strip them, which is how "java\tscript:" sneaks past naive checks.
 */
export function safeHref(href: string): string | null {
  if (/[\x00-\x20\x7f]/.test(href)) return null;
  // Browsers read a backslash as a slash, so "/\evil.com" is protocol-relative.
  if (href.includes('\\') || href.startsWith('//')) return null;
  if (/^https?:\/\/[^/]/i.test(href)) return href;
  if (/^[^/?#]*:/.test(href)) return null;
  return href;
}
