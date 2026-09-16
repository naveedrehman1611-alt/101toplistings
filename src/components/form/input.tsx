import type { ComponentPropsWithoutRef } from 'react';
import {
  controlClass,
  describedBy,
  errorRingClass,
  Field,
  fieldIds,
  hasError,
  type FieldErrors,
} from './field';

export type InputType =
  'text' | 'email' | 'url' | 'tel' | 'number' | 'time' | 'date' | 'password' | 'search';

type NativeInputProps = Omit<
  ComponentPropsWithoutRef<'input'>,
  'id' | 'name' | 'type' | 'className' | 'aria-invalid' | 'aria-describedby' | 'aria-required'
>;

export function Input({
  name,
  label,
  type = 'text',
  id,
  hint,
  error,
  required,
  className,
  ...rest
}: {
  name: string;
  label: string;
  type?: InputType;
  id?: string;
  hint?: string;
  error?: FieldErrors;
  required?: boolean;
  className?: string;
} & NativeInputProps) {
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
      <input
        {...rest}
        id={ids.id}
        name={name}
        type={type}
        required={required}
        aria-required={required || undefined}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy([hint && ids.hintId, invalid && ids.errorId])}
        className={`h-11 ${controlClass} ${invalid ? errorRingClass : ''}`}
      />
    </Field>
  );
}
