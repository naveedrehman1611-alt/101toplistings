'use client';

import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  useTransition,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { getSavedState, toggleSavedListing } from '@/lib/saved-listing-actions';

const ACTION =
  'inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[var(--border)] px-4 text-sm font-medium hover:bg-[var(--surface-2)] disabled:opacity-60';
const MENU_ITEM =
  'block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-[var(--surface-2)] focus-visible:bg-[var(--surface-2)]';

// The Web Share API never changes during a visit, so there is nothing to
// subscribe to. The server snapshot is false: the menu is the markup every
// browser starts from, and hydration swaps in the native sheet where it exists.
const noSubscription = () => () => {};
const hasNativeShare = () => typeof navigator.share === 'function';
const noNativeShareOnServer = () => false;

type ToggleResult = Awaited<ReturnType<typeof toggleSavedListing>>;

/**
 * Share / Save / Submit Review under the listing heading. The page is
 * ISR-static, so nothing here is known at render: whether the visitor has
 * saved the listing is asked for after hydration, and only when a Supabase
 * session cookie exists, so anonymous visitors never trigger a request.
 */
export function ListingActions({
  listingId,
  slug,
  name,
  shareUrl,
}: {
  listingId: string;
  slug: string;
  name: string;
  shareUrl: string;
}) {
  const id = useId();
  const menuId = `${id}-share-menu`;
  const triggerId = `${id}-share`;
  const nativeShare = useSyncExternalStore(noSubscription, hasNativeShare, noNativeShareOnServer);

  const [menuOpen, setMenuOpen] = useState(false);
  const [copyNote, setCopyNote] = useState<'copied' | 'failed' | null>(null);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const saveRef = useRef<HTMLButtonElement>(null);
  const clickedSave = useRef(false);
  const noteTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    // "-auth-token" is the suffix of the Supabase session cookie (sb-<ref>-auth-token).
    if (!document.cookie.includes('-auth-token')) return;
    let current = true;
    getSavedState(listingId).then(
      (state) => {
        // A click that raced this request already knows the newer state.
        if (current && !clickedSave.current) setSaved(state.saved);
      },
      () => {
        // Unknown state reads as "Save"; the toggle reports its own errors.
      },
    );
    return () => {
      current = false;
    };
  }, [listingId]);

  useEffect(() => {
    if (!menuOpen) return;
    menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();

    function onPointerDown(e: PointerEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setMenuOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Escape') return;
      setMenuOpen(false);
      triggerRef.current?.focus();
    }
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  function closeMenu() {
    setMenuOpen(false);
    triggerRef.current?.focus();
  }

  function share() {
    setCopyNote(null);
    if (!nativeShare) {
      setMenuOpen((open) => !open);
      return;
    }
    navigator.share({ title: name, url: shareUrl }).catch((e: unknown) => {
      // AbortError means the visitor dismissed the share sheet. Anything else
      // (a browser refusing the data, say) falls back to the menu.
      if (!(e instanceof DOMException && e.name === 'AbortError')) setMenuOpen(true);
    });
  }

  function copyLink() {
    closeMenu();
    const report = (note: 'copied' | 'failed') => {
      setCopyNote(note);
      window.clearTimeout(noteTimer.current);
      noteTimer.current = window.setTimeout(() => setCopyNote(null), 4000);
    };
    if (!navigator.clipboard) {
      report('failed');
      return;
    }
    navigator.clipboard.writeText(shareUrl).then(
      () => report('copied'),
      () => report('failed'),
    );
  }

  // Menu button pattern: arrows and Home/End move between items, Tab leaves.
  function onMenuKeyDown(e: ReactKeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Tab') {
      e.preventDefault();
      setMenuOpen(false);
      (e.shiftKey ? triggerRef : saveRef).current?.focus();
      return;
    }
    const items = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('[role="menuitem"]'));
    const at = items.indexOf(document.activeElement as HTMLElement);
    const next =
      e.key === 'ArrowDown'
        ? (at + 1) % items.length
        : e.key === 'ArrowUp'
          ? (at - 1 + items.length) % items.length
          : e.key === 'Home'
            ? 0
            : e.key === 'End'
              ? items.length - 1
              : -1;
    if (next < 0) return;
    e.preventDefault();
    items[next]?.focus();
  }

  function toggleSave() {
    clickedSave.current = true;
    setSaveError(null);
    startTransition(async () => {
      let result: ToggleResult;
      try {
        result = await toggleSavedListing(listingId);
      } catch {
        result = { status: 'error' };
      }
      if (result.status === 'signin') {
        // Inside the transition, so the button stays busy until /login renders.
        router.push(`/login?next=${encodeURIComponent(`/listing/${slug}`)}`);
        return;
      }
      startTransition(() => {
        if (result.status === 'error') {
          setSaveError(result.message ?? 'Could not update your saved listings. Please try again.');
        } else {
          setSaved(result.status === 'saved');
        }
      });
    });
  }

  const url = encodeURIComponent(shareUrl);
  const title = encodeURIComponent(name);
  const networks = [
    { label: 'WhatsApp', href: `https://wa.me/?text=${encodeURIComponent(`${name} ${shareUrl}`)}` },
    { label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${url}` },
    { label: 'X (Twitter)', href: `https://twitter.com/intent/tweet?url=${url}&text=${title}` },
    { label: 'LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${url}` },
  ];
  const mailto = `mailto:?subject=${title}&body=${encodeURIComponent(`${name}\n${shareUrl}`)}`;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <div ref={wrapRef} className="relative">
          <button
            ref={triggerRef}
            id={triggerId}
            type="button"
            onClick={share}
            aria-haspopup={nativeShare ? undefined : 'menu'}
            aria-expanded={nativeShare ? undefined : menuOpen}
            aria-controls={menuOpen ? menuId : undefined}
            className={ACTION}
          >
            <Icon>
              <path d="M12 15V3" />
              <path d="m8 7 4-4 4 4" />
              <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
            </Icon>
            Share
          </button>
          {menuOpen ? (
            <div
              ref={menuRef}
              id={menuId}
              role="menu"
              aria-labelledby={triggerId}
              onKeyDown={onMenuKeyDown}
              className="surface-card absolute top-full left-0 z-20 mt-2 w-52 p-1.5 shadow-lg"
            >
              <button
                type="button"
                role="menuitem"
                tabIndex={-1}
                onClick={copyLink}
                className={MENU_ITEM}
              >
                Copy link
              </button>
              {networks.map((n) => (
                <a
                  key={n.label}
                  role="menuitem"
                  tabIndex={-1}
                  href={n.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={closeMenu}
                  className={MENU_ITEM}
                >
                  {n.label}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              ))}
              <a
                role="menuitem"
                tabIndex={-1}
                href={mailto}
                onClick={closeMenu}
                className={MENU_ITEM}
              >
                Email
              </a>
            </div>
          ) : null}
        </div>

        <button
          ref={saveRef}
          type="button"
          onClick={toggleSave}
          disabled={pending}
          aria-pressed={saved}
          className={ACTION}
        >
          <Icon fill={saved ? 'currentColor' : 'none'}>
            <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4.5L5 21V4a1 1 0 0 1 1-1Z" />
          </Icon>
          {saved ? 'Saved' : 'Save'}
        </button>

        <a href="#reviews" className={ACTION}>
          <Icon>
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </Icon>
          Submit Review
        </a>
      </div>

      <p role="status" className="text-sm text-emerald-700 [&:not(:empty)]:mt-2">
        {copyNote === 'copied' ? 'Link copied' : ''}
      </p>
      {copyNote === 'failed' ? (
        <p role="alert" className="mt-2 text-xs text-red-700">
          Could not copy the link. Copy it from the address bar instead.
        </p>
      ) : null}
      {saveError ? (
        <p role="alert" className="mt-2 text-xs text-red-700">
          {saveError}
        </p>
      ) : null}
    </div>
  );
}

function Icon({ children, fill = 'none' }: { children: ReactNode; fill?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill={fill}
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4 shrink-0"
    >
      {children}
    </svg>
  );
}
