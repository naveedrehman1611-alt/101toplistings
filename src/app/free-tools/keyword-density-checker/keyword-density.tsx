'use client';

import { useEffect, useId, useMemo, useState } from 'react';
import { Icon } from '@/components/icon';
import { ToolCard, inputClass, labelClass, secondaryButtonClass } from '@/components/tools/tool-ui';
import { analyse, type Phrase } from '@/lib/keyword-density';
import type { ToolLabels } from '@/components/tools/tool-page';
import { RichInline, fill } from '@/components/tools/rich-text';

type Labels = ToolLabels<'tool_keyword_density'>;

const LOOKS_LIKE_HTML =
  /<(!doctype|html|head|body|p|div|span|a|h[1-6]|ul|ol|li|article|section|main|title|meta|br|img|table)\b/i;

const BLOCKS =
  'p,div,li,h1,h2,h3,h4,h5,h6,br,tr,td,th,section,article,header,footer,nav,aside,main,blockquote,pre,dd,dt,figcaption,option,title';

type Source = { text: string; title: string; description: string; isHtml: boolean };

/** Turns pasted HTML into readable text (browser only); plain text passes through. */
function extract(raw: string): Source {
  if (!LOOKS_LIKE_HTML.test(raw) || typeof DOMParser === 'undefined') {
    return { text: raw, title: '', description: '', isHtml: false };
  }
  const doc = new DOMParser().parseFromString(raw, 'text/html');
  const title = doc.title.trim();
  const description =
    doc
      .querySelector('meta[name="description" i]')
      ?.getAttribute('content')
      ?.replace(/\s+/g, ' ')
      .trim() ?? '';
  doc.querySelectorAll('script,style,noscript,template,svg,iframe').forEach((el) => el.remove());
  // Block elements end a sentence, so their words never run together into phrases.
  doc.body.querySelectorAll(BLOCKS).forEach((el) => el.append('\n'));
  return { text: doc.body.textContent ?? '', title, description, isHtml: true };
}

const SAMPLE = `Looking for SEO services in Lahore? Our local SEO services help small businesses get found on Google Maps and in organic search.

We start every project with a technical SEO audit. The audit checks page speed, crawl errors and on-page SEO, then we build a plan around the keywords your customers actually search for.

Local SEO is about more than keywords. Reviews, a complete Google Business Profile and consistent business listings matter just as much as the words on your page.`;

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-surface-container-low rounded-lg p-3">
      <dt className="font-label-sm text-label-sm text-on-surface-variant">{label}</dt>
      <dd className="font-title-md text-title-md text-on-surface mt-1">{value}</dd>
    </div>
  );
}

function Check({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <Icon
        name={ok ? 'check_circle' : 'error'}
        size={18}
        className={`mt-0.5 shrink-0 ${ok ? 'text-primary-container' : 'text-amber-700'}`}
      />
      <span>{children}</span>
    </li>
  );
}

