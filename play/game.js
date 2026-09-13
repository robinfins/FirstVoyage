'use strict';
const {Game,STAGES,SHIP,TYPES,METER,SPECIALS,HEALTH,CHARACTERS,clamp}=PirateGame;
const ZOOM=1.35, VIEW_W=960/ZOOM, VIEW_H=540/ZOOM;
const canvas=document.getElementById('game'),ctx=canvas.getContext('2d'),$=id=>document.getElementById(id);
const shell=document.querySelector('.game-shell');
const SAVE_KEY='straw-hat-first-voyage-v1',images={},keys=new Set();
let attackHeld=false,blockHeld=false;
let game,started=false,paused=false,loaded=false,last=0,accumulator=0,saved=null,saveAvailable=true;
let camera={x:0,y:170},pointer={x:650,y:290},pressed={},shake=0,sound=true,audioContext=null;
let music=true,scoreTrack=null;
try{saved=PirateGame.validSave(JSON.parse(localStorage.getItem(SAVE_KEY)));}catch{saveAvailable=false;}
game=new Game(saved);game.events=[];
// Bump when regenerated art must defeat a cached copy; script ?v= tags do not cover asset files.
const ASSET_V='zoro-stride3';
function load(key,path,attempt=0){return new Promise(resolve=>{const im=new Image();im.onload=()=>{images[key]=im;resolve();};im.onerror=()=>{if(attempt<2)setTimeout(()=>resolve(load(key,path,attempt+1)),250*(attempt+1));else resolve(key);};im.src='../assets/chapter-01/'+path+'?v='+ASSET_V;});}
const required=new Set(['luffy','pirate-cutlass','pirate-brute','pirate-bomber','buggy-melee','buggy-specials','sunny-ship-layer','sunset-sky','distant-islands','orange-town-buildings','circus-tent-layer','ocean-wave-cycle','sunny-flag-cycle','checkpoint-snail']);
const assets=Object.entries(PACK.files).filter(([k])=>required.has(k)||k.startsWith('buggy-')&&k.includes('-part-'));
for(const [key,path] of [['kaya-mansion','kaya-mansion-arena-v2.png'],['syrup-sky','syrup-dusk-sky.png'],['syrup-village','cleaned/syrup-village-midground.png'],['syrup-props','cleaned/syrup-woodland-foreground.png'],['cats','cleaned/black-cat-pirate-poses.png'],['kuro','cleaned/kuro-attack-poses.png']])assets.push([key,'../chapter-02/'+path]);
assets.push(['zoro','../characters/zoro/zoro-atlas.png']);
assets.push(['zoro-oni','../characters/zoro/oni-giri.png'],['zoro-stride','../characters/zoro/zoro-stride.png']);
assets.push(['meat','ui/meat.svg'],['jet-stamp','motion/luffy-jet-stamp.png']);
assets.push(['luffy-motion','motion/luffy-motion.png'],['luffy-stride','motion/luffy-stride.png']);
assets.push(['terrain','terrain/pirate-terrain-atlas.png'],['sunny-rails','layers/sunny-rails-foreground.png']);
for(const name of ['hud-zoro-crest','hud-console','hud-health-fill','hud-health-grid-5','hud-health-grid-6','hud-health-grid-7','hud-meter-fill','hud-meter-fill-hot','hud-dash-fill','hud-glyphs','hud-lock','hud-coin','hud-boss-frame','hud-boss-fill','hud-boss-trail','hud-boss-grid','hud-level-badge','hud-gear-badge','hud-gear-fill'])assets.push([name,'ui/'+name+'.svg']);
assets.push(['sign-post','props/sign-post.svg'],['sign-arrow','props/sign-arrow.svg'],['circus-base','layers/circus-base.svg']);
Promise.all(assets.map(([key,path])=>load(key,path))).then(results=>{
 const failures=results.filter(Boolean);if(failures.length){$('loading').textContent='Could not load '+failures.join(', ')+'. Reload to retry.';return;}
 images.zoro=ZoroArt.prepare(images.zoro,images['zoro-oni'],images['zoro-stride']);loaded=true;$('loading').textContent='Crew ready. Click to begin.';$('start').disabled=false;
 if(saved){$('resume').hidden=false;$('start').textContent='New voyage';}
});
function begin(fresh){game=new Game(fresh?null:saved);game.events=[];started=true;paused=false;keys.clear();attackHeld=false;blockHeld=false;pressed={};$('menu').hidden=true;$('pause-button').disabled=false;camera=targetCamera();canvas.focus();scoreTrack=null;if(music||sound)audio();if(music)scoreFor(true);if(fresh){try{localStorage.setItem(SAVE_KEY,JSON.stringify(game.save()));}catch{saveAvailable=false;}}}
$('start').onclick=()=>begin(true);$('resume').onclick=()=>begin(false);
function pause(value){if(!started)return;
 // While resting, Escape walks back out of the travel views one at a time before leaving the rest.
 if(game.resting){if(!value){if(restView==='root')leaveRest();else showRest(restView==='snails'?'islands':'root');}return;}paused=value;keys.clear();attackHeld=false;blockHeld=false;pressed={};$('pause-menu').hidden=!paused;$('pause-button').textContent=paused?'Resume · Esc':'Pause · Esc';if(!paused)canvas.focus();if(paused&&locked)document.exitPointerLock();else requestLock();Music.duck(paused);syncFullscreen();}
