<template>
  <view>
    <view class="hall-head"><view><view class="title">{{recommended?'适合我的队友':'全部公开招募'}}</view><view class="caption">{{total}} 位候选 · 正在招募</view></view><button @click="$emit('refresh')" :disabled="busy">刷新</button></view>
    <view class="search"><input :value="keyword" placeholder="搜索玩家昵称" maxlength="64" @input="$emit('search',$event.detail.value)"/></view><view class="controls"><button :class="{selected:recommended}" @click="$emit('mode',true)">适合我的</button><button :class="{selected:!recommended}" @click="$emit('mode',false)">全部公开</button></view>
    <view v-if="!canRecommend" class="hint">先浏览，找到合适的队友后发布你的条件。</view>
    <view v-if="!items.length" class="empty"><b>{{recommended?'暂时没有符合条件的队友':'暂时没有公开招募'}}</b><view>试试查看全部招募，或调整本局条件。</view><button v-if="recommended" @click="$emit('mode',false)">看看全部公开招募</button><button @click="$emit('edit')">填写或调整本局条件</button></view>
    <view class="cards">
      <view v-for="c in items" :key="c.id" class="candidate">
        <view class="card-top"><b>{{c.profile.nickname}}</b><text>{{c.profile.goal}}局 · 找 1 位队友</text></view>
        <view class="meta">{{c.profile.region}} / {{c.profile.platform}} · {{c.profile.map}} · {{c.profile.difficulty}}</view>
        <view class="facts"><view>预算 {{c.profile.budget_min}}–{{c.profile.budget_max}} 万 / 人</view><view>{{ranks[c.profile.rank-1]}} · 自评 {{c.profile.skill}} 档 · 接受相差 {{c.profile.gap}} 档</view><view>{{c.profile.language}} · {{c.profile.voice}} · {{c.profile.slot}}</view></view>
        <view v-if="c.assessment" class="checks"><view v-for="check in c.assessment.checks" :key="check.label" :class="{conflict:!check.ok}">{{check.ok?'✓':'△ 不满足：'}} {{check.label}}</view><view v-for="conflict in c.assessment.hard_conflicts" :key="conflict" class="conflict">△ {{conflict}}</view></view>
        <view class="caption"></view>
        <button class="invite" :disabled="busy || !c.can_invite" @click="$emit('invite',c.id)">{{c.can_invite?'申请一起玩 · 双方确认后成局':myStatus==='matched'?'已有待确认队友':myStatus==='expired'?'重新发布后可申请':myStatus!=='waiting'?'先发布本局条件':'条件不符'}}</button>
      </view>
    </view>
    <view class="pagination"><button :disabled="page===0 || busy" @click="$emit('page',page-1)">上一页</button><text>第 {{page+1}} 页</text><button :disabled="(page+1)*6>=total || busy" @click="$emit('page',page+1)">下一页</button></view>
    <button v-if="items.length && waiting" class="change" :disabled="busy" @click="$emit('skip')">换一批</button><view v-if="waiting" class="caption">暂时跳过这批候选，继续找其他队友。</view>
  </view>
</template>
<script setup>
defineProps({items:{type:Array,default:()=>[]},total:Number,page:Number,recommended:Boolean,canRecommend:Boolean,busy:Boolean,waiting:Boolean,myStatus:String,keyword:String})
defineEmits(['refresh','mode','edit','invite','page','skip','search'])
const ranks=['青铜','白银','黄金','白金','钻石','黑鹰','巅峰']
</script>
<style scoped>
.hall-head,.controls,.card-top,.pagination{display:flex;align-items:center;justify-content:space-between;gap:12px}.hall-head{margin-bottom:20px}.title{font-size:26px;font-weight:800}.caption{font-size:12px;line-height:1.8;color:#5d675f;margin-top:10px}.controls{justify-content:flex-start;margin-bottom:20px;flex-wrap:wrap}button{font-size:13px;margin:0;border:1px solid #c9c9be;background:#fffdf7;padding:9px 15px;line-height:1.6}.selected{background:#1b4d3e;color:white;border-color:#1b4d3e}.cards{display:grid;grid-template-columns:1fr 1fr;gap:18px}.candidate{background:#fffdf7;border:1px solid #c9c9be;padding:24px}.card-top{align-items:flex-start}.card-top b{font-size:20px;overflow-wrap:anywhere}.card-top text{font-size:11px;color:#286952;background:#e8eee7;padding:5px 8px;white-space:nowrap}.meta{font-size:12px;color:#5d675f;margin-top:12px}.facts{font-size:13px;line-height:2;border-top:1px solid #c9c9be;padding-top:14px;margin-top:14px}.checks{font-size:12px;line-height:2;color:#286952;padding:14px 0;border-top:1px solid #c9c9be;margin-top:14px}.conflict{color:#9a3b21}.invite,.change{width:100%;margin-top:18px;color:#eb5d27;border-color:#eb5d27;font-weight:700}.empty{background:#fffdf7;border:1px dashed #c9c9be;padding:40px 20px;text-align:center;font-size:14px;line-height:2}.empty button{margin:15px 8px 0}.hint{padding:16px;border-left:3px solid #f5c647;background:#ece8d9;font-size:13px;margin-bottom:18px}.pagination{justify-content:center;margin:24px 0 12px;font-size:13px}button[disabled]{opacity:.45}@media(max-width:700px){.cards{grid-template-columns:1fr}.candidate{padding:20px}.hall-head{align-items:flex-start}.card-top{flex-wrap:wrap}}
.search{margin-bottom:16px}.search input{box-sizing:border-box;width:100%;height:44px;padding:10px 14px;background:#fffdf7;border:1px solid #c9c9be;font-size:14px}
</style>
