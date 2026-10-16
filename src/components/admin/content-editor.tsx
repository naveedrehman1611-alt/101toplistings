'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { ICON_NAMES, Icon, isIconName } from '@/components/icon';
import {
  TEXTAREA_MAX,
  TEXT_MAX,
  type Field,
  type Fields,
  type ListField,
  type ScalarField,
  type StoredImage,
} from '@/lib/content/schema';
import { MarkdownEditor } from './markdown-editor';
import type { MediaOption } from './media-select';

type Values = Record<string, unknown>;

const inputCls =
  'mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm outline-hidden focus:border-primary-container focus:ring-2 focus:ring-primary-container/20';
const smallBtn =
  'h-8 rounded-md border border-[var(--border)] px-2.5 text-xs hover:bg-[var(--surface-2)] disabled:opacity-40';

function Label({ field, htmlFor }: { field: Field; htmlFor?: string }) {
  return (
    <>
      <label htmlFor={htmlFor} className="block text-sm font-medium">
        {field.label}
      </label>
      {field.hint ? <p className="mt-0.5 text-xs text-[var(--text-muted)]">{field.hint}</p> : null}
    </>
  );
}

function ImageInput({
  id,
  field,
  value,
  media,
  onChange,
}: {
  id: string;
  field: Extract<ScalarField, { kind: 'image' }>;
  value: StoredImage;
  media: MediaOption[];
  onChange: (v: StoredImage) => void;
}) {
  const chosen = value.media_id ? media.find((m) => m.id === value.media_id) : undefined;
  const preview = chosen?.url ?? (value.media_id ? null : field.default.src);
  return (
    <div>
      <Label field={field} htmlFor={`${id}-media`} />
      <div className="mt-2 flex flex-wrap items-start gap-3">
        {preview ? (
          // A plain img: previews come from Storage or /public and need no optimising here.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt=""
            className="h-24 w-36 shrink-0 rounded-md border border-[var(--border)] object-cover"
          />
        ) : (
          <span className="flex h-24 w-36 shrink-0 items-center justify-center rounded-md bg-[var(--surface-2)] text-xs text-[var(--text-muted)]">
            No preview
          </span>
        )}
        <div className="min-w-0 flex-1 space-y-2">
          <select
            id={`${id}-media`}
            value={value.media_id ?? ''}
            onChange={(e) => onChange({ ...value, media_id: e.target.value || null })}
            className={`${inputCls} h-10`}
          >
            <option value="">Original image ({field.default.src.split('/').pop()})</option>
            {value.media_id && !chosen ? (
              <option value={value.media_id}>Saved image (not in the list)</option>
            ) : null}
            {media.map((m) => (
              <option key={m.id} value={m.id}>
                {m.alt?.trim() ? `${m.alt} (${m.url.split('/').pop()})` : m.url.split('/').pop()}
              </option>
            ))}
          </select>
          <label className="block text-xs font-medium" htmlFor={`${id}-alt`}>
            Alt text
          </label>
          <input
            id={`${id}-alt`}
            value={value.alt}
            maxLength={300}
            onChange={(e) => onChange({ ...value, alt: e.target.value })}
            placeholder={chosen?.alt ?? 'Describe the image for screen readers and search engines'}
            className={`${inputCls} h-10`}
          />
          <a href="/admin/media" target="_blank" className="text-brand-700 text-xs hover:underline">
            Upload a new image in Media (opens a new tab, then reload this page)
          </a>
        </div>
      </div>
    </div>
  );
}

