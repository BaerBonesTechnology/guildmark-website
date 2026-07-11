/** Centralised route paths — no hardcoded `/pre/...` strings scattered in Views. */
export const ROUTE = {
  marketplace: "/pre/marketplace",
  marketplaceListing: (listingIdent: string) => `/pre/marketplace/${listingIdent}`,
} as const;
