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
 ctx.beginPath();ctx.moveTo(Math.round(sx),Math.round(sy));ctx.lineTo(Math.round(tx),Math.round(ty));ctx.stroke();ctx.strokeStyle=root.SpecialArt?.hot?'#ef9385':'#f2b681';ctx.lineWidth=width;ctx.stroke();
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
  if(a.t<.17||a.t>1.74){for(const side of [-1,1]){const s=shoulder(side);arm(ctx,s.x,s.y,x-a.dx*22+nx*side*7,y-27-a.dy*22+ny*side*7,5);}return;}
  // Staggered arms and fading echoes convey the barrage independently of damage ticks.
  for(let j=5;j>=0;j--){const phase=((a.t-.17)*11.75-j*.16)%1;if(phase<0)continue;
   const extension=25+140*Math.sin(phase*Math.PI),side=j%2?1:-1,spread=(j-2.5)*6,s=shoulder(side);
   arm(ctx,s.x,s.y,ox+a.dx*extension+nx*spread,oy+a.dy*extension+ny*spread,5,j<2?1:.18+(5-j)*.09);
  }
 }
}
function punch(ctx,im,a,x,y,scale,alpha=1){
 ctx.save();ctx.translate(x,y);ctx.scale(scale/.14,scale/.14);x=0;y=0;scale=.14;
 const facing=a.dx<0?-1:1,t=clamp(a.t/.25,0,1);
 // Coil, snap to full reach, briefly hold the contact pose, then recover.
 let reach=t<.2?-12*(t/.2):t<.5?-12+122*(1-Math.pow(1-(t-.2)/.3,3)):t<.62?110:110*Math.pow(1-(t-.62)/.38,2);
 const lean=reach>0?Math.min(3,reach*.035):reach*.1;
 ctx.save();ctx.globalAlpha=alpha;
 const bx=x+facing*lean,sy=y-42,sx=bx+facing*3;
 ctx.lineCap='round';ctx.strokeStyle='#282237';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(bx-facing*7,y-41);ctx.quadraticCurveTo(bx-facing*13,y-35,bx-facing*12,y-26);ctx.stroke();ctx.strokeStyle='#edb380';ctx.lineWidth=3;ctx.stroke();
 body(ctx,im,bx,y,scale,facing);
 const blend=clamp(reach/30,0,1),tx=sx+a.dx*reach,ty=sy+16*(1-blend)+a.dy*Math.max(0,reach);
 // Bent elbow during wind-up straightens into a single rubber arm on release.
 const ex=sx+a.dx*reach*.45-facing*7*(1-blend),ey=sy+(ty-sy)*.45+9*(1-blend);
 ctx.lineCap='round';ctx.lineJoin='round';
 for(const [color,width] of [['#282237',8],[root.SpecialArt?.hot?'#ef9385':'#edb380',5]]){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(sx,sy);ctx.quadraticCurveTo(ex,ey,tx,ty);ctx.stroke();}
 ctx.save();ctx.translate(tx,ty);ctx.rotate(Math.atan2(a.dy,a.dx));ctx.fillStyle='#282237';ctx.beginPath();ctx.moveTo(-4,-4);ctx.lineTo(4,-5);ctx.lineTo(7,-2);ctx.lineTo(7,3);ctx.lineTo(3,5);ctx.lineTo(-4,3);ctx.closePath();ctx.fill();ctx.fillStyle='#ffd19b';ctx.fillRect(-3,-3,8,6);ctx.fillStyle='#b87959';ctx.fillRect(2,-2,1,4);ctx.restore();
 if(t>.28&&t<.6){ctx.strokeStyle='#ffe7b977';ctx.lineWidth=1;for(const n of [-1,1]){ctx.beginPath();ctx.moveTo(tx-a.dx*30-a.dy*n*7,ty-a.dy*30+a.dx*n*7);ctx.lineTo(tx-a.dx*12-a.dy*n*7,ty-a.dy*12+a.dx*n*7);ctx.stroke();}}
 ctx.restore();ctx.restore();
}
root.SpecialArt={draw,punch};
})(typeof window!=='undefined'?window:globalThis);
