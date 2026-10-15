import Link from 'next/link';
import { requireRole } from '@/lib/auth';
import { importListingsCsv } from '@/lib/listing-import-actions';
import { Notice, SubmitButton } from '@/components/admin-ui';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Import listings' };

const COLUMNS: [string, string][] = [
  [
    'id',
    'Blank adds a new listing. An existing listing’s id updates it (only the columns in the file change).',
  ],
  ['name', 'Required for new listings.'],
  [
    'city',
    'Required for new listings. The city’s slug (e.g. lahore), or its exact name if no other city shares it.',
  ],
  ['category', 'Category slug (see Admin → Categories). Optional.'],
  ['status', 'pending, approved, draft, rejected or suspended. Blank = the default chosen below.'],
  ['verification', 'unverified, pending, verified or rejected.'],
  ['is_featured', 'yes or no.'],
  ['slug', 'Optional; made from the name when blank. A taken slug on a new listing gets -2, -3…'],
  [
    'tagline, description, phone_primary, phone_secondary, email, website, address, postal_code, latitude, longitude, seo_title, seo_description',
    'Optional. A blank cell clears that field on an update.',
  ],
  ['created_at', 'Written by the export; ignored on import.'],
];

export default async function ImportListings({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  await requireRole('moderator');
  const sp = await searchParams;

  return (
    <div className="max-w-3xl">
      <p className="text-sm">
        <Link href="/admin/listings" className="text-brand-700 hover:underline">
          ← Listings
        </Link>
      </p>
      <h1 className="mt-2 text-2xl font-semibold">Import listings from CSV</h1>
      <p className="mt-2 text-sm text-[var(--text-muted)]">
        Add many listings at once, or edit many: export, change the file in Excel or Google Sheets,
        and import it back. Every row is checked first; if any row has a problem, nothing is saved
        and you are told which rows to fix.
      </p>
      <Notice ok={sp.ok} error={sp.error} />

      <form action={importListingsCsv} className="surface-card mt-6 grid gap-4 p-5">
        <label className="block text-sm">
          <span className="font-medium">
            CSV file<span className="text-error"> *</span>
          </span>
          <input
            type="file"
            name="file"
            accept=".csv,text/csv"
            required
            className="mt-1 block w-full text-sm"
          />
          <span className="mt-1 block text-xs text-[var(--text-muted)]">
            UTF-8 CSV, up to 4 MB and 2,000 rows per file.
          </span>
        </label>
        <label className="block text-sm">
          <span className="font-medium">Status for new rows with a blank status</span>
          <select
            name="default_status"
            defaultValue="pending"
            className="mt-1 h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm"
          >
            <option value="pending">pending (review before going live)</option>
            <option value="approved">approved (live straight away)</option>
            <option value="draft">draft</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="dry_run" defaultChecked className="size-4" />
          Check only. Find problems without saving anything.
        </label>
        <SubmitButton>Upload and import</SubmitButton>
      </form>

      {/* Plain download links: next/link would prefetch, and so build, the files.
          The lint rule reads /export as the [id] page beside it. */}
      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/admin/listings/export?template=1" className="text-brand-700 hover:underline">
          Download a blank template
        </a>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/admin/listings/export" className="text-brand-700 hover:underline">
          Export every listing (to edit and re-import)
        </a>
      </div>

      <h2 className="mt-8 text-lg font-semibold">Columns</h2>
      <table className="mt-3 w-full text-sm">
        <tbody>
          {COLUMNS.map(([col, help]) => (
            <tr key={col} className="border-b border-[var(--border)] align-top last:border-0">
              <td className="py-2 pr-4 font-mono text-xs">{col}</td>
              <td className="py-2 text-[var(--text-muted)]">{help}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
