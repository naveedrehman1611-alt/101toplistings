import type { Background } from './sections';

/**
 * View models for the homepage and the site chrome. src/lib/home.ts and
 * src/lib/chrome.ts build these on the server from the database; components
 * only ever render them. Plain serialisable data, so a client component can
 * receive any of it as props. Every string here is final copy: {brand} is
 * already filled in and every href already resolves to a real route.
 */

export type Img = {
  url: string;
  alt: string;
  width: number | null;
  height: number | null;
};

export type LinkVM = { label: string; href: string };

type SectionBase = {
  id: string;
  key: string;
  heading: string | null;
  subheading: string | null;
  background: Background;
};

// ---------------------------------------------------------------------------
// Hero
// ---------------------------------------------------------------------------

/** Search options, parents first with their children after them (depth 1). */
export type CategoryOption = { slug: string; name: string; depth: 0 | 1 };
export type CityOption = { slug: string; name: string };

export type TileVM = { id: string; label: string; icon: string | null; href: string };

export type HeroVM = SectionBase & {
  type: 'hero_search';
  image: Img | null;
  overlay: 'light' | 'medium' | 'strong';
  labels: {
    what: string;
    whatPlaceholder: string;
    where: string;
    wherePlaceholder: string;
    submit: string;
  };
  categories: CategoryOption[];
  cities: CityOption[];
  tiles: TileVM[];
};

// ---------------------------------------------------------------------------
// Business carousel
// ---------------------------------------------------------------------------

/** day: 0 = Sunday … 6 = Saturday, as stored. Times are "HH:MM" in Pakistan time. */
export type OpeningHourVM = {
  day: number;
  opens: string | null;
  closes: string | null;
  closed: boolean;
  allDay: boolean;
};

export type BusinessCardVM = {
  id: string;
  name: string;
  href: string;
  excerpt: string | null;
  tagline: string | null;
  coverUrl: string | null;
  logoUrl: string | null;
  phone: string | null;
  city: LinkVM | null;
  category: LinkVM | null;
  /** Null when there are no approved reviews — never render a rating then. */
  rating: number | null;
  reviewCount: number;
  /** Empty when the listing has no hours: render no Open/Closed badge. */
  hours: OpeningHourVM[];
};

export type ListingsVM = SectionBase & {
  type: 'featured_listings';
  /** "error" means the read failed; "empty" means it worked and found nothing. */
  status: 'ok' | 'empty' | 'error';
  listings: BusinessCardVM[];
  autoplay: boolean;
  showPhone: boolean;
  showStatus: boolean;
  emptyTitle: string;
  emptyText: string;
  /** Where the empty and error states send people. */
  addListingHref: string;
  browseHref: string;
  cta: LinkVM | null;
};

// ---------------------------------------------------------------------------
// Content sections
// ---------------------------------------------------------------------------

export type ImageTextVM = SectionBase & {
  type: 'image_text';
  paragraphs: string[];
  image: Img | null;
  imagePosition: 'left' | 'right';
  cta: LinkVM | null;
};

export type CardVM = {
  id: string;
  icon: string | null;
  title: string;
  body: string | null;
  href: string | null;
};

export type ValuePropsVM = SectionBase & {
  type: 'value_props';
  titleCase: boolean;
  numbered: boolean;
  items: CardVM[];
};

export type CityCardVM = { id: string; name: string; href: string; image: Img | null };

export type CityGridVM = SectionBase & { type: 'taxonomy_grid'; items: CityCardVM[] };

export type ServicesVM = SectionBase & {
  type: 'featured_categories';
  titleCase: boolean;
  items: CardVM[];
};

export type CtaCardVM = {
  id: string;
  title: string;
  paragraphs: string[];
  /** Set when the card is a checklist: each entry is one row, drawn with `icon`. */
  checklist: string[] | null;
  icon: string | null;
};

export type CtaVM = SectionBase & {
  type: 'cta_banner';
  layout: 'banner' | 'cards';
  paragraphs: string[];
  image: Img | null;
  cta: LinkVM | null;
  cards: CtaCardVM[];
};

export type TestimonialVM = {
  id: string;
  name: string;
  role: string | null;
  quote: string[];
  avatar: Img | null;
};

export type TestimonialsVM = SectionBase & { type: 'testimonials'; items: TestimonialVM[] };

export type FaqItemVM = { id: string; question: string; answer: string[] };

export type FaqVM = SectionBase & {
  type: 'faq';
  openFirst: boolean;
  singleOpen: boolean;
  items: FaqItemVM[];
};

export type PostCardVM = {
  id: string;
  title: string;
  href: string;
  excerpt: string | null;
  /** ISO timestamp; format it in the component. */
  publishedAt: string | null;
  readMinutes: number | null;
  category: string | null;
  image: Img | null;
};

export type GuidesVM = SectionBase & {
  type: 'blog_grid';
  showDates: boolean;
  posts: PostCardVM[];
  cta: LinkVM | null;
};

export type HomeSectionVM =
  | HeroVM
  | ListingsVM
  | ImageTextVM
  | ValuePropsVM
  | CityGridVM
  | ServicesVM
  | CtaVM
  | TestimonialsVM
  | FaqVM
  | GuidesVM;

// ---------------------------------------------------------------------------
// Site chrome (header and footer), built by src/lib/chrome.ts
// ---------------------------------------------------------------------------

export type SocialNetwork = 'facebook' | 'instagram' | 'x' | 'linkedin' | 'youtube';

export type BrandVM = {
  name: string;
  /** Trailing part of the name drawn in the accent colour ("Dir"); may be "". */
  accent: string;
  /** Uploaded logo for light backgrounds (inner-page header). */
  logoOnLight: Img | null;
  /** Uploaded logo for dark backgrounds (homepage header, footer). */
  logoOnDark: Img | null;
};

export type ChromeVM = {
  brand: BrandVM;
  nav: LinkVM[];
  mobileNav: LinkVM[];
  login: LinkVM;
  register: LinkVM;
  addListing: LinkVM;
  footer: {
    tagline: string;
    social: { network: SocialNetwork; href: string }[];
    columns: { title: string; links: LinkVM[] }[];
    contact: { email: string; phone: string; address: string };
    newsletter: { heading: string; text: string; placeholder: string; button: string };
    copyright: string;
  };
};