// The rest card is three views: the root, the island list, and one island's snails. Fast travel
// used to be a single flat row of every activated snail, which stopped being readable once the
// second island opened up and is only going to get worse with a third.
let restView='root',restIsland=null;
function showRest(view='root',islandId=null){restView=view;restIsland=islandId;
 paused=true;keys.clear();attackHeld=false;blockHeld=false;pressed={};accumulator=0;$('pause-menu').hidden=true;$('rest-menu').hidden=false;$('pause-button').textContent='Resume · Esc';if(locked)document.exitPointerLock();syncFullscreen();
 renderRest();}
function travelEntry(label,note,current,onclick){
 const b=document.createElement('button');b.disabled=current;b.onclick=onclick;
 const n=document.createElement('span');n.className='travel-name';n.textContent=label;
 const m=document.createElement('span');m.className='travel-note';m.textContent=note;
 b.append(n,m);return b;}
function renderRest(){const list=$('travel-list'),menu=game.travelMenu();list.dataset.view=restView;
 // Travelling can change which island you are on, so never trust a remembered id.
 if(restView==='snails'&&!menu.some(i=>i.id===restIsland))restView='islands';
 const island=menu.find(i=>i.id===restIsland);
 list.replaceChildren();
 if(restView==='root'){
  $('rest-eyebrow').textContent='SIGNAL STATION';$('rest-title').textContent='Take a rest.';
  $('rest-sub').textContent=CHARACTERS[game.character].name+' · '+game.hp+'/'+game.maxHp+' HP · Meat replenished';
 }else if(restView==='crew'){
  $('rest-eyebrow').textContent='STRAW HAT CREW';$('rest-title').textContent='Who takes the lead?';
  $('rest-sub').textContent='Shared voyage and health pool. Switching clears ability charge.';
  for(const id of ['luffy','zoro'])list.append(travelEntry(CHARACTERS[id].name,
   id==='luffy'?'Long reach · Bazooka · Gatling · Gear 2 after Kuro':'Three swords · Right click to guard / parry · Oni Giri · Tiger Trap',
   game.character===id,()=>{if(game.switchCharacter(id)){processEvents();showRest();}}));
 }else if(restView==='islands'){
  $('rest-eyebrow').textContent='FAST TRAVEL';$('rest-title').textContent='Where to?';
  $('rest-sub').textContent=menu.length>1?'Choose a destination.':'Only the Sunny has an activated snail so far.';
  for(const i of menu)list.append(travelEntry(i.name,i.snails.length+(i.snails.length===1?' snail':' snails'),false,()=>showRest('snails',i.id)));
 }else{
  $('rest-eyebrow').textContent='FAST TRAVEL';$('rest-title').textContent=island.name;
  $('rest-sub').textContent='Choose an activated snail.';
  for(const sn of island.snails)list.append(travelEntry(sn.name,sn.current?'You are here':sn.area,sn.current,
   ()=>{if(game.travel(sn.stage,sn.id)){processEvents();camera=targetCamera();showRest();}}));
 }
 list.hidden=restView==='root';$('rest-back').hidden=restView==='root';$('open-travel').hidden=restView!=='root';$('open-crew').hidden=restView!=='root';
 (restView==='root'?$('leave-rest'):$('rest-back')).focus();}
$('open-travel').onclick=()=>showRest('islands');
$('open-crew').onclick=()=>showRest('crew');
$('rest-back').onclick=()=>showRest(restView==='snails'?'islands':'root');
// First clear of each captain explains what it just handed you. Copy follows the real numbers in
// core.js, so it stays true if those are retuned.
const UNLOCKS={
 buggy:{eyebrow:'FIRST CAPTAIN DOWN',title:'Gum-Gum Gatling',key:'R',cost:'costs all three bars',
  body:['<b>Eighteen punches in 1.8 seconds.</b> More total damage than Bazooka, but Luffy is committed for the whole barrage.',
        'It starts after 0.18s, then lands a hit every 0.085s in a 165-pixel lane straight ahead.',
        'Aim is locked when you start it, and you must be on firm ground.',
        '<b>Dash cancels it</b> — but the bars are spent either way.',
        '<b>Zoro also unlocked Tiger Trap.</b> Switch crew at any resting snail.'],
  level:'LEVEL 2 · every attack hits harder · 120 more maximum HP'},
 kuro:{eyebrow:'SECOND CAPTAIN DOWN',title:'Gear 2',key:'X',cost:'costs one, two or three bars',
  body:['<b>Luffy\'s transformation.</b> Switch to Luffy at a resting snail to use Gear 2.',
        '<b>Three, seven or thirteen seconds</b> of it, depending on how many full bars you spend.',
        'Punches land <b>twice as fast</b> — hold the left mouse button to keep swinging instead of clicking each one.',
        'Dash cools down in half the time, so you can reposition between openings.',
        '<b>Right click for Gum-Gum Jet Stamp</b>, a Bazooka-strength finisher that ends Gear 2 early.',
        'Activation takes 0.6s and leaves you standing still — <b>taking a hit cancels it</b> and the bars are gone.'],
  level:'LEVEL 3 · every attack hits harder · 120 more maximum HP'}
};
function showUnlock(kind){const u=kind==='buggy'&&game.character==='zoro'?{...UNLOCKS.buggy,title:'Tiger Trap',body:['<b>A heavy three-sword chop.</b> Cross both blades down from behind your back for 18× base damage.','Costs three bars, with a 0.48s windup and 1.1s total commitment.','<b>Luffy also unlocked Gatling.</b> Switch crew at any resting snail.']}:UNLOCKS[kind];if(!u)return;
 paused=true;keys.clear();attackHeld=false;blockHeld=false;pressed={};accumulator=0;
 $('unlock-eyebrow').textContent=u.eyebrow;$('unlock-title').textContent=u.title;
 $('unlock-key').textContent=u.key;$('unlock-cost').textContent=u.cost;
 $('unlock-level').textContent=u.level;
 const list=$('unlock-body');list.replaceChildren();
 for(const line of u.body){const li=document.createElement('li');li.innerHTML=line;list.append(li);}
 $('unlock-menu').hidden=false;$('pause-button').textContent='Resume · Esc';
 if(locked)document.exitPointerLock();
 Music.duck(true);syncFullscreen();$('unlock-close').focus();
}
function closeUnlock(){$('unlock-menu').hidden=true;paused=false;accumulator=0;
 keys.clear();attackHeld=false;blockHeld=false;pressed={};$('pause-button').textContent='Pause · Esc';
 Music.duck(false);canvas.focus();syncFullscreen();}
