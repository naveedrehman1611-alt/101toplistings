import Link from 'next/link';
import { createClient } from '@/lib/supabase-server';
import { requireRole } from '@/lib/auth';
import { saveBlogPost } from '@/lib/blog-actions';
import { BlogForm } from '@/components/blog-form';
import { Notice } from '@/components/admin-ui';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'New post' };

export default async function NewBlogPost({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireRole('editor');
  const sp = await searchParams;
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from('blog_categories')
    .select('id, name')
    .order('sort_order')
    .order('name');

  return (
    <div>
      <p className="text-sm">
        <Link href="/admin/blog" className="text-brand-700 hover:underline">
          ← Blog
        </Link>
      </p>
      <h1 className="mt-2 text-2xl font-semibold">New post</h1>
      <Notice error={sp.error} />
      <div className="mt-6">
        <BlogForm action={saveBlogPost} categories={categories ?? []} submitLabel="Add post" />
      </div>
    </div>
  );
}
