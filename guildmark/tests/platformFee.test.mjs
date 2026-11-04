import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatorSellerFeeRate } from '../src/app/services/platformFee.service.ts';
import { sellerFeeLabel } from '../src/app/services/ampsSettings.service.ts';

const currentFees = {
  buyer_fee: 0.028,
  seller_fee_free: 0.14,
  seller_fee_starter: 0.14,
  seller_fee_growth: 0.12,
  seller_fee_pro: 0.10,
};

test('seller plan labels use current runtime configuration for all four tiers', () => {
  assert.deepEqual(['free', 'starter', 'growth', 'pro'].map(plan => sellerFeeLabel(plan, currentFees)), ['14%', '14%', '12%', '10%']);
  assert.equal(sellerFeeLabel('pro', { ...currentFees, seller_fee_pro: 0.075 }), '7.5%');
  assert.equal(sellerFeeLabel('free', undefined), '14%');
});

test('calculator uses approved 14% fallback rather than implying a fee-free sale', () => {
  assert.equal(calculatorSellerFeeRate(undefined), 0.14);
  assert.equal(calculatorSellerFeeRate(currentFees), 0.14);
  assert.equal(calculatorSellerFeeRate({ seller_fee_free: 0.15 }), 0.15);
  assert.equal(calculatorSellerFeeRate({ seller_fee_free: 0 }), 0);
});
