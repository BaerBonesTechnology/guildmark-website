import test from 'node:test';
import assert from 'node:assert/strict';
import { PAID_PLANS, PLAN_CATALOG, planFeatures } from '../src/app/constants/planCatalog.ts';
import { PLAN_META } from '../src/app/constants/subscriptionCheckout.constants.ts';
import { PLANS as settingsPlans } from '../src/app/constants/ampsSettings.constants.ts';
import { PLANS as signupPlans } from '../src/app/constants/proSignup.constants.ts';

test('approved company catalog stays aligned across settings, signup and checkout', () => {
  const expected = [[39,100,1,200,8,.14],[99,500,1,1000,20,.12],[199,2000,1,4000,40,.10]];
  PAID_PLANS.forEach((key,i) => {
    const p = PLAN_CATALOG[key];
    assert.deepEqual([p.price,p.physicalDevices,p.seats,p.valuationCredits,p.additionalSeatPrice,p.sellerFee], expected[i]);
    assert.equal(PLAN_META[key].price,p.price);
    assert.equal(PLAN_META[key].valuationCredits,p.valuationCredits);
    assert.equal(settingsPlans.find(p=>p.key===key).price,p.price);
    assert.equal(signupPlans.find(p=>p.key===key).price,p.price);
    assert.match(planFeatures(key).join(' '), /not available to purchase yet/);
    assert.doesNotMatch(planFeatures(key).join(' '), /unlimited|dedicated account manager|live MDM/i);
  });
  assert.equal(PLAN_CATALOG.free.sellerFee,.14);
  assert.match(settingsPlans[0].devices,/no AMPS/);
});
