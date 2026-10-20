<template>
  <view class="room">
    <view class="room-head"><view><view class="room-title">队伍聊天</view><view class="room-note">交换游戏 ID、约好开局时间。消息保留 7 天。</view></view><text class="connection">{{connected?'已连接':'连接中'}}</text></view>
    <view v-if="error" class="chat-error">{{error}}</view>
    <scroll-view scroll-y class="messages" :scroll-into-view="scrollTarget">
      <view v-if="!messages.length" class="empty">打个招呼，一起准备开局吧。</view>
      <view v-for="m in messages" :id="'chat-message-'+m.id" :key="m.id" class="message-line" :class="{mine:m.is_me}">
        <view class="sender">{{m.is_me?'我':'队友'}} · {{timeLabel(m.created)}}</view>
        <view v-if="m.kind==='text'" class="bubble">{{m.content}}</view>
        <button v-else class="bubble voice-bubble" :disabled="loadingVoice===m.id" @click="playMessage(m)">{{loadingVoice===m.id?'加载中…':playing===m.id?'■ 停止播放':'▶ 语音'}} · {{Math.ceil(m.duration)}} 秒</button>
      </view>
    </scroll-view>
    <view class="shortcuts"><button :disabled="sending || !gameId" @click="sendText('游戏 ID：'+gameId)">发送我的游戏 ID</button><button :disabled="sending || recording || !!preview" @click="startRecording">录制语音</button></view>
    <view v-if="recording" class="recording"><text>● 正在录音 {{elapsed}} / 60 秒</text><button @click="stopRecording(false)">取消</button><button @click="stopRecording(true)">完成录音</button></view>
    <view v-if="preview" class="recording"><text>语音 {{Math.ceil(preview.duration)}} 秒</text><button @click="playPreview">{{playing==='preview'?'停止试听':'试听'}}</button><button :disabled="sending" @click="clearPreview">取消</button><button :disabled="sending" @click="sendVoice">{{sending?'发送中…':'发送语音'}}</button></view>
    <view class="compose"><input v-model="draft" maxlength="2000" placeholder="和队友说点什么…" confirm-type="send" @confirm="sendDraft"/><button :disabled="sending || !draft.trim()" @click="sendDraft">发送</button></view>
  </view>
