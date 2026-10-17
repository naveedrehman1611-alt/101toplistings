import { createClient } from '@/lib/supabase-server';
import { requireRole } from '@/lib/auth';
import { deleteBlogCategory, saveBlogCategory } from '@/lib/blog-actions';
import { CellText, FormField, PageHeader, btn, inputCls, rowAct, textareaCls } from '@/components/admin/kit';
import { DataTable, type TableRow } from '@/components/admin/data-table';
import { ConfirmButton, ModalForm } from '@/components/admin/dialog';
import { BLOG_TABS } from '@/components/admin/blog-tabs';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Blog categories' };

type Row = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  sort_order: number;
  seo_title: string | null;
  seo_description: string | null;
};

function Fields({ c }: { c?: Row }) {
  const k = c?.id ?? 'new';
  return (
    <>
      {c ? <input type="hidden" name="id" value={c.id} /> : null}
      <FormField label="Name" htmlFor={`bn-${k}`} required>
        <input id={`bn-${k}`} name="name" required defaultValue={c?.name} className={inputCls} />
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Slug" htmlFor={`bs-${k}`} help="Blank = from the name.">
          <input id={`bs-${k}`} name="slug" defaultValue={c?.slug} className={inputCls} />
        </FormField>
        <FormField label="Sort order" htmlFor={`bo-${k}`}>
          <input id={`bo-${k}`} name="sort_order" type="number" defaultValue={c?.sort_order ?? 0} className={inputCls} />
        </FormField>
      </div>
      <FormField label="Description" htmlFor={`bd-${k}`}>
        <textarea id={`bd-${k}`} name="description" rows={3} defaultValue={c?.description ?? ''} className={textareaCls} />
      </FormField>
      <FormField label="SEO title" htmlFor={`bt-${k}`}>
        <input id={`bt-${k}`} name="seo_title" defaultValue={c?.seo_title ?? ''} className={inputCls} />
      </FormField>
      <FormField label="SEO description" htmlFor={`be-${k}`}>
        <textarea id={`be-${k}`} name="seo_description" rows={2} defaultValue={c?.seo_description ?? ''} className={textareaCls} />
      </FormField>
    </>
  );
}

export default async function AdminBlogCategories() {
  await requireRole('editor');
  const supabase = await createClient();
  const [{ data }, { data: posts }] = await Promise.all([
    supabase
      .from('blog_categories')
      .select('id, slug, name, description, sort_order, seo_title, seo_description')
      .order('sort_order')
      .order('name'),
    supabase.from('blog_posts').select('category_id').not('category_id', 'is', null),
  ]);
  const cats = (data ?? []) as Row[];
  // Shown so editors know which categories can be deleted before they try.
  const postCount = new Map<string, number>();
  for (const p of posts ?? []) {
    const c = p.category_id as string;
    postCount.set(c, (postCount.get(c) ?? 0) + 1);
  }

  const rows: TableRow[] = cats.map((c) => {
    const n = postCount.get(c.id) ?? 0;
    return {
      id: c.id,
      search: `${c.name} ${c.slug}`,
      sort: { name: c.name, count: n, slug: c.slug },
      cells: [
        <CellText key="n" bold sub={c.description ?? undefined}>
          {c.name}
        </CellText>,
        <CellText key="c">{n}</CellText>,
        <code key="u" className="max-w-full truncate rounded bg-[#F1F5F9] px-1.5 py-0.5 font-mono text-[12.5px]">
          {c.slug}
        </code>,
      ],
      actions: (
        <>
          <ModalForm trigger="Edit" triggerClassName={rowAct.base} title={`Edit ${c.name}`} action={saveBlogCategory} ok="Save">
            <Fields c={c} />
          </ModalForm>
          <form action={deleteBlogCategory}>
            <input type="hidden" name="id" value={c.id} />
            <ConfirmButton
              className={rowAct.bad}
              title={`Delete ${c.name}?`}
              body={n ? `It still has ${n} post(s); move them to another category first.` : 'This can’t be undone.'}
              ok="Delete"
              danger
            >
              Delete
            </ConfirmButton>
          </form>
        </>
      ),
    };
  });

  return (
    <>
      <PageHeader title="Blog" description="Posts and blog categories. A category that still has posts can’t be deleted.">
        <ModalForm trigger="Add blog category" triggerClassName={btn.primary} title="Add blog category" action={saveBlogCategory} ok="Add">
          <Fields />
        </ModalForm>
      </PageHeader>
      <DataTable
        tabs={BLOG_TABS('cats')}
        columns={[
          { key: 'name', label: 'Category', width: 'minmax(200px,2fr)' },
          { key: 'count', label: 'Posts', width: '120px' },
          { key: 'slug', label: 'Slug' },
        ]}
        rows={rows}
        searchPlaceholder="Search categories…"
        actionsWidth="140px"
        emptyText="No blog categories yet."
      />
    </>
  );
}
