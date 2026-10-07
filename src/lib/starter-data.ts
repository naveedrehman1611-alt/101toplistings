// Starter taxonomy for the launch markets — the United Kingdom, the United
// States, the United Arab Emirates and Europe — identical to
// supabase/migrations/0018 and 0023 (categories: 0017 + 0020). The admin "Load starter data" button inserts it
// through the normal RLS-checked client, so a fresh database can be filled
// without opening the SQL editor.
//
// Location slugs are unique across countries, regions and cities (a trigger
// enforces it), so where a region and its main city share a name the region
// slug carries a suffix: "new-york-state" / "new-york", "dubai-emirate" /
// "dubai".

export type StarterCountry = {
  slug: string;
  name: string;
  iso2: string;
  iso3: string;
  phone_code: string;
  latitude: number;
  longitude: number;
};

export type StarterRegion = {
  /** Slug of the country this region belongs to. */
  country: string;
  slug: string;
  name: string;
  code: string;
  lat: number;
  lng: number;
};

export type StarterCity = {
  /** Slug of the region this city belongs to. */
  region: string;
  slug: string;
  name: string;
  lat: number;
  lng: number;
  featured: boolean;
};

export const STARTER_COUNTRIES: StarterCountry[] = [
  {
    slug: 'united-kingdom',
    name: 'United Kingdom',
    iso2: 'GB',
    iso3: 'GBR',
    phone_code: '+44',
    latitude: 55.3781,
    longitude: -3.436,
  },
  {
    slug: 'united-states',
    name: 'United States',
    iso2: 'US',
    iso3: 'USA',
    phone_code: '+1',
    latitude: 37.0902,
    longitude: -95.7129,
  },
  {
    slug: 'united-arab-emirates',
    name: 'United Arab Emirates',
    iso2: 'AE',
    iso3: 'ARE',
    phone_code: '+971',
    latitude: 23.4241,
    longitude: 53.8478,
  },
  {
    slug: 'france',
    name: 'France',
    iso2: 'FR',
    iso3: 'FRA',
    phone_code: '+33',
    latitude: 46.2276,
    longitude: 2.2137,
  },
  {
    slug: 'germany',
    name: 'Germany',
    iso2: 'DE',
    iso3: 'DEU',
    phone_code: '+49',
    latitude: 51.1657,
    longitude: 10.4515,
  },
  {
    slug: 'spain',
    name: 'Spain',
    iso2: 'ES',
    iso3: 'ESP',
    phone_code: '+34',
    latitude: 40.4637,
    longitude: -3.7492,
  },
  {
    slug: 'italy',
    name: 'Italy',
    iso2: 'IT',
    iso3: 'ITA',
    phone_code: '+39',
    latitude: 41.8719,
    longitude: 12.5674,
  },
  {
    slug: 'netherlands',
    name: 'Netherlands',
    iso2: 'NL',
    iso3: 'NLD',
    phone_code: '+31',
    latitude: 52.1326,
    longitude: 5.2913,
  },
];

const UK = 'united-kingdom';
const US = 'united-states';
const AE = 'united-arab-emirates';

