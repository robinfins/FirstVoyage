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
function prepare(im,oni){
 const c=document.createElement('canvas');c.width=im.width;c.height=im.height;
 const ctx=c.getContext('2d'),pixels=(ctx.drawImage(im,0,0),ctx.getImageData(0,0,c.width,c.height));
 for(let i=0;i<pixels.data.length;i+=4){const d=pixels.data,r=d[i],g=d[i+1],b=d[i+2];if(r>140&&b>120&&r>g*1.6&&b>g*1.6)d[i+3]=0;}
 ctx.putImageData(pixels,0,0);if(oni)c.onigiri=prepare(oni);return c;
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
function draw(ctx,im,p,x,y,time){
 const index=pose(p,time);ctx.save();ctx.translate(Math.round(x),Math.round(y));ctx.scale(p.facing,1);
 if(p.dash||p.special?.kind==='onigiri'&&p.special.t>=.18&&p.special.t<.52)for(let n=3;n>0;n--)sprite(ctx,im,index,-n*17,0,.3,.09);
 sprite(ctx,im,index,0,0,.3,p.invuln>0&&Math.floor(time*16)%2?.48:1);
 // Aim the three overlapping cutting arcs along the gameplay attack lane.
 const a=p.attack||p.special;
 if(a&&((p.attack&&a.t>=.07&&a.t<=.19)||(a.kind==='tigertrap'&&a.t>=.48&&a.t<.78))){
  const heavy=a.kind==='tigertrap',t=heavy?(a.t-.48)/.3:(a.t-.07)/.12;
  ctx.save();ctx.translate(0,-26);ctx.rotate(Math.atan2(a.dy,Math.abs(a.dx)));
  for(let i=0;i<3;i++){ctx.strokeStyle=['#f0ffe9','#acf3be','#d6ecff'][i];ctx.globalAlpha=(1-t)*.85;ctx.lineWidth=heavy?3:1.5;ctx.beginPath();ctx.ellipse(heavy?65:48,0,heavy?61:43,28+i*8,-.35+i*.3,-1.2+t*.4,1.2+t*.4);ctx.stroke();}ctx.restore();
 }
 if(p.blocking||p.parryFlash||p.blockFlash){ctx.strokeStyle=p.parryFlash?'#fff3ac':p.blockFlash?'#e1ffff':'#8be1c1';ctx.lineWidth=p.parryFlash?3:1.5;ctx.globalAlpha=p.parryFlash||p.blockFlash?1:.5;ctx.beginPath();ctx.arc(8,-29,32,-1.15,1.15);ctx.stroke();}
 ctx.restore();
}
root.ZoroArt={prepare,pose,sprite,draw,frames:FRAMES};
if(typeof module!=='undefined')module.exports=root.ZoroArt;
})(typeof window!=='undefined'?window:globalThis);
