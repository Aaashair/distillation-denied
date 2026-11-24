// OWNER: WS1
// Chaser controller: camera-relative move (orbit while locked), roll i-frames,
// three kits, stamina, and the GPU flasks. Every damaging hit goes through applyHit.

import * as THREE from 'three';
import { EVENTS, TEAMS } from '../core/contracts.js';
import { applyHit } from '../core/combat.js';
import { planarBasis } from '../world/camera.js';
import { NAMES } from '../data/lines.js';
import { getCharacter, normalizeId } from './characters.js';
import {
  FLASKS,
  FLASK_ORDER,
  FLASK_MOVE,
  FLASK_TIME,
  ROLL,
  STAMINA_REGEN,
  STAMINA_LOCK,
  HITSTUN,
  HEAVY_HITSTUN,
  HEAVY_KNOCKBACK,
  HURT_IMMUNE,
} from '../config/balance_player.js';

const fwd = new THREE.Vector3();
const right = new THREE.Vector3();

let wired = false;
let swingSerial = 0;

function canSpend(actor, cost) {
  return actor.stamina + 1e-4 >= (cost || 0);
}

function spend(actor, cost) {
  actor.stamina = Math.max(0, actor.stamina - (cost || 0));
  if (actor.stamina <= 0.001) {
    actor.stamina = 0;
    actor.stamLock = Math.max(actor.stamLock, STAMINA_LOCK);
  }
}

function faceToward(actor, x, z) {
  const dx = x - actor.position.x;
  const dz = z - actor.position.z;
  const len = Math.hypot(dx, dz);
  if (len < 1e-4) return;
  actor.faceX = dx / len;
  actor.faceZ = dz / len;
}

function faceBoss(ctx, actor) {
  if (!ctx.boss) return;
  faceToward(actor, ctx.boss.position.x, ctx.boss.position.z);
}

function chainAt(spec) {
  const rec = Math.max(0.04, spec.recover - spec.active);
  return spec.active + rec * 0.28;
}

function rollCancelAt(spec) {
  const rec = Math.max(0.04, spec.recover - spec.active);
  return spec.active + rec * ROLL.cancelRecover;
}

function refreshInvuln(actor) {
  const rollI = actor.rolling
    && actor.rollT >= ROLL.iframeStart - 1e-4
    && actor.rollT <= ROLL.iframeEnd + 1e-4;
  actor.invulnerable = !!(rollI || actor.skillInvuln > 0);
}

/** Seconds of content-policy silence still on the clock. ctx.flags is the source of truth. */
function silenceLeft(ctx) {
  const flags = ctx.flags;
  if (!flags) return 0;
  let left = Number(flags.skillSilence) || 0;
  const until = Number(flags.skillSilenceUntil) || 0;
  const now = ctx.time?.elapsed || 0;
  if (until > now) left = Math.max(left, until - now);
  if (left <= 0 && flags.contentPolicySilence) return 0.05;
  return left > 0 ? left : 0;
}

function syncSilence(ctx, actor) {
  const left = silenceLeft(ctx);
  actor.skillSilenced = left;
  actor.contentSilenced = left;
  if (left <= 0) return;
  if (actor.guarding) setGuard(ctx, actor, false);
  if (actor.charging) {
    actor.charging = false;
    actor.chargeT = 0;
    ctx.world.vfx?.charge?.(ctx, null);
  }
}

function setGuard(ctx, actor, on) {
  if (on && silenceLeft(ctx) > 0) on = false;
  if (on && !actor.guarding) {
    actor.guarding = true;
    actor.guardStart = ctx.time.elapsed;
    ctx.bus.emit(EVENTS.GUARD_START, { id: actor.id });
    return;
  }
  if (!on && actor.guarding) {
    actor.guarding = false;
    ctx.bus.emit(EVENTS.GUARD_END, { id: actor.id });
  }
}

function cancelFlask(ctx, actor) {
  if (!actor.flasking) return;
  const type = actor.flaskUsing || actor.flaskId;
  actor.flasking = false;
  actor.flaskT = 0;
  ctx.bus.emit(EVENTS.FLASK_INTERRUPTED, { type, id: actor.id });
}

function die(ctx, actor) {
  if (!actor.alive) return;
  actor.alive = false;
  actor.hp = 0;
  actor.flasking = false;
  actor.hot = null;
  actor.guarding = false;
  actor.rolling = false;
  actor.swing = null;
  actor.flurry = null;
  actor.charging = false;
  actor.invulnerable = false;
  actor.stun = 0;
  actor.skillInvuln = 0;
  ctx.bus.emit(EVENTS.PLAYER_DEATH, { phase: ctx.boss?.phase || 1, id: actor.id });
  syncBoard(ctx, actor);
}

