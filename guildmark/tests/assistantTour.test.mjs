import test from 'node:test';
import assert from 'node:assert/strict';
import { assistantTourKey, shouldShowAssistantTour, dismissAssistantTour } from '../src/app/services/assistantTour.ts';

test('tour preference is versioned and scoped to both user and company', () => {
  const values = new Map();
  const storage = { getItem: (key) => values.get(key), setItem: (key, value) => values.set(key, value) };
  assert.equal(shouldShowAssistantTour(null, storage), false);
  assert.equal(shouldShowAssistantTour('company-a:user-a', storage), true);
  dismissAssistantTour('company-a:user-a', storage);
  assert.equal(shouldShowAssistantTour('company-a:user-a', storage), false);
  assert.equal(values.get(assistantTourKey('company-a:user-a')), 'dismissed');
  assert.equal(shouldShowAssistantTour('company-b:user-a', storage), true);
  assert.equal(shouldShowAssistantTour('company-a:user-b', storage), true);
  assert.match(assistantTourKey('company-a:user-a'), /:v1:/);
});

test('blocked storage never prevents dismissal during this session', () => {
  const storage = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } };
  assert.equal(shouldShowAssistantTour('blocked:owner', storage), true);
  dismissAssistantTour('blocked:owner', storage);
  assert.equal(shouldShowAssistantTour('blocked:owner', storage), false);
});
