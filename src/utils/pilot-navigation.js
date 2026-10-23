// Stable UI state values; labels may change without changing navigation behavior.
export const PILOT_TAB=Object.freeze({CONDITIONS:'conditions',HALL:'hall',MY_RECRUITMENT:'my-recruitment',ACTIVITIES:'activities'})
export const PILOT_TABS=Object.freeze([
 {id:PILOT_TAB.CONDITIONS,label:'去组队'},
 {id:PILOT_TAB.HALL,label:'招募大厅'},
 {id:PILOT_TAB.MY_RECRUITMENT,label:'我的组队'},
 {id:PILOT_TAB.ACTIVITIES,label:'组队活动'},
])
export const DECLINE_REASONS=Object.freeze([
 {value:'goal',label:'目标不同'},
 {value:'budget',label:'装备预算不合适'},
 {value:'skill',label:'实力预期不符'},
 {value:'communication',label:'沟通方式不合适'},
 {value:'time',label:'时间安排变化'},
 {value:'other',label:'其他原因'},
])
export const DECLINE_LABELS=Object.freeze(Object.fromEntries(DECLINE_REASONS.map(reason=>[reason.value,reason.label])))
