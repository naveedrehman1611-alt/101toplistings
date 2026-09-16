import type { ReactNode } from 'react';

/* Shared plumbing for every control in this folder. Nothing here needs client
   JavaScript: a Field is just a <label>/<legend>, a hint and an error message,
   all wired together by id so a plain <form action={serverAction}> post works
   with JS disabled (see node_modules/next/dist/docs/01-app/02-guides/forms.md —
   errors come back from useActionState as plain strings, so `error` accepts the
   exact `string | string[]` shape of a flattened zod fieldErrors entry). */

export type FieldErrors = string | string[];

/** One entry in a Select, CheckboxGroup or RadioGroup. */
export type Option = {
  value: string;
  label: string;
  hint?: string;
  disabled?: boolean;
};

/** The palette has no danger ramp, so validation red is the only non-token colour. */
export const errorTextClass = 'text-red-700';
export const errorRingClass = 'border-red-600 focus:outline-red-600';

/** Stable, deterministic ids so server and client markup agree without useId(). */
export function fieldIds(name: string, id?: string) {
  const base = id ?? name.replace(/[^A-Za-z0-9_-]+/g, '-');
  return { id: base, hintId: `${base}-hint`, errorId: `${base}-error` };
}

/** Empty strings and empty arrays are "no error". */
export function toMessages(error?: FieldErrors): string[] {
  if (!error) return [];
  return (Array.isArray(error) ? error : [error]).filter((m) => m.trim().length > 0);
}

export function hasError(error?: FieldErrors): boolean {
  return toMessages(error).length > 0;
}

/** Joins the ids the control should point `aria-describedby` at. */
export function describedBy(parts: (string | false | undefined)[]): string | undefined {
  const ids = parts.filter((p): p is string => typeof p === 'string' && p.length > 0);
  return ids.length > 0 ? ids.join(' ') : undefined;
}

export function RequiredMark() {
  return (
    <span aria-hidden className={`ml-0.5 ${errorTextClass}`}>
      *
    </span>
  );
}

export function FieldHint({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} className="text-xs text-[var(--text-muted)]">
      {children}
    </p>
  );
}

export function FieldError({ id, error }: { id: string; error?: FieldErrors }) {
  const messages = toMessages(error);
  if (messages.length === 0) return null;
  return (
    <p id={id} role="alert" className={`text-xs font-medium ${errorTextClass}`}>
      {messages.join(' ')}
    </p>
  );
}

/** Label + hint + error shell. Pass `htmlFor` for a single control; omit it for a
    group of controls and the shell becomes a <fieldset> with a <legend>. */
export function Field({
  label,
  htmlFor,
  hintId,
  errorId,
  hint,
  error,
  required,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  hintId?: string;
  errorId?: string;
  hint?: string;
  error?: FieldErrors;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  const resolvedHintId = hintId ?? (htmlFor ? `${htmlFor}-hint` : undefined);
  const resolvedErrorId = errorId ?? (htmlFor ? `${htmlFor}-error` : undefined);
  const labelText = (
    <>
      {label}
      {required ? <RequiredMark /> : null}
    </>
  );
  const body = (
    <>
      {hint && resolvedHintId ? <FieldHint id={resolvedHintId}>{hint}</FieldHint> : null}
      {children}
      {resolvedErrorId ? <FieldError id={resolvedErrorId} error={error} /> : null}
    </>
  );
  const labelClass = 'text-sm font-medium text-[var(--text)]';
  const wrapperClass = `flex flex-col gap-1.5 ${className ?? ''}`.trim();

  if (!htmlFor) {
    return (
      <fieldset className={wrapperClass}>
        <legend className={`mb-1.5 ${labelClass}`}>{labelText}</legend>
        {body}
      </fieldset>
    );
  }
  return (
    <div className={wrapperClass}>
      <label htmlFor={htmlFor} className={labelClass}>
        {labelText}
      </label>
      {body}
    </div>
  );
}

/** Base look for the box-shaped controls (input, textarea, select).
    text-base on mobile keeps iOS from zooming on focus; 14px from sm up. */
export const controlClass =
  'w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-base ' +
  'text-[var(--text)] placeholder:text-ink-400 transition-colors ' +
  'hover:border-ink-300 focus:outline-2 focus:outline-offset-2 focus:outline-brand-700 ' +
  'disabled:cursor-not-allowed disabled:bg-[var(--surface-2)] disabled:text-[var(--text-muted)] ' +
  'sm:text-sm';

/** Focus ring shared by the tick-box style controls. */
export const focusRingClass =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700';
