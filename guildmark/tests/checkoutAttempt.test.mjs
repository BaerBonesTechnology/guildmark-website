import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCheckout, saveCheckout, canRestartCheckout } from '../src/app/services/checkoutAttempt.ts';

test('reload retains original checkout key and quantity without storing nonce', () => {
  const map = new Map();
  const storage = { getItem: key => map.get(key) ?? null, setItem: (key, value) => map.set(key, value) };
  const attempt = loadCheckout(storage, 'buyer:listing', 2);
  attempt.source = 'private-payment-nonce'; attempt.submitted = true;
  attempt.expectedTotalCents = 20602;
  saveCheckout(storage, 'buyer:listing', attempt);
  assert.equal(map.get('buyer:listing').includes('private-payment-nonce'), false);
  const restored = loadCheckout(storage, 'buyer:listing', 1);
  assert.equal(restored.key, attempt.key);
  assert.equal(restored.quantity, 2);
  assert.equal(restored.expectedTotalCents, 20602);
  assert.equal(restored.source, undefined);
  assert.notEqual(loadCheckout(storage, 'different-buyer:listing', 2).key, attempt.key);
});

test('only definitive outcomes allow another charge key', () => {
  for (const code of ['PAYMENT_PENDING', 'CHECKOUT_RETRY', 'API_ERROR', 'TOKEN_EXPIRED', 'CHECKOUT_PENDING', 'IDEMPOTENCY_CONFLICT']) {
    assert.equal(canRestartCheckout(code), false);
  }
  for (const code of ['PAYMENT_DECLINED', 'SOURCE_REQUIRED', 'INSUFFICIENT_STOCK']) assert.equal(canRestartCheckout(code), true);
});
