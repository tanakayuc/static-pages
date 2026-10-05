/* Shared demo rules. All people and records are fictional. */
(function(root){
const TODAY=15, DUE_THROUGH=14;
const members=[
{id:'aoi',name:'あおい',person:0,sheet:true,paused:false,days:13,owner:'こはる'},
{id:'sora',name:'そら',person:1,sheet:false,paused:false,days:0,owner:'こはる'},
{id:'hinata',name:'ひなた',person:2,sheet:true,paused:false,days:14,owner:'そら'},
{id:'ren',name:'れん',person:3,sheet:true,paused:true,days:7,owner:'そら'},
{id:'koharu',name:'こはる',person:4,sheet:true,paused:false,days:11,owner:'そら'}];
const events=[{id:'ws1003',name:'10/3 実践ワークショップ',status:['参加済み','未参加確認済み','出欠未確認','欠席連絡あり','対象外']},{id:'gc1002',name:'10/2 グループコンサル',status:['出欠未確認','参加済み','参加済み','対象外','未参加確認済み']}];
function init(s){if(!s.ops)s.ops={reports:Object.fromEntries(Array.from({length:13},(_,i)=>[i+1,{note:'学びを実践し、チームに共有しました。',help:false,seed:true}])),attendance:{},tasks:{},audit:[]};return s.ops;}
function date(day){const d=new Date(Date.UTC(2026,8,20+day));return `${d.getUTCMonth()+1}/${d.getUTCDate()}`;}
function missing(s,id){const m=members.find(x=>x.id===id);if(!m||!m.sheet||m.paused)return [];return Array.from({length:DUE_THROUGH},(_,i)=>i+1).filter(d=>id==='aoi'?!init(s).reports[d]:d>m.days);}
function record(s,day,note,help){init(s);if(!Number.isInteger(day)||day<1||day>TODAY||!note.trim())return false;const isNew=!s.ops.reports[day];s.ops.reports[day]={note:note.trim(),help:!!help};if(isNew){s.t+=10;s.ltt+=10;s.history.unshift({name:`45日シート Day ${day} を報告`,points:10,kind:'実践',date:`2026/${date(day)}`});}s.ops.audit.unshift({action:`あおい：Day ${day} ${isNew?'初回報告 +10 T / LTT':'報告を編集（再加算なし）'}`,at:new Date().toLocaleString('ja-JP')});return isNew?'created':'updated';}
function attendance(s,event,id){const ev=events.find(x=>x.id===event),i=members.findIndex(x=>x.id===id);return init(s).attendance[`${event}:${id}`]?.status||ev?.status[i];}
function setAttendance(s,event,id,status,evidence){init(s);if(!events.some(e=>e.id===event)||!members.some(m=>m.id===id)||!['参加済み','未参加確認済み','出欠未確認','欠席連絡あり','対象外'].includes(status)||!evidence.trim())return false;const key=`${event}:${id}`,before=attendance(s,event,id);s.ops.attendance[key]={status,evidence:evidence.trim()};s.ops.audit.unshift({action:`${members.find(m=>m.id===id).name} / ${events.find(e=>e.id===event).name}：${before} → ${status}（根拠：${evidence.trim()}）`,at:new Date().toLocaleString('ja-JP')});return true;}
function counts(s,event){const statuses=members.map(m=>attendance(s,event,m.id));return {attended:statuses.filter(x=>x==='参加済み').length,absent:statuses.filter(x=>x==='未参加確認済み').length,unknown:statuses.filter(x=>x==='出欠未確認').length,excluded:statuses.filter(x=>['対象外','欠席連絡あり'].includes(x)).length};}
const api={TODAY,DUE_THROUGH,members,events,init,date,missing,record,attendance,setAttendance,counts};if(typeof module!=='undefined')module.exports=api;else root.Ops=api;
})(globalThis);