function PhraseTable({ rows, n, labels: l }: { rows: Phrase[]; n: 1 | 2 | 3; labels: Labels }) {
  if (!rows.length) {
    return (
      <p className="font-body-sm text-body-sm text-on-surface-variant py-6 text-center">
        {n === 1 ? l.no_keywords : fill(l.no_phrases, { n })}
      </p>
    );
  }
  const max = rows[0].count;
  return (
    <div className="overflow-x-auto">
      <table className="font-body-sm text-body-sm w-full min-w-[320px] text-left">
        <thead className="font-label-sm text-label-sm text-on-surface-variant">
          <tr className="border-border-subtle border-b">
            <th scope="col" className="py-2 pr-2 font-medium">
              #
            </th>
            <th scope="col" className="py-2 pr-2 font-medium">
              {n === 1 ? l.col_keyword : l.col_phrase}
            </th>
            <th scope="col" className="py-2 pr-2 text-right font-medium">
              {l.col_count}
            </th>
            <th scope="col" className="py-2 pr-2 text-right font-medium">
              {l.col_density}
            </th>
            <th scope="col" className="py-2 text-center font-medium">
              {l.col_in_title}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.phrase} className="border-border-subtle border-b last:border-0">
              <td className="text-secondary py-2 pr-2 tabular-nums">{i + 1}</td>
              <td className="text-on-surface py-2 pr-2">
                <span className="break-words">{r.phrase}</span>
                <span
                  aria-hidden
                  className="bg-primary-container/60 mt-1 block h-1 rounded-full"
                  style={{ width: `${Math.max(4, (r.count / max) * 100)}%` }}
                />
              </td>
              <td className="py-2 pr-2 text-right tabular-nums">{r.count}</td>
              <td
                className={`py-2 pr-2 text-right tabular-nums ${r.density > 3 ? 'font-semibold text-amber-700' : ''}`}
              >
                {r.density.toFixed(2)}%
              </td>
              <td className="py-2 text-center">
                {r.inTitle ? (
                  <>
                    <Icon name="check_circle" size={18} className="text-primary-container inline" />
                    <span className="sr-only">Yes</span>
                  </>
                ) : (
                  <>
                    <span aria-hidden className="text-secondary">
                      –
                    </span>
                    <span className="sr-only">No</span>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function KeywordDensityChecker({ labels: l }: { labels: Labels }) {
  const id = useId();
  const [content, setContent] = useState('');
  const [keyword, setKeyword] = useState('');
  const [title, setTitle] = useState('');
  const [tab, setTab] = useState<1 | 2 | 3>(1);
  // The analysis runs on a debounced copy so typing stays smooth on long pages.
  const [debounced, setDebounced] = useState({ content: '', keyword: '', title: '' });

  useEffect(() => {
    const t = setTimeout(() => setDebounced({ content, keyword, title }), 200);
    return () => clearTimeout(t);
  }, [content, keyword, title]);

  const source = useMemo(() => extract(debounced.content), [debounced.content]);
  const effectiveTitle = debounced.title.trim() || source.title;
  const report = useMemo(
    () => analyse(source.text, { title: effectiveTitle, keyword: debounced.keyword }),
    [source.text, effectiveTitle, debounced.keyword],
  );
  const kw = report.keyword;
  const empty = report.totalWords === 0;

  return (
    <div className="grid gap-6">
      <ToolCard>
        <div className="grid gap-5">
          <div>
            <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
              <label htmlFor={`${id}-content`} className={`${labelClass} mb-0`}>
                {l.content_label}
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  className={`${secondaryButtonClass} h-9 px-3`}
                  onClick={() => {
                    setContent(SAMPLE);
                    if (!keyword) setKeyword('local SEO');
                    if (!title) setTitle('Local SEO Services in Lahore for Small Businesses');
                  }}
                >
                  {l.sample}
                </button>
                <button
                  type="button"
                  className={`${secondaryButtonClass} h-9 px-3`}
                  disabled={!content && !keyword && !title}
                  onClick={() => {
                    setContent('');
                    setKeyword('');
                    setTitle('');
                  }}
                >
                  {l.clear}
                </button>
              </div>
            </div>
            <textarea
              id={`${id}-content`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={12}
              spellCheck={false}
              placeholder={l.content_placeholder}
              aria-describedby={`${id}-content-hint`}
              className={`${inputClass} min-h-60 resize-y`}
            />
            <p
              id={`${id}-content-hint`}
              className="font-body-sm text-body-sm text-on-surface-variant mt-2"
            >
              {l.content_hint}
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label htmlFor={`${id}-kw`} className={labelClass}>
                {l.keyword_label} <span className="text-secondary font-normal">{l.optional}</span>
              </label>
              <input
                id={`${id}-kw`}
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder={l.keyword_placeholder}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor={`${id}-title`} className={labelClass}>
                {l.title_label} <span className="text-secondary font-normal">{l.optional}</span>
              </label>
              <input
                id={`${id}-title`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={source.title || l.title_placeholder}
                className={inputClass}
              />
            </div>
          </div>
        </div>
      </ToolCard>

      <div aria-live="polite" className="grid gap-6">
        {source.isHtml && !empty ? (
          <ToolCard className="font-body-sm text-body-sm text-on-surface-variant">
            <p className="text-on-surface font-label-md text-label-md flex items-center gap-2">
              <Icon name="data_object" size={18} className="text-primary-container" />
              {l.html_detected}
            </p>
            <dl className="mt-3 grid gap-2">
              <div>
                <dt className="inline font-medium">{l.title_tag} </dt>
                <dd className="inline break-words">{source.title || l.none_found}</dd>
              </div>
              <div>
                <dt className="inline font-medium">{l.meta_description} </dt>
                <dd className="inline break-words">{source.description || l.none_found}</dd>
              </div>
            </dl>
          </ToolCard>
        ) : null}

        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <Stat label={l.stat_words} value={report.totalWords.toLocaleString()} />
          <Stat label={l.stat_unique} value={report.uniqueWords.toLocaleString()} />
          <Stat label={l.stat_characters} value={report.characters.toLocaleString()} />
          <Stat label={l.stat_sentences} value={report.sentences.toLocaleString()} />
          <Stat label={l.stat_reading} value={empty ? '0 min' : `~${report.readingMinutes} min`} />
        </dl>

        {kw && !empty ? (
          <ToolCard>
            <h2 className="font-title-md text-title-md text-on-surface">
              {l.keyword_heading} <span className="break-words">“{kw.phrase}”</span>
            </h2>
            <p className="font-body-md text-body-md text-on-surface mt-2">
              Used <strong>{kw.count}</strong> {kw.count === 1 ? 'time' : 'times'} in{' '}
              {report.totalWords.toLocaleString()} words — density{' '}
              <strong className={kw.density > 3 ? 'text-amber-700' : ''}>
                {kw.density.toFixed(2)}%
              </strong>
              .
            </p>
            <ul className="font-body-sm text-body-sm text-on-surface-variant mt-4 grid gap-2">
              <Check ok={kw.count > 0}>{kw.count > 0 ? l.found : l.not_found}</Check>
              <Check ok={kw.inTitle}>
                {effectiveTitle ? (kw.inTitle ? l.in_title : l.not_in_title) : l.no_title}
              </Check>
              <Check ok={kw.inFirst100}>{kw.inFirst100 ? l.in_opening : l.not_in_opening}</Check>
              {kw.density > 3 ? <Check ok={false}>{l.stuffing}</Check> : null}
            </ul>
            <p className="font-body-sm text-body-sm text-on-surface-variant bg-surface-container-low mt-4 rounded-lg p-3">
              {l.keyword_note}
            </p>
          </ToolCard>
        ) : null}

        <ToolCard>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-title-md text-title-md text-on-surface">{l.phrases_heading}</h2>
            <div role="tablist" aria-label="Phrase length" className="flex gap-1">
              {([1, 2, 3] as const).map((n) => (
                <button
                  key={n}
                  type="button"
                  role="tab"
                  id={`${id}-tab-${n}`}
                  aria-selected={tab === n}
                  aria-controls={`${id}-panel`}
                  tabIndex={tab === n ? 0 : -1}
                  onClick={() => setTab(n)}
                  onKeyDown={(e) => {
                    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
                    const next = (((tab - 1 + (e.key === 'ArrowRight' ? 1 : 2)) % 3) + 1) as
                      1 | 2 | 3;
                    setTab(next);
                    document.getElementById(`${id}-tab-${next}`)?.focus();
                  }}
                  className={`font-label-md text-label-md focus-visible:outline-primary-container rounded-lg px-3 py-2 focus-visible:outline-2 ${
                    tab === n
                      ? 'bg-primary-container text-on-primary'
                      : 'bg-surface-container-low text-on-surface hover:bg-brand-50'
                  }`}
                >
                  {n} word{n > 1 ? 's' : ''} ({report.ngrams[n].length})
                </button>
              ))}
            </div>
          </div>
          <div
            role="tabpanel"
            id={`${id}-panel`}
            aria-labelledby={`${id}-tab-${tab}`}
            className="mt-4"
          >
            <PhraseTable rows={report.ngrams[tab]} n={tab} labels={l} />
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-4">
            <RichInline text={l.phrases_note} classes={{ strong: 'text-on-surface' }} />
          </p>
        </ToolCard>
      </div>
    </div>
  );
}
