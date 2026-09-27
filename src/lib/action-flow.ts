import 'server-only';
import { redirect } from 'next/navigation';
import { revalidatePath, updateTag } from 'next/cache';
import { errorMessage } from './form-data';
import { SEARCH_TAG } from './supabase';

/**
 * The shared shape of every admin form action: run the write, then send the
 * browser back to `path` with ?ok= or ?error= for the page to render. Keeping
 * the outcome in the URL means these forms work without client JavaScript.
 *
 * Role checks must happen BEFORE calling this: requireRole() signals with a
 * redirect, which is itself a thrown error and would be caught here.
 */
/**
 * What a write makes stale. Without one, the whole site is revalidated, which
 * is right for taxonomy, menus and listings (read almost everywhere) but
 * wasteful for content that one page renders: every cached page would refetch
 * its data on its next visit.
 */
export type RevalidateScope = {
  /** Data Cache tags to expire now (tableTag(...) values). */
  tags?: string[];
  /** Routes to re-render; a "layout" entry covers every route below it. */
  paths?: { path: string; type?: 'page' | 'layout' }[];
};

export async function runAndReturn(
  path: string,
  write: () => Promise<string>,
  scope?: RevalidateScope,
): Promise<never> {
  let message: string;
  try {
    message = await write();
  } catch (e) {
    redirect(withParam(path, 'error', errorMessage(e)));
  }
  if (scope) {
    for (const tag of scope.tags ?? []) updateTag(tag);
    for (const p of scope.paths ?? []) revalidatePath(p.path, p.type);
  } else {
    // Public pages are ISR-cached and read taxonomy, menus and listings from
    // almost everywhere, so any content write refreshes the whole tree, and
    // the stored search results with it.
    updateTag(SEARCH_TAG);
    revalidatePath('/', 'layout');
  }
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
