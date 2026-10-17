'use client';

import { useState, type ReactNode } from 'react';

/**
 * A white card with tabs across the top and one panel per tab. The active tab
 * lives in client state, which survives the ?ok= redirect a save makes back to
 * the same page, so the editor stays on the tab they were working in.
 */
export function TabbedCard({
  tabs,
  footer,
}: {
  tabs: { id: string; label: string; content: ReactNode; footer?: ReactNode }[];
  footer?: ReactNode;
}) {
  const [active, setActive] = useState(tabs[0]?.id ?? '');
  const current = tabs.find((t) => t.id === active) ?? tabs[0];
  return (
    <div className="rounded-lg border border-[#E2E8F0] bg-white">
      {tabs.length > 1 ? (
        <div role="tablist" className="flex gap-5 overflow-x-auto border-b border-[#E2E8F0] px-4">
          {tabs.map((t) => {
            const on = t.id === current?.id;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => setActive(t.id)}
                className="shrink-0 cursor-pointer border-0 border-b-2 border-solid bg-transparent px-0.5 pt-3.5 pb-3 text-[13.5px] font-semibold whitespace-nowrap"
                style={{
                  color: on ? '#062347' : '#64748B',
                  borderBottomColor: on ? '#0C8226' : 'transparent',
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      ) : null}
      {tabs.map((t) => (
        <div key={t.id} role="tabpanel" hidden={t.id !== current?.id}>
          {t.content}
          {t.footer ? <div className="px-4 py-3">{t.footer}</div> : null}
        </div>
      ))}
      {footer ? <div className="px-4 py-3">{footer}</div> : null}
    </div>
  );
}
