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
export function operationsErrorMessage(status,data) {
 if(status===403)return '密钥未通过验证，请确认与当前后端的配置一致；修改配置后需重启后端'
 if(status>=500)return '服务暂时不可用，请稍后重试'
 const detail=data?.detail
 if(typeof detail==='string')return detail.replace(/。$/,'')
 if(detail&&typeof detail.message==='string')return detail.message
 if(Array.isArray(detail)){
  const labels={title:'活动名称',starts_at:'开始时间',duration_minutes:'时长',capacity:'预约人数',region:'区服',platform:'游戏端',language:'语言',goal:'玩法'}
  const messages=detail.slice(0,3).map(item=>{
   const key=item.loc?.filter(v=>v!=='body').at(-1),name=labels[key]||'活动信息',ctx=item.ctx||{}
   const msg=typeof item.msg==='string'?item.msg.replace(/^Value error, /,''):''
   if(item.type==='value_error'&&/[\u3400-\u9fff]/.test(msg))return msg.replace(/。$/,'')
   if(item.type==='greater_than_equal')return name+'不能小于 '+ctx.ge
   if(item.type==='less_than_equal')return name+'不能大于 '+ctx.le
   if(item.type==='string_too_short')return name+'至少填写 '+ctx.min_length+' 个字'
   if(item.type==='string_too_long')return name+'不能超过 '+ctx.max_length+' 个字'
   if(item.type==='missing')return '请填写'+name
   if(item.type?.startsWith('int_'))return name+'请填写整数'
   if(item.type==='literal_error')return '请选择有效的'+name
   return '请检查'+name
  })
  if(messages.length)return [...new Set(messages)].join('；')
 }
 return '操作失败，请稍后重试'
}