function ScalarInput({
  id,
  field,
  value,
  media,
  mountKey,
  onChange,
}: {
  id: string;
  field: ScalarField;
  value: unknown;
  media: MediaOption[];
  /**
   * The markdown editor is uncontrolled: it reads `value` only when it mounts.
   * Whatever replaces the value from outside (reset, reordering a list) must
   * change this key so the editor remounts with the new text.
   */
  mountKey: string;
  onChange: (v: unknown) => void;
}) {
  if ((field.kind === 'text' || field.kind === 'textarea') && field.markdown) {
    const text = value as string;
    const single = field.kind === 'text';
    return (
      <MarkdownEditor
        key={mountKey}
        label={field.label}
        hint={field.hint}
        defaultValue={text}
        inline={field.markdown === 'inline'}
        maxLength={field.max ?? (single ? TEXT_MAX : TEXTAREA_MAX)}
        rows={single ? 2 : Math.min(12, Math.max(4, text.split('\n').length + 1))}
        // A text field is one line, so line breaks typed into the textarea become spaces.
        onChange={(v) => onChange(single ? v.replace(/\s*\n\s*/g, ' ') : v)}
      />
    );
  }
  switch (field.kind) {
    case 'text':
      return (
        <div>
          <Label field={field} htmlFor={id} />
          <input
            id={id}
            value={value as string}
            maxLength={field.max ?? 300}
            onChange={(e) => onChange(e.target.value)}
            className={`${inputCls} h-10`}
          />
        </div>
      );
    case 'textarea':
      return (
        <div>
          <Label field={field} htmlFor={id} />
          <textarea
            id={id}
            value={value as string}
            maxLength={field.max ?? 5000}
            rows={Math.min(12, Math.max(3, (value as string).split('\n').length + 1))}
            onChange={(e) => onChange(e.target.value)}
            className={`${inputCls} py-2`}
          />
        </div>
      );
    case 'boolean':
      return (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={value as boolean}
            onChange={(e) => onChange(e.target.checked)}
          />
          <span className="font-medium">{field.label}</span>
          {field.hint ? (
            <span className="text-xs text-[var(--text-muted)]">{field.hint}</span>
          ) : null}
        </label>
      );
    case 'icon': {
      const name = value as string;
      return (
        <div>
          <Label field={field} htmlFor={id} />
          <div className="mt-1 flex items-center gap-2">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-2)]">
              {isIconName(name) ? <Icon name={name} size={22} /> : null}
            </span>
            <select
              id={id}
              value={name}
              onChange={(e) => onChange(e.target.value)}
              className={`${inputCls} mt-0 h-10`}
            >
              {ICON_NAMES.map((n) => (
                <option key={n} value={n}>
                  {n.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>
      );
    }
    case 'link': {
      const l = value as { label: string; href: string };
      return (
        <fieldset>
          <legend className="text-sm font-medium">{field.label}</legend>
          {field.hint ? <p className="text-xs text-[var(--text-muted)]">{field.hint}</p> : null}
          <div className="mt-1 grid gap-2 sm:grid-cols-2">
            <label className="text-xs">
              Text
              <input
                value={l.label}
                maxLength={300}
                onChange={(e) => onChange({ ...l, label: e.target.value })}
                className={`${inputCls} h-10`}
              />
            </label>
            <label className="text-xs">
              Link to (/path on this site, or https://…)
              <input
                value={l.href}
                maxLength={2000}
                onChange={(e) => onChange({ ...l, href: e.target.value })}
                className={`${inputCls} h-10`}
              />
            </label>
          </div>
        </fieldset>
      );
    }
    case 'image':
      return (
        <ImageInput
          id={id}
          field={field}
          value={value as StoredImage}
          media={media}
          onChange={onChange}
        />
      );
  }
}

function ListInput({
  id,
  field,
  value,
  media,
  mountKey,
  onChange,
}: {
  id: string;
  field: ListField;
  value: Values[];
  media: MediaOption[];
  mountKey: string;
  onChange: (v: Values[]) => void;
}) {
  // Items are keyed by index, so moving or deleting one shifts values under
  // the uncontrolled markdown editors; bumping this remounts them with the
  // new values. Adding goes on the end, a fresh index, so it needs no bump.
  const [shuffles, setShuffles] = useState(0);
  const restructure = (next: Values[]) => {
    setShuffles((n) => n + 1);
    onChange(next);
  };
  const blank = (): Values => {
    const out: Values = {};
    for (const [k, sub] of Object.entries(field.item)) {
      out[k] = sub.kind === 'image' ? { media_id: null, alt: '' } : sub.default;
    }
    return out;
  };
  const move = (from: number, to: number) => {
    const next = [...value];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    restructure(next);
  };
  return (
    <fieldset>
      <legend className="text-sm font-medium">{field.label}</legend>
      {field.hint ? <p className="text-xs text-[var(--text-muted)]">{field.hint}</p> : null}
      <ol className="mt-2 space-y-3">
        {value.map((item, i) => (
          <li key={i} className="rounded-lg border border-[var(--border)] p-3">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-[var(--text-muted)] uppercase">
                {field.noun} {i + 1}
              </span>
              <span className="flex gap-1.5">
                <button
                  type="button"
                  className={smallBtn}
                  disabled={i === 0}
                  onClick={() => move(i, i - 1)}
                >
                  ↑ Up
                </button>
                <button
                  type="button"
                  className={smallBtn}
                  disabled={i === value.length - 1}
                  onClick={() => move(i, i + 1)}
                >
                  ↓ Down
                </button>
                <button
                  type="button"
                  className={`${smallBtn} text-error`}
                  onClick={() => restructure(value.filter((_, j) => j !== i))}
                >
                  Delete
                </button>
              </span>
            </div>
            <div className="space-y-3">
              {Object.entries(field.item).map(([k, sub]) => (
                <ScalarInput
                  key={k}
                  id={`${id}-${i}-${k}`}
                  field={sub}
                  value={item[k]}
                  media={media}
                  mountKey={`${mountKey}-${shuffles}-${i}`}
                  onChange={(v) =>
                    onChange(value.map((it, j) => (j === i ? { ...it, [k]: v } : it)))
                  }
                />
              ))}
            </div>
          </li>
        ))}
      </ol>
      <button
        type="button"
        className={`${smallBtn} mt-3`}
        disabled={value.length >= field.max}
        onClick={() => onChange([...value, blank()])}
      >
        + Add {field.noun}
      </button>
      {value.length >= field.max ? (
        <span className="ml-2 text-xs text-[var(--text-muted)]">At most {field.max}.</span>
      ) : null}
    </fieldset>
  );
}

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-brand-700 hover:bg-brand-800 h-10 rounded-lg px-5 text-sm font-medium text-white disabled:opacity-50"
    >
      {pending ? 'Saving…' : 'Save'}
    </button>
  );
}

/**
 * The form for one content section, generated from its field spec. Values
 * live in state and post as one JSON field, which the save action checks
 * field by field against the same spec.
 */
export function ContentEditor({
  fields,
  initial,
  defaults,
  hideable,
  visible,
  media,
  action,
}: {
  fields: Fields;
  initial: Values;
  defaults: Values;
  hideable: boolean;
  visible: boolean;
  media: MediaOption[];
  action: (fd: FormData) => Promise<void>;
}) {
  const [values, setValues] = useState<Values>(initial);
  // Bumped when every value is replaced at once, to remount uncontrolled editors.
  const [resets, setResets] = useState(0);
  const set = (k: string, v: unknown) => setValues((prev) => ({ ...prev, [k]: v }));

  return (
    <form action={action} className="mt-6 space-y-5">
      <input type="hidden" name="data" value={JSON.stringify(values)} />
      {hideable ? (
        <label className="surface-card flex items-center gap-2 p-4 text-sm">
          <input type="checkbox" name="visible" defaultChecked={visible} />
          <span className="font-medium">Show this section on the page</span>
        </label>
      ) : null}
      <div className="surface-card space-y-5 p-5">
        {Object.entries(fields).map(([k, field]) =>
          field.kind === 'list' ? (
            <ListInput
              key={k}
              id={`f-${k}`}
              field={field}
              value={values[k] as Values[]}
              media={media}
              mountKey={String(resets)}
              onChange={(v) => set(k, v)}
            />
          ) : (
            <ScalarInput
              key={k}
              id={`f-${k}`}
              field={field}
              value={values[k]}
              media={media}
              mountKey={String(resets)}
              onChange={(v) => set(k, v)}
            />
          ),
        )}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <SaveButton />
        <button
          type="button"
          className="h-10 rounded-lg border border-[var(--border)] px-4 text-sm hover:bg-[var(--surface-2)]"
          onClick={() => {
            setValues(defaults);
            setResets((n) => n + 1);
          }}
        >
          Fill in the original content
        </button>
        <span className="text-xs text-[var(--text-muted)]">
          Nothing changes on the site until you save.
        </span>
      </div>
    </form>
  );
}
