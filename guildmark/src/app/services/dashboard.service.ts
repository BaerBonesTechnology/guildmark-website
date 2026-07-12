/** Fleet Dashboard business logic — pure functions (Service). */

/** Listed value as a percentage above/below market (FMV). Null when either
 *  side is zero (so the caller can hide the comparison). */
export function vsMarketPercent(listedValue: number, marketValue: number): number | null {
  if (marketValue <= 0 || listedValue <= 0) return null;
  return (listedValue / marketValue - 1) * 100;
}
