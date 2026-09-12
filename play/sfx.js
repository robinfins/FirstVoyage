/* Synthesised sound effects: no audio files, no libraries.

   Every cue is layered the way a recorded effect would be — a transient to mark the moment, a
   body to give it weight, and a tail to let it breathe. Luffy's attacks lean on pitch glides
   rather than flat tones, because a rubber limb that stretches should sound like it stretches.
   Repeated cues (punch spam, an eighteen-hit Gatling) vary slightly so they never sound stamped. */
(function(root){
'use strict';
let ctx=null,bus=null,scope=null,noiseBuf=null,on=false;
const rand=(a,b)=>a+Math.random()*(b-a);

function makeNoise(){const n=Math.floor(ctx.sampleRate*.6),b=ctx.createBuffer(1,n,ctx.sampleRate),d=b.getChannelData(0);
 let seed=987654321;
 for(let i=0;i<n;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;d[i]=seed/2147483648-1;}
 return b;}

// Filtered noise burst. `to` sweeps the filter, which is what turns a hiss into a whoosh.
function air(t,{cut=1200,to=0,q=1,dur=.12,gain=.2,type='bandpass',delay=0}={}){
 const s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain(),at=t+delay;
 s.buffer=noiseBuf;s.playbackRate.value=rand(.92,1.08);
 f.type=type;f.Q.value=q;
 f.frequency.setValueAtTime(cut,at);
 if(to)f.frequency.exponentialRampToValueAtTime(Math.max(60,to),at+dur);
 g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(gain,at+Math.min(.012,dur*.2));
 g.gain.exponentialRampToValueAtTime(.0001,at+dur);
 s.connect(f);f.connect(g);g.connect(bus);s.start(at);s.stop(at+dur+.05);
}
// Pitched layer with a glide; the glide direction is most of the character.
function osc(t,{from=220,to=0,dur=.14,gain=.22,type='sine',delay=0,attack=.004}={}){
 const o=ctx.createOscillator(),g=ctx.createGain(),at=t+delay;
 o.type=type;o.frequency.setValueAtTime(from,at);
 if(to)o.frequency.exponentialRampToValueAtTime(Math.max(20,to),at+dur);
 g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(gain,at+attack);
 g.gain.exponentialRampToValueAtTime(.0001,at+dur);
 o.connect(g);g.connect(bus);o.start(at);o.stop(at+dur+.05);
}

const FX={
 // Arm leaving the shoulder: air first, then the elastic twang of the stretch.
 punch(t){const v=rand(.9,1.12);
  air(t,{cut:520*v,to:1900*v,q:1.6,dur:.11,gain:.11});
  osc(t,{from:250*v,to:520*v,dur:.07,gain:.08,type:'triangle'});
  osc(t,{from:150*v,to:80,dur:.09,gain:.07,type:'sine',delay:.01});},
 // Connect: tight crack over a low thump, so it reads as weight rather than volume.
 hit(t){const v=rand(.93,1.08);
  air(t,{cut:2600*v,dur:.045,gain:.14,type:'highpass'});
  osc(t,{from:290*v,to:70,dur:.13,gain:.24,type:'sine'});
  osc(t,{from:430*v,to:220,dur:.05,gain:.07,type:'square'});},
 // Push-off, then a resonant rush of air past the ear.
 dash(t){
  osc(t,{from:190,to:60,dur:.11,gain:.14,type:'sine'});
  air(t,{cut:380,to:2600,q:4.5,dur:.2,gain:.17});
  air(t,{cut:1800,to:500,q:2,dur:.26,gain:.07,delay:.06});},
 jump(t){osc(t,{from:190,to:430,dur:.11,gain:.08,type:'triangle'});
  air(t,{cut:900,to:1800,dur:.07,gain:.03});},

 'gear-start'(t){osc(t,{from:65,to:145,dur:.55,gain:.16,type:'sine'});air(t,{cut:400,to:2600,dur:.6,gain:.16});},
 'gear-active'(t){osc(t,{from:200,to:70,dur:.24,gain:.2});air(t,{cut:2400,to:700,dur:.45,gain:.16});},
 'gear-end'(t){air(t,{cut:2600,to:350,dur:.6,gain:.15});osc(t,{from:150,to:45,dur:.42,gain:.09});},
 'claw-sweep'(t){air(t,{cut:1100,to:4200,dur:.17,gain:.12});},
 'kuro-phase'(t){osc(t,{from:160,to:40,dur:.7,gain:.22});air(t,{cut:500,to:3000,dur:.6,gain:.12});},
 character(t){[392,587,784].forEach((f,i)=>osc(t,{from:f,to:f,dur:.2,gain:.05,type:'triangle',delay:i*.07}));},
 slash(t){air(t,{cut:900,to:5200,dur:.16,gain:.13});osc(t,{from:1300,to:650,dur:.09,gain:.035,type:'triangle'});},
 block(t){air(t,{cut:4200,dur:.045,gain:.12});osc(t,{from:1250,to:850,dur:.18,gain:.07,type:'triangle'});},
 parry(t){[1400,2100,2800].forEach((f,i)=>osc(t,{from:f,to:f*.9,dur:.32,gain:.05,type:'sine',delay:i*.014}));air(t,{cut:5400,dur:.04,gain:.16});},
 'special-start'(t,e){
  if(['onigiri','tigertrap'].includes(e.kind)){osc(t,{from:800,to:1600,dur:.18,gain:.06,type:'triangle'});air(t,{cut:700,to:2300,dur:.2,gain:.08});}
  else if(e.kind==='jetstamp'){air(t,{cut:450,to:2200,dur:.24,gain:.18});osc(t,{from:160,to:460,dur:.22,gain:.1});}
  else if(e.kind==='bazooka'){                       // both arms winding back: a long rising stretch
   osc(t,{from:90,to:260,dur:.55,gain:.12,type:'sawtooth',attack:.08});
   air(t,{cut:300,to:1500,q:3,dur:.55,gain:.06});
  }else{                                        // Gatling revs: three quick rising blips
   for(let i=0;i<3;i++)osc(t,{from:260+i*90,to:420+i*110,dur:.07,gain:.07,type:'square',delay:i*.05});
   air(t,{cut:700,to:2200,q:2,dur:.18,gain:.05});}},

 'special-pulse'(t,e){
  if(['onigiri','tigertrap'].includes(e.kind)){air(t,{cut:900,to:6000,dur:.28,gain:.22});osc(t,{from:220,to:50,dur:.23,gain:.22});[1600,2300].forEach(f=>osc(t,{from:f,to:f*.65,dur:.16,gain:.045,type:'triangle'}));}
  else if(e.kind==='bazooka'||e.kind==='jetstamp'){   // cannon: deep drop, blast, crack on top
   osc(t,{from:180,to:32,dur:.42,gain:.42,type:'sine'});
   osc(t,{from:120,to:40,dur:.3,gain:.16,type:'square'});
   air(t,{cut:1800,to:180,q:.8,dur:.38,gain:.22,type:'lowpass'});
   air(t,{cut:3200,dur:.06,gain:.16,type:'highpass'});
  }else{                                        // eighteen in 1.8s: short, dry, never identical
   const v=rand(.88,1.14);
   air(t,{cut:2800*v,dur:.035,gain:.1,type:'highpass'});
   osc(t,{from:330*v,to:90,dur:.07,gain:.17,type:'sine'});}},
 'special-end'(t){osc(t,{from:300,to:140,dur:.12,gain:.05,type:'triangle'});},
 'special-cancel'(t){air(t,{cut:1600,to:400,q:2,dur:.14,gain:.07});
  osc(t,{from:420,to:160,dur:.12,gain:.06,type:'triangle'});},

 hurt(t){osc(t,{from:170,to:55,dur:.26,gain:.22,type:'sawtooth'});
  air(t,{cut:1400,to:300,dur:.18,gain:.1});},
 death(t){osc(t,{from:330,to:70,dur:.9,gain:.18,type:'triangle',attack:.02});
  osc(t,{from:220,to:48,dur:1,gain:.12,type:'sine',delay:.06});},
 boom(t){osc(t,{from:150,to:28,dur:.5,gain:.34,type:'sine'});
  air(t,{cut:1400,to:120,q:.7,dur:.45,gain:.2,type:'lowpass'});
  air(t,{cut:4000,dur:.07,gain:.12,type:'highpass'});},
 coin(t){osc(t,{from:1180,to:1180,dur:.07,gain:.07,type:'square'});
  osc(t,{from:1760,to:1760,dur:.1,gain:.05,type:'square',delay:.055});},
 heal(t){[523,659,784].forEach((f,i)=>osc(t,{from:f,to:f,dur:.22,gain:.07,type:'triangle',delay:i*.06}));},
 rest(t){[392,523,659].forEach((f,i)=>osc(t,{from:f,to:f,dur:.5,gain:.075,type:'sine',delay:i*.11,attack:.02}));},
 'meter-bar'(t,e){const f=420+(e.bars||1)*150;
  osc(t,{from:f,to:f*1.5,dur:.16,gain:.09,type:'triangle'});},
 victory(t){[392,523,659,880].forEach((f,i)=>{
  osc(t,{from:f,to:f,dur:.42,gain:.11,type:'sawtooth',delay:i*.13,attack:.015});
  osc(t,{from:f/2,to:f/2,dur:.42,gain:.06,type:'triangle',delay:i*.13});});}
};

function attach(context){if(ctx)return;ctx=context;noiseBuf=makeNoise();
 bus=ctx.createGain();bus.gain.value=2.3;                // effects sit on top of the score, not under it
 // A limiter catches the moments several cues land together (a bomb during a Gatling, say),
 // so the bus can run hot without ever clipping.
 const lim=ctx.createDynamicsCompressor();
 lim.threshold.value=-7;lim.knee.value=4;lim.ratio.value=12;lim.attack.value=.003;lim.release.value=.12;
 scope=ctx.createAnalyser();scope.fftSize=1024;          // metered after the limiter, so it reads real output
 bus.connect(lim);lim.connect(scope);lim.connect(ctx.destination);}
function setEnabled(v){on=!!v;}
function play(name,data){if(!on||!ctx||!FX[name])return false;
 FX[name](ctx.currentTime+.002,data||{});return true;}
function meter(){if(!scope)return 0;const b=new Float32Array(scope.fftSize);scope.getFloatTimeDomainData(b);
 let s=0;for(const v of b)s+=v*v;return Math.sqrt(s/b.length);}
function setLevel(v){if(bus)bus.gain.value=v;}
root.Sfx={attach,setEnabled,play,meter,setLevel,list:Object.keys(FX)};
if(typeof module!=='undefined'&&module.exports)module.exports=root.Sfx;
})(typeof window!=='undefined'?window:globalThis);
