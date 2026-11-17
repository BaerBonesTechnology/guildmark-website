import { isLaunch } from "../config";
const base = isLaunch ? "" : "/pre";
/** Centralised route paths — no hardcoded `/pre/...` strings scattered in Views. */
export const ROUTE = {
  marketplace: `${base}/marketplace`,
  marketplaceListing: (listingIdent: string) => `${base}/marketplace/${listingIdent}`,
} as const;
