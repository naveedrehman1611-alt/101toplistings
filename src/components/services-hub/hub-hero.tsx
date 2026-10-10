import type { ReactNode } from 'react';
import Link from 'next/link';
import { Icon } from '@/components/icon';

export type HubStat = { value: ReactNode; label: string };

/**
 * Full-bleed navy hero for the /seo-services hub: breadcrumb, eyebrow, h1 and
 * intro on the left, a column of stat tiles on the right (a row below lg).
 * `actions` (CTA buttons) render under the intro; with no `stats` the right
 * column is left out. The shared Breadcrumbs is styled for light surfaces, so the trail here is a
 * light-on-navy copy of it.
 */
export function HubHero({
  trail,
  eyebrow,
  heading,
  subheading,
  stats,
  actions,
}: {
  trail: { label: string; href?: string }[];
  eyebrow: string;
  heading: ReactNode;
  subheading: string;
  stats?: HubStat[];
  actions?: ReactNode;
}) {
  return (
    <section className="bg-hero-navy relative isolate overflow-hidden pt-12 pb-14 sm:pt-[72px] sm:pb-20">
      {/* Soft green glow, top right. A blurred flat fill, not a gradient. */}
      <div
        aria-hidden="true"
        className="bg-hero-green-light pointer-events-none absolute -top-20 -right-20 -z-10 size-[400px] rounded-full opacity-10 blur-[80px]"
      />
      <div className="container-page grid items-center gap-10 lg:grid-cols-[1fr_auto]">
        <div>
          <nav aria-label="Breadcrumb" className="font-body-sm text-body-sm mb-6 text-white/70">
            <ol className="flex flex-wrap items-center gap-1.5">
              {trail.map((c, i) => (
                <li key={`${c.label}-${i}`} className="flex items-center gap-1.5">
                  {c.href ? (
                    <Link
                      href={c.href}
                      className="rounded-sm transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                      {c.label}
                    </Link>
                  ) : (
                    <span aria-current="page" className="text-white">
                      {c.label}
                    </span>
                  )}
                  {i < trail.length - 1 ? (
                    <Icon name="chevron_right" size={16} className="text-white/50" />
                  ) : null}
                </li>
              ))}
            </ol>
          </nav>
          <p className="text-hero-green-light mb-4 inline-flex items-center gap-2.5 text-xs font-bold tracking-[2px] uppercase">
            <span aria-hidden="true" className="bg-hero-green-light h-0.5 w-7" />
            {eyebrow}
          </p>
          <h1 className="font-display text-[length:clamp(30px,4vw,50px)] leading-[1.15] font-extrabold tracking-tight text-balance text-white">
            {heading}
          </h1>
          <p className="mt-5 max-w-[580px] text-base leading-[1.75] text-white/60">{subheading}</p>
          {actions ? <div className="mt-8 flex flex-wrap gap-3">{actions}</div> : null}
        </div>
        {stats?.length ? (
          <dl className="grid grid-cols-3 gap-3 lg:grid-cols-1">
            {stats.map((s) => (
              <div
                key={s.label}
                className="flex flex-col-reverse items-center justify-center rounded-[10px] border border-white/10 bg-white/5 px-3 py-4 text-center sm:px-[22px] lg:min-w-[140px]"
              >
                {/* white/60: white/45 on navy is about 4.2:1, under AA for 12px text. */}
                <dt className="mt-1 text-xs leading-snug text-white/60">{s.label}</dt>
                <dd className="font-display text-hero-green-light text-[28px] leading-none font-extrabold">
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>
    </section>
  );
}
