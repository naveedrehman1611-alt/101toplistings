import type { ReactNode } from 'react';
import type { Background } from '@/lib/sections';

/**
 * The frame every homepage section shares: full-width background, centred
 * content column, and the reference's centred H2 + one-line subtext header.
 * Sections pass their own content as children.
 */

const BACKGROUND_CLASS: Record<Background, string> = {
  white: 'bg-white text-[var(--text)]',
  muted: 'bg-[var(--surface-2)] text-[var(--text)]',
  brand: 'bg-brand-700 text-white',
  navy: 'bg-navy-900 text-white',
};

/** True for backgrounds that need light text. */
export function isDark(background: Background): boolean {
  return background === 'brand' || background === 'navy';
}

export function SectionHeader({
  id,
  heading,
  subheading,
  dark = false,
  className = '',
}: {
  id?: string;
  heading: string | null;
  subheading: string | null;
  dark?: boolean;
  className?: string;
}) {
  if (!heading && !subheading) return null;
  return (
    <div className={`mx-auto mb-10 max-w-3xl text-center sm:mb-12 ${className}`}>
      {heading ? (
        <h2
          id={id}
          className={`text-[1.625rem] leading-tight font-medium sm:text-[1.875rem] ${
            dark ? 'text-white' : 'text-ink-900'
          }`}
        >
          {heading}
        </h2>
      ) : null}
      {subheading ? (
        <p
          className={`mt-3 text-[0.9375rem] leading-relaxed ${
            dark ? 'text-white/80' : 'text-[var(--text-muted)]'
          }`}
        >
          {subheading}
        </p>
      ) : null}
    </div>
  );
}

export function SectionShell({
  section,
  children,
  className = 'py-16 sm:py-20',
  containerClassName = 'container-page',
  showHeader = true,
}: {
  section: {
    key: string;
    heading: string | null;
    subheading: string | null;
    background: Background;
  };
  children: ReactNode;
  /** Vertical padding and any extra classes for the full-width band. */
  className?: string;
  containerClassName?: string;
  /** Sections that lay out their own heading pass false. */
  showHeader?: boolean;
}) {
  const headingId = `${section.key}-heading`;
  return (
    <section
      id={section.key}
      aria-labelledby={section.heading ? headingId : undefined}
      className={`${BACKGROUND_CLASS[section.background]} ${className}`}
    >
      <div className={containerClassName}>
        {showHeader ? (
          <SectionHeader
            id={headingId}
            heading={section.heading}
            subheading={section.subheading}
            dark={isDark(section.background)}
          />
        ) : null}
        {children}
      </div>
    </section>
  );
}
