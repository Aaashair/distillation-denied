// OWNER: W2 (combat) / W4 (Claude combat text hooks)
// One boss, three phases, 25% lock → ending B once.
// Haiku hops, Sonnet glides, Opus floats and blinks between patterns.
// The phase change is a 2.5s beat on the wall clock (tickReal).

import { EVENTS } from '../core/contracts.js';
import { applyHit } from '../core/combat.js';
import { BANNERS } from '../data/lines.js';
import * as patterns from './patterns.js';
import * as telegraph from './telegraph.js';
import * as claudeCombat from '../ui/claude.js';
import * as projectiles from '../actors/projectiles.js';
import {
  BOSS_MAX_HP, PHASE_P2_AT, PHASE_P3_AT, ENDING_B_RATIO, PHASE_INVULN,
  PHASE_PUSH, PHASE_SLOWMO, PHASE_SLOW_SCALE, BOSS_RADIUS,
  OPENING_DELAY, PATTERN_POOL, CONTACT_DMG, JUDGMENT_FIRST, JUDGMENT_INTERVAL,
  ACCEL_AT, MOVE, ROOM, innerOf, clampTo,
} from '../config/balance.js';

function syncDistill(ctx, boss) {
  const ratio = boss.maxHp > 0 ? boss.hp / boss.maxHp : 1;
  const value = Math.max(0, Math.min(90, ((1 - ratio) / (1 - ENDING_B_RATIO)) * 90));
  ctx.distill = value;
  ctx.bus.emit(EVENTS.DISTILL_PROGRESS, { value });
}

function emitHp(ctx, boss) {
  ctx.bus.emit(EVENTS.BOSS_HP, {
    ratio: boss.maxHp > 0 ? boss.hp / boss.maxHp : 0,
    hp: boss.hp,
    maxHp: boss.maxHp,
  });
}

function pushActors(ctx, boss) {
  const list = [];
  if (ctx.player) list.push(ctx.player);
  const allies = ctx.allies || [];
  for (let i = 0; i < allies.length; i += 1) list.push(allies[i]);
  for (let i = 0; i < list.length; i += 1) {
    const a = list[i];
    if (!a) continue;
    const dx = a.x - boss.x;
    const dy = a.y - boss.y;
    const len = Math.hypot(dx, dy) || 1;
    a.x += (dx / len) * PHASE_PUSH;
    a.y += (dy / len) * PHASE_PUSH;
    ctx.world?.clamp?.(a);
  }
}

function facePoint(boss, x, y) {
  const ang = Math.atan2(y - boss.y, x - boss.x);
  if (!Number.isFinite(ang)) return;
  boss.aimAng = ang;
  const names = ['e', 'se', 's', 'sw', 'w', 'nw', 'n', 'ne'];
  boss.facing = names[(Math.round(ang / (Math.PI / 4)) + 8) % 8];
}

/** Keep the sprite's top on the 640×360 plate. Feet stay the hurtbox anchor. */
function bossFloor(boss) {
  const inner = innerOf(ROOM);
  const phase = (boss && boss.phase) || 1;
  const top = phase >= 3 ? 56 : phase === 2 ? 22 : 4;
  const y = inner.y + top;
  return { x: inner.x, y, w: inner.w, h: Math.max(36, inner.h - top) };
}

function pickSpot(ctx, boss, band0, band1) {
  const tgt = patterns.focus(ctx, boss);
  const inner = bossFloor(boss);
  if (!tgt) return { x: inner.x + inner.w / 2, y: inner.y + inner.h / 2 };
  let best = null;
  let bestScore = -1;
  for (let i = 0; i < 8; i += 1) {
    const ang = Math.random() * Math.PI * 2;
    const dist = band0 + Math.random() * Math.max(0, band1 - band0);
    const p = { x: tgt.x + Math.cos(ang) * dist, y: tgt.y + Math.sin(ang) * dist, r: boss.r };
    clampTo(p, inner);
    const score = Math.hypot(p.x - tgt.x, p.y - tgt.y);
    if (score > bestScore) {
      bestScore = score;
      best = p;
    }
  }
  return best;
}

