const assert=require('node:assert/strict');
const {Game,SPECIALS}=require('../play/core.js');
const dt=1/120;
const step=(g,t,input={})=>{for(let i=0;i<Math.round(t/dt);i++)g.step(dt,input)};
const ready=()=>{const g=new Game();g.kuroDefeated=true;g.loadStage('mansion');g.boss=null;g.enemies=[];g.player.x=150;g.events=[];return g;};
const aim=g=>({x:g.player.x+150,y:g.player.y-26});
for(const [bars,seconds] of [[1,3],[2,7],[3,13]]){
 const g=ready();g.meter=bars*100;assert(g.startGear());assert.equal(g.meter,0);assert(!g.startAttack(aim(g)));const x=g.player.x;
 step(g,.3,{right:true,dash:true,attackHeld:true});assert.equal(g.player.x,x);assert.equal(g.player.gear,0);
 step(g,.32);assert(Math.abs(g.player.gear-seconds)<.025);g.resting=true;const time=g.player.gear;step(g,1);assert.equal(g.player.gear,time);g.resting=false;
 step(g,seconds+.1);assert.equal(g.player.gear,0);
}
let g=ready();g.kuroDefeated=false;g.meter=300;assert(!g.startGear());assert.equal(g.meter,300);g.kuroDefeated=true;g.meter=99;assert(!g.startGear());g.meter=199;assert(g.startGear());assert.equal(g.player.gearDuration,3);assert.equal(g.meter,0);g.player.invuln=0;g.hurt(1,800);assert.equal(g.player.gearIntro,0);step(g,1);assert.equal(g.player.gear,0);
g=ready();g.player.gear=13;step(g,1,{attackHeld:true,aim:aim(g)});assert.equal(g.events.filter(e=>e.type==='punch').length,6);g=ready();step(g,1,{attackHeld:true});assert.equal(g.attackSerial,0);step(g,1,{attack:true,aim:aim(g)});assert.equal(g.attackSerial,3);
for(const [gear,cd] of [[0,.65],[5,.325]]){g=ready();g.player.gear=gear;g.step(dt,{dash:true});assert.equal(g.player.dashCd,cd);assert.equal(g.player.dashMax,cd);}
g=ready();assert(!g.jetStamp(aim(g)));assert(!g.startSpecial('jetstamp',aim(g)));g.player.gear=13;g.spawnBoss();Object.assign(g.boss,{x:240,state:'idle',timer:999});g.bossStarted=false;const hp=g.boss.hp;assert(g.jetStamp(aim(g)));assert.equal(g.player.gear,0);assert(!g.jetStamp(aim(g)));step(g,.8);assert.equal(g.boss.hp,hp-SPECIALS.bazooka.damage*g.damage);assert(!g.player.special);
g=ready();g.player.gear=5;g.loadStage('syrup');assert.equal(g.player.gear,0);g.player.gear=5;g.die();assert.equal(g.player.gear,0);assert(new Game(g.save()).kuroDefeated);
g=ready();g.spawnBoss();g.player.x=300;g.player.invuln=999;const moves=new Set();let airborne=false,wave=false;for(let i=0;i<7200;i++){g.step(dt);moves.add(g.boss.attack);airborne ||= g.boss.y<350;wave ||= g.projectiles.some(q=>q.kind==='clawwave');}assert(airborne&&wave);for(const move of ['lunge','slash','feint','dive','clawwave'])assert(moves.has(move),move);
console.log('PASS Gear unlock, bar durations, startup, interruption, pause, double attack speed, hold input, dash cooldown, Jet damage once, state reset, save and Kuro attack variety');

// Gear exit is a single event with a visible tail, both for expiry and the finisher.
g=ready();g.player.gear=.05;step(g,.1);assert(g.player.gearFade>0);assert.equal(g.events.filter(e=>e.type==='gear-end').length,1);step(g,1);assert.equal(g.player.gearFade,0);assert.equal(g.events.filter(e=>e.type==='gear-end').length,1);
g=ready();g.player.gear=3;g.jetStamp(aim(g));assert.equal(g.events.filter(e=>e.type==='gear-end'&&e.reason==='stamp').length,1);assert(g.player.gearFade>0);
// Crossing half health interrupts phase one and immediately selects a separate bag.
g=ready();g.spawnBoss();g.player.x=300;g.player.invuln=999;Object.assign(g.boss,{hp:59,state:'wind',attack:'lunge',timer:.2,moves:['slash']});g.step(dt);assert.equal(g.boss.state,'split');assert.equal(g.boss.phase,2);assert.equal(g.boss.moves.length,0);const phaseMoves=new Set();let pounces=0,lastY=430,volleyShots=0,huntWinds=0,lastState='';for(let i=0;i<6000;i++){g.step(dt);const b=g.boss;if(b.state!=='split')phaseMoves.add(b.attack);if(b.attack==='pounce'&&b.y<430&&lastY===430)pounces++;lastY=b.y;if(b.attack==='hunt'&&b.state==='wind'&&lastState!=='wind')huntWinds++;lastState=b.state;volleyShots+=g.events.filter(e=>e.type==='claw-sweep').length;g.events=[];}for(const move of ['flurry','hunt','pounce','crosscut'])assert(phaseMoves.has(move),move);assert(!phaseMoves.has('slash'));assert(pounces>=2&&huntWinds>=3&&volleyShots>=2);console.log('PASS Gear exit cues/fade, Bazooka-equivalent Jet damage, immediate Kuro phase transition and phase-two combo patterns');
