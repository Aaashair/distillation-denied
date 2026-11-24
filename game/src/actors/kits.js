// OWNER: W1
// Shared kit API. The player controller and allies both call this.
//
// firePrimary(ctx, actor, aimX, aimY, dmgMul)
//   One volley if the weapon is ready. dmgMul, when finite, REPLACES the
//   default scale (allies otherwise use ALLY_DMG_MUL). Returns true if a
//   shot left the barrel.
// useSkill(ctx, actor, aimX, aimY, opts)
//   opts number → tap with that damage scale.
//   opts object → { held, down, dmgMul, dt }.
//   Omit opts for a tap. Hold Kimi's beam / GLM's shield by calling again
//   with { held: true, dt }.
// tickPrimary / tickSkill / allyPulse / moveMul stay for the current ally AI.
//
// INTEGRATOR: projectiles.applyHit does not read bullet.hitStopMs, so every
// connecting primary volley freezes the sim for the default 40ms. Pass
// bullet.hitStopMs through (0 = no stop) so the scatter gun doesn't hitch.
// Shield aim uses `atan2(aimY || 0, aimX || 1)`, which turns pure vertical
// aim 45° off. nudgeAim stores a tiny aimX so the arc matches the stick.

import { EVENTS } from '../core/contracts.js';
import { facingName } from '../core/input.js';
import { applyHit } from '../core/combat.js';
import { bi } from '../data/lines.js';
import * as projectiles from './projectiles.js';
import * as fx from './playerFx.js';
import { PLAYER, ALLY_DMG_MUL, ALLY_FIRE_SCALE, FLASK_MOVE, activeInner } from '../config/balance.js';

let shotSeq = 1;

const NAMES = {
  flurry: { zh: '专家鲸群', en: 'Mixture-of-Whales' },
  beam: { zh: '长上下文·暗月', en: 'Long-Context Dark Moon' },
  shield: { zh: '开源之盾', en: 'Open-Source Aegis' },
};

function callout(ctx, actor, pair, color) {
  fx.label(actor.x, actor.y - 36, bi(pair), color || '#f4f1ea');
}

function kitOf(actor) {
  return PLAYER[actor.kitId || actor.id] || PLAYER.deepseek;
}

function silenced(ctx) {
  return (ctx.flags?.skillSilence || 0) > 0 || !!ctx.flags?.contentPolicySilence;
}

function scaleOf(actor, dmgMul) {
  if (dmgMul != null && Number.isFinite(Number(dmgMul))) return Number(dmgMul);
  return actor && actor.team === 'ally' ? ALLY_DMG_MUL : 1;
}

function unit(x, y) {
  const l = Math.hypot(x || 0, y || 0);
  if (l < 1e-6) return null;
  return { x: x / l, y: y / l };
}

/** Pure vertical aim breaks the shield test in projectiles.js. */
export function nudgeAim(actor) {
  if (!actor) return;
  const ax = actor.aimX || 0;
  const ay = actor.aimY || 0;
  if (Math.abs(ax) < 1e-6 && Math.abs(ay) > 1e-6) actor.aimX = 1e-4;
}

function lastAim(actor) {
  return {
    x: actor && Number.isFinite(actor.aimX) ? actor.aimX : 0,
    y: actor && Number.isFinite(actor.aimY) ? actor.aimY : -1,
  };
}

function park(ctx, actor) {
  if (ctx.world && typeof ctx.world.clamp === 'function') ctx.world.clamp(actor);
}

function busy(actor) {
  return !!(actor.rolling || actor.flaskT > 0 || actor.charging || actor.shield || actor.skillKind === 'flurry');
}

function canCast(actor) {
  if (!actor || actor.alive === false) return false;
  if ((actor.skillCd || 0) > 0) return false;
  if (actor.rolling || actor.flaskT > 0) return false;
  if (actor.skillKind === 'flurry' || actor.charging || actor.shield) return false;
  return true;
}

function emit(ctx, name, payload) {
  if (ctx.bus) ctx.bus.emit(name, payload);
}

/**
 * @param {import('../core/contracts.js').GameContext} ctx
 * @param {import('../core/contracts.js').Actor} actor
 * @param {number} aimX
 * @param {number} aimY
 * @param {number} [dmgMul]
 * @returns {boolean}
 */
