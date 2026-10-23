import test from 'node:test'
import assert from 'node:assert/strict'
import {toleranceBounds} from '../src/utils/strength-range.js'
import {pickPreferences} from '../src/utils/pilot-preferences.js'
import {stepErrors} from '../src/utils/recruitment-validation.js'
test('slider defaults to 30 percent and updates bounds without a score formula',()=>{
 assert.equal(pickPreferences(null).strength_tolerance_percent,30)
 assert.deepEqual(toleranceBounds(1441.6,30),[1009.12,1874.08])
 assert.deepEqual(toleranceBounds(1441.6,40),[864.96,2018.24])
 assert.deepEqual(toleranceBounds(100,0),[100,100])
 assert.deepEqual(toleranceBounds(100,100),[0,200])
})
test('zero, unavailable scores and decimal half cents remain consistent',()=>{
 assert.deepEqual(toleranceBounds(0,100),[0,0])
 assert.deepEqual(toleranceBounds(null,30),['',''])
 assert.deepEqual(toleranceBounds('',30),['',''])
 assert.deepEqual(toleranceBounds(0.05,30),[0.04,0.07])
 assert.deepEqual(toleranceBounds(1e9,100),[0,2e9])
})
test('percentage selection persists; legacy custom ranges are preserved',()=>{
 const form=pickPreferences({schema_version:4,strength_range_mode:'percent',strength_tolerance_percent:45})
 assert.equal(form.strength_range_mode,'percent');assert.equal(form.strength_tolerance_percent,45)
 const old=pickPreferences({schema_version:4,strength_range_mode:'custom',strength_min:12,strength_max:45})
 assert.equal(old.strength_min,12);assert.equal(old.strength_max,45)
 for(const invalid of ['',null,-1,101,1.5])assert.equal(pickPreferences({schema_version:4,strength_tolerance_percent:invalid}).strength_tolerance_percent,30)
 assert.ok(stepErrors({...form,strength_tolerance_percent:101},4).strength_range)
})
