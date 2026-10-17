'use client';

import { useState } from 'react';

export type OgOption = { id: string; url: string; name: string };

/**
 * Social share (OG) image picker: a 6-up grid of 1.91:1 tiles from the media
 * library, the chosen one outlined in blue.
 *
 * Preview only: seo_meta.og_image_id exists, but no save action writes it
 * yet, so the choice has no form name and is not posted.
 */
export function OgPicker({ options }: { options: OgOption[] }) {
  const [chosen, setChosen] = useState<string | null>(null);
  const pick = options.find((o) => o.id === chosen);
  return (
    <div className="flex flex-col gap-2">
      {options.length ? (
        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-6">
          {options.map((o) => (
            <button
              key={o.id}
              type="button"
              aria-pressed={o.id === chosen}
              onClick={() => setChosen(o.id === chosen ? null : o.id)}
              className="cursor-pointer overflow-hidden rounded-lg border-2 bg-white p-0 text-left"
              style={{ borderColor: o.id === chosen ? '#1884E7' : '#E2E8F0' }}
            >
              {/* A plain img: thumbnails from Storage need no optimising here. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={o.url} alt="" className="aspect-[1.91/1] w-full bg-[#F1F5F9] object-cover" />
              <div className="truncate px-1.5 py-[5px] font-mono text-[10.5px] text-[#475569]">
                {o.name}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-[#CBD5E1] px-4 py-6 text-center text-[13px] text-[#64748B]">
          No images in the media library yet.
        </div>
      )}
      <div className="text-[12.5px] text-[#64748B]">
        {pick ? `Selected: ${pick.name}.` : 'No image selected — the site default is used.'}{' '}
        Recommended 1200×630. <b className="font-semibold text-[#92400E]">Preview: not saved yet.</b>
      </div>
    </div>
  );
}
