export interface CheckoutAttempt {
  key: string;
  quantity: number;
  submitted: boolean;
  expectedTotalCents?: number;
  source?: string; // Memory only; payment nonces never enter browser storage.
}

export function loadCheckout(storage: Pick<Storage, "getItem">, scope: string, quantity: number): CheckoutAttempt {
  const saved = storage.getItem(scope);
  if (saved) {
    try {
      const data = JSON.parse(saved);
      if (typeof data.key === "string" && Number.isInteger(data.quantity) && data.quantity > 0 && data.submitted === true) {
        return { key: data.key, quantity: data.quantity, submitted: true, expectedTotalCents: data.expectedTotalCents };
      }
    } catch { /* Ignore a damaged local record. */ }
  }
  return { key: crypto.randomUUID(), quantity, submitted: false };
}

export function saveCheckout(storage: Pick<Storage, "setItem">, scope: string, attempt: CheckoutAttempt): void {
  storage.setItem(scope, JSON.stringify({ key: attempt.key, quantity: attempt.quantity, submitted: attempt.submitted, expectedTotalCents: attempt.expectedTotalCents }));
}

export function canRestartCheckout(code: string): boolean {
  // Only responses that prove no payment remains unresolved permit a new key.
  return ["PAYMENT_DECLINED", "SOURCE_REQUIRED", "INSUFFICIENT_STOCK", "LISTING_UNAVAILABLE", "NO_PRICE", "SELF_PURCHASE", "AMOUNT_TOO_LARGE", "PRICE_CHANGED"].includes(code);
}
