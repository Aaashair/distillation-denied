// OWNER: INTEGRATOR
// Shared bullet pool for both teams. Circle-circle vs actors, culled outside
// the room. W3 replaces the look with setDrawer(fn(g, bullet)) — do not fork
// the pool. clear(ctx, team, { sparks, near:{x,y,r} }) turns matches into sparks.
// query(pred) is there for shield blocking and beam deletion.

import { EVENTS } from '../core/contracts.js';
import { applyHit } from '../core/combat.js';
import { activeInner, PLAYER } from '../config/balance.js';

const POOL = 180;
const ENEMY_CAP = 120;

function blank() {
  return {
    alive: false,
    team: 'boss',
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    r: 3,
    dmg: 1,
    life: 1,
    shape: 'dot',
    color: '#f4f1ea',
    pierce: 0,
    homing: 0,
    accel: 0,
    angularVel: 0,
    wobble: 0,
    knock: 0,
    attackId: '',
    ownerId: '',
    onHit: null,
    age: 0,
    hits: null,
    ox: 0,
    oy: 0,
    maxRange: 0,
    traveled: 0,
    ignoreWalls: false,
  };
}

const bullets = Array.from({ length: POOL }, () => blank());
let cursor = 0;
/** @type {(g: CanvasRenderingContext2D, b: object) => void} */
let drawer = defaultDraw;

function hostile(bulletTeam, actorTeam) {
  if (bulletTeam === 'boss') return actorTeam === 'player' || actorTeam === 'ally';
  if (bulletTeam === 'player' || bulletTeam === 'ally') return actorTeam === 'boss' || actorTeam === 'neutral';
  return false;
}

function hurtables(ctx) {
  /** @type {import('../core/contracts.js').Actor[]} */
  const out = [];
  if (ctx.player && ctx.player.alive) out.push(ctx.player);
  if (ctx.boss && ctx.boss.alive && ctx.state.current === 'fight') out.push(ctx.boss);
  const allies = ctx.allies || [];
  for (let i = 0; i < allies.length; i += 1) {
    if (allies[i] && allies[i].alive) out.push(allies[i]);
  }
  if (ctx.stele && ctx.stele.alive) out.push(ctx.stele);
  return out;
}

function outside(x, y, rect) {
  return x < rect.x - 4 || y < rect.y - 4 || x > rect.x + rect.w + 4 || y > rect.y + rect.h + 4;
}