function attackKey(ctx, actor, info) {
  if (info && info.attackId != null && info.attackId !== '') return `id:${info.attackId}`;
  const src = info && info.src;
  if (src && src.swingId != null) return `sw:${src.id}:${src.swingId}`;
  const list = ctx.world?.telegraph?.active?.() || [];
  let blocked = null;
  const now = ctx.time.elapsed;
  for (let i = list.length - 1; i >= 0; i -= 1) {
    const tg = list[i];
    let inside = false;
    try { inside = !!(tg.contains && tg.contains(actor.position)); } catch { inside = false; }
    if (!inside) continue;
    const key = `tg:${tg.id}`;
    if (!(actor.immune[key] > now)) return key;
    if (!blocked) blocked = key;
  }
  if (blocked) return blocked;
  if (src && src.id) return `src:${src.id}:${swingSerial}`;
  return null;
}

function remember(actor, key, now) {
  if (!key) return;
  actor.immune[key] = now + HURT_IMMUNE;
}

function hurt(ctx, actor, info) {
  if (!actor.alive) return 0;
  if (actor.invulnerable && !info.ignoreInvuln) return 0;
  let amount = Number(info.dmg) || 0;
  if (amount <= 0) return 0;
  const now = ctx.time.elapsed;
  const key = attackKey(ctx, actor, info);
  if (!info.ignoreInvuln && key && actor.immune[key] > now) return 0;

  const src = info.src;
  const srcTeam = src && src.team;
  const guarding = actor.guarding && srcTeam === TEAMS.BOSS;

  if (guarding) {
    const windowSec = actor.kit.skill.perfectWindow || 0.2;
    const perfect = now - actor.guardStart <= windowSec + 1e-4;
    if (perfect) {
      remember(actor, key, now);
      ctx.bus.emit(EVENTS.PERFECT_GUARD, { id: actor.id });
      ctx.audio?.playSfx('sfx.perfect');
      ctx.bus.emit(EVENTS.CAMERA_SHAKE, { intensity: 0.18, duration: 0.2 });
      ctx.world.vfx?.slash?.(ctx, {
        x: actor.position.x + actor.faceX * 0.7,
        z: actor.position.z + actor.faceZ * 0.7,
        y: 1.15,
        gold: true,
        scale: 2.15,
        spin: 0.4,
      });
      if (ctx.boss && ctx.boss.alive !== false) {
        applyHit(ctx, actor, ctx.boss, actor.kit.skill.counter || 60, { heavy: true, hitStopMs: 70 });
      }
      return 0;
    }
    const incoming = amount;
    amount *= 1 - (actor.kit.skill.reduce ?? 0.8);
    actor.stamina = Math.max(0, actor.stamina - incoming * (actor.kit.skill.staminaPerDmg || 0.6));
    if (actor.stamina <= 0) {
      actor.stamina = 0;
      actor.stamLock = Math.max(actor.stamLock, STAMINA_LOCK);
    }
    ctx.audio?.playSfx('sfx.guard');
    remember(actor, key, now);
    const before = actor.hp;
    actor.hp = Math.max(0, actor.hp - amount);
    const applied = before - actor.hp;
    if (applied > 0 && actor.superArmor <= 0) cancelFlask(ctx, actor);
    if (actor.hp <= 0) die(ctx, actor);
    return applied;
  }

  let noStun = !!info.noStun;
  let noKnock = !!info.noKnockback;
  if (actor.superArmor > 0) {
    amount *= 1 - (FLASKS.b200.dr || 0.3);
    noStun = true;
    noKnock = true;
  }

  const before = actor.hp;
  actor.hp = Math.max(0, actor.hp - amount);
  const applied = before - actor.hp;
  if (applied <= 0) return 0;
  remember(actor, key, now);
  if (actor.superArmor <= 0) cancelFlask(ctx, actor);
  if (!noStun) {
    actor.stun = info.heavy ? HEAVY_HITSTUN : HITSTUN;
    actor.swing = null;
    actor.flurry = null;
    actor.rolling = false;
    actor.charging = false;
    actor.skillInvuln = 0;
    actor.attackQueue = 0;
    actor.rollQueued = false;
    setGuard(ctx, actor, false);
  }
  if (info.heavy && !noKnock) {
    let kx = -actor.faceX;
    let kz = -actor.faceZ;
    if (src && src.position) {
      kx = actor.position.x - src.position.x;
      kz = actor.position.z - src.position.z;
    }
    const kl = Math.hypot(kx, kz) || 1;
    actor.position.x += (kx / kl) * HEAVY_KNOCKBACK;
    actor.position.z += (kz / kl) * HEAVY_KNOCKBACK;
    ctx.world.clamp?.(actor.position, actor.radius + 0.35);
  }
  if (actor.hp <= 0) die(ctx, actor);
  return applied;
}

function separate(actor, ctx) {
  const boss = ctx.boss;
  if (!boss) return;
  const min = actor.radius + (boss.radius || 0.5) + 0.32;
  let dx = actor.position.x - boss.position.x;
  let dz = actor.position.z - boss.position.z;
  const dist = Math.hypot(dx, dz);
  if (dist >= min) return;
  if (dist < 1e-4) {
    dx = actor.faceX || 0;
    dz = actor.faceZ || 1;
  } else {
    dx /= dist;
    dz /= dist;
  }
  const len = Math.hypot(dx, dz) || 1;
  actor.position.x = boss.position.x + (dx / len) * min;
  actor.position.z = boss.position.z + (dz / len) * min;
}

