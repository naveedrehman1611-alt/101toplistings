import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import { requireRole } from '@/lib/auth';
import { mediaUrl } from '@/lib/media';
import { CONTENT_PAGES, isPageId, sectionFor } from '@/lib/content/registry';
import { defaultSection, readStoredSection } from '@/lib/content/schema';
import { resetContent, saveContent } from '@/lib/content-actions';
import { ContentEditor } from '@/components/admin/content-editor';
import type { MediaOption } from '@/components/admin/media-select';
import { BackLink, btn, card } from '@/components/admin/kit';
import { ConfirmButton } from '@/components/admin/dialog';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Edit content' };

export default async function EditContent({
  params,
}: {
  params: Promise<{ page: string; section: string }>;
}) {
  await requireRole('editor');
  const { page, section } = await params;
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
    <>
      <div className="flex flex-col gap-2.5">
        <BackLink href={`/admin/content?page=${page}`}>{pageSpec.label}</BackLink>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display m-0 text-2xl font-bold text-[#062347]">{spec.label}</h1>
          {row ? (
            <span className="rounded bg-[#FEF3C7] px-1.5 py-px text-[11px] font-semibold text-[#92400E]">
              {row.is_enabled ? 'Edited' : 'Hidden'}
            </span>
          ) : null}
          <div className="ml-auto flex gap-2">
            <a
              href={pageSpec.path}
              target="_blank"
              rel="noopener noreferrer"
              className={`${btn.secondary} hover:no-underline`}
            >
              View page ↗
            </a>
            {row ? (
              <form action={reset}>
                <ConfirmButton
                  className={btn.secondary}
                  title={`Reset “${spec.label}” to original?`}
                  body="Your edits to this section will be replaced with the built-in text and images."
                  ok="Reset section"
                  danger
                >
                  Reset to original
                </ConfirmButton>
              </form>
            ) : null}
          </div>
        </div>
        <div className="text-[13px] text-[#64748B]">
          {spec.description ? `${spec.description} ` : ''}
          {row
            ? `Edited ${new Date(row.updated_at).toLocaleString('en-GB')}.`
            : 'Showing the original content: nothing saved yet.'}{' '}
          Write {'{brand}'} anywhere for the brand name from Settings.
        </div>
      </div>

      <div className={`${card} px-5 pt-1 pb-5`}>
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
      </div>
    </>
  );
}
