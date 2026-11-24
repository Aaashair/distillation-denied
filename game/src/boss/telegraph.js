// OWNER: W2
// Floor telegraphs. Outline is the full danger from frame one; the red fill
// grows from the origin and reaches the outline at the hit. `t` in the debug
// snapshot is elapsed seconds. Drawn on the floor layer (before actors).

import { EVENTS } from '../core/contracts.js';
import { ROOM } from '../config/balance.js';

const INK = '#1b1530';
const GOLD = '#e7c27a';
const IVORY = '#f4f1ea';
const RED = '194, 59, 59';

/** @type {object[]} */
let list = [];
let seq = 1;

function emitBoth(ctx, name, tele) {
  ctx.bus.emit(name, {
    attack: tele.attack || null,
    shape: tele.kind,
    id: tele.id,
    duration: tele.duration,
    x: tele.x,
    y: tele.y,
    r: tele.r,
  });
}

function inRoom(x, y) {
  return x >= ROOM.x && y >= ROOM.y && x <= ROOM.x + ROOM.w && y <= ROOM.y + ROOM.h;
}

/**
 * @param {import('../core/contracts.js').GameContext} ctx
 * @param {object} spec
 */
export function spawn(ctx, spec) {
  const tele = {
    id: spec.id || `tg${seq}`,
    kind: spec.kind || spec.shape || 'circle',
    x: spec.x || 0,
    y: spec.y || 0,
    r: spec.r || 0,
    elapsed: 0,
    duration: Math.max(0.05, spec.duration || 0.5),
    attack: spec.attack || null,
    dirX: spec.dirX == null ? 1 : spec.dirX,
    dirY: spec.dirY || 0,
    length: spec.length || spec.r || 40,
    width: spec.width || 8,
    w: spec.w || spec.width || 8,
    h: spec.h || spec.width || 8,
    arc: spec.arc || Math.PI / 2,
    safeZones: spec.safeZones || null,
    axis: spec.axis || 'h',
    gap: spec.gap || 0,
    gapSize: spec.gapSize || 40,
    mark: spec.mark || '',
    fake: !!spec.fake,
    tone: spec.tone || '',
    onResolve: spec.onResolve || null,
    alive: true,
  };
  seq += 1;
  list.push(tele);
  emitBoth(ctx, EVENTS.TELEGRAPH_START, tele);
  return tele;
}

function angleDelta(a, b) {
  let d = Math.abs(a - b);
  if (d > Math.PI) d = Math.PI * 2 - d;
  return d;
}

export function contains(tele, x, y) {
  if (!tele) return false;
  if (tele.kind === 'fullscreen') {
    const zones = tele.safeZones || [];
    for (let i = 0; i < zones.length; i += 1) {
      const z = zones[i];
      if (Math.hypot(x - z.x, y - z.y) <= z.r) return false;
    }
    return inRoom(x, y);
  }
  if (tele.kind === 'gap') {
    if (!inRoom(x, y)) return false;
    const half = (tele.gapSize || 40) * 0.5;
    if (tele.axis === 'v') return Math.abs(x - tele.gap) > half;
    return Math.abs(y - tele.gap) > half;
  }
  const dx = x - tele.x;
  const dy = y - tele.y;
  const dist = Math.hypot(dx, dy);
  if (tele.kind === 'rect') {
    return Math.abs(dx) <= (tele.w || 8) * 0.5 && Math.abs(dy) <= (tele.h || 8) * 0.5;
  }
  if (tele.kind === 'circle' || tele.kind === 'ring') return dist <= tele.r + 0.5;
  if (tele.kind === 'cone' || tele.kind === 'sector') {
    if (dist > tele.r) return false;
    const ang = Math.atan2(dy, dx);
    const aim = Math.atan2(tele.dirY, tele.dirX);
    return angleDelta(ang, aim) <= (tele.arc || 0) * 0.5;
  }
  if (tele.kind === 'line' || tele.kind === 'aim') {
    const len = tele.length || 1;
    const px = tele.dirX;
    const py = tele.dirY;
    const t = Math.max(0, Math.min(len, dx * px + dy * py));
    const cx = tele.x + px * t;
    const cy = tele.y + py * t;
    return Math.hypot(x - cx, y - cy) <= (tele.width || 8) * 0.5;
  }
  return dist <= (tele.r || 0);
}

