import type { AuthUser } from "../hooks/useAuth";
import type { SubscriptionData } from "../lib/apiHooks";

export function accountLabel(value: string | null | undefined): string {
  return typeof value === "string" && value.trim()
    ? value.trim()
    : "Not available";
}
export function planLabel(value: string | null | undefined): string {
  const labels: Record<string, string> = {
    free: "Free",
    starter: "Starter",
    growth: "Growth",
    pro: "Pro",
  };
  return value ? (labels[value] ?? "Unrecognized plan") : "Not available";
}
export function subscriptionStatusLabel(
  value: string | null | undefined,
): string {
  const labels: Record<string, string> = {
    active: "Active",
    cancelled: "Cancelled",
    past_due: "Past due",
    trialing: "Trial",
    incomplete: "Incomplete",
    unpaid: "Unpaid",
    canceled: "Cancelled",
  };
  return value ? (labels[value] ?? "Status unavailable") : "Status unavailable";
}
export function validResetEmail(value: string | null | undefined): boolean {
  return (
    typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
  );
}
/** Explicit allowlist: never serialize the auth context or an arbitrary API response. */
export function buildAccountSummary(
  user: AuthUser,
  subscription: SubscriptionData | null,
  now = new Date(),
) {
  return {
    schema_version: 1,
    generated_at: now.toISOString(),
    scope:
      "Account identity and available subscription record; excludes orders, listings, messages, and security configuration.",
    account: {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      workspace_role: user.role,
      company_id: user.company_id,
      company_name: user.company,
    },
    subscription: subscription
      ? {
          plan: subscription.plan,
          status: subscription.status,
          period_start: subscription.currentPeriodStart ?? null,
          period_end: subscription.currentPeriodEnd ?? null,
        }
      : null,
  };
}
