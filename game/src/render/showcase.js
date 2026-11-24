// OWNER: W3
// VFX / sprite gallery. `?vfxtest=1` on the game, or tools/vfx_gallery.html.

import { EVENTS } from '../core/contracts.js';
import { loadImage } from '../config/assets.js';
import * as pixel from './pixel.js';
import * as room from './room.js';
import * as procedural from './procedural.js';
import * as vfx from './vfx.js';
import { drawTextOutlined, drawCjk, drawText5 } from './font.js';
import { applyScreen, INTERNAL_W, INTERNAL_H, WORLD_OX, WORLD_OY } from './world.js';

const KINDS = [
  'slash_arc', 'beam', 'shockwave', 'ring', 'muzzle', 'sparks', 'impact',
  'dust', 'afterimage', 'charge', 'shield_arc', 'heal_pillar', 'explosion',
  'gold_sparks', 'text', 'num', 'scorch', 'crack', 'rift',
];

const CAST = [
  { id: 'deepseek', label: 'DEEPSEEK' },
  { id: 'kimi', label: 'KIMI' },
  { id: 'glm', label: 'GLM' },
  { id: 'haiku', label: 'HAIKU' },
  { id: 'sonnet', label: 'SONNET' },
  { id: 'opus', label: 'OPUS 5.5' },
  { id: 'astra', label: 'ASTRA' },
  { id: 'fable', label: 'FABLE' },
  { id: 'fablehand', label: 'HAND' },
  { id: 'dario', label: 'DARIO' },
  { id: 'stele', label: 'STELE' },
];

const SHAPES = ['fin', 'orb', 'bolt', 'petal', 'glyph', 'quill', 'feather', 'node', 'whale', 'star', 'hammer'];

let installed = false;
let t = 0;
let kindI = 0;
let nextPulse = 0;
let ctxRef = null;
let fake = false;

function emit(kind, extra) {
  const payload = Object.assign({ kind }, extra || {});
  if (ctxRef && ctxRef.bus) ctxRef.bus.emit(EVENTS.VFX, payload);
  else vfx.spawn(payload);
}

function pulse(kind) {
  const cx = 240;
  const cy = 150;
  if (kind === 'slash_arc' || kind === 'slash') {
    for (let i = 0; i < 8; i += 1) {
      emit('slash_arc', {
        x: cx + Math.cos((Math.PI * 2 * i) / 8) * 18,
        y: cy + Math.sin((Math.PI * 2 * i) / 8) * 18,
        angle: (Math.PI * 2 * i) / 8,
        r: 32,
        color: '#7ee0ff',
        who: 'deepseek',
      });
    }
    emit('shake' === kind ? {} : { kind: 'impact', x: cx, y: cy, color: '#7ee0ff' });
  } else if (kind === 'beam') {
    emit('beam', { x: 80, y: 140, x2: 400, y2: 160, w: 14, color: '#d7f4ff', who: 'kimi', life: 0.4 });
  } else if (kind === 'shockwave' || kind === 'shock') {
    emit('shockwave', { x: cx, y: cy, r: 90, color: '#ffe08a', who: 'glm' });
  } else if (kind === 'ring') {
    emit('ring', { x: cx, y: cy, r: 48, color: '#d8b15a' });
  } else if (kind === 'muzzle') {
    emit('muzzle', { x: cx + 20, y: cy - 8, color: '#7ee0ff', who: 'deepseek' });
  } else if (kind === 'sparks' || kind === 'spark') {
    emit('sparks', { x: cx, y: cy, color: '#f4f1ea', n: 16 });
  } else if (kind === 'impact') {
    emit('impact', { x: cx, y: cy, color: '#fff', heavy: true });
  } else if (kind === 'dust') {
    emit('dust', { x: cx, y: cy + 10, n: 10 });
  } else if (kind === 'afterimage') {
    emit('afterimage', { x: cx - 16, y: cy, sprite: 'deepseek' });
    emit('afterimage', { x: cx, y: cy, sprite: 'deepseek' });
  } else if (kind === 'charge') {
    emit('charge', { x: cx, y: cy - 8, color: '#d7f4ff', r: 24 });
  } else if (kind === 'shield_arc') {
    emit('shield_arc', { x: cx, y: cy, angle: -0.4, perfect: true, r: 26 });
  } else if (kind === 'heal_pillar' || kind === 'heal') {
    emit('heal_pillar', { x: cx, y: cy });
  } else if (kind === 'explosion') {
    emit('explosion', { x: cx, y: cy, r: 36 });
  } else if (kind === 'gold_sparks') {
    emit('gold_sparks', { x: cx, y: cy, n: 20 });
  } else if (kind === 'text') {
    emit('text', { x: cx - 20, y: cy - 30, text: 'PERFECT', color: '#ffe08a' });
  } else if (kind === 'num') {
    emit('num', { x: cx, y: cy - 20, text: '88', color: '#ffe08a', heavy: true });
    emit('num', { x: cx + 20, y: cy - 8, text: '12', color: '#ffb4b4' });
  } else if (kind === 'scorch') {
    emit('scorch', { x: cx, y: cy + 8 });
  } else if (kind === 'crack') {
    emit('crack', { life: 1.2 });
  } else if (kind === 'rift') {
    emit('rift', { life: 1.4 });
  }
  if (ctxRef && ctxRef.bus) {
    ctxRef.bus.emit(EVENTS.SHAKE, { mag: 4, dur: 0.18 });
    ctxRef.bus.emit(EVENTS.FLASH, { color: 'rgba(255,255,255,0.18)', dur: 0.07 });
  }
}