function meleeHit(ctx, actor, dmg, range, heavy) {
  const boss = ctx.boss;
  if (!boss || boss.alive === false) return false;
  const dx = boss.position.x - actor.position.x;
  const dz = boss.position.z - actor.position.z;
  const dist = Math.hypot(dx, dz);
  if (dist > range + (boss.radius || 0.5)) return false;
  const dot = dist < 0.08 ? 1 : (dx * actor.faceX + dz * actor.faceZ) / dist;
  if (dot < 0.15) return false;
  applyHit(ctx, actor, boss, dmg, { heavy: !!heavy, hitStopMs: heavy ? 70 : 42 });
  actor.lungeLeft = heavy ? 0.32 : 0.46;
  return true;
}

function swingSfx(actor) {
  if (actor.id === 'glm') return 'sfx.hammer';
  if (actor.id === 'kimi') return 'sfx.star';
  return 'sfx.slash';
}

function spawnSlash(ctx, actor, index, gold) {
  const spin = [-0.7, 0.55, -1.05, 0.9][index % 4];
  ctx.world.vfx?.slash?.(ctx, {
    x: actor.position.x + actor.faceX * 0.85,
    z: actor.position.z + actor.faceZ * 0.85,
    y: actor.id === 'glm' ? 1.25 : 1.05,
    gold: !!gold,
    scale: actor.id === 'glm' ? 2.15 : 1.65,
    spin,
  });
}

function startSwing(ctx, actor, index) {
  const hits = actor.kit.attack.hits || [];
  const spec = hits[index];
  if (!spec || !canSpend(actor, spec.stamina)) return false;
  spend(actor, spec.stamina);
  actor.attackQueue = 0;
  actor.swing = { index, t: 0, didHit: false, spec };
  actor.charging = false;
  setGuard(ctx, actor, false);
  if (ctx.lockOn && ctx.boss) faceBoss(ctx, actor);
  ctx.bus.emit(EVENTS.PLAYER_ATTACK, { id: actor.id, name: actor.kit.attack.name });
  ctx.audio?.playSfx(swingSfx(actor));
  return true;
}

function startBolt(ctx, actor) {
  const atk = actor.kit.attack;
  if (actor.atkCd > 0 || !canSpend(actor, atk.stamina)) return false;
  spend(actor, atk.stamina);
  actor.atkCd = atk.cooldown;
  actor.attackQueue = 0;
  actor.swing = {
    index: 0,
    t: 0,
    didHit: true,
    spec: { active: atk.active || 0.12, recover: atk.recover || 0.36, range: atk.range },
  };
  if (ctx.lockOn && ctx.boss) faceBoss(ctx, actor);
  ctx.bus.emit(EVENTS.PLAYER_ATTACK, { id: actor.id, name: atk.name });
  ctx.audio?.playSfx('sfx.star');
  ctx.world.vfx?.bolt?.(ctx, {
    x: actor.position.x + actor.faceX * 0.6,
    z: actor.position.z + actor.faceZ * 0.6,
    y: 1.2,
    dirX: actor.faceX,
    dirZ: actor.faceZ,
    speed: atk.speed || 26,
    range: atk.range || 20,
    damage: atk.damage,
    src: actor,
  });
  return true;
}

function startFlurry(ctx, actor) {
  const skill = actor.kit.skill;
  if (silenceLeft(ctx) > 0) return false;
  if (actor.skillCd > 0 || actor.flurry || !canSpend(actor, skill.stamina)) return false;
  spend(actor, skill.stamina);
  actor.skillCd = skill.cooldown;
  if (ctx.lockOn && ctx.boss) faceBoss(ctx, actor);
  else if (Math.hypot(actor.faceX, actor.faceZ) < 0.1) {
    actor.faceX = 0;
    actor.faceZ = -1;
  }
  actor.flurry = {
    t: 0,
    hits: 0,
    fromX: actor.position.x,
    fromZ: actor.position.z,
    dirX: actor.faceX,
    dirZ: actor.faceZ,
  };
  actor.skillInvuln = skill.iframe || 0.2;
  actor.swing = null;
  actor.charging = false;
  setGuard(ctx, actor, false);
  ctx.bus.emit(EVENTS.SKILL_USED, { id: actor.id, name: skill.name });
  ctx.audio?.playSfx('sfx.slash');
  return true;
}

function beginCharge(ctx, actor) {
  const skill = actor.kit.skill;
  if (silenceLeft(ctx) > 0) return false;
  if (actor.charging || actor.skillCd > 0 || !canSpend(actor, skill.stamina)) return false;
  spend(actor, skill.stamina);
  actor.charging = true;
  actor.chargeT = 0;
  actor.swing = null;
  setGuard(ctx, actor, false);
  ctx.bus.emit(EVENTS.SKILL_USED, { id: actor.id, name: skill.name });
  ctx.audio?.playSfx('sfx.charge');
  return true;
}

