import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import { requireRole } from '@/lib/auth';
import { deleteBlogPost, saveBlogPost } from '@/lib/blog-actions';
import { getOgOptions } from '@/lib/admin-media-options';
import type { EditablePost } from '@/components/blog-form';
import { BackLink, Pill, btn } from '@/components/admin/kit';
import { ConfirmButton } from '@/components/admin/dialog';
import { PostEditor } from '@/components/admin/post-editor';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Edit post' };

export default async function EditBlogPost({ params }: { params: Promise<{ id: string }> }) {
  await requireRole('editor');
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const supabase = await createClient();
  const [{ data: post }, { data: tagRows }, { data: categories }, ogOptions] = await Promise.all([
    supabase
      .from('blog_posts')
      .select(
        'id, slug, title, standfirst, body, category_id, is_featured, is_published, published_at, seo_title, seo_description, canonical_url',
      )
      .eq('id', id)
      .maybeSingle(),
    supabase.from('blog_post_tags').select('blog_tags(name)').eq('post_id', id),
    supabase.from('blog_categories').select('id, name').order('sort_order').order('name'),
    getOgOptions(),
  ]);
  if (!post) notFound();
  const p = post as EditablePost;
  const tags = (tagRows ?? [])
    .map((r) => (r.blog_tags as unknown as { name: string } | null)?.name)
    .filter((n): n is string => Boolean(n))
    .sort();
  const category = categories?.find((c) => c.id === p.category_id)?.name;

  return (
    <>
      <div className="flex flex-col gap-2.5">
        <BackLink href="/admin/blog">All posts</BackLink>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display m-0 text-2xl font-bold text-[#062347]">{p.title}</h1>
          <Pill tone={p.is_published ? 'published' : 'draft'}>
            {p.is_published ? 'Published' : 'Draft'}
          </Pill>
          <div className="ml-auto flex gap-2">
            {p.is_published ? (
              <a
                href={`/blog/${p.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`${btn.secondary} hover:no-underline`}
              >
                View on site ↗
              </a>
            ) : null}
            <form action={deleteBlogPost}>
              <input type="hidden" name="id" value={p.id} />
              <ConfirmButton
                className={btn.dangerGhost}
                title="Delete this post permanently?"
                body="This can’t be undone. Unpublish it instead to keep it as a draft."
                ok="Delete permanently"
                danger
              >
                Delete
              </ConfirmButton>
            </form>
          </div>
        </div>
        <div className="text-[13px] text-[#64748B]">
          {category ?? 'No category'} · /blog/{p.slug}
        </div>
      </div>
      <PostEditor
        // A fresh form after each save, so it starts from what was stored.
        key={JSON.stringify(p)}
        action={saveBlogPost}
        post={p}
        tags={tags}
        categories={categories ?? []}
        ogOptions={ogOptions}
      />
    </>
  );
}
