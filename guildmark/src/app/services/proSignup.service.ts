/** GM Pro signup service — fee formatting and per-plan seller-fee copy. */
import type { PaidPlan } from "../components/SubscriptionCheckoutDialog";
import type { PlatformFees } from "../lib/apiHooks";
import { PLAN_CATALOG } from "../constants/planCatalog.ts";

export function fmtFee(rate: number): string {
  return `${parseFloat((rate * 100).toFixed(2))}%`;
}

export function resolveValuePropBody(body: string | null, fees: PlatformFees | undefined): string {
  if (body) return body;
  return fees
    ? `Marketplace seller fees: Free ${fmtFee(fees.seller_fee_free)}, Starter ${fmtFee(fees.seller_fee_starter)}, Growth ${fmtFee(fees.seller_fee_growth)}, Pro ${fmtFee(fees.seller_fee_pro)}. Starter adds AMPS access; Growth and Pro also reduce seller fees.`
    : "Free and Starter have a 14% seller fee; Growth 12% and Pro 10%. Starter adds AMPS access.";
}

export function sellerFeeLabel(key: PaidPlan, fees: PlatformFees | undefined): string {
  if (!fees) return fmtFee(PLAN_CATALOG[key].sellerFee);
  const map: Record<PaidPlan, number> = { starter: fees.seller_fee_starter, growth: fees.seller_fee_growth, pro: fees.seller_fee_pro };
  return fmtFee(map[key]);
}
