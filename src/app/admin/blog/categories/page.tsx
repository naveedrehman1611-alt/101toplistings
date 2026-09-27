import Link from 'next/link';
import { createClient } from '@/lib/supabase-server';
import { requireRole } from '@/lib/auth';
import { deleteBlogCategory, saveBlogCategory } from '@/lib/blog-actions';
import { DangerButton, Field, Notice, SubmitButton, TextArea } from '@/components/admin-ui';

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

export default async function AdminBlogCategories({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; ok?: string; error?: string }>;
}) {
  await requireRole('editor');
  const sp = await searchParams;
  const supabase = await createClient();
  const [{ data }, { data: posts }] = await Promise.all([
    supabase
      .from('blog_categories')
      .select('id, slug, name, description, sort_order, seo_title, seo_description')
      .order('sort_order')
      .order('name'),
    supabase.from('blog_posts').select('category_id').not('category_id', 'is', null),
  ]);
  const rows = (data ?? []) as Row[];
  const editing = sp.edit ? rows.find((r) => r.id === sp.edit) : undefined;
  // Shown so editors know which categories can be deleted before they try.
  const postCount = new Map<string, number>();
  for (const p of posts ?? []) {
    const c = p.category_id as string;
    postCount.set(c, (postCount.get(c) ?? 0) + 1);
  }

  return (
    <div>
      <p className="text-sm">
        <Link href="/admin/blog" className="text-brand-700 hover:underline">
          ← Blog
        </Link>
      </p>
      <h1 className="mt-2 text-2xl font-semibold">Blog categories</h1>
      <p className="mt-2 text-sm text-[var(--text-muted)]">
        A category that still has posts cannot be deleted. Move its posts first.
      </p>
      <Notice ok={sp.ok} error={sp.error} />

      <form action={saveBlogCategory} className="surface-card mt-6 grid gap-4 p-5 sm:grid-cols-2">
        <h2 className="text-lg font-semibold sm:col-span-2">
          {editing ? `Edit ${editing.name}` : 'Add a category'}
        </h2>
        {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
        <Field label="Name" name="name" required defaultValue={editing?.name} />
        <Field
          label="Slug"
          name="slug"
          defaultValue={editing?.slug}
          hint="Leave blank to make one from the name."
        />
        <Field
          label="Sort order"
          name="sort_order"
          type="number"
          defaultValue={editing?.sort_order ?? 0}
        />
        <Field label="SEO title" name="seo_title" defaultValue={editing?.seo_title} />
        <div className="sm:col-span-2">
          <TextArea
            label="Description"
            name="description"
            defaultValue={editing?.description}
            rows={3}
          />
        </div>
        <div className="sm:col-span-2">
          <TextArea
            label="SEO description"
            name="seo_description"
            defaultValue={editing?.seo_description}
            rows={2}
          />
        </div>
        <div className="flex items-center gap-3 sm:col-span-2">
          <SubmitButton>{editing ? 'Save changes' : 'Add category'}</SubmitButton>
          {editing ? (
            <Link href="/admin/blog/categories" className="text-brand-700 text-sm hover:underline">
              Cancel
            </Link>
          ) : null}
        </div>
      </form>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[32rem] text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-left">
              <th className="py-2 font-medium">Name</th>
              <th className="py-2 font-medium">Posts</th>
              <th className="py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-[var(--border)] last:border-0">
                <td className="py-3">
                  <span className="font-medium">{r.name}</span>
                  <span className="ml-2 text-xs text-[var(--text-muted)]">/{r.slug}</span>
                </td>
                <td className="py-3 text-[var(--text-muted)]">{postCount.get(r.id) ?? 0}</td>
                <td className="py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/admin/blog/categories?edit=${r.id}`}
                      className="rounded-lg border border-[var(--border)] px-2.5 py-1 text-xs"
                    >
                      Edit
                    </Link>
                    <form action={deleteBlogCategory}>
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
            No blog categories yet. Add the first one above.
          </p>
        ) : null}
      </div>
    </div>
  );
}
