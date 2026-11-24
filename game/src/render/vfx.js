// OWNER: W3
// Pooled particle / juice system. Every skill the player does or suffers
// must read as a punch: arcs, beams, shockwaves, flashes, shake, numbers.
//
// Code-drawn first. AI VFX strips (v2_vfx_*) are an extra layer when loaded.
//
// Bus: `vfx` {kind, ...}, `shake` {mag,dur}, `flash` {color,dur}, plus HIT /
// ROLL / FLASK / SKILL / SHIELD / PHASE / CUTSCENE for automatic juice.
// Hit-stop is core/time — we keep using raw dt so juice still plays.
//
// ---------------------------------------------------------------------------
// Request vocabulary (ctx.bus.emit('vfx', { kind, ... }))
// ---------------------------------------------------------------------------
// slash / slash_arc  {x,y, color, r|radius, angle, who?}  crescent slash
// beam               {x,y, x2,y2, w, color, life, who?}    core+glow+flicker
// shock / shockwave  {x,y, r, color, life}                 expanding pixel ring
// ring               {x,y, r, color, w, life}
// muzzle             {x,y, color, angle, who?}
// spark / sparks     {x,y, color, n, life}
// impact             {x,y, color, heavy?}
// dust               {x,y, n}
// afterimage         {x,y, sprite, flip, alpha, life}
// charge             {x,y, color, r}
// shield_arc         {x,y, angle, arc, r, color, perfect}
// heal / heal_pillar {x,y, life}
// explosion          {x,y, color, r}
// gold_sparks        {x,y, n}                              bullet-clear glitter
// text               {x,y, text, color, life}
// num                {x,y, text, color, heavy?, crit?}     damage popup
// scorch / crack_floor {x,y, r}                            floor decals
// flash              via event `flash` {color, dur}        screen fill
// shake              via event `shake` {mag, dur}          integer, decaying
// crack              {life}                                glass overlay + shards
// vignette           {color, a, life}
// desaturate         {amount, life}                        slow-mo death tint
// rift               {life}                                sky white-gold+teal
// telegraph_glow     {x,y, r, color}                       extra ring pop
// ---------------------------------------------------------------------------

import { EVENTS } from '../core/contracts.js';
import { VFX as FEEL } from '../config/balance.js';
import { V2_ASSETS } from '../config/assets_v2.generated.js';
import { loadImage } from '../config/assets.js';
import { drawTextOutlined } from './font.js';
import { setShake, setFilter, INTERNAL_W, INTERNAL_H } from './pixel.js';
import { applyScreen, applyWorld, WORLD_OX } from './world.js';
import { draw as drawProcedural } from './procedural.js';

/** Optional fullscreen overlay (vfxtest / gallery). */
let overlay = null;
let overlayUpdate = null;
export function setOverlay(renderFn, updateFn) {
  overlay = typeof renderFn === 'function' ? renderFn : null;
  overlayUpdate = typeof updateFn === 'function' ? updateFn : null;
}
export function overlayActive() {
  return !!overlay;
}

const P_CAP = 420;
const FX_CAP = 80;
const NUM_CAP = 28;
const DECAL_CAP = 36;
const AFTER_CAP = 20;

const particles = [];
const fx = [];       // beams, rings, slashes, sheets
const numbers = [];
const decals = [];
const afters = [];
const shards = [];

let flashColor = 'rgba(255,255,255,0.4)';
let flashT = 0;
let flashDur = 0.08;
let shakeMag = 0;
let shakeDur = 0;
let shakeAge = 0;
let crackT = 0;
let riftT = 0;
let vignetteA = 0;
let vignetteLife = 0;
let slowTint = 0;
let uid = 1;

function palOf(who) {
  const w = String(who || '');
  if (w.indexOf('kimi') >= 0) return 'silver';
  if (w.indexOf('glm') >= 0) return 'purple';
  if (w.indexOf('opus') >= 0 || w.indexOf('p3') >= 0) return 'coral';
  if (w.indexOf('sonnet') >= 0 || w.indexOf('p2') >= 0) return 'gold';
  if (w.indexOf('astra') >= 0) return 'teal';
  if (w.indexOf('haiku') >= 0) return 'coral';
  return 'cyan';
}

