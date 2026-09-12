const assert=require('node:assert/strict');
const {Game,SHIP,TYPES,LEVELS,METER,SPECIALS,validSave,segmentBox}=require('../play/core.js');
const DT=1/120;
function advance(g,seconds,input={}){for(let i=0;i<Math.round(seconds/DT);i++)g.step(DT,typeof input==='function'?input(i):input);}
function fresh(stage='sunny'){const g=new Game();g.loadStage(stage);g.player.invuln=0;return g;}
function test(name,fn){fn();console.log('PASS '+name);}

test('Jump, one-way landing, S drop and air dash limits',()=>{
 const g=fresh('sunny'),p=g.player;p.x=400;p.y=405;p.platform='upper';
 g.step(DT,{jump:true,up:true});advance(g,.3,{up:true});assert(p.y<320);advance(g,.75,{up:true});assert.equal(p.y,405);
 g.step(DT,{drop:true});advance(g,.8);assert.equal(p.y,585);
 g.step(DT,{jump:true,up:true});g.step(DT,{dash:true,up:true});assert(!g.hurt(2,p.x+1));advance(g,.17);p.dashCd=0;g.step(DT,{dash:true});assert.equal(p.dash,0);
});
test('Sunny stairs and boundaries, without a stair tooltip',()=>{
 const g=fresh(),p=g.player;p.x=SHIP.stairX;p.y=SHIP.lower;assert.equal(g.context(),null);
 advance(g,1.5,{up:true});assert.equal(p.y,SHIP.upper);advance(g,1,{right:true});assert(p.x>1100);assert.equal(p.y,SHIP.upper);
 p.x=SHIP.stairX;advance(g,1.5,{down:true});assert.equal(p.y,SHIP.lower);advance(g,6,{right:true});assert.equal(p.x,SHIP.right-12);
});
test('Directional punch hits each target once and misses behind',()=>{
 const g=fresh('streets');g.updateEnemy=()=>{};g.enemies=g.enemies.slice(0,1);const p=g.player,e=g.enemies[0];p.x=300;e.x=380;e.y=430;e.hp=5;
 g.step(DT,{attack:true,aim:{x:600,y:404}});advance(g,.28);assert.equal(e.hp,4);
 advance(g,.1);g.step(DT,{attack:true,aim:{x:0,y:404}});advance(g,.28);assert.equal(e.hp,4);
 advance(g,.1);e.x=p.x;e.y=330;g.step(DT,{attack:true,aim:{x:p.x,y:250}});advance(g,.28);assert.equal(e.hp,3);
});
test('Melee pirates chase beyond their old leash and jump onto platforms',()=>{
 for(const type of ['cutlass','brute']){
  const g=fresh('dock');g.world={...g.world,width:1200,platforms:[{x:0,end:560,y:430,id:'ground'},{x:360,end:900,y:350,id:'roof'}],hazards:[]};
  g.enemies=g.enemies.filter(e=>e.type===type).slice(0,1);const e=g.enemies[0];Object.assign(e,{x:190,y:430,home:190,hp:TYPES[type].hp});g.player.x=680;g.player.y=350;g.player.platform='roof';g.player.invuln=20;
  let jumped=false,landed=false;for(let i=0;i<720;i++){g.step(DT);jumped ||= e.vy<0;landed ||= e.grounded&&e.platform==='roof';}
  assert(e.x>400,type+' left spawn area');assert(jumped,type+' jumped');assert(landed,type+' reached roof');
 }
});
test('Committed melee attacks retain a wind-up and damage grace',()=>{
 for(const type of ['cutlass','brute']){
  const g=fresh('dock');g.enemies=g.enemies.filter(e=>e.type===type).slice(0,1);const e=g.enemies[0];g.player.x=e.x-45;e.timer=0;
  g.step(DT);assert.equal(e.state,'wind');advance(g,TYPES[type].wind*.7);assert.equal(g.hp,5);
  advance(g,.5);assert(g.hp<5);assert(g.hp>=3);
 }
});
test('Bombs explode on player, platform top, underside and side impacts',()=>{
 const scenarios=[
  {q:{x:300,y:290,vx:0,vy:600},platform:{x:250,end:350,y:350,id:'top'}},
  {q:{x:300,y:400,vx:0,vy:-700},platform:{x:250,end:350,y:350,id:'underside'}},
  {q:{x:200,y:357,vx:1200,vy:0},platform:{x:250,end:350,y:350,id:'side'}},
  {q:{x:200,y:401,vx:1600,vy:0},platform:null}
 ];
 for(const {q,platform} of scenarios){const g=fresh('dock');g.enemies=[];g.world={...g.world,platforms:platform?[platform]:[]};g.player.x=platform?600:300;g.player.y=430;
  g.projectiles=[{kind:'bomb',...q,t:4,damage:1}];let exploded=false;for(let i=0;i<35;i++){g.updateProjectiles(DT);exploded ||= g.projectiles.some(p=>p.kind==='blast');}
  assert(exploded,platform?.id||'player');
 }
 assert.equal(segmentBox(0,0,1000,0,{x:400,y:-5,w:2,h:10}),.4,'swept hit cannot tunnel through thin geometry');
 const g=fresh('dock');g.enemies=[];g.projectiles=[{kind:'bomb',x:800,y:100,vx:0,vy:0,t:4,damage:1}];g.updateProjectiles(DT);assert.equal(g.projectiles[0].kind,'bomb');g.transition('streets');assert.equal(g.projectiles.length,0);
});
test('Moving platforms carry Luffy and spikes deal damage',()=>{
 const g=fresh('dock');g.enemies=[];const f=g.platforms().find(f=>f.motion),p=g.player;p.x=(f.x+f.end)/2;p.y=f.y;p.platform=f.id;p.grounded=true;const offset=p.x-f.x;
 advance(g,.5);const moved=g.platforms().find(q=>q.id===f.id);assert(Math.abs(p.x-moved.x-offset)<.1);assert.equal(p.y,moved.y);
 const h=g.world.hazards[0];p.x=(h.x+h.end)/2;p.y=h.y;p.invuln=0;g.step(DT);assert.equal(g.hp,4);
});
test('Longer routes and every consecutive parkour landing are reachable',()=>{
 for(const stage of ['dock','streets']){
  const source=fresh(stage);assert(source.world.width>=4200);assert(source.enemies.length>=9);
  const route=source.world.platforms;
  for(let index=0;index<route.length-1;index++)for(const phase of [0,1,2,3]){
   let reached=false;
   for(const setback of [20,45,75]){if(reached)break;
    for(const dashAt of [-1,.22,.38,.52]){const g=fresh(stage);g.enemies=[];g.world={...g.world,hazards:[]};g.time=phase;const from=g.platforms().find(f=>f.id===route[index].id),nextId=route[index+1].id,p=g.player;
     Object.assign(p,{x:from.end-setback,y:from.y,vx:205,platform:from.id,grounded:true,lastSafe:{x:from.end-setback,y:from.y}});
     for(let i=0;i<210;i++){
      const next=g.platforms().find(f=>f.id===nextId),target=(next.x+next.end)/2;
      g.step(DT,{jump:i===0,up:true,right:p.x<target-8,left:p.x>target+8,dash:dashAt>=0&&i===Math.round(dashAt/DT)});
      if(p.grounded&&p.platform===nextId){reached=true;break;}if(g.hp<5)break;
     }if(reached)break;
    }
   }
   assert(reached,`${stage}: ${route[index].id} → ${route[index+1].id}, phase ${phase}`);
  }
 }
});
test('Checkpoint IDs survive the longer maps; death and satchel saves still work',()=>{
 const g=fresh('dock');g.player.x=1580;g.hp=2;g.berries=12;g.interact();assert.equal(g.hp,5);assert.equal(g.checkpoint.id,'dock-a');assert.equal(g.context().label,'Press E to rest');
 g.closeRest();g.player.x=1670;g.player.lastSafe={x:1670,y:430};g.die();assert.equal(new Game(g.save()).satchel.amount,12);advance(g,1.7);assert.equal(g.stage,'dock');assert.equal(g.player.x,1535);
 g.player.x=1670;g.interact();assert.equal(g.berries,12);assert.equal(g.satchel,null);
 g.transition('streets');g.player.x=2290;g.interact();assert.equal(g.checkpoint.id,'streets-mid');g.closeRest();g.player.x=4490;g.interact();assert.equal(g.checkpoint.id,'streets-mid','nearby guards block rest');for(const e of g.enemies)if(Math.abs(e.x-4490)<185)e.hp=0;g.interact();assert.equal(g.checkpoint.id,'streets-b');
 const restored=new Game(g.save());assert.equal(restored.player.x,4445);assert.equal(restored.hp,5);
});
test('Buggy varies attacks without immediate repeats and accelerates phase two',()=>{
 const g=fresh('circus'),b=g.boss;g.player.x=280;g.player.invuln=999;g.bossStarted=true;
 const first=[];for(let i=0;i<10;i++)first.push(g.chooseBossAttack(b));assert.equal(new Set(first.slice(0,5)).size,5);for(let i=1;i<first.length;i++)assert.notEqual(first[i],first[i-1]);
 b.phase=2;b.bag=[];const second=Array.from({length:6},()=>g.chooseBossAttack(b));assert(second.includes('crossfire'));assert(second.includes('dive'));
 b.phase=1;b.state='idle';b.timer=0;b.bag=[];let attacks=0,previous='';for(let i=0;i<120*15;i++){g.step(DT);if(b.state==='wind'&&previous!=='wind')attacks++;previous=b.state;}
 assert(attacks>=7,'frequent attacks with readable tells');
 b.hp=b.maxHp/2;g.step(DT);assert.equal(b.state,'split');assert.equal(b.phase,2);
});
test('Returning hands, aerial landing attacks and single-grant boss victory',()=>{
 const g=fresh('circus'),b=g.boss;g.player.x=300;g.player.invuln=999;g.bossStarted=true;
 b.attack='hand';b.state='wind';b.timer=0;b.facing=-1;g.step(DT);const hand=g.projectiles.find(q=>q.kind==='hand');assert(hand);advance(g,.8);assert(hand.vx>0);
 g.projectiles=[];b.attack='dive';b.state='wind';b.timer=0;b.aim={x:500,y:406};g.step(DT);assert(b.vy<0);let landed=false;
 for(let i=0;i<150;i++){g.step(DT);landed ||= g.projectiles.some(q=>q.kind==='blast');}assert(landed);assert.equal(b.y,430);
 g.damageEnemy(b,b.hp,1);assert(g.buggyDefeated);assert.equal(g.berries,50);g.win();assert.equal(g.berries,50);assert.equal(g.projectiles.length,0);assert.equal(new Game(g.save()).damage,LEVELS[1].damage);
});
test('Ordinary punches charge three meter bars without overflowing',()=>{
 const g=fresh('dock');g.updateEnemy=()=>{};g.enemies=g.enemies.slice(0,1);const e=g.enemies[0];
 Object.assign(g.player,{x:300,y:430});Object.assign(e,{x:380,y:430,hp:999});
 for(let hit=0;hit<17;hit++){
  g.step(DT,{attack:true,aim:{x:600,y:404}});advance(g,.34);
 }
 assert.equal(METER.perHit,20);assert.equal(g.meter,METER.max);assert.equal(g.meter,300);
});
test('Bazooka spends two bars, locks its aim and delivers one heavy hit',()=>{
 const g=fresh('dock');g.updateEnemy=()=>{};g.enemies=g.enemies.slice(0,1);const e=g.enemies[0];
 Object.assign(g.player,{x:300,y:430});Object.assign(e,{x:470,y:430,hp:100});g.meter=300;
 assert(g.startSpecial('bazooka',{x:600,y:404}));assert.equal(g.meter,100);assert.equal(g.player.special.kind,'bazooka');
 const locked={dx:g.player.special.dx,dy:g.player.special.dy};advance(g,SPECIALS.bazooka.startup-.01);
 assert.equal(e.hp,100);assert.deepEqual({dx:g.player.special.dx,dy:g.player.special.dy},locked);
 advance(g,.03);assert.equal(e.hp,100-SPECIALS.bazooka.damage*g.damage);
 advance(g,SPECIALS.bazooka.duration);assert.equal(g.player.special,null);
});
test('Gatling lasts 1.8 seconds, spends all bars and applies eighteen pulses',()=>{
 const g=fresh('dock');g.updateEnemy=()=>{};g.enemies=g.enemies.slice(0,1);const e=g.enemies[0];
 Object.assign(g.player,{x:300,y:430});Object.assign(e,{x:430,y:430,hp:100});g.meter=300;g.buggyDefeated=true;
 assert(g.startSpecial('gatling',{x:600,y:404}));assert.equal(g.meter,0);
 advance(g,1.7);assert(g.player.special,'still performing before 1.8 seconds');assert.equal(e.hp,100-SPECIALS.gatling.pulses*SPECIALS.gatling.damage*g.damage);
 advance(g,.11);assert.equal(g.player.special,null);assert.equal(g.meter,0,'specials do not recharge the meter');
});
test('Special requirements, cancellation and death reset are enforced',()=>{
 const g=fresh('dock');g.meter=199;assert(!g.startSpecial('bazooka',{x:500,y:400}));assert.equal(g.meter,199);
 g.buggyDefeated=true;g.meter=300;g.player.grounded=false;assert(!g.startSpecial('gatling',{x:500,y:400}));assert.equal(g.meter,300);
 g.player.grounded=true;assert(g.startSpecial('gatling',{x:500,y:400}));g.player.dashCd=0;g.player.airDash=true;
 g.step(DT,{dash:true});assert.equal(g.player.special,null);assert.equal(g.meter,0,'cancelled moves are not refunded');
 g.meter=300;g.player.dash=0;g.player.dashCd=0;g.player.airDash=true;g.player.grounded=true;g.player.attackCd=0;assert(g.startSpecial('gatling',{x:500,y:400}));g.die();assert.equal(g.meter,0);assert.equal(g.player.special,null);
});
test('Old dropped berries relocate to reachable ground after a map revision',()=>{const save=validSave({version:1,checkpoint:{stage:'dock',id:'dock-a'},satchel:{stage:'dock',x:720,y:430,amount:17}});assert.equal(save.satchel.amount,17);assert(save.satchel.x<700);assert.equal(save.satchel.y,430);});
test('Captain victories level Luffy up: more damage on every attack, one more health segment',()=>{
 const g=fresh('circus');
 assert.equal(g.level,1);assert.equal(g.damage,LEVELS[0].damage);assert.equal(g.maxHp,5);
 // The gain is a step, not a doubling, and it reaches specials as well as punches.
 assert(LEVELS[1].damage>LEVELS[0].damage&&LEVELS[1].damage<LEVELS[0].damage*2,'level two is a modest raise');
 assert(LEVELS[2].damage>LEVELS[1].damage,'level three raises it again');
 for(let i=1;i<LEVELS.length;i++)assert.equal(LEVELS[i].maxHp,LEVELS[i-1].maxHp+1,'one segment per victory');
 g.hp=3;g.damageEnemy(g.boss,999,1);
 assert.equal(g.level,2);assert.equal(g.damage,LEVELS[1].damage);assert.equal(g.maxHp,6);
 assert.equal(g.hp,4,'the new segment arrives filled without healing the rest');
 const restored=new Game(g.save());assert.equal(restored.level,2);assert.equal(restored.maxHp,6);assert.equal(restored.hp,6);
 // A rematch must not level him again.
 g.player.x=880;g.player.y=430;g.interact();g.damageEnemy(g.boss,999,1);assert.equal(g.level,2);assert.equal(g.maxHp,6);
 g.transition('mansion');g.damageEnemy(g.boss,999,1);
 assert(g.kuroDefeated);assert.equal(g.level,3);assert.equal(g.damage,LEVELS[2].damage);assert.equal(g.maxHp,7);
 // Specials ride the same multiplier.
 const h=fresh('dock');h.updateEnemy=()=>{};h.enemies=h.enemies.slice(0,1);const e=h.enemies[0];
 Object.assign(h.player,{x:300,y:430});Object.assign(e,{x:470,y:430,hp:100,maxHp:100});
 h.buggyDefeated=true;h.applyLevel();h.meter=300;
 assert(h.startSpecial('bazooka',{x:600,y:404}));advance(h,SPECIALS.bazooka.startup+.02);
 assert.equal(e.hp,100-SPECIALS.bazooka.damage*LEVELS[1].damage);
});
test('Syrup enemies carry more health than their chapter-one counterparts',()=>{
 const one=fresh('dock'),two=fresh('syrup');
 const pick=(g,type)=>g.enemies.find(e=>e.type===type);
 for(const type of ['cutlass','brute','bomber']){
  const a=pick(one,type),b=pick(two,type);
  assert(a&&b,type+' appears in both chapters');
  assert(b.hp>a.hp,type+' is tougher in Syrup Village');
  assert.equal(b.maxHp,b.hp,'the health bar reads against the spawn value');
  // Level two damage should leave hits-to-kill close to chapter one at level one.
  const before=Math.ceil(a.hp/LEVELS[0].damage),after=Math.ceil(b.hp/LEVELS[1].damage);
  assert(Math.abs(after-before)<=1,type+': '+before+' hits then, '+after+' hits now');
 }
});
test('Invalid save rejection',()=>{assert.equal(validSave({version:99}),null);assert.equal(validSave({version:1,checkpoint:{stage:'circus',id:'x'}}),null);});
console.log('All challenge-update checks passed.');

test('Gatling unlock persists and Buggy rematches do not repeat rewards',()=>{const g=fresh('circus');g.meter=300;assert(!g.startSpecial('gatling',{x:900,y:400}));assert.equal(g.meter,300);g.damageEnemy(g.boss,999,1);const saved=g.save();assert(new Game(saved).buggyDefeated);g.player.x=880;g.player.y=430;assert.equal(g.context().kind,'rematch');g.interact();assert.equal(g.boss.hp,84);assert.equal(g.boss.state,'idle');assert(g.buggyDefeated);g.damageEnemy(g.boss,999,1);assert.equal(g.berries,50);assert.equal(g.boss.state,'defeated');});
