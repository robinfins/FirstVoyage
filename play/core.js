/* Deterministic 120 Hz gameplay. No browser or rendering dependencies. */
(function(root) {
'use strict';
const ChapterTwo=typeof module!=='undefined'?require('./chapter-two.js'):root.ChapterTwo;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const SHIP={scale:.9, lower:585, upper:405, stairX:925, left:216, right:1359,
 flag:{x:1255,y:111,poleBottom:140}, waterline:660};
const STAGES={
 ...ChapterTwo.stages,
 sunny:{name:'Thousand Sunny',width:1505,spawn:{x:400,y:585},floor:585,
   platforms:[{x:216,end:1359,y:585,id:'lower'},{x:216,end:1359,y:405,id:'upper'}],
   checkpoints:[{id:'sunny',x:610,y:585,name:'Galley snail'}],exits:[{x:1270,y:585,to:'dock',label:'Sail to Orange Town'},{x:1120,y:585,to:'syrup',label:'Sail to Syrup Village',requiresBuggy:true}],enemies:[]},
 dock:{name:'Orange Town · Broken quays',width:4200,spawn:{x:100,y:430},floor:430,
   platforms:[{x:0,end:700,y:430,id:'landing'},
    {x:770,end:900,y:352,id:'cargo-a'},{x:985,end:1120,y:282,id:'cargo-b'},
    {x:1220,end:1330,y:340,id:'cargo-c'},
    {x:1430,end:1930,y:430,id:'signal-quay'},
    {x:1990,end:2130,y:350,id:'hoist-a'},
    {x:2230,end:2360,y:295,id:'hoist-b',motion:{axis:'x',amplitude:45,period:4}},
    {x:2460,end:2620,y:350,id:'hoist-c'},
    {x:2720,end:3260,y:430,id:'warehouse-quay'},
    {x:3330,end:3460,y:350,id:'crane-a'},
    {x:3540,end:3700,y:280,id:'crane-b'},
    {x:3800,end:4200,y:430,id:'exit-quay'}],
   hazards:[{x:2900,end:2980,y:430}],
   checkpoints:[{id:'dock-a',x:1580,y:430,name:'Dock signal station'}],
   exits:[{x:65,y:430,to:'sunny',label:'Return to Sunny'},{x:4090,y:430,to:'streets',label:'Enter warehouse lane'}],
   zones:[{x:0,name:'Landing patrol'},{x:700,name:'Cargo stacks'},{x:1430,name:'Signal quay'},
    {x:1930,name:'Suspended hoists'},{x:2720,name:'Warehouse barricade'},{x:3260,name:'Crane crossing'}],
   enemies:[{type:'cutlass',x:360},{type:'cutlass',x:560},{type:'cutlass',x:1050,y:282},
    {type:'brute',x:1810},{type:'bomber',x:2540,y:350},
    {type:'cutlass',x:2810},{type:'brute',x:3150},{type:'cutlass',x:3620,y:280},{type:'cutlass',x:3970}]},
 streets:{name:'Orange Town · Rooftop siege',width:4800,spawn:{x:110,y:430},floor:430,
   platforms:[{x:0,end:550,y:430,id:'entry'},
    {x:580,end:760,y:350,id:'awning-a'},{x:825,end:1030,y:272,id:'roof-a'},
    {x:1110,end:1240,y:198,id:'chimney-a'},{x:1370,end:1590,y:250,id:'roof-b'},
    {x:1690,end:1810,y:326,id:'awning-b'},{x:1910,end:2600,y:430,id:'courtyard'},
    {x:2670,end:2840,y:348,id:'bell-a'},{x:2910,end:3080,y:270,id:'bell-b'},
    {x:3190,end:3320,y:210,id:'bell-c',motion:{axis:'y',amplitude:28,period:4.2}},
    {x:3430,end:3600,y:280,id:'bell-d'},{x:3690,end:3860,y:350,id:'last-awning'},
    {x:3950,end:4800,y:430,id:'circus-approach'}],
   hazards:[{x:2050,end:2140,y:430},{x:2480,end:2540,y:430},{x:4020,end:4100,y:430}],
   checkpoints:[{id:'streets-mid',x:2290,y:430,name:'Courtyard signal station'},
    {id:'streets-b',x:4490,y:430,name:'Circus signal station'}],
   exits:[{x:60,y:430,to:'dock',label:'Return to landing'},{x:4700,y:430,to:'circus',label:'Challenge Buggy'}],
   zones:[{x:0,name:'Warehouse guard'},{x:550,name:'Awning ascent'},{x:1030,name:'Chimney run'},
    {x:1910,name:'Courtyard'},{x:2600,name:'Bell tower crossing'},{x:3950,name:'Circus barricade'}],
   enemies:[{type:'brute',x:360},{type:'cutlass',x:910,y:272},{type:'bomber',x:1490,y:250},
    {type:'cutlass',x:1740,y:326},{type:'brute',x:2020},
    {type:'cutlass',x:2510},{type:'cutlass',x:2980,y:270},{type:'bomber',x:3510,y:280},
    {type:'brute',x:4200},{type:'cutlass',x:4320}]},
 circus:{name:'Buggy’s circus',width:1160,spawn:{x:110,y:430},floor:430,
   platforms:[{x:0,end:1160,y:430,id:'arena'}],checkpoints:[],
   exits:[{x:95,y:430,to:'streets',label:'Leave circus'},{x:1055,y:430,to:'sunny',label:'Return victorious'}],enemies:[]}
};
const TYPES={cutlass:{hp:5,speed:155,range:132,wind:.36,recover:.42,damage:1,jump:490},brute:{hp:8,speed:112,range:146,wind:.6,recover:.66,damage:2,jump:480},bomber:{hp:4,speed:85,range:335,wind:.65,recover:.85,damage:1,jump:0}};

// One tier per captain victory. Damage scales every attack, ordinary and special alike.
const LEVELS=[{damage:1,maxHp:5},{damage:1.5,maxHp:6},{damage:2,maxHp:7}];
const METER={max:300,bar:100,perHit:20};
const SPECIALS={
 jetstamp:{name:'Gum-Gum Jet Stamp',cost:0,duration:.72,startup:.25,pulses:1,interval:0,reach:200,radius:35,damage:12},
 bazooka:{name:'Gum-Gum Bazooka',cost:200,duration:1.12,startup:.62,pulses:1,interval:0,reach:210,radius:35,damage:12},
 gatling:{name:'Gum-Gum Gatling',cost:300,duration:1.8,startup:.18,pulses:18,interval:.085,reach:165,radius:30,damage:1}
};
function validSave(raw) {
 if(!raw||raw.version!==1||!STAGES[raw.checkpoint?.stage])return null;
 const cp=STAGES[raw.checkpoint.stage].checkpoints.find(x=>x.id===raw.checkpoint.id);
 if(!cp)return null;
 const bag=raw.satchel;
 const satchel=bag&&STAGES[bag.stage]&&Number.isFinite(bag.x)&&Number.isFinite(bag.y)&&bag.x>=0&&bag.x<=STAGES[bag.stage].width&&bag.y>=0&&bag.y<=STAGES[bag.stage].floor?{stage:bag.stage,x:bag.x,y:bag.y,amount:clamp(Math.floor(Number(bag.amount)||0),0,9999)}:null;
 if(satchel){
  const level=STAGES[satchel.stage];
  const candidates=level.platforms.filter(f=>!f.motion).map(f=>{let x=clamp(satchel.x,f.x+24,f.end-24);for(const h of level.hazards||[])if(h.y===f.y&&x>h.x-20&&x<h.end+20)x=clamp(h.x-25,f.x+24,f.end-24);return {x,y:f.y,cost:Math.abs(x-satchel.x)+Math.abs(f.y-satchel.y)};}).sort((a,b)=>a.cost-b.cost);
  if(candidates.length){satchel.x=candidates[0].x;satchel.y=candidates[0].y;}
 }
 const visited=Array.isArray(raw.visited)?raw.visited.filter(v=>STAGES[v.stage]?.checkpoints.some(c=>c.id===v.id)):[];
 if(!visited.some(v=>v.stage===raw.checkpoint.stage&&v.id===cp.id))visited.push({stage:raw.checkpoint.stage,id:cp.id});
 if(!visited.some(v=>v.stage==='sunny'))visited.unshift({stage:'sunny',id:'sunny'});
 return {version:1,visited,kuroDefeated:raw.kuroDefeated===true,satchel,checkpoint:{stage:raw.checkpoint.stage,id:cp.id},berries:clamp(Math.floor(Number(raw.berries)||0),0,9999),buggyDefeated:raw.buggyDefeated===true};
}
function lineDistance(px,py,ax,ay,bx,by) {
 const dx=bx-ax,dy=by-ay,t=clamp(((px-ax)*dx+(py-ay)*dy)/(dx*dx+dy*dy||1),0,1);
 return Math.hypot(px-ax-t*dx,py-ay-t*dy);
}
function segmentBox(ax,ay,bx,by,r){
 let enter=0,exit=1;
 for(const [start,delta,min,max] of [[ax,bx-ax,r.x,r.x+r.w],[ay,by-ay,r.y,r.y+r.h]]){
  if(Math.abs(delta)<1e-9){if(start<min||start>max)return null;continue;}
  const a=(min-start)/delta,b=(max-start)/delta;enter=Math.max(enter,Math.min(a,b));exit=Math.min(exit,Math.max(a,b));if(enter>exit)return null;
 }return enter;
}
class Game {
 constructor(save) {
  const data=validSave(save);this.time=0;this.events=[];this.checkpoint=data?.checkpoint||{stage:'sunny',id:'sunny'};
  this.berries=data?.berries||0;this.buggyDefeated=data?.buggyDefeated||false;
  this.kuroDefeated=data?.kuroDefeated||false;this.applyLevel();this.hp=this.maxHp;
  this.visited=data?.visited||[{stage:'sunny',id:'sunny'}];this.heals=3;this.healTime=0;this.resting=false;this.meter=0;this.deaths=0;this.satchel=data?.satchel||null;this.projectiles=[];this.effects=[];this.attackSerial=0;
  this.message='The crew is ready. Find the gangway on the lower deck.';this.messageTime=6;this.dead=0;this.victoryTime=0;
  this.rng=1234567;this.loadStage(this.checkpoint.stage);this.placeAtCheckpoint();
 }
 // Level is derived from the permanent victory flags rather than stored, so saves need no new field.
 applyLevel(){const tier=LEVELS[Math.min(LEVELS.length-1,(this.buggyDefeated?1:0)+(this.kuroDefeated?1:0))];
  this.level=LEVELS.indexOf(tier)+1;this.damage=tier.damage;this.maxHp=tier.maxHp;}
 levelUp(){const before=this.maxHp;this.applyLevel();this.hp+=Math.max(0,this.maxHp-before);}
 emit(type,data={}){this.events.push({type,...data});}
 say(text,seconds=3){this.message=text;this.messageTime=seconds;}
 save(){return {version:1,visited:this.visited.map(v=>({...v})),kuroDefeated:this.kuroDefeated,satchel:this.satchel?{...this.satchel}:null,checkpoint:{...this.checkpoint},berries:this.berries,buggyDefeated:this.buggyDefeated};}
 requestSave(){this.emit('save',{data:this.save()});}
 loadStage(stage,back=false) {
  this.stage=stage;this.world=STAGES[stage];this.projectiles=[];this.effects=[];this.boss=null;this.bossStarted=false;
  this.enemies=this.world.enemies.map((e,i)=>({...e,id:stage+'-'+i,y:e.y||430,home:e.x,vx:0,vy:0,grounded:true,platform:'',drop:0,aggro:0,navTimer:0,combo:0,hp:e.hp||Math.round(TYPES[e.type].hp*(this.world.enemyHp||1)),maxHp:e.hp||Math.round(TYPES[e.type].hp*(this.world.enemyHp||1)),state:'idle',timer:.3+i*.2,facing:-1,hit:0,attackCount:0}));
  const spawn=this.world.spawn;this.player={x:back?this.world.width-150:spawn.x,y:spawn.y,vx:0,vy:0,w:22,h:45,grounded:true,facing:1,gear:0,gearIntro:0,gearDuration:0,gearFade:0,dashMax:.65,coyote:.1,jumpBuffer:0,dash:0,dashCd:0,airDash:true,invuln:.6,attack:null,special:null,attackCd:0,drop:0,stairs:false,platform:'',lastSafe:{x:spawn.x,y:spawn.y}};
  if(stage==='sunny')this.player.x=back?1240:400;
  if(stage==='circus'&&!this.buggyDefeated)this.spawnBoss();
  if(stage==='mansion'&&!this.kuroDefeated)this.spawnBoss();
  this.emit('stage',{stage});
 }
 spawnBoss(){this.boss={x:880,y:430,hp:84,maxHp:84,state:'idle',timer:.65,phase:1,cycle:0,facing:-1,hit:0,attack:'knives',vx:0,vy:0,bag:[],previous:'',followup:false};if(this.stage==='mansion')Object.assign(this.boss,{kind:'kuro',hp:120,maxHp:120});
 }
 placeAtCheckpoint(){const cp=this.world.checkpoints.find(c=>c.id===this.checkpoint.id);if(cp){this.player.x=cp.x-45;this.player.y=cp.y;this.player.lastSafe={x:this.player.x,y:cp.y};}}
 transition(to){if((to==='syrup'||to==='mansion')&&!this.buggyDefeated){this.say('Defeat Buggy to unlock Syrup Village.');return;}const order=['sunny','dock','streets','circus','syrup','mansion'];const back=order.indexOf(to)<order.indexOf(this.stage);this.loadStage(to,back);this.say(to==='circus'?'Buggy: “You picked the wrong circus!”':this.world.name,3);}
 context(){
  const p=this.player;if(this.dead)return null;
  if(((this.stage==='circus'&&this.buggyDefeated)||(this.stage==='mansion'&&this.kuroDefeated))&&(!this.boss||this.boss.state==='defeated')&&Math.hypot(p.x-880,p.y-430)<65)return {kind:'rematch',x:880,y:430,label:this.stage==='mansion'?'Challenge Kuro again':'Challenge Buggy again'};
  if(this.satchel?.stage===this.stage&&Math.hypot(p.x-this.satchel.x,p.y-this.satchel.y)<56)return {kind:'satchel',label:'Recover '+this.satchel.amount+' berries',...this.satchel};
  for(const cp of this.world.checkpoints)if(Math.hypot(p.x-cp.x,p.y-cp.y)<62)return {kind:'checkpoint',label:'Press E to rest',...cp};
  for(const e of this.world.exits)if(Math.hypot(p.x-e.x,p.y-e.y)<65){
   if(e.requiresBuggy&&!this.buggyDefeated)continue;
   if((this.stage==='circus'||this.stage==='mansion')&&this.boss&&this.boss.state!=='defeated')continue;
   return {kind:'exit',...e};
  }
  return null;
 }
 interact(){if(this.player.gearIntro||this.player.special||this.healTime||this.resting)return;const c=this.context();if(!c)return;
  if(c.kind==='rematch'){this.spawnBoss();this.projectiles=[];this.victoryTime=0;this.bossStarted=false;this.player.x=300;this.say(this.stage==='mansion'?'Kuro: You should have stayed away.':'Buggy: Back for another round?',3);return;}
  if(c.kind==='checkpoint'){
   if(this.enemies.some(e=>e.hp>0&&Math.hypot(e.x-this.player.x,e.y-this.player.y)<185)){this.say('Defeat the nearby pirate before resting.');return;}
   this.checkpoint={stage:this.stage,id:c.id};if(!this.visited.some(v=>v.stage===this.stage&&v.id===c.id))this.visited.push({...this.checkpoint});this.heals=3;this.hp=this.maxHp;this.projectiles=[];
   const x=this.player.x,y=this.player.y;this.loadStage(this.stage);this.player.x=x;this.player.y=y;this.player.lastSafe={x,y};
   this.resting=true;this.requestSave();this.say('Saved at '+c.name+'. Health restored; pirates return.',4);this.emit('rest');
  }else if(c.kind==='exit')this.transition(c.to);
  else if(c.kind==='satchel'){this.berries+=this.satchel.amount;this.satchel=null;this.requestSave();this.say('Lost berries recovered.');}
 }
 closeRest(){this.resting=false;this.player.invuln=.8;}
 travel(stage,id){if(!this.resting||!this.visited.some(v=>v.stage===stage&&v.id===id)||!STAGES[stage]?.checkpoints.some(c=>c.id===id))return false;
  this.checkpoint={stage,id};this.loadStage(stage);this.placeAtCheckpoint();this.say('Resting at '+STAGES[stage].checkpoints.find(c=>c.id===id).name,3);this.hp=this.maxHp;this.heals=3;this.requestSave();return true;
 }
 heal(){const p=this.player;if(p.gearIntro||this.dead||this.resting||this.healTime||this.hp>=this.maxHp||this.heals<=0||p.special||p.attack||p.dash||!p.grounded||p.stairs)return false;this.heals--;this.healTime=.65;return true;}
 hurt(amount,fromX){const p=this.player;if(this.resting||this.dead||p.invuln>0||p.dash>0)return false;
  if(p.gearIntro){p.gearIntro=0;p.gearDuration=0;}this.healTime=0;this.hp=Math.max(0,this.hp-amount);p.invuln=1;if(!p.special){p.vx=(p.x<fromX?-1:1)*190;p.vy=-120;p.grounded=false;}p.stairs=false;this.emit('hurt');
  if(!this.hp)this.die();return true;
 }
 die(){if(this.dead)return;this.player.gear=0;this.player.gearIntro=0;this.player.gearFade=0;this.meter=0;this.player.special=null;this.player.attack=null;this.dead=1.6;this.deaths++;this.satchel={stage:this.stage,...this.player.lastSafe,amount:this.berries};this.berries=0;this.projectiles=[];this.requestSave();this.emit('death');this.say('Your voyage isn’t over.',2);}
 respawn(){this.resting=false;this.healTime=0;this.heals=3;this.meter=0;this.hp=this.maxHp;this.dead=0;this.loadStage(this.checkpoint.stage);this.placeAtCheckpoint();this.say('Back at the last signal station. Recover your berries.',4);}
 startGear(){const p=this.player;if(!this.kuroDefeated){this.say('Defeat Kuro to unlock Gear 2.',2);return false;}
  if(this.dead||this.resting||this.healTime||p.gear||p.gearIntro||p.special||p.attack||p.dash||!p.grounded||p.stairs)return false;
  const bars=Math.floor(this.meter/100);if(!bars){this.say('Gear 2 needs at least one full bar.',2);return false;}
  this.meter=0;p.gearDuration=[0,3,7,13][bars];p.gearIntro=.6;p.vx=0;p.vy=0;p.jumpBuffer=0;this.emit('gear-start');return true;
 }
 endGear(reason='timeout'){const p=this.player;if(!p.gear)return;p.gear=0;p.gearFade=.65;this.emit('gear-end',{reason});}
 jetStamp(aim){const p=this.player;if(!p.gear||this.dead||this.resting||p.special||p.dash||this.healTime)return false;
  const dx=aim.x-p.x,dy=aim.y-(p.y-26),len=Math.hypot(dx,dy)||1;p.facing=dx<0?-1:1;p.attack=null;this.endGear('stamp');
  p.vx=0;p.jumpBuffer=0;p.special={kind:'jetstamp',t:0,pulse:0,dx:dx/len,dy:dy/len};this.say('Gum-Gum Jet Stamp',1.5);this.emit('special-start',{kind:'jetstamp'});return true;
 }
 startAttack(aim){const p=this.player;if(p.gearIntro||this.healTime||p.special||p.attackCd>0||p.dash>0||this.dead)return false;
  const dx=aim.x-p.x,dy=aim.y-(p.y-26),len=Math.hypot(dx,dy)||1;
  p.facing=dx<0?-1:1;p.attack={id:++this.attackSerial,t:0,dx:dx/len,dy:dy/len,speed:p.gear?2:1,hit:new Set()};p.attackCd=p.gear?.165:.33;this.emit('punch');return true;
 }
 gainMeter(){const before=this.meter;this.meter=Math.min(METER.max,this.meter+METER.perHit);if(Math.floor(before/100)<Math.floor(this.meter/100))this.emit('meter-bar',{bars:Math.floor(this.meter/100)});}
 startSpecial(kind,aim){const p=this.player,spec=SPECIALS[kind];
  if(kind==='jetstamp'||p.gearIntro||!spec||this.dead||this.healTime||p.special)return false;
  if(kind==='gatling'&&!this.buggyDefeated){this.say('Defeat Buggy to unlock Gum-Gum Gatling.',2);return false;}
  if(this.meter<spec.cost){this.say('Need '+spec.cost/100+' full bars.',1.4);return false;}
  if(!p.grounded||p.stairs){this.say('Land before using '+spec.name+'.',1.5);return false;}
  if(p.attack||p.attackCd>0||p.dash>0){this.say('Finish your current attack first.',1.2);return false;}
  const dx=aim.x-p.x,dy=aim.y-(p.y-26),length=Math.hypot(dx,dy);
  this.meter-=spec.cost;p.facing=length>1?(dx<0?-1:1):p.facing;
  p.special={kind,t:0,pulse:0,dx:length>1?dx/length:p.facing,dy:length>1?dy/length:0};
  p.vx=0;p.vy=0;p.jumpBuffer=0;this.say(spec.name,1.5);this.emit('special-start',{kind});return true;
 }
 updateSpecial(dt){const p=this.player,a=p.special;if(!a)return;const spec=SPECIALS[a.kind];a.t+=dt;
  while(a.pulse<spec.pulses&&a.t+1e-9>=spec.startup+a.pulse*spec.interval){
   a.pulse++;this.emit('special-pulse',{kind:a.kind,index:a.pulse});
   const x=p.x,y=p.y-26;
   for(const e of [...this.enemies,...(this.boss?[this.boss]:[])]){
    if(e.hp<=0||(e===this.boss&&e.state==='split'))continue;
    if(lineDistance(e.x,e.y-(e===this.boss?34:24),x,y,x+a.dx*spec.reach,y+a.dy*spec.reach)<spec.radius){
     // Specials never feed the meter. Each burst hits a target at most once.
     this.damageEnemy(e,spec.damage*this.damage,a.dx);
    }
   }
  }
  if(a.t+1e-9>=spec.duration){p.special=null;p.attackCd=.12;this.emit('special-end',{kind:a.kind});}
 }
 damageEnemy(e,amount,dx){e.hp=Math.max(0,e.hp-amount);e.hit=.16;this.effects.push({x:e.x,y:e.y-25,t:.22,kind:'hit'});this.emit('hit');
  if(e===this.boss){if(e.hp===0)this.win();}
  else {e.vx+=dx*70;if(!e.hp){this.berries+=e.type==='brute'?8:5;this.emit('coin');}}
 }
 win(){if(!this.boss||this.boss.state==='defeated')return;if(this.boss.kind==='kuro'){const first=!this.kuroDefeated;this.kuroDefeated=true;if(first)this.levelUp();if(first)this.berries+=100;this.projectiles=[];this.bossStarted=false;this.boss.state='defeated';this.victoryTime=5;this.say(first?'KURO DEFEATED · LEVEL 3 · Gear 2 unlocked · +1 health · +100 berries':'KURO DEFEATED · Rematch won!',6);this.requestSave();this.emit('victory');return;}const firstWin=!this.buggyDefeated;this.buggyDefeated=true;if(firstWin)this.levelUp();if(firstWin)this.berries+=50;this.projectiles=[];this.bossStarted=false;this.victoryTime=5;
  this.boss.state='defeated';this.boss.y=this.world.floor;this.boss.vy=0;this.say(firstWin?'BUGGY DEFEATED · LEVEL 2 · Gatling unlocked · +1 health · +50 berries':'BUGGY DEFEATED · Rematch won!',7);this.requestSave();this.emit('victory');}
 step(dt,input={}){
  if(this.resting)return;
  dt=clamp(dt,0,1/30);this.time+=dt;this.messageTime=Math.max(0,this.messageTime-dt);this.victoryTime=Math.max(0,this.victoryTime-dt);
  this.effects=this.effects.filter(e=>(e.t-=dt)>0);
  if(this.dead){this.dead-=dt;if(this.dead<=0)this.respawn();return;}
  const p=this.player;p.gearFade=Math.max(0,(p.gearFade||0)-dt);if(p.gear>0){if(p.gear<=dt)this.endGear();else p.gear-=dt;}if(p.gearIntro>0){p.gearIntro=Math.max(0,p.gearIntro-dt);if(!p.gearIntro){p.gear=p.gearDuration;this.emit("gear-active");}}p.invuln=Math.max(0,p.invuln-dt);p.dashCd=Math.max(0,p.dashCd-dt);p.attackCd=Math.max(0,p.attackCd-dt);p.drop=Math.max(0,p.drop-dt);
  if(input.interact)this.interact();
  if(this.player!==p||this.resting)return;
  if(input.gear)this.startGear();
  if(input.jet)this.jetStamp(input.aim||{x:p.x+p.facing*200,y:p.y-26});
  if(input.heal&&!p.gearIntro)this.heal();
  if(this.healTime>0){this.healTime=Math.max(0,this.healTime-dt);if(!this.healTime){this.hp=Math.min(this.maxHp,this.hp+1);this.emit("heal");}}
  const aim=input.aim||{x:p.x+p.facing*150,y:p.y-26};
  if(input.gatling)this.startSpecial('gatling',aim);else if(input.bazooka)this.startSpecial('bazooka',aim);
  if(p.special&&input.dash&&p.dashCd===0&&p.airDash){p.special=null;this.emit('special-cancel');}
  const casting=!!p.special||this.healTime>0||p.gearIntro>0;
  const move=casting?0:(input.right?1:0)-(input.left?1:0);
  const nearStair=this.stage==='sunny'&&Math.abs(p.x-SHIP.stairX)<38&&p.y>=SHIP.upper-3&&p.y<=SHIP.lower+3;
  if(!casting&&nearStair&&((input.up&&p.y>SHIP.upper)||(input.down&&p.y<SHIP.lower))){p.stairs=true;p.attack=null;}
  if(p.stairs){
   p.x=SHIP.stairX;p.vx=0;p.vy=0;p.y=clamp(p.y+((input.down?1:0)-(input.up?1:0))*135*dt,SHIP.upper,SHIP.lower);p.grounded=true;
   if(p.y===SHIP.upper||p.y===SHIP.lower){p.stairs=false;p.grounded=true;}
  }else{
   if(input.jump&&!casting)p.jumpBuffer=.12;else p.jumpBuffer=Math.max(0,p.jumpBuffer-dt);
   p.coyote=p.grounded?.1:Math.max(0,p.coyote-dt);
   if(input.drop&&!casting&&p.grounded&&p.platform!=='lower'&&p.y<this.world.floor-5){p.drop=.23;p.grounded=false;p.y+=3;}
   if(p.jumpBuffer>0&&p.coyote>0&&p.drop===0){p.vy=-465;p.grounded=false;p.coyote=0;p.jumpBuffer=0;this.emit('jump');}
   if(!input.up&&p.vy<-160)p.vy+=1350*dt;
   if(input.dash&&!p.gearIntro&&!this.healTime&&p.dashCd===0&&p.airDash){p.dash=.16;p.dashMax=p.gear?.325:.65;p.dashCd=p.dashMax;p.airDash=false;p.vy=0;p.attack=null;p.facing=move||p.facing;this.emit('dash');}
   if(p.dash>0){p.dash=Math.max(0,p.dash-dt);p.vx=p.facing*650;p.vy=0;}
   else {const target=move*205;p.vx+=(target-p.vx)*Math.min(1,dt*(p.grounded?22:12));p.vy=Math.min(680,p.vy+1000*dt);if(move)p.facing=move;}
   if(p.grounded){const f=this.platforms().find(f=>f.id===p.platform);if(f?.motion){const before=this.platforms(this.time-dt).find(q=>q.id===f.id);p.x+=f.x-before.x;p.y+=f.y-before.y;}}
   const previousY=p.y;p.x+=p.vx*dt;p.y+=p.vy*dt;p.grounded=false;
   const minX=this.stage==='sunny'?SHIP.left+12:this.bossStarted?45:18;
   const maxX=this.stage==='sunny'?SHIP.right-12:this.bossStarted?this.world.width-45:this.world.width-18;
   p.x=clamp(p.x,minX,maxX);
   if(p.vy>=0&&p.drop===0)for(const f of this.platforms()){
    if(p.x>=f.x&&p.x<=f.end&&previousY<=f.y+2&&p.y>=f.y){p.y=f.y;p.vy=0;p.grounded=true;p.platform=f.id;p.airDash=true;break;}
   }
   if(p.grounded){const safe=this.platforms().find(f=>f.id===p.platform);if(safe&&!safe.motion&&p.x>safe.x+18&&p.x<safe.end-18&&!this.world.hazards?.some(h=>p.x>h.x-20&&p.x<h.end+20&&Math.abs(p.y-h.y)<10))p.lastSafe={x:p.x,y:p.y};}
   for(const h of this.world.hazards||[])if(p.x>h.x-7&&p.x<h.end+7&&p.y>h.y-13&&p.y<h.y+15)this.hurt(1,(h.x+h.end)/2);
   if(p.y>this.world.floor+170){p.invuln=0;this.hurt(1,p.x);if(!this.dead){p.x=p.lastSafe.x;p.y=p.lastSafe.y;p.vx=0;p.vy=0;}}
  }
  if(input.attack||(input.attackHeld&&p.gear>0))this.startAttack(input.aim||{x:p.x+p.facing*150,y:p.y-26});
  if(p.attack){const a=p.attack;a.t+=dt*(a.speed||1);if(a.t>=.07&&a.t<=.19){
   const ox=p.x,oy=p.y-26;
   for(const e of [...this.enemies,...(this.boss?[this.boss]:[])])if(e.hp>0&&!a.hit.has(e)&&lineDistance(e.x,e.y-(e===this.boss?34:24),ox,oy,ox+a.dx*116,oy+a.dy*116)<(e===this.boss?33:26)){
    if(e===this.boss&&e.state==='split')continue;
    a.hit.add(e);this.damageEnemy(e,this.damage,a.dx);this.gainMeter();
   }
  }if(a.t>.25)p.attack=null;}
  if(this.dead)return;
  this.updateSpecial(dt);
  for(const e of this.enemies)this.updateEnemy(e,dt);
  this.updateBoss(dt);this.updateProjectiles(dt);
 }
 platforms(time=this.time){return this.world.platforms.map(f=>{const offset=f.motion?Math.sin(time*Math.PI*2/f.motion.period)*f.motion.amplitude:0;return {...f,x:f.x+(f.motion?.axis==='x'?offset:0),end:f.end+(f.motion?.axis==='x'?offset:0),y:f.y+(f.motion?.axis==='y'?offset:0)};}).sort((a,b)=>a.y-b.y);}
 support(x,y){return this.platforms().filter(f=>x>=f.x-8&&x<=f.end+8&&f.y>=y-8).sort((a,b)=>a.y-b.y)[0];}
 route(from,to){
  if(!from||!to||from.id===to.id)return null;
  const platforms=this.platforms(),queue=[[from]],seen=new Set([from.id]);
  while(queue.length){const path=queue.shift(),a=path[path.length-1];
   for(const b of platforms){if(seen.has(b.id))continue;const gap=Math.max(0,b.x-a.end,a.x-b.end);
    if(b.y<a.y-112||b.y>a.y+310||gap>195)continue;
    const next=[...path,b];if(b.id===to.id)return next[1];seen.add(b.id);queue.push(next);
   }
  }return null;
 }
 updateEnemy(e,dt){if(e.hp<=0)return;e.hit=Math.max(0,e.hit-dt);e.timer-=dt;e.drop=Math.max(0,e.drop-dt);e.navTimer-=dt;
  const p=this.player,cfg=TYPES[e.type];let dx=p.x-e.x,dy=p.y-e.y;
  if(Math.abs(dx)<510&&Math.abs(dy)<300)e.aggro=7;else e.aggro=Math.max(0,e.aggro-dt);
  const floor=this.support(e.x,e.y),targetFloor=this.support(p.x,p.y);
  if(e.navTimer<=0){e.nextPlatform=this.route(floor,targetFloor)?.id;e.navTimer=.25;}
  const next=this.platforms().find(f=>f.id===e.nextPlatform);
  let direction=0;
  if(e.state==='idle'&&e.aggro>0){
   e.facing=dx<0?-1:1;
   if(Math.abs(dx)<cfg.range&&Math.abs(dy)<(e.type==='bomber'?230:65)&&e.timer<=0){
    e.state='wind';e.timer=cfg.wind;e.aim={x:p.x+p.vx*.25,y:p.y-20};e.combo=0;
   }else if(e.type==='bomber'){
    if(Math.abs(dx)<125)direction=-Math.sign(dx);
    if(!floor||e.x+direction*25<floor.x||e.x+direction*25>floor.end)direction=0;
   }else{
    const targetX=next?clamp(p.x,next.x+25,next.end-25):p.x;
    direction=Math.abs(targetX-e.x)>12?Math.sign(targetX-e.x):0;
    const jumpUp=next&&next.y<e.y-25&&e.x>next.x-135&&e.x<next.end+135;
    const edge=floor&&(direction>0?floor.end-e.x<42:e.x-floor.x<42);
    const followJump=p.y<e.y-40&&Math.abs(dx)<150&&!next;
    if(e.grounded&&cfg.jump&&(jumpUp||(next&&edge)||followJump)){e.vy=-cfg.jump;e.grounded=false;}
    if(e.grounded&&targetFloor&&targetFloor.y>e.y+40&&Math.abs(dx)<65){e.drop=.28;e.y+=4;e.grounded=false;}
    if(e.grounded&&edge&&!next&&targetFloor?.id!==floor?.id)direction=0;
   }
  }else if(e.state==='wind'&&e.timer<=0){
   e.state='active';e.timer=e.type==='brute'?.27:.23;e.attackCount++;
   if(e.type==='bomber'){if(this.stage==='syrup'){const a=Math.atan2(e.aim.y-(e.y-40),e.aim.x-e.x);this.projectiles.push({kind:'knife',x:e.x,y:e.y-40,vx:Math.cos(a)*320,vy:Math.sin(a)*320,t:2.5,damage:1});}else this.bomb(e.x,e.y-48,e.aim,1);}
  }else if(e.state==='active'){
   if(e.type!=='bomber'){
    direction=e.facing;
    if(Math.abs(dx)<(e.type==='brute'?94:78)&&Math.abs(dy)<65&&Math.sign(dx)===e.facing)this.hurt(cfg.damage,e.x);
   }
   if(e.timer<=0){
    if(e.type==='cutlass'&&e.combo===0&&Math.abs(dx)<145&&Math.abs(dy)<70){e.combo=1;e.state='wind';e.timer=.26;e.facing=dx<0?-1:1;}
    else{e.state='recover';e.timer=cfg.recover;}
   }
  }else if(e.state==='recover'&&e.timer<=0){e.state='idle';e.timer=.08;}
  const speed=e.state==='active'?(e.type==='brute'?230:310):e.grounded?cfg.speed:215;
  e.vx+=(direction*speed-e.vx)*Math.min(1,dt*16);
  if(e.grounded&&floor?.motion){const previous=this.platforms(this.time-dt).find(f=>f.id===floor.id);e.x+=floor.x-previous.x;e.y+=floor.y-previous.y;}
  const oldY=e.y;e.x=clamp(e.x+e.vx*dt,18,this.world.width-18);e.vy=Math.min(680,e.vy+1000*dt);e.y+=e.vy*dt;e.grounded=false;
  if(e.vy>=0&&e.drop===0)for(const f of this.platforms())if(e.x>=f.x&&e.x<=f.end&&oldY<=f.y+3&&e.y>=f.y){e.y=f.y;e.vy=0;e.grounded=true;e.platform=f.id;break;}
  if(e.y>this.world.floor+180)this.damageEnemy(e,e.hp,0);
 }
 bomb(x,y,aim,damage){const flight=.72;this.projectiles.push({kind:'bomb',x,y,vx:(aim.x-x)/flight,vy:(aim.y-y-400*flight*flight)/flight,t:4,damage});}
 random(){this.rng=(Math.imul(this.rng,1664525)+1013904223)>>>0;return this.rng/4294967296;}
 chooseBossAttack(b){
  if(!b.bag.length){b.bag=b.phase===1?['knives','lunge','hand','bombs','dive']:['knives','lunge','hand','bombs','dive','crossfire'];
   for(let i=b.bag.length-1;i>0;i--){const j=Math.floor(this.random()*(i+1));[b.bag[i],b.bag[j]]=[b.bag[j],b.bag[i]];}
  }
  if(b.bag[b.bag.length-1]===b.previous&&b.bag.length>1)[b.bag[0],b.bag[b.bag.length-1]]=[b.bag[b.bag.length-1],b.bag[0]];
  b.previous=b.bag.pop();return b.previous;
 }
 knives(b,count=3,offset=0){const angle=Math.atan2(b.aim.y-(b.y-45),b.aim.x-b.x)+offset;for(let i=0;i<count;i++){const a=angle+(i-(count-1)/2)*.19;this.projectiles.push({kind:'knife',x:b.x,y:b.y-45,vx:Math.cos(a)*330,vy:Math.sin(a)*330,t:2.5,damage:1});}}
 updateBoss(dt){if(this.boss?.kind==='kuro'){ChapterTwo.updateKuro(this,dt);return;}const b=this.boss,p=this.player;if(!b||b.hp<=0)return;b.hit=Math.max(0,b.hit-dt);
  if(!this.bossStarted){if(p.x>235){this.bossStarted=true;this.say('Buggy the Clown',2);}else return;}
  b.timer-=dt;
  if(b.hp<=b.maxHp*.5&&b.phase===1){b.phase=2;b.state='split';b.timer=.85;b.bag=[];b.y=430;b.vy=0;this.projectiles=[];this.say('Chop-Chop Festival!',2);}
  if(b.state==='split'){if(b.timer<=0){b.x=clamp(p.x+(p.x<580?190:-190),110,1050);b.state='idle';b.timer=.25;}return;}
  if(b.state==='idle'){
   b.facing=p.x<b.x?-1:1;
   if(Math.abs(p.x-b.x)>130)b.x=clamp(b.x+b.facing*135*dt,90,this.world.width-90);
   if(b.timer<=0){b.attack=this.chooseBossAttack(b);b.state='wind';b.timer=(b.attack==='dive'?.72:b.attack==='lunge'?.55:.62)*(b.phase===2?.86:1);b.aim={x:clamp(p.x+p.vx*.25,80,1080),y:p.y-24};b.followup=false;b.burst=false;}
  }else if(b.state==='wind'&&b.timer<=0){
   b.state='active';b.timer=b.attack==='lunge'?.33:b.attack==='dive'?1.3:b.attack==='crossfire'?.48:.2;
   if(b.attack==='lunge')b.vx=b.facing*620;
   if(b.attack==='knives'||b.attack==='crossfire')this.knives(b,b.phase===2?5:3);
   if(b.attack==='hand')this.projectiles.push({kind:'hand',x:b.x,y:b.y-25,vx:b.facing*340,vy:0,t:2.15,returnAt:1.45,damage:1});
   if(b.attack==='bombs'){for(const offset of b.phase===2?[-85,0,85]:[-55,55])this.bomb(b.x,b.y-70,{x:clamp(b.aim.x+offset,50,1110),y:420},1);}
   if(b.attack==='dive'){b.vy=-500;b.vx=(b.aim.x-b.x)/1.1;}
  }else if(b.state==='active'){
   if(b.attack==='lunge'){b.x=clamp(b.x+b.vx*dt,70,this.world.width-70);if(Math.abs(b.x-p.x)<48&&Math.abs(b.y-p.y)<55)this.hurt(1,b.x);}
   if(b.attack==='dive'){
    b.vy+=950*dt;b.y+=b.vy*dt;b.x=clamp(b.x+b.vx*dt,70,1090);
    if(Math.hypot(b.x-p.x,b.y-p.y)<48)this.hurt(1,b.x);
    if(b.y>=430&&b.vy>0){b.y=430;b.vy=0;b.timer=0;this.projectiles.push({kind:'blast',x:b.x,y:430,t:.25,radius:75,damage:1});this.emit('boom');}
   }
   if(b.attack==='crossfire'&&!b.burst&&b.timer<.25){b.burst=true;this.knives(b,4,.095);}
   if(b.timer<=0){
    if(b.attack==='lunge'&&b.phase===2&&!b.followup){b.followup=true;b.state='wind';b.timer=.32;b.facing=p.x<b.x?-1:1;}
    else {b.state='recover';b.timer=b.attack==='dive'?.68:b.phase===2?.36:.52;}
   }
  }else if(b.state==='recover'&&b.timer<=0){b.state='idle';b.timer=b.phase===2?.12:.2;}
 }
 updateProjectiles(dt){const p=this.player;
  for(const q of this.projectiles){q.t-=dt;
   const oldX=q.x,oldY=q.y;
   if(q.kind==='bomb'){
    q.vy+=800*dt;q.x+=q.vx*dt;q.y+=q.vy*dt;
    let contact=null;
    const hit=(box)=>{const t=segmentBox(oldX,oldY,q.x,q.y,box);if(t!==null&&(contact===null||t<contact))contact=t;};
    for(const f of this.platforms())hit({x:f.x-9,y:f.y-9,w:f.end-f.x+18,h:(f.y===this.world.floor?260:15)+18});
    hit({x:p.x-p.w/2-9,y:p.y-p.h-9,w:p.w+18,h:p.h+18});
    if(contact!==null){q.x=oldX+(q.x-oldX)*contact;q.y=oldY+(q.y-oldY)*contact;q.kind='blast';q.t=.24;q.radius=57;this.emit('boom');}
   }else if(q.kind!=='blast'){
    if(q.kind==='hand'&&q.returnAt&&q.t<q.returnAt){q.vx=-q.vx;q.returnAt=0;}
    q.x+=q.vx*dt;q.y+=q.vy*dt;
   }
   if(q.kind==='blast'){if(Math.hypot(p.x-q.x,p.y-20-q.y)<q.radius+12)this.hurt(q.damage,q.x);}
   else if(q.kind!=='bomb'&&lineDistance(p.x,p.y-24,oldX,oldY,q.x,q.y)<(q.kind==='hand'?27:18)){if(this.hurt(q.damage,q.x))q.t=0;}
  }
  this.projectiles=this.projectiles.filter(q=>q.t>0&&q.x>-100&&q.x<this.world.width+100&&q.y<this.world.floor+350);
 }

}
const api={Game,STAGES,SHIP,TYPES,LEVELS,METER,SPECIALS,validSave,lineDistance,segmentBox,clamp};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.PirateGame=api;
})(typeof window!=='undefined'?window:globalThis);