function vfxId(kind, pal) {
  const map = {
    slash: {
      cyan: 'v2_vfx_slash_deepseek',
      silver: 'v2_vfx_slash_kimi',
      purple: 'v2_vfx_slash_glm',
      coral: 'v2_vfx_slash_haiku',
      gold: 'v2_vfx_slash_sonnet',
      teal: 'v2_vfx_slash_astra',
    },
    slash_big: {
      cyan: 'v2_vfx_slash_big_deepseek',
      coral: 'v2_vfx_slash_big_opus',
    },
    spark: {
      cyan: 'v2_vfx_hit_spark_cyan',
      coral: 'v2_vfx_hit_spark_coral',
      gold: 'v2_vfx_hit_spark_gold',
      purple: 'v2_vfx_hit_spark_purple',
      white: 'v2_vfx_hit_spark_white',
    },
    muzzle: {
      cyan: 'v2_vfx_muzzle_cyan',
      silver: 'v2_vfx_muzzle_silver',
      gold: 'v2_vfx_muzzle_gold',
      coral: 'v2_vfx_muzzle_coral',
      teal: 'v2_vfx_muzzle_teal',
    },
    shock: {
      purple: 'v2_vfx_shockwave_glm',
      coral: 'v2_vfx_shockwave_opus',
      gold: 'v2_vfx_shockwave_sonnet',
      white: 'v2_vfx_shockwave_phase',
    },
    beam_body: {
      silver: 'v2_vfx_beam_body_kimi',
      coral: 'v2_vfx_beam_body_opus',
      teal: 'v2_vfx_beam_body_astra',
    },
    beam_cap: {
      silver: 'v2_vfx_beam_cap_kimi',
      coral: 'v2_vfx_beam_cap_opus',
      teal: 'v2_vfx_beam_cap_astra',
    },
  };
  const table = map[kind];
  if (!table) return null;
  return table[pal] || table.cyan || table.gold || table.white || null;
}

function imgReady(img) {
  return !!(img && img.complete && img.naturalWidth > 0 && !(img.dataset && img.dataset.dead === '1'));
}

function alloc(list, cap, blank) {
  for (let i = 0; i < list.length; i += 1) {
    if (!list[i].alive) {
      const o = list[i];
      Object.assign(o, blank, { alive: true });
      return o;
    }
  }
  if (list.length >= cap) {
    const o = list[uid % list.length];
    Object.assign(o, blank, { alive: true });
    uid += 1;
    return o;
  }
  const o = Object.assign({ alive: true }, blank);
  list.push(o);
  return o;
}

function burst(x, y, color, n, speed, life, size, grav) {
  const count = n || 6;
  for (let i = 0; i < count; i += 1) {
    const a = Math.random() * Math.PI * 2;
    const sp = (Math.random() * 0.6 + 0.4) * (speed || 70);
    alloc(particles, P_CAP, {
      x,
      y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp - (speed || 70) * 0.25,
      life: (life || 0.4) * (0.6 + Math.random() * 0.5),
      max: life || 0.4,
      color: color || '#f4f1ea',
      s: size || (2 + (uid % 2)),
      grav: grav == null ? 80 : grav,
      drag: 1.8,
    });
    uid += 1;
  }
}

function spawnSheet(id, x, y, opts) {
  if (!id) return;
  const meta = V2_ASSETS && V2_ASSETS[id];
  const img = loadImage(id);
  const fw = (meta && meta.size && meta.size[0]) || 32;
  const fh = (meta && meta.size && meta.size[1]) || 32;
  const frames = (meta && meta.frames) || 4;
  const fps = (meta && meta.fps) || 16;
  alloc(fx, FX_CAP, {
    type: 'sheet',
    id,
    img,
    x,
    y,
    fw,
    fh,
    frames,
    fps,
    t: 0,
    life: opts.loop ? (opts.life || 0.4) : frames / fps,
    max: opts.loop ? (opts.life || 0.4) : frames / fps,
    loop: !!opts.loop,
    angle: opts.angle || 0,
    additive: opts.additive !== false,
    scale: opts.scale || 1,
    alpha: opts.alpha == null ? 1 : opts.alpha,
  });
}

function spawnSlash(req) {
  const x = req.x || 0;
  const y = req.y || 0;
  const color = req.color || '#7ee0ff';
  const r = req.r || req.radius || 36;
  const angle = req.angle != null ? req.angle : (req.ang != null ? req.ang : -0.6);
  alloc(fx, FX_CAP, {
    type: 'slash',
    x,
    y,
    r,
    angle,
    color,
    life: req.life || 0.22,
    max: req.life || 0.22,
    w: req.w || 6,
  });
  burst(x, y, color, 8, 90, 0.28, 2, 40);
  const pal = palOf(req.who || req.color);
  const sid = r > 36
    ? (vfxId('slash_big', pal) || vfxId('slash', pal))
    : vfxId('slash', pal);
  spawnSheet(sid, x, y, { angle, additive: true, scale: r > 36 ? 1.2 : 1 });
}

