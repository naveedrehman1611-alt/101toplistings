import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import { requireRole } from '@/lib/auth';
import { mediaUrl } from '@/lib/media';
import { CONTENT_PAGES, isPageId, sectionFor } from '@/lib/content/registry';
import { defaultSection, readStoredSection } from '@/lib/content/schema';
import { resetContent, saveContent } from '@/lib/content-actions';
import { ContentEditor } from '@/components/admin/content-editor';
import { Notice } from '@/components/admin-ui';
import type { MediaOption } from '@/components/admin/media-select';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Edit content' };

export default async function EditContent({
  params,
  searchParams,
}: {
  params: Promise<{ page: string; section: string }>;
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  await requireRole('editor');
  const [{ page, section }, sp] = await Promise.all([params, searchParams]);
  const spec = sectionFor(page, section);
  if (!spec || !isPageId(page)) notFound();
  const pageSpec = CONTENT_PAGES[page];

  const supabase = await createClient();
  const [{ data: row }, { data: media }] = await Promise.all([
    supabase
      .from('site_content')
      .select('data, is_enabled, updated_at')
      .eq('key', `${page}.${section}`)
      .maybeSingle(),
    supabase
      .from('media')
      .select('id, path, alt')
      .order('created_at', { ascending: false })
      .limit(500),
  ]);
  const options: MediaOption[] = (
    (media ?? []) as { id: string; path: string; alt: string | null }[]
  ).map((m) => ({ id: m.id, url: mediaUrl(m.path), alt: m.alt }));

  const save = saveContent.bind(null, page, section);
  const reset = resetContent.bind(null, page, section);

  return (
    <div>
      <p className="text-sm">
        <Link href="/admin/content" className="text-brand-700 hover:underline">
          Content
        </Link>{' '}
        / {pageSpec.label}
      </p>
      <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-2xl font-semibold">{spec.label}</h1>
        <Link href={pageSpec.path} className="text-brand-700 text-sm hover:underline">
          View page
        </Link>
      </div>
      {spec.description ? (
        <p className="mt-1 max-w-2xl text-sm text-[var(--text-muted)]">{spec.description}</p>
      ) : null}
      <p className="mt-1 text-xs text-[var(--text-muted)]">
        {row
          ? `Edited ${new Date(row.updated_at).toLocaleString('en-GB')}.`
          : 'Showing the original content: nothing saved yet.'}{' '}
        Write {'{brand}'} anywhere in the text for the brand name from Settings.
      </p>
      <Notice ok={sp.ok} error={sp.error} />

      <ContentEditor
        // A fresh editor after each save, so it starts from what was stored.
        key={row?.updated_at ?? 'default'}
        fields={spec.fields}
        initial={readStoredSection(spec, row?.data)}
        defaults={defaultSection(spec)}
        hideable={spec.hideable !== false}
        visible={row?.is_enabled ?? true}
        media={options}
        action={save}
      />

      {row ? (
        <form action={reset} className="mt-6 border-t border-[var(--border)] pt-4">
          <button
            type="submit"
            className="h-10 rounded-lg border border-[var(--border)] px-4 text-sm hover:bg-[var(--surface-2)]"
          >
            Reset to original
          </button>
          <span className="ml-3 text-xs text-[var(--text-muted)]">
            Deletes your edits to this section and shows the built-in content again.
          </span>
        </form>
      ) : null}
    </div>
  );
}
