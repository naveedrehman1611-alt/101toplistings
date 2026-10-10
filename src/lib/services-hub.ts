import type { IconName } from '@/components/icon';
import type { ServiceCategoryId } from '@/lib/service-pages';

/**
 * Presentation data for the /seo-services hub: category section headers, the
 * badge on each service card and the industries grid. Page copy lives in
 * service-pages.ts.
 */

export type HubCategory = {
  id: ServiceCategoryId;
  /** Section heading. */
  title: string;
  /** Shown in the category header tile. */
  icon: IconName;
};

export const HUB_CATEGORIES: HubCategory[] = [
  { id: 'seo', title: 'Core SEO Services', icon: 'search' },
  { id: 'links', title: 'Link Building & Authority Services', icon: 'link' },
  { id: 'marketing', title: 'Content & Digital Marketing Services', icon: 'campaign' },
];

/** Small uppercase badge on each service card, keyed by ServicePage.slug. */
export const SERVICE_TAGS: Record<string, string> = {
  'local-seo': 'Most Popular',
  'technical-seo': 'Foundation',
  'on-page-seo': 'On-Site',
  'off-page-seo': 'Authority',
  'link-building': 'Backlinks',
  'guest-posting': 'Outreach',
  'content-marketing': 'Content',
  'digital-marketing': 'Full Funnel',
};

export type Industry = { name: string; icon: IconName };

export const INDUSTRIES_TITLE = 'Industry-Specific SEO Services';
export const INDUSTRIES_ICON: IconName = 'business_center';

/** Common local-business industries shown as a grid on the hub. */
export const INDUSTRIES: Industry[] = [
  { name: 'Real Estate SEO', icon: 'apartment' },
  { name: 'SEO for Doctors', icon: 'medical_services' },
  { name: 'SEO for Lawyers', icon: 'gavel' },
  { name: 'Restaurant SEO', icon: 'restaurant' },
  { name: 'Hotel SEO', icon: 'hotel' },
  { name: 'SEO for Dentists', icon: 'medical_services' },
  { name: 'Ecommerce SEO', icon: 'shopping_bag' },
  { name: 'SaaS SEO', icon: 'data_object' },
  { name: 'Plumber SEO', icon: 'home_repair_service' },
  { name: 'Electrician SEO', icon: 'build' },
  { name: 'HVAC SEO', icon: 'home_repair_service' },
  { name: 'Roofing SEO', icon: 'domain' },
  { name: 'Salon SEO', icon: 'storefront' },
  { name: 'Gym & Fitness SEO', icon: 'groups' },
  { name: 'Auto Repair SEO', icon: 'build' },
  { name: 'Education SEO', icon: 'school' },
  { name: 'Travel SEO', icon: 'flight_takeoff' },
  { name: 'Accountant SEO', icon: 'account_balance' },
  { name: 'Construction SEO', icon: 'location_city' },
  { name: 'Cleaning Services SEO', icon: 'check_circle' },
  { name: 'Moving Company SEO', icon: 'near_me' },
  { name: 'Photographer SEO', icon: 'visibility' },
  { name: 'Wedding SEO', icon: 'star' },
  { name: 'Startup SEO', icon: 'rocket_launch' },
];
