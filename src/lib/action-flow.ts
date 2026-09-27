import 'server-only';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { errorMessage } from './form-data';

/**
 * The shared shape of every admin form action: run the write, then send the
 * browser back to `path` with ?ok= or ?error= for the page to render. Keeping
 * the outcome in the URL means these forms work without client JavaScript.
 *
 * Role checks must happen BEFORE calling this: requireRole() signals with a
 * redirect, which is itself a thrown error and would be caught here.
 */
export async function runAndReturn(path: string, write: () => Promise<string>): Promise<never> {
  let message: string;
  try {
    message = await write();
  } catch (e) {
    redirect(withParam(path, 'error', errorMessage(e)));
  }
  // Public pages are ISR-cached and read taxonomy, menus and listings from
  // almost everywhere, so any content write refreshes the whole tree.
  revalidatePath('/', 'layout');
  redirect(withParam(path, 'ok', message));
}

function withParam(path: string, key: string, value: string) {
  const [base, query = ''] = path.split('?');
  const params = new URLSearchParams(query);
  params.delete('ok');
  params.delete('error');
  params.set(key, value);
  return `${base}?${params.toString()}`;
}

/** Supabase returns errors rather than throwing; this makes them throw. */
export function check<T>(result: { data: T; error: unknown }): T {
  if (result.error) throw result.error;
  return result.data;
}
