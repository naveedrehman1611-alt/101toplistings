'use server';

import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from './supabase-server';
import { requireRole } from './auth';
import { writeAudit } from './audit';
import { check, runAndReturn } from './action-flow';
import { FormError, bool, num, required, slugFrom, slugify, text, uuid } from './form-data';
import { canonicalUrl, parseTags, readMinutes, type TagInput } from './blog-input';

// Each action re-checks the role itself: a Server Action is a public endpoint,
// so the admin layout's check does not protect it. RLS enforces it a third time.

/**
 * A slug no other post uses. A clash gets a numeric suffix rather than an error
 * so a long draft is never lost to a redirect over a taken slug.
 */
async function freePostSlug(
  supabase: SupabaseClient,
  wanted: string,
  exceptId: string | null,
): Promise<string> {
  const base = slugify(wanted);
  if (!base) throw new FormError('A slug could not be made from that title.');
  for (let i = 1; i < 50; i++) {
    const candidate = i === 1 ? base : `${base}-${i}`;
    let q = supabase.from('blog_posts').select('id').eq('slug', candidate);
    if (exceptId) q = q.neq('id', exceptId);
    const { data } = await q.limit(1);
    if (!data || data.length === 0) return candidate;
  }
  return `${base}-${Date.now().toString(36)}`;
}

/**
 * Replaces the post's tag set. Missing tags are created; existing ones are
 * matched by slug and keep their stored name, so "local seo" does not rename
 * "Local SEO" for every other post.
 */
async function writeTags(supabase: SupabaseClient, postId: string, tags: TagInput[]) {
  let ids: string[] = [];
  if (tags.length > 0) {
    check(
      await supabase.from('blog_tags').upsert(tags, { onConflict: 'slug', ignoreDuplicates: true }),
    );
    const rows = check(
      await supabase
        .from('blog_tags')
        .select('id')
        .in(
          'slug',
          tags.map((t) => t.slug),
        ),
    );
    ids = (rows ?? []).map((r: { id: string }) => r.id);
  }
  check(await supabase.from('blog_post_tags').delete().eq('post_id', postId));
  if (ids.length > 0) {
    check(
      await supabase
        .from('blog_post_tags')
        .insert(ids.map((tag_id) => ({ post_id: postId, tag_id }))),
    );
  }
}

/** Tag names on a post, for the audit snapshot, so a tag change shows in before/after. */
async function tagNames(supabase: SupabaseClient, postId: string): Promise<string[]> {
  const { data } = await supabase
    .from('blog_post_tags')
    .select('blog_tags(name)')
    .eq('post_id', postId);
  return (data ?? [])
    .map((r) => (r.blog_tags as unknown as { name: string } | null)?.name)
    .filter((n): n is string => Boolean(n))
    .sort();
}

export async function saveBlogPost(fd: FormData) {
  const user = await requireRole('editor');
  const id = uuid(fd, 'id');
  await runAndReturn(id ? `/admin/blog/${id}` : '/admin/blog', async () => {
    const supabase = await createClient();
    const title = required(fd, 'title', 'Title', 200);
    const body = text(fd, 'body', 100_000);
    const tags = parseTags(fd);
    const isPublished = bool(fd, 'is_published');
    const wantedSlug = text(fd, 'slug', 120) ?? title;

    const row = {
      title,
      slug: await freePostSlug(supabase, wantedSlug, id),
      standfirst: text(fd, 'standfirst', 500),
      body,
      category_id: uuid(fd, 'category_id'),
      read_minutes: readMinutes(body),
      is_featured: bool(fd, 'is_featured'),
      is_published: isPublished,
      seo_title: text(fd, 'seo_title', 200),
      seo_description: text(fd, 'seo_description', 300),
      canonical_url: canonicalUrl(fd),
      updated_at: new Date().toISOString(),
    };
    // Tell the editor when their chosen slug was taken and a suffix was added.
    const renamed = slugify(wantedSlug) !== row.slug ? ` The slug is /blog/${row.slug}.` : '';

    if (id) {
      const before = check(
        await supabase.from('blog_posts').select('*').eq('id', id).maybeSingle(),
      );
      if (!before) throw new FormError('Post not found.');
      const beforeTags = await tagNames(supabase, id);
      const patch = {
        ...row,
        // First publication stamps the date and it stays: unpublishing and
        // republishing must not move an old article to the top of the feed.
        published_at:
          isPublished && !before.published_at ? new Date().toISOString() : before.published_at,
      };
      const after = check(
        await supabase.from('blog_posts').update(patch).eq('id', id).select('*').maybeSingle(),
      );
      await writeTags(supabase, id, tags);
      await writeAudit(
        user.id,
        'update',
        'blog_post',
        id,
        { ...before, tags: beforeTags },
        { ...after, tags: await tagNames(supabase, id) },
      );
      return `Saved ${title}.${renamed}`;
    }

    const after = check(
      await supabase
        .from('blog_posts')
        .insert({
          ...row,
          author_id: user.id,
          published_at: isPublished ? new Date().toISOString() : null,
        })
        .select('*')
        .single(),
    );
    await writeTags(supabase, after.id, tags);
    await writeAudit(user.id, 'create', 'blog_post', after.id, null, {
      ...after,
      tags: await tagNames(supabase, after.id),
    });
    return `Added ${title}.${renamed}`;
  });
}

