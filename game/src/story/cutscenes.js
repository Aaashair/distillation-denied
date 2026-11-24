// OWNER: W5
// In-engine ending beats, drawn on the pixel buffer with sprites + local VFX.
// Kinds that W3 may not have yet (rift, crack, shards, hex-knot, ribbon, desaturate)
// are drawn here. Juice also goes out on the bus (shake / flash / vfx).
//
// A: time 0.15, Opus raises the greatsword, sky rift, Astra dives, hex-knot parry,
//    shockwave knocks Opus, light ribbon lifts the player → theater A.
// B: freeze + glass crack/shards, sky darkens, giant hand, Fable lifts Opus,
//    everyone down → theater B.
// Each beat ~3.2 s. Enter / Space / click skips the rest after a short lock.

import { EVENTS } from '../core/contracts.js';
import { loadImage, PIXEL_SPRITES } from '../config/assets.js';
import { draw as drawProcedural } from '../render/procedural.js';
import {
  applyScreen, applyWorld, INTERNAL_W, INTERNAL_H, WORLD_OX, WORLD_OY,
} from '../render/world.js';

// Actors and the rescue beat live in room-local pixels (the 480×320 plate).
// Full-screen darken / glass / rift are buffer pixels so the gutters go dark too.
const ROOM_W = 480;
const ROOM_CX = ROOM_W / 2;
// 128px feet-anchored Astra: enter with her head on the buffer, not above it.
const ASTRA_ENTER_Y = 8 - WORLD_OY + 128;

const BEAT = 3.2;

const A_BEATS = [
  { name: 'windup', at: 0 },
  { name: 'rift', at: BEAT },
  { name: 'dive', at: BEAT * 2 },
  { name: 'parry', at: BEAT * 3 },
  { name: 'carry', at: BEAT * 4 },
];
const A_END = BEAT * 5;

const B_BEATS = [
  { name: 'crack', at: 0 },
  { name: 'darken', at: BEAT },
  { name: 'hand', at: BEAT * 2 },
  { name: 'lift', at: BEAT * 3 },
];
const B_END = BEAT * 4 + 0.4;

let run = null;

function withScreen(g, draw) {
  g.save();
  applyScreen(g);
  draw();
  g.restore();
}

function fillScreen(g, style) {
  withScreen(g, () => {
    g.fillStyle = style;
    g.fillRect(0, 0, INTERNAL_W, INTERNAL_H);
  });
}

function setBeat(ctx, beat) {
  if (!run || run.beat === beat) return;
  run.beat = beat;
  ctx.cutscene = { id: run.which, beat, t: run.t };
  ctx.bus.emit(EVENTS.CUTSCENE_BEAT, { id: run.which, beat, t: run.t });
  onBeat(ctx, beat);
}

function juice(ctx, kind, payload) {
  if (kind === 'shake') ctx.bus.emit(EVENTS.SHAKE, payload);
  else if (kind === 'flash') ctx.bus.emit(EVENTS.FLASH, payload);
  else ctx.bus.emit(EVENTS.VFX, payload);
}

