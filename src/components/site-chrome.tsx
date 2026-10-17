'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Public header, footer and floating buttons. The admin panel is a full-screen
 * app with its own sidebar, so they are left out there. Deciding on the client
 * keeps the root layout free of request data, so public pages stay static.
 */
export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname === '/admin' || pathname.startsWith('/admin/')) return null;
  return <>{children}</>;
}
