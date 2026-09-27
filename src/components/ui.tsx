import Link from 'next/link';
import type { ReactNode } from 'react';
import { Icon } from '@/components/icon';

export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="bg-brand-50 font-label-sm text-label-sm text-primary-container inline-flex items-center gap-1 rounded-full px-3 py-1">
      {children}
    </span>
  );
}

export function Stars({ value, count }: { value: number | null; count: number }) {
  // §7.5.8 / criterion 48: never render a rating that does not exist.
  if (value === null || count === 0) return null;
  return (
    <span className="font-label-md text-label-md inline-flex items-center gap-1">
      <Icon name="star" size={16} className="text-badge-gold" />
      <span className="text-on-surface font-semibold">{value.toFixed(1)}</span>
      <span className="text-secondary">({count})</span>
    </span>
  );
}

export function Distance({ km }: { km: number | null }) {
  // §7.5.5: show nothing rather than a guess when coordinates are missing.
  if (km === null || Number.isNaN(km)) return null;
  return <span className="font-body-sm text-body-sm text-secondary">{km.toFixed(1)} km away</span>;
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="surface-card border-border-subtle border-dashed p-10 text-center">
      <span className="bg-surface-container text-primary-container mx-auto grid size-12 place-items-center rounded-xl">
        <Icon name="manage_search" />
      </span>
      <p className="font-headline-sm text-headline-sm text-on-surface mt-4">{title}</p>
      <p className="font-body-md text-body-md text-on-surface-variant mx-auto mt-2 max-w-md">
        {body}
      </p>
      {action ? <div className="mt-6">{action}</div> : null}
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
      ? 'bg-primary-container text-on-primary shadow-xs hover:bg-primary hover:shadow-[0_4px_12px_rgba(4,120,87,0.25)]'
      : 'border border-border-subtle bg-surface-card text-on-surface hover:bg-[#f1f5f9]';
  const base = `inline-flex h-11 items-center justify-center gap-2 rounded-lg px-5 font-label-md text-label-md transition focus-visible:ring-2 focus-visible:ring-primary-container focus-visible:ring-offset-2 focus-visible:outline-hidden ${cls}`;
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
    <nav aria-label="Breadcrumb" className="font-body-sm text-body-sm text-secondary mb-6">
      <ol className="flex flex-wrap items-center gap-1.5">
        {trail.map((c, i) => (
          <li key={`${c.label}-${i}`} className="flex items-center gap-1.5">
            {c.href ? (
              <Link href={c.href} className="hover:text-primary-container transition-colors">
                {c.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-on-surface">
                {c.label}
              </span>
            )}
            {i < trail.length - 1 ? <Icon name="chevron_right" size={16} /> : null}
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
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        <h2 className="font-headline-lg text-headline-lg-mobile text-on-surface md:text-headline-lg">
          {heading}
        </h2>
        {subheading ? (
          <p className="font-body-md text-body-md text-on-surface-variant mt-2">{subheading}</p>
        ) : null}
      </div>
      {cta?.label && cta.url ? (
        <Link
          href={cta.url}
          className="group font-label-md text-label-md text-primary-container hover:text-primary inline-flex items-center gap-1 font-semibold transition-colors"
        >
          {cta.label}
          <Icon
            name="arrow_forward"
            size={16}
            className="transition-transform group-hover:translate-x-1"
          />
        </Link>
      ) : null}
    </div>
  );
}
