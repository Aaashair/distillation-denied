#!/usr/bin/env node
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(new URL('..', import.meta.url).pathname);
const PORT = Number(process.env.W4_PORT || 8122);
const OUT = process.argv[2] || 'test-output/v4/w4';
fs.mkdirSync(OUT, { recursive: true });

function startServer() {
  return spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], {
    cwd: ROOT,
    stdio: 'ignore',
  });
}

async function waitServer(url, tries = 40) {
  for (let i = 0; i < tries; i += 1) {
    try {
      const res = await fetch(url, { method: 'HEAD' });
      if (res.ok || res.status === 404) return;
    } catch { /* retry */ }
    await new Promise((r) => setTimeout(r, 120));
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
await page.waitForFunction(() => window.__debug && window.__game?.audio?.getPlayLog);

async function setLang(lang) {
  await page.reload();
  await page.waitForFunction(() => window.__debug);
  await page.locator(`[data-lang="${lang}"]`).click();
  await page.waitForFunction((l) => localStorage.getItem('dd.lang.v3') === l, lang);
}

async function fightGod() {
  await page.evaluate(() => {
    window.__game.audio.clearPlayLog();
    window.__game.audio.unlock();
    window.__debug.startFight('deepseek');
    window.__debug.setGod(true);
  });
  await page.waitForTimeout(350);
}

async function readCaption() {
  return page.evaluate(() => {
    const el = document.getElementById('claude-combat-caption');
    const dom = el?.textContent?.trim() || '';
    const last = window.__game?.claudeCombat?.lastLine?.text || '';
    return dom || last;
  });
}

const captions = [];
for (const lang of ['en', 'zh']) {
  await setLang(lang);
  await fightGod();
  check(`fight ready ${lang}`, (await page.evaluate(() => window.__debug.state().state)) === 'fight');

  await page.evaluate(() => {
    window.__game.audio.clearPlayLog();
    window.__debug.setPhase(2);
    window.__game.audio.playVo('v2_vo_sonnet_intro');
    window.__game.audio.playVo('v2_vo_sonnet_attack');
  });
  await page.waitForTimeout(900);

  await page.evaluate(() => window.__debug.forcePattern('p1_refusal'));
  await page.waitForTimeout(600);

  const caption = await readCaption();
  captions.push({ lang, caption });
  check(`caption visible ${lang}`, caption.length > 3, caption.slice(0, 80));
  if (lang === 'en') {
    check('caption EN no CJK', !/[\u4e00-\u9fff]/.test(caption), caption.slice(0, 80));
  } else {
    check('caption CN has han', /[\u4e00-\u9fff]/.test(caption), caption.slice(0, 80));
  }

  for (const [key, needle] of [['ip', '中国 IP'], ['kyc', 'KYC']]) {
    const actual = await page.evaluate(async needle => {
      const { tryCombatLine } = await import('/src/ui/claude.js');
      for (let i = 0; i < 12; i++) {
        const line = tryCombatLine(window.__game, 'attack', { force: true });
        if (line?.zh?.includes(needle)) return { line, rendered:document.getElementById('claude-combat-caption')?.textContent };
      }
      return null;
    }, needle);
    check(`mandatory ${key} production caption ${lang}`, !!actual && actual.rendered === actual.line[lang], JSON.stringify(actual));
    await page.screenshot({ path:`${OUT}/mandatory_${key}_${lang}.png` });
  }
  captions[captions.length - 1].caption = await readCaption();

  const voLog = await page.evaluate(() => window.__game.audio.getPlayLog());
  const claudeVo = voLog.filter((e) => e.kind === 'vo' && /^v2_vo_(haiku|sonnet|opus)_/.test(e.id));
  const claudePlayed = claudeVo.filter((e) => !e.muted);
  const sfx = voLog.filter((e) => e.kind === 'sfx');
  check(`sfx still logged ${lang}`, sfx.length > 0, String(sfx.length));

  if (lang === 'en') {
    check('Claude combat VO muted EN', claudeVo.length > 0 && claudePlayed.length === 0, JSON.stringify(claudeVo.slice(0, 8)));
  } else {
    check('Claude combat VO logged CN', claudeVo.length > 0 && claudeVo.every((e) => !e.muted), JSON.stringify(claudeVo.slice(0, 8)));
  }

  await page.screenshot({ path: `${OUT}/combat_${lang}.png` });

  const spam = await page.evaluate(async () => {
    const g = window.__game;
    const before = g.claudeCombat?.lineCount || 0;
    for (let i = 0; i < 6; i += 1) {
      window.__debug.forcePattern('p2_spiral');
      await new Promise((r) => setTimeout(r, 180));
    }
    const after = g.claudeCombat?.lineCount || 0;
  return { before, after, cooldown: g.claudeCombat?.cooldownUntil || 0, elapsed: g.time?.elapsed || 0 };
  });
  check(`cooldown limits spam ${lang}`, spam.after - spam.before <= 1, JSON.stringify(spam));
}

check(
  'mandatory IP/KYC variants in session',
  captions.some((c) => /Chinese IP detected|KYC verification in progress/i.test(c.caption))
    && captions.some((c) => /检测到中国 IP|正在 KYC/.test(c.caption)),
  JSON.stringify(captions),
);
check('browser console and HTTP clean', errors.length === 0, errors.join(' | '));

const pass = rows.filter((r) => r.ok).length;
const fail = rows.length - pass;
fs.writeFileSync(`${OUT}/v4_claude.json`, JSON.stringify({
  url, pass, fail, errors, rows,
  assists: 'debug startFight/setGod/setPhase/forcePattern; explicit playVo sonnet probes; forced production tryCombatLine calls bypass cooldown only for mandatory-line screenshots; no direct caption DOM edits.',
}, null, 2));
fs.writeFileSync(`${OUT}/v4_claude.txt`, `${rows.map((r) => `${r.ok ? 'PASS' : 'FAIL'} ${r.name} ${r.detail}`).join('\n')}\nTOTAL ${pass} PASS / ${fail} FAIL\n`);

await browser.close();
server.kill('SIGTERM');
console.log(`TOTAL ${pass} PASS / ${fail} FAIL`);
process.exitCode = fail ? 1 : 0;