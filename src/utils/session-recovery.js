// Only an explicit server identity error can replace an anonymous identity
export function createSessionClient({getToken,setToken,send}) {
  let registration=null
  async function register(staleToken) {
    if(getToken()!==staleToken)return getToken()
    if(registration)return registration
    registration=(async()=>{
      const result=await send('participants',{},'')
      if(!result?.token)throw new Error('ui.cannot_restore_your_session_please_try_again_later')
      if(getToken()===staleToken)setToken(result.token)
      return getToken()
    })()
    try{return await registration}finally{registration=null}
  }
  async function request(path,data) {
    const identity=getToken()
    try{return await send(path,data,identity)}catch(error){
      if(error.status!==401 || error.code!=='anonymous_identity_invalid' || !identity || identity.startsWith('ph_') || path==='participants')throw error
      await register(identity)
      // Reading is safe to retry; never replay an invitation, confirmation or other action
      if(data===undefined)return send(path,data,getToken())
      throw new Error('ui.your_session_was_restored_and_your_draft_kept_please')
    }
  }
  return {request,ensureAnonymous:()=>getToken()?Promise.resolve(getToken()):register('')}
}
