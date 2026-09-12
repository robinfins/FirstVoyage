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
function updateKuro(g,dt){const b=g.boss,p=g.player;if(!b||b.hp<=0)return;b.hit=Math.max(0,b.hit-dt);
 if(!g.bossStarted){if(p.x<235)return;g.bossStarted=true;g.say('Captain Kuro',2);}
 b.phase=b.hp<=b.maxHp*.5?2:1;b.timer-=dt;
 if(b.state==='idle'){b.facing=p.x<b.x?-1:1;b.x=Math.max(80,Math.min(1080,b.x+b.facing*100*dt));if(b.timer<=0){const moves=b.phase===2?['lunge','slash','flurry','feint']:['lunge','slash','feint'];b.attack=moves[b.cycle++%moves.length];b.state='wind';b.timer=b.attack==='flurry'?.8:.52;b.aim=p.x;b.hits=0;}}
 else if(b.state==='wind'&&b.timer<=0){b.state='active';b.timer=b.attack==='flurry'?.8:b.attack==='slash'?.3:.32;b.vx=b.facing*(b.attack==='feint'?760:650);}
 else if(b.state==='active'){
  if(b.attack!=='slash')b.x=Math.max(65,Math.min(1095,b.x+b.vx*dt));
  if(b.attack==='flurry'&&b.timer<.8-(b.hits+1)*.22){b.hits++;b.facing=p.x<b.x?-1:1;b.vx=b.facing*720;}
  if(Math.abs(p.x-b.x)<(b.attack==='slash'?110:55)&&Math.abs(p.y-b.y)<65)g.hurt(1,b.x);
  if(b.timer<=0){b.state='recover';b.timer=b.attack==='flurry'?.9:.55;}
 }else if(b.state==='recover'&&b.timer<=0){b.state='idle';b.timer=b.phase===2?.15:.3;}
}
const api={stages,updateKuro};if(typeof module!=='undefined')module.exports=api;else root.ChapterTwo=api;
})(typeof window!=='undefined'?window:globalThis);
