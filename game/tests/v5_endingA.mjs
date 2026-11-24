// W3 v5 Ending A — every active theater shot + alias→path evidence
// PORT=8153 node tests/v5_endingA.mjs

import { chromium } from 'playwright';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getAsset } from '../src/config/assets.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PORT = Number(process.env.PORT || 8153);
const BASE = `http://127.0.0.1:${PORT}/`;
const OUT = process.env.OUT || 'test-output/v5/w3';
fs.mkdirSync(OUT, { recursive: true });

const V5_ALIASES = {
  'end.A.rescue': 'assets/v5/astra_rescue_cg.png',
  'end.A.astra': 'assets/v5/astra_establishing.png',
  'end.A3': 'assets/v5/astra_arrive.png',
  'end.A4': 'assets/v5/astra_carry_cg.png',
  'end.A5': 'assets/v5/astra_office_cg.png',
  'end.A6': 'assets/v5/sam_full_cg.png',
  'end.A.samFull': 'assets/v5/sam_full_cg.png',
  'end.A.dario': 'assets/v5/dario_endA_cg.png',
  'ill.sam': 'assets/v5/sam_full_cg.png',
};

const SHOT_BGS = {
  A1: 'end.A.rescue',
  A2: 'end.A.astra',
  A3: 'end.A3',
  A4: 'end.A4',
  A5: 'end.A5',
  A6: 'end.A.samFull',
  A6b: 'end.A.samFull',
  A6c: 'end.A.samFull',
  A6d: 'end.A.samFull',
  A6e: 'end.A.samFull',
  A6f: 'end.A.samFull',
  A6g: 'end.A.samFull',
  A7: 'end.A.dario',
};

const BANNED = ['你被救下了', 'not because you matter', 'you were saved'];
const rows = [];
const errors = [];
const evidence = [];

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

function watch(page) {
  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning') errors.push(`[${msg.type()}] ${msg.text()}`);
  });
  page.on('pageerror', (err) => errors.push(`[pageerror] ${err.message}`));
  page.on('response', (res) => {
    const url = res.url();
    if (res.status() >= 400 && !/favicon/.test(url)) errors.push(`[http ${res.status()}] ${url}`);
    if (/\/assets\/v4\/(astra|darkroom|sam)_/.test(url)) {
      errors.push(`[stale-v4-endingA] ${url}`);
    }
    if (/\/assets\/v5\/(sam_phone|darkroom)_/.test(url)) {
      errors.push(`[obsolete-v5-plate] ${url}`);
    }
  });
}

async function state(page) {
  return page.evaluate(() => (window.__debug ? window.__debug.state() : null));
}

for (const [id, want] of Object.entries(V5_ALIASES)) {
  const got = getAsset(id);
  pass(`alias ${id}`, got === want, got || 'null');
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
  await page.addInitScript(() => localStorage.setItem('dd.controlsBrief.v4', '1'));
  await page.goto(`${BASE}?nointro=1`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(350);

  // Capture-only assist: disable automatic shot timing so slow PNG encoding cannot skip a slide.
  await page.evaluate(async () => {
    const { SHOTS } = await import('/src/story/endingA.js');
    SHOTS.forEach((shot) => { shot.waitClick = true; });
    window.__shotLog = [];
    window.__game?.bus?.on('theater_shot', (p) => window.__shotLog.push(p?.id));
    window.__debug.startFight('glm');
    window.__debug.setPhase(3);
    window.__debug.killPlayer();
  });

  const theater = await (async () => {
    const end = Date.now() + 12000;
    while (Date.now() < end) {
      const s = await state(page);
      if (s?.state === 'theater') return s;
      await page.waitForTimeout(100);
    }
    return null;
  })();
  pass('ending A direct theater', !!(theater && theater.state === 'theater'), theater?.theaterShot);
  const full=await page.evaluate(()=>{const r=document.getElementById('theater').getBoundingClientRect();return{left:r.left,top:r.top,w:r.width,h:r.height,vw:innerWidth,vh:innerHeight}});
  pass('CG covers viewport including former sidebar',full.left===0&&full.top===0&&full.w===full.vw&&full.h===full.vh,JSON.stringify(full));

  const need = new Set(Object.keys(SHOT_BGS));
  const seen = {};
  const t0 = Date.now();
  while (Date.now() - t0 < 90000 && need.size > 0) {
    const st = await state(page);
    if (!st || st.state !== 'theater') break;
    const shotId = st.theaterShot || '';
    if (shotId && need.has(shotId) && !seen[shotId]) {
      const meta = await page.evaluate((sid) => {
        const art = document.querySelector('#theater img.theater-art:not(.is-hidden)');
        const th = document.getElementById('theater');
        const sub = document.querySelector('#theater-sub .zh')?.textContent || '';
        return {
          shot: th?.dataset?.shot || sid,
          hq: th?.classList.contains('is-hq'),
          src: art?.src || '',
          w: art?.naturalWidth || 0,
          h: art?.naturalHeight || 0,
          sub: sub.slice(0, 80),
        };
      }, shotId);
      const bg = SHOT_BGS[shotId];
      const wantPath = V5_ALIASES[bg] || getAsset(bg);
      const hasV5 = meta.src.includes('/assets/v5/');
      const dimOk = meta.w >= 1280 && meta.h >= 720;
      pass(`shot ${shotId} v5 art`, hasV5 && dimOk, `${meta.w}x${meta.h} ${meta.src.split('/').pop()}`);
      pass(`shot ${shotId} hq`, !!meta.hq, String(meta.hq));
      const banned = BANNED.some((b) => (meta.sub || '').toLowerCase().includes(b.toLowerCase()));
      pass(`shot ${shotId} no banned line`, !banned, meta.sub);
      await page.screenshot({ path: path.join(OUT, `endingA_${shotId}.png`), type: 'png' });
      evidence.push({ shotId, bg, wantPath, ...meta });
      seen[shotId] = true;
      need.delete(shotId);
    }
    await page.evaluate(() => {
      document.getElementById('theater')?.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    });
    await page.waitForTimeout(80);
  }

  for (const id of Object.keys(SHOT_BGS)) {
    pass(`captured ${id}`, !!seen[id], seen[id] ? 'ok' : 'missing');
  }

  pass('console clean', errors.length === 0, errors.slice(0, 5).join(' | '));
} catch (e) {
  pass('runner', false, e.message);
  console.error(e);
} finally {
  if (browser) await browser.close();
  server.kill('SIGTERM');
}

const failed = rows.filter((r) => !r.ok).length;
const report = {
  time: new Date().toISOString(),
  port: PORT,
  pass: rows.length - failed,
  fail: failed,
  rows,
  evidence,
  errors,
  assists: 'debug P3 death trigger; all EndingA SHOTS.waitClick=true in this browser only to prevent automatic advance during PNG capture; actual mousedown advances, no alias/DOM substitution',
};
fs.writeFileSync(path.join(OUT, 'v5_endingA_report.json'), JSON.stringify(report, null, 2));
fs.writeFileSync(
  path.join(OUT, 'report.txt'),
  [
    'W3 v5 Ending A theater',
    `port ${PORT}`,
    `PASS ${rows.length - failed} / FAIL ${failed}`,
    '',
    ...rows.map((r) => `${r.ok ? 'PASS' : 'FAIL'}  ${r.name}  ${r.detail}`),
  ].join('\n'),
);
console.log(report.pass, 'pass', report.fail, 'fail');
process.exit(failed ? 1 : 0);