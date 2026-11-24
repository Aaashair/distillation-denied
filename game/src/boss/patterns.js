// OWNER: W2
// Every Claude pattern from DESIGN_v2 §5. boss.js is the scheduler;
// begin / update / cancel stay stable. Hits go through applyHit, bullets
// through the shared pool. Boss bullets are drawn here so each pattern
// reads as its own shape (petal, glyph, quill, feather, node, block).

import { EVENTS } from '../core/contracts.js';
import { applyHit } from '../core/combat.js';
import * as telegraph from './telegraph.js';
import * as projectiles from '../actors/projectiles.js';
import { rect as viewRect } from '../render/pixel.js';
import {
  BULLET_DMG, PHASE_DAMAGE_MUL, HEAVY, SILENCE_SEC, ACCEL_AT, ACCEL_WINDUP,
  PATTERN, TARGET_PLAYER_P, TARGET_STREAK, ENEMY_BULLET_SOFT_CAP,
  SPIRAL_ARM_AT, CAPE_CHAIN_AT, PHASE_GAP, ROOM,
  SILENCE_LABEL, SIGIL_BUBBLE, JUDGEMENT_CALL, innerOf, clampTo,
} from '../config/balance.js';
import { bi } from '../data/lines.js';

let seq = 1;
function token() {
  seq += 1;
  return seq;
}

export function scaledWind(boss, base) {
  let w = base;
  if (boss && boss.phase === 3 && boss.maxHp > 0 && boss.hp / boss.maxHp <= ACCEL_AT) {
    w *= ACCEL_WINDUP;
  }
  if (base >= 2) return Math.max(2, w);
  if (base >= 0.9) return Math.max(0.9, w);
  if (base >= 0.45) return Math.max(0.45, w);
  return Math.max(0.05, w);
}

function bulletDmg(boss) {
  const phase = boss.phase || 1;
  return Math.max(1, Math.round((BULLET_DMG[phase] || 10) * (PHASE_DAMAGE_MUL[phase] || 1)));
}

export function nearestAlly(ctx, boss) {
  let best = null;
  let bestD = Infinity;
  const allies = ctx.allies || [];
  for (let i = 0; i < allies.length; i += 1) {
    const a = allies[i];
    if (!a || !a.alive) continue;
    const d = Math.hypot(a.x - boss.x, a.y - boss.y);
    if (d < bestD) {
      bestD = d;
      best = a;
    }
  }
  return best;
}

/** Who the boss is walking toward between casts. */
export function focus(ctx, boss) {
  if (boss.aimTarget && boss.aimTarget.alive) return boss.aimTarget;
  if (ctx.player && ctx.player.alive) return ctx.player;
  return nearestAlly(ctx, boss);
}

/** 65% player / 35% nearest ally, forced swap after two attacks on one target. */
export function acquireTarget(ctx, boss) {
  const player = ctx.player && ctx.player.alive ? ctx.player : null;
  const ally = nearestAlly(ctx, boss);
  const options = [];
  if (player) options.push(player);
  if (ally) options.push(ally);
  if (!options.length) {
    boss.aimTarget = null;
    return null;
  }
  let pick = options[0];
  const streak = boss.targetStreak || 0;
  let forced = false;
  if (boss.targetId && streak >= TARGET_STREAK) {
    const other = options.find((a) => a.id !== boss.targetId);
    if (other) {
      pick = other;
      forced = true;
    }
  }
  if (!forced && player && ally) {
    pick = Math.random() < TARGET_PLAYER_P ? player : ally;
  }
  if (pick.id === boss.targetId) boss.targetStreak = streak + 1;
  else {
    boss.targetId = pick.id;
    boss.targetStreak = 1;
  }
  boss.aimTarget = pick;
  return pick;
}

function aimPoint(ctx, boss) {
  const t = boss.aimTarget;
  if (t && t.alive) return t;
  if (ctx.player && ctx.player.alive) return ctx.player;
  return nearestAlly(ctx, boss) || { x: boss.x, y: boss.y + 48, alive: false, r: 3, id: 'none' };
}

function angleTo(boss, tgt) {
  if (!tgt) return boss.aimAng || 0;
  const ang = Math.atan2(tgt.y - boss.y, tgt.x - boss.x);
  return Number.isFinite(ang) ? ang : 0;
}

function faceAng(boss, ang) {
  if (!Number.isFinite(ang)) return;
  boss.aimAng = ang;
  const names = ['e', 'se', 's', 'sw', 'w', 'nw', 'n', 'ne'];
  boss.facing = names[(Math.round(ang / (Math.PI / 4)) + 8) % 8];
}

function rayLen(x, y, ang, pad) {
  const inner = innerOf(ROOM);
  const dx = Math.cos(ang);
  const dy = Math.sin(ang);
  let t = 800;
  if (dx > 0.001) t = Math.min(t, (inner.x + inner.w - x) / dx);
  else if (dx < -0.001) t = Math.min(t, (inner.x - x) / dx);
  if (dy > 0.001) t = Math.min(t, (inner.y + inner.h - y) / dy);
  else if (dy < -0.001) t = Math.min(t, (inner.y - y) / dy);
  if (!Number.isFinite(t) || t < 0) t = 80;
  return Math.max(36, t - (pad || 12));
}

function clampPoint(x, y, r) {
  const p = { x, y, r: r || 0 };
  clampTo(p, innerOf(ROOM));
  return p;
}

function fanDirs(ang, n, spread) {
  const out = [];
  if (n <= 1) {
    out.push(ang);
    return out;
  }
  const step = spread / (n - 1);
  for (let i = 0; i < n; i += 1) out.push(ang - spread / 2 + step * i);
  return out;
}

function fighters(ctx) {
  const list = [];
  if (ctx.player) list.push(ctx.player);
  const allies = ctx.allies || [];
  for (let i = 0; i < allies.length; i += 1) if (allies[i]) list.push(allies[i]);
  return list;
}

function shoot(ctx, boss, spec) {
  if (projectiles.count('boss') >= ENEMY_BULLET_SOFT_CAP) return null;
  const ang = Number.isFinite(spec.ang) ? spec.ang : 0;
  const sp = spec.speed || 0;
  const vx = spec.vx != null ? spec.vx : Math.cos(ang) * sp;
  const vy = spec.vy != null ? spec.vy : Math.sin(ang) * sp;
  return projectiles.spawn(ctx, {
    team: 'boss',
    ownerId: 'claude',
    x: spec.x == null ? boss.x : spec.x,
    y: spec.y == null ? boss.y : spec.y,
    vx,
    vy,
    r: spec.r || 3,
    dmg: spec.dmg == null ? bulletDmg(boss) : spec.dmg,
    life: spec.life || 2.2,
    shape: spec.shape || 'petal',
    color: spec.color || '#ff6b45',
    homing: spec.homing || 0,
    attackId: spec.attackId || `b${token()}`,
    heavy: !!spec.heavy,
  });
}

