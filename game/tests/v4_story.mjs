// W2 v4 story: direct theater CG (no engine cutscene), HQ Fable + Astra plates.
//   PORT=8120 node tests/v4_story.mjs

import { chromium } from 'playwright';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getAsset } from '../src/config/assets.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PORT = Number(process.env.PORT || 8120);
const BASE = `http://127.0.0.1:${PORT}/`;
const OUT = process.env.OUT || 'test-output/v4/w2';
fs.mkdirSync(OUT, { recursive: true });

const V4_EXPECT = {
  'end.A.rescue': 'assets/v4/astra_rescue_cg.png',
  'end.A3': 'assets/v4/astra_establishing.png',
  'end.B1': 'assets/v4/fable_establishing.png',
  'end.B2': 'assets/v4/fable_takes_opus.png',
};

const rows = [];
const errors = [];

function pass(name, ok, detail) {
  rows.push({ name, ok: !!ok, detail: detail || '' });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}  ${detail || ''}`);
}

function startServer() {
  return spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], {
    cwd: ROOT,
    stdio: 'ignore',
  });
}

async function waitServer() {
  const t0 = Date.now();
  while (Date.now() - t0 < 8000) {
    try {
      const r = await fetch(BASE);
      if (r.ok) return;
    } catch { /* wait */ }
    await new Promise((r) => setTimeout(r, 120));
  }
  throw new Error(`server not up :${PORT}`);
}

async function state(page) {
  return page.evaluate(() => (window.__debug ? window.__debug.state() : null));
}

async function until(page, pred, ms = 12000) {
  const end = Date.now() + ms;
  let last = null;
  while (Date.now() < end) {
    last = await state(page);
    if (last && pred(last)) return last;
    await page.waitForTimeout(100);
  }
  return last;
}

function watch(page) {
  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning') errors.push(`[${msg.type()}] ${msg.text()}`);
  });
  page.on('pageerror', (err) => errors.push(`[pageerror] ${err.message}`));
  page.on('response', (res) => {
    if (res.status() >= 400 && !/favicon/.test(res.url())) {
      errors.push(`[http ${res.status()}] ${res.url()}`);
    }
  });
}

async function snapTheater(page, name) {
  const dest = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: dest, type: 'png' });
  return dest;
}

for (const [id, want] of Object.entries(V4_EXPECT)) {
  const got = getAsset(id);
  pass(`alias ${id}`, got === want, `${got || 'null'}`);
}

const server = startServer();
let browser;
try {
  await waitServer();
  browser = await chromium.launch({
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  watch(page);
  // Briefing itself is validated by v4_ui; don't let it mask simulation tests.
  await page.addInitScript(() => localStorage.setItem('dd.controlsBrief.v4', '1')); 
  await page.goto(`${BASE}?nointro=1`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(400);

  // Ending A: debug kill → theater (no cutscene)
  await page.evaluate(() => {
    window.__debug.startFight('glm');
    window.__debug.setPhase(3);
    window.__debug.killPlayer();
  });
  const afterKill = await until(page, (s) => s.state === 'theater' || s.state === 'cutscene', 10000);
  pass('ending A skips cutscene', !!(afterKill && afterKill.state === 'theater'), afterKill && afterKill.state);
  pass('ending A theater shot A1/A3', !!(afterKill && /^(A1|A3)$/.test(afterKill.theaterShot || '')), afterKill && afterKill.theaterShot);

  const hqA = await page.evaluate(() => ({
    hq: document.getElementById('theater')?.classList.contains('is-hq'),
    art: !!document.querySelector('#theater img.theater-art:not(.is-hidden)'),
    shot: document.getElementById('theater')?.dataset.shot,
  }));
  pass('ending A HQ DOM art', !!(hqA && hqA.hq && hqA.art), JSON.stringify(hqA));
  await snapTheater(page, 'ending_a_direct_cg');

  // Ending B: threshold
  await page.goto(`${BASE}?nointro=1`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(300);
  await page.evaluate(() => {
    window.__debug.startFight('glm');
    window.__debug.setPhase(3);
    window.__debug.setBossHpRatio(0.25);
  });
  const endB = await until(page, (s) => s.state === 'theater', 12000);
  pass('ending B direct theater', !!(endB && endB.state === 'theater'), endB && endB.theaterShot);
  pass('ending B opens Fable B1/B2', !!(endB && /^(B1|B2|B2b)$/.test(endB.theaterShot || '')), endB && endB.theaterShot);
  await snapTheater(page, 'ending_b_fable_cg');

  const hqB = await page.evaluate(() => document.querySelector('#theater img.theater-art:not(.is-hidden)'));
  pass('ending B HQ img visible', !!hqB, '');

  // Phase 2 CG + fight state preserved
  await page.goto(`${BASE}?nointro=1`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(250);
  const phaseSnap = await page.evaluate(() => {
    window.__debug.startFight('glm');
    window.__debug.setPhase(1);
    window.__game.player.gpuCooldowns = { rtx5090: 3.2, h200: 0, b200: 7.5 };
    const s0 = window.__debug.state();
    const before = {
      hp0: s0.player?.hp,
      x0: s0.player?.x,
      y0: s0.player?.y,
      cd0: { ...(window.__game.player?.gpuCooldowns || {}) },
      bullets0: s0.bulletCount,
    };
    window.__game.boss.startTransition(2);
    return before;
  });
  await page.waitForTimeout(120);
  const during = await page.evaluate(() => {
    const s = window.__debug.state();
    return {
      freeze: !!window.__game.flags?.phaseCgFreeze,
      cg: document.body.dataset.storyCg,
      hp: s.player?.hp,
      x: s.player?.x,
      y: s.player?.y,
      cd: { ...(window.__game.player?.gpuCooldowns || {}) },
      enemyBullets: s.bulletCount?.enemy,
    };
  });
  pass('phase CG freezes sim', during.freeze && during.cg === 'phase-2', JSON.stringify(during));
  pass('during CG HP/pos/CD held', during.hp === phaseSnap.hp0
    && during.x === phaseSnap.x0 && during.y === phaseSnap.y0
    && JSON.stringify(during.cd) === JSON.stringify(phaseSnap.cd0), JSON.stringify(during));
  pass('during CG enemy bullets cleared', during.enemyBullets === 0, String(during.enemyBullets));
  await snapTheater(page, 'phase2_cg_during');

  await until(page, (s) => s.state === 'fight' && s.phase === 2, 6000);
  await page.waitForFunction(() => !window.__game?.flags?.phaseCgFreeze, null, { timeout: 6000 });
  const phase2 = await state(page);
  const after = await page.evaluate(() => {
    const s = window.__debug.state();
    return {
      hp: s.player?.hp,
      cd: { ...(window.__game.player?.gpuCooldowns || {}) },
      cgOff: !window.__game.flags?.phaseCgFreeze,
    };
  });
  pass('phase 2 after CG', !!(phase2 && phase2.phase === 2), `phase ${phase2?.phase}`);
  pass('after CG sim resumed', after.cgOff, '');
  const cdOk = ['rtx5090', 'h200', 'b200'].every(
    (k) => Math.abs((after.cd[k] || 0) - (phaseSnap.cd0[k] || 0)) < 0.2,
  );
  pass('after CG HP/CD preserved', after.hp === phaseSnap.hp0 && cdOk, JSON.stringify(after.cd));

  await page.waitForTimeout(180);
  const resumedCd = await page.evaluate(() => window.__game.player.gpuCooldowns.rtx5090);
  pass('after CG cooldown genuinely advances', resumedCd < after.cd.rtx5090 - 0.05, String(resumedCd));

  // Instant ban P1
  await page.evaluate(() => window.__debug.killPlayer());
  const ban = await until(page, (s) => s.state === 'banned', 3000);
  const banCg = await page.evaluate(() => ({
    state: document.body.dataset.state,
    cg: document.body.dataset.storyCg === 'ban',
    img: !!document.querySelector('#story-cg img.story-cg-art')?.src,
  }));
  pass('instant ban state', ban?.state === 'banned', ban?.state);
  pass('ban illustrated CG', banCg.cg && banCg.img, JSON.stringify(banCg));
  await snapTheater(page, 'ban_cg');

  pass('console clean', errors.length === 0, errors.slice(0, 4).join(' | '));
} catch (e) {
  pass('runner', false, e.message);
  console.error(e);
} finally {
  if (browser) await browser.close();
  server.kill('SIGTERM');
}

const failed = rows.filter((r) => !r.ok).length;
const report = [
  'W2 v4 story direct CG',
  `time ${new Date().toISOString()}`,
  `port ${PORT}`,
  `PASS ${rows.length - failed} / FAIL ${failed}`,
  '',
  ...rows.map((r) => `${r.ok ? 'PASS' : 'FAIL'}  ${r.name}  ${r.detail}`),
].join('\n');
fs.writeFileSync(path.join(OUT, 'report.txt'), report);
console.log(report);
process.exit(failed ? 1 : 0);