function spawnBeam(req) {
  alloc(fx, FX_CAP, {
    type: 'beam',
    x: req.x || 0,
    y: req.y || 0,
    x2: req.x2 || (req.x || 0) + 80,
    y2: req.y2 || (req.y || 0),
    w: Math.max(10, req.w || 12),
    color: req.color || '#d7f4ff',
    life: Math.max(req.life || 0, 0.38),
    max: Math.max(req.life || 0, 0.38),
    who: req.who,
  });
  decal(req.x || 0, req.y || 0, req.x2, req.y2, 'scorch_line');
  const pal = palOf(req.who || 'kimi');
  spawnSheet(vfxId('beam_cap', pal), req.x, req.y, { additive: true, loop: true, life: req.life || 0.28 });
}

function spawnShock(req) {
  alloc(fx, FX_CAP, {
    type: 'shock',
    x: req.x || 0,
    y: req.y || 0,
    r0: 4,
    r1: req.r || 48,
    color: req.color || '#f4f1ea',
    life: req.life || FEEL.shockLife || 0.4,
    max: req.life || FEEL.shockLife || 0.4,
    w: req.w || 3,
  });
  const pal = palOf(req.who || req.color);
  const sid = vfxId('shock', pal) || 'v2_vfx_shockwave_phase';
  spawnSheet(sid, req.x, req.y, { additive: true, scale: (req.r || 48) / 40 });
}

function decal(x, y, x2, y2, kind) {
  alloc(decals, DECAL_CAP, {
    type: kind || 'scorch',
    x: x || 0,
    y: y || 0,
    x2,
    y2,
    r: 10 + Math.random() * 8,
    life: 2.4,
    max: 2.4,
    rot: Math.random() * Math.PI,
  });
}

function onVfx(req) {
  if (!req || !req.kind) return;
  const k = req.kind;
  if (k === 'num') {
    alloc(numbers, NUM_CAP, {
      x: req.x || 0,
      y: (req.y || 0) - 12,
      text: req.text == null ? '' : String(req.text),
      color: req.color || '#fff',
      life: req.life || FEEL.numLife || 0.85,
      max: req.life || FEEL.numLife || 0.85,
      heavy: !!(req.heavy || req.crit || (Number(req.text) >= 18)),
      crit: !!req.crit,
      pop: 1.4,
    });
  } else if (k === 'slash' || k === 'slash_arc') {
    spawnSlash(req);
  } else if (k === 'beam') {
    spawnBeam(req);
  } else if (k === 'shock' || k === 'shockwave' || k === 'ring' || k === 'telegraph_glow') {
    spawnShock(req);
  } else if (k === 'spark' || k === 'sparks') {
    burst(req.x || 0, req.y || 0, req.color || '#f4f1ea', req.n || 5, 70, req.life || FEEL.sparkLife || 0.4, 2, 90);
    const pal = palOf(req.color);
    spawnSheet(vfxId('spark', pal) || 'v2_vfx_hit_spark_white', req.x, req.y, { additive: true });
  } else if (k === 'muzzle') {
    burst(req.x || 0, req.y || 0, req.color || '#7ee0ff', 4, 50, 0.18, 2, 20);
    spawnSheet(vfxId('muzzle', palOf(req.who || req.color)), req.x, req.y, { angle: req.angle || 0, additive: true });
    alloc(fx, FX_CAP, {
      type: 'muzzle',
      x: req.x || 0,
      y: req.y || 0,
      color: req.color || '#7ee0ff',
      life: 0.1,
      max: 0.1,
    });
  } else if (k === 'impact') {
    burst(req.x || 0, req.y || 0, req.color || '#fff', req.heavy ? 14 : 8, req.heavy ? 120 : 80, 0.35, req.heavy ? 3 : 2, 70);
    spawnSheet(vfxId('spark', req.heavy ? 'gold' : 'white'), req.x, req.y, { additive: true });
  } else if (k === 'dust') {
    burst(req.x || 0, req.y || 0, '#c8c0b0', req.n || 6, 40, 0.4, 2, 30);
    spawnSheet('v2_vfx_dash_dust', req.x, req.y, { additive: false });
  } else if (k === 'afterimage') {
    alloc(afters, AFTER_CAP, {
      x: req.x || 0,
      y: req.y || 0,
      sprite: req.sprite || 'deepseek',
      flip: !!req.flip,
      life: req.life || 0.22,
      max: req.life || 0.22,
      alpha: req.alpha || 0.45,
    });
  } else if (k === 'charge') {
    alloc(fx, FX_CAP, {
      type: 'charge',
      x: req.x || 0,
      y: req.y || 0,
      color: req.color || '#d7f4ff',
      r: req.r || 22,
      life: req.life || 0.12,
      max: req.life || 0.12,
    });
    burst(req.x || 0, req.y || 0, req.color || '#d7f4ff', 3, 30, 0.25, 2, -40);
  } else if (k === 'shield_arc') {
    alloc(fx, FX_CAP, {
      type: 'shield',
      x: req.x || 0,
      y: req.y || 0,
      angle: req.angle != null ? req.angle : (req.ang || 0),
      arc: req.arc || 1.74,
      r: req.r || 22,
      color: req.color || '#d8b15a',
      perfect: !!req.perfect,
      life: req.life || 0.16,
      max: req.life || 0.16,
    });
  } else if (k === 'heal' || k === 'heal_pillar') {
    alloc(fx, FX_CAP, {
      type: 'heal',
      x: req.x || 0,
      y: req.y || 0,
      life: req.life || 0.55,
      max: req.life || 0.55,
    });
    burst(req.x || 0, req.y || 0, '#9dff9a', 12, 50, 0.5, 2, -20);
    spawnSheet('v2_vfx_heal_gpu', req.x, (req.y || 0) - 20, { additive: true, loop: true, life: 0.55 });
    spawnSheet('v2_vfx_sparkle_green', req.x, req.y, { additive: true });
  } else if (k === 'explosion') {
    alloc(fx, FX_CAP, {
      type: 'boom',
      x: req.x || 0,
      y: req.y || 0,
      r: req.r || 28,
      color: req.color || '#e07a5f',
      life: 0.4,
      max: 0.4,
    });
    burst(req.x || 0, req.y || 0, req.color || '#ffb060', 16, 140, 0.45, 3, 40);
    spawnSheet('v2_vfx_explosion', req.x, req.y, { additive: true, scale: 1.2 });
    decal(req.x, req.y, null, null, 'scorch');
  } else if (k === 'gold_sparks') {
    burst(req.x || 0, req.y || 0, '#e7c27a', req.n || 8, 60, 0.45, 2, 40);
    spawnSheet('v2_vfx_sparkle_gold', req.x, req.y, { additive: true });
  } else if (k === 'text') {
    alloc(numbers, NUM_CAP, {
      x: req.x || 0,
      y: req.y || 0,
      text: req.text || '',
      color: req.color || '#f4f1ea',
      life: req.life || 0.9,
      max: req.life || 0.9,
      heavy: false,
      crit: false,
      pop: 1,
    });
  } else if (k === 'scorch' || k === 'crack_floor') {
    decal(req.x, req.y, null, null, k === 'crack_floor' ? 'crack' : 'scorch');
  } else if (k === 'crack') {
    crackT = Math.max(crackT, req.life || 1.2);
    for (let i = 0; i < 14; i += 1) {
      const a = Math.random() * Math.PI * 2;
      shards.push({
        x: INTERNAL_W / 2,
        y: INTERNAL_H / 2,
        vx: Math.cos(a) * (80 + Math.random() * 140),
        vy: Math.sin(a) * (60 + Math.random() * 100) - 40,
        life: 0.8 + Math.random() * 0.5,
        max: 1,
        rot: Math.random() * 4,
        s: 3 + (uid % 5),
        alive: true,
      });
      uid += 1;
    }
  } else if (k === 'rift') {
    riftT = Math.max(riftT, req.life || 1.4);
  } else if (k === 'vignette') {
    vignetteA = req.a == null ? 0.55 : req.a;
    vignetteLife = req.life || 0.8;
  } else if (k === 'desaturate') {
    slowTint = req.amount == null ? 0.7 : req.amount;
  } else {
    burst(req.x || 0, req.y || 0, req.color, 4, 50, req.life || 0.35, 2, 70);
  }
}

