/** Fleet Dashboard business logic — pure functions (Service). */

/** Listed value as a percentage above/below market (FMV). Null when either
 *  side is zero (so the caller can hide the comparison). */
export function vsMarketPercent(listedValue: number, marketValue: number): number | null {
  if (!Number.isFinite(marketValue) || !Number.isFinite(listedValue) || marketValue <= 0 || listedValue <= 0) return null;
  return (listedValue / marketValue - 1) * 100;
}

/** Missing or invalid values must never appear as a successful zero. */
export function dashboardMoney(value: unknown): string {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? new Intl.NumberFormat("en-US", {style:"currency",currency:"USD",maximumFractionDigits:2}).format(value)
    : "Unavailable";
}
export function dashboardCount(value: unknown): string {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0 ? value.toLocaleString("en-US") : "Unavailable";
}
