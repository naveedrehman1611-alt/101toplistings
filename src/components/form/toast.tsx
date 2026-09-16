'use client';

/* Lightweight toast: a provider that owns the queue plus a `useToast` hook.
   Toasts are a progressive nicety — a form still reports success on its own via
   the Server Action's returned state when JavaScript never runs. */

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

export type ToastVariant = 'success' | 'error' | 'info';

export type Toast = {
  id: string;
  message: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  /** Queues a toast and returns its id. */
  toast: (message: string, options?: { variant?: ToastVariant; duration?: number }) => string;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside a <ToastProvider>');
  return context;
}

const variantClass: Record<ToastVariant, string> = {
  success: 'border-brand-200 bg-brand-50 text-brand-900',
  error: 'border-red-200 bg-red-50 text-red-800',
  info: 'border-[var(--border)] bg-[var(--surface)] text-[var(--text)]',
};

export function ToastProvider({
  children,
  duration = 5000,
}: {
  children: ReactNode;
  duration?: number;
}) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: string) => {
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback<ToastContextValue['toast']>(
    (message, options) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setToasts((current) => [...current, { id, message, variant: options?.variant ?? 'info' }]);
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), options?.duration ?? duration),
      );
      return id;
    },
    [dismiss, duration],
  );

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        role="region"
        aria-label="Notifications"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 p-4 sm:inset-x-auto sm:right-0 sm:items-end"
      >
        {toasts.map((item) => (
          <output
            key={item.id}
            aria-live={item.variant === 'error' ? 'assertive' : 'polite'}
            className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg transition-opacity duration-200 motion-reduce:transition-none ${variantClass[item.variant]}`}
          >
            <span className="flex-1">{item.message}</span>
            <button
              type="button"
              onClick={() => dismiss(item.id)}
              aria-label="Dismiss notification"
              className="focus-visible:outline-brand-700 -mr-1 rounded px-1 leading-none focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              ×
            </button>
          </output>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
