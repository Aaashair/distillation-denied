import {chromium} from 'playwright';
import fs from 'node:fs';
const out=process.env.OUT||'test-output/v3/final';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:1280,height:720}});const errors=[],rows=[];
page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`)});
const check=(name,ok,detail='')=>{rows.push({name,ok:!!ok,detail});console.log(`${ok?'PASS':'FAIL'} ${name} ${detail}`)};
for(const lang of ['en','zh']){
 await page.goto('http://localhost:8091/');await page.evaluate(l=>localStorage.setItem('dd.lang.v3',l),lang);await page.reload();await page.waitForFunction(()=>window.__debug);
 for(const ending of ['A','B']){
  await page.evaluate(id=>{window.__debug.startFight('deepseek');window.__debug.setPhase(3);if(id==='A')window.__debug.killPlayer();else window.__debug.setBossHpRatio(.25)},ending);
  await page.waitForTimeout(1300);await page.keyboard.press('Enter');await page.waitForFunction(()=>window.__debug.state().state==='theater',null,{timeout:10000});await page.waitForTimeout(500);await page.keyboard.press('Enter');await page.waitForTimeout(250);
  if(ending==='B'){await page.waitForTimeout(1000);await page.keyboard.press('Enter');await page.waitForTimeout(400);await page.keyboard.press('Enter');await page.waitForTimeout(200)}
  const text=await page.locator('#theater-sub').innerText();const id=await page.locator('#theater').getAttribute('data-shot');
  check(`${ending} ${lang} selected subtitle`,text.length>0&&(lang==='en'?!/[\u4e00-\u9fff]/.test(text):/[\u4e00-\u9fff]/.test(text)),`${id}: ${text}`);
  check(`${ending} ${lang} removed narration absent`,!text.includes('你们被救不是因为')&&!text.includes('不是因为你重要'));
  await page.screenshot({path:`${out}/ending_${ending}_${lang}.png`});
 }
}
check('ending browser HTTP/console clean',!errors.length,errors.join(' | '));
const pass=rows.filter(r=>r.ok).length,fail=rows.length-pass;console.log(`TOTAL ${pass} PASS / ${fail} FAIL`);fs.writeFileSync(`${out}/ending_locale.json`,JSON.stringify({pass,fail,rows,errors,assists:'Debug startFight, setPhase, killPlayer/HP threshold; Enter skips engine animation. Full rescue frame evidence is separate v3_story suite.'},null,2));await browser.close();process.exitCode=fail?1:0;