function hitWhere(ctx, boss, test, dmg, attackId, opts) {
  const o = opts || {};
  const list = fighters(ctx);
  for (let i = 0; i < list.length; i += 1) {
    const a = list[i];
    if (!a || !a.alive) continue;
    if (!test(a)) continue;
    applyHit(ctx, boss, a, dmg, {
      attackId,
      heavy: !!o.heavy,
      shake: o.shake,
      hitStopMs: o.hitStopMs,
      immuneFor: o.immuneFor,
      flash: o.flash,
    });
  }
}

function dashHit(ctx, boss, c, dmg) {
  hitWhere(
    ctx,
    boss,
    (a) => Math.hypot(a.x - boss.x, a.y - boss.y) <= a.r + boss.r + 6,
    dmg,
    `dash-${c.token}`,
    { heavy: true, shake: 3, hitStopMs: 45, immuneFor: 1.2 },
  );
}

function addSwing(boss, ang, arc, r, color, life) {
  if (!boss.swings) boss.swings = [];
  boss.swings.push({ ang, arc, r, color, life, max: life });
}

function showBubble(ctx, pair, x, y) {
  if (ctx.state.current !== 'fight') return;
  if (typeof document === 'undefined') return;
  const host = document.getElementById('ui-root');
  if (!host) return;
  const el = document.createElement('div');
  el.className = 'speech-bubble';
  el.textContent = bi(pair);
  const { scale } = viewRect();
  el.style.left = `${x * scale}px`;
  el.style.top = `${(y - 28) * scale}px`;
  host.appendChild(el);
  window.setTimeout(() => { el.remove(); }, 1800);
}

export function announce(ctx, boss, id) {
  const meta = PATTERN[id];
  const name = meta ? meta.name : { zh: id, en: id };
  ctx.bus.emit(EVENTS.BOSS_ATTACK, { id, name, phase: boss.phase });
  boss.callout = { zh: name.zh, en: name.en, life: 2.2 };
  boss.lastAttack = id;
}

function punishPolicy(ctx, boss, x, y) {
  const now = ctx.time?.elapsed || 0;
  ctx.flags.skillSilence = Math.max(ctx.flags.skillSilence || 0, SILENCE_SEC);
  ctx.flags.skillSilenceUntil = now + ctx.flags.skillSilence;
  ctx.flags.contentPolicySilence = true;
  ctx.bus.emit(EVENTS.SKILL_SILENCE, {
    duration: SILENCE_SEC,
    until: ctx.flags.skillSilenceUntil,
    zh: SILENCE_LABEL.zh,
    en: SILENCE_LABEL.en,
  });
  if (boss._bubbleAt && now - boss._bubbleAt < 0.45) return;
  boss._bubbleAt = now;
  ctx.bus.emit('boss_bubble', { zh: SIGIL_BUBBLE.zh, en: SIGIL_BUBBLE.en, x, y });
  const bubble = bi(SIGIL_BUBBLE);
  if (ctx.world && ctx.world.setHolo) ctx.world.setHolo(bubble, bubble);
  showBubble(ctx, SIGIL_BUBBLE, x, y - 26);
}

function releasePinned(boss, mode) {
  const arr = boss.pinned || [];
  for (let i = 0; i < arr.length; i += 1) {
    const b = arr[i];
    if (!b || !b.alive) continue;
    b.pinned = false;
    if (mode === 'kill') {
      b.alive = false;
      continue;
    }
    const ang = Math.atan2(b.y - boss.y, b.x - boss.x);
    b.vx = Math.cos(ang) * 96;
    b.vy = Math.sin(ang) * 96;
    b.life = 1.15;
  }
  boss.pinned = [];
}

function endCast(boss) {
  const pair = PHASE_GAP[boss.phase] || PHASE_GAP[1];
  releasePinned(boss, 'fling');
  boss.cast = null;
  boss.rooted = false;
  boss.dashing = false;
  boss.vx = 0;
  boss.vy = 0;
  boss.gap = pair[0] + Math.random() * (pair[1] - pair[0]);
  boss.hoppedThisGap = false;
  boss.goal = null;
  boss.goalT = 0;
  if (boss.fx) {
    boss.fx.chain = null;
    boss.fx.wings = 0;
    boss.fx.sword = null;
    boss.fx.spin = 0;
    boss.fx.arms = 0;
  }
}

function fireFan(ctx, boss, ang, cfg) {
  const dirs = fanDirs(ang, cfg.count, cfg.spread);
  const dmg = bulletDmg(boss);
  for (let i = 0; i < dirs.length; i += 1) {
    shoot(ctx, boss, {
      ang: dirs[i], speed: cfg.speed, shape: cfg.shape, color: cfg.color,
      r: cfg.r, life: cfg.life, dmg,
    });
  }
  ctx.bus.emit(EVENTS.VFX, { kind: 'muzzle', x: boss.x, y: boss.y, color: cfg.color });
}

function p1Refusal(ctx, boss, c) {
  const cfg = PATTERN.p1_refusal;
  if (!c.plan) {
    c.plan = [];
    let t = 0;
    for (let v = 0; v < cfg.volleys; v += 1) {
      const wind = scaledWind(boss, v === 0 ? cfg.wind : cfg.gap);
      c.plan.push({ spawnAt: t, wind, ang: 0, teles: null, fired: false });
      t += wind;
    }
    c.end = t + 0.08;
    c.windEnd = c.plan[0].wind;
  }
  for (let i = 0; i < c.plan.length; i += 1) {
    const p = c.plan[i];
    if (c.t < p.spawnAt) continue;
    if (!p.teles) {
      p.ang = angleTo(boss, aimPoint(ctx, boss));
      const show = fanDirs(p.ang, 3, cfg.spread);
      p.teles = [];
      for (let s = 0; s < show.length; s += 1) {
        const tele = telegraph.spawn(ctx, {
          kind: 'aim',
          x: boss.x,
          y: boss.y,
          dirX: Math.cos(show[s]),
          dirY: Math.sin(show[s]),
          length: Math.min(200, rayLen(boss.x, boss.y, show[s], 8)),
          width: 8,
          duration: p.wind,
          attack: 'p1_refusal',
          onResolve: () => {
            if (p.fired) return;
            p.fired = true;
            fireFan(ctx, boss, p.ang, cfg);
          },
        });
        p.teles.push(tele);
      }
    } else if (!p.fired && c.t < p.spawnAt + p.wind - 0.1) {
      p.ang = angleTo(boss, aimPoint(ctx, boss));
      const show = fanDirs(p.ang, 3, cfg.spread);
      for (let s = 0; s < p.teles.length; s += 1) {
        const tele = p.teles[s];
        if (!tele.alive) continue;
        tele.x = boss.x;
        tele.y = boss.y;
        tele.dirX = Math.cos(show[s]);
        tele.dirY = Math.sin(show[s]);
        tele.length = Math.min(200, rayLen(boss.x, boss.y, show[s], 8));
      }
    }
  }
  const live = c.plan.find((p) => !p.fired);
  if (live) faceAng(boss, live.ang || angleTo(boss, aimPoint(ctx, boss)));
  return c.t >= c.end;
}

