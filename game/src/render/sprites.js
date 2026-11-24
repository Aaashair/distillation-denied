// OWNER: W3
// Sprite system: ASSET_CONFIG / V2_ASSETS sheets first, procedural fallback.
// Stable ids `px.<who>.<anim>` map onto v2_* sheets. Facing flip, white-flash
// silhouette cache (source-in, never getImageData on file images), squash.

import { loadImage, PIXEL_SPRITES } from '../config/assets.js';
import { V2_ASSETS } from '../config/assets_v2.generated.js';
import { setDrawer } from '../actors/projectiles.js';
import { draw as drawProcedural, getSheet as getProc, familyOf, warmup as warmupProc } from './procedural.js';
import * as showcase from './showcase.js';

/** @type {null|{x:number,footY:number,stroke:string,tickEast:{bx:number,by:number},rolling:boolean,moving:boolean}} */
let footRingSample = null;

/** Controlled-player foot ring only (not allies); double ellipse + cardinal ticks. */
export const PLAYER_FOOT_RING = Object.freeze({
  deepseek: '#3fa9ff',
  glm: '#ffffff',
  kimi: '#a566ff',
});

const WHO = {
  deepseek: { sheet: 'v2_deepseek_sheet_48', alt: 'v2_deepseek_sheet', family: 'deepseek', player: true },
  kimi: { sheet: 'v2_kimi_sheet_48', alt: 'v2_kimi_sheet', family: 'kimi', player: true },
  glm: { sheet: 'v2_glm_sheet_48', alt: 'v2_glm_sheet', family: 'glm', player: true },
  'boss.p1': { sheet: 'v2_haiku_sheet', family: 'haiku', boss: true },
  haiku: { sheet: 'v2_haiku_sheet', family: 'haiku', boss: true },
  'boss.p2': { sheet: 'v2_sonnet_sheet', family: 'sonnet', boss: true },
  sonnet: { sheet: 'v2_sonnet_sheet', family: 'sonnet', boss: true },
  'boss.p3': { sheet: 'v2_opus_sheet', family: 'opus', boss: true },
  opus: { sheet: 'v2_opus_sheet', family: 'opus', boss: true },
  astra: { sheet: 'v2_astra_mature_sheet', alt: 'v2_astra_sheet', family: 'astra' },
  'fable.hand': { sheet: 'v2_fable_hand', family: 'fablehand' },
  fable: { sheet: null, family: 'fable' },
  dario: { sheet: 'v2_dario_holo_flicker_sheet', alt: 'v2_dario_holo', family: 'dario' },
  stele: { sheet: null, family: 'stele' },
};

const PROJ = {
  fin: 'v2_proj_deepseek_fin',
  wave: 'v2_proj_deepseek_wave',
  whale: 'v2_proj_deepseek_wave',
  orb: 'v2_proj_kimi_star',
  star: 'v2_proj_kimi_star',
  moon: 'v2_proj_kimi_moon',
  bolt: 'v2_proj_glm_hammer',
  hammer: 'v2_proj_glm_hammer',
  shard: 'v2_proj_glm_shard',
  petal: 'v2_proj_haiku_petal',
  needle: 'v2_proj_haiku_needle',
  quill: 'v2_proj_haiku_needle',
  glyph: 'v2_proj_sonnet_rune',
  rune: 'v2_proj_sonnet_rune',
  seal: 'v2_proj_sonnet_seal',
  feather: 'v2_proj_opus_feather',
  node: 'v2_proj_opus_node',
  knot: 'v2_proj_astra_knot',
  lance: 'v2_proj_astra_lance',
};

const FLASK_IDS = {
  rtx5090: 'v2_gpu_5090',
  h200: 'v2_gpu_h200',
  b200: 'v2_gpu_b200',
};

const flashCache = new Map();
const tintCache = new Map();

function ready(img) {
  return !!(img && img.complete && img.naturalWidth > 0 && !(img.dataset && img.dataset.dead === '1'));
}

