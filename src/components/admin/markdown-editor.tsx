'use client';

import { useEffect, useId, useRef, useState, useTransition } from 'react';
import { InlineMarkdown, Markdown, safeHref } from '@/components/markdown';
import { searchLinkTargets, type LinkTarget } from '@/lib/link-target-actions';
import { findLinks, linkKeyword, markdownLink } from '@/lib/markdown-links';

const areaCls =
  'w-full rounded-b-lg border border-t-0 border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-mono text-sm leading-relaxed outline-hidden focus:border-primary-container focus:ring-2 focus:ring-primary-container/20';
const inputCls =
  'mt-1 h-9 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-2.5 text-sm outline-hidden focus:border-primary-container focus:ring-2 focus:ring-primary-container/20';
const toolBtn =
  'h-8 min-w-8 rounded-md px-2 text-sm hover:bg-[var(--surface)] disabled:opacity-40 aria-pressed:bg-[var(--surface)] aria-pressed:font-semibold';
const smallBtn =
  'h-8 rounded-md border border-[var(--border)] px-3 text-xs font-medium hover:bg-[var(--surface-2)] disabled:opacity-40';

type Panel = null | 'link' | 'keyword';

/**
 * A markdown textarea with a toolbar for the admin forms: bold, italic,
 * headings, lists, a link dialog that searches the site's own pages, and
 * "link a keyword" for internal linking. It is still a plain textarea named
 * `name`, so the forms and their save actions are unchanged, and the stored
 * text stays markdown that <Markdown> renders without any raw HTML.
 */
