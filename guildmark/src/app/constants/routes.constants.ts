/** Centralised route paths — no hardcoded `/pre/...` strings scattered in Views. */
export const ROUTE = {
  dashboard: "/pre/dashboard",
  forgotPassword: "/pre/forgot-password",
  login: "/pre/login",
  marketplace: "/pre/marketplace",
  marketplaceListing: (listingIdent: string) => `/pre/marketplace/${listingIdent}`,
  signup: "/pre/signup",
} as const;
