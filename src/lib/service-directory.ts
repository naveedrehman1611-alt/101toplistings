/**
 * Industry SEO pages → the directory categories that serve the same industry,
 * so /seo-services/plumber-seo links to /category/plumbers and the two halves
 * of the site reinforce each other.
 *
 * Categories live in the database and editors can rename or remove them, so
 * these are candidates only: the page links the ones that exist and have
 * approved listings (src/app/seo-services/[slug]/page.tsx), in this order.
 * Slugs come from the 0017 starter set and the 0021 category tree.
 */
export const SERVICE_DIRECTORY_CATEGORIES: Record<string, string[]> = {
  'real-estate-seo': ['real-estate-agents', 'real-estate', 'builders', 'construction-real-estate'],
  'seo-for-doctors': ['doctors', 'clinics', 'health-medical'],
  'seo-for-lawyers': ['law-firms', 'lawyers', 'advocates', 'law-legal-services'],
  'restaurant-seo': ['restaurants', 'cafes', 'fast-food', 'food-restaurant'],
  'hotel-seo': ['hotels', 'guest-houses', 'hotels-travel'],
  'fintech-seo': ['finance-banking', 'money-transfer'],
  'saas-seo': ['software-houses', 'it-technology'],
  'it-company-seo': ['software-houses', 'it-support', 'it-services', 'it-technology'],
  'fashion-seo': ['clothing', 'shoes', 'retail-shopping'],
  'travel-seo': ['travel-agencies', 'tour-operators', 'travel-agents', 'hotels-travel'],
  'seo-for-dentists': ['dental-clinics', 'dentists'],
  'education-seo': ['schools', 'colleges', 'coaching-centers', 'education-training'],
  'manufacturing-seo': ['factories', 'manufacturing-industry'],
  'contractor-seo': ['contractors', 'builders', 'construction-real-estate'],
  'home-services-seo': ['home-services', 'home-cleaning', 'carpenter'],
  'insurance-seo': ['insurance', 'finance-banking'],
  'banking-seo': ['banks', 'microfinance', 'finance-banking'],
  'car-dealer-seo': ['car-dealers', 'bike-dealers', 'automotive'],
  'plastic-surgery-seo': ['skin-clinics', 'clinics'],
  'photography-seo': ['photographers', 'videographers'],
  'accounting-seo': ['accountants', 'tax-consultants'],
  'architecture-seo': ['architects', 'interior-designers'],
  'pest-control-seo': ['pest-control', 'home-services'],
  'plumber-seo': ['plumbers', 'home-services'],
  'electrician-seo': ['electricians', 'home-services'],
  'retail-seo': ['retail-shopping', 'shopping', 'supermarkets'],
  'jeweler-seo': ['jewelry'],
  'logistics-seo': ['packaging', 'industrial-supplies'],
  'financial-services-seo': ['investment-advisors', 'loan-services', 'finance-banking'],
  'orthodontist-seo': ['dental-clinics', 'dentists'],
  'periodontist-seo': ['dental-clinics', 'dentists'],
  'hospital-seo': ['hospitals', 'labs', 'health-medical'],
  'hvac-seo': ['ac-repair'],
  'cleaning-company-seo': ['home-cleaning', 'home-services'],
  'painter-seo': ['painter', 'paint-services'],
  'appliance-repair-seo': ['appliance-repair', 'ac-repair'],
  'body-shop-seo': ['auto-workshops', 'car-repair', 'automotive'],
  'food-delivery-seo': ['restaurants', 'home-chefs', 'fast-food', 'food-restaurant'],
  'cosmetics-seo': ['beauty-salons', 'makeup-artists', 'beauty-spa'],
  'industrial-seo': ['industrial-supplies', 'machinery', 'manufacturing-industry'],
  'furniture-store-seo': ['furniture'],
  'personal-injury-seo': ['law-firms', 'lawyers', 'advocates'],
  'professional-firms-seo': ['professional-services', 'business-consultants'],
  'agency-seo': ['advertising-agencies', 'digital-marketing', 'media-advertising'],
};

/** How many category links an industry page shows at most. */
export const MAX_DIRECTORY_LINKS = 3;
