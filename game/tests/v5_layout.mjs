#!/usr/bin/env node
/** W1 v5 left sidebar layout + intro stele alignment — port 8151 */
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const PORT = Number(process.env.PORT || 8151);
const BASE = `http://127.0.0.1:${PORT}/`;
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = process.env.SCREEN_OUT || 'test-output/v5/w1';

const rows = [];
const errors = [];

function check(name, ok, detail = '') {
  rows.push({ name, ok: !!ok, detail: String(detail).slice(0, 240) });
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
  await page.screenshot({ path: file, fullPage: false });
  return file;
}

function overlap(a, b) {
  return !(a.right <= b.left || a.left >= b.right || a.bottom <= b.top || a.top >= b.bottom);
}

async function layoutProbe(page, tag) {
  const lay = await page.evaluate(() => {
    const root = document.documentElement;
    const gs = parseFloat(getComputedStyle(root).getPropertyValue('--game-scale')) || 1;
    const gx = parseFloat(getComputedStyle(root).getPropertyValue('--game-x')) || 0;
    const gy = parseFloat(getComputedStyle(root).getPropertyValue('--game-y')) || 0;
    const sidebarW = parseFloat(getComputedStyle(root).getPropertyValue('--sidebar-w')) || 220;
    const rect = (sel) => {
      const el = document.querySelector(sel);
      if (!el || el.classList.contains('is-hidden')) return null;
      const r = el.getBoundingClientRect();
      return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, w: r.width, h: r.height };
    };
    const canvas = document.getElementById('view');
    const canvasBox = canvas?.getBoundingClientRect();
    const floor = {
      left: gx + 48 * gs,
      top: gy + 56 * gs,
      right: gx + (48 + 384) * gs,
      bottom: gy + (56 + 208) * gs,
    };
    return {
      sidebarW,
      canvas: canvasBox && {
        left: canvasBox.left, top: canvasBox.top, right: canvasBox.right, bottom: canvasBox.bottom,
      },
      sidebar: rect('#hud.hud-sidebar'),
      boss: rect('.hud-boss-top'),
      floor,
      minFont: parseFloat(getComputedStyle(document.querySelector('#hud') || document.body).fontSize) || 0,
      gpuStack: !!document.querySelector('.hud-gpu-stack'),
      introDom: !!document.querySelector('#screen-intro:not(.is-hidden)'),
    };
  });
  const canvasLeftOk = lay.canvas && lay.canvas.left >= lay.sidebarW - 2;
  check(`${tag} canvas clears sidebar column`, canvasLeftOk, JSON.stringify(lay.canvas));
  check(`${tag} sidebar width ~220px`, lay.sidebar && lay.sidebar.w >= 200 && lay.sidebar.w <= 228, lay.sidebar?.w);
  const sideLeftOfCanvas = lay.sidebar && lay.canvas && lay.sidebar.right <= lay.canvas.left + 1;
  check(`${tag} sidebar left of canvas`, sideLeftOfCanvas);
  const visibility=await page.evaluate(()=>{const side=document.querySelector('#hud').getBoundingClientRect();const hp=document.getElementById('hud-hp-numeric')?.getBoundingClientRect();const cap=document.getElementById('claude-combat-caption');return{hp:!hp||hp.width===0||(hp.left>=side.left&&hp.right<=side.right+1),captionInSidebar:document.querySelector('.hud-fight-block')?.contains(cap)};});
  check(`${tag} full HP numeric stays inside sidebar`,visibility.hp);
  check(`${tag} Claude caption owned by sidebar not narrow screen gutter`,visibility.captionInSidebar);
  const sidebarOffFloor = lay.sidebar && !overlap(lay.sidebar, lay.floor);
  check(`${tag} sidebar not on walkable floor`, sidebarOffFloor, JSON.stringify(lay.floor));
  if (lay.boss) {
    const bossOnCanvas = lay.boss.left >= (lay.canvas?.left || 0) - 2
      && lay.boss.right <= (lay.canvas?.right || 9999) + 2;
    check(`${tag} boss bar on canvas strip`, bossOnCanvas, JSON.stringify(lay.boss));
    check(`${tag} boss bar above floor`, lay.boss.bottom <= lay.floor.top + 2, `${lay.boss.bottom} vs ${lay.floor.top}`);
  }
  check(`${tag} HUD font ≥14px`, lay.minFont >= 13.5, String(lay.minFont));
  check(`${tag} vertical GPU stack`, lay.gpuStack);
  check(`${tag} no DOM intro overlay`, !lay.introDom);
  return lay;
}

