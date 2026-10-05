/**
 * Declarative field config for the Schema Markup Generator. Pure data plus
 * types, no React and no imports, so build.ts and validate.ts stay testable
 * in plain Node.
 *
 * "required" / "recommended" follow Google's structured data docs for each
 * rich result type. Where Google lists no hard requirement (Article,
 * Organization) the tool marks the one property the markup is pointless
 * without as required.
 */

export type SchemaTypeId =
  | 'LocalBusiness'
  | 'Organization'
  | 'Article'
  | 'Product'
  | 'FAQPage'
  | 'HowTo'
  | 'Event'
  | 'BreadcrumbList';

export type FieldKind =
  | 'text'
  | 'textarea'
  | 'url'
  | 'email'
  | 'tel'
  | 'date'
  | 'datetime'
  | 'time'
  | 'number'
  | 'select'
  | 'days'
  | 'duration';

export type Level = 'required' | 'recommended';

export type Values = Record<string, string>;
export type Row = Record<string, string>;

/** Everything the form holds for one schema type. */
export interface Draft {
  values: Values;
  lists: Record<string, Row[]>;
}

export interface Option {
  value: string;
  label: string;
}

export interface FieldDef {
  kind: FieldKind;
  key: string;
  label: string;
  level?: Level;
  placeholder?: string;
  help?: string;
  options?: Option[];
  defaultValue?: string;
  min?: number;
  max?: number;
  /** Hide the field (and skip its checks) unless this returns true. */
  showIf?: (values: Values) => boolean;
}

export interface RepeatDef {
  kind: 'repeatable';
  key: string;
  label: string;
  level?: Level;
  help?: string;
  addLabel: string;
  itemLabel: string;
  fields: FieldDef[];
}

export type AnyField = FieldDef | RepeatDef;

export interface Section {
  title: string;
  fields: AnyField[];
}

export interface SchemaTypeDef {
  id: SchemaTypeId;
  label: string;
  blurb: string;
  sections: Section[];
}

export const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

const opts = (...values: string[]): Option[] => values.map((v) => ({ value: v, label: v }));

const schemaOpts = (pairs: [string, string][]): Option[] =>
  pairs.map(([v, label]) => ({ value: `https://schema.org/${v}`, label }));

export const TIMEZONES: Option[] = [
  { value: '+05:00', label: 'Pakistan (UTC+05:00)' },
  { value: '+00:00', label: 'UTC / London winter (+00:00)' },
  { value: '+01:00', label: 'UTC+01:00' },
  { value: '+03:00', label: 'Saudi Arabia (UTC+03:00)' },
  { value: '+04:00', label: 'UAE (UTC+04:00)' },
  { value: '+05:30', label: 'India (UTC+05:30)' },
  { value: '-05:00', label: 'US Eastern (UTC-05:00)' },
  { value: '-08:00', label: 'US Pacific (UTC-08:00)' },
  { value: '', label: 'No offset' },
];

export const FOOD_TYPES = ['Restaurant', 'CafeOrCoffeeShop', 'Bakery', 'FastFoodRestaurant'];

export const LOCAL_BUSINESS_SUBTYPES: Option[] = [
  { value: 'LocalBusiness', label: 'LocalBusiness (generic)' },
  { value: 'Restaurant', label: 'Restaurant' },
  { value: 'FastFoodRestaurant', label: 'Fast food restaurant' },
  { value: 'CafeOrCoffeeShop', label: 'Cafe or coffee shop' },
  { value: 'Bakery', label: 'Bakery' },
  { value: 'Store', label: 'Store' },
  { value: 'ClothingStore', label: 'Clothing store' },
  { value: 'ElectronicsStore', label: 'Electronics store' },
  { value: 'GroceryStore', label: 'Grocery store' },
  { value: 'MedicalBusiness', label: 'Medical business' },
  { value: 'Dentist', label: 'Dentist' },
  { value: 'Pharmacy', label: 'Pharmacy' },
  { value: 'ProfessionalService', label: 'Professional service' },
  { value: 'LegalService', label: 'Legal service' },
  { value: 'AccountingService', label: 'Accounting service' },
  { value: 'RealEstateAgent', label: 'Real estate agent' },
  { value: 'TravelAgency', label: 'Travel agency' },
  { value: 'AutomotiveBusiness', label: 'Automotive business' },
  { value: 'AutoRepair', label: 'Auto repair' },
  { value: 'HomeAndConstructionBusiness', label: 'Home and construction business' },
  { value: 'Plumber', label: 'Plumber' },
  { value: 'Electrician', label: 'Electrician' },
  { value: 'LodgingBusiness', label: 'Lodging business' },
  { value: 'Hotel', label: 'Hotel' },
  { value: 'BeautySalon', label: 'Beauty salon' },
  { value: 'HealthAndBeautyBusiness', label: 'Health and beauty business' },
  { value: 'ExerciseGym', label: 'Gym' },
];

