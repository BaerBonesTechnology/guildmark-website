/** Approved monthly USD company plans. Live fee configuration takes precedence. */
export type PaidPlan = "starter" | "growth" | "pro";
export type PlanKey = "free" | PaidPlan;
export const PAID_PLANS: PaidPlan[] = ["starter", "growth", "pro"];
export const PLAN_CATALOG = {
  free: { label: "Free", price: 0, physicalDevices: 0, seats: 1, valuationCredits: 0, sellerFee: .14 },
  starter: { label: "Starter", price: 39, physicalDevices: 100, seats: 1, additionalSeatPrice: 8, valuationCredits: 200, sellerFee: .14 },
  growth: { label: "Growth", price: 99, physicalDevices: 500, seats: 1, additionalSeatPrice: 20, valuationCredits: 1000, sellerFee: .12 },
  pro: { label: "Pro", price: 199, physicalDevices: 2000, seats: 1, additionalSeatPrice: 40, valuationCredits: 4000, sellerFee: .10 },
} as const;
export function planFeatures(plan: PaidPlan): string[] {
  const p = PLAN_CATALOG[plan];
  return [
    `Up to ${p.physicalDevices.toLocaleString("en-US")} active physical devices`,
    "1 included owner seat",
    `Extra staff seats: $${p.additionalSeatPrice}/month each (not available to purchase yet)`,
    `${p.valuationCredits.toLocaleString("en-US")} fresh valuation credits / billing month`,
    "Inventory and CSV import / export",
    "Supported laptop valuations and per-asset history",
    "Guided assistant: up to 5 records per request",
    "Review-only listing previews",
    "Invoice drafts (prototype)",
    ...(plan !== "starter" ? ["Portfolio trend reports and batch workflows (planned)"] : []),
    ...(plan === "pro" ? ["Saved reports and integration onboarding (planned)"] : []),
  ];
}
