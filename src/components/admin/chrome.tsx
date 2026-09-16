import Link from 'next/link';
import type { ReactNode } from 'react';

/**
 * Shared back-office chrome. The public site and the admin panel are different
 * products with different jobs — the public pages are read and scanned, these
 * are operated — so the admin keeps its own primitives rather than reusing
 * ui.tsx's marketing-weight components. Tokens are the same ones, though:
 * nothing here invents a colour.
 */

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border)] pb-5">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">{title}</h1>
        {description ? (
          <p className="mt-1 max-w-prose text-sm text-[var(--text-muted)]">{description}</p>
        ) : null}
      </div>
      {action ? <div className="flex items-center gap-2">{action}</div> : null}
    </div>
  );
}

/**
 * Status is the one thing an operator scans for, so it is encoded in colour and
 * shape as well as in the word. The five values are listing_status from 0001;
 * review_status and submission_status reuse the same vocabulary where it
 * overlaps, which is why this takes a plain string and falls back to neutral
 * rather than a closed union.
 */
const TONES: Record<string, string> = {
  approved: 'bg-[#e6f2eb] text-[#15633c]',
  resolved: 'bg-[#e6f2eb] text-[#15633c]',
  pending: 'bg-accent-400/20 text-accent-600',
  new: 'bg-brand-50 text-brand-700',
  in_progress: 'bg-brand-50 text-brand-700',
  draft: 'bg-ink-100 text-ink-600',
  rejected: 'bg-[#fbeceb] text-[#96231b]',
  suspended: 'bg-[#fbeceb] text-[#96231b]',
  spam: 'bg-[#fbeceb] text-[#96231b]',
  flagged: 'bg-[#fbeceb] text-[#96231b]',
};

export function StatusPill({ status }: { status: string }) {
  const tone = TONES[status] ?? 'bg-ink-100 text-ink-600';
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${tone}`}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] ${className}`}>
      {children}
    </div>
  );
}

export function StatTile({
  label,
  value,
  href,
  urgent = false,
}: {
  label: string;
  value: number;
  href?: string;
  urgent?: boolean;
}) {
  const body = (
    <>
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">{label}</p>
      <p
        className={`mt-1 font-display text-3xl font-bold tabular-nums ${
          urgent && value > 0 ? 'text-accent-600' : ''
        }`}
      >
        {value}
      </p>
    </>
  );
  const cls = 'block rounded-[var(--radius-card)] border border-[var(--border)] p-4';
  return href ? (
    <Link href={href} className={`${cls} transition-colors hover:bg-[var(--surface-2)]`}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

/**
 * Tables are the admin panel's main surface. This is deliberately thin — a
 * wrapper that guarantees the one thing every table here must do, which is
 * scroll horizontally inside its own box instead of pushing the page sideways
 * on a phone.
 */
export function TableShell({ children }: { children: ReactNode }) {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[42rem] border-collapse text-sm">{children}</table>
      </div>
    </Card>
  );
}

export function Th({ children, className = '' }: { children?: ReactNode; className?: string }) {
  return (
    <th
      scope="col"
      className={`border-b border-[var(--border)] bg-[var(--surface-2)] px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)] ${className}`}
    >
      {children}
    </th>
  );
}

export function Td({ children, className = '' }: { children?: ReactNode; className?: string }) {
  return (
    <td className={`border-b border-[var(--border)] px-4 py-3 align-middle ${className}`}>
      {children}
    </td>
  );
}

/**
 * Tab-style filter for the ?status= query parameters. State lives in the URL so
 * a filtered queue can be bookmarked, shared and reloaded — and so the pages
 * stay server-rendered.
 */
export function FilterTabs({
  basePath,
  param = 'status',
  current,
  options,
}: {
  basePath: string;
  param?: string;
  current: string;
  options: { value: string; label: string; count?: number }[];
}) {
  return (
    <nav className="flex flex-wrap gap-1" aria-label="Filter">
      {options.map((opt) => {
        const active = opt.value === current;
        const href = opt.value ? `${basePath}?${param}=${opt.value}` : basePath;
        return (
          <Link
            key={opt.value || 'all'}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              active
                ? 'bg-brand-700 text-white'
                : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)]'
            }`}
          >
            {opt.label}
            {typeof opt.count === 'number' ? (
              <span className={`tabular-nums ${active ? 'text-white/70' : 'text-ink-400'}`}>
                {opt.count}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

/** Server-rendered pagination. Omits itself when there is only one page. */
export function Pager({
  basePath,
  query,
  page,
  pageCount,
}: {
  basePath: string;
  query: Record<string, string | undefined>;
  page: number;
  pageCount: number;
}) {
  if (pageCount <= 1) return null;

  const to = (n: number) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) if (v) params.set(k, v);
    if (n > 1) params.set('page', String(n));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  return (
    <nav className="flex items-center justify-between gap-4 text-sm" aria-label="Pagination">
      {page > 1 ? (
        <Link href={to(page - 1)} className="font-medium text-brand-700 hover:underline">
          ← Previous
        </Link>
      ) : (
        <span className="text-ink-300">← Previous</span>
      )}
      <span className="text-[var(--text-muted)] tabular-nums">
        Page {page} of {pageCount}
      </span>
      {page < pageCount ? (
        <Link href={to(page + 1)} className="font-medium text-brand-700 hover:underline">
          Next →
        </Link>
      ) : (
        <span className="text-ink-300">Next →</span>
      )}
    </nav>
  );
}

/** Neutral admin button. ui.tsx's Button is sized for marketing CTAs. */
export function AdminButton({
  href,
  children,
  variant = 'primary',
  type,
  name,
  value,
  formAction,
}: {
  href?: string;
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  type?: 'submit' | 'button';
  name?: string;
  value?: string;
  formAction?: (formData: FormData) => void | Promise<void>;
}) {
  const tone =
    variant === 'primary'
      ? 'bg-brand-700 text-white hover:bg-brand-800'
      : variant === 'danger'
        ? 'border border-[#ecc2be] bg-[#fbeceb] text-[#96231b] hover:bg-[#f7dedc]'
        : 'border border-[var(--border)] hover:bg-[var(--surface-2)]';
  const cls = `inline-flex h-9 items-center justify-center rounded-lg px-3.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700 ${tone}`;

  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type ?? 'button'} name={name} value={value} formAction={formAction} className={cls}>
      {children}
    </button>
  );
}
