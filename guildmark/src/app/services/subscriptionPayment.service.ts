export interface SubscriptionPaymentResult {
  status: string; granted: boolean; code?: string; message?: string;
  subscription?: { plan: string; status: string; currentPeriodStart?: string | null; currentPeriodEnd?: string | null };
  invoice?: { plan: string; amount_cents: number; status: string };
}
export function subscriptionPaymentOutcome(result: SubscriptionPaymentResult, plan: string, cents: number): "pending" | "success" {
  if (result.granted !== true) return "pending";
  if (result.status !== "paid" || result.subscription?.plan !== plan || result.subscription.status !== "active" || result.invoice?.plan !== plan || result.invoice.status !== "paid" || result.invoice.amount_cents !== cents) throw new Error("Payment confirmation did not match this plan. Check billing before attempting another payment.");
  return "success";
}
export function loadSubscriptionPayment(storage: Pick<Storage, "getItem">, scope: string): { key: string; submitted: boolean } {
  const saved = storage.getItem(scope);
  if (saved) {
    const value = JSON.parse(saved);
    if (!/^[a-zA-Z0-9_-]{16,64}$/.test(value.key) || value.submitted !== true) throw new Error("Stored payment recovery details are invalid. Check billing before attempting a new payment.");
    return { key: value.key, submitted: true };
  }
  return { key: crypto.randomUUID(), submitted: false };
}
/** Backend guarantees these responses occurred before charge, or a failed intent is terminal. */
export function subscriptionCanRestart(error: unknown): boolean {
  const code = (error as { code?: string })?.code;
  return ["SUBSCRIPTION_RECONCILIATION_REQUIRED", "SUBSCRIPTION_CATALOG_MISMATCH", "PRICE_CHANGED", "SUBSCRIPTION_ACTIVE", "FORBIDDEN", "VALIDATION", "BAD_REQUEST", "SQUARE_NOT_CONFIGURED", "DB_UNAVAILABLE", "PAYMENT_FAILED"].includes(code ?? "");
}