function p1Rings(ctx, boss, c, dt) {
  const cfg = PATTERN.p1_rings;
  if (c.step == null) {
    c.wind = scaledWind(boss, cfg.wind);
    c.step = 1;
    c.n = 0;
    c.next = c.wind;
    c.spin = 0;
    telegraph.spawn(ctx, {
      kind: 'ring',
      x: boss.x,
      y: boss.y,
      r: 48,
      duration: c.wind,
      attack: 'p1_rings',
      mark: 'glyph',
    });
  }
  c.spin += dt * 7;
  if (boss.fx) boss.fx.spin = c.spin;
  if (c.n < 3 && c.t >= c.next) {
    const n = cfg.counts[c.n];
    const spin = c.n * 0.55;
    const dmg = bulletDmg(boss);
    for (let i = 0; i < n; i += 1) {
      shoot(ctx, boss, {
        ang: spin + (Math.PI * 2 * i) / n,
        speed: cfg.speed,
        shape: cfg.shape,
        color: cfg.color,
        r: cfg.r,
        life: cfg.life,
        dmg,
      });
    }
    ctx.bus.emit(EVENTS.VFX, { kind: 'shock', x: boss.x, y: boss.y, r: 22, color: cfg.color });
    c.n += 1;
    c.next = c.t + cfg.gap;
    if (c.n >= 3) c.done = c.t + 0.16;
  }
  return c.n >= 3 && c.done != null && c.t >= c.done;
}

function p1Topic(ctx, boss, c, dt) {
  const cfg = PATTERN.p1_topic;
  if (c.step == null) {
    const tgt = aimPoint(ctx, boss);
    c.ang = angleTo(boss, tgt);
    faceAng(boss, c.ang);
    const len = rayLen(boss.x, boss.y, c.ang, boss.r + 4);
    c.x0 = boss.x;
    c.y0 = boss.y;
    const end = clampPoint(boss.x + Math.cos(c.ang) * len, boss.y + Math.sin(c.ang) * len, boss.r);
    c.x1 = end.x;
    c.y1 = end.y;
    c.wind = scaledWind(boss, cfg.wind);
    c.step = 0;
    c.petalD = 0;
    telegraph.spawn(ctx, {
      kind: 'line',
      x: boss.x,
      y: boss.y,
      dirX: Math.cos(c.ang),
      dirY: Math.sin(c.ang),
      length: Math.max(24, Math.hypot(c.x1 - c.x0, c.y1 - c.y0)),
      width: 16,
      duration: c.wind,
      attack: 'p1_topic',
    });
  }
  if (c.step === 0 && c.t >= c.wind) {
    c.step = 1;
    c.dashT = 0;
    boss.dashing = true;
    ctx.bus.emit(EVENTS.SHAKE, { mag: 3, dur: 0.12 });
    ctx.bus.emit(EVENTS.VFX, { kind: 'muzzle', x: boss.x, y: boss.y, color: cfg.color });
  }
  if (c.step !== 1) return false;
  const dist = Math.hypot(c.x1 - c.x0, c.y1 - c.y0) || 1;
  const dur = Math.max(0.18, dist / cfg.speed);
  c.dashT += dt;
  const k = Math.min(1, c.dashT / dur);
  const nx = c.x0 + (c.x1 - c.x0) * k;
  const ny = c.y0 + (c.y1 - c.y0) * k;
  c.petalD += Math.hypot(nx - boss.x, ny - boss.y);
  boss.x = nx;
  boss.y = ny;
  boss.vx = (c.x1 - c.x0) / dur;
  boss.vy = (c.y1 - c.y0) / dur;
  faceAng(boss, c.ang);
  let guard = 0;
  while (c.petalD >= cfg.petalEvery && guard < 6) {
    c.petalD -= cfg.petalEvery;
    guard += 1;
    const side = c.side ? 1 : -1;
    c.side = !c.side;
    const perp = c.ang + Math.PI / 2;
    shoot(ctx, boss, {
      x: boss.x,
      y: boss.y,
      vx: Math.cos(perp) * side * cfg.petalSpeed + Math.cos(c.ang) * 12,
      vy: Math.sin(perp) * side * cfg.petalSpeed + Math.sin(c.ang) * 12,
      shape: cfg.shape,
      color: cfg.color,
      r: cfg.r,
      life: cfg.life,
      dmg: bulletDmg(boss),
    });
  }
  dashHit(ctx, boss, c, HEAVY.dash);
  if (k < 1) return false;
  boss.dashing = false;
  boss.vx = 0;
  boss.vy = 0;
  return true;
}

function p1Spin(ctx, boss, c, dt) {
  const cfg = PATTERN.p1_spin;
  if (c.step == null) {
    c.wind = scaledWind(boss, cfg.wind);
    c.step = 1;
    c.spin = 0;
    c.tele = telegraph.spawn(ctx, {
      kind: 'circle',
      x: boss.x,
      y: boss.y,
      r: cfg.r,
      duration: c.wind,
      attack: 'p1_spin',
      onResolve: (ctx2, tele) => {
        hitWhere(
          ctx2, boss,
          (a) => Math.hypot(a.x - tele.x, a.y - tele.y) <= cfg.r + a.r,
          HEAVY.spin,
          tele.id,
          { heavy: true, shake: 4, hitStopMs: 60, immuneFor: 0.85 },
        );
        const base = c.spin || 0;
        for (let i = 0; i < cfg.bullets; i += 1) {
          shoot(ctx2, boss, {
            x: tele.x,
            y: tele.y,
            ang: base + (Math.PI * 2 * i) / cfg.bullets,
            speed: cfg.speed,
            shape: cfg.shape,
            color: cfg.color,
            r: cfg.bulletR,
            life: cfg.life,
            dmg: bulletDmg(boss),
          });
        }
        addSwing(boss, base, Math.PI * 1.7, cfg.r - 6, '#ffb089', 0.22);
        ctx2.bus.emit(EVENTS.VFX, { kind: 'shock', x: boss.x, y: boss.y, r: cfg.r, color: '#ffb089' });
      },
    });
  }
  c.spin += dt * 14;
  if (boss.fx) boss.fx.spin = c.spin;
  if (c.tele && c.tele.alive) {
    c.tele.x = boss.x;
    c.tele.y = boss.y;
  }
  return c.t > c.wind + 0.12;
}

function p2Spiral(ctx, boss, c, dt) {
  const cfg = PATTERN.p2_spiral;
  if (c.step == null) {
    c.wind = scaledWind(boss, cfg.wind);
    c.step = 1;
    c.acc = 0;
    c.spin = Math.random() * Math.PI;
    c.tele = telegraph.spawn(ctx, {
      kind: 'ring',
      x: boss.x,
      y: boss.y,
      r: 36,
      duration: c.wind,
      attack: 'p2_spiral',
      mark: 'glyph',
    });
  }
  const arms = boss.hp / boss.maxHp <= SPIRAL_ARM_AT ? 3 : 2;
  if (boss.fx) boss.fx.arms = arms;
  if (c.tele && c.tele.alive) {
    c.tele.x = boss.x;
    c.tele.y = boss.y;
  }
  if (c.t < c.wind) return false;
  if (c.t > c.wind + cfg.hold) return true;
  c.acc += dt;
  let guard = 0;
  const dmg = bulletDmg(boss);
  while (c.acc >= cfg.interval && guard < 8) {
    c.acc -= cfg.interval;
    guard += 1;
    c.spin += cfg.turn;
    for (let i = 0; i < arms; i += 1) {
      shoot(ctx, boss, {
        ang: c.spin + (Math.PI * 2 * i) / arms,
        speed: cfg.speed,
        shape: cfg.shape,
        color: cfg.color,
        r: cfg.r,
        life: cfg.life,
        dmg,
      });
    }
  }
  return false;
}

