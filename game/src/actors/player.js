// OWNER: W1
// Move, dodge-roll, primary fire, one skill, GPU flasks.
// Kits own the attack shapes. This file owns the body and the flask risk.
//
// INTEGRATOR: call player.render(ctx, g) in the internal buffer after actors
// and before vfx, then set ctx.flags.playerFxExternal = true.
// Until then player.init paints skill geometry onto #view after the blit.
// Spawn uses activeInner(), so a 640×360 room move in balance.js is enough
// for feet placement. Pointer default and overlay clip read VIEW_W/H too.

import { EVENTS } from '../core/contracts.js';
import { facingName } from '../core/input.js';
import { bi } from '../data/lines.js';
import { getCharacter } from './characters.js';
import { tickPrimary, tickSkill, moveMul, cancelChannel, nudgeAim } from './kits.js';
import * as fx from './playerFx.js';
import * as skillReadyCue from '../ui/skillReadyCue.js';
import * as projectiles from './projectiles.js';
import {
  HURT_R, HURT_IFRAME, ROLL, FLASK_TIME, FLASKS, FLASK_ORDER, PLAYER, MOVE_RESP, activeInner,
} from '../config/balance.js';

/** Seconds left. 0 means that GPU can be used. Independent clocks. */
export function freshGpuCooldowns() {
  return { rtx5090: 0, h200: 0, b200: 0 };
}

function tickGpuCooldowns(actor, dt) {
  const cds = actor.gpuCooldowns;
  if (!cds || !(dt > 0)) return;
  for (let i = 0; i < FLASK_ORDER.length; i += 1) {
    const id = FLASK_ORDER[i];
    const v = Number(cds[id]) || 0;
    cds[id] = v > dt ? v - dt : 0;
  }
}

function unit(x, y) {
  const l = Math.hypot(x || 0, y || 0);
  if (l < 1e-6) return null;
  return { x: x / l, y: y / l };
}

function approachVec(vx, vy, tx, ty, dt, accel) {
  const dx = tx - vx;
  const dy = ty - vy;
  const dist = Math.hypot(dx, dy);
  const max = accel * dt;
  if (dist <= max || dist < 1e-6) return { x: tx, y: ty };
  const s = max / dist;
  return { x: vx + dx * s, y: vy + dy * s };
}

function place(actor, where) {
  const rect = activeInner(where === 'intro' ? 'intro' : 'fight');
  actor.x = rect.x + rect.w * 0.5;
  actor.y = rect.y + rect.h * (where === 'intro' ? 0.68 : 0.82);
}

export function spawn(ctx, id, where) {
  const key = getCharacter(id).id;
  const stats = PLAYER[key];
  const actor = {
    id: key,
    team: 'player',
    kitId: key,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    r: HURT_R,
    hp: stats.hp,
    maxHp: stats.hp,
    alive: true,
    invuln: 0,
    facing: 'n',
    sprite: `px.${key}`,
    rolling: false,
    rollT: 0,
    rollCd: 0,
    rollX: 0,
    rollY: -1,
    flaskId: 'rtx5090',
    gpuCooldowns: freshGpuCooldowns(),
    gpuArm: true,
    flaskT: 0,
    flaskPending: null,
    fireCd: 0,
    skillCd: 0,
    aimX: 0,
    aimY: -1,
    stamina: 100,
    staminaMax: 100,
    superarmor: 0,
    superarmorMul: 0.6,
    flash: 0,
    pose: '',
    hurtLog: {},
    hurtT: 0,
    charging: false,
    shield: false,
    skillKind: '',
    perfectGuardT: 0,
  };
  place(actor, where);
  actor.onHit = (info) => onHurt(ctx, actor, info);
  ctx.player = actor;
  ctx.world?.clamp?.(actor);
  fx.clear();
  skillReadyCue.clear();
  return actor;
}

function onHurt(ctx, actor, info) {
  if (!info || !(info.applied > 0)) return;
  actor.hurtT = HURT_IFRAME;
  fx.edge('#c23b3b', 0.2);
  fx.impact(actor.x, actor.y, '#ff5a6a');
  if (actor.flaskT > 0) {
    const type = actor.flaskPending || actor.flaskId;
    actor.flaskT = 0;
    actor.flaskPending = null;
    ctx.bus.emit(EVENTS.FLASK_INTERRUPTED, { type, id: actor.id });
    fx.label(actor.x, actor.y - 24, bi({ zh: '打断', en: 'WASTED' }), '#ff8a8a');
    fx.ring(actor.x, actor.y, 18, '#ff5a6a', 0.28);
  }
  if (!actor.alive) {
    actor.rolling = false;
    actor.skillKind = '';
    actor.charging = false;
    actor.shield = false;
    actor.vx = 0;
    actor.vy = 0;
    actor.pose = 'down';
    fx.ring(actor.x, actor.y, 36, '#c23b3b', 0.45);
  }
}