function shakeTo(mag, dur) {
  shakeMag = Math.max(shakeMag, mag || 2);
  shakeDur = Math.max(dur || 0.12, 0.05);
  shakeAge = 0;
}

export function init(ctx) {
  ctx.bus.on(EVENTS.VFX, onVfx);
  ctx.bus.on(EVENTS.SHAKE, ({ mag, dur }) => shakeTo(mag, dur));
  ctx.bus.on(EVENTS.CAMERA_SHAKE, ({ intensity, duration }) => {
    shakeTo(Math.max(1, Math.round((intensity || 0.1) * 16)), duration || 0.12);
  });
  ctx.bus.on(EVENTS.FLASH, ({ color, dur }) => {
    flashColor = color || 'rgba(255,255,255,0.4)';
    flashDur = dur || FEEL.flashHit || 0.08;
    flashT = flashDur;
  });
  ctx.bus.on(EVENTS.HIT, (hit) => {
    if (!hit || !hit.applied) return;
    const dst = hit.dst;
    if (!dst) return;
    onVfx({
      kind: 'impact',
      x: dst.x,
      y: dst.y - 8,
      color: hit.heavy ? '#e7c27a' : '#f4f1ea',
      heavy: !!hit.heavy,
    });
    if (hit.heavy) onVfx({ kind: 'shock', x: dst.x, y: dst.y, r: 22, color: '#ffe08a', life: 0.18 });
  });
  ctx.bus.on(EVENTS.ROLL_START, ({ id }) => {
    const a = ctx.player && ctx.player.id === id ? ctx.player : null;
    const x = a ? a.x : 0;
    const y = a ? a.y : 0;
    onVfx({ kind: 'dust', x, y, n: 8 });
    onVfx({ kind: 'afterimage', x, y, sprite: a ? a.sprite : 'deepseek', flip: false });
    spawnSheet('v2_vfx_dash_speedlines', x, y - 8, { additive: true });
  });
  ctx.bus.on(EVENTS.FLASK_USED, () => {
    const p = ctx.player;
    if (!p) return;
    onVfx({ kind: 'heal_pillar', x: p.x, y: p.y });
    ctx.bus.emit(EVENTS.FLASH, { color: 'rgba(80,255,140,0.22)', dur: 0.1 });
  });
  ctx.bus.on(EVENTS.SKILL_CHARGE, ({ id }) => {
    const a = (ctx.player && ctx.player.id === id) ? ctx.player
      : (ctx.allies || []).find((x) => x.id === id);
    if (!a) return;
    onVfx({ kind: 'charge', x: a.x, y: a.y - 8, color: '#d7f4ff' });
  });
  ctx.bus.on(EVENTS.SKILL_RELEASE, () => {
    ctx.bus.emit(EVENTS.FLASH, { color: 'rgba(180,220,255,0.35)', dur: 0.1 });
  });
  ctx.bus.on(EVENTS.SHIELD_BLOCK, ({ x, y, perfect }) => {
    onVfx({ kind: 'shield_arc', x, y, perfect, color: perfect ? '#ffe08a' : '#d8b15a' });
    onVfx({ kind: 'sparks', x, y, color: '#ffe08a', n: perfect ? 10 : 5 });
  });
  ctx.bus.on(EVENTS.PERFECT_GUARD, () => {
    const p = ctx.player;
    if (p) {
      onVfx({ kind: 'shock', x: p.x, y: p.y, r: 56, color: '#ffe08a' });
      spawnSheet('v2_vfx_perfect_dodge_flash', p.x, p.y - 8, { additive: true });
    }
    ctx.bus.emit(EVENTS.FLASH, { color: 'rgba(255,224,120,0.35)', dur: 0.08 });
  });
  ctx.bus.on(EVENTS.PHASE_TRANSITION_START, () => {
    const b = ctx.boss;
    if (b) {
      onVfx({ kind: 'shock', x: b.x, y: b.y, r: 90, color: '#f4f1ea', who: 'white' });
      onVfx({ kind: 'gold_sparks', x: b.x, y: b.y, n: 18 });
    }
    ctx.bus.emit(EVENTS.FLASH, { color: '#ffffff', dur: 0.16 });
    shakeTo(5, 0.28);
  });
  ctx.bus.on(EVENTS.CUTSCENE_BEAT, ({ id, beat }) => {
    if (id === 'B' && (beat === 'start' || beat === 'crack')) {
      onVfx({ kind: 'crack', life: 1.6 });
      ctx.bus.emit(EVENTS.FLASH, { color: 'rgba(244,241,234,0.55)', dur: 0.12 });
      shakeTo(6, 0.4);
    }
    if (id === 'A' && beat === 'dive') onVfx({ kind: 'rift', life: 1.6 });
    if (id === 'A' && beat === 'parry') {
      const b = ctx.boss;
      if (b) onVfx({ kind: 'shock', x: b.x, y: b.y, r: 80, color: '#9fd8d2', who: 'astra' });
      ctx.bus.emit(EVENTS.FLASH, { color: 'rgba(200,255,250,0.4)', dur: 0.12 });
    }
  });
  ctx.bus.on(EVENTS.PLAYER_DEATH, () => {
    slowTint = 0.8;
    vignetteA = 0.65;
    vignetteLife = 0.8;
  });
  ctx.world.vfx = { update, render, reset, spawn: onVfx, setOverlay };
}