export function firePrimary(ctx, actor, aimX, aimY, dmgMul) {
  if (!actor || actor.alive === false) return false;
  const aim = unit(aimX, aimY);
  if (!aim) return false;
  actor.aimX = aim.x;
  actor.aimY = aim.y;
  actor.facing = facingName(aim.x, aim.y);
  nudgeAim(actor);
  return shoot(ctx, actor, aim, dmgMul);
}

/**
 * @param {import('../core/contracts.js').GameContext} ctx
 * @param {import('../core/contracts.js').Actor} actor
 * @param {number} dt
 * @param {{fire?: boolean, aim?: {x:number,y:number}|null, dmgMul?: number}} ctrl
 */
export function tickPrimary(ctx, actor, dt, ctrl) {
  if (!actor) return false;
  actor.fireCd = Math.max(0, (actor.fireCd || 0) - dt);
  if (actor.muzzleT > 0) actor.muzzleT = Math.max(0, actor.muzzleT - dt);
  if (!ctrl || !ctrl.fire || !ctrl.aim) return false;
  return shoot(ctx, actor, ctrl.aim, ctrl.dmgMul);
}

function shoot(ctx, actor, aim, dmgMul) {
  if (busy(actor) || actor.fireCd > 0 || actor.alive === false) return false;
  const spec = kitOf(actor).primary;
  const scale = scaleOf(actor, dmgMul);
  const base = Math.atan2(aim.y, aim.x);
  const n = spec.pellets || 1;
  const spread = spec.spread || 0;
  for (let i = 0; i < n; i += 1) {
    const off = n === 1 ? 0 : -spread / 2 + (spread * i) / (n - 1);
    const ang = base + off;
    const speed = spec.speed;
    const mid = n > 1 && i === (n - 1) / 2;
    projectiles.spawn(ctx, {
      team: actor.team,
      ownerId: actor.id,
      x: actor.x + Math.cos(ang) * 10,
      y: actor.y - 6 + Math.sin(ang) * 10,
      vx: Math.cos(ang) * speed,
      vy: Math.sin(ang) * speed,
      r: spec.r || 3,
      dmg: spec.dmg * scale,
      // Safety timeout only. The pool culls on Euclidean displacement from spawn
      // (`maxRange`), so muzzle offset and wobble cannot shorten or stretch it.
      life: spec.range / speed + 2,
      maxRange: spec.range,
      shape: spec.shape,
      color: mid ? '#f4fbff' : spec.color,
      pierce: spec.pierce || 0,
      wobble: spec.wobble || 0,
      knock: spec.knock || 0,
      attackId: `shot-${shotSeq}`,
      onHit: (c, bullet) => onShotHit(c, bullet, spec),
    });
    shotSeq += 1;
  }
  actor.fireCd = 1 / spec.rate;
  if (actor.team === 'ally') actor.fireCd /= ALLY_FIRE_SCALE;
  actor.facing = facingName(aim.x, aim.y);
  fx.muzzle(actor, base, spec.color);
  emit(ctx, EVENTS.VFX, {
    kind: 'muzzle', x: actor.x + Math.cos(base) * 10, y: actor.y - 6 + Math.sin(base) * 10, ang: base, color: spec.color,
  });
  emit(ctx, EVENTS.SHOT_FIRED, { id: actor.id, team: actor.team, x: actor.x, y: actor.y });
  if (spec.kind === 'orb') {
    emit(ctx, EVENTS.VFX, { kind: 'ring', x: actor.x, y: actor.y - 6, r: 12, color: '#fff6c8', life: 0.18 });
    fx.ring(actor.x, actor.y - 6, 12, '#fff6c8', 0.16);
  }
  if (actor.team === 'player') ctx.audio?.playSfx(spec.kind === 'orb' ? 'sfx.star' : 'sfx.slash');
  return true;
}

function onShotHit(ctx, bullet, spec) {
  if (spec.kind === 'bolt') {
    fx.impact(bullet.x, bullet.y, '#e7c27a');
    fx.ring(bullet.x, bullet.y, 16, '#d8b15a', 0.22);
    emit(ctx, EVENTS.VFX, { kind: 'shock', x: bullet.x, y: bullet.y, r: 16, color: '#d8b15a' });
    emit(ctx, EVENTS.SHAKE, { mag: 2, dur: 0.06 });
  } else if (spec.kind === 'orb') {
    fx.impact(bullet.x, bullet.y, '#fff6c8');
    fx.ring(bullet.x, bullet.y, 14, '#fff6c8', 0.2);
  } else {
    fx.impact(bullet.x, bullet.y, spec.color || '#7ee0ff');
  }
}

