/**
 * Every page whose copy, links and images are editable in Admin → Content.
 * A page id and section name together form the site_content key
 * ("home.hero"), so both must stay lowercase letters, digits, - and _, and
 * renaming one orphans the saved override.
 *
 * Safe to import from client and server code.
 */

import type { PageSpec } from './schema';
import { HOME_PAGE } from './pages/home';
import { COMPANY_PAGES } from './pages/company';
import { SERVICES_PAGES } from './pages/services';
import { DIRECTORY_PAGES } from './pages/directory';
import { TOOLS_PAGES } from './pages/tools';
import { GLOBAL_PAGES } from './pages/global';

export const CONTENT_PAGES = {
  home: HOME_PAGE,
  ...COMPANY_PAGES,
  ...SERVICES_PAGES,
  ...DIRECTORY_PAGES,
  ...TOOLS_PAGES,
  ...GLOBAL_PAGES,
} satisfies Record<string, PageSpec>;

export type PageId = keyof typeof CONTENT_PAGES;

const KEY_PART = /^[a-z0-9_-]+$/;

export function isPageId(value: string): value is PageId {
  return Object.prototype.hasOwnProperty.call(CONTENT_PAGES, value);
}

/** The spec for "<page>.<section>", or null when either part is unknown. */
export function sectionFor(page: string, section: string) {
  if (!KEY_PART.test(page) || !KEY_PART.test(section) || !isPageId(page)) return null;
  const sections = CONTENT_PAGES[page].sections as PageSpec['sections'];
  return Object.prototype.hasOwnProperty.call(sections, section) ? sections[section] : null;
}