export function MarkdownEditor({
  label,
  name,
  defaultValue,
  rows = 8,
  hint,
  required,
  maxLength,
  inline = false,
  onChange,
}: {
  label: string;
  /** The form field name; leave out when the parent keeps the value itself (onChange). */
  name?: string;
  defaultValue?: string | null;
  rows?: number;
  hint?: string;
  required?: boolean;
  maxLength?: number;
  /** One run of text (InlineMarkdown): no headings or lists in the toolbar. */
  inline?: boolean;
  /** Called with the full text after every change, typed or from the toolbar. */
  onChange?: (value: string) => void;
}) {
  const id = useId();
  const ref = useRef<HTMLTextAreaElement>(null);
  const [value, setValueState] = useState(defaultValue ?? '');
  const setValue = (v: string) => {
    setValueState(v);
    onChange?.(v);
  };
  const [preview, setPreview] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);
  // The selection when a panel opened, so typing in the panel cannot lose it.
  const [sel, setSel] = useState<[number, number]>([0, 0]);

  const links = findLinks(value);
  const internal = links.filter((l) => l.internal).length;

  /** Replaces [start, end) and selects the given range of the result. */
  const replace = (start: number, end: number, text: string, selStart: number, selEnd: number) => {
    const ta = ref.current;
    if (!ta) return;
    ta.focus();
    ta.setSelectionRange(start, end);
    // insertText keeps the browser's undo history; setRangeText is the fallback.
    if (!document.execCommand('insertText', false, text)) ta.setRangeText(text, start, end);
    ta.setSelectionRange(selStart, selEnd);
    setValue(ta.value);
  };

  const wrap = (before: string, after: string, placeholder: string) => {
    const ta = ref.current;
    if (!ta) return;
    const { selectionStart: s, selectionEnd: e } = ta;
    const inner = ta.value.slice(s, e) || placeholder;
    replace(s, e, before + inner + after, s + before.length, s + before.length + inner.length);
  };

  /** Puts `prefix` (or "1. ", "2. "… when numbered) at the start of each selected line. */
  const prefixLines = (prefix: string, numbered = false) => {
    const ta = ref.current;
    if (!ta) return;
    const v = ta.value;
    const start = v.lastIndexOf('\n', ta.selectionStart - 1) + 1;
    let end = v.indexOf('\n', ta.selectionEnd);
    if (end === -1) end = v.length;
    const lines = v.slice(start, end).split('\n');
    const text = lines
      .map((l, i) => {
        const bare = l.replace(/^(#{1,3}\s+|\s*[-*+]\s+|\s*\d{1,9}[.)]\s+)/, '');
        return (numbered ? `${i + 1}. ` : prefix) + bare;
      })
      .join('\n');
    replace(start, end, text, start, start + text.length);
  };

  const open = (p: Panel) => {
    const ta = ref.current;
    if (ta) setSel([ta.selectionStart, ta.selectionEnd]);
    setPreview(false);
    setPanel((cur) => (cur === p ? null : p));
  };

  const selected = value.slice(sel[0], sel[1]);

  return (
    <div className="block text-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <label htmlFor={id} className="font-medium">
          {label}
          {required ? <span className="text-error"> *</span> : null}
        </label>
        <span className="text-xs text-[var(--text-muted)]">
          {internal} internal link{internal === 1 ? '' : 's'}, {links.length - internal} external
        </span>
      </div>

      <div
        role="toolbar"
        aria-label={`Formatting for ${label}`}
        className="mt-1 flex flex-wrap items-center gap-0.5 rounded-t-lg border border-[var(--border)] bg-[var(--surface-2)] p-1"
      >
        <button
          type="button"
          className={`${toolBtn} font-bold`}
          title="Bold"
          disabled={preview}
          onClick={() => wrap('**', '**', 'bold text')}
        >
          B
        </button>
        <button
          type="button"
          className={`${toolBtn} italic`}
          title="Italic"
          disabled={preview}
          onClick={() => wrap('*', '*', 'italic text')}
        >
          I
        </button>
        {inline ? null : (
          <>
            <span className="mx-1 h-5 w-px bg-[var(--border)]" aria-hidden />
            <button
              type="button"
              className={toolBtn}
              title="Heading"
              disabled={preview}
              onClick={() => prefixLines('## ')}
            >
              H2
            </button>
            <button
              type="button"
              className={toolBtn}
              title="Subheading"
              disabled={preview}
              onClick={() => prefixLines('### ')}
            >
              H3
            </button>
            <button
              type="button"
              className={toolBtn}
              title="Bulleted list"
              disabled={preview}
              onClick={() => prefixLines('- ')}
            >
              • List
            </button>
            <button
              type="button"
              className={toolBtn}
              title="Numbered list"
              disabled={preview}
              onClick={() => prefixLines('', true)}
            >
              1. List
            </button>
          </>
        )}
        <span className="mx-1 h-5 w-px bg-[var(--border)]" aria-hidden />
        <button
          type="button"
          className={toolBtn}
          title="Link the selected text"
          aria-pressed={panel === 'link'}
          disabled={preview}
          onClick={() => open('link')}
        >
          🔗 Link
        </button>
        <button
          type="button"
          className={toolBtn}
          title="Link a keyword wherever it appears"
          aria-pressed={panel === 'keyword'}
          disabled={preview}
          onClick={() => open('keyword')}
        >
          Link keyword
        </button>
        <span className="flex-1" />
        <button
          type="button"
          className={toolBtn}
          aria-pressed={preview}
          onClick={() => {
            setPanel(null);
            setPreview((p) => !p);
          }}
        >
          {preview ? 'Edit' : 'Preview'}
        </button>
      </div>

      {panel === 'link' ? (
        <LinkPanel
          key={`${sel[0]}-${sel[1]}`}
          initialText={selected}
          onCancel={() => setPanel(null)}
          onInsert={(text, href) => {
            const md = markdownLink(text, href);
            replace(sel[0], sel[1], md, sel[0] + md.length, sel[0] + md.length);
            setPanel(null);
          }}
        />
      ) : null}
      {panel === 'keyword' ? (
        <KeywordPanel
          initialKeyword={selected.includes('\n') ? '' : selected.trim()}
          onCancel={() => setPanel(null)}
          onApply={(keyword, href, all) => {
            const ta = ref.current;
            if (!ta) return 0;
            const out = linkKeyword(ta.value, keyword, href, all);
            if (out.count) replace(0, ta.value.length, out.text, 0, 0);
            return out.count;
          }}
        />
      ) : null}

      <textarea
        ref={ref}
        id={id}
        name={name}
        rows={rows}
        required={required}
        maxLength={maxLength}
        defaultValue={defaultValue ?? ''}
        onChange={(e) => setValue(e.target.value)}
        className={`${areaCls} ${preview ? 'hidden' : ''}`}
      />
      {preview ? (
        <div className="min-h-24 rounded-b-lg border border-t-0 border-[var(--border)] bg-[var(--surface)] px-4 py-2">
          {value.trim() ? (
            inline ? (
              <p className="mt-2 text-[var(--text-muted)]">
                <InlineMarkdown text={value} />
              </p>
            ) : (
              <Markdown source={value} />
            )
          ) : (
            <p className="mt-2 text-[var(--text-muted)]">Nothing to preview yet.</p>
          )}
        </div>
      ) : null}

      {hint ? <p className="mt-1 text-xs text-[var(--text-muted)]">{hint}</p> : null}
      {links.length ? <LinkList links={links} /> : null}
    </div>
  );
}

/** Search box over the site's pages; picking a result calls onPick with its path. */
function PageSearch({ onPick }: { onPick: (t: LinkTarget) => void }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<LinkTarget[]>([]);
  const [pending, start] = useTransition();

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) return;
    const t = setTimeout(() => {
      start(async () => setResults(await searchLinkTargets(term)));
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  const shown = q.trim().length < 2 ? [] : results;
  return (
    <div>
      <label className="block text-xs font-medium">
        Search this site&rsquo;s pages
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Business, category, city, blog post, service…"
          className={inputCls}
        />
      </label>
      {q.trim().length >= 2 ? (
        <ul className="mt-1 max-h-56 overflow-y-auto rounded-md border border-[var(--border)] bg-[var(--surface)]">
          {pending && !shown.length ? (
            <li className="px-3 py-2 text-xs text-[var(--text-muted)]">Searching…</li>
          ) : null}
          {!pending && !shown.length ? (
            <li className="px-3 py-2 text-xs text-[var(--text-muted)]">No pages match.</li>
          ) : null}
          {shown.map((r) => (
            <li key={r.href}>
              <button
                type="button"
                onClick={() => onPick(r)}
                className="flex w-full items-baseline gap-2 px-3 py-1.5 text-left hover:bg-[var(--surface-2)]"
              >
                <span className="shrink-0 rounded bg-[var(--surface-2)] px-1.5 text-[10px] font-semibold text-[var(--text-muted)] uppercase">
                  {r.kind}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm">{r.title}</span>
                <span className="shrink-0 truncate text-xs text-[var(--text-muted)]">{r.href}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function hrefError(href: string): string | null {
  const h = href.trim();
  if (!h) return 'Pick a page or type an address.';
  if (!safeHref(h)) return 'Use a path on this site (/category/…) or a full https:// address.';
  return null;
}

function LinkPanel({
  initialText,
  onInsert,
  onCancel,
}: {
  initialText: string;
  onInsert: (text: string, href: string) => void;
  onCancel: () => void;
}) {
  const [text, setText] = useState(initialText);
  const [href, setHref] = useState('');
  const [touched, setTouched] = useState(false);
  const err = hrefError(href);

  return (
    <div className="space-y-3 border-x border-[var(--border)] bg-[var(--surface-2)]/50 p-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-xs font-medium">
          Anchor text
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="The words people click"
            className={inputCls}
          />
        </label>
        <label className="block text-xs font-medium">
          Link to
          <input
            value={href}
            onChange={(e) => setHref(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder="/category/plumbers or https://…"
            className={inputCls}
          />
        </label>
      </div>
      <PageSearch
        onPick={(t) => {
          setHref(t.href);
          if (!text.trim()) setText(t.title);
        }}
      />
      {touched && err ? <p className="text-error text-xs">{err}</p> : null}
      <div className="flex gap-2">
        <button
          type="button"
          className={`${smallBtn} bg-brand-700 hover:bg-brand-800 border-transparent text-white`}
          disabled={!text.trim() || Boolean(err)}
          onClick={() => onInsert(text, href.trim())}
        >
          Insert link
        </button>
        <button type="button" className={smallBtn} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}

function KeywordPanel({
  initialKeyword,
  onApply,
  onCancel,
}: {
  initialKeyword: string;
  onApply: (keyword: string, href: string, all: boolean) => number;
  onCancel: () => void;
}) {
  const [keyword, setKeyword] = useState(initialKeyword);
  const [href, setHref] = useState('');
  const [all, setAll] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const err = hrefError(href);

  return (
    <div className="space-y-3 border-x border-[var(--border)] bg-[var(--surface-2)]/50 p-3">
      <p className="text-xs text-[var(--text-muted)]">
        Turns the keyword into a link wherever it appears in the text. Existing links and headings
        are left alone.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-xs font-medium">
          Keyword
          <input
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setResult(null);
            }}
            placeholder="e.g. emergency plumber"
            className={inputCls}
          />
        </label>
        <label className="block text-xs font-medium">
          Link to
          <input
            value={href}
            onChange={(e) => {
              setHref(e.target.value);
              setResult(null);
            }}
            placeholder="/category/plumbers or https://…"
            className={inputCls}
          />
        </label>
      </div>
      <PageSearch onPick={(t) => setHref(t.href)} />
      <label className="flex items-center gap-2 text-xs">
        <input type="checkbox" checked={all} onChange={(e) => setAll(e.target.checked)} />
        Link every mention (by default only the first one is linked)
      </label>
      {result ? (
        <p role="status" className="text-xs font-medium">
          {result}
        </p>
      ) : null}
      <div className="flex gap-2">
        <button
          type="button"
          className={`${smallBtn} bg-brand-700 hover:bg-brand-800 border-transparent text-white`}
          disabled={!keyword.trim() || Boolean(err)}
          onClick={() => {
            const n = onApply(keyword, href.trim(), all);
            setResult(
              n
                ? `Linked ${n} mention${n === 1 ? '' : 's'} of “${keyword.trim()}”.`
                : `No unlinked mention of “${keyword.trim()}” found.`,
            );
          }}
        >
          Apply
        </button>
        <button type="button" className={smallBtn} onClick={onCancel}>
          Close
        </button>
      </div>
    </div>
  );
}

function LinkList({ links }: { links: ReturnType<typeof findLinks> }) {
  return (
    <details className="mt-1 text-xs">
      <summary className="cursor-pointer text-[var(--text-muted)]">Links in this text</summary>
      <ul className="mt-1 space-y-0.5">
        {links.map((l, i) => (
          <li key={i} className="flex gap-2">
            <span className="w-14 shrink-0 text-[var(--text-muted)]">
              {l.internal ? 'Internal' : 'External'}
            </span>
            <span className="truncate">
              “{l.text}” → <code>{l.href}</code>
              {safeHref(l.href) ? null : <span className="text-error"> (will not render)</span>}
            </span>
          </li>
        ))}
      </ul>
    </details>
  );
}
