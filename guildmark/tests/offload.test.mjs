import test from "node:test";
import assert from "node:assert/strict";
import {
  buildSteps,
  sellerOrders,
  historyPage,
} from "../src/app/services/offload.service.ts";
const order = (id, status = "funded", type = "sale") => ({
  id,
  type,
  orderStatus: status,
  transactionId: `SALE-${id}`,
  productName: "ThinkPad",
  counterparty: "Example buyer",
  trackingNumber: null,
});
test("offload excludes purchases from sales and their totals", () => {
  assert.deepEqual(
    sellerOrders([order("a"), order("b", "funded", "purchase")]).map(
      (o) => o.id,
    ),
    ["a"],
  );
});
test("carrier scans cannot imply data erasure, inspection or settlement", () => {
  const steps = buildSteps(order("a", "shipped"), { status_code: "DL" });
  assert.equal(steps.find((s) => s.id === "delivered").status, "active");
  assert.equal(steps.find((s) => s.id === "inspection").status, "pending");
  assert.equal(steps.find((s) => s.id === "complete").status, "pending");
  assert.equal(
    steps.some((s) => /wipe|payment sent/i.test(s.label)),
    false,
  );
});
test("cancelled and disputed orders never invent progress", () => {
  for (const status of ["cancelled", "disputed"])
    assert.ok(
      buildSteps(order("a", status)).every((s) => s.status === "pending"),
    );
  assert.ok(
    buildSteps(order("a", "complete")).every((s) => s.status === "complete"),
  );
});
test("history clamps malformed and out of range pages and bounds rendered rows", () => {
  const orders = Array.from({ length: 19 }, (_, i) => order(String(i)));
  for (const raw of ["NaN", "Infinity", "-1", "1.2", "0"])
    assert.equal(historyPage(orders, "", "all", raw).page, 1);
  const last = historyPage(orders, "", "all", "999");
  assert.equal(last.page, 3);
  assert.equal(last.pageItems.length, 3);
  assert.equal(historyPage(orders, "", "all", null).pageItems.length, 8);
});
test("history combines status with case insensitive order, buyer and tracking search", () => {
  const orders = [
    order("a"),
    { ...order("b", "shipped"), trackingNumber: "TRACK-123" },
  ];
  assert.equal(
    historyPage(orders, "example BUYER", "funded", null).filteredCount,
    1,
  );
  assert.equal(
    historyPage(orders, "track-123", "shipped", null).pageItems[0].id,
    "b",
  );
  assert.equal(historyPage(orders, "missing", "all", null).filteredCount, 0);
});
