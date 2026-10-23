<template>
  <view>
    <view class="hall-head"><view><view class="title">{{recommended?'适合我的队友':'全部公开招募'}}</view></view><view class="hall-actions"><button class="change" :disabled="busy || !waiting || !items.length" @click="$emit('skip')">换一批</button><button @click="$emit('refresh')" :disabled="busy">刷新</button></view></view>
    <view class="caption hall-caption"><text class="candidate-count">{{total}} 位候选 · 正在招募</text><slot name="status"/></view>
    <view class="controls"><button :class="{selected:recommended}" @click="$emit('mode',true)">适合我的</button><button :class="{selected:!recommended}" @click="$emit('mode',false)">全部公开</button></view>
    <view v-if="!canRecommend" class="hint">先浏览，找到合适的队友后发布你的条件</view>
    <view v-if="!items.length" class="empty"><b>{{recommended?'暂时没有符合条件的队友':'暂时没有公开招募'}}</b><view class="empty-note">{{recommended?'查看其他招募，或调整招募条件':'稍后刷新，或设置招募条件'}}</view><view class="empty-actions"><button v-if="recommended" class="empty-primary" @click="$emit('mode',false)">查看全部招募</button><button :class="recommended?'empty-secondary':'empty-primary'" @click="$emit('edit')">{{canRecommend?'调整招募条件':'设置招募条件'}}</button></view></view>
    <view class="cards">
      <view v-for="c in items" :key="c.id" class="candidate">
        <view class="card-top"><view class="player-name"><text v-if="c.profile.is_demo" class="demo-badge">测试</text><b :title="c.profile.nickname">{{c.profile.is_demo?c.profile.nickname.replace(/^【测试】/,''):c.profile.nickname}}</b></view><text class="goal-tag">{{c.profile.goal}}</text></view>
        <view class="context-tags"><text v-for="pair in (c.profile.maps||[{map:c.profile.map,difficulty:c.profile.difficulty}])" :key="pair.map" class="context-tag">{{pair.map}} · {{pair.difficulty}}</text><text class="context-tag">{{c.profile.region}}</text><text class="context-tag">{{platformNames[c.profile.platform]||c.profile.platform}}</text></view>
        <view class="facts"><view v-for="row in profileRows(c.profile)" :key="row.key" class="fact-row"><text class="fact-label">{{row.label}}</text><view class="tag-list"><text v-for="tag in row.tags" :key="tag" class="info-tag" :class="{accent:row.key==='partner'}">{{tag}}</text></view></view></view>
        <view v-if="c.assessment" class="checks"><text v-for="check in c.assessment.checks" :key="check.label" class="check-tag" :class="{conflict:!check.ok}" :title="check.label" :aria-label="(check.ok?'符合：':'不符合：')+check.label"><text class="check-icon">{{check.ok?'✓':'×'}}</text>{{checkNames[check.label]||check.label}}</text><text v-for="conflict in c.assessment.hard_conflicts" :key="conflict" class="check-tag conflict" :title="conflict"><text class="check-icon">×</text>{{conflict.replace(/不一致$/,'')}}</text></view>
        <button class="invite" :disabled="busy || !c.can_invite" @click="$emit('invite',c.id)">{{c.can_invite?'申请组队':myStatus==='matched'?'已有待确认队友':myStatus==='expired'?'重新发布后可申请':myStatus!=='waiting'?'先发布招募条件':'条件不符'}}</button>
      </view>
    </view>
    <view class="pagination"><button :disabled="page===0 || busy" @click="$emit('page',page-1)">上一页</button><text>第 {{page+1}} 页</text><button :disabled="(page+1)*6>=total || busy" @click="$emit('page',page+1)">下一页</button></view>

  </view>
