import type { ComponentPropsWithoutRef } from 'react';
import { describedBy, FieldError, fieldIds, hasError, type FieldErrors } from './field';

type NativeSwitchProps = Omit<
  ComponentPropsWithoutRef<'input'>,
  'id' | 'name' | 'type' | 'className' | 'aria-invalid' | 'aria-describedby' | 'aria-required'
>;

/** Boolean toggle. It is a real checkbox underneath — no JavaScript, no client
    state — so it posts `on` when checked and nothing when it is not. */
export function Switch({
  name,
  label,
  id,
  hint,
  error,
  required,
  disabled,
  className,
  ...rest
}: {
  name: string;
  label: string;
  id?: string;
  hint?: string;
  error?: FieldErrors;
  required?: boolean;
  className?: string;
} & NativeSwitchProps) {
  const ids = fieldIds(name, id);
  const invalid = hasError(error);
  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ''}`.trim()}>
      <div className="flex items-center justify-between gap-4">
        <label htmlFor={ids.id} className="text-sm font-medium text-[var(--text)]">
          {label}
          {required ? (
            <span aria-hidden className="ml-0.5 text-red-700">
              *
            </span>
          ) : null}
          {hint ? (
            <span
              id={ids.hintId}
              className="mt-0.5 block text-xs font-normal text-[var(--text-muted)]"
            >
              {hint}
            </span>
          ) : null}
        </label>
        <span className="relative inline-flex shrink-0 items-center">
          <input
            {...rest}
            id={ids.id}
            name={name}
            type="checkbox"
            role="switch"
            required={required}
            disabled={disabled}
            aria-required={required || undefined}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy([hint && ids.hintId, invalid && ids.errorId])}
            className="peer sr-only"
          />
          <span
            aria-hidden
            className="bg-ink-300 peer-checked:bg-brand-700 peer-focus-visible:outline-brand-700 block h-6 w-11 cursor-pointer rounded-full transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 motion-reduce:transition-none"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute left-0.5 size-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5 motion-reduce:transition-none"
          />
        </span>
      </div>
      <FieldError id={ids.errorId} error={error} />
    </div>
  );
}
