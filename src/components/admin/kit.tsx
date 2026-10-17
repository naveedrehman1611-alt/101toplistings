import Link from 'next/link';
import type { ReactNode } from 'react';

/**
 * Design primitives for the admin panel (the "Admin Panel" Claude Design
 * handoff). Flat, no gradients, 8px radius, on the brand palette:
 * navy #062347 ink and sidebar, #0C8226 buttons (#0B6E22 hover), logo green
 * #14A833 accent, blue #1884E7 links, teal #0E7A7C verified, gold #F59E0B
 * ratings, canvas #F8FAFC and #E2E8F0 dividers.
 *
 * Server-safe: no hooks, so pages can use these directly.
 */

export const btn = {
  primary:
    'inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#0C8226] px-3.5 text-[13.5px] font-semibold whitespace-nowrap text-white transition-colors hover:bg-[#0B6E22] focus-visible:ring-2 focus-visible:ring-[#0C8226]/40 focus-visible:outline-none disabled:opacity-50',
  secondary:
    'inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-3.5 text-[13.5px] font-semibold whitespace-nowrap text-[#062347] transition-colors hover:bg-[#F1F5F9] focus-visible:ring-2 focus-visible:ring-[#1884E7]/40 focus-visible:outline-none disabled:opacity-50',
  danger:
    'inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#DC2626] px-3.5 text-[13.5px] font-semibold whitespace-nowrap text-white transition-colors hover:bg-[#B91C1C] focus-visible:ring-2 focus-visible:ring-[#DC2626]/40 focus-visible:outline-none disabled:opacity-50',
  dangerGhost:
    'inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-3.5 text-[13.5px] font-semibold whitespace-nowrap text-[#B91C1C] transition-colors hover:bg-[#F1F5F9] disabled:opacity-50',
} as const;

/** Ghost buttons in a table's Actions column. */
export const rowAct = {
  base: 'inline-flex h-7 items-center rounded-md px-[9px] text-[12.5px] font-semibold whitespace-nowrap text-[#062347] transition-colors hover:bg-[#F1F5F9] disabled:opacity-40',
  ok: 'inline-flex h-7 items-center rounded-md px-[9px] text-[12.5px] font-semibold whitespace-nowrap text-[#0C8226] transition-colors hover:bg-[#F1F5F9] disabled:opacity-40',
  bad: 'inline-flex h-7 items-center rounded-md px-[9px] text-[12.5px] font-semibold whitespace-nowrap text-[#B91C1C] transition-colors hover:bg-[#F1F5F9] disabled:opacity-40',
} as const;

export const inputCls =
  'h-[38px] w-full min-w-0 rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm text-[#062347] outline-none placeholder:text-[#94A3B8] focus:border-[#1884E7]';
export const textareaCls =
  'w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2.5 text-sm leading-normal text-[#062347] outline-none placeholder:text-[#94A3B8] focus:border-[#1884E7]';
export const selectCls =
  'h-[38px] w-full min-w-0 rounded-lg border border-[#E2E8F0] bg-white px-2.5 text-sm text-[#062347] outline-none focus:border-[#1884E7]';

export const card = 'rounded-lg border border-[#E2E8F0] bg-white';

/** Status colours: [background, text]. */
export const TONE = {
  pending: ['#FEF3C7', '#92400E'],
  open: ['#FEF3C7', '#92400E'],
  flagged: ['#FEF3C7', '#92400E'],
  approved: ['#DCFCE7', '#166534'],
  active: ['#DCFCE7', '#166534'],
  published: ['#DCFCE7', '#166534'],
  resolved: ['#DCFCE7', '#166534'],
  redirected: ['#DCFCE7', '#166534'],
  visible: ['#DCFCE7', '#166534'],
  rejected: ['#FEE2E2', '#991B1B'],
  spam: ['#FEE2E2', '#991B1B'],
  suspended: ['#F1F5F9', '#475569'],
  draft: ['#F1F5F9', '#475569'],
  unsubscribed: ['#F1F5F9', '#475569'],
  ignored: ['#F1F5F9', '#475569'],
  hidden: ['#F1F5F9', '#475569'],
  in_progress: ['#DBEAFE', '#1E40AF'],
  new: ['#DBEAFE', '#1E40AF'],
  scheduled: ['#E0F2FE', '#075985'],
  teal: ['#CCFBF1', '#0E7A7C'],
  gold: ['#FEF3C7', '#92400E'],
  blue: ['#DBEAFE', '#1E40AF'],
  slate: ['#F1F5F9', '#475569'],
} as const satisfies Record<string, readonly [string, string]>;

export type Tone = keyof typeof TONE;

export function toneOf(value: string): Tone {
  return value in TONE ? (value as Tone) : 'slate';
}

