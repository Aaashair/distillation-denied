// W3 story proof: Opus-death rescue, v3 white-dragon plates, Dario holo, bi() captions.
//   node tests/v3_story.mjs
// Serves this checkout on :8113. Playwright from the shared e2e install.
// Bots are not a two-human playtest.

import { chromium } from 'playwright';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getAsset } from '../src/config/assets.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PORT = Number(process.env.PORT || 8115);
const BASE = `http://127.0.0.1:${PORT}/`;
const OUT = process.env.OUT || 'test-output/v3/final/story';
fs.mkdirSync(OUT, { recursive: true });

const OLD_ART = [
  'endA_2_astra_rescue',
  'endA_3_retrieved',
  'astra_design.webp',
  'astra_attack.webp',
  'endA_1_skytear.webp',
];
const BANNED = ['你被救下了', '不是因为你重要', 'not because you matter'];

const rows = [];
const errors = [];
const shots = [];
const resourceLog = [];

function pass(name, ok, detail) {
  rows.push({ name, ok: !!ok, detail: detail || '' });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}  ${detail || ''}`);
}

function isOldArt(url) {
  const u = String(url || '');
  if (u.includes('/assets/v3/')) return false;
  return OLD_ART.some((s) => u.includes(s));
}

const ALIAS_EXPECT = {
  'end.A3': 'assets/v3/astra_arrive.png',
  'end.A4': 'assets/v3/astra_carry.png',
  'end.A5': 'assets/v3/darkroom.png',
  'end.A6': 'assets/v3/sam_silhouette.png',
  'end.A.rescue': 'assets/v3/astra_rescue.png',
  'end.A.astra': 'assets/v3/astra_portrait_closeup.png',
  'ill.astra': 'assets/v3/astra_portrait_closeup.png',
  'ill.sam': 'assets/v3/sam_silhouette.png',
  'pt.astra': 'assets/v3/astra_portrait_closeup.png',
  'v2_story_endA_2_astra_rescue_px': 'assets/v3/astra_rescue.png',
  'v2_story_endA_3_retrieved_px': 'assets/v3/astra_carry.png',
  'v2_story_endA_4_darkroom_px': 'assets/v3/darkroom.png',
  'm.endA_2_astra_rescue': 'assets/v3/astra_rescue.png',
  'm.astra_design': 'assets/v3/astra_portrait_closeup.png',
};

for (const [id, want] of Object.entries(ALIAS_EXPECT)) {
  const got = getAsset(id);
  const ok = got === want;
  pass(`alias ${id}`, ok, `${got} ${ok ? '' : `(want ${want})`}`);
  if (got && isOldArt(got)) pass(`alias ${id} not old angel`, false, got);
}

for (const rel of [
  'assets/v3/astra_arrive.png',
  'assets/v3/astra_rescue.png',
  'assets/v3/astra_carry.png',
  'assets/v3/darkroom.png',
  'assets/v3/astra_portrait_closeup.png',
  'assets/v3/sam_silhouette.png',
  'assets/v3/astra_contact_sheet.png',
]) {
  pass(`file ${rel}`, fs.existsSync(path.join(ROOT, rel)), path.join(ROOT, rel));
}

function startServer() {
  const child = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], {
    cwd: ROOT,
    stdio: 'ignore',
  });
  return child;
}

async function waitServer() {
  const t0 = Date.now();
  while (Date.now() - t0 < 8000) {
    try {
      const r = await fetch(BASE);
      if (r.ok || r.status === 200) return;
    } catch { /* not up */ }
    await new Promise((r) => setTimeout(r, 150));
  }
  throw new Error('server did not start on ' + PORT);
}

async function snap(page, name) {
  const dest = path.join(OUT, `${name}.png`);
  const data = await page.evaluate(() => document.getElementById('view').toDataURL('image/png'));
  fs.writeFileSync(dest, Buffer.from(data.split(',')[1], 'base64'));
  shots.push(dest);
  return dest;
}

async function snapTheaterFast(page, id) {
  const dest = path.join(OUT, `theater_${id}.png`);
  const dataUrl = await page.evaluate(() => {
    const px = document.querySelector('#theater canvas.theater-px');
    if (px && px.width) return px.toDataURL('image/png');
    const view = document.getElementById('view');
    return view ? view.toDataURL('image/png') : '';
  });
  if (dataUrl && dataUrl.startsWith('data:image')) {
    fs.writeFileSync(dest, Buffer.from(dataUrl.split(',')[1], 'base64'));
    shots.push(dest);
    return dest;
  }
  await page.screenshot({ path: dest, type: 'jpeg', quality: 60 });
  shots.push(dest);
  return dest;
}

function watch(page) {
  page.on('console', (msg) => {
    const type = msg.type();
    if (type === 'error' || type === 'warning') errors.push(`[${type}] ${msg.text()}`);
  });
  page.on('pageerror', (err) => errors.push(`[pageerror] ${err.message}`));
  page.on('response', (res) => {
    const url = res.url();
    resourceLog.push({ status: res.status(), url });
    if (res.status() >= 400 && !/favicon/.test(url)) errors.push(`[http ${res.status()}] ${url}`);
    if (isOldArt(url)) errors.push(`[old-astra-art] ${url}`);
  });
}

async function state(page) {
  return page.evaluate(() => (window.__debug ? window.__debug.state() : null));
}

async function until(page, pred, ms, step = 200) {
  const end = Date.now() + ms;
  let last = null;
  while (Date.now() < end) {
    last = await state(page);
    if (last && pred(last)) return last;
    await page.waitForTimeout(step);
  }
  return last;
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

  await page.goto(`${BASE}?nointro=1`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(700);
  const boot = await state(page);
  pass('boot', !!(boot && boot.state), JSON.stringify(boot && boot.state));

  // --- Dario holo persists after P1 voice ---
  await page.evaluate(() => window.__debug.startFight('glm'));
  const fight = await until(page, (s) => s.state === 'fight' && s.phase === 1, 8000);
  pass('p1 fight', !!(fight && fight.state === 'fight'), fight && `phase ${fight.phase}`);
  await snap(page, 'dario_p1_taunt');
  await page.waitForTimeout(5500);
  await snap(page, 'dario_p1_idle_after_voice');
  await page.waitForTimeout(3500);
  await snap(page, 'dario_p1_idle_later');
  const idle = await state(page);
  pass('dario still in p1 after idle', idle && idle.state === 'fight' && idle.phase === 1, idle && `state ${idle.state} phase ${idle.phase}`);

  // --- Forced Opus death → in-engine rescue BEFORE theater ---
  await page.evaluate(() => {
    window.__shotLog = [];
    window.__game.bus.on('theater_shot', (p) => {
      window.__shotLog.push(p && p.id);
    });
    window.__debug.setPhase(3);
    window.__debug.killPlayer();
  });
  const cut = await until(page, (s) => s.state === 'cutscene', 8000);
  pass('cutscene A started', !!(cut && cut.state === 'cutscene'), cut && JSON.stringify(cut.cutscene));
  await snap(page, 'rescue_cutscene_start');

  const dive = await until(page, (s) => s.cutscene && (s.cutscene.beat === 'dive' || s.cutscene.beat === 'parry'), 10000);
  pass('rescue dive/parry', !!(dive && dive.cutscene), dive && dive.cutscene && dive.cutscene.beat);
  await snap(page, 'rescue_in_engine_dive');

  const carry = await until(page, (s) => s.cutscene && s.cutscene.beat === 'carry', 8000);
  pass('rescue carry beat', !!(carry && carry.cutscene && carry.cutscene.beat === 'carry'), carry && carry.cutscene && carry.cutscene.beat);
  await snap(page, 'rescue_in_engine_carry');

  const theater = await until(page, (s) => s.state === 'theater', 10000);
  pass('theater A after rescue', !!(theater && theater.state === 'theater'), theater && theater.theaterShot);

  async function theaterId() {
    return page.evaluate(() => document.getElementById('theater')?.dataset.shot || '');
  }
  async function theaterSub() {
    return page.evaluate(() => ({
      zh: document.querySelector('#theater-sub .zh')?.textContent || '',
      en: document.querySelector('#theater-sub .en')?.textContent || '',
      hint: document.getElementById('theater-advance')?.textContent || '',
    }));
  }
  async function tapAdvance() {
    await page.evaluate(() => {
      const el = document.getElementById('theater');
      if (el) el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
    });
  }
  const seen = {};
  async function noteShot(id) {
    const sub = await theaterSub();
    seen[id] = sub;
    await snapTheaterFast(page, id);
    const bannedHit = BANNED.some((b) => (sub.zh + sub.en + sub.hint).includes(b));
    pass(`theater ${id} no banned line`, !bannedHit, bannedHit ? JSON.stringify(sub) : 'ok');
    pass(`theater ${id} single caption node`, sub.en === '', `en="${sub.en}" zh="${(sub.zh || '').slice(0, 48)}"`);
  }
  const shotIds = await page.evaluate(async () => {
    const m = await import('/src/story/endingA.js');
    return (m.SHOTS || []).map((s) => s.id);
  });
  pass('endingA shot list includes A4', shotIds.includes('A4'), shotIds.join(','));
  // Watch only — clicking skips shots during screenshot hitches.
  const t0 = Date.now();
  while (Date.now() - t0 < 22000) {
    const st = await state(page);
    if (!st || st.state !== 'theater') break;
    const id = (st.theaterShot) || await theaterId();
    if (id && !seen[id]) await noteShot(id);
    if (seen.A3 && seen.A4 && seen.A5 && (seen.A6 || seen.A6c)) break;
    await page.waitForTimeout(50);
  }
  const shotLog = await page.evaluate(() => window.__shotLog || []);
  pass('theater_shot log has A4', shotLog.includes('A4'), shotLog.join(','));
  pass('theater A3 captured', !!seen.A3, Object.keys(seen).join(','));
  pass('theater A4 captured', !!seen.A4, '');
  pass('theater Sam captured', !!(seen.A6 || seen.A6c || seen.A6b), Object.keys(seen).join(','));

  const biNow = await page.evaluate(async () => {
    const { bi } = await import('/src/data/lines.js');
    return bi({ zh: '中文', en: 'English' });
  });
  pass('bi() callable', typeof biNow === 'string' && biNow.length > 0, JSON.stringify(biNow));

  // Optional natural P3 death (boss dmg boost — labeled cheat)
  await page.goto(`${BASE}?nointro=1`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);
  await page.evaluate(() => {
    window.__debug.startFight('glm');
    window.__debug.setPhase(3);
    window.__debug.setGod(false);
    window.__debug.setDamageMul('boss', 50);
  });
  const naturalLog = [];
  await page.evaluate(() => {
    window.__naturalProbeLog = [];
    window.__game.bus.on('hit', (h) => {
      const d = h?.dst;
      if (d && d.team === 'player') {
        window.__naturalProbeLog.push({
          t: window.__game.time?.elapsed,
          applied: h.applied,
          hp: d.hp,
        });
      }
    });
  });
  const natural = await until(page, (s) => s.state === 'cutscene' || s.state === 'theater', 16000);
  const probeHits = await page.evaluate(() => window.__naturalProbeLog || []);
  naturalLog.push(...probeHits);
  const diedNatural = !!(natural && (natural.state === 'cutscene' || natural.state === 'theater'));
  console.log(`INFO stationary natural-death probe (observational, not a PASS/FAIL row): ${diedNatural ? 'death within16s' : `still ${natural?.state} hp=${natural?.player?.hp}`} hits=${probeHits.length}; gate is tests/v3_natural_death.mjs`);
  await snap(page, 'rescue_natural_death_cheat');

  const oldHits = resourceLog.filter((r) => isOldArt(r.url));
  pass('no old angel resource URLs', oldHits.length === 0, oldHits.slice(0, 4).map((r) => r.url).join(' | '));
  const v3Hits = resourceLog.filter((r) => r.url.includes('/assets/v3/') && r.status === 200);
  pass('v3 plates fetched', v3Hits.length > 0, `${v3Hits.length} urls`);
  const consoleIssues = errors.filter((e) => !e.includes('[old-astra-art]'));
  pass('console clean', consoleIssues.length === 0, consoleIssues.slice(0, 6).join(' | '));
} catch (e) {
  pass('runner', false, e.message);
  console.error(e);
} finally {
  if (browser) await browser.close();
  server.kill('SIGTERM');
}

const report = [
  'W3 v3 story proof',
  `time ${new Date().toISOString()}`,
  `port ${PORT}`,
  '',
  'Alias → file:',
  ...Object.entries(ALIAS_EXPECT).map(([id, p]) => `  ${id} → ${getAsset(id) || 'NULL'} (expect ${p})`),
  '',
  'Tests:',
  ...rows.map((r) => `${r.ok ? 'PASS' : 'FAIL'}  ${r.name}  ${r.detail}`),
  '',
  `screenshots (${shots.length}):`,
  ...shots,
  '',
  'console/network issues:',
  ...(errors.length ? errors : ['none']),
  '',
  'Notes:',
  '- Forced path: __debug.startFight + setPhase(3) + killPlayer. In-engine rescue captured before theater.',
  '- Natural P3 probe: setDamageMul(boss,50) assist; non-gating — see tests/v3_natural_death.mjs.',
  '- Integrated W1 bi() returns selected language; theater displays one caption node.',
  '- Chinese voices unchanged; no EN dub generated.',
  '- Bots are not a substitute for two human playtesters.',
  '- Buffs (primary +40% / skills +50%) are W2-owned; not changed here.',
].join('\n');

fs.writeFileSync(path.join(OUT, 'audit_report.txt'), report);
fs.writeFileSync(path.join(OUT, 'resource_urls.json'), JSON.stringify(resourceLog, null, 2));
console.log(report);
const failed = rows.filter((r) => !r.ok).length;
process.exit(failed ? 1 : 0);
