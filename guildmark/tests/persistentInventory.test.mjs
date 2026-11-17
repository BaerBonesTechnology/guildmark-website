import test from 'node:test';
import assert from 'node:assert/strict';
import { inventoryApi, inventoryCSV, inventoryInput, parseInventoryCSV, inventoryError, physicalInventoryUnits, fitsPhysicalCapacity } from '../src/app/services/persistentInventory.service.ts';

const input = {model_name:'Laptop "A", business\nline',asset_type:'laptop',condition_grade:'B',quantity:7,purchase_date:'2024-01-01',cpu_score:180,ram_gb:16,storage_gb:512,original_purchase_price:1000,department:'IT'};
test('full physical capacity permits software/license additions and reductions, not hardware overflow',()=>{
  const software={...input,asset_type:'software',quantity:50};
  const license={...input,asset_type:'license',quantity:300};
  assert.equal(physicalInventoryUnits([input,software,license,{...input,archived:true},{...input,archived_at:'2026-01-01'}]),7);
  assert.equal(fitsPhysicalCapacity([software,license],100,100),true);
  assert.equal(fitsPhysicalCapacity([{...input,quantity:1}],100,100),false);
  assert.equal(fitsPhysicalCapacity([{...input,quantity:1}],99,100),true);
  assert.equal(fitsPhysicalCapacity([software,{...input,quantity:2}],99,100),false);
  assert.equal(fitsPhysicalCapacity([{...input,quantity:6}],110,100,{...input,id:'saved'}),true);
  assert.equal(fitsPhysicalCapacity([software],110,100),true);
  assert.equal(fitsPhysicalCapacity([{...input,quantity:8}],110,100,{...input,id:'saved'}),false);
});
test('CSV preserves physical quantities, quotes, newlines and specification inputs on round trip', () => {
  const record = {...input,id:'a',company_id:'private-tenant',archived_at:null};
  const csv=inventoryCSV([record]);
  assert.match(csv,/quantity/);assert.doesNotMatch(csv,/private-tenant/);
  const [parsed]=parseInventoryCSV(csv);
  assert.equal(parsed.quantity,7);assert.equal(parsed.model_name,input.model_name);assert.equal(parsed.ram_gb,16);assert.equal(parsed.purchase_date,'2024-01-01');
  assert.equal(parsed.company_id,undefined);assert.equal(parsed.id,undefined);
  const malicious=inventoryCSV([{...record,model_name:'=SUM(1,1)'}]);
  assert.match(malicious,/"'=SUM\(1,1\)"/);
  assert.equal(parseInventoryCSV(malicious)[0].model_name,'=SUM(1,1)');
});
test('invalid CSV cannot silently truncate quantities or partially import a rejected batch', () => {
  assert.throws(()=>parseInventoryCSV('model_name,asset_type,condition_grade\nx,laptop,B'),/quantity/);
  for(const quantity of [0,-1,1.5,100001,NaN])assert.throws(()=>inventoryInput({...input,quantity}),/Quantity/);
  assert.throws(()=>inventoryInput({...input,model_name:'x'.repeat(201)}),/200/);
  assert.throws(()=>inventoryInput({...input,ram_gb:3.5}),/whole number/);
  assert.throws(()=>parseInventoryCSV('model_name,asset_type,condition_grade,quantity\nx,laptop,B,2\ny,laptop,B,0'),/row 3/);
  assert.throws(()=>parseInventoryCSV('model_name,model_name,asset_type,condition_grade,quantity\nx,x,laptop,B,2'),/duplicate/);
  assert.throws(()=>parseInventoryCSV('model_name,asset_type,condition_grade,quantity\n"x,laptop,B,2'),/unclosed/);
  assert.equal(inventoryInput({...input,company_id:'other'}).company_id,undefined);
});
test('full fleet loads every page and fails instead of returning partial or duplicate exports', async()=>{
  const calls=[];
  const client={get:async path=>{calls.push(path);const p=Number(new URL('https://example.test'+path).searchParams.get('page'));return {data:[{...input,id:'id'+p}],page:p,total:3,total_pages:3,page_size:1};}};
  assert.equal((await inventoryApi(client).listAll(true)).length,3);
  assert.equal(calls.length,3);assert.ok(calls.every(p=>p.includes('include_archived=true')));
  await assert.rejects(()=>inventoryApi({get:async()=>({data:[{...input,id:'same'}],page:1,total:2,total_pages:2})}).listAll(),/pagination changed/);
  await assert.rejects(()=>inventoryApi({get:async()=>({data:[],page:1,total:2,total_pages:1})}).listAll(),/complete records/);
});
test('persistent create/update/archive/import use whitelisted payloads and stable retry keys', async()=>{
  const calls=[];let records=[];
  const client={
    post:async(path,body)=>{calls.push({method:'POST',path,body});if(path.endsWith('/import'))return {assets:body.assets,imported_records:body.assets.length,imported_units:body.assets.reduce((n,a)=>n+a.quantity,0)};const asset={...body,id:'saved'};records=[asset];return asset;},
    patch:async(path,body)=>{calls.push({method:'PATCH',path,body});records=[{...records[0],...body}];return records[0];},
    delete:async path=>{calls.push({method:'DELETE',path});records=[{...records[0],archived:true}];return {archived:true,id:'saved'};}
  };
  const repo=inventoryApi(client);const key='attempt-idempotency-1234';
  await repo.create({...input,company_id:'other'},key);assert.equal(records[0].quantity,7);assert.equal(calls[0].body.idempotency_key,key);assert.equal(calls[0].body.company_id,undefined);
  await repo.update('saved',{...input,quantity:3});assert.equal(records[0].quantity,3);
  await repo.archive('saved');assert.equal(records[0].archived,true);
  const imported=await repo.import([input],key);assert.equal(imported.imported_units,7);assert.equal(calls.at(-1).body.idempotency_key,key);
  assert.throws(()=>repo.import(Array.from({length:51},()=>input),key),/1–50/);
  const quota={status:403,code:'ASSET_LIMIT_EXCEEDED'};
  const failing=inventoryApi({post:async()=>{throw quota;}});
  await assert.rejects(()=>failing.create(input,key),error=>error===quota);
  assert.match(inventoryError(quota),/Viewing and export remain available/);
  assert.match(inventoryError({status:409}),/Refresh/);assert.match(inventoryError({status:429}),/retry/);
});
