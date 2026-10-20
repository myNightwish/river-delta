<template>
  <view>
    <view style="margin: 28rpx 20rpx 8rpx">
      <text class="eyebrow">ME · 我的</text>
      <view class="display h2" style="margin-top: 8rpx">{{ me.nickname || '岛民' }}</view>
      <view class="muted" style="margin-top: 6rpx">{{ me.phone }} · 信誉分 {{ me.reputation }}</view>
    </view>

    <view class="card">
      <view class="row between">
        <text style="font-weight: 800">游戏档案</text>
        <button size="mini" class="btn-secondary" @click="goProfile">查看 / 更新</button>
      </view>
    </view>

    <view class="card">
      <view class="eyebrow" style="margin-bottom: 12rpx">我发布的房间</view>
      <view v-for="p in myPosts" :key="p.id" class="card-flat" style="margin: 0 0 12rpx 0">
        <view class="row between">
          <text style="font-weight: 800">{{ p.island === 'tech' ? '技术岛' : '陪玩岛' }} · 招{{ p.recruit_count }}人 · {{ p.member_count }}/{{ p.recruit_count + 1 }}人</text>
          <button size="mini" class="btn-ghost-orange" @click="toggleApps(p.id)">{{ openPost === p.id ? '收起申请' : '查看申请' }}</button>
        </view>
        <view v-if="openPost === p.id" style="margin-top: 12rpx">
          <view v-for="a in applications" :key="a.id" class="row between" style="padding: 10rpx 0; border-top: 2rpx solid var(--line)">
            <text>用户 #{{ a.applicant_id }}<text class="muted" v-if="a.message"> · {{ a.message }}</text></text>
            <view class="row" v-if="a.status === 'pending'">
              <button size="mini" class="btn-primary" @click="accept(a.id)">接受</button>
              <button size="mini" class="btn-secondary" style="margin-left: 8rpx" @click="reject(a.id)">拒绝</button>
            </view>
            <text class="tag" v-else>{{ a.status }}</text>
          </view>
          <view class="muted" v-if="!applications.length">暂无申请</view>
        </view>
      </view>
      <view class="muted" v-if="!myPosts.length">还没有发布房间</view>
    </view>

    <view class="card">
      <view class="eyebrow" style="margin-bottom: 12rpx">我的队伍</view>
      <view v-for="t in teams" :key="t.match_id" class="card-flat" style="margin: 0 0 12rpx 0" @click="goTeam(t.match_id)">
        <view class="row between">
          <text style="font-weight: 800">{{ t.island === 'tech' ? '技术岛' : '陪玩岛' }} · {{ t.member_count }}/3人</text>
          <text class="tag">{{ statusText(t) }}</text>
        </view>
        <view style="margin-top: 8rpx" v-if="t.pay_status === 'pending'"><text class="demo-tag">待支付 ¥1 →</text></view>
      </view>
      <view class="muted" v-if="!teams.length">还没有加入任何队伍</view>
    </view>

    <view class="card">
      <view class="eyebrow" style="margin-bottom: 12rpx">我的订单</view>
      <view v-for="o in orders" :key="o.order_no" class="row between" style="padding: 10rpx 0; border-top: 2rpx solid var(--line)">
        <text class="muted">{{ o.order_no.slice(0, 8) }}…</text>
        <text class="display" style="font-size: 36rpx; font-weight: 800">¥{{ (o.amount_cents / 100).toFixed(2) }}</text>
        <text class="tag">{{ payText(o.status) }}</text>
      </view>
      <view class="muted" v-if="!orders.length">暂无订单</view>
    </view>

    <view style="margin: 30rpx 20rpx">
      <button class="btn-warn" @click="logout" style="width: 100%">退出登录</button>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { api } from '../../api/index.js'
import { userStore } from '../../store/user.js'

const me = ref({})
const teams = ref([])
const orders = ref([])
const myPosts = ref([])
const openPost = ref(null)
const applications = ref([])

function statusText(t) {
  return { forming: '组建中', locked: '已锁定', done: '已完成', disbanded: '已解散' }[t.status] || t.status
}
function payText(s) {
  return { pending: '待支付', paid: '已支付', refunded: '已退款', consumed: '已核销' }[s] || s
}

async function load() {
  try {
    me.value = await api.getMe()
    teams.value = await api.myTeams()
    orders.value = await api.myOrders()
    const [t, c] = await Promise.all([api.islandPosts('tech'), api.islandPosts('companion')])
    myPosts.value = [...t, ...c].filter((p) => p.owner_id === me.value.user_id)
  } catch (e) {
    uni.showToast({ title: e.message, icon: 'none' })
  }
}

async function toggleApps(postId) {
  if (openPost.value === postId) {
    openPost.value = null
    return
  }
  openPost.value = postId
  applications.value = await api.postApplications(postId)
}

async function accept(appId) {
  await api.acceptApply(appId)
  uni.showToast({ title: '已接受' })
  applications.value = await api.postApplications(openPost.value)
  load()
}

async function reject(appId) {
  await api.rejectApply(appId)
  applications.value = await api.postApplications(openPost.value)
}

function goProfile() {
  uni.navigateTo({ url: '/pages/profile/profile' })
}
function goTeam(id) {
  uni.navigateTo({ url: `/pages/team/team?matchId=${id}` })
}
function logout() {
  userStore.logout()
}

onShow(load)
</script>
