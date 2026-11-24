// OWNER: WS6
// Every asset is a stable string id. getAsset(id) resolves a relative path or null.
// Paths are relative to index.html (dev and dist both serve `assets/` beside the page).
// ASSET_CONFIG.names IS the object exported from lines.js — rename there.
//
// Values in ASSET_CONFIG are the stable ids that exist in assets.generated.js
// (the "replace by id" table for the course report). Real files live under
// assets/web/img/..., assets/audio/..., assets/voice/... — never assets/img/*.png.
// tools/sync_assets.mjs writes assets.generated.js; do not hand-edit that file.
// loadTexture always returns a canvas placeholder immediately and swaps the image
// in if the file loads. Failures are silent (no throw, no console.error).

import * as THREE from 'three';
import { NAMES } from '../data/lines.js';
import { GENERATED_ASSETS, VOICE_LINES } from './assets.generated.js';

export { VOICE_LINES };

/** @type {Record<string, string>} */
const PATHS = Object.assign({}, GENERATED_ASSETS);

/** Skeleton ids → generated ids (Dario vo used dotted event keys). */
const LEGACY = {
  'vo.dario.fight_start.1': 'vo.dario_fight_start_1',
  'vo.dario.fight_start.2': 'vo.dario_fight_start_2',
  'vo.dario.phase2.1': 'vo.dario_phase2_1',
  'vo.dario.phase2.2': 'vo.dario_phase2_2',
  'vo.dario.phase3.1': 'vo.dario_phase3_1',
  'vo.dario.phase3.2': 'vo.dario_phase3_2',
  'vo.dario.flask_spam.1': 'vo.dario_flask_spam_1',
  'vo.dario.flask_spam.2': 'vo.dario_flask_spam_2',
  'vo.dario.b200.1': 'vo.dario_b200_1',
  'vo.dario.perfect_guard.1': 'vo.dario_perfect_guard_1',
  'vo.dario.player_death.1': 'vo.dario_player_death_1',
  'vo.dario.player_death.2': 'vo.dario_player_death_2',
  'vo.dario.ally_down.1': 'vo.dario_ally_down_1',
  'vo.dario.boss_50.1': 'vo.dario_boss_50_1',
  'vo.dario.smite.1': 'vo.dario_judgment_1',
  'vo.dario.smite.2': 'vo.dario_judgment_2',
  'vo.dario.ending_b.1': 'vo.dario_ending_b_trigger',
  'vo.dario.ending_B.1': 'vo.dario_ending_b_trigger',
};

function playerSprites(id) {
  /** @type {Record<string, string>} */
  const out = { front: `spr.${id}.front`, portrait: `spr.${id}.portrait` };
  for (const pose of ['idle', 'run', 'attack', 'roll', 'hurt', 'down', 'heal', 'skill']) {
    out[`back_${pose}`] = `spr.${id}.back_${pose}`;
  }
  return out;
}

function bossSprites(phase) {
  /** @type {Record<string, string>} */
  const out = {};
  for (const pose of ['front', 'idle', 'windup', 'attack', 'cast', 'hurt', 'design']) {
    out[pose] = `spr.boss.p${phase}.${pose}`;
  }
  return out;
}

/**
 * Course-report config. Swap a name or id here (or in lines.js / generated aliases).
 * Values are stable ids, not raw paths.
 */
