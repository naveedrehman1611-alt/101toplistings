'use client';

/* Client only for useFormStatus, which must live in a component *inside* the
   <form> (see node_modules/next/dist/docs/01-app/02-guides/forms.md). The form
   itself can stay a Server Component with a plain `action={serverAction}`. */

import { useFormStatus } from 'react-dom';
import type { ReactNode } from 'react';

export function SubmitButton({
  children,
  pendingLabel,
  variant = 'primary',
  disabled,
  formAction,
  name,
  value,
  className,
}: {
  children: ReactNode;
  /** Shown instead of `children` while the action is in flight. */
  pendingLabel?: string;
  variant?: 'primary' | 'ghost';
  disabled?: boolean;
  formAction?: string | ((formData: FormData) => void | Promise<void>);
  name?: string;
  value?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  const cls =
    variant === 'primary'
      ? 'bg-brand-700 text-white hover:bg-brand-800'
      : 'border border-[var(--border)] hover:bg-[var(--surface-2)]';
  return (
    <button
      type="submit"
      name={name}
      value={value}
      formAction={formAction}
      disabled={pending || disabled}
      aria-busy={pending || undefined}
      className={`focus-visible:outline-brand-700 inline-flex h-11 items-center justify-center rounded-lg px-5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${cls} ${className ?? ''}`.trim()}
    >
      {pending && pendingLabel ? pendingLabel : children}
    </button>
  );
}
