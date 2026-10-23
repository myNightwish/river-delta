<template>
 <button class="test-entry" @click="open=true">{{ $t("ui.testing_tools") }}</button>
 <view v-if="open" class="test-overlay" @click.self="close"><view class="test-dialog" :class="{unlocked:access}" role="dialog" aria-modal="true" :aria-label="$t(&quot;ui.matching_test_tools&quot;)" tabindex="-1" @keydown.esc.stop="close" @keydown.tab="trapFocus">
  <view class="test-head"><view><b>{{access?$t("ui.matching_test_tools"):$t("ui.unlock_testing_tools")}}</b><text>{{access?$t("ui.generate_simulated_teammates_control_only_your_own_player"):$t("ui.enter_your_test_passcode_to_use_these_tools")}}</text></view><button :aria-label="$t(&quot;ui.close_test_tools&quot;)" @click="close">×</button></view>
  <view class="test-content">
   <view v-if="!access"><input v-model="code" password maxlength="128" :placeholder="$t(&quot;ui.test_passcode&quot;)" @confirm="unlock"/><button class="test-primary unlock" :disabled="busy||!code" @click="unlock">{{busy?$t("ui.verifying"):$t("ui.unlock")}}</button></view>
   <view v-else>
    <view class="sim-options"><view><text>{{ $t("ui.use_conditions") }}</text><view class="player-tabs"><button :class="{chosen:source==='example'}" @click="source='example'">{{ $t("ui.example_conditions") }}</button><button :class="{chosen:source==='current'}" @click="source='current'">{{ $t("ui.current_conditions") }}</button></view></view><view><text>{{ $t("ui.teammate_response") }}</text><dark-select v-model="behavior" :options="Object.keys(behaviorNames)" :option-labels="behaviorNames" :label="$t(&quot;ui.simulated_response&quot;)"/></view></view>
    <view class="sim-actions"><button class="test-primary" :disabled="busy" @click="generate">{{busy?$t("ui.working"):activeRun?$t("ui.regenerate_8_teammates"):$t("ui.generate_8_teammates")}}</button><button :disabled="busy||(!activeRun&&!canReturn)" @click="clearRun">{{ $t("ui.clean_up_this_test") }}</button><button v-if="activeRun" :disabled="busy" @click="enterHall">{{ $t("ui.open_recruitment_hall") }}</button></view>
    <view class="test-note">{{ $t("ui.publishes_in_an_isolated_test_pool_simulated_teammates_remain") }}</view>
    <view v-if="activeRun" class="sim-results"><view class="sim-summary"><b>{{ $t("ui.simulated_teammates") }}</b><text>{{Math.ceil(activeRun.remaining_seconds/60)}} {{ $t("ui.minutes_remaining") }} {{$t(behaviorNames[activeRun.behavior])}}</text></view><view class="sim-row sim-labels"><text>{{ $t("ui.scenario") }}</text><text>{{ $t("ui.expected") }}</text><text>{{ $t("ui.actual_conditions") }}</text><text>{{ $t("ui.status") }}</text></view><view v-for="bot in activeRun.bots" :key="bot.label" class="sim-row"><text>{{$t(bot.label)}}</text><text :class="bot.expected_eligible?'pass':'muted'">{{bot.expected_eligible?$t("ui.compatible_520"):$t("ui.conflict")}}</text><text :class="bot.eligible===bot.expected_eligible?'pass':'fail'">{{bot.eligible?$t("ui.compatible_520"):$t("ui.conflict")}} {{bot.eligible===bot.expected_eligible?'✓':'×'}}</text><text>{{$t(ticketNames[bot.status]||bot.status)}}</text></view></view>
    <button class="advanced-toggle" @click="advanced=!advanced">{{advanced?$t("ui.hide_advanced_json"):$t("ui.advanced_json_import")}} {{advanced?'⌃':'⌄'}}</button>
    <view v-if="advanced">
    <view class="scenario-picker"><dark-select :model-value="scenarioId" :options="scenarios.map(s=>s.id)" :option-labels="Object.fromEntries(scenarios.map(s=>[s.id,s.title]))" :label="$t(&quot;ui.test_scenario&quot;)" @update:model-value="chooseScenario"/><view class="player-tabs"><button v-for="(p,i) in scenario?.players||[]" :key="i" :class="{chosen:playerIndex===i}" @click="choosePlayer(i)">{{ $t("ui.player") }} {{String.fromCharCode(65+i)}}</button></view></view>
    <view class="expected"><b>{{ $t("ui.expected_result") }}</b><text>{{$t(scenario?.expected)}}</text></view>
    <view class="editor-label"><b>{{ $t("ui.player_listing_json") }}</b><button @click="readFile">{{ $t("ui.read_json_file") }}</button></view>
    <textarea v-model="jsonText" class="json-editor" :maxlength="20000" spellcheck="false" :placeholder="$t(&quot;ui.paste_a_player_listing_json&quot;)"/>
    <view class="import-actions"><button :disabled="busy||!!activeRun" @click="importProfile(false)">{{ $t("ui.import_current_player") }}</button><button class="test-primary" :disabled="busy||!!activeRun" @click="importProfile(true)">{{ $t("ui.create_import_test_player") }}</button></view>
    <view class="test-note">{{ $t("ui.active_listings_are_not_overwritten_import_a_and_b") }}</view>
    <view v-if="personas.length" class="persona-list"><b>{{ $t("ui.imported_test_player") }}</b><view><button v-for="p in personas" :key="p.token" :disabled="busy||!!activeRun" :class="{chosen:p.token===sessionToken}" @click="switchPersona(p)">{{p.profile.nickname}}</button></view></view>
    </view>
   </view>
   <view v-if="message" class="test-message" role="alert">{{$error(message)}}</view>
  </view>
  <view v-if="access" class="test-bottom"><text>{{ $t("ui.test_players_are_excluded_from_real_matching_metrics") }}</text><button :disabled="busy" @click="lock">{{ $t("ui.lock_tools") }}</button></view>
 </view></view>