function inBeam(ox, oy, cos, sin, reach, half, x, y, rad) {
  const dx = x - ox;
  const dy = y - oy;
  const along = dx * cos + dy * sin;
  const perp = Math.abs(-dx * sin + dy * cos);
  const r = rad || 0;
  return along > -r && along < reach + r && perp <= half + r;
}

function beamBody(ctx, actor) {
  const ang = actor.beamAng || 0;
  const ox = actor.x;
  const oy = actor.y - 8;
  const reach = actor.beamReach || 480;
  const half = (actor.beamW || 6) * 0.5;
  const cos = Math.cos(ang);
  const sin = Math.sin(ang);
  if (!actor.beamSpent) {
    const targets = [];
    if (ctx.boss && ctx.boss.alive) targets.push(ctx.boss);
    if (ctx.stele && ctx.stele.alive) targets.push(ctx.stele);
    for (let i = 0; i < targets.length; i += 1) {
      const tgt = targets[i];
      if (!inBeam(ox, oy, cos, sin, reach, half, tgt.x, tgt.y, tgt.r)) continue;
      applyHit(ctx, actor, tgt, actor.beamDmg || 0, {
        attackId: `beam-${actor.id}-${shotSeq}`,
        heavy: true,
        hitStopMs: 40 + Math.round((actor.beamRatio || 0) * 30),
        shake: 3 + (actor.beamRatio || 0) * 3,
      });
      shotSeq += 1;
    }
    actor.beamSpent = true;
  }
  projectiles.killWhere(ctx, (b) => {
    if (!b.alive || b.team !== 'boss') return false;
    return inBeam(ox, oy, cos, sin, reach, half, b.x, b.y, b.r);
  }, { color: '#d7f4ff' });
}

function tickBeam(ctx, actor, dt) {
  if (!(actor.beamT > 0)) return;
  actor.beamT = Math.max(0, actor.beamT - dt);
  beamBody(ctx, actor);
}

function endBeam(ctx, actor, aim, dmgMul) {
  const kit = kitOf(actor).skill;
  const held = Math.max(kit.chargeMin, Math.min(kit.chargeMax, actor.chargeT || kit.chargeMin));
  const span = Math.max(0.001, kit.chargeMax - kit.chargeMin);
  const ratio = Math.max(0, Math.min(1, (held - kit.chargeMin) / span));
  const scale = scaleOf(actor, dmgMul);
  const dmg = (kit.dmgMin + (kit.dmgMax - kit.dmgMin) * ratio) * scale;
  const width = kit.widthMin + (kit.widthMax - kit.widthMin) * ratio;
  const ang = Math.atan2(aim.y, aim.x);
  const ox = actor.x;
  const oy = actor.y - 8;
  const rect = activeInner(ctx.state ? ctx.state.current : 'fight');
  const end = fx.rayToWall(ox, oy, ang, rect);
  actor.charging = false;
  actor.chargeT = 0;
  actor.beamT = kit.dur;
  actor.beamAng = ang;
  actor.beamW = width;
  actor.beamDmg = dmg;
  actor.beamRatio = ratio;
  actor.beamReach = end.dist;
  actor.beamSpent = false;
  actor.skillCd = Math.max(actor.skillCd || 0, kit.cd || 0);
  actor.facing = facingName(aim.x, aim.y);
  ctx.audio?.stopSfx?.('sfx.charge');
  ctx.audio?.playSfx('sfx.beam');
  emit(ctx, EVENTS.SKILL_RELEASE, { id: actor.id, name: 'beam', ratio, zh: NAMES.beam.zh, en: NAMES.beam.en });
  callout(ctx, actor, NAMES.beam, '#d7f4ff');
  emit(ctx, EVENTS.VFX, {
    kind: 'beam', x: ox, y: oy, x2: end.x, y2: end.y, w: width + 8, color: '#d7f4ff', life: kit.dur,
  });
  emit(ctx, EVENTS.FLASH, { color: 'rgba(190,225,255,0.45)', dur: 0.1 });
  emit(ctx, EVENTS.SHAKE, { mag: 3 + ratio * 3, dur: 0.18 });
  fx.scorch(ox, oy, end.x, end.y);
  fx.edge('#d7f4ff', 0.12);
  beamBody(ctx, actor);
}