function stepList(list, dt, move) {
  for (let i = list.length - 1; i >= 0; i -= 1) {
    const p = list[i];
    if (!p.alive && p.alive !== undefined) {
      // keep holes for pool
      continue;
    }
    p.life -= dt;
    if (move) move(p, dt);
    if (p.life <= 0) {
      if (p.alive !== undefined) p.alive = false;
      else list.splice(i, 1);
    }
  }
}

export function update(ctx, dt) {
  const step = dt || 0;
  if (overlayUpdate) overlayUpdate(ctx, step);

  stepList(particles, step, (p, s) => {
    p.vy += (p.grav || 0) * s;
    p.vx *= Math.max(0, 1 - (p.drag || 0) * s);
    p.x += p.vx * s;
    p.y += p.vy * s;
  });
  stepList(numbers, step, (n, s) => {
    n.y -= 28 * s;
    n.pop = Math.max(1, n.pop - s * 2.4);
  });
  stepList(fx, step, (s, d) => { s.t = (s.t || 0) + d; });
  stepList(decals, step, null);
  stepList(afters, step, null);
  stepList(shards, step, (p, s) => {
    p.vy += 180 * s;
    p.x += p.vx * s;
    p.y += p.vy * s;
    p.rot += s * 8;
  });

  if (flashT > 0) flashT -= step;
  if (crackT > 0) crackT -= step;
  if (riftT > 0) riftT -= step;
  if (vignetteLife > 0) {
    vignetteLife -= step;
    if (vignetteLife <= 0) vignetteA = 0;
  }
  if (slowTint > 0) slowTint = Math.max(0, slowTint - step * 0.4);

  if (ctx && ctx.player && ctx.player.rolling) {
    const p = ctx.player;
    if ((uid & 1) === 0) {
      onVfx({ kind: 'afterimage', x: p.x, y: p.y, sprite: p.sprite, flip: false, life: 0.16 });
    }
    uid += 1;
  }

  if (shakeDur > 0) {
    shakeAge += step;
    if (shakeAge >= shakeDur) {
      shakeDur = 0;
      shakeMag = 0;
      setShake(0, 0);
    } else {
      const k = 1 - shakeAge / shakeDur;
      const m = Math.max(1, Math.round(shakeMag * k));
      const sx = (((Math.sin(shakeAge * 92) > 0) ? 1 : -1) * m) | 0;
      const sy = (((Math.cos(shakeAge * 71) > 0) ? 1 : -1) * Math.max(0, m - 1)) | 0;
      setShake(sx, sy);
    }
  }

  if (slowTint > 0.05) {
    const amt = Math.min(1, slowTint);
    setFilter(`grayscale(${amt * 0.85}) contrast(1.08) brightness(${1 - amt * 0.18})`);
  }
}

