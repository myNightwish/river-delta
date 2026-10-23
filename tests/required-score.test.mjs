import test from 'node:test'
import assert from 'node:assert/strict'
import {stepErrors} from '../src/utils/recruitment-validation.js'
import {pickPreferences} from '../src/utils/pilot-preferences.js'
test('legacy manual draft cannot bypass the three required metrics',()=>{
 const form=pickPreferences({goal:"goal.budget_run",style:3,score_mode:'manual',manual_score:100})
 assert.equal(form.score_mode,'auto')
 const errors=stepErrors(form,3)
 for(const key of ['confidential_kd','top_secret_kd','combat_score'])assert.ok(errors[key])
})
test('zero metrics remain valid and a supplied total cannot replace a missing metric',()=>{
 const form={nickname:'测试',goal:"goal.budget_run",style:3,confidential_kd:0,top_secret_kd:0,combat_score:0}
 assert.deepEqual(stepErrors(form,3),{})
 assert.ok(stepErrors({...form,combat_score:null,strength_score:100},3).combat_score)
})
test('step validation follows the relocated fields',()=>{
 const form=pickPreferences({goal:"goal.budget_run",style:3,slot:"slot.next_hour",nickname:'',confidential_kd:1,top_secret_kd:2,combat_score:50})
 assert.ok(stepErrors({...form,slot:''},1).slot)
 assert.ok(stepErrors(form,3).nickname)
 assert.equal(stepErrors(form,4).nickname,undefined)
})

test('playstyle starts empty and only an explicit choice survives draft restoration',()=>{
 const valid={nickname:'Player',goal:'goal.budget_run',confidential_kd:1,top_secret_kd:1,combat_score:50}
 for(const raw of [null,{style:1},{style:3},{style:5,style_explicit:false}]){
  const form=pickPreferences(raw)
  assert.equal(form.style,null)
  assert.equal(stepErrors({...form,...valid},3).style,'ui.select_your_playstyle')
 }
 for(let style=1;style<=5;style++){
  const form=pickPreferences({...valid,style,style_explicit:true})
  assert.equal(form.style,style);assert.equal(stepErrors(form,3).style,undefined)
  assert.equal(pickPreferences(form).style,style)
 }
})
