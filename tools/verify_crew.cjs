const assert=require('node:assert/strict');
const {Game,HEALTH,TYPES,GUARD,SPECIALS,validSave}=require('../play/core.js');
const DT=1/120;
function step(g,seconds,input={}){for(let i=0;i<Math.round(seconds/DT);i++)g.step(DT,input);}
function fresh(character='zoro'){
 const g=new Game();g.resting=true;g.switchCharacter(character);g.closeRest();g.loadStage('circus');g.boss=null;g.enemies=[];
 Object.assign(g.player,{x:300,y:430,invuln:0,platform:'arena'});return g;
}
const aim={x:900,y:404};
function target(g,x=350,type='cutlass'){const e={...TYPES[type],type,x,y:430,maxHp:100,hp:100,vx:0,vy:0,grounded:true,state:'active',timer:.2,facing:-1,drop:0,navTimer:1,aggro:7,combo:0,hit:0};g.enemies.push(e);return e;}
function test(name,fn){fn();console.log('PASS '+name);}
test('600 HP pool, authored damage, 300 HP healing and maximum clamp',()=>{
 const g=fresh('luffy');assert.equal(g.hp,600);g.hurt(155,350);assert.equal(g.hp,445);
 g.player.invuln=0;g.hurt(230,350);assert.equal(g.hp,215);Object.assign(g.player,{grounded:true,vy:0,y:430});
 assert(g.heal());step(g,.7);assert.equal(g.hp,515);assert(g.heal());step(g,.7);assert.equal(g.hp,600);assert.equal(g.heals,1);
 assert(!g.heal());assert.equal(HEALTH.heal,300);
});
test('Character selection only at rest, save migration and shared progression',()=>{
 const g=new Game();assert(!g.switchCharacter('zoro'));g.player.x=610;g.interact();assert(g.resting);
 g.player.gear=7;g.meter=250;assert(g.switchCharacter('zoro'));assert.equal(g.meter,0);assert.equal(g.player.gear,0);
 assert(!g.switchCharacter('unknown'));assert(!g.switchCharacter('zoro'));
 const save=g.save();assert.equal(new Game(save).character,'zoro');delete save.character;assert.equal(new Game(save).character,'luffy');
 assert.equal(validSave({...save,character:'__proto__'}).character,'luffy');g.buggyDefeated=true;g.kuroDefeated=true;g.applyLevel();
 g.switchCharacter('luffy');assert.equal(g.maxHp,840);assert(g.buggyDefeated&&g.kuroDefeated);
});
test('Frontal timed melee parry takes no damage and stuns for one second',()=>{
 const g=fresh(),e=target(g);g.step(DT,{block:true,aim});assert.equal(g.hp,600);assert.equal(e.stun,1);
 const x=e.x;step(g,.9,{block:true,aim});assert.equal(e.x,x);assert(e.stun>0);step(g,.11,{block:true,aim});assert.equal(e.stun,0);
 assert(g.events.some(e=>e.type==='parry'));
});
test('Holding guard beyond the parry window reduces a heavy hit by 70%',()=>{
 const g=fresh();step(g,.2,{block:true,aim});const e=target(g,350,'brute');g.step(DT,{block:true,aim});
 assert.equal(g.hp,600-Math.ceil(230*GUARD.multiplier));assert(!e.stun);assert(g.events.some(e=>e.type==='block'));
});
test('Ranged attacks block but never parry, including fresh guard',()=>{
 const g=fresh();g.step(DT,{block:true,aim});g.projectiles.push({kind:'knife',x:320,y:406,vx:-330,vy:0,t:1,damage:110});
 g.updateProjectiles(DT);assert.equal(g.hp,567);assert.equal(g.projectiles.length,0);assert(!g.events.some(e=>e.type==='parry'));
});
test('Rear attacks and world hazards bypass guard; rapid retaps cannot reset parry',()=>{
 const g=fresh();g.step(DT,{block:true,aim});const e=target(g,260);g.hurt(155,260,{kind:'melee',attacker:e});assert.equal(g.hp,445);assert(!e.stun);
 g.player.invuln=0;g.hurt(120,350);assert.equal(g.hp,325);
 const h=fresh();h.step(DT,{block:true,aim});h.step(DT,{});h.step(DT,{block:true,aim});
 const other=target(h);h.hurt(155,350,{kind:'melee',attacker:other});assert.equal(h.hp,553);assert(!other.stun);
});
test('Both boss melee attacks parry; stun survives phase-change health threshold',()=>{
 for(const stage of ['circus','mansion']){const g=fresh();g.loadStage(stage);g.bossStarted=true;Object.assign(g.player,{x:300,y:430,invuln:0});
  const b=g.boss;Object.assign(b,{x:340,y:430,state:'active',attack:'lunge',timer:.2,vx:-200,facing:-1,anim:0});
  g.step(DT,{block:true,aim});assert.equal(g.hp,600);assert.equal(b.stun,1);b.hp=b.maxHp*.4;
  step(g,.9,{block:true,aim});assert.equal(b.phase,1);step(g,.15,{block:true,aim});assert.equal(b.phase,2);assert.equal(b.state,'split');
 }
});
test('Zoro basic slash hits once for 25% more damage with shorter reach',()=>{
 for(const character of ['luffy','zoro']){const g=fresh(character),e=target(g,375);g.updateEnemy=()=>{};
  assert(g.startAttack(aim));step(g,.3);assert.equal(e.hp,100-(character==='zoro'?1.25:1));assert.equal(g.meter,20);
  const h=fresh(character),far=target(h,430);h.updateEnemy=()=>{};h.startAttack(aim);step(h,.3);assert.equal(far.hp,character==='zoro'?100:99);
 }
});
test('Guard prevents attacks, releases cleanly, and dash cancels it',()=>{
 const g=fresh();g.meter=300;g.step(DT,{block:true,aim});assert(!g.startAttack(aim));assert(!g.startSpecial('bazooka',aim));
 g.step(DT,{block:true,dash:true,aim});assert(g.player.dash>0);assert(!g.player.blocking);step(g,.2,{});assert(g.startAttack(aim));
});
test('Oni Giri spends two bars, rushes farther than dash and sweeps targets once',()=>{
 const g=fresh(),e=target(g,490);g.updateEnemy=()=>{};g.meter=300;assert(g.startSpecial('bazooka',aim));assert.equal(g.player.special.kind,'onigiri');
 assert.equal(g.meter,100);step(g,.17);assert.equal(e.hp,100);step(g,.6);assert.equal(e.hp,88);assert(g.player.x>540);assert.equal(g.meter,100);assert(!g.player.special);
});
test('Tiger Trap unlock, windup, single hit, level scaling and cancellation',()=>{
 const g=fresh(),e=target(g,400);g.updateEnemy=()=>{};g.meter=300;assert(!g.startSpecial('gatling',aim));assert.equal(g.meter,300);
 g.buggyDefeated=true;g.applyLevel();assert(g.startSpecial('gatling',aim));assert.equal(g.player.special.kind,'tigertrap');assert.equal(g.meter,0);
 step(g,.46);assert.equal(e.hp,100);step(g,.66);assert.equal(e.hp,100-18*1.5);assert(!g.player.special);
 g.player.attackCd=0;g.meter=300;g.startSpecial('gatling',aim);g.step(DT,{dash:true});assert(!g.player.special);assert.equal(g.meter,0);
});
test('Oni Giri evades attacks only during its rush; hazards still damage',()=>{
 const g=fresh();g.meter=200;g.startSpecial('bazooka',aim);assert(g.hurt(110,350,{kind:'ranged'}));
 g.player.invuln=0;step(g,.2);assert(!g.hurt(155,350,{kind:'melee',attacker:{}}));assert(g.hurt(120,350));
 g.player.invuln=0;step(g,.34);assert(g.hurt(110,350,{kind:'ranged'}));
});
test('Zoro cannot use Luffy abilities; specials cannot start at rest or airborne',()=>{
 const g=fresh();g.kuroDefeated=true;g.meter=300;assert(!g.startGear());assert(!g.jetStamp(aim));assert(!g.startSpecial('jetstamp',aim));
 g.player.grounded=false;assert(!g.startSpecial('bazooka',aim));g.player.grounded=true;g.resting=true;assert(!g.startSpecial('bazooka',aim));assert(!g.startAttack(aim));
 const l=fresh('luffy');l.meter=300;assert(!l.startSpecial('onigiri',aim));assert(!l.startSpecial('tigertrap',aim));
});
test('Death, respawn and room changes retain selected character but clear combat state',()=>{
 const g=fresh();g.meter=300;g.startSpecial('bazooka',aim);g.die();assert(!g.player.special);step(g,1.7);assert.equal(g.hp,600);assert.equal(g.character,'zoro');assert.equal(g.meter,0);
 g.loadStage('dock');assert(!g.player.blocking);assert.equal(new Game(g.save()).character,'zoro');
});
console.log('All crew and numeric-health checks passed.');
