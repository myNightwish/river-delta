import {hasMessage} from './core.js'
const FALLBACK='ui.could_not_complete_this_action_please_try_again_later'
export function apiErrorMessage(body){
 const code=body?.error_code
 if(hasMessage(code))return code
 const detail=body?.detail
 const key=typeof detail==='string'?detail:detail?.message
 if(hasMessage(key))return key
 if(Array.isArray(detail)){
  for(const item of detail){
   const key=String(item.msg||'').replace(/^Value error, /,'')
   if(hasMessage(key))return key
   const field=item.loc?.findLast(value=>hasMessage('validation.field.'+value))
   if(field)return 'validation.field.'+field
  }
  return 'message.validation_failed'
 }
 return FALLBACK
}
