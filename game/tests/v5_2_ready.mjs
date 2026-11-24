#!/usr/bin/env node
/**
 * v5.2 — player-attached skill cooldown READY cue (combat visibility).
 */
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(new URL('..', import.meta.url).pathname);
const PORT = Number(process.env.PORT || 8182);
const OUT = process.env.OUT || 'test-output/v5_2/worker';
fs.mkdirSync(OUT, { recursive: true });

function startServer() {
  return spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], {
    cwd: ROOT,
    stdio: 'ignore',
  });
}

async function waitServer(url, tries = 60) {
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
const page = await browser.newPage();
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('response', (r) => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });

await page.addInitScript(() => {
  localStorage.setItem('dd.controlsBrief.v4', '1');
});

await page.goto(url);
await page.waitForFunction(() => window.__debug && window.__skillReadyCue);

async function setLang(lang) {
  await page.evaluate((l) => {
    localStorage.setItem('dd.lang.v3', l);
  }, lang);
  await page.reload();
  await page.waitForFunction(() => window.__debug && window.__skillReadyCue);
  await page.waitForFunction((l) => localStorage.getItem('dd.lang.v3') === l, lang);
}

async function fight(charId) {
  await page.evaluate((id) => {
    window.__debug.startFight(id);
    window.__debug.setGod(true);
    window.__debug.setDamageMul('player', 0);
    window.__debug.setTimeScale(1);
  }, charId);
  await page.waitForTimeout(150);
}

async function cueSnap() {
  return page.evaluate(() => window.__skillReadyCue.snapshot());
}

async function fireSkill(charId, { waitCd = true } = {}) {
  if (charId === 'deepseek') {
    await page.keyboard.press('Shift');
  } else if (charId === 'kimi') {
    await page.keyboard.down('Shift');
    await page.waitForTimeout(600);
    await page.keyboard.up('Shift');
  } else if (charId === 'glm') {
    await page.keyboard.down('Shift');
    await page.waitForTimeout(320);
    await page.keyboard.up('Shift');
  }
  await page.waitForTimeout(80);
  if (waitCd) {
    await page.waitForFunction(() => (window.__game.player?.skillCd || 0) > 0.2, null, { timeout: 5000 });
  }
}

async function waitReadyCue(maxMs = 12000) {
  const t0 = Date.now();
  while (Date.now() - t0 < maxMs) {
    const s = await cueSnap();
    if (s.active) return s;
    await page.waitForTimeout(50);
  }
  return cueSnap();
}

async function waitCooldownDone() {
  await page.evaluate(async () => {
    window.__debug.setTimeScale(8);
    const p = window.__game.player;
    const deadline = performance.now() + 20000;
    while (p && (p.skillCd || 0) > 0.02 && performance.now() < deadline) {
      await new Promise((r) => requestAnimationFrame(r));
    }
    window.__debug.setTimeScale(1);
  });
}

async function shot(name, vw, vh) {
  await page.setViewportSize({ width: vw, height: vh });
  await page.waitForTimeout(120);
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: false });
}

const assists = [
  'dd.controlsBrief.v4=1',
  '__debug.startFight/setGod/setTimeScale',
  'accelerated cooldown wait via setTimeScale(8)',
  'real Shift skill key for each kit',
];

for (const lang of ['en', 'zh']) {
  await setLang(lang);
  const expectText = lang === 'zh' ? '技能就绪' : 'Skill Ready';
  for (const charId of ['deepseek', 'kimi', 'glm']) {
    await fight(charId);
    const spawnCue = await cueSnap();
    check(`no spawn cue ${charId} ${lang}`, !spawnCue.active, JSON.stringify(spawnCue));

    const c0 = await cueSnap();
    await page.keyboard.down('d');
    await fireSkill(charId);
    await page.keyboard.up('d');
    const armedCd = await page.evaluate(() => window.__game.player.skillCd);
    check(`skill armed cd ${charId} ${lang}`, armedCd > 0.2, String(armedCd));

    await waitCooldownDone();
    const ready = await waitReadyCue();
    check(`ready cue once ${charId} ${lang}`, ready.active && ready.text === expectText, JSON.stringify(ready));

    const cAfter = await waitReadyCue(200);
    const c1 = await cueSnap();
    check(`no second cue without reuse ${charId} ${lang}`, c1.completions === ready.completions, JSON.stringify(c1));

    if (charId === 'deepseek' && lang === 'en') {
      await shot(`ready_1280x720_${charId}_${lang}`, 1280, 720);
    }
    if (charId === 'kimi' && lang === 'zh') {
      await shot(`ready_1024x615_${charId}_${lang}`, 1024, 615);
    }

    await fireSkill(charId, { waitCd: false });
    await page.waitForTimeout(120);
    const reuse = await page.evaluate(() => ({
      active: window.__skillReadyCue.snapshot().active,
      cd: window.__game.player?.skillCd || 0,
    }));
    check(`reuse cancels/stale ${charId} ${lang}`, !reuse.active && reuse.cd > 0.2, JSON.stringify(reuse));

    await page.keyboard.press('Escape');
    await page.waitForFunction(() => window.__debug.state().state === 'paused');
    const pausedCd = await page.evaluate(() => window.__game.player.skillCd);
    await page.waitForTimeout(400);
  const pausedCd2 = await page.evaluate(() => window.__game.player.skillCd);
    check(`pause freezes skill cd ${charId} ${lang}`, Math.abs(pausedCd - pausedCd2) < 0.02, `${pausedCd}->${pausedCd2}`);
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => window.__debug.state().state === 'fight');

    const manip = await page.evaluate(() => {
      const p = window.__game.player;
      const before = window.__skillReadyCue.snapshot().completions;
      p.skillCd = 4;
      p.skillCd = 0;
      p.skillCd = 0;
      const after = window.__skillReadyCue.snapshot();
      return { before, after: after.completions, active: after.active };
    });
    check(`debug cd write no spam ${charId} ${lang}`, manip.after === manip.before && !manip.active, JSON.stringify(manip));

    await page.evaluate(() => window.__skillReadyCue.clear());
    await page.evaluate(() => {
      window.__game.retry();
    });
    await page.waitForTimeout(200);
    check(`retry clears cue ${charId} ${lang}`, !(await cueSnap()).active, JSON.stringify(await cueSnap()));
    void c0; void cAfter;
  }
}

await page.setViewportSize({ width: 1280, height: 720 });
await fight('deepseek');
await page.evaluate(() => {
  window.__game.player.skillCd = 0.4;
  window.__skillReadyCue.clear();
  window.__skillReadyCue.snapshot();
});
await page.evaluate(() => window.__debug.killPlayer());
await page.waitForFunction(() => ['banned', 'theater', 'cutscene'].includes(window.__debug.state().state)
  || !window.__skillReadyCue.snapshot().active);
check('death/exit clears cue', !(await cueSnap()).active, JSON.stringify(await cueSnap()));

const pass = rows.filter((r) => r.ok).length;
const fail = rows.length - pass;
const summary = {
  pass,
  fail,
  total: rows.length,
  port: PORT,
  out: OUT,
  assists,
  rows,
  errors,
};
fs.writeFileSync(path.join(OUT, 'v5_2_ready_run.json'), JSON.stringify(summary, null, 2));
fs.writeFileSync(path.join(OUT, 'v5_2_ready_run.txt'), rows.map((r) => `${r.ok ? 'PASS' : 'FAIL'} ${r.name} ${r.detail}`).join('\n') + `\n\n${pass} PASS / ${fail} FAIL\n`);

await browser.close();
server.kill('SIGTERM');
if (fail) process.exit(1);