import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container-page grid min-h-[60vh] place-items-center py-20 text-center">
      <div className="max-w-md">
        <p className="font-display text-sm font-semibold tracking-widest text-brand-700">404</p>
        <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Page not found</h1>
        <p className="mt-4 text-[var(--text-muted)]">
          That page does not exist, or it moved. Try a search, or start from the listings.
        </p>
        <form action="/search" className="mt-8 flex gap-2">
          <input
            type="search"
            name="q"
            placeholder="Search businesses"
            aria-label="Search businesses"
            className="h-11 flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 outline-none focus:border-brand-500"
          />
          <button type="submit" className="h-11 rounded-lg bg-brand-700 px-5 font-medium text-white">
            Search
          </button>
        </form>
        <div className="mt-6 flex justify-center gap-4 text-sm">
          <Link href="/" className="text-brand-700 hover:underline">Home</Link>
          <Link href="/listings" className="text-brand-700 hover:underline">All listings</Link>
          <Link href="/categories" className="text-brand-700 hover:underline">Categories</Link>
        </div>
      </div>
    </div>
  );
}
