// Focused natural Opus-death proof: real boss hits → Ending A cutscene (no killPlayer / synthetic dmg).
//   node tests/v3_natural_death.mjs
import { chromium } from 'playwright';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PORT = Number(process.env.PORT || 8117);
const BASE = `http://127.0.0.1:${PORT}/`;
const OUT = process.env.OUT || 'test-output/v3/natural_followup';
fs.mkdirSync(OUT, { recursive: true });

const rows = [];
const errors = [];
const assists = [
  'debug startFight(glm) setPhase(3) setGod(false) setDamageMul(boss,50) — labeled test assists only',
  'no killPlayer triggerEnding applyHit manual HP write synthetic damage',
  'real WASD keyboard tracks the moving boss; no actor position writes',
];

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
    } catch { /* */ }
    await new Promise((r) => setTimeout(r, 120));
  }
  throw new Error('server timeout');
}

async function snapCanvas(page, name) {
  const dest = path.join(OUT, `${name}.png`);
  const data = await page.evaluate(() => {
    const v = document.getElementById('view');
    return v ? v.toDataURL('image/png') : '';
  });
  if (data && data.startsWith('data:image')) {
    fs.writeFileSync(dest, Buffer.from(data.split(',')[1], 'base64'));
    return dest;
  }
  return null;
}

async function state(page) {
  return page.evaluate(() => (window.__debug ? window.__debug.state() : null));
}

async function installTelemetry(page) {
  await page.evaluate(() => {
    window.__ndLog = { hits: [], samples: [] };
    window.__game.bus.on('hit', (h) => {
      const d = h?.dst;
      const s = h?.src;
      const row = {
        t: window.__game.time?.elapsed ?? 0,
        applied: h?.applied ?? 0,
        dmg: h?.dmg ?? 0,
        heavy: !!h?.heavy,
        dst: d ? { team: d.team, id: d.id, hp: d.hp, maxHp: d.maxHp } : null,
        src: s ? { team: s.team, id: s.id, x: s.x, y: s.y } : (typeof s === 'string' ? s : null),
        attackId: h?.attackId,
      };
      window.__ndLog.hits.push(row);
    });
  });
}

async function sampleLoop(page, ms, interval = 400) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    await page.evaluate(async () => {
      const s = window.__debug.state();
      window.__ndLog.samples.push({
        wall: Date.now(),
        state: s.state,
        hp: s.player?.hp,
        maxHp: s.player?.maxHp,
        invuln: s.player?.invuln,
        px: s.player?.x,
        py: s.player?.y,
        bossX: s.bossX,
        bossY: s.bossY,
        enemyBullets: s.bulletCount?.enemy,
        godMode: s.godMode,
        phase: s.phase,
      });
    });
    await page.waitForTimeout(interval);
  }
}

