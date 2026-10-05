import Image from 'next/image';
import Link from 'next/link';

export type MediaOption = { id: string; url: string; alt: string | null };

const selectCls =
  'mt-1 h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm outline-none focus:border-brand-500';

/** Alt text identifies an image best; the file name tells apart two with the same alt. */
function optionLabel(option: MediaOption): string {
  const file = option.url.split('/').pop() ?? option.url;
  const alt = option.alt?.trim();
  return alt ? `${alt} (${file})` : file;
}

/**
 * Picks an image from the media library for a form field. It is a plain
 * <select> so the form works without client JavaScript, which also means the
 * preview shows the saved image rather than following the selection.
 */
export function MediaSelect({
  name,
  label,
  options,
  defaultValue,
  hint,
}: {
  name: string;
  label: string;
  options: MediaOption[];
  defaultValue?: string | null;
  hint?: string;
}) {
  const saved = defaultValue ? options.find((o) => o.id === defaultValue) : undefined;
  // A saved image outside the list (an older upload, or a listing photo) keeps
  // an option of its own, so saving the form never clears it by accident.
  const unlisted = defaultValue && !saved ? defaultValue : null;

  return (
    <div className="text-sm">
      <label className="block">
        <span className="font-medium">{label}</span>
        <select name={name} defaultValue={defaultValue ?? ''} className={selectCls}>
          <option value="">No image</option>
          {unlisted ? (
            <option value={unlisted}>Saved image (not in the library list)</option>
          ) : null}
          {options.map((o) => (
            <option key={o.id} value={o.id}>
              {optionLabel(o)}
            </option>
          ))}
        </select>
      </label>
      <div className="mt-2 flex items-center gap-3">
        {saved ? (
          <Image
            src={saved.url}
            alt={saved.alt ?? ''}
            width={96}
            height={64}
            sizes="96px"
            className="h-16 w-24 shrink-0 rounded-md border border-[var(--border)] object-cover"
          />
        ) : (
          <span className="flex h-16 w-24 shrink-0 items-center justify-center rounded-md bg-[var(--surface-2)] text-xs text-[var(--text-muted)]">
            {unlisted ? 'No preview' : 'No image'}
          </span>
        )}
        <Link href="/admin/media" className="text-brand-700 text-xs hover:underline">
          Upload images in Media
        </Link>
      </div>
      {hint ? <span className="mt-1 block text-xs text-[var(--text-muted)]">{hint}</span> : null}
    </div>
  );
}