function releaseBeam(ctx, actor, fired) {
  const skill = actor.kit.skill;
  const held = actor.chargeT;
  actor.charging = false;
  actor.skillCd = skill.cooldown || 2.4;
  ctx.world.vfx?.charge?.(ctx, null);
  if (!fired || held < skill.min - 1e-4) return;
  const span = Math.max(0.05, skill.max - skill.min);
  const k = Math.max(0, Math.min(1, (held - skill.min) / span));
  const dmg = skill.dmgMin + (skill.dmgMax - skill.dmgMin) * k;
  if (ctx.boss) faceBoss(ctx, actor);
  ctx.audio?.playSfx('sfx.beam');
  const boss = ctx.boss;
  let hitDist = skill.range;
  if (boss && boss.alive !== false) {
    const dx = boss.position.x - actor.position.x;
    const dz = boss.position.z - actor.position.z;
    const dist = Math.hypot(dx, dz);
    const dot = dist < 0.08 ? 1 : (dx * actor.faceX + dz * actor.faceZ) / dist;
    if (dist <= skill.range + (boss.radius || 0.5) && (dot >= 0.3 || dist < 1.4)) {
      hitDist = dist;
      applyHit(ctx, actor, boss, dmg, { heavy: k >= 0.66, hitStopMs: k >= 0.66 ? 70 : 48 });
    }
  }
  ctx.world.vfx?.beam?.(ctx, {
    x: actor.position.x,
    z: actor.position.z,
    dirX: actor.faceX,
    dirZ: actor.faceZ,
    length: Math.min(skill.range, hitDist),
    hitDist,
  });
}

function tryRoll(ctx, actor) {
  if (actor.flasking || actor.stun > 0 || actor.rolling) return false;
  if (!canSpend(actor, actor.kit.rollCost)) return false;
  const w = actor.want;
  let dx = 0;
  let dz = 0;
  if (ctx.lockOn && ctx.boss) {
    const ox = actor.position.x - ctx.boss.position.x;
    const oz = actor.position.z - ctx.boss.position.z;
    const dist = Math.hypot(ox, oz) || 1;
    const towardX = -ox / dist;
    const towardZ = -oz / dist;
    const rightX = -towardZ;
    const rightZ = towardX;
    dx = rightX * w.ix + towardX * w.iz;
    dz = rightZ * w.ix + towardZ * w.iz;
  } else {
    planarBasis(ctx, fwd, right);
    dx = fwd.x * w.iz + right.x * w.ix;
    dz = fwd.z * w.iz + right.z * w.ix;
  }
  if (Math.hypot(dx, dz) < 0.2) {
    dx = actor.faceX;
    dz = actor.faceZ;
  }
  const len = Math.hypot(dx, dz) || 1;
  spend(actor, actor.kit.rollCost);
  actor.rolling = true;
  actor.rollT = 0;
  actor.swing = null;
  actor.flurry = null;
  actor.charging = false;
  actor.skillInvuln = 0;
  actor.lungeLeft = 0;
  setGuard(ctx, actor, false);
  ctx.world.vfx?.charge?.(ctx, null);
  actor.rollDirX = dx / len;
  actor.rollDirZ = dz / len;
  actor.rollFromX = actor.position.x;
  actor.rollFromZ = actor.position.z;
  actor.rollSide = actor.rollDirX * actor.faceZ - actor.rollDirZ * actor.faceX;
  if (Math.abs(actor.rollSide) < 0.15) actor.rollSide = 1;
  ctx.bus.emit(EVENTS.ROLL_START, { id: actor.id });
  ctx.audio?.playSfx('sfx.roll');
  ctx.world.vfx?.burst?.(ctx, {
    x: actor.position.x,
    y: 0.25,
    z: actor.position.z,
    n: 7,
    team: 'player',
    scale: 0.55,
  });
  return true;
}

function tickRoll(actor, dt) {
  actor.rollT += dt;
  const u = Math.min(1, actor.rollT / ROLL.duration);
  const arc = 1 - (1 - u) ** 3;
  const dist = actor.kit.rollDistance;
  actor.position.x = actor.rollFromX + actor.rollDirX * dist * arc;
  actor.position.z = actor.rollFromZ + actor.rollDirZ * dist * arc;
  actor.moving = true;
}

function endRoll(ctx, actor) {
  if (actor.rollT < ROLL.duration) return;
  actor.rolling = false;
  actor.moving = false;
  ctx.bus.emit(EVENTS.ROLL_END, { id: actor.id });
}

const FLURRY_HITS = [0.12, 0.24, 0.36, 0.48, 0.6, 0.72];

// Stop on the near skin of the boss. A straight 5 m dash otherwise
// passes through and the chaser faces away, so every hit whiffs.
function stopShort(fromX, fromZ, dirX, dirZ, travel, bossX, bossZ, minDist) {
  const ox = fromX - bossX;
  const oz = fromZ - bossZ;
  const start = Math.hypot(ox, oz);
  if (start <= minDist) {
    const n = start || 1;
    const nx = start < 1e-4 ? -dirX : ox / n;
    const nz = start < 1e-4 ? -dirZ : oz / n;
    return { x: bossX + nx * minDist, z: bossZ + nz * minDist };
  }
  const b = ox * dirX + oz * dirZ;
  const disc = b * b - (start * start - minDist * minDist);
  if (b < 0 && disc >= 0) {
    const t = -b - Math.sqrt(disc);
    if (t >= 0 && t < travel) return { x: fromX + dirX * t, z: fromZ + dirZ * t };
  }
  return { x: fromX + dirX * travel, z: fromZ + dirZ * travel };
}