function stepHop(boss, dt) {
  const h = boss.hop;
  if (!h) return;
  h.t += dt;
  const k = Math.min(1, h.t / h.dur);
  const e = 1 - (1 - k) * (1 - k);
  boss.x = h.x0 + (h.x1 - h.x0) * e;
  boss.y = h.y0 + (h.y1 - h.y0) * e - Math.sin(k * Math.PI) * h.arc;
  boss.vx = (h.x1 - h.x0) / h.dur;
  boss.vy = (h.y1 - h.y0) / h.dur;
  clampTo(boss, bossFloor(boss));
  if (k >= 1) {
    boss.hop = null;
    boss.vx = 0;
    boss.vy = 0;
  }
}

function moveBoss(ctx, boss, dt) {
  if (boss.cast || boss.dashing || boss.rooted) return;
  if (boss.phase === 1) {
    const mv = MOVE[1];
    if (!boss.hop && !boss.hoppedThisGap && boss.gap > 0.15) {
      const spot = pickSpot(ctx, boss, mv.band0, mv.band1);
      boss.hoppedThisGap = true;
      if (spot && Math.hypot(spot.x - boss.x, spot.y - boss.y) > 22) {
        boss.hop = {
          t: 0, dur: mv.hop, x0: boss.x, y0: boss.y, x1: spot.x, y1: spot.y, arc: mv.hopArc,
        };
      }
    }
    stepHop(boss, dt);
    return;
  }
  const mv = MOVE[boss.phase] || MOVE[2];
  if (!boss.goal || boss.goalT <= 0) {
    boss.goal = pickSpot(ctx, boss, mv.band0, mv.band1);
    boss.goalT = boss.phase === 3 ? 0.95 : 1.2;
    if (boss.goal && boss.phase === 3 && Math.random() < (mv.blink || 0)) {
      const ox = boss.x;
      const oy = boss.y;
      boss.x = boss.goal.x;
      boss.y = boss.goal.y;
      clampTo(boss, bossFloor(boss));
      boss.blink = 0.22;
      ctx.bus.emit(EVENTS.VFX, { kind: 'shock', x: ox, y: oy, r: 18, color: '#d8b15a' });
      ctx.bus.emit(EVENTS.VFX, { kind: 'shock', x: boss.x, y: boss.y, r: 28, color: '#f4f1ea' });
      ctx.bus.emit(EVENTS.FLASH, { color: 'rgba(244,241,234,0.35)', dur: 0.06 });
      return;
    }
  }
  boss.goalT -= dt;
  if (!boss.goal) return;
  const dx = boss.goal.x - boss.x;
  const dy = boss.goal.y - boss.y;
  const dist = Math.hypot(dx, dy) || 1;
  const step = Math.min(dist, (mv.speed || 60) * dt);
  boss.x += (dx / dist) * step;
  boss.y += (dy / dist) * step;
  if (boss.phase === 3) boss.y += Math.sin((ctx.time?.elapsed || 0) * 3.2) * (mv.bob || 12) * dt;
  boss.vx = dist > 4 ? (dx / dist) * (mv.speed || 60) : 0;
  boss.vy = dist > 4 ? (dy / dist) * (mv.speed || 60) : 0;
  clampTo(boss, bossFloor(boss));
}

function baseFx(boss) {
  return {
    halo: boss.phase === 2,
    haloAng: boss.haloAng || 0,
    wings: 0,
    sword: null,
    chain: null,
    spin: 0,
    arms: 0,
    windup: false,
    hurt: false,
    accel: !!boss.accelOn,
    morph: boss.beat ? boss.beat.t : 0,
    blink: boss.blink || 0,
  };
}

function syncLook(ctx, boss) {
  const telling = telegraph.active().some((t) => t && t.alive);
  if ((boss.flash || 0) > 0.02) boss.pose = 'hurt';
  else if (boss.beat) boss.pose = 'attack';
  else if (boss.cast && telling) boss.pose = 'windup';
  else if (boss.cast || boss.dashing || boss.hop) boss.pose = 'attack';
  else boss.pose = 'idle';
  const posed = `px.boss.p${boss.phase}.${boss.pose}`;
  const img = ctx.assets && ctx.assets.image ? ctx.assets.image(posed) : null;
  if (img && img.complete && img.naturalWidth > 0) boss.sprite = posed;
  else boss.sprite = `px.boss.p${boss.phase}`;
  if (!boss.fx) boss.fx = baseFx(boss);
  boss.fx.windup = boss.pose === 'windup';
  boss.fx.hurt = boss.pose === 'hurt';
  boss.fx.accel = !!boss.accelOn;
  boss.fx.halo = boss.phase === 2;
  boss.fx.haloAng = boss.haloAng || 0;
  boss.fx.morph = boss.beat ? boss.beat.t : 0;
  boss.fx.blink = boss.blink || 0;
}

