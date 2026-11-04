/** Listing business logic — pure functions (Service). */
import {
  GRADE_COLOR,
  LISTING_FLAG_COLOR,
} from "../constants/listing.constants";
import type { Listing } from "../models/listing";

interface ListingStats {
  activeCount: number;
  flaggedCount: number;
  totalValue: number;
}

/** Aggregate figures for the My Listings stat strip. */
export function computeListingStats(listings: Listing[]): ListingStats {
  const activeCount = listings.filter(
    (listing) => listing.status === "active",
  ).length;
  const inventory = listings.filter((listing) =>
    ["draft", "active"].includes(listing.status),
  );
  const flaggedCount = inventory.filter(
    (listing) => listing.valuation_flag === "seller_overpriced",
  ).length;
  const totalValue = inventory.reduce(
    (total, listing) =>
      total + (listing.listed_price ?? 0) * (listing.quantity ?? 1),
    0,
  );
  return { activeCount, flaggedCount, totalValue };
}

/** Token colour for a condition grade. */
export function gradeColor(grade: string): string {
  return GRADE_COLOR[grade] ?? "var(--foreground)";
}

/** Token colour for a valuation flag (used to tint the listed price). */
export function listingFlagColor(flag: string | undefined): string {
  return LISTING_FLAG_COLOR[flag ?? ""] ?? "var(--foreground)";
}

/** Extended (gross) value of a listing: price × quantity. */
export function listingTotalValue(listing: Listing): number {
  return (listing.listed_price ?? 0) * (listing.quantity ?? 1);
}

/**
 * Price-vs-FMV hint shown while editing a listing price. Returns null when
 * there's no valid FMV or price to compare.
 */
export function priceFlagHint(
  price: number,
  fmv: number | null | undefined,
): string | null {
  if (
    !fmv ||
    !Number.isFinite(fmv) ||
    fmv <= 0 ||
    !Number.isFinite(price) ||
    price <= 0
  )
    return null;
  const ratio = price / fmv;
  if (ratio >= 1.2) return "⚠ Above FMV — may be flagged as overpriced";
  if (ratio <= 0.6) return "⚠ Well below FMV — may be flagged as distressed";
  return "✓ Within fair market range";
}

/** Currency inputs must be finite, positive, and represent whole cents. */
export function validListingPrice(value: string): boolean {
  return (
    /^\d+(\.\d{1,2})?$/.test(value.trim()) &&
    Number(value) > 0 &&
    Number(value) <= 1_000_000
  );
}
export function validListingQuantity(value: string): boolean {
  return (
    /^\d+$/.test(value.trim()) &&
    Number.isSafeInteger(Number(value)) &&
    Number(value) > 0 &&
    Number(value) <= 100_000
  );
}
export function listingHistoryPage(
  listings: Listing[],
  search: string,
  status: string,
  rawPage: string | null,
) {
  const term = search.trim().toLocaleLowerCase();
  const filtered = listings.filter(
    (listing) =>
      (status === "all" || listing.status === status) &&
      [listing.model_name, listing.asset_type, listing.id].some((value) =>
        value?.toLocaleLowerCase().includes(term),
      ),
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / 8));
  const parsed = Number(rawPage);
  const page =
    Number.isSafeInteger(parsed) && parsed > 0
      ? Math.min(parsed, totalPages)
      : 1;
  return {
    page,
    totalPages,
    filteredCount: filtered.length,
    pageItems: filtered.slice((page - 1) * 8, page * 8),
  };
}
