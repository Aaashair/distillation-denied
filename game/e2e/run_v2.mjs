// Drives every game state via window.__debug for screenshot coverage.
//   node e2e/run_v2.mjs <url> <outdir>
// Example: node e2e/run_v2.mjs http://localhost:8106/ test-output/v2

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const base = process.argv[2] || 'http://localhost:8106/';
const outDir = path.resolve(process.argv[3] || 'test-output/v2');
fs.mkdirSync(outDir, { recursive: true });

const errors = [];
const log = [];
let seq = 0;

function note(msg) {
  log.push(msg);
  console.log(msg);
}

async function snap(page, label) {
  seq += 1;
  const name = `${String(seq).padStart(3, '0')}_${label}.png`;
  await page.screenshot({ path: path.join(outDir, name) });
  return name;
}

function watch(page) {
  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning') errors.push(`[${msg.type()}] ${msg.text()}`);
  });
  page.on('pageerror', (e) => errors.push(`[pageerror] ${e.message}`));
  page.on('response', (r) => {
    if (r.status() >= 400 && !/favicon/.test(r.url())) errors.push(`[http ${r.status()}] ${r.url()}`);
  });
}

async function waitState(page, pred, ms = 12000) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    const st = await page.evaluate(() => (window.__debug ? window.__debug.state() : null));
    if (st && pred(st)) return st;
    await page.waitForTimeout(200);
  }
  throw new Error(`Timeout waiting state: ${pred}`);
}

async function step(page, name, fn) {
  try {
    await fn();
    note(`OK  ${name}`);
  } catch (e) {
    note(`FAIL ${name}: ${e.message}`);
  }
}

const browser = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
watch(page);

