/**
 * Deterministic JSON-LD builder. Pure functions: same draft in, same JSON out.
 * Strings are trimmed, empty values and empty nested objects are dropped,
 * numeric fields become numbers when they parse, and keys are written in a
 * fixed order so the output never reshuffles while typing.
 */

import { FOOD_TYPES, isOffline, isOnlineOnly } from './schema-types';
import type { Draft, Row, SchemaTypeId, Values } from './schema-types';

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };
type Loose = Json | undefined | Loose[] | { [key: string]: Loose };

const str = (s: string | undefined): string | undefined => {
  const v = (s ?? '').trim();
  return v ? v : undefined;
};

/** A number when the text parses cleanly, otherwise the trimmed text (the validator flags it). */
export function num(s: string | undefined): number | string | undefined {
  const v = str(s);
  if (v === undefined) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : v;
}

/** Adds seconds and a UTC offset to a datetime-local value ("2026-11-21T10:00"). */
export function dateTime(s: string | undefined, tz: string | undefined): string | undefined {
  const v = str(s);
  if (!v) return undefined;
  const offset = (tz ?? '').trim();
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v)) return `${v}:00${offset}`;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(v)) return `${v}${offset}`;
  return v;
}

/** True when nothing in the object matters except its @type. */
function isEmptyObject(o: Record<string, Loose>): boolean {
  return Object.keys(o).every((k) => k === '@type' || k === '@context');
}

/** Recursively drops undefined, empty strings, empty arrays and @type-only objects. */
export function clean(value: Loose): Json | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'string') return value.trim() ? value.trim() : undefined;
  if (typeof value === 'number' || typeof value === 'boolean') return value;
  if (Array.isArray(value)) {
    const out = value.map(clean).filter((v): v is Json => v !== undefined);
    return out.length ? out : undefined;
  }
  const out: Record<string, Json> = {};
  for (const [k, v] of Object.entries(value)) {
    const c = clean(v);
    if (c !== undefined) out[k] = c;
  }
  return isEmptyObject(out) ? undefined : out;
}

/** Rows with at least one non-blank field. */
export function filledRows(rows: Row[] | undefined): Row[] {
  return (rows ?? []).filter((r) => Object.values(r).some((v) => (v ?? '').trim()));
}

function address(v: Values): Loose {
  const hasAny = ['streetAddress', 'addressLocality', 'addressRegion', 'postalCode'].some((k) =>
    str(v[k]),
  );
  if (!hasAny) return undefined;
  return {
    '@type': 'PostalAddress',
    streetAddress: str(v.streetAddress),
    addressLocality: str(v.addressLocality),
    addressRegion: str(v.addressRegion),
    postalCode: str(v.postalCode),
    addressCountry: str(v.addressCountry)?.toUpperCase(),
  };
}

function rating(v: Values): Loose {
  if (!str(v.ratingValue)) return undefined;
  return {
    '@type': 'AggregateRating',
    ratingValue: num(v.ratingValue),
    reviewCount: num(v.reviewCount),
    bestRating: num(v.bestRating),
    worstRating: num(v.worstRating),
  };
}

function urlList(rows: Row[] | undefined): Loose {
  const urls = filledRows(rows)
    .map((r) => str(r.url))
    .filter(Boolean) as string[];
  return urls.length ? urls : undefined;
}

function hours(rows: Row[] | undefined): Loose {
  return filledRows(rows).map((r) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: (r.days ?? '')
      .split(',')
      .map((d) => d.trim())
      .filter(Boolean),
    opens: str(r.opens),
    closes: str(r.closes),
  }));
}

function localBusiness(v: Values, lists: Draft['lists']): Loose {
  const food = FOOD_TYPES.includes(v.subtype);
  const lat = num(v.latitude);
  const lng = num(v.longitude);
  return {
    '@type': str(v.subtype) ?? 'LocalBusiness',
    name: str(v.name),
    image: str(v.image),
    url: str(v.url),
    telephone: str(v.telephone),
    priceRange: str(v.priceRange),
    description: str(v.description),
    servesCuisine: food ? splitList(v.servesCuisine) : undefined,
    menu: food ? str(v.menu) : undefined,
    address: address(v),
    geo:
      lat !== undefined && lng !== undefined
        ? { '@type': 'GeoCoordinates', latitude: lat, longitude: lng }
        : undefined,
    openingHoursSpecification: hours(lists.hours),
    sameAs: urlList(lists.sameAs),
    aggregateRating: rating(v),
  };
}

function splitList(s: string | undefined): Loose {
  const parts = (s ?? '')
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);
  if (!parts.length) return undefined;
  return parts.length === 1 ? parts[0] : parts;
}

function organization(v: Values, lists: Draft['lists']): Loose {
  return {
    '@type': 'Organization',
    name: str(v.name),
    legalName: str(v.legalName),
    url: str(v.url),
    logo: str(v.logo),
    description: str(v.description),
    email: str(v.email),
    telephone: str(v.telephone),
    foundingDate: str(v.foundingDate),
    address: address(v),
    sameAs: urlList(lists.sameAs),
  };
}

