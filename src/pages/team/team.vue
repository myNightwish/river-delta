<template>
  <view>
    <steps-bar :current="5" />

    <view v-if="team">
      <!-- success-hero -->
      <view class="success-hero anim-rise">
        <view>
          <view class="display" style="font-size: 52rpx; font-weight: 800">已进入队伍</view>
          <view style="margin-top: 8rpx; opacity: 0.85">
            当前 {{ team.members.length }}/3 · 招募 {{ recruitCount }} 人模式{{ isFull ? '已满员' : '组建中' }}
          </view>
        </view>
        <view class="avatar-group">
          <view v-for="m in team.members" :key="m.user_id" class="avatar-circle">{{ (m.nickname || '?').slice(0, 1) }}</view>
        </view>
      </view>

      <view style="margin: 24rpx 20rpx 0">
        <text class="eyebrow">队内信息已解锁</text>
        <view class="h2" style="margin-top: 8rpx">{{ ownerName }} 的队伍</view>
        <view class="muted" style="margin-top: 6rpx">以下为队员真实战绩，确认前请仔细核对</view>
      </view>

      <!-- roster 三列槽位 -->
      <view class="roster-grid">
        <view v-for="m in rosterSlots" :key="m.key" class="card-flat anim-rise" style="margin: 0; position: relative">
          <template v-if="m.member">
            <view class="muted" style="font-size: 22rpx">{{ m.role }}档案 · {{ m.tier || '' }}</view>
            <view style="font-weight: 800; font-size: 32rpx; margin-top: 8rpx">{{ m.member.nickname }}</view>
            <text class="display" style="position: absolute; top: 16rpx; right: 16rpx; font-size: 44rpx; font-weight: 800; color: var(--green-2)">
              KD {{ m.kda }}
            </text>
            <view class="muted" style="margin-top: 10rpx; font-size: 22rpx">{{ m.detail }}</view>
            <text class="tag" v-if="m.member.has_confirmed" style="background: var(--green-2); color: #fff; margin-top: 8rpx; display: inline-block">已确定</text>
            <text class="tag" v-else style="margin-top: 8rpx; display: inline-block">待确定</text>
          </template>
          <template v-else>
            <view class="muted" style="text-align: center; padding: 40rpx 0">虚位以待</view>
          </template>
        </view>
      </view>

      <!-- traits 行 -->
      <view class="row" style="margin: 16rpx 20rpx; flex-wrap: wrap">
        <text class="tag">匹配度 {{ matchScore }}%</text>
        <text class="tag">{{ islandName }}</text>
        <text class="tag">{{ team.members.length }}/3 已组队</text>
      </view>

      <!-- 票据式支付（待支付时） -->
      <view class="ticket anim-rise" v-if="payStatus === 'pending'">
        <text class="eyebrow" style="color: var(--yellow)">匹配保证金 · 待支付</text>
        <view class="row between" style="margin-top: 8rpx">
          <text class="ticket-price display">¥1</text>
          <button size="mini" class="btn-primary" @click="pay">支付（开发模拟）</button>
        </view>
        <text class="ticket-watermark display">TICKET · 02</text>
      </view>

      <!-- 黄色退费 note -->
      <view class="note-yellow">
        <text style="font-weight: 800">退费规则</text>
        <view class="muted" style="margin-top: 6rpx">
          确定组队前可随时取消，退回 ¥0.80（平台保留 ¥0.20 服务费）；确认组队后交易完成，不可撤销、不退款。
        </view>
      </view>

      <!-- 右对齐双按钮 -->
      <view class="team-actions" v-if="team.status === 'forming'">
        <button class="btn-secondary" @click="openRefund">取消匹配（退 ¥0.80）</button>
        <button class="btn-primary" @click="confirm">确认组队（不可撤销）</button>
      </view>
      <view style="margin: 24rpx 20rpx" v-if="team.status === 'locked'">
        <button class="btn-primary" style="width: 100%" @click="goChat">进入队伍公屏</button>
      </view>
    </view>
    <view class="card" v-else><view class="muted">加载中…</view></view>

    <!-- refundModal -->
    <view class="modal-mask" v-if="showRefund" @click="showRefund = false">
      <view class="modal-card anim-rise" @click.stop>
        <text class="eyebrow">取消匹配</text>
        <view class="h2" style="margin: 8rpx 0 12rpx">本次只退回 80%</view>
        <view class="muted">退出后退回 ¥0.80，平台保留 ¥0.20 服务费。队伍中其他成员不受影响。</view>
        <view class="row" style="margin-top: 24rpx">
          <button class="btn-secondary" style="flex: 1; margin-right: 12rpx" @click="showRefund = false">继续留在队伍</button>
          <button class="btn-primary" style="flex: 1" @click="quit">确认取消并退款</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import StepsBar from '../../components/steps-bar.vue'
