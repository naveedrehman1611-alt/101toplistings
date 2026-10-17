'use server';

import { createClient } from './supabase-server';
import { requireRole } from './auth';
import { writeAuditMany } from './audit';
import { check, runAndReturn } from './action-flow';
import { FormError, text } from './form-data';
import { SEARCH_TAG, tableTag } from './supabase';
import { notifyListingDecisions } from './listing-notifications';
import { notifyIndexNow } from './indexnow';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** The most listings one request may change: also the largest admin page size. */
const MAX_IDS = 200;

const OPS = {
  approve: { label: 'Approved', patch: { status: 'approved', rejection_note: null } },
  reject: { label: 'Rejected', patch: { status: 'rejected' } },
  suspend: { label: 'Suspended', patch: { status: 'suspended' } },
  pending: { label: 'Moved back to pending', patch: { status: 'pending' } },
  draft: { label: 'Moved to draft', patch: { status: 'draft' } },
  feature: { label: 'Featured', patch: { is_featured: true } },
  unfeature: { label: 'Unfeatured', patch: { is_featured: false } },
  verify: { label: 'Verified', patch: { verification: 'verified' } },
  unverify: { label: 'Unverified', patch: { verification: 'unverified' } },
  delete: { label: 'Deleted', patch: null },
} as const;

type Op = keyof typeof OPS;

const BEFORE_COLUMNS =
  'id, name, slug, status, verification, is_featured, rejection_note, published_at';

type Before = {
  id: string;
  name: string;
  slug: string;
  status: string;
  verification: string;
  is_featured: boolean;
  rejection_note: string | null;
  published_at: string | null;
};

/** Only a path back into the listings admin, so the redirect cannot be pointed elsewhere. */
function backPath(fd: FormData): string {
  const back = text(fd, 'back', 500) ?? '';
  return /^\/admin\/listings(\?[^\s]*)?$/.test(back) ? back : '/admin/listings';
}

/**
 * One action for every change the listings table makes, to one listing (the
 * row buttons) or to many (the checkboxes): change status, feature, verify or
 * delete. Approving or rejecting a listing that has an owner emails them.
 *
 * Role checks run before runAndReturn (see action-flow.ts): deleting needs
 * admin, everything else moderator, matching deleteListing and RLS.
 */
export async function bulkListingAction(fd: FormData) {
  const user = await requireRole('moderator');
  const op = text(fd, 'op', 20) as Op | null;
  if (op === 'delete') await requireRole('admin');

  await runAndReturn(
    backPath(fd),
    async () => {
      if (!op || !(op in OPS)) throw new FormError('Choose what to do with the selected listings.');
      const ids = [
        ...new Set(
          fd.getAll('ids').filter((v): v is string => typeof v === 'string' && UUID.test(v)),
        ),
      ];
      if (ids.length === 0) throw new FormError('Select at least one listing first.');
      if (ids.length > MAX_IDS) {
        throw new FormError(`Select at most ${MAX_IDS} listings at a time.`);
      }
      const reason = text(fd, 'reason', 1000);
      if (op === 'reject' && !reason) {
        throw new FormError('Give a reason for rejecting. The owner sees it in their email.');
      }

      const supabase = await createClient();
      const before = check(
        await supabase.from('listings').select(BEFORE_COLUMNS).in('id', ids),
      ) as Before[];
      if (before.length === 0) throw new FormError('Those listings no longer exist.');
      const found = before.map((b) => b.id);
      const count = found.length === 1 ? before[0].name : `${found.length} listings`;

      if (op === 'delete') {
        check(await supabase.from('listings').delete().in('id', found));
        await writeAuditMany(
          user.id,
          'delete',
          'listing',
          before.map((b) => ({ id: b.id, before: b, after: null })),
        );
        return `Deleted ${count}.`;
      }

      const patch: Record<string, unknown> = {
        ...OPS[op].patch,
        last_updated_by: user.id,
        ...(op === 'reject' ? { rejection_note: reason } : {}),
      };
      check(await supabase.from('listings').update(patch).in('id', found));
      // Approving is what publishes a listing: stamp published_at once, and
      // leave it alone on a re-approval so the feed is not reordered.
      if (op === 'approve') {
        check(
          await supabase
            .from('listings')
            .update({ published_at: new Date().toISOString() })
            .in('id', found)
            .is('published_at', null),
        );
      }

      const after = check(
        await supabase.from('listings').select(BEFORE_COLUMNS).in('id', found),
      ) as Before[];
      const afterById = new Map(after.map((a) => [a.id, a]));
      await writeAuditMany(
        user.id,
        op === 'approve'
          ? 'approve'
          : op === 'reject'
            ? 'reject'
            : op === 'suspend'
              ? 'suspend'
              : 'update',
        'listing',
        before.map((b) => ({ id: b.id, before: b, after: afterById.get(b.id) ?? null })),
      );

      // Newly approved listings, and public ones this changed or took down.
      notifyIndexNow(
        before
          .filter((b) => (op === 'approve') !== (b.status === 'approved'))
          .map((b) => `/listing/${b.slug}`),
      );

      // Only listings whose status this changed: re-approving never re-sends.
      let emailed = '';
      if (op === 'approve' || op === 'reject') {
        const target = op === 'approve' ? 'approved' : 'rejected';
        const changed = before.filter((b) => b.status !== target);
        await notifyListingDecisions(supabase, changed, target, reason);
        if (changed.length) emailed = ' Owners with an account are being emailed.';
      }
      return `${OPS[op].label}: ${count}.${emailed}`;
    },
    {
      // Listings are read almost everywhere (cards, search, city and category
      // pages), so every cached page is refreshed, and the listing reads with it.
      tags: [tableTag('public_listings'), tableTag('public_listing_cards'), SEARCH_TAG],
      paths: [{ path: '/', type: 'layout' }],
    },
  );
}
