import {MAP_MODES,GOALS,TASKS} from './recruitment-options.js'
export const PREFERENCES_KEY='pilot-preferences-v2'
export const DEFAULT_PREFERENCES=Object.freeze({
 schema_version:4,nickname:'',region:'NA',platform:'PC',language:'中文',voice:'开麦',slot:'现在起一小时',
 goal:'',tasks:[],maps:[],helmet:null,armor:null,ammo:null,style:3,
 partner_style_min:1,partner_style_max:5,partner_helmet_min:null,partner_armor_min:null,partner_ammo_min:null,
 score_mode:'auto',manual_score:'',confidential_kd:'',top_secret_kd:'',combat_score:'',
 strength_range_mode:'auto',strength_min:'',strength_max:'',discovery:'browse',public:true,wizard_step:1,
})
const choices={region:['NA','EU','SEA','OCE','ME'],platform:['PC','Console','Mobile'],language:['中文','English','日本語'],voice:['开麦','听指挥与标记'],slot:['现在起一小时','今天晚间'],goal:GOALS,score_mode:['auto','manual'],strength_range_mode:['auto','custom'],discovery:['browse','auto']}
const bounds={helmet:[1,6],armor:[1,6],ammo:[1,6],style:[1,5],partner_style_min:[1,5],partner_style_max:[1,5],partner_helmet_min:[1,6],partner_armor_min:[1,6],partner_ammo_min:[1,6],confidential_kd:[0,1000],top_secret_kd:[0,1000],combat_score:[0,1000000],manual_score:[0,1e9],strength_min:[0,1e9],strength_max:[0,1.3e9],wizard_step:[1,4]}
const integers=new Set(['helmet','armor','ammo','style','partner_style_min','partner_style_max','partner_helmet_min','partner_armor_min','partner_ammo_min','wizard_step'])
function fresh(){return {...DEFAULT_PREFERENCES,tasks:[],maps:[]}}
export function pickPreferences(value){
 const result=fresh()
 if(!value||typeof value!=='object'||Array.isArray(value))return result
 const old=value.schema_version!==4
 const v={...value}
 if(old){
  v.goal=v.goal==='跑刀'?'卡战备跑刀':v.goal==='任务'?'33任务':v.goal==='主动交战'?'猛攻':v.goal==='搜集撤离'?'搜打撤':v.goal
  v.tasks=v.task&&TASKS.includes(v.task)?[v.task]:[]
  if(v.map&&MAP_MODES[v.map])v.maps=[{map:v.map,difficulty:MAP_MODES[v.map].includes(v.difficulty)?v.difficulty:MAP_MODES[v.map][0]}]
  if(Number.isInteger(v.partner_style)){v.partner_style_min=v.partner_style;v.partner_style_max=v.partner_style}
  v.partner_armor_min=v.armor;v.partner_ammo_min=v.ammo
  if(v.strength_min!==''&&v.strength_max!==''&&v.strength_min!=null&&v.strength_max!=null)v.strength_range_mode='custom'
 }
 for(const key of Object.keys(result)){
  const n=v[key]
  if(choices[key]){if(choices[key].includes(n))result[key]=n}
  else if(bounds[key]){const [lo,hi]=bounds[key];if(Number.isFinite(n)&&n>=lo&&n<=hi&&(!integers.has(key)||Number.isInteger(n)))result[key]=n;else if(n===''||n===null)result[key]=n}
  else if(key==='nickname'&&typeof n==='string')result[key]=n.slice(0,24)
  else if(key==='public'&&typeof n==='boolean')result[key]=n
 }
 if(Array.isArray(v.tasks))result.tasks=[...new Set(v.tasks.filter(t=>TASKS.includes(t)))].slice(0,8)
 if(Array.isArray(v.maps)){
  const seen=new Set()
  result.maps=v.maps.filter(m=>m&&MAP_MODES[m.map]&&!seen.has(m.map)&&seen.add(m.map)).slice(0,6).map(m=>({map:m.map,difficulty:MAP_MODES[m.map].includes(m.difficulty)?m.difficulty:''}))
 }
 result.schema_version=4
 result.wizard_step=Number.isInteger(result.wizard_step)?result.wizard_step:1
 return result
}
export function loadPreferences(storage){try{const raw=storage.getStorageSync(PREFERENCES_KEY)||storage.getStorageSync('pilot-preferences-v1');const value=typeof raw==='string'&&raw?JSON.parse(raw):raw;const found=!!value&&typeof value==='object'&&!Array.isArray(value);return {values:pickPreferences(value),found}}catch{return {values:fresh(),found:false}}}
export function savePreferences(storage,value){try{storage.setStorageSync(PREFERENCES_KEY,pickPreferences(value));return true}catch{return false}}
