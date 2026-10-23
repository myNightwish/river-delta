import {ref,watch} from 'vue'
import {chooseLocale,normalizeLocale,LOCALE_KEY,translate,translatedError} from './core.js'
export const locale=ref('zh-CN')
export const t=(message,params)=>translate(message,locale.value,params)
export const errorText=message=>translatedError(message,locale.value)
export const intlLocale=()=>locale.value==='en'?'en-US':'zh-CN'
export const formatNumber=(value,options={})=>new Intl.NumberFormat(intlLocale(),{maximumFractionDigits:2,...options}).format(value)
export const formatDate=(value,options={})=>new Date(value).toLocaleString(intlLocale(),options)
export function setLocale(value){locale.value=normalizeLocale(value);try{uni.setStorageSync(LOCALE_KEY,locale.value)}catch{}}
let initialized=false
export function installI18n(app){
 if(!initialized){
  initialized=true
  let saved='';try{saved=uni.getStorageSync(LOCALE_KEY)}catch{}
  locale.value=chooseLocale(saved)
  watch(locale,()=>{if(typeof document!=='undefined'){document.documentElement.lang=locale.value;document.title=t('app.title');uni.setNavigationBarTitle?.({title:t('app.title')})}},{immediate:true})
 }
 app.config.globalProperties.$t=t
 app.config.globalProperties.$error=errorText
}
