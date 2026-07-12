/** AMPS account Settings constants — plan tiers, ranks, notification rows. */

export type PlanKey = "free" | "growth" | "pro" | "starter";

export interface PlanTier {
  devices: string;
  key: PlanKey;
  label: string;
  price: number;
  users: string;
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
  { key: "free", label: "Free", price: 0, devices: "Up to 10 devices", users: "1 user" },
  { key: "starter", label: "Starter", price: 49, devices: "Up to 100 devices", users: "2 team members" },
  { key: "growth", label: "Growth", price: 149, devices: "Up to 500 devices", users: "5 team members" },
  { key: "pro", label: "Pro", price: 349, devices: "Unlimited devices", users: "Unlimited users" },
];

export const SETTINGS_NOTIFICATION_ROWS: NotificationRow[] = [
  { key: "syncFailures", label: "MDM Sync Failures", desc: "Get notified when device synchronisation encounters errors" },
  { key: "valuationAlerts", label: "Valuation Alerts", desc: "Alerts when assets approach value cliffs or market changes are detected" },
  { key: "offerActivity", label: "Marketplace Offer Activity", desc: "Updates when buyers make offers on your listed assets" },
];
