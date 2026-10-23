import {ref} from 'vue'
import {apiErrorMessage} from '../i18n/api-errors.js'
import {API_BASE} from '../config.js'
import {createSessionClient} from './session-recovery.js'
let storedToken=''
try{storedToken=uni.getStorageSync('pilot-token')||''}catch{}
export const sessionToken=ref(storedToken)
export function setSessionToken(value){sessionToken.value=value;try{uni.setStorageSync('pilot-token',value)}catch(e){console.warn('[session-storage]',e?.name||'Error')}}
function send(path,data,identity){return new Promise((resolve,reject)=>uni.request({url:API_BASE+'/pilot/'+path,timeout:15000,method:data===undefined?'GET':'POST',data,header:identity?{Authorization:'Bearer '+identity}:{},success:r=>{if(r.statusCode>=400){const detail=r.data?.detail;const error=new Error(apiErrorMessage(r.data));error.status=r.statusCode;error.code=detail?.code||r.data?.error_code;reject(error)}else resolve(r.data)},fail:()=>reject(new Error('ui.connection_interrupted_please_try_again_later'))}))}
const client=createSessionClient({getToken:()=>sessionToken.value,setToken:setSessionToken,send})
export const authRequest=client.request
export const ensureAnonymousSession=client.ensureAnonymous
