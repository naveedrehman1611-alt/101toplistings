'use client';

import { useId, useState } from 'react';
import { Icon } from '@/components/icon';
import type { ToolLabels } from '@/components/tools/tool-page';
import { RichBlocks, RichInline, lines } from '@/components/tools/rich-text';
import {
  CopyButton,
  DownloadButton,
  ToolCard,
  inputClass,
  labelClass,
  secondaryButtonClass,
} from '@/components/tools/tool-ui';
import {
  AI_BOTS,
  SEARCH_BOTS,
  buildRobots,
  isAbsoluteUrl,
  robotsWarnings,
  type AiBotKind,
  type BotInfo,
  type BotRule,
  type DefaultPolicy,
} from './build-robots';

const QUICK_DISALLOW: { label: string; paths: string[]; allow?: string[] }[] = [
  { label: '/wp-admin/', paths: ['/wp-admin/'], allow: ['/wp-admin/admin-ajax.php'] },
  { label: '/cgi-bin/', paths: ['/cgi-bin/'] },
  { label: '/search', paths: ['/search'] },
  { label: '/cart', paths: ['/cart'] },
  { label: '/checkout', paths: ['/checkout'] },
  { label: '/account', paths: ['/account'] },
  { label: '/*?s=', paths: ['/*?s='] },
  { label: '/*?sort=', paths: ['/*?sort='] },
];

type Labels = ToolLabels<'tool_robots_txt'>;

function kindLabel(kind: AiBotKind, l: Labels): string {
  return { training: l.kind_training, search: l.kind_search, user: l.kind_user }[kind];
}

type Preset = 'allow-all' | 'block-training' | 'block-ai';

function presetRules(preset: Preset): Record<string, BotRule> {
  const rules: Record<string, BotRule> = {};
  for (const bot of AI_BOTS) {
    if (preset === 'allow-all') rules[bot.name] = 'default';
    else if (preset === 'block-ai') rules[bot.name] = 'block';
    else rules[bot.name] = bot.kind === 'training' ? 'block' : 'default';
  }
  return rules;
}

/** Editable list of text rows with add/remove buttons. */
function ListEditor({
  label,
  hint,
  values,
  onChange,
  placeholder,
  invalid,
  addLabel,
}: {
  label: string;
  hint?: string;
  values: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
  invalid?: (value: string) => boolean;
  addLabel: string;
}) {
  const id = useId();
  return (
    <fieldset>
      <legend className={labelClass}>{label}</legend>
      {hint ? (
        <p className="font-body-sm text-body-sm text-on-surface-variant -mt-1 mb-2">{hint}</p>
      ) : null}
      <div className="space-y-2">
        {values.map((value, i) => {
          const bad = !!value.trim() && invalid?.(value.trim());
          return (
            <div key={i} className="flex gap-2">
              <label htmlFor={`${id}-${i}`} className="sr-only">
                {label} {i + 1}
              </label>
              <input
                id={`${id}-${i}`}
                value={value}
                placeholder={placeholder}
                aria-invalid={bad || undefined}
                onChange={(e) => onChange(values.map((v, j) => (j === i ? e.target.value : v)))}
                className={`${inputClass} min-w-0 font-mono ${bad ? 'border-error' : ''}`}
                spellCheck={false}
                autoCapitalize="off"
              />
              <button
                type="button"
                aria-label={`Remove ${label.toLowerCase()} ${i + 1}`}
                onClick={() => onChange(values.filter((_, j) => j !== i))}
                className="border-border-subtle text-on-surface-variant hover:bg-surface-container-low inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border"
              >
                <Icon name="close" size={18} />
              </button>
            </div>
          );
        })}
      </div>
      <button
        type="button"
        onClick={() => onChange([...values, ''])}
        className={`${secondaryButtonClass} mt-2 h-10 px-4`}
      >
        <Icon name="add_circle" size={18} />
        {addLabel}
      </button>
    </fieldset>
  );
}

function RuleSelect({
  bot,
  value,
  onChange,
  labels,
}: {
  bot: string;
  value: BotRule;
  onChange: (v: BotRule) => void;
  labels: Labels;
}) {
  const optionLabel: Record<BotRule, string> = {
    default: labels.rule_default,
    allow: labels.rule_allow,
    block: labels.rule_block,
  };
  return (
    <div
      role="radiogroup"
      aria-label={`Rule for ${bot}`}
      className="border-border-subtle inline-flex shrink-0 rounded-lg border p-0.5"
    >
      {(['default', 'allow', 'block'] as BotRule[]).map((opt) => {
        const active = value === opt;
        const activeClass =
          opt === 'block'
            ? 'bg-error-container text-error'
            : opt === 'allow'
              ? 'bg-brand-50 text-primary-container'
              : 'bg-surface-container-low text-on-surface';
        return (
          <button
            key={opt}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt)}
            className={`font-label-sm text-label-sm rounded-md px-2.5 py-1.5 capitalize transition ${
              active ? activeClass : 'text-on-surface-variant hover:bg-surface-container-low'
            }`}
          >
            {optionLabel[opt]}
          </button>
        );
      })}
    </div>
  );
}

