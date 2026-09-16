import { z } from 'zod';

/**
 * The listing payload contract, shared by the admin form and saveListing().
 *
 * Every rule here mirrors a constraint that actually exists in the database
 * (0003 listings/opening_hours, 0012 video_url host check, 0016's RPC), because
 * a Zod error is a sentence the admin can act on and a Postgres check violation
 * is not. Zod is the friendly first pass; the database remains the authority.
 *
 * The output of `listingPayloadSchema` is literally the four arguments of
 * `admin_save_listing(p_listing, p_hours, p_amenities, p_images)` — the schema
 * IS the payload shape, so there is no second place for the mapping to drift.
 */

/* -------------------------------------------------------------------------- */
/* primitives                                                                  */
/* -------------------------------------------------------------------------- */

/** '' and whitespace-only are "not filled in", which is NULL — never 0, never ''. */
function emptyToNull(value: unknown): unknown {
  if (value === undefined) return null;
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

function optionalText(inner: z.ZodType<string, string>) {
  return z.preprocess(emptyToNull, inner.nullable());
}

/** Absolute URL with an allowed protocol. `new URL` is the only honest parser. */
function absoluteUrl(protocols: readonly string[], label: string) {
  return z.string().refine(
    (value) => {
      try {
        return protocols.includes(new URL(value).protocol);
      } catch {
        return false;
      }
    },
    { error: label },
  );
}

/** An optional <select> of ids: '' (the placeholder option) means "not set". */
function optionalUuid(label: string) {
  return z.preprocess(emptyToNull, z.uuid({ error: `Choose a valid ${label}.` }).nullable());
}

/** Coordinates arrive as strings; a blank one must become NULL, never 0. */
function coordinate(min: number, max: number, label: string) {
  return z.preprocess(
    (value) => {
      const text = emptyToNull(value);
      if (text === null) return null;
      if (typeof text !== 'string') return text;
      const parsed = Number(text);
      // Hand the unparsable string straight through so z.number() reports it
      // rather than silently turning "abc" into NaN and then into 0.
      return Number.isFinite(parsed) ? parsed : text;
    },
    z
      .number({ error: `${label} must be a number.` })
      .min(min, { error: `${label} must be between ${min} and ${max}.` })
      .max(max, { error: `${label} must be between ${min} and ${max}.` })
      .nullable(),
  );
}

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const PHONE_PATTERN = /^[0-9+()\s-]+$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Verbatim twin of listings_video_url_host (0012). */
export const VIDEO_URL_PATTERN =
  /^https:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|vimeo\.com\/)[A-Za-z0-9_\-/?&=.]+$/i;

/* -------------------------------------------------------------------------- */
/* status                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Only these three are reachable from the editor. 'rejected' and 'suspended' are
 * moderation verdicts that carry a note and an audit action, so they are set by
 * rejectListing/suspendListing and never by a <select> an admin can mis-click.
 */
export const LISTING_FORM_STATUSES = ['draft', 'pending', 'approved'] as const;
export type ListingFormStatus = (typeof LISTING_FORM_STATUSES)[number];

/* -------------------------------------------------------------------------- */
/* opening hours                                                               */
/* -------------------------------------------------------------------------- */

export const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

/** UI vocabulary. '' means "this day was left blank" and is dropped before parsing. */
export const HOUR_MODES = ['open', 'closed', '24h'] as const;
export type HourMode = (typeof HOUR_MODES)[number];

export type OpeningHourPayload = {
  day_of_week: number;
  opens_at: string | null;
  closes_at: string | null;
  is_closed: boolean;
  is_24h: boolean;
};

/**
 * The three legal shapes of opening_hours_shape (0003), expressed once. A day
 * the admin left alone is not represented at all — omission is how "no hours
 * published" is stored, which is different from "closed every day".
 */
