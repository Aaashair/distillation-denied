// OWNER: W1
// Sky-cathedral / datacenter boss room + skippable Gate intro.
// AI plates v2_room_p1/p2/p3 (480×320) draw at (80, 20) in the 640×360 buffer.
// Gameplay clamp still uses balance.js ROOM so W1/W2 spawn points keep working.
// Walkable floor of the plate (screen): FLOOR_SCREEN in world.js.

import { loadImage } from '../config/assets.js';
import { bi } from '../data/lines.js';
import { getLanguage } from '../core/i18n.js';
import { drawTextOutlined, drawCjk, drawBilingual } from './font.js';
import { draw as drawProcedural } from './procedural.js';
import {
  ROOM, INTRO_ROOM, INTRO_DOOR, activeInner, clampTo, inDoor, PALETTE,
} from '../config/balance.js';
import {
  INTERNAL_W, INTERNAL_H, WORLD_OX, WORLD_OY, ROOM_BG, FLOOR_SCREEN, FLOOR_WORLD,
  HUD_LEFT, HUD_RIGHT, applyWorld, applyScreen,
} from './world.js';

const PHASE_BG = { 1: 'v2_room_p1', 2: 'v2_room_p2', 3: 'v2_room_p3' };

/** Screen/buffer px — top door center, arena entrance x = room center; y in 20..65 band. */
const DARIO_HOLO_SIZE = 40;
export const DARIO_HOLO = Object.freeze({
  cx: ROOM_BG.x + (ROOM_BG.w >> 1),
  top: ROOM_BG.y + 24,
  size: DARIO_HOLO_SIZE,
  x: ROOM_BG.x + (ROOM_BG.w >> 1) - (DARIO_HOLO_SIZE >> 1),
  y: ROOM_BG.y + 24,
});

const ARENA_SETTING = Object.freeze({ zh: '548 Market Street', en: '548 Market Street' });

const motes = [];
for (let i = 0; i < 28; i += 1) {
  motes.push({
    x: 90 + Math.random() * 460,
    y: 30 + Math.random() * 300,
    s: 1 + (i % 2),
    v: 4 + Math.random() * 10,
    p: Math.random() * Math.PI * 2,
  });
}

function ready(img) {
  return !!(img && img.complete && img.naturalWidth > 0 && !(img.dataset && img.dataset.dead === '1'));
}

function fillGutter(g) {
  g.fillStyle = '#0b0a12';
  g.fillRect(0, 0, INTERNAL_W, INTERNAL_H);
  // HUD columns as dark stone
  g.fillStyle = '#14101c';
  g.fillRect(HUD_LEFT.x, HUD_LEFT.y, HUD_LEFT.w, HUD_LEFT.h);
  g.fillRect(HUD_RIGHT.x, HUD_RIGHT.y, HUD_RIGHT.w, HUD_RIGHT.h);
  g.fillStyle = '#d8b15a';
  g.fillRect(78, 0, 2, INTERNAL_H);
  g.fillRect(560, 0, 2, INTERNAL_H);
}

function skyBehind(g, t) {
  g.fillStyle = '#6aa8d8';
  g.fillRect(ROOM_BG.x, 0, ROOM_BG.w, ROOM_BG.y + 8);
  g.fillStyle = '#9cc9f0';
  g.fillRect(ROOM_BG.x, 0, ROOM_BG.w, 14);
  // drifting cloud bands
  g.fillStyle = 'rgba(244,241,234,0.35)';
  const c = Math.round((t * 8) % 120);
  g.fillRect(ROOM_BG.x + 20 + c, 4, 40, 6);
  g.fillRect(ROOM_BG.x + 180 + (120 - c), 6, 50, 5);
  g.fillRect(ROOM_BG.x + 320, 3, 36, 5);
}

