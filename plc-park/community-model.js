/* Proposed community rules. Only synthetic records; no network integration. */
(function(root){
const BASE=Date.parse('2026-10-05T09:00:00+09:00'),START=Date.parse('2026-10-01T00:00:00+09:00');
const members=[
{id:'aoi',person:0,name:'あおい',offer:'コンテンツホルダー',want:'プロデューサー',topic:'健康・習慣化',note:'オンライン講座の販売導線を一緒につくれる方を探しています。',expires:BASE+14*86400000,visible:true,lastActive:BASE-120000,lastLogin:'10/5 08:40',aiDays:3,aiSessions:8},
{id:'sora',person:1,name:'そら',offer:'プロデューサー',want:'コンテンツホルダー',topic:'健康・習慣化',note:'専門知識を講座にしたい方と、企画から伴走したいです。',expires:BASE+10*86400000,visible:true,lastActive:BASE-3600000,lastLogin:'10/5 07:50',aiDays:4,aiSessions:12},
{id:'hinata',person:2,name:'ひなた',offer:'ディレクター',want:'セールス',topic:'ビジネス教育',note:'ローンチの相談会を担当できる方と話したいです。',expires:BASE+7*86400000,visible:true,lastActive:BASE-2*86400000,lastLogin:'10/3 10:00',aiDays:2,aiSessions:5},
{id:'ren',person:3,name:'れん',offer:'セールス',want:'プロデューサー',topic:'ビジネス教育',note:'次のプロジェクトの相談相手を探しています。',expires:BASE-86400000,visible:false,lastActive:BASE-9*86400000,lastLogin:'9/26 18:00',aiDays:null,aiSessions:null},
{id:'koharu',person:4,name:'こはる',offer:'サポーター',want:'ディレクター',topic:'コミュニティ運営',note:'イベントの進行を一緒に設計する仲間を募集中です。',expires:BASE+21*86400000,visible:true,lastActive:BASE-30*60000,lastLogin:'10/5 08:00',aiDays:1,aiSessions:2}];
const rooms=[{id:'demo-plaza',name:'PLC交流広場（例）'},{id:'demo-sales',name:'セールス勉強会（例）'},{id:'demo-ads',name:'広告実践チャット（例）'}];
const categories=[{id:'question',name:'指定グループで質問',weight:3,cap:3,contribution:true},{id:'answer',name:'指定グループで回答・支援',weight:10,cap:3,contribution:true},{id:'practice',name:'確認済みの実践・成果共有',weight:40,cap:3,contribution:true},{id:'login',name:'ポータル利用日',weight:1,cap:5,contribution:false},{id:'ai',name:'田中祐一AI利用日',weight:3,cap:5,contribution:false}];
const records=[
{id:'q1',category:'question',room:'demo-plaza',type:'group',date:'2026-10-02',approved:true},
{id:'q2',category:'question',room:'demo-plaza',type:'group',date:'2026-10-03',approved:true},
{id:'a1',category:'answer',room:'demo-plaza',type:'group',date:'2026-10-04',approved:true},
{id:'s1',category:'answer',room:'demo-sales',type:'group',date:'2026-10-03',approved:true},
{id:'ad1',category:'question',room:'demo-ads',type:'group',date:'2026-10-03',approved:true},
{id:'private1',category:'answer',room:'direct-example',type:'direct',date:'2026-10-04',approved:true},
{id:'past1',category:'answer',room:'demo-plaza',type:'group',date:'2026-09-20',approved:true},
{id:'pending1',category:'answer',room:'demo-plaza',type:'group',date:'2026-10-04',approved:false},
{id:'p1',category:'practice',date:'2026-10-02',approved:true},
{id:'p2',category:'practice',date:'2026-10-04',approved:true},
...[1,2,3,4,5].map(n=>({id:'l'+n,category:'login',date:'2026-10-0'+n,approved:true})),
...[2,3,4].map(n=>({id:'ai'+n,category:'ai',date:'2026-10-0'+n,approved:true}))];
function init(s){if(!s.community)s.community={own:{...members[0]},shift:0,allowed:['demo-plaza'],weights:Object.fromEntries(categories.map(c=>[c.id,c.weight]))};return s.community;}
function now(s){return BASE+init(s).shift;}
function getMembers(s){return [init(s).own,...members.slice(1)];}
function active(m,t){return !!m.want&&m.expires>t;}
function presence(m,t){if(!m.visible)return '利用状況は非公開';const elapsed=Math.max(0,t-m.lastActive),mins=Math.floor(elapsed/60000);return elapsed<=300000?'5分以内に利用':mins<60?'1時間以内に利用':mins<1440?'24時間以内に利用':`${Math.floor(mins/1440)}日前に利用`;}
function matches(s){const list=getMembers(s),me=list[0],t=now(s);if(!active(me,t))return [];return list.slice(1).filter(m=>active(m,t)&&m.offer===me.want).map(m=>({...m,reasons:[`求める${me.want}として協力できる`,...(m.want===me.offer?['相手の募集とも一致']:[]),...(m.topic===me.topic?[`分野が一致：${me.topic}`]:[])]})).sort((a,b)=>b.reasons.length-a.reasons.length);}
function updateOwn(s,input){const c=init(s),days=Number(input.days);if(!['コンテンツホルダー','プロデューサー','ディレクター','セールス','サポーター'].includes(input.offer))return false;if(!['コンテンツホルダー','プロデューサー','ディレクター','セールス','サポーター'].includes(input.want)||!input.note.trim()||!input.topic.trim()||![7,14,30].includes(days))return false;Object.assign(c.own,{offer:input.offer,want:input.want,topic:input.topic.trim(),note:input.note.trim(),visible:!!input.visible,expires:now(s)+days*86400000});return true;}
function score(s,input=records){const cfg=init(s),count=Object.fromEntries(categories.map(c=>[c.id,0])),seen=new Set(),days=new Set();let excluded={private:0,scope:0,past:0,pending:0};
for(const e of input){if(e.type==='direct'||e.type==='my'){excluded.private++;continue;}if(e.type==='group'&&!cfg.allowed.includes(e.room)){excluded.scope++;continue;}if(Date.parse(e.date+'T00:00:00+09:00')<START){excluded.past++;continue;}if(!e.approved){excluded.pending++;continue;}if(seen.has(e.id))continue;seen.add(e.id);if(!(e.category in count))continue;if(['login','ai'].includes(e.category)){const key=e.category+e.date;if(days.has(key))continue;days.add(key);}count[e.category]++;}
const rows=categories.map(c=>({...c,weight:Math.max(0,Math.min(50,Number(cfg.weights[c.id])||0)),count:count[c.id],used:Math.min(count[c.id],c.cap)})).map(c=>({...c,points:c.used*c.weight}));return {rows,total:rows.reduce((n,c)=>n+c.points,0),contribution:rows.filter(c=>c.contribution).reduce((n,c)=>n+c.points,0),usage:rows.filter(c=>!c.contribution).reduce((n,c)=>n+c.points,0),excluded};}
const api={BASE,START,members,rooms,categories,records,init,now,getMembers,active,presence,matches,updateOwn,score};if(typeof module!=='undefined')module.exports=api;else root.Community=api;
})(globalThis);
