import test from 'node:test'
import assert from 'node:assert/strict'
import {publicationProfile} from '../src/utils/recruitment-locale.js'
import {pickPreferences} from '../src/utils/pilot-preferences.js'
test('new publication language always follows the current interface without a second selector',()=>{
 for(const [ui,code] of [['en','en'],['zh-CN','zh']]){
  const profile=publicationProfile({goal:'goal.budget_run',listing_language:'ignored',language:'ignored'},ui)
  assert.equal(profile.listing_language,code);assert.equal(profile.language,'language.'+code)
 }
})
test('language changes affect only new publication snapshots, never an existing listing',()=>{
 const stored={listing_language:'en',language:'language.en',goal:'goal.budget_run'}
 const before=JSON.stringify(stored)
 assert.equal(publicationProfile(stored,'zh-CN').listing_language,'zh')
 assert.equal(JSON.stringify(stored),before)
})
test('draft and personal preferences cannot restore obsolete independent language choices',()=>{
 const draft=pickPreferences({schema_version:4,listing_language:'en',language:'language.en',nickname:'Player'})
 assert.equal(draft.nickname,'Player');assert.ok(!Object.hasOwn(draft,'listing_language'));assert.ok(!Object.hasOwn(draft,'language'))
})

test('new publications always use PC and the automatic server-calculated range',()=>{
 const source={platform:'Mobile',strength_range_mode:'custom',strength_min:1,strength_max:999,strength_tolerance_percent:99}
 const result=publicationProfile(source,'en')
 assert.equal(result.platform,'PC');assert.equal(result.strength_range_mode,'auto');assert.equal(result.strength_tolerance_percent,30)
 assert.equal(result.strength_min,null);assert.equal(result.strength_max,null)
 assert.equal(source.platform,'Mobile');assert.equal(pickPreferences(source).platform,'PC')
})
