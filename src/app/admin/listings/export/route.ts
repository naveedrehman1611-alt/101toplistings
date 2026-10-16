import { requireRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase-server';
import { csvRow } from '@/lib/csv';
import { LISTING_CSV_COLUMNS } from '@/lib/listing-csv';

export const dynamic = 'force-dynamic';

const MAX_ROWS = 20_000;
// Supabase caps a PostgREST response at 1,000 rows by default (max_rows), so
// the list is read a page at a time and streamed out as each page arrives.
const PAGE_SIZE = 1_000;
const STATUSES = ['pending', 'approved', 'rejected', 'suspended', 'draft'];

type Row = Record<string, unknown> & {
  category: { slug: string } | null;
  city: { slug: string } | null;
};

function toCsv(rows: Row[]): string {
  return rows
    .map((r) =>
      csvRow(
        LISTING_CSV_COLUMNS.map((c) =>
          c === 'category' || c === 'city'
            ? (r[c]?.slug ?? '')
            : (r[c] as string | number | boolean | null),
        ),
      ),
    )
    .join('');
}

/**
 * Listings as CSV, filtered like the admin table (?status=, ?q=). With
 * ?template=1 it is just the header row: a blank file to fill in and import.
 */
export async function GET(request: Request) {
  await requireRole('moderator');
  const params = new URL(request.url).searchParams;
  const header = csvRow([...LISTING_CSV_COLUMNS]);
  const fileHeaders = (name: string) => ({
    'Content-Type': 'text/csv; charset=utf-8',
    'Content-Disposition': `attachment; filename="${name}"`,
    'Cache-Control': 'no-store',
  });

  if (params.get('template') === '1') {
    return new Response(header, { headers: fileHeaders('listings-template.csv') });
  }

  const status = params.get('status') ?? '';
  const q = params.get('q')?.trim() ?? '';
  const supabase = await createClient();
  const columns = LISTING_CSV_COLUMNS.filter((c) => c !== 'category' && c !== 'city').join(', ');

  const readPage = (from: number) => {
    let query = supabase
      .from('listings')
      .select(`${columns}, category:categories!listings_category_id_fkey(slug), city:cities(slug)`)
      .order('created_at', { ascending: false })
      // A unique tie-breaker keeps the pages from overlapping or skipping rows.
      .order('id')
      .range(from, Math.min(from + PAGE_SIZE, MAX_ROWS) - 1);
    if (STATUSES.includes(status)) query = query.eq('status', status);
    if (q) query = query.ilike('name', `%${q}%`);
    return query;
  };

  // Read the first page before answering, so a failed read is an error
  // response and not a download that stops short.
  const first = await readPage(0);
  if (first.error) {
    console.error(`[listings] export failed: ${first.error.message}`);
    return new Response('The export failed. Please try again.', {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  }

  const encoder = new TextEncoder();
  let read = first.data.length;
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encoder.encode(header + toCsv(first.data as unknown as Row[])));
      if (first.data.length < PAGE_SIZE || read >= MAX_ROWS) controller.close();
    },
    async pull(controller) {
      const page = await readPage(read);
      if (page.error) {
        console.error(`[listings] export failed after ${read} rows: ${page.error.message}`);
        controller.error(new Error(page.error.message));
        return;
      }
      controller.enqueue(encoder.encode(toCsv(page.data as unknown as Row[])));
      read += page.data.length;
      if (page.data.length < PAGE_SIZE || read >= MAX_ROWS) controller.close();
    },
  });

  const date = new Date().toISOString().slice(0, 10);
  return new Response(body, { headers: fileHeaders(`listings-${date}.csv`) });
}
