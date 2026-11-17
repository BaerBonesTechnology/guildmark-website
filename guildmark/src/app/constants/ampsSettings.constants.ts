/** AMPS account Settings constants — plan tiers, ranks, notification rows. */

import { PAID_PLANS, PLAN_CATALOG } from "./planCatalog.ts";
export type { PlanKey } from "./planCatalog.ts";
import type { PlanKey } from "./planCatalog.ts";

export interface PlanTier {
  devices: string;
  key: PlanKey;
  label: string;
  price: number;
  users: string;
  additionalSeatPrice?: number;
}

export interface NotificationRow {
  desc: string;
  key: NotificationKey;
  label: string;
}

export type NotificationKey = "offerActivity" | "syncFailures" | "valuationAlerts";

export const BILLING_HEADERS = ["Date", "Plan", "Period", "Amount", "Status", ""];

export const PLAN_RANK: Record<PlanKey, number> = { free: 0, starter: 1, growth: 2, pro: 3 };

export const PLANS: PlanTier[] = [
  { key: "free", label: "Free", price: 0, devices: "Marketplace access; no AMPS", users: "Account owner" },
  ...PAID_PLANS.map((key) => ({ key, label: PLAN_CATALOG[key].label, price: PLAN_CATALOG[key].price, devices: `${PLAN_CATALOG[key].physicalDevices.toLocaleString("en-US")} active physical devices`, users: "1 included owner seat", additionalSeatPrice: PLAN_CATALOG[key].additionalSeatPrice })),
];

export const SETTINGS_NOTIFICATION_ROWS: NotificationRow[] = [
  { key: "syncFailures", label: "MDM Sync Failures", desc: "Get notified when device synchronisation encounters errors" },
  { key: "valuationAlerts", label: "Valuation Alerts", desc: "Alerts when assets approach value cliffs or market changes are detected" },
  { key: "offerActivity", label: "Marketplace Offer Activity", desc: "Updates when buyers make offers on your listed assets" },
];