function pixelRing(g, cx, cy, r, color, w, a) {
  g.save();
  g.globalAlpha = a;
  g.strokeStyle = color;
  g.lineWidth = w || 2;
  g.beginPath();
  g.arc(Math.round(cx), Math.round(cy), Math.max(1, r), 0, Math.PI * 2);
  g.stroke();
  g.restore();
}

function drawSlash(g, s) {
  const k = 1 - Math.max(0, s.life) / s.max;
  g.save();
  g.translate(Math.round(s.x), Math.round(s.y));
  g.rotate(s.angle);
  g.globalCompositeOperation = 'lighter';
  g.strokeStyle = s.color;
  g.globalAlpha = Math.max(0, s.life / s.max);
  g.lineWidth = s.w + 4;
  g.beginPath();
  g.arc(0, 0, s.r * (0.7 + k * 0.4), -1.05, 1.05);
  g.stroke();
  g.strokeStyle = '#fff';
  g.lineWidth = Math.max(2, s.w - 1);
  g.beginPath();
  g.arc(0, 0, s.r * (0.7 + k * 0.4), -0.9, 0.9);
  g.stroke();
  g.restore();
}

function drawBeam(g, s) {
  const flick = 0.8 + Math.sin((s.t || 0) * 70) * 0.2;
  const a = Math.max(0, s.life / s.max) * flick;
  const x1 = Math.round(s.x);
  const y1 = Math.round(s.y);
  const x2 = Math.round(s.x2);
  const y2 = Math.round(s.y2);
  g.save();
  g.globalCompositeOperation = 'lighter';
  g.strokeStyle = s.color;
  g.globalAlpha = a * 0.55;
  g.lineWidth = (s.w || 12) + 16;
  g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
  g.globalAlpha = a * 0.9;
  g.lineWidth = (s.w || 12) + 6;
  g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
  g.strokeStyle = '#ffffff';
  g.globalAlpha = a;
  g.lineWidth = Math.max(3, (s.w || 12) * 0.45);
  g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
  g.fillStyle = '#fff';
  g.fillRect(x1 - 3, y1 - 3, 6, 6);
  g.fillRect(x2 - 3, y2 - 3, 6, 6);
  g.restore();
}

function drawSheet(g, s) {
  const img = s.img;
  if (!imgReady(img)) return;
  const frame = s.loop
    ? Math.floor((s.t || 0) * s.fps) % Math.max(1, s.frames)
    : Math.min(s.frames - 1, Math.floor((s.t || 0) * s.fps));
  g.save();
  if (s.additive) g.globalCompositeOperation = 'lighter';
  g.globalAlpha = Math.max(0, s.life / s.max) * (s.alpha || 1);
  g.translate(Math.round(s.x), Math.round(s.y));
  if (s.angle) g.rotate(s.angle);
  const sc = s.scale || 1;
  g.imageSmoothingEnabled = false;
  g.drawImage(
    img,
    frame * s.fw,
    0,
    s.fw,
    s.fh,
    Math.round(-s.fw * sc / 2),
    Math.round(-s.fh * sc / 2),
    Math.round(s.fw * sc),
    Math.round(s.fh * sc),
  );
  g.restore();
}

