'use strict';
const {Game,STAGES,SHIP,TYPES,METER,SPECIALS,clamp}=PirateGame;
const ZOOM=1.35, VIEW_W=960/ZOOM, VIEW_H=540/ZOOM;
const canvas=document.getElementById('game'),ctx=canvas.getContext('2d'),$=id=>document.getElementById(id);
const shell=document.querySelector('.game-shell');
const SAVE_KEY='straw-hat-first-voyage-v1',images={},keys=new Set();
let game,started=false,paused=false,loaded=false,last=0,accumulator=0,saved=null,saveAvailable=true;
let camera={x:0,y:170},pointer={x:650,y:290},pressed={},shake=0,sound=false,audioContext=null;
try{saved=PirateGame.validSave(JSON.parse(localStorage.getItem(SAVE_KEY)));}catch{saveAvailable=false;}
game=new Game(saved);game.events=[];
// Bump when regenerated art must defeat a cached copy; script ?v= tags do not cover asset files.
const ASSET_V='arena4';
function load(key,path){return new Promise(resolve=>{const im=new Image();im.onload=()=>{images[key]=im;resolve();};im.onerror=()=>resolve(key);im.src='../assets/chapter-01/'+path+'?v='+ASSET_V;});}
const required=new Set(['luffy','pirate-cutlass','pirate-brute','pirate-bomber','buggy-melee','buggy-specials','sunny-ship-layer','sunset-sky','distant-islands','orange-town-buildings','circus-tent-layer','ocean-wave-cycle','sunny-flag-cycle','checkpoint-snail']);
const assets=Object.entries(PACK.files).filter(([k])=>required.has(k)||k.startsWith('buggy-')&&k.includes('-part-'));
for(const [key,path] of [['syrup-sky','syrup-dusk-sky.png'],['syrup-village','cleaned/syrup-village-midground.png'],['syrup-props','cleaned/syrup-woodland-foreground.png'],['cats','cleaned/black-cat-pirate-poses.png'],['kuro','cleaned/kuro-attack-poses.png']])assets.push([key,'../chapter-02/'+path]);
assets.push(['meat','ui/meat.svg']);
assets.push(['luffy-motion','motion/luffy-motion.png'],['luffy-stride','motion/luffy-stride.png']);
assets.push(['terrain','terrain/pirate-terrain-atlas.png'],['sunny-rails','layers/sunny-rails-foreground.png']);
for(const name of ['hud-console','hud-health-fill','hud-health-grid-5','hud-health-grid-6','hud-health-grid-7','hud-meter-fill','hud-meter-fill-hot','hud-dash-fill','hud-glyphs','hud-lock','hud-coin','hud-boss-frame','hud-boss-fill','hud-boss-trail','hud-boss-grid','hud-level-badge'])assets.push([name,'ui/'+name+'.svg']);
assets.push(['sign-post','props/sign-post.svg'],['sign-arrow','props/sign-arrow.svg'],['circus-base','layers/circus-base.svg']);
Promise.all(assets.map(([key,path])=>load(key,path))).then(results=>{
 const failures=results.filter(Boolean);if(failures.length){$('loading').textContent='Could not load '+failures.join(', ')+'. Reload to retry.';return;}
 loaded=true;$('loading').textContent='Crew ready. Click to begin.';$('start').disabled=false;
 if(saved){$('resume').hidden=false;$('start').textContent='New voyage';}
});
function begin(fresh){game=new Game(fresh?null:saved);game.events=[];started=true;paused=false;keys.clear();pressed={};$('menu').hidden=true;$('pause-button').disabled=false;camera=targetCamera();canvas.focus();if(fresh){try{localStorage.setItem(SAVE_KEY,JSON.stringify(game.save()));}catch{saveAvailable=false;}}}
$('start').onclick=()=>begin(true);$('resume').onclick=()=>begin(false);
function pause(value){if(!started)return;if(game.resting){if(!value)leaveRest();return;}paused=value;keys.clear();pressed={};$('pause-menu').hidden=!paused;$('pause-button').textContent=paused?'Resume · Esc':'Pause · Esc';if(!paused)canvas.focus();if(paused&&locked)document.exitPointerLock();else requestLock();syncFullscreen();}
function showRest(){paused=true;keys.clear();pressed={};accumulator=0;$('pause-menu').hidden=true;$('rest-menu').hidden=false;$('pause-button').textContent='Resume · Esc';if(locked)document.exitPointerLock();syncFullscreen();
 const list=$('travel-list');list.replaceChildren();for(const v of game.visited){const cp=STAGES[v.stage].checkpoints.find(c=>c.id===v.id);if(!cp)continue;const btn=document.createElement('button');btn.textContent=cp.name;btn.disabled=v.stage===game.checkpoint.stage&&v.id===game.checkpoint.id;btn.onclick=()=>{if(game.travel(v.stage,v.id)){processEvents();camera=targetCamera();showRest();}};list.append(btn);} $('leave-rest').focus();}
