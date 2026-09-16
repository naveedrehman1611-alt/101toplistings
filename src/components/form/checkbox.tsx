import type { ComponentPropsWithoutRef } from 'react';
import {
  describedBy,
  errorRingClass,
  Field,
  FieldError,
  fieldIds,
  focusRingClass,
  hasError,
  type FieldErrors,
  type Option,
} from './field';

const boxClass = `size-5 shrink-0 rounded border border-[var(--border)] accent-brand-700 ${focusRingClass} disabled:cursor-not-allowed`;

type NativeCheckboxProps = Omit<
  ComponentPropsWithoutRef<'input'>,
  'id' | 'name' | 'type' | 'className' | 'aria-invalid' | 'aria-describedby' | 'aria-required'
>;

/** A single checkbox. Unchecked boxes post nothing, so read it with
    `formData.get(name) === 'on'` (or pass an explicit `value`). */
export function Checkbox({
  name,
  label,
  id,
  hint,
  error,
  required,
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
} & NativeCheckboxProps) {
  const ids = fieldIds(name, id);
  const invalid = hasError(error);
  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ''}`.trim()}>
      <div className="flex items-start gap-2.5">
        <input
          {...rest}
          id={ids.id}
          name={name}
          type="checkbox"
          required={required}
          aria-required={required || undefined}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy([hint && ids.hintId, invalid && ids.errorId])}
          className={`mt-0.5 ${boxClass} ${invalid ? errorRingClass : ''}`}
        />
        <label htmlFor={ids.id} className="text-sm text-[var(--text)]">
          {label}
          {required ? (
            <span aria-hidden className="ml-0.5 text-red-700">
              *
            </span>
          ) : null}
          {hint ? (
            <span id={ids.hintId} className="mt-0.5 block text-xs text-[var(--text-muted)]">
              {hint}
            </span>
          ) : null}
        </label>
      </div>
      <FieldError id={ids.errorId} error={error} />
    </div>
  );
}

/** A grid of checkboxes posting the same `name` — read with `formData.getAll(name)`. */
export function CheckboxGroup({
  name,
  label,
  options,
  defaultValue = [],
  id,
  hint,
  error,
  required,
  columns = 2,
  disabled,
  className,
}: {
  name: string;
  label: string;
  options: Option[];
  defaultValue?: string[];
  id?: string;
  hint?: string;
  error?: FieldErrors;
  required?: boolean;
  columns?: 1 | 2 | 3;
  disabled?: boolean;
  className?: string;
}) {
  const ids = fieldIds(name, id);
  const invalid = hasError(error);
  const gridClass =
    columns === 1 ? 'grid-cols-1' : columns === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2';
  return (
    <Field
      label={label}
      hintId={ids.hintId}
      errorId={ids.errorId}
      hint={hint}
      error={error}
      required={required}
      className={className}
    >
      <div role="group" className={`grid grid-cols-1 gap-x-4 gap-y-2.5 ${gridClass}`}>
        {options.map((option) => {
          const optionId = `${ids.id}-${option.value.replace(/[^A-Za-z0-9_-]+/g, '-')}`;
          return (
            <div key={option.value} className="flex items-start gap-2.5">
              <input
                id={optionId}
                name={name}
                type="checkbox"
                value={option.value}
                defaultChecked={defaultValue.includes(option.value)}
                disabled={disabled || option.disabled}
                aria-invalid={invalid || undefined}
                aria-describedby={describedBy([hint && ids.hintId, invalid && ids.errorId])}
                className={`mt-0.5 ${boxClass}`}
              />
              <label htmlFor={optionId} className="text-sm text-[var(--text)]">
                {option.label}
                {option.hint ? (
                  <span className="mt-0.5 block text-xs text-[var(--text-muted)]">
                    {option.hint}
                  </span>
                ) : null}
              </label>
            </div>
          );
        })}
      </div>
    </Field>
  );
}
