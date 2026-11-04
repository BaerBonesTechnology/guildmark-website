import type { PlatformFees } from "../lib/apiHooks";

/** Approved Free-tier estimate fallback. Live configuration always takes precedence. */
export const DEFAULT_CALCULATOR_SELLER_FEE = 0.14;

export function calculatorSellerFeeRate(fees: Pick<PlatformFees, "seller_fee_free"> | undefined): number {
  return fees?.seller_fee_free ?? DEFAULT_CALCULATOR_SELLER_FEE;
}