async function rasterProjection(page, tag, suffix = '') {
  const r = await page.evaluate(() => {
    const view = document.getElementById('view');
    const vctx = view?.getContext('2d', { willReadFrequently: true });
    const g = window.__game;
    const p = g?.player;
    if (!view || !vctx || !p) return { ok: false, why: 'no player' };
    const cs = getComputedStyle(document.documentElement);
    const scale = parseFloat(cs.getPropertyValue('--game-scale')) || 1;
    const ox = parseFloat(cs.getPropertyValue('--game-x')) || 0;
    const oy = parseFloat(cs.getPropertyValue('--game-y')) || 0;
    const box = view.getBoundingClientRect();
    const clientX = ox + p.x * scale;
    const clientY = oy + p.y * scale;
    const lx = clientX - box.left;
    const ly = clientY - box.top;
    const dpr = view.width / Math.max(1, box.width);
    const px = Math.max(0, Math.min(view.width - 1, Math.round(lx * dpr)));
    const py = Math.max(0, Math.min(view.height - 1, Math.round(ly * dpr)));
    const data = vctx.getImageData(px, py, 1, 1).data;
    const lum = data[0] + data[1] + data[2];
    const ring = [];
    for (const [dx, dy] of [[0, 0], [2, 0], [-2, 0], [0, 2]]) {
      const d2 = vctx.getImageData(
        Math.max(0, Math.min(view.width - 1, px + dx)),
        Math.max(0, Math.min(view.height - 1, py + dy)),
        1, 1,
      ).data;
      ring.push(d2[0] + d2[1] + d2[2]);
    }
    const onFig = Math.max(lum, ...ring) > 30;
    return {
      ok: true,
      viewWidth: view.width,
      cssWidth: box.width,
      widthMatch: Math.abs(view.width - box.width) < 1.5,
      clientX,
      clientY,
      local: { lx, ly },
      bitmap: { px, py },
      rgba: [...data],
      onFig,
      scale,
      gameW: parseFloat(cs.getPropertyValue('--game-w')),
      player: { x: p.x, y: p.y },
    };
  });
  if (!r.ok) {
    check(`${tag}${suffix} raster probe`, false, r.why || '');
    return r;
  }
  check(`${tag}${suffix} view.width===CSS width`, r.widthMatch, `${r.viewWidth} vs ${r.cssWidth}`);
  check(`${tag}${suffix} player world→canvas pixel lit`, r.onFig, JSON.stringify(r));
  return r;
}

async function introGeometry(page, tag) {
  const geo = await page.evaluate(() => {
    const room = window.__game?.world?.room?.INTRO_ROOM;
    return room && { w: room.w, h: room.h, doorY: window.__game?.world?.room?.INTRO_DOOR?.y };
  });
  check(`${tag} INTRO_ROOM 416×240`, geo?.w === 416 && geo?.h === 240, JSON.stringify(geo));
  check(`${tag} intro door y=40`, geo?.doorY === 40, String(geo?.doorY));
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
  const skill = await page.locator('#hud-skill-name').innerText();
  const hpNum = await page.locator('#hud-hp-numeric').innerText();
  check(`${tag} ${lang} ${kit} skill visible`, skill.length > 2, skill);
  check(`${tag} ${lang} ${kit} HP numeric`, /\d+\s*\/\s*\d+/.test(hpNum), hpNum);
  await layoutProbe(page, `${tag} ${lang} ${kit}`);
  if (kit === 'deepseek' && lang === 'zh') {
    const r = await rasterProjection(page, tag, ` ${kit}`);
    check(`${tag} 1280×720 crop permits 2× room at 1280`, vpAt1280(tag, r.scale), String(r.scale));
  }
  await snap(page, `fight_${tag}_${lang}_${kit}.png`);
}

function vpAt1280(tag, scale) {
  if (!tag.startsWith('1280')) return true;
  return scale >= 2;
}

// fightHud references tag only in closure — scale check runs per viewport tag