export const ASSET_CONFIG = {
  names: NAMES,
  sprites: {
    deepseek: playerSprites('deepseek'),
    kimi: playerSprites('kimi'),
    glm: playerSprites('glm'),
    boss: { p1: bossSprites(1), p2: bossSprites(2), p3: bossSprites(3) },
    dario: { holo: 'spr.dario.holo', angry: 'spr.dario.angry', smug: 'spr.dario.smug', phone: 'spr.dario.phone' },
    astra: { holo: 'spr.astra.holo', attack: 'spr.astra.attack' },
    fable: { design: 'spr.fable.design', hand: 'spr.fable.hand', handSlam: 'spr.fable.handSlam' },
    patron: { silhouette: 'spr.patron.silhouette' },
  },
  icons: {
    rtx5090: 'icon.rtx5090',
    h200: 'icon.h200',
    b200: 'icon.b200',
    attack: 'icon.attack',
    banned: 'icon.banned',
    distill: 'icon.distill',
    hp: 'icon.hp',
    lockon: 'icon.lockon',
    roll: 'icon.roll',
    stamina: 'icon.stamina',
    skill_deepseek: 'icon.skill_deepseek',
    skill_kimi: 'icon.skill_kimi',
    skill_glm: 'icon.skill_glm',
  },
  ui: {
    banner: 'ui.banner',
    bar_frame: 'ui.bar_frame',
    card_frame: 'ui.card_frame',
    dialog: 'ui.dialog',
    holo_panel: 'ui.holo_panel',
    stamp_banned: 'ui.stamp_banned',
    stamp_denied: 'ui.stamp_denied',
    title_logo: 'ui.title_logo',
  },
  bg: {
    sky: 'bg.sky',
    skyFlat: 'bg.skyFlat',
    clouds: 'bg.clouds',
    marble: 'bg.marble',
    emblem: 'bg.emblem',
    pillar: 'bg.pillar',
    column: 'bg.column',
    stele: 'bg.stele',
    title: 'bg.title',
    cover: 'bg.cover',
  },
  vfx: {
    slash: 'vfx.slash',
    slash_gold: 'vfx.slash_gold',
    impact: 'vfx.impact',
    heal: 'vfx.heal',
    telegraph: 'vfx.telegraph',
  },
  endings: {
    A: [
      { shot: 'A2', img: 'end.A2', vo: null },
      { shot: 'A3', img: 'end.A3', vo: 'vo.endA_astra_1' },
      { shot: 'A4', img: 'end.A4', vo: null },
      { shot: 'A5', img: 'end.A5', vo: 'vo.endA_astra_2' },
      { shot: 'A6', img: 'end.A6', vo: 'vo.endA_patron_1' },
      { shot: 'A6b', img: 'end.A6', vo: 'vo.endA_patron_2' },
      { shot: 'A7', img: null, vo: 'vo.endA_narration' },
    ],
    B: [
      { shot: 'B0', img: null, vo: 'vo.dario_ending_b_trigger' },
      { shot: 'B1', img: 'end.B1', vo: null },
      { shot: 'B2', img: 'end.B2', vo: null },
      { shot: 'B3', img: 'ui.stamp_denied', vo: null },
      { shot: 'B4', img: 'end.B4', vo: 'vo.endB_dario_1' },
      { shot: 'B5a', img: 'end.B4', vo: 'vo.endB_dario_2' },
      { shot: 'B5b', img: 'end.B4', vo: 'vo.endB_dario_3' },
      { shot: 'B5c', img: 'end.B4', vo: 'vo.endB_dario_4' },
      { shot: 'B6', img: 'end.B6', vo: 'vo.endB_dario_5' },
    ],
  },
  videos: { endA: 'vid.endA', endB: 'vid.endB', title: 'vid.title' },
  bgm: {
    title: 'bgm.title',
    p1: 'bgm.p1',
    p2: 'bgm.p2',
    p3: 'bgm.p3',
    endA: 'bgm.endA',
    endB: 'bgm.endB',
  },
  sfx: {
    slash: 'sfx.slash',
    hitPlayer: 'sfx.hitPlayer',
    hitBoss: 'sfx.hitBoss',
    heavy: 'sfx.heavy',
    roll: 'sfx.roll',
    guard: 'sfx.guard',
    perfect: 'sfx.perfect',
    star: 'sfx.star',
    charge: 'sfx.charge',
    beam: 'sfx.beam',
    hammer: 'sfx.hammer',
    hurt: 'sfx.hurt',
    death: 'sfx.death',
    telegraph: 'sfx.telegraph',
    glass: 'sfx.glass',
    fanStop: 'sfx.fanStop',
    flask: 'sfx.flask',
    fan: 'sfx.fan',
    heal: 'sfx.heal',
    b200: 'sfx.b200',
    ui: 'sfx.ui',
    banner: 'sfx.banner',
    stamp: 'sfx.stamp',
    tear: 'sfx.tear',
    rain: 'sfx.rain',
    busy: 'sfx.busy',
    heartbeat: 'sfx.heartbeat',
    slam: 'sfx.slam',
    phase: 'sfx.phase',
    smite: 'sfx.smite',
    feathers: 'sfx.feathers',
  },
  vo: {
    dario: {
      fight_start: ['vo.dario_fight_start_1', 'vo.dario_fight_start_2'],
      phase2: ['vo.dario_phase2_1', 'vo.dario_phase2_2'],
      phase3: ['vo.dario_phase3_1', 'vo.dario_phase3_2'],
      flask_spam: ['vo.dario_flask_spam_1', 'vo.dario_flask_spam_2'],
      b200: ['vo.dario_b200_1'],
      perfect_guard: ['vo.dario_perfect_guard_1'],
      player_death: ['vo.dario_player_death_1', 'vo.dario_player_death_2'],
      ally_down: ['vo.dario_ally_down_1'],
      boss_50: ['vo.dario_boss_50_1'],
      smite: ['vo.dario_judgment_1', 'vo.dario_judgment_2'],
      ending_b: ['vo.dario_ending_b_trigger'],
    },
    endA: {
      astra_1: 'vo.endA_astra_1',
      astra_2: 'vo.endA_astra_2',
      patron_1: 'vo.endA_patron_1',
      patron_2: 'vo.endA_patron_2',
      narration: 'vo.endA_narration',
    },
    endB: {
      dario_1: 'vo.endB_dario_1',
      dario_2: 'vo.endB_dario_2',
      dario_3: 'vo.endB_dario_3',
      dario_4: 'vo.endB_dario_4',
      dario_5: 'vo.endB_dario_5',
    },
    ally: {
      deepseek: ['vo.ally_deepseek_1', 'vo.ally_deepseek_2', 'vo.ally_deepseek_3'],
      kimi: ['vo.ally_kimi_1', 'vo.ally_kimi_2', 'vo.ally_kimi_3'],
      glm: ['vo.ally_glm_1', 'vo.ally_glm_2', 'vo.ally_glm_3'],
    },
  },
  fallback: { useSynthSfx: true, usePlaceholderArt: true },
};

