import {publicationProfile} from '../src/utils/recruitment-locale.js'
import test from 'node:test'
import assert from 'node:assert/strict'
import {computed} from 'vue'
import {readFileSync,readdirSync} from 'node:fs'
import {parse as parseSfc} from '@vue/compiler-sfc'
import {parse as parseTemplate} from '@vue/compiler-dom'
import {parse as parseJs} from '@babel/parser'
import english from '../src/i18n/en.js'
import chinese from '../src/i18n/zh.js'
import {translate,chooseLocale,translatedError,hasMessage} from '../src/i18n/core.js'
import {locale,t} from '../src/i18n/index.js'
import {apiErrorMessage} from '../src/i18n/api-errors.js'
import {MAP_MODES,GOALS,SLOT_OPTIONS,TASKS,STYLE_LABELS} from '../src/utils/recruitment-options.js'
import {pickPreferences} from '../src/utils/pilot-preferences.js'
import {stepErrors} from '../src/utils/recruitment-validation.js'
import {publishedRecruitmentDetails,recruitmentComparison} from '../src/utils/recruitment-comparison.js'
const han=/[\u3400-\u9fff]/
const profile=publicationProfile(pickPreferences({schema_version:4,listing_language:'en',nickname:'中文',style:3,style_explicit:true,goal:'goal.loot_extract',maps:[{map:'map.brakkesh',difficulty:'difficulty.top_secret'}],slot:'slot.today_evening',slot_explicit:true,helmet:4,armor:4,ammo:4,partner_helmet_min:2,partner_armor_min:2,partner_ammo_min:2,confidential_kd:2,top_secret_kd:2,combat_score:50}),'en')
test('catalog keys are stable semantic IDs and both languages have the same key set',()=>{
 assert.deepEqual(Object.keys(english).sort(),Object.keys(chinese).sort())
 for(const key of Object.keys(english))assert.match(key,/^[a-z][A-Za-z0-9_]*(?:\.[A-Za-z0-9_]+)+$/)
 assert.equal(translate('action.confirm','en'),'Confirm');assert.equal(translate('action.confirm','zh-CN'),'确认')
 assert.equal(translate('确认','en'),'[missing translation]')
})
test('first visit defaults to Chinese regardless of browser language; explicit preference persists',()=>{
 assert.equal(chooseLocale('zh-CN',['en-US']),'zh-CN');assert.equal(chooseLocale('en',['zh-CN']),'en');assert.equal(chooseLocale('', ['en-GB']),'zh-CN');assert.equal(chooseLocale('bad',['ja-JP']),'zh-CN');assert.equal(chooseLocale(undefined,['en-US']),'zh-CN');assert.equal(chooseLocale(null),'zh-CN')
})
test('every matching enum is an ID with labels in both catalogs',()=>{
 for(const key of [...GOALS,...SLOT_OPTIONS,...TASKS,...STYLE_LABELS,...Object.keys(MAP_MODES),...Object.values(MAP_MODES).flat(),'language.zh','language.en','voice.mic']){
  assert.ok(!han.test(key));assert.ok(hasMessage(key),key);assert.ok(!han.test(translate(key,'en')),key)
 }
})
test('changing interface language never rewrites an already published profile',()=>{
 const before=JSON.stringify(profile),summary=computed(()=>t(profile.goal))
 locale.value='zh-CN';assert.equal(summary.value,'搜打撤');locale.value='en';assert.equal(summary.value,'Loot & extract')
 assert.equal(JSON.stringify(profile),before);assert.equal(profile.listing_language,'en');assert.equal(profile.language,'language.en')
 for(let step=1;step<=4;step++)assert.deepEqual(stepErrors(profile,step),{})
 locale.value='zh-CN'
})
test('published and comparison details preserve raw user text and compare IDs independently of display language',()=>{
 locale.value='en';const saved={...profile,strength_score:100,strength_min:70,strength_max:130};const rows=publishedRecruitmentDetails(saved)
 assert.equal(rows.find(row=>row.key==='identity').values[0],'中文');assert.ok(rows.find(row=>row.key==='identity').values.includes('English'))
 assert.ok(rows.find(row=>row.key==='maps').values.includes('Brakkesh · Top Secret'))
 assert.equal(rows.find(row=>row.key==='listing_language').values[0],'English')
 assert.ok(recruitmentComparison(saved,saved,100,[70,130]).every(row=>!row.changed));locale.value='zh-CN'
})
test('named parameters localize whole messages without guessing fragments',()=>{
 assert.equal(translate('message.resendCountdown','en',{seconds:30}),'Resend in 30s');assert.equal(translate('message.resendCountdown','zh-CN',{seconds:30}),'30 秒后重发')
 assert.equal(translate('message.gearSummary','en',{helmet:3,armor:4,ammo:5}),'Helmet 3 · Armor 4 · Ammo 5')
})
test('API codes localize without inspecting human prose or exposing validation inputs',()=>{
 const key=apiErrorMessage({error_code:'ui.you_already_reserved_another_event_at_this_time',detail:'not used'})
 assert.equal(translatedError(key,'en'),'You already reserved another event at this time')
 const validation=apiErrorMessage({detail:[{loc:['body','nickname'],type:'missing',input:'private'}]})
 assert.equal(validation,'validation.field.nickname');assert.equal(translatedError(validation,'en'),'Please check nickname')
 assert.equal(translatedError('unknown','en'),'Could not complete this action. Please try again later.')
})
test('registered templates and business comparisons cannot introduce Chinese keys or enums',()=>{
 function compareGuard(ast,file){if(!ast||typeof ast!=='object')return;if(ast.type==='BinaryExpression'&&['===','!==','==','!='].includes(ast.operator))for(const node of [ast.left,ast.right])if(node.type==='StringLiteral')assert.ok(!han.test(node.value),file+': Chinese business comparison');for(const key in ast)if(!['loc','comments'].includes(key)){if(Array.isArray(ast[key]))ast[key].forEach(n=>compareGuard(n,file));else if(typeof ast[key]==='object')compareGuard(ast[key],file)}}
 function templateGuard(n,file){if(n.type===5){for(const m of n.content.content.matchAll(/\$t\(["']([^"']+)["']/g))assert.ok(hasMessage(m[1])||(m[1].endsWith('.')&&Object.keys(english).some(key=>key.startsWith(m[1]))),file+': '+m[1]);try{compareGuard(parseJs('const value='+n.content.content),file)}catch(e){if(e.code==='ERR_ASSERTION')throw e}}for(const c of n.children||[])templateGuard(c,file)}
 for(const dir of ['../src/components/','../src/pages/pilot/','../src/utils/'])for(const name of readdirSync(new URL(dir,import.meta.url))){if(!/\.(vue|js)$/.test(name))continue;const source=readFileSync(new URL(dir+name,import.meta.url),'utf8');if(name.endsWith('.vue')){const {descriptor}=parseSfc(source);if(descriptor.template)templateGuard(parseTemplate(descriptor.template.content),name);const script=descriptor.scriptSetup||descriptor.script;if(script)compareGuard(parseJs(script.content,{sourceType:'module'}),name)}else compareGuard(parseJs(source,{sourceType:'module'}),name)}
 assert.ok(readFileSync(new URL('../src/components/pilot-chat.vue',import.meta.url),'utf8').includes('{{m.content}}'))
 assert.ok(readFileSync(new URL('../src/components/growth-tools.vue',import.meta.url),'utf8').includes('{{a.title}}'))
})