function whoOf(id) {
  const key = String(id || '').replace(/^px\./, '');
  if (WHO[key]) return { key, spec: WHO[key] };
  const head = key.split('.')[0];
  if (head === 'boss') {
    const rest = key.slice(5);
    const k = rest ? `boss.${rest.split('.')[0]}` : 'boss.p1';
    if (WHO[k]) return { key: k, spec: WHO[k] };
  }
  if (WHO[head]) return { key: head, spec: WHO[head] };
  return { key: 'deepseek', spec: WHO.deepseek };
}

function v2Entry(id) {
  return (V2_ASSETS && V2_ASSETS[id]) || null;
}

function sheetMeta(id) {
  const e = v2Entry(id);
  if (!e) return null;
  const sh = e.sheet || {};
  const fw = sh.frameWidth || (e.size && e.size[0]) || 48;
  const fh = sh.frameHeight || (e.size && e.size[1]) || fw;
  const cols = sh.cols || Math.max(1, (e.frames && fw) ? Math.round((e.frames * fw) > 0 ? (e.frames) : 1) : 1);
  // If the image is a strip, cols = frames.
  return {
    id,
    frameW: fw,
    frameH: fh,
    cols: sh.cols || 0,
    rows: sh.rows || 1,
    anchor: sh.anchor || 'bottom-center',
    anims: sh.anims || null,
    frames: e.frames || 1,
    fps: e.fps || 8,
    size: e.size,
  };
}

function imageForWho(spec) {
  const a = spec.sheet ? loadImage(spec.sheet) : null;
  if (ready(a)) return { img: a, id: spec.sheet, meta: sheetMeta(spec.sheet) };
  if (a && !a.complete) return { img: a, id: spec.sheet, meta: sheetMeta(spec.sheet), loading: true };
  if (spec.alt) {
    const b = loadImage(spec.alt);
    if (ready(b) || (b && !b.complete)) return { img: b, id: spec.alt, meta: sheetMeta(spec.alt), loading: !ready(b) };
  }
  return { img: null, id: null, meta: null };
}

function whiteSilhouette(img) {
  if (!ready(img)) return null;
  let c = flashCache.get(img);
  if (c) return c;
  c = document.createElement('canvas');
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  const g = c.getContext('2d');
  g.imageSmoothingEnabled = false;
  g.drawImage(img, 0, 0);
  g.globalCompositeOperation = 'source-in';
  g.fillStyle = '#ffffff';
  g.fillRect(0, 0, c.width, c.height);
  flashCache.set(img, c);
  return c;
}

function tinted(img, color) {
  if (!ready(img)) return null;
  const key = color;
  let map = tintCache.get(img);
  if (map && map[key]) return map[key];
  const c = document.createElement('canvas');
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  const g = c.getContext('2d');
  g.imageSmoothingEnabled = false;
  g.drawImage(img, 0, 0);
  g.globalCompositeOperation = 'source-in';
  g.fillStyle = color;
  g.fillRect(0, 0, c.width, c.height);
  if (!map) {
    map = {};
    tintCache.set(img, map);
  }
  map[key] = c;
  return c;
}

