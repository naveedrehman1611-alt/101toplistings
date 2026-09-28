'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from './supabase-server';
import { getCurrentUser } from './auth';

/**
 * "Save" on a listing page. The page is ISR-static, so it cannot know who is
 * looking at it: the button asks for its state after hydration and toggles
 * through here. RLS (favourites_own) limits every read and write to the
 * signed-in user's own rows, and these functions check the session again
 * because Server Functions are reachable by direct POST.
 *
 * Neither function throws to the client: failures are logged and reported as
 * a status the button can show.
 */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(v: unknown): v is string {
  return typeof v === 'string' && UUID.test(v);
}

export async function getSavedState(
  listingId: string,
): Promise<{ signedIn: boolean; saved: boolean }> {
  if (!isUuid(listingId)) return { signedIn: false, saved: false };
  let signedIn = false;
  try {
    const user = await getCurrentUser();
    if (!user) return { signedIn, saved: false };
    signedIn = true;

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('favourites')
      .select('listing_id')
      .eq('user_id', user.id)
      .eq('listing_id', listingId)
      .maybeSingle();
    if (error) throw error;
    return { signedIn, saved: data !== null };
  } catch (e) {
    console.error('[favourites] reading saved state failed:', e);
    return { signedIn, saved: false };
  }
}

export async function toggleSavedListing(
  listingId: string,
): Promise<{ status: 'saved' | 'removed' | 'signin' | 'error'; message?: string }> {
  if (!isUuid(listingId)) return { status: 'error', message: 'That listing could not be found.' };
  try {
    const user = await getCurrentUser();
    if (!user) return { status: 'signin' };

    const supabase = await createClient();
    const { data: existing, error: readError } = await supabase
      .from('favourites')
      .select('listing_id')
      .eq('user_id', user.id)
      .eq('listing_id', listingId)
      .maybeSingle();
    if (readError) throw readError;

    if (existing) {
      const { error } = await supabase
        .from('favourites')
        .delete()
        .eq('user_id', user.id)
        .eq('listing_id', listingId);
      if (error) throw error;
      revalidatePath('/dashboard');
      return { status: 'removed' };
    }

    const { error } = await supabase
      .from('favourites')
      .insert({ user_id: user.id, listing_id: listingId });
    // 23505: already saved (a double click or a second tab) — the outcome the
    // visitor asked for. 23503: the listing no longer exists.
    if (error?.code === '23503') {
      return { status: 'error', message: 'That listing is no longer available.' };
    }
    if (error && error.code !== '23505') throw error;
    revalidatePath('/dashboard');
    return { status: 'saved' };
  } catch (e) {
    console.error('[favourites] toggle failed:', e);
    return { status: 'error', message: 'Could not update your saved listings. Please try again.' };
  }
}
