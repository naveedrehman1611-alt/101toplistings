'use client';

import { useId, useState, useSyncExternalStore } from 'react';
import { Icon } from '@/components/icon';
import { CopyButton, ToolCard, inputClass, labelClass } from '@/components/tools/tool-ui';
import { breadcrumbUrl, buildSnippet, clean, parseUrl, type MetaInput } from '@/lib/meta-tags';
import type { ToolLabels } from '@/components/tools/tool-page';
import { RichInline } from '@/components/tools/rich-text';

/** Google's result typography (approximate): titles 20px, snippets 14px, Arial. */
const TITLE_FONT = '20px Arial, sans-serif';
const DESC_FONT = '14px Arial, sans-serif';
const TITLE_PX = 600;
const DESC_PX = { desktop: 920, mobile: 680 } as const;
/** Character fallbacks used before the browser can measure (SSR and first render). */
const TITLE_CHARS = 60;
const DESC_CHARS = { desktop: 158, mobile: 120 } as const;

let ctx: CanvasRenderingContext2D | null | undefined;
function measure(text: string, font: string): number | null {
  if (typeof document === 'undefined') return null;
  if (ctx === undefined) ctx = document.createElement('canvas').getContext('2d');
  if (!ctx) return null;
  ctx.font = font;
  return ctx.measureText(text).width;
}

/** Cuts text at a word boundary so text + " ..." fits in `maxPx` (or `maxChars` without a canvas). */
function truncate(
  text: string,
  font: string,
  maxPx: number,
  maxChars: number,
  canMeasure: boolean,
): { text: string; cut: boolean } {
  const fits = (s: string) => {
    const w = canMeasure ? measure(s, font) : null;
    return w === null ? s.length <= maxChars : w <= maxPx;
  };
  if (fits(text)) return { text, cut: false };
  let lo = 0;
  let hi = text.length;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (fits(`${text.slice(0, mid)} ...`)) lo = mid;
    else hi = mid - 1;
  }
  let cutAt = text.lastIndexOf(' ', lo);
  if (cutAt < lo * 0.6) cutAt = lo;
  return { text: `${text.slice(0, cutAt).replace(/[\s,;:.\-–—|]+$/, '')} ...`, cut: true };
}

const noop = () => () => {};
const useIsClient = () =>
  useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );

type Level = 'good' | 'warn' | 'bad' | 'empty';
const levelClass: Record<Level, string> = {
  good: 'bg-brand-50 text-primary-container',
  warn: 'bg-amber-50 text-amber-800',
  bad: 'bg-error-container text-error',
  empty: 'bg-surface-container-low text-on-surface-variant',
};

function Meter({
  label,
  value,
  level,
  id,
}: {
  label: string;
  value: string;
  level: Level;
  id?: string;
}) {
  return (
    <span
      id={id}
      className={`font-label-sm text-label-sm inline-flex items-center gap-1 rounded-full px-2.5 py-1 tabular-nums ${levelClass[level]}`}
    >
      {label}: {value}
    </span>
  );
}

const EXAMPLE: MetaInput = {
  title: 'Local SEO Services in Lahore | Rank Higher on Google Maps',
  description:
    'Get found by nearby customers. Our local SEO team optimises your Google Business Profile, reviews and website so you rank in Lahore’s map pack. Free audit.',
  url: 'https://www.example.com/services/local-seo-lahore',
  siteName: 'Example Agency',
  index: 'index',
  follow: 'follow',
  canonical: '',
  image: '',
  twitterCard: 'summary_large_image',
  ogType: 'website',
  language: 'en',
};

const EMPTY: MetaInput = {
  title: '',
  description: '',
  url: '',
  siteName: '',
  index: 'index',
  follow: 'follow',
  canonical: '',
  image: '',
  twitterCard: 'summary_large_image',
  ogType: 'website',
  language: 'en',
};