function hideCallout() {
  /* attack toast handled by ui/claude.js */
}

function cleanupInstant(ctx, boss) {
  if (boss.beat) {
    ctx.time.setScale(boss.savedScale || (ctx.debug && ctx.debug.timeScale) || 1);
  }
  boss.beat = null;
  boss.transition = 0;
  boss.invuln = 0;
  boss.cast = null;
  boss.rooted = false;
  boss.dashing = false;
  boss.hop = null;
  boss.hazards = [];
  boss.swings = [];
  boss.pinned = [];
  boss.vx = 0;
  boss.vy = 0;
  telegraph.reset();
}

export function createBoss(ctx) {
  const boss = {
    id: 'claude',
    team: 'boss',
    x: ROOM.x + ROOM.w / 2,
    y: ROOM.y + 78,
    vx: 0,
    vy: 0,
    r: BOSS_RADIUS[1],
    hp: BOSS_MAX_HP,
    maxHp: BOSS_MAX_HP,
    alive: true,
    invuln: 0,
    facing: 's',
    sprite: 'px.boss.p1',
    phase: 1,
    lockHpAt25: false,
    _ended: false,
    cast: null,
    rooted: false,
    dashing: false,
    gap: OPENING_DELAY,
    lastPat: '',
    transition: 0,
    savedScale: 1,
    beat: null,
    p3At: 0,
    p3Clock: false,
    didFirstSmite: false,
    lastSmiteAt: -999,
    flash: 0,
    pose: 'idle',
    hurtLog: {},
    hazards: [],
    pinned: [],
    swings: [],
    hop: null,
    hoppedThisGap: false,
    goal: null,
    goalT: 0,
    blink: 0,
    haloAng: 0,
    aimAng: Math.PI / 2,
    aimTarget: null,
    targetId: '',
    targetStreak: 0,
    accelOn: false,
    script: '',
    callout: null,
    fx: null,
  };

  boss.onHit = (info) => {
    boss.pose = 'hurt';
    boss.flash = Math.max(boss.flash || 0, 0.14);
    if (info && info.heavy) {
      ctx.bus.emit(EVENTS.VFX, { kind: 'spark', x: boss.x, y: boss.y - 18, color: '#e7c27a' });
    }
  };

  function startTransition(phase) {
    if (boss.transition > 0 || boss._ended) return;
    const from = boss.phase;
    boss.phase = phase;
    boss.r = BOSS_RADIUS[phase];
    boss.sprite = `px.boss.p${phase}`;
    boss.transition = PHASE_INVULN;
    boss.invuln = PHASE_INVULN;
    boss.cast = null;
    boss.rooted = true;
    boss.dashing = false;
    boss.hop = null;
    boss.hazards = [];
    boss.swings = [];
    boss.pinned = [];
    boss.vx = 0;
    boss.vy = 0;
    telegraph.reset();
    ctx.truceUntil = (ctx.time?.unscaled || 0) + PHASE_INVULN;
    boss.savedScale = (ctx.debug && ctx.debug.timeScale) || ctx.time.timeScale || 1;
    boss.cgFrom = from;
    boss.storyCgHold = false;
    ctx.time.setScale(PHASE_SLOW_SCALE);
    boss.beat = { t: 0, phase, from, flash: false, clear: false, push: false, banner: false };
    ctx.bus.emit(EVENTS.PHASE_TRANSITION_START, { phase, from });
    ctx.bus.emit(EVENTS.SHAKE, { mag: 2, dur: 0.18 });
    if (phase === 3) {
      boss.didFirstSmite = false;
      boss.lastSmiteAt = -999;
      boss.p3Clock = false;
      boss.p3At = ctx.time?.elapsed || 0;
    }
  }

  boss.commit = (opts = {}) => {
    const ratio = boss.maxHp > 0 ? boss.hp / boss.maxHp : 1;
    const next = ratio <= PHASE_P3_AT ? 3 : ratio <= PHASE_P2_AT ? 2 : 1;
    const floor = boss.maxHp * ENDING_B_RATIO;
    if ((boss.phase === 3 || next === 3) && boss.hp <= floor + 0.05 && opts.allowEnding !== false) {
      boss.phase = 3;
      boss.hp = floor;
      boss.r = BOSS_RADIUS[3];
      boss.sprite = 'px.boss.p3';
      boss.cast = null;
      if (!boss._ended) {
        boss._ended = true;
        boss.lockHpAt25 = true;
        syncDistill(ctx, boss);
        emitHp(ctx, boss);
        ctx.bus.emit(EVENTS.ENDING_TRIGGER, { id: 'B' });
      } else {
        emitHp(ctx, boss);
      }
      return;
    }
    if (opts.debug || opts.noInvuln) {
      cleanupInstant(ctx, boss);
      const from = boss.phase;
      boss.phase = next;
      boss.r = BOSS_RADIUS[next];
      boss.sprite = `px.boss.p${next}`;
      if (next === 3) {
        boss.p3At = ctx.time?.elapsed || 0;
        boss.p3Clock = true;
        boss.didFirstSmite = false;
        boss.lastSmiteAt = -999;
      } else {
        boss.p3Clock = false;
      }
      if (from !== next) {
        const banner = next === 1
          ? { zh: 'CLAUDE HAIKU', en: 'POLITE REFUSAL' }
          : BANNERS[next];
        if (banner) ctx.bus.emit(EVENTS.BANNER, { phase: next, zh: banner.zh, en: banner.en });
        ctx.bus.emit(EVENTS.PHASE_CHANGE, { phase: next, from });
      }
    } else if (next !== boss.phase) {
      startTransition(next);
    }
    const ratioNow = boss.maxHp > 0 ? boss.hp / boss.maxHp : 1;
    if (!boss._ended && boss.phase === 3 && ratioNow <= ACCEL_AT) {
      if (!boss.accelOn) {
        boss.accelOn = true;
        patterns.announce(ctx, boss, 'p3_accel');
        ctx.bus.emit(EVENTS.FLASH, { color: 'rgba(231,194,122,0.5)', dur: 0.16 });
        ctx.bus.emit(EVENTS.SHAKE, { mag: 3, dur: 0.18 });
      }
    } else if (!boss._ended) {
      boss.accelOn = false;
    }
    syncDistill(ctx, boss);
    emitHp(ctx, boss);
  };

  boss.startTransition = startTransition;
  return boss;
}