function selectFlask(actor, input) {
  let next = '';
  if (input.pressed('1')) next = FLASK_ORDER[0];
  else if (input.pressed('2')) next = FLASK_ORDER[1];
  else if (input.pressed('3')) next = FLASK_ORDER[2];
  if (!next || next === actor.flaskId) return;
  actor.flaskId = next;
  const tag = next === 'rtx5090' ? 'RTX' : next.toUpperCase();
  fx.label(actor.x, actor.y - 22, tag, '#b8ffd0');
}

function tryFlask(ctx, actor, input) {
  selectFlask(actor, input);
  const qHeld = input.held('q') || input.held('r');
  const qEdge = input.pressed('q') || input.pressed('r');
  if (!qHeld) actor.gpuArm = true;
  if (!qEdge || !actor.gpuArm) return;
  actor.gpuArm = false;
  if (actor.flaskT > 0 || actor.rolling || actor.skillKind === 'flurry') return;
  const id = actor.flaskId;
  const cds = actor.gpuCooldowns || (actor.gpuCooldowns = freshGpuCooldowns());
  if ((cds[id] || 0) > 0) return;
  if (actor.charging) cancelChannel(ctx, actor);
  cds[id] = FLASKS[id]?.cd || 0;
  actor.flaskT = FLASK_TIME;
  actor.flaskPending = id;
  ctx.bus.emit(EVENTS.FLASK_USED, { type: id, id: actor.id });
  ctx.audio?.playSfx(FLASKS[id].sfx || 'sfx.flask');
  ctx.bus.emit(EVENTS.VFX, {
    kind: 'heal_pillar', x: actor.x, y: actor.y, color: id === 'b200' ? '#ffe08a' : '#7dffb0', h: 72,
  });
  fx.dust(actor.x, actor.y);
}

function finishFlask(ctx, actor) {
  const id = actor.flaskPending;
  actor.flaskPending = null;
  actor.flaskT = 0;
  if (!id || !actor.alive) return;
  const spec = FLASKS[id];
  if (!spec) return;
  actor.hp = Math.min(actor.maxHp, actor.hp + actor.maxHp * spec.heal);
  if (spec.clearR) {
    projectiles.clear(ctx, 'boss', {
      sparks: true,
      near: { x: actor.x, y: actor.y, r: spec.clearR },
      color: '#9dff9a',
    });
    fx.ring(actor.x, actor.y, spec.clearR, '#9dff9a', 0.4);
  }
  if (spec.superarmor) {
    actor.superarmor = spec.superarmor;
    actor.superarmorMul = spec.armor == null ? 0.6 : spec.armor;
  }
  ctx.audio?.playSfx('sfx.heal');
  const color = id === 'b200' ? '#ffe08a' : '#9dff9a';
  ctx.bus.emit(EVENTS.VFX, { kind: 'heal_pillar', x: actor.x, y: actor.y, color, h: 88 });
  ctx.bus.emit(EVENTS.VFX, { kind: 'shockwave', x: actor.x, y: actor.y, r: spec.clearR || 32, color });
  ctx.bus.emit(EVENTS.SHAKE, { mag: id === 'b200' ? 4 : 2, dur: 0.16 });
  ctx.bus.emit(EVENTS.FLASH, {
    color: id === 'b200' ? 'rgba(255,214,120,0.4)' : 'rgba(130,255,170,0.32)',
    dur: 0.1,
  });
  fx.ring(actor.x, actor.y, id === 'b200' ? 46 : 26, color, 0.35);
  const healWord = id === 'b200'
    ? bi({ zh: '满血', en: 'FULL' })
    : bi({ zh: '治疗', en: 'HEAL' });
  fx.label(actor.x, actor.y - 28, healWord, '#e7ffd8');
}

function rollVector(actor, move, aim) {
  if (move) return move;
  if (aim) return aim;
  const last = unit(actor.aimX, actor.aimY);
  return last || { x: 0, y: -1 };
}

