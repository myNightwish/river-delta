<template>
  <view>
    <steps-bar :current="view === 'lobby' ? 4 : 2" />

    <!-- ============ 选岛视图（routeView） ============ -->
    <view v-if="view === 'select'">
      <!-- 身份条 -->
      <view class="card-flat anim-rise" style="margin: 20rpx">
        <view class="row between">
          <view>
            <text style="font-weight: 800">已登录</text>
            <view class="muted" style="margin-top: 6rpx">首次建档只需两步：选岛屿 → 上传战绩</view>
          </view>
          <text class="utility-link" @click="logout">切换账号</text>
        </view>
      </view>

      <!-- hero -->
      <view class="row between" style="margin: 28rpx 20rpx; align-items: flex-start; flex-wrap: wrap">
        <view style="flex: 1; min-width: 480rpx">
          <text class="eyebrow">选择你的目的岛</text>
          <view class="display" style="font-size: 72rpx; font-weight: 800; line-height: 1.05; margin-top: 12rpx">
            今晚，你想登上<br />哪一座岛？
          </view>
        </view>
        <view class="muted" style="max-width: 420rpx; margin-top: 12rpx">
          两座岛各自独立匹配池。岛上浏览免费，发起匹配时再支付 ¥1 匹配费；KD 进入队伍后可见。
        </view>
      </view>

      <!-- 双岛卡片 -->
      <view class="route-grid">
        <view class="island-card island-fun anim-rise" @click="chooseIsland('companion')">
          <text class="island-index display">02</text>
          <text class="island-name display">陪玩岛</text>
          <view class="island-desc">轻松开黑 · 氛围拉满<br />找玩得来的队友</view>
          <view class="island-footer row between">
            <text>进入陪玩岛 · 免费浏览</text>
            <text class="circle-arrow">→</text>
          </view>
        </view>
        <view class="island-card island-tech anim-rise anim-rise-1" @click="chooseIsland('tech')">
          <text class="island-index display">01</text>
          <text class="island-name display">技术岛</text>
          <view class="island-desc">硬核上分 · 实力说话<br />找带得动的队友</view>
          <view class="island-footer row between">
            <text>进入技术岛 · 免费浏览</text>
            <text class="circle-arrow">→</text>
          </view>
        </view>
      </view>

      <view class="muted" style="margin: 24rpx 20rpx; font-size: 22rpx">
        上岛浏览不收取任何费用；只有在发起匹配并支付 ¥1 后，才会进入组队流程。
      </view>
    </view>

    <!-- ============ 免费入岛（payView） ============ -->
    <view v-if="view === 'entry'">
      <view class="card anim-rise" style="margin-top: 60rpx; text-align: center">
        <text class="eyebrow">{{ islandName }} · 免费上岛</text>
        <view class="display" style="font-size: 72rpx; font-weight: 800; margin: 16rpx 0">免费浏览<br />整座岛</view>
        <view class="muted">岛上所有队伍卡片免费查看（KD 入队后可见）。<br />只有发起匹配时，才需支付 ¥1 匹配费。</view>
        <button class="btn-primary" style="width: 100%; margin-top: 32rpx" @click="enterLobby">
          免费进入{{ islandName }}
        </button>
      </view>
    </view>

    <!-- ============ 大厅视图（islandView） ============ -->
    <view v-if="view === 'lobby'">
      <!-- island-head -->
      <view class="row between" style="margin: 24rpx 20rpx; align-items: flex-start; flex-wrap: wrap">
        <view style="flex: 1; min-width: 420rpx">
          <text class="eyebrow">{{ island === 'tech' ? '技术岛' : '陪玩岛' }}大厅 · 独立匹配池</text>
          <view class="display" style="font-size: 88rpx; font-weight: 800; line-height: 1; margin-top: 8rpx">{{ islandName }}</view>
          <view class="muted" style="margin-top: 10rpx">免费浏览队伍卡片，KD 进入队伍后可见</view>
        </view>
        <view class="card-flat" style="margin: 0; text-align: center">
          <text class="display" style="font-size: 56rpx; font-weight: 800; color: var(--green-2)">{{ liveCount }}</text>
          <view class="muted">支队伍在本岛</view>
        </view>
      </view>

      <!-- live-strip -->
      <view class="live-strip anim-rise">
        <text class="live-dot"></text>
        <text class="live-tag">● LIVE</text>
        <text style="flex: 1">{{ liveText }}</text>
      </view>

      <view class="island-layout">
        <!-- 左：筛选侧栏 -->
        <view class="filter-side">
          <view class="card-flat" style="margin: 0">
            <view class="h2" style="margin-bottom: 16rpx">本岛匹配偏好</view>
            <button class="btn-primary" style="width: 100%; margin-bottom: 20rpx" @click="openBuild">
              发起建房 · 招 {{ buildForm.recruit_count }} 人 · ¥1
            </button>

            <view class="muted" style="margin-bottom: 8rpx">切换独立岛屿</view>
            <view class="seg" style="margin: 0 0 16rpx">
              <view class="seg-item" :class="{ 'seg-on': island === 'companion' }" @click="switchIsland('companion')">陪玩岛</view>
              <view class="seg-item" :class="{ 'seg-on': island === 'tech' }" @click="switchIsland('tech')">技术岛</view>
            </view>

            <view class="muted" style="margin-bottom: 8rpx">招募人数 · 队伍最多 3 人</view>
            <view class="row" style="margin-bottom: 16rpx; flex-wrap: wrap">
              <text class="chip" :class="{ 'chip-on': buildForm.recruit_count === 1 }" @click="buildForm.recruit_count = 1">招 1 人</text>
              <text class="chip" :class="{ 'chip-on': buildForm.recruit_count === 2 }" @click="buildForm.recruit_count = 2">招 2 人</text>
            </view>

            <view class="muted" style="margin-bottom: 8rpx">KD 门槛（可空）</view>
            <input class="input" v-model.number="kdFilter" type="digit" placeholder="如 1.5" style="margin-bottom: 16rpx" />

            <view class="muted" style="margin-bottom: 8rpx">希望队友</view>
            <view class="row" style="margin-bottom: 16rpx; flex-wrap: wrap">
              <text class="chip" :class="{ 'chip-on': buildForm.mic_required }" @click="buildForm.mic_required = !buildForm.mic_required">有麦</text>
            </view>

            <view class="muted" style="margin-bottom: 8rpx">预计开局</view>
            <input class="input" v-model="buildForm.play_time" placeholder="如 今晚20:00" style="margin-bottom: 8rpx" />
            <view class="muted" style="font-size: 22rpx">发起建房后，其他岛民可申请加入；你在「我的」中确认申请。</view>
          </view>
        </view>

        <!-- 右：候选区（玩家队伍卡片 = 房间） -->
        <view class="candidate-area">
          <view v-for="(p, i) in posts" :key="p.id" class="card-flat anim-rise" style="margin: 0 0 20rpx; position: relative">
            <text class="demo-tag" style="position: absolute; top: 16rpx; right: 16rpx">LIVE</text>

            <view class="row" style="margin-top: 8rpx">
              <view class="avatar-circle avatar-sm">{{ (p.owner_nickname || '?').slice(0, 1) }}</view>
              <view style="margin-left: 16rpx">
                <text style="font-weight: 800; font-size: 32rpx">{{ p.owner_nickname }} 的队伍</text>
                <view class="muted">{{ p.mode }} · {{ p.island === 'tech' ? '技术岛' : '陪玩岛' }}</view>
              </view>
            </view>

            <view class="row between" style="margin-top: 14rpx">
              <text class="muted">当前 {{ p.member_count }}/{{ p.recruit_count + 1 }}</text>
              <text style="color: var(--orange); font-weight: 800">招 {{ p.recruit_count }} 人 · 满员 {{ p.recruit_count + 1 }} 人</text>
            </view>

            <view class="row between" style="margin-top: 10rpx">
              <text class="muted">偏好匹配度</text>
              <text class="display" style="font-size: 52rpx; font-weight: 800; color: var(--green-2)">{{ p.match_score ?? '-' }}<text style="font-size: 26rpx">%</text></text>
            </view>

            <view class="row" style="margin-top: 10rpx; flex-wrap: wrap">
              <text class="tag" v-if="p.owner_tier_name">{{ p.owner_tier_name }}{{ p.owner_tier_stars ? ' ★' + p.owner_tier_stars : '' }}</text>
              <text class="tag" v-if="p.owner_matches">{{ p.owner_matches }} 局</text>
              <text class="tag" v-if="p.mic_required">有麦</text>
              <text class="tag" v-if="p.play_time">{{ p.play_time }}</text>
            </view>

            <view class="kd-locked" style="margin-top: 10rpx">KD 进入队伍后可见</view>

            <button class="btn-ghost-orange" style="width: 100%; margin-top: 16rpx" @click="applyPost(p.id)">
              申请匹配 · 入队后支付 ¥1
            </button>
          </view>

          <view class="muted" style="text-align: center; padding: 40rpx" v-if="!posts.length">
            本岛还没有队伍，来发第一间吧
          </view>
        </view>
      </view>
    </view>

    <!-- payModal：发起建房确认 -->
    <view class="modal-mask" v-if="showBuildModal" @click="showBuildModal = false">
      <view class="modal-card anim-rise" @click.stop>
        <text class="eyebrow">发起建房</text>
        <view class="h2" style="margin: 8rpx 0 16rpx">确认发布房间？</view>
        <view class="kv-list">
          <view class="kv-row"><text class="muted">岛屿</text><text>{{ islandName }}</text></view>
          <view class="kv-row"><text class="muted">招募</text><text>招 {{ buildForm.recruit_count }} 人（满员 {{ buildForm.recruit_count + 1 }} 人）</text></view>
          <view class="kv-row"><text class="muted">匹配费</text><text>¥1（队员入队时各自支付）</text></view>
        </view>
        <view class="row" style="margin-top: 24rpx">
          <button class="btn-secondary" style="flex: 1; margin-right: 12rpx" @click="showBuildModal = false">暂不发布</button>
          <button class="btn-primary" style="flex: 1" @click="confirmBuild">确认发布</button>
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
import { userStore } from '../../store/user.js'

