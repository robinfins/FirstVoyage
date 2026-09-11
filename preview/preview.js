'use strict';
const $=id=>document.getElementById(id), ctx=$('scene').getContext('2d'), pc=$('pose').getContext('2d');
const images={}, enabled={}, failures=[];let ready=false, paused=false, posePaused=false, time=0, poseTime=0, last=0, frame=0, trail=1, trailWait=0;
const layerNames={sky:'Sky',islands:'Distant islands',sea:'Sea',architecture:'Architecture',foreground:'Foreground surf',props:'Flag & checkpoint',hud:'Health overlays'};
for(const [key,label] of Object.entries(layerNames)){enabled[key]=true;const l=document.createElement('label'),i=document.createElement('input');i.type='checkbox';i.checked=true;i.addEventListener('change',()=>enabled[key]=i.checked);l.append(i,document.createTextNode(' '+label));$('layer-controls').append(l);}
const load=([key,path])=>new Promise(resolve=>{const im=new Image();im.onload=()=>{images[key]=im;resolve();};im.onerror=()=>{failures.push(key);resolve();};im.src='../assets/chapter-01/'+path;});
const entries=Object.entries(PACK.files).concat(['player-frame','player-fill','boss-frame','boss-fill'].map(k=>[k,'ui/'+k+'.svg']));
Promise.all(entries.map(load)).then(()=>{ready=true;$('load-state').textContent=failures.length?'Missing: '+failures.join(', '):'Artwork loaded';});
$('reduce').checked=matchMedia('(prefers-reduced-motion: reduce)').matches;
$('pause').onclick=()=>{paused=!paused;$('pause').textContent=paused?'Resume motion':'Pause motion';$('pause').setAttribute('aria-pressed',paused);};
$('pose-pause').onclick=()=>{posePaused=!posePaused;$('pose-pause').textContent=posePaused?'Resume poses':'Pause poses';$('pose-pause').setAttribute('aria-pressed',posePaused);};
$('camera').oninput=()=>{$('auto').checked=false;};
$('player-hp').oninput=()=>$('player-value').textContent=$('player-hp').value+' / 5';
$('boss-hp').oninput=()=>{const target=+$('boss-hp').value/100;if(target>trail)trail=target;trailWait=.35;$('boss-value').textContent=$('boss-hp').value+'%';};
function clips(){return PACK.animations[$('actor').value];}
function resetClips(){const sel=$('clip');sel.replaceChildren();for(const k of Object.keys(clips())){const o=document.createElement('option');o.value=k;o.textContent=k;sel.append(o);}frame=0;poseTime=0;}
$('actor').onchange=resetClips;$('clip').onchange=()=>{frame=0;poseTime=0;};resetClips();
$('step').onclick=()=>{posePaused=true;$('pose-pause').textContent='Resume poses';$('pose-pause').setAttribute('aria-pressed','true');frame=(frame+1)%clips()[$('clip').value].length;};
function image(key,x,y,w,h,alpha=1){const im=images[key];if(!im)return;ctx.save();ctx.globalAlpha=alpha;ctx.drawImage(im,Math.round(x),Math.round(y),w,h);ctx.restore();}
function part(key,index,x,y,w,h,context=ctx){const im=images[key],r=PACK.frames[key]?.[index];if(!im||!r)return;context.drawImage(im,...r,Math.round(x),Math.round(y),w,h);}
function ocean(t,cam,waterline,foreground){
  const key='ocean-wave-cycle',r=PACK.props[key];
  const i=Math.floor(t*4)%4;
  const y=foreground?waterline-r.pivot[1]:224-r.pivot[1]*.45;
  const height=foreground?64:29;
  const drift=Math.round(Math.sin(t*.24)*9-cam*.08);
  part(key,i,-64+drift,y,768,height);
  // Exact same opaque color as the cleaned strip's bottom edge.
  ctx.fillStyle=r.base_color;ctx.fillRect(0,Math.floor(y+height)-1,640,360-Math.floor(y+height)+1);
}
function anchoredProp(key,index,x,y,scale){
  const spec=PACK.props[key];part(key,index,x-spec.pivot[0]*scale,y-spec.pivot[1]*scale,spec.cell_size[0]*scale,spec.cell_size[1]*scale);
}
function sprite(key,index,x,y,scale,context=ctx,showParts=true){
  const spec=PACK.sprites[key];if(!spec)return;
  part(key,index,x-spec.pivot[0]*scale,y-spec.pivot[1]*scale,spec.cell_size[0]*scale,spec.cell_size[1]*scale,context);
  if(showParts&&key!=='luffy')for(const piece of spec.frames[index].parts){
    if(piece.pixel_area<1000)continue;
    const im=images[piece.id];if(im)context.drawImage(im,Math.round(x+piece.offset[0]*scale),Math.round(y+piece.offset[1]*scale),piece.size[0]*scale,piece.size[1]*scale);
  }
}
function ground(kind,cam){ctx.fillStyle=kind==='dock'?'#60463e':'#363543';ctx.fillRect(0,278,640,82);ctx.fillStyle=kind==='dock'?'#bf8c5c':'#a28a74';ctx.fillRect(0,278,640,4);ctx.fillStyle='#212533';for(let x=-32-(Math.round(cam)%32);x<640;x+=32){ctx.fillRect(x,284,2,70);for(let y=300;y<360;y+=20)ctx.fillRect(x,y,32,2);}}
function hud(stage){if(!enabled.hud)return;image('player-frame',12,12,204,36);const hp=+$('player-hp').value/5;const p=images['player-fill'];if(p&&hp>0)ctx.drawImage(p,0,0,152*hp,12,50,24,152*hp,12);ctx.fillStyle='#111a2c';for(let n=1;n<5;n++)ctx.fillRect(50+Math.round(152*n/5),24,2,12);ctx.fillStyle='#111a2c';ctx.fillRect(49,13,91,9);ctx.font='bold 8px monospace';ctx.fillStyle='#fff0cd';ctx.fillText('LUFFY  '+$('player-hp').value+'/5',52,21);
if(stage==='circus'){image('boss-frame',90,314,460,32);ctx.fillStyle='#f1c68d';ctx.fillRect(114,326,Math.round(412*trail),8);const v=+$('boss-hp').value/100,b=images['boss-fill'];if(b&&v>0)ctx.drawImage(b,0,0,412*v,8,114,326,412*v,8);ctx.textAlign='center';ctx.font='bold 10px monospace';ctx.fillStyle='#fff0cd';ctx.fillText('BUGGY THE CLOWN',320,310);ctx.textAlign='left';}}
function scene(){
  const stage=$('stage').value,reduce=$('reduce').checked;
  let cam=(+$('camera').value-50)*2;
  if($('auto').checked&&!reduce){cam=Math.sin(time*.16)*80;$('camera').value=50+cam/2;}
  const t=reduce?0:time,g=SceneGeometry.get(stage,cam,t,reduce);
  ctx.imageSmoothingEnabled=false;ctx.fillStyle='#182844';ctx.fillRect(0,0,640,360);
  if(enabled.sky)image('sunset-sky',-16-cam*.03,-32,680,392);
  if(enabled.islands&&g.water)image('distant-islands',-50-cam*.12,25,760,200,.7);
  if(g.water){
    if(enabled.sea){ctx.fillStyle='#082740';ctx.fillRect(0,224,640,136);ocean(t,cam,g.waterline,false);}
    const ship=g.ship;
    if(enabled.architecture)image('sunny-ship-layer',ship.x,ship.y,ship.w,ship.h);
    if(enabled.props&&enabled.architecture){
      // This extends the source image's cropped main mast. The flag hoist is above the sail.
      ctx.fillStyle='#382a28';ctx.fillRect(g.flag.x-2,g.flag.y-5,4,g.flag.mastEndY-g.flag.y+5);
      ctx.fillStyle='#c58b4b';ctx.fillRect(g.flag.x-1,g.flag.y-5,1,g.flag.mastEndY-g.flag.y+5);
      anchoredProp('sunny-flag-cycle',Math.floor(t*6)%4,g.flag.x,g.flag.y,.10);
    }
  } else {
    if(enabled.architecture){
      image('orange-town-buildings',-150-cam*.55,stage==='streets'?15:63,980,stage==='streets'?279:230,stage==='circus'?.45:1);
      if(stage==='circus')image('circus-tent-layer',-22-cam*.12,24,684,270);
    }
    ground(stage,cam);
  }
  if(enabled.props){
    for(const point of g.checkpoints){
      anchoredProp('checkpoint-snail',2+Math.floor(t*1.5)%2,point.x,point.y,point.scale);
      ctx.fillStyle='#111a2c';ctx.fillRect(Math.round(point.x-22),Math.round(point.y-42),44,10);
      ctx.fillStyle='#f5dba6';ctx.font='7px monospace';ctx.textAlign='center';ctx.fillText('[E] REST',Math.round(point.x),Math.round(point.y-34));ctx.textAlign='left';
    }
    sprite('luffy',0,g.player.x,g.player.y,1/7);
    if(stage==='circus')sprite('buggy-melee',Math.floor(t*2)%2,465-cam*.2,g.groundY,1/5);
  }
  if(g.water&&enabled.foreground)ocean(t+.5,cam,g.waterline,true);
  hud(stage);
}
function pose(){
  const key=$('actor').value,sequence=clips()[$('clip').value],f=sequence[frame%sequence.length],spec=PACK.sprites[key];
  pc.imageSmoothingEnabled=false;pc.fillStyle=$('pose-background').value;pc.fillRect(0,0,480,300);
  const scale=Math.min(450/spec.cell_size[0],270/spec.cell_size[1]);
  if($('show-pivot').checked){pc.strokeStyle='#658492';pc.lineWidth=1;pc.beginPath();pc.moveTo(20,280.5);pc.lineTo(460,280.5);pc.moveTo(240.5,265);pc.lineTo(240.5,295);pc.stroke();}
  sprite(key,f,240,280,scale,pc,$('show-parts').checked);
  const caption=$('clip').value+' · '+PACK.labels[key][f]+' · pose '+(f+1)+'/'+spec.frames.length;
  if($('pose-caption').textContent!==caption)$('pose-caption').textContent=caption;
  $('sheet-link').href='../assets/chapter-01/'+PACK.files[key];
}
for(const key of ['luffy','pirate-cutlass','pirate-brute','pirate-bomber','buggy-melee','buggy-specials','checkpoint-snail','ocean-wave-cycle','sunny-flag-cycle']){const fig=document.createElement('figure'),a=document.createElement('a'),im=document.createElement('img'),cap=document.createElement('figcaption');a.href='../assets/chapter-01/'+PACK.files[key];im.src=a.href;im.alt=key.replaceAll('-',' ')+' source sheet';im.loading='lazy';a.append(im);cap.textContent=key.replaceAll('-',' ');fig.append(a,cap);$('gallery').append(fig);}
function tick(now){const dt=Math.min((now-(last||now))/1000,.05);last=now;if(!paused&&!document.hidden)time+=dt;if(!posePaused&&!$('reduce').checked&&!document.hidden){poseTime+=dt;if(poseTime>.28){frame++;poseTime=0;}}if(!paused){if(trailWait>0)trailWait-=dt;else trail=Math.max(+$('boss-hp').value/100,trail-dt*.7);}if(ready){scene();pose();}requestAnimationFrame(tick);}requestAnimationFrame(tick);