$('unlock-close').onclick=closeUnlock;
function leaveRest(){game.closeRest();$('rest-menu').hidden=true;paused=false;accumulator=0;keys.clear();attackHeld=false;blockHeld=false;pressed={};$('pause-button').textContent='Pause · Esc';canvas.focus();syncFullscreen();}
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
// One context feeds both the blips and the score; it can only start inside a user gesture.
function audio(){audioContext ||= new (window.AudioContext||window.webkitAudioContext)();
 if(audioContext.state==='suspended')audioContext.resume();
 Music.attach(audioContext);Sfx.attach(audioContext);Sfx.setEnabled(sound);return audioContext;}
$('sound').onclick=()=>{sound=!sound;$('sound').textContent=sound?'Sound on':'Sound off';$('sound').setAttribute('aria-pressed',sound);if(sound)audio();Sfx.setEnabled(sound);canvas.focus();};
$('music').onclick=()=>{music=!music;$('music').textContent=music?'Music on':'Music off';$('music').setAttribute('aria-pressed',String(music));
 if(music){audio();scoreFor(true);}else Music.stop();canvas.focus();};
window.addEventListener('keydown',e=>{
 if(e.code==='Escape'){if(fullscreen())return;e.preventDefault();if($('unlock-menu').hidden&&!e.repeat)pause(!paused);return;}
 if(!started||paused||document.activeElement!==canvas)return;
 if(['KeyW','KeyA','KeyS','KeyD','Space','KeyE','KeyQ','KeyR','KeyF','KeyX'].includes(e.code))e.preventDefault();
 if(!keys.has(e.code)){if(e.code==='KeyW')pressed.jump=true;if(e.code==='KeyS')pressed.drop=true;if(e.code==='Space')pressed.dash=true;if(e.code==='KeyE')pressed.interact=true;if(e.code==='KeyQ')pressed.bazooka=true;if(e.code==='KeyR')pressed.gatling=true;if(e.code==='KeyF')pressed.heal=true;if(e.code==='KeyX')pressed.gear=true;}
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
shell.addEventListener('pointerdown',e=>{if(![0,2].includes(e.button)||e.target.closest('.overlay'))return;canvas.focus();aimAt(e);if(started&&!paused){if(e.button===0){attackHeld=true;pressed.attack=true;}else if(game.character==='zoro')blockHeld=true;else pressed.jet=true;}requestLock();});
window.addEventListener('pointerup',e=>{if(e.button===0)attackHeld=false;if(e.button===2)blockHeld=false;});
window.addEventListener('pointercancel',()=>{attackHeld=false;blockHeld=false;});
canvas.addEventListener('contextmenu',e=>e.preventDefault());
// Hub cue on the ship, march on the routes. The arenas pick their cue from the fight itself.
const STAGE_TRACK={sunny:'hub',dock:'stage',streets:'stage',syrup:'stage'};
const ARENA={circus:1,mansion:1};
// True only while the captain is actually up: he has spawned, the player has crossed the trigger
// that raises his health bar, and he is still standing.
function bossFightOn(){const b=game.boss;
 return !!b&&game.bossStarted&&b.state!=='defeated'&&b.hp>0;}
function scoreFor(force){if(!music||!started)return;
 const b=game.boss,fighting=bossFightOn();
 let want;
 if(fighting)want='boss';
 // In an arena: the march carries in over the approach, and the calm cue takes over once he is down.
 else if(ARENA[game.stage])want=(b&&b.state!=='defeated'&&b.hp>0)?'stage':'hub';
 else want=STAGE_TRACK[game.stage]||'stage';
 Music.setIntensity(fighting&&b.phase>1?2:1);
 if(want!==scoreTrack||force){scoreTrack=want;Music.play(want);}
}
function targetCamera(){const p=game.player;return {x:clamp(p.x-VIEW_W*.44+(Math.abs(p.vx)>30?Math.sign(p.vx)*32:0),0,Math.max(0,game.world.width-VIEW_W)),y:clamp(p.y-300,-100,game.world.floor-300)};}
function processEvents(){for(const e of game.events){
 // Every gameplay event gets its cue from sfx.js; only the ones with side effects are listed here.
 Sfx.play(e.type,e);
 if(e.type==='save'){try{localStorage.setItem(SAVE_KEY,JSON.stringify(e.data));saved=e.data;}catch{saveAvailable=false;}}
 if(e.type==='stage'){attackHeld=false;blockHeld=false;camera=targetCamera();pressed={};scoreFor();}
 if(e.type==='hurt')shake=.18;
 if(e.type==='rest')showRest();
 if(e.type==='victory'&&e.first)setTimeout(()=>{if(started&&!game.dead)showUnlock(e.boss);},2600);
 if(e.type==='boom')shake=.16;
 if(e.type==='special-pulse'&&['bazooka','jetstamp'].includes(e.kind))shake=.22;
 if(e.type==='special-pulse'&&['onigiri','tigertrap'].includes(e.kind))shake=e.kind==='tigertrap'?.18:.1;
 if(e.type==='gear-active'||e.type==='kuro-phase')shake=.12;
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
// World units per source pixel, one number per layer. Uniform by construction, so the waves
// cannot end up stretched the way they were -- the strip was drawn 0.78x across but 0.54x down.
// Both are well under 1, so with ZOOM on top the water is downscaled rather than magnified; it
// used to be blown up 2.1x from a strip that had itself been saved at a quarter of the
// resolution it was cleaned at. Distance sets the order: the rear sea is further away, so its
// waves are drawn smaller than the foreground surf's.
const SEA_SCALE={front:.4167,rear:.28};
function sea(y,rear=false){const i=Math.floor(game.time*4+(rear?0:2))%4;
 const drift=Math.sin(game.time*(rear?.19:.23))*3-camera.x*(rear?.22:1.08);
 // Cell and pivot come from the registration, so a regenerated strip of a different size still
 // lands on the waterline without a matching edit here.
 const r=PACK.props['ocean-wave-cycle'],s=SEA_SCALE[rear?'rear':'front'];
 const span=Math.round(r.cell_size[0]*s),height=Math.round(r.cell_size[1]*s);
 const top=Math.round(y-r.pivot[1]*s),base=-100+drift;
 const im=images['ocean-wave-cycle'];
 if(im){const cell=PACK.frames['ocean-wave-cycle'][i];
  // A smaller tile simply draws more copies, so the sea keeps filling the view on its own.
  for(let t=Math.floor(-base/span);t<=Math.floor((VIEW_W-base)/span);t++){
   const x=Math.round(base+t*span);
   if(t&1){ctx.save();ctx.translate(x+span,top);ctx.scale(-1,1);ctx.drawImage(im,...cell,0,0,span,height);ctx.restore();}
   else ctx.drawImage(im,...cell,x,top,span,height);
  }
 }
 ctx.fillStyle='#082740';ctx.fillRect(0,top+height-1,960,540);
}
function backgrounds(){if(game.stage==='mansion'){
 const ground=430-camera.y;ctx.fillStyle='#30394e';ctx.fillRect(0,0,VIEW_W,VIEW_H);
 image('kaya-mansion',-20-camera.x*.18,ground-410,900,600);
 // Independent garden motes and low drifting mist keep the fixed architecture quiet.
 for(let i=0;i<12;i++){const x=((i*93+game.time*(4+i%3)-camera.x*.45)%850+850)%850-60,y=ground-15-(i*31%190)+Math.sin(game.time+i)*5;ctx.fillStyle=i%3?'#b2bd8055':'#eddcaf77';ctx.fillRect(x,y,2,1);}
 if(game.boss?.phase===2){ctx.fillStyle='#20203b26';ctx.fillRect(0,0,VIEW_W,ground);}
 return;}if(game.stage==='syrup'){image('syrup-sky',-20-camera.x*.015,-40,1000,580);const ground=game.world.floor-camera.y;terrain(1,0,ground-2,960,900,-camera.x*.35,ground,128);ctx.fillStyle='#172d3388';ctx.fillRect(0,ground,960,900);for(let i=Math.floor(camera.x*.35/900)-1;i<=Math.floor(camera.x*.35/900)+1;i++)image('syrup-village',i*900-camera.x*.35,ground-546,1000,600);return;}const sunny=game.stage==='sunny';ctx.fillStyle='#182844';ctx.fillRect(0,0,960,540);image('sunset-sky',-30-camera.x*.025,-48,1040,590);
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
function floors(){if(game.stage==='mansion'){const im=images['kaya-mansion'],y=430-camera.y;
 if(im)ctx.drawImage(im,0,780,1536,244,-camera.x,y,1160,184);
 ctx.fillStyle='#bbb1a166';ctx.fillRect(-camera.x,y,1160,1);return;}const dock=game.stage==='dock';
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
 // Sink the foot a couple of pixels past the ground line so the mound bites into the floor's
 // bright top lip instead of leaving a hairline seam against it.
 const x=Math.round(e.x-camera.x),y=Math.round(e.y-camera.y+bob),top=y-SIGN.h+2;
 image('sign-post',x-SIGN.w/2,top,SIGN.w,SIGN.h);
 glyphs(SIGN_LABEL[e.to]||'TRAVEL',x,top+SIGN.label,'center',SIGN.advance);
 // Return exits sit at the low end of every stage, so the board points the way out.
 const dir=e.x<game.world.width/2?-1:1,im=images['sign-arrow'];
 if(im){ctx.save();ctx.translate(x,top+SIGN.arrow);ctx.scale(dir,1);ctx.drawImage(im,-SIGN.arrowW/2,0,SIGN.arrowW,SIGN.arrowH);ctx.restore();}
 }
}
const hotSprites={};
function hotSprite(key,strength=1){const amount=Math.ceil(strength*8)/8,cache=key+amount;if(hotSprites[cache])return hotSprites[cache];const im=images[key],c=document.createElement('canvas');c.width=im.width;c.height=im.height;const g=c.getContext('2d');g.drawImage(im,0,0);const data=g.getImageData(0,0,c.width,c.height);for(let i=0;i<data.data.length;i+=4){const d=data.data,r=d[i],b=d[i+2],green=d[i+1];if(r>130&&green>65&&green<r*.92&&b<green*.94&&r-green<115){d[i]=Math.min(255,r+20*amount);d[i+1]=Math.round(green*(1-.24*amount));d[i+2]=Math.min(255,b+15*amount);}}g.putImageData(data,0,0);return hotSprites[cache]=c;}
function drawPlayer(bob){drawPlayerArt(bob);const p=game.player;if(!p.gearFade)return;const t=1-p.gearFade/.65,x=p.x-camera.x,y=p.y-camera.y+bob;ctx.save();ctx.strokeStyle=`rgba(242,221,219,${(1-t)*.5})`;ctx.lineWidth=2;for(let i=0;i<6;i++){const sx=x+(i%2?1:-1)*(10+t*28),sy=y-14-i*7-t*18;ctx.beginPath();ctx.moveTo(sx,sy);ctx.quadraticCurveTo(sx+Math.sin(i+t*6)*9,sy-10,sx+3,sy-18);ctx.stroke();}ctx.restore();}
function drawPlayerArt(bob){const p=game.player,x=p.x-camera.x,y=p.y-camera.y+bob;
 if(game.character==='zoro'){ZoroArt.draw(ctx,images.zoro,p,x,y,game.time);return;}
 if(p.gearIntro){frame('luffy',5,x,y,.14,p.facing<0);const t=1-p.gearIntro/.6;ctx.strokeStyle='#f8c4b3';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(x,y,12+t*18,3+t*3,0,0,Math.PI*2);ctx.stroke();return;}
 if(p.special?.kind==='jetstamp'){
  const a=p.special,t=a.t,k=.16,im=images['jet-stamp'];
  const pose=t<.16?0:t<.23?1:t<.43?2:3;
  // The drawn hip and supporting foot stay anchored; extend only the straight calf.
  const reach=t<.25?80+120*Math.max(0,(t-.23)/.02):200;
  ctx.save();ctx.translate(x,y);ctx.scale(a.dx<0?-1:1,1);
  const angle=Math.atan2(a.dy,Math.abs(a.dx));ctx.translate(0,-31);ctx.rotate(angle);ctx.translate(0,31);
  if(pose===2){const extra=Math.max(0,reach-88),sx=pose*768;
   ctx.drawImage(im,sx,0,360,512,-200*k,-456*k,360*k,512*k);
   ctx.drawImage(im,sx+360,0,290,512,160*k,-456*k,290*k+extra,512*k);
   ctx.drawImage(im,sx+650,0,118,512,450*k+extra,-456*k,118*k,512*k);
  }else ctx.drawImage(im,pose*768,0,768,512,-200*k,-456*k,768*k,512*k);
  ctx.restore();if(t>=.25&&t<.43){const fx=x+a.dx*200,fy=y-31+a.dy*200;ctx.strokeStyle=`rgba(255,238,208,${1-(t-.25)/.18})`;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(fx,fy,10+(t-.25)*100,19+(t-.25)*100,angle,0,Math.PI*2);ctx.stroke();}return;
 }
 const warmth=p.gear?1:(p.gearFade||0)/.65;const originals={};if(warmth){ctx.save();ctx.save();ctx.globalAlpha=warmth;ctx.fillStyle=`rgba(255,86,66,${.06+Math.sin(game.time*10)*.02})`;ctx.beginPath();ctx.ellipse(x,y-32,22,35,0,0,Math.PI*2);ctx.fill();ctx.restore();for(const key of ['luffy','luffy-motion','luffy-stride']){originals[key]=images[key];images[key]=hotSprite(key,warmth);}SpecialArt.hot=true;}
 drawPlayerBase(bob);
 if(warmth){Object.assign(images,originals);SpecialArt.hot=false;ctx.restore();for(let i=0;i<7;i++){const t=(game.time*.8+i/7)%1;ctx.strokeStyle=`rgba(255,231,219,${(1-t)*.48*warmth})`;ctx.lineWidth=1.5;const sx=x+(i%2?-1:1)*(7+t*13),sy=y-12-t*62;ctx.beginPath();ctx.moveTo(sx,sy);ctx.quadraticCurveTo(sx+Math.sin(t*9+i)*8,sy-8,sx+4,sy-16);ctx.stroke();}}
}
function drawPlayerBase(bob){const p=game.player;if(p.grounded&&!p.stairs&&!p.dash&&!p.attack&&!p.special&&Math.abs(p.vx)>12){LuffyMotion.drawStride(ctx,images['luffy-stride'],p,p.x-camera.x,p.y-camera.y+bob,p.invuln>0&&Math.floor(game.time*16)%2?.48:1);return;}const pose=LuffyMotion.pose(p);if(pose!==null){const im=images['luffy-motion'],k=.27;ctx.save();ctx.globalAlpha=p.invuln>0&&Math.floor(game.time*16)%2?.48:1;ctx.translate(Math.round(p.x-camera.x),Math.round(p.y-camera.y+bob));ctx.scale(p.facing,1);ctx.drawImage(im,pose%4*384,Math.floor(pose/4)*384,384,384,-192*k,-340*k,384*k,384*k);ctx.restore();return;}if(p.special){SpecialArt.draw(ctx,images.luffy,p.special,p.x-camera.x,p.y-camera.y+bob,.14);return;}let index=0;
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
function villageProps(){if(game.stage!=='syrup')return;const im=images['syrup-props'];
 // Trees belong to solid world platforms, never the gaps between them. Visible roots end at source y=530.
 const placements=game.stage==='syrup'?[{x:90,y:430},{x:1570,y:430},{x:3090,y:430},{x:3630,y:430}]:[{x:50,y:430},{x:1100,y:430}];
 for(const p of placements){const px=p.x-camera.x;if(px<-180||px>VIEW_W+180)continue;ctx.drawImage(im,0,0,512,540,px-100,p.y-camera.y-530*200/512,200,540*200/512);}}

// Only the sprite differs by chapter. The tell and the health bar are shared, so Syrup's Black Cats
// read the same way as the Orange Town crew.
function drawEnemy(e){if(e.hp<=0)return;
 const x=e.x-camera.x,y=e.y-camera.y;if(x<-100||x>1060)return;
 if(e.stun>0)text('STUN',x,y-100,10,'#fff3ac','center');
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
function drawBoss(){const b=game.boss;if(!b)return;
 if(b.stun>0)text('STUN',b.x-camera.x,b.y-camera.y-120,11,'#fff3ac','center');
 const wind=b.state==='wind',active=b.state==='active',recover=b.state==='recover';
 if(active&&['lunge','flurry','feint','dive','hunt','pounce'].includes(b.attack)){ctx.save();for(let n=3;n>0;n--){ctx.globalAlpha=.07*(4-n);if(b.kind==='kuro')chapterSprite('kuro',3,b.x-camera.x-b.facing*n*17,b.y-camera.y,BOSS_SCALE,b.facing);else frame('buggy-melee',3,b.x-camera.x-b.facing*n*15,b.y-camera.y,BOSS_SCALE,b.facing>0);}ctx.restore();}
 ctx.save();const bx=b.x-camera.x,by=b.y-camera.y;const squash=wind?Math.sin(Math.min(1,(b.windTotal?1-b.timer/b.windTotal:.5))*Math.PI)*.035:recover?Math.sin(b.timer*8)*.02:0;ctx.translate(bx,by);ctx.scale(1+squash,1-squash);ctx.translate(-bx,-by);if(wind)ctx.translate(-b.facing*(2+Math.sin(game.time*16)*1.2),0);else if(recover)ctx.translate(b.facing*Math.max(0,b.timer)*3,0);else if(!active&&b.state!=='defeated')ctx.translate(0,Math.sin(game.time*4)*1.2);drawBossBase();ctx.restore();
 if(b.kind==='kuro'&&wind){if(['dive','pounce'].includes(b.attack)){ctx.strokeStyle='#ffb988';ctx.beginPath();ctx.ellipse(b.aim-camera.x,430-camera.y,65,8,0,0,Math.PI*2);ctx.stroke();}else if(b.attack==='hunt'){ctx.fillStyle='#ef858444';ctx.fillRect(b.facing<0?b.x-camera.x-250:b.x-camera.x,430-camera.y-10,250,10);}}
 if(active&&['slash','clawwave','crosscut'].includes(b.attack)&&(!['clawwave','crosscut'].includes(b.attack)||b.anim>.1&&b.anim<.3)){ctx.save();ctx.translate(b.x-camera.x,b.y-camera.y);ctx.scale(b.facing,1);ctx.strokeStyle='#e9e7fa';ctx.lineWidth=2;for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(35,-30,35+i*8,-1.6+Math.min(1,b.anim/.3)*.5,1);ctx.stroke();}ctx.restore();}
}
function drawBossBase(){const b=game.boss;if(!b)return;if(b.kind==='kuro'){const ranged=['clawwave','crosscut'].includes(b.attack);const i=b.state==='split'?1:b.state==='defeated'?7:b.hit>0?7:b.state==='recover'?(ranged?0:6):b.state==='wind'?(['slash','clawwave','crosscut'].includes(b.attack)?4:b.attack==='flurry'?1:2):b.state==='active'?(ranged?(b.anim<.14?4:b.anim<.32?5:0):b.attack==='slash'?5:3):0;ctx.save();if(b.state==='split')ctx.globalAlpha=.55+Math.sin(game.time*32)*.25;chapterSprite('kuro',i,b.x-camera.x,b.y-camera.y,BOSS_SCALE,b.facing);ctx.restore();
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
 if(q.kind==='clawwave'){ctx.scale(q.vx<0?-1:1,1);ctx.strokeStyle='#e8dff3';ctx.lineWidth=2;for(let i=-1;i<=1;i++){ctx.beginPath();ctx.moveTo(-8,i*8+5);ctx.lineTo(12,i*8-5);ctx.stroke();}}else if(q.kind==='knife'){ctx.rotate(Math.atan2(q.vy,q.vx));ctx.fillStyle='#e6e6d8';ctx.beginPath();ctx.moveTo(17,0);ctx.lineTo(-8,-4);ctx.lineTo(-8,4);ctx.fill();ctx.fillStyle='#73574f';ctx.fillRect(-17,-3,9,6);}
 else if(q.kind==='hand'){ctx.fillStyle='#35263b';ctx.fillRect(-17,-10,30,20);ctx.fillStyle='#f0dcc5';ctx.fillRect(-15,-8,26,16);ctx.fillStyle='#8f7a79';for(let i=-11;i<10;i+=6)ctx.fillRect(i,-7,2,10);}
 else if(q.kind==='bomb'){ctx.fillStyle='#202734';ctx.beginPath();ctx.arc(0,0,10,0,Math.PI*2);ctx.fill();ctx.fillStyle='#d9c49d';ctx.fillRect(-2,-15,4,7);ctx.fillStyle=Math.floor(game.time*12)%2?'#ffd071':'#ff794e';ctx.fillRect(-3,-19,6,6);}
 else{ctx.fillStyle='#ffb34c77';ctx.beginPath();ctx.arc(0,0,q.radius,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#ffdd86';ctx.lineWidth=3;ctx.stroke();}
 ctx.restore();}}
// Console geometry mirrors assets/chapter-01/ui/hud-layout.json; panel-relative, drawn 1:1.
const HUD_X=16;                                          // shared left gutter for every overlay
const HUD={x:HUD_X,y:14,w:300,h:100,health:[64,29,225,14],meter:[64,51,73,10],meterPitch:76,
 dash:[64,67,187,4],valueRight:289,nameRow:10,lockGroup:[162,77,104,18],coin:[110,8],berries:[128,10],
 // The console, the level stamp and the meat panel all start at HUD.x, so the side of the screen
 // reads as one straight gutter.
 stamp:[HUD_X,120,56,22],meat:[HUD_X,466,142,60],
 // The crest plate replaces the whole medallion rather than just its emblem, so it is anchored
 // from the medallion's centre in the console art instead of from the gutter.
 medallion:[31,50],crestSize:48};
// The Gear 2 badge is the one thing that is not on the gutter: it shares the level stamp's row and
// is placed off the stamp's right edge, so the two read as a pair rather than a stack.
HUD.gear=[HUD.stamp[0]+HUD.stamp[2]+8,HUD.stamp[1],150,22];
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
 // Low health: pulse the continuous track rim.
 if(game.hp<=game.maxHp*.25&&!game.dead){ctx.save();ctx.globalAlpha=.35+.35*Math.sin(game.time*9);ctx.strokeStyle='#ff5f4a';ctx.lineWidth=2;ctx.strokeRect(ox+hx-2,oy+hy-2,hw+4,hh+4);ctx.restore();}
 // Character-specific labels share the original console geometry.
 // Continuous HP pool: no segment dividers.
 glyphs(CHARACTERS[game.character].name.toUpperCase(),ox+66,oy+10);
 glyphs(game.character==='zoro'?'ONI GIRI':'BAZOOKA',ox+82,oy+81,'left',7);
 glyphs(game.character==='zoro'?'TIGER TRAP':'GATLING',ox+184,oy+81,'left',7);
 // Luffy's straw hat is baked into the console, so Zoro's earrings arrive as a whole medallion
 // plate drawn over it. Covering a pixel disc with a canvas arc left an antialiased fringe of the
 // hat around the rim, and a cropped portrait read as a photo pasted into a pixel HUD.
 if(game.character==='zoro'){const [mx,my]=HUD.medallion,d=HUD.crestSize;
  image('hud-zoro-crest',ox+mx-d/2,oy+my-d/2,d,d);}
 glyphs(game.hp+'/'+game.maxHp,ox+HUD.valueRight,oy+HUD.nameRow,'right');
 const [mx,my,mw,mh]=HUD.meter;
 for(let i=0;i<3;i++){const left=ox+mx+i*HUD.meterPitch,fraction=clamp((game.meter-i*100)/100,0,1);
  bar(i===2?'hud-meter-fill-hot':'hud-meter-fill',left,oy+my,mw,fraction,mh);
  if(fraction===1){ctx.save();ctx.globalAlpha=.08+.08*Math.sin(game.time*5-i);ctx.fillStyle='#fff1c6';ctx.fillRect(left,oy+my,mw,mh);ctx.restore();}
 }
 const [dx,dy,dw,dh]=HUD.dash;ctx.save();ctx.globalAlpha=p.dashCd>0?.45:1;
 bar('hud-dash-fill',ox+dx,oy+dy,dw,1-p.dashCd/(p.dashMax||.65),dh);ctx.restore();
 if(!game.buggyDefeated){const [lx,ly,lw,lh]=HUD.lockGroup;
  ctx.fillStyle='#0b1322cc';ctx.fillRect(ox+lx,oy+ly,lw,lh);ctx.strokeStyle='#2b3b55';ctx.lineWidth=1;ctx.strokeRect(ox+lx+.5,oy+ly+.5,lw-1,lh-1);
  image('hud-lock',ox+lx+7,oy+ly+4,11,11);
 }
 image('hud-coin',ox+HUD.coin[0],oy+HUD.coin[1],14,14);glyphs(game.berries,ox+HUD.berries[0],oy+HUD.berries[1]);
 if(game.level>1){image('hud-level-badge',...HUD.stamp);glyphs(game.level,HUD.stamp[0]+41,HUD.stamp[1]+6);}
 const [kx,ky,kw,kh]=HUD.meat;
 ctx.fillStyle='#0b1629ee';ctx.fillRect(kx,ky,kw,kh);ctx.strokeStyle='#ae8851';ctx.strokeRect(kx+.5,ky+.5,kw-1,kh-1);
 image('meat',kx+8,ky+8,48,38);glyphs(game.heals+'/3',kx+70,ky+15);glyphs('F +300',kx+66,ky+31,'left',8);
 if(game.healTime){ctx.fillStyle='#eeb76b';ctx.fillRect(kx+6,ky+53,(kw-12)*(1-game.healTime/.65),3);}
 if(game.boss&&game.bossStarted){const [fx,fy,fw,fh]=BOSS.bar;
  image('hud-boss-frame',BOSS.x,BOSS.y,BOSS.w,BOSS.h);if(game.boss.kind==='kuro'){ctx.fillStyle='#0c1629';ctx.fillRect(BOSS.x+12,BOSS.y+4,350,18);text('CAPTAIN KURO',BOSS.x+20,BOSS.y+17,12,'#e6c587');}
  bar('hud-boss-trail',BOSS.x+fx,BOSS.y+fy,fw,bossTrail,fh);
  bar('hud-boss-fill',BOSS.x+fx,BOSS.y+fy,fw,game.boss.hp/game.boss.maxHp,fh);
  image('hud-boss-grid',BOSS.x+fx,BOSS.y+fy,fw,fh);
  glyphs(game.boss.phase,BOSS.x+BOSS.phase[0],BOSS.y+BOSS.phase[1]);
 }
 if(fullscreen()&&started&&game.messageTime>0)plate(game.message,480,466);
 if(game.kuroDefeated&&game.character==='luffy'){const p=game.player,gx=HUD.gear[0],gy=HUD.gear[1];
  // Dim the badge when there is not a full bar to spend, the way Gatling dims before its unlock.
  const usable=p.gear>0||p.gearIntro>0||game.meter>=100;
  ctx.save();ctx.globalAlpha=usable?1:.55;image('hud-gear-badge',gx,gy,150,22);ctx.restore();
  const span=p.gearDuration||1,left=p.gear>0?p.gear/span:0;
  if(left>0)bar('hud-gear-fill',gx+78,gy+7,64,left,8);
  if(p.gearIntro>0){ctx.save();ctx.globalAlpha=.35+.35*Math.sin(game.time*18);
   ctx.fillStyle='#ffb089';ctx.fillRect(gx+78,gy+7,64,8);ctx.restore();}
  if(p.gear>0)glyphs(p.gear.toFixed(1),gx+140,gy+6,'right');
 }
 const c=game.context();if(c){
  const label=c.kind==='checkpoint'?'Press E to rest':c.kind==='satchel'?'E · Recover':c.kind==='rematch'?'E · Rematch':'E · Travel';
  plate(label,clamp((c.x-camera.x)*ZOOM,90,870),(c.y-camera.y-68)*ZOOM);
 }

 if(game.dead){ctx.fillStyle='#101626b8';ctx.fillRect(0,0,960,540);text('THE VOYAGE CONTINUES',480,255,27,'#f0c88c','center');text('Returning to your signal station…',480,290,13,'#d0d7dd','center');}
 if(game.victoryTime>0){text(game.stage==='mansion'?'KURO DEFEATED':'BUGGY DEFEATED',480,190,34,'#ffdf91','center');text(game.stage==='mansion'?'Luffy unlocked Gear 2 · X':'Gatling + Tiger Trap unlocked',480,220,14,'#fff0cc','center');}

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
function updateStatus(){
 const p=game.player,zoro=game.character==='zoro';
 $('status').textContent=started?game.world.name+' · '+CHARACTERS[game.character].name+' · Health '+game.hp+'/'+game.maxHp+' · '+game.berries+' berries'+(paused?' · Paused':''):'Ready at the Sunny';
 const zone=[...(game.world.zones||[])].reverse().find(z=>p.x>=z.x),nearby=game.context();
 $('game-info').textContent=!saveAvailable?'Browser saving is unavailable. Keep this tab open.':game.messageTime>0?game.message:nearby?.kind==='exit'?nearby.label:zone?zone.name:'Explore the Sunny, then travel from the lower deck.';
 for(const kind of ['bazooka','gatling'])$(kind).disabled=!started||paused||game.dead>0||!!p.special||!!p.gearIntro||p.blocking||!p.grounded||p.stairs||p.attackCd>0||p.dash>0||game.meter<SPECIALS[kind].cost||(kind==='gatling'&&!game.buggyDefeated);
 $('bazooka').textContent=zoro?'Q · Oni Giri · 2 bars':'Q · Bazooka · 2 bars';
 $('gatling').textContent=game.buggyDefeated?(zoro?'R · Tiger Trap · 3 bars':'R · Gatling · 3 bars'):'R · Defeat Buggy to unlock';
 $('charge').textContent=Math.floor(game.meter/100)+' / 3 bars · '+game.meter+' / 300';$('charge').setAttribute('aria-valuenow',game.meter);
 Object.assign(canvas.dataset,{character:game.character,hp:String(game.hp),meter:String(game.meter),special:p.special?.kind||'',stage:game.stage,playerX:p.x.toFixed(1),playerY:p.y.toFixed(1),grounded:String(p.grounded),paused:String(paused)});
 syncFullscreen();scoreFor();
}
function tick(now){const dt=Math.min(.1,(now-(last||now))/1000);last=now;
 if(started&&!paused&&loaded){accumulator+=dt;while(accumulator>=1/120&&!paused){
  game.step(1/120,{...pressed,attackHeld,block:blockHeld,left:keys.has('KeyA'),right:keys.has('KeyD'),up:keys.has('KeyW'),down:keys.has('KeyS'),aim:{x:pointer.x/ZOOM+camera.x,y:pointer.y/ZOOM+camera.y}});pressed={};LuffyMotion.update(game.player,1/120);if(game.character==='zoro')ZoroArt.update(game.player,1/120);processEvents();accumulator-=1/120;
 }const target=targetCamera();camera.x+=(target.x-camera.x)*Math.min(1,dt*6);camera.y+=(target.y-camera.y)*Math.min(1,dt*5);shake=Math.max(0,shake-dt);
 }else accumulator=0;
 // Pale trail follows the red fill down, so a Bazooka's chunk of damage stays visible for a beat.
 const bossHp=game.boss&&game.bossStarted?game.boss.hp/game.boss.maxHp:1;
 bossTrail=bossHp>bossTrail?bossHp:Math.max(bossHp,bossTrail-dt*.5);
 render();statusTime+=dt;if(statusTime>.2){statusTime=0;updateStatus();}
 requestAnimationFrame(tick);}
requestAnimationFrame(tick);
