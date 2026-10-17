'use server';

import { createClient } from './supabase-server';
import { getCurrentUser, roleAtLeast } from './auth';

export type SearchHit = { group: string; label: string; sub: string; href: string };

/** ilike wildcards in user input would widen the match; strip them. */
const clean = (q: string) =>
  q
    .replace(/[%_\\,()]/g, ' ')
    .trim()
    .slice(0, 80);

/**
 * The ⌘K palette's record search. Read-only, and each group is gated by the
 * same role as the screen it opens, so a moderator never sees users or posts.
 */
export async function adminSearch(query: string): Promise<SearchHit[]> {
  const user = await getCurrentUser();
  if (!user || !roleAtLeast(user.role, 'moderator')) return [];
  const q = clean(query);
  if (q.length < 2) return [];
  const like = `%${q}%`;
  const supabase = await createClient();

  const [listings, reviews, posts, users] = await Promise.all([
    supabase.from('listings').select('id, name, status').ilike('name', like).limit(5),
    supabase
      .from('reviews')
      .select('id, author_name, status, listings(name)')
      .or(`author_name.ilike.${like},body.ilike.${like}`)
      .limit(3),
    roleAtLeast(user.role, 'editor')
      ? supabase.from('blog_posts').select('id, title, is_published').ilike('title', like).limit(3)
      : Promise.resolve({ data: [] as { id: string; title: string; is_published: boolean }[] }),
    roleAtLeast(user.role, 'admin')
      ? supabase
          .from('profiles')
          .select('id, display_name, role')
          .ilike('display_name', like)
          .limit(3)
      : Promise.resolve({
          data: [] as { id: string; display_name: string | null; role: string }[],
        }),
  ]);

  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ');
  const hits: SearchHit[] = [];
  for (const l of listings.data ?? [])
    hits.push({
      group: 'Listing',
      label: l.name,
      sub: cap(l.status),
      href: `/admin/listings/${l.id}`,
    });
  for (const p of posts.data ?? [])
    hits.push({
      group: 'Post',
      label: p.title,
      sub: p.is_published ? 'Published' : 'Draft',
      href: `/admin/blog/${p.id}`,
    });
  for (const u of users.data ?? [])
    hits.push({
      group: 'User',
      label: u.display_name ?? 'Unnamed',
      sub: cap(u.role),
      href: `/admin/users?q=${encodeURIComponent(u.display_name ?? '')}`,
    });
  for (const r of reviews.data ?? []) {
    const listing = (r.listings as unknown as { name: string } | null)?.name ?? 'a listing';
    hits.push({
      group: 'Review',
      label: `${r.author_name ?? 'Visitor'} on ${listing}`,
      sub: cap(r.status),
      href: `/admin/reviews?status=${r.status}&q=${encodeURIComponent(r.author_name ?? '')}`,
    });
  }
  return hits;
}
