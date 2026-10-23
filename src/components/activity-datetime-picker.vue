<template>
 <view class="activity-datetime" @keydown.esc.stop="calendarOpen=false">
  <view class="datetime-controls">
   <view><text class="field-caption">{{ $t("ui.date") }}</text><button tabindex="0" ref="dateTrigger" class="date-trigger" :aria-expanded="calendarOpen" :aria-label="$t(&quot;ui.select_event_date&quot;)" @click="toggleCalendar"><text>{{dateValue}}</text><text class="calendar-icon">▦</text></button></view>
   <view><text class="field-caption">{{ $t("ui.time") }}</text><view class="clock-controls"><dark-select :model-value="hour" :options="hours" :label="$t(&quot;ui.hour&quot;)" @update:model-value="setTime($event,minute)"/><text class="clock-separator">:</text><dark-select :model-value="minute" :options="minutes" :label="$t(&quot;ui.minute&quot;)" @update:model-value="setTime(hour,$event)"/></view></view>
  </view>
  <view v-if="calendarOpen" class="calendar" role="group" :aria-label="$t(&quot;ui.event_date_calendar&quot;)">
   <view class="calendar-head"><button tabindex="0" :disabled="!canPrev" :aria-label="$t(&quot;ui.previous_month&quot;)" @click="moveMonth(-1)">‹</button><b>{{monthTitle}}</b><button tabindex="0" :disabled="!canNext" :aria-label="$t(&quot;ui.next_month&quot;)" @click="moveMonth(1)">›</button></view>
   <view class="calendar-grid weekdays"><text v-for="day in weekdays" :key="day">{{$t(day)}}</text></view>
   <view class="calendar-grid"><button v-for="(cell,index) in cells" :key="index" tabindex="0" :disabled="!cell.date||cell.date<today||cell.date>lastDate" :class="{selected:cell.date===dateValue,today:cell.date===today,blank:!cell.date}" :aria-label="cell.date||$t(&quot;ui.empty_date&quot;)" :aria-pressed="cell.date===dateValue" @click="chooseDate(cell.date)">{{cell.day||''}}</button></view>
   <view class="calendar-footer"><text>{{ $t("ui.choose_within_the_next_30_days") }}</text><button tabindex="0" @click="chooseDate(today)">{{ $t("ui.today") }}</button></view>
  </view>
 </view>
