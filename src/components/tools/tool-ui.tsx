'use client';

import { useState, type ReactNode } from 'react';
import { Icon } from '@/components/icon';

/** Shared class strings so every tool's form controls look the same. */
export const inputClass =
  'w-full rounded-lg border border-border-subtle bg-surface-card px-4 py-3 font-body-md text-body-md text-on-surface placeholder:text-secondary/70 focus:border-primary-container focus:outline-hidden focus:ring-2 focus:ring-primary-container/20';

export const labelClass = 'mb-2 block font-label-md text-label-md text-on-surface';

export const primaryButtonClass =
  'inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary-container px-5 font-label-md text-label-md text-on-primary shadow-xs transition hover:bg-primary disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-container';

export const secondaryButtonClass =
  'inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border-subtle bg-surface-card px-5 font-label-md text-label-md text-on-surface transition hover:bg-surface-container-low focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-container';

/** White card that holds a tool's form or its results. */
export function ToolCard({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={`surface-card p-5 md:p-6 ${className ?? ''}`}>{children}</div>;
}

/** Copies `text` and confirms for two seconds. */
export function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      disabled={!text}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          setCopied(false);
        }
      }}
      className={secondaryButtonClass}
    >
      <Icon name={copied ? 'check_circle' : 'content_copy'} size={18} />
      <span aria-live="polite">{copied ? 'Copied' : label}</span>
    </button>
  );
}

/** Downloads `text` as a file named `filename`. */
export function DownloadButton({
  text,
  filename,
  mime = 'text/plain',
  label = 'Download',
}: {
  text: string;
  filename: string;
  mime?: string;
  label?: string;
}) {
  return (
    <button
      type="button"
      disabled={!text}
      onClick={() => {
        const url = URL.createObjectURL(new Blob([text], { type: mime }));
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      }}
      className={secondaryButtonClass}
    >
      <Icon name="arrow_forward" size={18} className="rotate-90" />
      {label}
    </button>
  );
}
