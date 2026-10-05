/**
 * Browser-side client for Google's PageSpeed Insights API v5.
 *
 * The API supports CORS, so the free speed and mobile-friendly tools call it
 * straight from the visitor's browser: this site's server does no work and
 * adds no function invocations.
 *
 * API key: NEXT_PUBLIC_PAGESPEED_API_KEY is inlined into the client bundle at
 * build time, so it is public by design. In Google Cloud Console the key MUST
 * be restricted to (a) the PageSpeed Insights API only and (b) this site's HTTP
 * referrers (e.g. https://example.com/*), otherwise anyone could copy it and
 * burn the quota. Without a key the API still works on Google's shared,
 * heavily rate-limited anonymous quota.
 *
 * Only import this module from client components.
 */

export type Strategy = 'mobile' | 'desktop';
export type CategoryId = 'performance' | 'accessibility' | 'best-practices' | 'seo';

export const ALL_CATEGORIES: CategoryId[] = [
  'performance',
  'accessibility',
  'best-practices',
  'seo',
];

const ENDPOINT = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';
const API_KEY = process.env.NEXT_PUBLIC_PAGESPEED_API_KEY;
const TIMEOUT_MS = 90_000;
const CACHE_TTL_MS = 10 * 60 * 1000;
const CACHE_PREFIX = 'psi:v1:';

// ---------- Raw API shapes (only the parts we read) ----------

type RawAudit = {
  id: string;
  title?: string;
  description?: string;
  score?: number | null;
  scoreDisplayMode?: string;
  displayValue?: string;
  numericValue?: number;
  metricSavings?: Record<string, number>;
  details?: { type?: string; overallSavingsMs?: number; data?: string };
};

type RawCategory = {
  id: string;
  title?: string;
  score?: number | null;
  auditRefs?: { id: string; group?: string }[];
};

type RawFieldMetric = { percentile?: number; category?: string };

type RawLoadingExperience = {
  id?: string;
  overall_category?: string;
  origin_fallback?: boolean;
  metrics?: Record<string, RawFieldMetric>;
};

type RawResponse = {
  id?: string;
  loadingExperience?: RawLoadingExperience;
  originLoadingExperience?: RawLoadingExperience;
  lighthouseResult?: {
    requestedUrl?: string;
    finalDisplayedUrl?: string;
    finalUrl?: string;
    fetchTime?: string;
    lighthouseVersion?: string;
    runWarnings?: string[];
    runtimeError?: { code?: string; message?: string };
    categories?: Record<string, RawCategory>;
    audits?: Record<string, RawAudit>;
  };
  error?: { code?: number; message?: string };
};

// ---------- Normalised report (compact, safe to cache) ----------

export type Audit = {
  id: string;
  title: string;
  description: string;
  /** 0-1, or null when the audit is informative / not applicable. */
  score: number | null;
  mode: string;
  displayValue?: string;
  numericValue?: number;
  detailsType?: string;
  savingsMs?: number;
  /** Categories (ids) whose visible audit list includes this audit. */
  categories: CategoryId[];
};

export type CategoryScore = { id: CategoryId; title: string; score: number | null };

export type FieldMetric = {
  key: 'LCP' | 'INP' | 'CLS' | 'FCP' | 'TTFB';
  label: string;
  /** Human-readable percentile (e.g. "2.1 s", "0.05"). */
  value: string;
  category: 'FAST' | 'AVERAGE' | 'SLOW' | 'NONE';
};

export type FieldData = {
  /** True when only origin-wide data was available, not this exact URL. */
  isOrigin: boolean;
  overall?: string;
  metrics: FieldMetric[];
};

export type Report = {
  requestedUrl: string;
  finalUrl: string;
  strategy: Strategy;
  fetchTime: string;
  lighthouseVersion?: string;
  warnings: string[];
  categories: CategoryScore[];
  audits: Record<string, Audit>;
  field: FieldData | null;
  screenshot?: string;
};

export type PageSpeedErrorKind = 'quota' | 'url' | 'network' | 'timeout' | 'aborted' | 'unknown';

export class PageSpeedError extends Error {
  kind: PageSpeedErrorKind;
  constructor(message: string, kind: PageSpeedErrorKind) {
    super(message);
    this.name = 'PageSpeedError';
    this.kind = kind;
  }
}

// ---------- URL handling ----------

