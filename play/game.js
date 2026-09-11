'use strict';
const {Game,STAGES,SHIP,TYPES,METER,SPECIALS,clamp}=PirateGame;
const ZOOM=1.35, VIEW_W=960/ZOOM, VIEW_H=540/ZOOM;
const canvas=document.getElementById('game'),ctx=canvas.getContext('2d'),$=id=>document.getElementById(id);
const SAVE_KEY='straw-hat-first-voyage-v1',images={},keys=new Set();
let game,started=false,paused=false,loaded=false,last=0,accumulator=0,saved=null,saveAvailable=true;
let camera={x:0,y:170},pointer={x:650,y:290},pressed={},shake=0,sound=false,audioContext=null;
try{saved=PirateGame.validSave(JSON.parse(localStorage.getItem(SAVE_KEY)));}catch{saveAvailable=false;}
game=new Game(saved);game.events=[];
function load(key,path){return new Promise(resolve=>{const im=new Image();im.onload=()=>{images[key]=im;resolve();};im.onerror=()=>resolve(key);im.src='../assets/chapter-01/'+path;});}
const required=new Set(['luffy','pirate-cutlass','pirate-brute','pirate-bomber','buggy-melee','buggy-specials','sunny-ship-layer','sunset-sky','distant-islands','orange-town-buildings','circus-tent-layer','ocean-wave-cycle','sunny-flag-cycle','checkpoint-snail']);
const assets=Object.entries(PACK.files).filter(([k])=>required.has(k)||k.startsWith('buggy-')&&k.includes('-part-'));
for(const name of ['player-frame','player-fill','boss-frame','boss-fill'])assets.push([name,'ui/'+name+'.svg']);
Promise.all(assets.map(([key,path])=>load(key,path))).then(results=>{
 const failures=results.filter(Boolean);if(failures.length){$('loading').textContent='Could not load '+failures.join(', ')+'. Reload to retry.';return;}
 loaded=true;$('loading').textContent='Crew ready. Click to begin.';$('start').disabled=false;
 if(saved){$('resume').hidden=false;$('start').textContent='New voyage';}
});
function begin(fresh){game=new Game(fresh?null:saved);game.events=[];started=true;paused=false;keys.clear();pressed={};$('menu').hidden=true;$('pause-button').disabled=false;camera=targetCamera();canvas.focus();if(fresh){try{localStorage.setItem(SAVE_KEY,JSON.stringify(game.save()));}catch{saveAvailable=false;}}}
$('start').onclick=()=>begin(true);$('resume').onclick=()=>begin(false);
function pause(value){if(!started)return;paused=value;keys.clear();pressed={};$('pause-menu').hidden=!paused;$('pause-button').textContent=paused?'Resume · Esc':'Pause · Esc';if(!paused)canvas.focus();}
$('pause-button').onclick=()=>pause(!paused);$('unpause').onclick=()=>pause(false);
$('respawn').onclick=()=>{game.respawn();camera=targetCamera();pause(false);};
for(const kind of ['bazooka','gatling'])$(kind).onclick=()=>{if(started&&!paused)pressed[kind]=true;canvas.focus();};
$('sound').onclick=()=>{sound=!sound;$('sound').textContent=sound?'Sound on':'Sound off';$('sound').setAttribute('aria-pressed',sound);if(sound){audioContext ||= new (window.AudioContext||window.webkitAudioContext)();audioContext.resume();}};
function tone(freq,duration=.08,type='triangle',volume=.03){if(!sound||!audioContext)return;const o=audioContext.createOscillator(),g=audioContext.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(volume,audioContext.currentTime);g.gain.exponentialRampToValueAtTime(.0001,audioContext.currentTime+duration);o.connect(g);g.connect(audioContext.destination);o.start();o.stop(audioContext.currentTime+duration);}
window.addEventListener('keydown',e=>{
 if(e.code==='Escape'){e.preventDefault();if(!e.repeat)pause(!paused);return;}
 if(!started||paused||document.activeElement!==canvas)return;
 if(['KeyW','KeyA','KeyS','KeyD','Space','KeyE','KeyQ','KeyR'].includes(e.code))e.preventDefault();
 if(!keys.has(e.code)){if(e.code==='KeyW')pressed.jump=true;if(e.code==='KeyS')pressed.drop=true;if(e.code==='Space')pressed.dash=true;if(e.code==='KeyE')pressed.interact=true;if(e.code==='KeyQ')pressed.bazooka=true;if(e.code==='KeyR')pressed.gatling=true;}
 keys.add(e.code);
});
window.addEventListener('keyup',e=>keys.delete(e.code));
window.addEventListener('blur',()=>{if(started)pause(true);});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&started)pause(true);});
canvas.addEventListener('pointermove',e=>{const r=canvas.getBoundingClientRect();pointer={x:(e.clientX-r.left)*960/r.width,y:(e.clientY-r.top)*540/r.height};});
canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;canvas.focus();const r=canvas.getBoundingClientRect();pointer={x:(e.clientX-r.left)*960/r.width,y:(e.clientY-r.top)*540/r.height};if(started&&!paused)pressed.attack=true;});
canvas.addEventListener('contextmenu',e=>e.preventDefault());
function targetCamera(){const p=game.player;return {x:clamp(p.x-VIEW_W*.44+(Math.abs(p.vx)>30?Math.sign(p.vx)*32:0),0,Math.max(0,game.world.width-VIEW_W)),y:clamp(p.y-300,-100,game.world.floor-300)};}
function processEvents(){for(const e of game.events){
 if(e.type==='save'){try{localStorage.setItem(SAVE_KEY,JSON.stringify(e.data));saved=e.data;}catch{saveAvailable=false;}}
 if(e.type==='stage'){camera=targetCamera();pressed={};}
 if(e.type==='hurt'){shake=.18;tone(90,.14,'sawtooth');}
 if(e.type==='hit')tone(190,.06,'square',.018);
 if(e.type==='punch')tone(330,.055);
 if(e.type==='dash')tone(550,.07,'sawtooth',.014);
 if(e.type==='rest'){tone(620,.25);setTimeout(()=>tone(830,.3),100);}
 if(e.type==='meter-bar')tone(440+e.bars*160,.15);
 if(e.type==='special-start')tone(e.kind==='bazooka'?170:240,.22,'sawtooth',.018);
 if(e.type==='special-pulse'){if(e.kind==='bazooka'){shake=.22;tone(70,.22,'sawtooth',.04);}else tone(210+e.index%3*45,.05,'square',.014);}
 if(e.type==='coin')tone(920,.08);
 if(e.type==='victory'){tone(550,.5);setTimeout(()=>tone(830,.6),160);}
 }game.events=[];}
