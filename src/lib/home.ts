import 'server-only';
import { cache } from 'react';
import {
  getCardExtras,
  getCardLogos,
  getCategories,
  getCities,
  getHoursFor,
  getListingCardsByIds,
  getPostCards,
  getSectionRows,
  getSettings,
  searchListingsResult,
  settingText,
  type Category,
  type City,
  type ListingCard,
  type MediaRow,
  type SectionItemRow,
  type SectionRow,
} from './queries';
import { mediaUrl } from './media';
import {
  fillBrand,
  isBackground,
  isHomeSectionType,
  lines,
  paragraphs,
  readSettings,
  type Background,
  type HomeSectionType,
  type SettingValues,
} from './sections';
import type {
  BusinessCardVM,
  CardVM,
  CategoryOption,
  CityOption,
  HomeSectionVM,
  Img,
  LinkVM,
  OpeningHourVM,
  PostCardVM,
} from './home-types';

/**
 * Builds the homepage from page_sections: every enabled section, in sort
 * order, rendered by its section_type. All copy has {brand} filled in and every
 * link is resolved here, so components never see a raw row or a dead link.
 *
 * Cost per regeneration is fixed, whatever editors add: sections with their
 * items and images (1 request), settings, categories and cities (shared with
 * the layout), plus at most one listing search with its three enrichment reads
 * and one blog read. Everything but the search RPC is a tag-cached GET.
 */

const ADD_LISTING_HREF = '/dashboard/listings/new';
const MAX_SEARCH_OPTIONS = 500;

type Lookups = {
  brand: string;
  categoriesById: Map<string, Category>;
  citiesById: Map<string, City>;
};

function img(media: MediaRow | null, fallbackAlt: string): Img | null {
  if (!media?.path) return null;
  return {
    url: mediaUrl(media.path),
    alt: media.alt?.trim() || fallbackAlt,
    width: media.width,
    height: media.height,
  };
}

function link(label: string | null, href: string | null, brand: string): LinkVM | null {
  return label && href ? { label: fillBrand(label, brand), href } : null;
}

function text(value: string | null, brand: string): string | null {
  const v = value?.trim();
  return v ? fillBrand(v, brand) : null;
}

/**
 * Where an item points: its own URL if an editor set one, otherwise the page of
 * the category or city it references, otherwise a keyword search for its label
 * — never a route that could 404.
 */
function itemHref(item: SectionItemRow, label: string | null, l: Lookups): string | null {
  if (item.url) return item.url;
  if (item.ref_type === 'category' && item.ref_id) {
    const c = l.categoriesById.get(item.ref_id);
    if (c) return `/category/${c.slug}`;
  }
  if (item.ref_type === 'city' && item.ref_id) {
    const c = l.citiesById.get(item.ref_id);
    if (c) return `/city/${c.slug}`;
  }
  return label ? `/search?q=${encodeURIComponent(label)}` : null;
}

function refName(item: SectionItemRow, l: Lookups): string | null {
  if (!item.ref_id) return null;
  if (item.ref_type === 'category') return l.categoriesById.get(item.ref_id)?.name ?? null;
  if (item.ref_type === 'city') return l.citiesById.get(item.ref_id)?.name ?? null;
  return null;
}

function cards(row: SectionRow, l: Lookups): CardVM[] {
  return row.items.flatMap((item) => {
    const title = text(item.title, l.brand) ?? refName(item, l);
    if (!title) return [];
    const linked = item.url || (item.ref_type && item.ref_id);
    return [
      {
        id: item.id,
        icon: item.icon,
        title,
        body: text(item.body, l.brand),
        href: linked ? itemHref(item, title, l) : null,
      },
    ];
  });
}

/** Parents in their sort order, each followed by its children; orphans last. */
function categoryOptions(categories: Category[]): CategoryOption[] {
  const byParent = new Map<string, Category[]>();
  for (const c of categories) {
    if (!c.parent_id) continue;
    const list = byParent.get(c.parent_id) ?? [];
    list.push(c);
    byParent.set(c.parent_id, list);
  }
  const ids = new Set(categories.map((c) => c.id));
  const out: CategoryOption[] = [];
  for (const parent of categories) {
    if (parent.parent_id && ids.has(parent.parent_id)) continue;
    out.push({ slug: parent.slug, name: parent.name, depth: 0 });
    for (const child of byParent.get(parent.id) ?? []) {
      out.push({ slug: child.slug, name: child.name, depth: 1 });
    }
  }
  return out.slice(0, MAX_SEARCH_OPTIONS);
}

