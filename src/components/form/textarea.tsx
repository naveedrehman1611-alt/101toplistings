'use client';

/* Client only because of the live character counter. The control itself is still
   uncontrolled — `defaultValue` + `name` — so the form posts fine without JS and
   the counter simply never updates. */

import { useState, type ChangeEvent, type ComponentPropsWithoutRef } from 'react';
import {
  controlClass,
  describedBy,
  errorRingClass,
  errorTextClass,
  Field,
  fieldIds,
  hasError,
  type FieldErrors,
} from './field';

type NativeTextareaProps = Omit<
  ComponentPropsWithoutRef<'textarea'>,
  'id' | 'name' | 'className' | 'aria-invalid' | 'aria-describedby' | 'aria-required' | 'onChange'
>;

export function Textarea({
  name,
  label,
  id,
  hint,
  error,
  required,
  rows = 4,
  maxLength,
  showCount = false,
  defaultValue,
  onChange,
  className,
  ...rest
}: {
  name: string;
  label: string;
  id?: string;
  hint?: string;
  error?: FieldErrors;
  required?: boolean;
  /** Renders a live "123 / 400" counter under the control. */
  showCount?: boolean;
  onChange?: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  className?: string;
} & NativeTextareaProps) {
  const ids = fieldIds(name, id);
  const invalid = hasError(error);
  const countId = `${ids.id}-count`;
  const [count, setCount] = useState(() => String(defaultValue ?? '').length);
  const over = typeof maxLength === 'number' && count > maxLength;

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
      <textarea
        {...rest}
        id={ids.id}
        name={name}
        rows={rows}
        maxLength={maxLength}
        defaultValue={defaultValue}
        required={required}
        aria-required={required || undefined}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy([
          hint && ids.hintId,
          invalid && ids.errorId,
          showCount && countId,
        ])}
        onChange={(event) => {
          if (showCount) setCount(event.currentTarget.value.length);
          onChange?.(event);
        }}
        className={`min-h-24 py-2.5 ${controlClass} ${invalid ? errorRingClass : ''}`}
      />
      {showCount ? (
        <p
          id={countId}
          aria-live="polite"
          className={`text-right text-xs tabular-nums ${
            over ? errorTextClass : 'text-[var(--text-muted)]'
          }`}
        >
          {count}
          {typeof maxLength === 'number' ? ` / ${maxLength}` : ''} characters
        </p>
      ) : null}
    </Field>
  );
}
