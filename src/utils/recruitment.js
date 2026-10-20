export function scoreOf(p) {
  const values = [p.confidential_kd,p.top_secret_kd,p.combat_score]
  if (values.some(v=>v === '' || v == null || !Number.isFinite(Number(v)) || Number(v)<0)) return null
  return Math.round((Number(values[0])*.4+Number(values[1])*.6)*Number(values[2])*100)/100
}
export function strengthBand(n) { return n<60?'60 以下':n<100?'60–100':n<150?'100–150':n<200?'150–200':'200 及以上' }
export function profileSummary(p) {
  if (!['33任务','跑刀','猛攻'].includes(p.goal)) return `${p.goal} · ${p.budget_min}–${p.budget_max} 万`
  return [p.goal,p.goal==='33任务'?p.task:'',p.goal==='跑刀'?'':`${p.armor} 级甲 / ${p.ammo} 级弹`, `打法 ${p.style} / 期望队友 ${p.partner_style}`].filter(Boolean).join(' · ')
}
