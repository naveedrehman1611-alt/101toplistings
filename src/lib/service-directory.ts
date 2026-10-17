/**
 * Industry SEO pages → the directory categories that serve the same industry,
 * so /seo-services/home-services-seo links to /category/plumbers and the two halves
 * of the site reinforce each other.
 *
 * Categories live in the database and editors can rename or remove them, so
 * these are candidates only: the page links the ones that exist and have
 * approved listings (src/app/seo-services/[slug]/page.tsx), in this order.
 * Slugs come from the 0017 starter set and the 0021 category tree.
 */
export const SERVICE_DIRECTORY_CATEGORIES: Record<string, string[]> = {
  'saas-seo': ['software-houses', 'it-technology', 'it-services'],
  'seo-for-dentists': ['dental-clinics', 'dentists'],
  'home-services-seo': [
    'home-services',
    'plumbers',
    'electricians',
    'ac-repair',
    'home-cleaning',
    'pest-control',
    'painter',
    'appliance-repair',
    'contractors',
    'carpenter',
  ],
  'professional-firms-seo': [
    'professional-services',
    'law-firms',
    'lawyers',
    'accountants',
    'business-consultants',
    'architects',
    'insurance',
    'investment-advisors',
  ],
};

/** How many category links an industry page shows at most. */
export const MAX_DIRECTORY_LINKS = 3;
