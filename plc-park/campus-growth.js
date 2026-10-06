/* Public demo only. Production awards must be verified on the server. */
(function(root){
 const season='2026-Q4',base={ltt:1190,seasonT:240,awards:[]};
 function state(saved){return {ltt:base.ltt,seasonT:base.seasonT,awards:[],...(saved&&saved.awards?.includes('knowledge-approved-demo')?{ltt:1230,seasonT:280,awards:['knowledge-approved-demo']}: {})};}
 function award(s,event){if(event.id!=='knowledge-approved-demo'||s.awards.includes(event.id))return s;return {...s,ltt:s.ltt+40,seasonT:s.seasonT+(event.season===season?40:0),awards:[...s.awards,event.id]};}
 function level(ltt){return Math.floor(ltt/100)+1;}
 function ranking(members){return [...members].sort((a,b)=>b.t-a.t).map(p=>({...p,rank:1+members.filter(x=>x.t>p.t).length}));}
 root.CampusGrowth={state,award,level,ranking,season};if(typeof module!=='undefined')module.exports=root.CampusGrowth;
})(globalThis);