function animFrame(meta, img, anim, t) {
  const fw = meta.frameW;
  const fh = meta.frameH;
  let cols = meta.cols;
  if (!cols) {
    cols = fw > 0 ? Math.max(1, Math.round(img.naturalWidth / fw)) : 1;
  }
  const rows = meta.rows || Math.max(1, Math.round(img.naturalHeight / fh));
  const anims = meta.anims;
  let row = 0;
  let list = [0];
  let fps = meta.fps || 8;
  if (anims && anims[anim]) {
    const a = anims[anim];
    row = a.row || 0;
    fps = a.fps || fps;
    if (Array.isArray(a.frames)) list = a.frames;
    else {
      const n = typeof a.frames === 'number' ? a.frames : 1;
      list = [];
      for (let i = 0; i < n; i += 1) list.push(i);
    }
  } else if (anims) {
    const fallback = anims.idle_down || anims.idle || anims.idle_bob
      || anims.walk_down || null;
    if (fallback) return animFrame(meta, img, fallback === anims.idle_down ? 'idle_down'
      : fallback === anims.idle ? 'idle'
        : fallback === anims.idle_bob ? 'idle_bob' : 'walk_down', t);
    list = [0];
  } else {
    const n = meta.frames || cols;
    list = [];
    for (let i = 0; i < n; i += 1) list.push(i);
  }
  const i = Math.floor((t * fps) % Math.max(1, list.length));
  const col = list[i] || 0;
  return {
    sx: col * fw,
    sy: row * fh,
    fw,
    fh,
    cols,
    rows,
  };
}

function pickAnim(actor, spec) {
  const face = String(actor.facing || 's');
  const moving = Math.hypot(actor.vx || 0, actor.vy || 0) > 8 || actor.rolling;
  if (actor.flash > 0 || actor.pose === 'hurt') return { anim: spec.player ? 'hurt' : 'hurt', flip: faceLeft(face) };
  if (actor.pose === 'down') return { anim: spec.player ? 'hurt' : 'hurt', flip: faceLeft(face) };
  if (actor.pose === 'windup' || actor.pose === 'cast' || (actor.cast && spec.boss)) {
    return { anim: spec.player ? 'skill' : 'cast', flip: faceLeft(face) };
  }
  if (actor.pose === 'attack') return { anim: 'attack', flip: faceLeft(face) };
  if (actor.skillKind || actor.charging || actor.shield || actor.flaskT > 0 || actor.pose === 'skill') {
    return { anim: spec.player ? 'skill' : 'attack', flip: faceLeft(face) };
  }
  if (spec.player && (actor.fireCd || 0) > 0.04) {
    return { anim: 'attack', flip: faceLeft(face) };
  }
  if (moving) {
    if (spec.player) {
      if (faceUp(face)) return { anim: 'walk_up', flip: false };
      if (faceDown(face)) return { anim: 'walk_down', flip: false };
      return { anim: 'walk_side_right', flip: faceLeft(face) };
    }
    return { anim: 'idle', flip: faceLeft(face) };
  }
  if (spec.player) return { anim: 'idle_down', flip: faceLeft(face) };
  return { anim: 'idle', flip: faceLeft(face) };
}

function faceLeft(face) {
  return face === 'left' || face === 'w' || face === 'nw' || face === 'sw' || face === 'a';
}
function faceUp(face) {
  return face === 'up' || face === 'n' || face === 'ne' || face === 'nw';
}
function faceDown(face) {
  return face === 'down' || face === 's' || face === 'se' || face === 'sw' || face === 'e' || !face;
}

export function spriteId(actor) {
  if (!actor) return 'px.unknown';
  if (actor.sprite) return actor.sprite;
  if (actor.team === 'boss') return `px.boss.p${actor.phase || 1}`;
  return `px.${actor.id || 'deepseek'}`;
}

/** P3 Opus is 192px and eats the boss bar at 1×. Feet stay on actor.y. */
function bossDrawScale(actor, fh) {
  if (!actor || actor.team !== 'boss') return 1;
  const phase = actor.phase || 1;
  if (phase >= 3 || fh >= 160) return 0.7;
  if (phase === 2 || fh >= 112) return 0.86;
  return 1;
}

function shadowW(actor) {
  if (actor.team === 'boss') return 18 + (actor.phase || 1) * 6;
  if (actor.id === 'stele') return 14;
  if (String(actor.sprite || '').indexOf('astra') >= 0) return 18;
  return 12;
}

/**
 * @param {CanvasRenderingContext2D} g
 * @param {import('../core/contracts.js').GameContext} ctx
 * @param {import('../core/contracts.js').Actor} actor
 */
