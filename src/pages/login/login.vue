<template>
  <view>
    <steps-bar :current="1" />

    <view class="login-grid">
      <!-- 左列：文案面板 -->
      <view class="login-copy">
        <text class="eyebrow">一次登录，认领你的岛民身份</text>
        <view class="display login-title">登录一次，<text style="color: var(--yellow)">战绩变档案。</text></view>
        <view class="muted" style="margin-top: 16rpx; max-width: 560rpx">
          手机号 + 验证码登录即注册。首次登录后上传战绩截图建立档案，之后上岛直接读取，无需重复上传。
        </view>
        <text class="display login-watermark">LOGIN · 00</text>
      </view>

      <!-- 右列：表单卡片 -->
      <view class="card login-form anim-rise">
        <text class="eyebrow">手机号登录</text>
        <view class="h2" style="margin-top: 8rpx">验证码登录即注册</view>
        <view class="muted" style="margin: 8rpx 0 16rpx">未注册的手机号将自动创建账号</view>

        <text class="muted">手机号</text>
        <view class="row" style="border: 2rpx solid var(--line); background: var(--panel); margin: 8rpx 0 16rpx">
          <text style="padding: 0 20rpx; border-right: 2rpx solid var(--line); font-weight: 700">+86</text>
          <input style="flex: 1; padding: 20rpx" v-model="phone" placeholder="请输入 11 位手机号" type="number" maxlength="11" />
        </view>

        <text class="muted">验证码</text>
        <view class="row" style="margin: 8rpx 0 16rpx">
          <input class="input" style="flex: 1; margin: 0" v-model="code" placeholder="6 位验证码" type="number" maxlength="6" />
          <button size="mini" class="btn-secondary" @click="sendCode" :disabled="counting" style="margin-left: 12rpx; white-space: nowrap">{{ countText }}</button>
        </view>

        <button class="btn-primary" @click="doLogin" style="width: 100%">登录并继续</button>
        <view class="muted" style="margin-top: 16rpx; font-size: 22rpx; border-top: 2rpx solid var(--line); padding-top: 12rpx">
          开发模式：验证码将自动填入并弹窗显示，无需真实接收短信。
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import StepsBar from '../../components/steps-bar.vue'
import { api } from '../../api/index.js'
import { userStore } from '../../store/user.js'

const phone = ref('')
const code = ref('')
const counting = ref(false)
const countText = ref('获取验证码')
let timer = null

async function sendCode() {
  if (!/^1\d{10}$/.test(phone.value)) {
    uni.showToast({ title: '请输入 11 位手机号', icon: 'none' })
    return
  }
  try {
    const res = await api.sendCode(phone.value)
    if (res.dev_code) {
      code.value = res.dev_code
      uni.showToast({ title: '验证码已填入（开发模式）', icon: 'none' })
    }
    counting.value = true
    let n = 60
    countText.value = `${n}s`
    timer = setInterval(() => {
      n--
      countText.value = `${n}s`
      if (n <= 0) {
        clearInterval(timer)
        counting.value = false
        countText.value = '获取验证码'
      }
    }, 1000)
  } catch (e) {
    uni.showToast({ title: e.message, icon: 'none' })
  }
}

async function doLogin() {
  if (!/^1\d{10}$/.test(phone.value)) {
    uni.showToast({ title: '请输入 11 位手机号', icon: 'none' })
    return
  }
  if (!code.value) {
    uni.showToast({ title: '请输入验证码', icon: 'none' })
    return
  }
  try {
    const res = await api.login(phone.value, code.value)
    userStore.setToken(res.token)
    uni.showToast({ title: '登录成功' })
    // 演示页流程：登录 → 选岛屿
    uni.redirectTo({ url: '/pages/island/island' })
  } catch (e) {
    uni.showToast({ title: e.message, icon: 'none' })
  }
}
</script>

<style>
.login-grid {
  display: flex;
  flex-direction: column;
  padding: 20rpx;
}
.login-copy {
  position: relative;
  overflow: hidden;
  background: var(--green);
  color: #f3f1e8;
  padding: 48rpx 36rpx;
  margin-bottom: 20rpx;
}
.login-copy .muted { color: rgba(243, 241, 232, 0.75); }
.login-title {
  font-size: 64rpx;
  font-weight: 800;
  line-height: 1.1;
  margin-top: 16rpx;
}
.login-watermark {
  position: absolute;
  right: 16rpx;
  bottom: -8rpx;
  font-size: 110rpx;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.12);
  letter-spacing: 4rpx;
}
.login-form { margin: 0; }
@media (min-width: 800px) {
  .login-grid { flex-direction: row; align-items: stretch; }
  .login-copy { flex: 1; margin-bottom: 0; margin-right: 20rpx; }
  .login-form { flex: 1; }
}
</style>