function leaveRest(){game.closeRest();$('rest-menu').hidden=true;paused=false;accumulator=0;keys.clear();pressed={};$('pause-button').textContent='Pause · Esc';canvas.focus();syncFullscreen();}
$('leave-rest').onclick=leaveRest;
$('pause-button').onclick=()=>pause(!paused);$('unpause').onclick=()=>pause(false);
$('respawn').onclick=()=>{game.respawn();camera=targetCamera();pause(false);};
for(const kind of ['bazooka','gatling'])$(kind).onclick=()=>{if(started&&!paused)pressed[kind]=true;canvas.focus();};
let lockAim=false,locked=false;
function fullscreen(){return document.fullscreenElement===shell;}
// Pointer lock keeps the mouse inside the game entirely: movement deltas drive the crosshair,
// which stays clamped to the canvas, so the system cursor can never reach another window.
function requestLock(){if(!lockAim||locked||!started||paused||!canvas.requestPointerLock)return;
 const r=canvas.requestPointerLock();if(r&&r.catch)r.catch(()=>{});}
function syncLock(){const l=$('lock'),m=$('lock-menu');const text=locked?'Cursor locked':lockAim?'Lock cursor · click game':'Lock cursor';
 for(const b of [l,m]){b.textContent=text;b.setAttribute('aria-pressed',String(lockAim));}}
if(canvas.requestPointerLock){for(const id of ['lock','lock-menu'])$(id).onclick=()=>{
  lockAim=!lockAim;if(lockAim)requestLock();else if(locked)document.exitPointerLock();syncLock();canvas.focus();};
 document.addEventListener('pointerlockchange',()=>{locked=document.pointerLockElement===canvas;syncLock();syncFullscreen();});
 document.addEventListener('pointerlockerror',()=>{lockAim=false;syncLock();game.say('This browser blocked pointer lock.',4);});
}else for(const id of ['lock','lock-menu'])$(id).hidden=true;
function toggleFullscreen(){if(fullscreen()){document.exitFullscreen();return;}
 // Embedded views and some iframes refuse the request; say so rather than appearing to do nothing.
 shell.requestFullscreen().catch(()=>game.say('This browser blocked fullscreen. F11 fills the window instead.',5));}
function syncFullscreen(){const on=fullscreen();
 for(const id of ['fullscreen','fullscreen-menu']){$(id).textContent=on?'Exit fullscreen':'Fullscreen';$(id).setAttribute('aria-pressed',String(on));}
 // The drawn crosshair stands in for the pointer while playing; menus need a visible cursor back.
 shell.classList.toggle('aiming',(on||locked)&&started&&!paused);
}
if(shell.requestFullscreen){for(const id of ['fullscreen','fullscreen-menu'])$(id).onclick=toggleFullscreen;
 document.addEventListener('fullscreenchange',()=>{if(fullscreen())canvas.focus();else if(started)pause(true);syncFullscreen();});
}else for(const id of ['fullscreen','fullscreen-menu'])$(id).hidden=true;
$('sound').onclick=()=>{sound=!sound;$('sound').textContent=sound?'Sound on':'Sound off';$('sound').setAttribute('aria-pressed',sound);if(sound){audioContext ||= new (window.AudioContext||window.webkitAudioContext)();audioContext.resume();}};
function tone(freq,duration=.08,type='triangle',volume=.03){if(!sound||!audioContext)return;const o=audioContext.createOscillator(),g=audioContext.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(volume,audioContext.currentTime);g.gain.exponentialRampToValueAtTime(.0001,audioContext.currentTime+duration);o.connect(g);g.connect(audioContext.destination);o.start();o.stop(audioContext.currentTime+duration);}
window.addEventListener('keydown',e=>{
 if(e.code==='Escape'){if(fullscreen())return;e.preventDefault();if(!e.repeat)pause(!paused);return;}
 if(!started||paused||document.activeElement!==canvas)return;
 if(['KeyW','KeyA','KeyS','KeyD','Space','KeyE','KeyQ','KeyR'].includes(e.code))e.preventDefault();
 if(!keys.has(e.code)){if(e.code==='KeyW')pressed.jump=true;if(e.code==='KeyS')pressed.drop=true;if(e.code==='Space')pressed.dash=true;if(e.code==='KeyE')pressed.interact=true;if(e.code==='KeyQ')pressed.bazooka=true;if(e.code==='KeyR')pressed.gatling=true;if(e.code==='KeyF')pressed.heal=true;}
 keys.add(e.code);
});
window.addEventListener('keyup',e=>keys.delete(e.code));
window.addEventListener('blur',()=>{if(started)pause(true);});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&started)pause(true);});
// Aim is tracked across the whole shell and clamped to the canvas, so the letterbox beside a
// fullscreen 16:9 frame still aims at the nearest edge instead of stranding the crosshair.
function aimAt(e){const r=canvas.getBoundingClientRect();
 // Locked aiming uses the same pixels-per-canvas-unit scale as free aiming, so the feel is unchanged.
 if(locked){pointer={x:clamp(pointer.x+e.movementX*960/r.width,0,960),y:clamp(pointer.y+e.movementY*540/r.height,0,540)};return;}
 pointer={x:clamp((e.clientX-r.left)*960/r.width,0,960),y:clamp((e.clientY-r.top)*540/r.height,0,540)};}