const view = ref('select') // select | entry | lobby
const island = ref(uni.getStorageSync('island') || '')
const posts = ref([])
const kdFilter = ref(null)
const showBuildModal = ref(false)
const buildForm = ref({ recruit_count: 1, mic_required: false, play_time: '' })
const liveIdx = ref(0)
let liveTimer = null

const islandName = computed(() => (island.value === 'tech' ? '技术岛' : '陪玩岛'))
const liveCount = computed(() => posts.value.length)
const liveText = computed(() => {
  if (!posts.value.length) return '暂无招募中的队伍'
  const p = posts.value[liveIdx.value % posts.value.length]
  return `${p.owner_nickname} 的队伍正在招 ${p.recruit_count} 人 · 当前 ${p.member_count}/${p.recruit_count + 1}`
})

async function loadPosts() {
  if (!island.value) return
  try {
    const all = await api.islandPosts(island.value)
    posts.value = kdFilter.value ? all.filter((p) => true) : all
  } catch (e) {
    uni.showToast({ title: e.message, icon: 'none' })
  }
}

function startLiveRotation() {
  clearInterval(liveTimer)
  liveTimer = setInterval(() => {
    liveIdx.value++
  }, 3200)
}

function switchIsland(v) {
  island.value = v
  uni.setStorageSync('island', v)
  liveIdx.value = 0
  loadPosts()
}