export function drawActor(g, ctx, actor) {
  if (!actor) return;
  const id = spriteId(actor);
  const { spec } = whoOf(id);
  const t = ctx.time ? ctx.time.elapsed : 0;
  const pick = pickAnim(actor, spec);
  const x = Math.round(actor.x);
  const y = Math.round(actor.y);
  const alpha = actor.alive === false ? 0.38 : (actor.invuln > 0 && ((t * 20) | 0) % 2 === 0 ? 0.45 : 1);
  const squash = actor.rolling ? 0.78 : (actor.pose === 'down' ? 0.7 : 1);
  const stretch = actor.rolling ? 1.15 : 1;
  const flash = !!(actor.flash > 0);
  const packed = imageForWho(spec);
  let usedSheet = false;
  if (packed.img && ready(packed.img) && packed.meta) {
    const fr = animFrame(packed.meta, packed.img, pick.anim, t);
    const sc = bossDrawScale(actor, fr.fh);
    const ax = (fr.fw / 2) * sc;
    const ay = (fr.fh - 2) * sc;
    const dw = Math.round(fr.fw * sc);
    const dh = Math.round(fr.fh * sc);
    g.save();
    g.globalAlpha = alpha;
    g.translate(x, y);
    if (pick.flip) g.scale(-1, 1);
    g.scale(stretch, squash);
    g.imageSmoothingEnabled = false;
    g.drawImage(packed.img, fr.sx, fr.sy, fr.fw, fr.fh, Math.round(-ax), Math.round(-ay), dw, dh);
    if (flash) {
      const sil = whiteSilhouette(packed.img);
      if (sil) {
        g.globalAlpha = 0.42;
        g.drawImage(sil, fr.sx, fr.sy, fr.fw, fr.fh, Math.round(-ax), Math.round(-ay), dw, dh);
      }
    }
    g.restore();
    usedSheet = true;
  }
  if (!usedSheet) {
    const proc = getProc(spec.family);
    const frames = proc.frames || 4;
    const moving = Math.hypot(actor.vx || 0, actor.vy || 0) > 8 || actor.rolling;
    const frame = moving ? Math.floor(t * proc.fps) % frames : (Math.floor(t * 2) % 2);
    drawProcedural(g, spec.family, x, y, {
      flip: pick.flip,
      flash,
      frame,
      pose: actor.pose || (actor.rolling ? 'roll' : ''),
      alpha,
      squash,
      stretch,
    });
  }

  if (actor.shield) drawShield(g, actor);
  if (actor.charging) drawChargeAura(g, actor, t);

  if (actor.team === 'player' || actor.team === 'ally' || ctx.debug?.showHitboxes) {
    g.fillStyle = '#1b1530';
    g.fillRect(x - 2, y - 2, 5, 5);
    g.fillStyle = actor.invuln > 0 ? '#ffd0d0' : '#f4f1ea';
    g.fillRect(x - 1, y - 1, 3, 3);
  }
  if (ctx.debug?.showHitboxes) {
    g.strokeStyle = 'rgba(255,80,80,0.85)';
    g.beginPath();
    g.arc(x, y, actor.r || 3, 0, Math.PI * 2);
    g.stroke();
  }
}

function drawShield(g, actor) {
  const ang = Math.atan2(actor.aimY || 0, actor.aimX || 1);
  const arc = actor.shieldArc || (100 * Math.PI / 180);
  const perfect = (actor.shieldAge || 0) <= (actor.perfectWindow || 0.2);
  g.save();
  g.translate(Math.round(actor.x), Math.round(actor.y) - 6);
  g.rotate(ang);
  g.fillStyle = perfect ? 'rgba(255,224,138,0.28)' : 'rgba(216,177,90,0.22)';
  g.beginPath();
  g.moveTo(0, 0);
  g.arc(0, 0, 32, -arc * 0.5, arc * 0.5);
  g.closePath();
  g.fill();
  g.strokeStyle = perfect ? '#ffe08a' : '#d8b15a';
  g.lineWidth = perfect ? 5 : 4;
  g.globalAlpha = 0.95;
  g.beginPath();
  g.arc(0, 0, 32, -arc * 0.5, arc * 0.5);
  g.stroke();
  g.strokeStyle = '#fff';
  g.lineWidth = 2;
  g.beginPath();
  g.arc(0, 0, 28, -arc * 0.5, arc * 0.5);
  g.stroke();
  g.restore();
}

