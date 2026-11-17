import test from 'node:test';
import assert from 'node:assert/strict';
import {loadSubscriptionPayment,subscriptionPaymentOutcome,subscriptionCanRestart} from '../src/app/services/subscriptionPayment.service.ts';
test('only completed exact-money verified checkout grants UI success',()=>{
  const paid={status:'paid',granted:true,subscription:{plan:'pro',status:'active'},invoice:{plan:'pro',amount_cents:19900,status:'paid'}};
  assert.equal(subscriptionPaymentOutcome(paid,'pro',19900),'success');
  assert.equal(subscriptionPaymentOutcome({status:'pending',granted:false},'pro',19900),'pending');
  assert.equal(subscriptionPaymentOutcome({status:'active'},'pro',19900),'pending');
  for(const result of [{...paid,status:'pending'},{...paid,invoice:{...paid.invoice,amount_cents:34900}},{...paid,subscription:{...paid.subscription,plan:'growth'}}]) assert.throws(()=>subscriptionPaymentOutcome(result,'pro',19900),/did not match/);
});
test('only backend-confirmed no-charge or terminal failed outcomes permit a new payment key',()=>{
  for(const code of ['SUBSCRIPTION_RECONCILIATION_REQUIRED','SQUARE_NOT_CONFIGURED','PRICE_CHANGED','PAYMENT_FAILED'])assert.equal(subscriptionCanRestart({code}),true);
  for(const code of ['PAYMENT_PENDING','PAYMENT_UNCONFIRMED','PAYMENT_RECONCILIATION_REQUIRED','NETWORK_ERROR',''])assert.equal(subscriptionCanRestart({code}),false);
});
test('pending checkout recovers the same company-scoped key without storing a payment nonce',()=>{
  const first=loadSubscriptionPayment({getItem:()=>null},'company-plan');assert.equal(first.submitted,false);
  const stored=JSON.stringify({...first,submitted:true});
  const recovery=loadSubscriptionPayment({getItem:()=>stored},'company-plan');assert.equal(recovery.key,first.key);assert.equal(recovery.submitted,true);assert.equal(recovery.source_id,undefined);
  assert.throws(()=>loadSubscriptionPayment({getItem:()=>'{bad'},'company-plan'));
});