function article(v: Values): Loose {
  const url = str(v.url);
  return {
    '@type': str(v.subtype) ?? 'Article',
    headline: str(v.headline),
    description: str(v.description),
    image: str(v.image) ? [str(v.image)] : undefined,
    datePublished: dateTime(v.datePublished, v.tz),
    dateModified: dateTime(v.dateModified, v.tz),
    author: str(v.authorName)
      ? { '@type': str(v.authorType) ?? 'Person', name: str(v.authorName), url: str(v.authorUrl) }
      : undefined,
    publisher: str(v.publisherName)
      ? {
          '@type': 'Organization',
          name: str(v.publisherName),
          logo: str(v.publisherLogo)
            ? { '@type': 'ImageObject', url: str(v.publisherLogo) }
            : undefined,
        }
      : undefined,
    mainEntityOfPage: url ? { '@type': 'WebPage', '@id': url } : undefined,
  };
}

function product(v: Values): Loose {
  return {
    '@type': 'Product',
    name: str(v.name),
    image: str(v.image) ? [str(v.image)] : undefined,
    description: str(v.description),
    sku: str(v.sku),
    gtin: str(v.gtin),
    brand: str(v.brand) ? { '@type': 'Brand', name: str(v.brand) } : undefined,
    offers: str(v.price)
      ? {
          '@type': 'Offer',
          url: str(v.offerUrl),
          price: num(v.price),
          priceCurrency: str(v.priceCurrency)?.toUpperCase(),
          priceValidUntil: str(v.priceValidUntil),
          availability: str(v.availability),
          itemCondition: str(v.itemCondition),
        }
      : undefined,
    aggregateRating: rating(v),
  };
}

function faqPage(lists: Draft['lists']): Loose {
  return {
    '@type': 'FAQPage',
    mainEntity: filledRows(lists.faqs).map((r) => ({
      '@type': 'Question',
      name: str(r.q),
      acceptedAnswer: { '@type': 'Answer', text: str(r.a) },
    })),
  };
}

function howTo(v: Values, lists: Draft['lists']): Loose {
  return {
    '@type': 'HowTo',
    name: str(v.name),
    description: str(v.description),
    image: str(v.image),
    totalTime: str(v.totalTime)?.toUpperCase(),
    step: filledRows(lists.steps).map((r) => ({
      '@type': 'HowToStep',
      name: str(r.name),
      text: str(r.text),
      url: str(r.url),
      image: str(r.image),
    })),
  };
}

function event(v: Values): Loose {
  const place = {
    '@type': 'Place',
    name: str(v.placeName),
    address: address(v),
  };
  const virtual = { '@type': 'VirtualLocation', url: str(v.onlineUrl) };
  const location = isOnlineOnly(v) ? virtual : isOffline(v) ? place : [place, virtual];
  const organizer = str(v.organizerName)
    ? { '@type': 'Organization', name: str(v.organizerName), url: str(v.organizerUrl) }
    : undefined;
  return {
    '@type': 'Event',
    name: str(v.name),
    description: str(v.description),
    image: str(v.image) ? [str(v.image)] : undefined,
    startDate: dateTime(v.startDate, v.tz),
    endDate: dateTime(v.endDate, v.tz),
    eventStatus: str(v.eventStatus),
    eventAttendanceMode: str(v.eventAttendanceMode),
    location,
    offers:
      str(v.price) || str(v.ticketUrl)
        ? {
            '@type': 'Offer',
            url: str(v.ticketUrl),
            price: num(v.price),
            priceCurrency: str(v.price) ? str(v.priceCurrency)?.toUpperCase() : undefined,
            availability: str(v.availability),
            validFrom: dateTime(v.validFrom, v.tz),
          }
        : undefined,
    organizer,
    performer: str(v.performer) ? { '@type': 'Person', name: str(v.performer) } : undefined,
  };
}

function breadcrumbs(lists: Draft['lists']): Loose {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: filledRows(lists.crumbs).map((r, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: str(r.name),
      item: str(r.url),
    })),
  };
}

/** Builds the JSON-LD object for a type. Always has @context and @type. */
export function buildSchema(type: SchemaTypeId, draft: Draft): Record<string, Json> {
  const v = draft.values;
  const lists = draft.lists;
  let body: Loose;
  switch (type) {
    case 'LocalBusiness':
      body = localBusiness(v, lists);
      break;
    case 'Organization':
      body = organization(v, lists);
      break;
    case 'Article':
      body = article(v);
      break;
    case 'Product':
      body = product(v);
      break;
    case 'FAQPage':
      body = faqPage(lists);
      break;
    case 'HowTo':
      body = howTo(v, lists);
      break;
    case 'Event':
      body = event(v);
      break;
    case 'BreadcrumbList':
      body = breadcrumbs(lists);
      break;
  }
  const typed = body as Record<string, Loose>;
  const cleaned = (clean(typed) ?? {}) as Record<string, Json>;
  return { '@context': 'https://schema.org', '@type': typed['@type'] as string, ...cleaned };
}

export function toJson(schema: Record<string, Json>): string {
  return JSON.stringify(schema, null, 2);
}

/** A ready-to-paste script tag. "<" is escaped so the JSON can never close the tag early. */
export function toScriptTag(json: string): string {
  return `<script type="application/ld+json">\n${json.replace(/</g, '\\u003c')}\n</script>`;
}
