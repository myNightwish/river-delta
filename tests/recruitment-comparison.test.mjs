import test from 'node:test'
import assert from 'node:assert/strict'
import {recruitmentComparison,publishedRecruitmentDetails} from '../src/utils/recruitment-comparison.js'
const profile={schema_version:4,nickname:'原招募',goal:'33任务',tasks:['调查','放置'],maps:[{map:'巴克什',difficulty:'机密'},{map:'航天基地',difficulty:'绝密'}],slot:'今天晚间',region:'NA',platform:'PC',language:'中文',voice:'开麦',helmet:4,armor:4,ammo:4,style:3,strength_score:100,strength_min:70,strength_max:130,partner_style_min:1,partner_style_max:5,partner_helmet_min:2,partner_armor_min:2,partner_ammo_min:2,discovery:'browse',public:true,confidential_kd:2,top_secret_kd:2,combat_score:50}
test('comparison ignores task and map ordering, highlights actual differences',()=>{
 const same={...profile,maps:[...profile.maps].reverse(),tasks:[...profile.tasks].reverse()}
 assert.ok(recruitmentComparison(profile,same,100,[70,130]).every(row=>!row.changed))
 const changed=recruitmentComparison(profile,{...profile,slot:'明天晚间',maps:[{map:'巴克什',difficulty:'绝密'}]},100,[70,130])
 assert.deepEqual(changed.filter(row=>row.changed).map(row=>row.key),['maps','slot'])
})
test('incomplete draft can be compared without modifying either profile',()=>{
 const before=JSON.stringify(profile)
 const rows=recruitmentComparison(profile,{maps:[],tasks:[],goal:'',nickname:''},null,['',''])
 assert.ok(rows.find(row=>row.key==='goal').changed)
 assert.match(rows.find(row=>row.key==='partner').next.join(),/待填写/)
 assert.equal(JSON.stringify(profile),before)
})
test('published details use server profile values and display all key fields',()=>{
 const details=publishedRecruitmentDetails(profile)
 assert.ok(details.find(row=>row.key==='self').values.includes('实力 100 分'))
 assert.deepEqual(details.find(row=>row.key==='maps').values,['巴克什 · 机密','航天基地 · 绝密'])
 assert.ok(details.find(row=>row.key==='metrics').values.includes('战斗分 50'))
 assert.ok(details.find(row=>row.key==='identity').values.includes('电脑端'))
 assert.equal(details.find(row=>row.key==='slot').values[0],'今天晚间')
})
