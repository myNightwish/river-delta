export const SLOT_OPTIONS=['现在起一小时','今天晚间']
export const MAP_MODES={
  '零号大坝':['普通','机密','机密·黑夜'], '长弓溪谷':['普通','机密'],
  '巴克什':['机密','绝密'], '航天基地':['机密','绝密'],
  '潮汐监狱':['机密','绝密'], 'AZ3':['普通','机密'],
}
export const GOALS=['33任务','卡战备跑刀','搜打撤','猛攻']
export const TASK_GROUPS=[{label:'跑图任务',values:['调查','放置','带出撤离任务']},{label:'击杀任务',values:['击杀干员','击杀特殊兵种']},{label:'局内行动',values:['普通局内任务','标杆任务']},{label:'命运契约',values:['命运契约']}]
export const TASKS=TASK_GROUPS.flatMap(g=>g.values)
export const STYLE_LABELS=['很保守','偏保守','均衡','偏激进','很激进']
export const GEAR_FIELDS=[{key:'helmet',label:'头盔'},{key:'armor',label:'护甲'},{key:'ammo',label:'子弹'}]
export function scoreInputsValid(p){
 return ['confidential_kd','top_secret_kd','combat_score'].every((key,i)=>{const n=p[key];return n!==''&&n!=null&&Number.isFinite(Number(n))&&Number(n)>=0&&Number(n)<=[1000,1000,1000000][i]})
}
