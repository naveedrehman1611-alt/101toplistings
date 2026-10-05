'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/icon';
import {
  PageSpeedError,
  parseMarkdownLinks,
  runPageSpeed,
  type CategoryId,
  type FieldData,
  type Report,
  type Strategy,
} from '@/lib/pagespeed';
import { secondaryButtonClass } from '@/components/tools/tool-ui';

// ---------- Score colours ----------

export type Tone = 'good' | 'average' | 'poor' | 'none';

/** Lighthouse bands: 90-100 good, 50-89 needs improvement, 0-49 poor. */
export function toneFor(score0to100: number | null | undefined): Tone {
  if (score0to100 === null || score0to100 === undefined) return 'none';
  if (score0to100 >= 90) return 'good';
  if (score0to100 >= 50) return 'average';
  return 'poor';
}

export function toneForAudit(score: number | null): Tone {
  return score === null ? 'none' : toneFor(Math.round(score * 100));
}

export const toneText: Record<Tone, string> = {
  good: 'text-primary-container',
  // badge-gold is too light for text on white; amber-700 keeps 4.5:1 contrast.
  average: 'text-amber-700',
  poor: 'text-error',
  none: 'text-secondary',
};

const toneStroke: Record<Tone, string> = {
  good: 'stroke-primary-container',
  average: 'stroke-badge-gold',
  poor: 'stroke-error',
  none: 'stroke-border-subtle',
};

export const toneLabel: Record<Tone, string> = {
  good: 'Good',
  average: 'Needs improvement',
  poor: 'Poor',
  none: 'Not scored',
};

/** Small coloured shape, so status is not conveyed by colour alone. */
export function ToneDot({ tone }: { tone: Tone }) {
  if (tone === 'good')
    return (
      <span
        aria-hidden
        className="bg-primary-container inline-block size-2.5 shrink-0 rounded-full"
      />
    );
  if (tone === 'average')
    return <span aria-hidden className="bg-badge-gold inline-block size-2.5 shrink-0" />;
  if (tone === 'poor')
    return (
      <span
        aria-hidden
        className="inline-block size-0 shrink-0 border-x-[6px] border-b-[10px] border-x-transparent border-b-[var(--color-error)]"
      />
    );
  return (
    <span aria-hidden className="bg-border-subtle inline-block size-2.5 shrink-0 rounded-full" />
  );
}

// ---------- Gauge ----------

