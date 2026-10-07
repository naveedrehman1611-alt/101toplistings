/**
 * Size rules for listing logos and photos, shared by the browser (which shrinks
 * a picked file before the form posts it) and the server (which enforces the
 * same caps whatever the browser did). No imports, so both sides can use it.
 *
 * Why these numbers:
 * - The new-listing form posts the business details, a logo and up to three
 *   photos in ONE Server Action request, and Vercel refuses a request body over
 *   4.5 MB. Four files at 1 MB each plus the text fields stays under it.
 * - A logo is never shown larger than a few hundred pixels, and a photo never
 *   wider than the 1600px the listing hero and lightbox need, so anything
 *   bigger is bytes stored, and fetched by the image optimiser, for nothing.
 * - Files are re-encoded in the browser at fixed sizes and qualities, so the
 *   same picture always comes out the same size.
 */

/** Hard per-file cap for listing images on the new-listing form. */
export const LISTING_IMAGE_MAX_BYTES = 1024 * 1024;

/** Longest edge, in pixels, a logo is scaled down to. */
export const LOGO_MAX_EDGE = 512;

/** Longest edge, in pixels, a listing photo is scaled down to. */
export const PHOTO_MAX_EDGE = 1600;

/** Photos accepted on the new-listing form; the first also becomes the cover. */
export const NEW_LISTING_PHOTOS = 3;

/** Gallery size an owner may keep from the dashboard. */
export const OWNER_MAX_GALLERY = 3;

/** Gallery size staff may build from the admin: room for a good gallery, not a full bucket. */
export const STAFF_MAX_GALLERY = 20;

/** Form field names on the new-listing form. */
export const LOGO_FIELD = 'logo';
export const PHOTO_FIELDS = Array.from({ length: NEW_LISTING_PHOTOS }, (_, i) => `photo_${i + 1}`);
