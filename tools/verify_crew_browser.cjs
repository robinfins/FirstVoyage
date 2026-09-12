// Run against a local static server: NODE_PATH=<Playwright packages> node tools/verify_crew_browser.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:process.env.CREW_BROWSER||'msedge'});
 try{
 const page=await browser.newPage({viewport:{width:1200,height:1000}}),errors=[];
 const out=process.env.CREW_QA_DIR||path.join(os.tmpdir(),'first-voyage-crew-qa');fs.mkdirSync(out,{recursive:true});
 page.on('requestfailed',r=>console.error('REQUEST FAILED',r.url(),r.failure()));
 page.on('pageerror',e=>{errors.push(e.message);console.error('PAGE ERROR',e.message)});page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('/favicon.ico'))errors.push(r.status()+' '+r.url());});
 await page.addInitScript(()=>localStorage.setItem('first-voyage-gate','1'));
 await page.goto(process.env.CREW_QA_URL||'http://127.0.0.1:8777/play/');
 await page.locator('#start:enabled').waitFor({timeout:15000}).catch(async e=>{console.error(await page.evaluate(()=>({loading:document.querySelector('#loading')?.textContent,scripts:[...document.scripts].map(s=>s.src),body:document.body.innerText.slice(0,800),state:typeof loaded==='undefined'?'no game script':{loaded,started,paused}})));await page.screenshot({path:path.join(out,'failure.png')});throw e;});await page.locator('#start').click();
 await page.waitForFunction(()=>document.querySelector('#game').dataset.hp==='600');
 await page.keyboard.down('KeyD');await page.waitForFunction(()=>game.player.x>=570);await page.keyboard.up('KeyD');await page.keyboard.press('KeyE');
 await page.locator('#rest-menu:not([hidden])').waitFor();await page.locator('#open-crew').click();
 await page.locator('#game').screenshot({path:path.join(out,'sunny-luffy.png')});
 await page.locator('.game-shell').screenshot({path:path.join(out,'crew-menu.png')});
 await page.getByRole('button',{name:/^Zoro/}).click();
 assert.equal(await page.evaluate(()=>game.character),'zoro');
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem(SAVE_KEY)).character),'zoro');
 await page.locator('#leave-rest').click();
 await page.waitForFunction(()=>document.querySelector('#bazooka').textContent.includes('Oni Giri'));
 await page.locator('#game').screenshot({path:path.join(out,'sunny-zoro.png')});
 await page.reload();await page.locator('#resume').waitFor({state:'visible'});await page.locator('#resume').click();
 assert.equal(await page.evaluate(()=>game.character),'zoro');
 await page.evaluate(()=>{game.loadStage('circus');game.boss=null;game.enemies=[];game.player.x=400;game.player.y=430;game.player.invuln=0;camera=targetCamera();});
 const box=await page.locator('#game').boundingBox();await page.mouse.move(box.x+box.width*.8,box.y+box.height*.5);
 await page.mouse.down({button:'right'});await page.waitForFunction(()=>game.player.blocking);
 await page.evaluate(()=>{const e={x:game.player.x+40,y:430,state:'active',hp:10};game.player.guardTime=.04;game.hurt(155,e.x,{kind:'melee',attacker:e});});
 assert.equal(await page.evaluate(()=>game.hp),600);
 await page.locator('#game').screenshot({path:path.join(out,'zoro-guard.png')});await page.mouse.up({button:'right'});
 await page.waitForFunction(()=>!game.player.blocking);
 await page.mouse.click(box.x+box.width*.8,box.y+box.height*.5);
 await page.waitForFunction(()=>!!game.player.attack);await page.waitForTimeout(400);
 await page.evaluate(()=>game.meter=300);await page.keyboard.press('KeyQ');await page.waitForFunction(()=>game.player.special?.kind==='onigiri');
 await page.waitForTimeout(220);await page.locator('#game').screenshot({path:path.join(out,'zoro-onigiri.png')});
 await page.waitForFunction(()=>!game.player.special);await page.waitForTimeout(150);
 await page.evaluate(()=>{game.buggyDefeated=true;game.applyLevel();game.hp=445;game.meter=300;});await page.keyboard.press('KeyR');
 await page.waitForFunction(()=>game.player.special?.kind==='tigertrap');
 await page.locator('#game').screenshot({path:path.join(out,'zoro-tiger-windup.png')});
 await page.waitForTimeout(470);await page.locator('#game').screenshot({path:path.join(out,'zoro-tiger-strike.png')});
 await page.waitForFunction(()=>!game.player.special);
 const alpha=await page.evaluate(()=>{const d=images.zoro.getContext('2d').getImageData(0,0,1254,1254).data;let clear=0,opaque=0,key=0;for(let i=0;i<d.length;i+=4){if(!d[i+3])clear++;else{opaque++;if(d[i]>200&&d[i+2]>200&&d[i+1]<100)key++;}}return {clear,opaque,key};});
 assert(alpha.clear>1000000);assert(alpha.opaque>100000);assert.equal(alpha.key,0);
 // Show all decoded poses at gameplay size to check gutters, footing and silhouettes.
 await page.evaluate(()=>{paused=true;const c=document.createElement('canvas');c.id='crew-proof';c.width=800;c.height=520;c.style.width='800px';c.style.height='520px';document.body.append(c);const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.fillStyle='#253951';g.fillRect(0,0,800,520);for(let i=0;i<16;i++){const x=i%4*200+100,y=Math.floor(i/4)*130+112;g.fillStyle='#91a7ba';g.font='12px monospace';g.fillText(['Idle','Run A','Run B','Run C','Jump','Fall','Dash','Hurt','Guard','Slash ready','Slash hit','Recovery','Oni ready','Oni rush','Tiger ready','Tiger chop'][i],x-60,y+14);g.strokeStyle='#415873';g.beginPath();g.moveTo(x-85,y);g.lineTo(x+85,y);g.stroke();ZoroArt.sprite(g,images.zoro,i,x,y,.4);}});
 await page.locator('#crew-proof').screenshot({path:path.join(out,'zoro-pose-proof.png')});
 assert.deepEqual(errors,[]);console.log('PASS Browser load, numeric HUD, checkpoint crew selection, save/reload, right-click guard, mouse slash, Q/R specials and keyed sprite transparency. Screenshots: '+out);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
