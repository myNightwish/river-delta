<template>
  <view class="room">
    <view class="room-head"><view><view class="room-title">{{ $t("ui.team_chat") }}</view><view class="room-note">{{ $t("ui.exchange_game_ids_and_agree_when_to_start_messages") }}</view></view><text class="connection">{{connected?$t("ui.connected"):$t("ui.connecting")}}</text></view>
    <view v-if="error" class="chat-error">{{$error(error)}}</view>
    <scroll-view scroll-y class="messages" :scroll-into-view="scrollTarget">
      <view v-if="!messages.length" class="empty">{{ $t("ui.say_hello_and_get_ready_to_play") }}</view>
      <view v-for="m in messages" :id="'chat-message-'+m.id" :key="m.id" class="message-line" :class="{mine:m.is_me}">
        <view class="sender">{{m.is_me?$t("ui.you_294"):$t("profile.partnerLabel")}} · {{timeLabel(m.created)}}</view>
        <view v-if="m.kind==='text'" class="bubble">{{m.content}}</view>
        <button v-else class="bubble voice-bubble" :disabled="loadingVoice===m.id" @click="playMessage(m)">{{loadingVoice===m.id?$t("ui.loading"):playing===m.id?$t("ui.stop"):$t("ui.voice_message")}} · {{Math.ceil(m.duration)}} {{ $t("unit.seconds") }}</button>
      </view>
    </scroll-view>
    <view class="shortcuts"><button :disabled="sending || recording || !!preview" @click="startRecording">{{ $t("ui.record_voice") }}</button></view>
    <view v-if="recording" class="recording"><text>{{ $t("ui.recording") }} {{elapsed}} {{ $t("ui.60_sec") }}</text><button @click="stopRecording(false)">{{ $t("action.cancel") }}</button><button @click="stopRecording(true)">{{ $t("ui.finish_recording") }}</button></view>
    <view v-if="preview" class="recording"><text>{{ $t("ui.voice") }} {{Math.ceil(preview.duration)}} {{ $t("unit.seconds") }}</text><button @click="playPreview">{{playing==='preview'?$t("ui.stop_preview"):$t("ui.preview")}}</button><button :disabled="sending" @click="clearPreview">{{ $t("action.cancel") }}</button><button :disabled="sending" @click="sendVoice">{{sending?$t("ui.sending"):$t("ui.send_voice")}}</button></view>
    <view class="compose"><input v-model="draft" maxlength="2000" :placeholder="$t(&quot;ui.say_something_to_your_teammate&quot;)" confirm-type="send" @confirm="sendDraft"/><button :disabled="sending || !draft.trim()" @click="sendDraft">{{ $t("ui.send") }}</button></view>
  </view>
