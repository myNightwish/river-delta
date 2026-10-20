// Only reusable draft fields belong here. Queue/confirmation state stays on the server.
export const PREFERENCES_KEY = 'pilot-preferences-v1'
export const DEFAULT_PREFERENCES = Object.freeze({
  nickname: '', region: 'NA', platform: 'PC', language: '中文',
  map: '零号大坝', difficulty: '普通', voice: '开麦', slot: '现在起一小时',
  confidential_kd: '', top_secret_kd: '', combat_score: '', strength_min: '', strength_max: '', goal: '33任务', task: '调查', armor: 3, ammo: 3, style: 3, partner_style: 3, budget_min: 20, budget_max: 50, rank: 4, skill: 3, gap: 1,
  discovery: 'browse', public: true,
})
const choices = {
  region: ['NA','EU','SEA','OCE','ME'], platform: ['PC','Console','Mobile'],
  language: ['中文','English','日本語'], map: ['零号大坝','长弓溪谷','巴克什'],
  difficulty: ['简单','普通'], voice: ['开麦','听指挥与标记'],
  slot: ['现在起一小时','今天晚间'], goal: ['33任务','跑刀','猛攻'], task: ['调查','放置','带出撤离任务','击杀干员','击杀特殊兵种','普通局内任务','标杆任务','命运契约'],
  discovery: ['browse','auto'],
}
const bounds = {confidential_kd:[0,1000],top_secret_kd:[0,1000],combat_score:[0,1000000],strength_min:[0,1000000000],strength_max:[0,1000000000],armor:[1,5],ammo:[1,5],style:[1,5],partner_style:[1,5],budget_min:[0,1000],budget_max:[0,1000],rank:[1,7],skill:[1,5],gap:[0,4]}
export function pickPreferences(value) {
  const result = {...DEFAULT_PREFERENCES}
  if (!value || typeof value !== 'object' || Array.isArray(value)) return result
  for (const key of Object.keys(result)) {
    const candidate = value[key]
    if (choices[key]) {
      if (choices[key].includes(candidate)) result[key] = candidate
    } else if (bounds[key]) {
      const [min,max] = bounds[key]
      if (Number.isFinite(candidate) && (['confidential_kd','top_secret_kd','combat_score','strength_min','strength_max'].includes(key) || Number.isInteger(candidate)) && candidate >= min && candidate <= max) result[key] = candidate
      else if (candidate === '') result[key] = ''
    } else if (typeof candidate === typeof result[key]) {
      result[key] = typeof candidate === 'string' ? candidate.slice(0,key==='nickname'?24:64) : candidate
    }
  }
  return result
}
export function loadPreferences(storage) {
  try {
    const raw = storage.getStorageSync(PREFERENCES_KEY)
    const value = typeof raw === 'string' && raw ? JSON.parse(raw) : raw
    const found = !!value && typeof value === 'object' && !Array.isArray(value)
    return {values:pickPreferences(value),found}
  } catch {
    return {values:{...DEFAULT_PREFERENCES},found:false}
  }
}
export function savePreferences(storage,value) {
  try {
    storage.setStorageSync(PREFERENCES_KEY,pickPreferences(value))
    return true
  } catch {
    return false
  }
}
