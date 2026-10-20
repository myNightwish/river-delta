<template>
  <view>
    <steps-bar :current="5" />

    <!-- island-head -->
    <view class="row between" style="margin: 24rpx 20rpx; align-items: flex-start; flex-wrap: wrap">
      <view style="flex: 1; min-width: 420rpx">
        <text class="eyebrow">交易已完成 · 队伍公屏</text>
        <view class="display" style="font-size: 64rpx; font-weight: 800; margin-top: 8rpx">发房间码，准备开局</view>
        <view class="muted" style="margin-top: 8rpx">队伍已锁定，在这里同步游戏房间码或 ID</view>
      </view>
      <button size="mini" class="btn-secondary" @click="goTeam" style="margin-top: 12rpx">查看已锁定队伍</button>
    </view>

    <view class="chat-shell">
      <!-- 左：队伍信息栏 -->
      <view class="chat-side">
        <view class="avatar-circle" style="width: 128rpx; height: 128rpx; font-size: 52rpx">{{ (teamName || '?').slice(0, 1) }}</view>
        <view class="h2" style="margin-top: 12rpx; text-align: center">{{ teamName || '队伍' }}</view>
        <view class="muted" style="margin-top: 6rpx; text-align: center">{{ islandName }} · {{ memberCount }}/3 已组队</view>
        <view class="muted" style="margin-top: auto; padding-top: 16rpx; border-top: 2rpx solid var(--line); font-size: 22rpx; text-align: center">
          房间码仅发送给本队成员，请勿外传
        </view>
      </view>

      <!-- 右：主区 -->
      <view class="chat-main">
        <view class="chat-bar">
          <text style="font-weight: 800">队伍公屏 · {{ memberCount }}/3 已准备</text>
          <text style="color: var(--green-2); font-weight: 700">● 在线</text>
        </view>

        <scroll-view scroll-y style="flex: 1; max-height: 480px; padding: 20rpx 24rpx" :scroll-top="scrollTop">
          <view v-for="m in messages" :key="m.id" class="msg-row" style="align-items: stretch">
            <template v-if="m.kind === 'system'">
              <view class="muted" style="text-align: center; margin-bottom: 12rpx">{{ m.content }}</view>
            </template>
            <template v-else>
              <view class="msg" :class="m.sender_id === meId ? 'msg-me' : 'msg-them'" style="align-self: flex-start" v-if="m.sender_id !== meId">
                <view class="muted" style="font-size: 22rpx; margin-bottom: 4rpx">#{{ m.sender_id }}</view>
                {{ m.content }}
              </view>
              <view class="msg msg-me" v-else>{{ m.content }}</view>
              <text class="msg-time" :style="{ textAlign: m.sender_id === meId ? 'right' : 'left' }">{{ fmtTime(m.created_at) }}</text>
            </template>
          </view>
        </scroll-view>

        <!-- room-share 快捷条 -->
        <view class="room-share">
          <text class="muted" style="flex: 1">快捷操作</text>
          <button size="mini" class="btn-ghost-orange" @click="quickKind = 'room_code'; showQuick = true" style="margin-right: 8rpx">发送房间码</button>
          <button size="mini" class="btn-ghost-orange" @click="quickKind = 'game_id'; showQuick = true">发送游戏 ID</button>
        </view>
        <view v-if="showQuick" class="row" style="padding: 0 24rpx 12rpx">
          <input class="input" style="flex: 1; margin: 0" v-model="quickText" :placeholder="quickKind === 'room_code' ? '输入房间码，如 DF-8823' : '输入游戏 ID'" />
          <button size="mini" class="btn-primary" style="margin-left: 8rpx" @click="sendQuick">发送</button>
          <button size="mini" class="btn-secondary" style="margin-left: 8rpx" @click="showQuick = false">取消</button>
        </view>

        <!-- 输入行 -->
        <view class="row" style="padding: 16rpx 24rpx">
          <input class="input" style="flex: 1; margin: 0" v-model="text" placeholder="输入房间码、游戏 ID 或队内消息…" maxlength="80" confirm-type="send" @confirm="send" />
          <button class="btn-primary" style="margin-left: 10rpx" @click="send">发送</button>
        </view>
        <view class="muted" style="text-align: center; padding-bottom: 16rpx; font-size: 22rpx">消息仅本队成员可见</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad, onUnload } from '@dcloudio/uni-app'
import StepsBar from '../../components/steps-bar.vue'
import { api } from '../../api/index.js'
import { WS_BASE } from '../../config.js'
import { userStore } from '../../store/user.js'

const matchId = ref(null)
const messages = ref([])
const text = ref('')
const scrollTop = ref(0)
const meId = ref(null)
const teamName = ref('')
const memberCount = ref(0)
const showQuick = ref(false)
const quickKind = ref('room_code')
const quickText = ref('')
let socketTask = null

const islandName = computed(() => {
  const isl = uni.getStorageSync('island')
  return isl === 'tech' ? '技术岛' : isl === 'companion' ? '陪玩岛' : ''
})

function fmtTime(t) {
  if (!t) return ''
  try {
    const d = new Date(t)
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  } catch {
    return ''
  }
}

async function load() {
  try {
    const me = await api.getMe()
    meId.value = me.user_id
    const team = await api.teamDetail(matchId.value)
    memberCount.value = team.members.length
    teamName.value = team.members.length ? `${team.members[0].nickname} 的队伍` : '队伍'
    messages.value = await api.messages(matchId.value)
    scrollBottom()
  } catch (e) {
    uni.showToast({ title: e.message, icon: 'none' })
  }
}

function scrollBottom() {
  scrollTop.value = 999999
  setTimeout(() => (scrollTop.value = 999998), 60)
}

function connect() {
  socketTask = uni.connectSocket({
    url: `${WS_BASE}/ws/chat/${matchId.value}?token=${userStore.token}`,
    complete: () => {},
  })
  socketTask.onMessage((res) => {
    try {
      messages.value.push(JSON.parse(res.data))
      scrollBottom()
    } catch {}
  })
  socketTask.onClose(() => setTimeout(() => connect(), 3000))
}

function pushLocal(kind, content) {
  messages.value.push({
    id: 'local-' + Date.now(),
    kind,
    content,
    sender_id: meId.value,
    created_at: new Date().toISOString(),
  })
  scrollBottom()
}

function send() {
  if (!text.value.trim() || !socketTask) return
  socketTask.send({ data: JSON.stringify({ content: text.value.trim() }) })
  text.value = ''
}

async function sendQuick() {
  if (!quickText.value.trim()) return
  try {
    await api.sendRoomCode(matchId.value, quickText.value.trim())
    pushLocal('room_code', quickText.value.trim())
    quickText.value = ''
    showQuick.value = false
    uni.showToast({ title: '已发送', icon: 'none' })
  } catch (e) {
    uni.showToast({ title: e.message, icon: 'none' })
  }
}

function goTeam() {
  uni.navigateTo({ url: `/pages/team/team?matchId=${matchId.value}` })
}

onLoad((q) => {
  matchId.value = q.matchId
  load()
  connect()
})
onUnload(() => {
  socketTask && socketTask.close()
})
</script>

<style>
@media (max-width: 799px) {
  .chat-side { display: none; }
  .chat-shell { flex-direction: column; }
}
</style>
