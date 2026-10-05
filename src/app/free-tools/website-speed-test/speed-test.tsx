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
  ToneDot,
  formatTestedAt,
  toneForAudit,
  toneText,
  usePageSpeedRun,
} from '@/components/tools/lighthouse-ui';
import {
  ALL_CATEGORIES,
  LAB_METRICS,
  diagnostics,
  formatSavings,
  normaliseUrl,
  opportunities,
  pageSpeedReportUrl,
  type Report,
  type Strategy,
} from '@/lib/pagespeed';

const SCOPE = 'speed';

export function SpeedTest() {
  const [input, setInput] = useState('');
  const [strategy, setStrategy] = useState<Strategy>('mobile');
  const [inputError, setInputError] = useState<string | null>(null);
  const [lastUrl, setLastUrl] = useState<string | null>(null);
  const { state, elapsed, run, cancel } = usePageSpeedRun(SCOPE, ALL_CATEGORIES);
  const running = state.status === 'running';

  function start(e?: FormEvent) {
    e?.preventDefault();
    const result = normaliseUrl(input);
    if ('error' in result) {
      setInputError(result.error);
      return;
    }
    setInputError(null);
    setInput(result.url);
    setLastUrl(result.url);
    void run(result.url, strategy);
  }

  return (
    <div className="flex flex-col gap-6">
      <ToolCard>
        <form onSubmit={start} noValidate className="flex flex-col gap-4">
          <div>
            <label htmlFor="speed-url" className={labelClass}>
              Page URL
            </label>
            <input
              id="speed-url"
              type="url"
              inputMode="url"
              autoComplete="url"
              placeholder="https://example.com"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              aria-invalid={inputError ? true : undefined}
              aria-describedby={inputError ? 'speed-url-error' : undefined}
              className={inputClass}
            />
            {inputError ? (
              <p id="speed-url-error" className="font-body-sm text-body-sm text-error mt-2">
                {inputError}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <fieldset>
              <legend className={labelClass}>Device</legend>
              <div className="border-border-subtle inline-flex rounded-lg border p-1">
                {(['mobile', 'desktop'] as const).map((s) => (
                  <label
                    key={s}
                    className={`font-label-md text-label-md has-[:focus-visible]:outline-primary-container flex cursor-pointer items-center gap-1.5 rounded-md px-4 py-2 has-[:focus-visible]:outline-2 ${
                      strategy === s
                        ? 'bg-primary-container text-on-primary'
                        : 'text-on-surface hover:bg-surface-container-low'
                    }`}
                  >
                    <input
                      type="radio"
                      name="strategy"
                      value={s}
                      checked={strategy === s}
                      onChange={() => setStrategy(s)}
                      className="sr-only"
                    />
                    <Icon name={s === 'mobile' ? 'smartphone' : 'language'} size={18} />
                    {s === 'mobile' ? 'Mobile' : 'Desktop'}
                  </label>
                ))}
              </div>
            </fieldset>
            <button type="submit" disabled={running} className={primaryButtonClass}>
              <Icon name="speed" size={18} />
              {running ? 'Testing…' : 'Run test'}
            </button>
          </div>
        </form>
      </ToolCard>

      <div aria-live="polite" className="flex flex-col gap-6">
        {state.status === 'running' ? (
          <ProgressPanel url={state.url} elapsed={elapsed} onCancel={cancel} />
        ) : null}
        {state.status === 'error' ? (
          <ErrorPanel
            message={state.message}
            onRetry={lastUrl ? () => void run(lastUrl, strategy, false) : undefined}
          />
        ) : null}
        {state.status === 'done' ? (
          <Results
            report={state.report}
            cached={state.cached}
            onRerun={() => void run(state.report.requestedUrl, state.report.strategy, false)}
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
  const opps = opportunities(report);
  const diags = diagnostics(report);
  const device = report.strategy === 'mobile' ? 'Mobile' : 'Desktop';

  return (
    <>
      <ToolCard>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-headline-md text-headline-md text-on-surface">{device} results</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 break-all">
              {report.finalUrl}
            </p>
            <p className="font-body-sm text-body-sm text-secondary mt-1">
              Tested {formatTestedAt(report.fetchTime)}
              {report.lighthouseVersion ? ` · Lighthouse ${report.lighthouseVersion}` : ''}
              {cached ? ' · cached result (under 10 minutes old)' : ''}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={onRerun} className={secondaryButtonClass}>
              Re-run
            </button>
            <a
              href={pageSpeedReportUrl(report.requestedUrl, report.strategy)}
              target="_blank"
              rel="noopener noreferrer"
              className={secondaryButtonClass}
            >
              View full report on PageSpeed Insights <Icon name="north_east" size={16} />
            </a>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-4">
          {report.categories.map((c) => (
            <ScoreGauge key={c.id} score={c.score} label={c.title} />
          ))}
        </div>
        <p className="font-body-sm text-body-sm text-secondary mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <span className="flex items-center gap-1.5">
            <ToneDot tone="poor" /> 0–49
          </span>
          <span className="flex items-center gap-1.5">
            <ToneDot tone="average" /> 50–89
          </span>
          <span className="flex items-center gap-1.5">
            <ToneDot tone="good" /> 90–100
          </span>
        </p>
        {report.warnings.length ? (
          <ul className="bg-surface-container-low font-body-sm text-body-sm text-on-surface-variant mt-4 space-y-1 rounded-lg p-4">
            {report.warnings.map((w) => (
              <li key={w} className="break-words">
                <strong className="text-on-surface">Warning:</strong> <LhText text={w} />
              </li>
            ))}
          </ul>
        ) : null}
      </ToolCard>

      <ToolCard>
        <FieldDataPanel field={report.field} only={['LCP', 'INP', 'CLS']} />
      </ToolCard>

      <ToolCard>
        <div className="grid gap-6 md:grid-cols-[1fr_auto]">
          <div>
            <h3 className="font-title-md text-title-md text-on-surface">Lab data (Lighthouse)</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              One simulated load on a{' '}
              {report.strategy === 'mobile' ? 'throttled mid-range phone' : 'desktop'} from
              Google&rsquo;s servers. Great for debugging; it can differ from real users.
            </p>
            <dl className="divide-border-subtle mt-4 divide-y">
              {LAB_METRICS.map((m) => {
                const a = report.audits[m.id];
                const tone = toneForAudit(a?.score ?? null);
                return (
                  <div key={m.id} className="flex items-center justify-between gap-4 py-3">
                    <dt className="font-body-md text-body-md text-on-surface flex items-center gap-2">
                      <ToneDot tone={tone} />
                      {m.label} <span className="text-secondary">({m.short})</span>
                    </dt>
                    <dd className={`font-title-md text-title-md font-semibold ${toneText[tone]}`}>
                      {a?.displayValue ?? 'n/a'}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </div>
          {report.screenshot ? (
            <div className="flex flex-col items-center gap-2">
              <Screenshot
                src={report.screenshot}
                alt={`How ${report.finalUrl} looked at the end of the ${device.toLowerCase()} test`}
                className="border-border-subtle max-h-72 w-auto max-w-[180px] rounded-lg border object-contain"
              />
              <span className="font-label-sm text-label-sm text-secondary">Final screenshot</span>
            </div>
          ) : null}
        </div>
      </ToolCard>

      <ToolCard>
        <h3 className="font-title-md text-title-md text-on-surface">Opportunities</h3>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
          Changes that could make the page load faster, biggest estimated saving first. Savings are
          estimates and do not directly add to the score.
        </p>
        {opps.length ? (
          <ol className="mt-4 flex flex-col gap-3">
            {opps.map((a) => (
              <li key={a.id} className="border-border-subtle rounded-lg border p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="font-title-md text-title-md text-on-surface flex items-center gap-2">
                    <ToneDot tone={toneForAudit(a.score)} />
                    <LhText text={a.title} />
                  </p>
                  {formatSavings(a.savingsMs) ? (
                    <span className="bg-surface-container-low font-label-sm text-label-sm text-on-surface rounded-full px-2.5 py-1">
                      {formatSavings(a.savingsMs)}
                    </span>
                  ) : a.displayValue ? (
                    <span className="font-label-sm text-label-sm text-secondary">
                      {a.displayValue}
                    </span>
                  ) : null}
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-2 break-words">
                  <LhText text={a.description} />
                </p>
              </li>
            ))}
          </ol>
        ) : (
          <p className="font-body-md text-body-md text-primary-container mt-4 flex items-center gap-2">
            <Icon name="check_circle" size={20} /> No significant load-time opportunities found.
          </p>
        )}
      </ToolCard>

      {diags.length ? (
        <ToolCard>
          <h3 className="font-title-md text-title-md text-on-surface">
            Diagnostics &amp; failed audits
          </h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            Everything else Lighthouse flagged, grouped by category. Open a group to see details.
          </p>
          <div className="mt-4 flex flex-col gap-3">
            {diags.map((g) => (
              <details key={g.category.id} className="border-border-subtle group rounded-lg border">
                <summary className="font-label-md text-label-md text-on-surface flex cursor-pointer list-none items-center justify-between gap-3 p-4">
                  <span>
                    {g.category.title}{' '}
                    <span className="text-secondary">
                      ({g.audits.length} {g.audits.length === 1 ? 'issue' : 'issues'})
                    </span>
                  </span>
                  <Icon
                    name="expand_more"
                    size={20}
                    className="text-secondary transition-transform group-open:rotate-180"
                  />
                </summary>
                <ul className="divide-border-subtle border-border-subtle divide-y border-t">
                  {g.audits.map((a) => (
                    <li key={a.id} className="p-4">
                      <p className="font-body-md text-body-md text-on-surface flex items-start gap-2">
                        <span className="mt-1.5">
                          <ToneDot tone={toneForAudit(a.score)} />
                        </span>
                        <span className="min-w-0 break-words">
                          <LhText text={a.title} />
                          {a.displayValue ? (
                            <span className="text-secondary"> — {a.displayValue}</span>
                          ) : null}
                        </span>
                      </p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 pl-4.5 break-words">
                        <LhText text={a.description} />
                      </p>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
        </ToolCard>
      ) : null}
    </>
  );
}
