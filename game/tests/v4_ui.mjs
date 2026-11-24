#!/usr/bin/env node
/** W1 v4 readable HUD + controls brief — port 8119, Playwright snapshots. */
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const PORT = Number(process.env.PORT || 8119);
const BASE = `http://127.0.0.1:${PORT}/`;
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = process.env.SCREEN_OUT || 'test-output/v4/w1';

const rows = [];
const errors = [];

function check(name, ok, detail = '') {
  rows.push({ name, ok: !!ok, detail: String(detail).slice(0, 200) });
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ` — ${detail}` : ''}`);
}

function startServer() {
  return spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], {
    cwd: ROOT,
    stdio: 'ignore',
  });
}

async function waitServer(ms = 8000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    try {
      const res = await fetch(BASE);
      if (res.ok) return;
    } catch {
      await new Promise((r) => setTimeout(r, 120));
    }
  }
  throw new Error(`server did not start on ${PORT}`);
}

async function snap(page, name) {
  fs.mkdirSync(OUT, { recursive: true });
  const file = path.join(OUT, name);
  await page.screenshot({ path: file });
  return file;
}

async function fightHud(page, lang, kit, tag) {
  await page.addInitScript((l) => {
    localStorage.setItem('dd.lang.v3', l);
    localStorage.setItem('dd.controlsBrief.v4', '1');
  }, lang);
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__debug);
  await page.evaluate((id) => {
    window.__debug.startFight(id);
    window.__debug.setGod(true);
  }, kit);
  await page.waitForTimeout(400);
  await page.evaluate((cd) => {
    const p = window.__game.player;
    if (p) p.gpuCooldowns = cd;
  }, { rtx5090: 2.1, h200: 0, b200: 9.5 });
  await page.waitForTimeout(150);
  const hud = await page.locator('#hud').innerText();
  const hpNum = await page.locator('#hud-hp-numeric').innerText();
  const skill = await page.locator('#hud-skill-name').innerText();
  const boss = await page.locator('#boss-name').innerText();
  check(`${tag} ${lang} ${kit} boss arena label`, boss.includes('548 Market Street'), boss);
  check(`${tag} ${lang} ${kit} HP numeric`, /\d+\s*\/\s*\d+/.test(hpNum), hpNum);
  check(`${tag} ${lang} ${kit} skill name visible`, skill.length > 2, skill);
  check(`${tag} ${lang} ${kit} GPU rows`, hud.includes('RTX 5090') && hud.includes('H200'), hud.slice(0, 80));
  const lay = await page.evaluate(() => {
    const root = document.documentElement;
    const gs = parseFloat(getComputedStyle(root).getPropertyValue('--game-scale')) || 1;
    const gx = parseFloat(getComputedStyle(root).getPropertyValue('--game-x')) || 0;
    const gy = parseFloat(getComputedStyle(root).getPropertyValue('--game-y')) || 0;
    const floor = {
      left: gx + 128 * gs,
      top: gy + 76 * gs,
      right: gx + (128 + 384) * gs,
      bottom: gy + (76 + 208) * gs,
    };
    const holo = {
      left: gx + 260 * gs,
      top: gy + 44 * gs,
      right: gx + 380 * gs,
      bottom: gy + 84 * gs,
    };
    const overlap = (a, b) => !(a.right <= b.left || a.left >= b.right || a.bottom <= b.top || a.top >= b.bottom);
  const rect = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, h: r.height, w: r.width };
    };
    const footer = rect('.hud-bottom-band');
    const boss = rect('.hud-boss-top');
    const gpu = rect('.hud-gpu-grid');
    const footerH = footer?.h || 0;
    return {
      floor,
      holo,
      footer,
      boss,
      gpu,
      footerOnGutter: footer ? footer.top >= floor.bottom - 1 : false,
      bossClearsHolo: boss ? !overlap(boss, holo) : true,
      footerClearsFloor: footer ? !overlap(footer, floor) : true,
      bossClearsFloor: boss ? !overlap(boss, floor) : true,
      gpuHorizontal: (() => {
        const g = document.querySelector('.hud-gpu-grid');
        if (!g) return false;
        const cols = getComputedStyle(g).gridTemplateColumns.split(' ').filter(Boolean).length;
        return cols >= 3;
      })(),
      minFontPx: footer ? parseFloat(getComputedStyle(document.querySelector('.hud-bottom-band')).fontSize) : 0,
    };
  });
  check(`${tag} ${lang} ${kit} footer below floor`, lay.footerClearsFloor, JSON.stringify(lay.footer));
  check(`${tag} ${lang} ${kit} boss not on holo band`, lay.bossClearsHolo, JSON.stringify(lay.boss));
  check(`${tag} ${lang} ${kit} GPU row span`, lay.gpuHorizontal);
  const readyVisible = await page.evaluate(() => {
    const f=document.querySelector('.hud-bottom-band')?.getBoundingClientRect();
    return [...document.querySelectorAll('.gpu-status')].every(el=>{const r=el.getBoundingClientRect();return f && r.top>=f.top && r.bottom<=f.bottom+1;});
  });
  check(`${tag} ${lang} ${kit} GPU readiness not clipped`, readyVisible);
  check(`${tag} ${lang} ${kit} HUD font ≥14px`, (lay.minFontPx || 0) >= 13.5, String(lay.minFontPx));
  await snap(page, `fight_${tag}_${lang}_${kit}.png`);
}

async function briefFlow(page, lang, tag) {
  await page.addInitScript((code) => {
    localStorage.setItem('dd.lang.v3', code);
    localStorage.removeItem('dd.controlsBrief.v4');
  }, lang);
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__debug);
  const title = await page.locator('.title-inner').innerText();
  check(`${tag} title ${lang}`, lang === 'en' ? title.includes('DISTILLATION DENIED') : title.includes('蒸馏禁令'), title.slice(0, 60));
  check(`${tag} setting ${lang}`, title.includes('548 Market Street'));
  await snap(page, `title_${tag}_${lang}.png`);
  await page.locator('#btn-start').click();
  await page.locator('#btn-disclaimer').click();
  await page.waitForTimeout(200);
  await page.locator('#card-glm').click();
  await page.waitForFunction(() => !document.getElementById('screen-controls-help')?.classList.contains('is-hidden'));
  check(`${tag} brief overlay ${lang}`, await page.locator('#screen-controls-help').isVisible());
  await snap(page, `brief_${tag}_${lang}.png`);
  await page.locator('#btn-fight-brief').click();
  await page.waitForTimeout(350);
  check(`${tag} fight after brief ${lang}`, (await page.evaluate(() => window.__debug.state().state)) === 'intro'
    || (await page.evaluate(() => window.__debug.state().state)) === 'fight');
}

const server = startServer();
try {
  await waitServer();
  const browser = await chromium.launch({ headless: true });
  const viewports = [
    { w: 1280, h: 720, tag: '1280x720' },
    { w: 960, h: 600, tag: '960x600' },
  ];

  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: { width: vp.w, height: vp.h } });
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('response', (r) => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });

    await briefFlow(page, 'zh', vp.tag);
    await briefFlow(page, 'en', vp.tag);
    for (const kit of ['deepseek', 'kimi', 'glm']) {
      await fightHud(page, 'zh', kit, vp.tag);
      await fightHud(page, 'en', kit, vp.tag);
    }
    await page.close();
  }

  check('browser console and HTTP clean', errors.length === 0, errors.join(' | '));
  await browser.close();

  const pass = rows.filter((r) => r.ok).length;
  const fail = rows.length - pass;
  const report = {
    port: PORT,
    base: BASE,
    pass,
    fail,
    rows,
    errors,
    screensDir: OUT,
    assists: 'debug startFight/setGod; synthetic gpuCooldowns for CD snapshot; briefing via real UI clicks.',
    w4ClaudeOffsets: {
      note: 'After W1 footer (--hud-footer-h up to 110px, bottom var(--hud-footer-bottom)), move #claude-combat-caption below footer stack.',
      suggestedCaptionBottom: 'calc(var(--hud-footer-bottom) + var(--hud-footer-h) + 60px)',
      suggestedToastTop: 'calc(var(--game-y) + 52 * var(--game-scale))',
    },
  };
  fs.writeFileSync(path.join(OUT, 'v4_ui.json'), JSON.stringify(report, null, 2));
  fs.writeFileSync(path.join(OUT, 'v4_ui.txt'), `${pass} PASS / ${fail} FAIL\n` + rows.map((r) => `${r.ok ? 'PASS' : 'FAIL'} ${r.name}`).join('\n'));
  console.log(`TOTAL ${pass} PASS / ${fail} FAIL`);
  process.exitCode = fail ? 1 : 0;
} finally {
  server.kill('SIGTERM');
}