export function active() {
  return list.filter((t) => t.alive);
}

/** Plain rows for __debug.state(). `t` is elapsed seconds. */
export function snapshot() {
  const out = [];
  for (let i = 0; i < list.length; i += 1) {
    const t = list[i];
    if (!t.alive) continue;
    out.push({
      kind: t.kind,
      x: t.x,
      y: t.y,
      r: t.r || t.width || 0,
      t: t.elapsed,
      attack: t.attack || '',
      duration: t.duration,
    });
  }
  return out;
}

export function update(ctx, dt) {
  for (let i = list.length - 1; i >= 0; i -= 1) {
    const tele = list[i];
    if (!tele || !tele.alive) {
      if (tele) list.splice(i, 1);
      continue;
    }
    tele.elapsed += dt;
    if (tele.elapsed < tele.duration) continue;
    tele.alive = false;
    if (typeof tele.onResolve === 'function') tele.onResolve(ctx, tele);
    emitBoth(ctx, EVENTS.TELEGRAPH_RESOLVE, tele);
    emitBoth(ctx, EVENTS.TELEGRAPH_END, tele);
    const idx = list.indexOf(tele);
    if (idx >= 0) list.splice(idx, 1);
  }
}

function throb(t, speed) {
  return 0.62 + 0.38 * Math.abs(Math.sin(t * (speed || 12)));
}

function danger(k) {
  const a = Math.max(0, Math.min(0.72, 0.16 + 0.52 * k));
  return `rgba(${RED}, ${a.toFixed(3)})`;
}

function strokeClosed(g, alpha) {
  g.save();
  g.globalAlpha = 0.95;
  g.lineWidth = 4;
  g.strokeStyle = INK;
  g.stroke();
  g.globalAlpha = alpha;
  g.lineWidth = 2;
  g.strokeStyle = GOLD;
  g.stroke();
  g.restore();
}

function poly(g, pts) {
  g.beginPath();
  g.moveTo(Math.round(pts[0][0]), Math.round(pts[0][1]));
  for (let i = 1; i < pts.length; i += 1) {
    g.lineTo(Math.round(pts[i][0]), Math.round(pts[i][1]));
  }
  g.closePath();
}

function lineBox(tele, dist) {
  const hw = (tele.width || 8) * 0.5;
  const px = -tele.dirY;
  const py = tele.dirX;
  const x = tele.x;
  const y = tele.y;
  const x2 = x + tele.dirX * dist;
  const y2 = y + tele.dirY * dist;
  return [
    [x + px * hw, y + py * hw],
    [x2 + px * hw, y2 + py * hw],
    [x2 - px * hw, y2 - py * hw],
    [x - px * hw, y - py * hw],
  ];
}

function drawSafe(g, z, t) {
  const x = Math.round(z.x);
  const y = Math.round(z.y);
  const r = Math.max(2, Math.round(z.r));
  const pulse = throb(t, 9);
  g.beginPath();
  g.arc(x, y, r + 3, 0, Math.PI * 2);
  g.fillStyle = INK;
  g.globalAlpha = 0.85;
  g.fill();
  g.beginPath();
  g.arc(x, y, r, 0, Math.PI * 2);
  g.fillStyle = IVORY;
  g.globalAlpha = 0.92;
  g.fill();
  g.beginPath();
  g.arc(x, y, r - 3, 0, Math.PI * 2);
  g.strokeStyle = GOLD;
  g.globalAlpha = pulse;
  g.lineWidth = 2;
  g.stroke();
  g.globalAlpha = 1;
  g.fillStyle = INK;
  g.fillRect(x - 1, y - 1, 3, 3);
  g.fillStyle = '#fff';
  g.fillRect(x, y, 1, 1);
}

