import { chromium } from 'playwright';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const out=process.env.OUT || 'test-output/v5/final/bundle';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true});const rows=[],errors=[],expectedAudioCancellations=[];
const check=(name,ok,detail)=>{rows.push({name,ok:!!ok,detail});console.log(`${ok?'PASS':'FAIL'} ${name} ${JSON.stringify(detail??'')}`)};
for (const [tag,url] of [['source','http://127.0.0.1:8091/'],['bundle_http','http://127.0.0.1:8093/'],['bundle_file',pathToFileURL(path.resolve('dist/index.html')).href]]) {
 const page=await browser.newPage({viewport:{width:1280,height:720}});const e=[];
 page.on('pageerror',x=>e.push(x.message));page.on('console',x=>{if(x.type()==='error')e.push(x.text())});page.on('response',r=>{if(r.status()>=400)e.push(`${r.status()} ${r.url()}`)});page.on('requestfailed',r=>{const why=r.failure()?.errorText; if(why==='net::ERR_ABORTED'&&/\.(mp3|wav|ogg)(\?|$)/.test(r.url()))expectedAudioCancellations.push({tag,url:r.url(),reason:why});else e.push(`${why} ${r.url()}`)});
 await page.addInitScript(()=>localStorage.setItem('dd.controlsBrief.v4','1'));
 await page.goto(url);await page.waitForFunction(()=>window.__debug);
 await page.evaluate(()=>{window.__debug.startFight('deepseek');window.__debug.setGod(true)});
 await page.waitForTimeout(200);check(tag+' fight boots',await page.evaluate(()=>window.__debug.state().state==='fight'));
 check(tag+' labeled HUD',await page.locator('#hud-hp-numeric').innerText().then(s => /100/.test(s)));
 await page.evaluate(()=>{window.__debug.setPhase(3);window.__debug.setBossHpRatio(.25)});await page.waitForFunction(()=>window.__debug.state().state==='theater');await page.waitForFunction(()=>{const el=document.querySelector('#theater img.theater-art:not(.is-hidden)');return el?.complete&&el.naturalWidth>=1280});
 check(tag+' direct full Fable CG',await page.evaluate(()=>{const el=document.querySelector('#theater img.theater-art:not(.is-hidden)');return window.__debug.state().theaterShot==='B1'&&el?.complete&&el.naturalWidth>=1280}));
 await page.screenshot({path:`${out}/${tag}_fable.png`});
 if(tag==='bundle_http') {
  await page.reload();await page.waitForFunction(()=>window.__debug);
  await page.evaluate(()=>{window.__hitProof=[];window.__debug.startFight('glm');window.__debug.setPhase(3);window.__debug.setGod(false);window.__debug.setDamageMul('boss',50);window.__game.bus.on('hit',h=>{if(h.dst?.team==='player'&&h.applied>0)window.__hitProof.push({applied:h.applied,hp:h.dst.hp,src:h.src?.id});});});
  const held=new Set(),until=Date.now()+18000;
  while(Date.now()<until){const s=await page.evaluate(()=>window.__debug.state());if(s.state==='theater')break;const wanted=new Set();const dx=s.bossX-s.player.x,dy=s.bossY-s.player.y;if(Math.abs(dx)>7)wanted.add(dx>0?'d':'a');if(Math.abs(dy)>7)wanted.add(dy>0?'s':'w');for(const k of held)if(!wanted.has(k)){await page.keyboard.up(k);held.delete(k)}for(const k of wanted)if(!held.has(k)){await page.keyboard.down(k);held.add(k)}await page.waitForTimeout(130);}
  for(const k of held)await page.keyboard.up(k);
  const proof=await page.evaluate(()=>({state:window.__debug.state().state,shot:window.__debug.state().theaterShot,hits:window.__hitProof}));check('real enemy hit causes direct Ending A (P3 + boss damage x50 setup assist; real WASD)',proof.state==='theater'&&proof.shot==='A1'&&proof.hits.length>0,proof);await page.screenshot({path:`${out}/real_enemy_hit_astra_rescue.png`});
 }
 check(tag+' no console/network failures',e.length===0,e);errors.push(...e);await page.close();
}
await browser.close();const report={pass:rows.filter(x=>x.ok).length,fail:rows.filter(x=>!x.ok).length,errors,expectedAudioCancellations,rows,assists:'debug startFight/setGod/setPhase/B threshold; natural A uses boss damage x50 and WASD pursuit, never killPlayer or HP writes; controls briefing pre-acknowledged.'};fs.writeFileSync(`${out}/report.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report));process.exitCode=report.fail?1:0;
