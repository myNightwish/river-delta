<template>
 <view class="score-card" :class="{'long-score':formatted.length>9}" :aria-label="value===null?$t('common.notEntered'):$t('profile.skillScore')+' '+formatted+' '+$t('unit.points')">
  <view class="score-main"><text class="score-label">{{$t('profile.skillScore')}}</text><view class="score-reading"><animated-number v-if="value!==null" class="score-number" :value="value"/><text v-else class="score-empty">{{$t('common.notEntered')}}</text><text v-if="value!==null" class="score-unit">{{$t('unit.points')}}</text></view></view>
  <text v-if="value!==null" class="score-band">{{$t(strengthBand(value))}}</text>
 </view>
</template>
<script setup>
import {computed} from 'vue'
import {formatNumber} from '../i18n/index.js'
import {strengthBand} from '../utils/recruitment.js'
import AnimatedNumber from './animated-number.vue'
const props=defineProps({value:{type:Number,default:null}})
const formatted=computed(()=>props.value===null?'':formatNumber(props.value))
</script>
<style scoped>
.score-card{display:flex;justify-content:space-between;align-items:center;gap:10px;margin:0;padding:9px 12px;min-height:54px;box-sizing:border-box;background:linear-gradient(110deg,#25314080,#17212e50);border:1px dashed #425164;border-radius:9px}.score-main{display:flex;align-items:center;flex-wrap:wrap;gap:7px 12px;min-width:0}.score-label{font-size:10px;color:#9cacc0;white-space:nowrap}.score-reading{display:flex;align-items:baseline;gap:5px;min-width:0}.score-number{font-size:30px;font-weight:650;line-height:1.25;color:#b9f477;letter-spacing:-.6px}.score-unit{font-size:10px;color:#a6b7cb}.score-band{flex-shrink:0;padding:3px 6px;border:1px solid #b9f47730;border-radius:5px;color:#c4e4a9;background:#b9f47709;font-size:9px;white-space:nowrap}.score-empty{font-size:13px;color:#91a2b8}.long-score .score-number{font-size:22px}@media(max-width:550px){.score-card{position:relative;min-height:65px;padding:7px 9px;align-items:flex-end}.score-main{flex-direction:column;align-items:flex-start;gap:3px}.score-label{font-size:9px}.score-number{font-size:27px}.score-band{position:absolute;right:7px;top:7px;font-size:7px;padding:2px 4px}.score-label{max-width:70px;white-space:normal}.score-unit{display:none}.long-score .score-number{font-size:19px}}@media(prefers-reduced-motion:no-preference){.score-card{animation:score-reveal .5s ease-out}@keyframes score-reveal{from{opacity:.65;transform:translateY(3px)}to{opacity:1;transform:translateY(0)}}}
</style>
