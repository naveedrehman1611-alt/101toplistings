import { requireUser } from '@/lib/auth';
import { submitOwnListing } from '@/lib/listing-actions';
import { getListingFormOptions } from '@/lib/listing-options';
import { ListingForm } from '@/components/listing-form';
import { Notice } from '@/components/admin-ui';

export const metadata = { title: 'Add your business' };

export default async function NewOwnListing({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireUser('/dashboard/listings/new');
  const sp = await searchParams;
  const { categories, cities } = await getListingFormOptions();

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold">Add your business</h1>
      <p className="mt-2 text-sm text-[var(--text-muted)]">
        Free to list. Our team reviews each submission before it appears on the site, usually within
        a couple of days.
      </p>
      <Notice error={sp.error} />
      {cities.length === 0 ? (
        <p className="mt-6 rounded-lg border border-dashed border-[var(--border)] p-5 text-sm">
          We are not accepting listings yet — no cities have been set up. Please check back soon.
        </p>
      ) : (
        <div className="mt-6">
          <ListingForm
            action={submitOwnListing}
            categories={categories}
            cities={cities}
            submitLabel="Submit for review"
          />
        </div>
      )}
    </div>
  );
}
