import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-server';
import { requireRole } from '@/lib/auth';
import { deleteMedia, updateMediaAlt, uploadMedia } from '@/lib/media-actions';
import { ACCEPT_ATTR, MAX_UPLOAD_BYTES } from '@/lib/media-upload';
import { mediaUrl } from '@/lib/media';
import { FormField, PageHeader, btn, card, inputCls } from '@/components/admin/kit';
import { ConfirmButton, ModalForm } from '@/components/admin/dialog';
import { AltField } from '@/components/admin/alt-field';

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

// One page is plenty for an admin grid; older images stay reachable by folder.
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
  searchParams: Promise<{ folder?: string }>;
}) {
  await requireRole('editor');
  const sp = await searchParams;
  const folder = FOLDERS.find((f) => f.key === sp.folder)?.key ?? 'library';

  const supabase = await createClient();
  const [{ data, count }, ...counts] = await Promise.all([
    supabase
      .from('media')
      .select('id, path, alt, width, height, size_bytes, folder, created_at', { count: 'exact' })
      .eq('folder', folder)
      .order('created_at', { ascending: false })
      .limit(PAGE_SIZE),
    ...FOLDERS.map(
      async (f) =>
        (
          await supabase
            .from('media')
            .select('id', { count: 'exact', head: true })
            .eq('folder', f.key)
        ).count ?? 0,
    ),
  ]);
  const rows = (data ?? []) as Row[];
  const missing = rows.filter((m) => !m.alt?.trim()).length;

  return (
    <>
      <PageHeader
        title="Media"
        description="Uploaded images. Add alt text for accessibility and SEO. Listing photos are managed from each listing’s edit page."
      >
        <ModalForm
          trigger="Upload image"
          triggerClassName={btn.primary}
          title="Upload an image"
          body={`JPEG, PNG, WebP, GIF or AVIF, up to ${MAX_UPLOAD_BYTES / 1024 / 1024} MB. Images uploaded here are public.`}
          action={uploadMedia}
          ok="Upload"
        >
          <FormField label="Image" htmlFor="m-file" required>
            <input
              id="m-file"
              type="file"
              name="file"
              required
              accept={ACCEPT_ATTR}
              className="block w-full text-sm file:mr-3 file:h-8 file:rounded-md file:border file:border-solid file:border-[#E2E8F0] file:bg-white file:px-3 file:font-semibold"
            />
          </FormField>
          <FormField
            label="Alt text"
            htmlFor="m-alt"
            help="Describe what the image shows, for screen readers and search engines."
          >
            <input id="m-alt" name="alt" maxLength={300} className={inputCls} />
          </FormField>
        </ModalForm>
      </PageHeader>

      <div className="flex flex-wrap items-center gap-1">
        {FOLDERS.map((f, i) => {
          const on = f.key === folder;
          return (
            <Link
              key={f.key}
              href={`/admin/media?folder=${f.key}`}
              aria-current={on ? 'page' : undefined}
              className="flex h-[30px] items-center gap-1.5 rounded-lg border px-2.5 text-[13px] font-semibold hover:no-underline"
              style={{
                background: on ? '#062347' : '#fff',
                color: on ? '#fff' : '#334155',
                borderColor: on ? '#062347' : '#E2E8F0',
              }}
            >
              {f.label}
              <span className="text-[11.5px] opacity-70">{counts[i]}</span>
            </Link>
          );
        })}
        <span className="ml-auto text-[13px] text-[#64748B]">
          {count && count > rows.length
            ? `Newest ${rows.length} of ${count}`
            : `${rows.length} images`}
          {missing ? ` · ${missing} missing alt text` : ''}
        </span>
      </div>

      {rows.length === 0 ? (
        <div className={`${card} px-4 py-12 text-center text-sm text-[#64748B]`}>
          No images in this folder yet.
        </div>
      ) : (
        <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3.5 p-0">
          {rows.map((m) => {
            const name = m.path.split('/').pop() ?? m.path;
            const hasAlt = !!m.alt?.trim();
            return (
              <li key={m.id} className={`${card} overflow-hidden`}>
                <a
                  href={mediaUrl(m.path)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative block aspect-[4/3] bg-[#F1F5F9]"
                >
                  <Image
                    src={mediaUrl(m.path)}
                    alt={m.alt ?? ''}
                    fill
                    sizes="(min-width: 1024px) 16rem, 45vw"
                    className="object-cover"
                  />
                </a>
                <div className="flex flex-col gap-2 px-3 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="flex-1 truncate font-mono text-[12.5px] font-semibold"
                      title={name}
                    >
                      {name}
                    </span>
                    <span className="text-[11.5px] whitespace-nowrap text-[#94A3B8]">
                      {[
                        m.width && m.height ? `${m.width}×${m.height}` : null,
                        formatBytes(m.size_bytes),
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                  </div>
                  <form action={updateMediaAlt}>
                    <input type="hidden" name="id" value={m.id} />
                    <input type="hidden" name="folder" value={folder} />
                    <AltField defaultValue={m.alt ?? ''} />
                  </form>
                  <div className="flex items-center">
                    <span
                      className="flex-1 text-[11.5px] font-medium"
                      style={{ color: hasAlt ? '#64748B' : '#92400E' }}
                    >
                      {hasAlt ? 'Alt text set' : 'Missing alt text'}
                    </span>
                    <form action={deleteMedia}>
                      <input type="hidden" name="id" value={m.id} />
                      <input type="hidden" name="folder" value={folder} />
                      <ConfirmButton
                        className="cursor-pointer border-0 bg-transparent text-[12.5px] font-semibold text-[#B91C1C]"
                        title="Delete this image permanently?"
                        body={`${name} is removed from the library and from any page that uses it. This can’t be undone.`}
                        ok="Delete permanently"
                        danger
                      >
                        Delete
                      </ConfirmButton>
                    </form>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
