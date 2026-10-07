'use client';

import { useState } from 'react';
import { Icon } from '@/components/icon';
import { CopyButton, ToolCard, inputClass, labelClass } from '@/components/tools/tool-ui';
import { DEFAULT_SLUG_OPTIONS, slugify, type SlugOptions } from './slugify';

const RECOMMENDED_MAX = 60;

function Toggle({
  id,
  label,
  hint,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-3">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-primary-container mt-1 h-4 w-4 shrink-0"
      />
      <span>
        <span className="font-label-md text-label-md text-on-surface block">{label}</span>
        {hint ? (
          <span className="font-body-sm text-body-sm text-on-surface-variant block">{hint}</span>
        ) : null}
      </span>
    </label>
  );
}

export function SlugGenerator() {
  const [text, setText] = useState('C++ & C# in 2026: A Beginner’s Guide!');
  const [bulk, setBulk] = useState(false);
  const [opts, setOpts] = useState<SlugOptions>(DEFAULT_SLUG_OPTIONS);
  const [limitOn, setLimitOn] = useState(false);
  const [limit, setLimit] = useState(String(RECOMMENDED_MAX));
  const [baseUrl, setBaseUrl] = useState('https://example.com/blog/');

  const set = <K extends keyof SlugOptions>(key: K, value: SlugOptions[K]) =>
    setOpts((o) => ({ ...o, [key]: value }));
  const effective: SlugOptions = {
    ...opts,
    maxLength: limitOn ? Math.max(0, Math.floor(Number(limit) || 0)) : 0,
  };

  const lines = bulk ? text.split(/\r?\n/).filter((l) => l.trim()) : [text.replace(/\r?\n/g, ' ')];
  const results = lines.map((line) => ({ source: line, slug: slugify(line, effective) }));
  const allSlugs = results
    .map((r) => r.slug)
    .filter(Boolean)
    .join('\n');
  const base = baseUrl.trim()
    ? baseUrl.trim().endsWith('/')
      ? baseUrl.trim()
      : `${baseUrl.trim()}/`
    : '';

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <ToolCard className="space-y-5">
        <div>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="slug-text" className="font-label-md text-label-md text-on-surface">
              Text to slugify
            </label>
            <Toggle
              id="slug-bulk"
              label="Bulk mode (one slug per line)"
              checked={bulk}
              onChange={setBulk}
            />
          </div>
          <textarea
            id="slug-text"
            rows={bulk ? 8 : 3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={bulk ? 'One title per line' : 'Paste a headline or page title'}
            className={inputClass}
          />
        </div>

        <fieldset>
          <legend className={labelClass}>Separator</legend>
          <div className="flex flex-wrap gap-4">
            {(
              [
                ['-', 'Hyphen (-) — recommended'],
                ['_', 'Underscore (_)'],
              ] as const
            ).map(([value, label]) => (
              <label
                key={value}
                className="font-body-md text-body-md text-on-surface flex cursor-pointer items-center gap-2"
              >
                <input
                  type="radio"
                  name="slug-sep"
                  value={value}
                  checked={opts.separator === value}
                  onChange={() => set('separator', value)}
                  className="accent-primary-container h-4 w-4"
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <Toggle
            id="slug-lower"
            label="Lowercase"
            checked={opts.lowercase}
            onChange={(v) => set('lowercase', v)}
          />
          <Toggle
            id="slug-stop"
            label="Remove stop words"
            hint="a, the, and, of, in…"
            checked={opts.removeStopWords}
            onChange={(v) => set('removeStopWords', v)}
          />
          <Toggle
            id="slug-translit"
            label="Transliterate accents"
            hint="é → e, ß → ss, ł → l"
            checked={opts.transliterate}
            onChange={(v) => set('transliterate', v)}
          />
          <Toggle
            id="slug-nonlatin"
            label="Keep non-Latin scripts"
            hint="Urdu, Arabic, Hindi, Cyrillic…"
            checked={opts.keepNonLatin}
            onChange={(v) => set('keepNonLatin', v)}
          />
        </div>

        <div>
          <Toggle
            id="slug-limit"
            label="Limit length"
            hint={`Cuts at a word boundary. Around ${RECOMMENDED_MAX} characters or fewer is a good target.`}
            checked={limitOn}
            onChange={setLimitOn}
          />
          {limitOn ? (
            <div className="mt-3 pl-7">
              <label htmlFor="slug-max" className="sr-only">
                Maximum characters
              </label>
              <input
                id="slug-max"
                type="number"
                min={1}
                max={200}
                inputMode="numeric"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                className={`${inputClass} max-w-32`}
              />
            </div>
          ) : null}
        </div>

        <div>
          <label htmlFor="slug-base" className={labelClass}>
            Preview base URL
          </label>
          <input
            id="slug-base"
            type="url"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://example.com/blog/"
            className={inputClass}
            spellCheck={false}
          />
        </div>
      </ToolCard>

      <ToolCard className="lg:sticky lg:top-24 lg:self-start">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-title-md text-title-md text-on-surface">
            {bulk ? `Slugs (${results.length})` : 'Your slug'}
          </h2>
          {bulk && results.length > 1 ? <CopyButton text={allSlugs} label="Copy all" /> : null}
        </div>
        <ul aria-live="polite" className="mt-4 space-y-3">
          {results.length === 0 || (results.length === 1 && !results[0].slug) ? (
            <li className="font-body-md text-body-md text-on-surface-variant">
              {text.trim()
                ? 'Nothing left to use as a slug. Try turning on “Keep non-Latin scripts”.'
                : 'Type some text to generate a slug.'}
            </li>
          ) : (
            results.map((r, i) => {
              const long = r.slug.length > RECOMMENDED_MAX;
              return (
                <li
                  key={i}
                  className="border-border-subtle bg-surface-container-low rounded-lg border p-3"
                >
                  {bulk ? (
                    <p className="font-body-sm text-body-sm text-on-surface-variant mb-1 break-words">
                      {r.source}
                    </p>
                  ) : null}
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <code className="text-on-surface min-w-0 flex-1 font-mono text-base break-all">
                      {r.slug || <span className="text-on-surface-variant">(empty)</span>}
                    </code>
                    <CopyButton text={r.slug} />
                  </div>
                  <p
                    className={`font-label-sm text-label-sm mt-2 ${long ? 'text-amber-700' : 'text-on-surface-variant'}`}
                  >
                    {r.slug.length} characters
                    {long ? ` · over ${RECOMMENDED_MAX}, consider shortening` : ''}
                  </p>
                  {r.slug && base ? (
                    <p className="font-body-sm text-body-sm text-secondary mt-1 flex gap-1.5 break-all">
                      <Icon name="link" size={16} className="mt-0.5 shrink-0" />
                      <span>
                        {base}
                        <strong className="text-on-surface">{r.slug}</strong>
                      </span>
                    </p>
                  ) : null}
                </li>
              );
            })
          )}
        </ul>
      </ToolCard>
    </div>
  );
}