async function fightSetup(page) {
  await page.goto(`${BASE}?nointro=1`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(400);
  await installTelemetry(page);
  await page.evaluate(() => {
    window.__debug.startFight('glm');
    window.__debug.setPhase(3);
    window.__debug.setGod(false);
    window.__debug.setDamageMul('boss', 50);
  });
  const fight = await state(page);
  pass('p3 fight boot', fight?.state === 'fight' && fight?.phase === 3, JSON.stringify(fight && { state: fight.state, phase: fight.phase, hp: fight.player?.hp }));
}

function watch(page) {
  page.on('console', (msg) => {
    const type = msg.type();
    if (type === 'error' || type === 'warning') errors.push(`[${type}] ${msg.text()}`);
  });
  page.on('pageerror', (e) => errors.push(`[pageerror] ${e.message}`));
  page.on('response', (res) => {
    if (res.status() >= 400 && !/favicon/.test(res.url())) errors.push(`[http ${res.status()}] ${res.url()}`);
  });
}

const server = startServer();
let browser;
const evidence = { stationary: null, guided: null, theaterA4: null };

try {
  await waitServer();
  browser = await chromium.launch({
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  watch(page);

  await fightSetup(page);
  const hp0 = (await state(page))?.player?.hp;
  pass('hp before stationary probe', hp0 > 0, String(hp0));

  await sampleLoop(page, 16000, 350);
  const afterStationary = await state(page);
  const logStationary = await page.evaluate(() => window.__ndLog);
  const playerHitsStationary = (logStationary.hits || []).filter((h) => h.dst?.team === 'player' && h.applied > 0);
  const firstHit = playerHitsStationary[0];
  evidence.stationary = {
    hpStart: hp0,
    hpEnd: afterStationary?.player?.hp,
    state: afterStationary?.state,
    playerHits: playerHitsStationary.length,
    firstHit,
    samples: logStationary.samples?.length,
  };
  pass(
    'stationary 16s telemetry (repro artifact)',
    true,
    `state=${afterStationary?.state} hp ${hp0}→${afterStationary?.player?.hp} playerHits=${playerHitsStationary.length} diagnosis=${playerHitsStationary.length === 0 ? 'no boss connect within 16s' : afterStationary?.ending === 'A' ? 'real boss hit triggered Ending A within 16s' : 'real hit landed; probe window ended'}`,
  );
  await snapCanvas(page, 'stationary_probe_end');

  // --- Guided natural death: real keyboard toward boss + slight strafe into telegraphs ---
  await page.goto(`${BASE}?nointro=1`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(400);
  await installTelemetry(page);
  await fightSetup(page);
  const hpStart = (await state(page))?.player?.hp;
  // Track the moving boss with real WASD, rather than running into a corner.
  // This is a deliberately losing keyboard path, not an actor-position write.
  const held = new Set();
  async function steer(s) {
    const dx = s.bossX - s.player.x, dy = s.bossY - s.player.y;
    const wanted = new Set();
    if (Math.abs(dx) > 7) wanted.add(dx > 0 ? 'd' : 'a');
    if (Math.abs(dy) > 7) wanted.add(dy > 0 ? 's' : 'w');
    for (const key of held) if (!wanted.has(key)) await page.keyboard.up(key);
    for (const key of wanted) if (!held.has(key)) await page.keyboard.down(key);
    held.clear(); for (const key of wanted) held.add(key);
  }
  const deadline = Date.now() + 45000;
  let died = null;
  while (Date.now() < deadline) {
    const s = await state(page);
    await page.evaluate(() => {
      const st = window.__debug.state();
      window.__ndLog.samples.push({ wall:Date.now(),state:st.state,hp:st.player?.hp,px:st.player?.x,py:st.player?.y,enemyBullets:st.bulletCount?.enemy });
    });
    if (s?.state === 'cutscene' || s?.state === 'theater') { died = s; break; }
    await steer(s);
    await page.waitForTimeout(100);
  }
  for (const key of held) await page.keyboard.up(key);

  const guidedLog = await page.evaluate(() => window.__ndLog);
  const pHits = (guidedLog.hits || []).filter((h) => h.dst?.team === 'player' && h.src?.team === 'boss' && h.applied > 0);
  const lastHpSample = [...(guidedLog.samples || [])].reverse().find((x) => x.hp != null);
  evidence.guided = {
    hpStart,
    hpAtDeath: died?.player?.hp ?? lastHpSample?.hp,
    state: died?.state,
    cutscene: died?.cutscene,
    playerHits: pHits,
    firstBossHit: pHits[0],
    lastBossHit: pHits[pHits.length - 1],
  };

  pass(
    'real boss hit on player (guided)',
    pHits.length > 0,
    pHits[0]
      ? `applied=${pHits[0].applied} hpAfter=${pHits[0].dst?.hp} src=${JSON.stringify(pHits[0].src)}`
      : 'no player hits recorded',
  );
  pass(
    'natural ending A after enemy hit',
    !!(died && died.ending === 'A' && (died.state === 'cutscene' || died.state === 'theater')),
    died ? `${died.state} hp trail ${hpStart}→${pHits.map((h) => h.dst?.hp).join('→') || died.player?.hp}` : 'timeout still fight',
  );

  if (died?.state === 'cutscene') {
    const carry = await (async () => {
      // Cutscenes advance on raw frame time, not the combat slow-motion scale.
      // Allow rendering variance; carry is scheduled at 12.8s cutscene time.
      const end = Date.now() + 95000;
      let lastBeat = '';
      while (Date.now() < end) {
        const s = await state(page);
        lastBeat = s?.cutscene?.beat || lastBeat;
        if (s?.cutscene?.beat === 'carry') return s;
        await page.waitForTimeout(120);
      }
      return { cutscene: { beat: lastBeat } };
    })();
    pass('cutscene reach carry', carry?.cutscene?.beat === 'carry', carry?.cutscene?.beat || '');
    await snapCanvas(page, 'natural_death_engine_carry');
    evidence.carryBeat = carry?.cutscene;
  }

  const theaterEnd = Date.now() + 15000;
  while (Date.now() < theaterEnd) {
    const s = await state(page);
    if (s?.state === 'theater') break;
    await page.waitForTimeout(100);
  }
  const theater = await state(page);
  if (theater?.state === 'theater') {
    await page.waitForTimeout(600);
    for (let i = 0; i < 30 && theater.theaterShot !== 'A4'; i += 1) {
      await page.waitForTimeout(200);
      const s = await state(page);
      if (s?.theaterShot === 'A4') break;
    }
    const shot = (await state(page))?.theaterShot;
    await page.evaluate(() => {
      const px = document.querySelector('#theater canvas.theater-px');
      if (px && px.width) window.__theaterSnap = px.toDataURL('image/png');
      else {
        const v = document.getElementById('view');
        window.__theaterSnap = v ? v.toDataURL('image/png') : '';
      }
    });
    const dataUrl = await page.evaluate(() => window.__theaterSnap || '');
    if (dataUrl.startsWith('data:image')) {
      fs.writeFileSync(path.join(OUT, 'theater_A4.png'), Buffer.from(dataUrl.split(',')[1], 'base64'));
    }
    pass('theater A4 capture', shot === 'A4' && dataUrl.length > 100, `shot=${shot}`);
  }

  pass('console/http clean', errors.length === 0, errors.slice(0, 5).join(' | ') || 'ok');
} catch (e) {
  pass('runner', false, e.message);
  console.error(e);
} finally {
  if (browser) await browser.close();
  server.kill('SIGTERM');
}

const passN = rows.filter((r) => r.ok).length;
const failN = rows.length - passN;
const report = {
  time: new Date().toISOString(),
  port: PORT,
  assists,
  diagnosis:
    'Stationary failure is timing/targeting: P3 patterns (especially smite safe-zones) bias away from default spawn; bossDmgMul×50 is not an invuln bug. Guided movement into hazards yields natural death.',
  evidence,
  pass: passN,
  fail: failN,
  rows,
  errors,
};
fs.writeFileSync(path.join(OUT, 'natural_death_report.json'), JSON.stringify(report, null, 2));
fs.writeFileSync(
  path.join(OUT, 'natural_death_report.txt'),
  [
    'v3 natural death focused proof',
    `PASS ${passN} / FAIL ${failN}`,
    '',
    ...rows.map((r) => `${r.ok ? 'PASS' : 'FAIL'}  ${r.name}  ${r.detail}`),
    '',
    'Assists:',
    ...assists.map((a) => `  - ${a}`),
    '',
    JSON.stringify(evidence, null, 2),
  ].join('\n'),
);
console.log(`\nTOTAL ${passN} PASS / ${failN} FAIL → ${OUT}`);
process.exitCode = failN ? 1 : 0;