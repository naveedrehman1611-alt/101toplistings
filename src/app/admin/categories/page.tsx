import Link from 'next/link';
import { createClient } from '@/lib/supabase-server';
import { requireRole } from '@/lib/auth';
import { deleteCategory, saveCategory } from '@/lib/taxonomy-actions';
import {
  CellText,
  FormField,
  PageHeader,
  SwitchField,
  SwitchSubmit,
  btn,
  inputCls,
  rowAct,
  selectCls,
  textareaCls,
} from '@/components/admin/kit';
import { DataTable, type TableRow } from '@/components/admin/data-table';
import { ConfirmButton, ModalForm } from '@/components/admin/dialog';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Categories' };

type Row = {
  id: string;
  parent_id: string | null;
  slug: string;
  name: string;
  description: string | null;
  sort_order: number;
  is_featured: boolean;
};

/** Every field saveCategory reads; used by both Add and Edit. */
function CategoryFields({ rows, editing }: { rows: Row[]; editing?: Row }) {
  const k = editing?.id ?? 'new';
  return (
    <>
      {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
      <FormField label="Name" htmlFor={`cn-${k}`} required>
        <input
          id={`cn-${k}`}
          name="name"
          required
          defaultValue={editing?.name}
          placeholder="e.g. Bakeries"
          className={inputCls}
        />
      </FormField>
      <FormField
        label="Slug"
        htmlFor={`cs-${k}`}
        help="Used in the URL. Leave blank to make one from the name."
      >
        <input id={`cs-${k}`} name="slug" defaultValue={editing?.slug} className={inputCls} />
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Parent" htmlFor={`cp-${k}`}>
          <select
            id={`cp-${k}`}
            name="parent_id"
            defaultValue={editing?.parent_id ?? ''}
            className={selectCls}
          >
            <option value="">None (top-level)</option>
            {rows
              .filter((r) => !r.parent_id && r.id !== editing?.id)
              .map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
          </select>
        </FormField>
        <FormField label="Sort order" htmlFor={`co-${k}`}>
          <input
            id={`co-${k}`}
            name="sort_order"
            type="number"
            defaultValue={editing?.sort_order ?? 0}
            className={inputCls}
          />
        </FormField>
      </div>
      <FormField label="Description" htmlFor={`cd-${k}`}>
        <textarea
          id={`cd-${k}`}
          name="description"
          rows={3}
          defaultValue={editing?.description ?? ''}
          className={textareaCls}
        />
      </FormField>
      <SwitchField
        name="is_featured"
        label="Featured on the home page"
        defaultChecked={editing?.is_featured}
      />
    </>
  );
}

export default async function AdminCategories() {
  await requireRole('editor');
  const supabase = await createClient();
  const [{ data }, { data: used }] = await Promise.all([
    supabase
      .from('categories')
      .select('id, parent_id, slug, name, description, sort_order, is_featured')
      .order('sort_order')
      .order('name'),
    supabase.from('listings').select('category_id, subcategory_id').limit(20000),
  ]);
  const all = (data ?? []) as Row[];
  const byId = new Map(all.map((r) => [r.id, r]));
  const uses = new Map<string, number>();
  for (const l of used ?? []) {
    for (const id of new Set([l.category_id, l.subcategory_id])) {
      if (id) uses.set(id as string, (uses.get(id as string) ?? 0) + 1);
    }
  }
  // Parents first, each followed by its children, so the tree reads top-down.
  const ordered = all
    .filter((c) => !c.parent_id || !byId.has(c.parent_id))
    .flatMap((p) => [p, ...all.filter((c) => c.parent_id === p.id)]);

  const rows: TableRow[] = ordered.map((c) => {
    const parent = c.parent_id ? (byId.get(c.parent_id)?.name ?? '—') : '—';
    const count = uses.get(c.id) ?? 0;
    return {
      id: c.id,
      filter: c.parent_id ? 'sub' : 'top',
      search: [c.name, c.slug, parent].join(' '),
      sort: { name: c.name, parent, count, sort: c.sort_order, featured: c.is_featured ? 1 : 0 },
      cells: [
        <CellText
          key="n"
          bold
          sub={
            <Link href={`/category/${c.slug}`} target="_blank" className="text-[#64748B]">
              /category/{c.slug}
            </Link>
          }
        >
          {c.parent_id ? '— ' : ''}
          {c.name}
        </CellText>,
        <CellText key="p">{parent}</CellText>,
        <CellText key="c">{count}</CellText>,
        <CellText key="s">{c.sort_order}</CellText>,
        // Flips is_featured by re-posting the row's current values.
        <form key="f" action={saveCategory}>
          <input type="hidden" name="id" value={c.id} />
          <input type="hidden" name="name" value={c.name} />
          <input type="hidden" name="slug" value={c.slug} />
          <input type="hidden" name="parent_id" value={c.parent_id ?? ''} />
          <input type="hidden" name="sort_order" value={c.sort_order} />
          <input type="hidden" name="description" value={c.description ?? ''} />
          {c.is_featured ? null : <input type="hidden" name="is_featured" value="on" />}
          <SwitchSubmit on={c.is_featured} label={`Featured: ${c.name}`} />
        </form>,
      ],
      actions: (
        <>
          <ModalForm
            trigger="Edit"
            triggerClassName={rowAct.base}
            title={`Edit ${c.name}`}
            action={saveCategory}
            ok="Save"
          >
            <CategoryFields rows={all} editing={c} />
          </ModalForm>
          <form action={deleteCategory}>
            <input type="hidden" name="id" value={c.id} />
            <ConfirmButton
              className={rowAct.bad}
              title={`Delete ${c.name}?`}
              body={
                count
                  ? `It is used by ${count} listing(s), so it can’t be deleted until they are moved.`
                  : 'This can’t be undone.'
              }
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

  const top = all.filter((c) => !c.parent_id).length;

  return (
    <>
      <PageHeader
        title="Categories"
        description="Parent and sub-categories used across the site. Featured categories appear on the home page."
      >
        <ModalForm
          trigger="Add category"
          triggerClassName={btn.primary}
          title="Add category"
          action={saveCategory}
          ok="Add category"
        >
          <CategoryFields rows={all} />
        </ModalForm>
      </PageHeader>
      <DataTable
        columns={[
          { key: 'name', label: 'Category', width: 'minmax(200px,1.6fr)' },
          { key: 'parent', label: 'Parent' },
          { key: 'count', label: 'Listings', width: '100px' },
          { key: 'sort', label: 'Sort order', width: '110px' },
          { key: 'featured', label: 'Featured', width: '100px' },
        ]}
        rows={rows}
        pageSize={50}
        filters={[
          { value: 'all', label: 'All' },
          { value: 'top', label: 'Top-level', count: top },
          { value: 'sub', label: 'Sub-categories', count: all.length - top },
        ]}
        searchPlaceholder="Search categories…"
        actionsWidth="160px"
        emptyText="No categories yet. Add the first one."
        bulk={[
          {
            label: 'Delete',
            tone: 'bad',
            op: 'category_delete',
            confirm: {
              title: 'Delete {n} categories?',
              body: 'Categories still used by listings are skipped.',
              ok: 'Delete',
              danger: true,
            },
          },
        ]}
      />
    </>
  );
}
