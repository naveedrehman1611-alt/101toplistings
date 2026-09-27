'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from './supabase-server';
import { getCurrentUser, requireUser } from './auth';
import { check, runAndReturn } from './action-flow';
import { FormError, uuid } from './form-data';

/**
 * Saving businesses (the ♡ on a card). RLS (favourites_own) limits every row to
 * its owner, and the user id comes from the session, never from the client.
 */

export type FavouriteStatus = 'added' | 'removed' | 'signin' | 'error';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Saves the business, or un-saves it if it is already saved. The homepage is
 * static and cannot know what a visitor has saved, so the button asks this to
 * flip whatever row really exists and shows the answer.
 */
export async function toggleFavourite(listingId: string): Promise<{ status: FavouriteStatus }> {
  if (typeof listingId !== 'string' || !UUID.test(listingId)) return { status: 'error' };
  try {
    const user = await getCurrentUser();
    if (!user) return { status: 'signin' };

    const supabase = await createClient();
    const saved = await supabase
      .from('favourites')
      .select('listing_id')
      .eq('user_id', user.id)
      .eq('listing_id', listingId)
      .maybeSingle();
    if (saved.error) throw saved.error;

    let status: FavouriteStatus;
    if (saved.data) {
      const { error } = await supabase
        .from('favourites')
        .delete()
        .eq('user_id', user.id)
        .eq('listing_id', listingId);
      if (error) throw error;
      status = 'removed';
    } else {
      const { error } = await supabase
        .from('favourites')
        .insert({ user_id: user.id, listing_id: listingId });
      // 23505: a second click in another tab saved it first, which is the same outcome.
      if (error && error.code !== '23505') throw error;
      status = 'added';
    }
    revalidatePath('/dashboard');
    return { status };
  } catch (e) {
    console.error('[favourites] toggle failed:', e);
    return { status: 'error' };
  }
}

/** The Remove button in the dashboard's saved list; works without JavaScript. */
export async function removeFavourite(fd: FormData) {
  const user = await requireUser('/dashboard');
  await runAndReturn(
    '/dashboard',
    async () => {
      const listingId = uuid(fd, 'listing_id');
      if (!listingId) throw new FormError('That business could not be found.');
      const supabase = await createClient();
      check(
        await supabase
          .from('favourites')
          .delete()
          .eq('user_id', user.id)
          .eq('listing_id', listingId),
      );
      return 'Removed from your saved businesses.';
    },
    { paths: [{ path: '/dashboard' }] },
  );
}
