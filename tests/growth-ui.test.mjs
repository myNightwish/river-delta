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
test('activity validation errors identify fields and never expose request inputs',()=>{
 const result=operationsErrorMessage(422,{detail:[{type:'greater_than_equal',loc:['body','capacity'],ctx:{ge:2},input:{token:'never-show-this'}}]})
 assert.equal(result,'validation.field.capacity');assert.ok(!result.includes('never-show-this'))
 assert.equal(operationsErrorMessage(422,{detail:[{type:'string_too_short',loc:['body','title'],ctx:{min_length:2}}]}),'validation.field.title')
 assert.equal(operationsErrorMessage(422,{detail:[{type:'int_parsing',loc:['body','duration_minutes']}]}),'validation.field.duration_minutes')
})
test('business errors and unavailable service errors return semantic message keys',()=>{
 assert.equal(operationsErrorMessage(400,{detail:'ui.at_most_20_events_can_be_open_at_once'}),'ui.at_most_20_events_can_be_open_at_once')
 assert.equal(operationsErrorMessage(429,{error_code:'error.rateLimited'}),'error.rateLimited')
 assert.equal(operationsErrorMessage(403,{}),'error.forbidden')
 assert.equal(operationsErrorMessage(500,{detail:'private stack trace'}),'error.unavailable')
})