</template>
<script setup>
import {computed,ref,watch,nextTick,onBeforeUnmount} from 'vue'
import DarkSelect from './dark-select.vue'
import {authRequest,sessionToken} from '../utils/pilot-session.js'
const props=defineProps({getDraft:Function})
const emit=defineEmits(['import','simulation-start','hall'])
const open=ref(false),code=ref(''),access=ref(''),busy=ref(false),message=ref(''),scenarios=ref([]),scenarioId=ref(''),playerIndex=ref(0),jsonText=ref(''),personas=ref([])
const advanced=ref(false),source=ref('example'),behavior=ref('accept'),activeRun=ref(null),canReturn=ref(false)
const behaviorNames={accept:'ui.auto_confirm',reject:'ui.auto_decline',timeout:'ui.no_response_timeout'},ticketNames={waiting:'status.recruiting',matched:'ui.kept',cancelled:'ui.cancelled',done:'ui.completed',expired:'ui.expired'}
const scenario=computed(()=>scenarios.value.find(s=>s.id===scenarioId.value))
let oldBody='',oldRoot='',locked=false,previousFocus=null,accessOwner='',runLoadId=0,returnPersona=null
try{returnPersona=JSON.parse(sessionStorage.getItem('pilot-simulation-return')||'null')}catch{}
canReturn.value=!!returnPersona
function storeReturn(){try{if(returnPersona)sessionStorage.setItem('pilot-simulation-return',JSON.stringify(returnPersona));else sessionStorage.removeItem('pilot-simulation-return')}catch{}}
watch(sessionToken,value=>{if(access.value&&value!==accessOwner){returnPersona=null;canReturn.value=false;storeReturn();runLoadId++;activeRun.value=null;access.value='';scenarios.value=[];personas.value=[];jsonText.value='';code.value=''}})
function close(){if(!busy.value){open.value=false;code.value='';message.value=''}}
function trapFocus(event){if(typeof document==='undefined')return;const dialog=document.querySelector('.test-dialog'),controls=[...dialog.querySelectorAll('button,input,textarea,[tabindex="0"]')].filter(el=>!el.disabled&&el.getAttribute('aria-disabled')!=='true'&&el.getClientRects().length);if(!controls.length)return;const first=controls[0],last=controls.at(-1);if(event.shiftKey&&(document.activeElement===first||document.activeElement===dialog)){event.preventDefault();last.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}}
function restoreScroll(){if(!locked||typeof document==='undefined')return;document.body.style.overflow=oldBody;document.documentElement.style.overflow=oldRoot;locked=false;previousFocus?.focus?.()}
watch(open,async shown=>{if(typeof document==='undefined')return;if(shown){oldBody=document.body.style.overflow;oldRoot=document.documentElement.style.overflow;previousFocus=document.activeElement;locked=true;document.body.style.overflow='hidden';document.documentElement.style.overflow='hidden';await nextTick();document.querySelector('.test-dialog')?.focus();if(access.value)loadRun()}else restoreScroll()})
function choosePlayer(i){playerIndex.value=i;jsonText.value=JSON.stringify(scenario.value.players[i],null,2);message.value=''}
function chooseScenario(id){scenarioId.value=id;choosePlayer(0)}
async function unlock(){
 if(busy.value)return;busy.value=true;message.value=''
 try{const result=await authRequest('testing/unlock',{code:code.value});accessOwner=sessionToken.value;access.value=result.access_token;code.value='';const data=await authRequest('testing/scenarios',{access_token:access.value});scenarios.value=data.scenarios;chooseScenario(scenarios.value[0].id);await loadRun()}
 catch(e){access.value='';message.value=e.message}finally{busy.value=false}
}
async function loadRun(){
 const id=++runLoadId,identity=sessionToken.value
 try{const value=await authRequest('testing/simulation/current',{access_token:access.value});if(id===runLoadId&&identity===sessionToken.value)activeRun.value=value}
 catch(e){if(id===runLoadId&&open.value){message.value=e.message;if(e.status===403){access.value='';scenarios.value=[]}}}
}
async function generate(){
 if(busy.value)return;busy.value=true;message.value='';runLoadId++
 try{
  const original={token:sessionToken.value,access:access.value,profile:props.getDraft?.()||{}}
  const result=await authRequest('testing/simulation/start',{access_token:access.value,profile:source.value==='current'?original.profile:null,behavior:behavior.value})
  if(!returnPersona){returnPersona=original;canReturn.value=true;storeReturn()}
  accessOwner=result.token;access.value=result.access_token;activeRun.value=result.run;personas.value=[];advanced.value=false;emit('simulation-start',result)
 }catch(e){message.value=e.message}finally{busy.value=false}
}
async function clearRun(){
 if(busy.value)return;busy.value=true;message.value='';runLoadId++
 try{await authRequest('testing/simulation/stop',{access_token:access.value});activeRun.value=null;if(returnPersona){const saved=returnPersona;returnPersona=null;canReturn.value=false;storeReturn();accessOwner=saved.token;access.value=saved.access;emit('import',{token:saved.token,profile:saved.profile})}message.value='ui.test_cleaned_up'}
 catch(e){message.value=e.message}finally{busy.value=false}
}
function enterHall(){emit('hall');close()}
const polling=setInterval(()=>{if(open.value&&access.value&&!busy.value)loadRun()},4000)
function readFile(){
 if(typeof document==='undefined')return
 const input=document.createElement('input');input.type='file';input.accept='.json,application/json'
 input.onchange=async()=>{const file=input.files?.[0];if(!file)return;if(file.size>16384){message.value='ui.json_files_cannot_exceed_16_kb';return}try{jsonText.value=await file.text();message.value=''}catch{message.value='ui.could_not_read_the_file_paste_the_json_directly'}}
 input.click()
}
async function importProfile(newIdentity){
 if(activeRun.value){message.value='ui.clean_up_the_current_test_before_importing_json';return}
 if(busy.value)return;busy.value=true;message.value=''
 try{const profile=JSON.parse(jsonText.value);if(!profile||typeof profile!=='object'||Array.isArray(profile))throw new Error('ui.import_one_player_s_json_object_at_a_time');const result=await authRequest('testing/import',{access_token:access.value,profile,new_identity:newIdentity});accessOwner=result.token||sessionToken.value;access.value=result.access_token;const credential=accessOwner;const p={token:credential,access:result.access_token,profile:result.profile};personas.value=[...personas.value.filter(x=>x.token!==credential),p].slice(-20);emit('import',result);busy.value=false;close()}
 catch(e){if(e.status===403||e.status===503){access.value='';scenarios.value=[];code.value=''}message.value=e instanceof SyntaxError?'ui.invalid_json_check_commas_and_quotation_marks':e.message}finally{busy.value=false}
}
function switchPersona(p){accessOwner=p.token;access.value=p.access;emit('import',{token:p.token,profile:p.profile});close()}
async function lock(){busy.value=true;try{await authRequest('testing/lock',{access_token:access.value});access.value='';scenarios.value=[];personas.value=[];jsonText.value='';message.value=''}catch(e){message.value=e.message}finally{busy.value=false}}
onBeforeUnmount(()=>{clearInterval(polling);runLoadId++;restoreScroll()})
</script>
<style scoped>
.sim-options{display:grid;grid-template-columns:1fr 1fr;gap:18px;align-items:end}.sim-options>view>text{display:block;font-size:11px;color:#91a6c1;margin-bottom:9px}.sim-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:17px}.sim-results{border:1px solid #304358;border-radius:8px;margin-top:17px;overflow:hidden}.sim-summary{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:12px;background:#172536;font-size:12px;color:#c7d8e9}.sim-summary>text{font-size:10px;color:#8fa4bd}.sim-row{display:grid;grid-template-columns:1.5fr .7fr .9fr .8fr;gap:9px;padding:9px 12px;border-top:1px solid #26364a;font-size:11px;color:#b4c7dc;align-items:center}.sim-labels{font-size:10px;color:#7d94ae}.pass{color:#b9e39a}.fail{color:#f0a5a5}.muted{color:#9aaec5}.test-content .advanced-toggle{display:flex;width:100%;justify-content:space-between;border:0;border-top:1px solid #2a3c51;border-radius:0;background:none;margin:18px 0 0;padding:13px 0 0;color:#7f97b2}.scenario-picker{margin-top:15px}.test-entry{display:inline-flex;margin:0 0 0 14px;padding:0;border:0;background:none;color:#71859d;font-size:10px;line-height:1.5}.test-overlay{position:fixed;inset:0;z-index:150;background:#03070be3;backdrop-filter:blur(7px);display:flex;align-items:center;justify-content:center;padding:16px;letter-spacing:normal;text-align:left}.test-dialog{width:100%;max-width:400px;max-height:88vh;display:flex;flex-direction:column;background:#131e2b;border:1px solid #3a4f67;border-radius:13px;overflow:hidden;box-shadow:0 25px 90px #0009;outline:none}.test-dialog.unlocked{max-width:760px}.test-head{display:flex;align-items:flex-start;justify-content:space-between;padding:18px 20px;border-bottom:1px solid #2d3c50;gap:14px}.test-head b{font-size:15px;color:#dce7f3}.test-head text{display:block;color:#8da2bb;font-size:10px;margin-top:5px}.test-head>button{margin:0;padding:0 3px;border:0;background:none;color:#96aac2;font-size:24px;line-height:1}.test-content{min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:18px 20px}.test-content input{box-sizing:border-box;width:100%;height:42px;background:#0a131e;border:1px solid #3a4e68;border-radius:7px;padding:9px 12px;color:#e4edf9;font-size:13px}.test-content button,.test-bottom button{display:inline-flex;align-items:center;justify-content:center;width:auto;margin:0;padding:7px 12px;border:1px solid #425870;border-radius:6px;background:#182635;color:#b9cce2;font-size:11px;line-height:1.5}.test-content .test-primary{background:#b9f477;color:#16230e;border-color:#b9f477;font-weight:650}.test-content .unlock{display:flex;width:100%;margin-top:14px;padding:10px;box-sizing:border-box}.scenario-picker{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:12px}.player-tabs{display:flex;gap:6px}.test-content .chosen{color:#c9f3a6;background:#b9f47716;border-color:#829f60}.expected{display:flex;flex-direction:column;gap:5px;margin:14px 0;padding:10px 12px;background:#b9f47709;border:1px solid #b9f47724;border-radius:7px;color:#bbd59f;font-size:11px;line-height:1.7}.expected b{font-size:10px;font-weight:600}.editor-label{display:flex;justify-content:space-between;align-items:center;gap:12px;color:#b4c8df;margin-bottom:9px;font-size:12px}.test-content .json-editor{display:block;box-sizing:border-box;width:100%;height:240px;padding:12px;background:#09121c;border:1px solid #344a63;border-radius:8px;color:#b6d0ed;font:11px/1.7 ui-monospace,SFMono-Regular,Consolas,monospace;white-space:pre;overflow:auto}.import-actions{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:8px;margin-top:13px}.test-note{font-size:10px;color:#859bb5;line-height:1.7;margin-top:10px}.test-message{font-size:11px;color:#f1b1a8;background:#3c2229;border:1px solid #75424a;padding:10px;border-radius:7px;margin-top:12px}.persona-list{border-top:1px solid #2c3e53;padding-top:12px;margin-top:14px;font-size:11px;color:#91a9c4}.persona-list>view{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}.persona-list button{font-size:10px;padding:5px 8px}.test-bottom{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:11px 20px;border-top:1px solid #2c3c50;color:#8097b2;font-size:10px}.test-content button[disabled]{opacity:.4}button:focus-visible,input:focus{outline:1px solid #b9f477;outline-offset:2px}@media(max-width:500px){.sim-options{grid-template-columns:1fr;gap:13px}.sim-row{gap:5px;padding:9px;font-size:10px}.sim-summary{align-items:flex-start;flex-direction:column}.sim-actions button{font-size:10px;padding:7px 9px}.test-content,.test-head{padding:15px}.scenario-picker{grid-template-columns:1fr}.json-editor{height:220px!important}.test-bottom{padding:11px 15px}.test-bottom text{max-width:170px;line-height:1.7}}
</style>
