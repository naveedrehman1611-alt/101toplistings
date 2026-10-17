'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { useSearchParams } from 'next/navigation';

/**
 * Admin toasts: navy cards stacked bottom-right, a green tick for success and a
 * red mark for errors. Any client code calls toast(); the layout mounts one
 * <Toaster />. Server actions still report through ?ok= / ?error= (so forms keep
 * working without JavaScript); <FlashToast /> turns those into toasts and takes
 * them back out of the address bar.
 */

type Toast = { id: number; text: string; tone: 'ok' | 'error'; undo?: () => void };

let toasts: Toast[] = [];
let nextId = 1;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function dismiss(id: number) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

export function toast(text: string, opts: { tone?: 'ok' | 'error'; undo?: () => void } = {}) {
  const t: Toast = { id: nextId++, text, tone: opts.tone ?? 'ok', undo: opts.undo };
  toasts = [...toasts.slice(-3), t];
  emit();
  window.setTimeout(() => dismiss(t.id), t.undo ? 6000 : t.tone === 'error' ? 6000 : 3200);
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function Toaster() {
  const list = useSyncExternalStore(
    subscribe,
    () => toasts,
    () => toasts,
  );
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed right-6 bottom-6 z-[80] flex flex-col gap-2"
    >
      {list.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex max-w-[380px] min-w-[280px] items-center gap-2.5 rounded-lg bg-[#062347] px-3.5 py-3 text-[13.5px] text-white shadow-[0_10px_24px_rgba(6,35,71,.25)]"
        >
          <span
            aria-hidden
            className="grid size-[18px] shrink-0 place-items-center rounded-full text-[11px] font-bold"
            style={{ background: t.tone === 'ok' ? '#14A833' : '#DC2626' }}
          >
            {t.tone === 'ok' ? '✓' : '!'}
          </span>
          <span className="flex-1">{t.text}</span>
          {t.undo ? (
            <button
              type="button"
              onClick={() => {
                t.undo?.();
                dismiss(t.id);
              }}
              className="cursor-pointer border-0 bg-transparent text-[13px] font-semibold text-[#7DD3FC]"
            >
              Undo
            </button>
          ) : null}
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => dismiss(t.id)}
            className="cursor-pointer border-0 bg-transparent text-white/60 hover:text-white"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

/** Shows ?ok= / ?error= from a server action's redirect as a toast, once. */
export function FlashToast() {
  const params = useSearchParams();
  const ok = params.get('ok');
  const error = params.get('error');
  useEffect(() => {
    if (!ok && !error) return;
    if (error) toast(error, { tone: 'error' });
    else if (ok) toast(ok);
    const url = new URL(window.location.href);
    url.searchParams.delete('ok');
    url.searchParams.delete('error');
    // history.replaceState is integrated with the App Router: no refetch.
    window.history.replaceState(null, '', url.pathname + url.search + url.hash);
  }, [ok, error]);
  return null;
}
