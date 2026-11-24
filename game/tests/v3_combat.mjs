// v3 worker 2 — damage, GPU cooldowns, projectile range, themed shots.
// Node sim first, then Playwright on port 8112.
// Range cap is Euclidean displacement from the bullet spawn (`ox`,`oy`), clamped
// onto that circle. `traveled` is path length and is not the cull.
// Live screenshots: no god mode, timeScale 1, damage multiplier 1.

import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { createBus } from '../src/core/bus.js';
import { createTime } from '../src/core/time.js';
import { applyHit } from '../src/core/combat.js';
import { bi } from '../src/data/lines.js';
import {
  PLAYER, FLASKS, ALLY_DMG_MUL, activeInner, clampTo,
} from '../src/config/balance.js';
import * as projectiles from '../src/actors/projectiles.js';
import * as playerMod from '../src/actors/player.js';
import * as bossMod from '../src/boss/boss.js';
import { firePrimary, useSkill, tickSkill } from '../src/actors/kits.js';
import { clear as clearFx, liveLabels } from '../src/actors/playerFx.js';

const OUT = process.env.SCREEN_OUT || 'test-output/v3/w2';
const PORT = 8112;
const DT60 = 1 / 60;
const DT50 = 0.02;
const lines = [];
const fails = [];

function note(msg) {
  lines.push(msg);
  console.log(msg);
}

