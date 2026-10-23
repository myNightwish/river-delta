export const SLOT_OPTIONS=['slot.next_hour','slot.today_morning','slot.today_afternoon','slot.today_evening','slot.today_late_night','slot.tomorrow_morning','slot.tomorrow_afternoon','slot.tomorrow_evening']
export const MAP_MODES={
 'map.zero_dam':['difficulty.normal','difficulty.confidential','difficulty.confidential_night'],
 'map.layali_grove':['difficulty.normal','difficulty.confidential'],
 'map.brakkesh':['difficulty.confidential','difficulty.top_secret'],
 'map.space_city':['difficulty.confidential','difficulty.top_secret'],
 'map.tide_prison':['difficulty.confidential','difficulty.top_secret'],
 'map.az3':['difficulty.normal','difficulty.confidential'],
}
export const GOALS=['goal.missions','goal.budget_run','goal.loot_extract','goal.aggressive']
export const TASK_GROUPS=[{label:'ui.exploration_missions',values:['task.investigate','task.place','task.extract_items']},{label:'ui.elimination_missions',values:['task.eliminate_operators','task.eliminate_specials']},{label:'ui.in_session_objectives',values:['task.session_missions','task.benchmark']},{label:'task.fate_contract',values:['task.fate_contract']}]
export const TASKS=TASK_GROUPS.flatMap(group=>group.values)
export const STYLE_LABELS=['ui.very_cautious','ui.cautious','ui.balanced','ui.aggressive','ui.very_aggressive']
export const GEAR_FIELDS=[{key:'helmet',label:'gear.helmet'},{key:'armor',label:'gear.armor'},{key:'ammo',label:'gear.ammo'}]
export function scoreInputsValid(profile){return ['confidential_kd','top_secret_kd','combat_score'].every((key,index)=>{const n=profile[key];return n!==''&&n!=null&&Number.isFinite(Number(n))&&Number(n)>=0&&Number(n)<=[1000,1000,1000000][index]})}
