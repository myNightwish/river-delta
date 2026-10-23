import test from 'node:test'
import assert from 'node:assert/strict'
import {shareCode,shareUrl,localActivityTime,operatorCredential,activityDateDefault,localDateString,monthCells,operationsErrorMessage} from '../src/utils/growth-ui.js'
test('share parsing only accepts opaque recruitment codes',()=>{
 const code='a'.repeat(32)
 assert.equal(shareCode('#/?recruit='+code),code)
 for(const hash of ['#/?recruit=Bearer-secret','#/?recruit=<script>','#/','#/?recruit='+code+'x'])assert.equal(shareCode(hash),'')
})
test('share URL strips credentials, query parameters and unrelated hash state',()=>{
 const code='a'.repeat(32)
 assert.equal(shareUrl({origin:'https://site.example',pathname:'/',search:'?token=secret',hash:'#/?token=secret'},code),'https://site.example/#/?recruit='+code)
 assert.throws(()=>shareUrl({origin:'x',pathname:'/'},'secret'))
})
test('activity local time uses timezone-bearing ISO and rejects invalid dates',()=>{
 const parsed=localActivityTime('2026-10-30 20:00');assert.ok(parsed.endsWith('Z'));assert.equal(new Date(parsed).getHours(),20)
 for(const v of ['2026-02-30 20:00','2026-13-01 20:00','2026-10-30 24:00','tomorrow',''])assert.throws(()=>localActivityTime(v))
})

test('operator credential accepts copied assignment, quotes and whitespace',()=>{
 const key='AbCdEf0123456789_-'.repeat(2)
 for(const value of [key,' '+key+'\n','PILOT_METRICS_TOKEN='+key,'PILOT_METRICS_TOKEN = "'+key+'"',"PILOT_METRICS_TOKEN='"+key+"'",'Bearer '+key])assert.equal(operatorCredential(value),key)
 assert.equal(operatorCredential('PILOT_METRICS_TOKEN'),'PILOT_METRICS_TOKEN')
 assert.equal(operatorCredential(''),'')
})

test('activity defaults to device-local today with a useful time, including midnight boundary',()=>{
 assert.equal(activityDateDefault(new Date(2026,9,23,15,7)),'2026-10-23 15:17')
 assert.equal(activityDateDefault(new Date(2026,9,23,23,57)),'2026-10-23 23:59')
 assert.equal(localDateString(new Date(2026,0,1,0,1)),'2026-01-01')
})
test('calendar aligns weekdays and handles leap years and year boundaries',()=>{
 for(const [year,month,count] of [[2024,1,29],[2026,1,28],[2026,11,31]]){
  const cells=monthCells(year,month)
  assert.equal(cells.length,42);assert.equal(cells.filter(v=>v.date).length,count)
  assert.equal(cells.findIndex(v=>v.day===1),new Date(year,month,1).getDay())
  assert.ok(cells.filter(v=>v.date).every(v=>v.date.startsWith(year+'-'+String(month+1).padStart(2,'0'))))
 }
})
test('activity validation arrays produce actionable messages without exposing raw request input',()=>{
 const detail=[{type:'value_error',loc:['body'],msg:'Value error, 请选择 5 分钟至 30 天内的开始时间',input:{token:'never-show-this'}},{type:'greater_than_equal',loc:['body','capacity'],ctx:{ge:2}}]
 const result=operationsErrorMessage(422,{detail})
 assert.ok(result.includes('请选择 5 分钟至 30 天内的开始时间'));assert.ok(result.includes('预约人数不能小于 2'));assert.ok(!result.includes('never-show-this'))
 assert.equal(operationsErrorMessage(422,{detail:[{type:'string_too_short',loc:['body','title'],ctx:{min_length:2}}]}),'活动名称至少填写 2 个字')
 assert.equal(operationsErrorMessage(422,{detail:[{type:'int_parsing',loc:['body','duration_minutes']}]}),'时长请填写整数')
})
test('business, rate limit and unavailable service errors have visible safe messages',()=>{
 assert.equal(operationsErrorMessage(400,{detail:'最多同时开放 20 场活动'}),'最多同时开放 20 场活动')
 assert.equal(operationsErrorMessage(429,{detail:{message:'请在 30 秒后重试'}}),'请在 30 秒后重试')
 assert.ok(operationsErrorMessage(403,{}).includes('密钥未通过验证'))
 assert.equal(operationsErrorMessage(500,{detail:'private stack trace'}),'服务暂时不可用，请稍后重试')
})