/** Adds https:// when missing and accepts only http(s) URLs with a dotted host. */
export function normaliseUrl(input: string): { url: string } | { error: string } {
  const trimmed = input.trim();
  if (!trimmed) return { error: 'Enter a website address, e.g. example.com' };
  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  let parsed: URL;
  try {
    parsed = new URL(withScheme);
  } catch {
    return { error: 'That does not look like a valid web address.' };
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { error: 'Only http:// and https:// addresses can be tested.' };
  }
  const host = parsed.hostname;
  if (
    !host.includes('.') ||
    host.endsWith('.') ||
    /^(localhost|127\.|10\.|192\.168\.)/.test(host)
  ) {
    return { error: 'Enter a public website address. Google cannot reach local or private hosts.' };
  }
  return { url: parsed.toString() };
}

export function pageSpeedReportUrl(url: string, strategy?: Strategy): string {
  const params = new URLSearchParams({ url });
  if (strategy) params.set('form_factor', strategy);
  return `https://pagespeed.web.dev/analysis?${params.toString()}`;
}

// ---------- Caching (sessionStorage, 10 minutes) ----------

function cacheKey(scope: string, url: string, strategy: Strategy) {
  return `${CACHE_PREFIX}${scope}:${strategy}:${url}`;
}

export function readCachedReport(scope: string, url: string, strategy: Strategy): Report | null {
  try {
    const raw = window.sessionStorage.getItem(cacheKey(scope, url, strategy));
    if (!raw) return null;
    const entry = JSON.parse(raw) as { t: number; report: Report };
    if (Date.now() - entry.t > CACHE_TTL_MS) {
      window.sessionStorage.removeItem(cacheKey(scope, url, strategy));
      return null;
    }
    return entry.report;
  } catch {
    return null;
  }
}

function writeCachedReport(scope: string, report: Report) {
  const value = JSON.stringify({ t: Date.now(), report });
  const key = cacheKey(scope, report.requestedUrl, report.strategy);
  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    // Storage full or blocked: drop older entries once, then give up quietly.
    try {
      for (let i = window.sessionStorage.length - 1; i >= 0; i--) {
        const k = window.sessionStorage.key(i);
        if (k?.startsWith(CACHE_PREFIX)) window.sessionStorage.removeItem(k);
      }
      window.sessionStorage.setItem(key, value);
    } catch {
      /* caching is best effort */
    }
  }
}

// ---------- Fetch ----------

/**
 * Runs a PageSpeed Insights analysis. `scope` separates cache entries of tools
 * that request different categories for the same URL. Pass an AbortSignal to
 * support a cancel button; a 90 s timeout is applied on top of it.
 */
export async function runPageSpeed({
  url,
  strategy,
  categories = ALL_CATEGORIES,
  scope,
  signal,
  useCache = true,
}: {
  url: string;
  strategy: Strategy;
  categories?: CategoryId[];
  scope: string;
  signal?: AbortSignal;
  useCache?: boolean;
}): Promise<{ report: Report; cached: boolean }> {
  if (useCache) {
    const cached = readCachedReport(scope, url, strategy);
    if (cached) return { report: cached, cached: true };
  }

  const params = new URLSearchParams({ url, strategy });
  for (const c of categories) params.append('category', c);
  if (API_KEY) params.set('key', API_KEY);

  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, TIMEOUT_MS);
  const onAbort = () => controller.abort();
  signal?.addEventListener('abort', onAbort);
  if (signal?.aborted) controller.abort();

  let res: Response;
  try {
    res = await fetch(`${ENDPOINT}?${params.toString()}`, { signal: controller.signal });
  } catch (err) {
    if (timedOut) {
      throw new PageSpeedError(
        'Google took longer than 90 seconds to test this page. Very slow or heavy pages can time out. Try again, or test a lighter page.',
        'timeout',
      );
    }
    if (controller.signal.aborted) throw new PageSpeedError('Test cancelled.', 'aborted');
    throw new PageSpeedError(
      `Could not reach Google PageSpeed Insights. Check your internet connection and try again.${
        err instanceof Error && err.message ? ` (${err.message})` : ''
      }`,
      'network',
    );
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', onAbort);
  }

  let body: RawResponse | null = null;
  try {
    body = (await res.json()) as RawResponse;
  } catch {
    body = null;
  }

  if (!res.ok) throw errorFromResponse(res.status, body);
  if (!body?.lighthouseResult) {
    throw new PageSpeedError('Google returned an empty result. Please try again.', 'unknown');
  }
  const runtime = body.lighthouseResult.runtimeError;
  if (runtime?.code && runtime.code !== 'NO_ERROR') {
    throw new PageSpeedError(
      `Lighthouse could not test this page: ${runtime.message ?? runtime.code}`,
      'url',
    );
  }

  const report = parseReport(body, url, strategy);
  writeCachedReport(scope, report);
  return { report, cached: false };
}

