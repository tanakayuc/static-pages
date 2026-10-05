(function(root){
const activities=[{id:'coaching',name:'コーチングを受けた',points:150,kind:'相談'},{id:'consult',name:'相談して次の一歩を決めた',points:100,kind:'相談'},{id:'sales',name:'セールスコンサルを受けた',points:200,kind:'実践'},{id:'event',name:'イベントを企画・開催した',points:300,kind:'貢献'},{id:'funnel',name:'ファネルを構築・公開した',points:250,kind:'実践'},{id:'sns',name:'SNS発信を週3回続けた',points:80,kind:'発信'},{id:'jv',name:'JVを実施した',points:250,kind:'協働'},{id:'club',name:'部活動を最後までやり切った',points:300,kind:'協働'},{id:'award',name:'部活動で表彰された',points:150,kind:'貢献'}];
const seed=()=>({t:840,ltt:14840,claims:[],done:[],equipped:false,mainJob:'コンテンツホルダー',subJob:'プロデューサー',history:[{name:'学んだことをチームに共有',points:100,kind:'貢献',date:'2026/10/04'},{name:'45日シートを更新',points:40,kind:'実践',date:'2026/10/03'}]});
function claim(s,id,note){const a=activities.find(x=>x.id===id);if(!a||!note.trim()||s.claims.some(x=>x.id===id&&x.status!=='差戻し'))return false;s.claims.push({...a,note,status:'承認待ち'});return true;}
function approve(s,id){const c=s.claims.find(x=>x.id===id&&x.status==='承認待ち');if(!c)return false;c.status='承認済み';s.t+=c.points;s.ltt+=c.points;s.history.unshift({name:c.name,points:c.points,kind:c.kind,date:new Date().toLocaleDateString('ja-JP')});return true;}
function complete(s,id,name){if(s.done.includes(id))return false;s.done.push(id);s.t+=30;s.ltt+=30;s.history.unshift({name,points:30,kind:'学習',date:new Date().toLocaleDateString('ja-JP')});return true;}
const api={activities,seed,claim,approve,complete};if(typeof module!=='undefined')module.exports=api;else root.PLC=api;
})(globalThis);
