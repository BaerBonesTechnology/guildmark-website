/** GM Pro signup service — fee formatting and per-plan seller-fee copy. */
import type { PaidPlan } from "../components/SubscriptionCheckoutDialog";
import type { PlatformFees } from "../lib/apiHooks";

export function fmtFee(rate: number): string {
  return `${parseFloat((rate * 100).toFixed(2))}%`;
}

export function resolveValuePropBody(body: string | null, fees: PlatformFees | undefined): string {
  if (body) return body;
  return fees
    ? `Free-tier seller fees are ${fmtFee(fees.seller_fee_free)}. Starter drops to ${fmtFee(fees.seller_fee_starter)}, Growth to ${fmtFee(fees.seller_fee_growth)}, Pro to ${fmtFee(fees.seller_fee_pro)}. On a $50k equipment offload that difference is real money.`
    : "Paid plans carry lower seller fees than the free tier — the savings add up fast on large offloads.";
}

export function sellerFeeLabel(key: PaidPlan, fees: PlatformFees | undefined): string {
  if (!fees) return "—";
  const map: Record<PaidPlan, number> = { starter: fees.seller_fee_starter, growth: fees.seller_fee_growth, pro: fees.seller_fee_pro };
  return fmtFee(map[key]);
}
