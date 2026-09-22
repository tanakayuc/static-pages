'use strict';
// 3 steps: edit style -> cut tempo (with preview) -> caption look. Cut-only hides every caption control.
const state={style:null,tempo:null};
const STYLES={talk:{label:'トークリール',pattern:'pattern1',captions:true,speed:true},
              multi:{label:'複数素材切替',pattern:'pattern2',captions:true,speed:false},
              cuts:{label:'カットのみ（テロップなし）',pattern:'pattern1',captions:false,speed:true}};
const TEMPO={fast:'FAST｜テンポ重視',standard:'STANDARD｜標準',natural:'NATURAL｜余白重視'};
const FONTS={gothic:{family:'PreviewGothic',italic:true,weight:700},mincho:{family:'PreviewMincho',italic:true,weight:900},
             rounded:{family:'PreviewRounded',italic:true,weight:900},corporate:{family:'PreviewCorporate',italic:false,weight:700}};
const BAND={centers:{upper:380,middle:960,lower:1400},height:220,defaults:{size:80,color:'#FFFFFF',emphasis:'#FFE14D',italic:true,band:true,bandColor:'#000000',opacity:45}};
const COLOR_NAMES={'#000000':'黒','#0F3FBF':'青','#164C41':'深緑','#4F293B':'ワイン','#1D2844':'紺'};
const el=id=>document.getElementById(id);

const player=el('main-video');
const surface=document.createElement('div');surface.className='video-surface';
player.parentNode.insertBefore(surface,player);surface.append(player);
player.setAttribute('controlsList','nodownload nofullscreen noremoteplayback');player.disablePictureInPicture=true;
// The small native play button was being ignored, so the preview carries its own large one.
const bigPlay=document.createElement('button');bigPlay.type='button';bigPlay.className='big-play';
bigPlay.setAttribute('aria-label','プレビューを再生');bigPlay.innerHTML='<span aria-hidden="true"></span>';surface.append(bigPlay);
const capLive=document.createElement('div');capLive.className='cap-live';capLive.hidden=true;
capLive.innerHTML='<div class="cap-live-text"></div>';surface.append(capLive);

function look(){
 // Font (4) Corporate Logo is a non-italic face in the skill, so it is never slanted.
 return{size:Number(el('font-size').value),color:el('font-color').value.toUpperCase(),
        emphasis:el('emphasis-color').value.toUpperCase(),italic:FONTS[fontKey()].italic&&el('font-italic').checked,
        band:el('band-on').checked,bandColor:el('band-color').value.toUpperCase(),opacity:Number(el('band-opacity').value),
        position:el('caption-position').value};
}
function fontKey(){return document.querySelector('input[name=font]:checked').closest('[data-font]').dataset.font}
function captionsOn(){return Boolean(state.style)&&STYLES[state.style].captions}
function hexRgba(hex,a){const n=parseInt(hex.slice(1),16);return `rgba(${n>>16&255},${n>>8&255},${n&255},${a})`}
function luminance(hex){const n=parseInt(hex.slice(1),16);return[n>>16&255,n>>8&255,n&255].map(v=>{v/=255;return v<=.03928?v/12.92:((v+.055)/1.055)**2.4}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0)}
function contrast(a,b){const x=luminance(a),y=luminance(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05)}
function splitRows(text){const t=text.replace(/[。、]/g,'');if(t.length<=10)return[t];const m=Math.ceil(t.length/2);return[t.slice(0,m),t.slice(m)]}

/** Draw one caption block (band optional) at the chosen position, scaled to the given stage width. */
function paint(node,stageWidth){
 const l=look();const preset=FONTS[fontKey()];
 node.style.top=((BAND.centers[l.position]-BAND.height/2)/1920*100)+'%';
 node.style.height=(BAND.height/1920*100)+'%';
 node.style.background=l.band?hexRgba(l.bandColor,l.opacity/100):'transparent';
 node.style.setProperty('--emphasis',l.emphasis);
 const text=node.firstElementChild;
 if(!text)return;
 text.style.color=l.color;
 text.style.fontFamily=preset.family;
 text.style.fontWeight=preset.weight;
 text.style.transform=l.italic?'skewX(-11.3deg)':'none';
 if(stageWidth)text.style.fontSize=(stageWidth*l.size/1080)+'px';
}

