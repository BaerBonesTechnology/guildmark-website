/** Marketplace business logic — pure functions (Service). */
import { Package } from "lucide-react";
import { CATEGORY_ICON } from "../constants/marketplace.constants";
import type { MarketplaceSort } from "../constants/marketplace.constants";
import type { MarketplaceListing } from "../models/marketplace";

const DEMAND_BASE: Record<string, number> = {
  distressed: 4, standard: 3, insufficient_data: 2, seller_overpriced: 1,
};

/** Whole days elapsed since an ISO timestamp. */
export function daysAgo(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

/** Compact relative-age label, e.g. "today", "1d ago", "5d ago". */
export function ageLabel(iso: string): string {
  const days = daysAgo(iso);
  return days <= 0 ? "today" : days === 1 ? "1d ago" : `${days}d ago`;
}

/** Short spec chips (RAM / storage / CPU / type) for a listing card. */
export function buildSpecs(listing: MarketplaceListing): string[] {
  const specs: string[] = [];
  if (listing.ram_gb) specs.push(`${listing.ram_gb} GB RAM`);
  if (listing.storage_gb) specs.push(`${listing.storage_gb} GB SSD`);
  if (listing.cpu_score) specs.push(`CPU ${listing.cpu_score}`);
  if (listing.asset_type) specs.push(listing.asset_type);
  return specs;
}

/** Icon component for a listing's category (Package fallback). */
export function categoryIcon(assetType: string | null | undefined): React.ElementType {
  return CATEGORY_ICON[assetType ?? ""] ?? Package;
}

/** Synthetic demand signal (1–5) from valuation flag + recency. */
export function demandSignal(listing: MarketplaceListing): 1 | 2 | 3 | 4 | 5 {
  const newBoost = daysAgo(listing.created_at) <= 3 ? 1 : 0;
  return Math.min(5, Math.max(1, (DEMAND_BASE[listing.valuation_flag] ?? 2) + newBoost)) as 1 | 2 | 3 | 4 | 5;
}

/** Listings posted within the last three days. */
export function isNewListing(listing: MarketplaceListing): boolean {
  return daysAgo(listing.created_at) <= 3;
}

/** Effective unit price (listed, else buyer ask, else 0). */
export function listingPrice(listing: MarketplaceListing): number {
  return listing.listed_price ?? listing.buyer_ask_price ?? 0;
}

interface FilterOptions {
  categories: Set<string>;
  grades: Set<string>;
  sortBy: MarketplaceSort;
}

/** Apply the multi-select category/grade filters, then sort. */
export function filterAndSortListings(listings: MarketplaceListing[], options: FilterOptions): MarketplaceListing[] {
  const { categories, grades, sortBy } = options;
  const matches = listings.filter((listing) => {
    const categoryOk = categories.size === 0 || (listing.asset_type != null && categories.has(listing.asset_type));
    const gradeOk = grades.size === 0 || (listing.condition_grade != null && grades.has(listing.condition_grade));
    return categoryOk && gradeOk;
  });
  return [...matches].sort((left, right) => {
    const leftPrice = listingPrice(left);
    const rightPrice = listingPrice(right);
    if (sortBy === "price-low") return leftPrice - rightPrice;
    if (sortBy === "price-high") return rightPrice - leftPrice;
    if (sortBy === "demand") return demandSignal(right) - demandSignal(left);
    return 0; // newest — backend already returns created_at DESC
  });
}

/** Return a new Set with `value` toggled in/out. */
export function toggleSetValue(set: Set<string>, value: string): Set<string> {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}