function defaultDraw(g, b) {
  const x = Math.round(b.x);
  const y = Math.round(b.y);
  g.fillStyle = '#1b1530';
  g.fillRect(x - b.r - 1, y - b.r - 1, b.r * 2 + 2, b.r * 2 + 2);
  g.fillStyle = b.color || '#f4f1ea';
  if (b.shape === 'fin' || b.shape === 'bolt') {
    g.save();
    g.translate(x, y);
    g.rotate(Math.atan2(b.vy, b.vx));
    g.fillRect(-b.r - 2, -2, b.r * 2 + 3, 4);
    g.fillStyle = '#fff';
    g.fillRect(-1, -1, 2, 2);
    g.restore();
  } else if (b.shape === 'orb') {
    g.beginPath();
    g.arc(x, y, b.r, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#fff';
    g.fillRect(x - 1, y - 1, 3, 3);
  } else if (b.shape === 'petal') {
    g.save();
    g.translate(x, y);
    g.rotate(Math.atan2(b.vy, b.vx));
    g.beginPath();
    g.ellipse(0, 0, b.r + 2, b.r, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#fff';
    g.fillRect(-1, -1, 2, 2);
    g.restore();
  } else {
    g.fillRect(x - b.r, y - b.r, b.r * 2, b.r * 2);
    g.fillStyle = '#fff';
    g.fillRect(x - 1, y - 1, 2, 2);
  }
}

export function setDrawer(fn) {
  drawer = typeof fn === 'function' ? fn : defaultDraw;
}

export function getDrawer() {
  return drawer;
}

export function count(team) {
  let n = 0;
  for (let i = 0; i < bullets.length; i += 1) {
    const b = bullets[i];
    if (!b.alive) continue;
    if (!team || b.team === team) n += 1;
  }
  return n;
}

export function counts() {
  let enemy = 0;
  let player = 0;
  for (let i = 0; i < bullets.length; i += 1) {
    const b = bullets[i];
    if (!b.alive) continue;
    if (b.team === 'boss') enemy += 1;
    else player += 1;
  }
  return { enemy, player };
}

/**
 * @param {import('../core/contracts.js').GameContext} ctx
 * @param {object} spec
 */
export function spawn(ctx, spec) {
  if (!spec) return null;
  if (spec.team === 'boss' && count('boss') >= ENEMY_CAP) return null;
  let slot = null;
  for (let i = 0; i < POOL; i += 1) {
    const b = bullets[(cursor + i) % POOL];
    if (!b.alive) {
      slot = b;
      cursor = (cursor + i + 1) % POOL;
      break;
    }
  }
  if (!slot) return null;
  const base = blank();
  Object.assign(slot, base, spec, { alive: true, age: 0 });
  slot.hits = new Set();
  if (!slot.r) slot.r = 3;
  // Range cap is Euclidean displacement from the spawn point, not path length
  // and not `life`. Wobble adds path length without moving the straight reach,
  // and one sim step is clamped back onto the circle so 50 Hz and 60 Hz stop
  // on the same radius. `traveled` is the polyline length (diagnostic only).
  // `ignoreWalls` skips the room cull so an open-room test can see maxRange.
  if (slot.maxRange > 0) {
    slot.ox = slot.x;
    slot.oy = slot.y;
    slot.traveled = 0;
  }
  ctx.bus?.emit(EVENTS.BULLET_SPAWN, {
    team: slot.team,
    x: slot.x,
    y: slot.y,
    shape: slot.shape,
  });
  return slot;
}

/**
 * @param {import('../core/contracts.js').GameContext} ctx
 * @param {string|null} team  null clears every team
 * @param {{sparks?: boolean, near?: {x:number, y:number, r:number}, color?: string}} [opts]
 */
export function clear(ctx, team, opts = {}) {
  const near = opts.near;
  const r2 = near ? near.r * near.r : 0;
  for (let i = 0; i < bullets.length; i += 1) {
    const b = bullets[i];
    if (!b.alive) continue;
    if (team && b.team !== team) continue;
    if (near) {
      const dx = b.x - near.x;
      const dy = b.y - near.y;
      if (dx * dx + dy * dy > r2) continue;
    }
    b.alive = false;
    if (opts.sparks !== false) {
      ctx.bus?.emit(EVENTS.VFX, {
        kind: 'spark',
        x: b.x,
        y: b.y,
        color: opts.color || '#e7c27a',
      });
    }
  }
}

/** @param {(b: object) => boolean} pred */
export function query(pred) {
  const out = [];
  for (let i = 0; i < bullets.length; i += 1) {
    const b = bullets[i];
    if (b.alive && pred(b)) out.push(b);
  }
  return out;
}

/** Kill bullets matching pred. Returns how many died. */
export function killWhere(ctx, pred, opts = {}) {
  let n = 0;
  for (let i = 0; i < bullets.length; i += 1) {
    const b = bullets[i];
    if (!b.alive || !pred(b)) continue;
    b.alive = false;
    n += 1;
    if (opts.sparks !== false) {
      ctx.bus?.emit(EVENTS.VFX, { kind: 'spark', x: b.x, y: b.y, color: opts.color || '#9fd8ff' });
    }
  }
  return n;
}

function shieldBlocks(ctx, b) {
  const guards = [];
  if (ctx.player && ctx.player.alive && ctx.player.shield) guards.push(ctx.player);
  const allies = ctx.allies || [];
  for (let i = 0; i < allies.length; i += 1) {
    if (allies[i] && allies[i].alive && allies[i].shield) guards.push(allies[i]);
  }
  for (let i = 0; i < guards.length; i += 1) {
    const p = guards[i];
    if (b.team !== 'boss') continue;
    const dx = b.x - p.x;
    const dy = b.y - p.y;
    const dist = Math.hypot(dx, dy);
    if (dist > 30 || dist < 0.001) continue;
    const ax = Number.isFinite(p.aimX) ? p.aimX : 0;
    const ay = Number.isFinite(p.aimY) ? p.aimY : 0;
    const aim = (ax === 0 && ay === 0) ? -Math.PI / 2 : Math.atan2(ay, ax);
    const ang = Math.atan2(dy, dx);
    let d = Math.abs(ang - aim);
    if (d > Math.PI) d = Math.PI * 2 - d;
    const half = (p.shieldArc || (100 * Math.PI / 180)) * 0.5;
    if (d > half) continue;
    const perfect = (p.shieldAge || 0) <= (p.perfectWindow || 0.2);
    ctx.bus?.emit(EVENTS.SHIELD_BLOCK, { id: p.id, perfect, x: b.x, y: b.y });
    if (perfect && !p.perfectSpent) {
      p.perfectSpent = true;
      ctx.bus?.emit(EVENTS.PERFECT_GUARD, { id: p.id });
      ctx.audio?.playSfx('sfx.perfect');
      ctx.time?.requestHitStop(80);
      ctx.bus?.emit(EVENTS.HIT_STOP, { ms: 80 });
      ctx.bus?.emit(EVENTS.SHAKE, { mag: 3, dur: 0.12 });
      ctx.bus?.emit(EVENTS.VFX, { kind: 'shock', x: p.x, y: p.y, r: 56, color: '#e7c27a' });
      if (ctx.boss && ctx.boss.alive) {
        const bd = Math.hypot(ctx.boss.x - p.x, ctx.boss.y - p.y);
        if (bd <= 56 + ctx.boss.r) {
          applyHit(ctx, p, ctx.boss, PLAYER.glm.skill.ringDmg, { attackId: `perfect-${p.id}-${Math.floor(ctx.time.elapsed * 10)}`, heavy: true, hitStopMs: 0 });
        }
      }
      b.team = 'player';
      b.ownerId = p.id;
      b.dmg = 8;
      b.vx *= -1;
      b.vy *= -1;
      b.hits = new Set();
      b.life = Math.max(b.life, 0.4);
      return 'reflect';
    }
    ctx.audio?.playSfx('sfx.guard');
    b.alive = false;
    ctx.bus?.emit(EVENTS.VFX, { kind: 'spark', x: b.x, y: b.y, color: '#d8b15a' });
    return 'block';
  }
  return '';
}

export function update(ctx, dt) {
  const rect = activeInner(ctx.state.current);
  const actors = hurtables(ctx);
  for (let i = 0; i < bullets.length; i += 1) {
    const b = bullets[i];
    if (!b.alive) continue;
    b.age += dt;
    b.life -= dt;
    if (b.life <= 0) {
      b.alive = false;
      continue;
    }
    if (b.angularVel) {
      const sp = Math.hypot(b.vx, b.vy);
      const ang = Math.atan2(b.vy, b.vx) + b.angularVel * dt;
      b.vx = Math.cos(ang) * sp;
      b.vy = Math.sin(ang) * sp;
    }
    if (b.accel) {
      const sp = Math.hypot(b.vx, b.vy) || 1;
      b.vx += (b.vx / sp) * b.accel * dt;
      b.vy += (b.vy / sp) * b.accel * dt;
    }
    if (b.homing) {
      const tgt = b.team === 'boss' ? ctx.player : ctx.boss;
      if (tgt && tgt.alive) {
        const desired = Math.atan2(tgt.y - b.y, tgt.x - b.x);
        let ang = Math.atan2(b.vy, b.vx);
        let diff = desired - ang;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        const rate = typeof b.homing === 'number' ? b.homing : 1.2;
        const step = Math.max(-rate * dt, Math.min(rate * dt, diff));
        ang += step;
        const sp = Math.hypot(b.vx, b.vy);
        b.vx = Math.cos(ang) * sp;
        b.vy = Math.sin(ang) * sp;
      }
    }
    const px = b.x;
    const py = b.y;
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    if (b.wobble) {
      const ang = Math.atan2(b.vy, b.vx);
      const w = Math.sin(b.age * 8) * b.wobble * dt;
      b.x += -Math.sin(ang) * w;
      b.y += Math.cos(ang) * w;
    }
    if (b.maxRange > 0) {
      b.traveled = (b.traveled || 0) + Math.hypot(b.x - px, b.y - py);
      const dx = b.x - b.ox;
      const dy = b.y - b.oy;
      const disp = Math.hypot(dx, dy);
      if (disp >= b.maxRange) {
        const s = b.maxRange / (disp || 1);
        b.x = b.ox + dx * s;
        b.y = b.oy + dy * s;
        b.alive = false;
        continue;
      }
    }
    if (!b.ignoreWalls && outside(b.x, b.y, rect)) {
      b.alive = false;
      continue;
    }
    const shield = shieldBlocks(ctx, b);
    if (shield === 'block' || !b.alive) continue;

    for (let a = 0; a < actors.length; a += 1) {
      const actor = actors[a];
      if (!actor.alive || !hostile(b.team, actor.team)) continue;
      if (b.ownerId && b.ownerId === actor.id) continue;
      if (b.hits && b.hits.has(actor.id)) continue;
      const dx = actor.x - b.x;
      const dy = actor.y - b.y;
      const reach = (actor.r || 0) + (b.r || 0);
      if (dx * dx + dy * dy > reach * reach) continue;
      if (b.hits) b.hits.add(actor.id);
      const hitOpts = {
        attackId: b.attackId || `b${i}-${Math.floor(b.age * 60)}`,
        knock: b.knock || 0,
        heavy: !!b.heavy,
      };
      if (b.hitStopMs != null) hitOpts.hitStopMs = b.hitStopMs;
      else if ((b.team === 'player' || b.team === 'ally') && !b.heavy) hitOpts.hitStopMs = 0;
      applyHit(ctx, { team: b.team, x: b.x, y: b.y, id: b.ownerId || b.team }, actor, b.dmg, hitOpts);
      if (typeof b.onHit === 'function') b.onHit(ctx, b, actor);
      if (!(b.pierce > 0)) {
        b.alive = false;
        break;
      }
      b.pierce -= 1;
    }
  }
}

export function collect(items) {
  for (let i = 0; i < bullets.length; i += 1) {
    const b = bullets[i];
    if (!b.alive) continue;
    items.push({
      y: b.y,
      draw: (g) => drawer(g, b),
    });
  }
}

export function draw(g) {
  for (let i = 0; i < bullets.length; i += 1) {
    if (bullets[i].alive) drawer(g, bullets[i]);
  }
}

export function reset() {
  for (let i = 0; i < bullets.length; i += 1) bullets[i].alive = false;
  cursor = 0;
}

export function init() {}
