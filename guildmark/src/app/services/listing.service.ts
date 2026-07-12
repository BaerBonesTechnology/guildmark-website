/** Listing business logic — pure functions (Service). */
import { GRADE_COLOR, LISTING_FLAG_COLOR } from "../constants/listing.constants";
import type { Listing } from "../models/listing";

interface ListingStats {
  activeCount: number;
  flaggedCount: number;
  totalValue: number;
}

/** Aggregate figures for the My Listings stat strip. */
export function computeListingStats(listings: Listing[]): ListingStats {
  const activeCount = listings.filter((listing) => listing.status === "active").length;
  const flaggedCount = listings.filter((listing) => listing.valuation_flag === "seller_overpriced").length;
  const totalValue = listings.reduce((total, listing) => total + (listing.listed_price ?? 0) * (listing.quantity ?? 1), 0);
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
export function priceFlagHint(price: number, fmv: number | undefined): string | null {
  if (!fmv || fmv <= 0 || isNaN(price)) return null;
  const ratio = price / fmv;
  if (ratio >= 1.20) return "⚠ Above FMV — may be flagged as overpriced";
  if (ratio <= 0.60) return "⚠ Well below FMV — may be flagged as distressed";
  return "✓ Within fair market range";
}
