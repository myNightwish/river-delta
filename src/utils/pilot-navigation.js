// Stable UI state values; labels may change without changing navigation behavior.
export const PILOT_TAB=Object.freeze({CONDITIONS:'conditions',HALL:'hall',MY_RECRUITMENT:'my-recruitment',ACTIVITIES:'activities'})
export const PILOT_TABS=Object.freeze([
 {id:PILOT_TAB.CONDITIONS,label:'nav.findTeam'},
 {id:PILOT_TAB.HALL,label:'nav.hall'},
 {id:PILOT_TAB.MY_RECRUITMENT,label:'nav.myTeam'},
 {id:PILOT_TAB.ACTIVITIES,label:'nav.events'},
])
export const DECLINE_REASONS=Object.freeze([
 {value:'goal',label:'ui.different_goals'},
 {value:'budget',label:'ui.gear_budget_mismatch'},
 {value:'skill',label:'ui.skill_expectations_differ'},
 {value:'communication',label:'ui.communication_mismatch'},
 {value:'time',label:'ui.schedule_changed'},
 {value:'other',label:'ui.other_reason'},
])
export const DECLINE_LABELS=Object.freeze(Object.fromEntries(DECLINE_REASONS.map(reason=>[reason.value,reason.label])))