export const STARTER_REGIONS: StarterRegion[] = [
  // United Kingdom — the four nations
  { country: UK, slug: 'england', name: 'England', code: 'ENG', lat: 52.3555, lng: -1.1743 },
  { country: UK, slug: 'scotland', name: 'Scotland', code: 'SCT', lat: 56.4907, lng: -4.2026 },
  { country: UK, slug: 'wales', name: 'Wales', code: 'WLS', lat: 52.1307, lng: -3.7837 },
  {
    country: UK,
    slug: 'northern-ireland',
    name: 'Northern Ireland',
    code: 'NIR',
    lat: 54.7877,
    lng: -6.4923,
  },
  // United States — the states of the starter cities
  {
    country: US,
    slug: 'new-york-state',
    name: 'New York',
    code: 'NY',
    lat: 43.2994,
    lng: -74.2179,
  },
  { country: US, slug: 'california', name: 'California', code: 'CA', lat: 36.7783, lng: -119.4179 },
  { country: US, slug: 'illinois', name: 'Illinois', code: 'IL', lat: 40.6331, lng: -89.3985 },
  { country: US, slug: 'texas', name: 'Texas', code: 'TX', lat: 31.9686, lng: -99.9018 },
  { country: US, slug: 'florida', name: 'Florida', code: 'FL', lat: 27.6648, lng: -81.5158 },
  { country: US, slug: 'arizona', name: 'Arizona', code: 'AZ', lat: 34.0489, lng: -111.0937 },
  { country: US, slug: 'washington', name: 'Washington', code: 'WA', lat: 47.7511, lng: -120.7401 },
  {
    country: US,
    slug: 'massachusetts',
    name: 'Massachusetts',
    code: 'MA',
    lat: 42.4072,
    lng: -71.3824,
  },
  { country: US, slug: 'nevada', name: 'Nevada', code: 'NV', lat: 38.8026, lng: -116.4194 },
  {
    country: US,
    slug: 'district-of-columbia',
    name: 'District of Columbia',
    code: 'DC',
    lat: 38.9072,
    lng: -77.0369,
  },
  // United Arab Emirates — the seven emirates
  {
    country: AE,
    slug: 'abu-dhabi-emirate',
    name: 'Abu Dhabi',
    code: 'AZ',
    lat: 23.4677,
    lng: 53.7369,
  },
  { country: AE, slug: 'dubai-emirate', name: 'Dubai', code: 'DU', lat: 25.0657, lng: 55.1713 },
  { country: AE, slug: 'sharjah-emirate', name: 'Sharjah', code: 'SH', lat: 25.2867, lng: 55.6206 },
  { country: AE, slug: 'ajman-emirate', name: 'Ajman', code: 'AJ', lat: 25.4052, lng: 55.5136 },
  {
    country: AE,
    slug: 'umm-al-quwain-emirate',
    name: 'Umm Al Quwain',
    code: 'UQ',
    lat: 25.5205,
    lng: 55.7134,
  },
  {
    country: AE,
    slug: 'ras-al-khaimah-emirate',
    name: 'Ras Al Khaimah',
    code: 'RK',
    lat: 25.6741,
    lng: 55.9804,
  },
  {
    country: AE,
    slug: 'fujairah-emirate',
    name: 'Fujairah',
    code: 'FU',
    lat: 25.4111,
    lng: 56.2482,
  },
  // Europe — the regions of the starter cities
  {
    country: 'france',
    slug: 'ile-de-france',
    name: 'Île-de-France',
    code: 'IDF',
    lat: 48.8499,
    lng: 2.637,
  },
  { country: 'germany', slug: 'berlin-state', name: 'Berlin', code: 'BE', lat: 52.52, lng: 13.405 },
  { country: 'germany', slug: 'bavaria', name: 'Bavaria', code: 'BY', lat: 48.7904, lng: 11.4979 },
  {
    country: 'spain',
    slug: 'madrid-community',
    name: 'Community of Madrid',
    code: 'MD',
    lat: 40.4168,
    lng: -3.7038,
  },
  { country: 'spain', slug: 'catalonia', name: 'Catalonia', code: 'CT', lat: 41.5912, lng: 1.5209 },
  { country: 'italy', slug: 'lazio', name: 'Lazio', code: '62', lat: 41.6552, lng: 12.9896 },
  { country: 'italy', slug: 'lombardy', name: 'Lombardy', code: '25', lat: 45.4791, lng: 9.8452 },
  {
    country: 'netherlands',
    slug: 'north-holland',
    name: 'North Holland',
    code: 'NH',
    lat: 52.5206,
    lng: 4.7885,
  },
];