const openingHourSchema = z
  .object({
    day_of_week: z.number().int().min(0).max(6),
    mode: z.enum(HOUR_MODES),
    opens_at: z.string(),
    closes_at: z.string(),
  })
  .superRefine((row, ctx) => {
    if (row.mode !== 'open') return;
    const day = DAY_NAMES[row.day_of_week];
    if (!TIME_PATTERN.test(row.opens_at.trim())) {
      ctx.addIssue({
        code: 'custom',
        path: ['opens_at'],
        message: `${day} needs an opening time.`,
      });
    }
    if (!TIME_PATTERN.test(row.closes_at.trim())) {
      ctx.addIssue({
        code: 'custom',
        path: ['closes_at'],
        message: `${day} needs a closing time.`,
      });
    }
  })
  .transform((row): OpeningHourPayload => ({
    day_of_week: row.day_of_week,
    is_closed: row.mode === 'closed',
    is_24h: row.mode === '24h',
    opens_at: row.mode === 'open' ? row.opens_at.trim() : null,
    closes_at: row.mode === 'open' ? row.closes_at.trim() : null,
  }));

/* -------------------------------------------------------------------------- */
/* social links                                                                */
/* -------------------------------------------------------------------------- */

export const MAX_SOCIAL_LINKS = 10;

export type SocialLink = { label: string; url: string };

const socialLinkSchema = z.object({
  label: z
    .string()
    .trim()
    .min(1, { error: 'Every social link needs a label.' })
    .max(40, { error: 'A social link label is at most 40 characters.' }),
  url: absoluteUrl(['https:'], 'Social links must be full https:// URLs.'),
});

/* -------------------------------------------------------------------------- */
/* images                                                                      */
/* -------------------------------------------------------------------------- */

export const IMAGE_KINDS = ['cover', 'logo', 'gallery'] as const;
export type ImageKind = (typeof IMAGE_KINDS)[number];

const listingImageSchema = z.object({
  media_id: z.uuid({ error: 'An attached image is missing its media record.' }),
  kind: z.enum(IMAGE_KINDS),
  sort_order: z.number().int().min(0).max(999),
});

/* -------------------------------------------------------------------------- */
/* the listing row                                                             */
/* -------------------------------------------------------------------------- */

