export function shareCode(hash='') {
 const query=hash.includes('?')?hash.slice(hash.indexOf('?')+1):''
 const code=new URLSearchParams(query).get('recruit')||''
 return /^[A-Za-z0-9_-]{32}$/.test(code)?code:''
}
export function shareUrl(location,code) {
 if(!/^[A-Za-z0-9_-]{32}$/.test(code))throw new Error('无效招募链接')
 return location.origin+location.pathname+'#/?recruit='+code
}
export function localActivityTime(value) {
 const m=/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})$/.exec(value.trim())
 if(!m)throw new Error('请按 YYYY-MM-DD HH:mm 填写活动时间')
 const [,y,mo,d,h,mi]=m.map(Number), date=new Date(y,mo-1,d,h,mi)
 if(date.getFullYear()!==y||date.getMonth()!==mo-1||date.getDate()!==d||date.getHours()!==h||date.getMinutes()!==mi)throw new Error('活动时间无效')
 return date.toISOString()
}
