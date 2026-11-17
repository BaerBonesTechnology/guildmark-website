/** Account Settings constants — notification rows shown in preferences. */

export interface NotificationRow {
  description: string;
  key: NotificationKey;
  label: string;
}

export type NotificationKey =
  | "marketDigest"
  | "offerActivity"
  | "orderUpdates"
  | "priceAlerts"
  | "securityAlerts";

export const NOTIFICATION_ROWS: NotificationRow[] = [
  { key: "orderUpdates", label: "Order Updates", description: "Status changes for your active purchases and sales." },
  { key: "offerActivity", label: "Offer Activity", description: "New offers received or accepted on your listings." },
  { key: "priceAlerts", label: "Price Alerts", description: "Notify me when market prices shift by 10%+ for my assets." },
  { key: "securityAlerts", label: "Security Alerts", description: "Login from a new device or suspicious activity detected." },
  { key: "marketDigest", label: "Weekly Market Digest", description: "A weekly summary of GuildMark marketplace trends." },
];
