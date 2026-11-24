#!/usr/bin/env node
/**
 * W4 v5 — in-engine phase beats, combat UI lifecycle, locale audit (no phase CG).
 */
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(new URL('..', import.meta.url).pathname);
const PORT = Number(process.env.W4_PORT || 8154);
const OUT = process.env.OUT || process.argv[2] || 'test-output/v5/w4';
fs.mkdirSync(OUT, { recursive: true });

function startServer() {
  return spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], {
    cwd: ROOT,
    stdio: 'ignore',
  });
}

async function waitServer(url, tries = 50) {
  for (let i = 0; i < tries; i += 1) {
    try {
      const res = await fetch(url, { method: 'HEAD' });
      if (res.ok || res.status === 404) return;
    } catch { /* retry */ }
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error(`server did not boot on ${PORT}`);
}

const server = startServer();
const url = `http://127.0.0.1:${PORT}/`;
await waitServer(url);

const rows = [];
const errors = [];
function check(name, ok, detail = '') {
  rows.push({ name, ok: !!ok, detail: String(detail) });
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name} ${detail}`);
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('response', (r) => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });

await page.addInitScript(() => localStorage.setItem('dd.controlsBrief.v4', '1'));
await page.goto(url);
await page.waitForFunction(() => window.__debug && window.__game);

async function setLang(lang) {
  await page.evaluate((l) => {
    localStorage.setItem('dd.lang.v3', l);
  }, lang);
  await page.reload();
  await page.waitForFunction(() => window.__debug);
  await page.waitForFunction((l) => localStorage.getItem('dd.lang.v3') === l, lang);
}

async function fightSetup() {
  await page.evaluate(() => {
    window.__debug.startFight('deepseek');
    window.__debug.setGod(true);
    window.__debug.setDamageMul('player', 0);
  });
  await page.waitForTimeout(200);
}

for (const lang of ['zh', 'en']) {
  await setLang(lang);
  await fightSetup();
  check(`fight state ${lang}`, (await page.evaluate(() => window.__debug.state().state)) === 'fight');

  // Natural HP threshold → phase 2 (in-engine beat, no story CG)
  const p2 = await page.evaluate(() => {
    const b = window.__game.boss;
    b.hp = b.maxHp * 0.69;
    b.commit();
    return {
      phase: window.__debug.state().phase,
      beat: !!b.beat,
      storyCg: document.body.dataset.storyCg || '',
      freeze: !!window.__game.flags?.phaseCgFreeze,
    };
  });
  check(`natural P2 transition ${lang}`, p2.phase === 2 && p2.beat && !p2.freeze, JSON.stringify(p2));
  check(`no phase CG overlay P2 ${lang}`, !p2.storyCg.startsWith('phase-'), p2.storyCg);

  await page.waitForFunction(() => {
    const b = window.__game.boss;
    return b && b.phase === 2 && !b.beat && !b.transition;
  }, null, { timeout: 8000 });
  const mid2 = await page.evaluate(() => ({
    state: window.__debug.state().state,
    phase: window.__debug.state().phase,
    cg: document.querySelector('#story-cg:not(.is-hidden)')?.className || '',
  }));
  check(`P2 complete in fight ${lang}`, mid2.state === 'fight' && mid2.phase === 2, JSON.stringify(mid2));

  // Real production HP-threshold path to Opus; setup writes HP, not a debug phase jump.
  await page.evaluate(() => { const b=window.__game.boss; b.hp=b.maxHp*0.35; b.commit(); });
  const p3Beat=await page.evaluate(()=>!!window.__game.boss.beat);
  check(`natural P3 in-engine beat ${lang}`, p3Beat);
  await page.screenshot({path:`${OUT}/opus_transformation_${lang}.png`});
  await page.waitForFunction(()=>window.__game.boss.phase===3&&!window.__game.boss.beat&&!window.__game.boss.transition,null,{timeout:8000});
  const p3 = await page.evaluate(() => ({
    phase: window.__debug.state().phase,
    storyCg: document.body.dataset.storyCg || '',
  }));
  check(`natural P3 completed ${lang}`, p3.phase === 3, JSON.stringify(p3));
  check(`no phase CG P3 ${lang}`, !p3.storyCg.startsWith('phase-'), p3.storyCg);

  await page.evaluate(() => window.__debug.forcePattern('p1_refusal'));
  await page.waitForTimeout(500);
  const atkDom = await page.evaluate(() => ({
    toast: document.getElementById('claude-attack-toast')?.textContent?.trim() || '',
    hud: document.getElementById('attack-callout')?.textContent?.trim() || '',
  }));
  const hasCjk = /[\u4e00-\u9fff]/.test(`${atkDom.toast} ${atkDom.hud}`);
  if (lang === 'en') check(`attack labels EN no han ${lang}`, !hasCjk || (!atkDom.toast && !atkDom.hud), JSON.stringify(atkDom));
  else check(`attack labels CN ${lang}`, hasCjk || atkDom.toast.length > 0 || atkDom.hud.length > 0, JSON.stringify(atkDom));

  const names=await page.evaluate(async()=>{const {PATTERN}=await import('/src/config/balance.js');const {announce}=await import('/src/boss/patterns.js');const {bi}=await import('/src/data/lines.js');return Object.entries(PATTERN).map(([id,meta])=>{announce(window.__game,window.__game.boss,id);return{id,expected:bi(meta.name),actual:document.getElementById('claude-attack-toast').textContent.trim()};});});
  check(`all production move names selected-language ${lang}`,names.length>10&&names.every(x=>x.expected===x.actual),JSON.stringify(names));

  // Force production IP caption then Ending B — no leak on Dario phone beat
  await page.evaluate(async () => {
    const { forceMandatoryLine } = await import('/src/ui/claude.js');
    forceMandatoryLine(window.__game, '中国 IP');
  });
  const ipCap = await page.evaluate(() => document.getElementById('claude-combat-caption')?.textContent?.trim() || '');
  check(`production IP line ${lang}`, ipCap.length > 4, ipCap.slice(0, 60));

  await page.evaluate(() => window.__debug.triggerEnding('B'));
  await page.waitForFunction(() => window.__debug.state().state === 'theater', null, { timeout: 12000 });
  await page.waitForTimeout(3500);
  const leak = await page.evaluate(() => ({
    cap: document.getElementById('claude-combat-caption')?.textContent?.trim() || '',
    capVis: document.getElementById('claude-combat-caption')?.classList.contains('is-visible'),
    toast: document.getElementById('claude-attack-toast')?.hidden === false,
    theater: window.__debug.state().theaterShot,
  }));
  check(`no Claude caption after Ending B delay ${lang}`, !leak.capVis && leak.cap.length === 0, JSON.stringify(leak));
  check(`theater B active ${lang}`, /^(B1|B2|B3|B4|phone)/.test(leak.theater) || leak.theater?.startsWith('B'), leak.theater);
  await page.screenshot({ path: `${OUT}/ending_b_no_ip_leak_${lang}.png` });
  for(let n=0;n<20;n++){if(await page.evaluate(()=>window.__debug.state().theaterShot==='B4'))break;await page.keyboard.press('Space');await page.waitForTimeout(80);}
  const phone=await page.evaluate(()=>({shot:window.__debug.state().theaterShot,cap:document.getElementById('claude-combat-caption').textContent.trim(),visible:document.getElementById('claude-combat-caption').classList.contains('is-visible'),dario:document.getElementById('dario-bar').getClientRects().length>0,bubbles:document.querySelectorAll('.speech-bubble,.ally-bubble').length}));
  check(`Dario phone CG no combat remnants ${lang}`,phone.shot==='B4'&&!phone.cap&&!phone.visible&&!phone.dario&&phone.bubbles===0,JSON.stringify(phone));
  await page.screenshot({path:`${OUT}/dario_phone_no_combat_${lang}.png`});
  const exits=await page.evaluate(async()=>{const {forceMandatoryLine}=await import('/src/ui/claude.js');const {EVENTS}=await import('/src/core/contracts.js');const {setLanguage,getLanguage}=await import('/src/core/i18n.js');const l=getLanguage();return ['paused','banned','title','credits','select','intro','theater'].map(to=>{window.__debug.startFight('deepseek');forceMandatoryLine(window.__game,'中国 IP');window.__game.state.set(to);window.__game.bus.emit(EVENTS.BOSS_ATTACK,{name:{zh:'泄漏',en:'LEAK'}});const forced=forceMandatoryLine(window.__game,'中国 IP');setLanguage(l==='en'?'zh':'en');setLanguage(l);const cap=document.getElementById('claude-combat-caption');return{to,forced:!!forced,caption:cap.textContent,visible:cap.classList.contains('is-visible'),attack:document.getElementById('claude-attack-toast').textContent};});});
  check(`every state exit rejects event/forced/locale resurrection ${lang}`,exits.every(x=>!x.forced&&!x.caption&&!x.visible&&!x.attack),JSON.stringify(exits));



  await page.goto(url);
  await page.waitForFunction(() => window.__debug);
}

// BGM / locale spot — CN fight, muted Claude VO under EN
await setLang('en');
await fightSetup();
const voProbe = await page.evaluate(() => {
  window.__game.audio.clearPlayLog();
  window.__game.audio.unlock();
  window.__game.audio.playVo('v2_vo_haiku_attack');
  return window.__game.audio.getPlayLog().filter((e) => e.kind === 'vo' && /^v2_vo_(haiku|sonnet|opus)_/.test(e.id));
});
check('Claude VO muted EN', voProbe.length > 0 && voProbe.every((e) => e.muted), JSON.stringify(voProbe));

await page.screenshot({ path: `${OUT}/combat_flow_en.png` });

check('console and HTTP clean', errors.length === 0, errors.join(' | '));

const pass = rows.filter((r) => r.ok).length;
const fail = rows.length - pass;
fs.writeFileSync(`${OUT}/v5_combat_flow.json`, JSON.stringify({
  url, port: PORT, pass, fail, errors, rows,
  assists: 'setGod, setDamageMul player 0, commit HP thresholds, natural P3 HP threshold, production announce all patterns, forcePattern, forceMandatoryLine, triggerEnding B',
}, null, 2));
fs.writeFileSync(`${OUT}/v5_combat_flow.txt`, `${rows.map((r) => `${r.ok ? 'PASS' : 'FAIL'} ${r.name} ${r.detail}`).join('\n')}\nTOTAL ${pass} PASS / ${fail} FAIL\n`);

await browser.close();
server.kill('SIGTERM');
console.log(`TOTAL ${pass} PASS / ${fail} FAIL`);
process.exitCode = fail ? 1 : 0;