let cues=null;
fetch('interactive-preview/manifest.json').then(r=>{if(!r.ok)throw Error('見本を取得できません');return r.json()})
 .then(data=>{cues=data.timelines;syncCaption()})
 .catch(()=>{el('preview-note').textContent='テロップ見本を読み込めませんでした。ページを再読み込みしてください。'});

function syncCaption(){
 // Only the talking-head preview draws live captions: the multi-source sample already has them burned in.
 const live=state.style==='talk'&&captionsOn()&&cues&&cues[state.tempo];
 capLive.hidden=!live;
 if(!live)return;
 paint(capLive,surface.clientWidth);
 const cue=cues[state.tempo].find(c=>c.start<=player.currentTime&&player.currentTime<c.end);
 capLive.firstElementChild.replaceChildren(...(cue?splitRows(cue.text):[]).map(row=>{
  const span=document.createElement('span');span.textContent=row;return span}));
}
for(const event of['timeupdate','seeked','loadeddata'])player.addEventListener(event,syncCaption);
if(player.requestVideoFrameCallback){const frame=()=>{syncCaption();player.requestVideoFrameCallback(frame)};player.requestVideoFrameCallback(frame)}

let timelines=null;
fetch('preview-timelines.json').then(r=>{if(!r.ok)throw Error('時刻情報を取得できません');return r.json()})
 .then(data=>{timelines=data;applySpeed()})
 .catch(()=>{el('speed-help').textContent='区間速度の見本情報を取得できません。生成設定は保存できますが、プレビューは等速です。'});

function speedSelection(){
 const scope=el('speed-scope').value,speed=Number(el('playback-speed').value);
 const result={playback_speed:speed,speed_scope:scope};
 if(scope==='range')result.speed_start=Number(el('speed-start').value);
 if(scope!=='all')result.speed_end=Number(el('speed-end').value);
 if(![1,1.15,1.3,1.45].includes(speed)||!['all','intro','range'].includes(scope)
  ||(scope!=='all'&&(!Number.isFinite(result.speed_end)||result.speed_end<=(result.speed_start||0)))
  ||(scope==='range'&&(!Number.isFinite(result.speed_start)||result.speed_start<0)))
  throw Error('速度区間は開始より後の終了秒を指定してください。');
 return result;
}
function applySpeed(){
 if(!state.style||!STYLES[state.style].speed){player.playbackRate=1;return}
 try{const s=speedSelection();let inside=s.speed_scope==='all';
  if(!inside&&timelines&&timelines[state.tempo]){
   const m=timelines[state.tempo].find(x=>x.output_start<=player.currentTime&&player.currentTime<x.output_end);
   if(m){const source=m.source_start+player.currentTime-m.output_start;inside=source>=(s.speed_start||0)&&source<s.speed_end}}
  player.preservesPitch=true;player.playbackRate=inside?s.playback_speed:1;
 }catch{player.playbackRate=1}
}
for(const event of['timeupdate','loadedmetadata','seeked'])player.addEventListener(event,applySpeed);

