'use client';

import { useState, type FormEvent } from 'react';
import { Icon } from '@/components/icon';
import {
  ToolCard,
  inputClass,
  labelClass,
  primaryButtonClass,
  secondaryButtonClass,
} from '@/components/tools/tool-ui';
import {
  ErrorPanel,
  FieldDataPanel,
  LhText,
  ProgressPanel,
  ScoreGauge,
  Screenshot,
  formatTestedAt,
  usePageSpeedRun,
} from '@/components/tools/lighthouse-ui';
import {
  normaliseUrl,
  pageSpeedReportUrl,
  type Audit,
  type CategoryId,
  type Report,
} from '@/lib/pagespeed';

const SCOPE = 'mobile';
// Best practices is included because viewport, image-aspect-ratio and
// image-size-responsive live in that category in current Lighthouse versions;
// audits of categories that are not requested are not run at all.
const CATEGORIES: CategoryId[] = ['performance', 'seo', 'accessibility', 'best-practices'];

type Status = 'pass' | 'warn' | 'fail' | 'na' | 'missing';

type Check = {
  /** Audit ids to try in order; the first one present is used. */
  ids: string[];
  label: string;
  why: string;
  critical?: boolean;
};

const LAYOUT_CHECKS: Check[] = [
  {
    ids: ['viewport'],
    label: 'Viewport meta tag',
    why: 'Without <meta name="viewport" content="width=device-width, initial-scale=1"> phones render the page at desktop width and shrink it, so text is tiny and visitors must pinch-zoom.',
    critical: true,
  },
  {
    ids: ['meta-viewport'],
    label: 'Zoom is not disabled',
    why: 'user-scalable=no or a small maximum-scale stops people with low vision from zooming in. Let visitors zoom.',
  },
  {
    ids: ['font-size'],
    label: 'Legible font sizes',
    why: 'Most body text should be at least 12px (16px is a comfortable default) so it can be read on a phone without zooming.',
    critical: true,
  },
  {
    ids: ['tap-targets', 'target-size'],
    label: 'Tap targets are big enough',
    why: 'Buttons and links should be at least 24×24px (48px is better) with space between them, so a thumb hits the intended one.',
    critical: true,
  },
  {
    ids: ['content-width'],
    label: 'Content fits the screen',
    why: 'If content is wider than the viewport the page scrolls sideways, which usually means a fixed-width element or an oversized image.',
    critical: true,
  },
  {
    ids: ['image-aspect-ratio'],
    label: 'Images keep their aspect ratio',
    why: 'Stretched or squashed images look broken on small screens. Set width and height attributes and size images with CSS that preserves the ratio.',
  },
  {
    ids: ['image-size-responsive'],
    label: 'Images are sharp on high-density screens',
    why: 'Phone screens have 2–3× pixel density. Serve images (ideally with srcset) large enough to stay crisp.',
  },
];

const SPEED_CHECKS: Check[] = [
  {
    ids: ['largest-contentful-paint'],
    label: 'Largest Contentful Paint (LCP)',
    why: 'How long the main content takes to appear on a throttled phone. Aim for 2.5 s or less.',
  },
  {
    ids: ['cumulative-layout-shift'],
    label: 'Cumulative Layout Shift (CLS)',
    why: 'How much the layout jumps while loading. Aim for 0.1 or less; reserve space for images, ads and embeds.',
  },
  {
    ids: ['total-blocking-time'],
    label: 'Total Blocking Time (TBT)',
    why: 'How long JavaScript blocks the main thread, a lab stand-in for responsiveness (INP). Aim for under 200 ms.',
  },
];

type Row = Check & { status: Status; audit?: Audit };

function evaluate(report: Report, check: Check): Row {
  const audit = check.ids.map((id) => report.audits[id]).find(Boolean);
  if (!audit) return { ...check, status: 'missing' };
  if (audit.mode === 'notApplicable') return { ...check, status: 'na', audit };
  if (audit.score === null) return { ...check, status: 'missing', audit };
  const status: Status = audit.score >= 0.9 ? 'pass' : audit.score >= 0.5 ? 'warn' : 'fail';
  return { ...check, status, audit };
}

const statusStyle: Record<
  Status,
  { icon: 'check_circle' | 'error' | 'report' | 'visibility'; cls: string; word: string }
