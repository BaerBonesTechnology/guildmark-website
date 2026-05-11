/// ---------------------------------------------------------------------------
/// Feature flags — driven by Vite environment variables.
///
/// Set these in .env.local for development, never commit real values.
/// In production, inject via Docker / CI environment.
/// ---------------------------------------------------------------------------

/** Platform is live and accepting sign-ups. When false, the pre-launch page
 *  is shown for all routes. Set VITE_IS_LAUNCH=true to open the platform. */
export const isLaunch: boolean = import.meta.env.VITE_IS_LAUNCH === 'false';

/** Debug mode — enables verbose logging, dev tooling, and mock data helpers.
 *  Never set to true in production. */
export const isDebug: boolean = import.meta.env.VITE_IS_DEBUG === 'false';  // Default to true for safety during development

/** Base URL for the AstechServer API. */
export const apiUrl: string = import.meta.env.VITE_API_URL ?? 'http://localhost:8443';

// ── Square Web Payments SDK (frontend-only, public identifiers) ───────────────
//
// These are NOT secrets — they are public identifiers used only to initialise
// the Square Web Payments SDK in the browser so it can tokenise card details
// into a one-time-use nonce (cnon:...). The nonce is then sent to our API which
// calls Square with SQUARE_ACCESS_TOKEN (backend-only, never sent to browser).
//
// In Doppler, set the VITE_ prefixed copies to the same values as the
// corresponding backend vars:
//   VITE_SQUARE_APPLICATION_ID = SQUARE_APPLICATION_ID  (Square Dashboard → Apps)
//   VITE_SQUARE_LOCATION_ID    = SQUARE_LOCATION_ID     (Square Dashboard → Locations)
//   VITE_SQUARE_ENVIRONMENT    = SQUARE_ENVIRONMENT     ("sandbox" or "production")

export const squareApplicationId: string =
  import.meta.env.VITE_SQUARE_APPLICATION_ID ?? 'sandbox-sq0idb-PLACEHOLDER';

export const squareLocationId: string =
  import.meta.env.VITE_SQUARE_LOCATION_ID ?? '';

export const squareEnvironment: string =
  import.meta.env.VITE_SQUARE_ENVIRONMENT ?? 'sandbox';