function proceduralCathedral(g, t) {
  // floor tiles in WORLD space — caller has applyWorld
  const tile = ROOM.tile;
  for (let y = ROOM.y; y < ROOM.y + ROOM.h; y += tile) {
    for (let x = ROOM.x; x < ROOM.x + ROOM.w; x += tile) {
      const alt = (((x / tile) | 0) + ((y / tile) | 0)) % 2 === 0;
      g.fillStyle = alt ? '#f4f1ea' : '#e7e0d4';
      g.fillRect(x, y, tile, tile);
      g.fillStyle = 'rgba(216,177,90,0.28)';
      g.fillRect(x, y, tile, 1);
      g.fillRect(x, y, 1, tile);
    }
  }
  const cx = ROOM.x + (ROOM.w >> 1);
  const cy = ROOM.y + (ROOM.h >> 1);
  g.strokeStyle = PALETTE.gold;
  g.lineWidth = 2;
  g.beginPath(); g.arc(cx, cy, 28, 0, Math.PI * 2); g.stroke();
  g.beginPath(); g.arc(cx, cy, 10, 0, Math.PI * 2); g.stroke();
  g.fillStyle = PALETTE.gold;
  g.fillRect(cx - 1, cy - 18, 2, 36);
  g.fillRect(cx - 18, cy - 1, 36, 2);
  // circuit ticks
  for (let i = 0; i < 4; i += 1) {
    const a = i * Math.PI * 0.5;
    g.fillRect(Math.round(cx + Math.cos(a) * 36) - 1, Math.round(cy + Math.sin(a) * 36) - 1, 8, 2);
  }
  const { x, y, w, h, wall } = ROOM;
  g.fillStyle = '#1b1530';
  g.fillRect(x, y, w, wall);
  g.fillRect(x, y + h - wall, w, wall);
  g.fillRect(x, y, wall, h);
  g.fillRect(x + w - wall, y, wall, h);
  g.fillStyle = '#d8b15a';
  g.fillRect(x + 2, y + 2, w - 4, 2);
  g.fillRect(x + 2, y + h - 4, w - 4, 2);
  // windows + clouds
  g.fillStyle = PALETTE.sky;
  for (let i = 0; i < 4; i += 1) {
    const wx = x + 48 + i * 96;
    g.fillStyle = PALETTE.sky;
    g.fillRect(wx, y + 3, 28, 10);
    g.fillStyle = 'rgba(255,255,255,0.4)';
    g.fillRect(wx + 2 + Math.round((t * 6 + i * 10) % 8), y + 4, 10, 3);
  }
  // decorative pillars (no collision)
  const spots = [[x + 48, y + 48], [x + w - 64, y + 48]];
  for (let i = 0; i < spots.length; i += 1) {
    g.fillStyle = '#1b1530';
    g.fillRect(spots[i][0] - 1, spots[i][1] - 1, 14, 30);
    g.fillStyle = '#f4f1ea';
    g.fillRect(spots[i][0], spots[i][1], 12, 28);
    g.fillStyle = PALETTE.gold;
    g.fillRect(spots[i][0], spots[i][1], 12, 3);
  }
}

function lightShafts(g, t) {
  g.save();
  g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 4; i += 1) {
    const x = ROOM_BG.x + 70 + i * 90 + Math.sin(t * 0.4 + i) * 6;
    g.fillStyle = `rgba(244,232,180,${0.045 + Math.sin(t * 0.8 + i) * 0.02})`;
    g.beginPath();
    g.moveTo(x, ROOM_BG.y + 8);
    g.lineTo(x + 18, ROOM_BG.y + 8);
    g.lineTo(x + 36, ROOM_BG.y + 250);
    g.lineTo(x - 10, ROOM_BG.y + 250);
    g.closePath();
    g.fill();
  }
  g.fillStyle = 'rgba(244,241,234,0.55)';
  for (let i = 0; i < motes.length; i += 1) {
    const m = motes[i];
    const y = (m.y - (t * m.v) + Math.sin(t + m.p) * 8) % 300;
    g.fillRect(Math.round(m.x + Math.sin(t * 0.6 + m.p) * 10), Math.round(ROOM_BG.y + 10 + y), m.s, m.s);
  }
  g.restore();
}

function drawBossRoom(g, ctx, t) {
  applyScreen(g);
  fillGutter(g);
  skyBehind(g, t);
  const phase = (ctx.boss && ctx.boss.phase) || 1;
  const img = loadImage(PHASE_BG[phase] || PHASE_BG[1]);
  if (ready(img)) {
    g.imageSmoothingEnabled = false;
    g.drawImage(img, ROOM_BG.x, ROOM_BG.y);
  } else {
    g.fillStyle = '#9cc9f0';
    g.fillRect(ROOM_BG.x, ROOM_BG.y, ROOM_BG.w, ROOM_BG.h);
    applyWorld(g);
    proceduralCathedral(g, t);
    applyScreen(g);
  }
  lightShafts(g, t);
}

