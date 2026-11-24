// Keyboard playtest for the integrated build.
//   node tests/playtest_bot.mjs [baseUrl]
// Serves nothing itself — point it at `npx serve -l 8106 .`.

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const base = process.argv[2] || 'http://localhost:8106/';
const outDir = path.resolve('tests/out');
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
  await page.screenshot({ path: path.join(outDir, `${name}.png`) });
}

async function state(page) {
  return page.evaluate(() => (window.__debug ? window.__debug.state() : null));
}

async function tap(page, key, times = 1, gap = 140) {
  for (let i = 0; i < times; i += 1) {
    await page.keyboard.press(key);
    if (i + 1 < times) await page.waitForTimeout(gap);
  }
}

async function mash(page, ms, fn) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    await fn();
    await page.waitForTimeout(160);
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

async function openChar(page, id) {
  await page.goto(base);
  await page.waitForTimeout(600);
  let s = await until(page, (st) => st.state === 'title', 8000);
  if (!s || s.state !== 'title') return s;
  await page.keyboard.press('Enter');
  s = await until(page, (st) => st.state === 'disclaimer', 4000);
  await page.keyboard.press('Enter');
  s = await until(page, (st) => st.state === 'select', 4000);
  const order = ['deepseek', 'kimi', 'glm'];
  const idx = order.indexOf(id);
  if (idx > 0) await tap(page, 'ArrowRight', idx, 180);
  await page.waitForTimeout(200);
  await page.keyboard.press('Enter');
  s = await until(page, (st) => st.state === 'fight' && st.charId === id, 8000);
  return s;
}

async function fightMelee(page, ms) {
  await page.keyboard.down('KeyW');
  await mash(page, ms, async () => {
    await page.keyboard.press('KeyJ');
    if (Math.random() < 0.45) await page.keyboard.press('Space');
    if (Math.random() < 0.5) await page.keyboard.press(Math.random() < 0.5 ? 'KeyA' : 'KeyD');
  });
  await page.keyboard.up('KeyW');
}

async function fightRanged(page, ms) {
  await mash(page, ms, async () => {
    await page.keyboard.press('KeyJ');
    await page.keyboard.press(Math.random() < 0.5 ? 'KeyA' : 'KeyD');
    if (Math.random() < 0.35) await page.keyboard.press('Space');
  });
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
    if (n === 4 || n === 12) await shot(page, `${tag}_${String(n).padStart(2, '0')}`);
  }
  return s;
}

