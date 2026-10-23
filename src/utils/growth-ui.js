import {apiErrorMessage} from '../i18n/api-errors.js'
export function shareCode(hash='') {
 const query=hash.includes('?')?hash.slice(hash.indexOf('?')+1):''
 const code=new URLSearchParams(query).get('recruit')||''
 return /^[A-Za-z0-9_-]{32}$/.test(code)?code:''
}
export function shareUrl(location,code) {
 if(!/^[A-Za-z0-9_-]{32}$/.test(code))throw new Error('ui.invalid_listing_link')
 return location.origin+location.pathname+'#/?recruit='+code
}
export function localActivityTime(value) {
 const m=/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})$/.exec(value.trim())
 if(!m)throw new Error('ui.enter_the_event_time_as_yyyy_mm_dd_hh')
 const [,y,mo,d,h,mi]=m.map(Number), date=new Date(y,mo-1,d,h,mi)
 if(date.getFullYear()!==y||date.getMonth()!==mo-1||date.getDate()!==d||date.getHours()!==h||date.getMinutes()!==mi)throw new Error('ui.invalid_event_time')
 return date.toISOString()
}

// Accept a copied .env assignment without exposing or changing the secret itself.
export function operatorCredential(value='') {
 let key=value.trim().replace(/^PILOT_METRICS_TOKEN\s*=\s*/, '').trim()
 if((key.startsWith('"')&&key.endsWith('"'))||(key.startsWith("'")&&key.endsWith("'")))key=key.slice(1,-1).trim()
 return key.replace(/^Bearer\s+/i,'').trim()
}

export function localDateString(date=new Date()) {
 return [date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-')
}
export function activityDateDefault(now=new Date()) {
 // Keep today's date selected even when no start time remains before midnight.
 const target=Math.min(now.getHours()*60+now.getMinutes()+10,23*60+59)
 return localDateString(now)+' '+String(Math.floor(target/60)).padStart(2,'0')+':'+String(target%60).padStart(2,'0')
}
export function monthCells(year,month) {
 const first=new Date(year,month,1),count=new Date(year,month+1,0).getDate()
 return Array.from({length:42},(_,i)=>{const day=i-first.getDay()+1;return day>0&&day<=count?{day,date:localDateString(new Date(year,month,day))}:{day:null,date:''}})
}
export function operationsErrorMessage(status,data){return status>=500?'error.unavailable':status===403?'error.forbidden':apiErrorMessage(data)}
