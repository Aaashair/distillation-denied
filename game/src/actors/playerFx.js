// OWNER: W1
// Skill / shot / flask juice drawn in internal pixels.
// main.js does not call this yet, so install() paints onto #view the frame
// after the game blit. Set ctx.flags.playerFxExternal and call render(ctx, g)
// from the internal buffer to retire that overlay.
//
// Bus kinds emitted alongside the draw (W3 may not handle all of them yet):
// slash_arc, beam, shockwave, muzzle, charge, shield_arc, afterimage,
// sparks, dust, heal_pillar, ring, text.

import { EVENTS } from '../core/contracts.js';
import { bi } from '../data/lines.js';
import { activeInner, VIEW_H, VIEW_W } from '../config/balance.js';
import { applyScreen, INTERNAL_H, INTERNAL_W } from '../render/world.js';
import * as projectiles from './projectiles.js';

const INK = '#1b1530';
const fx = [];
let edgeFx = null;
let ctxRef = null;
let started = false;

const GLYPH = {
  '0': ['111', '101', '101', '101', '111'],
  '1': ['010', '110', '010', '010', '111'],
  '2': ['111', '001', '111', '100', '111'],
  '3': ['111', '001', '111', '001', '111'],
  '4': ['101', '101', '111', '001', '001'],
  '5': ['111', '100', '111', '001', '111'],
  '6': ['111', '100', '111', '101', '111'],
  '7': ['111', '001', '010', '010', '010'],
  '8': ['111', '101', '111', '101', '111'],
  '9': ['111', '101', '111', '001', '111'],
  A: ['010', '101', '111', '101', '101'],
  B: ['110', '101', '110', '101', '110'],
  C: ['111', '100', '100', '100', '111'],
  D: ['110', '101', '101', '101', '110'],
  E: ['111', '100', '110', '100', '111'],
  F: ['111', '100', '110', '100', '100'],
  G: ['111', '100', '101', '101', '111'],
  H: ['101', '101', '111', '101', '101'],
  I: ['111', '010', '010', '010', '111'],
  L: ['100', '100', '100', '100', '111'],
  M: ['101', '111', '111', '101', '101'],
  N: ['110', '101', '101', '101', '101'],
  P: ['111', '101', '111', '100', '100'],
  R: ['110', '101', '110', '101', '101'],
  S: ['111', '100', '111', '001', '111'],
  T: ['111', '010', '010', '010', '010'],
  U: ['101', '101', '101', '101', '111'],
  W: ['101', '101', '111', '111', '101'],
  X: ['101', '101', '010', '101', '101'],
  Y: ['101', '101', '010', '010', '010'],
  ' ': ['000', '000', '000', '000', '000'],
};

function push(item) {
  fx.push(item);
  if (fx.length > 200) fx.splice(0, fx.length - 200);
}

function actorsOf(ctx) {
  const list = [];
  if (ctx && ctx.player) list.push(ctx.player);
  const allies = (ctx && ctx.allies) || [];
  for (let i = 0; i < allies.length; i += 1) if (allies[i]) list.push(allies[i]);
  return list;
}

function findActor(ctx, id) {
  if (!ctx) return null;
  if (ctx.player && (!id || ctx.player.id === id)) return ctx.player;
  const allies = ctx.allies || [];
  for (let i = 0; i < allies.length; i += 1) {
    if (allies[i] && allies[i].id === id) return allies[i];
  }
  return ctx.player || null;
}

export function clear() {
  fx.length = 0;
  edgeFx = null;
}

export function tick(dt) {
  const step = dt > 0 ? dt : 0;
  for (let i = fx.length - 1; i >= 0; i -= 1) {
    const item = fx[i];
    item.life -= step;
    if (item.vx) item.x += item.vx * step;
    if (item.vy) item.y += item.vy * step;
    if (item.life <= 0) fx.splice(i, 1);
  }
  if (edgeFx) {
    edgeFx.life -= step;
    if (edgeFx.life <= 0) edgeFx = null;
  }
}