</template>
<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { API_BASE } from '../config.js'
const props=defineProps({squadId:{type:Number,required:true},token:{type:String,required:true},gameId:{type:String,default:''}})
const messages=ref([]),draft=ref(''),error=ref(''),connected=ref(false),sending=ref(false),scrollTarget=ref('')
const recording=ref(false),elapsed=ref(0),preview=ref(null),playing=ref(null),loadingVoice=ref(null)
let polling=null,recordTimer=null,recorder=null,stream=null,startedAt=0,chunks=[],keepRecording=false,player=null,pollBusy=false,disposed=false
const voiceUrls=new Map()
const root=()=>API_BASE+'/pilot/squads/'+props.squadId
const auth=()=>({Authorization:'Bearer '+props.token})
const timeLabel=value=>new Date(value).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})
async function api(path,options={}){
  const response=await fetch(root()+path,{...options,headers:{...auth(),...(options.headers||{})}})
  if(!response.ok){const body=await response.json().catch(()=>({}));throw new Error(typeof body.detail==='string'?body.detail:'暂时无法发送，请重试')}
  return response
}
function merge(items){
  if(disposed || !items.length)return
  const oldLast=messages.value.at(-1)?.id
  const all=new Map(messages.value.map(m=>[m.id,m]));items.forEach(m=>all.set(m.id,m));messages.value=[...all.values()].sort((a,b)=>a.id-b.id)
  const last=messages.value.at(-1)?.id;if(last!==oldLast)scrollTarget.value='chat-message-'+last
}
async function poll(){
  if(pollBusy || disposed)return
  pollBusy=true
  try{const last=messages.value.at(-1)?.id||0;const response=await api('/messages?after='+last);merge((await response.json()).items);connected.value=true}
  catch(e){connected.value=false;if(!disposed)error.value=e.message}
  finally{pollBusy=false}
}
async function sendText(content){
  if(!content.trim() || sending.value)return
  sending.value=true;error.value=''
  try{const response=await api('/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({content})});merge([await response.json()]);return true}
  catch(e){error.value=e.message;return false}finally{sending.value=false}
}
async function sendDraft(){const value=draft.value;if(await sendText(value)){if(draft.value===value)draft.value=''}}
function stopPlayer(){if(player){player.pause();player=null}playing.value=null}
function playUrl(url,id){
  if(playing.value===id){stopPlayer();return}
  stopPlayer();player=new Audio(url);playing.value=id
  player.onended=()=>{playing.value=null};player.onerror=()=>{playing.value=null;error.value='无法播放这段语音，请尝试使用其他浏览器'}
  player.play().catch(()=>{playing.value=null;error.value='无法播放语音，请重试'})
}
async function playMessage(message){
  error.value='';loadingVoice.value=message.id
  try{let url=voiceUrls.get(message.id);if(!url){const response=await api('/voice/'+message.id);const blob=await response.blob();if(disposed)return;url=URL.createObjectURL(blob);voiceUrls.set(message.id,url)}playUrl(url,message.id)}
  catch(e){error.value=e.message}finally{loadingVoice.value=null}
}
function playPreview(){if(preview.value)playUrl(preview.value.url,'preview')}
function clearPreview(){if(playing.value==='preview')stopPlayer();if(preview.value)URL.revokeObjectURL(preview.value.url);preview.value=null}
function releaseMicrophone(){if(stream){stream.getTracks().forEach(track=>track.stop());stream=null}clearInterval(recordTimer);recordTimer=null}
async function startRecording(){
  error.value=''
  if(!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder==='undefined'){error.value='当前浏览器不支持录音，请使用文字或更新浏览器';return}
  try{
    stream=await navigator.mediaDevices.getUserMedia({audio:true})
    if(disposed){releaseMicrophone();return}
    const mime=['audio/webm;codecs=opus','audio/ogg;codecs=opus','audio/mp4'].find(t=>MediaRecorder.isTypeSupported(t))
    if(!mime){releaseMicrophone();error.value='当前浏览器不支持此语音格式，请使用文字';return}
    recorder=new MediaRecorder(stream,{mimeType:mime,audioBitsPerSecond:24000});chunks=[];startedAt=Date.now();elapsed.value=0;keepRecording=true
    recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)}
    recorder.onstop=()=>{
      releaseMicrophone();recording.value=false
      if(disposed || !keepRecording)return
      const blob=new Blob(chunks,{type:mime});const duration=Math.min(60,(Date.now()-startedAt)/1000)
      if(!blob.size || duration<0.3){error.value='录音太短，请再试一次';return}
      if(blob.size>1024*1024){error.value='语音过大，请缩短后重录';return}
      preview.value={blob,url:URL.createObjectURL(blob),duration,mime}
    }
    recorder.onerror=()=>{keepRecording=false;recording.value=false;releaseMicrophone();error.value='录音中断，请重试'}
    recorder.start();recording.value=true
    recordTimer=setInterval(()=>{elapsed.value=Math.min(60,Math.floor((Date.now()-startedAt)/1000));if(elapsed.value>=60)stopRecording(true)},250)
  }catch(e){releaseMicrophone();error.value=e.name==='NotAllowedError'?'未获得麦克风权限，你仍可发送文字':'无法使用麦克风，请检查设备后重试'}
}
function stopRecording(keep){keepRecording=keep;if(recorder?.state==='recording')recorder.stop();else{recording.value=false;releaseMicrophone()}}
async function sendVoice(){
  if(!preview.value || sending.value)return
  sending.value=true;error.value=''
  try{const form=new FormData();form.append('file',preview.value.blob,preview.value.mime.startsWith('audio/mp4')?'voice.m4a':'voice.webm');form.append('duration',String(preview.value.duration));const response=await api('/voice',{method:'POST',body:form});merge([await response.json()]);clearPreview()}
  catch(e){error.value=e.message}finally{sending.value=false}
}
onMounted(()=>{poll();polling=setInterval(poll,2500)})
onBeforeUnmount(()=>{disposed=true;clearInterval(polling);stopRecording(false);releaseMicrophone();stopPlayer();clearPreview();for(const url of voiceUrls.values())URL.revokeObjectURL(url)})
</script>
<style scoped>
.room{margin-bottom:22px;border:1px solid #c9c9be;background:#fffdf7}.room-head{display:flex;justify-content:space-between;align-items:center;padding:20px;border-bottom:1px solid #c9c9be;gap:12px}.room-title{font-size:22px;font-weight:800}.room-note{font-size:12px;color:#5d675f;margin-top:6px;line-height:1.6}.connection{font-size:11px;color:#286952;white-space:nowrap}.messages{height:340px;box-sizing:border-box}.empty{text-align:center;color:#5d675f;padding:60px 20px;font-size:13px}.message-line{display:flex;flex-direction:column;align-items:flex-start;padding:8px 18px}.message-line.mine{align-items:flex-end}.sender{font-size:10px;color:#5d675f;margin-bottom:5px}.bubble{font-size:14px;line-height:1.7;white-space:pre-wrap;overflow-wrap:anywhere;max-width:85%;padding:10px 14px;background:#ebe7dc}.mine .bubble{background:#286952;color:white}.voice-bubble{border:0;text-align:left;min-width:130px;margin:0}.shortcuts{display:flex;gap:10px;padding:12px 16px;border-top:1px solid #c9c9be;flex-wrap:wrap}.shortcuts button,.recording button{font-size:12px;line-height:1.6;border:1px solid #c9c9be;background:#f3f0e8;padding:7px 10px;margin:0}.compose{display:flex;gap:10px;padding:16px;border-top:1px solid #c9c9be}.compose input{flex:1;min-width:0;padding:12px;border:1px solid #c9c9be;background:#f3f0e8;font-size:14px;height:44px;box-sizing:border-box}.compose button{font-size:14px;line-height:1.5;background:#eb5d27;padding:10px 16px;margin:0;font-weight:700}.recording{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:12px 16px;background:#f5edd2;font-size:13px}.chat-error{padding:10px 16px;font-size:12px;color:#9a3b21;background:#ffeadc}button[disabled]{opacity:.5}
</style>
