/** Subscription checkout constants — paid plan tiers + display metadata. */

export type PaidPlan = "growth" | "pro" | "starter";

export interface PlanMeta {
  color: string;
  devices: string;
  label: string;
  price: number;
  sellerFee: string;
  teamMembers: string;
}

export const PLAN_META: Record<PaidPlan, PlanMeta> = {
  starter: { label: "Starter", price: 49, sellerFee: "6%", devices: "Up to 100 devices", teamMembers: "2 team members", color: "text-blue-500" },
  growth: { label: "Growth", price: 149, sellerFee: "5%", devices: "Up to 500 devices", teamMembers: "5 team members", color: "text-violet-500" },
  pro: { label: "Pro", price: 349, sellerFee: "3%", devices: "Unlimited devices", teamMembers: "Unlimited team members", color: "text-amber-500" },
};