function hoursVM(
  rows: {
    day_of_week: number;
    opens_at: string | null;
    closes_at: string | null;
    is_closed: boolean;
    is_24h: boolean;
  }[],
): OpeningHourVM[] {
  return rows.map((h) => ({
    day: h.day_of_week,
    opens: h.opens_at ? h.opens_at.slice(0, 5) : null,
    closes: h.closes_at ? h.closes_at.slice(0, 5) : null,
    closed: h.is_closed,
    allDay: h.is_24h,
  }));
}

/** The three enrichment reads for a page of cards run together. */
async function businessCards(listings: ListingCard[], l: Lookups): Promise<BusinessCardVM[]> {
  const ids = listings.map((x) => x.id);
  const [extras, logos, hours] = await Promise.all([
    getCardExtras(ids),
    getCardLogos(ids),
    getHoursFor(ids),
  ]);
  const extraById = new Map(extras.map((e) => [e.id, e]));
  const hoursById = new Map<string, typeof hours>();
  for (const h of hours) {
    const list = hoursById.get(h.listing_id) ?? [];
    list.push(h);
    hoursById.set(h.listing_id, list);
  }
  return listings.map((x) => {
    const extra = extraById.get(x.id);
    const city = x.city_id ? l.citiesById.get(x.city_id) : undefined;
    const category = x.category_id ? l.categoriesById.get(x.category_id) : undefined;
    return {
      id: x.id,
      name: x.name,
      href: `/listing/${x.slug}`,
      excerpt: extra?.excerpt?.trim() || null,
      tagline: x.tagline?.trim() || null,
      coverUrl: x.cover_url ?? null,
      logoUrl: logos.get(x.id) ?? null,
      phone: extra?.phone_primary?.trim() || null,
      city: city ? { label: city.name, href: `/city/${city.slug}` } : null,
      category: category ? { label: category.name, href: `/category/${category.slug}` } : null,
      rating: x.review_count > 0 ? x.rating_average : null,
      reviewCount: x.review_count,
      hours: hoursVM(hoursById.get(x.id) ?? []),
    };
  });
}

function postCards(rows: Awaited<ReturnType<typeof getPostCards>>): PostCardVM[] {
  return rows.map((p) => ({
    id: p.id,
    title: p.title,
    href: `/blog/${p.slug}`,
    excerpt: p.standfirst?.trim() || null,
    publishedAt: p.published_at,
    readMinutes: p.read_minutes,
    category: p.category?.name ?? null,
    image: img(p.cover, p.title),
  }));
}

const DEFAULT_BACKGROUND: Partial<Record<HomeSectionType, Background>> = {
  hero_search: 'navy',
};

