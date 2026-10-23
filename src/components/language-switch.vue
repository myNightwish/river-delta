<template>
 <view class="language-switch" role="group" :aria-label="$t('settings.interfaceLanguage')">
  <button type="button" :class="{selected:locale==='zh-CN'}" :aria-pressed="locale==='zh-CN'" lang="zh-CN" @click="setLocale('zh-CN')">简体中文</button>
  <button type="button" :class="{selected:locale==='en'}" :aria-pressed="locale==='en'" lang="en" @click="setLocale('en')">English</button>
 </view>
</template>
<script setup>
import {locale,setLocale} from '../i18n/index.js'
</script>
<style scoped>
.language-switch{display:flex;align-items:center;gap:2px;border:1px solid #344458;border-radius:7px;padding:2px;flex-shrink:0}.language-switch button{width:auto;margin:0;min-height:28px;padding:4px 7px;font-size:10px;line-height:1.5;border:0;border-radius:4px;background:transparent;color:#9db0c7;white-space:nowrap}.language-switch .selected{background:#b9f47716;color:#c6efa4}.language-switch button:focus-visible{outline:2px solid #b9f477;outline-offset:2px}
</style>
