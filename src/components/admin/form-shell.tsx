'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Dialog } from './dialog';
import { NewBadge, btn } from './kit';

export type Panel = {
  id: string;
  label: string;
  isNew?: boolean;
  content: ReactNode;
  /**
   * Rendered outside the <form>, for panels with forms of their own (HTML
   * forms cannot nest), such as the listing's image uploads.
   */
  outside?: boolean;
};

/** Tab strip: navy label and a green underline on the active tab. */
export function Tabs({
  tabs,
  active,
  onSelect,
}: {
  tabs: { id: string; label: string; isNew?: boolean }[];
  active: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div role="tablist" className="flex gap-[22px] overflow-x-auto border-b border-[#E2E8F0]">
      {tabs.map((t) => {
        const on = t.id === active;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onSelect(t.id)}
            className="-mb-px flex shrink-0 cursor-pointer items-center gap-1.5 border-0 border-b-2 border-solid bg-transparent px-0.5 py-2.5 text-[13.5px] font-semibold whitespace-nowrap"
            style={{
              color: on ? '#062347' : '#64748B',
              borderBottomColor: on ? '#0C8226' : 'transparent',
            }}
          >
            {t.label}
            {t.isNew ? <NewBadge /> : null}
          </button>
        );
      })}
    </div>
  );
}

function SaveButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={`${btn.primary} px-4`}>
      {pending ? 'Saving…' : label}
    </button>
  );
}

/** Clears the dirty flag once a submission finishes. */
function Settled({ onSettled }: { onSettled: () => void }) {
  const { pending } = useFormStatus();
  const was = useRef(false);
  useEffect(() => {
    if (was.current && !pending) onSettled();
    was.current = pending;
  }, [pending, onSettled]);
  return null;
}

/**
 * A long form in the admin style. Every panel stays in the DOM (inactive tabs
 * are only hidden), so one submit posts every field to the server action, as
 * the old single-page forms did.
 *
 * Changing any field shows a sticky "You have unsaved changes" bar with Discard
 * and Save. While there are unsaved changes, following a link asks first and
 * closing the tab triggers the browser's own warning.
 */
export function FormShell({
  action,
  panels,
  hidden,
  saveLabel = 'Save changes',
  alwaysShowBar = false,
  tabsAbove,
}: {
  action: (fd: FormData) => void | Promise<void>;
  panels: Panel[];
  /** Hidden inputs such as the row id. */
  hidden?: ReactNode;
  saveLabel?: string;
  /** Show the bar before any edit, for a create form that has no other button. */
  alwaysShowBar?: boolean;
  /** Content between the tabs and the panels, such as a live preview. */
  tabsAbove?: ReactNode;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const [tab, setTab] = useState(panels[0]?.id ?? '');
  const [dirty, setDirty] = useState(false);
  const [leaveTo, setLeaveTo] = useState<string | null>(null);
  // Bumped by Discard: remounting the panels restores every field, including
  // editors that keep their own state and so ignore form.reset().
  const [generation, setGeneration] = useState(0);
  const settle = useCallback(() => setDirty(false), []);

  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    // Capture phase, so the check runs before next/link navigates.
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const a = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      e.preventDefault();
      e.stopPropagation();
      setLeaveTo(url.pathname + url.search);
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    document.addEventListener('click', onClick, true);
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
      document.removeEventListener('click', onClick, true);
    };
  }, [dirty]);

  // A field that fails validation in a hidden tab would block submit silently;
  // switch to its tab so the browser can show the message. `invalid` does not
  // bubble, but a capture listener on the form still sees it.
  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    const onInvalid = (e: Event) => {
      const id = (e.target as Element).closest('[data-panel]')?.getAttribute('data-panel');
      if (id) setTab(id);
    };
    form.addEventListener('invalid', onInvalid, true);
    return () => form.removeEventListener('invalid', onInvalid, true);
  }, []);

  const inner = panels.filter((p) => !p.outside);
  const outer = panels.filter((p) => p.outside);

  // The form is display:contents, so its panels, the outside panels and the
  // sticky bar all sit in one column in tab order, while only the inside
  // panels' fields post with it.
  return (
    <div className="flex flex-col gap-5">
      {panels.length > 1 ? <Tabs tabs={panels} active={tab} onSelect={setTab} /> : null}
      {tabsAbove}
      {outer.map((p) => (
        <div
          key={`${p.id}-${generation}`}
          hidden={p.id !== tab}
          className="order-1 flex flex-col gap-4"
        >
          {p.content}
        </div>
      ))}
      <form
        ref={formRef}
        action={action}
        onChange={() => setDirty(true)}
        onInput={() => setDirty(true)}
        className="contents"
      >
        {hidden}
        <Settled onSettled={settle} />
        {inner.map((p) => (
          <div
            key={`${p.id}-${generation}`}
            data-panel={p.id}
            hidden={p.id !== tab}
            className="flex flex-col gap-4"
          >
            {p.content}
          </div>
        ))}

        {dirty || alwaysShowBar ? (
          <div className="sticky bottom-0 z-[5] order-2 -mx-6 -mb-12 flex items-center gap-3 border-t border-[#E2E8F0] bg-white px-8 py-3 shadow-[0_-4px_16px_rgba(6,35,71,.06)]">
            {dirty ? (
              <>
                <span aria-hidden className="size-2 rounded-full bg-[#F59E0B]" />
                <span className="text-[13.5px] font-semibold">You have unsaved changes</span>
              </>
            ) : null}
            <div className="ml-auto flex gap-3">
              {dirty ? (
                <button
                  type="button"
                  className={btn.secondary}
                  onClick={() => {
                    formRef.current?.reset();
                    setGeneration((g) => g + 1);
                    setDirty(false);
                  }}
                >
                  Discard
                </button>
              ) : null}
              <SaveButton label={saveLabel} />
            </div>
          </div>
        ) : null}

        {leaveTo ? (
          <Dialog
            title="Discard unsaved changes?"
            body="You have edits on this page that haven’t been saved."
            onCancel={() => setLeaveTo(null)}
            footer={
              <>
                <button type="button" className={btn.secondary} onClick={() => setLeaveTo(null)}>
                  Keep editing
                </button>
                <button
                  type="button"
                  autoFocus
                  className={btn.danger}
                  onClick={() => {
                    const to = leaveTo;
                    setLeaveTo(null);
                    setDirty(false);
                    router.push(to);
                  }}
                >
                  Discard changes
                </button>
              </>
            }
          />
        ) : null}
      </form>
    </div>
  );
}