function check(name, cond, detail) {
  if (cond) note(`OK  ${name}`);
  else {
    fails.push(`${name}${detail ? ` — ${detail}` : ''}`);
    note(`FAIL ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

function near(a, b, eps) {
  return Math.abs(a - b) <= eps;
}

function makeInput() {
  const held = new Set();
  const edge = new Set();
  return {
    down(name) {
      if (!held.has(name)) edge.add(name);
      held.add(name);
    },
    up(name) {
      held.delete(name);
      edge.delete(name);
    },
    repeat(name) {
      held.add(name);
      edge.add(name);
    },
    pressed(name) { return edge.has(name); },
    held(name) { return held.has(name); },
    end() { edge.clear(); },
    aimVector() { return null; },
  };
}

function baseCtx() {
  const time = createTime();
  return {
    bus: createBus(),
    time,
    audio: { playSfx() {}, stopSfx() {} },
    state: { current: 'fight', previous: 'select', set() {} },
    debug: { godMode: false, playerDmgMul: 1, bossDmgMul: 1, allyDmgMul: 1, timeScale: 1 },
    flags: {},
    allies: [],
    truceUntil: 0,
    distill: 0,
    world: {
      clamp(actor) { clampTo(actor, activeInner('fight')); },
    },
    input: null,
  };
}

function shooter(id, x, y, team) {
  return {
    id,
    kitId: id,
    team: team || 'player',
    x,
    y,
    alive: true,
    fireCd: 0,
    aimX: 1,
    aimY: 0,
    facing: 'e',
    rolling: false,
    flaskT: 0,
    charging: false,
    shield: false,
    skillKind: '',
  };
}

function placeBoss(ctx) {
  const boss = bossMod.spawn(ctx);
  boss.x = 220;
  boss.y = 160;
  boss.invuln = 0;
  boss.transition = 0;
  ctx.truceUntil = 0;
  return boss;
}

function volley(ctx, actor, boss) {
  projectiles.reset();
  actor.fireCd = 0;
  actor.x = boss.x - 18;
  actor.y = boss.y;
  const before = boss.hp;
  const ok = firePrimary(ctx, actor, 1, 0);
  projectiles.update(ctx, DT60);
  return { ok, drop: before - boss.hp };
}

function fly(spec) {
  projectiles.reset();
  const ctx = baseCtx();
  const bullet = projectiles.spawn(ctx, {
    team: 'player',
    ownerId: 'range',
    x: spec.x,
    y: spec.y,
    vx: spec.vx,
    vy: spec.vy,
    r: 3,
    dmg: 1,
    life: 30,
    maxRange: spec.range,
    shape: 'whale',
    wobble: spec.wobble || 0,
    ignoreWalls: !!spec.ignoreWalls,
  });
  let steps = 0;
  while (bullet.alive && steps < 20000) {
    projectiles.update(ctx, spec.dt);
    steps += 1;
  }
  return {
    disp: Math.hypot(bullet.x - bullet.ox, bullet.y - bullet.oy),
    traveled: bullet.traveled || 0,
    steps,
    alive: bullet.alive,
  };
}

function advance(ctx, seconds) {
  let t = 0;
  while (t + 1e-8 < seconds) {
    playerMod.update(ctx, DT60);
    t += DT60;
  }
  return t;
}

function pressGpu(ctx, input) {
  input.up('q');
  ctx.player.gpuArm = true;
  input.down('q');
  playerMod.update(ctx, DT60);
  input.end();
}

const OLD = {
  deepseekPellet: 2.2,
  deepseekFlurry: 7,
  kimiOrb: 8,
  kimiBeam: [25, 100],
  glmBolt: 6.5,
  glmRing: 25,
};

function reportDamage() {
  const ds = PLAYER.deepseek;
  const kimi = PLAYER.kimi;
  const glm = PLAYER.glm;
  const oldDps = {
    deepseek: 3 * OLD.deepseekPellet * ds.primary.rate,
    kimi: OLD.kimiOrb * kimi.primary.rate,
    glm: OLD.glmBolt * glm.primary.rate,
  };
  const newDps = {
    deepseek: ds.primary.pellets * ds.primary.dmg * ds.primary.rate,
    kimi: kimi.primary.dmg * kimi.primary.rate,
    glm: glm.primary.dmg * glm.primary.rate,
  };
  note('DAMAGE old → new (primary ×1.4, damaging skills ×1.5). Boss block untouched.');
  note(`  DeepSeek pellet ${OLD.deepseekPellet} → ${ds.primary.dmg}  flurry ${OLD.deepseekFlurry} → ${ds.skill.dmg}  primary DPS ${oldDps.deepseek.toFixed(2)} → ${newDps.deepseek.toFixed(2)}`);
  note(`  Kimi orb ${OLD.kimiOrb} → ${kimi.primary.dmg}  beam ${OLD.kimiBeam[0]}..${OLD.kimiBeam[1]} → ${kimi.skill.dmgMin}..${kimi.skill.dmgMax}  primary DPS ${oldDps.kimi.toFixed(2)} → ${newDps.kimi.toFixed(2)}`);
  note(`  GLM bolt ${OLD.glmBolt} → ${glm.primary.dmg}  perfect ring ${OLD.glmRing} → ${glm.skill.ringDmg}  primary DPS ${oldDps.glm.toFixed(2)} → ${newDps.glm.toFixed(2)}`);
  note(`  Ally shots use the new kit numbers × ALLY_DMG_MUL ${ALLY_DMG_MUL} (existing multiplier, not retuned).`);
  note('  Ally/player perfect-guard ring stays the shared flat ringDmg (it was never × ALLY_DMG_MUL).');
  const ttk = (3000 * 0.75) / newDps.deepseek;
  note(`  DeepSeek perfect primary uptime to the 25% line ≈ ${ttk.toFixed(1)}s (was ${((3000 * 0.75) / oldDps.deepseek).toFixed(1)}s). Still a long fight.`);
  check('deepseek pellet', near(ds.primary.dmg, 3.08, 1e-9));
  check('deepseek flurry', near(ds.skill.dmg, 10.5, 1e-9));
  check('kimi orb', near(kimi.primary.dmg, 11.2, 1e-9));
  check('kimi beam', near(kimi.skill.dmgMin, 37.5, 1e-9) && near(kimi.skill.dmgMax, 150, 1e-9));
  check('glm bolt', near(glm.primary.dmg, 9.1, 1e-6));
  check('glm ring', near(glm.skill.ringDmg, 37.5, 1e-9));
  check('ranges', ds.primary.range === 192 && glm.primary.range === 96 && kimi.primary.range === 440);
  check('heals unchanged', FLASKS.rtx5090.heal === 0.3 && FLASKS.h200.heal === 0.5 && FLASKS.b200.heal === 1);
  check('cds', FLASKS.rtx5090.cd === 5 && FLASKS.h200.cd === 10 && FLASKS.b200.cd === 20);
}

function testHits() {
  const ctx = baseCtx();
  const boss = placeBoss(ctx);
  const ds = shooter('deepseek', boss.x - 18, boss.y);
  const hit = volley(ctx, ds, boss);
  check('deepseek volley applies 3×3.08', hit.ok && near(hit.drop, 9.24, 0.02), `drop ${hit.drop}`);

  boss.hp = 3000;
  const kimi = shooter('kimi', boss.x - 18, boss.y);
  const orb = volley(ctx, kimi, boss);
  check('kimi orb applies 11.2', orb.ok && near(orb.drop, 11.2, 0.02), `drop ${orb.drop}`);

  boss.hp = 3000;
  boss.x = 220;
  const glm = shooter('glm', boss.x - 18, boss.y);
  const bolt = volley(ctx, glm, boss);
  check('glm bolt applies 9.1', bolt.ok && near(bolt.drop, 9.1, 0.02), `drop ${bolt.drop}`);

  boss.hp = 3000;
  boss.x = 220;
  boss.y = 160;
  const ally = shooter('kimi', boss.x - 18, boss.y, 'ally');
  const allyHit = volley(ctx, ally, boss);
  check('ally orb is kit × 0.35', near(allyHit.drop, 11.2 * ALLY_DMG_MUL, 0.02), `drop ${allyHit.drop}`);

  boss.hp = 3000;
  boss.invuln = 0;
  ctx.truceUntil = 0;
  const player = shooter('deepseek', 180, 160);
  player.skillCd = 0;
  boss.x = 180 + PLAYER.deepseek.skill.dash;
  boss.y = 160;
  ctx.player = player;
  clearFx();
  const names = [];
  ctx.bus.on('skill_used', (p) => names.push(p));
  useSkill(ctx, player, 1, 0);
  let guard = 0;
  while (player.skillKind && guard < 180) {
    tickSkill(ctx, player, DT60, { aim: { x: 1, y: 0 }, skillHeld: false, skillDown: false });
    guard += 1;
  }
  check('flurry 8×10.5', near(3000 - boss.hp, 84, 0.05), `hp ${boss.hp}`);
  check('flurry name', names[0] && names[0].zh === '专家鲸群' && names[0].en === 'Mixture-of-Whales');
  check('flurry canvas bi()', liveLabels().includes(bi({ zh: '专家鲸群', en: 'Mixture-of-Whales' })));

  boss.hp = 3000;
  boss.x = 240;
  boss.y = 160;
  boss.invuln = 0;
  ctx.truceUntil = 0;
  const caster = shooter('kimi', 80, 160);
  caster.skillCd = 0;
  ctx.player = caster;
  clearFx();
  const beams = [];
  ctx.bus.on('skill_release', (p) => beams.push(p));
  useSkill(ctx, caster, 1, 0);
  useSkill(ctx, caster, 1, 0, { held: true, dt: 1.5 });
  check('beam max 150', near(3000 - boss.hp, 150, 0.05), `hp ${boss.hp}`);
  check('beam name', beams[0] && beams[0].zh === '长上下文·暗月' && beams[0].en === 'Long-Context Dark Moon');
  check('beam canvas bi()', liveLabels().includes(bi({ zh: '长上下文·暗月', en: 'Long-Context Dark Moon' })));

  boss.hp = 3000;
  boss.invuln = 0;
  ctx.truceUntil = 0;
  caster.skillCd = 0;
  caster.charging = false;
  caster.beamT = 0;
  caster.x = 80;
  caster.y = 160;
  clearFx();
  useSkill(ctx, caster, 1, 0);
  useSkill(ctx, caster, 1, 0, { held: true, dt: 0.3 });
  useSkill(ctx, caster, 1, 0, { held: false, down: false, dt: 0 });
  check('beam min 37.5', near(3000 - boss.hp, 37.5, 0.05), `hp ${boss.hp}`);

  boss.hp = 1000;
  boss.x = 240;
  boss.y = 160;
  boss.r = 18;
  boss.alive = true;
  boss.invuln = 0;
  ctx.truceUntil = 0;
  boss.r = 10;
  boss.x = 250;
  const guarder = shooter('glm', 200, 160);
  guarder.shield = true;
  guarder.shieldAge = 0;
  guarder.perfectWindow = 0.2;
  guarder.perfectSpent = false;
  guarder.shieldArc = PLAYER.glm.skill.arc;
  guarder.aimX = 1;
  guarder.aimY = 1e-4;
  ctx.player = guarder;
  projectiles.reset();
  projectiles.spawn(ctx, {
    team: 'boss', x: 220, y: 160, vx: -30, vy: 0, r: 3, dmg: 10, life: 2, shape: 'petal', color: '#ff6b45',
  });
  const beforeRing = boss.hp;
  projectiles.update(ctx, DT60);
  check('perfect guard uses ringDmg 37.5', near(beforeRing - boss.hp, 37.5, 0.02), `hp ${boss.hp}`);
}

function testPhases() {
  const ctx = baseCtx();
  const player = playerMod.spawn(ctx, 'deepseek', 'fight');
  const boss = bossMod.spawn(ctx);
  boss.invuln = 0;
  boss.transition = 0;
  ctx.truceUntil = 0;
  note('PHASE debug-assisted: god OFF, timeScale 1, playerDmgMul 1. Real DeepSeek pellets (3.08). Phase i-frames/truce cleared only so the next real volleys can land.');
  const seen = [boss.phase];
  let shots = 0;
  while (boss.phase < 3 && shots < 500 && boss.hp > 800) {
    projectiles.reset();
    player.fireCd = 0;
    player.alive = true;
    player.skillKind = '';
    player.rolling = false;
    player.flaskT = 0;
    player.x = boss.x - 18;
    player.y = boss.y;
    const phase = boss.phase;
    firePrimary(ctx, player, 1, 0);
    projectiles.update(ctx, DT60);
    shots += 1;
    if (boss.phase !== phase) {
      seen.push(boss.phase);
      boss.invuln = 0;
      boss.transition = 0;
      boss.beat = null;
      boss.rooted = false;
      ctx.truceUntil = 0;
    }
  }
  note(`  phases ${seen.join('→')} after ${shots} real volleys, boss HP ${boss.hp.toFixed(1)}/${boss.maxHp}`);
  check('phase 1→2→3 on real shots', seen[0] === 1 && seen.includes(2) && seen.includes(3), seen.join(','));
  check('boss still above the 25% line', boss.hp > 750 && boss.hp < 1400, String(boss.hp));
}

function testRange() {
  const inner = activeInner('fight');
  const diag = Math.hypot(inner.w, inner.h);
  note(`FLOOR ${inner.w}×${inner.h} diagonal ${diag.toFixed(2)}. Cull = displacement from spawn, clamped. Path length is traveled only.`);
  check('floor half/quarter/diag', inner.w === 384 && inner.h === 208 && diag > 436.5 && diag < 437 && diag < 440);

  for (const dt of [DT60, DT50]) {
    const hz = Math.round(1 / dt);
    const whale = fly({ x: 240, y: 160, vx: 300, vy: 0, range: 192, dt, ignoreWalls: true });
    const moon = fly({ x: 48, y: 56, vx: 200, vy: 0, range: 440, dt, wobble: 36, ignoreWalls: true });
    const bolt = fly({ x: 240, y: 160, vx: 240, vy: 0, range: 96, dt, ignoreWalls: true });
    check(`whale ${hz}fps`, near(whale.disp, 192, 0.05), `disp ${whale.disp}`);
    check(`moon ${hz}fps wobble`, near(moon.disp, 440, 0.05) && moon.traveled > moon.disp, `disp ${moon.disp} path ${moon.traveled}`);
    check(`z ${hz}fps`, near(bolt.disp, 96, 0.05), `disp ${bolt.disp}`);
  }

  const ux = inner.w / diag;
  const uy = inner.h / diag;
  const corner = fly({
    x: inner.x, y: inner.y, vx: ux * 200, vy: uy * 200, range: 440, dt: DT60, ignoreWalls: false,
  });
  check('kimi reaches opposite corner with walls', corner.disp + 0.05 >= diag && near(corner.disp, 440, 0.05), `disp ${corner.disp}`);

  const walled = fly({ x: 240, y: 160, vx: 0, vy: -240, range: 440, dt: DT60, ignoreWalls: false });
  const open = fly({ x: 240, y: 160, vx: 0, vy: -240, range: 440, dt: DT60, ignoreWalls: true });
  check('walls stop a shot before max range', walled.disp < 160 && walled.disp > 70, `disp ${walled.disp}`);
  check('open room reaches 440', near(open.disp, 440, 0.05), `disp ${open.disp}`);

  const ctx = baseCtx();
  const boss = placeBoss(ctx);
  boss.alive = false;
  const actor = shooter('kimi', inner.x + 4, inner.y + 4);
  projectiles.reset();
  firePrimary(ctx, actor, ux, uy);
  const shot = projectiles.query((b) => b.ownerId === 'kimi')[0];
  check('kit bullet carries maxRange', !!shot && shot.maxRange === 440 && shot.shape === 'moon' && shot.r === 6);
  if (shot) shot.ignoreWalls = true;
  let steps = 0;
  while (shot && shot.alive && steps < 20000) {
    projectiles.update(ctx, DT60);
    steps += 1;
  }
  if (shot) {
    const disp = Math.hypot(shot.x - shot.ox, shot.y - shot.oy);
    check('kit moon displacement', near(disp, 440, 0.05), `disp ${disp} path ${shot.traveled}`);
  }
}

function testGpu() {
  const ctx = baseCtx();
  const input = makeInput();
  ctx.input = input;
  const actor = playerMod.spawn(ctx, 'deepseek', 'fight');
  check('fresh cooldowns', actor.gpuCooldowns.rtx5090 === 0 && actor.gpuCooldowns.h200 === 0 && actor.gpuCooldowns.b200 === 0);

  actor.hp = 50;
  pressGpu(ctx, input);
  input.repeat('q');
  playerMod.update(ctx, DT60);
  input.end();
  let extra = 0;
  for (let i = 0; i < 8; i += 1) {
    input.repeat('q');
    playerMod.update(ctx, DT60);
    input.end();
    extra += 1;
  }
  while (actor.flaskT > 0) playerMod.update(ctx, DT60);
  check('key repeat does not chain heals', near(actor.hp, 80, 0.02) && extra === 8, `hp ${actor.hp}`);
  check('repeat left RTX on cooldown', actor.gpuCooldowns.rtx5090 > 3);
  const heldHp = actor.hp;
  input.up('q');
  actor.gpuArm = true;
  input.down('q');
  playerMod.update(ctx, DT60);
  input.end();
  input.up('q');
  advance(ctx, 0.6);
  check('no heal while that GPU is on cooldown', near(actor.hp, heldHp, 0.02) && actor.flaskT === 0, `hp ${actor.hp}`);

  actor.hp = 40;
  actor.gpuCooldowns = playerMod.freshGpuCooldowns();
  actor.gpuArm = true;
  pressGpu(ctx, input);
  applyHit(ctx, { team: 'boss', id: 'claude', x: actor.x, y: actor.y - 8 }, actor, 8, { hitStopMs: 0, ignoreInvuln: true });
  const hurt = actor.hp;
  advance(ctx, 1);
  check('interrupt spends cooldown and does not heal', actor.flaskT === 0 && near(actor.hp, hurt, 0.02) && actor.gpuCooldowns.rtx5090 > 2, `hp ${actor.hp} cd ${actor.gpuCooldowns.rtx5090}`);
  check('no EMPTY label', !liveLabels().some((t) => /EMPTY|空/.test(t)));

  actor.gpuCooldowns = playerMod.freshGpuCooldowns();
  actor.flaskT = 0;
  actor.gpuArm = true;
  actor.alive = true;
  actor.invuln = 0;
  const glm = playerMod.spawn(ctx, 'glm', 'fight');
  ctx.input = input;
  glm.hp = 10;
  glm.flaskId = 'rtx5090';
  pressGpu(ctx, input);
  while (glm.flaskT > 0) playerMod.update(ctx, DT60);
  check('RTX heals 30%', near(glm.hp, 10 + 130 * 0.3, 0.02), `hp ${glm.hp}`);
  glm.flaskId = 'h200';
  glm.gpuArm = true;
  pressGpu(ctx, input);
  while (glm.flaskT > 0) playerMod.update(ctx, DT60);
  check('H200 heals 50% and is independent of RTX', near(glm.hp, 49 + 65, 0.02) && glm.gpuCooldowns.rtx5090 > 0 && glm.gpuCooldowns.h200 > 0, `hp ${glm.hp}`);
  check('H200 clear radius kept', FLASKS.h200.clearR === 64 && FLASKS.b200.armor === 0.6 && FLASKS.b200.superarmor === 3);
  glm.flaskId = 'b200';
  glm.gpuArm = true;
  pressGpu(ctx, input);
  while (glm.flaskT > 0) playerMod.update(ctx, DT60);
  check('B200 heals 100%', near(glm.hp, 130, 0.02), `hp ${glm.hp}`);
  check('GPU inventory quantities removed', !('charges' in glm) && !('charges' in FLASKS.rtx5090));

  glm.gpuCooldowns = playerMod.freshGpuCooldowns();
  glm.flaskT = 0;
  glm.flaskPending = null;
  function burn(id, times) {
    const waits = [];
    for (let n = 0; n < times; n += 1) {
      glm.flaskId = id;
      glm.gpuArm = true;
      glm.alive = true;
      input.up('q');
      pressGpu(ctx, input);
      input.up('q');
      let t = DT60;
      while (glm.gpuCooldowns[id] > 1e-4) {
        playerMod.update(ctx, DT60);
        t += DT60;
      }
      waits.push(t);
    }
    return waits;
  }
  const rtxWaits = burn('rtx5090', 5);
  const h200Waits = burn('h200', 4);
  const b200Waits = burn('b200', 3);
  const band = (arr, sec) => arr.every((t) => t > sec - 0.08 && t < sec + 0.08);
  check('RTX used 5 times at 5s (old cap 3)', rtxWaits.length === 5 && band(rtxWaits, 5), rtxWaits.map((t) => t.toFixed(3)).join(','));
  check('H200 used 4 times at 10s (old cap 2)', h200Waits.length === 4 && band(h200Waits, 10), h200Waits.map((t) => t.toFixed(3)).join(','));
  check('B200 used 3 times at 20s (old cap 1)', b200Waits.length === 3 && band(b200Waits, 20), b200Waits.map((t) => t.toFixed(3)).join(','));

  glm.gpuCooldowns = { rtx5090: 5, h200: 10, b200: 20 };
  const frozen = { ...glm.gpuCooldowns };
  for (let i = 0; i < 40; i += 1) playerMod.update(ctx, 0);
  check('pause dt 0 freezes cooldowns', glm.gpuCooldowns.rtx5090 === frozen.rtx5090 && glm.gpuCooldowns.h200 === frozen.h200 && glm.gpuCooldowns.b200 === frozen.b200);
  const clock = createTime();
  clock.setPaused(true);
  clock.requestHitStop(500);
  const steps = clock.consume(0.5, { freeze: true });
  check('paused/hit-stop consume yields no sim steps', steps.length === 0);
  playerMod.update(ctx, 1);
  check('sim dt still ticks after unpause', near(glm.gpuCooldowns.rtx5090, 4, 1e-6) && near(glm.gpuCooldowns.h200, 9, 1e-6) && near(glm.gpuCooldowns.b200, 19, 1e-6));

  glm.gpuCooldowns = { rtx5090: 4, h200: 8, b200: 16 };
  glm.flaskId = 'h200';
  playerMod.reset(ctx);
  check('reset zeroes cooldowns and keeps flaskId', glm.gpuCooldowns.rtx5090 === 0 && glm.gpuCooldowns.h200 === 0 && glm.gpuCooldowns.b200 === 0 && glm.flaskId === 'h200');
  playerMod.despawn(ctx);
  const spawned = playerMod.spawn(ctx, 'deepseek', 'fight');
  check('spawn/retry starts cooldowns at 0', spawned.gpuCooldowns.rtx5090 === 0 && spawned.gpuCooldowns.h200 === 0 && spawned.gpuCooldowns.b200 === 0);
  playerMod.update(ctx, 0);
  check('retry has no quantity/negative-count field', !('charges' in spawned));

  input.up('1');
  input.up('2');
  input.down('3');
  playerMod.update(ctx, DT60);
  input.end();
  input.up('3');
  check('keys 1/2/3 still select the GPU', spawned.flaskId === 'b200');
}

async function screenshots() {
  fs.mkdirSync(OUT, { recursive: true });
  const server = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], {
    cwd: path.resolve(path.dirname(new URL(import.meta.url).pathname), '..'),
    stdio: 'ignore',
  });
  const { chromium } = await import('playwright');
  const browser = await chromium.launch({
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning') errors.push(`[${msg.type()}] ${msg.text()}`);
  });
  page.on('pageerror', (err) => errors.push(`[pageerror] ${err.message}`));
  page.on('response', (res) => {
    if (res.status() >= 400 && !/favicon/.test(res.url())) errors.push(`[http ${res.status()}] ${res.url()}`);
  });
  try {
    for (let i = 0; i < 50; i += 1) {
      try {
        const res = await fetch(`http://127.0.0.1:${PORT}/`);
        if (res.ok) break;
      } catch { /* booting */ }
      if (i === 49) throw new Error('server did not boot');
      await new Promise((r) => setTimeout(r, 100));
    }
    await page.goto(`http://127.0.0.1:${PORT}/?autostart=deepseek&nointro=1`);
    await page.waitForFunction(() => window.__debug && window.__debug.state().state === 'fight', null, { timeout: 15000 });
    const probe = await page.evaluate(() => {
      const draw = window.__game.world.sprites.drawBullet;
      function paint(shape) {
        const c = document.createElement('canvas');
        c.width = 96;
        c.height = 72;
        const g = c.getContext('2d', { willReadFrequently: true });
        g.imageSmoothingEnabled = false;
        g.fillStyle = '#14121c';
        g.fillRect(0, 0, 96, 72);
        draw(g, { x: 48, y: 40, vx: 1, vy: 0, r: 4, shape, age: 0.2, color: '#fff' });
        const data = g.getImageData(0, 0, 96, 72).data;
        let n = 0;
        let white = 0;
        let cyan = 0;
        let purple = 0;
        let dark = 0;
        let gold = 0;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const gg = data[i + 1];
          const b = data[i + 2];
          if (r < 32 && gg >= 12 && gg < 30 && b < 42) continue;
          n += 1;
          if (r > 235 && gg > 235 && b > 235) white += 1;
          if (b > 180 && gg > 140 && r < 140) cyan += 1;
          if (r > 180 && b > 210 && gg > 150 && b > gg) purple += 1;
          if (r < 40 && gg < 20 && b < 48 && (r + gg + b) > 10) dark += 1;
          if (r > 220 && gg > 170 && b < 170) gold += 1;
        }
        const big = document.createElement('canvas');
        big.width = 384;
        big.height = 288;
        const bg = big.getContext('2d');
        bg.imageSmoothingEnabled = false;
        bg.drawImage(c, 0, 0, 384, 288);
        return { n, white, cyan, purple, dark, gold, url: big.toDataURL('image/png'), big };
      }
      const whale = paint('whale');
      const moon = paint('moon');
      const zed = paint('z');
      const sheet = document.createElement('canvas');
      sheet.width = 1180;
      sheet.height = 340;
      const sg = sheet.getContext('2d');
      sg.imageSmoothingEnabled = false;
      sg.fillStyle = '#0e0c14';
      sg.fillRect(0, 0, 1180, 340);
      sg.fillStyle = '#f4f1ea';
      sg.font = '20px "Noto Sans CJK SC","Noto Sans SC",sans-serif';
      const labels = ['鲸 192px', '暗月 440px', 'Z 96px'];
      [whale, moon, zed].forEach((shot, i) => {
        sg.drawImage(shot.big, 20 + i * 390, 36);
        sg.fillText(labels[i], 28 + i * 390, 26);
      });
      const pack = (shot) => ({ n: shot.n, white: shot.white, cyan: shot.cyan, purple: shot.purple, dark: shot.dark, gold: shot.gold, url: shot.url });
      return { whale: pack(whale), moon: pack(moon), zed: pack(zed), gallery: sheet.toDataURL('image/png') };
    });
    check('whale silhouette', probe.whale.n > 80 && probe.whale.white > 4 && probe.whale.cyan > 20, JSON.stringify(probe.whale));
    check('moon silhouette', probe.moon.n > 80 && probe.moon.purple > 10 && probe.moon.dark > 10, JSON.stringify(probe.moon));
    check('Z silhouette', probe.zed.n > 80 && probe.zed.gold > 20, JSON.stringify(probe.zed));

    const names = ['proj_whale.png', 'proj_moon.png', 'proj_z.png'];
    const stats = [probe.whale, probe.moon, probe.zed];
    names.forEach((name, i) => {
      const b64 = stats[i].url.split(',')[1];
      fs.writeFileSync(path.join(OUT, name), Buffer.from(b64, 'base64'));
    });
    fs.writeFileSync(path.join(OUT, 'gallery_projectiles.png'), Buffer.from(probe.gallery.split(',')[1], 'base64'));

    for (const id of ['deepseek', 'kimi', 'glm']) {
      await page.evaluate((charId) => {
        window.__debug.setGod(false);
        window.__debug.setDamageMul('player', 1);
        window.__debug.setTimeScale(1);
        window.__debug.startFight(charId);
      }, id);
      await page.waitForTimeout(200);
      await page.keyboard.down('ArrowRight');
      await page.waitForTimeout(420);
      await page.keyboard.up('ArrowRight');
      await page.screenshot({ path: path.join(OUT, `live_${id}.png`) });
    }
    note('SCREENSHOTS debug: god off, timeScale 1, player damage ×1. Gallery is code-drawn, not a generated asset.');
    const http404 = errors.filter((e) => /\[http 4/.test(e) || /\[pageerror\]/.test(e) || /\[error\]/.test(e));
    check('no 404 or page errors during projectile shots', http404.length === 0, http404.slice(0, 6).join(' | '));
    if (errors.length && http404.length === 0) note(`console notes (not failed): ${errors.slice(0, 6).join(' | ')}`);
  } finally {
    await browser.close();
    server.kill();
  }
}

reportDamage();
testHits();
testPhases();
testRange();
testGpu();

let shotError = null;
try {
  await screenshots();
} catch (err) {
  shotError = err;
  fails.push(`screenshots — ${err && err.message ? err.message : err}`);
  note(`FAIL screenshots — ${err && err.stack ? err.stack : err}`);
}

note(`RESULT ${fails.length === 0 ? 'PASS' : 'FAIL'} ${fails.length} failed`);
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'report.txt'), `${lines.join('\n')}\n`, 'utf8');
if (fails.length || shotError) process.exit(1);
