import * as THREE from './vendor/three.module.js';
import {OrbitControls} from './vendor/OrbitControls.js';
import {mergeGeometries} from './vendor/BufferGeometryUtils.js';

// A real 3D garden, with illustrated character cutouts retaining the approved art style.
export function campus(el,onRoom,options={}) {
  const scene=new THREE.Scene(); scene.background=new THREE.Color('#d8ede7');
  const renderer=new THREE.WebGLRenderer({antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.6)); renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=false; renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.0;
  el.append(renderer.domElement);renderer.domElement.setAttribute('aria-label','花と木々に囲まれたPLCキャンパス。地面を押して散歩、建物を押して入室。');
  const camera=new THREE.PerspectiveCamera(36,1,.1,150);
  const controls=new OrbitControls(camera,renderer.domElement);controls.enablePan=false;
  controls.minDistance=16;controls.maxDistance=76;controls.minPolarAngle=.38;controls.maxPolarAngle=1.15;
  scene.add(new THREE.HemisphereLight('#fff9e9','#b0c3a0',1.8));
  const sun=new THREE.DirectionalLight('#ffdfad',2.5);sun.position.set(-15,25,12);sun.castShadow=true;
  sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-23,right:23,top:23,bottom:-23,near:1,far:80});sun.shadow.bias=-.00025;sun.shadow.normalBias=.04;sun.shadow.radius=4;scene.add(sun);
  const fill=new THREE.DirectionalLight('#d7f4ff',.65);fill.position.set(12,9,-8);scene.add(fill);
  let group,hitTargets=[],ground=[],moving=[],current='lobby',player=null,route=[],arrival=null;
  let disposed=false,visible=true,frame=0,last=0,elapsed=0,animating=!matchMedia('(prefers-reduced-motion: reduce)').matches;
  const textures=[],materials=new Map();let memberIndex=0;const avatarTextures=[];
  const ray=new THREE.Raycaster();const pointer=new THREE.Vector2();const avatarMap=new THREE.TextureLoader().load('./assets/avatars-v2.png',()=>{for(const tx of avatarTextures){tx.image=avatarMap.image;tx.needsUpdate=true}render()},undefined,()=>options.onNotice?.('キャラクター画像を読み込めませんでした。部屋メニューは利用できます。'));
  avatarMap.colorSpace=THREE.SRGBColorSpace;
  const colors={learning:'#efaa72',ai:'#83bbc0',people:'#df9e9b',profile:'#a8bc8e'};
  const titles={learning:'まなびのアトリエ',ai:'AIラボ',people:'つながりカフェ',profile:'マイスタジオ'};
  function material(color,extra={}){const key=color+JSON.stringify(extra);if(!materials.has(key))materials.set(key,new THREE.MeshStandardMaterial({color,roughness:.78,...extra}));return materials.get(key)}
  function mesh(geo,color,x,y,z,parent=group,extra={}){const obj=new THREE.Mesh(geo,material(color,extra));obj.position.set(x,y,z);obj.castShadow=true;obj.receiveShadow=true;parent.add(obj);return obj}
  function round(w,h,d,r=.12){const shape=new THREE.Shape(),x=-w/2,y=-h/2;r=Math.min(r,w/3,h/3,d/3);shape.moveTo(x+r,y);shape.lineTo(x+w-r,y);shape.quadraticCurveTo(x+w,y,x+w,y+r);shape.lineTo(x+w,y+h-r);shape.quadraticCurveTo(x+w,y+h,x+w-r,y+h);shape.lineTo(x+r,y+h);shape.quadraticCurveTo(x,y+h,x,y+h-r);shape.lineTo(x,y+r);shape.quadraticCurveTo(x,y,x+r,y);const g=new THREE.ExtrudeGeometry(shape,{depth:d-2*r,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:r,bevelThickness:r,curveSegments:6});g.translate(0,0,-(d-2*r)/2);return g}
  function box(w,h,d,x,y,z,c,p=group,r=.1){return mesh(round(w,h,d,r),c,x,y,z,p)}
  function ball(r,x,y,z,c,p=group){return mesh(new THREE.SphereGeometry(r,18,12),c,x,y,z,p)}
  function cyl(rt,rb,h,x,y,z,c,p=group){return mesh(new THREE.CylinderGeometry(rt,rb,h,32),c,x,y,z,p)}
  function mark(obj,type,id){obj.userData={type,id};hitTargets.push(obj);return obj}
  function label(text,x,y,z,{width=4.5,color='#3d5144',bg='#fff9e9',size=34}={}){const c=document.createElement('canvas');c.width=640;c.height=112;const ctx=c.getContext('2d');ctx.fillStyle=bg;ctx.beginPath();ctx.roundRect(4,4,632,100,40);ctx.fill();ctx.fillStyle=color;ctx.font=`bold ${size}px sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,320,54);const tx=new THREE.CanvasTexture(c);tx.colorSpace=THREE.SRGBColorSpace;textures.push(tx);const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tx,depthTest:true}));sp.scale.set(width,width*112/640,1);sp.position.set(x,y,z);group.add(sp);return sp}
  function tree(x,z,s=1,c='#83ad70'){const t=new THREE.Group();t.position.set(x,0,z);t.scale.setScalar(s);group.add(t);cyl(.13,.22,2,0,1,0,'#aa8056',t);const a=ball(1.2,0,2.6,0,c,t);a.scale.set(.9,1.14,.95);ball(.88,-.65,2.15,.25,'#a3c381',t);ball(.8,.66,2.35,-.1,c,t);return t}
  function flower(x,z,c='#ecaca6'){cyl(.018,.025,.3,x,.17,z,'#71945b');for(let a=0;a<5;a++){const k=a*Math.PI*2/5;ball(.08,x+Math.cos(k)*.085,.35,z+Math.sin(k)*.085,c)}ball(.047,x,.39,z,'#ffe5a5')}
  function flowerPatch(x,z,n=6){for(let i=0;i<n;i++){const a=i*2.399,r=.18+Math.sqrt(i)*.22;flower(x+Math.cos(a)*r,z+Math.sin(a)*r,['#f2b5a4','#ffda8a','#c4b1dc'][i%3])}}
  function bench(x,z,angle=0){const b=new THREE.Group();b.position.set(x,0,z);b.rotation.y=angle;group.add(b);for(let i=0;i<3;i++)box(1.7,.09,.15,0,.6,(i-1)*.2,'#c19469',b);box(1.7,.16,.12,0,1,-.3,'#c19469',b);box(1.7,.12,.12,0,1.25,-.3,'#c19469',b);for(const dx of [-.6,.6]){box(.12,.65,.12,dx,.3,0,'#5d7761',b);box(.1,.85,.1,dx,.8,-.3,'#5d7761',b)}}
  function lamp(x,z){cyl(.055,.08,2,x,1,z,'#657866');box(.35,.45,.35,x,2.1,z,'#ffe7ae');box(.5,.08,.5,x,2.38,z,'#668575');}
  function avatar(index,x,z,name,isPlayer=false){const tx=avatarMap.clone();tx.repeat.set(.31,.49);tx.offset.set((index%3)/3+.0116,index<3?.505:.005);tx.needsUpdate=true;avatarTextures.push(tx);const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tx,transparent:true,alphaTest:.12,depthWrite:false}));sp.center.set(.5,.04);sp.scale.set(2.25,2.25,1);sp.position.set(x,.16,z);group.add(sp);if(!isPlayer)mark(sp,'member',name);const shadow=new THREE.Mesh(new THREE.CircleGeometry(.48,32),new THREE.MeshBasicMaterial({color:'#537554',transparent:true,opacity:.16,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.set(x,.085,z);group.add(shadow);if(isPlayer){const ring=mesh(new THREE.TorusGeometry(.6,.035,8,48),'#fff0aa',x,.11,z);ring.rotation.x=Math.PI/2;return{sp,shadow,ring}}return sp;}
  function roof(w,d,x,y,z,c,p){const shape=new THREE.Shape();shape.moveTo(-w/2,0);shape.lineTo(0,1.5);shape.lineTo(w/2,0);shape.closePath();const geo=new THREE.ExtrudeGeometry(shape,{depth:d,bevelEnabled:true,bevelThickness:.13,bevelSize:.12,bevelSegments:4,steps:1});geo.translate(0,0,-d/2);return mesh(geo,c,x,y,z,p)}
  const entrances={learning:[-5.4,-3.2],ai:[5.4,-3.2],people:[-6.8,4.6],profile:[6.8,4.6]};
  function building(id,x,z,angle=0){const b=new THREE.Group();b.position.set(x,0,z);b.rotation.y=angle;group.add(b);const c=colors[id];box(4.8,.3,3.9,0,.17,0,'#e8d4b4',b,.16);mark(box(4.2,2.5,3.4,0,1.52,0,'#fff0d6',b,.16),'room',id);mark(roof(4.9,4,0,2.8,0,c,b),'room',id);box(.55,.8,.6,1.2,3.4,-.6,'#eadcc4',b);cyl(.4,.35,.16,1.2,3.82,-.6,c,b);mark(box(.9,1.8,.12,0,1.1,1.77,'#97795d',b),'room',id);box(.65,.85,.09,0,1.36,1.87,'#acced0',b);ball(.05,.3,.87,1.96,'#e8c586',b);for(const wx of [-1.3,1.3]){box(.95,1.2,.12,wx,1.58,1.76,'#acced0',b,.16);box(.08,1.24,.06,wx,1.58,1.86,'#fff9e9',b);box(1,.08,.06,wx,1.58,1.86,'#fff9e9',b);box(1.15,.28,.42,wx,.9,1.92,'#b6906f',b);for(let i=0;i<3;i++)ball(.17,wx+(i-1)*.3,1.08,1.96,i===1?'#f2bc9f':'#91b47f',b)}box(1.6,.16,.8,0,.14,2.18,'#eddfc4',b);for(const sx of [-1.9,1.9])cyl(.045,.06,1.7,sx,.84,2.1,'#9f9174',b);box(4.1,.09,.85,0,2.52,2.03,c,b);if(id==='people'){for(let i=0;i<8;i++)box(.25,.04,.87,-1.8+i*.5,2.57,2.03,'#fff4d9',b);const umbrella=cyl(0,1.15,.65,2.9,2.2,2.15,'#efbd88',b);cyl(.04,.04,1.8,2.9,.95,2.15,'#a38260',b);cyl(.62,.62,.12,2.9,.9,2.15,'#e7cfa5',b)}if(id==='ai'){const orb=ball(.5,0,4.55,0,'#acd6d7',b);mesh(new THREE.TorusGeometry(.73,.045,8,48),'#f4d6a0',0,4.55,0,b).rotation.x=.8;orb.material=material('#acd6d7',{emissive:'#5e9a96',emissiveIntensity:.12})}mark(label(titles[id],x,5,z,{width:4.8}),'room',id);}
  function pathCurve(points,width=.8,color='#eddbb6',height=.045){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(p[0],height,p[1])));const o=mesh(new THREE.TubeGeometry(curve,60,width,8,false),color,0,-width+.055,0);o.receiveShadow=true;return o}
  function flag(x,z,c){cyl(.03,.04,1.9,x,1,z,'#9c876a');const shape=new THREE.Shape();shape.moveTo(0,0);shape.lineTo(.65,0);shape.lineTo(.5,-.5);shape.lineTo(0,-.5);const o=mesh(new THREE.ShapeGeometry(shape),c,x,1.95,z);o.material=material(c,{side:THREE.DoubleSide});}
  function clear(){route=[];arrival=null;player=null;moving=[];hitTargets=[];ground=[];if(group){group.traverse(o=>{o.geometry?.dispose();if(o.material&&!Array.from(materials.values()).includes(o.material)){o.material.map?.dispose();o.material.dispose()}});scene.remove(group)}for(const tx of textures)tx.dispose();textures.length=0;avatarTextures.length=0;group=new THREE.Group();scene.add(group)}
  function garden(){scene.background.set('#d9eee7');const base=cyl(14,13.2,.85,0,-.56,0,'#d0b89b');base.scale.z=.82;const lawn=cyl(14.15,14,.24,0,-.04,0,'#abc995');lawn.scale.z=.82;ground.push(lawn);
    // The softly edged paths connect all rooms and the shared central garden.
    const road=mesh(new THREE.RingGeometry(5.4,7.1,96),'#eeddbb',0,.095,0);road.rotation.x=-Math.PI/2;road.scale.y=.84;road.receiveShadow=true;
    pathCurve([[-6,-4],[-4,-2],[-2,0],[0,0],[2,0],[4,-2],[6,-4]],.65);
    pathCurve([[-7,5],[-4,3],[0,0],[4,3],[7,5]],.65);
    pathCurve([[0,6],[0,8],[0,10.8]],.7);
    const plaza=cyl(2.6,2.6,.1,0,.08,0,'#e8d5b0');ground.push(plaza);
    const garden=cyl(1.45,1.5,.36,0,.25,0,'#eee0c5');const soil=cyl(1.32,1.32,.04,0,.45,0,'#9dab7d');
    tree(0,0,.78,'#a9c580');flowerPatch(-.8,.6,4);flowerPatch(.75,.6,4);
    mark(label('全員で勝つ · みんなの木',0,3.3,.1,{width:4.8}),'mission','tree');
    building('learning',-5.4,-6);building('ai',5.4,-6);building('people',-8,1.7,.08);building('profile',7.7,1.7,-.08);
    const pond=cyl(2.15,2.2,.12,-4.2,.1,7.1,'#95cacc');pond.scale.z=.7;
    for(let i=0;i<18;i++){const a=i*Math.PI*2/18;const o=ball(.27,-4.2+Math.cos(a)*2.17,.12,7.1+Math.sin(a)*1.48,'#e0d9bb');o.scale.y=.58}
    for(let i=0;i<4;i++){const o=mesh(new THREE.TorusGeometry(.35+i*.14,.013,5,48),'#d4ece0',-4.7,.18,7.25);o.rotation.x=-Math.PI/2;o.scale.y=.65;moving.push({o,kind:'ripple',phase:i})}
    for(let i=0;i<7;i++)box(.3,.11,1.25,-2.35+i*.29,.33,6.1,'#bd9971');
    bench(-2.2,3.2,-.5);bench(2.8,2.9,.5);bench(3.1,7.3,.1);lamp(-1.4,8.5);lamp(1.4,8.5);lamp(-2.8,-3.9);lamp(2.8,-3.9);
    for(const [x,z,s,c] of [[-10,-5,1,'#8db686'],[-9,-8,1.1,'#a6c581'],[-2,-9,1.15,'#91b88a'],[2,-9,1,'#b5ce8c'],[10,-7,1.2,'#95ba8e'],[12,-2,.9,'#adc58a'],[-12,0,.9,'#acc584'],[-11,5,1,'#8eb184'],[11,5,1,'#a7c381'],[8,8,.85,'#b5c894'],[-8,8,.8,'#a1bc82']])tree(x,z,s,c);
    for(const [x,z] of [[-2,8],[1.8,8.5],[-10,3],[10,3],[-2,-6.7],[2,-6.7],[5.1,7],[7.8,-3]])flowerPatch(x,z,6);
    for(let i=0;i<7;i++){const a=i*.9;ball(.35,Math.sin(a)*10,.18,Math.cos(a)*8,'#a1bb86')}
    flag(-1.3,10,'#e1a495');flag(1.3,10,'#dfb879');
    const rope=new THREE.CatmullRomCurve3([new THREE.Vector3(-1.3,1.65,10),new THREE.Vector3(0,1.4,10),new THREE.Vector3(1.3,1.65,10)]);mesh(new THREE.TubeGeometry(rope,18,.018,5,false),'#bca780',0,0,0);
    for(let i=0;i<5;i++){const shape=new THREE.Shape();shape.moveTo(-.12,0);shape.lineTo(.12,0);shape.lineTo(0,-.3);shape.closePath();const o=mesh(new THREE.ShapeGeometry(shape),i%2?'#eabf77':'#dca794',-1+i*.5,1.47+Math.abs(2-i)*.07,10);o.material=material(i%2?'#eabf77':'#dca794',{side:THREE.DoubleSide})}
    avatar(1,-3,-2,'れん');avatar(2,3,-2.5,'みお');avatar(4,-4.8,3.6,'はる');avatar(3,4.5,4.6,'そう');avatar(5,1.2,5.7,'ゆい');player=avatar(memberIndex,0,8.3,'あなた',true);label('あなた',0,2.48,8.3,{width:1.4,bg:'#fff3be',size:38}).userData.playerLabel=true;
    setOverview();controls.target.set(0,.6,-.3);
  }
  function interior(id){scene.background.set('#e9e7d4');box(12,.25,9,0,-.1,0,'#e8c9a0',group,.2);for(let i=0;i<11;i++)box(.035,.01,8.8,-5.5+i,0.05,0,'#d9b88e');box(12,4.2,.18,0,2.1,-4.5,'#fff0d8');box(.18,4.2,9,-6,2.1,0,'#f0e0c3');box(3.2,2.3,.12,-3.5,2.2,-4.3,'#aacdcc');box(.12,2.3,.1,-3.5,2.2,-4.15,'#fff9ec');box(3.2,.1,.1,-3.5,2.2,-4.15,'#fff9ec');box(4.1,2.25,.2,1.7,2.3,-4.25,id==='ai'?'#648f94':'#789681');label(titles[id],1.7,2.35,-3.8,{width:3.5}).material.depthTest=false;const rug=cyl(3,3,.04,0,.08,.3,colors[id]);rug.scale.z=.65;
    if(id==='people'||id==='profile'){box(4,.5,1.5,-1,.65,-1.5,colors[id]);box(4,1.1,.4,-1,1.1,-2.1,colors[id]);for(let i=0;i<3;i++)box(1.1,.28,1.1,-2.3+i*1.3,.99,-1.45,'#f6e4ca');cyl(1.1,1.1,.15,0,.6,.9,'#d3ad7f');cyl(.15,.18,.55,0,.28,.9,'#ae8e67')}else{for(let i=0;i<3;i++){const x=(i-1)*3.1;box(2.3,.18,1.3,x,.9,.3,'#fff2da');for(const dx of [-.85,.85])cyl(.06,.07,.85,x+dx,.43,.3,'#bd9871');box(.95,.18,.85,x,.48,1.7,colors[id]);box(.95,.85,.15,x,.9,2,colors[id]);box(.5,.06,.6,x,.99,.3,i===0?'#e8ad84':'#8eb7b8')}}
    tree(4.6,-2.9,.7);tree(-4.8,2.9,.62);bench(3.7,2.8);avatar(4,-2.6,1.6,'はる');player=avatar(memberIndex,1.7,2.8,'あなた',true);const g=box(11.6,.01,8.6,0,.07,0,'#ead2b0');g.visible=false;ground.push(g);camera.position.set(12,10,14);controls.target.set(0,1,0);
  }
  function batchStatic(){group.updateMatrixWorld(true);const buckets=new Map(),skip=new Set([...hitTargets,...ground,...moving.map(x=>x.o),player?.ring,player?.shadow]);const originals=[];group.traverse(o=>{if(o.isMesh&&!skip.has(o)&&o.visible&&o.material.isMeshStandardMaterial){const g=o.geometry.clone().applyMatrix4(o.matrixWorld);const key=o.material;const list=buckets.get(key)||[];list.push(g.index?g.toNonIndexed():g);if(g.index)g.dispose();buckets.set(key,list);originals.push(o)}});for(const [mat,gs] of buckets){const merged=mergeGeometries(gs,false);if(merged){const m=new THREE.Mesh(merged,mat);m.castShadow=true;m.receiveShadow=true;group.add(m)}gs.forEach(g=>g.dispose())}originals.forEach(o=>{o.parent.remove(o);o.geometry.dispose()})}
  function build(id='lobby'){current=id;clear();if(id==='lobby')garden();else interior(id);batchStatic();renderer.shadowMap.needsUpdate=true;controls.update();render()}
  function setOverview(){const factor=Math.max(1,Math.min(1.9,1.5/(el.clientWidth/Math.max(1,el.clientHeight))));camera.position.set(16*factor,19*factor,23*factor)}
  function render(){if(!disposed&&el.clientWidth&&el.clientHeight)renderer.render(scene,camera)}
  function resize(){const w=el.clientWidth,h=el.clientHeight;if(!w||!h)return;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();render()}
  function animate(t){if(disposed)return;frame=requestAnimationFrame(animate);const dt=Math.min((t-last)/1000,.2);last=t;if(!visible||document.hidden||!el.clientWidth||!el.clientHeight)return;elapsed+=dt;let changed=false;
    if(player&&route.length){const dest=route[0],p=player.sp.position,dist=Math.hypot(dest.x-p.x,dest.z-p.z),step=dt*3.5;if(dist<=step){p.x=dest.x;p.z=dest.z;route.shift();if(!route.length){p.y=.16;const done=arrival;arrival=null;options.onWalk?.('到着しました');if(done){done();return}}}else{p.x+=(dest.x-p.x)/dist*step;p.z+=(dest.z-p.z)/dist*step;p.y=.16+(animating?Math.abs(Math.sin(elapsed*11))*.1:0)}player.shadow.position.set(p.x,.085,p.z);player.ring.position.set(p.x,.11,p.z);const tag=group.children.find(o=>o.userData.playerLabel);if(tag)tag.position.set(p.x,p.y+2.32,p.z);changed=true;}
    if(animating){for(const a of moving){const scale=1+Math.sin(elapsed*1.2+a.phase)*.08;a.o.scale.set(scale,scale*.65,1)}changed=moving.length>0||changed}if(changed)render();}
  // Route through the public plaza, with destinations outside the buildings.
  function walk(x,z,done){if(!player)return;if(current!=='lobby'){options.onNotice?.('部屋の下のメニューから活動を選べます');return}const p=player.sp.position;route=[];if(Math.hypot(p.x-x,p.z-z)>3){const radius=4.4,a=Math.atan2(p.z,p.x),b=Math.atan2(z,x);let delta=b-a;while(delta>Math.PI)delta-=Math.PI*2;while(delta<-Math.PI)delta+=Math.PI*2;route.push(new THREE.Vector3(Math.cos(a)*radius,.16,Math.sin(a)*radius));const count=Math.max(1,Math.ceil(Math.abs(delta)/.22));for(let i=1;i<=count;i++){const v=a+delta*i/count;route.push(new THREE.Vector3(Math.cos(v)*radius,.16,Math.sin(v)*radius))}}route.push(new THREE.Vector3(x,.16,z));arrival=done||null;options.onWalk?.('移動中… 地面を押すと行き先を変えられます');}
  let down;
  renderer.domElement.addEventListener('pointerdown',e=>down=[e.clientX,e.clientY]);
  renderer.domElement.addEventListener('pointerup',e=>{if(!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>7)return;const rect=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);ray.setFromCamera(pointer,camera);const hit=ray.intersectObjects(hitTargets)[0];if(hit){const {type,id}=hit.object.userData;if(type==='room'){const pos=entrances[id];walk(...pos,()=>onRoom(id))}if(type==='member')options.onMember?.(id);if(type==='mission')options.onMission?.();return}const floor=ray.intersectObjects(ground)[0];if(floor){const p=floor.point;if(Math.abs(p.x)<9&&p.z>-3.3&&p.z<10.3){if(Math.hypot(p.x,p.z)<2.2){options.onMission?.();return}walk(p.x,p.z)}else options.onNotice?.('建物か、中央の広場・手前の小道を押してください')}});
  const observer=new ResizeObserver(resize);observer.observe(el);const intersection=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting});intersection.observe(el);controls.addEventListener('change',render);
  build();resize();frame=requestAnimationFrame(animate);
  return{room:build,reset(){if(current==='lobby'){setOverview();controls.target.set(0,.6,-.3)}else{camera.position.set(12,10,14);controls.target.set(0,1,0)}controls.update();render()},tour(){if(current!=='lobby')build();walk(-3.6,3.8)},motion(value){animating=value;render()},avatar(index){memberIndex=index;build(current)},dispose(){disposed=true;cancelAnimationFrame(frame);observer.disconnect();intersection.disconnect();controls.dispose();clear();materials.forEach(m=>m.dispose());avatarMap.dispose();renderer.dispose()}};
}