export function ScoreGauge({ score, label }: { score: number | null; label: string }) {
  const tone = toneFor(score);
  const r = 42;
  const c = 2 * Math.PI * r;
  const filled = score === null ? 0 : (Math.max(0, Math.min(100, score)) / 100) * c;
  return (
    <figure className="flex flex-col items-center gap-2 text-center">
      <div className="relative size-24 sm:size-28">
        <svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-hidden>
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            strokeWidth="8"
            className="stroke-surface-container-low"
          />
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${filled} ${c}`}
            className={`${toneStroke[tone]} transition-[stroke-dasharray] duration-700`}
          />
        </svg>
        <span
          className={`font-headline-md text-headline-md absolute inset-0 grid place-items-center font-bold ${toneText[tone]}`}
        >
          {score ?? '–'}
        </span>
      </div>
      <figcaption className="font-label-md text-label-md text-on-surface">
        {label}
        <span className="sr-only">
          : {score === null ? 'not scored' : `${score} out of 100, ${toneLabel[tone]}`}
        </span>
      </figcaption>
    </figure>
  );
}

// ---------- Markdown-link text ----------

/** Renders Lighthouse description text with safe external links. No raw HTML. */
export function LhText({ text, className }: { text: string; className?: string }) {
  return (
    <span className={className}>
      {parseMarkdownLinks(text).map((seg, i) =>
        seg.href ? (
          <a
            key={i}
            href={seg.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-container break-words underline underline-offset-2"
          >
            {seg.text}
          </a>
        ) : (
          <span key={i}>{seg.text}</span>
        ),
      )}
    </span>
  );
}

// ---------- Field data ----------

const fieldTone: Record<string, Tone> = {
  FAST: 'good',
  AVERAGE: 'average',
  SLOW: 'poor',
  NONE: 'none',
};
const fieldWord: Record<string, string> = {
  FAST: 'Good',
  AVERAGE: 'Needs improvement',
  SLOW: 'Poor',
  NONE: '—',
};

export function FieldDataPanel({
  field,
  only,
}: {
  field: FieldData | null;
  only?: ('LCP' | 'INP' | 'CLS' | 'FCP' | 'TTFB')[];
}) {
  const metrics = field?.metrics.filter((m) => !only || only.includes(m.key)) ?? [];
  return (
    <div>
      <h3 className="font-title-md text-title-md text-on-surface flex flex-wrap items-center gap-2">
        Real-user data (Chrome UX Report)
        {field?.isOrigin ? (
          <span className="bg-surface-container-low font-label-sm text-label-sm text-secondary rounded-full px-2 py-0.5">
            whole site (origin)
          </span>
        ) : null}
      </h3>
      {metrics.length ? (
        <>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            75th-percentile experience of real Chrome users over the last 28 days. This is what
            Google uses for the Core Web Vitals ranking signal.
          </p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-3">
            {metrics.map((m) => {
              const tone = fieldTone[m.category];
              return (
                <li key={m.key} className="border-border-subtle rounded-lg border p-4">
                  <p className="font-label-md text-label-md text-on-surface-variant">
                    {m.label} <span className="text-secondary">({m.key})</span>
                  </p>
                  <p
                    className={`font-headline-md text-headline-md mt-1 font-bold ${toneText[tone]}`}
                  >
                    {m.value}
                  </p>
                  <p className="font-label-sm text-label-sm text-on-surface-variant mt-1 flex items-center gap-1.5">
                    <ToneDot tone={tone} />
                    {fieldWord[m.category]}
                  </p>
                </li>
              );
            })}
          </ul>
        </>
      ) : (
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
          Not enough real-user traffic for Google to publish field data for this page or site yet.
          Use the lab data below as your guide.
        </p>
      )}
    </div>
  );
}

// ---------- Screenshot ----------

export function Screenshot({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- data: URI from the API; next/image would route it through Vercel's paid optimizer for no benefit.
    <img src={src} alt={alt} className={className} loading="lazy" decoding="async" />
  );
}

// ---------- Run state hook ----------

export type RunState =
  | { status: 'idle' }
  | { status: 'running'; url: string; startedAt: number }
  | { status: 'done'; report: Report; cached: boolean }
  | { status: 'error'; message: string; kind: PageSpeedError['kind'] };

/** Drives one PageSpeed run with cancel support and a ticking elapsed counter. */
export function usePageSpeedRun(scope: string, categories?: CategoryId[]) {
  const [state, setState] = useState<RunState>({ status: 'idle' });
  const [elapsed, setElapsed] = useState(0);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (state.status !== 'running') return;
    const id = window.setInterval(
      () => setElapsed(Math.floor((Date.now() - state.startedAt) / 1000)),
      1000,
    );
    return () => window.clearInterval(id);
  }, [state]);

  useEffect(() => () => controllerRef.current?.abort(), []);

  const run = useCallback(
    async (url: string, strategy: Strategy, useCache = true) => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;
      setElapsed(0);
      setState({ status: 'running', url, startedAt: Date.now() });
      try {
        const { report, cached } = await runPageSpeed({
          url,
          strategy,
          categories,
          scope,
          signal: controller.signal,
          useCache,
        });
        if (controllerRef.current === controller) setState({ status: 'done', report, cached });
      } catch (err) {
        if (controllerRef.current !== controller) return;
        if (err instanceof PageSpeedError) {
          setState(
            err.kind === 'aborted'
              ? { status: 'idle' }
              : { status: 'error', message: err.message, kind: err.kind },
          );
        } else {
          setState({
            status: 'error',
            message: 'Something went wrong. Please try again.',
            kind: 'unknown',
          });
        }
      }
    },
    [scope, categories],
  );

  const cancel = useCallback(() => controllerRef.current?.abort(), []);

  return { state, elapsed, run, cancel };
}

// ---------- Progress & error panels ----------

function stageFor(seconds: number) {
  if (seconds < 5) return 'Sending your page to Google’s Lighthouse servers…';
  if (seconds < 15) return 'Loading the page on a throttled test device…';
  if (seconds < 30) return 'Measuring paint, layout shift and blocking time…';
  if (seconds < 50) return 'Running accessibility, SEO and best-practice audits…';
  return 'Still working: heavy pages can take up to a minute and a half…';
}

export function ProgressPanel({
  url,
  elapsed,
  onCancel,
}: {
  url: string;
  elapsed: number;
  onCancel: () => void;
}) {
  const pct = Math.min(95, Math.round((elapsed / 45) * 100));
  return (
    <div className="surface-card p-5 md:p-6" role="status">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="font-title-md text-title-md text-on-surface flex items-center gap-2">
            <Icon name="schedule" size={20} className="text-primary-container animate-pulse" />
            Testing… {elapsed}s
          </p>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 break-all">{url}</p>
        </div>
        <button type="button" onClick={onCancel} className={secondaryButtonClass}>
          <Icon name="close" size={18} />
          Cancel
        </button>
      </div>
      <div className="bg-surface-container-low mt-4 h-2 overflow-hidden rounded-full" aria-hidden>
        <div
          className="bg-primary-container h-full rounded-full transition-[width] duration-1000"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="font-body-sm text-body-sm text-on-surface-variant mt-3">{stageFor(elapsed)}</p>
      <p className="font-body-sm text-body-sm text-secondary mt-1">
        Tests usually take 10–60 seconds. You can keep reading below while you wait.
      </p>
    </div>
  );
}

export function ErrorPanel({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="bg-error-container border-error/20 rounded-xl border p-5" role="alert">
      <p className="font-title-md text-title-md text-on-surface flex items-center gap-2">
        <Icon name="error" size={20} className="text-error" />
        The test could not finish
      </p>
      <p className="font-body-md text-body-md text-on-surface mt-2 break-words">{message}</p>
      {onRetry ? (
        <button type="button" onClick={onRetry} className={`${secondaryButtonClass} mt-4`}>
          Try again
        </button>
      ) : null}
    </div>
  );
}

export function formatTestedAt(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}