function errorFromResponse(status: number, body: RawResponse | null): PageSpeedError {
  const apiMessage = body?.error?.message ?? '';
  if (status === 429) {
    return new PageSpeedError(
      "Google's free quota is busy right now. Please try again in a minute.",
      'quota',
    );
  }
  if (status === 400 || status === 500) {
    // Lighthouse errors arrive as e.g. "Lighthouse returned error: FAILED_DOCUMENT_REQUEST. ..."
    const cleaned = apiMessage.replace(/^Lighthouse returned error:\s*/i, '').trim();
    const friendly =
      /DNS_FAILURE|ERRORED_DOCUMENT_REQUEST|FAILED_DOCUMENT_REQUEST|NO_FCP|NOT_HTML|INVALID_URL|unable to resolve/i.test(
        cleaned,
      )
        ? 'Google could not load that page. Check the address is correct, publicly reachable and not blocking bots, then try again.'
        : 'Google could not test that page.';
    return new PageSpeedError(cleaned ? `${friendly} Details: ${cleaned}` : friendly, 'url');
  }
  if (status === 403) {
    return new PageSpeedError(
      'The PageSpeed API rejected this request (access denied). Please try again later.',
      'unknown',
    );
  }
  return new PageSpeedError(
    `Google PageSpeed Insights returned an error (${status}).${apiMessage ? ` ${apiMessage}` : ''}`,
    'unknown',
  );
}

// ---------- Parsing ----------

const FIELD_METRICS: { raw: string; key: FieldMetric['key']; label: string }[] = [
  { raw: 'LARGEST_CONTENTFUL_PAINT_MS', key: 'LCP', label: 'Largest Contentful Paint' },
  { raw: 'INTERACTION_TO_NEXT_PAINT', key: 'INP', label: 'Interaction to Next Paint' },
  { raw: 'CUMULATIVE_LAYOUT_SHIFT_SCORE', key: 'CLS', label: 'Cumulative Layout Shift' },
  { raw: 'FIRST_CONTENTFUL_PAINT_MS', key: 'FCP', label: 'First Contentful Paint' },
  { raw: 'EXPERIMENTAL_TIME_TO_FIRST_BYTE', key: 'TTFB', label: 'Time to First Byte' },
];

