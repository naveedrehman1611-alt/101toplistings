import type { ComponentPropsWithoutRef } from 'react';
import {
  controlClass,
  describedBy,
  errorRingClass,
  Field,
  fieldIds,
  hasError,
  type FieldErrors,
  type Option,
} from './field';

type NativeSelectProps = Omit<
  ComponentPropsWithoutRef<'select'>,
  'id' | 'name' | 'className' | 'children' | 'aria-invalid' | 'aria-describedby' | 'aria-required'
>;

export function Select({
  name,
  label,
  options,
  id,
  hint,
  error,
  required,
  placeholder,
  className,
  ...rest
}: {
  name: string;
  label: string;
  options: Option[];
  id?: string;
  hint?: string;
  error?: FieldErrors;
  required?: boolean;
  /** Empty first entry, e.g. "Choose a category". Selected when there is no defaultValue. */
  placeholder?: string;
  className?: string;
} & NativeSelectProps) {
  const ids = fieldIds(name, id);
  const invalid = hasError(error);
  return (
    <Field
      label={label}
      htmlFor={ids.id}
      hintId={ids.hintId}
      errorId={ids.errorId}
      hint={hint}
      error={error}
      required={required}
      className={className}
    >
      <div className="relative">
        <select
          {...rest}
          id={ids.id}
          name={name}
          required={required}
          aria-required={required || undefined}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy([hint && ids.hintId, invalid && ids.errorId])}
          className={`h-11 appearance-none pr-9 ${controlClass} ${invalid ? errorRingClass : ''}`}
        >
          {placeholder ? <option value="">{placeholder}</option> : null}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        <span
          aria-hidden
          className="text-ink-400 pointer-events-none absolute inset-y-0 right-3 flex items-center"
        >
          ▾
        </span>
      </div>
    </Field>
  );
}
