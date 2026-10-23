export function strengthBand(n) { return n<60?'60 以下':n<100?'60–100':n<150?'100–150':n<200?'150–200':'200 及以上' }
export function profileSummary(p) {
  if(p.schema_version===4)return [p.goal,p.maps.map(m=>m.map+' · '+m.difficulty).join(' / '),p.goal==='卡战备跑刀'?'':`头${p.helmet} 甲${p.armor} 弹${p.ammo}`,`打法 ${p.style}`].filter(Boolean).join(' · ')
  if (!['33任务','跑刀','猛攻'].includes(p.goal)) return `${p.goal} · ${p.budget_min}–${p.budget_max} 万`
  return [p.goal,p.goal==='33任务'?p.task:'',p.goal==='跑刀'?'':`${p.armor} 级甲 / ${p.ammo} 级弹`, `打法 ${p.style} / 期望队友 ${p.partner_style}`].filter(Boolean).join(' · ')
}