import { api } from '../../api/index.js'

const matchId = ref(null)
const team = ref(null)
const payStatus = ref('')
const showRefund = ref(false)
const meId = ref(null)

const ownerName = computed(() => {
  if (!team.value || !team.value.members.length) return ''
  return team.value.members[0].nickname
})
const recruitCount = computed(() => Math.max(1, team.value ? team.value.members.length - 1 : 1))
const isFull = computed(() => team.value && team.value.members.length >= 3)
const islandName = computed(() => {
  const isl = uni.getStorageSync('island')
  return isl === 'tech' ? '技术岛' : isl === 'companion' ? '陪玩岛' : ''
})
const matchScore = computed(() => 94)

// roster 固定 3 槽位
const rosterSlots = computed(() => {
  const slots = []
  const members = team.value ? team.value.members : []
  for (let i = 0; i < 3; i++) {
    const m = members[i]
    if (m) {
      const [k, d, a] = (m.kda || '--/--/--').split('/')
      slots.push({
        key: m.user_id,
        member: m,
        role: i === 0 ? '房主' : '我的',
        tier: '',
        kda: d || '--',
        detail: '入队已解锁全部战绩',
      })
    } else {
      slots.push({ key: 'empty-' + i, member: null })
    }
  }
  return slots
})

async function load() {
  if (!matchId.value) return
  try {
    team.value = await api.teamDetail(matchId.value)
    const me = await api.getMe()
    meId.value = me.user_id
    const orders = await api.myOrders()
    const o = orders.find((x) => x.match_id === Number(matchId.value))
    payStatus.value = o ? o.status : ''
  } catch (e) {
    uni.showToast({ title: e.message, icon: 'none' })
  }
}

async function pay() {
  try {
    const order = await api.createOrder(Number(matchId.value))
    await api.payNotify(order.order_no)
    uni.showToast({ title: '支付成功' })
    load()
  } catch (e) {
    uni.showToast({ title: e.message, icon: 'none' })
  }
}

function confirm() {
  uni.showModal({
    title: '确认组队？',
    content: '确认后队伍锁定，交易完成，不可退出、不退款。',
    confirmText: '确认组队（不可撤销）',
    success: async (res) => {
      if (!res.confirm) return
      try {
        team.value = await api.confirmMatch(matchId.value)
        if (team.value.status === 'locked') {
          uni.showToast({ title: '组队成功，已锁定' })
        } else {
          uni.showToast({ title: '已确定，等待队友' })
        }
      } catch (e) {
        uni.showToast({ title: e.message, icon: 'none' })
      }
    },
  })
}

function openRefund() {
  showRefund.value = true
}

async function quit() {
  try {
    const r = await api.quitMatch(matchId.value)
    showRefund.value = false
    uni.showToast({ title: `已取消匹配，退回 ¥${(r.refund_cents / 100).toFixed(2)}` })
    setTimeout(() => uni.switchTab({ url: '/pages/island/island' }), 1200)
  } catch (e) {
    uni.showToast({ title: e.message, icon: 'none' })
  }
}

function goChat() {
  uni.navigateTo({ url: `/pages/chat/chat?matchId=${matchId.value}` })
}

onLoad((q) => {
  matchId.value = q.matchId
  load()
})
onShow(load)
</script>

<style>
.roster-grid {
  display: flex;
  flex-direction: column;
  margin: 16rpx 20rpx 0;
}
.roster-grid .card-flat { margin-bottom: 16rpx; }
.team-actions {
  display: flex;
  flex-direction: column-reverse;
  margin: 8rpx 20rpx 24rpx;
}
.team-actions button { width: 100%; margin-top: 12rpx; }
@media (min-width: 800px) {
  .roster-grid { flex-direction: row; }
  .roster-grid .card-flat { flex: 1; margin-bottom: 0; margin-right: 16rpx; }
  .roster-grid .card-flat:last-child { margin-right: 0; }
  .team-actions { flex-direction: row; justify-content: flex-end; }
  .team-actions button { width: auto; margin-top: 0; margin-left: 12rpx; }
}
</style>
