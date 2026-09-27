import Link from 'next/link';
import type { MenuItem } from '@/lib/queries';

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
    <footer className="mt-20 border-t border-[var(--border)] bg-[var(--surface-2)]">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-lg font-bold">{brand}</p>
          <p className="mt-2 max-w-xs text-sm text-[var(--text-muted)]">{tagline}</p>
          {email ? (
            <a
              href={`mailto:${email}`}
              className="text-brand-700 mt-3 inline-block text-sm hover:underline"
            >
              {email}
            </a>
          ) : null}
        </div>
        {columns.map((col) => (
          <div key={col.name}>
            <p className="font-display text-sm font-semibold">{col.name}</p>
            <ul className="mt-3 space-y-2 text-sm">
              {col.items.map((item) => (
                <li key={item.url}>
                  <Link href={item.url} className="hover:text-brand-700 text-[var(--text-muted)]">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-[var(--border)]">
        <div className="container-page flex flex-wrap items-center justify-between gap-3 py-5 text-sm text-[var(--text-muted)]">
          <span>
            © {new Date().getFullYear()} {copyright}
          </span>
          <span className="flex gap-4">
            <Link href="/privacy" className="hover:text-brand-700">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-brand-700">
              Terms of Service
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