function drawChargeAura(g, actor, t) {
  const r = 10 + Math.sin(t * 14) * 3;
  g.save();
  g.globalAlpha = 0.55;
  g.strokeStyle = '#d7f4ff';
  g.lineWidth = 2;
  g.beginPath();
  g.arc(Math.round(actor.x), Math.round(actor.y) - 8, r, 0, Math.PI * 2);
  g.stroke();
  g.restore();
}

function footRingStroke(player) {
  const id = String(player.id || 'deepseek');
  if (id === 'glm') return { stroke: PLAYER_FOOT_RING.glm, outline: '#1b1530' };
  return { stroke: PLAYER_FOOT_RING[id] || PLAYER_FOOT_RING.deepseek, outline: null };
}

function drawControlledFootRing(g, player, t) {
  const x = Math.round(player.x);
  const footY = Math.round(player.y) + 1;
  const vx = player.vx || 0;
  const vy = player.vy || 0;
  const moving = Math.hypot(vx, vy) > 8;
  const rolling = !!player.rolling;
  let rx = 10;
  let ry = 4;
  if (moving) { rx = 12; ry = 5; }
  if (rolling) { rx = 14; ry = 5; }
  const style = footRingStroke(player);
  g.save();
  g.lineWidth = 1;
  if (style.outline) {
    g.strokeStyle = style.outline;
    g.lineWidth = 3;
    g.beginPath();
    g.ellipse(x, footY, rx + 1, ry + 1, 0, 0, Math.PI * 2);
    g.stroke();
    g.lineWidth = 1;
  }
  g.strokeStyle = style.stroke;
  for (let ring = 0; ring < 2; ring += 1) {
    const inset = ring * 2;
    g.beginPath();
    g.ellipse(x, footY, rx - inset, Math.max(2, ry - ring), 0, 0, Math.PI * 2);
    g.stroke();
  }
  const tick = 3;
  g.fillStyle = style.stroke;
  g.fillRect(x - 1, footY - ry - tick, 2, tick);
  g.fillRect(x - 1, footY + ry, 2, tick);
  g.fillRect(x - rx - tick, footY - 1, tick, 2);
  g.fillRect(x + rx, footY - 1, tick, 2);
  footRingSample = {
    x,
    footY,
    rx,
    ry,
    stroke: style.stroke,
    tickEast: { bx: x + rx + 1, by: footY },
    rolling,
    moving,
  };
  if (rolling) {
    const pulse = 0.35 + Math.sin(t * 22) * 0.15;
    g.globalAlpha = pulse;
    g.strokeStyle = style.stroke;
    g.beginPath();
    g.ellipse(x, footY, rx + 3, ry + 2, 0, 0, Math.PI * 2);
    g.stroke();
  }
  g.restore();
}

export function drawShadows(ctx, g) {
  const list = [];
  if (ctx.player) list.push(ctx.player);
  if (ctx.boss && (ctx.state.current === 'fight' || ctx.state.current === 'paused' || ctx.state.current === 'cutscene')) {
    list.push(ctx.boss);
  }
  const allies = ctx.allies || [];
  for (let i = 0; i < allies.length; i += 1) list.push(allies[i]);
  if (ctx.stele && ctx.state.current === 'intro') list.push(ctx.stele);
  for (let i = 0; i < list.length; i += 1) {
    const a = list[i];
    if (!a) continue;
    const w = shadowW(a);
    g.fillStyle = 'rgba(27, 21, 48, 0.32)';
    g.fillRect(Math.round(a.x - w / 2), Math.round(a.y - 2), w, 4);
  }
  const st = ctx.state && ctx.state.current;
  footRingSample = null;
  if (ctx.player && (st === 'fight' || st === 'paused' || st === 'intro')) {
    const t = ctx.time ? ctx.time.elapsed : 0;
    drawControlledFootRing(g, ctx.player, t);
  }
}