export function ghost(x, y, color) {
  push({ kind: 'ghost', x, y, life: 0.2, max: 0.2, color: color || '#d7f4ff' });
}

export function dust(x, y) {
  for (let i = 0; i < 4; i += 1) {
    push({
      kind: 'dust',
      x: x + (Math.random() - 0.5) * 8,
      y: y + (Math.random() - 0.5) * 4,
      vx: (Math.random() - 0.5) * 28,
      vy: -8 - Math.random() * 16,
      life: 0.28,
      max: 0.28,
      color: i % 2 ? '#f4f1ea' : '#c8bfb0',
      s: 2,
    });
  }
}

export function arcSlash(x, y, ang, color) {
  push({
    kind: 'arc',
    x,
    y,
    ang,
    r: 44,
    span: 1.35,
    life: 0.55,
    max: 0.55,
    color: color || '#d7f4ff',
  });
}

export function ring(x, y, r, color, life) {
  const L = life || 0.35;
  push({ kind: 'ring', x, y, r: r || 28, life: L, max: L, color: color || '#f4f1ea' });
}

export function impact(x, y, color) {
  push({ kind: 'impact', x, y, r: 12, life: 0.22, max: 0.22, color: color || '#fff' });
}

export function label(x, y, text, color) {
  push({
    kind: 'label',
    x,
    y,
    text: String(text || ''),
    life: 0.7,
    max: 0.7,
    color: color || '#f4f1ea',
    vy: -16,
  });
}

/** Canvas strings currently in the juice list. Tests read the selected-language label. */
export function liveLabels() {
  const out = [];
  for (let i = 0; i < fx.length; i += 1) {
    if (fx[i].kind === 'label') out.push(fx[i].text);
  }
  return out;
}

export function edge(color, life) {
  const L = life || 0.18;
  if (!edgeFx || L >= edgeFx.life) edgeFx = { color: color || '#c23b3b', life: L, max: L };
}

export function scorch(x, y, x2, y2) {
  push({ kind: 'scorch', x, y, x2, y2, life: 0.9, max: 0.9 });
}

export function muzzle(actor, ang, color) {
  if (!actor) return;
  actor.muzzleT = 0.09;
  actor.muzzleAng = ang;
  actor.muzzleColor = color || '#fff';
}

/** Ray from (x, y) along ang until it exits rect. */
export function rayToWall(x, y, ang, rect) {
  const box = rect || { x: 0, y: 0, w: VIEW_W, h: VIEW_H };
  const dx = Math.cos(ang);
  const dy = Math.sin(ang);
  let t = 800;
  if (dx > 0.0001) t = Math.min(t, (box.x + box.w - x) / dx);
  else if (dx < -0.0001) t = Math.min(t, (box.x - x) / dx);
  if (dy > 0.0001) t = Math.min(t, (box.y + box.h - y) / dy);
  else if (dy < -0.0001) t = Math.min(t, (box.y - y) / dy);
  if (!Number.isFinite(t) || t < 12) t = 12;
  return { x: x + dx * t, y: y + dy * t, dist: t };
}

function onPerfect(ctx, payload) {
  const actor = findActor(ctx, payload && payload.id);
  if (!actor) return;
  ring(actor.x, actor.y, 84, '#ffe7a3', 0.5);
  ring(actor.x, actor.y, 52, '#fff6d0', 0.4);
  ring(actor.x, actor.y, 28, '#fff', 0.3);
  label(actor.x, actor.y - 30, bi({ zh: '开源之盾', en: 'Open-Source Aegis' }), '#ffe7a3');
  edge('#ffe7a3', 0.16);
}

function onBlock(payload) {
  if (!payload || payload.perfect) return;
  impact(payload.x, payload.y, '#d8b15a');
}