> = {
  pass: { icon: 'check_circle', cls: 'text-primary-container', word: 'Pass' },
  warn: { icon: 'report', cls: 'text-amber-700', word: 'Needs work' },
  fail: { icon: 'error', cls: 'text-error', word: 'Fail' },
  na: { icon: 'check_circle', cls: 'text-secondary', word: 'Not applicable' },
  missing: { icon: 'visibility', cls: 'text-secondary', word: 'Not reported' },
};

export function MobileTest() {
  const [input, setInput] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [lastUrl, setLastUrl] = useState<string | null>(null);
  const { state, elapsed, run, cancel } = usePageSpeedRun(SCOPE, CATEGORIES);
  const running = state.status === 'running';

  function start(e: FormEvent) {
    e.preventDefault();
    const result = normaliseUrl(input);
    if ('error' in result) {
      setInputError(result.error);
      return;
    }
    setInputError(null);
    setInput(result.url);
    setLastUrl(result.url);
    void run(result.url, 'mobile');
  }

  return (
    <div className="flex flex-col gap-6">
      <ToolCard>
        <form onSubmit={start} noValidate className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            <label htmlFor="mobile-url" className={labelClass}>
              Page URL
            </label>
            <input
              id="mobile-url"
              type="url"
              inputMode="url"
              autoComplete="url"
              placeholder="https://example.com"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              aria-invalid={inputError ? true : undefined}
              aria-describedby={inputError ? 'mobile-url-error' : undefined}
              className={inputClass}
            />
          </div>
          <button type="submit" disabled={running} className={primaryButtonClass}>
            <Icon name="smartphone" size={18} />
            {running ? 'Testing…' : 'Test on mobile'}
          </button>
        </form>
        {inputError ? (
          <p id="mobile-url-error" className="font-body-sm text-body-sm text-error mt-2">
            {inputError}
          </p>
        ) : null}
      </ToolCard>

      <div aria-live="polite" className="flex flex-col gap-6">
        {state.status === 'running' ? (
          <ProgressPanel url={state.url} elapsed={elapsed} onCancel={cancel} />
        ) : null}
        {state.status === 'error' ? (
          <ErrorPanel
            message={state.message}
            onRetry={lastUrl ? () => void run(lastUrl, 'mobile', false) : undefined}
          />
        ) : null}
        {state.status === 'done' ? (
          <Results
            report={state.report}
            cached={state.cached}
            onRerun={() => void run(state.report.requestedUrl, 'mobile', false)}
          />
        ) : null}
      </div>
    </div>
  );
}

