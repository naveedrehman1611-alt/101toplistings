import Link from 'next/link';
import type { ReactNode } from 'react';

/**
 * Editable copy on the free tool pages, rendered into the markup the pages
 * were designed with. Deliberately smaller than InlineMarkdown: it knows
 * `code`, **bold** and [links](/path) only, because tool copy is full of
 * robots.txt rules such as "Disallow: /*?sort=" whose asterisks must stay text.
 * Server- and client-safe.
 */

export type RichClasses = {
  /** Class for `code` spans; none when omitted. */
  code?: string;
  /** Class for **bold** spans; none when omitted. */
  strong?: string;
  /** Class for [links](/path). */
  link?: string;
};

// The same rule as isSafeHref() in lib/content/schema, which this file does not
// import because that module pulls every icon into client bundles.
function safeHref(href: string): boolean {
  if (href.startsWith('/')) return !href.startsWith('//') && !href.includes('\\');
  if (href.startsWith('#')) return true;
  return /^https?:\/\/[^\s]+$/i.test(href) || /^(mailto|tel):[^\s]+$/i.test(href);
}

const TOKEN = /`([^`\n]+)`|\*\*(.+?)\*\*|\[([^\]\n]+)\]\(([^)\s]+)\)/;

/** One line of copy: `code`, **bold** and [links](/path) become elements. */
export function RichInline({ text, classes = {} }: { text: string; classes?: RichClasses }) {
  const out: ReactNode[] = [];
  let rest = text;
  let key = 0;
  while (rest) {
    const m = TOKEN.exec(rest);
    if (!m) {
      out.push(rest);
      break;
    }
    if (m.index > 0) out.push(rest.slice(0, m.index));
    const [whole, code, strong, linkText, href] = m;
    if (code !== undefined) {
      out.push(
        <code key={key++} className={classes.code}>
          {code}
        </code>,
      );
    } else if (strong !== undefined) {
      out.push(
        <strong key={key++} className={classes.strong}>
          {strong}
        </strong>,
      );
    } else if (safeHref(href)) {
      out.push(
        <Link key={key++} href={href} className={classes.link}>
          {linkText}
        </Link>,
      );
    } else {
      out.push(linkText);
    }
    rest = rest.slice(m.index + whole.length);
  }
  return <>{out}</>;
}

/**
 * A block of copy: paragraphs separated by a blank line, and a paragraph whose
 * every line starts with "- " becomes a bulleted list.
 */
export function RichBlocks({ text, classes }: { text: string; classes?: RichClasses }) {
  const blocks = text
    .replace(/\r\n?/g, '\n')
    .split(/\n\s*\n/)
    .map((b) =>
      b
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean),
    )
    .filter((b) => b.length);
  return (
    <>
      {blocks.map((block, i) =>
        block.every((l) => l.startsWith('- ')) ? (
          <ul key={i} className="list-disc space-y-2 pl-5">
            {block.map((l, j) => (
              <li key={j}>
                <RichInline text={l.slice(2).trim()} classes={classes} />
              </li>
            ))}
          </ul>
        ) : (
          <p key={i}>
            <RichInline text={block.join(' ')} classes={classes} />
          </p>
        ),
      )}
    </>
  );
}

/** One entry per non-empty line, for lists of notes. */
export function lines(text: string): string[] {
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
}

/** Fills "{name}" placeholders in a label, such as "{count} characters". */
export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (whole, name: string) =>
    Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : whole,
  );
}