export function collect(ctx, items, g) {
  const state = ctx.state.current;
  function add(a) {
    if (!a) return;
    if (a === ctx.boss && state !== 'fight' && state !== 'paused' && state !== 'cutscene' && state !== 'banned') return;
    if (a === ctx.stele && state !== 'intro') return;
    items.push({ y: a.y, draw: () => drawActor(g, ctx, a) });
  }
  add(ctx.player);
  add(ctx.boss);
  add(ctx.stele);
  const allies = ctx.allies || [];
  for (let i = 0; i < allies.length; i += 1) add(allies[i]);
}

export function drawPx(g, id, x, y, opts = {}) {
  const { spec } = whoOf(id);
  const packed = imageForWho(spec);
  if (packed.img && ready(packed.img) && packed.meta) {
    const t = opts.t || 0;
    const anim = opts.anim || (spec.player ? 'idle_down' : 'idle');
    const fr = animFrame(packed.meta, packed.img, anim, t);
    const img = opts.flash ? (whiteSilhouette(packed.img) || packed.img) : packed.img;
    g.save();
    g.globalAlpha = opts.alpha == null ? 1 : opts.alpha;
    g.translate(Math.round(x), Math.round(y));
    if (opts.flip) g.scale(-1, 1);
    g.imageSmoothingEnabled = false;
    g.drawImage(img, fr.sx, fr.sy, fr.fw, fr.fh, Math.round(-fr.fw / 2), Math.round(-(fr.fh - 2)), fr.fw, fr.fh);
    g.restore();
    return;
  }
  drawProcedural(g, spec.family, x, y, opts);
}

export function drawIcon(g, flaskId, x, y) {
  const vid = FLASK_IDS[flaskId] || flaskId;
  const img = loadImage(vid);
  if (ready(img)) {
    g.imageSmoothingEnabled = false;
    g.drawImage(img, Math.round(x), Math.round(y));
    return;
  }
  const fam = flaskId === 'h200' ? 'flask_h200' : flaskId === 'b200' ? 'flask_b200' : 'flask_rtx';
  drawProcedural(g, fam, x + 8, y + 14, {});
}

function disk(g, cx, cy, r, color) {
  g.fillStyle = color;
  const R = Math.ceil(r);
  const rr = r * r;
  for (let y = -R; y <= R; y += 1) {
    const span = rr - y * y;
    if (span < 0) continue;
    const w = Math.floor(Math.sqrt(span));
    g.fillRect(cx - w, cy + y, w * 2 + 1, 1);
  }
}

/** Side-view cartoon whale. +x is the snout. Outline, eye, belly, tail flukes. */
function drawWhaleSprite(g) {
  const ink = '#041018';
  const body = '#3ecfff';
  const belly = '#f7fdff';
  const fin = '#1478b0';
  g.fillStyle = ink;
  g.fillRect(-18, -9, 12, 6);
  g.fillRect(-18, 3, 12, 6);
  g.fillRect(-12, -4, 6, 8);
  g.fillStyle = body;
  g.fillRect(-17, -8, 10, 4);
  g.fillRect(-17, 4, 10, 4);
  g.fillRect(-12, -3, 5, 6);
  g.fillStyle = ink;
  g.fillRect(-9, -8, 22, 16);
  g.fillStyle = body;
  g.fillRect(-8, -7, 20, 14);
  g.fillStyle = belly;
  g.fillRect(-5, 0, 13, 6);
  g.fillStyle = ink;
  g.fillRect(10, -6, 7, 11);
  g.fillStyle = body;
  g.fillRect(10, -5, 6, 9);
  g.fillStyle = ink;
  g.fillRect(15, -3, 4, 6);
  g.fillStyle = belly;
  g.fillRect(16, -2, 2, 4);
  g.fillStyle = '#ffffff';
  g.fillRect(4, -5, 4, 4);
  g.fillStyle = ink;
  g.fillRect(6, -4, 2, 2);
  g.fillStyle = ink;
  g.fillRect(-2, 6, 9, 4);
  g.fillStyle = fin;
  g.fillRect(-1, 6, 7, 3);
  g.fillStyle = '#ffffff';
  g.fillRect(1, -12, 2, 3);
  g.fillRect(4, -14, 2, 3);
}