</template>
<script setup>
import {apiErrorMessage} from '../i18n/api-errors.js'
import {formatDate} from '../i18n/index.js'
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { API_BASE } from '../config.js'
const props=defineProps({squadId:{type:Number,required:true},token:{type:String,required:true}})
const messages=ref([]),draft=ref(''),error=ref(''),connected=ref(false),sending=ref(false),scrollTarget=ref('')
const recording=ref(false),elapsed=ref(0),preview=ref(null),playing=ref(null),loadingVoice=ref(null)
let polling=null,recordTimer=null,recorder=null,stream=null,startedAt=0,chunks=[],keepRecording=false,player=null,pollBusy=false,disposed=false
const voiceUrls=new Map()
const root=()=>API_BASE+'/pilot/squads/'+props.squadId
const auth=()=>({Authorization:'Bearer '+props.token})
const timeLabel=value=>formatDate(value,{hour:'2-digit',minute:'2-digit'})
async function api(path,options={}){
  const response=await fetch(root()+path,{...options,headers:{...auth(),...(options.headers||{})}})
  if(!response.ok){const body=await response.json().catch(()=>({}));throw new Error(apiErrorMessage(body))}
  return response
}
function merge(items){
  if(disposed || !items.length)return
  const oldLast=messages.value.at(-1)?.id
  const all=new Map(messages.value.map(m=>[m.id,m]));items.forEach(m=>all.set(m.id,m));messages.value=[...all.values()].sort((a,b)=>a.id-b.id)
  const last=messages.value.at(-1)?.id;if(last!==oldLast)scrollTarget.value='chat-message-'+last
}
async function poll(){
  if(pollBusy || disposed || (typeof document!=='undefined' && document.visibilityState==='hidden'))return
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
  player.onended=()=>{playing.value=null};player.onerror=()=>{playing.value=null;error.value='ui.cannot_play_this_audio_try_another_browser'}
  player.play().catch(()=>{playing.value=null;error.value='ui.cannot_play_this_audio_please_retry'})
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
  if(!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder==='undefined'){error.value='ui.recording_is_not_supported_use_text_or_update_your';return}
  try{
    stream=await navigator.mediaDevices.getUserMedia({audio:true})
    if(disposed){releaseMicrophone();return}
    const mime=['audio/webm;codecs=opus','audio/ogg;codecs=opus','audio/mp4'].find(t=>MediaRecorder.isTypeSupported(t))
    if(!mime){releaseMicrophone();error.value='ui.this_audio_format_is_not_supported_please_use_text';return}
    recorder=new MediaRecorder(stream,{mimeType:mime,audioBitsPerSecond:24000});chunks=[];startedAt=Date.now();elapsed.value=0;keepRecording=true
    recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)}
    recorder.onstop=()=>{
      releaseMicrophone();recording.value=false
      if(disposed || !keepRecording)return
      const blob=new Blob(chunks,{type:mime});const duration=Math.min(60,(Date.now()-startedAt)/1000)
      if(!blob.size || duration<0.3){error.value='ui.recording_is_too_short_please_retry';return}
      if(blob.size>1024*1024){error.value='ui.audio_is_too_large_try_a_shorter_recording';return}
      preview.value={blob,url:URL.createObjectURL(blob),duration,mime}
    }
    recorder.onerror=()=>{keepRecording=false;recording.value=false;releaseMicrophone();error.value='ui.recording_was_interrupted_please_retry'}
    recorder.start();recording.value=true
    recordTimer=setInterval(()=>{elapsed.value=Math.min(60,Math.floor((Date.now()-startedAt)/1000));if(elapsed.value>=60)stopRecording(true)},250)
  }catch(e){releaseMicrophone();error.value=e.name==='NotAllowedError'?'ui.microphone_access_is_unavailable_you_can_still_send_text':'ui.cannot_access_your_microphone_check_your_device_and_retry'}
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
.room{margin-bottom:22px;border:1px solid #2e3c4f;background:#121923}.room-head{display:flex;justify-content:space-between;align-items:center;padding:20px;border-bottom:1px solid #2e3c4f;gap:12px}.room-title{font-size:22px;font-weight:800}.room-note{font-size:12px;color:#95a5ba;margin-top:6px;line-height:1.6}.connection{font-size:11px;color:#a6df86;white-space:nowrap}.messages{height:340px;box-sizing:border-box}.empty{text-align:center;color:#95a5ba;padding:60px 20px;font-size:13px}.message-line{display:flex;flex-direction:column;align-items:flex-start;padding:8px 18px}.message-line.mine{align-items:flex-end}.sender{font-size:10px;color:#95a5ba;margin-bottom:5px}.bubble{font-size:14px;line-height:1.7;white-space:pre-wrap;overflow-wrap:anywhere;max-width:85%;padding:10px 14px;background:#1b2635}.mine .bubble{background:#a6df86;color:#12200d}.voice-bubble{border:0;text-align:left;min-width:130px;margin:0}.shortcuts{display:flex;gap:10px;padding:12px 16px;border-top:1px solid #2e3c4f;flex-wrap:wrap}.shortcuts button,.recording button{font-size:12px;line-height:1.6;border:1px solid #2e3c4f;background:#0d141e;padding:7px 10px;margin:0}.compose{display:flex;gap:10px;padding:16px;border-top:1px solid #2e3c4f}.compose input{flex:1;min-width:0;padding:12px;border:1px solid #2e3c4f;background:#0d141e;font-size:14px;height:44px;box-sizing:border-box}.compose button{font-size:14px;line-height:1.5;background:#b9f477;padding:10px 16px;margin:0;font-weight:700}.recording{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:12px 16px;background:#2a2b20;font-size:13px}.chat-error{padding:10px 16px;font-size:12px;color:#ffaaaa;background:#321f29}button[disabled]{opacity:.5}
.room{border-radius:14px;overflow:hidden}.bubble{border-radius:10px}.mine .bubble{background:#2c4c35;color:#e0f5df}.compose input{color:#e9eef5;border-radius:9px}.compose button{color:#14200e;border-radius:9px}.shortcuts button,.recording button{color:#c3cedd;border-radius:7px}.voice-bubble{color:#e9eef5}.room-title{font-size:20px}</style>