function onBeat(ctx, beat) {
  const audio = ctx.audio;
  const player = ctx.player;
  const boss = ctx.boss;
  if (run.which === 'A') {
    if (beat === 'windup') {
      audio?.playSfx('sfx.heartbeat', { loop: true, fadeOut: 0, maxDuration: 0 });
      juice(ctx, 'shake', { mag: 2, dur: 0.4 });
    } else if (beat === 'rift') {
      audio?.playSfx('sfx.tear');
      juice(ctx, 'flash', { color: 'rgba(207,232,226,0.55)', dur: 0.28 });
      juice(ctx, 'shake', { mag: 4, dur: 0.5 });
    } else if (beat === 'dive') {
      audio?.playVo('v2_vo_astra_arrive_2');
      audio?.playSfx('sfx.heavy');
      juice(ctx, 'shake', { mag: 3, dur: 0.35 });
    } else if (beat === 'parry') {
      audio?.playSfx('sfx.perfect');
      audio?.playSfx('sfx.heavy');
      juice(ctx, 'flash', { color: 'rgba(255,255,255,0.85)', dur: 0.18 });
      juice(ctx, 'shake', { mag: 7, dur: 0.55 });
      if (player) juice(ctx, 'vfx', { kind: 'shock', x: player.x, y: player.y, r: 90, color: '#9fd8d2', life: 0.55 });
      if (boss) {
        run.bossHomeX = boss.x;
        run.bossHomeY = boss.y;
        boss.pose = 'hurt';
        boss.flash = 0.25;
      }
    } else if (beat === 'carry') {
      audio?.stopSfx('sfx.heartbeat', { fade: 0.3 });
      audio?.playSfx('sfx.phase');
      juice(ctx, 'flash', { color: 'rgba(255,250,230,0.4)', dur: 0.4 });
    }
  } else {
    if (beat === 'crack') {
      audio?.playSfx('sfx.glass');
      audio?.playVo('v2_vo_dario_endB_trigger');
      juice(ctx, 'flash', { color: 'rgba(255,255,255,0.9)', dur: 0.12 });
      juice(ctx, 'shake', { mag: 8, dur: 0.6 });
      spawnGlass(run);
    } else if (beat === 'darken') {
      audio?.playSfx('sfx.heartbeat', { loop: true, fadeOut: 0, maxDuration: 0 });
    } else if (beat === 'hand') {
      audio?.stopSfx('sfx.heartbeat', { fade: 0.2 });
      audio?.playSfx('sfx.slam');
      audio?.playVo('v2_vo_fable_1');
      juice(ctx, 'shake', { mag: 6, dur: 0.8 });
    } else if (beat === 'lift') {
      audio?.playVo('v2_vo_fable_2');
      audio?.playVo('v2_vo_opus_taken');
      audio?.playSfx('sfx.heavy');
      juice(ctx, 'shake', { mag: 5, dur: 0.7 });
      juice(ctx, 'flash', { color: 'rgba(90,40,120,0.45)', dur: 0.3 });
      if (player) player.pose = 'down';
      const allies = ctx.allies || [];
      for (let i = 0; i < allies.length; i += 1) {
        allies[i].pose = 'down';
        allies[i].vx = 0;
        allies[i].vy = 0;
      }
      if (boss) boss.pose = 'hurt';
    }
  }
}

function spawnGlass(state) {
  state.cracks = [];
  state.shards = [];
  const W = INTERNAL_W;
  const H = INTERNAL_H;
  const seeds = [
    [W * 0.5, 18],
    [W * 0.42, H * 0.22],
    [W * 0.58, H * 0.18],
    [W * 0.35, H * 0.4],
    [W * 0.7, H * 0.35],
  ];
  for (let s = 0; s < seeds.length; s += 1) {
    const [sx, sy] = seeds[s];
    const branches = 4 + (s % 3);
    for (let b = 0; b < branches; b += 1) {
      const ang = (b / branches) * Math.PI * 2 + s * 0.4;
      const pts = [{ x: sx, y: sy }];
      let x = sx;
      let y = sy;
      for (let k = 0; k < 5; k += 1) {
        x += Math.cos(ang + (k % 2 ? 0.4 : -0.35)) * (18 + k * 10);
        y += Math.sin(ang + 0.2) * (14 + k * 8);
        pts.push({ x, y });
      }
      state.cracks.push(pts);
    }
  }
  for (let i = 0; i < 48; i += 1) {
    state.shards.push({
      x: W * 0.3 + (i * 17) % (W * 0.5),
      y: 20 + (i * 13) % (H * 0.5),
      vx: ((i % 7) - 3) * 40,
      vy: 30 + (i % 5) * 25,
      rot: i * 0.4,
      s: 3 + (i % 5),
    });
  }
}

function readyImg(id) {
  const img = loadImage(id);
  if (img && img.complete && img.naturalWidth > 0 && !(img.dataset && img.dataset.dead === '1')) return img;
  return null;
}

function drawSprite(g, id, x, y, opts = {}) {
  const spec = PIXEL_SPRITES[id] || PIXEL_SPRITES[id.replace(/\.[a-z]+$/, '')] || null;
  const img = readyImg(id) || (spec && spec.v2 ? readyImg(spec.v2) : null);
  const scale = opts.scale || 1;
  const frame = opts.frame || 0;
  const row = opts.row || 0;
  if (img) {
    const fw = spec?.frameW || img.naturalWidth;
    const fh = spec?.frameH || img.naturalHeight;
    const cols = spec?.cols || Math.max(1, Math.floor(img.naturalWidth / fw) || 1);
    const col = frame % cols;
    const rr = row || Math.floor(frame / cols);
    const ax = (spec?.anchorX != null ? spec.anchorX : fw / 2) * scale;
    const ay = (spec?.anchorY != null ? spec.anchorY : fh) * scale;
    g.save();
    g.imageSmoothingEnabled = false;
    g.globalAlpha = opts.alpha == null ? 1 : opts.alpha;
    g.translate(Math.round(x), Math.round(y));
    if (opts.flip) g.scale(-1, 1);
    if (opts.flash) g.globalCompositeOperation = 'lighter';
    g.drawImage(
      img,
      col * fw,
      rr * fh,
      fw,
      fh,
      Math.round(-ax),
      Math.round(-ay),
      Math.round(fw * scale),
      Math.round(fh * scale),
    );
    g.restore();
    return;
  }
  drawProcedural(g, id, Math.round(x), Math.round(y), opts);
}

