import test from "node:test";
import assert from "node:assert/strict";
import {
  effectiveOfferStatus,
  hasLiveOfferTerms,
  isOfferActionable,
  canCreateOfferOrder,
  offerSubtotal,
  offersPage,
  validateOfferTerms,
  pendingOfferCount,
  priceDeltaPercent,
  offerMoney,
} from "../src/app/services/offer.service.ts";
const now = Date.parse("2026-11-03T15:00:00Z");
const offer = (patch = {}) => ({
  id: "a",
  listing_id: "hardware",
  offer_price: 400.25,
  quantity: 3,
  status: "pending",
  expires_at: "2026-11-04T15:00:00Z",
  model_name: "ThinkPad",
  buyer_name: "Example buyer",
  ...patch,
});
test("expiry gates pending responses and accepted order preparation", () => {
  const expired = offer({ expires_at: "2026-11-03T14:59:59Z" });
  assert.equal(effectiveOfferStatus(expired, now), "expired");
  assert.equal(isOfferActionable(expired, "received", now), false);
  assert.equal(
    canCreateOfferOrder({ ...expired, status: "accepted" }, "received", now),
    false,
  );
  assert.equal(pendingOfferCount([offer(), expired], now), 1);
  assert.equal(
    isOfferActionable(offer({ expires_at: "invalid" }), "received", now),
    false,
  );
});
test("only seller pending quotes can be answered and only seller accepted quotes create orders", () => {
  assert.equal(isOfferActionable(offer(), "received", now), true);
  assert.equal(isOfferActionable(offer(), "placed", now), false);
  assert.equal(
    canCreateOfferOrder(offer({ status: "accepted" }), "received", now),
    true,
  );
  assert.equal(
    canCreateOfferOrder(offer({ status: "accepted" }), "placed", now),
    false,
  );
  for (const status of ["accepted", "countered", "rejected", "expired"])
    assert.equal(isOfferActionable(offer({ status }), "received", now), false);
  assert.equal(hasLiveOfferTerms(offer({ quantity: 1.5 }), now), false);
});
test("prices use whole cents and quantities do not truncate partial input", () => {
  for (const price of [
    "",
    "0",
    "-1",
    "NaN",
    "Infinity",
    "2junk",
    "4.123",
    "1e3",
  ])
    assert.ok(validateOfferTerms(price, "1", 4));
  for (const quantity of ["0", "1.5", "2junk", "5"])
    assert.ok(validateOfferTerms("400.25", quantity, 4));
  assert.equal(validateOfferTerms("400.25", "3", 4), null);
  assert.equal(validateOfferTerms("0.01", "1", 1), null);
});
test("totals multiply cents without inventing unavailable values", () => {
  assert.equal(offerSubtotal(400.25, 3), 1200.75);
  assert.equal(offerSubtotal(0.1, 3), 0.3);
  assert.equal(offerSubtotal(400, NaN), null);
  assert.equal(offerSubtotal(-1, 2), null);
  assert.equal(offerMoney(undefined), "Unavailable");
  assert.equal(offerMoney(0), "$0.00");
});
test("asking-price comparisons remain unavailable for missing or invalid prices", () => {
  assert.equal(priceDeltaPercent(400, 500), -20);
  assert.equal(priceDeltaPercent(400, null), null);
  assert.equal(priceDeltaPercent(NaN, 500), null);
  assert.equal(priceDeltaPercent(400, 0), null);
});
test("history applies effective expiry, combined filters, and bounded safe pages", () => {
  const rows = Array.from({ length: 19 }, (_, i) =>
    offer({
      id: String(i),
      expires_at: i === 0 ? "2026-11-01T00:00:00Z" : "2026-11-04T15:00:00Z",
    }),
  );
  assert.equal(
    offersPage(rows, "example BUYER", "expired", null, now).filteredCount,
    1,
  );
  assert.equal(offersPage(rows, "", "all", "999", now).pageItems.length, 3);
  for (const page of ["NaN", "Infinity", "0", "-1", "1.5"])
    assert.equal(offersPage(rows, "", "all", page, now).page, 1);
  assert.equal(offersPage(rows, "", "all", null, now).pageItems.length, 8);
});