const listingSchema = z
  .object({
    id: z.preprocess(emptyToNull, z.uuid().nullable()),

    name: z
      .string()
      .trim()
      .min(2, { error: 'Name must be at least 2 characters.' })
      .max(120, { error: 'Name must be at most 120 characters.' }),

    // Blank is legal: admin_save_listing derives and de-duplicates a slug from
    // the name. Supplying one only overrides that starting point.
    slug: optionalText(
      z
        .string()
        .min(3, { error: 'Slug must be at least 3 characters.' })
        .max(80, { error: 'Slug must be at most 80 characters.' })
        .regex(SLUG_PATTERN, {
          error: 'Slug may use lowercase letters, numbers and single hyphens only.',
        }),
    ),

    tagline: optionalText(
      z.string().max(160, { error: 'Tagline must be at most 160 characters.' }),
    ),
    description: optionalText(
      z.string().max(5000, { error: 'Description must be at most 5000 characters.' }),
    ),

    // Business rule, not a DB constraint: /category/[slug] is a primary browse
    // surface, and a listing with no category can never appear on one.
    category_id: z.uuid({ error: 'Choose a category.' }),
    subcategory_id: optionalUuid('subcategory'),

    phone_primary: optionalText(
      z
        .string()
        .min(6, { error: 'A phone number needs at least 6 characters.' })
        .max(24, { error: 'A phone number is at most 24 characters.' })
        .regex(PHONE_PATTERN, { error: 'Phone numbers may use digits, spaces, + ( ) and -.' }),
    ),
    phone_secondary: optionalText(
      z
        .string()
        .min(6, { error: 'A phone number needs at least 6 characters.' })
        .max(24, { error: 'A phone number is at most 24 characters.' })
        .regex(PHONE_PATTERN, { error: 'Phone numbers may use digits, spaces, + ( ) and -.' }),
    ),
    // Lowercased so the same mailbox is never stored two ways.
    email: z.preprocess(
      (value) => (typeof value === 'string' ? value.trim().toLowerCase() : emptyToNull(value)),
      z.preprocess(emptyToNull, z.email({ error: 'Enter a valid email address.' }).nullable()),
    ),
    website: optionalText(absoluteUrl(['http:', 'https:'], 'Website must be a full http(s) URL.')),

    address: optionalText(z.string().max(300, { error: 'Address is at most 300 characters.' })),
    postal_code: optionalText(
      z.string().max(20, { error: 'Postal code is at most 20 characters.' }),
    ),
    country_id: optionalUuid('country'),
    region_id: optionalUuid('region'),
    city_id: optionalUuid('city'),
    area_id: optionalUuid('area'),
    latitude: coordinate(-90, 90, 'Latitude'),
    longitude: coordinate(-180, 180, 'Longitude'),

    social_links: z
      .array(socialLinkSchema)
      .max(MAX_SOCIAL_LINKS, { error: `At most ${MAX_SOCIAL_LINKS} social links.` }),

    video_url: optionalText(
      z.string().regex(VIDEO_URL_PATTERN, {
        error: 'Video must be a youtube.com/watch?v=…, youtu.be/… or vimeo.com/… https URL.',
      }),
    ),

    seo_title: optionalText(
      z.string().max(60, { error: 'SEO title must be at most 60 characters.' }),
    ),
    seo_description: optionalText(
      z.string().max(160, { error: 'SEO description must be at most 160 characters.' }),
    ),

    is_featured: z.boolean(),
    status: z.enum(LISTING_FORM_STATUSES, { error: 'Choose a status.' }),
  })
  .superRefine((listing, ctx) => {
    if (listing.subcategory_id && listing.subcategory_id === listing.category_id) {
      ctx.addIssue({
        code: 'custom',
        path: ['subcategory_id'],
        message: 'Subcategory must be different from the category.',
      });
    }
    // listings_coords_paired: half a pair is worse than none, because
    // search_listings would then compute a distance from a phantom point.
    const hasLat = listing.latitude !== null;
    const hasLng = listing.longitude !== null;
    if (hasLat !== hasLng) {
      ctx.addIssue({
        code: 'custom',
        path: [hasLat ? 'longitude' : 'latitude'],
        message: 'Latitude and longitude must be given together, or both left empty.',
      });
    }
  });

export type ListingRow = z.infer<typeof listingSchema>;

/* -------------------------------------------------------------------------- */
/* the whole payload                                                           */
/* -------------------------------------------------------------------------- */

export const listingPayloadSchema = z
  .object({
    listing: listingSchema,
    hours: z.array(openingHourSchema).max(7),
    amenities: z.array(z.uuid()).max(200),
    images: z.array(listingImageSchema).max(60),
  })
  .superRefine((payload, ctx) => {
    const days = new Set<number>();
    for (const hour of payload.hours) {
      if (days.has(hour.day_of_week)) {
        ctx.addIssue({
          code: 'custom',
          path: ['hours'],
          message: 'Each day may only be set once.',
        });
      }
      days.add(hour.day_of_week);
    }
    // listing_images_single_cover_idx / _single_logo_idx are partial UNIQUEs;
    // catching it here keeps the admin from losing a whole form to a 23505.
    for (const kind of ['cover', 'logo'] as const) {
      if (payload.images.filter((image) => image.kind === kind).length > 1) {
        ctx.addIssue({
          code: 'custom',
          path: ['images'],
          message: `Only one ${kind} image is allowed.`,
        });
      }
    }
    const seen = new Set<string>();
    for (const image of payload.images) {
      if (seen.has(image.media_id)) {
        ctx.addIssue({
          code: 'custom',
          path: ['images'],
          message: 'The same image is attached twice.',
        });
      }
      seen.add(image.media_id);
    }
  });

export type ListingPayload = z.infer<typeof listingPayloadSchema>;

/* -------------------------------------------------------------------------- */
/* FormData -> raw payload                                                     */
/* -------------------------------------------------------------------------- */

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
}

function texts(formData: FormData, key: string): string[] {
  return formData.getAll(key).filter((value): value is string => typeof value === 'string');
}