/** Dark disk plus a bright crescent and a purple rim. Not a boss glyph. */
function drawMoonSprite(g) {
  disk(g, -1, 0, 9, '#160818');
  g.fillStyle = '#e9d5ff';
  for (let y = -11; y <= 11; y += 1) {
    for (let x = -11; x <= 11; x += 1) {
      if (x * x + y * y > 121) continue;
      if ((x + 7) * (x + 7) + y * y < 110) continue;
      g.fillRect(x, y, 1, 1);
    }
  }
  g.fillStyle = '#7c3aed';
  for (let y = -11; y <= 11; y += 1) {
    for (let x = -2; x <= 11; x += 1) {
      const d = x * x + y * y;
      if (d <= 121 && d >= 100 && (x + 7) * (x + 7) + y * y >= 110) g.fillRect(x, y, 1, 1);
    }
  }
  disk(g, -3, 0, 6, '#10060f');
  g.fillStyle = '#f8f1ff';
  g.fillRect(6, -4, 2, 2);
}

/** Bold gold Z. Each cell is 2px with a 1px dark outline. */
function drawZSprite(g) {
  const rows = [
    '111111111',
    '111111111',
    '11.....11',
    '...11111.',
    '..11111..',
    '.11111...',
    '11.....11',
    '111111111',
    '111111111',
  ];
  const s = 2;
  const ox = -((rows[0].length * s) >> 1);
  const oy = -((rows.length * s) >> 1);
  for (let pass = 0; pass < 2; pass += 1) {
    const color = pass === 0 ? '#1b1204' : '#ffe08a';
    const grow = pass === 0 ? 1 : 0;
    g.fillStyle = color;
    for (let y = 0; y < rows.length; y += 1) {
      const row = rows[y];
      for (let x = 0; x < row.length; x += 1) {
        if (row[x] !== '1') continue;
        g.fillRect(ox + x * s - grow, oy + y * s - grow, s + grow * 2, s + grow * 2);
      }
    }
  }
  g.fillStyle = '#fff6c8';
  g.fillRect(ox + 2, oy + 2, 4, 2);
  g.fillRect(ox + rows[0].length * s - 6, oy + rows.length * s - 4, 4, 2);
}

function drawThemedProjectile(g, b, shape) {
  const x = Math.round(b.x);
  const y = Math.round(b.y);
  g.save();
  g.translate(x, y);
  g.imageSmoothingEnabled = false;
  if (shape === 'z' || shape === 'bolt') {
    drawZSprite(g);
  } else {
    g.rotate(Math.atan2(b.vy || 0, b.vx || 1));
    if (shape === 'moon') drawMoonSprite(g);
    else drawWhaleSprite(g);
  }
  g.restore();
}

