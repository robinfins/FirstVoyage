/* Shared runtime animation for gameplay and the move-study page. */
(function(root){
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function body(ctx,im,x,y,scale,facing){
 ctx.save();ctx.translate(Math.round(x),Math.round(y));ctx.scale(facing*scale,scale);ctx.translate(-448,-536);
 // Keep the original head, vest and legs; articulate both arms separately.
 ctx.save();ctx.beginPath();ctx.moveTo(358,78);ctx.lineTo(555,78);ctx.lineTo(548,203);ctx.lineTo(520,231);ctx.lineTo(441,231);ctx.lineTo(358,211);ctx.closePath();
 ctx.rect(250,306,410,236);ctx.moveTo(412,218);ctx.lineTo(468,240);ctx.lineTo(481,312);ctx.lineTo(379,312);ctx.closePath();ctx.clip();
 ctx.drawImage(im,0,0,896,576,0,0,896,576);ctx.restore();
 // Cover the resting fist in the source pose with the open vest front.
 ctx.fillStyle='#a91427';ctx.beginPath();ctx.moveTo(414,224);ctx.lineTo(438,239);ctx.lineTo(420,325);ctx.lineTo(382,325);ctx.closePath();ctx.fill();
 ctx.fillStyle='#e42c34';ctx.beginPath();ctx.moveTo(418,233);ctx.lineTo(430,243);ctx.lineTo(411,316);ctx.lineTo(393,316);ctx.closePath();ctx.fill();
 ctx.restore();
}
function arm(ctx,sx,sy,tx,ty,width,alpha=1){
 ctx.save();ctx.globalAlpha=alpha;ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle='#252238';ctx.lineWidth=width+3;
 ctx.beginPath();ctx.moveTo(Math.round(sx),Math.round(sy));ctx.lineTo(Math.round(tx),Math.round(ty));ctx.stroke();ctx.strokeStyle='#f2b681';ctx.lineWidth=width;ctx.stroke();
 ctx.fillStyle='#282237';ctx.fillRect(Math.round(tx-7),Math.round(ty-6),15,13);ctx.fillStyle='#ffca92';ctx.fillRect(Math.round(tx-5),Math.round(ty-4),11,9);ctx.fillStyle='#ce855b';for(let k=-3;k<=3;k+=3)ctx.fillRect(Math.round(tx+k),Math.round(ty-4),1,4);ctx.restore();
}
function draw(ctx,im,a,x,y,scale){
 const facing=a.dx<0?-1:1,ox=x,oy=y-26,nx=-a.dy,ny=a.dx;
 const shoulder=(side)=>({x:x+side*5,y:y-39+side*2});
 if(a.kind==='bazooka'){
  let extension;
  if(a.t<.5)extension=-25-115*Math.pow(a.t/.5,.7);
  else if(a.t<.62)extension=-140+350*(a.t-.5)/.12;
  else if(a.t<.73)extension=210;
  else extension=210*(1-clamp((a.t-.73)/.39,0,1));
  const punch=(side)=>{const s=shoulder(side);arm(ctx,s.x,s.y,ox+a.dx*extension+nx*side*7,oy+a.dy*extension+ny*side*7,6);};
  punch(-1);body(ctx,im,x,y,scale,facing);punch(1);
  if(a.t>.59&&a.t<.87){const f=(a.t-.59)/.28;ctx.save();ctx.translate(ox+a.dx*210,oy+a.dy*210);ctx.rotate(Math.atan2(a.dy,a.dx));ctx.strokeStyle=`rgba(255,227,159,${1-f})`;ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(0,0,10+f*25,20+f*30,0,0,Math.PI*2);ctx.stroke();ctx.restore();}
 }else{
  body(ctx,im,x,y,scale,facing);
  if(a.t<.17||a.t>2.94){for(const side of [-1,1]){const s=shoulder(side);arm(ctx,s.x,s.y,x-a.dx*22+nx*side*7,y-27-a.dy*22+ny*side*7,5);}return;}
  // Staggered arms and fading echoes convey the barrage independently of damage ticks.
  for(let j=5;j>=0;j--){const phase=((a.t-.17)*6.9-j*.16)%1;if(phase<0)continue;
   const extension=25+140*Math.sin(phase*Math.PI),side=j%2?1:-1,spread=(j-2.5)*6,s=shoulder(side);
   arm(ctx,s.x,s.y,ox+a.dx*extension+nx*spread,oy+a.dy*extension+ny*spread,5,j<2?1:.18+(5-j)*.09);
  }
 }
}
function meter(ctx,value,time=0,x=20,y=68){
 for(let i=0;i<3;i++){const fraction=clamp((value-i*100)/100,0,1),left=x+i*84;
  ctx.fillStyle='#111d2e';ctx.fillRect(left,y,79,15);ctx.strokeStyle=fraction===1?'#f3cd80':'#576478';ctx.lineWidth=1;ctx.strokeRect(left+.5,y+.5,78,14);
  if(fraction>0){ctx.fillStyle=i===2?'#f49a5a':'#e7bf6b';ctx.fillRect(left+3,y+3,Math.floor(73*fraction),9);ctx.fillStyle='#ffe8b155';ctx.fillRect(left+3,y+3,Math.floor(73*fraction),3);}
  if(fraction===1){ctx.fillStyle='#ffe4a6';ctx.globalAlpha=.35+.2*Math.sin(time*4);ctx.fillRect(left+3,y+3,73,9);ctx.globalAlpha=1;}
 }
}
root.SpecialArt={draw,meter};
})(typeof window!=='undefined'?window:globalThis);
