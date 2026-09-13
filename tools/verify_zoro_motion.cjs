const assert=require('node:assert/strict');
const Z=require('../play/zoro-art.js'),M=require('../play/motion.js');
for(const hz of [30,60,120]){const p={x:0,y:430,vx:205,grounded:true};for(let i=0;i<hz;i++)M.update(p,1/hz);assert(Math.abs(p.motion.phase-205/110)<1e-9);assert.equal(Z.strideFrame(p),6);}
const p={x:0,y:430,vx:0,grounded:true,special:{kind:'onigiri',t:.2}};
for(let i=0;i<60;i++){p.x+=6.5;Z.update(p,1/120);}assert(p.zoroMotion.trail.length<=8);assert(p.zoroMotion.trail.every(q=>q.x<=p.x));p.special=null;Z.update(p,1/120);assert.equal(p.zoroMotion.trail.length,0);
// Every animation phase draws finite coordinates and restores the caller's canvas state.
let depth=0;const stack=[];const ctx=new Proxy({globalAlpha:1,save(){stack.push(this.globalAlpha);depth++;},restore(){assert(depth>0);depth--;this.globalAlpha=stack.pop();}},{get(o,k){return k in o?o[k]:(...a)=>{for(const x of a)if(typeof x==='number')assert(Number.isFinite(x),k+' received nonfinite coordinate');};}});
for(const facing of [-1,1])for(const kind of ['onigiri','tigertrap'])for(let t=0;t<1.1;t+=1/120){const a={...p,facing,special:{kind,t,dx:facing,dy:0}};Z.draw(ctx,{stride:{},onigiri:{}},a,0,0,t);assert.equal(depth,0);assert.equal(ctx.globalAlpha,1);}
for(let frame=0;frame<8;frame++)assert.equal(Z.strideFrame({motion:{phase:frame/8+.001}}),frame);
console.log('PASS Zoro stride cadence, bounded movement trails, cancellation cleanup, both special animations and canvas-state isolation');