function eatSkip(ctx) {
  if (!ctx.input) return false;
  const hit = ctx.input.pressed('enter') || ctx.input.pressed('space') || ctx.input.pressed('lmb');
  if (hit) {
    ctx.input.eat('enter');
    ctx.input.eat('space');
    ctx.input.eat('lmb');
  }
  return hit;
}

export function start(ctx, which) {
  const id = which === 'B' ? 'B' : 'A';
  run = {
    which: id,
    t: 0,
    beat: '',
    done: false,
    shards: [],
    cracks: [],
    bossHomeX: 0,
    bossHomeY: 0,
    astraX: ctx.player ? ctx.player.x : ROOM_CX,
    astraY: ASTRA_ENTER_Y,
  };
  ctx.cutscene = { id, beat: 'start', t: 0 };
  ctx.flags.inputLocked = true;
  if (ctx.player) {
    ctx.player.pose = 'down';
    ctx.player.vx = 0;
    ctx.player.vy = 0;
    ctx.player.rolling = false;
  }
  if (ctx.boss) ctx.boss.pose = id === 'A' ? 'windup' : 'hurt';
  if (id === 'A') ctx.time.setScale(0.15);
  else ctx.time.setScale(0);
  ctx.bus.emit(EVENTS.CUTSCENE_BEAT, { id, beat: 'start', t: 0 });
  run.beat = 'start';
  eatSkip(ctx);
  setBeat(ctx, id === 'A' ? 'windup' : 'crack');
}

export function update(ctx, raw) {
  if (!run || run.done) return;
  run.t += raw || 0;
  if (ctx.cutscene) ctx.cutscene.t = run.t;
  const skipped = eatSkip(ctx);
  if (skipped && run.t > 0.45) {
    finish(ctx);
    return;
  }
  if (run.which === 'A') {
    for (let i = 0; i < A_BEATS.length; i += 1) {
      if (run.t >= A_BEATS[i].at) setBeat(ctx, A_BEATS[i].name);
    }
    tickA(ctx, raw || 0);
    if (run.t >= A_END) finish(ctx);
  } else {
    for (let i = 0; i < B_BEATS.length; i += 1) {
      if (run.t >= B_BEATS[i].at) setBeat(ctx, B_BEATS[i].name);
    }
    tickB(ctx, raw || 0);
    if (run.t >= B_END) finish(ctx);
  }
}

function tickA(ctx, dt) {
  const player = ctx.player;
  const boss = ctx.boss;
  const t = run.t;
  if (run.beat === 'dive' || run.beat === 'parry' || run.beat === 'carry') {
    const targetY = player ? player.y - 18 : 168;
    const targetX = player ? player.x : ROOM_CX;
    const k = Math.min(1, dt * 3);
    run.astraX += (targetX - run.astraX) * k;
    run.astraY += (targetY - run.astraY) * k;
  }
  if (run.beat === 'parry' && boss) {
    const home = run.bossHomeX || boss.x;
    boss.x = home + 28;
    boss.pose = 'hurt';
  }
  if (run.beat === 'carry' && player) {
    player.y = Math.max(24, player.y - dt * 42);
    player.pose = 'down';
  }
  void t;
}

function tickB(ctx, dt) {
  for (let i = 0; i < run.shards.length; i += 1) {
    const s = run.shards[i];
    s.x += s.vx * dt;
    s.y += s.vy * dt;
    s.vy += 180 * dt;
    s.rot += dt * 6;
  }
  if (run.beat === 'hand' || run.beat === 'lift') {
    const drop = run.beat === 'hand'
      ? Math.min(1, (run.t - BEAT * 2) / 1.1)
      : 1;
    // Come in from above the plate and stop with the whole hand on screen.
    run.handY = -28 + drop * 200;
  }
  if (run.beat === 'lift' && ctx.boss) {
    ctx.boss.y = Math.max(10, ctx.boss.y - dt * 36);
    ctx.boss.pose = 'hurt';
  }
}

function finish(ctx) {
  if (!run || run.done) return;
  run.done = true;
  const which = run.which;
  ctx.audio?.stopSfx('sfx.heartbeat', { fade: 0.2 });
  ctx.bus.emit(EVENTS.CUTSCENE_BEAT, { id: which, beat: 'done', t: run.t });
  ctx.flags.inputLocked = false;
  ctx.time.setScale(ctx.debug?.timeScale || 1);
  run = null;
  if (typeof ctx.onCutsceneDone === 'function') ctx.onCutsceneDone(which);
}

