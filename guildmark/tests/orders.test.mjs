import test from "node:test";
import assert from "node:assert/strict";
import {
  ordersPage,
  canReviewDelivery,
  lifecycleStepIndex,
  orderLifecycleConfig,
  orderMoney,
  orderPaymentLink,
  mergeOrderLifecycle,
  formatDateTime,
} from "../src/app/services/order.service.ts";
const order = (patch = {}) => ({
  id: "a",
  type: "purchase",
  orderStatus: "delivered",
  productName: "ThinkPad",
  transactionId: "GM-1",
  counterparty: "Example seller",
  trackingNumber: "TRACK-123",
  totalValue: 123.45,
  ...patch,
});
test("delivery actions are exclusive to buyers in the inspection states", () => {
  for (const status of ["delivered", "inspecting"])
    assert.equal(canReviewDelivery(order({ orderStatus: status })), true);
  for (const status of [
    "funded",
    "shipped",
    "awaiting_payment",
    "complete",
    "cancelled",
    "disputed",
  ])
    assert.equal(canReviewDelivery(order({ orderStatus: status })), false);
  assert.equal(canReviewDelivery(order({ type: "sale" })), false);
  assert.equal(canReviewDelivery(null), false);
});
test("inspection is a real timeline step and delivery keeps its own status label", () => {
  assert.ok(lifecycleStepIndex("inspecting") > lifecycleStepIndex("delivered"));
  assert.ok(lifecycleStepIndex("complete") > lifecycleStepIndex("inspecting"));
  assert.equal(lifecycleStepIndex("cancelled"), -1);
  assert.equal(lifecycleStepIndex("disputed"), -1);
  assert.equal(orderLifecycleConfig("delivered").label, "Delivered");
});
test("history combines direction, lifecycle and search with bounded safe pages", () => {
  const rows = Array.from({ length: 19 }, (_, i) =>
    order({ id: String(i), type: i === 0 ? "sale" : "purchase" }),
  );
  assert.equal(
    ordersPage(rows, "sales", "delivered", "track-123", null).filteredCount,
    1,
  );
  assert.equal(
    ordersPage(rows, "purchases", "funded", "", null).filteredCount,
    0,
  );
  for (const raw of ["NaN", "Infinity", "-1", "0", "1.2"])
    assert.equal(ordersPage(rows, "all", "all", "", raw).page, 1);
  assert.equal(ordersPage(rows, "all", "all", "", "999").pageItems.length, 3);
  assert.equal(ordersPage(rows, "all", "all", "", null).pageItems.length, 8);
});
test("payment links require buyer, awaiting payment and safe HTTPS", () => {
  const base = order({
    orderStatus: "awaiting_payment",
    escrowPaymentUrl: "https://payments.example.test/fund",
  });
  assert.equal(orderPaymentLink(base), "https://payments.example.test/fund");
  for (const url of [
    "javascript:alert(1)",
    "http://example.test",
    "https://user:pass@example.test",
    "invalid",
  ])
    assert.equal(orderPaymentLink({ ...base, escrowPaymentUrl: url }), null);
  assert.equal(orderPaymentLink({ ...base, type: "sale" }), null);
  assert.equal(orderPaymentLink({ ...base, orderStatus: "funded" }), null);
});
test("mutation lifecycle merge preserves buyer viewpoint, counterparty and amounts", () => {
  const current = order({ counterparty: "Real seller", totalValue: 123.45 });
  const next = mergeOrderLifecycle(
    current,
    order({
      type: "sale",
      counterparty: "Wrong viewer",
      orderStatus: "complete",
      totalValue: 999,
    }),
  );
  assert.equal(next.type, "purchase");
  assert.equal(next.counterparty, "Real seller");
  assert.equal(next.totalValue, 123.45);
  assert.equal(next.orderStatus, "complete");
  assert.equal(mergeOrderLifecycle(current, order({ id: "wrong" })), current);
});
test("missing fees and dates stay distinct from zero", () => {
  assert.equal(orderMoney(undefined), "Unavailable");
  assert.equal(orderMoney(null), "Unavailable");
  assert.equal(orderMoney(NaN), "Unavailable");
  assert.equal(orderMoney(0), "$0.00");
  assert.equal(orderMoney(123.45), "$123.45");
  assert.equal(formatDateTime("invalid"), "—");
});
