<template><text class="animated-number">{{formatted}}</text></template>
<script setup>
import {computed,ref,watch,onBeforeUnmount} from 'vue'
import {formatNumber} from '../i18n/index.js'
const props=defineProps({value:{type:Number,default:null},active:{type:Boolean,default:true}})
const displayed=ref(0)
let timer=null
function stop(){clearTimeout(timer);timer=null}
const formatted=computed(()=>props.value===null?'—':formatNumber(displayed.value,{maximumFractionDigits:2}))
watch(()=>[props.value,props.active],([target,active],previous)=>{
 stop()
 if(target===null){displayed.value=0;return}
 if(!active)return
 const reduced=typeof window!=='undefined'&&window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
 if(reduced){displayed.value=target;return}
 const start=previous?.[1]?displayed.value:0,began=Date.now()
 function tick(){const progress=Math.min(1,(Date.now()-began)/900);displayed.value=progress===1?target:start+(target-start)*(1-Math.pow(1-progress,3));if(progress<1)timer=setTimeout(tick,16);else timer=null}
 tick()
},{immediate:true})
onBeforeUnmount(stop)
</script>
<style scoped>.animated-number{font-variant-numeric:tabular-nums;white-space:nowrap}</style>
