import {
  describedBy,
  Field,
  fieldIds,
  focusRingClass,
  hasError,
  type FieldErrors,
  type Option,
} from './field';

export function RadioGroup({
  name,
  label,
  options,
  defaultValue,
  id,
  hint,
  error,
  required,
  columns = 1,
  disabled,
  className,
}: {
  name: string;
  label: string;
  options: Option[];
  defaultValue?: string;
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
      <div
        role="radiogroup"
        aria-label={label}
        aria-required={required || undefined}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy([hint && ids.hintId, invalid && ids.errorId])}
        className={`grid grid-cols-1 gap-x-4 gap-y-2.5 ${gridClass}`}
      >
        {options.map((option, index) => {
          const optionId = `${ids.id}-${option.value.replace(/[^A-Za-z0-9_-]+/g, '-')}`;
          return (
            <div key={option.value} className="flex items-start gap-2.5">
              <input
                id={optionId}
                name={name}
                type="radio"
                value={option.value}
                defaultChecked={defaultValue === option.value}
                disabled={disabled || option.disabled}
                required={required && index === 0}
                className={`accent-brand-700 mt-0.5 size-5 shrink-0 border-[var(--border)] ${focusRingClass} disabled:cursor-not-allowed`}
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