function drawIntro(g, ctx, t) {
  applyScreen(g);
  fillGutter(g);
  g.fillStyle = '#12101a';
  g.fillRect(ROOM_BG.x, ROOM_BG.y, ROOM_BG.w, ROOM_BG.h);
  applyWorld(g);
  g.imageSmoothingEnabled = false;
  const room = INTRO_ROOM;
  const tile = room.tile;
  const gold = loadImage('v2_tile_floor_gold_32');
  const useTile = ready(gold);
  for (let y = room.y; y < room.y + room.h; y += tile) {
    for (let x = room.x; x < room.x + room.w; x += tile) {
      if (useTile) {
        g.imageSmoothingEnabled = false;
        g.drawImage(gold, 0, 0, 32, 32, x, y, tile, tile);
      } else {
        const alt = (((x / tile) | 0) + ((y / tile) | 0)) % 2 === 0;
        g.fillStyle = alt ? '#e7e0d4' : '#d4cbb8';
        g.fillRect(x, y, tile, tile);
      }
    }
  }
  g.fillStyle = '#1b1530';
  g.fillRect(room.x, room.y, room.w, room.wall);
  g.fillRect(room.x, room.y + room.h - room.wall, room.w, room.wall);
  g.fillRect(room.x, room.y, room.wall, room.h);
  g.fillRect(room.x + room.w - room.wall, room.y, room.wall, room.h);
  g.fillStyle = PALETTE.gold;
  g.fillRect(room.x + 2, room.y + 2, room.w - 4, 2);

  const door = loadImage('v2_door_open');
  if (ready(door)) {
    g.imageSmoothingEnabled = false;
    g.drawImage(door, INTRO_DOOR.x - 16, INTRO_DOOR.y - 20);
  } else {
    g.fillStyle = PALETTE.sky;
    g.fillRect(INTRO_DOOR.x, INTRO_DOOR.y, INTRO_DOOR.w, INTRO_DOOR.h);
    g.fillStyle = PALETTE.gold;
    g.fillRect(INTRO_DOOR.x, INTRO_DOOR.y, 2, INTRO_DOOR.h);
    g.fillRect(INTRO_DOOR.x + INTRO_DOOR.w - 2, INTRO_DOOR.y, 2, INTRO_DOOR.h);
  }
  drawSelected(g, { zh: '进入', en: 'ENTER' }, INTRO_DOOR.x - 4, INTRO_DOOR.y + 22, PALETTE.gold);

  if (ctx.stele) {
    const label = getLanguage() === 'en' ? 'TRIAL STELE' : '试炼石碑';
    drawSelected(g, { zh: label, en: label }, ctx.stele.x - 20, ctx.stele.y - 38, PALETTE.gold);
    if (ctx.stele.quip > 0) {
      drawSelected(g, { zh: '我无法协助', en: 'I CANT HELP' }, ctx.stele.x - 22, ctx.stele.y - 50, '#c23b3b');
    }
  }
  void t;
}

function drawSelected(g, pair, x, y, color) {
  const zh = pair.zh || '';
  const en = pair.en || '';
  const text = bi(pair);
  if (text === zh && zh) {
    drawCjk(g, zh, x, y, color, 8);
    return;
  }
  if (text === en && en) {
    drawTextOutlined(g, en, x, y, color, 1, false);
    return;
  }
  // Pre-merge bi() still joins both; stack until W1 lands.
  drawBilingual(g, en, zh, x, y, color, 1);
}

function fightHoloVisible(ctx) {
  const st = ctx.state && ctx.state.current;
  return st === 'fight' || st === 'paused';
}

