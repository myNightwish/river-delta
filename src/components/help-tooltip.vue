<template>
 <view ref="anchor" class="help-tooltip" @mouseenter="hoverOpen" @mouseleave="scheduleHide" @focusin="show" @focusout="onBlur" @keydown.esc.stop="hide">
  <button type="button" class="help-trigger" :aria-label="label" :aria-expanded="opened" :aria-describedby="opened?id:undefined" @click.stop="toggle">?</button>
  <teleport to="body">
   <view v-if="opened" :id="id" ref="bubble" class="help-bubble" role="tooltip" :style="{left:position.x+'px',top:position.y+'px',visibility:positioned?'visible':'hidden'}" @mouseenter="cancelHide" @mouseleave="scheduleHide">
    <text v-if="text" class="help-copy">{{text}}</text>
    <view v-for="item in items" :key="item.id" class="help-item"><b>{{item.title}}</b><text>{{item.description}}</text></view>
   </view>
  </teleport>
 </view>
</template>
<script setup>
import {ref,nextTick,onMounted,onBeforeUnmount} from 'vue'
defineProps({label:{type:String,default:'查看说明'},text:{type:String,default:''},items:{type:Array,default:()=>[]}})
const anchor=ref(null),bubble=ref(null),opened=ref(false),positioned=ref(false),position=ref({x:12,y:12})
const id='help-'+Math.random().toString(36).slice(2)
let hideTimer=null,pinned=false,disposed=false
const element=value=>value?.$el||value
function cancelHide(){clearTimeout(hideTimer)}
function hide(){cancelHide();opened.value=false;positioned.value=false;pinned=false}
function scheduleHide(){if(!pinned){cancelHide();hideTimer=setTimeout(hide,160)}}
async function place(){await nextTick();if(disposed||!opened.value||typeof window==='undefined')return;const target=element(anchor.value),tooltip=element(bubble.value);if(!target||!tooltip)return;const a=target.getBoundingClientRect(),b=tooltip.getBoundingClientRect();const width=window.innerWidth,height=window.innerHeight;position.value={x:Math.max(12,Math.min(a.left,width-b.width-12)),y:Math.max(12,a.bottom+8+b.height<=height-12?a.bottom+8:a.top-b.height-8)};positioned.value=true}
function show(){cancelHide();if(!opened.value){positioned.value=false;opened.value=true}place()}
function hoverOpen(){if(typeof window!=='undefined'&&window.matchMedia('(hover: hover)').matches)show()}
function toggle(){if(opened.value&&pinned)hide();else{pinned=true;show()}}
function onBlur(event){if(!element(bubble.value)?.contains(event.relatedTarget))hide()}
function outside(event){if(!element(anchor.value)?.contains(event.target)&&!element(bubble.value)?.contains(event.target))hide()}
onMounted(()=>{if(typeof document!=='undefined'){document.addEventListener('pointerdown',outside);window.addEventListener('resize',place);window.addEventListener('scroll',hide,true)}})
onBeforeUnmount(()=>{disposed=true;cancelHide();if(typeof document!=='undefined'){document.removeEventListener('pointerdown',outside);window.removeEventListener('resize',place);window.removeEventListener('scroll',hide,true)}})
</script>
<style scoped>
.help-tooltip{display:inline-flex;align-items:center;flex-shrink:0;vertical-align:middle}.help-trigger{box-sizing:border-box;display:grid;place-items:center;width:16px;min-width:16px;height:16px;min-height:16px;margin:0;padding:0;border:1px solid #62768e;border-radius:50%;background:transparent;color:#a9bcd3;font-family:Arial,sans-serif;font-size:10px;font-weight:600;line-height:1;cursor:help;transition:border-color .15s,color .15s,background .15s}.help-trigger::after{display:none}.help-trigger:hover,.help-trigger[aria-expanded=true]{border-color:#a6d875;background:#b9f47712;color:#cef4ac}.help-trigger:focus-visible{outline:2px solid #b9f477;outline-offset:3px}.help-bubble{position:fixed;z-index:220;box-sizing:border-box;width:285px;max-width:calc(100vw - 24px);padding:12px 14px;border:1px solid #42556c;border-radius:9px;background:#182331fa;color:#b8c9dd;box-shadow:0 12px 36px #0006;backdrop-filter:blur(10px);font-size:11px;font-weight:400;line-height:1.8;text-align:left;white-space:normal;overflow-wrap:anywhere}.help-copy{display:block}.help-item+.help-item{margin-top:9px;padding-top:9px;border-top:1px solid #2f4055}.help-item b{display:block;font-size:11px;font-weight:650;color:#d5ebc1;margin-bottom:2px}.help-item text{display:block;color:#a8bdd5}
</style>
