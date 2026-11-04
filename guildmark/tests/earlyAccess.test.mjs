import test from 'node:test';
import assert from 'node:assert/strict';
import { earlyAccessPayload, partnerLoiDetails } from '../src/app/services/earlyAccess.service.ts';

function form(values) { const data = new FormData(); for (const [key, value] of Object.entries(values)) data.set(key, value); return data; }

test('IT team signup keeps the existing waitlist source and refresh notes', () => {
  assert.deepEqual(earlyAccessPayload(form({email:' buyer@example.test ', company:' Example ', size:'50 – 200 units'}), 'team'), {
    email:'buyer@example.test', company:'Example', source:'waitlist', partner_type:'Refresh size: 50 – 200 units',
  });
});
test('resellers keep supply source and role/volume segmentation', () => {
  assert.deepEqual(earlyAccessPayload(form({email:'seller@example.test', role:'ITAD', volume:'Under $25k'}), 'supply'), {
    email:'seller@example.test', company:undefined, source:'supply', partner_type:'ITAD · Volume: Under $25k',
  });
});
test('blank optional values do not create placeholder notes', () => {
  for (const audience of ['team','supply']) {
    const data = earlyAccessPayload(form({email:'a@example.test',company:'  ',size:' ',role:' ',volume:' '}), audience);
    assert.equal(data.company, undefined); assert.equal(data.partner_type, undefined);
  }
});
test('partner application preserves review details without declaring an LOI signed', () => {
  const details = partnerLoiDetails(form({name:' Partner ',email:'p@example.test',company:' Example ',service:'Logistics & pickup',coverage:'National'}));
  assert.deepEqual(details, {name:'Partner',email:'p@example.test',company:'Example',partnerType:'Logistics & pickup · National',phone:''});
  assert.equal('loi_accepted' in details, false);
});
