import {MAP_MODES,TASKS,GOALS,SLOT_OPTIONS} from './recruitment-options.js'
const empty=n=>n===''||n===null||n===undefined
const valid=(n,lo,hi)=>!empty(n)&&Number.isFinite(Number(n))&&Number(n)>=lo&&Number(n)<=hi
export function stepErrors(p,step){
 const errors={}
 if(step===1){
  if(!SLOT_OPTIONS.includes(p.slot))errors.slot='ui.select_a_play_time'
  if(!GOALS.includes(p.goal))errors.goal='ui.select_a_session_goal'
  if(p.goal==='goal.missions'&&(!p.tasks.length||p.tasks.some(t=>!TASKS.includes(t))))errors.tasks='ui.select_at_least_one_mission'
 }
 if(step===2){
  if(!p.maps.length)errors.maps='ui.add_at_least_one_map'
  else if(new Set(p.maps.map(m=>m.map)).size!==p.maps.length)errors.maps='ui.you_cannot_add_the_same_map_twice'
  else if(p.maps.some(m=>!MAP_MODES[m.map]?.includes(m.difficulty)))errors.maps='ui.choose_a_difficulty_for_every_map'
 }
 if(step===3){
  if(typeof p.nickname!=='string'||!p.nickname.trim())errors.nickname='ui.enter_your_nickname'
  if(p.goal!=='goal.budget_run')for(const k of ['helmet','armor','ammo'])if(!Number.isInteger(p[k])||!valid(p[k],1,6))errors[k]='validation.gear.'+k
  if(!Number.isInteger(p.style)||!valid(p.style,1,5))errors.style='ui.select_your_playstyle'
  for(const [k,max] of [['confidential_kd',1000],['top_secret_kd',1000],['combat_score',1e6]])if(!valid(p[k],0,max))errors[k]='validation.metric.'+k
 }
 if(step===4){
  if(!Number.isInteger(p.partner_style_min)||!Number.isInteger(p.partner_style_max)||!valid(p.partner_style_min,1,5)||!valid(p.partner_style_max,1,5)||p.partner_style_min>p.partner_style_max)errors.partner_style='ui.minimum_playstyle_cannot_exceed_maximum'
  if(p.goal!=='goal.budget_run')for(const k of ['helmet','armor','ammo']){const key='partner_'+k+'_min';if(!Number.isInteger(p[key])||!valid(p[key],1,6)||empty(p[k])||p[key]>p[k])errors[key]='validation.partnerGear.'+k}
  if(p.strength_range_mode==='percent'&&(!Number.isInteger(p.strength_tolerance_percent)||!valid(p.strength_tolerance_percent,0,100)))errors.strength_range='ui.select_a_valid_skill_tolerance'
  if(p.strength_range_mode==='custom'&&(!valid(p.strength_min,0,1e9)||!valid(p.strength_max,0,2e9)||p.strength_min>p.strength_max))errors.strength_range='ui.enter_a_valid_skill_range'
 }
 return errors
}
