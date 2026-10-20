<template>
  <view class="score-card" :class="{'long-score':formatted.length>10}">
    <view class="score-main"><text class="score-label">我的实力分</text><view class="score-reading"><text v-if="value!==null" class="score-number">{{formatted}}</text><text v-else class="score-empty">待填写</text><text v-if="value!==null" class="score-unit">分</text></view></view>
    <text v-if="value!==null" class="score-band">{{strengthBand(value)}}</text>
  </view>
</template>
<script setup>
import {computed,ref,watch,onBeforeUnmount} from 'vue'
import {strengthBand} from '../utils/recruitment.js'
const props=defineProps({value:{type:Number,default:null}})
const displayed=ref(0)
let timer=null
function stop(){if(timer!==null){clearTimeout(timer);timer=null}}
const decimals=computed(()=>props.value===null?0:Math.min(2,(String(props.value).split('.')[1]||'').length))
const formatted=computed(()=>new Intl.NumberFormat('en-US',{minimumFractionDigits:decimals.value,maximumFractionDigits:decimals.value}).format(displayed.value))
watch(()=>props.value,target=>{
  stop()
  if(target===null){displayed.value=0;return}
  const reduce=typeof window!=='undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if(reduce || displayed.value===target){displayed.value=target;return}
  const start=displayed.value, began=Date.now(),duration=750
  function tick(){
    const progress=Math.min(1,(Date.now()-began)/duration)
    displayed.value=progress===1?target:start+(target-start)*(1-Math.pow(1-progress,3))
    if(progress<1)timer=setTimeout(tick,16)
    else timer=null
  }
  tick()
},{immediate:true})
onBeforeUnmount(stop)
</script>
<style scoped>
.score-card{display:flex;justify-content:space-between;align-items:center;gap:14px;margin:10px 0 6px;padding:12px 16px;min-height:54px;box-sizing:border-box;background:linear-gradient(110deg,#b9f4770c,#b9f47703);border:1px solid #b9f47730;border-radius:9px}.score-main{display:flex;align-items:center;gap:17px;min-width:0}.score-label{flex-shrink:0;font-size:11px;color:#acbf9c;white-space:nowrap}.score-reading{display:flex;align-items:baseline;gap:6px;min-width:0}.score-number{font-family:'DIN Condensed','Arial Narrow','SFMono-Regular',Consolas,'Liberation Mono',monospace;font-size:28px;font-weight:600;font-variant-numeric:tabular-nums;letter-spacing:-.8px;line-height:1.1;color:var(--orange,#b9f477);white-space:nowrap;transform:scaleY(1.12);transform-origin:center}.score-unit{font-size:10px;color:#afc39c}.score-band{flex-shrink:0;padding:4px 7px;border:1px solid #b9f47730;border-radius:5px;color:#c4e4a9;background:#b9f47709;font-size:10px;white-space:nowrap}.score-empty{font-size:13px;color:#809371}.long-score .score-number{font-size:25px}@media(max-width:550px){.score-card{padding:11px 10px;gap:7px;min-height:48px}.score-main{gap:10px}.score-label{font-size:10px}.score-number{font-size:22px;letter-spacing:-.7px}.long-score .score-number{font-size:17px}.score-band{font-size:9px;padding:3px 4px}.score-unit{display:none}}@media(max-width:375px){.score-main{gap:7px}.long-score .score-number{font-size:15px}.score-band{padding:3px;font-size:8px}}
</style>
