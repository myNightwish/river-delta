import {ref} from 'vue'
import {API_BASE} from '../config.js'
import {createSessionClient} from './session-recovery.js'
export const sessionToken=ref(uni.getStorageSync('pilot-token')||'')
export function setSessionToken(value){sessionToken.value=value;uni.setStorageSync('pilot-token',value)}
function send(path,data,identity){return new Promise((resolve,reject)=>uni.request({url:API_BASE+'/pilot/'+path,method:data===undefined?'GET':'POST',data,header:identity?{Authorization:'Bearer '+identity}:{},success:r=>{if(r.statusCode>=400){const detail=r.data?.detail;const error=new Error(typeof detail==='string'?detail:detail?.message||'操作暂时失败，请稍后重试');error.status=r.statusCode;error.code=detail?.code;reject(error)}else resolve(r.data)},fail:()=>reject(new Error('连接暂时中断，请稍后重试'))}))}
const client=createSessionClient({getToken:()=>sessionToken.value,setToken:setSessionToken,send})
export const authRequest=client.request
export const ensureAnonymousSession=client.ensureAnonymous
