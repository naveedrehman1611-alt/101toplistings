'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useFormStatus } from 'react-dom';
import { btn } from './kit';

/**
 * The admin's one modal: navy scrim, 460px white card, title and body, extra
 * fields, then Cancel and the confirming button on a grey footer. Escape and a
 * click on the scrim cancel.
 *
 * It renders where it is used (no portal) so fields inside it stay inside the
 * surrounding <form> and post with it.
 */
export function Dialog({
  title,
  body,
  children,
  footer,
  onCancel,
  width = 460,
}: {
  title: string;
  body?: ReactNode;
  children?: ReactNode;
  footer: ReactNode;
  onCancel: () => void;
  width?: number;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  return (
    <div
      onClick={onCancel}
      className="fixed inset-0 z-[70] grid place-items-center bg-[rgba(6,35,71,.45)] p-4 text-left"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        style={{ width }}
        className="max-h-[90vh] max-w-full overflow-auto rounded-lg bg-white shadow-[0_24px_48px_rgba(6,35,71,.25)]"
      >
        <div className="px-[22px] pt-5 pb-1">
          <h3 className="font-display m-0 text-[17px] font-bold text-[#062347]">{title}</h3>
          {body ? (
            <div className="mt-2 text-sm leading-normal font-normal whitespace-normal text-[#475569]">
              {body}
            </div>
          ) : null}
        </div>
        {children ? (
          <div className="flex flex-col gap-3 px-[22px] pt-3 pb-[18px] font-normal whitespace-normal">
            {children}
          </div>
        ) : (
          <div className="h-3" />
        )}
        <div className="flex justify-end gap-2 border-t border-[#E2E8F0] bg-[#F8FAFC] px-[22px] py-3">
          {footer}
        </div>
      </div>
    </div>
  );
}

/**
 * A submit button that asks first. Drop it inside a server-action <form> in
 * place of the plain button: Confirm submits the form, so the action, its role
 * check and its ?ok= redirect are unchanged. `children` become extra fields in
 * the dialog (such as "Also mark the listing as Verified") and post with the form.
 */
export function ConfirmButton({
  children,
  className,
  title,
  body,
  ok,
  danger,
  fields,
  disabled,
  ariaLabel,
}: {
  children: ReactNode;
  className: string;
  title: string;
  body?: ReactNode;
  ok: string;
  danger?: boolean;
  fields?: ReactNode;
  disabled?: boolean;
  ariaLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);
  return (
    <>
      <button
        ref={ref}
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        className={className}
        onClick={() => setOpen(true)}
      >
        {children}
      </button>
      {open ? (
        <Dialog
          title={title}
          body={body}
          onCancel={() => setOpen(false)}
          footer={
            <>
              <button type="button" className={btn.secondary} onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button
                type="button"
                autoFocus
                className={danger ? btn.danger : btn.primary}
                onClick={() => {
                  ref.current?.form?.requestSubmit();
                  setOpen(false);
                }}
              >
                {ok}
              </button>
            </>
          }
        >
          {fields}
        </Dialog>
      ) : null}
    </>
  );
}

/** Calls onDone when the enclosing form's submission finishes. */
function DoneWatcher({ onDone }: { onDone: () => void }) {
  const { pending } = useFormStatus();
  const was = useRef(false);
  useEffect(() => {
    if (was.current && !pending) onDone();
    was.current = pending;
  }, [pending, onDone]);
  return null;
}

function SubmitLabel({ ok, danger }: { ok: string; danger?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={danger ? btn.danger : btn.primary}>
      {pending ? 'Saving…' : ok}
    </button>
  );
}

/**
 * A button that opens a dialog holding a server-action form, for "Add category",
 * "Add redirect", "Rename" and the like. The fields are passed in from the
 * server page, so names and defaults stay next to the query that fills them.
 */
export function ModalForm({
  trigger,
  triggerClassName,
  title,
  body,
  action,
  ok,
  danger,
  children,
  width,
}: {
  trigger: ReactNode;
  triggerClassName: string;
  title: string;
  body?: ReactNode;
  action: (fd: FormData) => void | Promise<void>;
  ok: string;
  danger?: boolean;
  children?: ReactNode;
  width?: number;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className={triggerClassName} onClick={() => setOpen(true)}>
        {trigger}
      </button>
      {open ? (
        <form action={action} className="contents">
          <DoneWatcher onDone={() => setOpen(false)} />
          <Dialog
            title={title}
            body={body}
            width={width}
            onCancel={() => setOpen(false)}
            footer={
              <>
                <button type="button" className={btn.secondary} onClick={() => setOpen(false)}>
                  Cancel
                </button>
                <SubmitLabel ok={ok} danger={danger} />
              </>
            }
          >
            {children}
          </Dialog>
        </form>
      ) : null}
    </>
  );
}

/** A dialog driven by client state only, for preview screens. */
export function useDialog() {
  const [state, setState] = useState<null | {
    title: string;
    body?: ReactNode;
    ok: string;
    danger?: boolean;
    onOk: () => void;
  }>(null);
  const node = state ? (
    <Dialog
      title={state.title}
      body={state.body}
      onCancel={() => setState(null)}
      footer={
        <>
          <button type="button" className={btn.secondary} onClick={() => setState(null)}>
            Cancel
          </button>
          <button
            type="button"
            autoFocus
            className={state.danger ? btn.danger : btn.primary}
            onClick={() => {
              state.onOk();
              setState(null);
            }}
          >
            {state.ok}
          </button>
        </>
      }
    />
  ) : null;
  return { ask: setState, node };
}

/** A button that opens a read-only dialog, such as a full inbox message. */
export function InfoDialog({
  trigger,
  triggerClassName,
  title,
  children,
  width = 560,
}: {
  trigger: ReactNode;
  triggerClassName: string;
  title: string;
  children: ReactNode;
  width?: number;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className={triggerClassName} onClick={() => setOpen(true)}>
        {trigger}
      </button>
      {open ? (
        <Dialog
          title={title}
          width={width}
          onCancel={() => setOpen(false)}
          footer={
            <button type="button" autoFocus className={btn.secondary} onClick={() => setOpen(false)}>
              Close
            </button>
          }
        >
          {children}
        </Dialog>
      ) : null}
    </>
  );
}
