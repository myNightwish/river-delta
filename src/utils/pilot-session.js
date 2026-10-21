import {ref} from 'vue'
import {API_BASE} from '../config.js'
export const sessionToken=ref(uni.getStorageSync('pilot-token')||'')
export function setSessionToken(value){sessionToken.value=value;uni.setStorageSync('pilot-token',value)}
export function authRequest(path,data){return new Promise((resolve,reject)=>uni.request({url:API_BASE+'/pilot/'+path,method:data===undefined?'GET':'POST',data,header:{Authorization:'Bearer '+sessionToken.value},success:r=>{if(r.statusCode>=400){const error=new Error(typeof r.data?.detail==='string'?r.data.detail:'操作暂时失败，请稍后重试');error.status=r.statusCode;reject(error)}else resolve(r.data)},fail:()=>reject(new Error('连接暂时中断，请稍后重试'))}))}