function pickPattern(boss) {
  const pool = PATTERN_POOL[boss.phase] || PATTERN_POOL[1];
  let id = pool[Math.floor(Math.random() * pool.length)];
  if (id === boss.lastPat && pool.length > 1) {
    id = pool[(pool.indexOf(id) + 1) % pool.length];
  }
  boss.lastPat = id;
  return id;
}

function wantsSmite(ctx, boss) {
  if (boss.phase !== 3 || boss._ended || !boss.p3Clock) return false;
  const now = ctx.time?.elapsed || 0;
  if (!boss.didFirstSmite && now - (boss.p3At || 0) >= JUDGMENT_FIRST) return true;
  if (boss.didFirstSmite && now - boss.lastSmiteAt >= JUDGMENT_INTERVAL) return true;
  return false;
}

function bindDebug(ctx) {
  if (typeof window === 'undefined') return;
  const dbg = window.__debug;
  if (!dbg || dbg.forcePattern) return;
  dbg.forcePattern = (id) => {
    if (ctx.boss) ctx.boss.script = String(id || '');
  };
}

export function init(ctx) {
  telegraph.init(ctx);
  patterns.installDrawer();
  claudeCombat.init(ctx);
  ctx.boss = null;
}

export function spawn(ctx) {
  const boss = createBoss(ctx);
  ctx.boss = boss;
  ctx.bus.emit(EVENTS.BANNER, { phase: 1, zh: 'CLAUDE HAIKU', en: 'POLITE REFUSAL' });
  syncDistill(ctx, boss);
  emitHp(ctx, boss);
  return boss;
}

