/** Compare drawer service — pricing, demand, grouping, and cell formatting. */
import { categoryOf } from "../components/CompareContext";
import { COMPARE_CONDITION_LABEL, type RowKey } from "../constants/compare.constants";
import type { MarketplaceListing } from "../models/marketplace";

export function priceOf(listing: MarketplaceListing): number {
  return listing.listed_price ?? listing.buyer_ask_price ?? 0;
}

export function daysAgo(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

export function demandOf(listing: MarketplaceListing): number {
  const boost = daysAgo(listing.created_at) <= 3 ? 1 : 0;
  const base: Record<string, number> = { distressed: 4, standard: 3, insufficient_data: 2, seller_overpriced: 1 };
  return Math.min(5, Math.max(1, (base[listing.valuation_flag] ?? 2) + boost));
}

export function groupByCategory(listings: MarketplaceListing[]): Record<string, MarketplaceListing[]> {
  return listings.reduce<Record<string, MarketplaceListing[]>>((acc, listing) => {
    const cat = categoryOf(listing);
    (acc[cat] ??= []).push(listing);
    return acc;
  }, {});
}

export function cellValue(listing: MarketplaceListing, key: RowKey): string {
  switch (key) {
    case "price": return priceOf(listing) > 0 ? `$${priceOf(listing).toLocaleString()}` : "—";
    case "condition": return listing.condition_grade ? COMPARE_CONDITION_LABEL[listing.condition_grade] : "—";
    case "demand": return `${demandOf(listing)}/5`;
    case "seller": return listing.seller_name ?? "B2B Seller";
    case "ram": return listing.ram_gb != null ? `${listing.ram_gb} GB` : "—";
    case "storage": return listing.storage_gb != null ? `${listing.storage_gb} GB` : "—";
    case "cpu": return listing.cpu_score != null ? `${listing.cpu_score}` : "—";
    case "qty": return `×${listing.quantity ?? 1}`;
  }
}
