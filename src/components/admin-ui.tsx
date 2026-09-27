import type { ReactNode } from 'react';

/** Renders the ?ok= / ?error= outcome that admin form actions redirect back with. */
export function Notice({ ok, error }: { ok?: string; error?: string }) {
  if (error) {
    return (
      <p
        role="alert"
        className="mt-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800"
      >
        {error}
      </p>
    );
  }
  if (ok) {
    return (
      <p
        role="status"
        className="border-brand-500/40 bg-brand-50 text-brand-800 mt-4 rounded-lg border px-4 py-3 text-sm"
      >
        {ok}
      </p>
    );
  }
  return null;
}

const inputCls =
  'mt-1 h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm outline-none focus:border-brand-500';

export function Field({
  label,
  name,
  defaultValue,
  required,
  type = 'text',
  placeholder,
  hint,
  step,
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  required?: boolean;
  type?: string;
  placeholder?: string;
  hint?: string;
  step?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="font-medium">
        {label}
        {required ? <span className="text-red-700"> *</span> : null}
      </span>
      <input
        name={name}
        type={type}
        step={step}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue ?? ''}
        className={inputCls}
      />
      {hint ? <span className="mt-1 block text-xs text-[var(--text-muted)]">{hint}</span> : null}
    </label>
  );
}

export function TextArea({
  label,
  name,
  defaultValue,
  rows = 4,
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  rows?: number;
  required?: boolean;
}) {
  return (
    <label className="block text-sm">
      <span className="font-medium">
        {label}
        {required ? <span className="text-red-700"> *</span> : null}
      </span>
      <textarea
        name={name}
        rows={rows}
        required={required}
        defaultValue={defaultValue ?? ''}
        className="focus:border-brand-500 mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none"
      />
    </label>
  );
}

export function Select({
  label,
  name,
  options,
  defaultValue,
  required,
  emptyLabel = '—',
}: {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  defaultValue?: string | null;
  required?: boolean;
  emptyLabel?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="font-medium">
        {label}
        {required ? <span className="text-red-700"> *</span> : null}
      </span>
      <select
        name={name}
        required={required}
        defaultValue={defaultValue ?? ''}
        className={inputCls}
      >
        <option value="">{emptyLabel}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Check({
  label,
  name,
  defaultChecked,
}: {
  label: string;
  name: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="size-4" />
      {label}
    </label>
  );
}

export function SubmitButton({ children }: { children: ReactNode }) {
  return (
    <button
      type="submit"
      className="bg-brand-700 hover:bg-brand-800 h-10 rounded-lg px-4 text-sm font-medium text-white"
    >
      {children}
    </button>
  );
}

export function DangerButton({ children }: { children: ReactNode }) {
  return (
    <button
      type="submit"
      className="rounded-lg border border-red-300 px-2.5 py-1 text-xs text-red-800 hover:bg-red-50"
    >
      {children}
    </button>
  );
}