function cancelCharge(ctx, actor) {
  if (!actor.charging) return;
  actor.charging = false;
  actor.chargeT = 0;
  ctx.audio?.stopSfx?.('sfx.charge');
}

function startShield(ctx, actor) {
  const kit = kitOf(actor).skill;
  actor.shield = true;
  actor.shieldAge = 0;
  actor.perfectSpent = false;
  actor.perfectWindow = kit.perfect;
  actor.shieldArc = kit.arc;
  actor.perfectGuardT = kit.perfect;
  emit(ctx, EVENTS.GUARD_START, { id: actor.id });
  emit(ctx, EVENTS.SKILL_USED, { id: actor.id, name: 'shield', zh: NAMES.shield.zh, en: NAMES.shield.en });
  callout(ctx, actor, NAMES.shield, '#ffe08a');
  emit(ctx, EVENTS.VFX, {
    kind: 'shield_arc', x: actor.x, y: actor.y, ang: Math.atan2(actor.aimY || 0, actor.aimX || 1), arc: kit.arc, r: 30, color: '#e7c27a',
  });
  ctx.audio?.playSfx('sfx.guard');
}

function endShield(ctx, actor) {
  if (!actor.shield) return;
  const kit = kitOf(actor).skill;
  actor.shield = false;
  actor.perfectGuardT = 0;
  actor.skillCd = Math.max(actor.skillCd || 0, kit.cd || 0);
  emit(ctx, EVENTS.GUARD_END, { id: actor.id });
}

export function cancelChannel(ctx, actor) {
  cancelCharge(ctx, actor);
  endShield(ctx, actor);
}

function hitFlurry(ctx, actor, kit, mul, n, ang) {
  const radius = kit.radius;
  const targets = [];
  if (ctx.boss && ctx.boss.alive) targets.push(ctx.boss);
  if (ctx.stele && ctx.stele.alive) targets.push(ctx.stele);
  let landed = false;
  for (let i = 0; i < targets.length; i += 1) {
    const tgt = targets[i];
    if (Math.hypot(tgt.x - actor.x, tgt.y - actor.y) > radius + (tgt.r || 0)) continue;
    const applied = applyHit(ctx, actor, tgt, kit.dmg * mul, {
      attackId: `flurry-${actor.id}-${n}-${shotSeq}`,
      hitStopMs: 30,
      shake: 3,
    });
    shotSeq += 1;
    if (applied > 0) landed = true;
  }
  fx.arcSlash(actor.x, actor.y, ang, '#d7f4ff');
  emit(ctx, EVENTS.VFX, {
    kind: 'slash_arc', x: actor.x, y: actor.y, ang, r: radius, span: 1.35, color: '#d7f4ff', life: 0.4,
  });
  emit(ctx, EVENTS.SHAKE, { mag: 3, dur: 0.05 });
  if (landed) fx.impact(actor.x + Math.cos(ang) * 20, actor.y + Math.sin(ang) * 20, '#ffffff');
}

function beginFlurry(ctx, actor, aim, kit) {
  const u = unit(aim.x, aim.y) || lastAim(actor);
  const len = Math.hypot(u.x, u.y) || 1;
  const ux = u.x / len;
  const uy = u.y / len;
  actor.skillKind = 'flurry';
  actor.flurryN = 0;
  actor.dashUx = ux;
  actor.dashUy = uy;
  actor.flurryR = kit.radius;
  actor.skillCd = Math.max(actor.skillCd || 0, kit.cd || 0);
  actor.charging = false;
  actor.shield = false;
  actor.facing = facingName(ux, uy);
  if (actor.team !== 'player') {
    actor.dashFromX = actor.x;
    actor.dashFromY = actor.y;
    actor.x += ux * kit.dash;
    actor.y += uy * kit.dash;
    park(ctx, actor);
    actor.flurryPhase = 'arcs';
    actor.flurryT = 0;
    actor.invuln = Math.max(actor.invuln || 0, kit.iframe || 0.22);
  } else {
    actor.flurryPhase = 'dash';
    actor.flurryT = 0;
    actor.dashFromX = actor.x;
    actor.dashFromY = actor.y;
    actor.dashAcc = 12;
  }
  emit(ctx, EVENTS.SKILL_USED, { id: actor.id, name: 'flurry', zh: NAMES.flurry.zh, en: NAMES.flurry.en });
  callout(ctx, actor, NAMES.flurry, '#d7f4ff');
  emit(ctx, EVENTS.SHAKE, { mag: 3, dur: 0.12 });
  emit(ctx, EVENTS.FLASH, { color: 'rgba(180,230,255,0.3)', dur: 0.06 });
  emit(ctx, EVENTS.VFX, { kind: 'afterimage', x: actor.x, y: actor.y, color: '#d7f4ff', life: 0.2 });
  ctx.audio?.playSfx('sfx.slash');
  fx.ghost(actor.x, actor.y, '#d7f4ff');
  fx.dust(actor.x, actor.y);
}