async function chooseIsland(v) {
  island.value = v
  uni.setStorageSync('island', v)
  try {
    const me = await api.getMe()
    if (me.profile) {
      view.value = 'entry'
    } else {
      uni.navigateTo({ url: `/pages/profile/profile?island=${v}` })
    }
  } catch (e) {
    uni.showToast({ title: e.message, icon: 'none' })
  }
}

function enterLobby() {
  view.value = 'lobby'
  loadPosts()
  startLiveRotation()
}

function openBuild() {
  showBuildModal.value = true
}

async function confirmBuild() {
  try {
    const data = {
      island: island.value,
      recruit_count: buildForm.value.recruit_count,
      mic_required: buildForm.value.mic_required,
    }
    if (buildForm.value.play_time) data.play_time = buildForm.value.play_time
    if (kdFilter.value) data.kd_min = kdFilter.value
    await api.createPost(data)
    showBuildModal.value = false
    uni.showToast({ title: '房间已发布' })
    loadPosts()
  } catch (e) {
    uni.showToast({ title: e.message, icon: 'none' })
  }
}

async function applyPost(postId) {
  uni.showModal({
    title: '申请匹配',
    content: '申请后待房主确认。入队后需支付 ¥1 匹配费，确定组队前退出退 80%。',
    confirmText: '确认申请',
    success: async (res) => {
      if (!res.confirm) return
      try {
        await api.applyPost(postId)
        uni.showToast({ title: '已申请，待房主确认' })
      } catch (e) {
        uni.showToast({ title: e.message, icon: 'none' })
      }
    },
  })
}

function logout() {
  uni.removeStorageSync('island')
  userStore.logout()
}

onLoad((q) => {
  if (q.island) {
    island.value = q.island
    uni.setStorageSync('island', q.island)
  }
  if (q.view === 'entry' && island.value) {
    view.value = 'entry'
  } else if (q.view === 'lobby' && island.value) {
    view.value = 'lobby'
  } else {
    view.value = island.value ? 'lobby' : 'select'
  }
})

onShow(() => {
  if (view.value === 'lobby') {
    loadPosts()
    startLiveRotation()
  }
})
</script>

<style>
.route-grid {
  display: flex;
  flex-direction: column;
  margin: 20rpx;
}
.route-grid .island-card { margin-bottom: 20rpx; min-height: 300rpx; }
.island-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 28rpx;
  color: #fff;
  font-weight: 700;
}
.island-card .island-name { margin-top: 64rpx; display: block; }
.island-layout {
  display: flex;
  flex-direction: column;
  margin: 20rpx;
}
.filter-side { margin-bottom: 20rpx; }
.candidate-area { flex: 1; }
@media (min-width: 800px) {
  .route-grid { flex-direction: row; }
  .route-grid .island-card { flex: 1; margin-bottom: 0; }
  .route-grid .island-card:first-child { margin-right: 20rpx; }
  .island-layout { flex-direction: row; align-items: flex-start; }
  .filter-side { width: 600rpx; flex-shrink: 0; margin-right: 20rpx; margin-bottom: 0; position: sticky; top: 20rpx; }
}
</style>
