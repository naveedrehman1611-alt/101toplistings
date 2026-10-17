import type { Role } from '@/lib/role-order';

/**
 * The admin sidebar, grouped. `min` is the lowest role that sees the link:
 *   Moderator   Dashboard, Listings, Reviews, Claims, Inbox, Subscribers
 *   Editor      + Categories, Locations, Areas, Amenities, Blog, Media,
 *                 Content, Menus, Pages, Announcement bar, SEO
 *   Admin       + Redirects, 404 log, Users, Settings, Audit log
 * Each page enforces the same role with requireRole(); hiding a link is only
 * a convenience. `badge` names a count the layout fills in.
 */
export type NavItem = {
  href: string;
  label: string;
  min: Role;
  isNew?: boolean;
  badge?: 'listings' | 'reviews' | 'claims' | 'inbox';
};

export type NavGroup = { group: string; items: NavItem[] };

export const ADMIN_NAV: NavGroup[] = [
  { group: 'Overview', items: [{ href: '/admin', label: 'Dashboard', min: 'moderator' }] },
  {
    group: 'Moderation',
    items: [
      { href: '/admin/listings', label: 'Listings', min: 'moderator', badge: 'listings' },
      { href: '/admin/reviews', label: 'Reviews', min: 'moderator', badge: 'reviews' },
      { href: '/admin/claims', label: 'Claims', min: 'moderator', badge: 'claims' },
      { href: '/admin/inbox', label: 'Inbox', min: 'moderator', badge: 'inbox' },
    ],
  },
  {
    group: 'Audience',
    items: [{ href: '/admin/subscribers', label: 'Subscribers', min: 'moderator' }],
  },
  {
    group: 'Directory',
    items: [
      { href: '/admin/categories', label: 'Categories', min: 'editor' },
      { href: '/admin/locations', label: 'Locations', min: 'editor' },
      { href: '/admin/areas', label: 'Areas', min: 'editor', isNew: true },
      { href: '/admin/amenities', label: 'Amenities', min: 'editor', isNew: true },
    ],
  },
  {
    group: 'Content',
    items: [
      { href: '/admin/blog', label: 'Blog', min: 'editor' },
      { href: '/admin/media', label: 'Media', min: 'editor' },
      { href: '/admin/content', label: 'Content', min: 'editor' },
      { href: '/admin/menus', label: 'Menus', min: 'editor' },
      { href: '/admin/pages', label: 'Pages & sections', min: 'editor' },
      { href: '/admin/announcement', label: 'Announcement bar', min: 'editor', isNew: true },
    ],
  },
  {
    group: 'SEO',
    items: [
      { href: '/admin/seo', label: 'SEO', min: 'editor' },
      { href: '/admin/redirects', label: 'Redirects', min: 'admin' },
      { href: '/admin/404-log', label: '404 log', min: 'admin', isNew: true },
    ],
  },
  {
    group: 'System',
    items: [
      { href: '/admin/users', label: 'Users', min: 'admin' },
      { href: '/admin/settings', label: 'Settings', min: 'admin' },
      { href: '/admin/audit-log', label: 'Audit log', min: 'admin', isNew: true },
    ],
  },
];

/** The nav item a path belongs to: the longest href that prefixes it. */
export function activeItem(pathname: string): { group: string; item: NavItem } | null {
  let best: { group: string; item: NavItem } | null = null;
  for (const g of ADMIN_NAV) {
    for (const item of g.items) {
      const hit =
        item.href === '/admin'
          ? pathname === '/admin'
          : pathname === item.href || pathname.startsWith(`${item.href}/`);
      if (hit && (!best || item.href.length > best.item.href.length)) {
        best = { group: g.group, item };
      }
    }
  }
  return best;
}

export const ROLE_LABEL: Record<Role, string> = {
  user: 'User',
  business_owner: 'Business owner',
  moderator: 'Moderator',
  editor: 'Editor',
  admin: 'Admin',
  super_admin: 'Super admin',
};