function formatMs(ms: number): string {
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)} s` : `${Math.round(ms)} ms`;
}

function parseField(exp: RawLoadingExperience | undefined, isOrigin: boolean): FieldData | null {
  if (!exp?.metrics) return null;
  const metrics: FieldMetric[] = [];
  for (const m of FIELD_METRICS) {
    const raw = exp.metrics[m.raw];
    if (!raw || typeof raw.percentile !== 'number') continue;
    // CrUX reports CLS multiplied by 100.
    const value = m.key === 'CLS' ? (raw.percentile / 100).toFixed(2) : formatMs(raw.percentile);
    const category =
      (['FAST', 'AVERAGE', 'SLOW'] as const).find((c) => c === raw.category) ?? 'NONE';
    metrics.push({ key: m.key, label: m.label, value, category });
  }
  if (!metrics.length) return null;
  return {
    isOrigin: isOrigin || Boolean(exp.origin_fallback),
    overall: exp.overall_category,
    metrics,
  };
}

export function parseReport(body: RawResponse, url: string, strategy: Strategy): Report {
  const lh = body.lighthouseResult ?? {};
  const rawAudits = lh.audits ?? {};
  const rawCats = lh.categories ?? {};

  const membership = new Map<string, CategoryId[]>();
  const categories: CategoryScore[] = [];
  for (const id of ALL_CATEGORIES) {
    const cat = rawCats[id];
    if (!cat) continue;
    categories.push({
      id,
      title: cat.title ?? id,
      score: typeof cat.score === 'number' ? Math.round(cat.score * 100) : null,
    });
    for (const ref of cat.auditRefs ?? []) {
      if (ref.group === 'hidden') continue;
      membership.set(ref.id, [...(membership.get(ref.id) ?? []), id]);
    }
  }

  const audits: Record<string, Audit> = {};
  for (const [id, a] of Object.entries(rawAudits)) {
    if (
      id === 'final-screenshot' ||
      id === 'full-page-screenshot' ||
      id === 'screenshot-thumbnails'
    ) {
      continue;
    }
    const savings =
      a.details?.overallSavingsMs ??
      (a.metricSavings
        ? Math.max(0, a.metricSavings.LCP ?? 0, a.metricSavings.FCP ?? 0, a.metricSavings.TBT ?? 0)
        : undefined);
    audits[id] = {
      id,
      title: a.title ?? id,
      description: a.description ?? '',
      score: typeof a.score === 'number' ? a.score : null,
      mode: a.scoreDisplayMode ?? 'unknown',
      displayValue: a.displayValue,
      numericValue: a.numericValue,
      detailsType: a.details?.type,
      savingsMs: savings,
      categories: membership.get(id) ?? [],
    };
  }

  const shot = rawAudits['final-screenshot']?.details?.data;
  const field =
    parseField(body.loadingExperience, false) ?? parseField(body.originLoadingExperience, true);

  return {
    requestedUrl: url,
    finalUrl: lh.finalDisplayedUrl ?? lh.finalUrl ?? body.id ?? url,
    strategy,
    fetchTime: lh.fetchTime ?? new Date().toISOString(),
    lighthouseVersion: lh.lighthouseVersion,
    warnings: (lh.runWarnings ?? []).filter((w) => typeof w === 'string'),
    categories,
    audits,
    field,
    screenshot: typeof shot === 'string' && shot.startsWith('data:image/') ? shot : undefined,
  };
}

// ---------- Helpers for presenting audits ----------

export const LAB_METRICS: { id: string; label: string; short: string }[] = [
  { id: 'first-contentful-paint', label: 'First Contentful Paint', short: 'FCP' },
  { id: 'largest-contentful-paint', label: 'Largest Contentful Paint', short: 'LCP' },
  { id: 'total-blocking-time', label: 'Total Blocking Time', short: 'TBT' },
  { id: 'cumulative-layout-shift', label: 'Cumulative Layout Shift', short: 'CLS' },
  { id: 'speed-index', label: 'Speed Index', short: 'SI' },
];

const SCORED_MODES = new Set(['binary', 'numeric', 'metricSavings']);

/** True when the audit has a real score below `threshold` (default 0.9). */
export function isFailing(a: Audit, threshold = 0.9): boolean {
  return a.score !== null && SCORED_MODES.has(a.mode) && a.score < threshold;
}

/** Failing load-speed opportunities, biggest estimated saving first. */
export function opportunities(report: Report): Audit[] {
  return Object.values(report.audits)
    .filter(
      (a) =>
        isFailing(a) &&
        (a.detailsType === 'opportunity' || (a.id.endsWith('-insight') && (a.savingsMs ?? 0) > 0)),
    )
    .sort((x, y) => (y.savingsMs ?? 0) - (x.savingsMs ?? 0));
}

/** Other failing audits, grouped by the first category that lists them. */
export function diagnostics(report: Report): { category: CategoryScore; audits: Audit[] }[] {
  const metricIds = new Set(LAB_METRICS.map((m) => m.id));
  const oppIds = new Set(opportunities(report).map((a) => a.id));
  return report.categories
    .map((category) => ({
      category,
      audits: Object.values(report.audits)
        .filter(
          (a) =>
            a.categories[0] === category.id &&
            isFailing(a) &&
            !metricIds.has(a.id) &&
            !oppIds.has(a.id),
        )
        .sort((x, y) => (x.score ?? 0) - (y.score ?? 0)),
    }))
    .filter((g) => g.audits.length > 0);
}

export type TextSegment = { text: string; href?: string };

/**
 * Splits Lighthouse's markdown-ish descriptions into plain text and links.
 * Only http(s) links survive; everything is rendered as React text nodes, so
 * no HTML from the API ever reaches the DOM. Inline `code` ticks are dropped.
 */
export function parseMarkdownLinks(text: string): TextSegment[] {
  const out: TextSegment[] = [];
  const re = /\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  const clean = (s: string) => s.replace(/`/g, '');
  while ((m = re.exec(text))) {
    if (m.index > last) out.push({ text: clean(text.slice(last, m.index)) });
    const href = /^https?:\/\//i.test(m[2]) ? m[2] : undefined;
    out.push({ text: clean(m[1]), href });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ text: clean(text.slice(last)) });
  return out;
}

export function formatSavings(ms: number | undefined): string | null {
  if (!ms || ms <= 0) return null;
  return `Est. savings ${formatMs(ms)}`;
}