export function install(ctx) {
  ctxRef = ctx || ctxRef;
  if (started || !ctxRef) return;
  started = true;
  if (ctxRef.bus) {
    ctxRef.bus.on(EVENTS.PERFECT_GUARD, (payload) => onPerfect(ctxRef, payload));
    ctxRef.bus.on(EVENTS.SHIELD_BLOCK, (payload) => onBlock(payload));
  }
  setTimeout(() => {
    const loop = () => {
      try {
        if (ctxRef && !(ctxRef.flags && ctxRef.flags.playerFxExternal)) paint(ctxRef);
      } catch (err) {
        if (typeof window !== 'undefined') window.__w1fxError = String((err && err.stack) || err);
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }, 0);
}

function viewXform(view) {
  const cs = getComputedStyle(document.documentElement);
  let scale = parseFloat(cs.getPropertyValue('--game-scale'));
  let ox = parseFloat(cs.getPropertyValue('--game-x'));
  let oy = parseFloat(cs.getPropertyValue('--game-y'));
  if (!Number.isFinite(scale) || scale <= 0) {
    scale = Math.max(1, Math.floor(Math.min(view.width / VIEW_W, view.height / VIEW_H))) || 1;
    ox = Math.floor((view.width - VIEW_W * scale) / 2);
    oy = Math.floor((view.height - VIEW_H * scale) / 2);
  }
  if (!Number.isFinite(ox)) ox = 0;
  if (!Number.isFinite(oy)) oy = 0;
  return { scale, ox, oy };
}

function hotActor(actor) {
  if (!actor) return false;
  return !!(actor.rolling || actor.shield || actor.charging || actor.beamT > 0
    || actor.flaskT > 0 || actor.superarmor > 0 || actor.skillKind || actor.muzzleT > 0);
}

function needsDraw(ctx) {
  if (edgeFx || fx.length) return true;
  const list = actorsOf(ctx);
  for (let i = 0; i < list.length; i += 1) if (hotActor(list[i])) return true;
  if (projectiles.count('player') > 0 || projectiles.count('ally') > 0) return true;
  return false;
}

function paint(ctx) {
  if (!needsDraw(ctx)) return;
  const view = document.getElementById('view');
  if (!view) return;
  const g = view.getContext('2d');
  if (!g) return;
  const map = viewXform(view);
  g.save();
  g.setTransform(map.scale, 0, 0, map.scale, map.ox, map.oy);
  g.imageSmoothingEnabled = false;
  g.beginPath();
  g.rect(0, 0, VIEW_W, VIEW_H);
  g.clip();
  render(ctx, g);
  g.restore();
}

export function render(ctx, g) {
  if (!ctx || !g) return;
  for (let i = 0; i < fx.length; i += 1) {
    if (fx[i].kind === 'scorch') drawScorch(g, fx[i]);
  }
  for (let i = 0; i < fx.length; i += 1) {
    if (fx[i].kind === 'ghost') drawGhost(g, fx[i]);
    else if (fx[i].kind === 'dust') drawDust(g, fx[i]);
  }
  const list = actorsOf(ctx);
  for (let i = 0; i < list.length; i += 1) {
    const actor = list[i];
    drawRoll(g, actor);
    drawDash(g, ctx, actor);
    drawCharge(g, actor);
    drawBeam(g, ctx, actor);
    drawShield(g, actor);
    drawFlask(g, actor);
    drawArmor(g, actor);
    drawMuzzle(g, actor);
  }
  for (let i = 0; i < fx.length; i += 1) {
    const item = fx[i];
    if (item.kind === 'arc') drawArc(g, item);
    else if (item.kind === 'ring') drawRing(g, item);
    else if (item.kind === 'impact') drawImpact(g, item);
  }
  for (let i = 0; i < fx.length; i += 1) {
    if (fx[i].kind === 'label') drawLabel(g, fx[i]);
  }
  if (edgeFx) drawEdge(g, edgeFx);
}

function stampLine(g, x0, y0, x1, y1, radius, color, alpha) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const len = Math.hypot(dx, dy);
  if (len < 0.5) return;
  const rad = Math.max(0, radius | 0);
  const step = Math.max(1, rad || 1);
  const steps = Math.max(1, Math.ceil(len / step));
  g.save();
  g.globalAlpha = alpha == null ? 1 : alpha;
  g.fillStyle = color;
  const size = rad * 2 + 1;
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    g.fillRect(Math.round(x0 + dx * t) - rad, Math.round(y0 + dy * t) - rad, size, size);
  }
  g.restore();
}

