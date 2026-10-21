// Only an explicit server identity error can replace an anonymous identity
export function createSessionClient({getToken,setToken,send}) {
  let registration=null
  async function register(staleToken) {
    if(getToken()!==staleToken)return getToken()
    if(registration)return registration
    registration=(async()=>{
      const result=await send('participants',{},'')
      if(!result?.token)throw new Error('暂时无法恢复身份，请稍后重试')
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
      throw new Error('身份已恢复，填写的资料已保留，请重新操作')
    }
  }
  return {request,ensureAnonymous:()=>getToken()?Promise.resolve(getToken()):register('')}
}
