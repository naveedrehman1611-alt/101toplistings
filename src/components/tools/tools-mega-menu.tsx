'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@/components/icon';
import { MegaMenu, MegaMenuFooter, focusRing } from '@/components/mega-menu';
import { TOOLS_BASE, toolHref, toolsByCategory, type FreeTool } from '@/lib/free-tools';

const CATEGORIES = toolsByCategory();

export function NewPill() {
  return (
    <span className="bg-brand-50 text-primary-container rounded-full px-1.5 py-0.5 text-[10px] leading-none font-bold tracking-wider uppercase">
      New
    </span>
  );
}

export function SoonPill() {
  return (
    <span className="bg-surface-container-low text-secondary rounded-full px-1.5 py-0.5 text-[10px] leading-none font-bold tracking-wider uppercase">
      Soon
    </span>
  );
}

function ToolRow({ tool }: { tool: FreeTool }) {
  const inner = (
    <>
      <span
        className={`grid size-8 shrink-0 place-items-center rounded-lg ${
          tool.status === 'live'
            ? 'bg-brand-50 text-primary-container'
            : 'bg-surface-container-low text-secondary'
        }`}
      >
        <Icon name={tool.icon} size={18} />
      </span>
      <span className="min-w-0 flex-1">{tool.name}</span>
      {tool.status === 'soon' ? <SoonPill /> : tool.isNew ? <NewPill /> : null}
    </>
  );
  const base = 'font-label-md text-label-md flex items-center gap-3 rounded-lg px-2 py-2';
  if (tool.status === 'soon') {
    return (
      <span aria-disabled="true" className={`${base} text-secondary cursor-default opacity-70`}>
        {inner}
      </span>
    );
  }
  return (
    <Link
      href={toolHref(tool)}
      className={`${base} text-on-surface hover:bg-surface-container-low hover:text-primary-container transition-colors ${focusRing}`}
    >
      {inner}
    </Link>
  );
}

/** Desktop "Free SEO Tools" trigger and its panel. */
export function ToolsMegaMenu() {
  const pathname = usePathname();
  const active = pathname === TOOLS_BASE || pathname.startsWith(`${TOOLS_BASE}/`);

  return (
    <MegaMenu label="Free SEO Tools" shortLabel="Tools" active={active}>
      <div className="grid grid-cols-4 gap-6 p-6">
        {CATEGORIES.map((category) => (
          <div key={category.id}>
            <p className="font-label-sm text-label-sm text-secondary mb-2 px-2 tracking-wider uppercase">
              {category.label}
            </p>
            <ul className="flex flex-col gap-0.5">
              {category.tools.map((tool) => (
                <li key={tool.slug}>
                  <ToolRow tool={tool} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <MegaMenuFooter>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Free, no signup. Every tool runs in your browser.
        </p>
        <Link
          href={TOOLS_BASE}
          className={`font-label-md text-label-md text-primary-container hover:text-primary inline-flex items-center gap-1 rounded-sm font-semibold transition-colors ${focusRing}`}
        >
          View all free tools
          <Icon name="north_east" size={16} />
        </Link>
      </MegaMenuFooter>
    </MegaMenu>
  );
}
