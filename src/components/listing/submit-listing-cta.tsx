import Link from 'next/link';

export function SubmitListingCta() {
  return (
    <section className="from-brand-700 to-brand-900 mt-16 rounded-2xl bg-gradient-to-br px-6 py-10 text-white sm:px-10">
      <h2 className="text-2xl font-semibold sm:text-3xl">Submit Your Listing Today!</h2>
      <p className="text-brand-100 mt-3 max-w-2xl">
        Covering all of Pakistan — add your business to RankYouSite and get found by customers
        searching near you.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/dashboard/listings/new"
          className="text-brand-800 hover:bg-brand-50 inline-flex h-11 items-center justify-center rounded-lg bg-white px-5 text-sm font-medium transition-colors"
        >
          Add your business
        </Link>
        <Link
          href="/listings"
          className="inline-flex h-11 items-center justify-center rounded-lg border border-white/40 px-5 text-sm font-medium text-white transition-colors hover:bg-white/10"
        >
          Browse listings
        </Link>
      </div>
    </section>
  );
}