function tickFlurry(ctx, actor, dt) {
  const skill = actor.kit.skill;
  const f = actor.flurry;
  f.t += dt;
  actor.skillInvuln = Math.max(0, (skill.iframe || 0.2) - f.t);
  const dashU = Math.min(1, f.t / (skill.iframe || 0.2));
  const arc = 1 - (1 - dashU) ** 3;
  const travel = skill.distance * arc;
  const boss = ctx.boss;
  const min = actor.radius + ((boss && boss.radius) || 0.5) + 0.34;
  const stop = boss
    ? stopShort(f.fromX, f.fromZ, f.dirX, f.dirZ, travel, boss.position.x, boss.position.z, min)
    : { x: f.fromX + f.dirX * travel, z: f.fromZ + f.dirZ * travel };
  actor.position.x = stop.x;
  actor.position.z = stop.z;
  if (ctx.lockOn && boss && boss.alive !== false) {
    const fx = boss.position.x - stop.x;
    const fz = boss.position.z - stop.z;
    const fl = Math.hypot(fx, fz) || 1;
    actor.faceX = fx / fl;
    actor.faceZ = fz / fl;
  } else {
    actor.faceX = f.dirX;
    actor.faceZ = f.dirZ;
  }
  actor.moving = dashU < 1;
  while (f.hits < skill.hits && f.t >= FLURRY_HITS[f.hits]) {
    meleeHit(ctx, actor, skill.hitDamage, skill.range, false);
    spawnSlash(ctx, actor, f.hits, false);
    f.hits += 1;
  }
  if (actor.rollQueued && f.t >= (skill.duration || 0.86) * 0.6) {
    actor.rollQueued = false;
    if (tryRoll(ctx, actor)) return;
  }
  if (f.t >= (skill.duration || 0.86)) actor.flurry = null;
}

function advanceSwing(ctx, actor, dt) {
  const sw = actor.swing;
  if (!sw) return;
  sw.t += dt;
  const kind = actor.kit.attack.kind;
  if (!sw.didHit && kind === 'melee' && sw.t >= sw.spec.active) {
    sw.didHit = true;
    if (ctx.lockOn && ctx.boss) faceBoss(ctx, actor);
    meleeHit(ctx, actor, sw.spec.damage, sw.spec.range, !!sw.spec.heavy);
    spawnSlash(ctx, actor, sw.index, false);
  }
  if (actor.rollQueued && sw.t >= rollCancelAt(sw.spec)) {
    actor.rollQueued = false;
    if (tryRoll(ctx, actor)) return;
  }
  const hits = actor.kit.attack.hits || [];
  const more = kind === 'melee' && sw.index + 1 < hits.length;
  if (more && actor.attackQueue > 0 && sw.t >= chainAt(sw.spec)) {
    startSwing(ctx, actor, sw.index + 1);
    return;
  }
  if (sw.t >= sw.spec.recover) {
    actor.swing = null;
    if (!more) actor.attackQueue = Math.min(actor.attackQueue, 0.16);
  }
}

function moveSpeed(actor) {
  let speed = actor.kit.speed;
  if (actor.flasking) speed *= FLASK_MOVE;
  else if (actor.charging) speed *= actor.kit.skill.move ?? 0.4;
  else if (actor.swing) speed *= actor.swing.t >= chainAt(actor.swing.spec) ? 0.5 : 0;
  else if (actor.guarding) speed *= 0.72;
  return speed;
}

function applyMove(ctx, actor, speed, dt) {
  const w = actor.want;
  const ix = w.ix;
  const iz = w.iz;
  if (ctx.lockOn && ctx.boss) faceBoss(ctx, actor);
  if ((!ix && !iz) || speed <= 0) {
    actor.moving = false;
    actor.lean = 0;
    return;
  }
  actor.moving = true;
  actor.lean = Math.max(-0.22, Math.min(0.22, ix * 0.16));
  const boss = ctx.boss;
  if (ctx.lockOn && boss) {
    let dx = actor.position.x - boss.position.x;
    let dz = actor.position.z - boss.position.z;
    let dist = Math.hypot(dx, dz);
    if (dist < 0.05) {
      dx = 0;
      dz = 1;
      dist = 1;
    }
    const min = actor.radius + (boss.radius || 0.5) + 0.36;
    dist = Math.max(min, dist - iz * speed * dt);
    const base = Math.atan2(dx, dz);
    const ang = base + ix * (speed * dt) / Math.max(dist, 0.75);
    actor.position.x = boss.position.x + Math.sin(ang) * dist;
    actor.position.z = boss.position.z + Math.cos(ang) * dist;
    return;
  }
  planarBasis(ctx, fwd, right);
  let mx = fwd.x * iz + right.x * ix;
  let mz = fwd.z * iz + right.z * ix;
  const mag = Math.hypot(mx, mz);
  if (mag < 1e-5) return;
  mx /= mag;
  mz /= mag;
  actor.position.x += mx * speed * dt;
  actor.position.z += mz * speed * dt;
  if (!(ctx.lockOn && ctx.boss)) {
    actor.faceX = mx;
    actor.faceZ = mz;
  }
}

