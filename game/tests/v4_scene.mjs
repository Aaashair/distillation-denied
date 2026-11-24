// W3 scene: Dario top-door holo, player foot rings, 548 Market Street canvas label.
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DARIO_HOLO } from '../src/render/room.js';
import { PLAYER_FOOT_RING } from '../src/render/sprites.js';
import { WORLD_OX, WORLD_OY } from '../src/render/world.js';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const PORT = Number(process.env.PORT || 8121);
const OUT = process.env.SCREEN_OUT || 'test-output/v4/w3';

const EXPECT_RING = {
  deepseek: [0x3f, 0xa9, 0xff],
  kimi: [0xa5, 0x66, 0xff],
  glm: [0xff, 0xff, 0xff],
};

function startServer() {
  return spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], {
    cwd: ROOT,
    stdio: 'ignore',
  });
}

async function waitServer(url, tries = 40) {
  for (let i = 0; i < tries; i += 1) {
    try {
      const r = await fetch(url);
      if (r.ok) return;
    } catch { /* retry */ }
    await new Promise((r) => { setTimeout(r, 120); });
  }
  throw new Error(`server did not boot on ${PORT}`);
}

function hexDist(a, b) {
  return Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]), Math.abs(a[2] - b[2]));
}

async function sampleRing(page, bx, by) {
  return page.evaluate(({ x, y }) => {
    const view = document.getElementById('view');
  const scale = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--game-scale')) || 1;
  const gx = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--game-x')) || 0;
  const gy = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--game-y')) || 0;
  const px = Math.round(gx + x * scale);
    const py = Math.round(gy + y * scale);
    const d = view.getContext('2d').getImageData(px, py, 1, 1).data;
    return [d[0], d[1], d[2]];
  }, { x: bx, y: by });
}

async function canvasPng(page, name) {
  const data = await page.evaluate(() => {
    const view = document.getElementById('view');
    return view.toDataURL('image/png');
  });
  const b64 = data.replace(/^data:image\/png;base64,/, '');
  fs.writeFileSync(path.join(OUT, `${name}.png`), Buffer.from(b64, 'base64'));
}

fs.mkdirSync(OUT, { recursive: true });
const url = `http://127.0.0.1:${PORT}/`;
const server = startServer();
const rows = [];
const errors = [];
function check(name, ok, detail = '') {
  rows.push({ name, ok: !!ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name} ${detail}`);
}

try {
  await waitServer(url);
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('response', (r) => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });

  // Scene-specific test skips the separately validated first-entry controls screen.
  await page.addInitScript(() => localStorage.setItem('dd.controlsBrief.v4', '1'));
  await page.goto(url);
  await page.waitForFunction(() => window.__debug);

  check('DARIO_HOLO cx top door', DARIO_HOLO.cx === 320, `cx=${DARIO_HOLO.cx}`);
  check('DARIO_HOLO y band 20..65', DARIO_HOLO.top >= 20 && DARIO_HOLO.top <= 65, `top=${DARIO_HOLO.top}`);

  await page.evaluate(() => {
    window.__debug.startFight('deepseek');
    window.__debug.setGod(true);
    window.__debug.setPhase(1);
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(OUT, 'dario_p1_topdoor_1280x720.png'), fullPage: true });
  await canvasPng(page, 'dario_p1_canvas');

  const holo = await page.evaluate(() => window.__game.world.room.DARIO_HOLO);
  check('ctx DARIO_HOLO matches export', holo && holo.cx === 320 && holo.x === 300, JSON.stringify(holo));

  for (const [charId, rgb] of Object.entries(EXPECT_RING)) {
    await page.evaluate((id) => {
      window.__debug.startFight(id);
      window.__debug.setGod(true);
    }, charId);
    await page.waitForTimeout(280);
    await page.keyboard.down('w');
    await page.waitForTimeout(200);
    const probe = await page.evaluate(({ ox, oy }) => {
      const ring = window.__game.world.sprites.footRingSample();
      if (!ring) return null;
      return {
        bx: ring.tickEast.bx + ox,
        by: ring.tickEast.by + oy,
        stroke: ring.stroke,
        moving: ring.moving,
        rx: ring.rx,
      };
    }, { ox: WORLD_OX, oy: WORLD_OY });
    await page.keyboard.up('w');
    check(`foot ring expands while moving ${charId}`, probe && (probe.moving || probe.rx >= 12), JSON.stringify(probe));
    const sampled = probe ? await sampleRing(page, probe.bx, probe.by) : [0, 0, 0];
    check(`foot ring color ${charId}`, hexDist(sampled, rgb) <= 64, `want ${rgb} got ${sampled} stroke ${probe?.stroke}`);
    await page.screenshot({ path: path.join(OUT, `ring_${charId}_move.png`), fullPage: true });
  }

  await page.evaluate(() => {
    window.__debug.startFight('deepseek');
    window.__debug.setGod(true);
  });
  await page.keyboard.down(' ');
  await page.waitForTimeout(320);
  await page.keyboard.up(' ');
  await page.screenshot({ path: path.join(OUT, 'ring_deepseek_roll.png'), fullPage: true });
  check('ring palette contract', PLAYER_FOOT_RING.deepseek === '#3fa9ff' && PLAYER_FOOT_RING.kimi === '#a566ff');

  const page960 = await browser.newPage({ viewport: { width: 960, height: 600 } });
  page960.on('pageerror', (e) => errors.push(e.message));
  await page960.addInitScript(() => localStorage.setItem('dd.controlsBrief.v4', '1'));
  await page960.goto(url);
  await page960.waitForFunction(() => window.__debug);
  await page960.evaluate(() => { window.__debug.startFight('kimi'); window.__debug.setPhase(1); });
  await page960.waitForTimeout(350);
  await page960.screenshot({ path: path.join(OUT, 'dario_p1_960x600.png'), fullPage: true });
  await page960.close();

  check('browser console and HTTP clean', errors.length === 0, errors.join(' | '));
  await browser.close();
} finally {
  server.kill('SIGTERM');
}

const pass = rows.filter((r) => r.ok).length;
const fail = rows.length - pass;
const report = {
  url,
  pass,
  fail,
  DARIO_HOLO,
  PLAYER_FOOT_RING,
  WORLD_OX,
  WORLD_OY,
  assists: 'debug startFight/setGod/setPhase only; ring samples at player feet buffer px',
  errors,
  rows,
};
fs.writeFileSync(path.join(OUT, 'v4_scene.json'), JSON.stringify(report, null, 2));
fs.writeFileSync(path.join(OUT, 'v4_scene.txt'), `${rows.map((r) => `${r.ok ? 'PASS' : 'FAIL'} ${r.name} ${r.detail}`).join('\n')}\nTOTAL ${pass} PASS / ${fail} FAIL\n`);
console.log(`TOTAL ${pass} PASS / ${fail} FAIL`);
process.exitCode = fail ? 1 : 0;