shell.addEventListener('pointermove',aimAt);
shell.addEventListener('pointerdown',e=>{if(e.button!==0||e.target.closest('.overlay'))return;canvas.focus();aimAt(e);if(started&&!paused)pressed.attack=true;requestLock();});
canvas.addEventListener('contextmenu',e=>e.preventDefault());
function targetCamera(){const p=game.player;return {x:clamp(p.x-VIEW_W*.44+(Math.abs(p.vx)>30?Math.sign(p.vx)*32:0),0,Math.max(0,game.world.width-VIEW_W)),y:clamp(p.y-300,-100,game.world.floor-300)};}
function processEvents(){for(const e of game.events){
 if(e.type==='save'){try{localStorage.setItem(SAVE_KEY,JSON.stringify(e.data));saved=e.data;}catch{saveAvailable=false;}}
 if(e.type==='stage'){camera=targetCamera();pressed={};}
 if(e.type==='heal')tone(720,.2);
 if(e.type==='hurt'){shake=.18;tone(90,.14,'sawtooth');}
 if(e.type==='hit')tone(190,.06,'square',.018);
 if(e.type==='punch')tone(330,.055);
 if(e.type==='dash')tone(550,.07,'sawtooth',.014);
 if(e.type==='rest'){showRest();tone(620,.25);setTimeout(()=>tone(830,.3),100);}
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
// Camera factors follow the CHAPTER_01 layer contract: distant sea 0.22, foreground surf 1.08.
// The water is a finite strip, so it is mirror-tiled; alternate copies flip, and a mirrored join
// is continuous whatever the source edges do.
const SEA_SPAN=1200;
function sea(y,rear=false){const i=Math.floor(game.time*4+(rear?0:2))%4;
 const drift=Math.sin(game.time*(rear?.19:.23))*3-camera.x*(rear?.22:1.08);
 const height=rear?40:86,top=Math.round(y-26/64*height),base=-100+drift;
 const im=images['ocean-wave-cycle'];
 if(im){const cell=PACK.frames['ocean-wave-cycle'][i];
  for(let t=Math.floor(-base/SEA_SPAN);t<=Math.floor((VIEW_W-base)/SEA_SPAN);t++){
   const x=Math.round(base+t*SEA_SPAN);
   if(t&1){ctx.save();ctx.translate(x+SEA_SPAN,top);ctx.scale(-1,1);ctx.drawImage(im,...cell,0,0,SEA_SPAN,height);ctx.restore();}
   else ctx.drawImage(im,...cell,x,top,SEA_SPAN,height);
  }
 }
 ctx.fillStyle='#082740';ctx.fillRect(0,top+height-1,960,540);
}
function backgrounds(){if(game.stage==='syrup'||game.stage==='mansion'){image('syrup-sky',-20-camera.x*.015,-40,1000,580);const ground=game.world.floor-camera.y;terrain(1,0,ground-2,960,900,-camera.x*.35,ground,128);ctx.fillStyle='#172d3388';ctx.fillRect(0,ground,960,900);for(let i=Math.floor(camera.x*.35/900)-1;i<=Math.floor(camera.x*.35/900)+1;i++)image('syrup-village',i*900-camera.x*.35,ground-546,1000,600);return;}const sunny=game.stage==='sunny';ctx.fillStyle='#182844';ctx.fillRect(0,0,960,540);image('sunset-sky',-30-camera.x*.025,-48,1040,590);
 if(sunny){image('distant-islands',-110-camera.x*.1,85,1240,270,.65);sea(400,true);}
 else{
  // Overlapping finite background plates cover the route without exposing image edges.
  const shift=-camera.x*.42;
  terrain(1,0,game.world.floor-camera.y-2,960,900,-camera.x*.42,game.world.floor-camera.y,128);ctx.fillStyle='#18233888';ctx.fillRect(0,game.world.floor-camera.y-2,960,900);
  for(let i=Math.floor(camera.x*.42/1060)-1;i<=Math.floor(camera.x*.42/1060)+2;i++)image('orange-town-buildings',i*1060+shift-70,game.world.floor-(game.stage==='streets'?374:340)*.915-camera.y,1240,game.stage==='streets'?374:340,game.stage==='circus'?.36:1);
  // The tent art ends at world y 413.6 but the floor is at 430; the footing closes that gap.
  if(game.stage==='circus'){image('circus-tent-layer',-40-camera.x*.3,5-camera.y,1160,433);
   image('circus-base',-40-camera.x*.3,402-camera.y,1160,36);}
 }
}
function terrain(tile,x,y,w,h,anchorX=x,anchorY=y,size=128){
 const im=images.terrain;if(!im)return;const half=im.width/2;
 ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();
 const left=Math.max(x,-size),right=Math.min(x+w,VIEW_W+size),bottom=Math.min(y+h,VIEW_H+size);
 for(let yy=anchorY+Math.floor((y-anchorY)/size)*size;yy<bottom;yy+=size)
 for(let xx=anchorX+Math.floor((left-anchorX)/size)*size;xx<right;xx+=size)
 ctx.drawImage(im,(tile%2)*half,Math.floor(tile/2)*half,half,half,Math.round(xx),Math.round(yy),size,size);
 ctx.restore();
}
function floors(){const dock=game.stage==='dock';
 for(const f of game.platforms()){const x=f.x-camera.x,w=f.end-f.x,y=f.y-camera.y;
  if(x+w<0||x>VIEW_W)continue;
  if(f.motion){ctx.strokeStyle='#c39b62';ctx.lineWidth=2;for(const offset of [12,w-12]){ctx.beginPath();ctx.moveTo(x+offset,y);ctx.lineTo(x+offset,-VIEW_H);ctx.stroke();}}
  const ground=f.y===game.world.floor;
  terrain(ground?(dock?0:1):0,x,y,w,ground?540-y:20,x,y,128);
  // A bright, irregular lip preserves an unambiguous landing surface.
  ctx.fillStyle=dock?'#c59a68':'#b1a38c';ctx.fillRect(x,y,w,3);
  for(let xx=x;xx<x+w;xx+=32){ctx.fillStyle='#201e2c';ctx.fillRect(xx,y,2,ground?9:16);ctx.fillStyle='#e3c293';ctx.fillRect(xx+4,y+3,Math.min(18,x+w-xx-4),2);}
  if(ground){terrain(dock?3:2,x,y+5,w,13,x,y+5,96);ctx.fillStyle='#10172755';ctx.fillRect(x,y+28,w,540-y-28);}
  else{ctx.fillStyle='#171c2b';ctx.fillRect(x,y+19,w,3);for(const xx of [x+8,x+w-20]){terrain(3,xx,y+4,12,32,xx,y+4,64);ctx.fillStyle='#aaa69a';ctx.fillRect(xx+4,y+8,3,3);}}
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
// Source rows 448-457 of the ship layer hold the bottom of the upper-deck grass and the deck edge,
// world y 403.2-411.3. Starting lower than the tuft tops keeps Luffy's legs readable.
const DECK_GRASS={top:448*.9,height:9*.9};
function shipRails(bob){image('sunny-rails',-camera.x,bob-camera.y,1672*.9,941*.9);if(game.player.stairs)return;
 // Cover the deck lip beneath the rails, leaving the staircase opening clear.
 // While climbing, the ship stays behind Luffy so the deck cannot cut through his body.
 ctx.save();ctx.beginPath();for(const [left,right] of [[216,891],[954,1359]])ctx.rect(left-camera.x,DECK_GRASS.top+bob-camera.y,right-left,14);ctx.clip();
 image('sunny-ship-layer',-camera.x,bob-camera.y,1672*.9,941*.9);ctx.restore();
}
function drawCheckpoints(bob){for(const cp of game.world.checkpoints){frame('checkpoint-snail',2+Math.floor(game.time*1.5)%2,cp.x-camera.x,cp.y-camera.y+bob,.085);const active=cp.id===game.checkpoint.id;ctx.fillStyle=active?'#f8d68d':'#8ec9c9';ctx.beginPath();ctx.arc(cp.x-camera.x,cp.y-camera.y+bob-53,2.5,0,Math.PI*2);ctx.fill();}}
const SIGN={w:84,h:76,label:7,arrow:17,arrowW:14,arrowH:9,advance:10};
// No label uses W, M or N: three pixels wide is not enough to tell those apart from H at world scale.
const SIGN_LABEL={sunny:'SHIP',dock:'DOCK',streets:'ROOFS',circus:'CIRCUS',syrup:'SYRUP',mansion:'KURO'};
function drawExits(bob){for(const e of game.world.exits){if(e.requiresBuggy&&!game.buggyDefeated)continue;if((game.stage==='circus'||game.stage==='mansion')&&game.boss&&game.boss.state!=='defeated')continue;
 const x=Math.round(e.x-camera.x),y=Math.round(e.y-camera.y+bob),top=y-SIGN.h;
 image('sign-post',x-SIGN.w/2,top,SIGN.w,SIGN.h);
 glyphs(SIGN_LABEL[e.to]||'TRAVEL',x,top+SIGN.label,'center',SIGN.advance);
 // Return exits sit at the low end of every stage, so the board points the way out.
 const dir=e.x<game.world.width/2?-1:1,im=images['sign-arrow'];
 if(im){ctx.save();ctx.translate(x,top+SIGN.arrow);ctx.scale(dir,1);ctx.drawImage(im,-SIGN.arrowW/2,0,SIGN.arrowW,SIGN.arrowH);ctx.restore();}
 }
}
function drawPlayer(bob){const p=game.player;if(p.grounded&&!p.stairs&&!p.dash&&!p.attack&&!p.special&&Math.abs(p.vx)>12){LuffyMotion.drawStride(ctx,images['luffy-stride'],p,p.x-camera.x,p.y-camera.y+bob,p.invuln>0&&Math.floor(game.time*16)%2?.48:1);return;}const pose=LuffyMotion.pose(p);if(pose!==null){const im=images['luffy-motion'],k=.27;ctx.save();ctx.globalAlpha=p.invuln>0&&Math.floor(game.time*16)%2?.48:1;ctx.translate(Math.round(p.x-camera.x),Math.round(p.y-camera.y+bob));ctx.scale(p.facing,1);ctx.drawImage(im,pose%4*384,Math.floor(pose/4)*384,384,384,-192*k,-340*k,384*k,384*k);ctx.restore();return;}if(p.special){SpecialArt.draw(ctx,images.luffy,p.special,p.x-camera.x,p.y-camera.y+bob,.14);return;}let index=0;
 if(p.dash>0)index=3;else if(p.attack)index=4;else if(!p.grounded&&!p.stairs)index=2;else if(Math.abs(p.vx)>20||p.stairs)index=Math.floor(game.time*8)%2?1:0;
 const x=p.x-camera.x,y=p.y-camera.y+bob;const alpha=p.invuln>0&&Math.floor(game.time*16)%2?.48:1;
 // Keep body registration fixed. Reposition the airborne source pose around the body baseline.
 const frameY=y+(index===2?10:0);const scale=.14;
 if(p.dash>0){for(let n=3;n>0;n--)frame('luffy',3,x-p.facing*n*16,frameY,scale,p.facing<0,false,.12);}
 if(p.attack){
  SpecialArt.punch(ctx,images.luffy,p.attack,x,y,scale,alpha);
 }else frame('luffy',index,x,frameY,scale,p.facing<0,false,alpha);
}
// Sprite scales, and the measured art height above the feet pivot in cell pixels. Grown pirates
// stand well clear of Luffy's ~64px; bosses sit above them again.
const ENEMY_SCALE={cutlass:.189,brute:.221,bomber:.189},CAT_SCALE=.281;
const ENEMY_ART={cutlass:363,brute:412,bomber:384},CAT_ART={cutlass:273,brute:268,bomber:288};
// Boss art heights are the tallest frame of each sheet, so a tell never lands inside a raised pose.
const BOSS_SCALE=.231,BOSS_ART={'buggy-melee':390,'buggy-specials':417,kuro:481};
function enemyFrame(e){if(e.hit>0)return 7;if(e.state==='wind')return 4;if(e.state==='active')return 5;if(e.state==='recover')return 6;return (Math.abs(e.vx)>25?2:0)+Math.floor(game.time*5)%2;}
function chapterSprite(key,i,x,y,scale,facing){ctx.save();ctx.translate(Math.round(x),Math.round(y));ctx.scale(facing,1);ctx.drawImage(images[key],i%4*640,Math.floor(i/4)*576,640,576,-320*scale,-536*scale,640*scale,576*scale);ctx.restore();}
function villageProps(){if(game.stage!=='syrup'&&game.stage!=='mansion')return;const im=images['syrup-props'];for(const x of game.stage==='syrup'?[35,1440,2960,3670]:[15,1120]){const px=x-camera.x;if(px<-180||px>VIEW_W+180)continue;ctx.drawImage(im,0,0,512,540,px-100,430-camera.y-205,200,211);}}
// Only the sprite differs by chapter. The tell and the health bar are shared, so Syrup's Black Cats
// read the same way as the Orange Town crew.
function drawEnemy(e){if(e.hp<=0)return;
 const x=e.x-camera.x,y=e.y-camera.y;if(x<-100||x>1060)return;
 const cats=game.stage==='syrup',art=cats?CAT_ART:ENEMY_ART,scale=cats?CAT_SCALE:ENEMY_SCALE[e.type];
 if(cats){const row={cutlass:0,brute:1,bomber:2}[e.type],i=e.state==='wind'?2:e.state==='active'?3:Math.abs(e.vx)>25?1:0;
  chapterSprite('cats',row*4+i,x,y,scale,e.facing);}
 else frame('pirate-'+e.type,enemyFrame(e),x,y,scale,e.facing>0); // source pirate art faces left
 const head=y-art[e.type]*scale;   // measured art top, so the tell and bar clear the head at any scale
 if(e.state==='wind'){text('!',x,head-24,18,cats?'#ffbc72':'#ff9775','center');
  ctx.strokeStyle='#ff806077';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,y-2);ctx.lineTo(x+e.facing*(e.type==='brute'?100:75),y-2);ctx.stroke();}
 // Bars read against spawn health, so a tougher Syrup cutlass still fills the same bar.
 if(e.hp<e.maxHp){ctx.fillStyle='#182137';ctx.fillRect(x-20,head-14,40,4);ctx.fillStyle='#e8a165';ctx.fillRect(x-20,head-14,40*e.hp/e.maxHp,4);}
}
function drawBoss(){const b=game.boss;if(!b)return;if(b.kind==='kuro'){const i=b.state==='defeated'?7:b.hit>0?7:b.state==='recover'?6:b.state==='wind'?(b.attack==='slash'?4:b.attack==='flurry'?1:2):b.state==='active'?(b.attack==='slash'?5:3):0;chapterSprite('kuro',i,b.x-camera.x,b.y-camera.y,BOSS_SCALE,b.facing);
  if(b.state==='wind')text('!',b.x-camera.x,b.y-camera.y-BOSS_ART.kuro*BOSS_SCALE-26,22,'#ffb785','center');return;}let key='buggy-melee',i=Math.floor(game.time*3)%2;
 if(b.state==='defeated'){key='buggy-specials';i=7;}
 else if(b.state==='split'){key='buggy-specials';i=4+Math.floor(game.time*6)%2;}
 else if(b.state==='wind'||b.state==='active'||b.state==='recover'){
  const offset=b.state==='wind'?0:b.state==='active'?1:2;
  if(['knives','bombs','crossfire'].includes(b.attack)){key='buggy-specials';i=(b.attack==='bombs'?2:0)+Math.min(offset,1);}
  else i=(b.attack==='lunge'||b.attack==='dive'?2:5)+offset;
 }
 frame(key,i,b.x-camera.x,b.y-camera.y,BOSS_SCALE,b.facing>0,b.state==='split');
 if(b.state==='wind'){
  text('!',b.x-camera.x,b.y-camera.y-BOSS_ART[key]*BOSS_SCALE-26,22,'#ff9978','center');
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
// Console geometry mirrors assets/chapter-01/ui/hud-layout.json; panel-relative, drawn 1:1.
const HUD={x:16,y:14,w:300,h:100,health:[64,29,225,14],meter:[64,51,73,10],meterPitch:76,
 dash:[64,67,187,4],valueRight:289,nameRow:10,lockGroup:[162,77,104,18],coin:[110,8],berries:[128,10],stamp:[16,120,56,22]};
const BOSS={x:200,y:484,w:560,h:46,bar:[16,24,528,14],phase:[540,8]};
let bossTrail=1;
const GLYPH_ORDER='0123456789/+-x. ABCDEFGHIJKLMNOPQRSTUVWXYZ';
// Runtime numbers use the baked pixel strip so no HUD text falls back to the system font.
// Glyph cells are 6px wide on an 8px atlas pitch. `adv` is the runtime advance: 8 keeps HUD
// numbers tight, while world signs use more so letters stay apart through the 1.35x world zoom.
function glyphs(value,x,y,align='left',adv=8){const s=String(value),im=images['hud-glyphs'];if(!im)return;
 const run=s.length*adv-(adv-6);let cx=Math.round(align==='right'?x-run:align==='center'?x-run/2:x);
 for(const ch of s){const i=GLYPH_ORDER.indexOf(ch);if(i>=0)ctx.drawImage(im,i*8,0,6,10,cx,Math.round(y),6,10);cx+=adv;}
}
function bar(key,px,py,full,fraction,height){const w=Math.round(full*clamp(fraction,0,1));
 if(w>0&&images[key])ctx.drawImage(images[key],0,0,w,height,px,py,w,height);return w;}
function drawHud(){const ox=HUD.x,oy=HUD.y,p=game.player;
 image('hud-console',ox,oy,HUD.w,HUD.h);
 const [hx,hy,hw,hh]=HUD.health;
 bar('hud-health-fill',ox+hx,oy+hy,hw,game.hp/game.maxHp,hh);
 // One health point left: pulse the track's rim so the empty segments still read as empty.
 if(game.hp<=1&&!game.dead){ctx.save();ctx.globalAlpha=.35+.35*Math.sin(game.time*9);ctx.strokeStyle='#ff5f4a';ctx.lineWidth=2;ctx.strokeRect(ox+hx-2,oy+hy-2,hw+4,hh+4);ctx.restore();}
 // The divider overlay follows max health, so a new segment is a real segment and not a re-scaled fifth.
 image('hud-health-grid-'+game.maxHp,ox+hx,oy+hy,hw,hh);
 glyphs(game.hp+'/'+game.maxHp,ox+HUD.valueRight,oy+HUD.nameRow,'right');
 const [mx,my,mw,mh]=HUD.meter;
 for(let i=0;i<3;i++){const left=ox+mx+i*HUD.meterPitch,fraction=clamp((game.meter-i*100)/100,0,1);
  bar(i===2?'hud-meter-fill-hot':'hud-meter-fill',left,oy+my,mw,fraction,mh);
  if(fraction===1){ctx.save();ctx.globalAlpha=.08+.08*Math.sin(game.time*5-i);ctx.fillStyle='#fff1c6';ctx.fillRect(left,oy+my,mw,mh);ctx.restore();}
 }
 const [dx,dy,dw,dh]=HUD.dash;ctx.save();ctx.globalAlpha=p.dashCd>0?.45:1;
 bar('hud-dash-fill',ox+dx,oy+dy,dw,1-p.dashCd/.65,dh);ctx.restore();
 if(!game.buggyDefeated){const [lx,ly,lw,lh]=HUD.lockGroup;
  ctx.fillStyle='#0b1322cc';ctx.fillRect(ox+lx,oy+ly,lw,lh);ctx.strokeStyle='#2b3b55';ctx.lineWidth=1;ctx.strokeRect(ox+lx+.5,oy+ly+.5,lw-1,lh-1);
  image('hud-lock',ox+lx+7,oy+ly+4,11,11);
 }
 image('hud-coin',ox+HUD.coin[0],oy+HUD.coin[1],14,14);glyphs(game.berries,ox+HUD.berries[0],oy+HUD.berries[1]);
 if(game.level>1){image('hud-level-badge',...HUD.stamp);glyphs(game.level,HUD.stamp[0]+41,HUD.stamp[1]+6);}
 ctx.fillStyle='#0b1629ee';ctx.fillRect(16,466,142,60);ctx.strokeStyle='#ae8851';ctx.strokeRect(16.5,466.5,141,59);image('meat',24,474,48,38);glyphs(game.heals+'/3',86,483);text('F · EAT',86,510,10,'#e9d3a1');if(game.healTime){ctx.fillStyle='#eeb76b';ctx.fillRect(22,519,128*(1-game.healTime/.65),3);}
 if(game.boss&&game.bossStarted){const [fx,fy,fw,fh]=BOSS.bar;
  image('hud-boss-frame',BOSS.x,BOSS.y,BOSS.w,BOSS.h);if(game.boss.kind==='kuro'){ctx.fillStyle='#0c1629';ctx.fillRect(BOSS.x+12,BOSS.y+4,350,18);text('CAPTAIN KURO',BOSS.x+20,BOSS.y+17,12,'#e6c587');}
  bar('hud-boss-trail',BOSS.x+fx,BOSS.y+fy,fw,bossTrail,fh);
  bar('hud-boss-fill',BOSS.x+fx,BOSS.y+fy,fw,game.boss.hp/game.boss.maxHp,fh);
  image('hud-boss-grid',BOSS.x+fx,BOSS.y+fy,fw,fh);
  glyphs(game.boss.phase,BOSS.x+BOSS.phase[0],BOSS.y+BOSS.phase[1]);
 }
 if(fullscreen()&&started&&game.messageTime>0)plate(game.message,480,466);
 const c=game.context();if(c){
  const label=c.kind==='checkpoint'?'Press E to rest':c.kind==='satchel'?'E · Recover':c.kind==='rematch'?'E · Rematch':'E · Travel';
  plate(label,clamp((c.x-camera.x)*ZOOM,90,870),(c.y-camera.y-68)*ZOOM);
 }

 if(game.dead){ctx.fillStyle='#101626b8';ctx.fillRect(0,0,960,540);text('THE VOYAGE CONTINUES',480,255,27,'#f0c88c','center');text('Returning to your signal station…',480,290,13,'#d0d7dd','center');}
 if(game.victoryTime>0){text(game.stage==='mansion'?'KURO DEFEATED':'BUGGY DEFEATED',480,190,34,'#ffdf91','center');text(game.stage==='mansion'?'Second captain defeated':'Gum-Gum Gatling unlocked',480,220,14,'#fff0cc','center');}

}
function render(){ctx.imageSmoothingEnabled=false;ctx.save();ctx.scale(ZOOM,ZOOM);backgrounds();if(!loaded){ctx.restore();return;}if(shake>0)ctx.translate(Math.round(Math.sin(game.time*100)*3),Math.round(Math.cos(game.time*83)*2));
 let bob=0;if(game.stage==='sunny')bob=ship();else {floors();drawHazards();}
 villageProps();drawCheckpoints(bob);drawExits(bob);
 if(game.satchel?.stage===game.stage){const s=game.satchel;ctx.fillStyle='#eac466';ctx.fillRect(s.x-camera.x-7,s.y-camera.y-13,14,13);}
 for(const e of game.enemies)drawEnemy(e);drawBoss();drawPlayer(bob);if(game.stage==='sunny')shipRails(bob);drawProjectiles();
 if(((game.stage==='circus'&&game.buggyDefeated)||(game.stage==='mansion'&&game.kuroDefeated))&&(!game.boss||game.boss.state==='defeated'))plate(game.stage==='mansion'?'KURO · REMATCH':'BUGGY · REMATCH',880-camera.x,360-camera.y);
 for(const e of game.effects){const x=e.x-camera.x,y=e.y-camera.y;ctx.strokeStyle='#fff2bc';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x-12,y-12);ctx.lineTo(x+12,y+12);ctx.moveTo(x+12,y-12);ctx.lineTo(x-12,y+12);ctx.stroke();}
 if(game.stage==='sunny')sea(SHIP.waterline-camera.y);ctx.restore();drawHud();
 if(started&&!paused){ctx.strokeStyle='#f6dfaa';ctx.lineWidth=1;ctx.beginPath();ctx.arc(pointer.x,pointer.y,6,0,Math.PI*2);ctx.moveTo(pointer.x-10,pointer.y);ctx.lineTo(pointer.x+10,pointer.y);ctx.moveTo(pointer.x,pointer.y-10);ctx.lineTo(pointer.x,pointer.y+10);ctx.stroke();}
}
let statusTime=0;
function tick(now){const dt=Math.min(.1,(now-(last||now))/1000);last=now;
 if(started&&!paused&&loaded){accumulator+=dt;while(accumulator>=1/120&&!paused){
  game.step(1/120,{...pressed,left:keys.has('KeyA'),right:keys.has('KeyD'),up:keys.has('KeyW'),down:keys.has('KeyS'),aim:{x:pointer.x/ZOOM+camera.x,y:pointer.y/ZOOM+camera.y}});pressed={};LuffyMotion.update(game.player,1/120);processEvents();accumulator-=1/120;
 }const target=targetCamera();camera.x+=(target.x-camera.x)*Math.min(1,dt*6);camera.y+=(target.y-camera.y)*Math.min(1,dt*5);shake=Math.max(0,shake-dt);
 }else accumulator=0;
 // Pale trail follows the red fill down, so a Bazooka's chunk of damage stays visible for a beat.
 const bossHp=game.boss&&game.bossStarted?game.boss.hp/game.boss.maxHp:1;
 bossTrail=bossHp>bossTrail?bossHp:Math.max(bossHp,bossTrail-dt*.5);
 render();statusTime+=dt;if(statusTime>.2){statusTime=0;$('status').textContent=started?game.world.name+' · Health '+game.hp+'/'+game.maxHp+' · '+game.berries+' berries'+(paused?' · Paused':''):'Ready at the Sunny';const zone=[...(game.world.zones||[])].reverse().find(z=>game.player.x>=z.x);const nearby=game.context();$('game-info').textContent=!saveAvailable?'Browser saving is unavailable. Keep this tab open.':game.messageTime>0?game.message:nearby?.kind==='exit'?nearby.label:zone?zone.name:'Explore the Sunny, then travel from the lower deck.';for(const kind of ['bazooka','gatling'])$(kind).disabled=!started||paused||game.dead>0||!!game.player.special||!game.player.grounded||game.player.stairs||game.player.attackCd>0||game.player.dash>0||game.meter<SPECIALS[kind].cost||(kind==='gatling'&&!game.buggyDefeated);$('gatling').textContent=game.buggyDefeated?'R · Gatling · 3 bars':'Gatling · Defeat Buggy to unlock';$('charge').textContent=Math.floor(game.meter/100)+' / 3 bars · '+game.meter+' / 300';$('charge').setAttribute('aria-valuenow',game.meter);canvas.dataset.meter=String(game.meter);canvas.dataset.special=game.player.special?.kind||'';canvas.dataset.stage=game.stage;canvas.dataset.playerX=game.player.x.toFixed(1);canvas.dataset.playerY=game.player.y.toFixed(1);canvas.dataset.grounded=String(game.player.grounded);canvas.dataset.paused=String(paused);syncFullscreen();}
 requestAnimationFrame(tick);}
requestAnimationFrame(tick);