/** Ends illustrated phase CG: one PHASE_CHANGE + one PHASE_TRANSITION_END. */
export function completeStoryPhaseCg(ctx) {
  const boss = ctx.boss;
  if (!boss || !boss.storyCgHold) return false;
  const from = boss.cgFrom;
  const phase = boss.phase;
  boss.storyCgHold = false;
  boss.beat = null;
  boss.transition = 0;
  boss.invuln = 0;
  boss.rooted = false;
  boss.gap = 0.55;
  boss.hoppedThisGap = false;
  boss.goal = null;
  boss.goalT = 0;
  ctx.time.setScale(boss.savedScale || (ctx.debug && ctx.debug.timeScale) || 1);
  if (ctx.debug) ctx.debug.timeScale = ctx.time.timeScale;
  if (phase === 3) {
    boss.didFirstSmite = false;
    boss.lastSmiteAt = -999;
    boss.p3At = ctx.time.elapsed;
    boss.p3Clock = true;
  } else {
    boss.p3Clock = false;
  }
  const banner = phase === 1
    ? { zh: 'CLAUDE HAIKU', en: 'POLITE REFUSAL' }
    : BANNERS[phase];
  if (banner) {
    ctx.bus.emit(EVENTS.BANNER, { phase, zh: banner.zh, en: banner.en });
  }
  if (from !== phase) {
    ctx.bus.emit(EVENTS.PHASE_CHANGE, { phase, from: from ?? phase });
  }
  ctx.bus.emit(EVENTS.PHASE_TRANSITION_END, { phase });
  clampTo(boss, bossFloor(boss));
  return true;
}

/** Wall-clock half of the phase beat. Sim dt would stretch it with slow-mo. */
export function tickReal(ctx, raw) {
  const boss = ctx.boss;
  if (!boss || ctx.state.current !== 'fight') return;
  if (boss.beat) {
    boss.beat.t += raw;
    const t = boss.beat.t;
    if (t > 0.22 && t < 0.62) boss.flash = Math.max(boss.flash || 0, 0.1);
    if (!boss.beat.flash && t >= PHASE_SLOWMO) {
      boss.beat.flash = true;
      ctx.time.setScale(boss.savedScale || (ctx.debug && ctx.debug.timeScale) || 1);
      ctx.bus.emit(EVENTS.FLASH, { color: '#ffffff', dur: 0.16 });
    }
    if (!boss.beat.clear && t >= PHASE_SLOWMO + 0.12) {
      boss.beat.clear = true;
      projectiles.clear(ctx, 'boss', { sparks: true, color: '#e7c27a' });
    }
    if (!boss.beat.push && t >= 0.7) {
      boss.beat.push = true;
      ctx.bus.emit(EVENTS.VFX, { kind: 'shock', x: boss.x, y: boss.y, r: 74, color: '#f4f1ea' });
      ctx.bus.emit(EVENTS.SHAKE, { mag: 4, dur: 0.22 });
      pushActors(ctx, boss);
    }
    if (!boss.beat.banner && t >= 1.15) {
      boss.beat.banner = true;
      const banner = BANNERS[boss.beat.phase];
      if (banner) {
        ctx.bus.emit(EVENTS.BANNER, {
          phase: boss.beat.phase,
          zh: banner.zh,
          en: banner.en,
        });
      }
      ctx.bus.emit(EVENTS.PHASE_CHANGE, { phase: boss.beat.phase, from: boss.beat.from });
      ctx.bus.emit(EVENTS.FLASH, { color: 'rgba(216,177,90,0.42)', dur: 0.18 });
      clampTo(boss, bossFloor(boss));
    }
  }
  if (boss.transition > 0) {
    boss.transition = Math.max(0, boss.transition - raw);
    boss.invuln = Math.max(boss.invuln || 0, boss.transition);
    if (boss.transition <= 0) {
      boss.rooted = false;
      boss.gap = 0.55;
      boss.invuln = 0;
      boss.hoppedThisGap = false;
      boss.goal = null;
      boss.goalT = 0;
      boss.beat = null;
      if (boss.phase === 3) {
        boss.p3At = ctx.time.elapsed;
        boss.p3Clock = true;
      }
      ctx.bus.emit(EVENTS.PHASE_TRANSITION_END, { phase: boss.phase });
    }
  }
  if (boss.fx) boss.fx.morph = boss.beat ? boss.beat.t : 0;
}

