(function(root){
const stages={
 // Syrup is gated behind Buggy, so it is always played at level 2 or better: its Black Cat crew
 // carries half again the chapter-one health to keep hits-to-kill in the same range.
 syrup:{name:'Syrup Village · Black Cat ambush',width:3700,spawn:{x:100,y:430},floor:430,enemyHp:1.5,
 platforms:[{x:0,end:620,y:430,id:'village-entry'},{x:700,end:860,y:350,id:'root-a'},{x:950,end:1130,y:280,id:'root-b'},{x:1240,end:1390,y:340,id:'root-c'},{x:1490,end:2140,y:430,id:'village-square'},{x:2220,end:2390,y:350,id:'roof-a'},{x:2480,end:2650,y:275,id:'roof-b'},{x:2740,end:2900,y:345,id:'roof-c'},{x:3010,end:3700,y:430,id:'mansion-gates'}],
 hazards:[{x:1870,end:1940,y:430},{x:3160,end:3230,y:430}],
 checkpoints:[{id:'syrup-a',x:260,y:430,name:'Village landing snail'},{id:'syrup-b',x:1640,y:430,name:'Village square snail'},{id:'syrup-c',x:3460,y:430,name:'Mansion gate snail'}],
 exits:[{x:55,y:430,to:'sunny',label:'Return to Sunny'},{x:3610,y:430,to:'mansion',label:'Challenge Captain Kuro'}],
 zones:[{x:0,name:'Black Cat landing'},{x:620,name:'Woodland ascent'},{x:1490,name:'Village ambush'},{x:2140,name:'Rooftop pursuit'},{x:3010,name:'Mansion approach'}],
 enemies:[{type:'cutlass',x:510},{type:'cutlass',x:1010,y:280},{type:'brute',x:1850},{type:'cutlass',x:2030},{type:'bomber',x:2550,y:275},{type:'cutlass',x:2830,y:345},{type:'brute',x:3240}]},
 mansion:{name:'Syrup Village · Kuro’s mansion',width:1160,spawn:{x:100,y:430},floor:430,platforms:[{x:0,end:1160,y:430,id:'kuro-arena'}],checkpoints:[],enemies:[],exits:[{x:70,y:430,to:'syrup',label:'Return to village'},{x:1070,y:430,to:'sunny',label:'Return victorious'}]}
};
// Phase two uses its own patterns and immediately discards the phase-one bag.
function updateKuro(g,dt){const b=g.boss,p=g.player;if(!b||b.hp<=0)return;
 const clamp=x=>Math.max(65,Math.min(1095,x));
 const face=()=>{b.facing=p.x<b.x?-1:1;b.aim=clamp(p.x+p.vx*.18);};
 const wind=(seconds)=>{face();b.state='wind';b.timer=seconds;b.windTotal=seconds;b.anim=0;b.released=false;};
 const volley=(speed=360)=>{const angle=Math.atan2(p.y-26-(b.y-42),p.x-b.x);for(const spread of [-.16,0,.16])g.projectiles.push({kind:'clawwave',x:b.x+b.facing*48,y:b.y-42,vx:Math.cos(angle+spread)*speed,vy:Math.sin(angle+spread)*speed,t:2.6,damage:1});g.emit('claw-sweep');};
 b.hit=Math.max(0,b.hit-dt);
 if(!g.bossStarted){if(p.x<235)return;g.bossStarted=true;g.say('Captain Kuro',2);}
 if(b.phase===1&&b.hp<=b.maxHp*.5){b.phase=2;b.state='split';b.timer=1.05;b.anim=0;b.y=430;b.vy=0;b.moves=[];g.projectiles=[];g.say('OUT OF THE BAG · Kuro stops holding back',2.4);g.emit('kuro-phase');return;}
 b.timer-=dt;b.anim=(b.anim||0)+dt;
 if(b.state==='split'){if(b.timer<=0){b.state='idle';b.timer=.12;}return;}
 if(b.state==='idle'){
  face();if(Math.abs(p.x-b.x)>160)b.x=clamp(b.x+b.facing*(b.phase===2?170:115)*dt);
  if(b.timer<=0){if(!b.moves?.length){b.moves=b.phase===2?['flurry','hunt','pounce','crosscut']:['lunge','slash','feint','dive','clawwave'];for(let i=b.moves.length-1;i>0;i--){const j=Math.floor(g.random()*(i+1));[b.moves[i],b.moves[j]]=[b.moves[j],b.moves[i]];}if(b.moves.at(-1)===b.attack)[b.moves[0],b.moves[b.moves.length-1]]=[b.moves.at(-1),b.moves[0]];}
   b.attack=b.moves.pop();b.combo=0;b.hits=0;wind(['dive','pounce'].includes(b.attack)?.7:b.phase===2?.5:.6);
  }
 }else if(b.state==='wind'){
  if(b.attack==='feint')b.x=clamp(b.x-b.facing*140*dt);
  if(b.timer<=0){b.state='active';b.anim=0;b.timer=['dive','pounce'].includes(b.attack)?1.2:b.attack==='flurry'?1.05:b.attack==='hunt'?.23:['clawwave','crosscut'].includes(b.attack)?.56:b.attack==='slash'?.48:.36;b.activeTotal=b.timer;b.vx=b.facing*(b.attack==='hunt'?950:b.attack==='feint'?820:650);
   if(['dive','pounce'].includes(b.attack)){b.vy=b.attack==='pounce'?-420:-480;b.vx=(b.aim-b.x)/(b.attack==='pounce'?.84:.96);}
  }
 }else if(b.state==='active'){
  if(['clawwave','crosscut'].includes(b.attack)&&!b.released&&b.anim>=.14){b.released=true;volley(b.phase===2?460:360);}
  if(['lunge','feint','flurry','hunt'].includes(b.attack))b.x=clamp(b.x+b.vx*dt);
  if(b.attack==='flurry'&&b.timer<1.05-(b.hits+1)*.24){b.hits++;face();b.vx=b.facing*800;}
  if(['dive','pounce'].includes(b.attack)){b.vy+=1000*dt;b.y+=b.vy*dt;b.x=clamp(b.x+b.vx*dt);if(b.y>=430&&b.vy>0){b.y=430;b.vy=0;b.timer=0;g.projectiles.push({kind:'blast',x:b.x,y:415,t:.22,radius:b.attack==='pounce'?76:65,damage:1});g.emit('boom');}}
  if(!['clawwave','crosscut'].includes(b.attack)&&Math.abs(p.x-b.x)<(b.attack==='slash'?108:48)&&Math.abs(p.y-b.y)<60)g.hurt(1,b.x);
  if(b.timer<=0){const count=b.attack==='hunt'?3:['pounce','crosscut'].includes(b.attack)?2:1;b.combo++;
   if(b.combo<count){wind(b.attack==='hunt'?.3:b.attack==='pounce'?.42:.24);}
   else{b.state='recover';b.anim=0;b.timer=b.phase===2?.75:['flurry','dive'].includes(b.attack)?.85:.48;}
  }
 }else if(b.state==='recover'&&b.timer<=0){b.state='idle';b.timer=b.phase===2?.1:.24;b.anim=0;}
}
// Fast travel groups snails by island, so the chapter names its own landmass rather than leaving
// core.js to know which of its stages belong together.
const islands=[{id:'syrup-village',name:'Syrup Village',stages:['syrup','mansion']}];
const api={stages,islands,updateKuro};if(typeof module!=='undefined')module.exports=api;else root.ChapterTwo=api;
})(typeof window!=='undefined'?window:globalThis);