function image(key,x,y,w,h,alpha=1){const im=images[key];if(!im)return;ctx.save();ctx.globalAlpha=alpha;ctx.drawImage(im,Math.round(x),Math.round(y),w,h);ctx.restore();}
function frame(key,i,x,y,scale,flip=false,parts=false,alpha=1){const spec=PACK.sprites[key]||PACK.props[key];if(!spec||!images[key])return;
 const rect=PACK.frames[key][i];if(!rect)return;ctx.save();ctx.globalAlpha=alpha;ctx.translate(Math.round(x),Math.round(y));if(flip)ctx.scale(-1,1);
 ctx.drawImage(images[key],...rect,-spec.pivot[0]*scale,-spec.pivot[1]*scale,spec.cell_size[0]*scale,spec.cell_size[1]*scale);
 if(parts&&spec.frames[i]?.parts)for(const part of spec.frames[i].parts){if(part.pixel_area<1000||!images[part.id])continue;ctx.drawImage(images[part.id],part.offset[0]*scale,part.offset[1]*scale,part.size[0]*scale,part.size[1]*scale);}
 ctx.restore();}
function text(label,x,y,size=12,color='#f7e8c4',align='left'){ctx.fillStyle=color;ctx.font=`${size>=16?'bold ':''}${size}px monospace`;ctx.textAlign=align;ctx.fillText(label,Math.round(x),Math.round(y));ctx.textAlign='left';}
function plate(label,x,y,color='#f2cf83'){const width=label.length*6.7+18;ctx.fillStyle='#101b2ce8';ctx.fillRect(Math.round(x-width/2),Math.round(y-15),width,23);text(label,x,y,11,color,'center');}
function sea(y,rear=false){const i=Math.floor(game.time*4+(rear?0:2))%4;
 const drift=Math.sin(game.time*.23)*10-camera.x*.06,height=rear?40:86,top=y-26/64*height;
 const im=images['ocean-wave-cycle'];if(im)ctx.drawImage(im,...PACK.frames['ocean-wave-cycle'][i],Math.round(-100+drift),Math.round(top),1200,height);
 ctx.fillStyle='#082740';ctx.fillRect(0,Math.floor(top+height)-1,960,540);
}
function backgrounds(){const sunny=game.stage==='sunny';ctx.fillStyle='#182844';ctx.fillRect(0,0,960,540);image('sunset-sky',-30-camera.x*.025,-48,1040,590);
 if(sunny){image('distant-islands',-110-camera.x*.1,85,1240,270,.65);sea(400,true);}
 else{
  // Overlapping finite background plates cover the route without exposing image edges.
  const shift=-camera.x*.42;
  for(let i=Math.floor(camera.x*.42/1060)-1;i<=Math.floor(camera.x*.42/1060)+2;i++)image('orange-town-buildings',i*1060+shift-70,(game.stage==='streets'?60:96)-camera.y,1240,game.stage==='streets'?374:340,game.stage==='circus'?.36:1);
  if(game.stage==='circus')image('circus-tent-layer',-40-camera.x*.3,5-camera.y,1160,433);
 }
}
function floors(){const dock=game.stage==='dock';
 for(const f of game.platforms()){const x=f.x-camera.x,w=f.end-f.x,y=f.y-camera.y;
  if(x+w<0||x>VIEW_W)continue;
  if(f.motion){ctx.strokeStyle='#c39b62';ctx.lineWidth=2;for(const offset of [12,w-12]){ctx.beginPath();ctx.moveTo(x+offset,y);ctx.lineTo(x+offset,y-180);ctx.stroke();}}
  if(f.y===game.world.floor){ctx.fillStyle=dock?'#4b3430':'#292b39';ctx.fillRect(x,y,w,540-y);ctx.fillStyle=dock?'#bd8754':'#9c8572';ctx.fillRect(x,y,w,8);
   ctx.fillStyle=dock?'#74503a':'#3c3d4b';for(let yy=y+13;yy<540;yy+=24){ctx.fillRect(x,yy,w,2);for(let xx=x+(yy%48?20:0);xx<x+w;xx+=48)ctx.fillRect(xx,yy,2,23);}
  }else{ctx.fillStyle='#332b32';ctx.fillRect(x,y,w,15);ctx.fillStyle='#c69161';ctx.fillRect(x,y,w,5);for(let xx=x+8;xx<x+w;xx+=24){ctx.fillStyle='#876148';ctx.fillRect(xx,y+5,2,10);}ctx.fillStyle='#211e2b';ctx.fillRect(x+8,y+15,8,14);ctx.fillRect(x+w-16,y+15,8,14);}
 }
}
function drawHazards(){
 for(const h of game.world.hazards||[]){const x=h.x-camera.x,y=h.y-camera.y;ctx.fillStyle='#242738';ctx.fillRect(x,y-4,h.end-h.x,6);
  for(let sx=x;sx<x+h.end-h.x;sx+=12){ctx.fillStyle='#bdc5c8';ctx.beginPath();ctx.moveTo(sx,y);ctx.lineTo(sx+6,y-16);ctx.lineTo(sx+12,y);ctx.fill();ctx.fillStyle='#687586';ctx.beginPath();ctx.moveTo(sx+6,y-16);ctx.lineTo(sx+6,y);ctx.lineTo(sx+12,y);ctx.fill();}
 }
}
function ship(){const bob=Math.sin(game.time*Math.PI*2/4.5)*1.5;
 image('sunny-ship-layer',-camera.x,bob-camera.y,1672*.9,941*.9);
 const f=SHIP.flag,x=f.x-camera.x,y=f.y-camera.y+bob;ctx.fillStyle='#392e2b';ctx.fillRect(Math.round(x-2),Math.round(y-7),4,f.poleBottom-f.y+7);ctx.fillStyle='#d5aa62';ctx.fillRect(Math.round(x-1),Math.round(y-7),1,f.poleBottom-f.y+7);frame('sunny-flag-cycle',Math.floor(game.time*6)%4,x,y,.135);
 return bob;
}
function drawCheckpoints(bob){for(const cp of game.world.checkpoints){frame('checkpoint-snail',2+Math.floor(game.time*1.5)%2,cp.x-camera.x,cp.y-camera.y+bob,.085);const active=cp.id===game.checkpoint.id;ctx.fillStyle=active?'#f8d68d':'#8ec9c9';ctx.beginPath();ctx.arc(cp.x-camera.x,cp.y-camera.y+bob-53,2.5,0,Math.PI*2);ctx.fill();}}
function drawExits(bob){for(const e of game.world.exits){if(game.stage==='circus'&&!game.buggyDefeated)continue;
 const x=e.x-camera.x,y=e.y-camera.y+bob;ctx.fillStyle='#3c3031';ctx.fillRect(x-3,y-53,6,53);ctx.fillStyle='#d2a463';ctx.fillRect(x-20,y-55,42,23);text(e.to==='sunny'?'HOME':'→',x,y-39,13,'#2a2730','center');
 }
}
function drawPlayer(bob){const p=game.player;if(p.special){SpecialArt.draw(ctx,images.luffy,p.special,p.x-camera.x,p.y-camera.y+bob,game.stage==='sunny'?.125:.14);return;}let index=0;
 if(p.dash>0)index=3;else if(p.attack)index=4;else if(!p.grounded&&!p.stairs)index=2;else if(Math.abs(p.vx)>20||p.stairs)index=Math.floor(game.time*8)%2?1:0;
 const x=p.x-camera.x,y=p.y-camera.y+bob;const alpha=p.invuln>0&&Math.floor(game.time*16)%2?.48:1;
 // Keep body registration fixed. Reposition the airborne source pose around the body baseline.
 const frameY=y+(index===2?10:0);const scale=game.stage==='sunny'?.125:.14;
 if(p.dash>0){for(let n=3;n>0;n--)frame('luffy',3,x-p.facing*n*16,frameY,scale,p.facing<0,false,.12);}
 if(p.attack){
  const a=p.attack,extension=Math.sin(Math.min(1,a.t/.25)*Math.PI)*110;const ox=x+p.facing*4,oy=y-27;
  // The rubber extension is procedural, so aim follows every mouse angle.
  ctx.lineCap='round';ctx.strokeStyle='#34262a';ctx.lineWidth=10;ctx.beginPath();ctx.moveTo(ox,oy);ctx.lineTo(ox+a.dx*extension,oy+a.dy*extension);ctx.stroke();ctx.strokeStyle='#efb37b';ctx.lineWidth=6;ctx.stroke();
  ctx.fillStyle='#fac692';ctx.beginPath();ctx.arc(ox+a.dx*extension,oy+a.dy*extension,7,0,Math.PI*2);ctx.fill();
  // Idle torso avoids drawing a second, permanently horizontal arm.
  frame('luffy',0,x,y,scale,a.dx<0,false,alpha);
 }else frame('luffy',index,x,frameY,scale,p.facing<0,false,alpha);
}
function enemyFrame(e){if(e.hit>0)return 7;if(e.state==='wind')return 4;if(e.state==='active')return 5;if(e.state==='recover')return 6;return (Math.abs(e.vx)>25?2:0)+Math.floor(game.time*5)%2;}
function drawEnemy(e){if(e.hp<=0)return;const key='pirate-'+e.type.replace('cutlass','cutlass').replace('brute','brute').replace('bomber','bomber');
 const x=e.x-camera.x,y=e.y-camera.y;if(x<-100||x>1060)return;
 frame(key,enemyFrame(e),x,y,e.type==='brute'?.19:.16,e.facing>0); // source pirate art faces left
 if(e.state==='wind'){text('!',x,y-80,18,'#ff9775','center');ctx.strokeStyle='#ff806077';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,y-2);ctx.lineTo(x+e.facing*(e.type==='brute'?100:75),y-2);ctx.stroke();}
 if(e.hp<TYPES_HP[e.type]){ctx.fillStyle='#182137';ctx.fillRect(x-20,y-72,40,4);ctx.fillStyle='#e8a165';ctx.fillRect(x-20,y-72,40*e.hp/TYPES_HP[e.type],4);}
}
const TYPES_HP=Object.fromEntries(Object.entries(TYPES).map(([key,value])=>[key,value.hp]));
function drawBoss(){const b=game.boss;if(!b)return;let key='buggy-melee',i=Math.floor(game.time*3)%2;
 if(b.state==='defeated'){key='buggy-specials';i=7;}
 else if(b.state==='split'){key='buggy-specials';i=4+Math.floor(game.time*6)%2;}
 else if(b.state==='wind'||b.state==='active'||b.state==='recover'){
  const offset=b.state==='wind'?0:b.state==='active'?1:2;
  if(['knives','bombs','crossfire'].includes(b.attack)){key='buggy-specials';i=(b.attack==='bombs'?2:0)+Math.min(offset,1);}
  else i=(b.attack==='lunge'||b.attack==='dive'?2:5)+offset;
 }
 frame(key,i,b.x-camera.x,b.y-camera.y,.21,b.facing>0,b.state==='split');
 if(b.state==='wind'){
  text('!',b.x-camera.x,b.y-camera.y-112,22,'#ff9978','center');
  if(b.attack==='lunge'){ctx.fillStyle='#f2655355';const x=b.x-camera.x;ctx.fillRect(b.facing<0?x-250:x,b.y-camera.y-12,250,12);}
 }
 if(b.attack==='dive'&&['wind','active'].includes(b.state)){
  ctx.strokeStyle='#ff956e';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(b.aim.x-camera.x,430-camera.y,77,9,0,0,Math.PI*2);ctx.stroke();
 }
 if(game.bossStarted){ctx.fillStyle='#d8954777';ctx.fillRect(24-camera.x,245-camera.y,12,185);ctx.fillRect(1124-camera.x,245-camera.y,12,185);}

}
function drawProjectiles(){for(const q of game.projectiles){const x=q.x-camera.x,y=q.y-camera.y;
 ctx.save();ctx.translate(x,y);
 if(q.kind==='knife'){ctx.rotate(Math.atan2(q.vy,q.vx));ctx.fillStyle='#e6e6d8';ctx.beginPath();ctx.moveTo(17,0);ctx.lineTo(-8,-4);ctx.lineTo(-8,4);ctx.fill();ctx.fillStyle='#73574f';ctx.fillRect(-17,-3,9,6);}
 else if(q.kind==='hand'){ctx.fillStyle='#35263b';ctx.fillRect(-17,-10,30,20);ctx.fillStyle='#f0dcc5';ctx.fillRect(-15,-8,26,16);ctx.fillStyle='#8f7a79';for(let i=-11;i<10;i+=6)ctx.fillRect(i,-7,2,10);}
 else if(q.kind==='bomb'){ctx.fillStyle='#202734';ctx.beginPath();ctx.arc(0,0,10,0,Math.PI*2);ctx.fill();ctx.fillStyle='#d9c49d';ctx.fillRect(-2,-15,4,7);ctx.fillStyle=Math.floor(game.time*12)%2?'#ffd071':'#ff794e';ctx.fillRect(-3,-19,6,6);}
 else{ctx.fillStyle='#ffb34c77';ctx.beginPath();ctx.arc(0,0,q.radius,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#ffdd86';ctx.lineWidth=3;ctx.stroke();}
 ctx.restore();}}
function drawHud(){image('player-frame',16,15,260,46);image('player-fill',65,30,194*game.hp/game.maxHp,15);ctx.fillStyle='#162133';for(let i=1;i<5;i++)ctx.fillRect(65+Math.round(194*i/5),30,2,15);ctx.fillRect(64,16,125,12);text('LUFFY  '+game.hp+'/'+game.maxHp,69,26,10);text('฿ '+game.berries+'   '+(game.damage>1?'PISTOL +':'GUM-GUM PISTOL'),20,118,11,'#efcf87');

 SpecialArt.meter(ctx,game.meter,game.time);text('Q  BAZOOKA · 2',20,98,9,game.meter>=200?'#ffe0a0':'#7f91a7');text('R  GATLING · 3',152,98,9,game.meter>=300?'#ffb780':'#7f91a7');
 const p=game.player;ctx.fillStyle='#1a2938';ctx.fillRect(20,130,100,4);ctx.fillStyle=p.dashCd>0?'#758ba4':'#8edbc8';ctx.fillRect(20,130,100*(1-p.dashCd/.65),4);text('DASH',126,135,9,'#b9cdd7');
 if(game.boss&&game.bossStarted){image('boss-frame',200,488,560,39);image('boss-fill',229,503,502*game.boss.hp/game.boss.maxHp,10);text('BUGGY THE CLOWN  ·  PHASE '+game.boss.phase,480,481,13,'#ffe3a4','center');}
 const c=game.context();if(c){
  const label=c.kind==='checkpoint'?'Press E to rest':c.kind==='satchel'?'E · Recover':'E · Travel';
  plate(label,clamp((c.x-camera.x)*ZOOM,90,870),(c.y-camera.y-68)*ZOOM);
 }

 if(game.dead){ctx.fillStyle='#101626b8';ctx.fillRect(0,0,960,540);text('THE VOYAGE CONTINUES',480,255,27,'#f0c88c','center');text('Returning to your signal station…',480,290,13,'#d0d7dd','center');}
 if(game.victoryTime>0){text('BUGGY DEFEATED',480,190,34,'#ffdf91','center');text('Gum-Gum Pistol +  ·  +50 berries',480,220,14,'#fff0cc','center');}

}
function render(){ctx.imageSmoothingEnabled=false;ctx.save();ctx.scale(ZOOM,ZOOM);backgrounds();if(!loaded){ctx.restore();return;}if(shake>0)ctx.translate(Math.round(Math.sin(game.time*100)*3),Math.round(Math.cos(game.time*83)*2));
 let bob=0;if(game.stage==='sunny')bob=ship();else {floors();drawHazards();}
 drawCheckpoints(bob);drawExits(bob);
 if(game.satchel?.stage===game.stage){const s=game.satchel;ctx.fillStyle='#eac466';ctx.fillRect(s.x-camera.x-7,s.y-camera.y-13,14,13);}
 for(const e of game.enemies)drawEnemy(e);drawBoss();drawPlayer(bob);drawProjectiles();
 for(const e of game.effects){const x=e.x-camera.x,y=e.y-camera.y;ctx.strokeStyle='#fff2bc';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x-12,y-12);ctx.lineTo(x+12,y+12);ctx.moveTo(x+12,y-12);ctx.lineTo(x-12,y+12);ctx.stroke();}
 if(game.stage==='sunny')sea(SHIP.waterline-camera.y);ctx.restore();drawHud();
 if(started&&!paused){ctx.strokeStyle='#f6dfaa';ctx.lineWidth=1;ctx.beginPath();ctx.arc(pointer.x,pointer.y,6,0,Math.PI*2);ctx.moveTo(pointer.x-10,pointer.y);ctx.lineTo(pointer.x+10,pointer.y);ctx.moveTo(pointer.x,pointer.y-10);ctx.lineTo(pointer.x,pointer.y+10);ctx.stroke();}
}
let statusTime=0;
function tick(now){const dt=Math.min(.1,(now-(last||now))/1000);last=now;
 if(started&&!paused&&loaded){accumulator+=dt;while(accumulator>=1/120){
  game.step(1/120,{...pressed,left:keys.has('KeyA'),right:keys.has('KeyD'),up:keys.has('KeyW'),down:keys.has('KeyS'),aim:{x:pointer.x/ZOOM+camera.x,y:pointer.y/ZOOM+camera.y}});pressed={};processEvents();accumulator-=1/120;
 }const target=targetCamera();camera.x+=(target.x-camera.x)*Math.min(1,dt*6);camera.y+=(target.y-camera.y)*Math.min(1,dt*5);shake=Math.max(0,shake-dt);
 }else accumulator=0;
 render();statusTime+=dt;if(statusTime>.2){statusTime=0;$('status').textContent=started?game.world.name+' · Health '+game.hp+'/'+game.maxHp+' · '+game.berries+' berries'+(paused?' · Paused':''):'Ready at the Sunny';const zone=[...(game.world.zones||[])].reverse().find(z=>game.player.x>=z.x);const nearby=game.context();$('game-info').textContent=!saveAvailable?'Browser saving is unavailable. Keep this tab open.':game.messageTime>0?game.message:nearby?.kind==='exit'?nearby.label:zone?zone.name:'Explore the Sunny, then travel from the lower deck.';for(const kind of ['bazooka','gatling'])$(kind).disabled=!started||paused||game.dead>0||!!game.player.special||!game.player.grounded||game.player.stairs||game.player.attackCd>0||game.player.dash>0||game.meter<SPECIALS[kind].cost;$('charge').textContent=Math.floor(game.meter/100)+' / 3 bars · '+game.meter+' / 300';$('charge').setAttribute('aria-valuenow',game.meter);canvas.dataset.meter=String(game.meter);canvas.dataset.special=game.player.special?.kind||'';canvas.dataset.stage=game.stage;canvas.dataset.playerX=game.player.x.toFixed(1);canvas.dataset.playerY=game.player.y.toFixed(1);canvas.dataset.grounded=String(game.player.grounded);canvas.dataset.paused=String(paused);}
 requestAnimationFrame(tick);}
requestAnimationFrame(tick);
