'use client';

import { useEffect, useMemo, useState } from 'react';
import { Icon } from '@/components/icon';
import {
  CopyButton,
  DownloadButton,
  ToolCard,
  inputClass,
  labelClass,
  secondaryButtonClass,
} from '@/components/tools/tool-ui';
import { buildSchema, toJson, toScriptTag } from './build';
import {
  DAYS,
  SCHEMA_TYPES,
  defaultDraft,
  exampleDraft,
  getSchemaType,
  newRow,
} from './schema-types';
import type { Draft, FieldDef, Level, RepeatDef, Row, SchemaTypeId } from './schema-types';
import { validateSchema } from './validate';
import type { Issue } from './validate';

const STORAGE_PREFIX = 'rys:schema-generator:v1:';
const TYPE_KEY = `${STORAGE_PREFIX}type`;

const smallButtonClass =
  'inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-border-subtle bg-surface-card px-3 font-label-sm text-label-sm text-on-surface transition hover:bg-surface-container-low focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-container';

const isTypeId = (s: unknown): s is SchemaTypeId =>
  typeof s === 'string' && SCHEMA_TYPES.some((t) => t.id === s);

/** Saved draft merged over defaults so config changes never break old drafts. */
function readDraft(type: SchemaTypeId): Draft | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + type);
    if (!raw) return null;
    const saved = JSON.parse(raw) as Partial<Draft>;
    const base = defaultDraft(type);
    const values = { ...base.values };
    for (const [k, v] of Object.entries(saved.values ?? {}))
      if (k in values && typeof v === 'string') values[k] = v;
    const lists = { ...base.lists };
    for (const [k, rows] of Object.entries(saved.lists ?? {}))
      if (k in lists && Array.isArray(rows)) lists[k] = rows as Row[];
    return { values, lists };
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    // Storage blocked or full: autosave is a convenience only.
  }
}