function startRoll(ctx, actor, dir) {
  cancelChannel(ctx, actor);
  actor.rolling = true;
  actor.rollT = 0;
  actor.rollX = dir.x;
  actor.rollY = dir.y;
  actor.rollAcc = 8;
  actor.dustT = 0;
  actor.facing = facingName(dir.x, dir.y);
  ctx.bus.emit(EVENTS.ROLL_START, { id: actor.id });
  ctx.audio?.playSfx('sfx.roll');
  fx.ghost(actor.x, actor.y, (PLAYER[actor.id] && PLAYER[actor.id].accent) || '#f4f1ea');
  fx.dust(actor.x, actor.y);
}

function integrateRoll(ctx, actor, dt) {
  actor.rollT += dt;
  let step = dt;
  if (actor.rollT > ROLL.duration) {
    step = Math.max(0, dt - (actor.rollT - ROLL.duration));
    actor.rollT = ROLL.duration;
  }
  const sp = ROLL.distance / ROLL.duration;
  actor.vx = actor.rollX * sp;
  actor.vy = actor.rollY * sp;
  actor.x += actor.rollX * sp * step;
  actor.y += actor.rollY * sp * step;
  actor.facing = facingName(actor.rollX, actor.rollY);
  if (actor.rollT >= ROLL.iframeStart && actor.rollT <= ROLL.iframeEnd) {
    actor.invuln = Math.max(actor.invuln || 0, ROLL.iframeEnd - actor.rollT);
  }
  actor.rollAcc = (actor.rollAcc || 0) + sp * step;
  if (actor.rollAcc >= 8) {
    actor.rollAcc -= 8;
    const col = (PLAYER[actor.id] && PLAYER[actor.id].accent) || '#f4f1ea';
    fx.ghost(actor.x, actor.y, col);
    ctx.bus.emit(EVENTS.VFX, { kind: 'afterimage', x: actor.x, y: actor.y, color: col, life: 0.18 });
  }
  actor.dustT = (actor.dustT || 0) - step;
  if (actor.dustT <= 0) {
    actor.dustT = 0.08;
    fx.dust(actor.x, actor.y);
    ctx.bus.emit(EVENTS.VFX, { kind: 'dust', x: actor.x, y: actor.y, color: '#d9d0c1' });
  }
  if (actor.rollT >= ROLL.duration) {
    actor.rolling = false;
    actor.rollCd = ROLL.cooldown;
    actor.vx = 0;
    actor.vy = 0;
    fx.dust(actor.x, actor.y);
    ctx.bus.emit(EVENTS.ROLL_END, { id: actor.id });
  }
}

function integrateMove(actor, move, dt) {
  const base = (PLAYER[actor.id] && PLAYER[actor.id].speed) || 100;
  const speed = base * moveMul(actor);
  const tx = move ? move.x * speed : 0;
  const ty = move ? move.y * speed : 0;
  const accel = base / MOVE_RESP;
  const next = approachVec(actor.vx || 0, actor.vy || 0, tx, ty, dt, accel);
  actor.vx = next.x;
  actor.vy = next.y;
  actor.x += actor.vx * dt;
  actor.y += actor.vy * dt;
}

function syncMeters(actor) {
  const skill = PLAYER[actor.id] && PLAYER[actor.id].skill;
  const maxCd = (skill && skill.cd) || 6;
  actor.staminaMax = 100;
  if (actor.shield && skill && skill.hold) {
    actor.stamina = Math.max(0, (1 - (actor.shieldAge || 0) / skill.hold) * 100);
  } else if (actor.charging && skill && skill.chargeMax) {
    actor.stamina = Math.max(0, Math.min(100, ((actor.chargeT || 0) / skill.chargeMax) * 100));
  } else if (actor.skillCd > 0) {
    actor.stamina = Math.max(0, (1 - actor.skillCd / maxCd) * 100);
  } else {
    actor.stamina = 100;
  }
  if (!actor.alive) actor.pose = 'down';
  else if (actor.rolling || (actor.skillKind === 'flurry' && actor.flurryPhase === 'dash')) actor.pose = 'roll';
  else if (actor.flaskT > 0) actor.pose = 'flask';
  else if (actor.shield) actor.pose = 'shield';
  else if (actor.charging) actor.pose = 'charge';
  else if (actor.skillKind === 'flurry') actor.pose = 'flurry';
  else actor.pose = '';
}