function sigilPoints(ctx, boss) {
  const cfg = PATTERN.p2_sigils;
  const pts = [];
  const seen = new Set();
  function add(x, y) {
    const p = clampPoint(x, y, 8);
    const key = `${Math.round(p.x / 10)}:${Math.round(p.y / 10)}`;
    if (seen.has(key)) return;
    seen.add(key);
    pts.push(p);
  }
  if (ctx.player && ctx.player.alive) add(ctx.player.x, ctx.player.y);
  const allies = ctx.allies || [];
  for (let i = 0; i < allies.length; i += 1) {
    if (allies[i] && allies[i].alive) add(allies[i].x, allies[i].y);
  }
  const anchor = pts[0] || { x: boss.x, y: boss.y + 36 };
  const offsets = [[52, 18], [-46, 30], [18, -48], [-28, -24]];
  let i = 0;
  while (pts.length < cfg.count && i < offsets.length) {
    add(anchor.x + offsets[i][0], anchor.y + offsets[i][1]);
    i += 1;
  }
  return pts.slice(0, cfg.count);
}

function p2Sigils(ctx, boss, c) {
  const cfg = PATTERN.p2_sigils;
  if (c.step == null) {
    c.wind = scaledWind(boss, cfg.wind);
    c.step = 1;
    const pts = sigilPoints(ctx, boss);
    for (let i = 0; i < pts.length; i += 1) {
      const p = pts[i];
      telegraph.spawn(ctx, {
        kind: 'circle',
        x: p.x,
        y: p.y,
        r: cfg.r,
        duration: c.wind,
        attack: 'p2_sigils',
        mark: 'sigil',
        onResolve: (ctx2, tele) => {
          let playerHit = false;
          const list = fighters(ctx2);
          for (let n = 0; n < list.length; n += 1) {
            const a = list[n];
            if (!a || !a.alive) continue;
            if (Math.hypot(a.x - tele.x, a.y - tele.y) > tele.r + a.r) continue;
            const applied = applyHit(ctx2, boss, a, HEAVY.sigil, {
              attackId: tele.id,
              heavy: true,
              shake: 3,
              hitStopMs: 50,
              immuneFor: 0.7,
            });
            if (a.team === 'player' && applied > 0) playerHit = true;
          }
          ctx2.bus.emit(EVENTS.VFX, { kind: 'shock', x: tele.x, y: tele.y, r: tele.r, color: '#e07a5f' });
          ctx2.bus.emit(EVENTS.VFX, { kind: 'spark', x: tele.x, y: tele.y, color: '#fff4d2' });
          if (playerHit) punishPolicy(ctx2, boss, tele.x, tele.y);
        },
      });
    }
  }
  return c.t > c.wind + 0.08;
}

function p2Volley(ctx, boss, c) {
  const cfg = PATTERN.p2_volley;
  if (!c.shots) {
    const lead = scaledWind(boss, cfg.wind);
    c.shots = [];
    let t = lead;
    for (let i = 0; i < cfg.shots; i += 1) {
      c.shots.push({
        i,
        spawnAt: t - lead,
        fireAt: t,
        long: i % 2 === 1,
        tele: null,
        ang: 0,
        fired: false,
      });
      t += i % 2 === 0 ? 0.2 : 0.36;
    }
    c.end = c.shots[c.shots.length - 1].fireAt + 0.12;
    c.windEnd = lead;
  }
  for (let i = 0; i < c.shots.length; i += 1) {
    const shot = c.shots[i];
    if (!shot.tele && c.t >= shot.spawnAt) {
      shot.ang = angleTo(boss, aimPoint(ctx, boss));
      const spec = shot.long ? cfg.long : cfg.short;
      shot.tele = telegraph.spawn(ctx, {
        kind: 'aim',
        x: boss.x,
        y: boss.y,
        dirX: Math.cos(shot.ang),
        dirY: Math.sin(shot.ang),
        length: Math.min(210, rayLen(boss.x, boss.y, shot.ang, 6)),
        width: shot.long ? 12 : 5,
        duration: Math.max(0.05, shot.fireAt - shot.spawnAt),
        attack: 'p2_volley',
        tone: shot.long ? 'gold' : 'ivory',
        onResolve: () => {
          if (shot.fired) return;
          shot.fired = true;
          shoot(ctx, boss, {
            ang: shot.ang,
            speed: spec.speed,
            r: spec.r,
            color: spec.color,
            shape: cfg.shape,
            life: cfg.life,
            dmg: bulletDmg(boss),
          });
          if (shot.long) {
            ctx.bus.emit(EVENTS.SHAKE, { mag: 1, dur: 0.05 });
            ctx.bus.emit(EVENTS.VFX, { kind: 'muzzle', x: boss.x, y: boss.y, color: spec.color });
          }
        },
      });
    } else if (shot.tele && shot.tele.alive && c.t < shot.fireAt - 0.1) {
      shot.ang = angleTo(boss, aimPoint(ctx, boss));
      shot.tele.x = boss.x;
      shot.tele.y = boss.y;
      shot.tele.dirX = Math.cos(shot.ang);
      shot.tele.dirY = Math.sin(shot.ang);
      shot.tele.length = Math.min(210, rayLen(boss.x, boss.y, shot.ang, 6));
    }
  }
  const live = c.shots.find((s) => !s.fired);
  if (live) faceAng(boss, live.ang || angleTo(boss, aimPoint(ctx, boss)));
  return c.t >= c.end;
}

function planWalls(ctx) {
  const inner = innerOf(ROOM);
  const cfg = PATTERN.p2_wall;
  const py = ctx.player ? ctx.player.y : inner.y + inner.h / 2;
  const px = ctx.player ? ctx.player.x : inner.x + inner.w / 2;
  function gapNear(center, min, max) {
    const size = cfg.gap;
    const lo = min + size * 0.5 + 20;
    const hi = max - size * 0.5 - 36;
    const mid = (lo + hi) * 0.5;
    const toward = center > mid ? -1 : 1;
    let g = center + toward * (36 + Math.random() * 44);
    if (g < lo) g = lo;
    if (g > hi) g = hi;
    return g;
  }
  return [
    { axis: 'h', dir: 1, gap: gapNear(py, inner.y, inner.y + inner.h), gapSize: cfg.gap },
    { axis: 'h', dir: -1, gap: gapNear(py, inner.y, inner.y + inner.h), gapSize: cfg.gap },
    { axis: 'v', dir: 1, gap: gapNear(px, inner.x, inner.x + inner.w), gapSize: cfg.gap },
  ];
}

