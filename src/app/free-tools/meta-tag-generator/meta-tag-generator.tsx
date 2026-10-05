'use client';

import { useId, useState, useSyncExternalStore } from 'react';
import { Icon } from '@/components/icon';
import { CopyButton, ToolCard, inputClass, labelClass } from '@/components/tools/tool-ui';
import { breadcrumbUrl, buildSnippet, clean, parseUrl, type MetaInput } from '@/lib/meta-tags';

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

export function MetaTagGenerator() {
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
    title || 'Your page title appears here',
    TITLE_FONT,
    TITLE_PX,
    TITLE_CHARS,
    isClient,
  );
  const shownDesc = truncate(
    description ||
      'Your meta description appears here. Write one or two sentences that tell searchers what the page offers and why they should click.',
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
    empty: 'Aim for 30–60 characters and under 600 pixels.',
    good: 'Good length: it should show in full.',
    warn:
      title.length < 30
        ? 'A little short: add a benefit, location or brand.'
        : 'Slightly long: the end may be cut off.',
    bad: 'Too long: Google will cut it off. Put the important words first.',
  }[titleLevel];
  const descNote = {
    empty: 'Aim for 70–160 characters.',
    good: 'Good length.',
    warn:
      description.length < 70
        ? 'Short: there is room to say more about the page.'
        : 'Long: Google will likely truncate it, so lead with the key message.',
    bad: '',
  }[descLevel];

  const image = clean(m.image);
  const showImage = image && /^https?:\/\//i.test(image) && imgFailed !== image;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <ToolCard>
        <form className="grid gap-5" onSubmit={(e) => e.preventDefault()}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-title-md text-title-md text-on-surface">Page details</h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setM(EXAMPLE)}
                className="font-label-md text-label-md text-primary-container hover:bg-brand-50 rounded-lg px-3 py-2"
              >
                Example
              </button>
              <button
                type="button"
                onClick={() => setM(EMPTY)}
                className="font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-low rounded-lg px-3 py-2"
              >
                Clear
              </button>
            </div>
          </div>

          <div>
            <label htmlFor={`${id}-title`} className={labelClass}>
              Page title
            </label>
            <input
              id={`${id}-title`}
              value={m.title}
              onChange={set('title')}
              placeholder="Primary keyword – benefit | Brand"
              aria-describedby={`${id}-title-meter`}
              className={inputClass}
            />
            <div
              id={`${id}-title-meter`}
              className="mt-2 flex flex-wrap items-center gap-2"
              aria-live="polite"
            >
              <Meter label="Characters" value={`${title.length} / 60`} level={titleLevel} />
              <Meter
                label="Pixels"
                value={titlePx === null ? '–' : `${Math.round(titlePx)} / ${TITLE_PX}`}
                level={titleLevel}
              />
              <span className="font-body-sm text-body-sm text-on-surface-variant">{titleNote}</span>
            </div>
          </div>

          <div>
            <label htmlFor={`${id}-desc`} className={labelClass}>
              Meta description
            </label>
            <textarea
              id={`${id}-desc`}
              value={m.description}
              onChange={set('description')}
              rows={3}
              placeholder="One or two sentences that sell the click."
              aria-describedby={`${id}-desc-meter`}
              className={`${inputClass} resize-y`}
            />
            <div
              id={`${id}-desc-meter`}
              className="mt-2 flex flex-wrap items-center gap-2"
              aria-live="polite"
            >
              <Meter label="Characters" value={`${description.length} / 160`} level={descLevel} />
              <Meter
                label="Pixels"
                value={descPx === null ? '–' : `${Math.round(descPx)} / ${DESC_PX[device]}`}
                level={descLevel}
              />
              <span className="font-body-sm text-body-sm text-on-surface-variant">{descNote}</span>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor={`${id}-url`} className={labelClass}>
                Page URL
              </label>
              <input
                id={`${id}-url`}
                type="url"
                inputMode="url"
                value={m.url}
                onChange={set('url')}
                placeholder="https://www.example.com/services/"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor={`${id}-site`} className={labelClass}>
                Site name
              </label>
              <input
                id={`${id}-site`}
                value={m.siteName}
                onChange={set('siteName')}
                placeholder="Your brand"
                className={inputClass}
              />
            </div>
          </div>

          <details className="group border-border-subtle rounded-lg border">
            <summary className="font-label-md text-label-md text-on-surface flex cursor-pointer list-none items-center justify-between gap-2 p-4">
              Advanced: robots, canonical, social image, language
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
                    Indexing
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
                    Links
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
                  noindex keeps this page out of Google’s results entirely. Use it only for pages
                  such as thank-you pages, internal search results or duplicates.
                </p>
              ) : null}
              <div>
                <label htmlFor={`${id}-canonical`} className={labelClass}>
                  Canonical URL
                </label>
                <input
                  id={`${id}-canonical`}
                  type="url"
                  inputMode="url"
                  value={m.canonical}
                  onChange={set('canonical')}
                  placeholder="Usually the same as the page URL"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor={`${id}-image`} className={labelClass}>
                  Social share image URL
                </label>
                <input
                  id={`${id}-image`}
                  type="url"
                  inputMode="url"
                  value={m.image}
                  onChange={set('image')}
                  placeholder="https://www.example.com/og-image.jpg (1200×630)"
                  className={inputClass}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label htmlFor={`${id}-ogtype`} className={labelClass}>
                    og:type
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
                    Twitter card
                  </label>
                  <select
                    id={`${id}-card`}
                    value={m.twitterCard}
                    onChange={set('twitterCard')}
                    className={inputClass}
                  >
                    <option value="summary_large_image">Large image</option>
                    <option value="summary">Summary</option>
                  </select>
                </div>
                <div>
                  <label htmlFor={`${id}-lang`} className={labelClass}>
                    Language
                  </label>
                  <input
                    id={`${id}-lang`}
                    value={m.language}
                    onChange={set('language')}
                    placeholder="en, en-PK, ur"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          </details>
        </form>
      </ToolCard>

      <div className="grid content-start gap-6">
        <ToolCard>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-title-md text-title-md text-on-surface">Google preview</h2>
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
            Widths are measured in pixels with the fonts Google uses, so wide letters (W, M) cut off
            sooner than narrow ones (i, l). Google may still rewrite titles and snippets.
            {shownTitle.cut && title ? ' Your title is truncated.' : ''}
            {shownDesc.cut && description ? ' Your description is truncated.' : ''}
          </p>
        </ToolCard>

        <ToolCard>
          <h2 className="font-title-md text-title-md text-on-surface">Social share preview</h2>
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
                    {image ? 'Image could not be loaded' : 'Add a 1200×630 image URL'}
                  </span>
                )}
              </div>
            ) : null}
            <div className="border-border-subtle border-t p-3">
              <p className="font-label-sm text-label-sm text-on-surface-variant truncate uppercase">
                {host}
              </p>
              <p className="font-title-md text-title-md text-on-surface mt-0.5 line-clamp-2 break-words">
                {title || 'Your page title'}
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 line-clamp-2 break-words">
                {description || 'Your description'}
              </p>
            </div>
          </div>
        </ToolCard>

        <ToolCard>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-title-md text-title-md text-on-surface">Your meta tags</h2>
            <CopyButton text={snippet} label="Copy HTML" />
          </div>
          <pre className="bg-surface-container-low text-on-surface mt-4 max-h-96 overflow-auto rounded-lg p-4 font-mono text-[13px] leading-relaxed">
            <code>{snippet}</code>
          </pre>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-3">
            Paste inside the <code>&lt;head&gt;</code> of your page. Empty fields are left out and
            special characters are escaped for you.
          </p>
        </ToolCard>
      </div>
    </div>
  );
}
