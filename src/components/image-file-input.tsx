'use client';

import { useEffect, useEffectEvent, useId, useRef, useState, type ChangeEvent } from 'react';
import { IMAGE_ACCEPT, shrinkImage, type ShrinkVariant } from '@/lib/image-shrink';

type Status =
  | { kind: 'idle' }
  | { kind: 'working' }
  | { kind: 'ready'; file: File; original: File }
  | { kind: 'error'; message: string };

const WAIT_MESSAGE = 'Please wait — the image is still being resized.';

/**
 * A file input that shrinks the picked image in the browser before the form
 * posts it, so several images fit in one Server Action request. Without
 * JavaScript it is a plain file input and the server's own limits still apply.
 */
export function ImageFileInput({
  name,
  variant,
  label,
  hint,
  required,
}: {
  name: string;
  variant: ShrinkVariant;
  label: string;
  hint?: string;
  required?: boolean;
}) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  // Bumped on every pick or clear, so only the latest shrink may touch the input.
  const run = useRef(0);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [preview, setPreview] = useState<string | null>(null);
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);

  // Revokes the previous preview URL when it changes, and the last one on unmount.
  useEffect(() => {
    if (!preview) return;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  function clear() {
    run.current++;
    const input = inputRef.current;
    if (input) {
      input.value = '';
      input.setCustomValidity('');
    }
    setPreview(null);
    setDims(null);
    setStatus({ kind: 'idle' });
  }

  // A form reset (React resets a form after its action runs) empties the input,
  // so the preview has to go with it.
  const onReset = useEffectEvent(() => clear());
  useEffect(() => {
    const form = inputRef.current?.form;
    if (!form) return;
    form.addEventListener('reset', onReset);
    return () => form.removeEventListener('reset', onReset);
  }, []);

  async function process(input: HTMLInputElement) {
    const picked = input.files?.[0];
    if (!picked) {
      clear();
      return;
    }

    const ticket = ++run.current;
    // Blocks submission until the shrunk file is in place, so the raw one never posts.
    input.setCustomValidity(WAIT_MESSAGE);
    setPreview(null);
    setDims(null);
    setStatus({ kind: 'working' });

    try {
      const file = await shrinkImage(picked, variant);
      if (ticket !== run.current) return;
      const dt = new DataTransfer();
      dt.items.add(file);
      input.files = dt.files;
      input.setCustomValidity('');
      setPreview(URL.createObjectURL(file));
      setStatus({ kind: 'ready', file, original: picked });
    } catch (err) {
      if (ticket !== run.current) return;
      input.value = '';
      input.setCustomValidity('');
      setStatus({
        kind: 'error',
        message: err instanceof Error ? err.message : 'That image could not be used.',
      });
    }
  }

  // A file picked before hydration (a slow phone, the form is usable before
  // React attaches onChange) is already in the input on mount: shrink it too,
  // or the raw camera file would post.
  const onMount = useEffectEvent(() => {
    const input = inputRef.current;
    if (input?.files?.length) void process(input);
  });
  useEffect(() => onMount(), []);

  const hintId = hint ? `${id}-hint` : undefined;
  const statusId = `${id}-status`;
  const square = variant === 'logo';

  let statusText = '';
  if (status.kind === 'working') statusText = 'Resizing…';
  if (status.kind === 'ready') {
    const size = dims ? `${dims.w}×${dims.h}` : null;
    const bytes = formatBytes(status.file.size);
    statusText = `${size ? `Resized to ${size}` : 'Resized'} · ${bytes} (was ${formatBytes(status.original.size)})`;
  }

  return (
    <div className="text-sm">
      <label htmlFor={id} className="font-medium">
        {label}
        {required ? <span className="text-error"> *</span> : null}
      </label>
      <input
        ref={inputRef}
        id={id}
        type="file"
        name={name}
        accept={IMAGE_ACCEPT}
        required={required}
        onChange={(e: ChangeEvent<HTMLInputElement>) => void process(e.currentTarget)}
        aria-describedby={[hintId, statusId].filter(Boolean).join(' ')}
        className="mt-1 block w-full text-sm file:mr-3 file:rounded-lg file:border file:border-[var(--border)] file:bg-[var(--surface)] file:px-3 file:py-1.5"
      />
      {hint ? (
        <p id={hintId} className="mt-1 text-xs text-[var(--text-muted)]">
          {hint}
        </p>
      ) : null}

      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element -- next/image cannot load blob: URLs
        <img
          src={preview}
          alt=""
          onLoad={(e) =>
            setDims({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })
          }
          className={`mt-2 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] ${
            square ? 'size-24 object-contain' : 'aspect-[4/3] w-full max-w-48 object-cover'
          }`}
        />
      ) : null}

      <div className="mt-1 flex flex-wrap items-center gap-3">
        <p id={statusId} aria-live="polite" className="text-xs text-[var(--text-muted)]">
          {statusText}
        </p>
        {status.kind === 'ready' || status.kind === 'working' ? (
          <button
            type="button"
            onClick={clear}
            className="hover:text-error text-xs text-[var(--text-muted)] underline"
          >
            Remove
          </button>
        ) : null}
      </div>

      {status.kind === 'error' ? (
        <p role="alert" className="text-error mt-1 text-xs">
          {status.message}
        </p>
      ) : null}
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