export const STARTER_CITIES: StarterCity[] = [
  // England
  { region: 'england', slug: 'london', name: 'London', lat: 51.5074, lng: -0.1278, featured: true },
  {
    region: 'england',
    slug: 'manchester',
    name: 'Manchester',
    lat: 53.4808,
    lng: -2.2426,
    featured: true,
  },
  {
    region: 'england',
    slug: 'birmingham',
    name: 'Birmingham',
    lat: 52.4862,
    lng: -1.8904,
    featured: true,
  },
  { region: 'england', slug: 'leeds', name: 'Leeds', lat: 53.8008, lng: -1.5491, featured: false },
  {
    region: 'england',
    slug: 'liverpool',
    name: 'Liverpool',
    lat: 53.4084,
    lng: -2.9916,
    featured: false,
  },
  {
    region: 'england',
    slug: 'bristol',
    name: 'Bristol',
    lat: 51.4545,
    lng: -2.5879,
    featured: false,
  },
  {
    region: 'england',
    slug: 'sheffield',
    name: 'Sheffield',
    lat: 53.3811,
    lng: -1.4701,
    featured: false,
  },
  {
    region: 'england',
    slug: 'newcastle-upon-tyne',
    name: 'Newcastle upon Tyne',
    lat: 54.9783,
    lng: -1.6178,
    featured: false,
  },
  // Scotland, Wales, Northern Ireland
  {
    region: 'scotland',
    slug: 'edinburgh',
    name: 'Edinburgh',
    lat: 55.9533,
    lng: -3.1883,
    featured: true,
  },
  {
    region: 'scotland',
    slug: 'glasgow',
    name: 'Glasgow',
    lat: 55.8642,
    lng: -4.2518,
    featured: true,
  },
  {
    region: 'wales',
    slug: 'cardiff',
    name: 'Cardiff',
    lat: 51.4816,
    lng: -3.1791,
    featured: false,
  },
  {
    region: 'northern-ireland',
    slug: 'belfast',
    name: 'Belfast',
    lat: 54.5973,
    lng: -5.9301,
    featured: false,
  },
  // United States
  {
    region: 'new-york-state',
    slug: 'new-york',
    name: 'New York',
    lat: 40.7128,
    lng: -74.006,
    featured: true,
  },
  {
    region: 'california',
    slug: 'los-angeles',
    name: 'Los Angeles',
    lat: 34.0522,
    lng: -118.2437,
    featured: true,
  },
  {
    region: 'california',
    slug: 'san-francisco',
    name: 'San Francisco',
    lat: 37.7749,
    lng: -122.4194,
    featured: false,
  },
  {
    region: 'illinois',
    slug: 'chicago',
    name: 'Chicago',
    lat: 41.8781,
    lng: -87.6298,
    featured: true,
  },
  {
    region: 'texas',
    slug: 'houston',
    name: 'Houston',
    lat: 29.7604,
    lng: -95.3698,
    featured: true,
  },
  { region: 'texas', slug: 'dallas', name: 'Dallas', lat: 32.7767, lng: -96.797, featured: false },
  { region: 'florida', slug: 'miami', name: 'Miami', lat: 25.7617, lng: -80.1918, featured: true },
  {
    region: 'arizona',
    slug: 'phoenix',
    name: 'Phoenix',
    lat: 33.4484,
    lng: -112.074,
    featured: false,
  },
  {
    region: 'washington',
    slug: 'seattle',
    name: 'Seattle',
    lat: 47.6062,
    lng: -122.3321,
    featured: false,
  },
  {
    region: 'massachusetts',
    slug: 'boston',
    name: 'Boston',
    lat: 42.3601,
    lng: -71.0589,
    featured: false,
  },
  {
    region: 'nevada',
    slug: 'las-vegas',
    name: 'Las Vegas',
    lat: 36.1699,
    lng: -115.1398,
    featured: false,
  },
  {
    region: 'district-of-columbia',
    slug: 'washington-dc',
    name: 'Washington, D.C.',
    lat: 38.9072,
    lng: -77.0369,
    featured: false,
  },
  // United Arab Emirates
  {
    region: 'dubai-emirate',
    slug: 'dubai',
    name: 'Dubai',
    lat: 25.2048,
    lng: 55.2708,
    featured: true,
  },
  {
    region: 'abu-dhabi-emirate',
    slug: 'abu-dhabi',
    name: 'Abu Dhabi',
    lat: 24.4539,
    lng: 54.3773,
    featured: true,
  },
  {
    region: 'abu-dhabi-emirate',
    slug: 'al-ain',
    name: 'Al Ain',
    lat: 24.2075,
    lng: 55.7447,
    featured: false,
  },
  {
    region: 'sharjah-emirate',
    slug: 'sharjah',
    name: 'Sharjah',
    lat: 25.3463,
    lng: 55.4209,
    featured: true,
  },
  {
    region: 'ajman-emirate',
    slug: 'ajman',
    name: 'Ajman',
    lat: 25.4052,
    lng: 55.5136,
    featured: false,
  },
  {
    region: 'umm-al-quwain-emirate',
    slug: 'umm-al-quwain',
    name: 'Umm Al Quwain',
    lat: 25.5647,
    lng: 55.5552,
    featured: false,
  },
  {
    region: 'ras-al-khaimah-emirate',
    slug: 'ras-al-khaimah',
    name: 'Ras Al Khaimah',
    lat: 25.8007,
    lng: 55.9762,
    featured: false,
  },
  {
    region: 'fujairah-emirate',
    slug: 'fujairah',
    name: 'Fujairah',
    lat: 25.1288,
    lng: 56.3265,
    featured: false,
  },
  // Europe
  {
    region: 'ile-de-france',
    slug: 'paris',
    name: 'Paris',
    lat: 48.8566,
    lng: 2.3522,
    featured: true,
  },
  {
    region: 'berlin-state',
    slug: 'berlin',
    name: 'Berlin',
    lat: 52.52,
    lng: 13.405,
    featured: true,
  },
  { region: 'bavaria', slug: 'munich', name: 'Munich', lat: 48.1351, lng: 11.582, featured: false },
  {
    region: 'madrid-community',
    slug: 'madrid',
    name: 'Madrid',
    lat: 40.4168,
    lng: -3.7038,
    featured: true,
  },
  {
    region: 'catalonia',
    slug: 'barcelona',
    name: 'Barcelona',
    lat: 41.3874,
    lng: 2.1686,
    featured: false,
  },
  { region: 'lazio', slug: 'rome', name: 'Rome', lat: 41.9028, lng: 12.4964, featured: true },
  { region: 'lombardy', slug: 'milan', name: 'Milan', lat: 45.4642, lng: 9.19, featured: false },
  {
    region: 'north-holland',
    slug: 'amsterdam',
    name: 'Amsterdam',
    lat: 52.3676,
    lng: 4.9041,
    featured: true,
  },
];

