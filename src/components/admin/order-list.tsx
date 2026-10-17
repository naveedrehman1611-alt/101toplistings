import type { ReactNode } from 'react';
import { Pill } from './kit';

export const moveBtn =
  'grid size-[30px] cursor-pointer place-items-center rounded-md border border-[#E2E8F0] bg-white text-[#062347] hover:bg-[#F1F5F9] disabled:cursor-default disabled:opacity-40';

/**
 * One row of an ordered list (menu links, homepage sections): grip, position,
 * label and sub-line, a Visible/Hidden pill, then the row's buttons.
 */
export function OrderRow({
  n,
  label,
  sub,
  hidden,
  indent,
  children,
}: {
  n: number;
  label: ReactNode;
  sub?: ReactNode;
  hidden: boolean;
  indent?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[28px_32px_minmax(0,1.4fr)_minmax(0,1fr)_auto] items-center gap-2.5 border-b border-[#F1F5F9] px-4 py-3">
      <span aria-hidden className="text-base tracking-[-2px] text-[#CBD5E1]">
        ⋮⋮
      </span>
      <span className="text-xs font-semibold text-[#94A3B8]">{n}</span>
      <div className={`min-w-0 ${indent ? 'pl-5' : ''}`} style={{ opacity: hidden ? 0.5 : 1 }}>
        <div className="truncate text-sm font-semibold">
          {indent ? '↳ ' : ''}
          {label}
        </div>
        {sub ? <div className="truncate text-xs text-[#64748B]">{sub}</div> : null}
      </div>
      <div>
        <Pill tone={hidden ? 'hidden' : 'visible'}>{hidden ? 'Hidden' : 'Visible'}</Pill>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-0.5">{children}</div>
    </div>
  );
}
