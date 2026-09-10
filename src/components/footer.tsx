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
            <a href={`mailto:${email}`} className="mt-3 inline-block text-sm text-brand-700 hover:underline">
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
                  <Link href={item.url} className="text-[var(--text-muted)] hover:text-brand-700">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-[var(--border)]">
        <div className="container-page py-5 text-sm text-[var(--text-muted)]">
          © {new Date().getFullYear()} {copyright}
        </div>
      </div>
    </footer>
  );
}
