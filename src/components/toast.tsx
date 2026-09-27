'use client';

import { xIcon, type IconNode } from '@/components/icon-nodes';

/**
 * A toast without a provider: any client code can call showToast(), which
 * appends to one fixed live region created on first use, so no layout has to
 * mount a <Toaster />. Plain DOM rather than a second React root keeps it tiny.
 */

export type ToastOptions = { message: string; action?: { label: string; href: string } };

const DURATION_MS = 4000;
const MAX_VISIBLE = 3;
// Removed on the next frame so the entrance transitions; added back to leave.
const HIDDEN = ['opacity-0', 'motion-safe:translate-x-full'];

let region: HTMLElement | undefined;

function svgIcon(node: IconNode, size: number): SVGSVGElement {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  const attrs: Record<string, string> = {
    width: String(size),
    height: String(size),
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': '2',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'aria-hidden': 'true',
    focusable: 'false',
  };
  for (const [name, value] of Object.entries(attrs)) svg.setAttribute(name, value);
  for (const [tag, childAttrs] of node) {
    const child = document.createElementNS(ns, tag);
    for (const [name, value] of Object.entries(childAttrs)) child.setAttribute(name, value);
    svg.append(child);
  }
  return svg;
}

export function showToast({ message, action }: ToastOptions): void {
  if (typeof document === 'undefined') return;

  // A live region only announces changes made after it is in the page, so a
  // region created now gets its first toast a moment later.
  const fresh = !region?.isConnected;
  if (!region || fresh) {
    region = document.createElement('div');
    region.setAttribute('role', 'status');
    region.setAttribute('aria-live', 'polite');
    region.setAttribute('aria-atomic', 'false');
    region.className =
      'pointer-events-none fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-sm flex-col gap-2 sm:right-6 sm:bottom-6 sm:left-auto sm:mx-0 sm:w-96';
    document.body.append(region);
  }
  const host = region;

  const toast = document.createElement('div');
  toast.className = `pointer-events-auto flex items-center gap-2 rounded-lg bg-navy-900 py-2 pr-2 pl-4 text-sm text-white shadow-[var(--shadow-raised)] transition duration-200 ease-out ${HIDDEN.join(' ')}`;

  const text = document.createElement('p');
  text.className = 'flex-1 py-1.5';
  text.textContent = message;
  toast.append(text);

  if (action) {
    const link = document.createElement('a');
    link.href = action.href;
    link.textContent = action.label;
    link.className =
      'shrink-0 rounded-md px-2 py-1.5 font-medium text-white underline underline-offset-2 hover:bg-white/10';
    toast.append(link);
  }

  const close = document.createElement('button');
  close.type = 'button';
  close.setAttribute('aria-label', 'Dismiss');
  close.className =
    'grid size-9 shrink-0 place-items-center rounded-md text-white/70 transition-colors hover:bg-white/10 hover:text-white';
  close.append(svgIcon(xIcon, 16));
  toast.append(close);

  let timer: number | undefined;
  const hold = () => window.clearTimeout(timer);
  const dismiss = () => {
    hold();
    toast.classList.add(...HIDDEN);
    window.setTimeout(() => toast.remove(), 200);
  };
  const release = () => {
    hold();
    timer = window.setTimeout(dismiss, DURATION_MS);
  };
  close.addEventListener('click', dismiss);
  // Pointer or keyboard focus on the toast keeps it open, so its link can be reached.
  toast.addEventListener('mouseenter', hold);
  toast.addEventListener('mouseleave', release);
  toast.addEventListener('focusin', hold);
  toast.addEventListener('focusout', release);

  const show = () => {
    while (host.childElementCount >= MAX_VISIBLE) host.firstElementChild?.remove();
    host.append(toast);
    requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.remove(...HIDDEN)));
    release();
  };
  if (fresh) window.setTimeout(show, 100);
  else show();
}
