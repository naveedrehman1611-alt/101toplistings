import { createClient } from '@/lib/supabase-server';
import { requireRole } from '@/lib/auth';
import { saveBlogPost } from '@/lib/blog-actions';
import { getOgOptions } from '@/lib/admin-media-options';
import { BackLink } from '@/components/admin/kit';
import { PostEditor } from '@/components/admin/post-editor';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'New post' };

export default async function NewBlogPost() {
  await requireRole('editor');
  const supabase = await createClient();
  const [{ data: categories }, ogOptions] = await Promise.all([
    supabase.from('blog_categories').select('id, name').order('sort_order').order('name'),
    getOgOptions(),
  ]);

  return (
    <>
      <div className="flex flex-col gap-2.5">
        <BackLink href="/admin/blog">All posts</BackLink>
        <h1 className="font-display m-0 text-2xl font-bold text-[#062347]">New post</h1>
      </div>
      <PostEditor action={saveBlogPost} categories={categories ?? []} ogOptions={ogOptions} />
    </>
  );
}
