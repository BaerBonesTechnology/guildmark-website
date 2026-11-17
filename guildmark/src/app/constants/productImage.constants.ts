/** Product-image upload constraints. Must stay in sync with the API route and
 *  the `gm-product-images` bucket config (tool/appwrite_setup.dart). */

/** Largest accepted image, in bytes (10 MB — matches the bucket ceiling). */
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

/** MIME types the bucket accepts. */
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

/** `accept` attribute for the file picker. */
export const IMAGE_ACCEPT_ATTR = ACCEPTED_IMAGE_TYPES.join(",");

/** Most images a single listing may carry. */
export const MAX_IMAGES_PER_LISTING = 8;
