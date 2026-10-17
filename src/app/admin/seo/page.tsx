import Link from 'next/link';
import { createClient } from '@/lib/supabase-server';
import { requireRole } from '@/lib/auth';
import { saveSeoOverride } from '@/lib/seo-actions';
import { SEO_ROUTES } from '@/lib/seo';
import {
  CellText,
  FormField,
  PageHeader,
  SwitchField,
  SwitchSubmit,
  SwitchView,
  Tag,
  inputCls,
  rowAct,
  textareaCls,
} from '@/components/admin/kit';
import { DataTable, type TableRow } from '@/components/admin/data-table';
import { ModalForm } from '@/components/admin/dialog';

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

type Values = { title: string; description: string; noindex: boolean; inSitemap: boolean };

/** The row's current values as hidden inputs, with one of them changed. */
function Repost({ route, v }: { route: string; v: Values }) {
  return (
    <>
      <input type="hidden" name="route" value={route} />
      <input type="hidden" name="title" value={v.title} />
      <input type="hidden" name="description" value={v.description} />
      {v.noindex ? <input type="hidden" name="noindex" value="on" /> : null}
      {v.inSitemap ? <input type="hidden" name="in_sitemap" value="on" /> : null}
    </>
  );
}

export default async function AdminSeo() {
  await requireRole('editor');
  const supabase = await createClient();
  const { data } = await supabase
    .from('seo_meta')
    .select('route, title, description, robots, in_sitemap, updated_at')
    .in(
      'route',
      SEO_ROUTES.map((r) => r.route),
    );
  const byRoute = new Map(((data ?? []) as Row[]).map((r) => [r.route, r]));

  const rows: TableRow[] = SEO_ROUTES.map(({ route, label }) => {
    const row = byRoute.get(route);
    const isSearch = route === '/search';
    const v: Values = {
      title: row?.title ?? '',
      description: row?.description ?? '',
      noindex: isSearch || (row?.robots?.includes('noindex') ?? false),
      inSitemap: !isSearch && (row?.in_sitemap ?? true),
    };
    return {
      id: route,
      filter: v.noindex ? 'noindex' : 'indexed',
      selectable: false,
      search: [label, route, v.title, v.description].join(' '),
      sort: {
        page: label,
        title: v.title,
        noindex: v.noindex ? 1 : 0,
        sitemap: v.inSitemap ? 1 : 0,
      },
      cells: [
        <CellText
          key="p"
          bold
          sub={
            <Link href={route} target="_blank" className="text-[#64748B]">
              {route}
            </Link>
          }
        >
          {label}
        </CellText>,
        <>
          <div className="max-w-full truncate">
            {v.title || <span className="text-[#64748B]">Page’s own title</span>}
          </div>
          <div className="max-w-full truncate text-xs text-[#64748B]">
            {v.description || 'No description of its own — the page or site default is used'}
          </div>
          {!v.description ? (
            <div className="flex gap-1">
              <Tag tone="gold">No override</Tag>
            </div>
          ) : null}
        </>,
        isSearch ? (
          <SwitchView key="n" on label="Noindex" />
        ) : (
          <form key="n" action={saveSeoOverride}>
            <Repost route={route} v={{ ...v, noindex: !v.noindex }} />
            <SwitchSubmit on={v.noindex} label={`Hide ${label} from search engines`} />
          </form>
        ),
        isSearch ? (
          <SwitchView key="s" on={false} label="In sitemap" />
        ) : (
          <form key="s" action={saveSeoOverride}>
            <Repost route={route} v={{ ...v, inSitemap: !v.inSitemap }} />
            <SwitchSubmit on={v.inSitemap} label={`Include ${label} in the sitemap`} />
          </form>
        ),
      ],
      actions: (
        <ModalForm
          trigger="Edit"
          triggerClassName={rowAct.base}
          title={`SEO · ${label}`}
          body={route}
          action={saveSeoOverride}
          ok="Save"
        >
          <input type="hidden" name="route" value={route} />
          <FormField
            label="SEO title"
            htmlFor={`st-${route}`}
            help={
              route === '/'
                ? 'Used as the whole title.'
                : 'The brand name is added after it automatically. Blank keeps the page’s own title.'
            }
          >
            <input
              id={`st-${route}`}
              name="title"
              maxLength={120}
              defaultValue={v.title}
              className={inputCls}
            />
          </FormField>
          <FormField
            label="Meta description"
            htmlFor={`sd-${route}`}
            help="Up to about 160 characters."
          >
            <textarea
              id={`sd-${route}`}
              name="description"
              rows={3}
              maxLength={320}
              defaultValue={v.description}
              className={textareaCls}
            />
          </FormField>
          {isSearch ? (
            <>
              <p className="m-0 text-xs text-[#64748B]">
                Search results are always hidden from search engines and never in the sitemap.
              </p>
              <input type="hidden" name="in_sitemap" value="on" />
            </>
          ) : (
            <>
              <SwitchField
                name="noindex"
                label="Hide from search engines (noindex)"
                defaultChecked={v.noindex}
                help="Also leaves the page out of the sitemap."
              />
              <SwitchField
                name="in_sitemap"
                label="Include in sitemap"
                defaultChecked={v.inSitemap}
              />
            </>
          )}
        </ModalForm>
      ),
    };
  });

  const noindex = rows.filter((r) => r.filter === 'noindex').length;

  return (
    <>
      <PageHeader
        title="SEO"
        description={
          <>
            Title, description and indexing for each page. Blank fields keep the page’s own text;
            site-wide defaults are under <Link href="/admin/settings">Settings</Link>.
          </>
        }
      />
      <DataTable
        columns={[
          { key: 'page', label: 'Page', width: 'minmax(170px,1.1fr)' },
          { key: 'title', label: 'Title & description', width: 'minmax(280px,2.4fr)' },
          { key: 'noindex', label: 'Noindex', width: '100px' },
          { key: 'sitemap', label: 'In sitemap', width: '110px' },
        ]}
        rows={rows}
        pageSize={50}
        filters={[
          { value: 'all', label: 'All' },
          { value: 'indexed', label: 'Indexed', count: rows.length - noindex },
          { value: 'noindex', label: 'Noindex', count: noindex },
        ]}
        searchPlaceholder="Search pages…"
        actionsWidth="100px"
      />
    </>
  );
}
