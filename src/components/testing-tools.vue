<template>
 <button class="test-entry" @click="open=true">测试入口</button>
 <view v-if="open" class="test-overlay" @click.self="close"><view class="test-dialog" :class="{unlocked:access}" role="dialog" aria-modal="true" aria-label="匹配测试工具" tabindex="-1" @keydown.esc.stop="close" @keydown.tab="trapFocus">
  <view class="test-head"><view><b>{{access?'匹配测试工具':'解锁测试入口'}}</b><text>{{access?'导入资料后，仍需预览并发布招募':'输入测试口令后使用 JSON 测试工具'}}</text></view><button aria-label="关闭测试工具" @click="close">×</button></view>
  <view class="test-content">
   <view v-if="!access"><input v-model="code" password maxlength="128" placeholder="测试口令" @confirm="unlock"/><button class="test-primary unlock" :disabled="busy||!code" @click="unlock">{{busy?'验证中…':'解锁'}}</button></view>
   <view v-else>
    <view class="scenario-picker"><dark-select :model-value="scenarioTitle" :options="scenarios.map(s=>s.title)" label="测试场景" @update:model-value="chooseScenario"/><view class="player-tabs"><button v-for="(p,i) in scenario?.players||[]" :key="i" :class="{chosen:playerIndex===i}" @click="choosePlayer(i)">玩家 {{String.fromCharCode(65+i)}}</button></view></view>
    <view class="expected"><b>预期结果</b><text>{{scenario?.expected}}</text></view>
    <view class="editor-label"><b>玩家招募 JSON</b><button @click="readFile">读取 JSON 文件</button></view>
    <textarea v-model="jsonText" class="json-editor" :maxlength="20000" spellcheck="false" placeholder="粘贴一份玩家招募 JSON"/>
    <view class="import-actions"><button :disabled="busy" @click="importProfile(false)">导入当前玩家</button><button class="test-primary" :disabled="busy" @click="importProfile(true)">新建测试玩家并导入</button></view>
    <view class="test-note">正在招募时不覆盖当前玩家，可在普通与无痕窗口分别导入 A / B</view>
    <view v-if="personas.length" class="persona-list"><b>已导入的测试玩家</b><view><button v-for="p in personas" :key="p.token" :disabled="busy" :class="{chosen:p.token===sessionToken}" @click="switchPersona(p)">{{p.profile.nickname}}</button></view></view>
   </view>
   <view v-if="message" class="test-message" role="alert">{{message}}</view>
  </view>
  <view v-if="access" class="test-bottom"><text>测试玩家不计入真实匹配效果统计</text><button :disabled="busy" @click="lock">锁定入口</button></view>
 </view></view>
