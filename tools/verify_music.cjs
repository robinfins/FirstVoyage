const assert=require('node:assert/strict');
const Music=require('../play/music.js');
const {TRACKS}=Music;
const SEMI={C:0,'C#':1,Db:1,D:2,'D#':3,Eb:3,E:4,F:5,'F#':6,Gb:6,G:7,'G#':8,Ab:8,A:9,'A#':10,Bb:10,B:11};
const parse=n=>/^([A-G][#b]?)(-?\d)$/.exec(n);

for(const [name,t] of Object.entries(TRACKS)){
 assert(t.bpm>=60&&t.bpm<=200,name+' tempo is sane');
 assert.equal(t.length,t.perBar*8,name+' loops over eight bars');
 const voices=new Set(t.parts.map(p=>p.voice));
 assert(voices.has('lead')&&voices.has('bass'),name+' carries a melody and a bass');
 for(const p of t.parts){
  let span=0;
  for(const [note,dur] of p.seq){
   assert(Number.isInteger(dur)&&dur>0,name+'/'+p.voice+' durations are whole sixteenths');
   if(note&&p.voice!=='drum'){
    assert(parse(note),name+'/'+p.voice+': unreadable note "'+note+'"');
    const f=440*Math.pow(2,(SEMI[parse(note)[1]]+(+parse(note)[2]+1)*12-69)/12);
    assert(f>25&&f<2100,name+'/'+p.voice+': '+note+' at '+f.toFixed(1)+'Hz is outside the usable range');
   }
   if(note&&p.voice==='drum')assert(['K','S','H'].includes(note),'drum hits are K/S/H');
   span+=dur;
  }
  assert(t.length%span===0,name+'/'+p.voice+' tiles the loop exactly ('+span+' of '+t.length+')');
  // every step in the flattened table must be inside the loop
  for(const k of Object.keys(p.at))assert(+k<t.length,name+'/'+p.voice+' schedules past the loop end');
  assert(Object.keys(p.at).length>0,name+'/'+p.voice+' actually plays something');
 }
}
// the battle cue must hold something back for phase two
const layered=TRACKS.boss.parts.filter(p=>(p.from||1)>1);
assert(layered.length>0,'boss keeps a layer for phase two');
assert(layered.every(p=>Object.keys(p.at).length>0),'the phase-two layer has notes');
// hub should be the calmest: fewest attacks per bar
const density=n=>TRACKS[n].parts.reduce((a,p)=>a+Object.keys(p.at).length,0)/TRACKS[n].length;
assert(density('hub')<density('stage'),'the hub cue is calmer than the march');
assert(density('stage')<density('boss'),'the march is calmer than the battle cue');
console.log('PASS three cues: readable notes, exact loop tiling, phase-two layer, rising density');
console.log('  density per step  hub %s  stage %s  boss %s',
 density('hub').toFixed(2),density('stage').toFixed(2),density('boss').toFixed(2));

// ---------------------------------------------------------------- effects
const fs=require('fs'),path=require('path');
const Sfx=require('../play/sfx.js');
const src=fs.readFileSync(path.join(__dirname,'../play/core.js'),'utf8');
const emitted=[...new Set([...src.matchAll(/emit\(['"]([a-z-]+)['"]/g)].map(m=>m[1]))].sort();
const SILENT=new Set(['save','stage']);        // bookkeeping, deliberately silent
const cued=new Set(Sfx.list);
const missing=emitted.filter(e=>!SILENT.has(e)&&!cued.has(e));
assert.deepEqual(missing,[],'events with no cue: '+missing.join(', '));
for(const name of Sfx.list)assert(emitted.includes(name),'cue "'+name+'" answers a real event');
// the three the player hears most must be distinct cues, not aliases of one another
for(const k of ['punch','hit','dash','special-start','special-pulse'])assert(cued.has(k),k+' has its own cue');
assert(!Sfx.play('punch'),'cues stay silent until a context is attached and sound is enabled');
console.log('PASS effects: %d cues cover all %d sounding events (%s silent by design)',
 Sfx.list.length,emitted.filter(e=>!SILENT.has(e)).length,[...SILENT].join('/'));

// ---------------------------------------------------------------- cue selection
// Mirrors scoreFor() in play/game.js: the battle cue belongs to the fight, not the room.
const {Game}=require('../play/core.js');
const ARENA={circus:1,mansion:1},STAGE_TRACK={sunny:'hub',dock:'stage',streets:'stage',syrup:'stage'};
function cue(g){const b=g.boss,fighting=!!b&&g.bossStarted&&b.state!=='defeated'&&b.hp>0;
 if(fighting)return 'boss';
 if(ARENA[g.stage])return (b&&b.state!=='defeated'&&b.hp>0)?'stage':'hub';
 return STAGE_TRACK[g.stage]||'stage';}

const g=new Game();
assert.equal(cue(g),'hub','the ship gets the calm cue');
g.loadStage('dock');assert.equal(cue(g),'stage','routes get the march');
g.loadStage('circus');
assert(g.boss,'Buggy spawns in an uncleared arena');
assert.equal(g.bossStarted,false,'the fight has not started on arrival');
assert.equal(cue(g),'stage','the march carries over the approach, not the battle cue');
g.bossStarted=true;
assert.equal(cue(g),'boss','crossing the trigger starts the battle cue');
g.boss.phase=2;assert.equal(cue(g),'boss','phase two stays on the battle cue');
g.damageEnemy(g.boss,999,1);
assert.equal(g.boss.state,'defeated','the captain is down');
assert.notEqual(cue(g),'boss','the battle cue ends when he dies');
assert.equal(cue(g),'hub','the calm cue takes the aftermath');
// a cleared arena never spawns him again, so it must not reach for the battle cue
const cleared=new Game(g.save());cleared.loadStage('circus');
assert.equal(cleared.boss,null,'a cleared arena spawns no boss');
assert.equal(cue(cleared),'hub','re-entering a cleared arena stays calm');
// ...until a rematch is taken
cleared.player.x=880;cleared.player.y=430;
assert.equal(cleared.context().kind,'rematch','the rematch marker is live');
cleared.interact();cleared.bossStarted=true;
assert.equal(cue(cleared),'boss','a rematch brings the battle cue back');
// Kuro follows the same rule
const k=new Game(g.save());k.kuroDefeated=false;k.loadStage('mansion');
assert.equal(cue(k),'stage','the mansion approach is not the battle cue');
k.bossStarted=true;assert.equal(cue(k),'boss','Kuro gets the battle cue');
k.damageEnemy(k.boss,999,1);assert.equal(cue(k),'hub','and it ends when he falls');
console.log('PASS cue selection: battle music is scoped to the fight in both arenas');