/** "in_progress" → "In progress". */
export function label(value: string): string {
  const s = value.replace(/_/g, ' ');
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** A status pill: a coloured dot and the label. */
export function Pill({ tone, children }: { tone: Tone; children: ReactNode }) {
  const [bg, fg] = TONE[tone];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full py-0.5 pr-[9px] pl-[7px] text-xs font-semibold whitespace-nowrap"
      style={{ background: bg, color: fg }}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}

/** A small square tag, such as Verified or Featured under a listing name. */
export function Tag({ tone, children }: { tone: Tone; children: ReactNode }) {
  const [bg, fg] = TONE[tone];
  return (
    <span
      className="rounded px-1.5 py-px text-[11px] font-semibold whitespace-nowrap"
      style={{ background: bg, color: fg }}
    >
      {children}
    </span>
  );
}

/** Marks a screen or field that the old admin did not have. */
export function NewBadge({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  return (
    <span
      className={`rounded bg-[#E8F5EC] font-bold tracking-[.05em] text-[#0C8226] ${
        size === 'md' ? 'px-[7px] py-[3px] text-[10.5px]' : 'px-[5px] py-px text-[9.5px]'
      }`}
    >
      NEW
    </span>
  );
}

export type HeaderAction = {
  label: string;
  href?: string;
  primary?: boolean;
  download?: boolean;
  external?: boolean;
};

/** Title, one-line description and the page's main buttons. */
export function PageHeader({
  title,
  description,
  isNew,
  actions,
  children,
}: {
  title: string;
  description?: ReactNode;
  isNew?: boolean;
  actions?: HeaderAction[];
  /** Extra controls (such as a dialog trigger) placed with the actions. */
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2.5">
          <h1 className="font-display m-0 text-2xl font-bold tracking-[-.01em] text-[#062347]">
            {title}
          </h1>
          {isNew ? <NewBadge size="md" /> : null}
        </div>
        {description ? (
          <p className="mt-1.5 mb-0 max-w-3xl text-sm text-[#64748B]">{description}</p>
        ) : null}
      </div>
      {actions?.length || children ? (
        <div className="flex flex-wrap gap-2">
          {actions?.map((a) => {
            const cls = a.primary ? btn.primary : btn.secondary;
            if (a.download || a.external) {
              return (
                <a
                  key={a.label}
                  href={a.href}
                  className={`${cls} hover:no-underline`}
                  download={a.download || undefined}
                  target={a.external ? '_blank' : undefined}
                  rel={a.external ? 'noopener noreferrer' : undefined}
                >
                  {a.label}
                </a>
              );
            }
            return (
              <Link key={a.label} href={a.href ?? '#'} className={`${cls} hover:no-underline`}>
                {a.label}
              </Link>
            );
          })}
          {children}
        </div>
      ) : null}
    </div>
  );
}

/** "‹ All listings" above an edit page's title. */
export function BackLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="self-start text-[13px] font-semibold text-[#1884E7] hover:text-[#062347] hover:no-underline"
    >
      ‹ {children}
    </Link>
  );
}