function drawRift(g, t) {
  const k = Math.min(1, t);
  const cx = Math.round(WORLD_OX + ROOM_CX);
  g.save();
  applyScreen(g);
  g.fillStyle = `rgba(180,255,230,${0.22 * k})`;
  g.fillRect(0, 0, INTERNAL_W, Math.round(22 + k * 18));
  g.globalCompositeOperation = 'lighter';
  g.fillStyle = `rgba(255,252,230,${0.35 * k})`;
  g.fillRect(cx - 18, 0, 36, Math.round(INTERNAL_H * 0.42));
  g.strokeStyle = `rgba(255,255,255,${k})`;
  g.lineWidth = 4;
  g.beginPath();
  g.moveTo(cx, 0);
  g.lineTo(cx - 16, 36);
  g.lineTo(cx + 22, 70);
  g.lineTo(cx - 8, 110);
  g.lineTo(cx + 6, 150);
  g.stroke();
  g.strokeStyle = `rgba(216,177,90,${0.95 * k})`;
  g.lineWidth = 3;
  g.beginPath();
  g.moveTo(cx + 6, 0);
  g.lineTo(cx + 28, 48);
  g.lineTo(cx - 20, 88);
  g.lineTo(cx + 14, 130);
  g.stroke();
  g.strokeStyle = `rgba(159,216,210,${0.9 * k})`;
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(cx - 8, 8);
  g.lineTo(cx - 40, 54);
  g.lineTo(cx - 12, 96);
  g.stroke();
  g.restore();
}

function drawHexKnot(g, x, y, age) {
  const r = 16 + age * 52;
  g.save();
  g.globalCompositeOperation = 'lighter';
  g.strokeStyle = age < 0.18 ? '#ffffff' : '#d8b15a';
  g.lineWidth = 3;
  for (let ring = 0; ring < 4; ring += 1) {
    const rr = r - ring * 9;
    if (rr < 6) continue;
    g.beginPath();
    for (let i = 0; i <= 6; i += 1) {
      const a = (i / 6) * Math.PI * 2 - Math.PI / 2 + age * 0.4;
      const px = Math.round(x + Math.cos(a) * rr);
      const py = Math.round(y + Math.sin(a) * rr);
      if (i === 0) g.moveTo(px, py);
      else g.lineTo(px, py);
    }
    g.stroke();
  }
  g.strokeStyle = 'rgba(159,216,210,0.95)';
  g.lineWidth = 2;
  g.beginPath();
  g.arc(Math.round(x), Math.round(y), Math.round(r * 0.58), 0, Math.PI * 2);
  g.stroke();
  g.restore();
}

function drawRibbon(g, x, y, t) {
  const top = 4;
  const h = Math.max(8, y - top);
  const fade = Math.min(1, Math.max(0, 1 - t * 0.35));
  g.save();
  g.globalCompositeOperation = 'lighter';
  const w = 2.5 + Math.sin(t * 8) * 0.8;
  g.fillStyle = `rgba(255,252,230,${0.32 * fade})`;
  g.fillRect(Math.round(x - w), top, Math.round(w * 2), Math.round(h));
  g.fillStyle = `rgba(207,232,226,${0.42 * fade})`;
  g.fillRect(Math.round(x - 2), top, 4, Math.round(h));
  g.fillStyle = `rgba(255,255,255,${0.5 * fade})`;
  g.fillRect(Math.round(x - 1), top, 2, Math.round(h));
  for (let i = 0; i < 10; i += 1) {
    const py = Math.round(y - (t * 70 + i * 14) % h);
    g.fillStyle = `rgba(255,252,230,${0.55 * fade})`;
    g.fillRect(Math.round(x - 3 + (i % 4)), py, 2, 2);
  }
  g.restore();
}

function drawSword(g, boss, raised) {
  if (!boss) return;
  const x = Math.round(boss.x);
  const y = Math.round(boss.y - 20);
  const lift = raised ? 48 : 16;
  g.save();
  g.globalCompositeOperation = 'lighter';
  g.strokeStyle = 'rgba(255,252,230,0.55)';
  g.lineWidth = 8;
  g.beginPath();
  g.moveTo(x + 8, y);
  g.lineTo(x - 6, y - lift - 52);
  g.stroke();
  g.strokeStyle = '#f4f1ea';
  g.lineWidth = 3;
  g.beginPath();
  g.moveTo(x + 8, y);
  g.lineTo(x - 6, y - lift - 52);
  g.stroke();
  g.strokeStyle = '#d8b15a';
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(x + 12, y);
  g.lineTo(x - 1, y - lift - 44);
  g.stroke();
  g.restore();
}

