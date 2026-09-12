const assert=require('node:assert/strict');
const {update,pose}=require('../play/motion.js');
const make=()=>({vx:220,vy:0,grounded:true});
const a=make(),b=make();const frames=new Set();
for(let i=0;i<120;i++){update(a,1/120);frames.add(pose(a));}
for(let i=0;i<60;i++)update(b,1/60);
assert(Math.abs(a.motion.phase-b.motion.phase)<1e-10);assert.equal(frames.size,6);
a.grounded=false;for(const [vy,expected] of [[-400,12],[-150,13],[0,14],[200,15]]){a.vy=vy;update(a,.01);assert.equal(pose(a),expected);}
a.grounded=true;a.vx=0;update(a,.01);assert.equal(pose(a),1);update(a,.2);assert.equal(pose(a),null);
for(const kind of ['attack','special','dash']){a[kind]=true;assert.equal(pose(a),null);a[kind]=false;}
a.stairs=true;const walks=new Set();for(let i=0;i<120;i++){update(a,1/120);walks.add(pose(a));}assert.equal(walks.size,4);
console.log('PASS movement: frame-rate independence, run cycle, stair cycle, jump phases, landing and combat priority');

const {strideFrame}=require('../play/motion.js');
const cycle=new Set();for(let i=0;i<60;i++)cycle.add(strideFrame({motion:{phase:i/60}}));assert.equal(cycle.size,6);
assert.equal(strideFrame({motion:{phase:0}}),strideFrame({motion:{phase:1}}));
console.log('PASS full-body stride frames and cycle seam');
