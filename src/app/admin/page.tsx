import Link from 'next/link';
import { createClient } from '@/lib/supabase-server';
import { requireRole } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Dashboard' };

async function countBy(table: string, column?: string, value?: string) {
  const supabase = await createClient();
  let q = supabase.from(table).select('*', { count: 'exact', head: true });
  if (column && value) q = q.eq(column, value);
  const { count } = await q;
  return count ?? 0;
}

export default async function AdminDashboard() {
  await requireRole('moderator');
  const supabase = await createClient();

  const [pending, approved, rejected, total, categories, cities, posts, reviews] =
    await Promise.all([
      countBy('listings', 'status', 'pending'),
      countBy('listings', 'status', 'approved'),
      countBy('listings', 'status', 'rejected'),
      countBy('listings'),
      countBy('categories'),
      countBy('cities'),
      countBy('blog_posts'),
      countBy('reviews', 'status', 'pending'),
    ]);

  const { data: recentAudit } = await supabase
    .from('audit_logs')
    .select('id, action, entity_type, entity_id, created_at')
    .order('created_at', { ascending: false })
    .limit(8);

  const stats = [
    { label: 'Pending approval', value: pending, href: '/admin/listings?status=pending', urgent: pending > 0 },
    { label: 'Approved', value: approved, href: '/admin/listings?status=approved' },
    { label: 'Rejected', value: rejected, href: '/admin/listings?status=rejected' },
    { label: 'All listings', value: total, href: '/admin/listings' },
    { label: 'Reviews awaiting moderation', value: reviews },
    { label: 'Categories', value: categories },
    { label: 'Cities', value: cities },
    { label: 'Blog posts', value: posts },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const card = (
            <div
              className={`surface-card p-4 ${s.urgent ? 'border-brand-500 bg-brand-50' : ''}`}
            >
              <p className="text-2xl font-semibold">{s.value}</p>
              <p className="mt-1 text-sm text-[var(--text-muted)]">{s.label}</p>
            </div>
          );
          return s.href ? (
            <Link key={s.label} href={s.href} className="block">
              {card}
            </Link>
          ) : (
            <div key={s.label}>{card}</div>
          );
        })}
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Recent activity</h2>
        {!recentAudit || recentAudit.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--text-muted)]">
            No admin changes recorded yet. Every write from this panel is logged here with its
            before and after values.
          </p>
        ) : (
          <table className="mt-4 w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left">
                <th className="py-2 font-medium">Action</th>
                <th className="py-2 font-medium">Entity</th>
                <th className="py-2 font-medium">When</th>
              </tr>
            </thead>
            <tbody>
              {recentAudit.map((a) => (
                <tr key={a.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2">{a.action}</td>
                  <td className="py-2 text-[var(--text-muted)]">{a.entity_type}</td>
                  <td className="py-2 text-[var(--text-muted)]">
                    {new Date(a.created_at as string).toLocaleString('en-GB')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
