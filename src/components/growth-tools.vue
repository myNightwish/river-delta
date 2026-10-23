<template>
 <view class="growth-tools">
  <view v-if="incoming" class="growth-bar"><button tabindex="0" v-if="incoming" @click="showShared">查看分享组队</button></view>
  <view v-if="activitiesVisible" class="activities-page" role="region" aria-label="组队活动">
   <view class="activities-head"><view><b>组队活动</b><text v-if="reservedCount" class="reservation-count">已预约 {{reservedCount}}</text></view><button tabindex="0" :disabled="working" @click="loadActivities">{{working?'刷新中…':'刷新'}}</button></view>
     <view class="note">时间按你的设备时区显示 · 预约后请在开场时返回发布招募</view>
     <view v-if="!activities.length" class="activities-empty">{{working?'正在加载活动…':'暂时没有开放的活动'}}</view>
     <view class="activity-grid"><view v-for="a in activities" :key="a.id" class="activity"><view class="activity-top"><b>{{a.title}}</b><text class="status" :class="{accent:a.mine}">{{a.status==='cancelled'?'已取消':a.mine?'已预约':a.reserved+'/'+a.capacity}}</text></view><view class="time">{{time(a.starts_at)}} — {{time(a.ends_at)}}</view><view class="tags"><text v-for="v in a.segment" :key="v">{{platformNames[v]||v}}</text></view><view class="actions"><button tabindex="0" v-if="!a.mine&&a.status!=='cancelled'" class="primary" :disabled="working||a.reserved>=a.capacity" @click="reserve(a)">{{a.reserved>=a.capacity?'预约已满':'预约时段'}}</button><button tabindex="0" v-if="a.mine" :disabled="working" @click="reserve(a,true)">取消预约</button><button tabindex="0" v-if="a.status!=='cancelled'&&now>=Date.parse(a.starts_at)&&now<Date.parse(a.ends_at)" class="primary" @click="enterActivity(a)">填写条件并找队友</button><text v-else-if="a.mine&&a.status!=='cancelled'" class="note">开场后回来找队友</text></view></view>
   </view>
  </view>

  <app-toast v-if="toast&&!panel" :message="toast.message" :type="toast.type"/>
  <view v-if="panel" class="overlay" @click.self="close" @keydown.esc="close"><view class="dialog" role="dialog" aria-modal="true" :aria-label="panelTitle" tabindex="-1" @keydown.tab="trapFocus">
  <app-toast v-if="toast" :message="toast.message" :type="toast.type"/>
   <view class="dialog-head"><b>{{panelTitle}}</b><button tabindex="0" class="close" aria-label="关闭" @click="close">×</button></view>
   <view class="dialog-body">
    <view v-if="error" class="error" role="alert">{{error}}</view>
    <template v-if="panel==='share'"><view class="note">把链接发给想一起玩的玩家，对方填写条件后即可申请</view><view class="link-input"><text selectable>{{link}}</text></view><button tabindex="0" class="primary" @click="copyLink">{{copied?'✓ 已复制':'复制招募链接'}}</button><view class="note">招募结束后链接自动失效</view></template>
    <template v-if="panel==='incoming'">
     <view v-if="shared" class="shared-card"><view class="name">{{shared.profile.nickname}}</view><view class="tags"><text>{{shared.profile.goal}}</text><text>{{shared.profile.region}}</text><text>{{shared.profile.language}}</text><text>{{shared.profile.voice}}</text><text>{{platformNames[shared.profile.platform]}}</text></view><view class="tags"><text v-for="m in shared.profile.maps" :key="m.map">{{m.map}} · {{m.difficulty}}</text></view><view class="detail">自身实力 {{shared.profile.strength_score}} · 打法 {{shared.profile.style}}<br/>队友实力 {{shared.profile.strength_min}}–{{shared.profile.strength_max}} · 打法 {{shared.profile.partner_style_min}}–{{shared.profile.partner_style_max}}</view><view v-if="shared.profile.goal!=='卡战备跑刀'" class="detail">自身装备 头{{shared.profile.helmet}} · 甲{{shared.profile.armor}} · 弹{{shared.profile.ammo}}<br/>队友至少 头{{shared.profile.partner_helmet_min}} · 甲{{shared.profile.partner_armor_min}} · 弹{{shared.profile.partner_ammo_min}}</view><view v-if="shared.profile.tasks?.length" class="tags"><text v-for="task in shared.profile.tasks" :key="task">{{task}}</text></view><view class="note">{{shared.is_me?'这是你自己的招募':!shared.online?'玩家暂时离线，回来后可申请':'玩家在线'}} · 截止 {{time(shared.expires_at)}}</view>
      <view v-if="shared.assessment&&!shared.is_me" class="tags checks"><text v-for="c in shared.assessment.checks" :key="c.label" :class="{conflict:!c.ok}">{{c.ok?'✓':'×'}} {{c.label}}</text><text v-for="c in shared.assessment.hard_conflicts" :key="c" class="conflict">× {{c}}</text></view>
      <view class="actions"><button tabindex="0" v-if="shared.can_invite" class="primary" :disabled="working" @click="inviteShared">申请组队</button><button tabindex="0" v-if="!shared.is_me" @click="editOwn">{{activeTicket?'查看我的条件':'填写我的条件'}}</button><button tabindex="0" :disabled="working" @click="loadShared">刷新</button></view>
     </view><view v-else-if="working" class="note">正在读取招募</view>
    </template>
    <template v-if="panel==='operations'">
     <template v-if="!authorized"><view class="note">粘贴运营密钥值或完整配置行，密钥只在本次窗口保留</view><input v-model="operatorKey" password placeholder="运营密钥"/><button tabindex="0" class="primary" :disabled="working||!operatorKey" @click="loadMetrics">查看运营数据</button></template>
     <template v-else>
      <view class="metrics"><view><text>访问 → 发布</text><b>{{pct(metrics.publication_rate)}}</b><small>{{metrics.publishers}} / {{metrics.visitors}} 位玩家</small></view><view><text>发布 → 双方确认</text><b>{{pct(metrics.confirmation_rate)}}</b><small>{{metrics.confirmed_requests}} / {{metrics.requests}} 条招募</small></view><view><text>反馈中实际游玩</text><b>{{pct(metrics.reported_play_rate)}}</b><small>{{metrics.played_requests}} / {{metrics.feedback_requests}} 份反馈</small></view><view><text>再次发布招募</text><b>{{pct(metrics.repeat_publication_rate)}}</b><small>{{metrics.repeat_publishers}} / {{metrics.publishers}} 位玩家</small></view></view>
      <view class="note">5 分钟内确认 {{metrics.confirmed_within_5min}} / {{metrics.requests}} 条 · 确认耗时中位数 {{metrics.median_confirm_seconds??'—'}} 秒<br/>反馈覆盖 {{pct(metrics.feedback_coverage)}} · 愿意再次组队 {{pct(metrics.willing_again_rate)}}<br/>开始记录 {{metrics.since?time(metrics.since):'尚无访问'}}<br/>{{metrics.notice}}</view><button tabindex="0" :disabled="working" @click="loadMetrics">刷新数据</button>
      <details class="create-activity"><summary>发布组队活动</summary><label>活动名称<input v-model="eventForm.title" maxlength="48" placeholder="例如 周五搜打撤组队"/></label><view class="activity-start-field"><text>开始时间 · 设备当地时区</text><activity-datetime-picker v-model="eventForm.local_time"/></view><view class="form-grid"><label>时长（分钟）<input v-model.number="eventForm.duration_minutes" type="number"/></label><label>预约人数<input v-model.number="eventForm.capacity" type="number"/></label></view><view class="form-grid"><label v-for="f in segmentFields" :key="f.key">{{f.label}}<dark-select v-model="eventForm[f.key]" :options="f.options" :label="f.label"/></label></view><button tabindex="0" class="primary" :disabled="working" @click="createActivity">{{working?'发布中…':'发布活动'}}</button></details>
      <view v-for="a in activities" :key="a.id" class="activity"><b>{{a.title}}</b><view class="note">{{time(a.starts_at)}} · {{a.reserved}} 人预约</view><button tabindex="0" v-if="a.status!=='cancelled'" :disabled="working" @click="closeActivity(a)">{{closing===a.id?'确认取消本场活动':'取消活动'}}</button></view>
     </template>
    </template>
   </view>
  </view></view>
 </view>