async function buildSection(
  row: SectionRow,
  type: HomeSectionType,
  settings: SettingValues,
  l: Lookups,
  all: { categories: Category[]; cities: City[] },
): Promise<HomeSectionVM | null> {
  const brand = l.brand;
  const base = {
    id: row.id,
    key: row.section_key,
    heading: text(row.heading, brand),
    subheading: text(row.subheading, brand),
    background: isBackground(row.background_variant)
      ? row.background_variant
      : (DEFAULT_BACKGROUND[type] ?? 'white'),
  };
  const cta = link(row.cta_label, row.cta_url, brand);

  switch (type) {
    case 'hero_search': {
      const cities: CityOption[] = [...all.cities]
        .sort((a, b) => a.name.localeCompare(b.name))
        .slice(0, MAX_SEARCH_OPTIONS)
        .map((c) => ({ slug: c.slug, name: c.name }));
      return {
        ...base,
        type,
        image: img(row.image, base.heading ?? ''),
        overlay: settings.overlay as 'light' | 'medium' | 'strong',
        labels: {
          what: String(settings.what_label),
          whatPlaceholder: String(settings.what_placeholder),
          where: String(settings.where_label),
          wherePlaceholder: String(settings.where_placeholder),
          submit: String(settings.button_label),
        },
        categories: categoryOptions(all.categories),
        cities,
        tiles: row.items.flatMap((item) => {
          const label = text(item.title, brand) ?? refName(item, l);
          const href = itemHref(item, label, l);
          return label && href ? [{ id: item.id, label, icon: item.icon, href }] : [];
        }),
      };
    }

    case 'featured_listings': {
      const limit = Math.min(Math.max(row.item_limit ?? 6, 1), 12);
      const pinned = row.items.flatMap((i) =>
        i.ref_type === 'listing' && i.ref_id ? [i.ref_id] : [],
      );
      let listings: ListingCard[];
      let failed = false;
      if (pinned.length) {
        listings = await getListingCardsByIds(pinned.slice(0, 12));
      } else {
        const result = await searchListingsResult({
          sort: settings.sort === 'newest' ? 'newest' : 'rating',
          limit,
        });
        listings = result.listings;
        failed = result.failed;
      }
      const cardsVM = listings.length ? await businessCards(listings, l) : [];
      return {
        ...base,
        type,
        status: failed ? 'error' : cardsVM.length ? 'ok' : 'empty',
        listings: cardsVM,
        autoplay: Boolean(settings.autoplay),
        showPhone: Boolean(settings.show_phone),
        showStatus: Boolean(settings.show_status),
        emptyTitle: fillBrand(String(settings.empty_title), brand),
        emptyText: fillBrand(String(settings.empty_text), brand),
        addListingHref: ADD_LISTING_HREF,
        browseHref: '/business-directory',
        cta,
      };
    }

    case 'image_text':
      return {
        ...base,
        type,
        paragraphs: paragraphs(text(row.body, brand)),
        image: img(row.image, base.heading ?? ''),
        imagePosition: settings.image_position === 'right' ? 'right' : 'left',
        cta,
      };

    case 'value_props': {
      const items = cards(row, l);
      return items.length
        ? {
            ...base,
            type,
            titleCase: Boolean(settings.title_case),
            numbered: Boolean(settings.numbered),
            items,
          }
        : null;
    }

    case 'taxonomy_grid': {
      const items = row.items.flatMap((item) => {
        const name = text(item.title, brand) ?? refName(item, l);
        const linked = item.url || (item.ref_type === 'city' && item.ref_id);
        const href = linked ? itemHref(item, name, l) : null;
        return name && href ? [{ id: item.id, name, href, image: img(item.image, name) }] : [];
      });
      return items.length ? { ...base, type, items } : null;
    }

    case 'featured_categories': {
      const items = cards(row, l);
      return items.length
        ? { ...base, type, titleCase: Boolean(settings.title_case), items }
        : null;
    }

    case 'cta_banner':
      return {
        ...base,
        type,
        layout: settings.layout === 'cards' ? 'cards' : 'banner',
        paragraphs: paragraphs(text(row.body, brand)),
        image: img(row.image, base.heading ?? ''),
        cta,
        cards: row.items.flatMap((item) => {
          const title = text(item.title, brand);
          const body = text(item.body, brand);
          if (!title && !body) return [];
          return [
            {
              id: item.id,
              title: title ?? '',
              paragraphs: item.icon ? [] : paragraphs(body),
              checklist: item.icon ? lines(body) : null,
              icon: item.icon,
            },
          ];
        }),
      };

    case 'testimonials': {
      // A testimonial without its quote is never shown: nothing is published
      // that a real person did not say.
      const items = row.items.flatMap((item) => {
        const name = text(item.title, brand);
        const quote = paragraphs(text(item.body, brand));
        return name && quote.length
          ? [
              {
                id: item.id,
                name,
                role: text(item.subtitle, brand),
                quote,
                avatar: img(item.image, name),
              },
            ]
          : [];
      });
      return items.length ? { ...base, type, items } : null;
    }

    case 'faq': {
      const items = row.items.flatMap((item) => {
        const question = text(item.title, brand);
        const answer = paragraphs(text(item.body, brand));
        return question && answer.length ? [{ id: item.id, question, answer }] : [];
      });
      return items.length
        ? {
            ...base,
            type,
            openFirst: Boolean(settings.open_first),
            singleOpen: Boolean(settings.single_open),
            items,
          }
        : null;
    }

    case 'blog_grid': {
      const limit = Math.min(Math.max(row.item_limit ?? 3, 1), 9);
      const pinned = row.items.flatMap((i) =>
        i.ref_type === 'blog_post' && i.ref_id ? [i.ref_id] : [],
      );
      const posts = postCards(
        await getPostCards(pinned.length ? { limit, ids: pinned.slice(0, 9) } : { limit }),
      );
      return posts.length
        ? { ...base, type, showDates: Boolean(settings.show_dates), posts, cta }
        : null;
    }
  }
}

export type HomePage = { brand: string; sections: HomeSectionVM[] };

export const getHomePage = cache(async function getHomePage(): Promise<HomePage> {
  const [settings, rows, categories, cities] = await Promise.all([
    getSettings(),
    getSectionRows('home'),
    getCategories(),
    getCities(),
  ]);
  const brand = settingText(settings, 'brand.name', 'RankYouSite');
  const lookups: Lookups = {
    brand,
    categoriesById: new Map(categories.map((c) => [c.id, c])),
    citiesById: new Map(cities.map((c) => [c.id, c])),
  };

  const built = await Promise.all(
    rows.map((row) => {
      if (!isHomeSectionType(row.section_type)) return null;
      const type = row.section_type;
      return buildSection(row, type, readSettings(type, row.settings), lookups, {
        categories,
        cities,
      });
    }),
  );

  return { brand, sections: built.filter((s): s is HomeSectionVM => s !== null) };
});
