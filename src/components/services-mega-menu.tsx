'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@/components/icon';
import { MegaMenu, MegaMenuFooter, focusRing } from '@/components/mega-menu';
import type { ServiceCategoryId, ServiceNavItem } from '@/lib/service-pages';

/** The services hub. Kept here, not imported, so the page copy stays out of the client bundle. */
export const SERVICES_BASE = '/seo-services';

/** Menu columns, in order. Labels live here so the page copy stays out of the client bundle. */
export const SERVICE_CATEGORIES: { id: ServiceCategoryId; label: string }[] = [
  { id: 'seo', label: 'SEO' },
  { id: 'links', label: 'Links & Authority' },
  { id: 'marketing', label: 'Content & Marketing' },
];

/** The page is the services hub or one of the service pages. */
export function isServicePath(pathname: string, services: ServiceNavItem[]): boolean {
  return (
    pathname === SERVICES_BASE ||
    pathname.startsWith(`${SERVICES_BASE}/`) ||
    services.some((s) => s.path === pathname)
  );
}

/** Desktop "SEO Services" trigger and its panel: icon rows in columns, as in the tools menu. */
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
      width="max-w-3xl"
    >
      <div className="grid grid-cols-3 gap-6 p-6">
        {SERVICE_CATEGORIES.map((category) => (
          <div key={category.id}>
            <p className="font-label-sm text-label-sm text-secondary mb-2 px-2 tracking-wider uppercase">
              {category.label}
            </p>
            <ul className="flex flex-col gap-0.5">
              {services
                .filter((service) => service.category === category.id)
                .map((service) => (
                  <li key={service.slug}>
                    <Link
                      href={service.path}
                      aria-current={pathname === service.path ? 'page' : undefined}
                      className={`font-label-md text-label-md text-on-surface hover:bg-surface-container-low hover:text-primary-container flex items-center gap-3 rounded-lg px-2 py-2 transition-colors ${focusRing}`}
                    >
                      <span className="bg-brand-50 text-primary-container grid size-8 shrink-0 place-items-center rounded-lg">
                        <Icon name={service.icon} size={18} />
                      </span>
                      <span className="min-w-0 flex-1">{service.name}</span>
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
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