function drawTele(g, t) {
  const k = Math.max(0, Math.min(1, t.elapsed / t.duration));
  const pulse = throb(t.elapsed, t.fake ? 16 : 11);
  const x = Math.round(t.x);
  const y = Math.round(t.y);

  if (t.kind === 'fullscreen') {
    g.globalAlpha = 1;
    g.fillStyle = danger(k);
    g.fillRect(ROOM.x, ROOM.y, ROOM.w, ROOM.h);
    g.strokeStyle = GOLD;
    g.globalAlpha = pulse;
    g.lineWidth = 2;
    g.strokeRect(ROOM.x + 2, ROOM.y + 2, ROOM.w - 4, ROOM.h - 4);
    const zones = t.safeZones || [];
    for (let i = 0; i < zones.length; i += 1) drawSafe(g, zones[i], t.elapsed);
    g.globalAlpha = 1;
    return;
  }

  if (t.kind === 'gap') {
    const half = (t.gapSize || 40) * 0.5;
    const axisV = t.axis === 'v';
    g.globalAlpha = 1;
    g.fillStyle = danger(k);
    if (axisV) {
      const cut = t.gap;
      g.fillRect(ROOM.x, ROOM.y, Math.max(0, cut - half - ROOM.x), ROOM.h);
      const right = cut + half;
      g.fillRect(right, ROOM.y, Math.max(0, ROOM.x + ROOM.w - right), ROOM.h);
      drawSafe(g, { x: cut, y: ROOM.y + ROOM.h / 2, r: Math.min(18, half * 0.45) }, t.elapsed);
      g.globalAlpha = pulse;
      g.fillStyle = GOLD;
      g.fillRect(Math.round(cut - half), ROOM.y, Math.round(half * 2), 3);
      g.fillRect(Math.round(cut - half), ROOM.y + ROOM.h - 3, Math.round(half * 2), 3);
    } else {
      const cut = t.gap;
      g.fillRect(ROOM.x, ROOM.y, ROOM.w, Math.max(0, cut - half - ROOM.y));
      const below = cut + half;
      g.fillRect(ROOM.x, below, ROOM.w, Math.max(0, ROOM.y + ROOM.h - below));
      drawSafe(g, { x: ROOM.x + ROOM.w / 2, y: cut, r: Math.min(18, half * 0.45) }, t.elapsed);
      g.globalAlpha = pulse;
      g.fillStyle = GOLD;
      g.fillRect(ROOM.x, Math.round(cut - half), 3, Math.round(half * 2));
      g.fillRect(ROOM.x + ROOM.w - 3, Math.round(cut - half), 3, Math.round(half * 2));
    }
    g.globalAlpha = 1;
    g.fillStyle = IVORY;
    if (axisV) g.fillRect(Math.round(t.gap - half), ROOM.y, Math.round(half * 2), ROOM.h);
    else g.fillRect(ROOM.x, Math.round(t.gap - half), ROOM.w, Math.round(half * 2));
    g.strokeStyle = GOLD;
    g.lineWidth = 3;
    g.globalAlpha = pulse;
    if (axisV) g.strokeRect(Math.round(t.gap - half), ROOM.y, Math.round(half * 2), ROOM.h);
    else g.strokeRect(ROOM.x, Math.round(t.gap - half), ROOM.w, Math.round(half * 2));
    g.globalAlpha = 1;
    return;
  }

  if (t.kind === 'line' || t.kind === 'aim') {
    const full = lineBox(t, t.length || 40);
    const grow = lineBox(t, (t.length || 40) * k);
    const slim = t.kind === 'aim';
    poly(g, full);
    strokeClosed(g, pulse);
    if (!t.fake) {
      g.fillStyle = danger(Math.max(k, 0.15));
      poly(g, grow);
      g.fill();
    }
    if (slim) {
      const hx = Math.round(t.x + t.dirX * (t.length || 40) * k);
      const hy = Math.round(t.y + t.dirY * (t.length || 40) * k);
      g.fillStyle = t.tone === 'gold' ? GOLD : '#fff';
      g.fillRect(hx - 2, hy - 2, 5, 5);
      g.fillStyle = INK;
      g.fillRect(hx - 1, hy - 1, 3, 3);
    }
    return;
  }

  if (t.kind === 'cone' || t.kind === 'sector') {
    const aim = Math.atan2(t.dirY, t.dirX);
    const half = (t.arc || 1) * 0.5;
    const r = Math.max(2, t.r);
    const blink = !t.fake || ((t.elapsed % (t.duration * 0.5)) < t.duration * 0.5 * 0.62);
    g.beginPath();
    g.moveTo(x, y);
    g.arc(x, y, r, aim - half, aim + half);
    g.closePath();
    if (t.fake) {
      g.save();
      g.globalAlpha = blink ? 0.62 : 0.12;
      g.fillStyle = GOLD;
      g.fill();
      g.globalAlpha = blink ? 1 : 0.3;
      g.lineWidth = 4;
      g.strokeStyle = INK;
      g.stroke();
      g.strokeStyle = '#fff6d0';
      g.lineWidth = 2;
      g.stroke();
      g.restore();
      return;
    }
    strokeClosed(g, pulse);
    g.beginPath();
    g.moveTo(x, y);
    g.arc(x, y, Math.max(1, r * k), aim - half, aim + half);
    g.closePath();
    g.fillStyle = danger(1);
    g.fill();
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(Math.round(x + Math.cos(aim) * r), Math.round(y + Math.sin(aim) * r));
    g.strokeStyle = 'rgba(255,255,255,0.85)';
    g.lineWidth = 1;
    g.stroke();
    return;
  }

  if (t.kind === 'rect') {
    const w = t.w || 20;
    const h = t.h || 12;
    g.strokeStyle = INK;
    g.lineWidth = 4;
    g.strokeRect(Math.round(x - w / 2), Math.round(y - h / 2), w, h);
    g.strokeStyle = GOLD;
    g.globalAlpha = pulse;
    g.lineWidth = 2;
    g.strokeRect(Math.round(x - w / 2), Math.round(y - h / 2), w, h);
    g.globalAlpha = 1;
    g.fillStyle = danger(1);
    g.fillRect(Math.round(x - (w * k) / 2), Math.round(y - (h * k) / 2), Math.round(w * k), Math.round(h * k));
    return;
  }

  const radius = Math.max(2, t.r || 8);
  g.beginPath();
  g.arc(x, y, radius, 0, Math.PI * 2);
  strokeClosed(g, pulse);
  if (t.kind === 'ring' || t.mark === 'sigil' || t.mark === 'glyph') {
    const spin = t.elapsed * 3.2;
    g.strokeStyle = GOLD;
    g.lineWidth = 2;
    g.globalAlpha = pulse;
    const ticks = t.mark === 'sigil' ? 6 : 4;
    for (let i = 0; i < ticks; i += 1) {
      const a = spin + (i / ticks) * Math.PI * 2;
      g.beginPath();
      g.moveTo(Math.round(x + Math.cos(a) * (radius * 0.45)), Math.round(y + Math.sin(a) * (radius * 0.45)));
      g.lineTo(Math.round(x + Math.cos(a) * radius), Math.round(y + Math.sin(a) * radius));
      g.stroke();
    }
    g.globalAlpha = 1;
  }
  if (!t.fake) {
    g.beginPath();
    g.arc(x, y, Math.max(1, radius * k), 0, Math.PI * 2);
    g.fillStyle = danger(1);
    g.fill();
  }
  if (t.mark === 'impact') {
    g.strokeStyle = '#fff';
    g.globalAlpha = pulse;
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(x - radius, y);
    g.lineTo(x + radius, y);
    g.moveTo(x, y - radius);
    g.lineTo(x, y + radius);
    g.stroke();
    g.globalAlpha = 1;
  }
}