function Results({
  report,
  cached,
  onRerun,
}: {
  report: Report;
  cached: boolean;
  onRerun: () => void;
}) {
  const layout = LAYOUT_CHECKS.map((c) => evaluate(report, c));
  const speed = SPEED_CHECKS.map((c) => evaluate(report, c));
  const viewport = layout[0];
  const criticalFails = layout.filter((r) => r.critical && r.status === 'fail');
  const otherIssues = [...layout, ...speed].filter(
    (r) => r.status === 'warn' || (r.status === 'fail' && !r.critical),
  );

  let verdict: 'yes' | 'no' | 'unknown';
  if (viewport.status === 'missing') verdict = 'unknown';
  else if (viewport.status === 'pass' && criticalFails.length === 0) verdict = 'yes';
  else verdict = 'no';

  const scores = report.categories.filter((c) => c.id !== 'best-practices');

  return (
    <>
      <ToolCard>
        <div className="grid gap-6 md:grid-cols-[auto_1fr] md:items-start">
          <PhoneFrame report={report} />
          <div className="min-w-0">
            {verdict === 'yes' ? (
              <div className="bg-brand-50 rounded-xl p-5">
                <p className="font-headline-md text-headline-md text-primary-container flex items-center gap-2">
                  <Icon name="verified" size={28} /> Mobile-friendly
                </p>
                <p className="font-body-md text-body-md text-on-surface-variant mt-2">
                  The page sets a responsive viewport and passes the critical layout checks
                  Lighthouse reported.
                  {otherIssues.length
                    ? ` There ${otherIssues.length === 1 ? 'is 1 item' : `are ${otherIssues.length} items`} worth improving below.`
                    : ''}
                </p>
              </div>
            ) : verdict === 'no' ? (
              <div className="bg-error-container rounded-xl p-5">
                <p className="font-headline-md text-headline-md text-error flex items-center gap-2">
                  <Icon name="error" size={28} /> Not mobile-friendly
                </p>
                <ul className="font-body-md text-body-md text-on-surface mt-2 list-disc space-y-1 pl-5">
                  {viewport.status !== 'pass' ? <li>No working responsive viewport tag.</li> : null}
                  {criticalFails
                    .filter((r) => r !== viewport)
                    .map((r) => (
                      <li key={r.label}>{r.label}: failed</li>
                    ))}
                </ul>
              </div>
            ) : (
              <div className="bg-surface-container-low rounded-xl p-5">
                <p className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
                  <Icon name="report" size={28} /> Inconclusive
                </p>
                <p className="font-body-md text-body-md text-on-surface-variant mt-2">
                  Lighthouse did not report the viewport check for this page, so we cannot give a
                  verdict. Review the rows below or try again.
                </p>
              </div>
            )}

            <p className="font-body-sm text-body-sm text-on-surface-variant mt-4 break-all">
              {report.finalUrl}
            </p>
            <p className="font-body-sm text-body-sm text-secondary mt-1">
              Tested on an emulated phone {formatTestedAt(report.fetchTime)}
              {cached ? ' · cached result (under 10 minutes old)' : ''}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={onRerun} className={secondaryButtonClass}>
                Re-run
              </button>
              <a
                href={pageSpeedReportUrl(report.requestedUrl, 'mobile')}
                target="_blank"
                rel="noopener noreferrer"
                className={secondaryButtonClass}
              >
                Full report on PageSpeed Insights <Icon name="north_east" size={16} />
              </a>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4">
              {scores.map((c) => (
                <ScoreGauge key={c.id} score={c.score} label={c.title} />
              ))}
            </div>
          </div>
        </div>
      </ToolCard>

      <ToolCard>
        <h3 className="font-title-md text-title-md text-on-surface">
          Mobile layout &amp; usability
        </h3>
        <CheckList rows={layout} />
      </ToolCard>

      <ToolCard>
        <h3 className="font-title-md text-title-md text-on-surface">Mobile speed (lab data)</h3>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
          Measured by Lighthouse on a throttled mid-range phone.
        </p>
        <CheckList rows={speed} />
      </ToolCard>

      <ToolCard>
        <FieldDataPanel field={report.field} only={['LCP', 'INP', 'CLS']} />
      </ToolCard>
    </>
  );
}

function CheckList({ rows }: { rows: Row[] }) {
  return (
    <ul className="divide-border-subtle mt-3 divide-y">
      {rows.map((r) => {
        const s = statusStyle[r.status];
        return (
          <li key={r.label} className="flex gap-3 py-4">
            <Icon name={s.icon} size={22} className={`mt-0.5 ${s.cls}`} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <p className="font-title-md text-title-md text-on-surface">{r.label}</p>
                <p className={`font-label-md text-label-md ${s.cls}`}>
                  {s.word}
                  {r.audit?.displayValue ? ` · ${r.audit.displayValue}` : ''}
                </p>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 break-words">
                {r.status === 'missing'
                  ? 'This Lighthouse version did not report this check, so it is not counted against the page. '
                  : null}
                {r.why}
              </p>
              {r.audit && (r.status === 'fail' || r.status === 'warn') && r.audit.description ? (
                <p className="font-body-sm text-body-sm text-secondary mt-1 break-words">
                  Lighthouse: <LhText text={r.audit.description} />
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function PhoneFrame({ report }: { report: Report }) {
  return (
    <div className="mx-auto w-[200px] shrink-0">
      <div className="bg-on-surface rounded-[2rem] p-2.5 shadow-md">
        <div className="bg-surface-card relative overflow-hidden rounded-[1.5rem]">
          <div
            aria-hidden
            className="bg-on-surface absolute top-1.5 left-1/2 z-10 h-3 w-16 -translate-x-1/2 rounded-full"
          />
          {report.screenshot ? (
            <Screenshot
              src={report.screenshot}
              alt={`Mobile screenshot of ${report.finalUrl}`}
              className="block aspect-[9/19] w-full object-cover object-top"
            />
          ) : (
            <div className="font-body-sm text-body-sm text-secondary grid aspect-[9/19] place-items-center p-4 text-center">
              No screenshot returned
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