export const STARTER_CATEGORIES: {
  slug: string;
  name: string;
  description: string;
  sort_order: number;
  is_featured: boolean;
}[] = [
  {
    slug: 'restaurants',
    name: 'Restaurants',
    description: 'Restaurants, cafes, bakeries and takeaways.',
    sort_order: 10,
    is_featured: true,
  },
  {
    slug: 'doctors',
    name: 'Doctors & Clinics',
    description: 'General physicians, specialists and clinics.',
    sort_order: 20,
    is_featured: true,
  },
  {
    slug: 'dentists',
    name: 'Dentists',
    description: 'Dental clinics and orthodontists.',
    sort_order: 30,
    is_featured: true,
  },
  {
    slug: 'hospitals',
    name: 'Hospitals',
    description: 'Hospitals, labs and diagnostic centres.',
    sort_order: 40,
    is_featured: false,
  },
  {
    slug: 'pharmacies',
    name: 'Pharmacies',
    description: 'Pharmacies, chemists and drugstores.',
    sort_order: 50,
    is_featured: false,
  },
  {
    slug: 'beauty-salons',
    name: 'Beauty Salons & Spas',
    description: 'Salons, barbers, spas and bridal makeup.',
    sort_order: 60,
    is_featured: true,
  },
  {
    slug: 'gyms',
    name: 'Gyms & Fitness',
    description: 'Gyms, fitness studios and trainers.',
    sort_order: 70,
    is_featured: false,
  },
  {
    slug: 'schools',
    name: 'Schools & Academies',
    description: 'Schools, tutoring centres and training institutes.',
    sort_order: 80,
    is_featured: true,
  },
  {
    slug: 'real-estate',
    name: 'Real Estate',
    description: 'Estate agents, realtors, builders and developers.',
    sort_order: 90,
    is_featured: true,
  },
  {
    slug: 'car-repair',
    name: 'Car Repair',
    description: 'Mechanics, workshops, tyres and car wash.',
    sort_order: 100,
    is_featured: false,
  },
  {
    slug: 'car-dealers',
    name: 'Car Dealers',
    description: 'New and used car showrooms and rentals.',
    sort_order: 110,
    is_featured: false,
  },
  {
    slug: 'plumbers',
    name: 'Plumbers',
    description: 'Plumbing, heating, boilers and bathroom fitting.',
    sort_order: 120,
    is_featured: true,
  },
  {
    slug: 'electricians',
    name: 'Electricians',
    description: 'Electrical repair, wiring, EV chargers and solar panels.',
    sort_order: 130,
    is_featured: true,
  },
  {
    slug: 'ac-repair',
    name: 'AC & Appliance Repair',
    description: 'Air conditioning, heating and appliance servicing.',
    sort_order: 140,
    is_featured: false,
  },
  {
    slug: 'lawyers',
    name: 'Lawyers',
    description: 'Law firms, solicitors, attorneys and legal consultants.',
    sort_order: 150,
    is_featured: false,
  },
  {
    slug: 'accountants',
    name: 'Accountants & Tax',
    description: 'Accountants, tax advisers, CPAs and auditors.',
    sort_order: 160,
    is_featured: false,
  },
  {
    slug: 'hotels',
    name: 'Hotels & Guest Houses',
    description: 'Hotels, B&Bs, serviced apartments and short stays.',
    sort_order: 170,
    is_featured: false,
  },
  {
    slug: 'travel-agents',
    name: 'Travel Agents',
    description: 'Travel agents, tours, flights and visa services.',
    sort_order: 180,
    is_featured: false,
  },
  {
    slug: 'shopping',
    name: 'Shopping & Retail',
    description: 'Shops, supermarkets, clothing and electronics.',
    sort_order: 190,
    is_featured: false,
  },
  {
    slug: 'it-services',
    name: 'IT & Web Services',
    description: 'IT support, web design, software development and computer repair.',
    sort_order: 200,
    is_featured: false,
  },
  {
    slug: 'event-services',
    name: 'Events & Wedding',
    description: 'Venues, caterers, photographers and event planners.',
    sort_order: 210,
    is_featured: false,
  },
  {
    slug: 'home-services',
    name: 'Home Services',
    description: 'Cleaning, pest control, movers and carpenters.',
    sort_order: 220,
    is_featured: false,
  },
];
