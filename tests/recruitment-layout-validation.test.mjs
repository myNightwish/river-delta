import test from 'node:test'
import assert from 'node:assert/strict'
import {pickPreferences,loadPreferences,savePreferencesDetailed} from '../src/utils/pilot-preferences.js'
import {stepErrors} from '../src/utils/recruitment-validation.js'
test('a new draft and legacy preselected time require an explicit selection',()=>{
 for(const raw of [null,{schema_version:4,goal:'搜打撤',slot:'现在起一小时'}]){
  const form=pickPreferences(raw);assert.equal(form.slot,'');assert.ok(stepErrors(form,1).slot)
 }
})
test('an explicitly chosen draft time survives save and reload',()=>{
 let stored;const form={...pickPreferences(null),goal:'搜打撤',slot:'今天晚间',slot_explicit:true}
 assert.ok(savePreferencesDetailed({setStorageSync:(k,v)=>stored=v},form).ok)
 const loaded=loadPreferences({getStorageSync:()=>stored}).values
 assert.equal(loaded.slot,'今天晚间');assert.equal(stepErrors(loaded,1).slot,undefined)
})
test('each added map needs its own supported difficulty; removal clears its requirement',()=>{
 const form=pickPreferences({schema_version:4,maps:[{map:'零号大坝',difficulty:'机密'},{map:'巴克什',difficulty:''}]})
 assert.equal(stepErrors(form,2).maps,'请为每张地图选择难度')
 form.maps[1].difficulty='绝密';assert.deepEqual(stepErrors(form,2),{})
 form.maps[1].difficulty='';form.maps.pop();assert.deepEqual(stepErrors(form,2),{})
})
test('every offered time slot survives draft normalization and step validation',async()=>{
 const {SLOT_OPTIONS}=await import('../src/utils/recruitment-options.js')
 assert.ok(SLOT_OPTIONS.length>2)
 for(const slot of SLOT_OPTIONS){const form=pickPreferences({schema_version:4,goal:'搜打撤',slot,slot_explicit:true});assert.equal(form.slot,slot);assert.equal(stepErrors(form,1).slot,undefined)}
})