export function MetaTagGenerator({ labels: l }: { labels: ToolLabels<'tool_meta_tags'> }) {
  const id = useId();
  const isClient = useIsClient();
  const [m, setM] = useState<MetaInput>(EMPTY);
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [imgFailed, setImgFailed] = useState('');
  const set =
    <K extends keyof MetaInput>(key: K) =>
    (e: { target: { value: string } }) =>
      setM((prev) => ({ ...prev, [key]: e.target.value as MetaInput[K] }));

  const title = clean(m.title);
  const description = clean(m.description);
  const titlePx = isClient ? measure(title, TITLE_FONT) : null;
  const descPx = isClient ? measure(description, DESC_FONT) : null;

  // Cheap: a binary search of a few canvas measurements per render.
  const shownTitle = truncate(
    title || l.preview_title,
    TITLE_FONT,
    TITLE_PX,
    TITLE_CHARS,
    isClient,
  );
  const shownDesc = truncate(
    description || l.preview_desc,
    DESC_FONT,
    DESC_PX[device],
    DESC_CHARS[device],
    isClient,
  );

  const crumb = breadcrumbUrl(m.url || m.canonical);
  const host = parseUrl(m.url || m.canonical)?.hostname.replace(/^www\./, '') ?? 'example.com';
  const siteLabel = clean(m.siteName) || host;
  const snippet = buildSnippet(m);

  const titleLevel: Level = !title
    ? 'empty'
    : (titlePx ?? 0) > TITLE_PX || title.length > 70
      ? 'bad'
      : title.length < 30 || title.length > 60
        ? 'warn'
        : 'good';
  const descLevel: Level = !description
    ? 'empty'
    : description.length > 160 || (descPx ?? 0) > DESC_PX.desktop
      ? 'warn'
      : description.length < 70
        ? 'warn'
        : 'good';
  const titleNote = {
    empty: l.title_empty,
    good: l.title_good,
    warn: title.length < 30 ? l.title_short : l.title_long,
    bad: l.title_too_long,
  }[titleLevel];
  const descNote = {
    empty: l.desc_empty,
    good: l.desc_good,
    warn: description.length < 70 ? l.desc_short : l.desc_long,
    bad: '',
  }[descLevel];

  const image = clean(m.image);
  const showImage = image && /^https?:\/\//i.test(image) && imgFailed !== image;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <ToolCard>
        <form className="grid grid-cols-1 gap-5" onSubmit={(e) => e.preventDefault()}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-title-md text-title-md text-on-surface">{l.form_heading}</h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setM(EXAMPLE)}
                className="font-label-md text-label-md text-primary-container hover:bg-brand-50 rounded-lg px-3 py-2"
              >
                {l.example}
              </button>
              <button
                type="button"
                onClick={() => setM(EMPTY)}
                className="font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-low rounded-lg px-3 py-2"
              >
                {l.clear}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor={`${id}-title`} className={labelClass}>
              {l.title_label}
            </label>
            <input
              id={`${id}-title`}
              value={m.title}
              onChange={set('title')}
              placeholder={l.title_placeholder}
              aria-describedby={`${id}-title-meter`}
              className={inputClass}
            />
            <div
              id={`${id}-title-meter`}
              className="mt-2 flex flex-wrap items-center gap-2"
              aria-live="polite"
            >
              <Meter label={l.meter_characters} value={`${title.length} / 60`} level={titleLevel} />
              <Meter
                label={l.meter_pixels}
                value={titlePx === null ? '–' : `${Math.round(titlePx)} / ${TITLE_PX}`}
                level={titleLevel}
              />
              <span className="font-body-sm text-body-sm text-on-surface-variant">{titleNote}</span>
            </div>
          </div>

          <div>
            <label htmlFor={`${id}-desc`} className={labelClass}>
              {l.desc_label}
            </label>
            <textarea
              id={`${id}-desc`}
              value={m.description}
              onChange={set('description')}
              rows={3}
              placeholder={l.desc_placeholder}
              aria-describedby={`${id}-desc-meter`}
              className={`${inputClass} resize-y`}
            />
            <div
              id={`${id}-desc-meter`}
              className="mt-2 flex flex-wrap items-center gap-2"
              aria-live="polite"
            >
              <Meter
                label={l.meter_characters}
                value={`${description.length} / 160`}
                level={descLevel}
              />
              <Meter
                label={l.meter_pixels}
                value={descPx === null ? '–' : `${Math.round(descPx)} / ${DESC_PX[device]}`}
                level={descLevel}
              />
              <span className="font-body-sm text-body-sm text-on-surface-variant">{descNote}</span>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor={`${id}-url`} className={labelClass}>
                {l.url_label}
              </label>
              <input
                id={`${id}-url`}
                type="url"
                inputMode="url"
                value={m.url}
                onChange={set('url')}
                placeholder={l.url_placeholder}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor={`${id}-site`} className={labelClass}>
                {l.site_label}
              </label>
              <input
                id={`${id}-site`}
                value={m.siteName}
                onChange={set('siteName')}
                placeholder={l.site_placeholder}
                className={inputClass}
              />
            </div>
          </div>

          <details className="group border-border-subtle rounded-lg border">
            <summary className="font-label-md text-label-md text-on-surface flex cursor-pointer list-none items-center justify-between gap-2 p-4">
              {l.advanced}
              <Icon
                name="expand_more"
                size={20}
                className="text-secondary transition-transform group-open:rotate-180"
              />
            </summary>
            <div className="grid gap-5 px-4 pb-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor={`${id}-index`} className={labelClass}>
                    {l.index_label}
                  </label>
                  <select
                    id={`${id}-index`}
                    value={m.index}
                    onChange={set('index')}
                    className={inputClass}
                  >
                    <option value="index">index</option>
                    <option value="noindex">noindex</option>
                  </select>
                </div>
                <div>
                  <label htmlFor={`${id}-follow`} className={labelClass}>
                    {l.follow_label}
                  </label>
                  <select
                    id={`${id}-follow`}
                    value={m.follow}
                    onChange={set('follow')}
                    className={inputClass}
                  >
                    <option value="follow">follow</option>
                    <option value="nofollow">nofollow</option>
                  </select>
                </div>
              </div>
              {m.index === 'noindex' ? (
                <p className="font-body-sm text-body-sm rounded-lg bg-amber-50 p-3 text-amber-800">
                  {l.noindex_warning}
                </p>
              ) : null}
              <div>
                <label htmlFor={`${id}-canonical`} className={labelClass}>
                  {l.canonical_label}
                </label>
                <input
                  id={`${id}-canonical`}
                  type="url"
                  inputMode="url"
                  value={m.canonical}
                  onChange={set('canonical')}
                  placeholder={l.canonical_placeholder}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor={`${id}-image`} className={labelClass}>
                  {l.image_label}
                </label>
                <input
                  id={`${id}-image`}
                  type="url"
                  inputMode="url"
                  value={m.image}
                  onChange={set('image')}
                  placeholder={l.image_placeholder}
                  className={inputClass}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label htmlFor={`${id}-ogtype`} className={labelClass}>
                    {l.og_type_label}
                  </label>
                  <select
                    id={`${id}-ogtype`}
                    value={m.ogType}
                    onChange={set('ogType')}
                    className={inputClass}
                  >
                    <option value="website">website</option>
                    <option value="article">article</option>
                    <option value="profile">profile</option>
                  </select>
                </div>
                <div>
                  <label htmlFor={`${id}-card`} className={labelClass}>
                    {l.card_label}
                  </label>
                  <select
                    id={`${id}-card`}
                    value={m.twitterCard}
                    onChange={set('twitterCard')}
                    className={inputClass}
                  >
                    <option value="summary_large_image">{l.card_large}</option>
                    <option value="summary">{l.card_summary}</option>
                  </select>
                </div>
                <div>
                  <label htmlFor={`${id}-lang`} className={labelClass}>
                    {l.language_label}
                  </label>
                  <input
                    id={`${id}-lang`}
                    value={m.language}
                    onChange={set('language')}
                    placeholder={l.language_placeholder}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          </details>
        </form>
      </ToolCard>

      <div className="grid grid-cols-1 content-start gap-6">
        <ToolCard>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-title-md text-title-md text-on-surface">{l.preview_heading}</h2>
            <div role="group" aria-label="Preview device" className="flex gap-1">
              {(['desktop', 'mobile'] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  aria-pressed={device === d}
                  onClick={() => setDevice(d)}
                  className={`font-label-md text-label-md focus-visible:outline-primary-container rounded-lg px-3 py-2 capitalize focus-visible:outline-2 ${
                    device === d
                      ? 'bg-primary-container text-on-primary'
                      : 'bg-surface-container-low text-on-surface hover:bg-brand-50'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div
            className={`border-border-subtle mt-4 rounded-lg border bg-white p-4 ${device === 'mobile' ? 'mx-auto max-w-[400px] rounded-2xl' : ''}`}
            style={{ fontFamily: 'Arial, sans-serif' }}
            aria-label="Search result preview"
            role="group"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span
                aria-hidden
                className="grid size-7 shrink-0 place-items-center rounded-full border border-[#dadce0] bg-[#f1f3f4] text-xs font-bold text-[#5f6368] uppercase"
              >
                {siteLabel.charAt(0)}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[14px] leading-5 text-[#202124]">
                  {siteLabel}
                </span>
                <span className="block truncate text-[12px] leading-[18px] text-[#4d5156]">
                  {crumb.origin}
                  {crumb.path.map((p, i) => (
                    <span key={i}> › {p}</span>
                  ))}
                </span>
              </span>
            </div>
            <p
              className={`mt-2 break-words text-[#1a0dab] ${device === 'mobile' ? 'text-[18px] leading-6' : 'text-[20px] leading-[26px]'}`}
              style={device === 'desktop' ? { maxWidth: TITLE_PX + 40 } : undefined}
            >
              {shownTitle.text}
            </p>
            <p
              className="mt-1 text-[14px] leading-[22px] break-words text-[#4d5156]"
              style={device === 'desktop' ? { maxWidth: 600 } : undefined}
            >
              {shownDesc.text}
            </p>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-3">
            {l.preview_note}
            {shownTitle.cut && title ? ` ${l.title_truncated}` : ''}
            {shownDesc.cut && description ? ` ${l.desc_truncated}` : ''}
          </p>
        </ToolCard>

        <ToolCard>
          <h2 className="font-title-md text-title-md text-on-surface">{l.social_heading}</h2>
          <div className="border-border-subtle mt-4 overflow-hidden rounded-xl border bg-white">
            {m.twitterCard === 'summary_large_image' || showImage ? (
              <div className="bg-surface-container-low text-secondary grid aspect-[1.91/1] place-items-center">
                {showImage ? (
                  // eslint-disable-next-line @next/next/no-img-element -- user-supplied URL, previewed as-is
                  <img
                    src={image}
                    alt=""
                    className="size-full object-cover"
                    onError={() => setImgFailed(image)}
                  />
                ) : (
                  <span className="font-body-sm text-body-sm flex flex-col items-center gap-1 p-4 text-center">
                    <Icon name="visibility" size={24} />
                    {image ? l.image_failed : l.image_missing}
                  </span>
                )}
              </div>
            ) : null}
            <div className="border-border-subtle border-t p-3">
              <p className="font-label-sm text-label-sm text-on-surface-variant truncate uppercase">
                {host}
              </p>
              <p className="font-title-md text-title-md text-on-surface mt-0.5 line-clamp-2 break-words">
                {title || l.social_title}
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 line-clamp-2 break-words">
                {description || l.social_desc}
              </p>
            </div>
          </div>
        </ToolCard>

        <ToolCard>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-title-md text-title-md text-on-surface">{l.tags_heading}</h2>
            <CopyButton text={snippet} label={l.copy_html} copiedLabel={l.copied} />
          </div>
          <pre className="bg-surface-container-low text-on-surface mt-4 max-h-96 overflow-auto rounded-lg p-4 font-mono text-[13px] leading-relaxed">
            <code>{snippet}</code>
          </pre>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-3">
            <RichInline text={l.tags_note} />
          </p>
        </ToolCard>
      </div>
    </div>
  );
}