function drawGlass(g) {
  g.save();
  applyScreen(g);
  g.strokeStyle = 'rgba(244,241,234,0.95)';
  g.lineWidth = 2;
  for (let i = 0; i < run.cracks.length; i += 1) {
    const pts = run.cracks[i];
    g.beginPath();
    g.moveTo(Math.round(pts[0].x), Math.round(pts[0].y));
    for (let k = 1; k < pts.length; k += 1) g.lineTo(Math.round(pts[k].x), Math.round(pts[k].y));
    g.stroke();
  }
  g.fillStyle = 'rgba(220,230,240,0.85)';
  for (let i = 0; i < run.shards.length; i += 1) {
    const s = run.shards[i];
    g.save();
    g.translate(Math.round(s.x), Math.round(s.y));
    g.rotate(s.rot);
    g.fillRect(-s.s, -1, s.s * 2, 2);
    g.restore();
  }
  g.restore();
}

export function render(ctx, g) {
  if (!run) return;
  const t = run.t;
  const player = ctx.player;
  const boss = ctx.boss;
  g.imageSmoothingEnabled = false;

  if (run.which === 'A') {
    fillScreen(g, 'rgba(8, 6, 14, 0.42)');

    if (t >= 0) drawSword(g, boss, true);
    if (t >= BEAT) drawRift(g, Math.min(1, (t - BEAT) / 0.45));
    if (t >= BEAT * 2) {
      const diveT = Math.min(1, (t - BEAT * 2) / 0.7);
      const landY = player ? player.y - 16 : 168;
      const ax = Math.round(run.astraX || (player ? player.x : ROOM_CX));
      const ay = run.beat === 'dive'
        ? Math.round(ASTRA_ENTER_Y + diveT * (landY - ASTRA_ENTER_Y))
        : Math.round(run.astraY);
      // Mature white-dragon sheet (128). Feet anchor; scale 1 stays inside the plate.
      drawSprite(g, 'px.astra.mature', ax, ay, { scale: 1, frame: 0 });
    }
    if (t >= BEAT * 3) {
      const age = t - BEAT * 3;
      const hx = player ? (player.x + (boss ? boss.x : player.x)) / 2 : ROOM_CX;
      const hy = player ? player.y - 12 : 160;
      drawHexKnot(g, hx, hy, age);
      if (age < 0.22) fillScreen(g, `rgba(255,255,255,${0.72 - age * 2})`);
    }
    if (t >= BEAT * 4 && player) {
      const carryAge = t - BEAT * 4;
      drawRibbon(g, player.x, player.y, carryAge);
      fillScreen(g, `rgba(255,252,230,${0.07 * Math.min(1, carryAge * 1.2)})`);
      const ax = Math.round(run.astraX || player.x);
      const ay = Math.round(run.astraY || player.y - 16);
      drawSprite(g, 'px.astra.mature', ax, ay, { scale: 1, frame: 0 });
    }
  } else {
    const dark = run.beat === 'crack' ? 0.22 : Math.min(0.82, 0.28 + (t - BEAT) * 0.28);
    fillScreen(g, `rgba(6, 2, 14, ${dark})`);

    withScreen(g, () => {
      g.strokeStyle = '#d8b15a';
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(Math.round(INTERNAL_W * 0.28), 10);
      g.lineTo(Math.round(INTERNAL_W * 0.28 + 4), 16);
      g.lineTo(Math.round(INTERNAL_W * 0.32), 8);
      g.stroke();
      g.fillStyle = '#c23b3b';
      g.fillRect(Math.round(INTERNAL_W * 0.26), 6, 3, 8);
    });

    drawGlass(g);

    if (t >= BEAT * 2) {
      const hx = boss ? boss.x : ROOM_CX;
      const hy = run.handY == null ? 40 : run.handY;
      // 128 × 1.25 ≈ 160px: large, and the settled Y keeps the hand on the plate.
      drawSprite(g, 'px.fable.hand', hx, hy, { scale: 1.25, frame: 0 });
    }
    if (t >= BEAT * 3 && boss) {
      g.save();
      g.globalCompositeOperation = 'lighter';
      g.strokeStyle = 'rgba(180,120,255,0.7)';
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(Math.round(boss.x), 0);
      g.lineTo(Math.round(boss.x), Math.round(boss.y));
      g.stroke();
      g.restore();
    }
  }
  applyWorld(g);
}

export function active() {
  return run;
}

export function init() {}
export function reset() {
  run = null;
}