try {
  // ----- a) GLM, real keys, damage, flask, death, retry -----
  {
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    watch(page);
    const started = await openChar(page, 'glm');
    pass('a title→GLM fight', started && started.state === 'fight' && started.charId === 'glm',
      started ? `${started.state} ${started.charId}` : 'no state');
    await shot(page, 'a_fight_start');
    const before = await state(page);
    await fightMelee(page, 7000);
    await shot(page, 'a_combat');
    const mid = await state(page);
    const bossDropped = mid && before && mid.bossHp < before.bossHp - 1;
    pass('a boss HP drops', !!bossDropped,
      `boss ${before && before.bossHp} → ${mid && mid.bossHp}`);

    let hurt = mid;
    if (hurt && hurt.playerAlive && hurt.playerHp >= hurt.playerMaxHp - 1) {
      await page.keyboard.up('KeyW').catch(() => {});
      hurt = await until(page, (st) => !st.playerAlive || st.playerHp < st.playerMaxHp - 8 || st.state !== 'fight', 35000);
    }
    const tookDamage = hurt && (hurt.playerHp < (before?.playerMaxHp || 480) - 5 || hurt.state === 'banned');
    pass('a player takes damage', !!tookDamage,
      `hp ${hurt && hurt.playerHp} state ${hurt && hurt.state}`);
    await shot(page, 'a_hurt');

    if (hurt && hurt.state === 'fight' && hurt.playerAlive && hurt.playerHp < hurt.playerMaxHp - 1) {
      let rose = false;
      let detail = 'no heal';
      for (let attempt = 0; attempt < 3 && !rose; attempt += 1) {
        await page.keyboard.down('KeyS');
        await page.keyboard.press('Space');
        await page.waitForTimeout(650);
        const beforeFlask = await state(page);
        if (!beforeFlask || beforeFlask.state !== 'fight' || !beforeFlask.playerAlive) {
          detail = `left fight ${beforeFlask && beforeFlask.state}`;
          break;
        }
        const hp0 = beforeFlask.playerHp;
        await page.keyboard.press('Digit1');
        await page.keyboard.press('KeyR');
        for (let tick = 0; tick < 8; tick += 1) {
          await page.waitForTimeout(200);
          const healed = await state(page);
          if (healed && healed.playerAlive && healed.playerHp > hp0 + 5) {
            rose = true;
            detail = `hp ${hp0} → ${healed.playerHp}`;
            break;
          }
          if (healed && healed.state !== 'fight') {
            detail = `hp ${hp0} → ${healed.playerHp} (${healed.state})`;
            break;
          }
        }
      }
      await page.keyboard.up('KeyS').catch(() => {});
      pass('a flask heals', rose, detail);
      await shot(page, 'a_flask');
    } else {
      pass('a flask heals', false, `could not flask from ${hurt && hurt.state} hp ${hurt && hurt.playerHp}`);
    }

    await page.keyboard.up('KeyW').catch(() => {});
    await page.keyboard.up('KeyA').catch(() => {});
    await page.keyboard.up('KeyD').catch(() => {});
    const dead = await until(page, (st) => st.state === 'banned', 120000, 400);
    pass('a P1 death → banned', !!(dead && dead.state === 'banned'), dead && dead.state);
    await shot(page, 'a_banned');

    if (dead && dead.state === 'banned') {
      await page.keyboard.press('Enter');
      const again = await until(page, (st) => st.state === 'fight', 8000);
      const fresh = again && again.state === 'fight' && again.phase === 1
        && again.playerHp === again.playerMaxHp
        && again.bossHp === again.bossMaxHp;
      pass('a retry fresh fight', !!fresh,
        again ? `p${again.phase} hp ${again.playerHp}/${again.playerMaxHp} boss ${again.bossHp}` : 'none');
      await shot(page, 'a_retry');
    } else {
      pass('a retry fresh fight', false, 'never banned');
    }
    await page.close();
  }

  // ----- b) DeepSeek, player damage ×8, natural P2/P3, die → ending A -----
  {
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    watch(page);
    const started = await openChar(page, 'deepseek');
    pass('b DeepSeek fight', started && started.charId === 'deepseek' && started.state === 'fight',
      started && started.charId);
    await page.evaluate(() => window.__debug.setDamageMul('player', 8));
    const mul = await state(page);
    pass('b damage mul ×8', mul && mul.playerDmgMul === 8, `mul ${mul && mul.playerDmgMul}`);

    let saw2 = false;
    let saw3 = false;
    const limit = Date.now() + 150000;
    await page.keyboard.down('KeyW');
    while (Date.now() < limit) {
      const s = await state(page);
      if (!s || s.state !== 'fight') break;
      if (s.phase >= 2) saw2 = true;
      if (s.phase >= 3) {
        saw3 = true;
        await shot(page, 'b_phase3');
        break;
      }
      if (s.playerHp < s.playerMaxHp * 0.62) {
        await page.keyboard.up('KeyW');
        await page.keyboard.press('Digit1');
        await page.keyboard.press('KeyR');
        await page.waitForTimeout(700);
        await page.keyboard.down('KeyW');
      }
      // Coast the last sliver on ally damage so a finisher cannot skip to 25%.
      if (s.bossRatio != null && s.bossRatio <= 0.47) {
        await page.keyboard.up('KeyW');
        await page.waitForTimeout(400);
        continue;
      }
      await page.keyboard.down('KeyW');
      await page.keyboard.press('KeyJ');
      if (Math.random() < 0.18) await page.keyboard.press('KeyK');
      if (Math.random() < 0.1) await page.keyboard.press('Space');
      await page.waitForTimeout(240);
    }
    await page.keyboard.up('KeyW');
    pass('b phase 2', saw2, saw2 ? 'banner path reached' : 'phase stayed 1');
    pass('b phase 3', saw3, saw3 ? 'opus' : 'no p3');
    await shot(page, 'b_before_death');

    await page.keyboard.up('KeyW').catch(() => {});
    await page.keyboard.up('KeyA').catch(() => {});
    await page.keyboard.up('KeyD').catch(() => {});
    await page.keyboard.up('KeyS').catch(() => {});
    if (saw3) {
      await page.keyboard.down('KeyW');
      await page.waitForTimeout(900);
      await page.keyboard.up('KeyW');
    }
    const ended = await until(page, (st) => st.state === 'theater' || st.state === 'credits' || st.state === 'banned', 130000, 400);
    const endingA = ended && (ended.state === 'theater' || ended.state === 'credits') && ended.ending === 'A';
    pass('b death in P3 → ending A', !!endingA, ended ? `${ended.state} ending ${ended.ending} phase ${ended.phase}` : 'none');
    await shot(page, 'b_ending');
    if (endingA) {
      const after = await skipTheater(page, 'b_theater');
      const credits = after && (after.state === 'credits' || after.state === 'title');
      pass('b ending A credits', !!credits, after && after.state);
      await shot(page, 'b_credits');
      if (after && after.state === 'credits') {
        await page.keyboard.press('Enter');
        const title = await until(page, (st) => st.state === 'title' || st.state === 'select', 5000);
        pass('b play again → title', !!(title && (title.state === 'title' || title.state === 'select')), title && title.state);
        await shot(page, 'b_title');
      } else if (after && after.state === 'title') {
        pass('b play again → title', true, 'already title');
      } else {
        pass('b play again → title', false, after && after.state);
      }
    } else {
      pass('b ending A credits', false, 'no ending');
      pass('b play again → title', false, 'no ending');
    }
    await page.close();
  }

  // ----- c) Kimi, ×8, drive boss to 25% → ending B -----
  {
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    watch(page);
    const started = await openChar(page, 'kimi');
    pass('c Kimi fight', started && started.charId === 'kimi' && started.state === 'fight', started && started.charId);
    await page.evaluate(() => window.__debug.setDamageMul('player', 8));
    await shot(page, 'c_fight');
    let ending = null;
    const limit = Date.now() + 150000;
    while (Date.now() < limit) {
      const s = await state(page);
      if (!s) break;
      if (s.state === 'theater' || s.state === 'credits') {
        ending = s;
        break;
      }
      if (s.state === 'banned') {
        ending = s;
        break;
      }
      if (s.phase === 3 && s.bossRatio != null && s.bossRatio < 0.32) await shot(page, 'c_glass');
      await fightRanged(page, 2000);
    }
    const okB = ending && ending.ending === 'B' && (ending.state === 'theater' || ending.state === 'credits');
    pass('c 25% → ending B', !!okB, ending ? `${ending.state} ending ${ending.ending} ratio ${ending.bossRatio}` : 'none');
    await shot(page, 'c_ending');
    if (okB) {
      const after = await skipTheater(page, 'c_theater');
      pass('c ending B credits', !!(after && (after.state === 'credits' || after.state === 'title')), after && after.state);
      await shot(page, 'c_credits');
      if (after && after.state === 'credits') {
        await page.keyboard.press('Enter');
        const title = await until(page, (st) => st.state === 'title' || st.state === 'select', 5000);
        pass('c play again → title', !!(title && (title.state === 'title' || title.state === 'select')), title && title.state);
      } else if (after && after.state === 'title') {
        pass('c play again → title', true, 'already title');
      } else {
        pass('c play again → title', false, after && after.state);
      }
    } else {
      pass('c ending B credits', false, 'no ending');
      pass('c play again → title', false, 'no ending');
    }
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
fs.writeFileSync(path.join(outDir, 'playtest.txt'), `${summary}\n\nERRORS (${unique.length}):\n${unique.join('\n')}\n`);
console.log(`\n${rows.length - failed}/${rows.length} passed`);
await browser.close();
process.exit(failed ? 1 : 0);
