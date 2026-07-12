/** AMPS Settings service — fee/date/amount formatting for billing + plans. */
import type { PlanKey } from "../constants/ampsSettings.constants";
import type { PlatformFees } from "../lib/apiHooks";

export function fmtAmount(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export function fmtFee(rate: number): string {
  return `${parseFloat((rate * 100).toFixed(2))}%`;
}

export function sellerFeeLabel(key: PlanKey, fees: PlatformFees | undefined): string {
  if (!fees) return "—";
  const map: Record<PlanKey, number> = {
    free: fees.seller_fee_free, starter: fees.seller_fee_starter, growth: fees.seller_fee_growth, pro: fees.seller_fee_pro,
  };
  return fmtFee(map[key]);
}