/**
 * The single place that knows the form's field names. Returns an untyped shape
 * on purpose — it is the *input* to the schema, so it must be allowed to be
 * wrong; validation is the next step, not this one.
 */
export function rawListingPayload(formData: FormData): unknown {
  const socialLabels = texts(formData, 'social_label');
  const socialUrls = texts(formData, 'social_url');
  // A row posts both inputs, so document order pairs them by index. Rows where
  // both halves are blank are the empty template row and are dropped.
  const social_links = socialLabels
    .map((label, index) => ({ label, url: socialUrls[index] ?? '' }))
    .filter((link) => link.label.trim() !== '' || link.url.trim() !== '');

  const mediaIds = texts(formData, 'image_media_id');
  const kinds = texts(formData, 'image_kind');
  const images = mediaIds
    .map((media_id, index) => ({
      media_id: media_id.trim(),
      kind: kinds[index] ?? 'gallery',
      // Position in the form is the gallery order; there is no separate control.
      sort_order: index,
    }))
    .filter((image) => image.media_id !== '');

  const hours = [0, 1, 2, 3, 4, 5, 6]
    .map((day) => ({
      day_of_week: day,
      mode: text(formData, `hours_mode_${day}`),
      opens_at: text(formData, `hours_open_${day}`),
      closes_at: text(formData, `hours_close_${day}`),
    }))
    // Blank mode = the day was never touched, so it gets no row at all.
    .filter((row) => row.mode !== '');

  return {
    listing: {
      id: text(formData, 'id'),
      name: text(formData, 'name'),
      slug: text(formData, 'slug'),
      tagline: text(formData, 'tagline'),
      description: text(formData, 'description'),
      category_id: text(formData, 'category_id'),
      subcategory_id: text(formData, 'subcategory_id'),
      phone_primary: text(formData, 'phone_primary'),
      phone_secondary: text(formData, 'phone_secondary'),
      email: text(formData, 'email'),
      website: text(formData, 'website'),
      address: text(formData, 'address'),
      postal_code: text(formData, 'postal_code'),
      country_id: text(formData, 'country_id'),
      region_id: text(formData, 'region_id'),
      city_id: text(formData, 'city_id'),
      area_id: text(formData, 'area_id'),
      latitude: text(formData, 'latitude'),
      longitude: text(formData, 'longitude'),
      social_links,
      video_url: text(formData, 'video_url'),
      seo_title: text(formData, 'seo_title'),
      seo_description: text(formData, 'seo_description'),
      is_featured: formData.get('is_featured') !== null,
      status: text(formData, 'status'),
    },
    hours,
    amenities: texts(formData, 'amenity_ids').filter((value) => value.trim() !== ''),
    images,
  };
}

/* -------------------------------------------------------------------------- */
/* error shaping                                                               */
/* -------------------------------------------------------------------------- */

/** Keyed by the *form field name*, which is what the UI can render next to. */
export type ListingFieldErrors = Record<string, string[]>;

const GROUPED_PATHS = new Set(['hours', 'amenities', 'images', 'social_links']);

/**
 * zod's own flatten() only understands one level. Listing errors are two or
 * three deep (`listing.name`, `hours.3.opens_at`), so paths are folded down to
 * the name the <input> actually carries, and repeatable groups collapse onto
 * the group so one message can sit above the whole block.
 */
export function shapeListingErrors(error: z.ZodError<unknown>): ListingFieldErrors {
  const out: ListingFieldErrors = {};
  for (const issue of error.issues) {
    const path = issue.path.map(String);
    let key: string;
    if (path[0] === 'listing') {
      key = path[1] ?? '_form';
    } else if (path[0] && GROUPED_PATHS.has(path[0])) {
      key = path[0];
    } else {
      key = path[0] ?? '_form';
    }
    (out[key] ??= []).push(issue.message);
  }
  return out;
}

/* -------------------------------------------------------------------------- */
/* slug helper                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Client-side twin of SQL slugify() (0016). It is only a suggestion — the
 * database still runs unique_listing_slug() inside the write transaction, so a
 * disagreement here can never produce a duplicate.
 */
export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '');
}
