// W2 v5 theater audio lifecycle — hard-cut HTML + WebAudio on CG boundaries.
// PORT=8152 node tests/v5_audio.mjs

import { chromium } from 'playwright';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PORT = Number(process.env.PORT || 8152);
const BASE = `http://127.0.0.1:${PORT}/`;
const OUT = process.env.OUT || 'test-output/v5/w2';
fs.mkdirSync(OUT, { recursive: true });

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

function watch(page) {
  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning') errors.push(`[${msg.type()}] ${msg.text()}`);
  });
  page.on('pageerror', (err) => errors.push(`[pageerror] ${err.message}`));
}

async function telemetry(page) {
  return page.evaluate(() => window.__game?.audio?.getTelemetry?.() || null);
}

async function unlockAudio(page) {
  await page.mouse.click(640, 360);
  await page.waitForTimeout(40);
}

async function enterTheaterA(page) {
  await page.addInitScript(() => {
    localStorage.setItem('dd.controlsBrief.v4', '1');
    localStorage.setItem('dd.lang.v3', 'zh');
  });
  await page.goto(`${BASE}?nointro=1`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__game?.audio?.getTelemetry);
  await unlockAudio(page);
  await page.evaluate(() => {
    window.__debug.startFight('glm');
    window.__debug.setPhase(3);
    window.__debug.killPlayer();
  });
  await page.waitForFunction(
    () => window.__debug.state().state === 'theater',
    null,
    { timeout: 12000 },
  );
  await page.waitForTimeout(120);
}

