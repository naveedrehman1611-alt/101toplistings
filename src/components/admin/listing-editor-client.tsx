'use client';

import { useState } from 'react';
import { toast } from './toaster';

/**
 * Copies Monday's mode and times to Tuesday–Saturday by editing the form's
 * own inputs (h{day}_mode / _open / _close), then fires input events so the
 * form notices the change and shows its save bar.
 */
export function CopyMondayButton() {
  return (
    <button
      type="button"
      className="cursor-pointer border-0 bg-transparent p-0 text-[13px] font-semibold text-[#1884E7]"
      onClick={(e) => {
        const form = (e.currentTarget as HTMLButtonElement).form;
        if (!form) return;
        const get = (name: string) =>
          form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | null;
        for (let d = 2; d <= 6; d++) {
          for (const part of ['mode', 'open', 'close']) {
            const from = get(`h1_${part}`);
            const to = get(`h${d}_${part}`);
            if (from && to) {
              to.value = from.value;
              to.dispatchEvent(new Event('input', { bubbles: true }));
            }
          }
        }
        toast('Copied Monday’s hours to Tue–Sat');
      }}
    >
      Copy Monday’s hours to Tue–Sat
    </button>
  );
}

/**
 * Amenity chips: green with a tick when on. Preview only — listing_amenities
 * is read, but the listing save action does not write it yet, so the chips
 * carry no form name.
 */
export function AmenityChips({
  amenities,
  selected,
}: {
  amenities: { id: string; name: string }[];
  selected: string[];
}) {
  const [on, setOn] = useState<string[]>(selected);
  if (!amenities.length)
    return (
      <p className="m-0 text-[13px] text-[#64748B]">
        No amenities defined yet. Add them under Directory → Amenities.
      </p>
    );
  return (
    <div className="flex flex-wrap gap-2">
      {amenities.map((a) => {
        const sel = on.includes(a.id);
        return (
          <button
            key={a.id}
            type="button"
            aria-pressed={sel}
            onClick={() => setOn(sel ? on.filter((x) => x !== a.id) : [...on, a.id])}
            className="flex h-8 cursor-pointer items-center gap-1.5 rounded-full border px-3 text-[13px] font-semibold"
            style={{
              background: sel ? '#E8F5EC' : '#fff',
              color: sel ? '#0C8226' : '#334155',
              borderColor: sel ? '#0C8226' : '#E2E8F0',
            }}
          >
            <span aria-hidden>{sel ? '✓' : '+'}</span>
            {a.name}
          </button>
        );
      })}
    </div>
  );
}
