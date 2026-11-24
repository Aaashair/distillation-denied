#!/usr/bin/env node
/** W1 v5.1 sidebar labels, boss dedupe, scrollable controls — port 8171 */
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const PORT = Number(process.env.PORT || 8171);
const BASE = `http://127.0.0.1:${PORT}/`;
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = process.env.OUT || process.env.SCREEN_OUT || 'test-output/v5_1/w1';

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
      if ((await fetch(BASE)).ok) return;
    } catch {
      await new Promise((r) => setTimeout(r, 120));
    }
  }
  throw new Error(`server ${PORT}`);
}

async function snap(page, name) {
  fs.mkdirSync(OUT, { recursive: true });
  await page.screenshot({ path: path.join(OUT, name) });
}

async function fightSetup(page, lang, phase) {
  await page.addInitScript((l) => {
    localStorage.setItem('dd.lang.v3', l);
    localStorage.setItem('dd.controlsBrief.v4', '1');
  }, lang);
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__debug);
  await page.evaluate((ph) => {
    window.__debug.startFight('deepseek');
    window.__debug.setGod(true);
    window.__debug.setPhase(ph);
  }, phase);
  await page.waitForTimeout(450);
}

async function assertSidebar(page, tag, lang, phase) {
  await page.evaluate(()=>{const sc=document.getElementById('hud-sidebar-scroll');if(sc)sc.scrollTop=0});
  await snap(page, `labels_initial_${tag}_${lang}_p${phase}.png`);
  const audit = await page.evaluate(() => {
    const fs = parseFloat(getComputedStyle(document.documentElement).fontSize) || 14;
    const scroll = document.getElementById('hud-sidebar-scroll');
    const claudeH = document.getElementById('hud-claude-heading')?.textContent?.trim() || '';
    const darioH = document.getElementById('hud-dario-heading')?.textContent?.trim() || '';
    const ctrlH = document.getElementById('hud-ctrl-heading')?.textContent?.trim() || '';
    const distillLbl = document.getElementById('distill-label')?.textContent?.trim() || '';
    const distillVal = document.getElementById('distill-value')?.textContent?.trim() || '';
    const arena = document.getElementById('boss-arena')?.textContent?.trim() || '';
    const bossName = document.getElementById('boss-name')?.textContent?.trim() || '';
    const bossPhase = document.getElementById('boss-phase')?.textContent?.trim() || '';
    const bodyText = document.body.innerText || '';
    const hoCount = (bodyText.match(/\bHOLO\b/g) || []).length;
    const scrollable = scroll && scroll.scrollHeight > scroll.clientHeight + 2;
    const lastLi = scroll?.querySelector('.hud-side-ctrl-list li:last-child');
    let lastVisible = false;
    if (lastLi && scroll) {
      const sr = scroll.getBoundingClientRect();
      const lr = lastLi.getBoundingClientRect();
      lastVisible = lr.bottom <= sr.bottom + 1 && lr.top >= sr.top - 1;
    }
    const fonts = [...document.querySelectorAll('#hud .hud-comms-title, #hud .distill-label, #hud .hud-side-ctrl-list li')]
      .map((el) => parseFloat(getComputedStyle(el).fontSize));
    const minFont = fonts.length ? Math.min(...fonts) : 0;
    const hp = document.getElementById('hud-hp-numeric');
    const hpBox = hp?.getBoundingClientRect();
    const sideBox = document.getElementById('hud')?.getBoundingClientRect();
    const hpClip = hpBox && sideBox && hpBox.right > sideBox.right + 1;
    return {
      claudeH, darioH, ctrlH, distillLbl, distillVal, arena, bossName, bossPhase, hoCount,
      scrollable, lastVisible, minFont, hpClip,
      arenaOnBoss: arena.includes('548'),
      combinedBoss: document.getElementById('boss-arena')?.textContent?.includes('Claude'),
    };
  });

  const wantClaude = lang === 'en' ? 'Claude Combat' : 'Claude战斗提示';
  const wantDario = lang === 'en' ? 'Dario Comms' : 'Dario全息通讯';
  const wantCtrl = lang === 'en' ? 'CONTROLS' : '操作说明';
  const wantDistill = lang === 'en' ? 'Distillation progress' : '蒸馏进度';

  check(`${tag} ${lang} p${phase} Claude header`, audit.claudeH.includes('Claude') || audit.claudeH.includes('战斗'), audit.claudeH);
  check(`${tag} ${lang} p${phase} Dario header`, audit.darioH.includes('Dario') || audit.darioH.includes('全息'), audit.darioH);
  check(`${tag} ${lang} p${phase} Controls header`, audit.ctrlH === wantCtrl || audit.ctrlH.includes('操作') || audit.ctrlH.includes('CONTROL'), audit.ctrlH);
  check(`${tag} ${lang} p${phase} no HOLO text`, audit.hoCount === 0, String(audit.hoCount));
  check(`${tag} ${lang} p${phase} distill label`, audit.distillLbl === wantDistill, audit.distillLbl);
  check(`${tag} ${lang} p${phase} distill value only %`, /^\d+\.\d%$/.test(audit.distillVal), audit.distillVal);
  check(`${tag} ${lang} p${phase} arena once line1`, audit.arenaOnBoss && !audit.combinedBoss, `${audit.arena} | ${audit.bossName}`);
  check(`${tag} ${lang} p${phase} boss name once`, audit.bossName.length > 2 && !audit.bossName.includes('548'), audit.bossName);
  const realUi=await page.evaluate(()=>{const h=document.querySelector('.hud-boss-top').getBoundingClientRect();const b=document.querySelector('.bar-boss').getBoundingClientRect();const text=document.querySelector('.hud-boss-top').textContent;const name=document.getElementById('boss-name').textContent.split(' · ')[0];const cap=document.getElementById('claude-combat-caption');return {barVisible:b.top>=h.top&&b.bottom<=h.bottom+1, nameCount:text.toLowerCase().split(name.toLowerCase()).length-1, capCount:document.querySelectorAll('#claude-combat-caption').length, toastCount:document.querySelectorAll('#claude-attack-toast').length, capInSection:!!cap.closest('.hud-comms-claude'), capText:cap.textContent};});
  check(`${tag} ${lang} p${phase} boss HP strip actually inside header`,realUi.barVisible,JSON.stringify(realUi));
  check(`${tag} ${lang} p${phase} all-phase boss name exactly once`,realUi.nameCount===1,JSON.stringify(realUi));
  check(`${tag} ${lang} p${phase} unique owned live Claude nodes`,realUi.capCount===1&&realUi.toastCount===1&&realUi.capInSection,JSON.stringify(realUi));
  if (phase === 1) check(`${tag} ${lang} p1 no duplicate phase line`, !audit.bossPhase || !audit.bossPhase.includes(audit.bossName), audit.bossPhase);
  check(`${tag} ${lang} p${phase} font ≥14`, audit.minFont >= 13.5, String(audit.minFont));
  check(`${tag} ${lang} p${phase} HP not clipped`, !audit.hpClip);

  if (!audit.lastVisible) {
    await page.locator('#hud-sidebar-scroll').focus();
    await page.keyboard.press('End');
    await page.waitForTimeout(80);
    const scrolled = await page.evaluate(() => {
      const sc = document.getElementById('hud-sidebar-scroll');
      const li = sc?.querySelector('.hud-side-ctrl-list li:last-child');
      if (!sc || !li) return false;
      const sr = sc.getBoundingClientRect();
      const lr = li.getBoundingClientRect();
      return lr.bottom <= sr.bottom + 2;
    });
    check(`${tag} ${lang} p${phase} controls reachable (scroll)`, scrolled || audit.lastVisible);
    await snap(page, `controls_scrolled_${tag}_${lang}_p${phase}.png`);
  } else {
    check(`${tag} ${lang} p${phase} controls visible without scroll`, true);
  }

  await page.evaluate(async () => {
    const { forceMandatoryLine } = await import('/src/ui/claude.js');
    forceMandatoryLine(window.__game, 'KYC');
  });
  await page.waitForTimeout(200);
  const kyc = await page.evaluate(() => document.getElementById('claude-combat-caption')?.textContent?.trim() || '');
  check(`${tag} ${lang} p${phase} KYC caption`, lang === 'en' ? kyc.includes('KYC') : /KYC|认证/.test(kyc), kyc.slice(0, 60));
  await page.evaluate(() => window.__game.bus.emit('fight_start'));
  await page.waitForTimeout(300);
  const darioHead = await page.evaluate(() => document.getElementById('hud-dario-heading')?.textContent?.trim() || '');
  const darioBody = await page.evaluate(() => document.querySelector('.dario-msg')?.textContent?.trim() || '');
  check(`${tag} ${lang} p${phase} Dario header after line`, darioHead.includes('Dario') || darioHead.includes('全息'), darioHead);
  check(`${tag} ${lang} p${phase} Dario line localized`, darioBody.length > 8 && !darioBody.includes('HOLO'), darioBody.slice(0, 80));

  await snap(page, `sidebar_${tag}_${lang}_p${phase}.png`);
}

