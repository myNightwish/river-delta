<template>
  <view class="dropdown" @keydown.esc.stop="close" @keydown.down.prevent="move(1)" @keydown.up.prevent="move(-1)" @keydown.enter.prevent.stop="open ? select(options[cursor]) : toggle()">
    <button type="button" class="trigger" :class="{opened:open,invalid}" :aria-invalid="invalid||undefined" :aria-label="label+'：'+displayLabel(modelValue)" aria-haspopup="listbox" :aria-expanded="open" @click="toggle"><text>{{displayLabel(modelValue)}}</text><text class="chevron">⌄</text></button>
    <view v-if="open" class="dismiss" @click="close"/>
    <view v-if="open" class="menu" role="listbox" :aria-label="label">
      <view class="menu-label">{{label}}</view>
      <button v-for="(option,index) in options" :key="option" type="button" role="option" :aria-selected="modelValue===option" class="option" :class="{selected:modelValue===option,focused:cursor===index}" @mouseenter="cursor=index" @click="select(option)"><text>{{displayLabel(option)}}</text><text class="check">{{modelValue===option?'✓':''}}</text></button>
    </view>
  </view>
</template>
<script setup>
import {ref} from 'vue'
const props=defineProps({modelValue:{type:String,default:''},invalid:{type:Boolean,default:false},options:{type:Array,default:()=>[]},label:{type:String,default:'请选择'},placeholder:{type:String,default:'请选择'},optionLabels:{type:Object,default:()=>({})}})
const emit=defineEmits(['update:modelValue'])
const displayLabel=value=>value===''||value==null?props.placeholder:(props.optionLabels[value]||value)
const open=ref(false),cursor=ref(0)
function close(){open.value=false}
function toggle(){open.value=!open.value;cursor.value=Math.max(0,props.options.indexOf(props.modelValue))}
function move(step){if(!open.value){open.value=true;cursor.value=Math.max(0,props.options.indexOf(props.modelValue));return}cursor.value=(cursor.value+step+props.options.length)%props.options.length}
function select(value){emit('update:modelValue',value);close()}
</script>
<style scoped>
.dropdown{position:relative;margin-top:9px}.trigger{display:flex;justify-content:space-between;align-items:center;box-sizing:border-box;width:100%;min-height:45px;line-height:1.5;margin:0;padding:11px 13px;border:1px solid #334154;border-radius:9px;background:#0c121b;color:#e9eef5;font-size:13px;text-align:left}.trigger.opened,.trigger:focus-visible{border-color:#b9f477;box-shadow:0 0 0 3px #b9f47712;outline:none}.chevron{color:#8c9fb7}.dismiss{position:fixed;inset:0;z-index:70;background:transparent}.menu{position:absolute;top:calc(100% + 7px);left:0;right:0;min-width:150px;max-height:290px;overflow:auto;z-index:71;padding:6px;background:#18222f;border:1px solid #3a4b62;border-radius:11px;box-shadow:0 18px 48px #0009}.menu-label{padding:6px 9px 9px;font-size:10px;color:#91a4bc;letter-spacing:.5px}.option{display:flex;align-items:center;justify-content:space-between;width:100%;margin:2px 0;padding:10px;line-height:1.5;font-size:13px;text-align:left;background:transparent;color:#d7e0ec;border-radius:6px;border:1px solid transparent}.option.selected{background:#b9f47715;color:#c9fa9b}.option.focused,.option:hover{border-color:#4b6252;background:#263831}.check{font-size:12px;color:#b9f477}.option:focus-visible{outline:1px solid #b9f477}button::after{display:none}
.trigger.invalid,.trigger.invalid.opened,.trigger.invalid:focus-visible{border-color:#e29393;box-shadow:0 0 0 2px #e2939312}
</style>