function stampArc(g, cx, cy, radius, ang, span, thick, color, alpha) {
  const r = Math.max(2, radius);
  const steps = Math.max(8, Math.ceil(Math.abs(span) * r * 0.7));
  const t = Math.max(0, thick | 0);
  g.save();
  g.globalAlpha = alpha == null ? 1 : alpha;
  g.fillStyle = color;
  const size = t * 2 + 1;
  for (let i = 0; i <= steps; i += 1) {
    const a = ang - span / 2 + span * (i / steps);
    g.fillRect(Math.round(cx + Math.cos(a) * r) - t, Math.round(cy + Math.sin(a) * r) - t, size, size);
  }
  g.restore();
}

function stampDisc(g, x, y, radius, color, alpha) {
  const R = Math.max(1, radius | 0);
  g.save();
  g.globalAlpha = alpha == null ? 1 : alpha;
  g.fillStyle = color;
  for (let iy = -R; iy <= R; iy += 1) {
    const hw = Math.round(Math.sqrt(Math.max(0, R * R - iy * iy)));
    g.fillRect(Math.round(x) - hw, Math.round(y) + iy, hw * 2 + 1, 1);
  }
  g.restore();
}

function fillWedge(g, cx, cy, r0, r1, ang, span, color, alpha) {
  g.save();
  g.globalAlpha = alpha;
  g.fillStyle = color;
  for (let r = r0; r <= r1; r += 2) {
    const steps = Math.max(4, Math.ceil(span * r * 0.5));
    for (let i = 0; i <= steps; i += 1) {
      const a = ang - span / 2 + span * (i / steps);
      const x = Math.round(cx + Math.cos(a) * r);
      const y = Math.round(cy + Math.sin(a) * r);
      if (((x + y) & 1) === 0) g.fillRect(x, y, 2, 2);
    }
  }
  g.restore();
}

function drawText(g, text, x, y, color) {
  const s = String(text || '').toUpperCase();
  const px = 2;
  g.fillStyle = color;
  let cx = Math.round(x);
  const cy = Math.round(y);
  for (let i = 0; i < s.length; i += 1) {
    const rows = GLYPH[s[i]];
    if (rows) {
      for (let row = 0; row < rows.length; row += 1) {
        const line = rows[row];
        for (let col = 0; col < line.length; col += 1) {
          if (line[col] === '1') g.fillRect(cx + col * px, cy + row * px, px, px);
        }
      }
    }
    cx += 4 * px;
  }
}

function drawScorch(g, item) {
  const alpha = Math.max(0, item.life / item.max) * 0.55;
  stampLine(g, item.x, item.y, item.x2, item.y2, 3, '#5a3a28', alpha);
  stampLine(g, item.x, item.y, item.x2, item.y2, 1, '#e7c27a', alpha);
}

function drawGhost(g, item) {
  const alpha = Math.max(0, item.life / item.max) * 0.8;
  const x = Math.round(item.x);
  const y = Math.round(item.y);
  g.save();
  g.globalAlpha = alpha;
  g.fillStyle = INK;
  g.fillRect(x - 6, y - 18, 12, 16);
  g.fillStyle = item.color || '#d7f4ff';
  g.fillRect(x - 5, y - 17, 10, 14);
  g.restore();
}

