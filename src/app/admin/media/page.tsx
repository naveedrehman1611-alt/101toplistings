import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { requireRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { Card, FilterTabs, PageHeader, Pager, TableShell, Td, Th } from '@/components/admin/chrome';
import { EmptyState } from '@/components/ui';

export const metadata: Metadata = { title: 'Media' };

const PER_PAGE = 25;
const BASE = '/admin/media';
const BUCKET = 'listing-media';

const VIEWS = ['all', 'missing_alt', 'unused'] as const;
type View = (typeof VIEWS)[number];

const VIEW_LABELS: Record<View, string> = {
  all: 'All files',
  missing_alt: 'No alt text',
  unused: 'Unused',
};

type MediaRow = {
  id: string;
  path: string;
  alt: string | null;
  width: number | null;
  height: number | null;
  size_bytes: number | null;
  mime_type: string | null;
  folder: string | null;
  created_at: string;
};

function parseView(raw: string | undefined): View {
  return (VIEWS as readonly string[]).includes(raw ?? '') ? (raw as View) : 'all';
}

function parsePage(raw: string | undefined): number {
  const n = Number.parseInt(raw ?? '1', 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function formatSize(bytes: number | null): string {
  if (bytes === null) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * media.path is the object path inside the bucket. next.config.ts only permits
 * /storage/v1/object/public/listing-media/**, so anything that would resolve
 * outside that prefix is rendered as a missing thumbnail rather than handed to
 * the image optimizer.
 */
function publicUrl(path: string): string | null {
  const origin = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!origin) return null;
  const clean = path.replace(/^\/+/, '').replace(new RegExp(`^${BUCKET}/`), '');
  if (clean.length === 0 || clean.includes('..')) return null;
  return `${origin}/storage/v1/object/public/${BUCKET}/${clean}`;
}

function hasAlt(row: MediaRow): boolean {
  return typeof row.alt === 'string' && row.alt.trim().length > 0;
}

export default async function MediaPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; page?: string }>;
}) {
  // Media is editor territory in the nav and in media_editor_write; this page is
  // read-only, but it exposes the whole library, so it is gated the same way.
  await requireRole('editor', BASE);
  const sp = await searchParams;

  const view = parseView(sp.view);
  const page = parsePage(sp.page);

  const supabase = await createClient();

  /**
   * The library is materialised rather than paged in Postgres, because "used by
   * nothing" is an anti-join against listing_images and PostgREST cannot express
   * one. Both tables are read in batches so a single default row cap cannot
   * silently truncate the answer and turn a used file into a fake orphan.
   */
  async function readAll<T>(table: string, columns: string, orderBy: string): Promise<T[]> {
    const size = 1000;
    const out: T[] = [];
    for (let offset = 0; offset < 100_000; offset += size) {
      const { data } = await supabase
        .from(table)
        .select(columns)
        .order(orderBy, { ascending: true })
        .range(offset, offset + size - 1);
      const batch = (data ?? []) as T[];
      out.push(...batch);
      if (batch.length < size) break;
    }
    return out;
  }

  const [library, usage] = await Promise.all([
    readAll<MediaRow>(
      'media',
      'id, path, alt, width, height, size_bytes, mime_type, folder, created_at',
      'id',
    ),
    readAll<{ media_id: string | null; listing_id: string }>(
      'listing_images',
      'media_id, listing_id',
      'id',
    ),
  ]);

  const usedBy = new Map<string, string[]>();
  for (const row of usage) {
    if (!row.media_id) continue;
    const existing = usedBy.get(row.media_id);
    if (existing) existing.push(row.listing_id);
    else usedBy.set(row.media_id, [row.listing_id]);
  }

  const matches = (row: MediaRow, value: View): boolean => {
    if (value === 'missing_alt') return !hasAlt(row);
    if (value === 'unused') return !usedBy.has(row.id);
    return true;
  };

  const counts = VIEWS.map((value) => ({
    value,
    count: library.filter((row) => matches(row, value)).length,
  }));

  const filtered = library
    .filter((row) => matches(row, view))
    .sort((a, b) => b.created_at.localeCompare(a.created_at));

  const pageCount = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, pageCount);
  const rows = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  const listingIds = [...new Set(rows.flatMap((row) => usedBy.get(row.id) ?? []))];
  const listingsResult = listingIds.length
    ? await supabase.from('listings').select('id, slug, name').in('id', listingIds)
    : { data: [] };
  const listings = new Map(
    ((listingsResult.data ?? []) as { id: string; slug: string; name: string }[]).map((l) => [
      l.id,
      l,
    ]),
  );

  return (
    <>
      <PageHeader
        title="Media"
        description="Every uploaded file, and where it is used. Read-only — images are attached and detached on the listing itself."
      />

      <FilterTabs
        basePath={BASE}
        param="view"
        current={view}
        options={counts.map((c) => ({
          value: c.value,
          label: VIEW_LABELS[c.value],
          count: c.count,
        }))}
      />

      <Card className="p-4 text-xs text-[var(--text-muted)]">
        A file with no alt text is invisible to screen readers and to image search, and a file used
        by nothing is paying for storage it does not earn. Neither shows up anywhere else in the
        admin, which is why both are surfaced here.
      </Card>

      {rows.length === 0 ? (
        <EmptyState
          title="Nothing to show"
          body={
            view === 'all'
              ? 'No file has been uploaded yet. Images are added while editing a listing.'
              : 'No file matches this filter — which is the result you want.'
          }
        />
      ) : (
        <TableShell>
          <thead>
            <tr>
              <Th>File</Th>
              <Th>Alt text</Th>
              <Th>Dimensions</Th>
              <Th>Type</Th>
              <Th>Size</Th>
              <Th>Uploaded</Th>
              <Th>Used by</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const src = publicUrl(row.path);
              const used = usedBy.get(row.id) ?? [];
              return (
                <tr key={row.id} className="align-top">
                  <Td>
                    <div className="flex items-start gap-3">
                      <span className="bg-ink-100 block size-16 shrink-0 overflow-hidden rounded-lg">
                        {src ? (
                          <Image
                            src={src}
                            alt={row.alt ?? ''}
                            width={64}
                            height={64}
                            className="size-16 object-cover"
                          />
                        ) : null}
                      </span>
                      <span className="block max-w-56 font-mono text-xs break-all text-[var(--text-muted)]">
                        {row.path}
                        {row.folder ? (
                          <span className="mt-0.5 block font-sans">{row.folder}</span>
                        ) : null}
                      </span>
                    </div>
                  </Td>
                  <Td className="max-w-64">
                    {hasAlt(row) ? (
                      <span className="text-sm">{row.alt}</span>
                    ) : (
                      <span className="bg-accent-400/20 text-accent-600 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
                        No alt text
                      </span>
                    )}
                  </Td>
                  <Td className="text-xs tabular-nums">
                    {row.width && row.height ? `${row.width} × ${row.height}` : '—'}
                  </Td>
                  <Td className="text-xs">{row.mime_type ?? '—'}</Td>
                  <Td className="text-xs tabular-nums">{formatSize(row.size_bytes)}</Td>
                  <Td className="text-xs">{formatDate(row.created_at)}</Td>
                  <Td>
                    {used.length === 0 ? (
                      <span className="bg-ink-100 text-ink-600 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
                        Orphan
                      </span>
                    ) : (
                      <ul className="flex flex-col gap-0.5">
                        {[...new Set(used)].map((id) => {
                          const listing = listings.get(id);
                          return (
                            <li key={id} className="text-xs">
                              {listing ? (
                                <Link
                                  href={`/listing/${listing.slug}`}
                                  className="text-brand-700 hover:underline"
                                >
                                  {listing.name}
                                </Link>
                              ) : (
                                <span className="text-[var(--text-muted)]">Hidden listing</span>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </TableShell>
      )}

      <Pager
        basePath={BASE}
        query={{ view: view !== 'all' ? view : undefined }}
        page={safePage}
        pageCount={pageCount}
      />
    </>
  );
}