export function SchemaGenerator() {
  const [type, setType] = useState<SchemaTypeId>('LocalBusiness');
  const [drafts, setDrafts] = useState<Partial<Record<SchemaTypeId, Draft>>>({});
  const [restored, setRestored] = useState(false);

  // Restore saved drafts after hydration (localStorage is browser-only).
  useEffect(() => {
    const saved: Partial<Record<SchemaTypeId, Draft>> = {};
    for (const t of SCHEMA_TYPES) {
      const d = readDraft(t.id);
      if (d) saved[t.id] = d;
    }
    let savedType: string | null = null;
    try {
      savedType = window.localStorage.getItem(TYPE_KEY);
    } catch {
      savedType = null;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time restore from storage
    setDrafts(saved);
    if (isTypeId(savedType)) setType(savedType);
    setRestored(true);
  }, []);

  const draft = useMemo(() => drafts[type] ?? defaultDraft(type), [drafts, type]);

  useEffect(() => {
    if (!restored) return;
    writeStorage(TYPE_KEY, type);
    const d = drafts[type];
    if (d) writeStorage(STORAGE_PREFIX + type, JSON.stringify(d));
  }, [drafts, type, restored]);

  const json = useMemo(() => toJson(buildSchema(type, draft)), [type, draft]);
  const scriptTag = useMemo(() => toScriptTag(json), [json]);
  const issues = useMemo(() => validateSchema(type, draft), [type, draft]);

  const update = (fn: (d: Draft) => Draft) =>
    setDrafts((prev) => ({ ...prev, [type]: fn(prev[type] ?? defaultDraft(type)) }));

  const setValue = (key: string, value: string) =>
    update((d) => ({ ...d, values: { ...d.values, [key]: value } }));

  const setRows = (key: string, rows: Row[]) =>
    update((d) => ({ ...d, lists: { ...d.lists, [key]: rows } }));

  const reset = () => {
    writeStorage(STORAGE_PREFIX + type, null);
    setDrafts((prev) => ({ ...prev, [type]: defaultDraft(type) }));
  };

  const def = getSchemaType(type);

  return (
    <div className="flex flex-col gap-6">
      <ToolCard>
        <fieldset>
          <legend className={labelClass}>Schema type</legend>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {SCHEMA_TYPES.map((t) => {
              const active = t.id === type;
              return (
                <button
                  key={t.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setType(t.id)}
                  className={`focus-visible:outline-primary-container rounded-lg border px-3 py-2.5 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 ${
                    active
                      ? 'border-primary-container bg-brand-50 text-primary-container'
                      : 'border-border-subtle bg-surface-card text-on-surface hover:bg-surface-container-low'
                  }`}
                >
                  <span className="font-label-md text-label-md block">{t.label}</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 hidden sm:block">
                    {t.blurb}
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            className={secondaryButtonClass}
            onClick={() => setDrafts((prev) => ({ ...prev, [type]: exampleDraft(type) }))}
          >
            <Icon name="storefront" size={18} />
            Load example
          </button>
          <button type="button" className={secondaryButtonClass} onClick={reset}>
            <Icon name="close" size={18} />
            Reset
          </button>
          <p className="font-body-sm text-body-sm text-on-surface-variant self-center">
            Drafts autosave in this browser.
          </p>
        </div>
      </ToolCard>

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <ToolCard className="min-w-0">
          <h2 className="font-title-md text-title-md text-on-surface">{def.label} details</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            <span className="text-error">*</span> required ·{' '}
            <span className="text-badge-gold">◆</span> recommended by Google
          </p>
          {def.sections.map((section) => (
            <fieldset key={section.title} className="border-border-subtle mt-6 border-t pt-5">
              <legend className="font-label-md text-label-md text-secondary px-0 tracking-wide uppercase">
                {section.title}
              </legend>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                {section.fields.map((f) => {
                  if (f.kind === 'repeatable')
                    return (
                      <div key={f.key} className="sm:col-span-2">
                        <RepeatField
                          idBase={`sg-${type}-${f.key}`}
                          def={f}
                          rows={draft.lists[f.key] ?? []}
                          onChange={(rows) => setRows(f.key, rows)}
                        />
                      </div>
                    );
                  if (f.showIf && !f.showIf(draft.values)) return null;
                  const wide = f.kind === 'textarea' || f.kind === 'url';
                  return (
                    <div key={f.key} className={wide ? 'sm:col-span-2' : undefined}>
                      <Field
                        id={`sg-${type}-${f.key}`}
                        def={f}
                        value={draft.values[f.key] ?? ''}
                        onChange={(value) => setValue(f.key, value)}
                      />
                    </div>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </ToolCard>

        <div className="flex min-w-0 flex-col gap-6 lg:sticky lg:top-24">
          <ToolCard className="min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-title-md text-title-md text-on-surface">JSON-LD output</h2>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                {json.length.toLocaleString()} characters
              </span>
            </div>
            <pre
              tabIndex={0}
              aria-label="Generated JSON-LD"
              className="bg-inverse-surface text-inverse-on-surface mt-4 max-h-[28rem] overflow-auto rounded-lg p-4 font-mono text-xs leading-relaxed"
            >
              <code>{json}</code>
            </pre>
            <div className="mt-4 flex flex-wrap gap-2">
              <CopyButton text={json} label="Copy JSON" />
              <CopyButton text={scriptTag} label="Copy <script> tag" />
              <DownloadButton
                text={json}
                filename={`${type.toLowerCase()}-schema.json`}
                mime="application/ld+json"
                label="Download .json"
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
              <a
                href="https://search.google.com/test/rich-results"
                target="_blank"
                rel="noopener noreferrer"
                className="font-label-md text-label-md text-primary-container hover:text-primary inline-flex items-center gap-1"
              >
                Test in Google Rich Results Test <Icon name="north_east" size={16} />
              </a>
              <a
                href="https://validator.schema.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-label-md text-label-md text-primary-container hover:text-primary inline-flex items-center gap-1"
              >
                Schema.org validator <Icon name="north_east" size={16} />
              </a>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-3">
              Paste the script tag into the page&apos;s HTML (in the head or body), then run the
              test on the live URL or with the code snippet option.
            </p>
          </ToolCard>

          <ValidationPanel issues={issues} />
        </div>
      </div>
    </div>
  );
}

function LevelMark({ level }: { level?: Level }) {
  if (level === 'required')
    return (
      <span className="text-error ml-1" aria-hidden="true">
        *
      </span>
    );
  if (level === 'recommended')
    return (
      <span className="text-badge-gold ml-1" aria-hidden="true">
        ◆
      </span>
    );
  return null;
}

function levelText(level?: Level) {
  return level ? <span className="sr-only"> ({level})</span> : null;
}

const INPUT_TYPE: Partial<Record<FieldDef['kind'], string>> = {
  url: 'url',
  email: 'email',
  tel: 'tel',
  date: 'date',
  datetime: 'datetime-local',
  time: 'time',
};

function Field({
  id,
  def,
  value,
  onChange,
}: {
  id: string;
  def: FieldDef;
  value: string;
  onChange: (value: string) => void;
}) {
  const helpId = def.help ? `${id}-help` : undefined;

  if (def.kind === 'days') {
    const selected = new Set(
      value
        .split(',')
        .map((d) => d.trim())
        .filter(Boolean),
    );
    const setDays = (days: Iterable<string>) => {
      const set = new Set(days);
      onChange(DAYS.filter((d) => set.has(d)).join(','));
    };
    return (
      <fieldset>
        <legend className={labelClass}>
          {def.label}
          <LevelMark level={def.level} />
          {levelText(def.level)}
        </legend>
        <div className="flex flex-wrap gap-1.5">
          {DAYS.map((day) => {
            const on = selected.has(day);
            return (
              <label
                key={day}
                className={`font-label-sm text-label-sm has-focus-visible:outline-primary-container cursor-pointer rounded-md border px-2.5 py-1.5 select-none has-focus-visible:outline-2 ${
                  on
                    ? 'border-primary-container bg-primary-container text-on-primary'
                    : 'border-border-subtle bg-surface-card text-on-surface'
                }`}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={on}
                  onChange={() => {
                    const next = new Set(selected);
                    if (on) next.delete(day);
                    else next.add(day);
                    setDays(next);
                  }}
                />
                <span aria-hidden="true">{day.slice(0, 3)}</span>
                <span className="sr-only">{day}</span>
              </label>
            );
          })}
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <button
            type="button"
            className={smallButtonClass}
            onClick={() => setDays(DAYS.slice(0, 5))}
          >
            Mon–Fri
          </button>
          <button
            type="button"
            className={smallButtonClass}
            onClick={() => setDays(DAYS.slice(0, 6))}
          >
            Mon–Sat
          </button>
          <button type="button" className={smallButtonClass} onClick={() => setDays(DAYS)}>
            Every day
          </button>
        </div>
      </fieldset>
    );
  }

  const label = (
    <label htmlFor={id} className={labelClass}>
      {def.label}
      <LevelMark level={def.level} />
      {levelText(def.level)}
    </label>
  );
  const help = def.help ? (
    <p id={helpId} className="font-body-sm text-body-sm text-on-surface-variant mt-1.5">
      {def.help}
    </p>
  ) : null;

  let control;
  if (def.kind === 'select') {
    control = (
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-describedby={helpId}
        className={inputClass}
      >
        {def.options?.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    );
  } else if (def.kind === 'textarea') {
    control = (
      <textarea
        id={id}
        value={value}
        rows={3}
        placeholder={def.placeholder}
        onChange={(e) => onChange(e.target.value)}
        aria-describedby={helpId}
        aria-required={def.level === 'required' || undefined}
        className={inputClass}
      />
    );
  } else {
    control = (
      <input
        id={id}
        type={INPUT_TYPE[def.kind] ?? 'text'}
        inputMode={def.kind === 'number' ? 'decimal' : undefined}
        value={value}
        placeholder={def.placeholder}
        onChange={(e) => onChange(e.target.value)}
        aria-describedby={helpId}
        aria-required={def.level === 'required' || undefined}
        autoComplete="off"
        spellCheck={def.kind === 'text' || undefined}
        className={`${inputClass} min-w-0`}
      />
    );
  }

  return (
    <div>
      {label}
      {control}
      {help}
    </div>
  );
}

function RepeatField({
  idBase,
  def,
  rows,
  onChange,
}: {
  idBase: string;
  def: RepeatDef;
  rows: Row[];
  onChange: (rows: Row[]) => void;
}) {
  const setCell = (i: number, key: string, value: string) =>
    onChange(rows.map((r, j) => (j === i ? { ...r, [key]: value } : r)));
  const move = (i: number, dir: -1 | 1) => {
    const next = [...rows];
    [next[i], next[i + dir]] = [next[i + dir], next[i]];
    onChange(next);
  };
  const single = def.fields.length === 1;

  return (
    <div>
      <p className="font-label-md text-label-md text-on-surface">
        {def.label}
        <LevelMark level={def.level} />
        {levelText(def.level)}
      </p>
      {def.help ? (
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{def.help}</p>
      ) : null}
      <ol className="mt-3 flex flex-col gap-3">
        {rows.map((row, i) => (
          <li
            key={i}
            className="border-border-subtle bg-surface-container-low/40 rounded-lg border p-3"
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="font-label-sm text-label-sm text-secondary">
                {def.itemLabel} {i + 1}
              </span>
              <div className="flex gap-1">
                {rows.length > 1 && !single ? (
                  <>
                    <button
                      type="button"
                      className={smallButtonClass}
                      disabled={i === 0}
                      onClick={() => move(i, -1)}
                      aria-label={`Move ${def.itemLabel.toLowerCase()} ${i + 1} up`}
                    >
                      <Icon name="expand_more" size={16} className="rotate-180" />
                    </button>
                    <button
                      type="button"
                      className={smallButtonClass}
                      disabled={i === rows.length - 1}
                      onClick={() => move(i, 1)}
                      aria-label={`Move ${def.itemLabel.toLowerCase()} ${i + 1} down`}
                    >
                      <Icon name="expand_more" size={16} />
                    </button>
                  </>
                ) : null}
                <button
                  type="button"
                  className={smallButtonClass}
                  onClick={() => onChange(rows.filter((_, j) => j !== i))}
                  aria-label={`Remove ${def.itemLabel.toLowerCase()} ${i + 1}`}
                >
                  <Icon name="close" size={16} />
                </button>
              </div>
            </div>
            <div className={`grid gap-3 ${def.fields.length > 2 ? 'sm:grid-cols-2' : ''}`}>
              {def.fields.map((f) => (
                <div
                  key={f.key}
                  className={f.kind === 'days' || f.kind === 'textarea' ? 'sm:col-span-2' : ''}
                >
                  <Field
                    id={`${idBase}-${i}-${f.key}`}
                    def={f}
                    value={row[f.key] ?? ''}
                    onChange={(value) => setCell(i, f.key, value)}
                  />
                </div>
              ))}
            </div>
          </li>
        ))}
      </ol>
      <button
        type="button"
        className={`${smallButtonClass} mt-3`}
        onClick={() => onChange([...rows, newRow(def)])}
      >
        <Icon name="add_circle" size={16} />
        {def.addLabel}
      </button>
    </div>
  );
}

const ISSUE_STYLE: Record<Issue['level'], { icon: 'error' | 'report' | 'verified'; cls: string }> =
  {
    error: { icon: 'error', cls: 'text-error' },
    warning: { icon: 'report', cls: 'text-badge-gold' },
    info: { icon: 'verified', cls: 'text-tertiary' },
  };

function ValidationPanel({ issues }: { issues: Issue[] }) {
  const errors = issues.filter((i) => i.level === 'error').length;
  const warnings = issues.filter((i) => i.level === 'warning').length;
  return (
    <ToolCard className="min-w-0">
      <h2 className="font-title-md text-title-md text-on-surface">Validation</h2>
      <div aria-live="polite">
        <p
          className={`font-label-md text-label-md mt-2 inline-flex items-center gap-1.5 ${
            errors ? 'text-error' : 'text-primary-container'
          }`}
        >
          <Icon name={errors ? 'error' : 'check_circle'} size={18} />
          {errors
            ? `${errors} error${errors === 1 ? '' : 's'}, ${warnings} warning${warnings === 1 ? '' : 's'}`
            : warnings
              ? `No errors · ${warnings} recommended field${warnings === 1 ? '' : 's'} missing`
              : 'No errors or warnings'}
        </p>
        {issues.length ? (
          <ul className="mt-3 flex flex-col gap-2">
            {issues.map((issue, i) => {
              const style = ISSUE_STYLE[issue.level];
              return (
                <li
                  key={`${issue.level}-${i}`}
                  className="font-body-sm text-body-sm text-on-surface flex gap-2"
                >
                  <Icon name={style.icon} size={18} className={`${style.cls} mt-0.5 shrink-0`} />
                  <span>
                    <span className="sr-only">{issue.level}: </span>
                    {issue.message}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </ToolCard>
  );
}