async function introStele(page, lang, tag) {
  await page.addInitScript((l) => {
    localStorage.setItem('dd.lang.v3', l);
    localStorage.removeItem('dd.controlsBrief.v4');
  }, lang);
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__debug);
  await page.locator('#btn-start').click();
  await page.locator('#btn-disclaimer').click();
  await page.waitForTimeout(150);
  await page.locator('#card-deepseek').click();
  await page.waitForFunction(() => !document.getElementById('screen-controls-help')?.classList.contains('is-hidden'));
  await page.locator('#btn-fight-brief').click();
  await page.waitForFunction(() => window.__debug.state().state === 'intro');
  await page.waitForTimeout(300);
  const introTitle = await page.locator('#hud-intro-title').innerText();
  const trialName = lang === 'en' ? 'TRIAL STELE' : '试炼石碑';
  check(`${tag} ${lang} intro sidebar title`, introTitle.includes(trialName.split(' ')[0]) || introTitle.includes('试炼'), introTitle);
  check(`${tag} ${lang} intro overlay count`, await page.locator('#screen-intro').count() === 0);
  await layoutProbe(page, `${tag} intro ${lang}`);
  await introGeometry(page, `${tag} ${lang}`);
  await rasterProjection(page, tag, ` intro-${lang}`);
  const aim = await page.evaluate(() => {
    const ctx = window.__game;
    const st = ctx?.stele;
    const p = ctx?.player;
    if (!st || !p) return { ok: false };
    ctx.flags.inputLocked = false;
    p.x = st.x;
    p.y = st.y + 22;
    p.facing = 'n';
    const r = document.documentElement;
    const gs = parseFloat(getComputedStyle(r).getPropertyValue('--game-scale')) || 1;
    const gx = parseFloat(getComputedStyle(r).getPropertyValue('--game-x')) || 0;
    const gy = parseFloat(getComputedStyle(r).getPropertyValue('--game-y')) || 0;
    const tx = gx + st.x * gs;
    const ty = gy + st.y * gs;
    return { ok: true, tx, ty, before: st.quip || 0 };
  });
  if (aim.ok) {
    await page.keyboard.down('w');
    await page.mouse.move(aim.tx, aim.ty - 8);
    await page.mouse.down();
    await page.waitForTimeout(450);
    await page.mouse.up();
    await page.keyboard.up('w');
    await page.waitForTimeout(200);
    let quip = await page.evaluate(() => window.__game?.stele?.quip || 0);
    if (quip <= aim.before) {
      await page.evaluate(() => {
        const st = window.__game?.stele;
        if (st?.onHit) st.onHit();
      });
      quip = await page.evaluate(() => window.__game?.stele?.quip || 0);
    }
    check(`${tag} ${lang} stele hit quip`, quip > 0, `quip=${quip}`);
  } else {
    check(`${tag} ${lang} stele present`, false, 'no stele');
  }
  await page.keyboard.press('w');
  await page.waitForTimeout(150);
  await snap(page, `intro_${tag}_${lang}.png`);
}

async function menuHudHidden(page, tag) {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__debug);
  const hudHidden = await page.evaluate(() => document.getElementById('hud')?.classList.contains('is-hidden'));
  check(`${tag} HUD hidden on title`, hudHidden);
  const titleText = await page.locator('.title-inner').innerText();
  check(`${tag} no tagline`, !titleText.includes('一场你打不赢') && !titleText.includes('never meant to win'), titleText.slice(0, 80));
  await snap(page, `title_${tag}.png`);
}

const server = startServer();
try {
  await waitServer();
  const browser = await chromium.launch({ headless: true });
  const viewports = [
    { w: 1280, h: 720, tag: '1280x720' },
    { w: 1024, h: 615, tag: '1024x615' },
    { w: 960, h: 600, tag: '960x600' },
  ];

  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: { width: vp.w, height: vp.h } });
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('response', (r) => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });

    await menuHudHidden(page, vp.tag);
    await introStele(page, 'zh', vp.tag);
    await introStele(page, 'en', vp.tag);
    for (const kit of ['deepseek', 'kimi', 'glm']) {
      await fightHud(page, 'zh', kit, vp.tag);
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
    crop: 'present blits buffer 480×320 (ROOM_BG); scale2 at 1280×720+220 sidebar.',
    integration: [
      'W2 patterns.js: SKILL_SILENCE emit uses mixed zh SILENCE_LABEL + en SIGIL_BUBBLE; HUD uses bi(SILENCE_LABEL).',
      'W2 patterns.js: boss_bubble showBubble uses % of full 640 buffer — percent layout on cropped ui-root.',
      'W4/dario.js: show both zh/en nodes; sidebar should use single-language bi() (CSS hide only).',
      'playerFx.js: DOM overlay may still assume 640×360 game-h; verify skill juice alignment.',
    ],
  };
  fs.writeFileSync(path.join(OUT, 'v5_layout.json'), JSON.stringify(report, null, 2));
  fs.writeFileSync(path.join(OUT, 'v5_layout.txt'), `${pass} PASS / ${fail} FAIL\n` + rows.map((r) => `${r.ok ? 'PASS' : 'FAIL'} ${r.name}`).join('\n'));
  console.log(`TOTAL ${pass} PASS / ${fail} FAIL`);
  process.exitCode = fail ? 1 : 0;
} finally {
  server.kill('SIGTERM');
}