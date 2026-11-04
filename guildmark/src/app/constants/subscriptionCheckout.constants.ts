/** Subscription checkout constants — paid plan tiers + display metadata. */

import { PAID_PLANS, PLAN_CATALOG } from "./planCatalog.ts";
export type { PaidPlan } from "./planCatalog.ts";
import type { PaidPlan } from "./planCatalog.ts";

export interface PlanMeta {
  color: string;
  devices: string;
  label: string;
  price: number;
  teamMembers: string;
  valuationCredits: number;
}

export const PLAN_META = Object.fromEntries(PAID_PLANS.map((key) => {
  const p = PLAN_CATALOG[key];
  return [key, { label: p.label, price: p.price, devices: `Up to ${p.physicalDevices.toLocaleString("en-US")} active physical devices`, teamMembers: "1 included owner seat", valuationCredits: p.valuationCredits, color: "text-amps-accent" }];
})) as Record<PaidPlan, PlanMeta>;