function drawSwings(g, boss) {
  const swings = boss.swings || [];
  for (let i = 0; i < swings.length; i += 1) {
    const s = swings[i];
    const k = Math.max(0, s.life / (s.max || s.life || 1));
    g.save();
    g.globalAlpha = 0.35 + 0.65 * k;
    g.strokeStyle = INK;
    g.lineWidth = 8;
    g.beginPath();
    g.arc(Math.round(boss.x), Math.round(boss.y), s.r, s.ang - s.arc * 0.5, s.ang + s.arc * 0.5);
    g.stroke();
    g.strokeStyle = s.color || IVORY;
    g.lineWidth = 3;
    g.stroke();
    g.strokeStyle = '#fff';
    g.lineWidth = 1;
    g.stroke();
    g.restore();
  }
}

function drawHazards(g, boss) {
  const hazards = boss.hazards || [];
  for (let i = 0; i < hazards.length; i += 1) {
    const h = hazards[i];
    const x = Math.round(h.x);
    const y = Math.round(h.y);
    const r = Math.max(2, Math.round(h.r));
    const band = Math.max(6, Math.round(h.thick || 10));
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.strokeStyle = 'rgba(194,59,59,0.55)';
    g.lineWidth = band;
    g.stroke();
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.strokeStyle = INK;
    g.lineWidth = 8;
    g.stroke();
    g.strokeStyle = GOLD;
    g.lineWidth = 4;
    g.stroke();
    g.strokeStyle = '#fff';
    g.lineWidth = 1;
    g.stroke();
  }
}

