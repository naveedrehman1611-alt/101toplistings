import { createClient } from '@/lib/supabase-server';
import { requireRole } from '@/lib/auth';
import { deleteRedirect, saveRedirect } from '@/lib/seo-actions';
import { DangerButton, Field, Notice, Select, SubmitButton } from '@/components/admin-ui';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Redirects' };

type Row = {
  id: string;
  source: string;
  destination: string;
  status_code: number;
  hits: number;
  created_at: string;
};

const STATUS_OPTIONS = [
  { value: '301', label: '301 · moved permanently (sent as 308)' },
  { value: '308', label: '308 · permanent' },
  { value: '302', label: '302 · temporary (sent as 307)' },
  { value: '307', label: '307 · temporary' },
];

export default async function AdminRedirects({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  await requireRole('admin');
  const sp = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase
    .from('redirects')
    .select('id, source, destination, status_code, hits, created_at')
    .order('source');
  const rows = (data ?? []) as Row[];

  return (
    <div>
      <h1 className="text-2xl font-semibold">Redirects</h1>
      <p className="mt-2 max-w-2xl text-sm text-[var(--text-muted)]">
        Send an old address to a new one. A rule only applies to a URL that would otherwise show
        &ldquo;Page not found&rdquo;, so it cannot hide a page that exists. Permanent codes tell
        search engines to move the old page&rsquo;s ranking to the new address.
      </p>
      <Notice ok={sp.ok} error={sp.error} />

      <form action={saveRedirect} className="surface-card mt-6 grid gap-4 p-5 sm:grid-cols-2">
        <h2 className="text-lg font-semibold sm:col-span-2">Add a redirect</h2>
        <Field
          label="From (path)"
          name="source"
          required
          placeholder="/old-page"
          hint="A path on this site. A trailing slash is ignored."
        />
        <Field
          label="To"
          name="destination"
          required
          placeholder="/new-page or https://example.com/page"
        />
        <Select
          label="Type"
          name="status_code"
          required
          defaultValue="301"
          emptyLabel="Choose a type"
          options={STATUS_OPTIONS}
        />
        <div className="flex items-end">
          <SubmitButton>Add redirect</SubmitButton>
        </div>
      </form>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[40rem] text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-left">
              <th className="py-2 font-medium">From</th>
              <th className="py-2 font-medium">To</th>
              <th className="py-2 font-medium">Code</th>
              <th className="py-2 font-medium">Hits</th>
              <th className="py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-[var(--border)] last:border-0">
                <td className="py-3 font-medium break-all">{r.source}</td>
                <td className="py-3 break-all">{r.destination}</td>
                <td className="py-3">{r.status_code}</td>
                <td className="py-3">{r.hits}</td>
                <td className="py-3">
                  <form action={deleteRedirect}>
                    <input type="hidden" name="id" value={r.id} />
                    <DangerButton>Delete</DangerButton>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 ? (
          <p className="mt-6 text-sm text-[var(--text-muted)]">No redirects yet.</p>
        ) : null}
      </div>
    </div>
  );
}