function currentStep(n){document.querySelectorAll('.steps a').forEach((a,i)=>{
 if(i+1===n)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current')})}

function preview(){
 const ready=Boolean(state.style&&state.tempo);
 el('preview-empty').hidden=ready;surface.hidden=!ready;player.hidden=!ready;
 if(!ready)return;
 const src=state.style==='multi'?'videos/multi-source.mp4?v=20260920':'interactive-preview/'+state.tempo+'.mp4?v=20260916-position1';
 if(player.getAttribute('src')!==src){const playing=!player.paused;player.pause();player.setAttribute('src',src);player.load();if(playing)player.play().catch(()=>{})}
 el('preview-label').textContent=STYLES[state.style].label+'｜'+TEMPO[state.tempo];
 el('preview-note').textContent=state.style==='multi'
  ?'複数素材切替は、テロップが切り替わる瞬間に映像も切り替わります。この見本は完成動画の冒頭24秒で、テンポを変えても同じ動画です。選んだテンポは制作設定に保存されます。'
  :state.style==='cuts'
  ?'カットのみの編集です。この見本にもテロップは入っていません。間や言い淀みの詰まり方、カットの間合いだけを見てください。'
  :'カットの間合い、テロップの出るタイミング、文字の見やすさ。ステップ3で見た目を変えると、このプレビューにもそのまま反映されます。';
 syncCaption();
}

function update(){
 const style=state.style?STYLES[state.style]:null;
 const captions=captionsOn();
 const l=look();
 // Cut-only burns in no caption, so step 3 disappears entirely — heading and nav item included.
 const noCaptions=Boolean(state.style)&&!captions;
 el('step3').hidden=noCaptions;el('nav-step3').hidden=noCaptions;
 el('look-off').hidden=!noCaptions;
 document.querySelectorAll('.sum-caption-only').forEach(n=>{n.hidden=Boolean(state.style)&&!captions});
 const speed=Boolean(style&&style.speed);
 ['speed-box','speed-help','sum-speed-wrap'].forEach(id=>{el(id).hidden=!speed});
 const scope=el('speed-scope').value;
 el('speed-start-control').hidden=!speed||scope!=='range';
 el('speed-end-control').hidden=!speed||scope==='all';

 const slantable=FONTS[fontKey()].italic;
 el('font-italic').disabled=!slantable;
 el('italic-note').hidden=slantable;
 el('font-size-value').textContent=l.size;
 el('band-opacity-value').textContent=l.opacity+'%';
 el('band-options').hidden=!l.band;el('band-presets').hidden=!l.band;
 document.querySelectorAll('[data-band-color]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.bandColor===l.bandColor)));
 document.querySelectorAll('.font-chip').forEach(c=>c.classList.toggle('on',c.dataset.font===fontKey()));
 paint(el('band-strip'),el('band-stage').clientWidth||270);

 const warn=[];
 if(l.band&&contrast(l.color,l.bandColor)<3)warn.push('文字色と帯の色が近く、読みにくくなる可能性があります。');
 if(!l.band&&contrast(l.color,'#000000')<3)warn.push('帯なしで暗い文字色は、映像によっては読めなくなる可能性があります。');
 if(contrast(l.emphasis,l.band?l.bandColor:'#000000')<3)warn.push('強調の文字色が背景と近く、目立ちにくい可能性があります。');
 if(contrast(l.emphasis,l.color)<1.3)warn.push('強調の文字色がベースの文字色に近く、強調が分かりにくい可能性があります。');
 if(l.band&&l.opacity<30)warn.push('帯の透明度が高く、明るい映像では文字が読みにくくなる可能性があります。');
 el('band-warning').textContent=captions?warn.join(''):'';

 const font=document.querySelector('input[name=font]:checked');
 el('sum-style').textContent=style?style.label:'未選択';
 el('sum-tempo').textContent=state.tempo?TEMPO[state.tempo]:'未選択';
 el('sum-font').textContent=font.value+font.dataset.fontName;
 el('sum-caption').textContent=l.band?'全幅固定帯（'+(COLOR_NAMES[l.bandColor]||l.bandColor)+'・'+l.opacity+'%）':'帯なし（文字だけ）';
 el('sum-position').textContent=el('caption-position').selectedOptions[0].text.replace(/（.*）/,'')+'・'+l.size;
 el('sum-speed').textContent=el('playback-speed').selectedOptions[0].text+'・'+el('speed-scope').selectedOptions[0].text;

 let valid=true;
 try{speedSelection();el('settings-error').textContent=''}catch(e){valid=!speed;el('settings-error').textContent=speed?e.message:''}
 const ready=Boolean(state.style&&state.tempo&&valid);
 el('generate').disabled=!ready;
 el('summary-help').textContent=ready?'選択内容を確認して、AIへ渡せます':'編集スタイルとテンポを選んでください';
 el('prompt-box').hidden=true;
 preview();applySpeed();
}

document.querySelectorAll('[data-style]').forEach(b=>b.addEventListener('click',()=>{
 state.style=b.dataset.style;
 document.querySelectorAll('[data-style]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
 currentStep(2);update()}));
document.querySelectorAll('[data-tempo]').forEach(b=>b.addEventListener('click',()=>{
 state.tempo=b.dataset.tempo;
 document.querySelectorAll('[data-tempo]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
 currentStep(state.style?3:1);update()}));
document.querySelectorAll('input[name=font],#caption-position,#playback-speed,#speed-scope,#speed-start,#speed-end,#font-size,#font-color,#emphasis-color,#font-italic,#band-on,#band-color,#band-opacity')
 .forEach(x=>x.addEventListener('change',update));
document.querySelectorAll('#font-size,#font-color,#emphasis-color,#band-color,#band-opacity')
 .forEach(x=>x.addEventListener('input',()=>{update();syncCaption()}));
document.querySelectorAll('[data-band-color]').forEach(x=>x.addEventListener('click',()=>{
 el('band-color').value=x.dataset.bandColor;update();syncCaption()}));
el('look-reset').addEventListener('click',()=>{
 const d=BAND.defaults;
 el('font-size').value=d.size;el('font-color').value=d.color;el('emphasis-color').value=d.emphasis;
 el('font-italic').checked=d.italic;el('band-on').checked=d.band;el('band-color').value=d.bandColor;el('band-opacity').value=d.opacity;
 update();syncCaption()});
window.addEventListener('resize',()=>{update();syncCaption()});

bigPlay.addEventListener('click',()=>player.play().catch(()=>{}));
function showPlay(){bigPlay.hidden=!player.paused||player.hidden}
for(const event of['play','pause','ended','loadeddata','emptied'])player.addEventListener(event,showPlay);

el('generate').addEventListener('click',()=>{
 if(!state.style||!state.tempo)return;
 const style=STYLES[state.style],l=look(),font=document.querySelector('input[name=font]:checked'),preset=FONTS[fontKey()];
 const selection={video_pattern:style.pattern,cut_tempo:state.tempo,
  caption_style:!style.captions?'none':l.band?'fixed-band':'no-bands',caption_mode:'edited'};
 if(style.captions){
  selection.caption_position=l.position;selection.font_weight=preset.weight;selection.font_italic=l.italic;
  // 書体①はパターン1がNoto Sans CJK JP Bold、パターン2は源暎NuゴシックEB。配布できない書体はURLを渡さずfont_nameで指定する。
  selection.font_choice=font.value;selection.font_name=font.dataset.fontName;selection.font_family=font.dataset.fontFamily;
  selection.font_file_url=new URL('font-samples/'+font.dataset.fontFile,location.href).href;
  if(style.pattern==='pattern2'&&font.dataset.p2FontName){
   selection.font_name=font.dataset.p2FontName;selection.font_family=font.dataset.p2FontFamily;delete selection.font_file_url}
  selection.font_size=l.size;selection.font_color=l.color;selection.emphasis_color=l.emphasis;
  if(l.band){selection.band_color=l.bandColor;selection.band_opacity=Math.round(l.opacity)/100}}
 if(style.speed){try{Object.assign(selection,speedSelection())}catch(e){el('settings-error').textContent=e.message;return}}
 window.videoSelection=selection;
 el('instruction').value='田中式ショート動画編集で、以下の設定で制作してください。選択済みの条件は聞き直さず、必要な素材を確認して進めてください。指定した実フォントを使い、近似フォントへ置き換えないでください。'
  +(style.captions?'':'\nこの案件はカットのみの編集です。テロップは一切入れないでください。')
  +(selection.speed_scope&&selection.speed_scope!=='all'?'\n速度区間の秒数は元動画の秒数です。このサイトは元動画の長さを知らないので、指定が元動画の長さを超えていたら、制作を始める前に正しい秒数を確認してください。':'')
  +'\n\n'+JSON.stringify(selection,null,2);
 el('prompt-box').hidden=false;el('copy-status').textContent='';
 el('prompt-box').scrollIntoView({behavior:'smooth',block:'center'})});

el('copy').addEventListener('click',async()=>{
 const t=el('instruction');
 try{await navigator.clipboard.writeText(t.value);el('copy-status').textContent='コピーしました。田中祐一AIとの会話に貼り付けてください。'}
 catch{t.focus();t.select();el('copy-status').textContent='依頼文を選択しました。コピーしてAIへ貼り付けてください。'}});

document.querySelectorAll('.steps a').forEach((a,i)=>a.addEventListener('click',()=>currentStep(i+1)));
const observer=new IntersectionObserver(entries=>{
 for(const e of entries)if(e.isIntersecting)currentStep(Number(e.target.dataset.step))},{rootMargin:'-15% 0px -60% 0px'});
document.querySelectorAll('section[data-step]').forEach(s=>observer.observe(s));
update();showPlay();
