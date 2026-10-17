'use client';

import { useState } from 'react';
import { FormField, NewBadge, Section, btn, card, inputCls, selectCls } from './kit';
import { toast } from './toaster';

export type AnnouncementDraft = {
  on: boolean;
  msg: string;
  label: string;
  url: string;
  style: 'navy' | 'green' | 'gold' | 'blue';
  dismiss: boolean;
  start: string;
  end: string;
};

const COLOURS: Record<AnnouncementDraft['style'], [string, string]> = {
  navy: ['#062347', '#fff'],
  green: ['#0C8226', '#fff'],
  gold: ['#F59E0B', '#062347'],
  blue: ['#1884E7', '#fff'],
};

function Switch({
  on,
  onChange,
  label,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className="relative h-[22px] w-10 shrink-0 cursor-pointer rounded-full border-0 p-0"
      style={{ background: on ? '#0C8226' : '#CBD5E1' }}
    >
      <span
        className="absolute top-[2px] size-[18px] rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,.2)]"
        style={{ left: on ? 20 : 2 }}
      />
    </button>
  );
}

/**
 * The announcement bar editor with a live preview above it. Preview only:
 * the announcements table is read, but nothing writes it or renders it on the
 * public site yet, so Save just confirms on screen.
 */
export function AnnouncementEditor({
  initial,
  brand,
}: {
  initial: AnnouncementDraft;
  brand: string;
}) {
  const [v, setV] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const dirty = JSON.stringify(v) !== JSON.stringify(saved);
  const set = <K extends keyof AnnouncementDraft>(k: K, value: AnnouncementDraft[K]) =>
    setV((s) => ({ ...s, [k]: value }));
  const [bg, fg] = COLOURS[v.style];
  const over = v.msg.length > 90;

  return (
    <div className="flex flex-col gap-5">
      <div className={`${card} overflow-hidden`}>
        <div className="border-b border-[#E2E8F0] px-4 py-2.5 text-xs font-semibold tracking-[.05em] text-[#64748B] uppercase">
          Live preview
        </div>
        {v.on ? (
          <div
            className="relative flex items-center justify-center gap-3 px-4 py-2.5 text-[13.5px] font-medium"
            style={{ background: bg, color: fg }}
          >
            <span>{v.msg || 'Your message'}</span>
            {v.label ? <span className="font-bold underline">{v.label} ›</span> : null}
            {v.dismiss ? <span className="absolute right-4 opacity-70">✕</span> : null}
          </div>
        ) : null}
        <div className="flex items-center gap-4 border-b border-[#E2E8F0] px-5 py-3.5">
          <div className="size-6 rounded-md bg-[#14A833]" />
          <b className="font-display">{brand}</b>
          <span className="ml-auto text-[13px] text-[#64748B]">Categories · Cities · Blog</span>
          <span className="rounded-lg bg-[#0C8226] px-2.5 py-1.5 text-[12.5px] font-semibold text-white">
            Add your business
          </span>
        </div>
        <div className="h-[60px] bg-[repeating-linear-gradient(45deg,#F8FAFC_0_8px,#F1F5F9_8px_16px)]" />
      </div>

      <Section title="Announcement" isNew>
        <div className="flex items-center gap-3.5 py-1 sm:col-span-2">
          <div className="flex-1">
            <div className="text-[13.5px] font-semibold">Show announcement bar</div>
            <div className="mt-0.5 text-[12.5px] text-[#64748B]">
              Appears above the header on every public page.
            </div>
          </div>
          <Switch on={v.on} onChange={(x) => set('on', x)} label="Show announcement bar" />
        </div>
        <FormField
          label="Message"
          htmlFor="an-msg"
          full
          counter={<span style={{ color: over ? '#B91C1C' : '#64748B' }}>{v.msg.length} / 90</span>}
        >
          <input
            id="an-msg"
            value={v.msg}
            onChange={(e) => set('msg', e.target.value)}
            className={inputCls}
          />
        </FormField>
        <FormField label="Link text" htmlFor="an-lbl">
          <input
            id="an-lbl"
            value={v.label}
            onChange={(e) => set('label', e.target.value)}
            className={inputCls}
          />
        </FormField>
        <FormField label="Link URL" htmlFor="an-url">
          <input
            id="an-url"
            value={v.url}
            onChange={(e) => set('url', e.target.value)}
            placeholder="/add-business"
            className={inputCls}
          />
        </FormField>
        <FormField label="Colour" htmlFor="an-style">
          <select
            id="an-style"
            value={v.style}
            onChange={(e) => set('style', e.target.value as AnnouncementDraft['style'])}
            className={selectCls}
          >
            <option value="navy">Navy</option>
            <option value="green">Green</option>
            <option value="gold">Gold</option>
            <option value="blue">Blue</option>
          </select>
        </FormField>
        <div className="flex items-center gap-3.5 self-end py-2">
          <div className="flex-1 text-[13.5px] font-semibold">Visitors can close it</div>
          <Switch
            on={v.dismiss}
            onChange={(x) => set('dismiss', x)}
            label="Visitors can close it"
          />
        </div>
      </Section>

      <Section title="Schedule">
        <FormField label="Start date" htmlFor="an-start">
          <input
            id="an-start"
            type="date"
            value={v.start}
            onChange={(e) => set('start', e.target.value)}
            className={inputCls}
          />
        </FormField>
        <FormField
          label="End date"
          htmlFor="an-end"
          help="Leave empty to keep it on until you turn it off."
        >
          <input
            id="an-end"
            type="date"
            value={v.end}
            onChange={(e) => set('end', e.target.value)}
            className={inputCls}
          />
        </FormField>
      </Section>

      {dirty ? (
        <div className="sticky bottom-0 z-[5] -mx-6 -mb-12 flex items-center gap-3 border-t border-[#E2E8F0] bg-white px-8 py-3 shadow-[0_-4px_16px_rgba(6,35,71,.06)]">
          <span aria-hidden className="size-2 rounded-full bg-[#F59E0B]" />
          <span className="text-[13.5px] font-semibold">You have unsaved changes</span>
          <NewBadge />
          <div className="ml-auto flex gap-3">
            <button type="button" className={btn.secondary} onClick={() => setV(saved)}>
              Discard
            </button>
            <button
              type="button"
              disabled={over}
              className={`${btn.primary} px-4`}
              onClick={() => {
                setSaved(v);
                toast('Preview: the announcement isn’t saved to the site yet');
              }}
            >
              Save changes
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