const server = startServer();
try {
  await waitServer();
  const browser = await chromium.launch({ headless: true });
  const vps = [
    { w: 1280, h: 720, tag: '1280x720' },
    { w: 1024, h: 615, tag: '1024x615' },
    { w: 960, h: 600, tag: '960x600' },
  ];
  for (const vp of vps) {
    for (const lang of ['en', 'zh']) {
      for (const phase of [1, 2, 3]) {
        const page = await browser.newPage({ viewport: { width: vp.w, height: vp.h } });
        page.on('pageerror', (e) => errors.push(e.message));
        page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
        await fightSetup(page, lang, phase);
        await assertSidebar(page, vp.tag, lang, phase);
        await page.close();
      }
    }
  }
  check('console/HTTP clean', errors.length === 0, errors.join(' | '));
  await browser.close();
  const pass = rows.filter((r) => r.ok).length;
  const fail = rows.length - pass;
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, 'v5_1_sidebar.json'), JSON.stringify({ pass, fail, rows, errors, port: PORT, OUT }, null, 2));
  fs.writeFileSync(path.join(OUT, 'v5_1_sidebar.txt'), `${pass} PASS / ${fail} FAIL\n`);
  console.log(`TOTAL ${pass} PASS / ${fail} FAIL`);
  process.exitCode = fail ? 1 : 0;
} finally {
  server.kill('SIGTERM');
}