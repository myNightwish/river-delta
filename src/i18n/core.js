import english from './en.js'
import chinese from './zh.js'
export const LOCALE_KEY='ui-locale-v1'
export const SUPPORTED_LOCALES=Object.freeze(['zh-CN','en'])
export function normalizeLocale(value){return typeof value==='string'&&/^en(?:-|$)/i.test(value)?'en':'zh-CN'}
export function chooseLocale(saved,languages=[]){return SUPPORTED_LOCALES.includes(saved)?saved:normalizeLocale(languages[0])}
export function hasMessage(key){return typeof key==='string'&&Object.hasOwn(chinese,key)}
export function translate(key,language='zh-CN',params={}){
 if(key==null)return ''
 if(typeof key==='object'){params=key.params||{};key=key.key}
 const catalog=language==='en'?english:chinese
 const text=catalog[key]??chinese[key]
 if(text===undefined)return /^[\x20-\x7e]*$/.test(String(key))?String(key):'[missing translation]'
 return text.replace(/\{(\w+)\}/g,(match,name)=>Object.hasOwn(params,name)?String(params[name]):match)
}
export function translatedError(message,language='zh-CN'){
 return translate(message&&hasMessage(typeof message==='object'?message.key:message)?message:'ui.could_not_complete_this_action_please_try_again_later',language)
}