function tickFlurry(ctx, actor, dt, kit, mul) {
  if (actor.flurryPhase === 'dash') {
    const dur = Math.max(0.05, kit.iframe || 0.22);
    actor.flurryT += dt;
    let step = dt;
    if (actor.flurryT > dur) {
      step = Math.max(0, dt - (actor.flurryT - dur));
      actor.flurryT = dur;
    }
    const speed = kit.dash / dur;
    actor.x += actor.dashUx * speed * step;
    actor.y += actor.dashUy * speed * step;
    actor.vx = actor.dashUx * speed;
    actor.vy = actor.dashUy * speed;
    const left = dur - actor.flurryT;
    if (left > 0) actor.invuln = Math.max(actor.invuln || 0, left);
    actor.dashAcc = (actor.dashAcc || 0) + speed * step;
    if (actor.dashAcc >= 10) {
      actor.dashAcc -= 10;
      fx.ghost(actor.x, actor.y, '#d7f4ff');
      emit(ctx, EVENTS.VFX, { kind: 'afterimage', x: actor.x, y: actor.y, color: '#d7f4ff', life: 0.16 });
    }
    park(ctx, actor);
    if (actor.flurryT >= dur) {
      actor.flurryPhase = 'arcs';
      actor.flurryT = 0;
      actor.flurryN = 0;
      actor.vx = 0;
      actor.vy = 0;
      fx.ring(actor.x, actor.y, 16, '#d7f4ff', 0.2);
      fx.dust(actor.x, actor.y);
    }
    return;
  }
  actor.flurryT += dt;
  const stepT = kit.arcTime / kit.arcs;
  const base = Math.atan2(actor.dashUy || -1, actor.dashUx || 0);
  while (actor.flurryN < kit.arcs && actor.flurryT + 1e-6 >= actor.flurryN * stepT) {
    const n = actor.flurryN;
    const ang = base + (Math.PI * 2 * n) / kit.arcs;
    hitFlurry(ctx, actor, kit, mul, n, ang);
    actor.flurryN = n + 1;
  }
  if (actor.flurryN >= kit.arcs && actor.flurryT >= kit.arcTime) {
    actor.skillKind = '';
    actor.vx = 0;
    actor.vy = 0;
  }
}

/**
 * @param {import('../core/contracts.js').GameContext} ctx
 * @param {import('../core/contracts.js').Actor} actor
 * @param {number} dt
 * @param {{aim?: {x:number,y:number}|null, skillHeld?: boolean, skillDown?: boolean, dmgMul?: number}} [ctrl]
 */