const AVAILABILITY = schemaOpts([
  ['InStock', 'In stock'],
  ['OutOfStock', 'Out of stock'],
  ['PreOrder', 'Pre-order'],
  ['BackOrder', 'Back order'],
  ['LimitedAvailability', 'Limited availability'],
  ['OnlineOnly', 'Online only'],
  ['InStoreOnly', 'In store only'],
  ['SoldOut', 'Sold out'],
  ['Discontinued', 'Discontinued'],
]);

function addressFields(level?: Level): FieldDef[] {
  return [
    {
      kind: 'text',
      key: 'streetAddress',
      label: 'Street address',
      level,
      placeholder: '12-B, Main Boulevard, Gulberg III',
    },
    {
      kind: 'text',
      key: 'addressLocality',
      label: 'City',
      level,
      placeholder: 'Lahore',
    },
    { kind: 'text', key: 'addressRegion', label: 'Province / region', placeholder: 'Punjab' },
    { kind: 'text', key: 'postalCode', label: 'Postal code', placeholder: '54660' },
    {
      kind: 'text',
      key: 'addressCountry',
      label: 'Country (ISO code)',
      defaultValue: 'PK',
      placeholder: 'PK',
      help: 'Two-letter ISO 3166 code, e.g. PK, AE, GB.',
    },
  ];
}

function ratingFields(help?: string): FieldDef[] {
  return [
    {
      kind: 'number',
      key: 'ratingValue',
      label: 'Average rating',
      placeholder: '4.6',
      help,
    },
    {
      kind: 'number',
      key: 'reviewCount',
      label: 'Number of reviews',
      placeholder: '128',
    },
    { kind: 'number', key: 'bestRating', label: 'Best possible rating', placeholder: '5' },
    { kind: 'number', key: 'worstRating', label: 'Worst possible rating', placeholder: '1' },
  ];
}

const sameAs: RepeatDef = {
  kind: 'repeatable',
  key: 'sameAs',
  label: 'Social and profile links (sameAs)',
  help: 'Facebook, Instagram, LinkedIn, Google Maps, directory profiles. Full URLs.',
  addLabel: 'Add link',
  itemLabel: 'Link',
  fields: [
    {
      kind: 'url',
      key: 'url',
      label: 'Profile URL',
      level: 'required',
      placeholder: 'https://www.facebook.com/yourpage',
    },
  ],
};

const tzField: FieldDef = {
  kind: 'select',
  key: 'tz',
  label: 'Time zone for dates',
  options: TIMEZONES,
  defaultValue: '+05:00',
  help: 'Appended to date-times so Google reads them in the right zone.',
};