function drawHeal(g, s) {
  const k = 1 - s.life / s.max;
  const h = 18 + k * 48;
  g.save();
  g.globalCompositeOperation = 'lighter';
  g.globalAlpha = Math.max(0, s.life / s.max);
  g.fillStyle = '#3ddc84';
  g.fillRect(Math.round(s.x) - 4, Math.round(s.y) - h, 8, h);
  g.fillStyle = '#9dff9a';
  g.fillRect(Math.round(s.x) - 2, Math.round(s.y) - h, 4, h);
  g.fillStyle = '#fff';
  g.fillRect(Math.round(s.x) - 1, Math.round(s.y) - h, 2, h);
  g.restore();
}

function drawDecal(g, d) {
  const a = Math.max(0, d.life / d.max) * 0.45;
  g.save();
  g.globalAlpha = a;
  g.translate(Math.round(d.x), Math.round(d.y));
  g.rotate(d.rot || 0);
  if (d.type === 'scorch_line' && d.x2 != null) {
    g.restore();
    g.save();
    g.globalAlpha = a * 0.5;
    g.strokeStyle = '#3a2a20';
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(Math.round(d.x), Math.round(d.y));
    g.lineTo(Math.round(d.x2), Math.round(d.y2));
    g.stroke();
    g.restore();
    return;
  }
  g.fillStyle = d.type === 'crack' ? '#1b1530' : '#2a2018';
  g.fillRect(-Math.round(d.r / 2), -1, Math.round(d.r), 2);
  g.fillRect(-1, -Math.round(d.r / 3), 2, Math.round(d.r / 1.5));
  if (d.type === 'crack') {
    g.fillRect(-Math.round(d.r / 3), 2, Math.round(d.r / 2), 1);
  }
  g.restore();
}

function drawGlass(g) {
  if (crackT <= 0 && shards.length === 0) return;
  g.save();
  g.strokeStyle = 'rgba(244,241,234,0.9)';
  g.lineWidth = 1;
  const cx = INTERNAL_W / 2;
  const cy = 40;
  const n = 10;
  for (let i = 0; i < n; i += 1) {
    g.beginPath();
    g.moveTo(cx, cy);
    g.lineTo(40 + i * 60, 50 + (i % 4) * 40);
    g.lineTo(70 + i * 55, 140 + (i % 3) * 30);
    g.stroke();
  }
  g.fillStyle = 'rgba(244,241,234,0.55)';
  for (let i = 0; i < shards.length; i += 1) {
    const s = shards[i];
    if (s.life <= 0) continue;
    g.globalAlpha = Math.max(0, s.life / (s.max || 1));
    g.save();
    g.translate(s.x, s.y);
    g.rotate(s.rot || 0);
    g.fillRect(0, 0, s.s + 2, s.s);
    g.restore();
  }
  g.restore();
}

function drawRift(g) {
  if (riftT <= 0) return;
  const a = Math.min(1, riftT);
  g.save();
  g.globalCompositeOperation = 'lighter';
  g.globalAlpha = a * 0.85;
  const x = WORLD_OX + 240;
  g.strokeStyle = '#f4f1ea';
  g.lineWidth = 3;
  g.beginPath();
  g.moveTo(x, 4);
  g.lineTo(x - 8, 28);
  g.lineTo(x + 6, 48);
  g.lineTo(x - 4, 70);
  g.stroke();
  g.strokeStyle = '#9fd8d2';
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(x + 5, 6);
  g.lineTo(x - 2, 36);
  g.lineTo(x + 10, 58);
  g.stroke();
  g.strokeStyle = '#d8b15a';
  g.lineWidth = 1;
  g.beginPath();
  g.moveTo(x - 6, 10);
  g.lineTo(x + 2, 44);
  g.stroke();
  g.restore();
}

