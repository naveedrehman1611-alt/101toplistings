'use server';

import { bulkListingAction } from './listing-bulk-actions';
import { decideClaim, moderateReview, setSubmissionStatus } from './moderation-actions';
import { deleteSubscriber, setSubscriberStatus } from './subscriber-actions';
import { deleteBlogPost } from './blog-actions';
import { deleteCategory } from './taxonomy-actions';
import { deleteRedirect } from './seo-actions';

/**
 * Bulk actions for the admin tables. Each op runs the existing single-row
 * action once per id, so its role check, validation, audit entry and cache
 * revalidation all still apply; nothing here touches the database itself.
 *
 * The form actions report by redirecting to ?ok= or ?error=. Called from here
 * that redirect is a thrown NEXT_REDIRECT, which is caught and read instead of
 * followed. A redirect without ?ok= (a failed role check sends one to
 * /admin/no-access or /login) counts as a failure.
 */

export type BulkOp =
  | 'listing'
  | 'review'
  | 'inbox_status'
  | 'claim'
  | 'subscriber_status'
  | 'subscriber_delete'
  | 'post_delete'
  | 'category_delete'
  | 'redirect_delete';

export type BulkResult = { done: number; failed: number; error?: string };

const MAX = 200;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** The URL inside a NEXT_REDIRECT error, or null for any other error. */
function redirectUrl(e: unknown): string | null {
  const digest = (e as { digest?: unknown } | null)?.digest;
  if (typeof digest !== 'string' || !digest.startsWith('NEXT_REDIRECT;')) return null;
  return digest.split(';')[2] ?? '';
}

/** Runs a redirecting form action and reports its outcome. */
async function viaForm(
  action: (fd: FormData) => Promise<unknown>,
  fields: Record<string, string | string[]>,
): Promise<string | null> {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields))
    for (const item of Array.isArray(v) ? v : [v]) fd.append(k, item);
  try {
    await action(fd);
    return null;
  } catch (e) {
    const url = redirectUrl(e);
    if (url === null) throw e;
    const params = new URL(url, 'http://x').searchParams;
    if (params.has('ok')) return null;
    return params.get('error') ?? 'Not allowed.';
  }
}

async function one(op: BulkOp, id: string, arg: string | undefined): Promise<string | null> {
  switch (op) {
    case 'review':
      return viaForm(moderateReview, { id, decision: arg ?? '' });
    case 'inbox_status':
      return viaForm(setSubmissionStatus, { id, status: arg ?? '' });
    case 'claim':
      return viaForm(decideClaim, { id, decision: arg ?? '' });
    case 'subscriber_status':
      return viaForm(setSubscriberStatus, { id, status: arg ?? '' });
    case 'subscriber_delete':
      return viaForm(deleteSubscriber, { id });
    case 'post_delete':
      return viaForm(deleteBlogPost, { id });
    case 'category_delete':
      return viaForm(deleteCategory, { id });
    case 'redirect_delete':
      return viaForm(deleteRedirect, { id });
    default:
      return 'Unknown action.';
  }
}

export async function runBulk(
  op: BulkOp,
  ids: string[],
  arg?: string,
  reason?: string,
): Promise<BulkResult> {
  const list = [...new Set(ids)].filter((id) => UUID.test(id)).slice(0, MAX);

  // Listings have a real bulk action (it also emails owners once per batch),
  // so every id goes in one request rather than one per row.
  if (op === 'listing') {
    const err = await viaForm(bulkListingAction, {
      ids: list,
      op: arg ?? '',
      ...(reason ? { reason } : {}),
    });
    return err ? { done: 0, failed: list.length, error: err } : { done: list.length, failed: 0 };
  }

  let done = 0;
  let failed = 0;
  let error: string | undefined;
  // One at a time: each action reads its row before writing it.
  for (const id of list) {
    const err = await one(op, id, arg);
    if (err) {
      failed++;
      error ??= err;
    } else done++;
  }
  return { done, failed, error };
}