</template>
<script setup>
import {ref,computed,watch,nextTick} from 'vue'
import DarkSelect from './dark-select.vue'
import {formatDate} from '../i18n/index.js'
import {localDateString,activityDateDefault,monthCells} from '../utils/growth-ui.js'
const props=defineProps({modelValue:{type:String,default:''}})
const emit=defineEmits(['update:modelValue'])
const dateTrigger=ref(null),calendarOpen=ref(false),current=ref(new Date())
const dateValue=computed(()=>(props.modelValue||activityDateDefault(current.value)).split(' ')[0])
const hour=computed(()=>(props.modelValue.split(' ')[1]||'00:00').slice(0,2))
const minute=computed(()=>(props.modelValue.split(' ')[1]||'00:00').slice(3,5))
const year=ref(Number(dateValue.value.slice(0,4))),month=ref(Number(dateValue.value.slice(5,7))-1)
const hours=Array.from({length:24},(_,n)=>String(n).padStart(2,'0')),minutes=Array.from({length:60},(_,n)=>String(n).padStart(2,'0'))
const monthTitle=computed(()=>formatDate(new Date(year.value,month.value,1),{year:'numeric',month:'long'}))
const weekdays=['ui.sun','ui.mon','ui.tue','ui.wed','ui.thu','ui.fri','ui.sat']
const today=computed(()=>localDateString(current.value))
const lastDate=computed(()=>{const d=new Date(current.value);d.setDate(d.getDate()+30);return localDateString(d)})
const monthKey=computed(()=>year.value*12+month.value)
const canPrev=computed(()=>monthKey.value>current.value.getFullYear()*12+current.value.getMonth())
const canNext=computed(()=>{const d=new Date(current.value);d.setDate(d.getDate()+30);return monthKey.value<d.getFullYear()*12+d.getMonth()})
const cells=computed(()=>monthCells(year.value,month.value))
watch(dateValue,value=>{year.value=Number(value.slice(0,4));month.value=Number(value.slice(5,7))-1})
function toggleCalendar(){calendarOpen.value=!calendarOpen.value;if(calendarOpen.value){current.value=new Date();const value=dateValue.value<today.value?today.value:dateValue.value;year.value=Number(value.slice(0,4));month.value=Number(value.slice(5,7))-1}}
function moveMonth(delta){const value=new Date(year.value,month.value+delta,1);year.value=value.getFullYear();month.value=value.getMonth()}
async function chooseDate(value){if(!value||value<today.value||value>lastDate.value)return;emit('update:modelValue',value+' '+hour.value+':'+minute.value);calendarOpen.value=false;await nextTick();(dateTrigger.value?.$el||dateTrigger.value)?.focus?.()}
function setTime(h,m){emit('update:modelValue',dateValue.value+' '+h+':'+m)}
</script>
<style scoped>
.activity-datetime{margin:7px 0 14px}.datetime-controls{display:grid;grid-template-columns:minmax(0,1fr) minmax(145px,.8fr);gap:12px}.field-caption{display:block;font-size:10px;color:#849ab5;margin-bottom:6px}.date-trigger{display:flex!important;justify-content:space-between!important;align-items:center;box-sizing:border-box;min-height:45px!important;width:100%!important;margin:0!important;padding:11px 13px!important;background:#0c121b!important;color:#e1eaf5!important;border:1px solid #334154!important;border-radius:9px!important;font-size:13px!important;line-height:1.5!important;font-variant-numeric:tabular-nums}.date-trigger[aria-expanded=true]{border-color:#b9f477!important}.calendar-icon{font-size:17px;color:#b9f477}.clock-controls{display:grid;grid-template-columns:minmax(0,1fr) 8px minmax(0,1fr);align-items:center;gap:5px}.clock-controls :deep(.dropdown){margin-top:0}.clock-controls :deep(.trigger){padding:11px 9px;font-variant-numeric:tabular-nums}.clock-controls :deep(.menu){min-width:64px}.clock-separator{text-align:center;color:#8b9eb6;font-size:15px}.calendar{max-width:330px;margin-top:10px;border:1px solid #3b4d63;border-radius:11px;background:#15202d;padding:10px;box-shadow:0 10px 28px #0003}.calendar-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}.calendar-head b{font-size:13px;color:#e0eaf5}.calendar button{margin:0!important;padding:0!important;border:1px solid transparent!important;background:transparent!important;color:#bed0e4!important;font-size:12px!important;min-height:32px!important;border-radius:7px!important;line-height:1!important}.calendar-head button{width:30px!important;font-size:21px!important}.calendar button[disabled]{opacity:.25}.calendar-grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:3px}.weekdays{font-size:10px;text-align:center;color:#8195ae;margin-bottom:7px}.calendar-grid button{width:100%!important;font-variant-numeric:tabular-nums}.calendar-grid button.today{border-color:#6c8751!important}.calendar-grid button.selected{color:#17240e!important;background:#b9f477!important;border-color:#b9f477!important;font-weight:700}.calendar-grid button.blank{visibility:hidden}.calendar button:hover:not([disabled]){border-color:#7b9b60!important;background:#b9f4770c!important}.calendar-footer{display:flex;align-items:center;justify-content:space-between;margin-top:8px;padding-top:7px;border-top:1px solid #2e3d50;font-size:10px;color:#8da1b9}.calendar-footer button{color:#b9f477!important;width:auto!important;padding:0 8px!important}.date-trigger:focus-visible,.calendar button:focus-visible{outline:2px solid #b9f477;outline-offset:2px}@media(max-width:400px){.datetime-controls{grid-template-columns:minmax(0,1fr) minmax(125px,1fr);gap:8px}}
</style>