export function update(ctx, dt) {
  fx.tick(dt);
  const actor = ctx.player;
  if (!actor) return;
  if (!actor.gpuCooldowns) actor.gpuCooldowns = freshGpuCooldowns();
  tickGpuCooldowns(actor, dt);
  if (actor.invuln > 0) actor.invuln = Math.max(0, actor.invuln - dt);
  if (actor.superarmor > 0) actor.superarmor = Math.max(0, actor.superarmor - dt);
  if (actor.rollCd > 0 && !actor.rolling) actor.rollCd = Math.max(0, actor.rollCd - dt);
  if (actor.hurtT > 0) {
    actor.hurtT = Math.max(0, actor.hurtT - dt);
    if (Math.floor(actor.hurtT * 16) % 2 === 0) actor.flash = Math.max(actor.flash || 0, 0.09);
  }
  if (!actor.alive) {
    actor.vx = 0;
    actor.vy = 0;
    actor.pose = 'down';
    return;
  }

  const locked = !!ctx.flags?.inputLocked;
  const input = ctx.input;
  let mx = 0;
  let my = 0;
  if (!locked && input) {
    if (input.held('w') || input.held('W')) my -= 1;
    if (input.held('s') || input.held('S')) my += 1;
    if (input.held('a') || input.held('A')) mx -= 1;
    if (input.held('d') || input.held('D')) mx += 1;
  }
  const move = unit(mx, my);
  const aim = !locked && input ? input.aimVector(actor) : null;
  if (aim) {
    actor.aimX = aim.x;
    actor.aimY = aim.y;
    actor.facing = facingName(aim.x, aim.y);
  } else if (move) {
    actor.facing = facingName(move.x, move.y);
  }
  nudgeAim(actor);

  if (!locked && input) tryFlask(ctx, actor, input);
  if (actor.flaskT > 0) {
    actor.flaskT -= dt;
    if (actor.flaskT <= 0) finishFlask(ctx, actor);
  }

  const skillHeld = !locked && !!input && (input.held('shift') || input.held('e') || input.held('rmb'));
  const skillDown = !locked && !!input && (input.pressed('shift') || input.pressed('e') || input.pressed('rmb'));
  const wantRoll = !locked && !!input && input.pressed('space');
  if (wantRoll && !actor.rolling && actor.flaskT <= 0 && actor.rollCd <= 0 && actor.skillKind !== 'flurry') {
    startRoll(ctx, actor, rollVector(actor, move, aim));
  }

  // aimY of 0 is a real horizontal aim. `|| -1` turned left/right fire into a diagonal.
  const aimVec = {
    x: Number.isFinite(actor.aimX) ? actor.aimX : 0,
    y: Number.isFinite(actor.aimY) ? actor.aimY : -1,
  };
  const prevSkillCd = actor.skillCd || 0;
  tickSkill(ctx, actor, dt, {
    aim: aimVec,
    skillHeld: skillHeld && !actor.rolling,
    skillDown: skillDown && !actor.rolling,
  });
  skillReadyCue.onCooldownTick(ctx, actor, prevSkillCd, dt);

  if (actor.rolling) integrateRoll(ctx, actor, dt);
  else if (actor.skillKind === 'flurry') {
    if (actor.flurryPhase !== 'dash') {
      actor.vx = 0;
      actor.vy = 0;
    }
  } else {
    integrateMove(actor, move, dt);
  }
  ctx.world?.clamp?.(actor);
  tickPrimary(ctx, actor, dt, { fire: !!aim && !locked, aim: aim ? aimVec : null });
  syncMeters(actor);
}

export function render(ctx, g) {
  fx.render(ctx, g);
}

export function despawn(ctx) {
  ctx.player = null;
  fx.clear();
  skillReadyCue.clear();
}

export function init(ctx) {
  fx.install(ctx);
}

export function reset(ctx) {
  const actor = ctx?.player;
  fx.clear();
  skillReadyCue.clear();
  if (!actor) return;
  actor.hp = actor.maxHp;
  actor.alive = true;
  actor.gpuCooldowns = freshGpuCooldowns();
  actor.gpuArm = true;
  actor.flaskT = 0;
  actor.flaskPending = null;
  actor.skillCd = 0;
  actor.fireCd = 0;
  actor.rolling = false;
  actor.rollCd = 0;
  actor.superarmor = 0;
  actor.skillKind = '';
  actor.shield = false;
  actor.charging = false;
  actor.beamT = 0;
  actor.invuln = 0;
  actor.hurtT = 0;
  actor.pose = '';
  actor.vx = 0;
  actor.vy = 0;
}
