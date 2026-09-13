/* Zoro's generated key poses. Chroma key is decoded once, before play begins.
   Source rectangles are measured, not equal-grid guesses: a few swords cross cell margins. */
(function(root){
'use strict';
const FRAMES=[
 [0,0,313,314,150,281],[314,0,313,314,469,281],[627,0,313,314,783,281],[940,0,314,314,1094,281],
 [0,314,313,312,161,584],[314,314,313,312,471,585],[627,314,313,312,791,588],[940,314,314,312,1090,591],
 [0,626,313,288,149,879],[314,626,278,288,435,879],[592,626,348,288,736,879],[940,626,314,288,1090,879],
 [0,914,280,340,144,1200],[280,914,364,340,451,1200],[644,914,286,340,776,1200],[930,914,324,340,1070,1200]
];
function prepare(im,oni,stride){
 const c=document.createElement('canvas');c.width=im.width;c.height=im.height;
 const ctx=c.getContext('2d'),pixels=(ctx.drawImage(im,0,0),ctx.getImageData(0,0,c.width,c.height));
 for(let i=0;i<pixels.data.length;i+=4){const d=pixels.data,r=d[i],g=d[i+1],b=d[i+2];if(r>140&&b>120&&r>g*1.6&&b>g*1.6)d[i+3]=0;}
 ctx.putImageData(pixels,0,0);if(oni)c.onigiri=prepare(oni);if(stride)c.stride=stride;return c;
}
function pose(p,time){
 if(p.special?.kind==='onigiri')return p.special.t<.18?12:p.special.t<.52?13:11;
 if(p.special?.kind==='tigertrap')return p.special.t<.48?14:p.special.t<.78?15:11;
 if(p.dash)return 6;
 if(p.blocking)return 8;
 if(p.hurtTime>0)return 7;
 if(p.attack)return p.attack.t<.07?9:p.attack.t<.19?10:11;
 if(!p.grounded&&!p.stairs)return p.vy<0?4:5;
 if(Math.abs(p.vx)>12||p.stairs)return [1,2,3,2][Math.floor((p.motion?.phase||time*2)*4)%4];
 return 0;
}
function sprite(ctx,im,index,x,y,scale=.3,alpha=1){
 if((index===12||index===13)&&im.onigiri){const sx=index===12?0:887,px=index===12?405:1310,k=scale*.4;ctx.save();ctx.globalAlpha*=alpha;ctx.drawImage(im.onigiri,sx,0,887,887,x+(sx-px)*k,y-756*k,887*k,887*k);ctx.restore();return;}
 const [sx,sy,w,h,px,py]=FRAMES[index];ctx.save();ctx.globalAlpha*=alpha;
 ctx.drawImage(im,sx,sy,w,h,x+(sx-px)*scale,y+(sy-py)*scale,w*scale,h*scale);ctx.restore();
}
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const ease=t=>1-Math.pow(1-clamp(t,0,1),3);
function update(p,dt){
 const v=p.zoroMotion||(p.zoroMotion={trail:[],sample:0});
 v.trail=v.trail.filter(q=>(q.life-=dt)>0);v.sample-=dt;
 if(p.special?.kind==='onigiri'&&p.special.t>=.18&&p.special.t<.52){
  if(v.sample<=0){v.trail.push({x:p.x,y:p.y,life:.12});v.sample=1/60;}
 }else v.trail=[];
}
function strideFrame(p){return Math.floor((p.motion?.phase||0)*8)%8;}
function glint(ctx,x,y,power){ctx.save();ctx.globalAlpha*=power;ctx.strokeStyle='#f5ffe0';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x-5,y);ctx.lineTo(x+5,y);ctx.moveTo(x,y-5);ctx.lineTo(x,y+5);ctx.stroke();ctx.restore();}
function special(ctx,im,p){
 const a=p.special,t=a.t,oni=a.kind==='onigiri';
 if(oni){
  const charge=clamp(t/.18,0,1),rush=t>=.18&&t<.52,recovery=clamp((t-.52)/.2,0,1);
  if(rush){for(const q of p.zoroMotion?.trail||[])sprite(ctx,im,13,(q.x-p.x)*p.facing,q.y-p.y,.3,q.life/.12*.16);}
  ctx.save();
  if(t<.18){ctx.translate(-4*ease(charge),2*charge);ctx.scale(1+.03*charge,1-.03*charge);}
  else if(rush){ctx.translate(0,-1);ctx.rotate(-.035);}
  else{ctx.translate(4*(1-ease(recovery)),0);ctx.rotate(.05*(1-recovery));}
  sprite(ctx,im,t<.18?12:t<.57?13:11,0,0,.3);ctx.restore();
  if(t<.18){glint(ctx,-9,-44,charge);glint(ctx,9,-44,charge);}
  if(rush){const q=(t-.18)/.34;ctx.save();ctx.lineCap='round';
   for(let i=0;i<3;i++){ctx.strokeStyle=['#dcffe8','#8addb6','#eef7ff'][i];ctx.lineWidth=i===1?2:1;ctx.globalAlpha=.6*(1-q*.4);ctx.beginPath();ctx.moveTo(-15,-27+i*9);ctx.quadraticCurveTo(-50,-30+i*10,-90-q*30,-25+i*9);ctx.stroke();}
   ctx.strokeStyle='#eaffd2';ctx.globalAlpha=Math.max(0,1-(t-.18)/.14);ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(26,-49);ctx.lineTo(70,-13);ctx.moveTo(26,-13);ctx.lineTo(70,-49);ctx.stroke();ctx.restore();
  }
  if(t>=.52){ctx.save();ctx.globalAlpha=(1-recovery)*.6;ctx.strokeStyle='#d9dfb0';for(let i=0;i<5;i++){const dx=-10-i*9-recovery*16,dy=-Math.sin(recovery*Math.PI)*(3+i);ctx.beginPath();ctx.moveTo(dx,dy);ctx.lineTo(dx-6,dy-2);ctx.stroke();}ctx.restore();glint(ctx,42,-12,Math.sin(recovery*Math.PI));}
 }else{
  const charge=clamp(t/.48,0,1),strike=clamp((t-.48)/.17,0,1),recover=clamp((t-.65)/.45,0,1);
  ctx.save();if(t<.48){ctx.translate(-3*charge,-2*charge);ctx.rotate(-.045*charge);}else{ctx.translate(6*(1-recover),3*Math.sin(strike*Math.PI)*(1-recover));ctx.rotate(.08*(1-recover));}
  sprite(ctx,im,t<.48?14:t<.86?15:11,0,0,.3);ctx.restore();
  if(t<.48){glint(ctx,-10,-78,charge);glint(ctx,7,-79,charge);ctx.save();ctx.globalAlpha=charge*.25;ctx.strokeStyle='#b3e9d0';ctx.beginPath();ctx.ellipse(0,0,16+charge*8,3,0,0,Math.PI*2);ctx.stroke();ctx.restore();}
  if(t>=.48&&t<.9){const fade=1-clamp((t-.58)/.32,0,1),angle=Math.atan2(a.dy,Math.abs(a.dx));ctx.save();ctx.translate(0,-26);ctx.rotate(angle);
   // Sweeping ribbons grow from the overhead blades into the aimed cutting lane.
   for(let i=0;i<3;i++){ctx.strokeStyle=['#f0ffe9','#8edbb9','#d6ecff'][i];ctx.globalAlpha=fade*(i===0?.9:.55);ctx.lineWidth=3-i*.7;ctx.beginPath();ctx.ellipse(45,0,65+i*5,47+i*3,-.3+i*.2,-2.1,-2.1+Math.max(.08,ease(strike)*3.2));ctx.stroke();}
   ctx.restore();if(t<.72){ctx.save();ctx.globalAlpha=fade*.75;ctx.strokeStyle='#edffcf';ctx.lineWidth=1.5;for(let i=0;i<7;i++){const r=(t-.48)*110,angle=-Math.PI+i*Math.PI/6;ctx.beginPath();ctx.moveTo(54+Math.cos(angle)*r,Math.sin(angle)*r*.4);ctx.lineTo(54+Math.cos(angle)*(r+7),Math.sin(angle)*(r+7)*.4);ctx.stroke();}ctx.restore();}}
 }
}
function draw(ctx,im,p,x,y,time){
 const index=pose(p,time);ctx.save();ctx.translate(Math.round(x),Math.round(y));ctx.scale(p.facing,1);
 const alpha=p.invuln>0&&Math.floor(time*16)%2?.48:1;
 ctx.globalAlpha*=alpha;
 if(p.special&&['onigiri','tigertrap'].includes(p.special.kind)){special(ctx,im,p);ctx.restore();return;}
 const moving=(p.grounded||p.stairs)&&(Math.abs(p.vx)>12||p.stairs)&&!p.dash&&!p.attack&&!p.blocking&&!(p.hurtTime>0);
 if(moving&&im.stride){const n=strideFrame(p);ctx.drawImage(im.stride,n*384,0,384,320,-192*.3,-284*.3,384*.3,320*.3);}
 else{if(p.dash)for(let n=3;n>0;n--)sprite(ctx,im,index,-n*17,0,.3,.09);sprite(ctx,im,index,0,0,.3);}
 const a=p.attack;
 if(a&&a.t>=.07&&a.t<=.19){const t=(a.t-.07)/.12;ctx.save();ctx.translate(0,-26);ctx.rotate(Math.atan2(a.dy,Math.abs(a.dx)));
  for(let i=0;i<3;i++){ctx.strokeStyle=['#f0ffe9','#acf3be','#d6ecff'][i];ctx.globalAlpha*=(1-t)*.85;ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(48,0,43,28+i*8,-.35+i*.3,-1.2+t*.4,1.2+t*.4);ctx.stroke();}ctx.restore();
 }
 if(p.blocking||p.parryFlash||p.blockFlash){ctx.strokeStyle=p.parryFlash?'#fff3ac':p.blockFlash?'#e1ffff':'#8be1c1';ctx.lineWidth=p.parryFlash?3:1.5;ctx.globalAlpha*=p.parryFlash||p.blockFlash?1:.5;ctx.beginPath();ctx.arc(8,-29,32,-1.15,1.15);ctx.stroke();}
 ctx.restore();
}
root.ZoroArt={prepare,pose,sprite,draw,update,strideFrame,frames:FRAMES};
if(typeof module!=='undefined')module.exports=root.ZoroArt;
})(typeof window!=='undefined'?window:globalThis);