function applyLunge(actor, dt) {
  if (actor.lungeLeft <= 0 || actor.rolling) return;
  const step = Math.min(actor.lungeLeft, 12 * dt);
  actor.lungeLeft -= step;
  actor.position.x += actor.faceX * step;
  actor.position.z += actor.faceZ * step;
}

function tryFlask(ctx, actor) {
  if (actor.flasking || actor.rolling || actor.stun > 0 || actor.flurry || actor.swing || actor.charging) return;
  const spec = FLASKS[actor.flaskId];
  if (!spec || (actor.charges[actor.flaskId] || 0) <= 0) return;
  actor.charges[actor.flaskId] -= 1;
  actor.flasking = true;
  actor.flaskT = 0;
  actor.flaskUsing = actor.flaskId;
  setGuard(ctx, actor, false);
  ctx.bus.emit(EVENTS.FLASK_USED, { type: actor.flaskUsing, id: actor.id });
  ctx.audio?.playSfx(spec.sfx || 'sfx.flask');
  ctx.world.vfx?.heal?.(ctx, {
    x: actor.position.x,
    z: actor.position.z,
    scale: spec.heal >= 1 ? 2.5 : spec.heal >= 0.5 ? 2 : 1.45,
    life: 0.55,
  });
}

function finishFlask(ctx, actor) {
  const spec = FLASKS[actor.flaskUsing || actor.flaskId];
  actor.flasking = false;
  actor.flaskT = 0;
  if (!spec || !actor.alive) return;
  if (spec.healTime) {
    actor.hot = { left: spec.healTime, total: spec.healTime, amount: actor.maxHp * spec.heal };
  } else {
    actor.hp = Math.min(actor.maxHp, actor.hp + actor.maxHp * spec.heal);
  }
  if (spec.fillStamina) {
    actor.stamina = actor.staminaMax;
    actor.stamLock = 0;
  }
  if (spec.superArmor) actor.superArmor = spec.superArmor;
  ctx.audio?.playSfx('sfx.heal');
  ctx.world.vfx?.heal?.(ctx, {
    x: actor.position.x,
    z: actor.position.z,
    scale: spec.heal >= 1 ? 2.8 : 2.1,
    life: spec.healTime || 0.65,
  });
}

function tickHot(actor, dt) {
  if (!actor.hot || !actor.alive) return;
  const step = Math.min(actor.hot.left, dt);
  if (step <= 0) return;
  actor.hp = Math.min(actor.maxHp, actor.hp + actor.hot.amount * (step / actor.hot.total));
  actor.hot.left -= step;
  if (actor.hot.left <= 1e-4) actor.hot = null;
}

function tickStamina(actor, dt) {
  const busy = !!(actor.swing || actor.flurry || actor.charging || actor.guarding);
  if (actor.stamLock > 0) actor.stamLock = Math.max(0, actor.stamLock - dt);
  else if (!busy) actor.stamina = Math.min(actor.staminaMax, actor.stamina + STAMINA_REGEN * dt);
}

function readWant(ctx, actor, dt) {
  const input = ctx.input;
  if (input.pressed('1')) actor.flaskId = 'rtx5090';
  if (input.pressed('2')) actor.flaskId = 'h200';
  if (input.pressed('3')) actor.flaskId = 'b200';
  if ((input.pressed('lmb') || input.pressed('rmb')) && input.pointer.onUi) actor.mouseUi = true;
  if (!input.held('lmb') && !input.held('rmb')) actor.mouseUi = false;
  const mouse = !actor.mouseUi;
  const attackPressed = input.pressed('j') || (mouse && input.pressed('lmb') && !input.pointer.onUi);
  const attackHeld = input.held('j') || (mouse && input.held('lmb'));
  const skillDown = input.pressed('k') || (mouse && input.pressed('rmb') && !input.pointer.onUi);
  const skillHeld = input.held('k') || (mouse && input.held('rmb'));
  if (input.pressed('space')) actor.rollQueued = true;
  if (attackPressed) actor.attackQueue = actor.swing ? 99 : Math.max(actor.attackQueue, 0.22);
  else if (attackHeld && actor.swing) actor.attackQueue = 99;
  if (!actor.swing && actor.attackQueue > 0 && actor.attackQueue < 50) {
    actor.attackQueue = Math.max(0, actor.attackQueue - dt);
  }
  actor.want = {
    ix: (input.held('d') ? 1 : 0) - (input.held('a') ? 1 : 0),
    iz: (input.held('w') ? 1 : 0) - (input.held('s') ? 1 : 0),
    skillDown: !!skillDown,
    skillHeld: !!skillHeld && !actor.mouseUi,
    flask: input.pressed('r'),
  };
}

