/// ---------------------------------------------------------------------------
/// Feature flags — driven by Vite environment variables.
///
/// Set these in .env.local for development, never commit real values.
/// In production, inject via Docker / CI environment.
/// ---------------------------------------------------------------------------

/** Platform is live and accepting sign-ups. When false, the pre-launch page
 *  is shown for all routes. Set VITE_IS_LAUNCH=true to open the platform. */
export const isLaunch: boolean = import.meta.env.VITE_IS_LAUNCH == false;

/** Debug mode — enables verbose logging, dev tooling, and mock data helpers.
 *  Never set to true in production. */
export const isDebug: boolean = import.meta.env.VITE_IS_DEBUG == false;

/** Base URL for the AstechServer API. */
export const apiUrl: string = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';
