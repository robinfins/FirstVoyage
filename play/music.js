/* Original score for the voyage, synthesised live: no audio files and no libraries.
   Written in a sea-shanty / adventure idiom — waltz lilt in the hub, a minor-key march at sea,
   a driving phrygian battle cue. The melodies are original to this project.

   Timing runs on a sixteenth-note grid with a lookahead scheduler: a coarse timer wakes every
   25ms and queues every step falling inside the next 100ms against ctx.currentTime, so note
   starts are sample-accurate and never drift with the frame rate. */
(function(root){
'use strict';
const SEMI={C:0,'C#':1,Db:1,D:2,'D#':3,Eb:3,E:4,F:5,'F#':6,Gb:6,G:7,'G#':8,Ab:8,A:9,'A#':10,Bb:10,B:11};
function freq(name){const m=/^([A-G][#b]?)(-?\d)$/.exec(name||'');
 return m?440*Math.pow(2,(SEMI[m[1]]+(+m[2]+1)*12-69)/12):0;}

// ---------------------------------------------------------------- score
// Each part is a flat run of [note, sixteenths]; null is a rest. Bars are kept on their own
// lines so the harmony stays readable. `from` gates a part on intensity, for boss phase two.
const bars=(...rows)=>rows.flat();

const TRACKS={
 // Dusk at anchor: 3/4 waltz in D, oom-pah-pah bass, unhurried melody.
 hub:{bpm:78,perBar:12,parts:[
  {voice:'lead',gain:.16,seq:bars(
   [['A4',12]], [['B4',8],['A4',4]], [['F#4',8],['G4',4]], [['E4',12]],
   [['F#4',8],['A4',4]], [['B4',8],['D5',4]], [['C#5',8],['B4',4]], [['A4',12]])},
  {voice:'bass',gain:.22,seq:bars(
   [['D2',4],[null,8]], [['G2',4],[null,8]], [['B2',4],[null,8]], [['A2',4],[null,8]],
   [['D2',4],[null,8]], [['G2',4],[null,8]], [['A2',4],[null,8]], [['D2',4],[null,8]])},
  {voice:'pluck',gain:.10,seq:bars(
   [[null,4],['F#3',4],['A3',4]], [[null,4],['B3',4],['D4',4]],
   [[null,4],['D4',4],['F#4',4]], [[null,4],['C#4',4],['E4',4]],
   [[null,4],['F#3',4],['A3',4]], [[null,4],['B3',4],['D4',4]],
   [[null,4],['C#4',4],['E4',4]], [[null,4],['F#3',4],['A3',4]])}]},

 // Under way: 4/4 march in D minor, dotted melody over a walking bass.
 stage:{bpm:134,perBar:16,parts:[
  {voice:'lead',gain:.15,seq:bars(
   [['D5',3],['E5',1],['F5',4],['E5',4],['D5',4]],
   [['F5',6],['D5',2],['F5',4],['A5',4]],
   [['A5',3],['G5',1],['F5',4],['G5',4],['A5',4]],
   [['G5',8],['E5',4],['C5',4]],
   [['D5',3],['E5',1],['F5',4],['A5',4],['G5',4]],
   [['F5',6],['D5',2],['Bb4',8]],
   [['E5',4],['G5',4],['A5',4],['G5',4]],
   [['F5',8],['D5',8]])},
  {voice:'bass',gain:.24,seq:bars(
   [['D2',2],['D2',2],['A2',2],['D2',2],['D2',2],['D2',2],['A2',2],['D3',2]],
   [['Bb1',2],['Bb1',2],['F2',2],['Bb1',2],['Bb1',2],['Bb1',2],['F2',2],['Bb2',2]],
   [['F2',2],['F2',2],['C3',2],['F2',2],['F2',2],['F2',2],['C3',2],['F3',2]],
   [['C2',2],['C2',2],['G2',2],['C2',2],['C2',2],['C2',2],['G2',2],['C3',2]],
   [['D2',2],['D2',2],['A2',2],['D2',2],['D2',2],['D2',2],['A2',2],['D3',2]],
   [['Bb1',2],['Bb1',2],['F2',2],['Bb1',2],['Bb1',2],['Bb1',2],['F2',2],['Bb2',2]],
   [['C2',2],['C2',2],['G2',2],['C2',2],['C2',2],['C2',2],['G2',2],['C3',2]],
   [['D2',2],['D2',2],['A2',2],['D2',2],['D2',2],['D2',2],['A2',2],['A2',2]])},
  {voice:'pluck',gain:.08,seq:bars(
   [[null,8],['A4',2],['D5',2],['F5',4]], [[null,8],['F4',2],['Bb4',2],['D5',4]],
   [[null,8],['C5',2],['F5',2],['A5',4]], [[null,8],['G4',2],['C5',2],['E5',4]],
   [[null,8],['A4',2],['D5',2],['F5',4]], [[null,8],['F4',2],['Bb4',2],['D5',4]],
   [[null,8],['G4',2],['C5',2],['E5',4]], [[null,16]])},
  {voice:'drum',gain:.5,seq:bars(
   [['K',4],['S',4],['K',2],['K',2],['S',4]])}]},

 // The captain's cue: 4/4 in D phrygian, relentless eighths, brass stabs off the beat.
 boss:{bpm:168,perBar:16,parts:[
  {voice:'lead',gain:.16,seq:bars(
   [['D5',2],[null,2],['D5',2],['F5',2],['E5',4],[null,4]],
   [['D5',2],[null,2],['C5',2],['D5',2],['A4',6],[null,2]],
   [['Eb5',2],[null,2],['Eb5',2],['G5',2],['F5',4],[null,4]],
   [['Eb5',2],[null,2],['D5',2],['Eb5',2],['Bb4',6],[null,2]],
   [['D5',2],[null,2],['F5',2],['A5',2],['G5',4],[null,4]],
   [['C5',4],['E5',4],['G5',4],['E5',4]],
   [['Bb4',4],['D5',4],['F5',4],['D5',4]],
   [['A4',2],['C#5',2],['E5',2],['A5',2],['E5',4],[null,4]])},
  {voice:'bass',gain:.26,seq:bars(
   [['D2',2],['D2',2],['D2',2],['D2',2],['D2',2],['D2',2],['C2',2],['D2',2]],
   [['D2',2],['D2',2],['D2',2],['D2',2],['A1',2],['A1',2],['C2',2],['D2',2]],
   [['Eb2',2],['Eb2',2],['Eb2',2],['Eb2',2],['Eb2',2],['Eb2',2],['D2',2],['Eb2',2]],
   [['Eb2',2],['Eb2',2],['Eb2',2],['Eb2',2],['Bb1',2],['Bb1',2],['D2',2],['Eb2',2]],
   [['D2',2],['D2',2],['D2',2],['D2',2],['D2',2],['D2',2],['C2',2],['D2',2]],
   [['C2',2],['C2',2],['C2',2],['C2',2],['C2',2],['C2',2],['Bb1',2],['C2',2]],
   [['Bb1',2],['Bb1',2],['Bb1',2],['Bb1',2],['Bb1',2],['Bb1',2],['A1',2],['Bb1',2]],
   [['A1',2],['A1',2],['A1',2],['A1',2],['A1',2],['E2',2],['A2',2],['A1',2]])},
  {voice:'drum',gain:.55,seq:bars(
   [['K',4],['S',4],['K',4],['S',2],['K',2]])},
  // Phase two piles a sixteenth-note counter-line on top.
  {voice:'pluck',gain:.11,from:2,seq:bars(
   [['D5',1],['F5',1],['A5',1],['F5',1],['D5',1],['F5',1],['A5',1],['F5',1],
    ['D5',1],['F5',1],['A5',1],['F5',1],['E5',1],['F5',1],['A5',1],['F5',1]],
   [['D5',1],['F5',1],['A5',1],['F5',1],['D5',1],['F5',1],['A5',1],['F5',1],
    ['C5',1],['E5',1],['A5',1],['E5',1],['C5',1],['E5',1],['A5',1],['E5',1]],
   [['Eb5',1],['G5',1],['Bb5',1],['G5',1],['Eb5',1],['G5',1],['Bb5',1],['G5',1],
    ['Eb5',1],['G5',1],['Bb5',1],['G5',1],['F5',1],['G5',1],['Bb5',1],['G5',1]],
   [['Eb5',1],['G5',1],['Bb5',1],['G5',1],['Eb5',1],['G5',1],['Bb5',1],['G5',1],
    ['D5',1],['F5',1],['Bb5',1],['F5',1],['D5',1],['F5',1],['Bb5',1],['F5',1]],
   [['D5',1],['F5',1],['A5',1],['F5',1],['D5',1],['F5',1],['A5',1],['F5',1],
    ['D5',1],['F5',1],['A5',1],['F5',1],['E5',1],['F5',1],['A5',1],['F5',1]],
   [['C5',1],['E5',1],['G5',1],['E5',1],['C5',1],['E5',1],['G5',1],['E5',1],
    ['C5',1],['E5',1],['G5',1],['E5',1],['C5',1],['E5',1],['G5',1],['E5',1]],
   [['Bb4',1],['D5',1],['F5',1],['D5',1],['Bb4',1],['D5',1],['F5',1],['D5',1],
    ['Bb4',1],['D5',1],['F5',1],['D5',1],['Bb4',1],['D5',1],['F5',1],['D5',1]],
   [['A4',1],['C#5',1],['E5',1],['C#5',1],['A4',1],['C#5',1],['E5',1],['C#5',1],
    ['A4',1],['C#5',1],['E5',1],['A5',1],['E5',1],['C#5',1],['A4',1],[null,1]])}]}
};

// Flatten each part into a step -> [note, duration] table, and loop short parts (the drum
// pattern is written once and repeats under the whole progression).
for(const t of Object.values(TRACKS)){
 t.length=t.perBar*8;
 for(const p of t.parts){
  p.at={};let s=0;
  for(const [note,dur] of p.seq){if(note)p.at[s]=[note,dur];s+=dur;}
  if(s>0&&s<t.length)for(let o=s;o<t.length;o+=s)for(const k in p.at){const step=o+ +k;if(step<t.length)p.at[step]=p.at[k];}
 }
}

// ---------------------------------------------------------------- synthesis
let ctx=null,master=null,noise=null,scope=null;
let track=null,step=0,nextTime=0,timer=null,intensity=1,level=.55,ducked=false;
const LOOKAHEAD=.1,TICK=25;

function makeNoise(){const n=ctx.sampleRate*.5,b=ctx.createBuffer(1,n,ctx.sampleRate),d=b.getChannelData(0);
 let seed=22222;
 for(let i=0;i<n;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;d[i]=seed/2147483648-1;}
 return b;}

function env(g,t,dur,peak,attack,release){
 g.gain.setValueAtTime(0,t);
 g.gain.linearRampToValueAtTime(peak,t+attack);
 g.gain.setTargetAtTime(peak*.65,t+attack+.01,dur*.5+.05);
 g.gain.setTargetAtTime(0,t+Math.max(attack+.02,dur-release),release*.4+.02);
}

const VOICES={
 // Reedy brass-ish lead: square and saw a few cents apart through a soft lowpass.
 lead(t,f,dur,gain){const a=ctx.createOscillator(),b=ctx.createOscillator(),g=ctx.createGain(),lp=ctx.createBiquadFilter();
  a.type='square';b.type='sawtooth';b.detune.value=7;a.frequency.value=f;b.frequency.value=f;
  lp.type='lowpass';lp.frequency.setValueAtTime(1500,t);lp.frequency.linearRampToValueAtTime(3000,t+.05);lp.Q.value=.7;
  env(g,t,dur,gain,.015,dur);
  a.connect(lp);b.connect(lp);lp.connect(g);g.connect(master);
  a.start(t);b.start(t);a.stop(t+dur+.4);b.stop(t+dur+.4);},
 bass(t,f,dur,gain){const a=ctx.createOscillator(),g=ctx.createGain(),lp=ctx.createBiquadFilter();
  a.type='triangle';a.frequency.value=f;
  lp.type='lowpass';lp.frequency.value=900;
  env(g,t,dur,gain,.008,dur);
  a.connect(lp);lp.connect(g);g.connect(master);a.start(t);a.stop(t+dur+.2);},
 pluck(t,f,dur,gain){const a=ctx.createOscillator(),g=ctx.createGain();
  a.type='triangle';a.frequency.value=f;
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(gain,t+.006);
  g.gain.exponentialRampToValueAtTime(.0001,t+Math.max(.09,dur*.9));
  a.connect(g);g.connect(master);a.start(t);a.stop(t+dur+.2);},
 drum(t,f,dur,gain,note){
  if(note==='K'){const o=ctx.createOscillator(),g=ctx.createGain();
   o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(45,t+.11);
   g.gain.setValueAtTime(gain,t);g.gain.exponentialRampToValueAtTime(.0001,t+.16);
   o.connect(g);g.connect(master);o.start(t);o.stop(t+.2);return;}
  const s=ctx.createBufferSource(),g=ctx.createGain(),bp=ctx.createBiquadFilter();
  s.buffer=noise;bp.type=note==='S'?'bandpass':'highpass';bp.frequency.value=note==='S'?1700:7000;bp.Q.value=.9;
  g.gain.setValueAtTime(gain*(note==='S'?.5:.16),t);
  g.gain.exponentialRampToValueAtTime(.0001,t+(note==='S'?.13:.04));
  s.connect(bp);bp.connect(g);g.connect(master);s.start(t);s.stop(t+.2);}
};

function scheduleStep(s,t){const T=TRACKS[track];if(!T)return;
 for(const p of T.parts){
  if((p.from||1)>intensity)continue;
  const e=p.at[s];if(!e)continue;
  const dur=e[1]*60/T.bpm/4;
  VOICES[p.voice](t,freq(e[0]),dur,p.gain,e[0]);
 }
}
function pump(){if(!ctx||!track)return;
 const T=TRACKS[track],stepDur=60/T.bpm/4;
 while(nextTime<ctx.currentTime+LOOKAHEAD){
  scheduleStep(step,nextTime);
  nextTime+=stepDur;step=(step+1)%T.length;
 }
}

// ---------------------------------------------------------------- public
function attach(context){if(ctx)return;ctx=context;noise=makeNoise();
 master=ctx.createGain();master.gain.value=0;
 // Tap the bus so output level can be measured (and so a visualiser can hang off it later).
 scope=ctx.createAnalyser();scope.fftSize=1024;master.connect(scope);master.connect(ctx.destination);}
function meter(){if(!scope)return 0;const b=new Float32Array(scope.fftSize);scope.getFloatTimeDomainData(b);
 let sum=0;for(const v of b)sum+=v*v;return Math.sqrt(sum/b.length);}
function gain(){return ducked?level*.3:level;}
function ramp(to,seconds){if(!master)return;
 master.gain.cancelScheduledValues(ctx.currentTime);
 master.gain.setValueAtTime(master.gain.value,ctx.currentTime);
 master.gain.linearRampToValueAtTime(to,ctx.currentTime+seconds);}
function play(name){if(!ctx||!TRACKS[name])return;
 if(track===name){ramp(gain(),.4);return;}
 const start=()=>{track=name;step=0;nextTime=ctx.currentTime+.06;ramp(gain(),.7);
  if(!timer)timer=setInterval(pump,TICK);pump();};
 if(!track){start();return;}
 ramp(0,.45);setTimeout(start,470);          // cross-fade through silence, so keys never clash
}
function stop(){if(!ctx)return;ramp(0,.35);
 setTimeout(()=>{if(master&&master.gain.value<.01){clearInterval(timer);timer=null;track=null;}},400);}
function setIntensity(n){intensity=n;}
function duck(on){ducked=on;if(track)ramp(gain(),.25);}
function setLevel(v){level=v;if(track)ramp(gain(),.2);}
root.Music={attach,play,stop,setIntensity,duck,setLevel,meter,now:()=>track,tracks:Object.keys(TRACKS),TRACKS};
if(typeof module!=='undefined'&&module.exports)module.exports=root.Music;
})(typeof window!=='undefined'?window:globalThis);
