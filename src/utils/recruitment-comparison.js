const platformNames={PC:'电脑端',Console:'主机端',Mobile:'手机端'}
const number=n=>n===null||n===undefined||n===''?'待填写':new Intl.NumberFormat('en-US',{maximumFractionDigits:2}).format(n)
const style=n=>n?String(n)+' 档':'待填写'
const gear=p=>p.goal==='卡战备跑刀'||p.goal==='跑刀'?['轻装跑刀']:['头 '+(p.helmet??'待填写'),'甲 '+(p.armor??'待填写'),'弹 '+(p.ammo??'待填写')]
const maps=p=>(p.maps||[{map:p.map,difficulty:p.difficulty}]).filter(m=>m.map).map(m=>m.map+' · '+(m.difficulty||'待选难度'))
const tasks=p=>p.goal==='33任务'?(p.tasks||[p.task]).filter(Boolean):['不适用']
const partner=(p,range)=>['实力 '+number(range[0])+' — '+number(range[1])+' 分','打法 '+style(p.partner_style_min??p.partner_style)+' — '+style(p.partner_style_max??p.partner_style),...(p.goal==='卡战备跑刀'||p.goal==='跑刀'?[]:['头 ≥'+(p.partner_helmet_min??'待填写'),'甲 ≥'+(p.partner_armor_min??'待填写'),'弹 ≥'+(p.partner_ammo_min??'待填写')])]
const equivalent=(a,b)=>JSON.stringify([...a].sort())===JSON.stringify([...b].sort())
export function recruitmentComparison(current,draft,score,range){
 const rows=[
  {key:'goal',label:'合作目的',old:[current.goal||'待填写'],next:[draft.goal||'待填写']},
  {key:'maps',label:'地图与难度',old:maps(current),next:maps(draft)},
  ...(current.goal==='33任务'||draft.goal==='33任务'?[{key:'tasks',label:'任务',old:tasks(current),next:tasks(draft)}]:[]),
  {key:'slot',label:'开局时段',old:[current.slot||'待选择'],next:[draft.slot||'待选择']},
  {key:'self',label:'自身配置',old:[...gear(current),'打法 '+style(current.style),'实力 '+number(current.strength_score)+' 分'],next:[...gear(draft),'打法 '+style(draft.style),'实力 '+number(score)+' 分']},
  {key:'partner',label:'队友要求',old:partner(current,[current.strength_min,current.strength_max]),next:partner(draft,range)},
  {key:'identity',label:'基础信息',old:[current.nickname,current.region,platformNames[current.platform]||current.platform,current.language,current.voice].filter(Boolean),next:[draft.nickname,draft.region,platformNames[draft.platform]||draft.platform,draft.language,draft.voice].filter(Boolean)},
  {key:'publishing',label:'发布设置',old:[current.discovery==='auto'?'自动匹配':'自己挑选',current.public?'公开招募':'不公开招募'],next:[draft.discovery==='auto'?'自动匹配':'自己挑选',draft.public?'公开招募':'不公开招募']},
 ]
 return rows.map(row=>({...row,changed:!equivalent(row.old,row.next)}))
}

export function publishedRecruitmentDetails(profile){
 const rows=recruitmentComparison(profile,profile,profile.strength_score,[profile.strength_min,profile.strength_max]).map(({key,label,old})=>({key,label,values:old}))
 if(profile.confidential_kd!=null&&profile.top_secret_kd!=null&&profile.combat_score!=null)rows.splice(rows.findIndex(row=>row.key==='self')+1,0,{key:'metrics',label:'实力指标',values:['机密 KD '+number(profile.confidential_kd),'绝密 KD '+number(profile.top_secret_kd),'战斗分 '+number(profile.combat_score)]})
 return rows
}
