/** Product-image upload business logic — pure functions (Service). */
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_IMAGE_BYTES,
} from "../constants/productImage.constants";

/** Human-readable megabyte ceiling, for error copy. */
const MAX_IMAGE_MB = Math.round(MAX_IMAGE_BYTES / (1024 * 1024));

/**
 * Validate a candidate file against the bucket's constraints. Returns an error
 * message when the file is unacceptable, or `null` when it may be uploaded.
 */
export function validateImageFile(file: File): string | null {
  if (!(ACCEPTED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    return "Unsupported file type — use JPEG, PNG, WebP, or GIF";
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return `Image is too large — max ${MAX_IMAGE_MB} MB`;
  }
  return null;
}

/** Whether at least one of the dropped items looks like an image file. */
export function hasImageFiles(fileList: FileList | File[]): boolean {
  return Array.from(fileList).some((file) => file.type.startsWith("image/"));
}
