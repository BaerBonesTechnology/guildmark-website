import test from "node:test";
import assert from "node:assert/strict";
import {
  validListingPrice,
  validListingQuantity,
  listingHistoryPage,
  priceFlagHint,
  computeListingStats,
} from "../src/app/services/listing.service.ts";
test("prices accept whole cents only and reject overflow, partial parses and zero", () => {
  for (const value of ["0.01", "450", "450.50", "1000000", " 10.20 "])
    assert.equal(validListingPrice(value), true, value);
  for (const value of [
    "",
    "0",
    "-1",
    "NaN",
    "Infinity",
    "1e3",
    "1.234",
    "2junk",
    "1000000.01",
  ])
    assert.equal(validListingPrice(value), false, value);
});
test("quantities are positive bounded whole units", () => {
  for (const value of ["1", "12", "100000"])
    assert.equal(validListingQuantity(value), true);
  for (const value of ["0", "-1", "1.5", "Infinity", "1e2", "100001", "2junk"])
    assert.equal(validListingQuantity(value), false);
});
test("valuation hints distinguish missing and invalid inputs", () => {
  assert.equal(priceFlagHint(100, null), null);
  assert.equal(priceFlagHint(Infinity, 100), null);
  assert.equal(priceFlagHint(-1, 100), null);
  assert.match(priceFlagHint(130, 100), /Above/);
  assert.match(priceFlagHint(50, 100), /below/);
});
test("inventory asking value excludes sold and withdrawn stock", () => {
  const rows = ["active", "draft", "sold", "withdrawn"].map((status, i) => ({
    id: String(i),
    status,
    quantity: 2,
    listed_price: 100,
    valuation_flag: "seller_overpriced",
  }));
  assert.deepEqual(computeListingStats(rows), {
    activeCount: 1,
    flaggedCount: 2,
    totalValue: 400,
  });
});
test("history combines search and status, clamps pages, bounds rendered rows", () => {
  const rows = Array.from({ length: 19 }, (_, i) => ({
    id: String(i),
    model_name: "ThinkPad",
    status: i === 0 ? "draft" : "active",
  }));
  assert.equal(
    listingHistoryPage(rows, "think", "draft", null).filteredCount,
    1,
  );
  for (const raw of ["NaN", "-1", "Infinity", "1.5"])
    assert.equal(listingHistoryPage(rows, "", "all", raw).page, 1);
  assert.equal(listingHistoryPage(rows, "", "all", "999").pageItems.length, 3);
  assert.equal(listingHistoryPage(rows, "", "all", null).pageItems.length, 8);
});
