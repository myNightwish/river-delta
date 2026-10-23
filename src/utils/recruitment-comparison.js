import {t,formatNumber} from '../i18n/index.js'
const platformKeys={PC:'ui.pc',Console:'ui.console',Mobile:'ui.mobile'}
const missing=value=>value==null||value===''
const number=value=>missing(value)?t('common.notEntered'):formatNumber(value)
const style=value=>missing(value)?t('common.notEntered'):t('profile.styleValue',{value})
const gear=p=>p.goal==='goal.budget_run'?[t('ui.minimal_gear_run')]:['helmet','armor','ammo'].map(key=>t('gear.value',{gear:t('gear.'+key),value:number(p[key])}))
const maps=p=>(p.maps||[{map:p.map,difficulty:p.difficulty}]).filter(m=>m.map).map(m=>t('recruitment.mapDifficulty',{map:t(m.map),difficulty:t(m.difficulty||'common.notSelected')}))
const tasks=p=>p.goal==='goal.missions'?(p.tasks||[p.task]).filter(Boolean).map(value=>t(value)):[t('ui.not_applicable')]
const partner=p=>[t('partner.skillValue',{min:number(p.strength_min),max:number(p.strength_max)}),t('partner.styleValue',{min:style(p.partner_style_min??p.partner_style),max:style(p.partner_style_max??p.partner_style)}),...(p.goal==='goal.budget_run'?[]:['helmet','armor','ammo'].map(key=>t('gear.minimum',{gear:t('gear.'+key),value:number(p['partner_'+key+'_min'])}))) ]
export function recruitmentComparison(current,draft,score,range){
 current={...current};draft={...draft}
 const next={...draft,strength_score:score,strength_min:range[0],strength_max:range[1]}
 const fields=[
  ['goal','recruitment.goal',p=>[p.goal],p=>[t(p.goal||'common.notEntered')]],
  ['maps','recruitment.maps',p=>(p.maps||[]).map(m=>m.map+':'+m.difficulty).sort(),maps],
  ...(current.goal==='goal.missions'||draft.goal==='goal.missions'?[['tasks','recruitment.tasks',p=>(p.tasks||[]).slice().sort(),tasks]]:[]),
  ['listing_language','listing.language',p=>[p.listing_language],p=>[t('language.'+(p.listing_language||'zh'))]],
  ['slot','recruitment.slot',p=>[p.slot],p=>[t(p.slot||'common.notSelected')]],
  ['self','recruitment.self',p=>[p.helmet,p.armor,p.ammo,p.style,p.strength_score],p=>[...gear(p),style(p.style),t('profile.skillValue',{score:number(p.strength_score)})]],
  ['partner','recruitment.partner',p=>[p.strength_min,p.strength_max,p.partner_style_min,p.partner_style_max,p.partner_helmet_min,p.partner_armor_min,p.partner_ammo_min],partner],
  ['identity','profile.basic',p=>[p.nickname,p.region,p.platform,p.language,p.voice],p=>[p.nickname,p.region,t(platformKeys[p.platform]||p.platform),t(p.language),t(p.voice)].filter(Boolean)],
  ['publishing','recruitment.publishing',p=>[p.discovery,p.public],p=>[t('discovery.'+(p.discovery||'browse')),t(p.public?'visibility.public':'visibility.private')]],
 ]
 return fields.map(([key,label,raw,display])=>({key,label:t(label),old:display(current),next:display(next),changed:JSON.stringify(raw(current))!==JSON.stringify(raw(next))}))
}
export function publishedRecruitmentDetails(profile){
 profile={...profile}
 const rows=recruitmentComparison(profile,profile,profile.strength_score,[profile.strength_min,profile.strength_max]).map(({key,label,old})=>({key,label,values:old}))
 if(profile.confidential_kd!=null&&profile.top_secret_kd!=null&&profile.combat_score!=null)rows.splice(rows.findIndex(row=>row.key==='self')+1,0,{key:'metrics',label:t('ui.combat_stats'),values:[['metric.confidentialKd','confidential_kd'],['metric.topSecretKd','top_secret_kd'],['metric.combatScore','combat_score']].map(([label,key])=>t('metric.value',{label:t(label),value:number(profile[key])}))})
 return rows
}