function drawCast(g, time) {
  const startX = 108;
  const y = 118;
  for (let i = 0; i < CAST.length; i += 1) {
    const c = CAST[i];
    const x = startX + i * 48;
    procedural.draw(g, c.id, x, y, {
      frame: Math.floor(time * 8) % 4,
      flip: false,
    });
    drawTextOutlined(g, c.label, x - 14, y + 2, '#f4f1ea', 1, false);
  }
}

function drawFlasks(g, time) {
  procedural.draw(g, 'flask_rtx', 24, 80, { frame: Math.floor(time * 10) % 4 });
  procedural.draw(g, 'flask_h200', 24, 104, { frame: Math.floor(time * 10) % 4 });
  procedural.draw(g, 'flask_b200', 24, 128, { frame: Math.floor(time * 10) % 4 });
  drawTextOutlined(g, 'GPU', 10, 140, '#9dff9a', 1, false);
}

function drawBullets(g, time) {
  for (let i = 0; i < SHAPES.length; i += 1) {
    const x = 100 + i * 22;
    const y = 328;
    procedural.draw(g, SHAPES[i], x, y, { frame: Math.floor(time * 10) % 2 });
  }
}

function drawAiIfPresent(g) {
  const ids = [
    ['v2_deepseek_sheet_48', 48],
    ['v2_kimi_sheet_48', 48],
    ['v2_glm_sheet_48', 48],
    ['v2_haiku_sheet', 96],
    ['v2_sonnet_sheet', 128],
    ['v2_opus_sheet', 192],
    ['v2_astra_mature_sheet', 128],
  ];
  let x = 20;
  for (let i = 0; i < ids.length; i += 1) {
    const img = loadImage(ids[i][0]);
    if (img && img.complete && img.naturalWidth > 0 && !(img.dataset && img.dataset.dead === '1')) {
      const fw = ids[i][1];
      g.imageSmoothingEnabled = false;
      const dw = Math.min(40, fw);
      g.drawImage(img, 0, 0, fw, fw, x, 200, dw, dw);
      x += dw + 4;
    }
  }
}

