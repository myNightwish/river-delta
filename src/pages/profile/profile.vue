<template>
<view>
<steps-bar:current="3" />

<view class="profile-split">
<!-- 左：主面板 -->
<view class="profile-main">
<view class="card anim-rise" style="margin: 20rpx 20rpx 0">
<text class="tag" style="background: var(--cyan); color: #fff; border: none">{{ islandName}}</text>
<view class="h2" style="margin-top: 12rpx">{{ hasProfile? '查看与更新玩家档案': '首次登录，建立玩家档案'}}</view>
<view class="muted" style="margin-top: 8rpx">
以截图为准。匹配用 KD 取战损比中间值，上传一次即可。
</view>
</view>

<!-- 已建档横幅 -->
<view class="card-flat anim-rise" v-if="hasProfile" style="margin: 20rpx 20rpx 0; border-left: 8rpx solid var(--green-2)">
<view class="row between">
<text style="font-weight: 800">✓ 玩家档案已建立</text>
<text class="tag">已关联当前账号</text>
</view>
<view class="muted" style="margin-top: 6rpx" v-if="form.tier_name">
{{ form.tier_name}}{{ form.tier_stars? ' ★' + form.tier_stars: ''}} · {{ form.matches}} 局
</view>
</view>

<!-- OCR 模板说明 -->
<view class="card-flat" style="margin: 20rpx 20rpx 0">
<text class="eyebrow">OCR 模板说明</text>
<view class="muted" style="margin-top: 8rpx">
请截取「角色信息 - 详细数据 - 烽火地带」整页。系统识别段位、战局数、战损比（K/D/A 取中间值作为匹配 KD）、撤离率、五维评分等字段，UID 仅用于去重，展示时隐藏。
</view>
</view>

<!-- 上传区 -->
<view class="card" style="margin-top: 20rpx">
<view class="drop-zone" @click="chooseShot">
<view style="font-size: 64rpx">＋</view>
<view style="font-weight: 800; margin-top: 8rpx">点击上传战绩截图</view>
<view class="muted" style="margin-top: 6rpx">支持 JPG、PNG、WEBP · 不会用于其他用途</view>
</view>
<view v-if="ocrTip" class="muted" style="text-align: center">{{ ocrTip}}</view>

<view class="divider-or">或</view>
<button class="btn-secondary" style="width: 100%" @click="fillManual">跳过上传，手动填写</button>
</view>

<!-- OCR 结果确认区 -->
<view class="card anim-rise" v-if="ocrDone" style="margin-top: 20rpx">
<view class="row between">
<text class="h2">OCR 识别结果</text>
<text style="color: var(--green-2); font-weight: 800">✓ 已校验</text>
</view>

<view class="stat-grid" style="margin-top: 16rpx">
<view class="stat-cell">
<view class="stat-box">
<view class="muted">段位</view>
<view class="stat-num display">{{ form.tier_name || '-'}}{{ form.tier_stars? ' ★' + form.tier_stars: ''}}</view>
</view>
</view>
<view class="stat-cell">
<view class="stat-box">
<view class="muted">匹配 KD</view>
<view class="stat-num display" style="color: var(--green-2)">{{ form.kda_d || '-'}}</view>
</view>
</view>
<view class="stat-cell">
<view class="stat-box">
<view class="muted">战局</view>
<view class="stat-num display">{{ form.matches || '-'}}</view>
</view>
</view>
<view class="stat-cell">
<view class="stat-box">
<view class="muted">撤离率</view>
<view class="stat-num display">{{ form.extract_rate? form.extract_rate + '%': '-'}}</view>
</view>
</view>
</view>

<view class="kv-list">
<view class="kv-row"><text class="muted">战损比 K/D/A</text><text>{{ form.kda_k}}/{{ form.kda_d}}/{{ form.kda_a}}</text></view>
<view class="kv-row"><text class="muted">段位分</text><text>{{ form.tier_score}}</text></view>
<view class="kv-row"><text class="muted">击败干员</text><text>{{ form.kills}}</text></view>
<view class="kv-row"><text class="muted">游戏 UID</text><text class="muted">已识别 · 展示时隐藏</text></view>
</view>

<view class="muted" style="margin: 16rpx 0 8rpx">你的常用位置</view>
<view class="row" style="flex-wrap: wrap">
<text v-for="r in roles":key="r" class="chip":class="{ 'chip-on': form.role === r}" @click="form.role = r">{{ r}}</text>
</view>

<view class="muted" style="margin: 16rpx 0 8rpx">沟通习惯</view>
<view class="row" style="flex-wrap: wrap">
<text v-for="c in comms":key="c" class="chip":class="{ 'chip-on': form.comm === c}" @click="form.comm = c">{{ c}}</text>
</view>

<view class="row" style="margin-top: 24rpx; justify-content: flex-end">
<button class="btn-secondary" @click="backToIsland" style="margin-right: 12rpx">返回选岛屿</button>
<button class="btn-primary" @click="save">{{ hasProfile? '保存更新并返回': '保存为我的档案'}}</button>
</view>
</view>