export function render(ctx, g) {
  if (overlay) {
    applyScreen(g);
    overlay(ctx, g);
  }
  applyWorld(g);

  for (let i = 0; i < decals.length; i += 1) {
    if (decals[i].alive === false) continue;
    if (decals[i].life > 0) drawDecal(g, decals[i]);
  }
  for (let i = 0; i < afters.length; i += 1) {
    const a = afters[i];
    if (a.alive === false || a.life <= 0) continue;
    drawProcedural(g, a.sprite, a.x, a.y, {
      flip: a.flip,
      alpha: (a.alpha || 0.4) * (a.life / a.max),
      flash: true,
    });
  }
  for (let i = 0; i < fx.length; i += 1) {
    const s = fx[i];
    if (s.alive === false || s.life <= 0) continue;
    if (s.type === 'slash') drawSlash(g, s);
    else if (s.type === 'beam') drawBeam(g, s);
    else if (s.type === 'shock') {
      const k = 1 - s.life / s.max;
      pixelRing(g, s.x, s.y, s.r0 + (s.r1 - s.r0) * k, s.color, s.w, s.life / s.max);
      pixelRing(g, s.x, s.y, s.r0 + (s.r1 - s.r0) * k - 2, '#fff', 1, (s.life / s.max) * 0.6);
    } else if (s.type === 'sheet') drawSheet(g, s);
    else if (s.type === 'heal') drawHeal(g, s);
    else if (s.type === 'muzzle') {
      g.save();
      g.globalCompositeOperation = 'lighter';
      g.globalAlpha = s.life / s.max;
      g.fillStyle = s.color;
      g.fillRect(Math.round(s.x) - 4, Math.round(s.y) - 4, 8, 8);
      g.fillStyle = '#fff';
      g.fillRect(Math.round(s.x) - 2, Math.round(s.y) - 2, 4, 4);
      g.restore();
    } else if (s.type === 'charge') {
      const k = s.life / s.max;
      pixelRing(g, s.x, s.y, s.r * k, s.color, 2, k);
    } else if (s.type === 'shield') {
      g.save();
      g.translate(Math.round(s.x), Math.round(s.y));
      g.rotate(s.angle);
      g.strokeStyle = s.perfect ? '#ffe08a' : s.color;
      g.globalAlpha = s.life / s.max;
      g.lineWidth = s.perfect ? 5 : 3;
      g.beginPath();
      g.arc(0, 0, s.r, -s.arc * 0.5, s.arc * 0.5);
      g.stroke();
      g.restore();
    } else if (s.type === 'boom') {
      const k = 1 - s.life / s.max;
      g.save();
      g.globalCompositeOperation = 'lighter';
      g.globalAlpha = s.life / s.max;
      g.fillStyle = s.color;
      const r = Math.round(s.r * (0.4 + k));
      g.fillRect(Math.round(s.x) - r, Math.round(s.y) - r, r * 2, r * 2);
      g.fillStyle = '#fff';
      g.fillRect(Math.round(s.x) - 3, Math.round(s.y) - 3, 6, 6);
      g.restore();
    }
  }
  g.save();
  g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < particles.length; i += 1) {
    const p = particles[i];
    if (p.alive === false || p.life <= 0) continue;
    g.globalAlpha = Math.max(0, p.life / p.max);
    g.fillStyle = p.color;
    g.fillRect(Math.round(p.x), Math.round(p.y), p.s, p.s);
  }
  g.restore();

  for (let i = 0; i < numbers.length; i += 1) {
    const n = numbers[i];
    if (n.alive === false || n.life <= 0) continue;
    g.save();
    g.globalAlpha = Math.max(0, n.life / n.max);
    const big = n.heavy || n.crit;
    const sc = big ? Math.max(2, Math.round(n.pop + 0.6)) : 1;
    const w = String(n.text).length * (big ? 6 * sc : 6);
    const nx = Math.round(n.x) - (w >> 1);
    const ny = Math.round(n.y);
    drawTextOutlined(g, n.text, nx, ny, n.color || (big ? '#ffe08a' : '#fff'), sc, true);
    g.restore();
  }

  applyScreen(g);
  drawRift(g);
  drawGlass(g);
  if (vignetteA > 0) {
    g.save();
    g.globalAlpha = vignetteA * Math.max(0.2, vignetteLife);
    g.fillStyle = '#0a0614';
    g.fillRect(0, 0, INTERNAL_W, 18);
    g.fillRect(0, INTERNAL_H - 18, INTERNAL_W, 18);
    g.fillRect(0, 0, 24, INTERNAL_H);
    g.fillRect(INTERNAL_W - 24, 0, 24, INTERNAL_H);
    g.restore();
  }
  if (flashT > 0) {
    g.save();
    g.globalAlpha = Math.max(0, flashT / flashDur) * 0.9;
    g.fillStyle = flashColor;
    g.fillRect(0, 0, INTERNAL_W, INTERNAL_H);
    g.restore();
  }
  applyWorld(g);
}

export function reset() {
  particles.length = 0;
  fx.length = 0;
  numbers.length = 0;
  decals.length = 0;
  afters.length = 0;
  shards.length = 0;
  flashT = 0;
  shakeDur = 0;
  shakeMag = 0;
  crackT = 0;
  riftT = 0;
  vignetteA = 0;
  slowTint = 0;
  setShake(0, 0);
  setFilter('');
}

export function spawn(req) { onVfx(req); }
