import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth';
import { setSectionEnabled, updateSection } from '@/lib/admin-actions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Pages & sections' };

export default async function AdminPages() {
  await requireRole('editor');
  const supabase = await createClient();

  const { data: pages } = await supabase
    .from('pages')
    .select('id, slug, title, route_pattern, is_published')
    .order('slug');

  const { data: sections } = await supabase
    .from('page_sections')
    .select(
      'id, page_id, section_key, section_type, sort_order, is_enabled, heading, subheading, cta_label, cta_url',
    )
    .order('sort_order');

  const byPage = new Map<string, typeof sections>();
  for (const s of sections ?? []) {
    const list = byPage.get(s.page_id as string) ?? [];
    list.push(s);
    byPage.set(s.page_id as string, list as typeof sections);
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">Pages &amp; sections</h1>
      <p className="mt-3 max-w-2xl text-sm text-[var(--text-muted)]">
        Every heading and CTA on the public site is a row here. Disabling a section removes it
        from the page entirely; the page keeps rendering without it.
      </p>

      {(pages ?? []).map((page) => {
        const pageSections = byPage.get(page.id as string) ?? [];
        const path = (page.route_pattern as string).includes('[')
          ? '/'
          : (page.route_pattern as string);

        return (
          <section key={page.id} className="mt-8">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-lg font-semibold">{page.title}</h2>
              <code className="text-xs text-[var(--text-muted)]">{page.route_pattern}</code>
            </div>

            {pageSections.length === 0 ? (
              <p className="mt-2 text-sm text-[var(--text-muted)]">
                No editable sections defined for this page yet.
              </p>
            ) : (
              <div className="mt-4 space-y-4">
                {pageSections.map((s) => (
                  <div key={s.id} className="surface-card p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">{s.section_key}</p>
                        <code className="text-xs text-[var(--text-muted)]">
                          {s.section_type}
                        </code>
                      </div>
                      <form
                        action={async () => {
                          'use server';
                          await setSectionEnabled(s.id as string, !s.is_enabled, path);
                        }}
                      >
                        <button
                          type="submit"
                          className={`rounded-lg border px-3 py-1.5 text-xs ${
                            s.is_enabled
                              ? 'border-brand-500 bg-brand-50 text-brand-800'
                              : 'border-[var(--border)] text-[var(--text-muted)]'
                          }`}
                        >
                          {s.is_enabled ? 'Enabled' : 'Disabled'}
                        </button>
                      </form>
                    </div>

                    <form
                      action={async (formData: FormData) => {
                        'use server';
                        await updateSection(
                          s.id as string,
                          {
                            heading: String(formData.get('heading') ?? ''),
                            subheading: String(formData.get('subheading') ?? ''),
                            ctaLabel: String(formData.get('ctaLabel') ?? ''),
                            ctaUrl: String(formData.get('ctaUrl') ?? ''),
                          },
                          path,
                        );
                      }}
                      className="mt-4 grid gap-3 sm:grid-cols-2"
                    >
                      <label className="block text-sm">
                        <span className="font-medium">Heading</span>
                        <input
                          name="heading"
                          defaultValue={(s.heading as string) ?? ''}
                          className="mt-1 h-10 w-full rounded-lg border border-[var(--border)] px-3 text-sm outline-none focus:border-brand-500"
                        />
                      </label>
                      <label className="block text-sm">
                        <span className="font-medium">Subheading</span>
                        <input
                          name="subheading"
                          defaultValue={(s.subheading as string) ?? ''}
                          className="mt-1 h-10 w-full rounded-lg border border-[var(--border)] px-3 text-sm outline-none focus:border-brand-500"
                        />
                      </label>
                      <label className="block text-sm">
                        <span className="font-medium">CTA label</span>
                        <input
                          name="ctaLabel"
                          defaultValue={(s.cta_label as string) ?? ''}
                          className="mt-1 h-10 w-full rounded-lg border border-[var(--border)] px-3 text-sm outline-none focus:border-brand-500"
                        />
                      </label>
                      <label className="block text-sm">
                        <span className="font-medium">CTA URL</span>
                        <input
                          name="ctaUrl"
                          defaultValue={(s.cta_url as string) ?? ''}
                          className="mt-1 h-10 w-full rounded-lg border border-[var(--border)] px-3 text-sm outline-none focus:border-brand-500"
                        />
                      </label>
                      <div className="sm:col-span-2">
                        <button
                          type="submit"
                          className="h-10 rounded-lg bg-brand-700 px-4 text-sm font-medium text-white"
                        >
                          Save section
                        </button>
                      </div>
                    </form>
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