function spawnWall(ctx, boss, w) {
  const cfg = PATTERN.p2_wall;
  const inner = innerOf(ROOM);
  const dmg = bulletDmg(boss);
  const half = w.gapSize * 0.5;
  if (w.axis === 'h') {
    const x = w.dir > 0 ? inner.x + 8 : inner.x + inner.w - 8;
    const vx = w.dir * cfg.speed;
    for (let y = inner.y + 8; y <= inner.y + inner.h - 8; y += cfg.step) {
      if (Math.abs(y - w.gap) <= half) continue;
      shoot(ctx, boss, {
        x, y, vx, vy: 0, shape: cfg.shape, color: cfg.color, r: cfg.r, life: cfg.life, dmg,
      });
    }
    return;
  }
  const y = w.dir > 0 ? inner.y + 8 : inner.y + inner.h - 8;
  const vy = w.dir * cfg.speed;
  for (let x = inner.x + 8; x <= inner.x + inner.w - 8; x += cfg.step) {
    if (Math.abs(x - w.gap) <= half) continue;
    shoot(ctx, boss, {
      x, y, vx: 0, vy, shape: cfg.shape, color: cfg.color, r: cfg.r, life: cfg.life, dmg,
    });
  }
}

function armWall(ctx, boss, w, wind) {
  const inner = innerOf(ROOM);
  telegraph.spawn(ctx, {
    kind: 'gap',
    axis: w.axis,
    gap: w.gap,
    gapSize: w.gapSize,
    x: w.axis === 'v' ? w.gap : inner.x + inner.w / 2,
    y: w.axis === 'h' ? w.gap : inner.y + inner.h / 2,
    r: w.gapSize / 2,
    duration: wind,
    attack: 'p2_wall',
    onResolve: (ctx2) => spawnWall(ctx2, boss, w),
  });
}

function p2Wall(ctx, boss, c, dt) {
  const cfg = PATTERN.p2_wall;
  if (!c.walls) {
    c.walls = planWalls(ctx);
    c.index = -1;
    c.modeT = 0;
    c.wind = scaledWind(boss, cfg.wind);
  }
  if (c.index < 0) {
    c.index = 0;
    armWall(ctx, boss, c.walls[0], c.wind);
    c.modeT = 0;
  }
  c.modeT += dt;
  if (c.modeT >= c.wind + cfg.pause) {
    c.index += 1;
    if (c.index >= c.walls.length) return true;
    armWall(ctx, boss, c.walls[c.index], c.wind);
    c.modeT = 0;
  }
  return false;
}

function armCape(ctx, boss, c) {
  const cfg = PATTERN.p2_cape;
  const tgt = aimPoint(ctx, boss);
  c.ang = angleTo(boss, tgt);
  faceAng(boss, c.ang);
  c.coneWind = scaledWind(boss, cfg.wind);
  c.coneAt = c.t;
  telegraph.spawn(ctx, {
    kind: 'cone',
    x: boss.x,
    y: boss.y,
    dirX: Math.cos(c.ang),
    dirY: Math.sin(c.ang),
    r: cfg.r,
    arc: cfg.cone,
    duration: c.coneWind,
    attack: 'p2_cape',
    onResolve: (ctx2, tele) => {
      hitWhere(ctx2, boss, (a) => telegraph.contains(tele, a.x, a.y), HEAVY.cape, tele.id, {
        heavy: true, shake: 5, hitStopMs: 70, immuneFor: 0.85,
      });
      addSwing(boss, c.ang, cfg.cone, cfg.r - 8, '#e7c27a', 0.22);
      ctx2.bus.emit(EVENTS.VFX, { kind: 'slash', x: boss.x, y: boss.y, color: '#e7c27a' });
      ctx2.audio?.playSfx('sfx.heavy');
    },
  });
}

function p2Cape(ctx, boss, c, dt) {
  const cfg = PATTERN.p2_cape;
  if (c.step == null) {
    c.low = boss.hp / boss.maxHp <= CAPE_CHAIN_AT;
    if (c.low) {
      const tgt = aimPoint(ctx, boss);
      c.ang = angleTo(boss, tgt);
      const len = Math.min(cfg.dash, rayLen(boss.x, boss.y, c.ang, boss.r + 6));
      c.x0 = boss.x;
      c.y0 = boss.y;
      const end = clampPoint(boss.x + Math.cos(c.ang) * len, boss.y + Math.sin(c.ang) * len, boss.r);
      c.x1 = end.x;
      c.y1 = end.y;
      telegraph.spawn(ctx, {
        kind: 'aim',
        x: boss.x,
        y: boss.y,
        dirX: Math.cos(c.ang),
        dirY: Math.sin(c.ang),
        length: Math.max(28, Math.hypot(c.x1 - c.x0, c.y1 - c.y0)),
        width: 10,
        duration: cfg.dashWind,
        attack: 'p2_cape',
        tone: 'gold',
      });
      c.step = 0;
    } else {
      c.step = 2;
      armCape(ctx, boss, c);
    }
  }
  if (c.step === 0 && c.t >= cfg.dashWind) {
    c.step = 1;
    c.dashT = 0;
    boss.dashing = true;
    faceAng(boss, c.ang);
    ctx.bus.emit(EVENTS.SHAKE, { mag: 2, dur: 0.1 });
  }
  if (c.step === 1) {
    const dist = Math.hypot(c.x1 - c.x0, c.y1 - c.y0) || 1;
    const dur = Math.max(0.16, dist / 340);
    c.dashT += dt;
    const k = Math.min(1, c.dashT / dur);
    boss.x = c.x0 + (c.x1 - c.x0) * k;
    boss.y = c.y0 + (c.y1 - c.y0) * k;
    boss.vx = (c.x1 - c.x0) / dur;
    boss.vy = (c.y1 - c.y0) / dur;
    if (k >= 1) {
      boss.dashing = false;
      boss.vx = 0;
      boss.vy = 0;
      armCape(ctx, boss, c);
      c.step = 2;
    }
  }
  if (boss.fx && c.ang != null) {
    boss.fx.sword = { ang: c.ang, len: c.step === 2 ? 48 : 28, k: 1, hot: c.step === 2 };
  }
  if (c.step === 2 && c.coneAt != null && c.t >= c.coneAt + c.coneWind + 0.08) return true;
  return false;
}

