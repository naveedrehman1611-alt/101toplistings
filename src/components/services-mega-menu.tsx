'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@/components/icon';
import { MegaMenu, MegaMenuFooter, focusRing } from '@/components/mega-menu';
import type { ServiceNavItem } from '@/lib/service-pages';

/** The services hub. Kept here, not imported, so the page copy stays out of the client bundle. */
export const SERVICES_BASE = '/seo-services';

/** The page is the services hub or one of the service pages. */
export function isServicePath(pathname: string, services: ServiceNavItem[]): boolean {
  return (
    pathname === SERVICES_BASE ||
    pathname.startsWith(`${SERVICES_BASE}/`) ||
    services.some((s) => s.path === pathname)
  );
}

/** Desktop "SEO Services" trigger and its panel: one card per service, as on the hub. */
export function ServicesMegaMenu({
  services,
  label,
}: {
  services: ServiceNavItem[];
  /** The admin's label when the menu replaces their link to the hub. */
  label?: string;
}) {
  const pathname = usePathname();

  return (
    <MegaMenu
      label={label ?? 'SEO Services'}
      shortLabel={label ?? 'Services'}
      active={isServicePath(pathname, services)}
    >
      <ul className="grid grid-cols-4 gap-2 p-4">
        {services.map((service) => (
          <li key={service.slug}>
            <Link
              href={service.path}
              aria-current={pathname === service.path ? 'page' : undefined}
              className={`group hover:bg-surface-container-low flex h-full flex-col rounded-xl p-3 transition-colors ${focusRing}`}
            >
              <span className="bg-brand-50 text-primary-container mb-3 grid size-10 place-items-center rounded-lg">
                <Icon name={service.icon} size={20} />
              </span>
              <span className="font-title-md text-title-md text-on-surface group-hover:text-primary-container transition-colors">
                {service.name}
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant mt-1 line-clamp-2">
                {service.description}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <MegaMenuFooter>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Not sure where to start?{' '}
          <Link
            href="/seo-audit"
            className={`text-primary-container hover:text-primary rounded-sm font-semibold transition-colors ${focusRing}`}
          >
            Get an SEO audit
          </Link>
        </p>
        <Link
          href={SERVICES_BASE}
          className={`font-label-md text-label-md text-primary-container hover:text-primary inline-flex items-center gap-1 rounded-sm font-semibold transition-colors ${focusRing}`}
        >
          View all SEO services
          <Icon name="north_east" size={16} />
        </Link>
      </MegaMenuFooter>
    </MegaMenu>
  );
}
