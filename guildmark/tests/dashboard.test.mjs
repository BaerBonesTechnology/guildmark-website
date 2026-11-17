import {test} from 'node:test';
import assert from 'node:assert/strict';
import {dashboardMoney,dashboardCount,vsMarketPercent} from '../src/app/services/dashboard.service.ts';
test('zero remains a real value and missing values stay unavailable',()=>{assert.equal(dashboardMoney(0),'$0.00');for(const v of [undefined,null,NaN,Infinity,-1])assert.equal(dashboardMoney(v),'Unavailable');});
test('counts reject fractional and invalid API values',()=>{assert.equal(dashboardCount(12),'12');for(const v of [1.5,-1,undefined,Infinity])assert.equal(dashboardCount(v),'Unavailable');});
test('market comparison requires both valid aggregates',()=>{assert.equal(vsMarketPercent(120,100),19.999999999999996);for(const v of [0,-1,NaN,Infinity])assert.equal(vsMarketPercent(v,100),null);assert.equal(vsMarketPercent(100,0),null);});
