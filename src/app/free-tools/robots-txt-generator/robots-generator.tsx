'use client';

import { useId, useState } from 'react';
import { Icon } from '@/components/icon';
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

const KIND_LABEL: Record<AiBotKind, string> = {
  training: 'Training',
  search: 'AI search',
  user: 'User fetch',
};

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
}: {
  label: string;
  hint?: string;
  values: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
  invalid?: (value: string) => boolean;
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
        Add
      </button>
    </fieldset>
  );
}

function RuleSelect({
  bot,
  value,
  onChange,
}: {
  bot: string;
  value: BotRule;
  onChange: (v: BotRule) => void;
}) {
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
            {opt}
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
}: {
  bots: (BotInfo & { kind?: AiBotKind })[];
  rules: Record<string, BotRule>;
  setRule: (bot: string, rule: BotRule) => void;
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
                  {KIND_LABEL[bot.kind]}
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
          />
        </li>
      ))}
    </ul>
  );
}

export function RobotsGenerator() {
  const [policy, setPolicy] = useState<DefaultPolicy>('custom');
  const [disallow, setDisallow] = useState<string[]>(['/wp-admin/']);
  const [allow, setAllow] = useState<string[]>(['/wp-admin/admin-ajax.php']);
  const [crawlDelay, setCrawlDelay] = useState('');
  const [bots, setBots] = useState<Record<string, BotRule>>({});
  const [sitemaps, setSitemaps] = useState<string[]>(['https://example.com/sitemap.xml']);

  const config = { policy, disallow, allow, crawlDelay, bots, sitemaps };
  const output = buildRobots(config);
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
    { value: 'allow', label: 'Allow all', hint: 'Crawl everything' },
    { value: 'disallow', label: 'Disallow all', hint: 'Block the whole site' },
    { value: 'custom', label: 'Custom', hint: 'Choose paths' },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-6">
        <ToolCard>
          <h2 className="font-title-md text-title-md text-on-surface">
            Rules for all robots (User-agent: *)
          </h2>
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
                <p className={labelClass}>Quick add common paths</p>
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
                label="Disallowed paths"
                hint="Start with / . Use * as a wildcard and $ to match the end of a URL."
                values={disallow}
                onChange={setDisallow}
                placeholder="/private/"
                invalid={(v) => !v.startsWith('/') && !v.startsWith('*')}
              />
              <ListEditor
                label="Allowed paths"
                hint="Exceptions inside a disallowed folder. The longest matching rule wins."
                values={allow}
                onChange={setAllow}
                placeholder="/private/public-page.html"
                invalid={(v) => !v.startsWith('/') && !v.startsWith('*')}
              />
            </div>
          ) : null}

          <div className="mt-5">
            <label htmlFor="crawl-delay" className={labelClass}>
              Crawl-delay in seconds (optional)
            </label>
            <input
              id="crawl-delay"
              type="number"
              min={0}
              max={120}
              inputMode="numeric"
              value={crawlDelay}
              onChange={(e) => setCrawlDelay(e.target.value)}
              placeholder="e.g. 5"
              className={`${inputClass} max-w-40`}
            />
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-2">
              Googlebot ignores Crawl-delay (Google adjusts its crawl rate automatically). Bing and
              Yandex respect it.
            </p>
          </div>
        </ToolCard>

        <ToolCard>
          <h2 className="font-title-md text-title-md text-on-surface">Search engine crawlers</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 mb-4">
            <strong>Default</strong> follows the * rules above. <strong>Allow</strong> gives the bot
            full access (it then ignores the * rules). <strong>Block</strong> disallows the whole
            site for that bot.
          </p>
          <BotTable bots={SEARCH_BOTS} rules={bots} setRule={setRule} />
        </ToolCard>

        <ToolCard>
          <h2 className="font-title-md text-title-md text-on-surface">AI crawlers</h2>
          <div className="font-body-sm text-body-sm text-on-surface-variant mt-1 space-y-2">
            <p>
              <strong>Training bots</strong> (GPTBot, ClaudeBot, Google-Extended, CCBot…) collect
              pages to train AI models. Blocking them does not affect your search rankings.
            </p>
            <p>
              <strong>AI search and user bots</strong> (OAI-SearchBot, Claude-SearchBot,
              PerplexityBot, ChatGPT-User…) fetch pages to show and cite them in AI answers.
              Blocking them can remove your site from ChatGPT, Claude or Perplexity answers and the
              traffic they send.
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              className={`${secondaryButtonClass} h-10 px-3`}
              onClick={() => setBots((b) => ({ ...b, ...presetRules('allow-all') }))}
            >
              Allow everything
            </button>
            <button
              type="button"
              className={`${secondaryButtonClass} h-10 px-3`}
              onClick={() => setBots((b) => ({ ...b, ...presetRules('block-training') }))}
            >
              Block AI training, allow AI search
            </button>
            <button
              type="button"
              className={`${secondaryButtonClass} h-10 px-3`}
              onClick={() => setBots((b) => ({ ...b, ...presetRules('block-ai') }))}
            >
              Block all AI bots
            </button>
          </div>
          <div className="mt-4">
            <BotTable bots={AI_BOTS} rules={bots} setRule={setRule} />
          </div>
        </ToolCard>

        <ToolCard>
          <ListEditor
            label="Sitemap URLs"
            hint="Full URLs, e.g. https://example.com/sitemap.xml. They are listed at the end of the file."
            values={sitemaps}
            onChange={setSitemaps}
            placeholder="https://example.com/sitemap.xml"
            invalid={(v) => !isAbsoluteUrl(v)}
          />
        </ToolCard>
      </div>

      <div className="lg:sticky lg:top-24 lg:self-start">
        <ToolCard>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-title-md text-title-md text-on-surface">Your robots.txt</h2>
            <div className="flex flex-wrap gap-2">
              <CopyButton text={output} />
              <DownloadButton text={output} filename="robots.txt" />
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

          <ul className="font-body-sm text-body-sm text-on-surface-variant mt-4 list-disc space-y-1 pl-5">
            <li>
              Save the file as <code>robots.txt</code> at the root of your domain (e.g.{' '}
              <code>https://example.com/robots.txt</code>
              ). Crawlers ignore it anywhere else, and each subdomain needs its own.
            </li>
            <li>
              robots.txt controls crawling, not indexing. A blocked URL can still appear in Google
              if other sites link to it. To keep a page out of results, use a <code>noindex</code>{' '}
              meta tag and leave it crawlable.
            </li>
          </ul>
        </ToolCard>
      </div>
    </div>
  );
}