function drawDust(g, item) {
  g.save();
  g.globalAlpha = Math.max(0, item.life / item.max);
  g.fillStyle = item.color;
  g.fillRect(Math.round(item.x), Math.round(item.y), item.s || 2, item.s || 2);
  g.restore();
}

function drawArc(g, item) {
  const alpha = Math.max(0, item.life / item.max);
  stampArc(g, item.x, item.y, item.r + 3, item.ang, item.span, 3, INK, alpha);
  stampArc(g, item.x, item.y, item.r, item.ang, item.span, 2, item.color, alpha);
  stampArc(g, item.x, item.y, item.r - 6, item.ang, item.span * 0.8, 1, '#ffffff', alpha);
}

function drawRing(g, item) {
  const k = 1 - item.life / item.max;
  const alpha = Math.max(0, item.life / item.max);
  const r = 4 + item.r * Math.min(1, k);
  stampArc(g, item.x, item.y, r, 0, Math.PI * 2, 2, INK, alpha);
  stampArc(g, item.x, item.y, r, 0, Math.PI * 2, 1, item.color, alpha);
}

function drawImpact(g, item) {
  const alpha = Math.max(0, item.life / item.max);
  const r = item.r * (1.3 - alpha);
  for (let i = 0; i < 6; i += 1) {
    const a = (i / 6) * Math.PI * 2 + 0.2;
    stampLine(g, item.x, item.y, item.x + Math.cos(a) * r, item.y + Math.sin(a) * r, 1, item.color, alpha);
  }
}

function drawLabel(g, item) {
  const alpha = Math.max(0, item.life / item.max);
  const text = String(item.text || '');
  if (!text) return;
  const x = Math.round(item.x);
  const y = Math.round(item.y);
  g.save();
  g.globalAlpha = alpha;
  g.imageSmoothingEnabled = false;
  g.font = '12px "Noto Sans CJK SC","Noto Sans SC","Source Han Sans SC","PingFang SC",sans-serif';
  g.textBaseline = 'top';
  g.fillStyle = '#1b1530';
  g.fillText(text, x - 1, y);
  g.fillText(text, x + 1, y);
  g.fillText(text, x, y - 1);
  g.fillText(text, x, y + 1);
  g.fillStyle = item.color || '#f4f1ea';
  g.fillText(text, x, y);
  g.restore();
}

function drawEdge(g, item) {
  const alpha = Math.max(0, item.life / item.max) * 0.9;
  const t = 8;
  g.save();
  applyScreen(g);
  g.globalAlpha = alpha;
  g.fillStyle = item.color;
  g.fillRect(0, 0, INTERNAL_W, t);
  g.fillRect(0, INTERNAL_H - t, INTERNAL_W, t);
  g.fillRect(0, 0, t, INTERNAL_H);
  g.fillRect(INTERNAL_W - t, 0, t, INTERNAL_H);
  g.restore();
}

function drawRoll(g, actor) {
  if (!actor.rolling) return;
  stampLine(g, actor.x - actor.rollX * 18, actor.y - actor.rollY * 18, actor.x + actor.rollX * 8, actor.y + actor.rollY * 8, 4, INK, 0.95);
  stampLine(g, actor.x - actor.rollX * 16, actor.y - actor.rollY * 16, actor.x + actor.rollX * 6, actor.y + actor.rollY * 6, 2, '#f4f1ea', 1);
}

