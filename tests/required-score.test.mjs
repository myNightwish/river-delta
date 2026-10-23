import test from 'node:test'
import assert from 'node:assert/strict'
import {stepErrors} from '../src/utils/recruitment-validation.js'
import {pickPreferences} from '../src/utils/pilot-preferences.js'
test('legacy manual draft cannot bypass the three required metrics',()=>{
 const form=pickPreferences({goal:'卡战备跑刀',style:3,score_mode:'manual',manual_score:100})
 assert.equal(form.score_mode,'auto')
 const errors=stepErrors(form,3)
 for(const key of ['confidential_kd','top_secret_kd','combat_score'])assert.ok(errors[key])
})
test('zero metrics remain valid and a supplied total cannot replace a missing metric',()=>{
 const form={nickname:'测试',goal:'卡战备跑刀',style:3,confidential_kd:0,top_secret_kd:0,combat_score:0}
 assert.deepEqual(stepErrors(form,3),{})
 assert.ok(stepErrors({...form,combat_score:null,strength_score:100},3).combat_score)
})
test('step validation follows the relocated fields',()=>{
 const form=pickPreferences({goal:'卡战备跑刀',style:3,slot:'现在起一小时',nickname:'',confidential_kd:1,top_secret_kd:2,combat_score:50})
 assert.ok(stepErrors({...form,slot:''},1).slot)
 assert.ok(stepErrors(form,3).nickname)
 assert.equal(stepErrors(form,4).nickname,undefined)
})