async function advanceShot(page) {
  const before=await page.locator('#theater').getAttribute('data-shot');
  for(let n=0;n<25;n++){
    await page.keyboard.press('Enter');
    await page.waitForTimeout(80);
    if(await page.locator('#theater').getAttribute('data-shot')!==before)return;
  }
  throw new Error(`advance timeout from ${before}`);
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
  await page.waitForFunction(() => window.__game?.audio?.getTelemetry);
  await unlockAudio(page);

  // Monotonic owner token (never resets to match stale gen-0 callbacks)
  const tokProbe = await page.evaluate(() => {
    const a = window.__game.audio;
    const t0 = a.getTheaterOwnerToken();
    a.invalidateTheaterShot();
    const t1 = a.getTheaterOwnerToken();
    a.beginTheaterSession();
    const t2 = a.getTheaterOwnerToken();
    a.endTheaterSession();
    return { t0, t1, t2 };
  });
  pass(
    'theaterOwnerToken monotonic',
    tokProbe.t1 > tokProbe.t0 && tokProbe.t2 > tokProbe.t1,
    JSON.stringify(tokProbe),
  );

  // Combat bleed into CG: live HTML + transient synth hard-cut at session begin
  await page.goto(`${BASE}?nointro=1`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__game?.audio?.getTelemetry);
  await unlockAudio(page);
  const bleed = await page.evaluate(() => {
    const a = window.__game.audio;
    a.playSfx('sfx.heavy');
    const mid = a.getTelemetry();
    a.beginTheaterSession();
    const aft = a.getTelemetry();
    return { mid, aft };
  });
  pass(
    'theater entry hard-cuts combat live SFX',
    bleed.mid.sfxLive >= 0 && bleed.aft.sfxLive === 0,
    JSON.stringify({ in: bleed.mid.sfxLive, out: bleed.aft.sfxLive }),
  );
  pass(
    'theater entry hard-cuts transient synth',
    bleed.aft.synthActive === 0,
    String(bleed.aft.synthActive),
  );

  await enterTheaterA(page);

  const shotA1 = await page.locator('#theater').getAttribute('data-shot');
  pass('theater entry A1', shotA1 === 'A1', shotA1 || '');

  // Stay on A1: its VO/BGM plus scheduled heartbeat must all stop on A2.

  // Delayed heartbeat WebAudio (second pulse scheduled +220ms) on fresh slide
  const hb = await page.evaluate(() => {
    const a = window.__game.audio;
    const tok = a.getTheaterOwnerToken();
    a.playSfx('sfx.heartbeat__v5_probe__', { scope: 'theater', theaterOwnerToken: tok });
    return a.getTelemetry();
  });
  pass(
    'heartbeat synth schedules delayed pulse',
    hb && hb.synthScheduled >= 1 && hb.theaterSynthActive >= 1,
    JSON.stringify(hb),
  );

  const tokBefore = hb.theaterOwnerToken;
  await advanceShot(page);
  let telAfterRapid = await telemetry(page);
  pass(
    'rapid advance VO hard-stopped (paused, t≈0)',
    telAfterRapid
      && telAfterRapid.voPaused === true
      && (telAfterRapid.voCurrentTime ?? 1) < 0.01
      && !telAfterRapid.voId,
    JSON.stringify(telAfterRapid),
  );
  pass(
    'rapid advance BGM hard-stopped',
    telAfterRapid
      && telAfterRapid.bgmPaused === true
      && (telAfterRapid.bgmCurrentTime ?? 1) < 0.01,
    JSON.stringify(telAfterRapid),
  );
  pass(
    'rapid advance no theater HTML SFX',
    telAfterRapid && telAfterRapid.theaterSfxLive === 0,
    String(telAfterRapid?.theaterSfxLive),
  );
  pass(
    'rapid advance cuts scheduled theater synth',
    telAfterRapid && telAfterRapid.theaterSynthActive === 0 && telAfterRapid.synthScheduled === 0,
    JSON.stringify(telAfterRapid),
  );
  pass(
    'ownership bumped across slide advance',
    telAfterRapid && telAfterRapid.theaterOwnerToken > tokBefore,
    `${tokBefore} → ${telAfterRapid?.theaterOwnerToken}`,
  );

  await page.waitForTimeout(500);
  const tel500 = await telemetry(page);
  pass(
    '500ms later: no stale theater synth/SFX',
    tel500
      && tel500.theaterSynthActive === 0
      && tel500.synthScheduled === 0
      && tel500.theaterSfxLive === 0
      && tel500.voPaused === true
      && (tel500.voCurrentTime ?? 1) < 0.01,
    JSON.stringify(tel500),
  );

  const shotNow = await page.locator('#theater').getAttribute('data-shot');
  pass('advanced past A1', shotNow && shotNow !== 'A1', shotNow || '');

  // Stale play/error callbacks after invalidate must not synth-fallback on old scope
  const staleCb = await page.evaluate(async () => {
    const a = window.__game.audio;
    a.clearPlayLog();
    const tok = a.getTheaterOwnerToken();
    const log0 = a.getPlayLog().length;
    a.playSfx('sfx.tear', { scope: 'theater', theaterOwnerToken: tok });
    a.invalidateTheaterShot();
    await new Promise((r) => setTimeout(r, 280));
    const log1 = a.getPlayLog().length;
    const tel = a.getTelemetry();
    return { log0, log1, theaterSfx: tel.theaterSfxLive, synth: tel.theaterSynthActive, synthSched: tel.synthScheduled };
  });
  pass(
    'stale SFX callbacks do not resurrect theater audio',
    staleCb.theaterSfx === 0 && staleCb.synth === 0 && staleCb.synthSched === 0,
    JSON.stringify(staleCb),
  );

  // VO after load, then hard-cut on next slide
  await page.waitForTimeout(120);
  await page.keyboard.press('Space');
  await page.waitForTimeout(220);
  const a3Vo = await telemetry(page);
  pass('A3 VO started', a3Vo?.voId === 'v2_vo_astra_arrive_2', a3Vo?.voId || '');
  await page.keyboard.press('Space');
  await page.waitForTimeout(180);
  await page.keyboard.press('Space');
  await page.waitForTimeout(120);
  const afterSlide = await telemetry(page);
  pass(
    'after-load advance kills previous shot VO id',
    afterSlide && afterSlide.voId !== 'v2_vo_astra_arrive_2',
    JSON.stringify(afterSlide),
  );
  pass(
    'new slide VO allowed after cut',
    afterSlide && afterSlide.voId && afterSlide.voId !== 'v2_vo_astra_arrive_2',
    afterSlide?.voId || '',
  );

  await page.screenshot({ path: path.join(OUT, 'theater_rapid_advance.png'), type: 'png' });

  // Pending unlock queue: advance while locked, then unlock — no stale BGM
  await page.goto(`${BASE}?nointro=1`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    window.__debug.startFight('glm');
    window.__debug.setPhase(3);
    window.__debug.killPlayer();
  });
  await page.waitForFunction(() => window.__debug.state().state === 'theater', null, { timeout: 12000 });
  await page.waitForTimeout(320);
  await advanceShot(page);
  await unlockAudio(page);
  await page.waitForTimeout(120);
  const telUnlock = await telemetry(page);
  pass(
    'stale pending BGM not resurrected after rapid skip + unlock',
    telUnlock
      && telUnlock.theaterOwnerToken >= 1
      && telUnlock.bgmPaused === true
      && (telUnlock.bgmCurrentTime ?? 1) < 0.05
      && telUnlock.pendingBgm == null,
    JSON.stringify(telUnlock),
  );

  // EN Claude combat VO mute regression
  await page.addInitScript(() => localStorage.setItem('dd.lang.v3', 'en'));
  await page.goto(`${BASE}?nointro=1`, { waitUntil: 'domcontentloaded' });
  await unlockAudio(page);
  const enVo = await page.evaluate(() => {
    window.__game.audio.clearPlayLog?.();
    const id = 'v2_vo_haiku_intro';
    window.__game.audio.playVo(id, { ctx: window.__game });
    const log = window.__game.audio.getPlayLog();
    const row = log.find((e) => e.kind === 'vo' && e.id === id);
    return { muted: row?.muted, isClaude: window.__game.audio.isClaudeCombatVo(id) };
  });
  pass('EN Claude combat VO muted', enVo.isClaude && enVo.muted === true, JSON.stringify(enVo));

  await page.screenshot({ path: path.join(OUT, 'audio_en_mute_probe.png'), type: 'png' });

  fs.writeFileSync(path.join(OUT, 'console.txt'), errors.join('\n') || '(none)');
  fs.writeFileSync(
    path.join(OUT, 'summary.json'),
    JSON.stringify({ rows, errors, pass: rows.filter((r) => r.ok).length, fail: rows.filter((r) => !r.ok).length }, null, 2),
  );
  pass('console clean', errors.length === 0, `${errors.length} issues`);

  const failN = rows.filter((r) => !r.ok).length;
  if (failN) process.exitCode = 1;
} finally {
  if (browser) await browser.close();
  server.kill();
}