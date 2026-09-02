import Link from 'next/link';
import type { ReactNode } from 'react';

export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
      {children}
    </span>
  );
}

export function Stars({ value, count }: { value: number | null; count: number }) {
  // §7.5.8 / criterion 48: never render a rating that does not exist.
  if (value === null || count === 0) return null;
  return (
    <span className="inline-flex items-center gap-1 text-sm">
      <span aria-hidden className="text-accent-500">
        ★
      </span>
      <span className="font-medium">{value.toFixed(1)}</span>
      <span className="text-[var(--text-muted)]">({count})</span>
    </span>
  );
}

export function Distance({ km }: { km: number | null }) {
  // §7.5.5: show nothing rather than a guess when coordinates are missing.
  if (km === null || Number.isNaN(km)) return null;
  return <span className="text-sm text-[var(--text-muted)]">{km.toFixed(1)} km away</span>;
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="surface-card border-dashed p-10 text-center">
      <p className="font-display text-lg font-semibold">{title}</p>
      <p className="mt-2 text-sm text-[var(--text-muted)]">{body}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function Button({
  href,
  children,
  variant = 'primary',
  type,
}: {
  href?: string;
  children: ReactNode;
  variant?: 'primary' | 'ghost';
  type?: 'submit';
}) {
  const cls =
    variant === 'primary'
      ? 'bg-brand-700 text-white hover:bg-brand-800'
      : 'border border-[var(--border)] hover:bg-[var(--surface-2)]';
  const base = `inline-flex h-11 items-center justify-center rounded-lg px-5 text-sm font-medium transition-colors ${cls}`;
  if (href) {
    return (
      <Link href={href} className={base}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type ?? 'button'} className={base}>
      {children}
    </button>
  );
}

export function Breadcrumbs({ trail }: { trail: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 text-sm text-[var(--text-muted)]">
      <ol className="flex flex-wrap items-center gap-1.5">
        {trail.map((c, i) => (
          <li key={`${c.label}-${i}`} className="flex items-center gap-1.5">
            {c.href ? (
              <Link href={c.href} className="hover:text-brand-700 hover:underline">
                {c.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-[var(--text)]">
                {c.label}
              </span>
            )}
            {i < trail.length - 1 ? <span aria-hidden>/</span> : null}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function SectionHeading({
  heading,
  subheading,
  cta,
}: {
  heading: string | null;
  subheading?: string | null;
  cta?: { label: string | null; url: string | null } | null;
}) {
  if (!heading) return null;
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 className="text-2xl font-semibold sm:text-3xl">{heading}</h2>
        {subheading ? <p className="mt-2 text-[var(--text-muted)]">{subheading}</p> : null}
      </div>
      {cta?.label && cta.url ? (
        <Link href={cta.url} className="text-sm font-medium text-brand-700 hover:underline">
          {cta.label} →
        </Link>
      ) : null}
    </div>
  );
}
