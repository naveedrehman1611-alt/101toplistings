import Link from 'next/link';
import { createClient } from '@/lib/supabase-server';
import { requireRole } from '@/lib/auth';
import { deleteBlogPost } from '@/lib/blog-actions';
import {
  CellText,
  ErrorNotice,
  PageHeader,
  Pill,
  SwitchView,
  ago,
  rowAct,
} from '@/components/admin/kit';
import { DataTable, type TableRow } from '@/components/admin/data-table';
import { ConfirmButton } from '@/components/admin/dialog';
import { BLOG_TABS } from '@/components/admin/blog-tabs';

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

export default async function AdminBlog() {
  await requireRole('editor');
  const supabase = await createClient();
  // The staff session sees drafts too: the blog_posts read policy lets editors through.
  const [{ data, error }, { data: categories }, { data: tagRows }] = await Promise.all([
    supabase
      .from('blog_posts')
      .select('id, slug, title, category_id, is_featured, is_published, published_at, updated_at')
      .order('updated_at', { ascending: false })
      .limit(500),
    supabase.from('blog_categories').select('id, name'),
    supabase.from('blog_post_tags').select('post_id, blog_tags(name)').limit(5000),
  ]);
  const posts = (data ?? []) as Row[];
  const categoryName = new Map((categories ?? []).map((c) => [c.id, c.name as string]));
  const tags = new Map<string, string[]>();
  for (const t of tagRows ?? []) {
    const name = (t.blog_tags as unknown as { name: string } | null)?.name;
    if (name) tags.set(t.post_id as string, [...(tags.get(t.post_id as string) ?? []), name]);
  }

  const rows: TableRow[] = posts.map((p) => {
    const status = p.is_published ? 'published' : 'draft';
    const cat = p.category_id ? (categoryName.get(p.category_id) ?? '—') : '—';
    const tagList = (tags.get(p.id) ?? []).sort().join(', ');
    return {
      id: p.id,
      filter: status,
      search: [p.title, p.slug, cat, tagList].join(' '),
      sort: {
        title: p.title,
        cat,
        featured: p.is_featured ? 1 : 0,
        status,
        date: p.published_at ?? p.updated_at,
      },
      cells: [
        <>
          <Link
            href={`/admin/blog/${p.id}`}
            className="max-w-full truncate font-semibold text-[#062347] hover:text-[#1884E7] hover:no-underline"
          >
            {p.title}
          </Link>
          <div className="max-w-full truncate text-xs text-[#64748B]">
            {tagList || `/blog/${p.slug}`}
          </div>
        </>,
        <CellText key="c">{cat}</CellText>,
        <SwitchView key="f" on={p.is_featured} label="Featured" />,
        <Pill key="s" tone={status}>
          {p.is_published ? 'Published' : 'Draft'}
        </Pill>,
        // A draft has no publication date yet; show when it was last edited.
        <CellText key="d" sub={p.published_at ? undefined : 'edited'}>
          {ago(p.published_at ?? p.updated_at)}
        </CellText>,
      ],
      actions: (
        <>
          <Link href={`/admin/blog/${p.id}`} className={`${rowAct.base} hover:no-underline`}>
            Edit
          </Link>
          {p.is_published ? (
            <a
              href={`/blog/${p.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`${rowAct.base} hover:no-underline`}
            >
              View ↗
            </a>
          ) : null}
          <form action={deleteBlogPost}>
            <input type="hidden" name="id" value={p.id} />
            <ConfirmButton
              className={rowAct.bad}
              title="Delete this post permanently?"
              body="This can’t be undone. Unpublish it instead to keep it as a draft."
              ok="Delete permanently"
              danger
            >
              Delete
            </ConfirmButton>
          </form>
        </>
      ),
    };
  });

  const published = rows.filter((r) => r.filter === 'published').length;

  return (
    <>
      <PageHeader
        title="Blog"
        description="Posts and blog categories."
        actions={[{ label: 'New post', href: '/admin/blog/new', primary: true }]}
      />
      {error ? <ErrorNotice>Could not load posts: {error.message}</ErrorNotice> : null}
      <DataTable
        tabs={BLOG_TABS('posts')}
        columns={[
          { key: 'title', label: 'Title', width: 'minmax(260px,2.4fr)' },
          { key: 'cat', label: 'Category' },
          { key: 'featured', label: 'Featured', width: '100px' },
          { key: 'status', label: 'Status', width: '120px' },
          { key: 'date', label: 'Date', width: '110px' },
        ]}
        rows={rows}
        filters={[
          { value: 'all', label: 'All' },
          { value: 'published', label: 'Published', count: published },
          { value: 'draft', label: 'Draft', count: rows.length - published },
        ]}
        searchPlaceholder="Search posts…"
        actionsWidth="200px"
        emptyText="No posts yet."
        bulk={[
          {
            label: 'Delete permanently',
            tone: 'bad',
            op: 'post_delete',
            confirm: {
              title: 'Delete {n} posts permanently?',
              body: 'This can’t be undone.',
              ok: 'Delete permanently',
              danger: true,
            },
          },
        ]}
      />
    </>
  );
}