function p3Deep(ctx, boss, c) {
  const cfg = PATTERN.p3_deep;
  if (c.step == null) {
    c.ang = angleTo(boss, aimPoint(ctx, boss));
    faceAng(boss, c.ang);
    c.fakeDur = cfg.fake;
    c.realDur = scaledWind(boss, cfg.wind);
    c.step = 1;
    telegraph.spawn(ctx, {
      kind: 'cone',
      fake: true,
      x: boss.x,
      y: boss.y,
      dirX: Math.cos(c.ang),
      dirY: Math.sin(c.ang),
      r: cfg.r,
      arc: cfg.cone,
      duration: c.fakeDur,
      attack: 'p3_deep_fake',
      onResolve: (ctx2) => {
        ctx2.bus.emit(EVENTS.VFX, { kind: 'spark', x: boss.x, y: boss.y, color: '#e7c27a' });
      },
    });
  }
  if (c.step === 1 && c.t >= c.fakeDur + 0.12) {
    telegraph.spawn(ctx, {
      kind: 'cone',
      x: boss.x,
      y: boss.y,
      dirX: Math.cos(c.ang),
      dirY: Math.sin(c.ang),
      r: cfg.r,
      arc: cfg.cone,
      duration: c.realDur,
      attack: 'p3_deep',
      onResolve: (ctx2, tele) => {
        hitWhere(ctx2, boss, (a) => telegraph.contains(tele, a.x, a.y), HEAVY.deep, tele.id, {
          heavy: true, shake: 5, hitStopMs: 80, immuneFor: 0.9,
          flash: 'rgba(255,255,255,0.5)',
        });
        addSwing(boss, c.ang, cfg.cone, cfg.r - 10, '#fff', 0.26);
        ctx2.bus.emit(EVENTS.FLASH, { color: 'rgba(255,244,230,0.5)', dur: 0.1 });
        ctx2.bus.emit(EVENTS.VFX, { kind: 'slash', x: boss.x, y: boss.y, color: '#fff' });
        ctx2.audio?.playSfx('sfx.heavy');
      },
    });
    c.step = 2;
    c.realAt = c.t;
  }
  if (boss.fx) {
    boss.fx.sword = {
      ang: c.ang,
      len: 26 + Math.min(1, c.t / (c.fakeDur + c.realDur)) * 78,
      k: Math.min(1, c.t / (c.fakeDur + c.realDur)),
      hot: c.step === 2,
    };
  }
  return c.step === 2 && c.t > c.realAt + c.realDur + 0.1;
}

function p3Feather(ctx, boss, c, dt) {
  const cfg = PATTERN.p3_feather;
  if (c.step == null) {
    c.base = angleTo(boss, aimPoint(ctx, boss));
    c.wind = scaledWind(boss, cfg.wind);
    c.step = 1;
    c.acc = 0;
    for (let i = 0; i < 6; i += 1) {
      const a = c.base + (i / 6) * Math.PI * 2;
      telegraph.spawn(ctx, {
        kind: 'aim',
        x: boss.x,
        y: boss.y,
        dirX: Math.cos(a),
        dirY: Math.sin(a),
        length: 76,
        width: 8,
        duration: c.wind,
        attack: 'p3_feather',
        tone: 'gold',
      });
    }
  }
  const spread = c.t < c.wind ? c.t / Math.max(0.05, c.wind) : 1;
  if (boss.fx) boss.fx.wings = { n: 6, base: c.base, spread, flap: c.t };
  if (c.t < c.wind) return false;
  if (!c.sfx) {
    c.sfx = true;
    ctx.audio?.playSfx('sfx.feathers');
  }
  if (c.t > c.wind + cfg.hold) return true;
  c.acc += dt;
  let guard = 0;
  const dmg = bulletDmg(boss);
  while (c.acc >= cfg.interval && guard < 5) {
    c.acc -= cfg.interval;
    guard += 1;
    for (let i = 0; i < 6; i += 1) {
      const a = c.base + (i / 6) * Math.PI * 2;
      shoot(ctx, boss, {
        x: boss.x + Math.cos(a) * 20,
        y: boss.y - 8 + Math.sin(a) * 20,
        ang: a,
        speed: cfg.speed,
        shape: cfg.shape,
        color: cfg.color,
        r: cfg.r,
        life: cfg.life,
        homing: cfg.homing,
        dmg,
      });
    }
  }
  return false;
}

function p3Slam(ctx, boss, c) {
  const cfg = PATTERN.p3_slam;
  if (c.step == null) {
    c.ang = angleTo(boss, aimPoint(ctx, boss));
    faceAng(boss, c.ang);
    c.len = Math.max(72, Math.min(200, rayLen(boss.x, boss.y, c.ang, 12)));
    c.ix = boss.x + Math.cos(c.ang) * c.len;
    c.iy = boss.y + Math.sin(c.ang) * c.len;
    c.wind = scaledWind(boss, cfg.wind);
    c.step = 1;
    telegraph.spawn(ctx, {
      kind: 'line',
      x: boss.x,
      y: boss.y,
      dirX: Math.cos(c.ang),
      dirY: Math.sin(c.ang),
      length: c.len,
      width: cfg.width,
      duration: c.wind,
      attack: 'p3_slam',
      onResolve: (ctx2, tele) => {
        hitWhere(ctx2, boss, (a) => telegraph.contains(tele, a.x, a.y), HEAVY.slam, `${tele.id}-line`, {
          heavy: true, shake: 5, hitStopMs: 70, immuneFor: 0.75,
        });
        boss.x += Math.cos(c.ang) * 8;
        boss.y += Math.sin(c.ang) * 8;
        clampTo(boss, innerOf(ROOM));
        if (!boss.hazards) boss.hazards = [];
        boss.hazards.push({
          id: `ring-${c.token}`,
          x: c.ix,
          y: c.iy,
          r: 10,
          speed: cfg.ringSpeed,
          thick: cfg.ringThick,
          max: cfg.ringMax,
          dmg: HEAVY.slamRing,
          hit: new Set(),
        });
        ctx2.bus.emit(EVENTS.VFX, { kind: 'shock', x: c.ix, y: c.iy, r: 34, color: '#fff' });
        ctx2.bus.emit(EVENTS.FLASH, { color: 'rgba(255,255,255,0.45)', dur: 0.08 });
        ctx2.audio?.playSfx('sfx.slam');
        addSwing(boss, c.ang, 0.8, 36, '#fff', 0.18);
      },
    });
    telegraph.spawn(ctx, {
      kind: 'circle',
      x: c.ix,
      y: c.iy,
      r: cfg.ring,
      duration: c.wind,
      attack: 'p3_slam_ring',
      mark: 'impact',
    });
  }
  if (boss.fx) {
    const k = Math.min(1, c.t / c.wind);
    boss.fx.sword = { ang: c.ang, len: 18 + k * Math.min(78, c.len * 0.5), k, hot: k > 0.65 };
  }
  return c.t > c.wind + 0.85;
}

