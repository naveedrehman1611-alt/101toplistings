import Link from 'next/link';
import { createClient } from '@/lib/supabase-server';
import { requireRole } from '@/lib/auth';
import { deleteCategory, saveCategory } from '@/lib/taxonomy-actions';
import {
  Check,
  DangerButton,
  Field,
  Notice,
  Select,
  SubmitButton,
  TextArea,
} from '@/components/admin-ui';

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

export default async function AdminCategories({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; ok?: string; error?: string }>;
}) {
  await requireRole('editor');
  const sp = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase
    .from('categories')
    .select('id, parent_id, slug, name, description, sort_order, is_featured')
    .order('sort_order')
    .order('name');
  const rows = (data ?? []) as Row[];
  const byId = new Map(rows.map((r) => [r.id, r]));
  const editing = sp.edit ? byId.get(sp.edit) : undefined;

  return (
    <div>
      <h1 className="text-2xl font-semibold">Categories</h1>
      <p className="mt-2 text-sm text-[var(--text-muted)]">
        Featured categories appear on the home page. A category with a parent is a subcategory.
      </p>
      <Notice ok={sp.ok} error={sp.error} />

      <form action={saveCategory} className="surface-card mt-6 grid gap-4 p-5 sm:grid-cols-2">
        <h2 className="text-lg font-semibold sm:col-span-2">
          {editing ? `Edit ${editing.name}` : 'Add a category'}
        </h2>
        {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
        <Field label="Name" name="name" required defaultValue={editing?.name} />
        <Field
          label="Slug"
          name="slug"
          defaultValue={editing?.slug}
          hint="Used in the URL. Leave blank to make one from the name."
        />
        <Select
          label="Parent category"
          name="parent_id"
          defaultValue={editing?.parent_id}
          emptyLabel="None (top level)"
          options={rows
            .filter((r) => r.id !== editing?.id)
            .map((r) => ({ value: r.id, label: r.name }))}
        />
        <Field
          label="Sort order"
          name="sort_order"
          type="number"
          defaultValue={editing?.sort_order ?? 0}
        />
        <div className="sm:col-span-2">
          <TextArea
            label="Description"
            name="description"
            defaultValue={editing?.description}
            rows={3}
          />
        </div>
        <Check
          label="Featured on the home page"
          name="is_featured"
          defaultChecked={editing?.is_featured}
        />
        <div className="flex items-center gap-3 sm:col-span-2">
          <SubmitButton>{editing ? 'Save changes' : 'Add category'}</SubmitButton>
          {editing ? (
            <Link href="/admin/categories" className="text-brand-700 text-sm hover:underline">
              Cancel
            </Link>
          ) : null}
        </div>
      </form>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[36rem] text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-left">
              <th className="py-2 font-medium">Name</th>
              <th className="py-2 font-medium">Parent</th>
              <th className="py-2 font-medium">Featured</th>
              <th className="py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-[var(--border)] last:border-0">
                <td className="py-3">
                  <Link href={`/category/${r.slug}`} className="hover:text-brand-700 font-medium">
                    {r.name}
                  </Link>
                  <span className="ml-2 text-xs text-[var(--text-muted)]">/{r.slug}</span>
                </td>
                <td className="py-3 text-[var(--text-muted)]">
                  {r.parent_id ? (byId.get(r.parent_id)?.name ?? '—') : '—'}
                </td>
                <td className="py-3">{r.is_featured ? 'Yes' : ''}</td>
                <td className="py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/admin/categories?edit=${r.id}`}
                      className="rounded-lg border border-[var(--border)] px-2.5 py-1 text-xs"
                    >
                      Edit
                    </Link>
                    <form action={deleteCategory}>
                      <input type="hidden" name="id" value={r.id} />
                      <DangerButton>Delete</DangerButton>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 ? (
          <p className="mt-6 text-sm text-[var(--text-muted)]">
            No categories yet. Add the first one above.
          </p>
        ) : null}
      </div>
    </div>
  );
}
