'use client';

import {
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type Ref,
} from 'react';
import { SvgIcon } from '@/components/svg-icon';
import { checkIcon, chevronDownIcon, xIcon } from '@/components/icon-nodes';

/**
 * An editable combobox with a listbox popup (WAI-ARIA 1.2): type to filter,
 * arrows / Home / End to move, Enter to choose, Escape to close and then to
 * clear. DOM focus never leaves the input; the active option is conveyed with
 * aria-activedescendant.
 *
 * Controlled: the caller owns `text` (what the input shows) and `value` (the
 * chosen option, or null while the text is free typing). The chosen value is
 * submitted by a hidden input named `name`; `textName` lets the typed text
 * itself submit when nothing is chosen, so the form still works before
 * hydration or without JavaScript.
 *
 * The popup is positioned against the nearest positioned ancestor, so the
 * caller decides what "under the field" spans (the hero uses the whole
 * labelled segment).
 */

export type ComboboxItem = { value: string; label: string; depth?: 0 | 1 };

export type ComboboxHandle = {
  /** Focus the input without opening the popup, e.g. to point at an error. */
  focus: () => void;
};

type Option = { kind: 'item'; item: ComboboxItem } | { kind: 'free'; text: string };

const MAX_OPTIONS = 100;

/** Case- and accent-insensitive form of a string, for matching. */
export function fold(value: string): string {
  return value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

export function Combobox({
  ref,
  id,
  labelId,
  label,
  name,
  textName,
  items,
  placeholder,
  text,
  value,
  onChange,
  allowFreeText = false,
  errorId,
}: {
  ref?: Ref<ComboboxHandle>;
  /** id of the input; the caller's visible <label htmlFor> points at it. */
  id: string;
  /** id of that visible label, which also names the listbox. */
  labelId: string;
  /** The label's text, for the clear button's name. */
  label: string;
  /** Name of the hidden input that submits the chosen value. */
  name: string;
  /** Name the typed text submits under while nothing is chosen. */
  textName?: string;
  items: ComboboxItem[];
  placeholder: string;
  text: string;
  value: string | null;
  onChange: (text: string, value: string | null) => void;
  /** When nothing matches, offer the typed text itself as the first option. */
  allowFreeText?: boolean;
  /** id of an error message about this field; marks the input invalid. */
  errorId?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const quietFocus = useRef(false);
  const listboxId = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  // Filter by the text only once the user has typed; after a choice the input
  // shows the chosen name, and reopening should list everything again.
  const [filtering, setFiltering] = useState(false);

  useImperativeHandle(
    ref,
    () => ({
      focus() {
        quietFocus.current = true;
        inputRef.current?.focus();
        quietFocus.current = false;
      },
    }),
    [],
  );

  const folded = useMemo(() => items.map((item) => fold(item.label)), [items]);
  const query = filtering ? fold(text.trim()) : '';

  const options = useMemo<Option[]>(() => {
    const matches: Option[] = [];
    for (let i = 0; i < items.length && matches.length < MAX_OPTIONS; i++) {
      if (!query || folded[i].includes(query)) matches.push({ kind: 'item', item: items[i] });
    }
    if (!matches.length && allowFreeText && query) {
      return [{ kind: 'free', text: text.trim() }];
    }
    return matches;
  }, [items, folded, query, allowFreeText, text]);

  const optionId = (index: number) => `${listboxId}-${index}`;
  const last = options.length - 1;

  // Keep the active option in view while moving through a long list.
  useEffect(() => {
    if (open && active >= 0) {
      document.getElementById(`${listboxId}-${active}`)?.scrollIntoView({ block: 'nearest' });
    }
  }, [open, active, listboxId]);

  function show() {
    setOpen(true);
    setActive(-1);
  }

  function close() {
    setOpen(false);
    setActive(-1);
  }

  function choose(option: Option) {
    if (option.kind === 'item') onChange(option.item.label, option.item.value);
    else onChange(option.text, null);
    setFiltering(false);
    close();
  }

  function clear(reopen: boolean) {
    onChange('', null);
    setFiltering(false);
    if (reopen) {
      inputRef.current?.focus();
      show();
    } else {
      close();
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.nativeEvent.isComposing) return;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!open) {
          setOpen(true);
          setActive(last >= 0 ? 0 : -1);
        } else if (last >= 0) {
          setActive((a) => Math.min(a + 1, last));
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!open) {
          setOpen(true);
          setActive(last);
        } else if (last >= 0) {
          setActive((a) => (a < 0 ? last : Math.max(a - 1, 0)));
        }
        break;
      case 'Home':
      case 'End':
        if (!open || last < 0) return;
        event.preventDefault();
        setActive(event.key === 'Home' ? 0 : last);
        break;
      case 'Enter':
        // With an active option Enter chooses it; otherwise the form submits.
        if (open && active >= 0 && options[active]) {
          event.preventDefault();
          choose(options[active]);
        } else {
          close();
        }
        break;
      case 'Escape':
        if (open) {
          event.preventDefault();
          close();
        } else if (text || value) {
          event.preventDefault();
          clear(false);
        }
        break;
      case 'Tab':
        close();
        break;
    }
  }

  return (
    <div className="flex h-full min-w-0 flex-1 items-center">
      <input
        ref={inputRef}
        id={id}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={open && active >= 0 ? optionId(active) : undefined}
        aria-invalid={errorId ? true : undefined}
        aria-describedby={errorId}
        name={value ? undefined : textName}
        value={text}
        placeholder={placeholder}
        maxLength={100}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="search"
        onChange={(event) => {
          onChange(event.target.value, null);
          setFiltering(true);
          show();
        }}
        onKeyDown={onKeyDown}
        onFocus={() => {
          if (!quietFocus.current) show();
        }}
        onClick={() => {
          if (!open) show();
        }}
        onBlur={close}
        // The labelled segment around the field draws the focus ring instead.
        // 16px on phones, where iOS zooms into any smaller input on focus.
        className="text-ink-900 placeholder:text-ink-500 h-full w-full min-w-0 flex-1 truncate bg-transparent text-base outline-none! md:text-sm"
      />
      {value ? <input type="hidden" name={name} value={value} /> : null}

      {text || value ? (
        <button
          type="button"
          aria-label={`Clear ${label}`}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => clear(true)}
          className="text-ink-500 hover:text-ink-900 grid size-11 shrink-0 place-items-center rounded-full transition-colors md:size-8"
        >
          <SvgIcon node={xIcon} size={16} strokeWidth={2} />
        </button>
      ) : (
        // A pointer shortcut only: keyboard users open the list with the arrow keys.
        <span
          aria-hidden="true"
          onMouseDown={(event) => {
            event.preventDefault();
            if (open) {
              close();
            } else {
              inputRef.current?.focus();
              show();
            }
          }}
          className="text-ink-500 grid size-11 shrink-0 cursor-pointer place-items-center md:size-8"
        >
          <SvgIcon
            node={chevronDownIcon}
            size={16}
            strokeWidth={2}
            className={`transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </span>
      )}

      <ul
        id={listboxId}
        role="listbox"
        aria-labelledby={labelId}
        hidden={!open}
        // Clicks inside the popup (options, its scrollbar) must not blur the input.
        onMouseDown={(event) => event.preventDefault()}
        className="absolute inset-x-0 top-full z-50 mt-2 max-h-[280px] overflow-y-auto overscroll-contain rounded-xl bg-white py-2 text-left shadow-[var(--shadow-raised)] ring-1 ring-black/5 md:right-auto md:w-full md:min-w-[18rem]"
      >
        {open && options.length === 0 ? (
          <li
            role="option"
            aria-selected="false"
            aria-disabled="true"
            className="text-ink-500 px-4 py-2.5 text-sm"
          >
            No matches
          </li>
        ) : null}
        {open
          ? options.map((option, index) => {
              const chosen = option.kind === 'item' && option.item.value === value;
              const depth = option.kind === 'item' ? option.item.depth : undefined;
              return (
                <li
                  key={option.kind === 'item' ? option.item.value : 'free-text'}
                  id={optionId(index)}
                  role="option"
                  aria-selected={index === active}
                  onMouseMove={() => {
                    if (index !== active) setActive(index);
                  }}
                  onClick={() => choose(option)}
                  className={`flex cursor-pointer items-center gap-2 py-2.5 pr-4 text-sm leading-snug ${
                    depth === 1 ? 'pl-7' : 'pl-4'
                  } ${depth === 0 ? 'text-brand-700 font-semibold' : 'text-ink-900'} ${
                    index === active ? 'bg-brand-50' : ''
                  }`}
                >
                  <span className="min-w-0 flex-1">
                    {option.kind === 'free' ? `Search for “${option.text}”` : option.item.label}
                  </span>
                  {chosen ? (
                    <SvgIcon
                      node={checkIcon}
                      size={16}
                      strokeWidth={2}
                      className="text-brand-700 shrink-0"
                    />
                  ) : null}
                </li>
              );
            })
          : null}
      </ul>
    </div>
  );
}