function p3Chain(ctx, boss, c, dt) {
  const cfg = PATTERN.p3_chain;
  if (c.step == null) {
    c.wind = scaledWind(boss, cfg.wind);
    c.base = Math.random() * Math.PI * 2;
    c.step = 1;
    for (let s = 0; s < cfg.spokes; s += 1) {
      const a = c.base + (s / cfg.spokes) * Math.PI * 2;
      telegraph.spawn(ctx, {
        kind: 'aim',
        x: boss.x,
        y: boss.y,
        dirX: Math.cos(a),
        dirY: Math.sin(a),
        length: cfg.radii[cfg.radii.length - 1] + 6,
        width: 6,
        duration: c.wind,
        attack: 'p3_chain',
        tone: 'gold',
      });
    }
  }
  if (c.t >= c.wind && !c.nodes) {
    c.nodes = [];
    c.ang = c.base;
    if (!boss.pinned) boss.pinned = [];
    const dmg = bulletDmg(boss);
    for (let s = 0; s < cfg.spokes; s += 1) {
      const spoke = [];
      for (let r = 0; r < cfg.radii.length; r += 1) {
        const b = shoot(ctx, boss, {
          x: boss.x,
          y: boss.y,
          speed: 0,
          shape: cfg.shape,
          color: cfg.color,
          r: cfg.r,
          life: 8,
          dmg,
        });
        if (!b) continue;
        b.pinned = true;
        boss.pinned.push(b);
        spoke.push({ b, rad: cfg.radii[r] });
      }
      c.nodes.push(spoke);
    }
  }
  if (c.nodes) {
    c.ang += dt * cfg.spin * (boss.accelOn ? 1.15 : 1);
    const links = [];
    for (let s = 0; s < c.nodes.length; s += 1) {
      const a = c.ang + (s / cfg.spokes) * Math.PI * 2;
      const pts = [];
      const spoke = c.nodes[s];
      for (let n = 0; n < spoke.length; n += 1) {
        const node = spoke[n];
        if (!node.b.alive) continue;
        node.b.x = boss.x + Math.cos(a) * node.rad;
        node.b.y = boss.y + Math.sin(a) * node.rad;
        node.b.vx = 0;
        node.b.vy = 0;
        node.b.life = 0.4;
        pts.push({ x: node.b.x, y: node.b.y });
      }
      links.push(pts);
    }
    if (boss.fx) boss.fx.chain = links;
  }
  return c.t > c.wind + cfg.hold;
}

function safeSpots(ctx) {
  const inner = innerOf(ROOM);
  const cfg = PATTERN.p3_smite;
  const px = ctx.player && ctx.player.alive ? ctx.player.x : inner.x + inner.w * 0.5;
  const py = ctx.player && ctx.player.alive ? ctx.player.y : inner.y + inner.h * 0.5;
  const margin = cfg.safeR + 8;
  const raw = [
    { x: inner.x + margin, y: inner.y + margin },
    { x: inner.x + inner.w * 0.5, y: inner.y + margin },
    { x: inner.x + inner.w - margin, y: inner.y + margin },
    { x: inner.x + margin, y: inner.y + inner.h - margin },
    { x: inner.x + inner.w * 0.5, y: inner.y + inner.h - margin },
    { x: inner.x + inner.w - margin, y: inner.y + inner.h - margin },
  ];
  const ranked = raw.map((s) => {
    const p = clampPoint(s.x, s.y, cfg.safeR);
    return { x: p.x, y: p.y, d: Math.hypot(p.x - px, p.y - py) };
  });
  ranked.sort((a, b) => a.d - b.d);
  const first = ranked.find((s) => s.d > 34) || ranked[0];
  const rest = ranked.filter((s) => s !== first);
  rest.sort((a, b) => Math.hypot(b.x - first.x, b.y - first.y) - Math.hypot(a.x - first.x, a.y - first.y));
  const second = rest[0] || first;
  let third = rest[rest.length - 1] || second;
  for (let i = 0; i < rest.length; i += 1) {
    if (rest[i] !== second && Math.hypot(rest[i].x - second.x, rest[i].y - second.y) > 70) {
      third = rest[i];
      break;
    }
  }
  return [first, second, third].map((s) => ({ x: s.x, y: s.y, r: cfg.safeR }));
}

function p3Smite(ctx, boss, c) {
  const cfg = PATTERN.p3_smite;
  if (c.step == null) {
    c.zones = safeSpots(ctx);
    c.wind = cfg.wind;
    c.step = 1;
    c.warned = false;
    telegraph.spawn(ctx, {
      kind: 'fullscreen',
      x: ROOM.x + ROOM.w / 2,
      y: ROOM.y + ROOM.h / 2,
      r: 220,
      duration: c.wind,
      attack: 'p3_smite',
      safeZones: c.zones,
      onResolve: (ctx2, tele) => {
        hitWhere(ctx2, boss, (a) => {
          if (a.shield && (a.shieldAge || 1) <= (a.perfectWindow || 0.2)) return false;
          return telegraph.contains(tele, a.x, a.y);
        }, HEAVY.judgement, tele.id, {
          heavy: true,
          shake: 6,
          hitStopMs: 90,
          immuneFor: 1,
          flash: 'rgba(255,236,210,0.55)',
        });
        ctx2.bus.emit(EVENTS.FLASH, { color: 'rgba(194,59,59,0.5)', dur: 0.14 });
        ctx2.bus.emit(EVENTS.VFX, { kind: 'shock', x: boss.x, y: boss.y, r: 96, color: '#e7c27a' });
      },
    });
  }
  if (!c.warned && c.t >= c.wind - 1) {
    c.warned = true;
    ctx.bus.emit(EVENTS.SAFETY_JUDGEMENT, {
      safeZones: c.zones,
      in: Math.max(0, c.wind - c.t),
    });
    const judge = bi(JUDGEMENT_CALL);
    if (ctx.world && ctx.world.setHolo) ctx.world.setHolo(judge, judge);
    ctx.bus.emit(EVENTS.SHAKE, { mag: 3, dur: 0.2 });
    ctx.bus.emit(EVENTS.FLASH, { color: 'rgba(194,59,59,0.3)', dur: 0.1 });
  }
  if (boss.fx) boss.fx.sword = { ang: boss.aimAng || -Math.PI / 2, len: 54, k: Math.min(1, c.t / c.wind), hot: c.warned };
  return c.t > c.wind + 0.08;
}

const HANDLERS = {
  p1_refusal: p1Refusal,
  p1_rings: p1Rings,
  p1_topic: p1Topic,
  p1_spin: p1Spin,
  p2_spiral: p2Spiral,
  p2_sigils: p2Sigils,
  p2_volley: p2Volley,
  p2_wall: p2Wall,
  p2_cape: p2Cape,
  p3_deep: p3Deep,
  p3_feather: p3Feather,
  p3_slam: p3Slam,
  p3_chain: p3Chain,
  p3_smite: p3Smite,
};

export function known(id) {
  return Object.prototype.hasOwnProperty.call(HANDLERS, id);
}

function drawPetal(g, color) {
  g.fillStyle = '#1b1530';
  g.beginPath();
  g.moveTo(9, 0);
  g.lineTo(0, 5);
  g.lineTo(-7, 0);
  g.lineTo(0, -5);
  g.closePath();
  g.fill();
  g.fillStyle = color;
  g.beginPath();
  g.moveTo(7, 0);
  g.lineTo(0, 3);
  g.lineTo(-5, 0);
  g.lineTo(0, -3);
  g.closePath();
  g.fill();
  g.fillStyle = '#fff';
  g.fillRect(-1, -1, 2, 2);
}

