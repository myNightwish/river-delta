import test from 'node:test'
import assert from 'node:assert/strict'
import {createSessionClient} from '../src/utils/session-recovery.js'
const invalid=()=>Object.assign(new Error('invalid'),{status:401,code:'anonymous_identity_invalid'})
function setup(send,initial='old') {
 let token=initial;const writes=[]
 const client=createSessionClient({getToken:()=>token,setToken:v=>{token=v;writes.push(v)},send})
 return {...client,writes,getToken:()=>token,changeToken:v=>{token=v}}
}
test('explicit invalid identity recovers and retries read with new token',async()=>{
 const calls=[];const c=setup(async(path,data,token)=>{calls.push([path,token]);if(path==='participants')return {token:'new'};if(token==='old')throw invalid();return {ok:true}})
 assert.deepEqual(await c.request('state'),{ok:true});assert.deepEqual(c.writes,['new']);assert.deepEqual(calls,[['state','old'],['participants',''],['state','new']])
})
test('concurrent invalid reads create only one participant',async()=>{
 let registrations=0;const c=setup(async(path,data,token)=>{if(path==='participants'){registrations++;await new Promise(r=>setTimeout(r,5));return {token:'new'}}if(token==='old')throw invalid();return {ok:true}})
 await Promise.all([c.request('state'),c.request('candidates')]);assert.equal(registrations,1)
})
test('network errors, 503 and generic 401 never replace identity',async()=>{
 for(const error of [new Error('offline'),Object.assign(new Error('busy'),{status:503}),Object.assign(new Error('unauthorized'),{status:401})]){
  const c=setup(async()=>{throw error});await assert.rejects(c.request('state'));assert.deepEqual(c.writes,[])
 }
})
test('failed registration retains old identity and later recovery can retry',async()=>{
 let attempts=0;const c=setup(async path=>{if(path==='participants'){if(++attempts===1)throw new Error('offline');return {token:'new'}}throw invalid()})
 await assert.rejects(c.request('invite',{}));assert.equal(c.getToken(),'old');await assert.rejects(c.request('invite',{}),/身份已恢复/);assert.equal(c.getToken(),'new')
})
test('mutating actions are not automatically replayed',async()=>{
 for(const path of ['join','invite','confirm','cancel','feedback']){
  let actions=0;const c=setup(async name=>{if(name==='participants')return {token:'new'};actions++;throw invalid()})
  await assert.rejects(c.request(path,{}),/重新操作/);assert.equal(actions,1);assert.equal(c.getToken(),'new')
 }
})
test('late recovery cannot overwrite a newly logged in phone session',async()=>{
 let release;const c=setup(async path=>{if(path==='participants'){await new Promise(r=>{release=r});return {token:'new'}}throw invalid()})
 const promise=c.request('invite',{});await new Promise(r=>setImmediate(r));c.changeToken('ph_signed_in');release();await assert.rejects(promise);assert.equal(c.getToken(),'ph_signed_in');assert.deepEqual(c.writes,[])
})
test('phone session errors do not silently create anonymous identities',async()=>{
 const c=setup(async()=>{throw invalid()},'ph_expired');await assert.rejects(c.request('state'));assert.deepEqual(c.writes,[])
})
test('initial anonymous registration is deduplicated',async()=>{
 let registrations=0;const c=setup(async()=>{registrations++;await new Promise(r=>setImmediate(r));return {token:'new'}},'')
 assert.deepEqual(await Promise.all([c.ensureAnonymous(),c.ensureAnonymous()]),['new','new']);assert.equal(registrations,1)
})