</template>
<script setup>
import AppToast from './app-toast.vue'
import {ref,computed,watch,nextTick,onBeforeUnmount} from 'vue'
import DarkSelect from './dark-select.vue'
import ActivityDatetimePicker from './activity-datetime-picker.vue'
import {authRequest,sessionToken} from '../utils/pilot-session.js'
import {API_BASE} from '../config.js'
import {shareCode,shareUrl,localActivityTime,operatorCredential,activityDateDefault,operationsErrorMessage} from '../utils/growth-ui.js'
const props=defineProps({ticket:Object,activeTicket:Boolean,activitiesVisible:Boolean})
const emit=defineEmits(['matched','edit','activity'])
const panel=ref(''),error=ref(''),working=ref(false),shared=ref(null),link=ref(''),copied=ref(false),activities=ref([]),now=ref(Date.now()),incoming=ref(typeof window==='undefined'?'':shareCode(window.location.hash))
const operatorKey=ref(''),authorized=ref(false),metrics=ref({}),closing=ref(null)
const toast=ref(null)
let toastTimer=null
function notify(message,type='success'){clearTimeout(toastTimer);toast.value={message,type};toastTimer=setTimeout(()=>{toast.value=null},type==='error'?6000:3500)}
const eventForm=ref({title:'',local_time:activityDateDefault(),duration_minutes:120,capacity:30,region:'SEA',platform:'PC',language:'中文',goal:'搜打撤'})
const segmentFields=[{key:'region',label:'区服',options:['NA','EU','SEA','OCE','ME']},{key:'platform',label:'游戏端',options:['PC','Console','Mobile']},{key:'language',label:'语言',options:['中文','English','日本語']},{key:'goal',label:'玩法',options:['33任务','卡战备跑刀','搜打撤','猛攻']}]
const platformNames={PC:'电脑端',Console:'主机端',Mobile:'手机端'}
const reservedCount=computed(()=>activities.value.filter(a=>a.mine&&a.status!=='cancelled').length)
const panelTitle=computed(()=>({share:'分享组队',incoming:'队友招募',operations:'运营管理'}[panel.value]||''))
const time=v=>new Date(v).toLocaleString(undefined,{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit',hour12:false})
const pct=v=>v==null?'—':v+'%'
let generation=0,oldOverflow='',oldRootOverflow='',lastFocus=null,locked=false,openedIncoming=false
async function perform(fn,{toastError=false}={}){if(working.value)return;working.value=true;error.value='';const id=generation,identity=sessionToken.value;try{const value=await fn();return id===generation&&identity===sessionToken.value?value:undefined}catch(e){if(id===generation){if(toastError)notify(e.message,'error');else error.value=e.message}}finally{if(id===generation)working.value=false}}
function close(){if(working.value)return;panel.value='';operatorKey.value='';authorized.value=false;metrics.value={};closing.value=null;error.value=''}
function open(value){error.value='';panel.value=value}
watch(panel,async (value,old)=>{if(typeof document==='undefined')return;if(value&&!old){lastFocus=document.activeElement;oldOverflow=document.body.style.overflow;oldRootOverflow=document.documentElement.style.overflow;document.body.style.overflow='hidden';document.documentElement.style.overflow='hidden';locked=true;await nextTick();document.querySelector('.growth-tools .dialog')?.focus()}else if(!value&&locked){document.body.style.overflow=oldOverflow;document.documentElement.style.overflow=oldRootOverflow;locked=false;lastFocus?.focus?.()}})
function trapFocus(e){const els=[...document.querySelectorAll('.growth-tools .dialog [tabindex="0"],.growth-tools .dialog input,.growth-tools .dialog summary')].filter(el=>!el.hasAttribute('disabled')&&el.getClientRects().length);if(!els.length)return;const first=els[0],last=els[els.length-1];if(e.shiftKey&&(document.activeElement===first||document.activeElement?.classList.contains('dialog'))){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}
async function makeShare(){const result=await perform(()=>authRequest('shares',{}));if(result){link.value=shareUrl(window.location,result.code);copied.value=false;open('share')}}
function copyLink(){uni.setClipboardData({data:link.value,success:()=>{copied.value=true},fail:()=>{error.value='复制失败，请从链接框选择复制'}})}
async function loadShared(){shared.value=null;const result=await perform(()=>authRequest('shares/'+encodeURIComponent(incoming.value)));if(result)shared.value=result}
async function showShared(){open('incoming');await loadShared()}
async function inviteShared(){const result=await perform(()=>authRequest('shares/'+encodeURIComponent(incoming.value)+'/invite',{}));if(result){close();emit('matched',result)}}
function editOwn(){close();emit('edit')}
async function loadActivities(){const result=await perform(()=>authRequest('activities'),{toastError:true});if(result){activities.value=result.items;now.value=Date.parse(result.server_now)}}
watch(()=>props.activitiesVisible,visible=>{if(visible&&sessionToken.value)loadActivities()},{immediate:true})
async function reserve(a,cancel=false){if(working.value)return;const result=await perform(()=>authRequest('activities/'+a.id+(cancel?'/cancel':'/reserve'),{}),{toastError:true});if(result){notify(cancel?'已取消预约':'预约成功');await loadActivities()}}
function enterActivity(a){if(props.activeTicket){notify('请先完成或取消当前招募，再参加活动','error');return}close();emit('activity',a.segment)}
function admin(path,data){return new Promise((resolve,reject)=>uni.request({url:API_BASE+'/pilot/operations/'+path,timeout:15000,method:data===undefined?'GET':'POST',data,header:{Authorization:'Bearer '+operatorCredential(operatorKey.value)},success:r=>r.statusCode<400?resolve(r.data):reject(new Error(operationsErrorMessage(r.statusCode,r.data))),fail:failure=>reject(new Error(failure?.errMsg?.includes('timeout')?'请求超时，请稍后重试':'连接失败，请稍后重试'))}))}
async function loadMetrics(){const key=operatorCredential(operatorKey.value);if(key==='PILOT_METRICS_TOKEN'||key.length<32){error.value='请输入 PILOT_METRICS_TOKEN 等号后面的完整密钥值';return}const result=await perform(()=>admin('metrics'));if(result){metrics.value=result;authorized.value=true;await loadActivities()}}
async function createActivity(){
 if(working.value)return
 let starts
 try{starts=localActivityTime(eventForm.value.local_time)}catch(e){notify(e.message,'error');return}
 const identity=sessionToken.value
 const {local_time,...data}=eventForm.value
 const result=await perform(()=>admin('activities',{...data,starts_at:starts}))
 if(identity!==sessionToken.value)return
 if(result){eventForm.value.title='';notify('活动已发布');await loadActivities()}
 else {const message=error.value||'活动发布失败，请稍后重试';error.value='';notify(message,'error')}
}
async function closeActivity(a){if(working.value)return;if(closing.value!==a.id){closing.value=a.id;return}const identity=sessionToken.value;const result=await perform(()=>admin('activities/'+a.id+'/close',{}));if(identity!==sessionToken.value)return;if(result){closing.value=null;notify('活动已取消');await loadActivities()}else{const message=error.value||'活动取消失败，请稍后重试';error.value='';notify(message,'error')}}
function openOperations(){if(!eventForm.value.title.trim())eventForm.value.local_time=activityDateDefault();open('operations')}

defineExpose({openOperations,makeShare})
watch(sessionToken,async identity=>{generation++;working.value=false;shared.value=null;activities.value=[];clearTimeout(toastTimer);toast.value=null;close();if(!identity)return;try{await authRequest('growth/visit',{source:incoming.value?'share':'direct'})}catch{}if(sessionToken.value!==identity)return;if(props.activitiesVisible)await loadActivities();if(incoming.value&&!openedIncoming){openedIncoming=true;await showShared()}},{immediate:true})
const timer=setInterval(()=>{now.value=Date.now();if(props.activitiesVisible&&!working.value&&typeof document!=='undefined'&&document.visibilityState!=='hidden')loadActivities()},30000)
onBeforeUnmount(()=>{generation++;clearInterval(timer);clearTimeout(toastTimer);if(locked&&typeof document!=='undefined'){document.body.style.overflow=oldOverflow;document.documentElement.style.overflow=oldRootOverflow}})
</script>
<style scoped>
.growth-bar{display:flex;align-items:center;flex-wrap:wrap;gap:8px;margin:-10px 0 18px}.growth-tools button{display:inline-flex;align-items:center;justify-content:center;width:auto;min-height:34px;padding:7px 12px;margin:0;border:1px solid #36465b;border-radius:7px;background:#141e2b;color:#bfd0e3;font-size:12px;line-height:1.5}.growth-bar button{background:transparent;color:#b6cba3;border-color:#475b39;font-size:11px;padding:5px 10px;min-height:30px}.growth-tools .primary{background:#b9f477;color:#17230f;border-color:#b9f477;font-weight:650}.growth-tools button[disabled]{opacity:.45}.growth-tools button:focus-visible{outline:2px solid #b9f477;outline-offset:3px}.inline-hint{font-size:11px;color:#b9f477}.overlay{position:fixed;inset:0;z-index:80;display:flex;align-items:center;justify-content:center;padding:20px;background:#03070bd9;backdrop-filter:blur(8px)}.dialog{display:flex;flex-direction:column;width:100%;max-width:620px;max-height:85vh;background:#111a25;border:1px solid #35455b;border-radius:16px;box-shadow:0 24px 100px #0008;color:#e2eaf4;outline:none}.dialog-head{display:flex;align-items:center;justify-content:space-between;padding:17px 20px;border-bottom:1px solid #2b394b;font-size:16px}.dialog-head .close{font-size:22px;min-height:30px;padding:0 8px;background:none;border:0;color:#91a4bc}.dialog-body{overflow-y:auto;padding:20px;font-size:12px;line-height:1.7;overscroll-behavior:contain}.note{font-size:11px;line-height:1.8;color:#93a5bd;margin:8px 0 14px}.error{padding:9px 12px;margin-bottom:12px;background:#422731;color:#ffc0b8;border-radius:7px;font-size:12px}.growth-tools input{box-sizing:border-box;display:block;height:40px;width:100%;min-width:0;background:#0a121d;border:1px solid #37495f;border-radius:7px;color:#dbe6f3;padding:8px 11px;margin:7px 0 14px;font-size:12px}.link-input{padding:10px 12px;margin:12px 0;background:#0a121d;border:1px solid #37495f;border-radius:7px;overflow-wrap:anywhere;user-select:all;color:#bfd59f!important;opacity:1}.name{font-size:20px;font-weight:650;margin-bottom:12px}.tags{display:flex;flex-wrap:wrap;gap:5px;margin:9px 0}.tags text,.status{font-size:10px;background:#1b2a38;border:1px solid #344b60;color:#b8cee1;border-radius:5px;padding:3px 7px}.detail{margin:12px 0;color:#c7d6e7;line-height:1.9}.actions{display:flex;flex-wrap:wrap;align-items:center;gap:9px;margin-top:12px}.actions .note{margin:0}.checks text{color:#badb9c;background:#b9f4770b;border-color:#b9f47726}.checks .conflict{color:#ecaaaa;background:#ecaaaa08;border-color:#ecaaaa26}.activity{padding:15px;border:1px solid #2e4054;border-radius:10px;margin:12px 0;background:#0d1621}.activity-top{display:flex;justify-content:space-between;gap:10px;align-items:center}.activity-top b{font-size:14px}.time{font-size:12px;color:#b9cadd;margin-top:8px}.status.accent{color:#b9f477;border-color:#b9f47744;background:#b9f4770d}.metrics{display:grid;grid-template-columns:1fr 1fr;gap:10px}.metrics>view{padding:13px;background:#0b141e;border:1px solid #2e3e51;border-radius:9px;display:flex;flex-direction:column;gap:5px}.metrics text,.metrics small{font-size:11px;color:#9bafc7}.metrics b{color:#b9f477;font-size:27px;font-variant-numeric:tabular-nums}.create-activity{margin:22px 0;padding-top:16px;border-top:1px solid #2d3b4e}.create-activity summary{cursor:pointer;color:#bfdc9e;margin-bottom:14px}.create-activity label{display:block;font-size:12px;color:#aebed1}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.form-grid label{min-width:0}@media(max-width:500px){.overlay{padding:12px}.dialog-body{padding:16px}.dialog{max-height:90vh}.growth-bar{margin-top:-6px}}
.activity-start-field{font-size:12px;color:#aebed1}

.activities-page{margin-bottom:18px}.activities-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:10px}.activities-head>view{display:flex;align-items:center;gap:10px}.activities-head b{font-size:21px;line-height:1.5}.reservation-count{font-size:11px;color:#b9f477;background:#b9f4770d;border:1px solid #b9f47726;padding:3px 7px;border-radius:5px}.activity-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.activity-grid .activity{margin:0;padding:18px}.activities-empty{text-align:center;padding:36px 16px;border:1px dashed #34465c;border-radius:11px;color:#95a9c2;font-size:13px;margin-top:16px}@media(max-width:700px){.activity-grid{grid-template-columns:1fr}.activities-head b{font-size:19px}}
</style>