function overlayRender(ctx, g) {
  applyScreen(g);
  const time = ctx && ctx.time ? ctx.time.elapsed : t;
  // Keep the cathedral as backdrop in world space.
  if (ctx && ctx.state) {
    const prev = ctx.state.current;
    ctx.state.current = 'fight';
    room.render(ctx, g);
    ctx.state.current = prev;
  } else {
    g.fillStyle = '#0b0a12';
    g.fillRect(0, 0, INTERNAL_W, INTERNAL_H);
  }
  applyScreen(g);
  g.fillStyle = 'rgba(8,8,14,0.55)';
  g.fillRect(0, 0, 80, INTERNAL_H);
  g.fillRect(560, 0, 80, INTERNAL_H);
  g.fillStyle = 'rgba(8,8,14,0.42)';
  g.fillRect(80, 0, 480, 22);
  drawText5(g, 'VFX TEST', 10, 8, '#d8b15a', 1);
  drawCjk(g, '特效测试', 10, 22, '#f4f1ea', 9);
  const kind = KINDS[kindI % KINDS.length];
  drawTextOutlined(g, kind.toUpperCase(), 90, 6, '#7ee0ff', 1, false);
  drawTextOutlined(g, 'PROCEDURAL', 90, 16, '#f4f1ea', 1, false);
  drawCast(g, time);
  drawAiIfPresent(g);
  drawBullets(g, time);
  drawFlasks(g, time);
  drawTextOutlined(g, 'CODE DRAWN + SHEET LAYERS', 200, 340, '#d8b15a', 1, false);
}

function overlayUpdate(ctx, dt) {
  t += dt || 0;
  nextPulse -= dt || 0;
  if (nextPulse <= 0) {
    pulse(KINDS[kindI % KINDS.length]);
    kindI += 1;
    nextPulse = 0.85;
  }
}

export function active() {
  return installed;
}

export function install(ctx) {
  if (installed) return;
  installed = true;
  ctxRef = ctx;
  vfx.setOverlay(overlayRender, overlayUpdate);
  if (ctx && ctx.world) ctx.world.vfxtest = true;
  const ui = typeof document !== 'undefined' ? document.getElementById('ui-root') : null;
  if (ui) ui.style.display = 'none';
  pulse('slash_arc');
  pulse('shockwave');
}

function fakeCtx() {
  const listeners = {};
  const bus = {
    on(e, fn) { (listeners[e] || (listeners[e] = [])).push(fn); },
    off() {},
    emit(e, p) {
      const list = listeners[e] || [];
      for (let i = 0; i < list.length; i += 1) {
        try { list[i](p); } catch { /* ignore */ }
      }
    },
  };
  const time = { elapsed: 0, unscaled: 0, hitStop: 0, timeScale: 1, requestHitStop() {} };
  return {
    bus,
    time,
    assets: { image: loadImage, get: () => null, config: {} },
    state: { current: 'fight', previous: null, set() {} },
    player: { x: 240, y: 200, id: 'deepseek', sprite: 'px.deepseek', facing: 's', vx: 0, vy: 0, r: 3, alive: true, hp: 100, maxHp: 100, invuln: 0, flash: 0, team: 'player' },
    boss: { x: 240, y: 110, id: 'claude', sprite: 'px.boss.p1', phase: 1, facing: 's', vx: 0, vy: 0, r: 10, alive: true, hp: 3000, maxHp: 3000, invuln: 0, flash: 0, team: 'boss' },
    allies: [],
    debug: {},
    world: {},
    holo: { zh: '测试', en: 'TEST', until: 9e9 },
    flags: {},
    input: { pressed() { return false; }, eat() {} },
  };
}

/** Standalone page: tools/vfx_gallery.html */
export function runStandalone(canvas) {
  fake = true;
  pixel.init(canvas);
  const ctx = fakeCtx();
  room.init(ctx);
  vfx.init(ctx);
  procedural.init();
  install(ctx);
  ctx.holo = { zh: '测试', en: 'TEST', until: 9e9 };
  let last = performance.now();
  function loop(now) {
    const raw = Math.min(0.1, Math.max(0, (now - last) / 1000));
    last = now;
    ctx.time.elapsed += raw;
    ctx.time.unscaled += raw;
    vfx.update(ctx, raw);
    const g = pixel.begin();
    vfx.render(ctx, g);
    pixel.present();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
  return ctx;
}

void WORLD_OX;
void WORLD_OY;
void INTERNAL_H;
void fake;
