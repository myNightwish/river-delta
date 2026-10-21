<template>
  <view v-if="items.length || loading || error" class="recent-squads">
    <view class="recent-heading"><text>最近组局</text><button @click="expanded=!expanded">{{expanded?'收起':'查看历史'}} <text>{{expanded?'⌃':'⌄'}}</text></button></view>
    <view v-if="expanded">
      <view v-if="error" class="history-error">{{error}}<button @click="load()">重试</button></view>
      <view v-for="s in otherSquads" :key="s.id" class="history-row"><view class="history-main"><b>{{s.peer_nickname}}</b><view class="history-meta"><text>{{s.goal}}</text><text>{{s.map}} · {{s.difficulty}}</text><text>{{dateLabel(s.created)}}</text></view></view><button class="open-chat" @click="openChat(s)">查看聊天 <text>↗</text></button></view>
      <view v-if="!otherSquads.length && !loading" class="history-empty">暂无更早的组局</view>
      <button v-if="nextBefore" class="more-history" :disabled="loading" @click="load(true)">{{loading?'加载中…':'更早的组局'}}</button>
    </view>
  </view>
  <view v-if="selected" class="history-overlay" @click.self="closeChat"><view class="history-dialog" role="dialog" aria-modal="true" aria-label="历史队伍聊天" tabindex="-1" @keydown.esc.stop="closeChat" @keydown.tab="trapFocus">
    <view class="dialog-heading"><view><b>{{selected.peer_nickname}}</b><text>{{selected.goal}} · {{selected.map}} · {{selected.difficulty}}</text></view><button aria-label="关闭历史聊天" @click="closeChat">×</button></view>
    <view class="dialog-chat"><pilot-chat :key="token+':'+selected.id" :squad-id="selected.id" :token="token"/></view>
  </view></view>
</template>
<script setup>
import {computed,ref,watch,onBeforeUnmount,nextTick} from 'vue'
import PilotChat from './pilot-chat.vue'
import {authRequest} from '../utils/pilot-session.js'
const props=defineProps({token:{type:String,required:true},currentSquadId:Number})
const items=ref([]),nextBefore=ref(null),expanded=ref(false),loading=ref(false),error=ref(''),selected=ref(null)
const otherSquads=computed(()=>items.value.filter(s=>s.id!==props.currentSquadId))
let generation=0,disposed=false,locked=false,bodyOverflow='',rootOverflow='',priorFocus=null
const dateLabel=value=>new Date(value).toLocaleString([],{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'})
async function load(more=false){
 const id=++generation,identity=props.token;loading.value=true;error.value=''
 try{const result=await authRequest('squads/recent'+(more&&nextBefore.value?'?before='+nextBefore.value:''));if(disposed||id!==generation||identity!==props.token)return;items.value=more?[...items.value,...result.items]:result.items;nextBefore.value=result.next_before}
 catch(e){if(!disposed&&id===generation)error.value=e.message}
 finally{if(!disposed&&id===generation)loading.value=false}
}
function openChat(squad){selected.value=squad}
function closeChat(){selected.value=null}
function unlock(){if(!locked||typeof document==='undefined')return;document.body.style.overflow=bodyOverflow;document.documentElement.style.overflow=rootOverflow;locked=false;priorFocus?.focus?.()}
watch(selected,async value=>{
 if(typeof document==='undefined')return
 if(value){if(!locked){bodyOverflow=document.body.style.overflow;rootOverflow=document.documentElement.style.overflow;priorFocus=document.activeElement;locked=true;document.body.style.overflow='hidden';document.documentElement.style.overflow='hidden'}await nextTick();document.querySelector('.history-dialog')?.focus()}
 else unlock()
})
function trapFocus(event){
 if(typeof document==='undefined')return
 const dialog=document.querySelector('.history-dialog'),controls=[...dialog.querySelectorAll('button,input,textarea,[tabindex="0"]')].filter(el=>!el.disabled&&el.getAttribute('aria-disabled')!=='true'&&el.getClientRects().length)
 if(!controls.length)return
 const first=controls[0],last=controls.at(-1)
 if(event.shiftKey&&(document.activeElement===first||document.activeElement===dialog)){event.preventDefault();last.focus()}
 else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
}
watch(()=>props.token,()=>{generation++;closeChat();items.value=[];expanded.value=false;load()},{immediate:true})
watch(()=>props.currentSquadId,()=>{closeChat();load()})
onBeforeUnmount(()=>{disposed=true;generation++;unlock()})
</script>
<style scoped>
.recent-squads{margin-top:20px;border-top:1px solid #293649;padding-top:12px}.recent-heading{display:flex;align-items:center;justify-content:space-between;color:#a4b4c8;font-size:12px}.recent-heading>text{font-weight:600}.recent-squads button{margin:0;padding:5px 8px;line-height:1.5;border:0;background:transparent;color:#a9c792;font-size:11px;border-radius:5px}.recent-heading button>text{margin-left:7px;color:#8093ab}.history-row{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:14px 0;border-bottom:1px solid #253143}.history-main{min-width:0}.history-main b{display:block;color:#d0deee;font-size:13px;overflow-wrap:anywhere}.history-meta{display:flex;flex-wrap:wrap;gap:5px 10px;color:#8498b2;font-size:10px;margin-top:7px}.history-meta>text:first-child{color:#b5cca0}.recent-squads .open-chat{flex-shrink:0;border:1px solid #3a4d63;padding:7px 11px;color:#bdccdd;background:#131e2a}.open-chat text{margin-left:7px;color:#b9f477}.history-empty{font-size:11px;color:#7d91aa;padding:15px 0}.history-error{display:flex;align-items:center;gap:10px;font-size:11px;color:#e8adad;padding:10px 0}.recent-squads .more-history{display:block;margin:10px auto 0;color:#8ea1ba}.history-overlay{position:fixed;inset:0;z-index:110;display:flex;align-items:center;justify-content:center;padding:18px;background:#03070bd9;backdrop-filter:blur(7px);overscroll-behavior:contain}.history-dialog{box-sizing:border-box;width:100%;max-width:620px;max-height:88vh;display:flex;flex-direction:column;background:#121b27;border:1px solid #3e5069;border-radius:14px;box-shadow:0 25px 90px #0009;overflow:hidden;outline:none}.dialog-heading{display:flex;align-items:center;justify-content:space-between;padding:17px 20px;border-bottom:1px solid #2e3d50;gap:16px}.dialog-heading b{display:block;color:#dae5f3;font-size:15px;overflow-wrap:anywhere}.dialog-heading text{display:block;font-size:10px;color:#8da2bc;margin-top:5px}.dialog-heading button{border:0;background:transparent;color:#9db0c8;font-size:23px;line-height:1;padding:4px;margin:0}.dialog-chat{padding:0;min-height:0;overflow-y:auto;overscroll-behavior:contain}.dialog-chat :deep(.room){margin:0;border:0}.dialog-chat :deep(.room-head){padding:12px 20px}.dialog-chat :deep(.room-title){font-size:13px}.dialog-chat :deep(.room-note){font-size:10px}.dialog-chat :deep(.messages){height:34vh;min-height:160px;max-height:340px}.dialog-chat :deep(.compose){padding:13px 16px}.dialog-chat :deep(.shortcuts){padding:10px 16px}.dialog-heading button:focus-visible,.recent-squads button:focus-visible{outline:2px solid #b9f477;outline-offset:3px}@media(max-width:500px){.history-overlay{padding:12px}.history-dialog{max-height:90vh}.dialog-heading{padding:15px}.history-meta{font-size:10px}.recent-squads .open-chat{font-size:10px;padding:7px 8px}}
</style>