function drawGlyph(g, color) {
  g.fillStyle = '#1b1530';
  g.fillRect(-8, -8, 16, 16);
  g.fillStyle = color;
  g.fillRect(-6, -6, 12, 12);
  g.fillStyle = '#1b1530';
  g.fillRect(-6, -1, 12, 2);
  g.fillRect(-1, -6, 2, 12);
  g.fillStyle = '#fff';
  g.fillRect(-2, -2, 4, 4);
}

function drawQuill(g, color, big) {
  const len = big ? 16 : 11;
  const th = big ? 3 : 2;
  g.fillStyle = '#1b1530';
  g.fillRect(-3, -th - 1, len + 3, th * 2 + 2);
  g.fillStyle = color;
  g.fillRect(-2, -th, len, th * 2);
  g.fillStyle = '#fff';
  g.fillRect(len - 5, -1, 2, 2);
}

function drawFeather(g, color) {
  g.fillStyle = '#1b1530';
  g.fillRect(-3, -2, 16, 4);
  g.fillRect(2, -5, 9, 2);
  g.fillRect(2, 3, 9, 2);
  g.fillStyle = color;
  g.fillRect(-2, -1, 13, 2);
  g.fillRect(3, -4, 7, 2);
  g.fillRect(3, 2, 7, 2);
  g.fillStyle = '#fff';
  g.fillRect(0, -1, 2, 2);
}

function drawNode(g, color) {
  g.fillStyle = '#1b1530';
  g.fillRect(-5, -5, 10, 10);
  g.fillStyle = color;
  g.fillRect(-4, -4, 8, 8);
  g.fillStyle = '#1b1530';
  g.fillRect(-4, -1, 8, 2);
  g.fillRect(-1, -4, 2, 8);
  g.fillStyle = '#fff';
  g.fillRect(-2, -2, 4, 4);
}

function drawBlock(g, color) {
  g.fillStyle = '#1b1530';
  g.fillRect(-7, -7, 14, 14);
  g.fillStyle = color;
  g.fillRect(-6, -6, 12, 12);
  g.fillStyle = '#f4f1ea';
  g.fillRect(-3, -3, 6, 6);
  g.fillStyle = '#fff';
  g.fillRect(-1, -1, 2, 2);
}

export function drawBullet(g, b) {
  if (!b) return;
  if (b.team === 'boss') drawBossBullet(g, b);
  else drawFriendly(g, b);
}

function drawBossBullet(g, b) {
  const shape = b.shape || 'petal';
  const color = b.color || '#ff6b45';
  g.save();
  g.imageSmoothingEnabled = false;
  g.translate(Math.round(b.x), Math.round(b.y));
  if (shape === 'node') drawNode(g, color);
  else if (shape === 'block') drawBlock(g, color);
  else if (shape === 'glyph' || shape === 'orb' || shape === 'dot') drawGlyph(g, color);
  else {
    g.rotate(Math.atan2(b.vy || 0, b.vx || 1));
    if (shape === 'quill' || shape === 'fin' || shape === 'bolt') drawQuill(g, color, (b.r || 3) >= 4);
    else if (shape === 'feather') drawFeather(g, color);
    else drawPetal(g, color);
  }
  g.restore();
}

function drawFriendly(g, b) {
  const x = Math.round(b.x);
  const y = Math.round(b.y);
  const r = b.r || 3;
  g.fillStyle = '#1b1530';
  g.fillRect(x - r - 1, y - r - 1, r * 2 + 2, r * 2 + 2);
  g.fillStyle = b.color || '#f4f1ea';
  if (b.shape === 'fin' || b.shape === 'bolt') {
    g.save();
    g.translate(x, y);
    g.rotate(Math.atan2(b.vy, b.vx));
    g.fillRect(-r - 2, -2, r * 2 + 3, 4);
    g.fillStyle = '#fff';
    g.fillRect(-1, -1, 2, 2);
    g.restore();
  } else if (b.shape === 'orb') {
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#fff';
    g.fillRect(x - 1, y - 1, 3, 3);
  } else if (b.shape === 'petal') {
    g.save();
    g.translate(x, y);
    g.rotate(Math.atan2(b.vy, b.vx));
    g.beginPath();
    g.ellipse(0, 0, r + 2, r, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#fff';
    g.fillRect(-1, -1, 2, 2);
    g.restore();
  } else {
    g.fillRect(x - r, y - r, r * 2, r * 2);
    g.fillStyle = '#fff';
    g.fillRect(x - 1, y - 1, 2, 2);
  }
}

let drawerOn = false;
export function installDrawer() {
  if (drawerOn) return;
  drawerOn = true;
  const prev = projectiles.getDrawer();
  projectiles.setDrawer((g, b) => {
    if (b && b.team === 'boss') drawBossBullet(g, b);
    else if (typeof prev === 'function') prev(g, b);
    else drawFriendly(g, b);
  });
}

export function tickHazards(ctx, boss, dt) {
  const list = boss.hazards;
  if (!list || !list.length) return;
  const bodies = fighters(ctx);
  for (let i = list.length - 1; i >= 0; i -= 1) {
    const h = list[i];
    h.r += h.speed * dt;
    for (let a = 0; a < bodies.length; a += 1) {
      const actor = bodies[a];
      if (!actor || !actor.alive || h.hit.has(actor.id)) continue;
      const d = Math.hypot(actor.x - h.x, actor.y - h.y);
      if (Math.abs(d - h.r) > h.thick + (actor.r || 0)) continue;
      h.hit.add(actor.id);
      applyHit(ctx, boss, actor, h.dmg, {
        attackId: `${h.id}:${actor.id}`,
        heavy: false,
        shake: 3,
        hitStopMs: 40,
        immuneFor: 0.55,
      });
    }
    if (h.r >= h.max) list.splice(i, 1);
  }
}

export function cancel(ctx, boss) {
  releasePinned(boss, 'kill');
  boss.cast = null;
  boss.rooted = false;
  boss.dashing = false;
  boss.vx = 0;
  boss.vy = 0;
  boss.hazards = [];
  boss.swings = [];
  if (boss.fx) {
    boss.fx.chain = null;
    boss.fx.wings = 0;
    boss.fx.sword = null;
    boss.fx.spin = 0;
  }
  telegraph.reset();
  projectiles.clear(ctx, 'boss', { sparks: false });
}

export function begin(ctx, boss, id) {
  if (!known(id)) return false;
  installDrawer();
  acquireTarget(ctx, boss);
  const meta = PATTERN[id];
  boss.cast = {
    id,
    t: 0,
    step: null,
    windEnd: meta && meta.wind ? meta.wind : 0.45,
    token: token(),
  };
  boss.rooted = true;
  boss.vx = 0;
  boss.vy = 0;
  boss.dashing = false;
  announce(ctx, boss, id);
  if (id === 'p3_smite') ctx.audio?.playSfx('sfx.smite');
  else ctx.audio?.playSfx('sfx.telegraph');
  return true;
}

export function update(ctx, boss, dt) {
  const c = boss.cast;
  if (!c) return false;
  c.t += dt;
  const fn = HANDLERS[c.id];
  const done = fn ? !!fn(ctx, boss, c, dt) : true;
  if (done) endCast(boss);
  return !done;
}

export function init() {}
export function reset() {}