function BotTable({
  bots,
  rules,
  setRule,
  labels,
}: {
  bots: (BotInfo & { kind?: AiBotKind })[];
  rules: Record<string, BotRule>;
  setRule: (bot: string, rule: BotRule) => void;
  labels: Labels;
}) {
  return (
    <ul className="divide-border-subtle border-border-subtle divide-y rounded-lg border">
      {bots.map((bot) => (
        <li
          key={bot.name}
          className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5"
        >
          <div className="min-w-0">
            <p className="font-label-md text-label-md text-on-surface break-all">
              <code>{bot.name}</code>
              {bot.kind ? (
                <span
                  className={`font-label-sm text-label-sm ml-2 rounded-full px-2 py-0.5 ${
                    bot.kind === 'training'
                      ? 'bg-error-container text-error'
                      : 'bg-brand-50 text-primary-container'
                  }`}
                >
                  {kindLabel(bot.kind, labels)}
                </span>
              ) : null}
            </p>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              {bot.owner} · {bot.purpose}
            </p>
          </div>
          <RuleSelect
            bot={bot.name}
            value={rules[bot.name] ?? 'default'}
            onChange={(v) => setRule(bot.name, v)}
            labels={labels}
          />
        </li>
      ))}
    </ul>
  );
}

export function RobotsGenerator({ labels: l }: { labels: Labels }) {
  const [policy, setPolicy] = useState<DefaultPolicy>('custom');
  const [disallow, setDisallow] = useState<string[]>(['/wp-admin/']);
  const [allow, setAllow] = useState<string[]>(['/wp-admin/admin-ajax.php']);
  const [crawlDelay, setCrawlDelay] = useState('');
  const [bots, setBots] = useState<Record<string, BotRule>>({});
  const [sitemaps, setSitemaps] = useState<string[]>(['https://example.com/sitemap.xml']);

  const config = { policy, disallow, allow, crawlDelay, bots, sitemaps };
  const output = buildRobots(config);
  const notes = lines(l.output_notes).map((n) => n.replace(/^-\s*/, ''));
  const warnings = robotsWarnings(config);

  const setRule = (bot: string, rule: BotRule) => setBots((prev) => ({ ...prev, [bot]: rule }));
  const addQuick = (q: (typeof QUICK_DISALLOW)[number]) => {
    setPolicy('custom');
    setDisallow((prev) => [
      ...prev.filter((p) => p.trim()),
      ...q.paths.filter((p) => !prev.includes(p)),
    ]);
    if (q.allow)
      setAllow((prev) => [
        ...prev.filter((p) => p.trim()),
        ...q.allow!.filter((p) => !prev.includes(p)),
      ]);
  };

  const policies: { value: DefaultPolicy; label: string; hint: string }[] = [
    { value: 'allow', label: l.allow_all, hint: l.allow_all_hint },
    { value: 'disallow', label: l.disallow_all, hint: l.disallow_all_hint },
    { value: 'custom', label: l.custom, hint: l.custom_hint },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-6">
        <ToolCard>
          <h2 className="font-title-md text-title-md text-on-surface">{l.rules_heading}</h2>
          <div
            role="radiogroup"
            aria-label="Default policy"
            className="mt-4 grid gap-2 sm:grid-cols-3"
          >
            {policies.map((p) => (
              <button
                key={p.value}
                type="button"
                role="radio"
                aria-checked={policy === p.value}
                onClick={() => setPolicy(p.value)}
                className={`rounded-lg border px-3 py-2.5 text-left transition ${
                  policy === p.value
                    ? p.value === 'disallow'
                      ? 'border-error bg-error-container'
                      : 'border-primary-container bg-brand-50'
                    : 'border-border-subtle hover:bg-surface-container-low'
                }`}
              >
                <span className="font-label-md text-label-md text-on-surface block">{p.label}</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant block">
                  {p.hint}
                </span>
              </button>
            ))}
          </div>

          {policy === 'custom' ? (
            <div className="mt-5 space-y-5">
              <div>
                <p className={labelClass}>{l.quick_add}</p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_DISALLOW.map((q) => (
                    <button
                      key={q.label}
                      type="button"
                      onClick={() => addQuick(q)}
                      className="border-border-subtle text-on-surface hover:bg-surface-container-low rounded-full border px-3 py-1.5 font-mono text-sm"
                    >
                      + {q.label}
                    </button>
                  ))}
                </div>
              </div>
              <ListEditor
                label={l.disallow_label}
                hint={l.disallow_hint}
                values={disallow}
                onChange={setDisallow}
                placeholder={l.disallow_placeholder}
                addLabel={l.add_row}
                invalid={(v) => !v.startsWith('/') && !v.startsWith('*')}
              />
              <ListEditor
                label={l.allow_label}
                hint={l.allow_hint}
                values={allow}
                onChange={setAllow}
                placeholder={l.allow_placeholder}
                addLabel={l.add_row}
                invalid={(v) => !v.startsWith('/') && !v.startsWith('*')}
              />
            </div>
          ) : null}

          <div className="mt-5">
            <label htmlFor="crawl-delay" className={labelClass}>
              {l.crawl_delay_label}
            </label>
            <input
              id="crawl-delay"
              type="number"
              min={0}
              max={120}
              inputMode="numeric"
              value={crawlDelay}
              onChange={(e) => setCrawlDelay(e.target.value)}
              placeholder={l.crawl_delay_placeholder}
              className={`${inputClass} max-w-40`}
            />
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-2">
              {l.crawl_delay_note}
            </p>
          </div>
        </ToolCard>

        <ToolCard>
          <h2 className="font-title-md text-title-md text-on-surface">{l.search_heading}</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 mb-4">
            <RichInline text={l.search_intro} />
          </p>
          <BotTable bots={SEARCH_BOTS} rules={bots} setRule={setRule} labels={l} />
        </ToolCard>

        <ToolCard>
          <h2 className="font-title-md text-title-md text-on-surface">{l.ai_heading}</h2>
          <div className="font-body-sm text-body-sm text-on-surface-variant mt-1 space-y-2">
            <RichBlocks text={l.ai_intro} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              className={`${secondaryButtonClass} h-10 px-3`}
              onClick={() => setBots((b) => ({ ...b, ...presetRules('allow-all') }))}
            >
              {l.preset_allow}
            </button>
            <button
              type="button"
              className={`${secondaryButtonClass} h-10 px-3`}
              onClick={() => setBots((b) => ({ ...b, ...presetRules('block-training') }))}
            >
              {l.preset_training}
            </button>
            <button
              type="button"
              className={`${secondaryButtonClass} h-10 px-3`}
              onClick={() => setBots((b) => ({ ...b, ...presetRules('block-ai') }))}
            >
              {l.preset_block}
            </button>
          </div>
          <div className="mt-4">
            <BotTable bots={AI_BOTS} rules={bots} setRule={setRule} labels={l} />
          </div>
        </ToolCard>

        <ToolCard>
          <ListEditor
            label={l.sitemaps_label}
            hint={l.sitemaps_hint}
            values={sitemaps}
            onChange={setSitemaps}
            placeholder={l.sitemaps_placeholder}
            addLabel={l.add_row}
            invalid={(v) => !isAbsoluteUrl(v)}
          />
        </ToolCard>
      </div>

      <div className="lg:sticky lg:top-24 lg:self-start">
        <ToolCard>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-title-md text-title-md text-on-surface">{l.output_heading}</h2>
            <div className="flex flex-wrap gap-2">
              <CopyButton text={output} label={l.copy} copiedLabel={l.copied} />
              <DownloadButton text={output} filename="robots.txt" label={l.download} />
            </div>
          </div>
          <pre
            aria-live="polite"
            aria-label="Generated robots.txt"
            className="border-border-subtle bg-surface-container-low text-on-surface mt-4 max-h-[32rem] overflow-auto rounded-lg border p-4 font-mono text-sm leading-relaxed"
          >
            {output}
          </pre>

          {warnings.length ? (
            <ul className="mt-4 space-y-2" aria-label="Warnings">
              {warnings.map((w, i) => (
                <li
                  key={i}
                  className={`font-body-sm text-body-sm flex gap-2 rounded-lg px-3 py-2 ${
                    w.level === 'danger'
                      ? 'bg-error-container text-error'
                      : 'bg-surface-container-low text-on-surface'
                  }`}
                >
                  <Icon
                    name={w.level === 'danger' ? 'error' : 'report'}
                    size={18}
                    className="mt-0.5 shrink-0"
                  />
                  <span className="min-w-0 break-words">{w.text}</span>
                </li>
              ))}
            </ul>
          ) : null}

          {notes.length ? (
            <ul className="font-body-sm text-body-sm text-on-surface-variant mt-4 list-disc space-y-1 pl-5">
              {notes.map((note, i) => (
                <li key={i}>
                  <RichInline text={note} />
                </li>
              ))}
            </ul>
          ) : null}
        </ToolCard>
      </div>
    </div>
  );
}
