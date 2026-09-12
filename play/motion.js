/* Presentation-only locomotion state; collision and attack timing stay in core.js. */
(function(root){
 const RUN=[0,2,3,4,6,7],WALK=[8,9,10,11];
 function update(p,dt){
  const m=p.motion||(p.motion={phase:0,land:0,grounded:p.grounded});
  m.land=Math.max(0,m.land-dt);
  if(p.grounded&&!m.grounded)m.land=.09;
  const speed=Math.abs(p.vx);
  if(p.grounded&&speed>12&&!p.dash)m.phase+=speed*dt/110;
  else if(p.stairs)m.phase+=dt*1.4;
  else if(p.grounded)m.phase=0;
  m.grounded=p.grounded;
 }
 function pose(p){
  const m=p.motion||{phase:0,land:0};
  if(p.dash||p.attack||p.special)return null;
  if(p.stairs)return WALK[Math.floor(m.phase*4)%4];
  if(!p.grounded)return p.vy < -300?12:p.vy < -65?13:p.vy<80?14:15;
  if(m.land>0&&Math.abs(p.vx)<30)return 1;
  if(Math.abs(p.vx)<12)return null;
  const frames=Math.abs(p.vx)<110?WALK:RUN;
  return frames[Math.floor(m.phase*frames.length)%frames.length];
 }
 function strideFrame(p){return Math.floor((p.motion?.phase||0)*6)%6;}
 function drawStride(ctx,im,p,x,y,alpha=1){
  const n=strideFrame(p),k=.27;
  ctx.save();ctx.globalAlpha=alpha;ctx.translate(Math.round(x),Math.round(y));ctx.scale(p.facing,1);
  ctx.drawImage(im,n%3*384,Math.floor(n/3)*384,384,384,-192*k,-340*k,384*k,384*k);ctx.restore();
 }
 root.LuffyMotion={update,pose,strideFrame,drawStride};
 if(typeof module!=='undefined')module.exports=root.LuffyMotion;
})(typeof window!=='undefined'?window:globalThis);
