<template>
 <view class="partner-range automatic-range">
  <view class="range-heading"><text class="range-title">{{$t('matching.skillRange')}}</text><text class="automatic-label">{{$t('matching.automatic')}}</text></view>
  <text class="range-description">{{$t('matching.rangeDescription')}}</text>
  <view v-if="score!==null" class="generated-scores" :aria-label="summary">
   <view class="score-item"><text class="metric-label">{{$t('matching.yourScore')}}</text><view class="reading"><animated-number :value="score" :active="active"/><text class="score-unit">{{$t('unit.points')}}</text></view></view>
   <view class="score-item matching-item"><view class="metric-label">{{$t('matching.generatedRange')}}<text class="range-percent">±30%</text></view><view class="reading"><animated-number :value="bounds[0]" :active="active"/><text class="range-separator">~</text><animated-number :value="bounds[1]" :active="active"/><text class="score-unit">{{$t('unit.points')}}</text></view></view>
  </view>
  <view v-else class="range-empty">{{$t('ui.enter_your_combat_stats_first')}}</view>
  <text class="range-footnote">{{$t('matching.rangeNote')}}</text>
 </view>
</template>
<script setup>
import {computed} from 'vue'
import AnimatedNumber from './animated-number.vue'
import {t,formatNumber} from '../i18n/index.js'
import {toleranceBounds} from '../utils/strength-range.js'
const props=defineProps({score:{type:Number,default:null},active:{type:Boolean,default:true}})
const bounds=computed(()=>toleranceBounds(props.score,30))
const summary=computed(()=>props.score===null?'':`${t('matching.yourScore')} ${formatNumber(props.score)} · ${t('matching.generatedRange')} ${bounds.value.map(value=>formatNumber(value)).join(' ~ ')} ${t('unit.points')}`)
</script>
<style scoped>
.automatic-range{min-width:0}.range-heading{display:flex;align-items:center;flex-wrap:wrap;gap:6px 10px;margin-bottom:7px}.range-title{font-size:13px;font-weight:650;color:#e1e9f3}.automatic-label{font-size:9px;color:#a9bf98;background:#b9f4770a;border:1px solid #b9f47725;border-radius:4px;padding:2px 6px}.range-description{display:block;color:#91a2b8;font-size:11px;line-height:1.7}.generated-scores{display:flex;align-items:center;flex-wrap:wrap;gap:14px 24px;margin-top:12px;padding:15px 16px;border:1px dashed #425164;border-radius:10px;background:linear-gradient(110deg,#25314080,#17212e50)}.score-item{min-width:0}.metric-label{display:flex;align-items:center;gap:8px;color:#9cacc0;font-size:11px;line-height:1.6;margin-bottom:5px}.reading{display:flex;align-items:baseline;flex-wrap:wrap;gap:6px;color:#ffb747;font-size:30px;font-weight:650;line-height:1.25;letter-spacing:-.6px}.score-item:first-child .reading{color:#b9f477}.score-unit{font-size:11px;font-weight:400;color:#a6b7cb;letter-spacing:0}.range-separator{font-size:21px;font-weight:400}.range-percent{font-size:10px;color:#a9b9cc;letter-spacing:0}.range-footnote{display:block;margin-top:9px;color:#8295ad;font-size:10px;line-height:1.7}.range-empty{margin-top:12px;padding:16px;border:1px dashed #425164;border-radius:8px;color:#91a2b8;font-size:12px}@media(max-width:550px){.generated-scores{gap:14px 20px;padding:13px}.reading{font-size:27px}.range-description{font-size:10px}.range-title{font-size:12px}}
</style>
