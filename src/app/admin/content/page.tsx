import Link from 'next/link';
import { createClient } from '@/lib/supabase-server';
import { requireRole } from '@/lib/auth';
import { CONTENT_PAGES } from '@/lib/content/registry';
import type { PageSpec } from '@/lib/content/schema';
import { resetContent } from '@/lib/content-actions';
import { ErrorNotice, PageHeader, btn, card } from '@/components/admin/kit';
import { ConfirmButton } from '@/components/admin/dialog';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Content' };

type Row = { key: string; is_enabled: boolean; updated_at: string };

export default async function AdminContent({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireRole('editor');
  const sp = await searchParams;
  const supabase = await createClient();
  const { data, error } = await supabase.from('site_content').select('key, is_enabled, updated_at');
  const rows = new Map(((data ?? []) as Row[]).map((r) => [r.key, r]));
  const pages = Object.entries(CONTENT_PAGES as Record<string, PageSpec>);
  const [pageId, page] = pages.find(([id]) => id === sp.page) ?? pages[0] ?? [];

  return (
    <>
      <PageHeader
        title="Content"
        description="Edit text, links and images on public pages without code. A section you haven’t edited shows its original content."
      />
      {error ? (
        <ErrorNotice>
          Could not read saved content: {error.message}. Has migration 0027 been applied?
        </ErrorNotice>
      ) : null}

      <div className="grid grid-cols-[220px_minmax(0,1fr)] items-start gap-5">
        <nav
          aria-label="Pages"
          className={`${card} sticky top-0 flex max-h-[calc(100vh-140px)] flex-col gap-0.5 overflow-auto p-2`}
        >
          {pages.map(([id, p]) => {
            const n = Object.keys(p.sections).length;
            const on = id === pageId;
            return (
              <Link
                key={id}
                href={`/admin/content?page=${id}`}
                aria-current={on ? 'page' : undefined}
                className="flex items-center rounded-md px-2.5 py-2 text-[13.5px] font-medium hover:bg-[#F8FAFC] hover:no-underline"
                style={{ background: on ? '#F1F5F9' : undefined, color: on ? '#062347' : '#475569' }}
              >
                <span className="flex-1 truncate">{p.label}</span>
                <span className="ml-2 text-[11.5px] whitespace-nowrap text-[#94A3B8]">
                  {n} {n === 1 ? 'section' : 'sections'}
                </span>
              </Link>
            );
          })}
        </nav>

        {page && pageId ? (
          <div className="flex min-w-0 flex-col gap-4">
            <div className="flex items-center gap-3">
              <h2 className="font-display m-0 flex-1 text-lg font-bold">{page.label}</h2>
              <a href={page.path} target="_blank" rel="noopener noreferrer" className="text-[13px] font-semibold">
                View page ↗
              </a>
            </div>
            {Object.entries(page.sections).map(([sectionId, section]) => {
              const row = rows.get(`${pageId}.${sectionId}`);
              const reset = resetContent.bind(null, pageId, sectionId);
              return (
                <section key={sectionId} className={card}>
                  <div className="flex items-center gap-2.5 px-5 py-3.5">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-display m-0 text-[15px] font-bold">{section.label}</h3>
                        {row ? (
                          <span className="rounded bg-[#FEF3C7] px-1.5 py-px text-[11px] font-semibold text-[#92400E]">
                            {row.is_enabled ? 'Edited' : 'Hidden'}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 mb-0 text-[13px] text-[#64748B]">
                        {section.description ?? ''}
                        {row ? `${section.description ? ' · ' : ''}Saved ${new Date(row.updated_at).toLocaleDateString('en-GB')}` : ''}
                      </p>
                    </div>
                    {row ? (
                      <form action={reset}>
                        <ConfirmButton
                          className="h-[30px] cursor-pointer rounded-md border border-[#E2E8F0] bg-white px-2.5 text-[12.5px] font-semibold text-[#062347] hover:bg-[#F1F5F9]"
                          title={`Reset “${section.label}” to original?`}
                          body="Your edits to this section will be replaced with the built-in text and images."
                          ok="Reset section"
                          danger
                        >
                          Reset to original
                        </ConfirmButton>
                      </form>
                    ) : (
                      <span className="h-[30px] rounded-md border border-[#E2E8F0] px-2.5 text-[12.5px] leading-[28px] font-semibold text-[#94A3B8]">
                        Original
                      </span>
                    )}
                    <Link
                      href={`/admin/content/${pageId}/${sectionId}`}
                      className={`${btn.secondary} h-[30px] px-2.5 text-[12.5px] hover:no-underline`}
                    >
                      Edit
                    </Link>
                  </div>
                </section>
              );
            })}
          </div>
        ) : null}
      </div>
    </>
  );
}
