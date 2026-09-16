import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth';
import { updateSetting } from '@/lib/admin-actions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Settings' };

const GROUP_LABELS: Record<string, string> = {
  brand: 'Brand',
  contact: 'Contact',
  seo: 'SEO',
  social: 'Social',
  general: 'General',
};

const HELP: Record<string, string> = {
  'brand.name': 'Shown in the header, the footer and every page title.',
  'brand.tagline': 'Sits under the brand name in the footer.',
  'brand.domain': 'Display only — the canonical URL comes from NEXT_PUBLIC_SITE_URL.',
  'contact.email': 'Rendered in the footer and on the contact page.',
  'footer.copyright': 'Follows the year in the footer bottom bar.',
  'seo.default_title': 'Fallback title, and the homepage title.',
  'seo.default_description': 'Fallback meta description.',
  'seo.location_page_min_listings':
    'A city page below this many listings is served noindex, so thin pages stay out of search.',
};

export default async function AdminSettings() {
  await requireRole('admin');
  const supabase = await createClient();

  const { data: settings } = await supabase
    .from('settings')
    .select('key, value, group:group')
    .order('key');

  const groups = new Map<string, { key: string; value: unknown }[]>();
  for (const row of settings ?? []) {
    const g = (row.group as string) ?? 'general';
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g)!.push({ key: row.key as string, value: row.value });
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">Settings</h1>
      <p className="mt-3 max-w-2xl text-sm text-[var(--text-muted)]">
        These rows are what the public site renders. No component holds a brand name or contact
        detail of its own, so changing a value here changes it everywhere — including page titles
        and Open Graph tags.
      </p>

      {[...groups.entries()].map(([group, rows]) => (
        <section key={group} className="mt-8">
          <h2 className="text-lg font-semibold">{GROUP_LABELS[group] ?? group}</h2>
          <div className="mt-4 space-y-4">
            {rows.map((row) => {
              const raw =
                typeof row.value === 'string' ? row.value : JSON.stringify(row.value);
              const isJsonBlob = typeof row.value === 'object' && row.value !== null;
              return (
                <form
                  key={row.key}
                  action={async (formData: FormData) => {
                    'use server';
                    await updateSetting(row.key, String(formData.get('value') ?? ''));
                  }}
                  className="surface-card p-4"
                >
                  <label htmlFor={`s-${row.key}`} className="block text-sm font-medium">
                    {row.key}
                  </label>
                  {HELP[row.key] ? (
                    <p className="mt-1 text-xs text-[var(--text-muted)]">{HELP[row.key]}</p>
                  ) : null}
                  <div className="mt-2 flex flex-wrap gap-2">
                    <input
                      id={`s-${row.key}`}
                      name="value"
                      defaultValue={raw}
                      readOnly={isJsonBlob}
                      className="h-10 min-w-0 flex-1 rounded-lg border border-[var(--border)] px-3 text-sm outline-none focus:border-brand-500 read-only:bg-[var(--surface-2)] read-only:text-[var(--text-muted)]"
                    />
                    <button
                      type="submit"
                      disabled={isJsonBlob}
                      className="h-10 rounded-lg bg-brand-700 px-4 text-sm font-medium text-white disabled:opacity-40"
                    >
                      Save
                    </button>
                  </div>
                  {isJsonBlob ? (
                    <p className="mt-2 text-xs text-[var(--text-muted)]">
                      Structured value — editing this needs a dedicated form, which is not built
                      yet. Shown read-only rather than risking a malformed write.
                    </p>
                  ) : null}
                </form>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