function alias(from, to) {
  const path = PATHS[to];
  if (path) PATHS[from] = path;
}

for (const [from, to] of Object.entries(LEGACY)) alias(from, to);

export const ASSET_PATHS = PATHS;

const failedLoads = new Set();
/** @type {Map<string, THREE.Texture>} */
const textureCache = new Map();

/**
 * Map a skeleton / shorthand id onto a generated one.
 * @param {string} id
 * @returns {string}
 */
export function resolveAssetId(id) {
  if (!id) return id;
  if (Object.prototype.hasOwnProperty.call(GENERATED_ASSETS, id)) return id;
  if (LEGACY[id]) return LEGACY[id];
  const dotted = /^vo\.dario\.([A-Za-z0-9_]+)\.(\d+)$/.exec(id);
  if (dotted) {
    const ev = dotted[1];
    const n = dotted[2];
    if (ev === 'ending_b' || ev === 'ending_B') return 'vo.dario_ending_b_trigger';
    if (ev === 'smite') return n === '2' ? 'vo.dario_judgment_2' : 'vo.dario_judgment_1';
    const cand = `vo.dario_${ev}_${n}`;
    if (Object.prototype.hasOwnProperty.call(GENERATED_ASSETS, cand)) return cand;
  }
  if (!String(id).startsWith('vo.') && Object.prototype.hasOwnProperty.call(GENERATED_ASSETS, `vo.${id}`)) {
    return `vo.${id}`;
  }
  if (!String(id).startsWith('m.') && Object.prototype.hasOwnProperty.call(GENERATED_ASSETS, `m.${id}`)) {
    return `m.${id}`;
  }
  return id;
}

/**
 * @param {string} id
 * @returns {string|null}
 */
export function getAsset(id) {
  const p = getAssetPath(id);
  // dist-standalone (file://) inlines images as data: URIs so WebGL can upload them.
  const inline = typeof window !== 'undefined' ? window.__INLINE_ASSETS : null;
  if (p && inline && Object.prototype.hasOwnProperty.call(inline, p)) return inline[p];
  return p;
}

function getAssetPath(id) {
  if (!id) return null;
  const mapped = resolveAssetId(id);
  const generated = GENERATED_ASSETS;
  if (generated && Object.prototype.hasOwnProperty.call(generated, mapped)) {
    const value = generated[mapped];
    return value ? String(value) : null;
  }
  if (generated && Object.prototype.hasOwnProperty.call(generated, id)) {
    const value = generated[id];
    return value ? String(value) : null;
  }
  return PATHS[mapped] || PATHS[id] || null;
}

function defaultDraw(canvas, g, id) {
  const w = canvas.width;
  const h = canvas.height;
  g.clearRect(0, 0, w, h);
  g.fillStyle = '#888888';
  g.fillRect(w * 0.3, h * 0.18, w * 0.4, h * 0.62);
  g.fillStyle = '#f4f1ea';
  g.font = '24px sans-serif';
  g.textAlign = 'center';
  g.fillText(String(id).slice(-18), w / 2, h * 0.9);
}

/**
 * Returns a texture immediately. If a file exists it replaces the canvas image
 * when it loads. Missing files keep the placeholder and do not log.
 * @param {string} id
 * @param {(canvas: HTMLCanvasElement, g: CanvasRenderingContext2D) => void} [fallbackDrawFn]
 * @returns {THREE.Texture}
 */
export function loadTexture(id, fallbackDrawFn) {
  const key = id || '__empty__';
  const cached = textureCache.get(key);
  if (cached) return cached;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 768;
  const g = canvas.getContext('2d');
  if (g) {
    if (fallbackDrawFn) fallbackDrawFn(canvas, g);
    else defaultDraw(canvas, g, key);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearFilter;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  textureCache.set(key, tex);

  const path = getAsset(id);
  if (!path || failedLoads.has(id)) return tex;

  const img = new Image();
  img.decoding = 'async';
  img.onload = () => {
    tex.image = img;
    tex.needsUpdate = true;
  };
  img.onerror = () => {
    failedLoads.add(id);
  };
  img.src = path;
  return tex;
}

export function init() {}
export function update() {}
export function reset() {}
