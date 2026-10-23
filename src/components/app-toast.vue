<template>
 <transition name="app-toast"><view v-if="message" class="app-toast-box" :class="type" :role="type==='error'?'alert':'status'" :aria-live="type==='error'?'assertive':'polite'"><text class="toast-icon">{{type==='error'?'!':'✓'}}</text><text>{{message}}</text></view></transition>
</template>
<script setup>
defineProps({message:{type:String,default:''},type:{type:String,default:'success'}})
</script>
<style scoped>
.app-toast-box{position:fixed;top:20%;left:50%;transform:translateX(-50%);width:max-content;z-index:200;box-sizing:border-box;display:flex;align-items:flex-start;gap:10px;max-width:min(420px,calc(100vw - 32px));padding:13px 16px;border:1px solid #7fa65c;border-radius:10px;background:#17241ff5;color:#dbefcb;box-shadow:0 12px 38px #0005;backdrop-filter:blur(12px);font-size:13px;line-height:1.7;pointer-events:none}.app-toast-box.error{background:#2c1d26f5;border-color:#93535d;color:#ffd0c9}.toast-icon{display:grid;place-items:center;flex-shrink:0;box-sizing:border-box;width:20px;height:20px;margin-top:1px;border:1px solid #a2cf77;border-radius:50%;font-size:12px;color:#b9f477;line-height:1}.error .toast-icon{border-color:#d68c8c;color:#ffc0b4}.app-toast-enter-active,.app-toast-leave-active{transition:opacity .18s ease,transform .18s ease}.app-toast-enter-from,.app-toast-leave-to{opacity:0;transform:translateX(-50%) scale(.96)}@media(prefers-reduced-motion:reduce){.app-toast-enter-active,.app-toast-leave-active{transition:none}}
</style>