function drawBullet(g, b) {
  const x = Math.round(b.x);
  const y = Math.round(b.y);
  const shape = String(b.shape || 'dot');
  if (shape === 'whale' || shape === 'fin' || shape === 'moon' || shape === 'z' || shape === 'bolt') {
    drawThemedProjectile(g, b, shape);
    return;
  }
  const vid = PROJ[shape];
  const img = vid ? loadImage(vid) : null;
  const ang = Math.atan2(b.vy || 0, b.vx || 1);
  if (ready(img)) {
    g.save();
    g.translate(x, y);
    g.rotate(ang);
    g.imageSmoothingEnabled = false;
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    g.drawImage(img, Math.round(-w / 2), Math.round(-h / 2));
    g.restore();
    return;
  }
  const fam = familyOf(shape);
  const sheet = getProc(fam === 'deepseek' ? 'petal' : fam);
  if (sheet && sheet.canvas && fam !== 'deepseek') {
    g.save();
    g.translate(x, y);
    g.rotate(ang);
    g.imageSmoothingEnabled = false;
    const fw = sheet.frameW;
    const fh = sheet.frameH;
    const frame = Math.floor((b.age || 0) * sheet.fps) % sheet.frames;
    g.drawImage(sheet.canvas, frame * fw, 0, fw, fh, Math.round(-fw / 2), Math.round(-fh / 2), fw, fh);
    g.restore();
    return;
  }
  const r = Math.max(2, b.r | 0);
  g.fillStyle = '#1b1530';
  g.fillRect(x - r - 1, y - r - 1, r * 2 + 3, r * 2 + 3);
  g.fillStyle = b.color || '#f4f1ea';
  g.save();
  g.translate(x, y);
  g.rotate(ang);
  if (shape === 'fin' || shape === 'whale' || shape === 'wave') {
    g.fillRect(-r - 3, -2, r * 2 + 5, 4);
    g.fillStyle = '#7ee0ff';
    g.fillRect(r - 1, -3, 3, 6);
  } else if (shape === 'orb' || shape === 'star') {
    g.beginPath();
    g.arc(0, 0, r + 1, 0, Math.PI * 2);
    g.fill();
  } else if (shape === 'petal') {
    g.beginPath();
    g.ellipse(0, 0, r + 2, r, 0, 0, Math.PI * 2);
    g.fill();
  } else if (shape === 'feather') {
    g.fillRect(-r, -2, r * 2 + 2, 4);
    g.fillRect(r, -4, 2, 8);
  } else if (shape === 'glyph' || shape === 'rune' || shape === 'node') {
    g.fillRect(-r, -r, r * 2, r * 2);
    g.fillStyle = '#d8b15a';
    g.fillRect(-1, -r - 1, 2, r * 2 + 2);
  } else if (shape === 'quill' || shape === 'needle') {
    g.fillRect(-r - 2, -1, r * 2 + 4, 2);
  } else {
    g.fillRect(-r, -r, r * 2, r * 2);
  }
  g.fillStyle = '#fff';
  g.fillRect(-1, -1, 2, 2);
  g.restore();
}

export function snapshotActor(actor) {
  return {
    id: spriteId(actor),
    x: actor.x,
    y: actor.y,
    facing: actor.facing,
    flash: !!actor.flash,
    vx: actor.vx,
    vy: actor.vy,
  };
}

export function getFootRingSample() {
  return footRingSample;
}

export function init(ctx) {
  try { setDrawer(drawBullet); } catch { /* gallery / tests without pool */ }
  if (ctx) {
    ctx.world.sprites = {
      drawActor,
      drawPx,
      drawIcon,
      drawBullet,
      footRingSample: () => footRingSample,
      PLAYER_FOOT_RING,
    };
  }
  try { warmupProc(); } catch { /* ignore */ }
  if (ctx && typeof location !== 'undefined' && /(?:\?|&)vfxtest=1(?:&|$)/.test(location.search)) {
    showcase.install(ctx);
  }
}

export function update(ctx, dt) {
  const list = [ctx.player, ctx.boss, ctx.stele, ...(ctx.allies || [])];
  for (let i = 0; i < list.length; i += 1) {
    const a = list[i];
    if (a && a.flash > 0) a.flash = Math.max(0, a.flash - dt);
  }
}

export function reset() {}

export {
  ready, whoOf, PROJ, FLASK_IDS, whiteSilhouette, tinted, PIXEL_SPRITES,
};