</template>
<script setup>
import {computed,ref,watch,nextTick,onBeforeUnmount} from 'vue'
import DarkSelect from './dark-select.vue'
import {authRequest,sessionToken} from '../utils/pilot-session.js'
const emit=defineEmits(['import'])
const open=ref(false),code=ref(''),access=ref(''),busy=ref(false),message=ref(''),scenarios=ref([]),scenarioId=ref(''),playerIndex=ref(0),jsonText=ref(''),personas=ref([])
const scenario=computed(()=>scenarios.value.find(s=>s.id===scenarioId.value)),scenarioTitle=computed(()=>scenario.value?.title||'选择场景')
let oldBody='',oldRoot='',locked=false,previousFocus=null,accessOwner=''
watch(sessionToken,value=>{if(access.value&&value!==accessOwner){access.value='';scenarios.value=[];personas.value=[];jsonText.value='';code.value=''}})
function close(){if(!busy.value){open.value=false;code.value='';message.value=''}}
function trapFocus(event){if(typeof document==='undefined')return;const dialog=document.querySelector('.test-dialog'),controls=[...dialog.querySelectorAll('button,input,textarea,[tabindex="0"]')].filter(el=>!el.disabled&&el.getAttribute('aria-disabled')!=='true'&&el.getClientRects().length);if(!controls.length)return;const first=controls[0],last=controls.at(-1);if(event.shiftKey&&(document.activeElement===first||document.activeElement===dialog)){event.preventDefault();last.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}}
function restoreScroll(){if(!locked||typeof document==='undefined')return;document.body.style.overflow=oldBody;document.documentElement.style.overflow=oldRoot;locked=false;previousFocus?.focus?.()}
watch(open,async shown=>{if(typeof document==='undefined')return;if(shown){oldBody=document.body.style.overflow;oldRoot=document.documentElement.style.overflow;previousFocus=document.activeElement;locked=true;document.body.style.overflow='hidden';document.documentElement.style.overflow='hidden';await nextTick();document.querySelector('.test-dialog')?.focus()}else restoreScroll()})
function choosePlayer(i){playerIndex.value=i;jsonText.value=JSON.stringify(scenario.value.players[i],null,2);message.value=''}
function chooseScenario(title){scenarioId.value=scenarios.value.find(s=>s.title===title).id;choosePlayer(0)}
async function unlock(){
 if(busy.value)return;busy.value=true;message.value=''
 try{const result=await authRequest('testing/unlock',{code:code.value});accessOwner=sessionToken.value;access.value=result.access_token;code.value='';const data=await authRequest('testing/scenarios',{access_token:access.value});scenarios.value=data.scenarios;chooseScenario(scenarios.value[0].title)}
 catch(e){access.value='';message.value=e.message}finally{busy.value=false}
}
function readFile(){
 if(typeof document==='undefined')return
 const input=document.createElement('input');input.type='file';input.accept='.json,application/json'
 input.onchange=async()=>{const file=input.files?.[0];if(!file)return;if(file.size>16384){message.value='JSON 文件不能超过 16 KB';return}try{jsonText.value=await file.text();message.value=''}catch{message.value='无法读取文件，请直接粘贴 JSON'}}
 input.click()
}
async function importProfile(newIdentity){
 if(busy.value)return;busy.value=true;message.value=''
 try{const profile=JSON.parse(jsonText.value);if(!profile||typeof profile!=='object'||Array.isArray(profile))throw new Error('每次导入一位玩家的 JSON 对象');const result=await authRequest('testing/import',{access_token:access.value,profile,new_identity:newIdentity});accessOwner=result.token||sessionToken.value;access.value=result.access_token;const credential=accessOwner;const p={token:credential,access:result.access_token,profile:result.profile};personas.value=[...personas.value.filter(x=>x.token!==credential),p].slice(-20);emit('import',result);busy.value=false;close()}
 catch(e){if(e.status===403||e.status===503){access.value='';scenarios.value=[];code.value=''}message.value=e instanceof SyntaxError?'JSON 格式不正确，请检查逗号与引号':e.message}finally{busy.value=false}
}
function switchPersona(p){accessOwner=p.token;access.value=p.access;emit('import',{token:p.token,profile:p.profile});close()}
async function lock(){busy.value=true;try{await authRequest('testing/lock',{access_token:access.value});access.value='';scenarios.value=[];personas.value=[];jsonText.value='';message.value=''}catch(e){message.value=e.message}finally{busy.value=false}}
onBeforeUnmount(restoreScroll)
</script>
<style scoped>
.test-entry{display:inline-flex;margin:0 0 0 14px;padding:0;border:0;background:none;color:#71859d;font-size:10px;line-height:1.5}.test-overlay{position:fixed;inset:0;z-index:150;background:#03070be3;backdrop-filter:blur(7px);display:flex;align-items:center;justify-content:center;padding:16px;letter-spacing:normal;text-align:left}.test-dialog{width:100%;max-width:400px;max-height:88vh;display:flex;flex-direction:column;background:#131e2b;border:1px solid #3a4f67;border-radius:13px;overflow:hidden;box-shadow:0 25px 90px #0009;outline:none}.test-dialog.unlocked{max-width:760px}.test-head{display:flex;align-items:flex-start;justify-content:space-between;padding:18px 20px;border-bottom:1px solid #2d3c50;gap:14px}.test-head b{font-size:15px;color:#dce7f3}.test-head text{display:block;color:#8da2bb;font-size:10px;margin-top:5px}.test-head>button{margin:0;padding:0 3px;border:0;background:none;color:#96aac2;font-size:24px;line-height:1}.test-content{min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:18px 20px}.test-content input{box-sizing:border-box;width:100%;height:42px;background:#0a131e;border:1px solid #3a4e68;border-radius:7px;padding:9px 12px;color:#e4edf9;font-size:13px}.test-content button,.test-bottom button{display:inline-flex;align-items:center;justify-content:center;width:auto;margin:0;padding:7px 12px;border:1px solid #425870;border-radius:6px;background:#182635;color:#b9cce2;font-size:11px;line-height:1.5}.test-content .test-primary{background:#b9f477;color:#16230e;border-color:#b9f477;font-weight:650}.test-content .unlock{display:flex;width:100%;margin-top:14px;padding:10px;box-sizing:border-box}.scenario-picker{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:12px}.player-tabs{display:flex;gap:6px}.test-content .chosen{color:#c9f3a6;background:#b9f47716;border-color:#829f60}.expected{display:flex;flex-direction:column;gap:5px;margin:14px 0;padding:10px 12px;background:#b9f47709;border:1px solid #b9f47724;border-radius:7px;color:#bbd59f;font-size:11px;line-height:1.7}.expected b{font-size:10px;font-weight:600}.editor-label{display:flex;justify-content:space-between;align-items:center;gap:12px;color:#b4c8df;margin-bottom:9px;font-size:12px}.test-content .json-editor{display:block;box-sizing:border-box;width:100%;height:240px;padding:12px;background:#09121c;border:1px solid #344a63;border-radius:8px;color:#b6d0ed;font:11px/1.7 ui-monospace,SFMono-Regular,Consolas,monospace;white-space:pre;overflow:auto}.import-actions{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:8px;margin-top:13px}.test-note{font-size:10px;color:#859bb5;line-height:1.7;margin-top:10px}.test-message{font-size:11px;color:#f1b1a8;background:#3c2229;border:1px solid #75424a;padding:10px;border-radius:7px;margin-top:12px}.persona-list{border-top:1px solid #2c3e53;padding-top:12px;margin-top:14px;font-size:11px;color:#91a9c4}.persona-list>view{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}.persona-list button{font-size:10px;padding:5px 8px}.test-bottom{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:11px 20px;border-top:1px solid #2c3c50;color:#8097b2;font-size:10px}.test-content button[disabled]{opacity:.4}button:focus-visible,input:focus{outline:1px solid #b9f477;outline-offset:2px}@media(max-width:500px){.test-content,.test-head{padding:15px}.scenario-picker{grid-template-columns:1fr}.json-editor{height:220px!important}.test-bottom{padding:11px 15px}.test-bottom text{max-width:170px;line-height:1.7}}
</style>