</template>
<script setup>
defineProps({items:{type:Array,default:()=>[]},total:Number,page:Number,recommended:Boolean,canRecommend:Boolean,busy:Boolean,waiting:Boolean,myStatus:String})
defineEmits(['refresh','mode','edit','invite','page','skip'])
const ranks=['青铜','白银','黄金','白金','钻石','黑鹰','巅峰']
const platformNames={PC:'电脑端',Console:'主机端',Mobile:'手机端'}
const styleNames=['很保守','偏保守','均衡','偏激进','很激进']
const checkNames={'本局目标一致':'目标','装备预算有交集':'预算','装备等级一致':'装备','任务类型一致':'任务','地图与难度有交集':'战场','有共同任务':'任务','对方装备达到我的门槛':'我接受对方装备','我的装备达到对方门槛':'对方接受我装备','对方实力在我接受范围内':'我接受对方实力','我的实力在对方接受范围内':'对方接受我实力','对方实力符合我的范围':'我接受对方实力','我的实力符合对方范围':'对方接受我实力','对方打法符合我的期望':'我接受对方打法','我的打法符合对方期望':'对方接受我打法'}
const score=value=>new Intl.NumberFormat('en-US',{maximumFractionDigits:2}).format(value)
function profileRows(p){
 if(p.schema_version===4){
  const rows=[]
  if(p.goal==='33任务'&&p.tasks.length)rows.push({key:'tasks',label:'任务',tags:p.tasks})
  if(p.goal!=='卡战备跑刀')rows.push({key:'equipment',label:'装备',tags:['头 '+p.helmet,'甲 '+p.armor,'弹 '+p.ammo]})
  rows.push({key:'self',label:'自身',tags:['实力 '+score(p.strength_score),p.style+' · '+styleNames[p.style-1]]})
  rows.push({key:'partner',label:'队友',tags:['实力 '+score(p.strength_min)+'–'+score(p.strength_max),'打法 '+p.partner_style_min+'–'+p.partner_style_max]})
  if(p.goal!=='卡战备跑刀')rows.push({key:'requirements',label:'门槛',tags:['头 ≥'+p.partner_helmet_min,'甲 ≥'+p.partner_armor_min,'弹 ≥'+p.partner_ammo_min]})
  rows.push({key:'communication',label:'沟通',tags:[p.language,p.voice,p.slot]})
  return rows
 }

 const current=p.strength_score!==undefined && p.strength_score!==null
 const rows=[]
 const gear=[]
 if(p.goal==='33任务' && p.task)gear.push(p.task)
 if(p.goal!=='跑刀' && p.armor!=null)gear.push(p.armor+' 级甲')
 if(p.goal!=='跑刀' && p.ammo!=null)gear.push(p.ammo+' 级弹')
 if(!current && p.budget_min!=null)gear.push('预算 '+p.budget_min+'–'+p.budget_max+' 万')
 if(gear.length)rows.push({key:'session',label:'本局',tags:gear})
 rows.push({key:'self',label:'自身',tags:current?['实力 '+score(p.strength_score),p.style+' · '+(styleNames[p.style-1]||'')]:[ranks[p.rank-1]||'段位未填','自评 '+p.skill+' 档']})
 if(current)rows.push({key:'partner',label:'队友',tags:['实力 '+score(p.strength_min)+'–'+score(p.strength_max),p.partner_style+' · '+(styleNames[p.partner_style-1]||'')]})
 rows.push({key:'communication',label:'沟通',tags:[p.language,p.voice,p.slot].filter(Boolean)})
 return rows
}