try {
  await step(page, 'boot', async () => {
    await page.goto(base);
    await page.waitForTimeout(800);
    await snap(page, 'boot');
  });

  await step(page, 'title', async () => {
    await waitState(page, (s) => s.state === 'title', 15000);
    await snap(page, 'title');
    await page.keyboard.press('Enter');
  });

  await step(page, 'disclaimer', async () => {
    await waitState(page, (s) => s.state === 'disclaimer', 8000);
    await snap(page, 'disclaimer');
    await page.keyboard.press('Enter');
  });

  await step(page, 'select', async () => {
    await waitState(page, (s) => s.state === 'select', 8000);
    await snap(page, 'select');
  });

  for (const [id, n] of [['deepseek', 0], ['kimi', 1], ['glm', 2]]) {
    await step(page, `select_${id}`, async () => {
      await page.goto(base);
      await page.waitForTimeout(600);
      await waitState(page, (s) => s.state === 'title', 12000);
      await page.keyboard.press('Enter');
      await waitState(page, (s) => s.state === 'disclaimer', 6000);
      await page.keyboard.press('Enter');
      await waitState(page, (s) => s.state === 'select', 6000);
      for (let i = 0; i < n; i += 1) await page.keyboard.press('ArrowRight');
      await page.keyboard.press('Enter');
      const st = await waitState(page, (s) => s.state === 'intro' || s.state === 'fight', 8000);
      if (st.state === 'intro') {
        await snap(page, `intro_${id}`);
        await page.keyboard.press('Enter');
        await waitState(page, (s) => s.state === 'fight', 10000);
      } else {
        await page.evaluate(() => window.__debug.skipIntro());
      }
    });
  }

  const chars = ['deepseek', 'kimi', 'glm'];
  for (const id of chars) {
    await step(page, `fight_${id}_p1`, async () => {
      await page.goto(`${base}?nointro=1`);
      await page.waitForTimeout(400);
      await page.evaluate((cid) => window.__debug.startFight(cid), id);
      await page.evaluate(() => window.__debug.setPhase(1));
      await page.waitForTimeout(500);
      await snap(page, `fight_${id}_p1`);
    });

    await step(page, `fight_${id}_p2`, async () => {
      await page.evaluate(() => window.__debug.setPhase(2));
      await page.waitForTimeout(700);
      await snap(page, `fight_${id}_p2`);
    });

    await step(page, `fight_${id}_p3_pattern`, async () => {
      await page.evaluate(() => window.__debug.setPhase(3));
      await page.waitForTimeout(400);
      await page.evaluate(() => window.__debug.setDamageMul('player', 0.01));
      await page.keyboard.down('ArrowUp');
      await page.keyboard.down('KeyW');
      await page.waitForTimeout(4500);
      await page.keyboard.up('ArrowUp');
      await page.keyboard.up('KeyW');
      await snap(page, `fight_${id}_p3_midfight`);
    });
  }

  await step(page, 'debug_panel', async () => {
    await page.goto(`${base}?nointro=1&debug=1`);
    await page.waitForTimeout(400);
    await page.evaluate(() => window.__debug.startFight('glm'));
    await page.keyboard.press('KeyP');
    await page.waitForTimeout(300);
    await snap(page, 'debug_panel_open');
  });

  await step(page, 'banned', async () => {
    await page.evaluate(() => {
      window.__debug.setPhase(1);
      window.__debug.setGod(false);
      window.__debug.killPlayer();
    });
    await page.waitForTimeout(900);
    await waitState(page, (s) => s.state === 'banned', 8000);
    await snap(page, 'banned');
  });

  await step(page, 'skills_vfx', async () => {
    await page.goto(`${base}?autostart=deepseek&nointro=1`);
    await waitState(page, (s) => s.state === 'fight', 8000);
    await page.keyboard.down('ArrowRight');
    await page.keyboard.press('ShiftLeft');
    await page.waitForTimeout(420);
    await snap(page, 'skill_deepseek_flurry');
    await page.keyboard.up('ArrowRight');

    await page.evaluate(() => window.__debug.startFight('kimi'));
    await waitState(page, (s) => s.state === 'fight' && s.charId === 'kimi', 8000);
    await page.mouse.move(640, 200);
    await page.mouse.down();
    await page.keyboard.down('ShiftLeft');
    await page.waitForTimeout(900);
    await snap(page, 'skill_kimi_charge');
    await page.keyboard.up('ShiftLeft');
    await page.waitForTimeout(180);
    await snap(page, 'skill_kimi_beam');
    await page.mouse.up();

    await page.evaluate(() => window.__debug.startFight('glm'));
    await waitState(page, (s) => s.state === 'fight' && s.charId === 'glm', 8000);
    await page.keyboard.down('ShiftLeft');
    await page.waitForTimeout(120);
    await page.evaluate(() => {
      const g = window.__game;
      const p = g.player;
      if (!p || !g.projectiles) return;
      g.projectiles.spawn(g, {
        team: 'boss', x: p.x + 16, y: p.y, vx: -40, vy: 0, r: 4, dmg: 6, life: 0.6, shape: 'feather', color: '#e7c27a',
      });
    });
    await page.waitForTimeout(80);
    await snap(page, 'skill_glm_shield_perfect');
    await page.keyboard.up('ShiftLeft');

    await page.keyboard.press('Escape');
    await waitState(page, (s) => s.state === 'paused', 4000);
    await snap(page, 'pause');
    await page.keyboard.down('ArrowUp');
    await page.evaluate(() => window.blur());
    await page.waitForTimeout(80);
    let cleared = await page.evaluate(() => !window.__game.input.held('up'));
    if (!cleared) {
      // Headless Chromium often does not fire window blur from window.blur().
      await page.evaluate(() => window.dispatchEvent(new Event('blur')));
      await page.waitForTimeout(40);
      cleared = await page.evaluate(() => !window.__game.input.held('up'));
    }
    if (!cleared) throw new Error('blur did not clear held arrows');
    await page.keyboard.up('ArrowUp');
    await page.keyboard.press('Escape');
    await waitState(page, (s) => s.state === 'fight', 4000);
    await snap(page, 'resume');
  });

  await step(page, 'safety_judgement', async () => {
    // Debug tour: force the pattern. The natural first cast is 8s after phase 3.
    await page.evaluate(() => {
      window.__debug.setGod(true);
      window.__debug.setPhase(3);
      window.__debug.forcePattern('p3_smite');
    });
    await waitState(
      page,
      (s) => (s.telegraphs || []).some((t) => t.attack === 'p3_smite' || t.kind === 'fullscreen'),
      8000,
    );
    await page.waitForTimeout(280);
    await snap(page, 'opus_safety_judgement');
    await page.evaluate(() => window.__debug.setGod(false));
  });

  await step(page, 'cutscene_ending_a', async () => {
    await page.goto(`${base}?nointro=1`);
    await page.waitForTimeout(400);
    await page.evaluate(() => {
      window.__debug.startFight('deepseek');
      window.__debug.setPhase(3);
      window.__debug.killPlayer();
    });
    await waitState(page, (s) => s.state === 'cutscene' || s.state === 'theater', 8000);
    await waitState(
      page,
      (s) => s.cutscene && (s.cutscene.beat === 'dive' || s.cutscene.beat === 'parry' || s.cutscene.beat === 'carry'),
      12000,
    );
    await snap(page, 'ending_a_astra');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(400);
    await snap(page, 'ending_a_after_skip');
  });

  await step(page, 'theater_a', async () => {
    let st = await page.evaluate(() => window.__debug.state());
    if (st.state !== 'theater') {
      await page.evaluate(() => window.__debug.triggerEnding('A'));
      await waitState(page, (s) => s.state === 'cutscene' || s.state === 'theater', 8000);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);
    }
    await waitState(page, (s) => s.state === 'theater' || s.state === 'title', 15000);
    for (let i = 0; i < 16; i += 1) {
      st = await page.evaluate(() => window.__debug.state());
      if (st.state !== 'theater') break;
      if (st.theaterShot && /A6|sam/i.test(st.theaterShot)) break;
      await page.keyboard.press('Enter');
      await page.waitForTimeout(220);
    }
    await snap(page, 'theater_a_sam');
  });

  await step(page, 'cutscene_ending_b', async () => {
    await page.goto(`${base}?nointro=1`);
    await page.waitForTimeout(400);
    await page.evaluate(() => {
      window.__debug.startFight('kimi');
      window.__debug.setPhase(3);
    });
    await page.waitForTimeout(400);
    await page.evaluate(() => window.__debug.setBossHpRatio(0.25));
    await page.waitForTimeout(1200);
    const st = await page.evaluate(() => window.__debug.state());
    if (st.state === 'cutscene' || st.state === 'theater') {
      await snap(page, 'cutscene_b_glass');
      await waitState(page, (s) => s.cutscene && (s.cutscene.beat === 'hand' || s.cutscene.beat === 'lift'), 14000);
      await page.waitForTimeout(1200);
      await snap(page, 'cutscene_b_hand');
    } else {
      await page.evaluate(() => window.__debug.triggerEnding('B'));
      await page.waitForTimeout(800);
      await snap(page, 'cutscene_b_fallback');
    }
  });

  await step(page, 'theater_b', async () => {
    await page.evaluate(() => window.__debug.triggerEnding('B'));
    await waitState(page, (s) => s.state === 'theater' || s.state === 'credits', 20000);
    await waitState(page, (s) => s.state === 'theater' && s.theaterShot === 'B3', 8000).catch(() => {});
    await page.waitForTimeout(900);
    await snap(page, 'theater_b_stamp');
    await page.keyboard.press('Space');
    await page.waitForTimeout(500);
    await snap(page, 'theater_b_dossier');
  });

  await step(page, 'credits', async () => {
    // Natural path: theater shots A9/B8 are the credits + PLAY AGAIN, then title.
    // The menus `credits` state stays reachable on purpose and is shot separately.
    for (let i = 0; i < 28; i += 1) {
      const st = await page.evaluate(() => window.__debug.state());
      if (st.state === 'title') break;
      const shot = st.theaterShot || '';
      if (st.state === 'theater' && /A9|B8/.test(shot)) {
        await snap(page, 'theater_credits');
      }
      await page.keyboard.press('Enter');
      await page.waitForTimeout(200);
    }
    await waitState(page, (s) => s.state === 'title', 8000);
    await snap(page, 'back_title');
    await page.evaluate(() => window.__game.state.set('credits'));
    await waitState(page, (s) => s.state === 'credits', 4000);
    await snap(page, 'menu_credits_state');
    await page.keyboard.press('Enter');
    await waitState(page, (s) => s.state === 'title', 4000);
  });
} catch (err) {
  errors.push(`[fatal] ${err.stack || err.message}`);
  note(`FATAL: ${err.message}`);
}

const uniq = [...new Set(errors)];
const report = [
  'DISTILLATION DENIED v2 e2e harness',
  `url: ${base}`,
  `screens: ${outDir}`,
  '',
  'STEPS:',
  ...log,
  '',
  `CONSOLE (${uniq.length}):`,
  ...uniq,
].join('\n');
fs.writeFileSync(path.join(outDir, 'report.txt'), report);
console.log(`\nreport → ${path.join(outDir, 'report.txt')} (${uniq.length} console issues)`);
await browser.close();
process.exit(uniq.length ? 1 : 0);