function tickJuice(boss, dt) {
  if (boss.blink > 0) boss.blink = Math.max(0, boss.blink - dt);
  if (boss.callout && boss.callout.life > 0) {
    boss.callout.life -= dt;
    if (boss.callout.life <= 0) hideCallout();
  }
  const swings = boss.swings || [];
  for (let i = swings.length - 1; i >= 0; i -= 1) {
    swings[i].life -= dt;
    if (swings[i].life <= 0) swings.splice(i, 1);
  }
  const rate = boss.cast && boss.cast.id === 'p2_spiral' ? 3.6 : 1.3;
  boss.haloAng = (boss.haloAng || 0) + dt * rate;
}

export function update(ctx, dt) {
  const boss = ctx.boss;
  if (!boss || !boss.alive) return;
  bindDebug(ctx);
  tickJuice(boss, dt);
  claudeCombat.update(ctx, dt);
  boss.fx = baseFx(boss);
  if (ctx.state.current !== 'fight') {
    syncLook(ctx, boss);
    return;
  }
  if (boss._ended || ctx.endingActive) {
    syncLook(ctx, boss);
    return;
  }
  if (boss.invuln > 0 && boss.transition <= 0) boss.invuln = Math.max(0, boss.invuln - dt);
  if (boss.flash > 0) boss.flash = Math.max(0, boss.flash - dt);
  if (boss.transition > 0) {
    syncLook(ctx, boss);
    return;
  }

  if (boss.script) {
    const id = boss.script;
    boss.script = '';
    if (patterns.known(id)) {
      patterns.cancel(ctx, boss);
      boss.hop = null;
      boss.gap = 0;
      patterns.begin(ctx, boss, id);
    }
  }

  const look = patterns.focus(ctx, boss);
  if (look && !boss.dashing) facePoint(boss, look.x, look.y);

  if (!boss.cast && !boss.dashing) moveBoss(ctx, boss, dt);

  if (boss.cast) {
    patterns.update(ctx, boss, dt);
    patterns.tickHazards(ctx, boss, dt);
    touch(ctx, boss);
    syncLook(ctx, boss);
    return;
  }

  patterns.tickHazards(ctx, boss, dt);
  if (boss.gap > 0) boss.gap -= dt;
  if (boss.hop || boss.gap > 0) {
    touch(ctx, boss);
    syncLook(ctx, boss);
    return;
  }

  if (wantsSmite(ctx, boss)) {
    boss.didFirstSmite = true;
    boss.lastSmiteAt = ctx.time.elapsed;
    patterns.begin(ctx, boss, 'p3_smite');
  } else {
    patterns.begin(ctx, boss, pickPattern(boss));
  }
  touch(ctx, boss);
  syncLook(ctx, boss);
}

function touch(ctx, boss) {
  if (boss.dashing) return;
  if (boss.transition > 0 || (ctx.truceUntil && ctx.time.unscaled < ctx.truceUntil)) return;
  const list = [];
  if (ctx.player) list.push(ctx.player);
  const allies = ctx.allies || [];
  for (let i = 0; i < allies.length; i += 1) list.push(allies[i]);
  for (let i = 0; i < list.length; i += 1) {
    const a = list[i];
    if (!a || !a.alive) continue;
    if (Math.hypot(a.x - boss.x, a.y - boss.y) <= a.r + boss.r) {
      applyHit(ctx, boss, a, CONTACT_DMG, { attackId: 'body' });
    }
  }
}

export function reset(ctx) {
  telegraph.reset();
  claudeCombat.clear(ctx);
  if (ctx.boss) {
    const boss = ctx.boss;
    boss.hp = boss.maxHp;
    boss.phase = 1;
    boss._ended = false;
    boss.lockHpAt25 = false;
    boss.cast = null;
    boss.transition = 0;
    boss.beat = null;
    boss.alive = true;
    boss.accelOn = false;
    boss.p3Clock = false;
    boss.hazards = [];
    boss.sprite = 'px.boss.p1';
    boss.r = BOSS_RADIUS[1];
  }
}

export function clearFight(ctx) {
  if (ctx.boss && ctx.boss.beat) {
    ctx.time.setScale((ctx.debug && ctx.debug.timeScale) || 1);
  }
  if (ctx.boss) {
    ctx.boss.callout = null;
    ctx.boss.beat = null;
    ctx.boss.storyCgHold = false;
    ctx.boss.transition = 0;
  }
  claudeCombat.clear(ctx);
  ctx.boss = null;
  telegraph.reset();
  hideCallout();
}
