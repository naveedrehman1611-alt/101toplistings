import Link from 'next/link';
import { createClient } from '@/lib/supabase-server';
import { requireRole } from '@/lib/auth';
import { CONTENT_PAGES } from '@/lib/content/registry';
import type { PageSpec } from '@/lib/content/schema';
import { Notice } from '@/components/admin-ui';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Content' };

type Row = { key: string; is_enabled: boolean; updated_at: string };

export default async function AdminContent({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  await requireRole('editor');
  const sp = await searchParams;
  const supabase = await createClient();
  const { data, error } = await supabase.from('site_content').select('key, is_enabled, updated_at');
  const rows = new Map(((data ?? []) as Row[]).map((r) => [r.key, r]));
  const pages = Object.entries(CONTENT_PAGES as Record<string, PageSpec>);

  return (
    <div>
      <h1 className="text-2xl font-semibold">Content</h1>
      <p className="mt-2 max-w-2xl text-sm text-[var(--text-muted)]">
        The text, links and images of every public page, section by section. A section you have not
        edited shows its original content; &ldquo;Reset to original&rdquo; in its editor goes back
        to it. Listings, categories, cities and articles are edited in their own sections; menus in
        Menus; the brand name, logo and footer details in Settings; page titles for search engines
        in SEO.
      </p>
      <Notice
        ok={sp.ok}
        error={
          sp.error ??
          (error
            ? `Could not read saved content: ${error.message}. Has migration 0026 been applied?`
            : undefined)
        }
      />

      <div className="mt-6 space-y-6">
        {pages.map(([pageId, page]) => (
          <section key={pageId} className="surface-card p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-lg font-semibold">{page.label}</h2>
              <Link href={page.path} className="text-brand-700 text-sm hover:underline">
                View page
              </Link>
            </div>
            <ul className="mt-3 divide-y divide-[var(--border)]">
              {Object.entries(page.sections).map(([sectionId, section]) => {
                const row = rows.get(`${pageId}.${sectionId}`);
                return (
                  <li
                    key={sectionId}
                    className="flex flex-wrap items-center justify-between gap-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <Link
                        href={`/admin/content/${pageId}/${sectionId}`}
                        className="text-brand-700 font-medium hover:underline"
                      >
                        {section.label}
                      </Link>
                      {section.description ? (
                        <p className="text-xs text-[var(--text-muted)]">{section.description}</p>
                      ) : null}
                    </div>
                    <span className="text-xs text-[var(--text-muted)]">
                      {!row
                        ? 'Original'
                        : `${row.is_enabled ? 'Edited' : 'Hidden'} · ${new Date(row.updated_at).toLocaleDateString('en-GB')}`}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