export const SCHEMA_TYPES: SchemaTypeDef[] = [
  {
    id: 'LocalBusiness',
    label: 'Local Business',
    blurb: 'Shops, restaurants, clinics and service businesses with an address.',
    sections: [
      {
        title: 'Business',
        fields: [
          {
            kind: 'select',
            key: 'subtype',
            label: 'Business type',
            options: LOCAL_BUSINESS_SUBTYPES,
            defaultValue: 'LocalBusiness',
            help: 'Pick the most specific type that fits.',
          },
          {
            kind: 'text',
            key: 'name',
            label: 'Business name',
            level: 'required',
            placeholder: 'Butt Karahi',
          },
          {
            kind: 'url',
            key: 'url',
            label: 'Website URL',
            level: 'recommended',
            placeholder: 'https://www.example.pk/',
          },
          {
            kind: 'tel',
            key: 'telephone',
            label: 'Phone',
            level: 'recommended',
            placeholder: '+92-42-35761234',
            help: 'Include the country code.',
          },
          {
            kind: 'url',
            key: 'image',
            label: 'Image URL',
            level: 'recommended',
            placeholder: 'https://www.example.pk/images/storefront.jpg',
          },
          {
            kind: 'text',
            key: 'priceRange',
            label: 'Price range',
            level: 'recommended',
            placeholder: '$$ or PKR 1,000–3,000',
            help: 'Under 100 characters.',
          },
          {
            kind: 'textarea',
            key: 'description',
            label: 'Description',
            placeholder: 'One or two sentences about the business.',
          },
          {
            kind: 'text',
            key: 'servesCuisine',
            label: 'Cuisine',
            level: 'recommended',
            placeholder: 'Pakistani, BBQ',
            help: 'Separate several cuisines with commas.',
            showIf: (v) => FOOD_TYPES.includes(v.subtype),
          },
          {
            kind: 'url',
            key: 'menu',
            label: 'Menu URL',
            level: 'recommended',
            placeholder: 'https://www.example.pk/menu',
            showIf: (v) => FOOD_TYPES.includes(v.subtype),
          },
        ],
      },
      { title: 'Address', fields: addressFields('required') },
      {
        title: 'Map coordinates',
        fields: [
          {
            kind: 'number',
            key: 'latitude',
            label: 'Latitude',
            level: 'recommended',
            placeholder: '31.5204',
            min: -90,
            max: 90,
            help: 'Right-click the pin in Google Maps to copy coordinates.',
          },
          {
            kind: 'number',
            key: 'longitude',
            label: 'Longitude',
            level: 'recommended',
            placeholder: '74.3587',
            min: -180,
            max: 180,
          },
        ],
      },
      {
        title: 'Opening hours',
        fields: [
          {
            kind: 'repeatable',
            key: 'hours',
            label: 'Opening hours',
            level: 'recommended',
            help: 'Add one row per set of days that share the same hours. Use 00:00–23:59 for 24 hours.',
            addLabel: 'Add hours',
            itemLabel: 'Hours',
            fields: [
              { kind: 'days', key: 'days', label: 'Days', level: 'required' },
              { kind: 'time', key: 'opens', label: 'Opens', level: 'required' },
              { kind: 'time', key: 'closes', label: 'Closes', level: 'required' },
            ],
          },
        ],
      },
      { title: 'Profiles', fields: [sameAs] },
      {
        title: 'Rating (optional)',
        fields: ratingFields('Only from real customer reviews you can show on the page.'),
      },
    ],
  },
  {
    id: 'Organization',
    label: 'Organization',
    blurb: 'Your company, brand or nonprofit: logo, contacts and profiles.',
    sections: [
      {
        title: 'Organization',
        fields: [
          {
            kind: 'text',
            key: 'name',
            label: 'Name',
            level: 'required',
            placeholder: 'RankYouSite',
          },
          {
            kind: 'text',
            key: 'legalName',
            label: 'Legal name',
            placeholder: 'Example (Pvt.) Ltd.',
          },
          {
            kind: 'url',
            key: 'url',
            label: 'Website URL',
            level: 'recommended',
            placeholder: 'https://www.example.com/',
          },
          {
            kind: 'url',
            key: 'logo',
            label: 'Logo URL',
            level: 'recommended',
            placeholder: 'https://www.example.com/logo.png',
            help: 'At least 112×112 px, crawlable, on a plain background.',
          },
          {
            kind: 'textarea',
            key: 'description',
            label: 'Description',
            level: 'recommended',
          },
          {
            kind: 'email',
            key: 'email',
            label: 'Email',
            level: 'recommended',
            placeholder: 'info@example.com',
          },
          {
            kind: 'tel',
            key: 'telephone',
            label: 'Phone',
            level: 'recommended',
            placeholder: '+92-21-111-123-456',
          },
          { kind: 'date', key: 'foundingDate', label: 'Founding date' },
        ],
      },
      { title: 'Address (optional)', fields: addressFields() },
      { title: 'Profiles', fields: [{ ...sameAs, level: 'recommended' }] },
    ],
  },
  {
    id: 'Article',
    label: 'Article',
    blurb: 'Blog posts, news stories and guides.',
    sections: [
      {
        title: 'Article',
        fields: [
          {
            kind: 'select',
            key: 'subtype',
            label: 'Article type',
            options: opts('Article', 'BlogPosting', 'NewsArticle'),
            defaultValue: 'BlogPosting',
          },
          {
            kind: 'text',
            key: 'headline',
            label: 'Headline',
            level: 'required',
            placeholder: 'Best Karahi Spots in Lahore (2026 Guide)',
            help: 'Keep it short; long headlines may be truncated.',
          },
          {
            kind: 'url',
            key: 'url',
            label: 'Article URL',
            level: 'recommended',
            placeholder: 'https://www.example.com/blog/best-karahi-lahore',
          },
          {
            kind: 'url',
            key: 'image',
            label: 'Image URL',
            level: 'recommended',
            placeholder: 'https://www.example.com/images/karahi.jpg',
            help: 'At least 1200 px wide works best.',
          },
          { kind: 'textarea', key: 'description', label: 'Description' },
          {
            kind: 'datetime',
            key: 'datePublished',
            label: 'Date published',
            level: 'recommended',
          },
          {
            kind: 'datetime',
            key: 'dateModified',
            label: 'Date modified',
            level: 'recommended',
          },
          tzField,
        ],
      },
      {
        title: 'Author and publisher',
        fields: [
          {
            kind: 'select',
            key: 'authorType',
            label: 'Author type',
            options: opts('Person', 'Organization'),
            defaultValue: 'Person',
          },
          {
            kind: 'text',
            key: 'authorName',
            label: 'Author name',
            level: 'recommended',
            placeholder: 'Ayesha Khan',
          },
          {
            kind: 'url',
            key: 'authorUrl',
            label: 'Author profile URL',
            level: 'recommended',
            placeholder: 'https://www.example.com/authors/ayesha-khan',
          },
          {
            kind: 'text',
            key: 'publisherName',
            label: 'Publisher name',
            placeholder: 'Example Media',
          },
          {
            kind: 'url',
            key: 'publisherLogo',
            label: 'Publisher logo URL',
            placeholder: 'https://www.example.com/logo.png',
          },
        ],
      },
    ],
  },
  {
    id: 'Product',
    label: 'Product',
    blurb: 'A product page with price, availability and ratings.',
    sections: [
      {
        title: 'Product',
        fields: [
          {
            kind: 'text',
            key: 'name',
            label: 'Product name',
            level: 'required',
            placeholder: 'Khaddar Unstitched Suit 3-Piece',
          },
          {
            kind: 'url',
            key: 'image',
            label: 'Image URL',
            level: 'recommended',
            placeholder: 'https://www.example.pk/images/suit.jpg',
          },
          { kind: 'textarea', key: 'description', label: 'Description', level: 'recommended' },
          {
            kind: 'text',
            key: 'brand',
            label: 'Brand',
            level: 'recommended',
            placeholder: 'Brand name',
          },
          { kind: 'text', key: 'sku', label: 'SKU', level: 'recommended', placeholder: 'KS-0231' },
          {
            kind: 'text',
            key: 'gtin',
            label: 'GTIN / barcode',
            placeholder: '8961234567890',
            help: '8, 12, 13 or 14 digits if the product has one.',
          },
        ],
      },
      {
        title: 'Offer',
        fields: [
          {
            kind: 'number',
            key: 'price',
            label: 'Price',
            level: 'recommended',
            placeholder: '4990',
            help: 'Digits only, no currency sign or thousands separator.',
          },
          {
            kind: 'text',
            key: 'priceCurrency',
            label: 'Currency (ISO code)',
            defaultValue: 'PKR',
            placeholder: 'PKR',
          },
          {
            kind: 'select',
            key: 'availability',
            label: 'Availability',
            options: AVAILABILITY,
            defaultValue: 'https://schema.org/InStock',
          },
          {
            kind: 'select',
            key: 'itemCondition',
            label: 'Condition',
            options: [
              { value: '', label: 'Not specified' },
              ...schemaOpts([
                ['NewCondition', 'New'],
                ['UsedCondition', 'Used'],
                ['RefurbishedCondition', 'Refurbished'],
              ]),
            ],
          },
          { kind: 'date', key: 'priceValidUntil', label: 'Price valid until' },
          {
            kind: 'url',
            key: 'offerUrl',
            label: 'Product page URL',
            placeholder: 'https://www.example.pk/products/khaddar-suit',
          },
        ],
      },
      { title: 'Rating (optional)', fields: ratingFields() },
    ],
  },
  {
    id: 'FAQPage',
    label: 'FAQ Page',
    blurb: 'A page of questions and answers.',
    sections: [
      {
        title: 'Questions',
        fields: [
          {
            kind: 'repeatable',
            key: 'faqs',
            label: 'Questions and answers',
            level: 'required',
            help: 'Use the exact questions and answers visible on the page.',
            addLabel: 'Add question',
            itemLabel: 'Question',
            fields: [
              {
                kind: 'text',
                key: 'q',
                label: 'Question',
                level: 'required',
                placeholder: 'Do you deliver in DHA Lahore?',
              },
              {
                kind: 'textarea',
                key: 'a',
                label: 'Answer',
                level: 'required',
                placeholder: 'Yes, we deliver across DHA Phases 1–8 from 12 pm to 1 am.',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'HowTo',
    label: 'How-To',
    blurb: 'Step-by-step instructions.',
    sections: [
      {
        title: 'Guide',
        fields: [
          {
            kind: 'text',
            key: 'name',
            label: 'Title',
            level: 'required',
            placeholder: 'How to claim your Google Business Profile',
          },
          { kind: 'textarea', key: 'description', label: 'Description', level: 'recommended' },
          {
            kind: 'url',
            key: 'image',
            label: 'Image URL',
            level: 'recommended',
            placeholder: 'https://www.example.com/images/guide.jpg',
          },
          {
            kind: 'duration',
            key: 'totalTime',
            label: 'Total time (ISO 8601)',
            level: 'recommended',
            placeholder: 'PT30M',
            help: 'PT30M = 30 minutes, PT1H30M = 1.5 hours, P2D = 2 days.',
          },
        ],
      },
      {
        title: 'Steps',
        fields: [
          {
            kind: 'repeatable',
            key: 'steps',
            label: 'Steps',
            level: 'required',
            addLabel: 'Add step',
            itemLabel: 'Step',
            fields: [
              { kind: 'text', key: 'name', label: 'Step title', placeholder: 'Sign in' },
              {
                kind: 'textarea',
                key: 'text',
                label: 'Instructions',
                level: 'required',
                placeholder: 'Sign in to Google with the account you want to manage the profile.',
              },
              {
                kind: 'url',
                key: 'url',
                label: 'Step URL (anchor)',
                placeholder: 'https://www.example.com/guide#step-1',
              },
              { kind: 'url', key: 'image', label: 'Step image URL' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'Event',
    label: 'Event',
    blurb: 'Concerts, workshops, webinars and other dated events.',
    sections: [
      {
        title: 'Event',
        fields: [
          {
            kind: 'text',
            key: 'name',
            label: 'Event name',
            level: 'required',
            placeholder: 'Lahore Digital Marketing Meetup',
          },
          { kind: 'datetime', key: 'startDate', label: 'Start', level: 'required' },
          { kind: 'datetime', key: 'endDate', label: 'End', level: 'recommended' },
          tzField,
          {
            kind: 'select',
            key: 'eventAttendanceMode',
            label: 'Attendance',
            options: schemaOpts([
              ['OfflineEventAttendanceMode', 'In person'],
              ['OnlineEventAttendanceMode', 'Online'],
              ['MixedEventAttendanceMode', 'In person and online'],
            ]),
            defaultValue: 'https://schema.org/OfflineEventAttendanceMode',
          },
          {
            kind: 'select',
            key: 'eventStatus',
            label: 'Status',
            options: schemaOpts([
              ['EventScheduled', 'Scheduled'],
              ['EventPostponed', 'Postponed'],
              ['EventRescheduled', 'Rescheduled'],
              ['EventMovedOnline', 'Moved online'],
              ['EventCancelled', 'Cancelled'],
            ]),
            defaultValue: 'https://schema.org/EventScheduled',
          },
          { kind: 'textarea', key: 'description', label: 'Description', level: 'recommended' },
          {
            kind: 'url',
            key: 'image',
            label: 'Image URL',
            level: 'recommended',
            placeholder: 'https://www.example.com/images/event.jpg',
          },
        ],
      },
      {
        title: 'Location',
        fields: [
          {
            kind: 'text',
            key: 'placeName',
            label: 'Venue name',
            level: 'required',
            placeholder: 'Arfa Software Technology Park',
            showIf: (v) => !isOnlineOnly(v),
          },
          ...addressFields('required').map((f) => ({
            ...f,
            showIf: (v: Values) => !isOnlineOnly(v),
          })),
          {
            kind: 'url',
            key: 'onlineUrl',
            label: 'Online event URL',
            level: 'required',
            placeholder: 'https://zoom.us/j/123456789',
            showIf: (v) => !isOffline(v),
          },
        ],
      },
      {
        title: 'Tickets and organizer',
        fields: [
          {
            kind: 'number',
            key: 'price',
            label: 'Ticket price',
            level: 'recommended',
            placeholder: '0',
            help: 'Use 0 for free events.',
          },
          { kind: 'text', key: 'priceCurrency', label: 'Currency', defaultValue: 'PKR' },
          {
            kind: 'select',
            key: 'availability',
            label: 'Ticket availability',
            options: AVAILABILITY.filter((o) => /InStock|SoldOut|PreOrder|Limited/.test(o.value)),
            defaultValue: 'https://schema.org/InStock',
          },
          {
            kind: 'url',
            key: 'ticketUrl',
            label: 'Ticket / registration URL',
            level: 'recommended',
            placeholder: 'https://www.example.com/register',
          },
          { kind: 'datetime', key: 'validFrom', label: 'Tickets on sale from' },
          {
            kind: 'text',
            key: 'organizerName',
            label: 'Organizer name',
            level: 'recommended',
            placeholder: 'RankYouSite',
          },
          {
            kind: 'url',
            key: 'organizerUrl',
            label: 'Organizer URL',
            level: 'recommended',
            placeholder: 'https://www.example.com/',
          },
          { kind: 'text', key: 'performer', label: 'Performer / speaker', placeholder: 'Ali Raza' },
        ],
      },
    ],
  },
  {
    id: 'BreadcrumbList',
    label: 'Breadcrumbs',
    blurb: 'The trail from your home page to the current page.',
    sections: [
      {
        title: 'Trail',
        fields: [
          {
            kind: 'repeatable',
            key: 'crumbs',
            label: 'Breadcrumb items (top level first)',
            level: 'required',
            help: 'The URL may be left empty on the last item (the current page).',
            addLabel: 'Add level',
            itemLabel: 'Level',
            fields: [
              { kind: 'text', key: 'name', label: 'Name', level: 'required', placeholder: 'Home' },
              {
                kind: 'url',
                key: 'url',
                label: 'URL',
                placeholder: 'https://www.example.com/',
              },
            ],
          },
        ],
      },
    ],
  },
];

export function isOnlineOnly(v: Values): boolean {
  return v.eventAttendanceMode === 'https://schema.org/OnlineEventAttendanceMode';
}

export function isOffline(v: Values): boolean {
  return !v.eventAttendanceMode || v.eventAttendanceMode.endsWith('/OfflineEventAttendanceMode');
}

export function getSchemaType(id: SchemaTypeId): SchemaTypeDef {
  const def = SCHEMA_TYPES.find((t) => t.id === id);
  if (!def) throw new Error(`Unknown schema type ${id}`);
  return def;
}

function emptyRow(def: RepeatDef): Row {
  return Object.fromEntries(def.fields.map((f) => [f.key, f.defaultValue ?? '']));
}

/** A fresh draft: defaults filled in, one empty row per repeatable. */
export function defaultDraft(id: SchemaTypeId): Draft {
  const values: Values = {};
  const lists: Record<string, Row[]> = {};
  for (const section of getSchemaType(id).sections) {
    for (const f of section.fields) {
      if (f.kind === 'repeatable') lists[f.key] = [emptyRow(f)];
      else values[f.key] = f.defaultValue ?? '';
    }
  }
  return { values, lists };
}

export function newRow(def: RepeatDef): Row {
  return emptyRow(def);
}

/** Realistic Pakistani examples for "Load example". */
export function exampleDraft(id: SchemaTypeId): Draft {
  const base = defaultDraft(id);
  const merge = (values: Values, lists: Record<string, Row[]> = {}): Draft => ({
    values: { ...base.values, ...values },
    lists: { ...base.lists, ...lists },
  });
  switch (id) {
    case 'LocalBusiness':
      return merge(
        {
          subtype: 'Restaurant',
          name: 'Lahori Dera Karahi House',
          url: 'https://www.lahoridera.pk/',
          telephone: '+92-42-35761234',
          image: 'https://www.lahoridera.pk/images/dining-hall.jpg',
          priceRange: 'PKR 1,500–4,000',
          description:
            'Family restaurant in Gulberg serving charcoal karahi, BBQ and fresh naan since 2009.',
          servesCuisine: 'Pakistani, BBQ, Mughlai',
          menu: 'https://www.lahoridera.pk/menu',
          streetAddress: '45-C, Main Boulevard, Gulberg III',
          addressLocality: 'Lahore',
          addressRegion: 'Punjab',
          postalCode: '54660',
          addressCountry: 'PK',
          latitude: '31.5106',
          longitude: '74.3441',
          ratingValue: '4.6',
          reviewCount: '312',
          bestRating: '5',
          worstRating: '1',
        },
        {
          hours: [
            { days: 'Monday,Tuesday,Wednesday,Thursday', opens: '12:00', closes: '23:30' },
            { days: 'Friday', opens: '14:00', closes: '23:59' },
            { days: 'Saturday,Sunday', opens: '12:00', closes: '23:59' },
          ],
          sameAs: [
            { url: 'https://www.facebook.com/lahoridera' },
            { url: 'https://www.instagram.com/lahoridera' },
          ],
        },
      );
    case 'Organization':
      return merge(
        {
          name: 'Indus Web Solutions',
          legalName: 'Indus Web Solutions (Pvt.) Ltd.',
          url: 'https://www.induswebsolutions.pk/',
          logo: 'https://www.induswebsolutions.pk/logo.png',
          description: 'Web design and SEO agency in Karachi helping SMEs grow online.',
          email: 'hello@induswebsolutions.pk',
          telephone: '+92-21-34567890',
          foundingDate: '2015-03-01',
          streetAddress: 'Office 7, Plot 23-C, Shahbaz Commercial, DHA Phase 6',
          addressLocality: 'Karachi',
          addressRegion: 'Sindh',
          postalCode: '75500',
          addressCountry: 'PK',
        },
        {
          sameAs: [
            { url: 'https://www.linkedin.com/company/induswebsolutions' },
            { url: 'https://www.facebook.com/induswebsolutions' },
          ],
        },
      );
    case 'Article':
      return merge({
        subtype: 'BlogPosting',
        headline: '10 Best Karahi Restaurants in Lahore (2026 Guide)',
        url: 'https://www.example.pk/blog/best-karahi-lahore',
        image: 'https://www.example.pk/images/karahi-guide.jpg',
        description: 'Where to eat the best mutton and chicken karahi in Lahore, with prices.',
        datePublished: '2026-09-12T09:00',
        dateModified: '2026-10-01T18:30',
        authorType: 'Person',
        authorName: 'Ayesha Khan',
        authorUrl: 'https://www.example.pk/authors/ayesha-khan',
        publisherName: 'Example Food Blog',
        publisherLogo: 'https://www.example.pk/logo.png',
      });
    case 'Product':
      return merge({
        name: 'Khaddar Unstitched Suit 3-Piece – Maroon',
        image: 'https://www.example.pk/images/khaddar-maroon.jpg',
        description: 'Winter khaddar shirt, trouser and printed shawl. 7.5 metres, unstitched.',
        brand: 'Example Textiles',
        sku: 'KS-0231-MR',
        price: '4990',
        priceCurrency: 'PKR',
        availability: 'https://schema.org/InStock',
        itemCondition: 'https://schema.org/NewCondition',
        priceValidUntil: '2026-12-31',
        offerUrl: 'https://www.example.pk/products/khaddar-maroon',
        ratingValue: '4.4',
        reviewCount: '87',
      });
    case 'FAQPage':
      return merge(
        {},
        {
          faqs: [
            {
              q: 'Do you deliver in DHA Lahore?',
              a: 'Yes. We deliver across DHA Phases 1–8 from 12 pm to 1 am. Delivery is free on orders above PKR 2,500.',
            },
            {
              q: 'Can I book a table for a large family?',
              a: 'Yes, call us on +92-42-35761234 at least a day ahead for groups of 10 or more.',
            },
          ],
        },
      );
    case 'HowTo':
      return merge(
        {
          name: 'How to verify your Google Business Profile in Pakistan',
          description: 'Get the verified badge on Google Maps for your shop or office.',
          image: 'https://www.example.pk/images/gbp-verification.jpg',
          totalTime: 'PT20M',
        },
        {
          steps: [
            {
              name: 'Sign in',
              text: 'Go to business.google.com and sign in with the Google account that will own the profile.',
              url: '',
              image: '',
            },
            {
              name: 'Find your business',
              text: 'Search for your business name. If it already exists, request access; otherwise choose "Add your business".',
              url: '',
              image: '',
            },
            {
              name: 'Choose a verification method',
              text: 'Pick video, phone or postcard verification and follow the prompts.',
              url: '',
              image: '',
            },
          ],
        },
      );
    case 'Event':
      return merge({
        name: 'Lahore Local SEO Workshop 2026',
        startDate: '2026-11-21T10:00',
        endDate: '2026-11-21T16:00',
        description: 'A hands-on day on Google Business Profile, reviews and local rankings.',
        image: 'https://www.example.pk/images/seo-workshop.jpg',
        placeName: 'Arfa Software Technology Park',
        streetAddress: '346-B, Ferozepur Road',
        addressLocality: 'Lahore',
        addressRegion: 'Punjab',
        postalCode: '54600',
        price: '2500',
        ticketUrl: 'https://www.example.pk/events/local-seo-workshop',
        validFrom: '2026-10-01T09:00',
        organizerName: 'RankYouSite',
        organizerUrl: 'https://www.example.pk/',
        performer: 'Ali Raza',
      });
    case 'BreadcrumbList':
      return merge(
        {},
        {
          crumbs: [
            { name: 'Home', url: 'https://www.example.pk/' },
            { name: 'Restaurants', url: 'https://www.example.pk/restaurants' },
            { name: 'Lahore', url: 'https://www.example.pk/restaurants/lahore' },
            { name: 'Lahori Dera Karahi House', url: '' },
          ],
        },
      );
  }
}
