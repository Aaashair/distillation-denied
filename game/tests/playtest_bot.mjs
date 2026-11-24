// v2 keyboard playtest — arrows shoot, Q flasks, Shift skill.
//   node tests/playtest_bot.mjs [baseUrl]
// Serve: npx --yes serve -l 8106 .

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const base = process.argv[2] || 'http://localhost:8106/';
const outDir = path.resolve(process.argv[3] || 'test-output/v2');
fs.mkdirSync(outDir, { recursive: true });

const rows = [];
const errors = [];

function pass(name, ok, detail) {
  rows.push({ name, ok: !!ok, detail: detail || '' });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}  ${detail || ''}`);
}

const browser = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});

function watch(page) {
  page.on('console', (msg) => {
    const type = msg.type();
    if (type === 'error' || type === 'warning') errors.push(`[${type}] ${msg.text()}`);
  });
  page.on('pageerror', (err) => errors.push(`[pageerror] ${err.message}`));
  page.on('requestfailed', (req) => {
    const text = req.failure()?.errorText || '';
    if (/ERR_ABORTED/.test(text) && /\.(mp3|mp4|webm|ogg)$/.test(req.url())) return;
    errors.push(`[reqfail] ${req.url()} ${text}`);
  });
  page.on('response', (res) => {
    if (res.status() >= 400) errors.push(`[http ${res.status()}] ${res.url()}`);
  });
}

async function shot(page, name) {
  await page.screenshot({ path: path.join(outDir, `bot_${name}.png`) });
}

async function state(page) {
  return page.evaluate(() => {
    const st = window.__debug ? window.__debug.state() : null;
    if (!st) return null;
    const dbg = window.__game?.debug || {};
    return {
      ...st,
      playerAlive: !!(st.player && st.player.hp > 0),
      playerHp: st.player?.hp,
      playerMaxHp: st.player?.maxHp,
      bossRatio: st.bossMaxHp ? st.bossHp / st.bossMaxHp : null,
      playerDmgMul: dbg.playerDmgMul ?? 1,
      phase: st.phase,
    };
  });
}

async function tap(page, key, times = 1, gap = 140) {
  for (let i = 0; i < times; i += 1) {
    await page.keyboard.press(key);
    if (i + 1 < times) await page.waitForTimeout(gap);
  }
}

async function until(page, pred, ms, step = 250) {
  const end = Date.now() + ms;
  let last = null;
  while (Date.now() < end) {
    last = await state(page);
    if (last && pred(last)) return last;
    await page.waitForTimeout(step);
  }
  return last;
}

async function holdAimAtBoss(page) {
  const s = await state(page);
  if (!s || !s.player || s.bossX == null) return;
  const dx = s.bossX - s.player.x;
  const dy = s.bossY - s.player.y;
  const keys = [];
  if (Math.abs(dy) > 8) keys.push(dy < 0 ? 'ArrowUp' : 'ArrowDown');
  if (Math.abs(dx) > 8) keys.push(dx < 0 ? 'ArrowLeft' : 'ArrowRight');
  for (const k of ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']) {
    await page.keyboard.up(k).catch(() => {});
  }
  for (const k of keys) await page.keyboard.down(k);
}

async function releaseAim(page) {
  for (const k of ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']) {
    await page.keyboard.up(k).catch(() => {});
  }
}

async function fightBurst(page, ms) {
  const end = Date.now() + ms;
  const move = ['KeyW', 'KeyA', 'KeyS', 'KeyD'];
  while (Date.now() < end) {
    const s = await state(page);
    if (!s || s.state !== 'fight' || !s.player || s.bossX == null) break;
    await holdAimAtBoss(page);
    const dx = s.bossX - s.player.x;
    const dy = s.bossY - s.player.y;
    const dist = Math.hypot(dx, dy) || 1;
    for (const k of move) await page.keyboard.up(k).catch(() => {});
    // Stay in a band where aimed shots connect, and step aside if a telegraph is up.
    const dodge = (s.telegraphs || []).length > 0 && Math.random() < 0.65;
    if (dodge) {
      await page.keyboard.down(Math.abs(dx) > Math.abs(dy) ? 'KeyW' : 'KeyA');
      await page.keyboard.press('Space');
    } else if (dist > 130) {
      if (dy < -10) await page.keyboard.down('KeyW');
      if (dy > 10) await page.keyboard.down('KeyS');
      if (dx < -10) await page.keyboard.down('KeyA');
      if (dx > 10) await page.keyboard.down('KeyD');
    } else if (dist < 64) {
      if (dy < 0) await page.keyboard.down('KeyS');
      else await page.keyboard.down('KeyW');
      if (dx < 0) await page.keyboard.down('KeyD');
      else await page.keyboard.down('KeyA');
    }
    await page.waitForTimeout(120);
  }
  for (const k of move) await page.keyboard.up(k).catch(() => {});
  await releaseAim(page);
}

async function walkIntroToFight(page) {
  await page.keyboard.down('KeyW');
  const s = await until(page, (st) => st.state === 'fight', 22000, 200);
  await page.keyboard.up('KeyW').catch(() => {});
  return s;
}

async function openCharWithIntro(page, id) {
  await page.goto(base);
  await page.waitForTimeout(700);
  let s = await until(page, (st) => st.state === 'title', 10000);
  if (!s || s.state !== 'title') return s;
  await shot(page, 'title');
  await page.keyboard.press('Enter');
  s = await until(page, (st) => st.state === 'disclaimer', 5000);
  pass('menu disclaimer', s?.state === 'disclaimer', s?.state);
  await page.keyboard.press('Enter');
  s = await until(page, (st) => st.state === 'select', 5000);
  const order = ['deepseek', 'kimi', 'glm'];
  const idx = order.indexOf(id);
  if (idx > 0) await tap(page, 'ArrowRight', idx, 180);
  await page.keyboard.press('Enter');
  s = await until(page, (st) => st.state === 'intro' || st.state === 'fight', 8000);
  if (s?.state === 'intro') {
    await shot(page, 'intro');
    s = await walkIntroToFight(page);
    pass('intro → fight', s?.state === 'fight', s?.state);
  }
  return await until(page, (st) => st.state === 'fight' && st.charId === id, 6000);
}

async function skipTheater(page, tag) {
  let s = await state(page);
  const end = Date.now() + 90000;
  let n = 0;
  while (Date.now() < end) {
    s = await state(page);
    if (s && (s.state === 'credits' || s.state === 'title')) break;
    await page.keyboard.press('Space');
    await page.waitForTimeout(280);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(280);
    n += 1;
    if (n === 3 || n === 8) await shot(page, `${tag}_${String(n).padStart(2, '0')}`);
  }
  return s;
}

async function wireSkillTap(page) {
  await page.evaluate(() => {
    window.__skillEvents = [];
    const bus = window.__game?.bus;
    if (!bus) return;
    const pick = (p) => window.__skillEvents.push({ ...p, t: Date.now() });
    bus.on('skill_used', pick);
    bus.on('skill_release', pick);
    bus.on('guard_start', pick);
  });
}

try {
  // ----- a) GLM: damage, flask Q, banned, retry -----
  {
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    watch(page);
    await wireSkillTap(page);
    const started = await openCharWithIntro(page, 'glm');
    pass('a title→GLM fight', started?.state === 'fight' && started.charId === 'glm',
      started ? `${started.state} ${started.charId}` : 'no state');
    await shot(page, 'a_fight');
    const before = await state(page);
    const alliesOk = before?.allies?.length === 2;
    pass('a two allies', alliesOk, `count ${before?.allies?.length}`);
    await fightBurst(page, 6500);
    const mid = await state(page);
    pass('a boss HP drops', !!(mid && before && mid.bossHp < before.bossHp - 1),
      `boss ${before?.bossHp} → ${mid?.bossHp}`);
    await shot(page, 'a_combat');

    let hurt = mid;
    if (hurt?.playerAlive && hurt.playerHp >= hurt.playerMaxHp - 2) {
      await fightBurst(page, 12000);
      hurt = await state(page);
    }
    const tookDamage = hurt && (hurt.playerHp < hurt.playerMaxHp - 5 || hurt.state === 'banned');
    pass('a player takes damage', !!tookDamage, `hp ${hurt?.playerHp} state ${hurt?.state}`);

    if (hurt?.state === 'fight' && hurt.playerAlive && hurt.playerHp < hurt.playerMaxHp - 1) {
      await releaseAim(page);
      for (const k of ['KeyW', 'KeyA', 'KeyD']) await page.keyboard.up(k).catch(() => {});
      const hp0 = hurt.playerHp;
      await page.keyboard.press('Digit1');
      await page.keyboard.press('KeyQ');
      await page.waitForTimeout(900);
      const healed = await state(page);
      const rose = healed && healed.playerHp > hp0 + 4;
      pass('a flask Q heals', rose, rose ? `hp ${hp0} → ${healed.playerHp}` : `hp ${healed?.playerHp}`);
      await shot(page, 'a_flask');
    } else {
      pass('a flask Q heals', false, `skipped ${hurt?.state}`);
    }

    await releaseAim(page);
    // Ban auto-retries after 3s. Listen before that, not after the screenshot.
    await page.evaluate(() => {
      window.__freshFight = null;
      window.__game.bus.on('fight_reset', () => {
        const s = window.__debug.state();
        if (!s || s.state !== 'fight' || !s.player) return;
        window.__freshFight = {
          phase: s.phase,
          hp: s.player.hp,
          max: s.player.maxHp,
          boss: s.bossHp,
          bossMax: s.bossMaxHp,
        };
      });
    });
    const dead = await until(page, (st) => st.state === 'banned', 150000, 400);
    if (!dead || dead.state !== 'banned') {
      await fightBurst(page, 60000);
    }
    const banned = await until(page, (st) => st.state === 'banned', 120000, 400);
    pass('a P1 death → banned', banned?.state === 'banned', banned?.state);
    await shot(page, 'a_banned');

    if (banned?.state === 'banned') {
      await page.keyboard.press('Enter');
      const again = await until(page, (st) => st.state === 'fight', 8000, 50);
      const freshSnap = await page.evaluate(() => window.__freshFight);
      const snap = freshSnap || null;
      const fresh = snap && snap.phase === 1
        && snap.hp === snap.max
        && snap.boss >= snap.bossMax - 1;
      pass('a retry fresh fight', !!fresh,
        snap ? `p${snap.phase} hp ${snap.hp}/${snap.max} boss ${snap.boss}` : (again ? `late p${again.phase}` : 'none'));
      await shot(page, 'a_retry');
    } else {
      pass('a retry fresh fight', false, 'never banned');
    }
    await page.close();
  }

  // ----- b) DeepSeek ×8 → P2/P3 → die → ending A -----
  {
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    watch(page);
    await wireSkillTap(page);
    const started = await openCharWithIntro(page, 'deepseek');
    pass('b DeepSeek fight', started?.charId === 'deepseek', started?.charId);
    await page.evaluate(() => window.__debug.setDamageMul('player', 8));
    const mul = await state(page);
    pass('b damage mul ×8', mul?.playerDmgMul === 8, `mul ${mul?.playerDmgMul}`);

    let saw2 = false;
    let saw3 = false;
    const limit = Date.now() + 240000;
    while (Date.now() < limit) {
      const s = await state(page);
      if (!s || s.state !== 'fight') break;
      if (s.phase >= 2) saw2 = true;
      if (s.phase >= 3) {
        saw3 = true;
        await shot(page, 'b_p3');
        break;
      }
      if (s.playerHp < s.playerMaxHp * 0.55) {
        await page.keyboard.press('Digit1');
        await page.keyboard.press('KeyQ');
        await page.waitForTimeout(650);
      }
      if (s.phase >= 3 && s.bossRatio != null && s.bossRatio <= 0.48 && s.bossRatio > 0.28) {
        await page.waitForTimeout(300);
        continue;
      }
      await fightBurst(page, 400);
    }
    pass('b phase 2', saw2, saw2 ? 'ok' : 'stuck P1');
    pass('b phase 3', saw3, saw3 ? 'opus' : 'no p3');

    if (saw3) {
      await releaseAim(page);
      await page.evaluate(() => {
        window.__debug.setGod(false);
        window.__debug.setDamageMul('player', 0.02);
      });
      const dieEnd = Date.now() + 90000;
      while (Date.now() < dieEnd) {
        const s = await state(page);
        if (!s || s.state !== 'fight') break;
        if (s.bossRatio != null && s.bossRatio <= 0.27) break;
        if (Math.random() < 0.2) await page.keyboard.press('Space');
        await page.waitForTimeout(220);
      }
    }
    const ended = await until(
      page,
      (st) => st.state === 'cutscene' || st.state === 'theater' || st.state === 'credits' || st.state === 'banned',
      140000,
      400,
    );
    const ratio = ended?.bossRatio;
    const endingA = ended && (ended.state === 'cutscene' || ended.state === 'theater' || ended.state === 'credits')
      && ended.ending === 'A' && (ratio == null || ratio > 0.27);
    pass('b death P3 → ending A', !!endingA, ended ? `${ended.state} ending ${ended.ending}` : 'timeout');
    await shot(page, 'b_ending_a');

    if (endingA) {
      const after = await skipTheater(page, 'b_theater');
      pass('b theater play-again → title', !!(after && (after.state === 'credits' || after.state === 'title')), after?.state);
      if (after?.state === 'credits') {
        await page.keyboard.press('Enter');
        await until(page, (st) => st.state === 'title' || st.state === 'select', 6000);
      }
      await shot(page, 'b_credits');
    }
    await page.close();
  }

  // ----- c) Kimi ×8 → 25% ending B -----
  {
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    watch(page);
  const started = await openCharWithIntro(page, 'kimi');
    pass('c Kimi fight', started?.charId === 'kimi', started?.charId);
    await page.evaluate(() => window.__debug.setDamageMul('player', 8));
    let ending = null;
    const limit = Date.now() + 240000;
    while (Date.now() < limit) {
      const s = await state(page);
      if (!s) break;
      if (s.state === 'cutscene' || s.state === 'theater' || s.state === 'credits') {
        ending = s;
        break;
      }
      if (s.state === 'banned') {
        await page.keyboard.press('Enter');
        await until(page, (st) => st.state === 'fight', 8000);
        await page.evaluate(() => window.__debug.setDamageMul('player', 8));
        continue;
      }
      if (s.phase < 3 && s.bossRatio != null && s.bossRatio < 0.72) {
        await fightBurst(page, 3200);
        continue;
      }
      if (s.phase >= 3 && s.playerHp < s.playerMaxHp * 0.45) {
        await page.keyboard.press('Digit1');
        await page.keyboard.press('KeyQ');
        await page.waitForTimeout(600);
      }
      if (s.phase >= 3 && s.bossRatio != null && s.bossRatio <= 0.27) await shot(page, 'c_glass');
      const burst = s.phase >= 3 && s.bossRatio != null && s.bossRatio < 0.32 ? 900 : 1800;
      await fightBurst(page, burst);
    }
    const okB = ending && ending.ending === 'B';
    pass('c 25% → ending B', !!okB, ending ? `${ending.state} ending ${ending.ending} ratio ${ending.bossRatio}` : 'none');
    await shot(page, 'c_ending_b');
    if (okB) await skipTheater(page, 'c_theater');
    await page.close();
  }

  // ----- d) skills per character (debug fight, one skill tap) -----
  for (const id of ['deepseek', 'kimi', 'glm']) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    watch(page);
    await wireSkillTap(page);
    await page.goto(`${base}?nointro=1&debug=1`);
    await page.waitForTimeout(500);
    await page.evaluate((cid) => window.__debug.startFight(cid), id);
    await page.waitForTimeout(600);
    await holdAimAtBoss(page);
    await page.keyboard.down('ShiftLeft');
    if (id === 'kimi') await page.waitForTimeout(1100);
    else await page.waitForTimeout(120);
    await page.keyboard.up('ShiftLeft');
    await page.waitForTimeout(500);
    const ev = await page.evaluate(() => (window.__skillEvents || []).length);
    const cd = await page.evaluate(() => {
      const p = window.__game?.player;
      return p ? p.skillCd : 0;
    });
    pass(`d skill ${id}`, ev > 0 || cd > 0.4, ev > 0 ? `${ev} bus events` : `skillCd ${cd.toFixed(2)}`);
    await releaseAim(page);
    await page.close();
  }
} catch (err) {
  errors.push(`[harness] ${err.stack || err.message}`);
  pass('harness', false, err.message);
}

const unique = [...new Set(errors)];
pass('console clean', unique.length === 0, unique.length ? `${unique.length} issues` : '0');
if (unique.length) {
  console.log('--- console ---');
  console.log(unique.slice(0, 40).join('\n'));
}

const failed = rows.filter((r) => !r.ok).length;
const summary = rows.map((r) => `${r.ok ? 'PASS' : 'FAIL'}\t${r.name}\t${r.detail}`).join('\n');
const reportPath = path.join(outDir, 'bot_playtest.txt');
fs.writeFileSync(reportPath, `${summary}\n\nERRORS (${unique.length}):\n${unique.join('\n')}\n`);
console.log(`\n${rows.length - failed}/${rows.length} passed → ${reportPath}`);
await browser.close();
process.exit(failed ? 1 : 0);