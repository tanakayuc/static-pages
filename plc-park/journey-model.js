(function(root){
const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
function seed(){return {logged:false,grant:'none',tokenUntil:0,clock:0,member:'active',ranges:[],duration:600,awards:[],reflection:'',output:'none',shareUrl:'',joined:'2025-04-01',pausedDays:30,avatar:0,room:'lobby'}}
function login(s){if(s.member!=='active')return false;s.logged=true;return true}
function connect(s){if(!s.logged||s.member!=='active')return false;s.grant='active';s.tokenUntil=s.clock+15;return true}
function logout(s,all=false){s.logged=false;if(all){s.grant='revoked';s.tokenUntil=0}}
function call(s){if(s.member!=='active')return 'membership-denied';if(s.grant!=='active')return 'authorization-required';if(s.clock>=s.tokenUntil){s.tokenUntil=s.clock+15;return 'refreshed'}return 'allowed'}
function addRange(s,a,b){if(!Number.isFinite(a)||!Number.isFinite(b)||b<=a||!Number.isFinite(s.duration)||s.duration<=0)return;let list=[...s.ranges,[clamp(a,0,s.duration),clamp(b,0,s.duration)]].sort((x,y)=>x[0]-y[0]);s.ranges=[];for(const r of list){let last=s.ranges.at(-1);if(last&&r[0]<=last[1])last[1]=Math.max(last[1],r[1]);else s.ranges.push([...r])}award(s)}
function coverage(s){return s.duration>0?s.ranges.reduce((a,r)=>a+r[1]-r[0],0)/s.duration:0}
function award(s){if(s.logged&&s.member==='active'&&coverage(s)>=.7&&!s.awards.includes('video:sample:v1'))s.awards.push('video:sample:v1')}
function observe(s,last,now){if(!s.logged||s.member!=='active'||!last||!now.playing||!last.playing||now.seeking||last.seeking||!now.visible||!last.visible)return false;const dt=(now.wall-last.wall)/1000,delta=now.time-last.time;if(dt<=0||dt>5||now.rate<=0||now.rate>2||last.rate!==now.rate||delta<=0||delta>dt*now.rate+0.35)return false;addRange(s,last.time,now.time);return true}
function submit(s,text){if(!s.logged||s.member!=='active'||coverage(s)<.7||text.trim().length<20||s.output==='approved')return false;s.reflection=text.trim();s.output='pending';return true}
function approve(s){if(!s.logged||s.member!=='active'||s.output!=='pending')return false;s.output='approved';if(!s.awards.includes('output:sample:v1'))s.awards.push('output:sample:v1');return true}
function days(s,date='2026-10-06'){const joined=Date.parse(s.joined+'T00:00:00Z'),asof=Date.parse(date+'T00:00:00Z');return Math.max(0,Math.floor((asof-joined)/86400000)-s.pausedDays)}
function unlocked(s,date){let d=days(s,date);return d>=365?3:d>=90?2:1}
function totals(s){return {t:840+(s.awards.includes('video:sample:v1')?30:0)+(s.awards.includes('output:sample:v1')?20:0),ltt:14840+(s.awards.includes('video:sample:v1')?30:0)+(s.awards.includes('output:sample:v1')?20:0)}}
function xIntent(text){return 'https://x.com/intent/tweet?'+new URLSearchParams({text,hashtags:'PLC'})}
const api={seed,login,connect,logout,call,addRange,coverage,award,observe,submit,approve,days,unlocked,totals,xIntent};if(typeof module!=='undefined')module.exports=api;root.Journey=api;
})(typeof window==='undefined'?globalThis:window);
