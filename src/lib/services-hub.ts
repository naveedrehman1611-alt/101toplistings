import type { IconName } from '@/components/icon';
import type { HubCategoryId } from '@/lib/service-pages';
import type { SectionValues } from '@/lib/content/schema';
import type { SERVICES_PAGES } from '@/lib/content/pages/services';

/**
 * Section headers for the /seo-services hub, in page order. Which services sit
 * in each section comes from ServicePage.hub; the industry section renders as
 * compact tiles instead of cards. The titles here are the defaults; the page
 * reads the edited ones through hubTitle().
 */

export type HubCategory = {
  id: HubCategoryId;
  /** Section heading. */
  title: string;
  /** Shown in the category header tile. */
  icon: IconName;
};

export const HUB_CATEGORIES: HubCategory[] = [
  { id: 'core', title: 'Core SEO Services', icon: 'search' },
  { id: 'technical', title: 'Technical SEO Services', icon: 'build' },
  { id: 'links', title: 'Link Building & Authority Services', icon: 'link' },
  { id: 'ai', title: 'AI SEO, AEO & GEO Services', icon: 'smart_toy' },
  { id: 'platform', title: 'Platform-Specific SEO Services', icon: 'language' },
  { id: 'ecommerce', title: 'Ecommerce SEO Services', icon: 'shopping_bag' },
  { id: 'specialty', title: 'Specialty & Niche SEO Services', icon: 'verified' },
  { id: 'industry', title: 'Industry-Specific SEO Services', icon: 'business_center' },
];

/** Sections whose first card is not the navy featured card, as on the reference page. */
export const UNFEATURED_HUBS: HubCategoryId[] = ['specialty'];

type HubSections = (typeof SERVICES_PAGES)['seo_services']['sections'];
type HubContent = {
  groups: SectionValues<HubSections['groups']>;
  industries: SectionValues<HubSections['industries']>;
};

/** A hub section's heading as edited in Admin → Content (SEO services hub). */
export function hubTitle(content: HubContent, id: HubCategoryId): string {
  return id === 'industry' ? content.industries.heading : content.groups[`${id}_title`];
}

/** A hub section's header icon as edited in Admin → Content (SEO services hub). */
export function hubIcon(content: HubContent, id: HubCategoryId): IconName {
  return id === 'industry' ? content.industries.icon : content.groups[`${id}_icon`];
}
