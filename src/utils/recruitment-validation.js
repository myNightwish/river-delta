import {MAP_MODES,TASKS,GOALS,scoreOf} from './recruitment-options.js'
const empty=n=>n===''||n===null||n===undefined
const valid=(n,lo,hi)=>!empty(n)&&Number.isFinite(Number(n))&&Number(n)>=lo&&Number(n)<=hi
export function stepErrors(p,step){
 const errors={}
 if(step===1){
  if(!GOALS.includes(p.goal))errors.goal='请选择合作目的'
  if(p.goal==='33任务'&&(!p.tasks.length||p.tasks.some(t=>!TASKS.includes(t))))errors.tasks='至少选择一个要完成的任务'
 }
 if(step===2){
  if(!p.maps.length)errors.maps='至少添加一张地图'
  else if(new Set(p.maps.map(m=>m.map)).size!==p.maps.length)errors.maps='同一张地图不能重复添加'
  else if(p.maps.some(m=>!MAP_MODES[m.map]?.includes(m.difficulty)))errors.maps='请为每张地图选择难度'
 }
 if(step===3){
  if(p.goal!=='卡战备跑刀')for(const k of ['helmet','armor','ammo'])if(!Number.isInteger(p[k])||!valid(p[k],1,6))errors[k]='请选择'+{helmet:'头盔',armor:'护甲',ammo:'子弹'}[k]+'等级'
  if(!Number.isInteger(p.style)||!valid(p.style,1,5))errors.style='请选择我的打法风格'
  if(p.score_mode==='manual'){if(!valid(p.manual_score,0,1e9))errors.manual_score='请输入有效的实力分'}
  else for(const [k,max] of [['confidential_kd',1000],['top_secret_kd',1000],['combat_score',1e6]])if(!valid(p[k],0,max))errors[k]='请填写有效的'+{confidential_kd:'机密 KD',top_secret_kd:'绝密 KD',combat_score:'战斗分'}[k]
  if(scoreOf(p)===null&&!Object.keys(errors).length)errors.score='请填写有效的实力数据'
 }
 if(step===4){
  if(!Number.isInteger(p.partner_style_min)||!Number.isInteger(p.partner_style_max)||!valid(p.partner_style_min,1,5)||!valid(p.partner_style_max,1,5)||p.partner_style_min>p.partner_style_max)errors.partner_style='打法范围下限不能高于上限'
  if(p.goal!=='卡战备跑刀')for(const k of ['helmet','armor','ammo']){const key='partner_'+k+'_min';if(!Number.isInteger(p[key])||!valid(p[key],1,6)||empty(p[k])||p[key]>p[k])errors[key]='请设置不高于自身的'+{helmet:'头盔',armor:'护甲',ammo:'子弹'}[k]+'门槛'}
  if(p.strength_range_mode==='custom'&&(!valid(p.strength_min,0,1e9)||!valid(p.strength_max,0,1.3e9)||p.strength_min>p.strength_max))errors.strength_range='请填写有效的实力上下限'
  if(!p.nickname.trim())errors.nickname='请填写队内昵称'
 }
 return errors
}
