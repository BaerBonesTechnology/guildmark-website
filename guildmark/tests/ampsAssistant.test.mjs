import test from 'node:test';
import assert from 'node:assert/strict';
import { assistantErrorMessage, formatAssistantMoney, toggleAssistantSelection } from '../src/app/services/ampsAssistant.service.ts';

test('selection caps records at five and allows removal before another addition', () => {
  let selected = [];
  for (const id of ['a', 'b', 'c', 'd', 'e', 'f']) selected = toggleAssistantSelection(selected, id);
  assert.deepEqual(selected, ['a', 'b', 'c', 'd', 'e']);
  selected = toggleAssistantSelection(selected, 'c');
  selected = toggleAssistantSelection(selected, 'f');
  assert.deepEqual(selected, ['a', 'b', 'd', 'e', 'f']);
});

test('unavailable values stay distinct from a real zero estimate', () => {
  assert.equal(formatAssistantMoney(null), 'Not estimated');
  assert.equal(formatAssistantMoney(0), '$0.00');
  assert.equal(formatAssistantMoney(1234.56), '$1,234.56');
});

test('entitlement and session failures give actionable messages without leaking server details', () => {
  assert.match(assistantErrorMessage({ status: 403 }), /subscription/);
  assert.match(assistantErrorMessage({ status: 402 }), /payment/);
  assert.match(assistantErrorMessage({ status: 401 }), /Sign in/);
  assert.equal(assistantErrorMessage(new Error('private infrastructure detail')).includes('private infrastructure detail'), false);
});