<!-- 手动填写表单 -->
<view class="card" v-if="manualMode &&!ocrDone" style="margin-top: 20rpx">
<text class="eyebrow">手动填写</text>
<view class="row" style="margin-top: 12rpx"><text style="width: 180rpx" class="muted">游戏昵称</text><input class="input" style="flex: 1" v-model="form.game_name" /></view>
<view class="row"><text style="width: 180rpx" class="muted">段位</text><input class="input" style="flex: 1" v-model="form.tier_name" placeholder="如 钻石II" /></view>
<view class="row"><text style="width: 180rpx" class="muted">段位分</text><input class="input" style="flex: 1" v-model.number="form.tier_score" type="number" /></view>
<view class="row"><text style="width: 180rpx" class="muted">战局数</text><input class="input" style="flex: 1" v-model.number="form.matches" type="number" /></view>
<view class="row"><text style="width: 180rpx" class="muted">战损比</text>
<input class="input" style="flex: 1" v-model.number="form.kda_k" type="digit" placeholder="K" />
<input class="input" style="flex: 1" v-model.number="form.kda_d" type="digit" placeholder="D" />
<input class="input" style="flex: 1" v-model.number="form.kda_a" type="digit" placeholder="A" />
</view>
<view class="row"><text style="width: 180rpx" class="muted">撤离率%</text><input class="input" style="flex: 1" v-model.number="form.extract_rate" type="digit" /></view>
<view class="row"><text style="width: 180rpx" class="muted">击败干员</text><input class="input" style="flex: 1" v-model.number="form.kills" type="number" /></view>
<view class="row" style="margin-top: 20rpx; justify-content: flex-end">
<button class="btn-secondary" @click="backToIsland" style="margin-right: 12rpx">返回选岛屿</button>
<button class="btn-primary" @click="save">{{ hasProfile? '保存更新并返回': '保存为我的档案'}}</button>
</view>
</view>
</view>

<!-- 右：摘要侧栏 -->
<view class="profile-side">
<view class="card-flat anim-rise anim-rise-1" style="margin: 20rpx 20rpx 0">
<text class="eyebrow">玩家档案 · 通行证</text>
<view class="h2" style="margin: 8rpx 0 12rpx">岛民通行证</view>
<view class="kv-list">
<view class="kv-row"><text class="muted">登录状态</text><text>已登录</text></view>
<view class="kv-row"><text class="muted">数据来源</text><text>战绩截图 OCR</text></view>
<view class="kv-row"><text class="muted">档案状态</text><text>{{ hasProfile? '已建立': '未建立'}}</text></view>
<view class="kv-row"><text class="muted">目的岛屿</text><text>{{ islandName}}</text></view>
</view>
</view>
<view class="note-yellow">
<text style="font-weight: 800">赛季更新时可重新上传</text>
<view class="muted" style="margin-top: 6rpx">档案一次建立长期有效，新赛季开始后建议重新上传截图刷新数据。</view>
</view>
</view>
</view>
</view>
</template>

<script setup>
import { ref, computed} from 'vue'
import { onLoad, onShow} from '@dcloudio/uni-app'
import StepsBar from '../../components/steps-bar.vue'
import { api} from '../../api/index.js'

const island = ref('')
const hasProfile = ref(false)
const ocrTip = ref('')
const ocrDone = ref(false)
const manualMode = ref(false)
const roles = ['医疗', '突击', '侦察', '工程']
const comms = ['有麦交流', '文字报点', '听指挥', '随意玩']
const form = ref({
game_name: '', game_uid: '', tier_name: '', tier_stars: 0, tier_score: 0,
matches: 0, kda_k: 0, kda_d: 0, kda_a: 0, extract_rate: 0, kills: 0,
role: '', comm: '',
})

const islandName = computed(() => (island.value === 'tech'? '技术岛': island.value === 'companion'? '陪玩岛': '—'))

async function load() {
try {
const me = await api.getMe()
if (me.profile) {
hasProfile.value = true
Object.assign(form.value, me.profile)
}
} catch (e) {
uni.showToast({ title: e.message, icon: 'none'})
}
}

function fillManual() {
manualMode.value = true
}

async function chooseShot() {
uni.chooseImage({
count: 1,
success: async (res) => {
ocrTip.value = '上传中…'
try {
const up = await api.ocrUpload(res.tempFilePaths[0])
ocrTip.value = '识别中…'
for (let i = 0; i < 15; i++) {
await new Promise((r) => setTimeout(r, 2000))
const result = await api.ocrResult(up.job_id)
if (result.status === 'done') {
Object.assign(form.value, result.result.fields)
ocrDone.value = true
ocrTip.value = ''
uni.showToast({ title: '识别完成，请确认'})
return
}
if (result.status === 'failed') break
}
ocrTip.value = '识别超时，请手动填写'
manualMode.value = true
} catch (e) {
ocrTip.value = '识别失败：' + e.message
manualMode.value = true
}
},
})
}

async function save() {
try {
await api.saveProfile(form.value)
uni.showToast({ title: '档案已保存'})
// 演示页流程：保存 → 免费上岛页
uni.redirectTo({ url: `/pages/island/island?view=entry&island=${island.value}`})
} catch (e) {
uni.showToast({ title: e.message, icon: 'none'})
}
}

function backToIsland() {
uni.redirectTo({ url: '/pages/island/island'})
}

onLoad((q) => {
if (q.island) {
island.value = q.island
uni.setStorageSync('island', q.island)
} else {
island.value = uni.getStorageSync('island') || ''
}
load()
})
onShow(load)
</script>

<style>
.profile-split {
display: flex;
flex-direction: column;
}
.profile-main { flex: 1.35; min-width: 0;}
.profile-side { display: none;}
@media (min-width: 800px) {
.profile-split { flex-direction: row; align-items: flex-start;}
.profile-side { display: block; flex: 0.65;}
}
</style>
