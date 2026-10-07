import Link from 'next/link';
import { requireUser, roleAtLeast } from '@/lib/auth';
import { loadStarterData } from '@/lib/taxonomy-actions';
import { submitOwnListing } from '@/lib/listing-actions';
import { getListingFormOptions } from '@/lib/listing-options';
import { ListingForm } from '@/components/listing-form';
import { Notice, SubmitButton } from '@/components/admin-ui';

export const metadata = { title: 'Add your business' };

export default async function NewOwnListing({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const user = await requireUser('/dashboard/listings/new');
  const isEditor = roleAtLeast(user.role, 'editor');
  const sp = await searchParams;
  const { categories, cities } = await getListingFormOptions();

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold">Add your business</h1>
      <p className="mt-2 text-sm text-[var(--text-muted)]">
        Free to list. Our team reviews each submission before it appears on the site, usually within
        a couple of days.
      </p>
      <Notice ok={sp.ok} error={sp.error} />
      {cities.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed border-[var(--border)] p-5 text-sm">
          {isEditor ? (
            <>
              <p className="font-medium">No cities have been set up yet.</p>
              <p className="mt-1 text-[var(--text-muted)]">
                A listing needs a city. Load the UK, US and UAE with 21 regions, 32 major cities and
                22 common categories in one click, or add your own under{' '}
                <Link href="/admin/locations" className="text-brand-700 hover:underline">
                  Admin → Locations
                </Link>
                .
              </p>
              <form action={loadStarterData} className="mt-4">
                <input type="hidden" name="back" value="new-listing" />
                <SubmitButton>Load starter cities and categories</SubmitButton>
              </form>
            </>
          ) : (
            <p>
              We are not accepting listings yet — no cities have been set up. Please check back
              soon, or{' '}
              <Link href="/contact" className="text-brand-700 hover:underline">
                contact us
              </Link>{' '}
              to get your business listed.
            </p>
          )}
        </div>
      ) : (
        <div className="mt-6">
          <ListingForm
            action={submitOwnListing}
            categories={categories}
            cities={cities}
            images
            submitLabel="Submit for review"
          />
        </div>
      )}
    </div>
  );
}
