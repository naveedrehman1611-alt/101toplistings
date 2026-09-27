import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import { requireRole } from '@/lib/auth';
import { deleteBlogPost, saveBlogPost } from '@/lib/blog-actions';
import { BlogForm, type EditablePost } from '@/components/blog-form';
import { DangerButton, Notice } from '@/components/admin-ui';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Edit post' };

export default async function EditBlogPost({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  await requireRole('editor');
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const supabase = await createClient();
  const [{ data: post }, { data: tagRows }, { data: categories }] = await Promise.all([
    supabase
      .from('blog_posts')
      .select(
        'id, slug, title, standfirst, body, category_id, is_featured, is_published, published_at, seo_title, seo_description, canonical_url',
      )
      .eq('id', id)
      .maybeSingle(),
    supabase.from('blog_post_tags').select('blog_tags(name)').eq('post_id', id),
    supabase.from('blog_categories').select('id, name').order('sort_order').order('name'),
  ]);
  if (!post) notFound();
  const p = post as EditablePost;
  const tags = (tagRows ?? [])
    .map((r) => (r.blog_tags as unknown as { name: string } | null)?.name)
    .filter((n): n is string => Boolean(n))
    .sort();

  return (
    <div>
      <p className="text-sm">
        <Link href="/admin/blog" className="text-brand-700 hover:underline">
          ← Blog
        </Link>
      </p>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">{p.title}</h1>
        {p.is_published ? (
          <Link href={`/blog/${p.slug}`} className="text-brand-700 text-sm hover:underline">
            View public page →
          </Link>
        ) : (
          <span className="text-sm text-[var(--text-muted)]">Draft — not public</span>
        )}
      </div>
      <Notice ok={sp.ok} error={sp.error} />

      <div className="mt-6">
        <BlogForm
          action={saveBlogPost}
          post={p}
          tags={tags}
          categories={categories ?? []}
          submitLabel="Save changes"
        />
      </div>

      <form action={deleteBlogPost} className="mt-10 border-t border-[var(--border)] pt-6">
        <input type="hidden" name="id" value={p.id} />
        <p className="mb-3 text-sm text-[var(--text-muted)]">
          Deleting removes the post permanently. Unpublishing hides it and can be undone.
        </p>
        <DangerButton>Delete post permanently</DangerButton>
      </form>
    </div>
  );
}
