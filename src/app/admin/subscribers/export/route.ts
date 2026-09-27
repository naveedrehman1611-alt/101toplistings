import { requireRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const MAX_ROWS = 10_000;
// Supabase caps a PostgREST response at 1,000 rows by default (max_rows), so
// the list is read a page at a time and streamed out as each page arrives.
const PAGE_SIZE = 1_000;
const HEADER = 'email,status,source,subscribed_at\r\n';

type Row = { email: string; status: string; source: string | null; created_at: string };

/**
 * One CSV field, always quoted. A leading = + - @ (or tab/CR) would make a
 * spreadsheet evaluate the cell as a formula, and addresses come from a
 * public form, so those values are prefixed with an apostrophe.
 */
function field(value: string | null): string {
  const v = value ?? '';
  const safe = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
  return `"${safe.replaceAll('"', '""')}"`;
}

function toCsv(rows: Row[]): string {
  return rows
    .map((r) => `${[r.email, r.status, r.source, r.created_at].map(field).join(',')}\r\n`)
    .join('');
}

export async function GET() {
  await requireRole('moderator');
  const supabase = await createClient();

  const readPage = (from: number) =>
    supabase
      .from('newsletter_subscribers')
      .select('email, status, source, created_at')
      .order('created_at', { ascending: false })
      // A unique tie-breaker keeps the pages from overlapping or skipping rows.
      .order('id')
      .range(from, Math.min(from + PAGE_SIZE, MAX_ROWS) - 1);

  // Read the first page before answering, so a failed read is an error
  // response and not a download that stops short.
  const first = await readPage(0);
  if (first.error) {
    console.error(`[subscribers] export failed: ${first.error.message}`);
    return new Response('The export failed. Please try again.', {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  }

  const encoder = new TextEncoder();
  let read = first.data.length;
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encoder.encode(HEADER + toCsv(first.data)));
      if (first.data.length < PAGE_SIZE || read >= MAX_ROWS) controller.close();
    },
    async pull(controller) {
      const page = await readPage(read);
      if (page.error) {
        console.error(`[subscribers] export failed after ${read} rows: ${page.error.message}`);
        controller.error(new Error(page.error.message));
        return;
      }
      controller.enqueue(encoder.encode(toCsv(page.data)));
      read += page.data.length;
      if (page.data.length < PAGE_SIZE || read >= MAX_ROWS) controller.close();
    },
  });

  return new Response(body, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="subscribers.csv"',
      'Cache-Control': 'no-store',
    },
  });
}
