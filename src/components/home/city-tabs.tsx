'use client';

import { useId, useState, type KeyboardEvent, type ReactNode } from 'react';

export type CityTab = { key: string; label: string; panel: ReactNode };

/**
 * Market tabs for the homepage city tiles. Every panel is in the server HTML
 * (inactive ones carry `hidden`), so crawlers and no-JS visitors still get each
 * city link; the tabs only switch which one is shown. Arrow keys, Home and End
 * move between tabs, per the WAI-ARIA tabs pattern.
 */
export function CityTabs({ label, tabs }: { label: string; tabs: CityTab[] }) {
  const id = useId();
  const [active, setActive] = useState(0);

  function select(i: number) {
    setActive(i);
    document.getElementById(`${id}-tab-${i}`)?.focus();
  }

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    const last = tabs.length - 1;
    const next =
      e.key === 'ArrowRight'
        ? active === last
          ? 0
          : active + 1
        : e.key === 'ArrowLeft'
          ? active === 0
            ? last
            : active - 1
          : e.key === 'Home'
            ? 0
            : e.key === 'End'
              ? last
              : null;
    if (next === null) return;
    e.preventDefault();
    select(next);
  }

  return (
    <>
      <div role="tablist" aria-label={label} className="mb-8 flex flex-wrap gap-2">
        {tabs.map((t, i) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            id={`${id}-tab-${i}`}
            aria-selected={active === i}
            aria-controls={`${id}-panel-${i}`}
            tabIndex={active === i ? 0 : -1}
            onClick={() => setActive(i)}
            onKeyDown={onKeyDown}
            className={`font-label-md text-label-md focus-visible:outline-primary-container rounded-full px-5 py-2 font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${
              active === i
                ? 'bg-primary-container text-on-primary shadow-md'
                : 'text-on-surface hover:bg-brand-50 bg-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tabs.map((t, i) => (
        <div
          key={t.key}
          role="tabpanel"
          id={`${id}-panel-${i}`}
          aria-labelledby={`${id}-tab-${i}`}
          hidden={active !== i}
        >
          {t.panel}
        </div>
      ))}
    </>
  );
}
