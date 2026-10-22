import test from 'node:test'
import assert from 'node:assert/strict'
import {shareCode,shareUrl,localActivityTime} from '../src/utils/growth-ui.js'
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