function freeAct(ctx, actor, dt) {
  const skill = actor.kit.skill;
  const w = actor.want;

  if (actor.rollQueued && !actor.flasking) {
    actor.rollQueued = false;
    if (tryRoll(ctx, actor)) return;
  }

  if (skill.type === 'beam' && actor.charging) {
    actor.chargeT += dt;
    const maxed = actor.chargeT >= skill.max - 1e-4;
    if (!w.skillHeld || maxed) releaseBeam(ctx, actor, true);
    else {
      ctx.world.vfx?.charge?.(ctx, {
        x: actor.position.x,
        z: actor.position.z,
        ratio: Math.min(1, actor.chargeT / skill.max),
      });
    }
  } else if (skill.type === 'guard') {
    setGuard(ctx, actor, w.skillHeld && !actor.flasking);
  } else if (actor.guarding) {
    setGuard(ctx, actor, false);
  }

  applyMove(ctx, actor, moveSpeed(actor), dt);

  if (actor.rolling || actor.charging || actor.guarding) return;

  if (w.flask) tryFlask(ctx, actor);
  if (actor.flasking) return;

  if (skill.type === 'flurry' && w.skillDown) startFlurry(ctx, actor);
  if (actor.flurry) return;

  if (skill.type === 'beam' && w.skillDown && !actor.charging) beginCharge(ctx, actor);
  if (actor.charging) return;

  if (actor.attackQueue > 0) {
    if (actor.kit.attack.kind === 'bolt') startBolt(ctx, actor);
    else startSwing(ctx, actor, 0);
  }
}

function syncBoard(ctx, actor) {
  const board = actor.billboard;
  if (!board || !board.setPose) return;
  let pose = 'idle';
  if (!actor.alive) pose = 'down';
  else if (actor.stun > 0) pose = 'hurt';
  else if (actor.rolling) pose = 'roll';
  else if (actor.flasking || actor.hot) pose = 'heal';
  else if (actor.flurry || actor.charging || actor.guarding) pose = 'skill';
  else if (actor.swing) pose = 'attack';
  else if (actor.moving) pose = 'run';
  board.setPose(pose);

  let sx = 1;
  let sy = 1;
  let lean = actor.lean || 0;
  let tilt = 0;
  if (actor.rolling) {
    const u = Math.min(1, actor.rollT / ROLL.duration);
    const s = Math.sin(u * Math.PI);
    sx = 1 + s * 0.3;
    sy = 1 - s * 0.34;
    tilt = s * 0.5;
    lean += (actor.rollSide || 1) * s * 0.4;
  } else if (actor.swing) {
    const spec = actor.swing.spec;
    const hitP = spec.active / Math.max(0.05, spec.recover);
    const p = Math.min(1.2, actor.swing.t / spec.recover);
    if (p < hitP) {
      const k = p / Math.max(0.05, hitP);
      sy = 1 - 0.12 * Math.sin(k * Math.PI);
      sx = 1 + 0.1 * Math.sin(k * Math.PI);
    } else {
      const k = Math.min(1, (p - hitP) / Math.max(0.05, 1 - hitP));
      sy = 1 + 0.18 * (1 - k);
      sx = 1 - 0.12 * (1 - k);
    }
  } else if (actor.flurry) {
    const s = Math.sin(actor.flurry.t * 32);
    sx = 1 + Math.abs(s) * 0.08;
    sy = 1 - Math.abs(s) * 0.06;
  } else if (actor.charging) {
    const k = Math.min(1, actor.chargeT / (actor.kit.skill.max || 2));
    sy = 1 - 0.1 * k;
    sx = 1 + 0.08 * k;
  } else if (actor.moving) {
    const s = Math.sin(ctx.time.elapsed * 14);
    sx = 1 + s * 0.045;
    sy = 1 - s * 0.05;
  } else if (actor.stun > 0) {
    sx = 1.08;
    sy = 0.9;
    lean -= 0.18;
  }
  board.squashX = sx;
  board.squashY = sy;
  board.lean = lean;
  board.tilt = tilt;
  board.ghost = !!actor.rolling;
  board.bobAmp = pose === 'idle' || pose === 'run' ? null : 0;
  if (actor.superArmor > 0) board.setTint('#fff4d0');
  else if (actor.flasking || actor.hot) board.setTint('#e7ffe9');
  else if (actor.charging) board.setTint('#d7e8ff');
  else if (actor.guarding) board.setTint('#f3e7ff');
  else board.setTint('#ffffff');
  board.setDim(null);
}

function finishMove(ctx, actor) {
  if (actor.alive) {
    separate(actor, ctx);
    ctx.world.clamp?.(actor.position, actor.radius + 0.35);
  }
  actor.position.y = 0;
  refreshInvuln(actor);
  syncBoard(ctx, actor);
  if (!actor.charging) ctx.world.vfx?.charge?.(ctx, null);
}

