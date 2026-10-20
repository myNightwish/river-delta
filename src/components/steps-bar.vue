<template>
  <view class="steps-bar">
    <view
      v-for="(s, i) in steps"
      :key="i"
      class="step-item"
      :class="{
        'step-active': i + 1 === current,
        'step-done': i + 1 < current,
      }"
    >
      <view class="step-dot"></view>
      <text class="step-label">{{ s }}</text>
    </view>
  </view>
</template>

<script setup>
defineProps({
  // 1 登录 / 2 选岛屿 / 3 建立档案 / 4 免费上岛 / 5 付费匹配（聊天页映射为 5）
  current: { type: Number, default: 1 },
})

const steps = ['01 登录', '02 选岛屿', '03 建档案', '04 免费上岛', '05 付费匹配']
</script>