function drawFx(ctx, g, boss) {
  const fx = boss.fx;
  if (!fx) return;
  const x = Math.round(boss.x);
  const y = Math.round(boss.y);
  const time = ctx.time ? ctx.time.elapsed : 0;

  if (fx.morph > 0) {
    const n = 16;
    const rad = 12 + fx.morph * 26;
    for (let i = 0; i < n; i += 1) {
      const a = fx.morph * 2 + (i / n) * Math.PI * 2;
      g.fillStyle = i % 2 ? GOLD : IVORY;
      g.fillRect(Math.round(x + Math.cos(a) * rad) - 1, Math.round(y - 14 + Math.sin(a) * rad) - 1, 3, 3);
    }
  }

  if (fx.blink > 0) {
    g.strokeStyle = GOLD;
    g.lineWidth = 2;
    g.globalAlpha = Math.min(1, fx.blink * 4);
    g.beginPath();
    g.arc(x, y, 16 + Math.round((0.2 - fx.blink) * 40), 0, Math.PI * 2);
    g.stroke();
    g.globalAlpha = 1;
  }

  if (fx.windup || fx.hurt) {
    const pr = 14 + Math.round(throb(time, fx.accel ? 18 : 10) * 6);
    g.strokeStyle = fx.hurt ? '#fff' : GOLD;
    g.lineWidth = 2;
    g.globalAlpha = fx.hurt ? 0.9 : 0.75;
    g.beginPath();
    g.arc(x, y - 6, pr, 0, Math.PI * 2);
    g.stroke();
    g.globalAlpha = 1;
  }

  if (fx.halo) {
    const ang = fx.haloAng || 0;
    g.strokeStyle = INK;
    g.lineWidth = 4;
    g.beginPath();
    g.arc(x, y - 8, 30, 0, Math.PI * 2);
    g.stroke();
    g.strokeStyle = GOLD;
    g.lineWidth = 2;
    g.stroke();
    const ticks = fx.arms === 3 ? 3 : (fx.arms === 2 ? 2 : 8);
    const len0 = ticks <= 3 ? 18 : 26;
    const len1 = ticks <= 3 ? 40 : 34;
    g.lineWidth = ticks <= 3 ? 3 : 2;
    for (let i = 0; i < ticks; i += 1) {
      const a = ang + (i / ticks) * Math.PI * 2;
      g.strokeStyle = INK;
      g.beginPath();
      g.moveTo(Math.round(x + Math.cos(a) * len0), Math.round(y - 8 + Math.sin(a) * len0));
      g.lineTo(Math.round(x + Math.cos(a) * len1), Math.round(y - 8 + Math.sin(a) * len1));
      g.stroke();
      g.strokeStyle = GOLD;
      g.stroke();
    }
  }

  if (fx.accel) {
    g.strokeStyle = GOLD;
    g.lineWidth = 2;
    g.globalAlpha = 0.85;
    g.beginPath();
    g.arc(x, y - 10, 44, 0, Math.PI * 2);
    g.stroke();
    g.globalAlpha = 1;
  }

  const wings = fx.wings;
  if (wings && wings.spread > 0) {
    const n = wings.n || 6;
    const reach = 26 + wings.spread * 58;
    for (let i = 0; i < n; i += 1) {
      const a = (wings.base || 0) + (i / n) * Math.PI * 2 + Math.sin(wings.flap * 6) * 0.08;
      const x2 = Math.round(x + Math.cos(a) * reach);
      const y2 = Math.round(y - 12 + Math.sin(a) * reach);
      const px = Math.round(-Math.sin(a) * 4);
      const py = Math.round(Math.cos(a) * 4);
      g.fillStyle = INK;
      g.beginPath();
      g.moveTo(x, y - 12);
      g.lineTo(x2 + px, y2 + py);
      g.lineTo(x2 - px, y2 - py);
      g.closePath();
      g.fill();
      g.fillStyle = GOLD;
      g.beginPath();
      g.moveTo(x, y - 12);
      g.lineTo(Math.round(x2 + px * 0.5), Math.round(y2 + py * 0.5));
      g.lineTo(Math.round(x2 - px * 0.5), Math.round(y2 - py * 0.5));
      g.closePath();
      g.fill();
    }
  }

  if (fx.sword) {
    const s = fx.sword;
    const len = s.len || 40;
    const x2 = Math.round(x + Math.cos(s.ang) * len);
    const y2 = Math.round(y - 8 + Math.sin(s.ang) * len);
    g.strokeStyle = INK;
    g.lineWidth = 5;
    g.beginPath();
    g.moveTo(x, y - 8);
    g.lineTo(x2, y2);
    g.stroke();
    g.strokeStyle = s.hot ? '#fff' : GOLD;
    g.lineWidth = 2;
    g.stroke();
    const glide = 0.25 + 0.7 * (0.5 + 0.5 * Math.sin(time * 14));
    const gx = Math.round(x + Math.cos(s.ang) * len * glide);
    const gy = Math.round(y - 8 + Math.sin(s.ang) * len * glide);
    g.fillStyle = '#fff';
    g.fillRect(gx - 2, gy - 2, 4, 4);
  }

  const chain = fx.chain;
  if (chain) {
    g.lineWidth = 3;
    for (let s = 0; s < chain.length; s += 1) {
      const pts = chain[s];
      if (!pts || pts.length < 2) continue;
      g.strokeStyle = INK;
      g.beginPath();
      g.moveTo(Math.round(x), Math.round(y));
      for (let p = 0; p < pts.length; p += 1) g.lineTo(Math.round(pts[p].x), Math.round(pts[p].y));
      g.stroke();
      g.strokeStyle = GOLD;
      g.lineWidth = 1;
      g.stroke();
      g.lineWidth = 3;
    }
  }

  if (fx.spin > 0) {
    g.save();
    g.translate(x, y);
    g.rotate(fx.spin);
    g.strokeStyle = '#ffb089';
    g.lineWidth = 3;
    g.beginPath();
    g.arc(0, 0, 20, 0, Math.PI * 1.3);
    g.stroke();
    g.restore();
  }
}

export function render(ctx, g) {
  const prev = g.imageSmoothingEnabled;
  g.imageSmoothingEnabled = false;
  g.save();
  for (let i = 0; i < list.length; i += 1) {
    const t = list[i];
    if (!t || !t.alive) continue;
    g.save();
    drawTele(g, t);
    g.restore();
  }
  const boss = ctx.boss;
  if (boss) {
    drawFx(ctx, g, boss);
    drawSwings(g, boss);
    drawHazards(g, boss);
  }
  g.restore();
  g.imageSmoothingEnabled = prev;
}

export function reset() {
  list = [];
}

export function init(ctx) {
  ctx.world.telegraph = {
    spawn, update, render, reset, active, contains, snapshot,
  };
}