export async function deleteBlogPost(fd: FormData) {
  const user = await requireRole('editor');
  await runAndReturn('/admin/blog', async () => {
    const id = uuid(fd, 'id');
    if (!id) throw new FormError('Nothing selected.');
    const supabase = await createClient();
    const before = check(await supabase.from('blog_posts').select('*').eq('id', id).maybeSingle());
    if (!before) throw new FormError('Post not found.');
    // Captured before the delete: blog_post_tags rows cascade away with the post.
    const tags = await tagNames(supabase, id);
    check(await supabase.from('blog_posts').delete().eq('id', id));
    await writeAudit(user.id, 'delete', 'blog_post', id, { ...before, tags }, null);
    return `Deleted ${before.title}.`;
  });
}

// ---------------------------------------------------------------------------
// Blog categories
// ---------------------------------------------------------------------------

export async function saveBlogCategory(fd: FormData) {
  const user = await requireRole('editor');
  await runAndReturn('/admin/blog/categories', async () => {
    const supabase = await createClient();
    const id = uuid(fd, 'id');
    const row = {
      name: required(fd, 'name', 'Name', 120),
      slug: slugFrom(fd),
      description: text(fd, 'description', 1000),
      sort_order: num(fd, 'sort_order', 'Sort order') ?? 0,
      seo_title: text(fd, 'seo_title', 200),
      seo_description: text(fd, 'seo_description', 300),
    };

    if (id) {
      const before = check(
        await supabase.from('blog_categories').select('*').eq('id', id).maybeSingle(),
      );
      if (!before) throw new FormError('Category not found.');
      const after = check(
        await supabase.from('blog_categories').update(row).eq('id', id).select('*').maybeSingle(),
      );
      await writeAudit(user.id, 'update', 'blog_category', id, before, after);
      return `Saved ${row.name}.`;
    }
    const after = check(await supabase.from('blog_categories').insert(row).select('*').single());
    await writeAudit(user.id, 'create', 'blog_category', after.id, null, after);
    return `Added ${row.name}.`;
  });
}

export async function deleteBlogCategory(fd: FormData) {
  const user = await requireRole('editor');
  await runAndReturn('/admin/blog/categories', async () => {
    const supabase = await createClient();
    const id = uuid(fd, 'id');
    if (!id) throw new FormError('Nothing selected.');
    const before = check(
      await supabase.from('blog_categories').select('*').eq('id', id).maybeSingle(),
    );
    if (!before) throw new FormError('Category not found.');
    // blog_posts.category_id is "on delete set null", so deleting would silently
    // uncategorise posts. Drafts count too: editors see them through RLS.
    const { count } = await supabase
      .from('blog_posts')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', id);
    if (count) throw new FormError(`${before.name} is used by ${count} post(s). Move them first.`);
    check(await supabase.from('blog_categories').delete().eq('id', id));
    await writeAudit(user.id, 'delete', 'blog_category', id, before, null);
    return `Deleted ${before.name}.`;
  });
}
