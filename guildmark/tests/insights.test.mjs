import { test } from "node:test";
import assert from "node:assert/strict";
import {
  normalizeFleetValue,
  computeStockpileMetrics,
  formatCurrency,
} from "../src/app/services/insights.service.ts";
test("fleet input stays within slider bounds and step", () => {
  assert.equal(normalizeFleetValue(-1), 50000);
  assert.equal(normalizeFleetValue(9000000), 2000000);
  assert.equal(normalizeFleetValue(505001), 510000);
  assert.equal(normalizeFleetValue(NaN), 500000);
});
test("cost periods use the disclosed fixed scenario", () => {
  const m = computeStockpileMetrics(500000, 0);
  assert.equal(m.carryingCost, 105000);
  assert.equal(m.accumulated, 0);
  assert.equal(m.costPerDay, 105000 / 365);
  assert.equal(m.costPerHour, 105000 / 365 / 24);
});
test("invalid values cannot poison scenario calculations", () => {
  const m = computeStockpileMetrics(Infinity, NaN);
  assert.equal(m.carryingCost, 105000);
  assert.equal(m.accumulated, 0);
  assert.equal(formatCurrency(m.carryingCost), "$105,000");
});
