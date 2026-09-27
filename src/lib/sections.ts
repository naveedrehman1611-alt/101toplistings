/**
 * The homepage section types, what each field means for each type, and the
 * typed settings each reads from page_sections.settings.
 *
 * Shared by the renderer (src/lib/home.ts) and the admin section editor, so
 * every field the admin offers is one the page actually reads, and every
 * setting the page reads has a default when the stored JSON lacks it. Safe to
 * import from client and server code: no data access here.
 */

export const BACKGROUNDS = ['white', 'muted', 'brand', 'navy'] as const;
export type Background = (typeof BACKGROUNDS)[number];

export const BACKGROUND_LABELS: Record<Background, string> = {
  white: 'White',
  muted: 'Light grey',
  brand: 'Brand blue',
  navy: 'Dark navy',
};

export const REF_TYPES = ['category', 'city', 'listing', 'blog_post'] as const;
export type RefType = (typeof REF_TYPES)[number];

type Base = { key: string; label: string; hint?: string };
export type SettingSpec =
  | (Base & { kind: 'text'; default: string; max: number })
  | (Base & { kind: 'boolean'; default: boolean })
  | (Base & {
      kind: 'select';
      default: string;
      options: readonly { value: string; label: string }[];
    });

/** Labels for the item fields a section type uses. A missing label hides the field. */
export type ItemSpec = {
  noun: string;
  max: number;
  hint: string;
  title?: string;
  subtitle?: string;
  body?: string;
  icon?: string;
  image?: string;
  url?: string;
  ref?: RefType;
};

export type SectionSpec = {
  label: string;
  description: string;
  /** Label for page_sections.body; absent when the type does not render it. */
  body?: string;
  /** Label for page_sections.image_id; absent when the type has no image. */
  image?: string;
  cta?: boolean;
  itemLimit?: { label: string; min: number; max: number; default: number };
  settings: readonly SettingSpec[];
  items?: ItemSpec;
};

const titleCase: SettingSpec = {
  key: 'title_case',
  label: 'Capitalise Each Word of the card text',
  hint: 'Matches the reference design. Turn off for normal sentence case.',
  kind: 'boolean',
  default: true,
};