/** A white card with a heading bar, as used by every form section. */
export function Section({
  title,
  description,
  isNew,
  badge,
  aside,
  children,
  bodyClassName = 'grid grid-cols-1 gap-x-5 gap-y-4 px-5 pt-[18px] pb-5 sm:grid-cols-2',
}: {
  title: string;
  description?: ReactNode;
  isNew?: boolean;
  badge?: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
  bodyClassName?: string;
}) {
  return (
    <section className={card}>
      <div className="flex items-center gap-2.5 border-b border-[#E2E8F0] px-5 py-3.5">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-display m-0 text-[15px] font-bold text-[#062347]">{title}</h3>
            {isNew ? <NewBadge /> : null}
            {badge}
          </div>
          {description ? (
            <p className="mt-1 mb-0 text-[13px] text-[#64748B]">{description}</p>
          ) : null}
        </div>
        {aside}
      </div>
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

/** Label + control + help text. `full` spans both grid columns. */
export function FormField({
  label: text,
  htmlFor,
  help,
  full,
  isNew,
  required,
  children,
  counter,
}: {
  label: ReactNode;
  htmlFor?: string;
  help?: ReactNode;
  full?: boolean;
  isNew?: boolean;
  required?: boolean;
  counter?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className={`flex min-w-0 flex-col gap-1.5 ${full ? 'sm:col-span-2' : ''}`}>
      <div className="flex items-center gap-2">
        <label htmlFor={htmlFor} className="text-[13px] font-semibold text-[#062347]">
          {text}
          {required ? <span className="text-[#B91C1C]"> *</span> : null}
        </label>
        {isNew ? <NewBadge /> : null}
        {counter ? <span className="ml-auto text-xs">{counter}</span> : null}
      </div>
      {children}
      {help ? <div className="text-[12.5px] text-[#64748B]">{help}</div> : null}
    </div>
  );
}

/** A banner for screens whose controls are not connected to the database yet. */
export function PreviewNotice({ children }: { children: ReactNode }) {
  return (
    <div
      role="note"
      className="flex items-start gap-2.5 rounded-lg border border-[#FCD34D] bg-[#FFFBEB] px-4 py-3 text-[13px] text-[#92400E]"
    >
      <span aria-hidden className="mt-px font-bold">
        !
      </span>
      <div>{children}</div>
    </div>
  );
}

/** An error banner for a failed read. */
export function ErrorNotice({ children }: { children: ReactNode }) {
  return (
    <p
      role="alert"
      className="m-0 rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-[13px] text-[#991B1B]"
    >
      {children}
    </p>
  );
}

/** Stars for a 1–5 rating, in the gold the design uses for ratings. */
export function stars(n: number): string {
  const r = Math.max(0, Math.min(5, Math.round(n)));
  return '★'.repeat(r) + '☆'.repeat(5 - r);
}

/** "Today", "Yesterday", "3 days ago", "2 wk ago", "4 mo ago". */
export function ago(iso: string | null | undefined, now = Date.now()): string {
  if (!iso) return '—';
  const d = Math.floor((now - new Date(iso).getTime()) / 86_400_000);
  if (d <= 0) return 'Today';
  if (d === 1) return 'Yesterday';
  if (d < 7) return `${d} days ago`;
  if (d < 30) return `${Math.floor(d / 7)} wk ago`;
  if (d < 365) return `${Math.floor(d / 30)} mo ago`;
  return `${Math.floor(d / 365)} yr ago`;
}

/** Main text of a cell, with an optional grey line under it. */
export function CellText({
  children,
  sub,
  bold,
}: {
  children: ReactNode;
  sub?: ReactNode;
  bold?: boolean;
}) {
  return (
    <>
      <div
        className={`max-w-full overflow-hidden text-ellipsis whitespace-nowrap ${bold ? 'font-semibold' : ''}`}
      >
        {children}
      </div>
      {sub ? (
        <div className="max-w-full overflow-hidden text-xs text-ellipsis whitespace-nowrap text-[#64748B]">
          {sub}
        </div>
      ) : null}
    </>
  );
}

/**
 * An on/off switch that posts like a checkbox ("on" when set), with a label
 * and help text beside it. Pure CSS, so it works in server-rendered forms.
 */
export function SwitchField({
  name,
  label: text,
  help,
  defaultChecked,
  full = true,
  disabled,
}: {
  name?: string;
  label: ReactNode;
  help?: ReactNode;
  defaultChecked?: boolean;
  full?: boolean;
  disabled?: boolean;
}) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-3.5 py-1 ${full ? 'sm:col-span-2' : ''} ${disabled ? 'cursor-default opacity-60' : ''}`}
    >
      <span className="flex-1">
        <span className="block text-[13.5px] font-semibold text-[#062347]">{text}</span>
        {help ? <span className="mt-0.5 block text-[12.5px] text-[#64748B]">{help}</span> : null}
      </span>
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        disabled={disabled}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className="relative h-[22px] w-10 shrink-0 rounded-full bg-[#CBD5E1] transition-colors peer-checked:bg-[#0C8226] peer-focus-visible:ring-2 peer-focus-visible:ring-[#1884E7]/40 after:absolute after:top-[2px] after:left-[2px] after:size-[18px] after:rounded-full after:bg-white after:shadow-[0_1px_2px_rgba(0,0,0,.2)] after:transition-transform peer-checked:after:translate-x-[18px]"
      />
    </label>
  );
}

/** The table-sized switch drawn as a submit button: one click posts its form. */
export function SwitchSubmit({ on, label: text }: { on: boolean; label: string }) {
  return (
    <button
      type="submit"
      role="switch"
      aria-checked={on}
      aria-label={text}
      className="relative h-5 w-9 shrink-0 cursor-pointer rounded-full border-0 p-0"
      style={{ background: on ? '#0C8226' : '#CBD5E1' }}
    >
      <span
        className="absolute top-[2px] size-4 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,.2)]"
        style={{ left: on ? 18 : 2 }}
      />
    </button>
  );
}

/** A read-only switch, for values this screen shows but cannot change yet. */
export function SwitchView({ on, label: text }: { on: boolean; label: string }) {
  return (
    <span
      role="img"
      aria-label={`${text}: ${on ? 'on' : 'off'}`}
      className="relative inline-block h-5 w-9 shrink-0 rounded-full"
      style={{ background: on ? '#0C8226' : '#CBD5E1' }}
    >
      <span
        className="absolute top-[2px] size-4 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,.2)]"
        style={{ left: on ? 18 : 2 }}
      />
    </span>
  );
}
