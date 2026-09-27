import Link from 'next/link';
import type { ChromeVM } from '@/lib/home-types';

// STUB — replaced by the header implementation.
export function Header({ chrome }: { chrome: ChromeVM }) {
  return (
    <header className="border-b border-[var(--border)]">
      <div className="container-wide flex h-16 items-center justify-between">
        <Link href="/">{chrome.brand.name}</Link>
      </div>
    </header>
  );
}