function drawDash(g, ctx, actor) {
  if (actor.skillKind !== 'flurry' || actor.dashFromX == null) return;
  stampLine(g, actor.dashFromX, actor.dashFromY, actor.x, actor.y, 5, INK, 0.9);
  stampLine(g, actor.dashFromX, actor.dashFromY, actor.x, actor.y, 3, '#7ee0ff', 1);
  stampLine(g, actor.dashFromX, actor.dashFromY, actor.x, actor.y, 1, '#ffffff', 1);
  if (actor.flurryPhase === 'arcs') {
    const shown = Math.max(1, actor.flurryN || 1);
    const base = Math.atan2(actor.dashUy || -1, actor.dashUx || 0);
    const total = 8;
    for (let i = 0; i < shown; i += 1) {
      const ang = base + (Math.PI * 2 * i) / total;
      stampArc(g, actor.x, actor.y, (actor.flurryR || 42) + 6, ang, 1.2, 4, '#041018', 1);
      stampArc(g, actor.x, actor.y, actor.flurryR || 42, ang, 1.15, 2, '#7ee0ff', 1);
      stampArc(g, actor.x, actor.y, (actor.flurryR || 42) - 4, ang, 0.7, 1, '#ffffff', 1);
    }
  }
  void ctx;
}

function drawCharge(g, actor) {
  if (!actor.charging) return;
  const max = actor.chargeMax || 1.5;
  const ratio = Math.max(0, Math.min(1, (actor.chargeT || 0) / max));
  const n = 16;
  const spin = (actor.chargeT || 0) * 10;
  const rad = 26 + ratio * 42;
  stampArc(g, actor.x, actor.y - 8, rad + 4, spin, Math.PI * 2, 2, INK, 1);
  stampArc(g, actor.x, actor.y - 8, rad + 4, spin, Math.PI * 2, 1, '#7ec8ff', 1);
  for (let i = 0; i < n; i += 1) {
    const a = spin + (i / n) * Math.PI * 2;
    const x = Math.round(actor.x + Math.cos(a) * rad);
    const y = Math.round(actor.y - 8 + Math.sin(a) * rad);
    g.fillStyle = INK;
    g.fillRect(x - 3, y - 3, 7, 7);
    g.fillStyle = i % 2 ? '#ffffff' : '#9fd8ff';
    g.fillRect(x - 2, y - 2, 5, 5);
  }
  const core = 5 + Math.round(ratio * 8);
  stampDisc(g, actor.x, actor.y - 8, core + 3, INK, 1);
  stampDisc(g, actor.x, actor.y - 8, core, ratio > 0.8 ? '#ffffff' : '#d7f4ff', 1);
}

function drawBeam(g, ctx, actor) {
  if (!(actor.beamT > 0)) return;
  const ang = actor.beamAng || 0;
  const ox = actor.x;
  const oy = actor.y - 8;
  const rect = activeInner((ctx.state && ctx.state.current) || 'fight');
  const end = rayToWall(ox, oy, ang, rect);
  const w = actor.beamW || 8;
  stampLine(g, ox, oy, end.x, end.y, Math.ceil(w / 2) + 6, INK, 0.65);
  stampLine(g, ox, oy, end.x, end.y, Math.ceil(w / 2) + 2, '#7ec8ff', 1);
  stampLine(g, ox, oy, end.x, end.y, Math.max(1, Math.ceil(w / 2) - 1), '#f7fbff', 1);
  const dx = end.x - ox;
  const dy = end.y - oy;
  const len = Math.hypot(dx, dy) || 1;
  const px = -dy / len;
  const py = dx / len;
  const ribs = Math.floor(len / 14);
  for (let i = 1; i < ribs; i += 1) {
    const t = (i * 14) / len;
    const cx = ox + dx * t;
    const cy = oy + dy * t;
    const hw = w * 0.65 + 4;
    stampLine(g, cx - px * hw, cy - py * hw, cx + px * hw, cy + py * hw, 1, i % 2 ? '#ffffff' : '#d7f4ff', 1);
  }
  stampDisc(g, ox, oy, 5, '#ffffff', 1);
  stampDisc(g, end.x, end.y, 4 + w * 0.15, '#d7f4ff', 1);
}

