'use client';

/* Accessible dialog on top of the native <dialog> element: the browser gives us
   the focus trap, the inert background, Escape-to-close and the ::backdrop. */

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from 'react';

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [entered, setEntered] = useState(false);
  const uid = useId();
  const titleId = `${uid}-title`;
  const descriptionId = `${uid}-description`;

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      const frame = requestAnimationFrame(() => setEntered(true));
      return () => cancelAnimationFrame(frame);
    }
    if (!open && dialog.open) {
      setEntered(false);
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const onBackdropClick = useCallback(
    (event: MouseEvent<HTMLDialogElement>) => {
      if (event.target === ref.current) onClose();
    },
    [onClose],
  );

  const width = size === 'sm' ? 'max-w-sm' : size === 'lg' ? 'max-w-2xl' : 'max-w-lg';

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onClose={() => {
        if (open) onClose();
      }}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={onBackdropClick}
      className={`surface-card backdrop:bg-ink-900/50 m-auto w-[calc(100vw-2rem)] p-0 text-[var(--text)] ${width} ${
        entered ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
      } transition duration-200 motion-reduce:transition-none ${className ?? ''}`.trim()}
    >
      <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] px-5 py-4">
        <div>
          <h2 id={titleId} className="font-display text-lg font-semibold">
            {title}
          </h2>
          {description ? (
            <p id={descriptionId} className="mt-1 text-sm text-[var(--text-muted)]">
              {description}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="focus-visible:outline-brand-700 -mt-1 -mr-1 rounded-lg px-2 py-1 text-xl leading-none text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text)] focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          ×
        </button>
      </div>
      <div className="max-h-[70vh] overflow-y-auto px-5 py-4 text-sm">{children}</div>
      {footer ? (
        <div className="flex flex-wrap justify-end gap-2 border-t border-[var(--border)] px-5 py-4">
          {footer}
        </div>
      ) : null}
    </dialog>
  );
}