</script>
<style scoped>
.hall-head,.controls,.card-top,.pagination{display:flex;align-items:center;justify-content:space-between;gap:12px}.hall-head{margin-bottom:16px}.title{font-size:23px;font-weight:750}.caption{font-size:11px;line-height:1.7;color:#95a5ba;margin-top:7px}button{color:#d4deeb;font-size:12px;margin:0;border:1px solid #3b4b61;border-radius:8px;background:#151e2a;padding:8px 13px;line-height:1.5}button:focus-visible{outline:2px solid #b9f477;outline-offset:3px}button:hover:not([disabled]){border-color:#81976d}button[disabled]{opacity:1;color:#8d9caf;background:#151d28;border-color:#293647;cursor:not-allowed}.controls{justify-content:flex-start;margin:12px 0 16px;gap:8px;flex-wrap:wrap}.controls .selected{background:#b9f477;color:#14200e;border-color:#b9f477}.cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;align-items:start}.candidate{min-width:0;background:linear-gradient(130deg,#151e2a,#101720);border:1px solid #2e3c4f;border-radius:12px;padding:17px}.card-top{align-items:center;gap:8px;margin-bottom:11px}.player-name{display:flex;align-items:center;gap:7px;min-width:0}.player-name b{font-size:15px;line-height:1.4;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.demo-badge{flex-shrink:0;color:#97a9bf;border:1px solid #3a495d;border-radius:4px;padding:2px 4px;font-size:9px;line-height:1.3}.goal-tag{flex-shrink:0;color:#c5eca9;background:#b9f47713;border:1px solid #b9f47724;border-radius:5px;padding:4px 7px;font-size:10px;line-height:1.4}.context-tags,.tag-list{display:flex;flex-wrap:wrap;gap:5px;min-width:0}.context-tags{margin-bottom:12px}.context-tag{font-size:10px;line-height:1.5;border-radius:4px;padding:2px 6px;background:#0c141f;color:#9fb2c9;border:1px solid #2b394b}.facts{display:flex;flex-direction:column;gap:7px;padding:11px 0;border-top:1px solid #293546}.fact-row{display:flex;align-items:flex-start;gap:9px;min-width:0}.fact-label{font-size:10px;color:#788da7;line-height:1.6;padding-top:3px;min-width:24px;flex-shrink:0}.info-tag{font-size:11px;line-height:1.5;padding:2px 6px;background:#1a2533;border:1px solid #2a3a4d;color:#ccd8e7;border-radius:4px;overflow-wrap:anywhere}.info-tag.accent{background:#b9f47709;border-color:#b9f47724;color:#bcd6a7}.checks{display:flex;flex-wrap:wrap;gap:5px;padding:10px 0 0;border-top:1px solid #293546}.check-tag{display:inline-flex;align-items:center;gap:4px;font-size:10px;line-height:1.5;padding:3px 6px;border-radius:4px;color:#a9d48b;background:#a9d48b0a;border:1px solid #a9d48b22}.check-tag.conflict{color:#e7a2a2;background:#e7a2a20a;border-color:#e7a2a222}.check-icon{font-size:12px;font-weight:600;line-height:1}.invite{width:100%;margin-top:12px;background:#b9f477;border-color:#b9f477;color:#15210d;font-size:12px;font-weight:650;padding:9px 12px}.invite[disabled]{background:#1b2630;color:#97a7ba;border-color:#344357}.empty{background:#101822;border:1px dashed #334357;border-radius:10px;padding:24px 18px;text-align:center;font-size:13px;line-height:1.6}.empty b{font-weight:600;color:#d8e3f0}.empty-note{margin-top:6px;color:#8b9db5;font-size:12px}.empty-actions{display:flex;justify-content:center;align-items:center;flex-wrap:wrap;gap:10px;margin-top:16px}.empty-actions button{display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;width:auto;min-width:0;min-height:36px;margin:0;padding:8px 16px;font-size:12px;line-height:1.5;border-radius:7px;white-space:nowrap;box-sizing:border-box}.empty-actions .empty-primary{color:#18240e;background:#b9f477;border-color:#b9f477;font-weight:650;box-shadow:0 3px 12px #b9f4770d}.empty-actions .empty-primary:hover{background:#c7ff8c;border-color:#c7ff8c}.empty-actions .empty-secondary{color:#bedb9f;background:#b9f47708;border-color:#637c4e}.empty-actions .empty-secondary:hover{background:#b9f47713;border-color:#9bc56d}.hint{padding:12px;border:1px solid #b9f47724;border-radius:8px;background:#b9f47708;font-size:12px;margin-bottom:16px;color:#b7c7ae}.pagination{justify-content:center;margin:20px 0 10px;font-size:12px}.hall-actions{display:flex;align-items:center;gap:8px;flex-shrink:0}.change{color:#b9f477;border-color:#6b8b51}@media(max-width:700px){.cards{grid-template-columns:1fr}.candidate{padding:16px}.hall-head{align-items:flex-start}}
.hall-caption{display:flex;align-items:center;gap:12px;min-width:0;margin:-8px 0 14px}.candidate-count{flex-shrink:0;white-space:nowrap}@media(max-width:550px){.hall-caption{gap:8px;font-size:10px}}
</style>
