import Link from 'next/link';
import { createClient } from '@/lib/supabase-server';
import { requireRole } from '@/lib/auth';
import { saveSeoOverride } from '@/lib/seo-actions';
import { SEO_ROUTES } from '@/lib/seo';
import { Check, Field, Notice, SubmitButton, TextArea } from '@/components/admin-ui';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'SEO' };

type Row = {
  route: string;
  title: string | null;
  description: string | null;
  robots: string | null;
  in_sitemap: boolean;
  updated_at: string;
};

export default async function AdminSeo({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  await requireRole('editor');
  const sp = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase
    .from('seo_meta')
    .select('route, title, description, robots, in_sitemap, updated_at')
    .in(
      'route',
      SEO_ROUTES.map((r) => r.route),
    );
  const byRoute = new Map(((data ?? []) as Row[]).map((r) => [r.route, r]));

  return (
    <div>
      <h1 className="text-2xl font-semibold">SEO</h1>
      <p className="mt-2 max-w-2xl text-sm text-[var(--text-muted)]">
        Override the title and description search engines and share cards show for each fixed page.
        Leave a field blank to keep the page&rsquo;s own text; the site-wide defaults are under{' '}
        <Link href="/admin/settings" className="text-brand-700 hover:underline">
          Settings
        </Link>
        . Hiding a page from search engines also leaves it out of the sitemap.
      </p>
      <Notice ok={sp.ok} error={sp.error} />

      <div className="mt-6 space-y-6">
        {SEO_ROUTES.map(({ route, label }) => {
          const row = byRoute.get(route);
          const isSearch = route === '/search';
          return (
            <form key={route} action={saveSeoOverride} className="surface-card grid gap-4 p-5">
              <input type="hidden" name="route" value={route} />
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-lg font-semibold">
                  {label}{' '}
                  <Link href={route} className="text-brand-700 text-sm font-normal hover:underline">
                    {route}
                  </Link>
                </h2>
                <span className="text-xs text-[var(--text-muted)]">
                  {row
                    ? `Overridden · updated ${new Date(row.updated_at).toLocaleDateString('en-GB')}`
                    : 'Using page defaults'}
                </span>
              </div>
              <Field
                label="Title"
                name="title"
                defaultValue={row?.title}
                hint={
                  route === '/'
                    ? 'Used as the whole title.'
                    : 'The brand name is added after it automatically.'
                }
              />
              <TextArea
                label="Description"
                name="description"
                rows={2}
                defaultValue={row?.description}
              />
              {isSearch ? (
                <>
                  <p className="text-xs text-[var(--text-muted)]">
                    Search results are always hidden from search engines and never in the sitemap.
                  </p>
                  <input type="hidden" name="in_sitemap" value="on" />
                </>
              ) : (
                <div className="flex flex-wrap gap-6">
                  <Check
                    label="Hide from search engines (noindex)"
                    name="noindex"
                    defaultChecked={row?.robots?.includes('noindex') ?? false}
                  />
                  <Check
                    label="Include in sitemap"
                    name="in_sitemap"
                    defaultChecked={row?.in_sitemap ?? true}
                  />
                </div>
              )}
              <div>
                <SubmitButton>Save {label}</SubmitButton>
              </div>
            </form>
          );
        })}
      </div>
    </div>
  );
}