export const SECTION_TYPES = {
  hero_search: {
    label: 'Hero with search',
    description:
      'Full-width photo with the headline, the What / Where search bar and category tiles.',
    image: 'Background photo',
    settings: [
      { key: 'what_label', label: 'What label', kind: 'text', default: 'What', max: 30 },
      {
        key: 'what_placeholder',
        label: 'What placeholder',
        kind: 'text',
        default: 'Ex: restaurant, lawyer, gym...',
        max: 80,
      },
      { key: 'where_label', label: 'Where label', kind: 'text', default: 'Where', max: 30 },
      {
        key: 'where_placeholder',
        label: 'Where placeholder',
        kind: 'text',
        default: 'City or Area',
        max: 80,
      },
      {
        key: 'button_label',
        label: 'Search button label',
        hint: 'Read out by screen readers; the button itself shows a magnifier.',
        kind: 'text',
        default: 'Search listings',
        max: 40,
      },
      {
        key: 'overlay',
        label: 'Photo darkening',
        kind: 'select',
        default: 'medium',
        options: [
          { value: 'light', label: 'Light' },
          { value: 'medium', label: 'Medium' },
          { value: 'strong', label: 'Strong' },
        ],
      },
    ],
    items: {
      noun: 'tile',
      max: 12,
      hint: 'Category shortcuts shown in the white panel under the hero.',
      title: 'Label',
      icon: 'Icon',
      ref: 'category',
      url: 'Custom link (optional, overrides the category)',
    },
  },
  featured_listings: {
    label: 'Business carousel',
    description: 'Approved businesses as cards in a carousel, highest rated or newest first.',
    cta: true,
    itemLimit: { label: 'Number of businesses', min: 1, max: 12, default: 6 },
    settings: [
      {
        key: 'sort',
        label: 'Order',
        kind: 'select',
        default: 'rating',
        options: [
          { value: 'rating', label: 'Highest rated first' },
          { value: 'newest', label: 'Newest first' },
        ],
      },
      { key: 'autoplay', label: 'Advance automatically', kind: 'boolean', default: true },
      { key: 'show_phone', label: 'Show phone numbers', kind: 'boolean', default: true },
      { key: 'show_status', label: 'Show the Open / Closed badge', kind: 'boolean', default: true },
      {
        key: 'empty_title',
        label: 'Title when there are no businesses',
        kind: 'text',
        default: 'No businesses listed yet',
        max: 80,
      },
      {
        key: 'empty_text',
        label: 'Text when there are no businesses',
        kind: 'text',
        default: 'Be the first to add your business to the directory.',
        max: 200,
      },
    ],
    items: {
      noun: 'pinned business',
      max: 12,
      hint: 'Optional. When any business is pinned, the carousel shows the pinned businesses in this order instead of the automatic list.',
      ref: 'listing',
    },
  },
  image_text: {
    label: 'Image and text',
    description: 'A photo beside paragraphs of text.',
    body: 'Text — leave a blank line between paragraphs',
    image: 'Photo',
    cta: true,
    settings: [
      {
        key: 'image_position',
        label: 'Photo position',
        kind: 'select',
        default: 'left',
        options: [
          { value: 'left', label: 'Left' },
          { value: 'right', label: 'Right' },
        ],
      },
    ],
  },
  value_props: {
    label: 'Icon cards',
    description: 'Cards with a round icon, a title and a short text, three to a row.',
    settings: [
      titleCase,
      { key: 'numbered', label: 'Show step numbers', kind: 'boolean', default: false },
    ],
    items: {
      noun: 'card',
      max: 6,
      hint: 'Three cards fill one row on desktop.',
      title: 'Title',
      body: 'Text',
      icon: 'Icon',
      url: 'Link (optional)',
    },
  },
  taxonomy_grid: {
    label: 'City mosaic',
    description: 'Photo cards for cities in alternating wide and narrow rows.',
    settings: [],
    items: {
      noun: 'city',
      max: 8,
      hint: 'Pick a city: its name and page are used unless overridden here. Upload a photo for each card in Media first.',
      ref: 'city',
      title: 'Label (optional, defaults to the city name)',
      image: 'Photo',
      url: 'Custom link (optional)',
    },
  },
  featured_categories: {
    label: 'Service cards carousel',
    description: 'Icon cards for popular services in a carousel with dots.',
    settings: [titleCase],
    items: {
      noun: 'service',
      max: 12,
      hint: 'Link each card to a category so visitors can browse it.',
      title: 'Title',
      body: 'Text',
      icon: 'Icon',
      ref: 'category',
      url: 'Custom link (optional, overrides the category)',
    },
  },
  cta_banner: {
    label: 'Call to action',
    description:
      'Banner layout: a heading, text and button over a colour or photo. Cards layout: cards above a centred button.',
    body: 'Text (banner layout)',
    image: 'Background photo (banner layout)',
    cta: true,
    settings: [
      {
        key: 'layout',
        label: 'Layout',
        kind: 'select',
        default: 'banner',
        options: [
          { value: 'banner', label: 'Banner' },
          { value: 'cards', label: 'Cards and button' },
        ],
      },
    ],
    items: {
      noun: 'card',
      max: 4,
      hint: 'Cards layout only. A blank line separates paragraphs. When an icon is set, each line of the text becomes a checklist row with that icon.',
      title: 'Card title',
      body: 'Card text',
      icon: 'Checklist icon (optional)',
    },
  },
  testimonials: {
    label: 'Testimonials carousel',
    description: 'Quotes with a photo, name and role.',
    settings: [],
    items: {
      noun: 'testimonial',
      max: 12,
      hint: 'Only testimonials with a quote are shown. Use genuine quotes from real customers.',
      title: 'Name',
      subtitle: 'Role',
      body: 'Quote',
      image: 'Photo',
    },
  },
  faq: {
    label: 'FAQ accordion',
    description:
      'Questions that expand to show their answers. Also published as FAQ structured data.',
    settings: [
      { key: 'open_first', label: 'Open the first question', kind: 'boolean', default: true },
      {
        key: 'single_open',
        label: 'Keep only one answer open at a time',
        kind: 'boolean',
        default: true,
      },
    ],
    items: {
      noun: 'question',
      max: 40,
      hint: 'A blank line in an answer starts a new paragraph.',
      title: 'Question',
      body: 'Answer',
    },
  },
  blog_grid: {
    label: 'Blog carousel',
    description: 'The latest published articles, two to a view with arrows.',
    cta: true,
    itemLimit: { label: 'Number of articles', min: 1, max: 9, default: 3 },
    settings: [{ key: 'show_dates', label: 'Show dates', kind: 'boolean', default: true }],
    items: {
      noun: 'pinned article',
      max: 9,
      hint: 'Optional. When any article is pinned, the pinned articles are shown instead of the latest.',
      ref: 'blog_post',
    },
  },
} as const satisfies Record<string, SectionSpec>;

export type HomeSectionType = keyof typeof SECTION_TYPES;

export function isHomeSectionType(value: string): value is HomeSectionType {
  return Object.prototype.hasOwnProperty.call(SECTION_TYPES, value);
}

export function sectionSpec(type: HomeSectionType): SectionSpec {
  return SECTION_TYPES[type];
}

export type SettingValues = Record<string, string | boolean>;

/**
 * The stored settings for a section, with every key its type declares present
 * and of the declared kind. Unknown keys are dropped and bad values fall back
 * to the default, so a hand-edited row can never break rendering.
 */
export function readSettings(type: HomeSectionType, raw: unknown): SettingValues {
  const stored = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const out: SettingValues = {};
  for (const spec of sectionSpec(type).settings) {
    const v = stored[spec.key];
    if (spec.kind === 'boolean') {
      out[spec.key] = typeof v === 'boolean' ? v : spec.default;
    } else if (spec.kind === 'select') {
      out[spec.key] =
        typeof v === 'string' && spec.options.some((o) => o.value === v) ? v : spec.default;
    } else {
      out[spec.key] = typeof v === 'string' ? v.slice(0, spec.max) : spec.default;
    }
  }
  return out;
}

export function isBackground(value: unknown): value is Background {
  return typeof value === 'string' && (BACKGROUNDS as readonly string[]).includes(value);
}

/** Copy may say {brand}; it becomes the brand.name setting, so a rebrand is one edit. */
export function fillBrand(text: string, brand: string): string {
  return text.replaceAll('{brand}', brand);
}

/** Paragraphs are separated by a blank line. */
export function paragraphs(text: string | null | undefined): string[] {
  if (!text) return [];
  return text
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s*\n\s*/g, ' ').trim())
    .filter(Boolean);
}

/** One entry per non-empty line, for checklists. */
export function lines(text: string | null | undefined): string[] {
  if (!text) return [];
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
}