function drawHolo(g, ctx, t) {
  // Portrait stays up for the whole fight (all phases). Taunt text is W4 DOM.
  if (!fightHoloVisible(ctx)) return;
  applyScreen(g);
  const hx = DARIO_HOLO.x;
  const hy = DARIO_HOLO.y;
  const size = DARIO_HOLO.size;
  g.fillStyle = 'rgba(10, 36, 42, 0.72)';
  g.fillRect(hx - 2, hy - 2, size + 4, size + 6);
  g.strokeStyle = 'rgba(158,230,220,0.55)';
  g.lineWidth = 1;
  g.strokeRect(hx - 2, hy - 2, size + 4, size + 6);
  const talking = ctx.holo && !(ctx.time && ctx.time.unscaled > ctx.holo.until);
  const pulse = 0.72 + Math.sin(t * 3.2) * 0.08;
  const flick = ((t * 6) | 0) % 17 === 0 ? 0.45 : (talking ? 0.95 : pulse);
  const sheet = loadImage('v2_dario_holo_flicker_sheet');
  const still = loadImage('v2_dario_holo');
  g.save();
  g.globalAlpha = flick;
  g.imageSmoothingEnabled = false;
  if (sheet && sheet.complete && sheet.naturalWidth > 0 && !(sheet.dataset && sheet.dataset.dead === '1')) {
    const fw = 96;
    const frame = Math.floor(t * 4) % 4;
    g.drawImage(sheet, frame * fw, 0, fw, fw, hx, hy, size, size);
  } else if (still && still.complete && still.naturalWidth > 0 && !(still.dataset && still.dataset.dead === '1')) {
    g.drawImage(still, hx, hy, size, size);
  } else {
    applyWorld(g);
    drawProcedural(g, 'px.dario', hx - WORLD_OX + size / 2, hy - WORLD_OY + size, {
      alpha: 1,
      frame: Math.floor(t * 4) % 4,
    });
    applyScreen(g);
  }
  g.restore();
  g.fillStyle = `rgba(158,230,220,${talking ? 0.55 : 0.28})`;
  g.fillRect(hx, hy + (((t * 14) | 0) % (size - 2)), size, 1);
}

export function init(ctx) {
  ctx.world.clamp = (actor) => {
    if (!actor) return;
    clampTo(actor, activeInner(ctx.state.current));
  };
  ctx.world.setHolo = (zh, en) => {
    if (!zh || en === 'HOLO') {
      ctx.holo = null;
      return;
    }
    ctx.holo = { zh, en, until: (ctx.time?.unscaled || 0) + 3.6 };
  };
  ctx.world.room = {
    ROOM,
    INTRO_ROOM,
    INTRO_DOOR,
    FLOOR_SCREEN,
    FLOOR_WORLD,
    ROOM_BG,
    WORLD_OX,
    WORLD_OY,
    DARIO_HOLO,
    COLLISION: {
      boss: FLOOR_WORLD,
      intro: {
        x: INTRO_ROOM.x + INTRO_ROOM.wall,
        y: INTRO_ROOM.y + INTRO_ROOM.wall,
        w: INTRO_ROOM.w - INTRO_ROOM.wall * 2,
        h: INTRO_ROOM.h - INTRO_ROOM.wall * 2,
      },
    },
  };
  ctx.stele = null;
}

export function spawnStele(ctx) {
  const stele = {
    id: 'stele',
    team: 'neutral',
    x: INTRO_ROOM.x + (INTRO_ROOM.w >> 1) - 8,
    y: INTRO_ROOM.y + (INTRO_ROOM.h >> 1) + 12,
    vx: 0,
    vy: 0,
    r: 10,
    hp: 999,
    maxHp: 999,
    alive: true,
    invuln: 0,
    facing: 's',
    sprite: 'px.stele',
    quip: 0,
    flash: 0,
  };
  stele.onHit = () => {
    stele.hp = stele.maxHp;
    stele.alive = true;
    stele.quip = 1.5;
  };
  ctx.stele = stele;
  return stele;
}

export function update(ctx, dt) {
  if (ctx.stele && ctx.stele.quip > 0) ctx.stele.quip -= dt;
  if (ctx.state.current !== 'intro') return;
  const p = ctx.player;
  if (!p) return;
  if (ctx.input.pressed('enter') || inDoor(p)) {
    ctx.input.eat('enter');
    ctx.finishIntro?.();
  }
}

export function render(ctx, g) {
  const t = ctx.time ? ctx.time.elapsed : 0;
  if (ctx.state.current === 'intro') drawIntro(g, ctx, t);
  else drawBossRoom(g, ctx, t);
  drawHolo(g, ctx, t);
  applyWorld(g);
}

export function reset(ctx) {
  if (ctx) ctx.stele = null;
}

export {
  FLOOR_SCREEN, FLOOR_WORLD, ROOM_BG, WORLD_OX, WORLD_OY, INTERNAL_W, INTERNAL_H,
};