export function tickSkill(ctx, actor, dt, ctrl) {
  if (!actor) return;
  const kit = kitOf(actor).skill;
  const mul = scaleOf(actor, ctrl && ctrl.dmgMul);
  actor.skillCd = Math.max(0, (actor.skillCd || 0) - dt);
  nudgeAim(actor);
  tickBeam(ctx, actor, dt);
  if (actor.skillKind === 'flurry') tickFlurry(ctx, actor, dt, kit, mul);

  if (silenced(ctx)) {
    cancelCharge(ctx, actor);
    if (actor.shield) endShield(ctx, actor);
    if (ctrl && ctrl.skillDown) {
      fx.label(actor.x, actor.y - 26, bi({ zh: '沉默', en: 'SILENCED' }), '#ffb4c8');
    }
    return;
  }
  if (!ctrl) return;
  const aim = ctrl.aim || lastAim(actor);

  if (kit.kind === 'beam') {
    if (actor.charging) {
      actor.chargeT += dt;
      const ratio = Math.max(0, Math.min(1, actor.chargeT / kit.chargeMax));
      emit(ctx, EVENTS.SKILL_CHARGE, { id: actor.id, t: actor.chargeT, ratio });
      actor.chargePing = (actor.chargePing || 0) + dt;
      if (actor.chargePing >= 0.08) {
        actor.chargePing = 0;
        emit(ctx, EVENTS.VFX, {
          kind: 'charge', x: actor.x, y: actor.y - 8, t: actor.chargeT, ratio, color: '#d7f4ff',
        });
      }
      const maxed = actor.chargeT >= kit.chargeMax;
      const released = !ctrl.skillHeld;
      if (maxed || (released && actor.chargeT >= kit.chargeMin)) endBeam(ctx, actor, aim, ctrl.dmgMul);
      else if (released) cancelCharge(ctx, actor);
      return;
    }
    if (ctrl.skillDown && canCast(actor)) {
      actor.charging = true;
      actor.chargeT = 0;
      actor.chargeMax = kit.chargeMax;
      actor.chargePing = 0;
      ctx.audio?.playSfx('sfx.charge');
      emit(ctx, EVENTS.SKILL_CHARGE, { id: actor.id, t: 0, ratio: 0 });
    }
    return;
  }

  if (kit.kind === 'shield') {
    if (actor.shield) {
      actor.shieldAge = (actor.shieldAge || 0) + dt;
      const left = (kit.perfect || 0.2) - actor.shieldAge;
      actor.perfectGuardT = left > 0 ? left : 0;
      if (!ctrl.skillHeld || actor.shieldAge >= kit.hold) endShield(ctx, actor);
      return;
    }
    if (ctrl.skillDown && canCast(actor)) startShield(ctx, actor);
    return;
  }

  if (kit.kind === 'flurry') {
    if (!ctrl.skillDown || !canCast(actor) || actor.skillKind === 'flurry') return;
    beginFlurry(ctx, actor, aim, kit);
  }
}

/**
 * @param {import('../core/contracts.js').GameContext} ctx
 * @param {import('../core/contracts.js').Actor} actor
 * @param {number} aimX
 * @param {number} aimY
 * @param {number|{held?: boolean, down?: boolean, dmgMul?: number, dt?: number}} [opts]
 */
export function useSkill(ctx, actor, aimX, aimY, opts) {
  if (!actor) return;
  const aim = unit(aimX, aimY) || lastAim(actor);
  actor.aimX = aim.x;
  actor.aimY = aim.y;
  let held = false;
  let down = true;
  let dmgMul;
  let dt = 0;
  if (typeof opts === 'number') dmgMul = opts;
  else if (opts && typeof opts === 'object') {
    held = !!opts.held;
    down = opts.down !== undefined ? !!opts.down : !held;
    if (opts.dmgMul != null) dmgMul = opts.dmgMul;
    dt = Number(opts.dt) || 0;
  }
  tickSkill(ctx, actor, dt, { aim, skillHeld: held, skillDown: down, dmgMul });
}

export function moveMul(actor) {
  if (!actor) return 1;
  if (actor.flaskT > 0) return FLASK_MOVE;
  const skill = kitOf(actor).skill;
  if (actor.charging) return skill.move || 0.4;
  if (actor.shield) return skill.move || 0.5;
  if (actor.skillKind === 'flurry') return 0;
  return 1;
}

/** Ally instant: a short version of the skill. The ally AI sets the long CD. */
export function allyPulse(ctx, actor, aim) {
  if (!actor || silenced(ctx)) return;
  const kit = kitOf(actor).skill;
  const a = aim || lastAim(actor);
  actor.aimX = a.x;
  actor.aimY = a.y;
  nudgeAim(actor);
  if (kit.kind === 'flurry') {
    tickSkill(ctx, actor, 0, { aim: a, skillDown: true, skillHeld: false });
  } else if (kit.kind === 'beam') {
    actor.charging = true;
    actor.chargeT = kit.chargeMax;
    actor.chargeMax = kit.chargeMax;
    endBeam(ctx, actor, a);
  } else if (kit.kind === 'shield') {
    startShield(ctx, actor);
  }
}

export function init() {}
export function update() {}
export function reset() {}
