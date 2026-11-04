import test from "node:test";
import assert from "node:assert/strict";
import {
  accountLabel,
  planLabel,
  subscriptionStatusLabel,
  validResetEmail,
  buildAccountSummary,
} from "../src/app/services/accountSettings.service.ts";
const user = {
  id: "fixture",
  full_name: "Sample Seller",
  email: "seller@example.test",
  role: "admin",
  company_id: "company-fixture",
  company: "Example ITAD",
  subscription_plan: "pro",
  subscription_status: "active",
};
test("missing records never become example values or an active subscription", () => {
  assert.equal(accountLabel("   "), "Not available");
  assert.equal(accountLabel(null), "Not available");
  assert.equal(accountLabel(" Seller "), "Seller");
  assert.equal(planLabel(undefined), "Not available");
  assert.equal(planLabel("enterprise"), "Unrecognized plan");
  assert.equal(subscriptionStatusLabel(undefined), "Status unavailable");
  assert.equal(subscriptionStatusLabel("unknown"), "Status unavailable");
});
test("plan states preserve cancellation and payment problems", () => {
  assert.equal(planLabel("free"), "Free");
  assert.equal(planLabel("growth"), "Growth");
  assert.equal(subscriptionStatusLabel("cancelled"), "Cancelled");
  assert.equal(subscriptionStatusLabel("past_due"), "Past due");
  assert.equal(subscriptionStatusLabel("active"), "Active");
});
test("reset requests require an available account email", () => {
  for (const value of [
    undefined,
    "",
    "   ",
    "missing-at.example.test",
    "a@",
    "a b@example.test",
    "a@example",
  ])
    assert.equal(validResetEmail(value), false);
  assert.equal(validResetEmail(" seller+account@example.test "), true);
});
test("download allowlist excludes tokens, credentials, payment data and unrelated records", () => {
  const extra = {
    ...user,
    access_token: "PRIVATE_ACCESS_TOKEN",
    refresh_token: "PRIVATE_REFRESH_TOKEN",
    password: "PRIVATE_PASSWORD",
    mfa_secret: "PRIVATE_MFA_SECRET",
  };
  const subscription = {
    plan: "growth",
    status: "past_due",
    currentPeriodStart: "2026-11-01T00:00:00Z",
    currentPeriodEnd: null,
    invoices: [{ token: "PRIVATE_CARD_TOKEN" }],
    payment_method: "PRIVATE_PAYMENT_DATA",
  };
  const summary = buildAccountSummary(
    extra,
    subscription,
    new Date("2026-11-03T15:00:00Z"),
  );
  assert.deepEqual(
    Object.keys(summary.account).sort(),
    [
      "id",
      "full_name",
      "email",
      "workspace_role",
      "company_id",
      "company_name",
    ].sort(),
  );
  assert.equal(JSON.stringify(summary).includes("PRIVATE_"), false);
  assert.equal(summary.subscription.status, "past_due");
  assert.equal(summary.generated_at, "2026-11-03T15:00:00.000Z");
});
test("unavailable subscription is explicit instead of falling back to an auth claim", () => {
  const summary = buildAccountSummary(user, null);
  assert.equal(summary.subscription, null);
  assert.equal("subscription_plan" in summary.account, false);
});
