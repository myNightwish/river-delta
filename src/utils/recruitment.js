import {t} from '../i18n/index.js'
export function strengthBand(value){return value<60?'score.below60':value<100?'score.from60':value<150?'score.from100':value<200?'score.from150':'score.above200'}
export function profileSummary(profile){
 const p=profile
 if(p.schema_version===4)return [t(p.goal),p.maps.map(m=>t('recruitment.mapDifficulty',{map:t(m.map),difficulty:t(m.difficulty)})).join(' / '),p.goal==='goal.budget_run'?'':t('message.gearSummary',{helmet:p.helmet,armor:p.armor,ammo:p.ammo}),t('message.styleSummary',{style:p.style})].filter(Boolean).join(' · ')
 return [t(p.goal),p.task?t(p.task):'',p.goal==='goal.budget_run'?'':t('legacy.gearSummary',{armor:p.armor,ammo:p.ammo}),t('legacy.styleSummary',{style:p.style,partner:p.partner_style})].filter(Boolean).join(' · ')
}
