import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import { requireUser } from '@/lib/auth';
import { updateOwnListing } from '@/lib/listing-actions';
import { LISTING_EDIT_COLUMNS, getListingFormOptions } from '@/lib/listing-options';
import { ListingForm, type EditableHour, type EditableListing } from '@/components/listing-form';
import { Notice } from '@/components/admin-ui';

export const metadata = { title: 'Edit your business' };

export default async function EditOwnListing({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const user = await requireUser(`/dashboard/listings/${id}`);
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const supabase = await createClient();
  const [{ data: listing }, { data: hours }, options] = await Promise.all([
    supabase
      .from('listings')
      .select(LISTING_EDIT_COLUMNS)
      .eq('id', id)
      .eq('owner_user_id', user.id)
      .maybeSingle(),
    supabase
      .from('opening_hours')
      .select('day_of_week, opens_at, closes_at, is_closed, is_24h')
      .eq('listing_id', id),
    getListingFormOptions(),
  ]);
  // Filtered by owner as well as RLS: staff can read every listing through RLS,
  // but this page is only ever the owner's own.
  if (!listing) notFound();
  const l = listing as unknown as EditableListing;

  return (
    <div className="max-w-3xl">
      <p className="text-sm">
        <Link href="/dashboard" className="text-brand-700 hover:underline">
          ← My listings
        </Link>
      </p>
      <h1 className="mt-2 text-2xl font-semibold">{l.name}</h1>
      <Notice ok={sp.ok} error={sp.error} />
      <div className="mt-6">
        <ListingForm
          action={updateOwnListing}
          listing={l}
          hours={(hours ?? []) as EditableHour[]}
          categories={options.categories}
          cities={options.cities}
          submitLabel="Save changes"
        />
      </div>
    </div>
  );
}
