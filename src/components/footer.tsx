import Link from 'next/link';
import type { MenuItem } from '@/lib/queries';
import { Logo } from '@/components/logo';

// Only used when a footer menu comes back empty (e.g. the database is
// unreachable), so the footer never renders bare headings.
const FALLBACK: Record<string, MenuItem[]> = {
  Explore: [
    { label: 'Listings', url: '/listings', sort_order: 0 },
    { label: 'Categories', url: '/categories', sort_order: 1 },
    { label: 'Search', url: '/search', sort_order: 2 },
    { label: 'Blog', url: '/blog', sort_order: 3 },
  ],
  Company: [
    { label: 'About us', url: '/about', sort_order: 0 },
    { label: 'Contact us', url: '/contact', sort_order: 1 },
    { label: 'Sign in', url: '/login', sort_order: 2 },
  ],
};

export function Footer({
  brand,
  tagline,
  copyright,
  columns,
  email,
}: {
  brand: string;
  tagline: string;
  copyright: string;
  columns: { name: string; items: MenuItem[] }[];
  email: string;
}) {
  return (
    <footer className="border-t border-[#1c2636] bg-[#0b111b] text-slate-100">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr]">
        <div>
          <Logo brand={brand} />
          {tagline ? (
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">{tagline}</p>
          ) : null}
        </div>

        {columns.map((col) => {
          const items = col.items.length ? col.items : (FALLBACK[col.name] ?? []);
          return (
            <div key={col.name}>
              <p className="font-display text-sm font-bold text-white">{col.name}</p>
              <ul className="mt-4 space-y-2.5 text-sm">
                {items.map((item) => (
                  <li key={item.url}>
                    <Link
                      href={item.url}
                      className="text-slate-400 transition-colors hover:text-sky-400"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}

        <div>
          <p className="font-display text-sm font-bold text-white">Get listed</p>
          <p className="mt-4 text-sm leading-relaxed text-slate-400">
            Listing your business is free and takes a couple of minutes.
          </p>
          <Link
            href="/dashboard/listings/new"
            className="mt-4 inline-flex h-9 items-center rounded-full bg-sky-500 px-4 text-sm font-semibold text-white transition-colors hover:bg-sky-400"
          >
            Add listing
          </Link>
          {email ? (
            <a href={`mailto:${email}`} className="mt-4 block text-sm text-sky-400 hover:underline">
              {email}
            </a>
          ) : null}
        </div>
      </div>
      <div className="border-t border-[#1c2636]">
        <div className="container-page py-5 text-sm text-slate-500">
          © {new Date().getFullYear()} {copyright}
        </div>
      </div>
    </footer>
  );
}