function tick(ctx, actor, dt) {
  readWant(ctx, actor, dt);
  syncSilence(ctx, actor);
  tickHot(actor, dt);
  tickStamina(actor, dt);
  if (actor.skillCd > 0) actor.skillCd = Math.max(0, actor.skillCd - dt);
  if (actor.atkCd > 0) actor.atkCd = Math.max(0, actor.atkCd - dt);
  if (actor.superArmor > 0) actor.superArmor = Math.max(0, actor.superArmor - dt);
  if (actor.stun > 0) actor.stun = Math.max(0, actor.stun - dt);

  if (!actor.alive) {
    actor.moving = false;
    refreshInvuln(actor);
    syncBoard(ctx, actor);
    return;
  }

  if (actor.stun > 0) {
    setGuard(ctx, actor, false);
    actor.moving = false;
    actor.lean = -0.12;
    finishMove(ctx, actor);
    return;
  }

  if (actor.rolling) {
    tickRoll(actor, dt);
    endRoll(ctx, actor);
    finishMove(ctx, actor);
    return;
  }

  if (actor.flurry) {
    tickFlurry(ctx, actor, dt);
    if (actor.rolling) {
      tickRoll(actor, dt);
      endRoll(ctx, actor);
    }
    finishMove(ctx, actor);
    return;
  }

  if (actor.flasking) {
    actor.rollQueued = false;
    actor.flaskT += dt;
    applyMove(ctx, actor, actor.kit.speed * FLASK_MOVE, dt);
    if (actor.flaskT >= FLASK_TIME) finishFlask(ctx, actor);
    finishMove(ctx, actor);
    return;
  }

  if (actor.swing) {
    advanceSwing(ctx, actor, dt);
    if (actor.rolling) {
      tickRoll(actor, dt);
      endRoll(ctx, actor);
      finishMove(ctx, actor);
      return;
    }
    if (actor.swing) {
      applyMove(ctx, actor, moveSpeed(actor), dt);
      applyLunge(actor, dt);
      finishMove(ctx, actor);
      return;
    }
  }

  freeAct(ctx, actor, dt);
  if (actor.rolling) {
    tickRoll(actor, dt);
    endRoll(ctx, actor);
  } else if (actor.flurry) {
    tickFlurry(ctx, actor, 0);
  }
  applyLunge(actor, dt);
  finishMove(ctx, actor);
}

export function init(ctx) {
  if (wired) return;
  wired = true;
  ctx.bus.on(EVENTS.TELEGRAPH_START, () => { swingSerial += 1; });
  ctx.bus.on(EVENTS.BOSS_ATTACK, () => { swingSerial += 1; });
}

export function despawn(ctx) {
  const player = ctx.player;
  if (player?.billboard) ctx.world.sprites?.destroyBillboard(player.billboard);
  ctx.player = null;
}

export function spawn(ctx, charId) {
  despawn(ctx);
  const id = normalizeId(charId) || 'deepseek';
  const kit = getCharacter(id);
  const charges = {};
  for (const key of FLASK_ORDER) charges[key] = FLASKS[key].charges;

  const actor = {
    id,
    team: TEAMS.PLAYER,
    kit,
    position: new THREE.Vector3(0, 0, 5.6),
    hp: kit.hp,
    maxHp: kit.hp,
    stamina: kit.stamina,
    staminaMax: kit.stamina,
    radius: kit.radius,
    height: kit.height,
    alive: true,
    invulnerable: false,
    sprite: null,
    billboard: null,
    flaskId: 'rtx5090',
    charges,
    flasking: false,
    flaskT: 0,
    hot: null,
    stun: 0,
    stamLock: 0,
    superArmor: 0,
    atkCd: 0,
    skillCd: 0,
    rolling: false,
    rollT: 0,
    rollDirX: 0,
    rollDirZ: -1,
    rollFromX: 0,
    rollFromZ: 5.6,
    rollSide: 1,
    guarding: false,
    guardStart: 0,
    swing: null,
    flurry: null,
    charging: false,
    chargeT: 0,
    skillInvuln: 0,
    lungeLeft: 0,
    attackQueue: 0,
    rollQueued: false,
    moving: false,
    lean: 0,
    faceX: 0,
    faceZ: -1,
    mouseUi: false,
    want: { ix: 0, iz: 0, skillDown: false, skillHeld: false, flask: false },
    immune: {},
    takeDamage(info) {
      return hurt(ctx, actor, info);
    },
  };

  actor.billboard = ctx.world.sprites.createBillboard({
    assetId: kit.asset,
    label: NAMES.players[id] || kit.name,
    color: kit.color,
    accent: kit.accent,
    height: kit.height,
    facing: 'back',
    owner: actor,
  });
  if (actor.billboard?.setPose) actor.billboard.setPose('idle');
  ctx.player = actor;
  return actor;
}

export function update(ctx, dt) {
  ctx.world.vfx?.sim?.(ctx, dt);
  if (ctx.player) tick(ctx, ctx.player, dt);
}

export function reset(ctx) {
  swingSerial = 0;
  if (ctx.selectedChar) spawn(ctx, ctx.selectedChar);
  else despawn(ctx);
}
