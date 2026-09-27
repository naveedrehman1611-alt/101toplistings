import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-server';
import { requireRole } from '@/lib/auth';
import { deleteMedia, updateMediaAlt, uploadMedia } from '@/lib/media-actions';
import { ACCEPT_ATTR, MAX_UPLOAD_BYTES } from '@/lib/media-upload';
import { mediaUrl } from '@/lib/media';
import { DangerButton, Field, Notice, SubmitButton } from '@/components/admin-ui';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Media' };

type Row = {
  id: string;
  path: string;
  alt: string | null;
  width: number | null;
  height: number | null;
  size_bytes: number | null;
  folder: string | null;
  created_at: string;
};

// One page is plenty for an admin grid; older images stay reachable by filter.
const PAGE_SIZE = 60;

const FOLDERS = [
  { key: 'library', label: 'Library' },
  { key: 'listings', label: 'Listing photos' },
] as const;

function formatBytes(n: number | null) {
  if (!n) return '';
  return n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`;
}

export default async function AdminMedia({
  searchParams,
}: {
  searchParams: Promise<{ folder?: string; ok?: string; error?: string }>;
}) {
  await requireRole('editor');
  const sp = await searchParams;
  const folder = FOLDERS.find((f) => f.key === sp.folder)?.key ?? 'library';

  const supabase = await createClient();
  const { data, count } = await supabase
    .from('media')
    .select('id, path, alt, width, height, size_bytes, folder, created_at', { count: 'exact' })
    .eq('folder', folder)
    .order('created_at', { ascending: false })
    .limit(PAGE_SIZE);
  const rows = (data ?? []) as Row[];

  return (
    <div>
      <h1 className="text-2xl font-semibold">Media</h1>
      <p className="mt-2 text-sm text-[var(--text-muted)]">
        Images uploaded here are public. Listing photos are managed from each listing&apos;s edit
        page; they are shown here so they can be reviewed and their alt text corrected.
      </p>
      <Notice ok={sp.ok} error={sp.error} />

      <form action={uploadMedia} className="surface-card mt-6 grid gap-4 p-5 sm:grid-cols-2">
        <h2 className="text-lg font-semibold sm:col-span-2">Upload an image</h2>
        <label className="block text-sm">
          <span className="font-medium">
            Image<span className="text-red-700"> *</span>
          </span>
          <input
            type="file"
            name="file"
            required
            accept={ACCEPT_ATTR}
            className="mt-2 block w-full text-sm file:mr-3 file:rounded-lg file:border file:border-[var(--border)] file:bg-[var(--surface)] file:px-3 file:py-1.5"
          />
          <span className="mt-1 block text-xs text-[var(--text-muted)]">
            JPEG, PNG, WebP, GIF or AVIF, up to {MAX_UPLOAD_BYTES / 1024 / 1024} MB.
          </span>
        </label>
        <Field
          label="Alt text"
          name="alt"
          hint="Describe what the image shows, for screen readers and search engines."
        />
        <div className="sm:col-span-2">
          <SubmitButton>Upload</SubmitButton>
        </div>
      </form>

      <nav aria-label="Folders" className="mt-8 flex flex-wrap gap-2">
        {FOLDERS.map((f) => (
          <Link
            key={f.key}
            href={`/admin/media?folder=${f.key}`}
            aria-current={f.key === folder ? 'page' : undefined}
            className={`rounded-lg border px-3 py-1.5 text-sm ${
              f.key === folder
                ? 'border-brand-500 bg-brand-50 text-brand-800'
                : 'border-[var(--border)] hover:bg-[var(--surface-2)]'
            }`}
          >
            {f.label}
          </Link>
        ))}
      </nav>

      {rows.length === 0 ? (
        <p className="mt-6 text-sm text-[var(--text-muted)]">No images in this folder yet.</p>
      ) : (
        <>
          <p className="mt-4 text-xs text-[var(--text-muted)]">
            {count && count > rows.length
              ? `Showing the newest ${rows.length} of ${count}.`
              : `${rows.length} image(s).`}
          </p>
          <ul className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((m) => (
              <li key={m.id} className="surface-card overflow-hidden">
                <a
                  href={mediaUrl(m.path)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative block aspect-[4/3] bg-[var(--surface-2)]"
                >
                  <Image
                    src={mediaUrl(m.path)}
                    alt={m.alt ?? ''}
                    fill
                    sizes="(min-width: 1024px) 18rem, (min-width: 640px) 45vw, 90vw"
                    className="object-cover"
                  />
                </a>
                <div className="space-y-3 p-3">
                  <p className="text-xs text-[var(--text-muted)]">
                    {[
                      m.width && m.height ? `${m.width}×${m.height}` : null,
                      formatBytes(m.size_bytes),
                      new Date(m.created_at).toLocaleDateString('en-GB'),
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                  <form action={updateMediaAlt} className="flex items-end gap-2">
                    <input type="hidden" name="id" value={m.id} />
                    <input type="hidden" name="folder" value={folder} />
                    <label className="block flex-1 text-sm">
                      <span className="sr-only">Alt text</span>
                      <input
                        name="alt"
                        maxLength={300}
                        defaultValue={m.alt ?? ''}
                        placeholder="Alt text"
                        className="focus:border-brand-500 h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm outline-none"
                      />
                    </label>
                    <button
                      type="submit"
                      className="h-9 rounded-lg border border-[var(--border)] px-3 text-xs hover:bg-[var(--surface-2)]"
                    >
                      Save
                    </button>
                  </form>
                  <form action={deleteMedia}>
                    <input type="hidden" name="id" value={m.id} />
                    <input type="hidden" name="folder" value={folder} />
                    <DangerButton>Delete</DangerButton>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
