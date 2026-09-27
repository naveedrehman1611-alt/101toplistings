import Link from 'next/link';
import { createClient } from '@/lib/supabase-server';
import { requireRole } from '@/lib/auth';
import { Notice } from '@/components/admin-ui';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Blog' };

type Row = {
  id: string;
  slug: string;
  title: string;
  category_id: string | null;
  is_featured: boolean;
  is_published: boolean;
  published_at: string | null;
  updated_at: string;
};

export default async function AdminBlog({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  await requireRole('editor');
  const sp = await searchParams;
  const supabase = await createClient();
  // The staff session sees drafts too: the blog_posts read policy lets editors through.
  const [{ data, error }, { data: categories }] = await Promise.all([
    supabase
      .from('blog_posts')
      .select('id, slug, title, category_id, is_featured, is_published, published_at, updated_at')
      .order('updated_at', { ascending: false })
      .limit(200),
    supabase.from('blog_categories').select('id, name'),
  ]);
  const rows = (data ?? []) as Row[];
  const categoryName = new Map((categories ?? []).map((c) => [c.id, c.name as string]));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Blog</h1>
        <div className="flex items-center gap-3">
          <Link href="/admin/blog/categories" className="text-brand-700 text-sm hover:underline">
            Categories
          </Link>
          <Link
            href="/admin/blog/new"
            className="bg-brand-700 hover:bg-brand-800 inline-flex h-10 items-center rounded-lg px-4 text-sm font-medium text-white"
          >
            New post
          </Link>
        </div>
      </div>
      <Notice ok={sp.ok} error={sp.error} />

      {error ? (
        <p role="alert" className="mt-6 text-sm text-red-700">
          Could not load posts: {error.message}
        </p>
      ) : null}

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[40rem] text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-left">
              <th className="py-2 font-medium">Title</th>
              <th className="py-2 font-medium">Category</th>
              <th className="py-2 font-medium">Status</th>
              <th className="py-2 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="border-b border-[var(--border)] last:border-0">
                <td className="py-3">
                  <Link href={`/admin/blog/${p.id}`} className="hover:text-brand-700 font-medium">
                    {p.title}
                  </Link>
                  {p.is_featured ? (
                    <span className="text-brand-700 ml-2 text-xs">featured</span>
                  ) : null}
                  <span className="block text-xs text-[var(--text-muted)]">/blog/{p.slug}</span>
                </td>
                <td className="py-3 text-[var(--text-muted)]">
                  {p.category_id ? (categoryName.get(p.category_id) ?? '—') : '—'}
                </td>
                <td className="py-3">{p.is_published ? 'Published' : 'Draft'}</td>
                <td className="py-3 text-[var(--text-muted)]">
                  {/* A draft has no publication date yet; show when it was last edited. */}
                  {p.published_at
                    ? new Date(p.published_at).toLocaleDateString('en-GB')
                    : `edited ${new Date(p.updated_at).toLocaleDateString('en-GB')}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && !error ? (
          <p className="mt-6 text-sm text-[var(--text-muted)]">
            No posts yet.{' '}
            <Link href="/admin/blog/new" className="text-brand-700 hover:underline">
              Write the first one
            </Link>
            .
          </p>
        ) : null}
      </div>
    </div>
  );
}