function drawShield(g, actor) {
  if (!actor.shield) return;
  const ang = Math.atan2(actor.aimY || 0, actor.aimX || 1);
  const span = actor.shieldArc || (100 * Math.PI / 180);
  const perfect = (actor.perfectGuardT || 0) > 0;
  const gold = perfect ? '#fff6d0' : '#e7c27a';
  fillWedge(g, actor.x, actor.y, 12, 32, ang, span, perfect ? '#ffe7a3' : '#6d3fa0', perfect ? 0.7 : 0.5);
  stampArc(g, actor.x, actor.y, 31, ang, span, 3, INK, 1);
  stampArc(g, actor.x, actor.y, 31, ang, span, 2, gold, 1);
  stampArc(g, actor.x, actor.y, 22, ang, span * 0.92, 1, perfect ? '#ffffff' : '#c9a0ff', 1);
  const mx = Math.round(actor.x + Math.cos(ang) * 20);
  const my = Math.round(actor.y + Math.sin(ang) * 20);
  g.fillStyle = INK;
  g.fillRect(mx - 7, my - 9, 14, 18);
  g.fillStyle = gold;
  g.fillRect(mx - 5, my - 7, 10, 14);
  g.fillStyle = '#6d3fa0';
  g.fillRect(mx - 2, my - 4, 4, 8);
  g.fillStyle = perfect ? '#fff' : '#d8b15a';
  g.fillRect(mx - 1, my - 6, 2, 3);
}

function drawFlask(g, actor) {
  if (!(actor.flaskT > 0)) return;
  const t = 1 - Math.max(0, Math.min(1, actor.flaskT / 0.5));
  const h = 28 + Math.round(70 * Math.max(t, 0.35));
  const x = Math.round(actor.x);
  const top = Math.round(actor.y - h);
  const col = actor.flaskPending === 'b200' ? '#ffe08a' : '#7dffb0';
  g.save();
  g.fillStyle = INK;
  g.globalAlpha = 0.92;
  g.fillRect(x - 8, top, 16, h);
  g.globalAlpha = 1;
  g.fillStyle = col;
  g.fillRect(x - 5, top + 2, 10, h - 2);
  g.fillStyle = '#f4fff8';
  g.fillRect(x - 2, top + 2, 4, h - 2);
  g.restore();
  stampArc(g, actor.x, actor.y, 14, 0, Math.PI * 2, 2, INK, 1);
  stampArc(g, actor.x, actor.y, 14, 0, Math.PI * 2, 1, col, 1);
  const spin = (0.5 - actor.flaskT) * 36;
  for (let i = 0; i < 4; i += 1) {
    const a = spin + (i * Math.PI) / 2;
    stampLine(g, actor.x, top + 8, actor.x + Math.cos(a) * 7, top + 8 + Math.sin(a) * 3, 1, '#14301c', 1);
  }
}

function drawArmor(g, actor) {
  if (!(actor.superarmor > 0)) return;
  stampArc(g, actor.x, actor.y - 4, 18, 0, Math.PI * 2, 2, INK, 1);
  stampArc(g, actor.x, actor.y - 4, 18, 0, Math.PI * 2, 1, '#ffe08a', 1);
  stampArc(g, actor.x, actor.y - 4, 12, 0, Math.PI * 2, 1, '#fff6d0', 0.9);
}

function drawMuzzle(g, actor) {
  if (!(actor.muzzleT > 0)) return;
  const ang = actor.muzzleAng || 0;
  const x = actor.x + Math.cos(ang) * 12;
  const y = actor.y - 6 + Math.sin(ang) * 12;
  const alpha = Math.min(1, actor.muzzleT / 0.05);
  stampDisc(g, x, y, 5, actor.muzzleColor || '#fff', alpha);
  stampDisc(g, x, y, 2, '#ffffff', 1);
  stampLine(g, x - Math.cos(ang) * 4, y - Math.sin(ang) * 4, x + Math.cos(ang) * 8, y + Math.sin(ang) * 8, 1, '#fff', alpha);
}

export function init() {}
export function update() {}
export function reset() { clear(); }
