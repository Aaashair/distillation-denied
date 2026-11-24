// OWNER: W5
// Every asset is a stable string id. getAsset(id) resolves a relative path or null.
// Paths are relative to index.html (dev and dist both serve `assets/` beside the page).
// ASSET_CONFIG.names IS the object exported from lines.js — rename there.
//
// APIs (ARCHITECTURE):
//   getAsset(id)  → relative path | data: URI | null. Never fetch(). Missing → null.
//   loadImage(id) → HTMLImageElement | null. Sets img.src only when a path exists
//                   (no 404 console noise). Failed loads are remembered.
//   getSprite(id) → { id, path, img, spec, family } for `px.<who>.<anim>`.
//                   spec is PIXEL_SPRITES[id] (frameW/H, fps, sheet grid, src).
//                   When the file is missing, img is null and render/sprites.js
//                   draws the procedural family (`px.deepseek`, `px.boss.p3`, …).
//
// Pixel sheets: `px.deepseek.walk` is described by PIXEL_SPRITES. v2 sheet meta
// from assets_v2.generated.js fills src + frame size when present.
// Portraits: `pt.<who>`. Theater panels: `end.A*` / `end.B*` (v2 overrides v1).
// Voices: v2_vo_* (prompt=zh, subtitle_en=en) plus v1 vo.* aliases.
//
// loadImage never calls fetch(). A missing path returns null (no network, no log).
// Tint/flash caches must use composite 'source-in' — never getImageData on file images.

import { NAMES } from '../data/lines.js';
import { GENERATED_ASSETS, VOICE_LINES as VOICE_LINES_RAW } from './assets.generated.js';
import { V2_ASSETS, V2_VOICE_LINES } from './assets_v2.generated.js';
import {
  V2_ALIAS_TABLES,
  V2_BGM_ALT,
  V2_PIXEL,
  V2_PORTRAITS,
  V2_STORY,
  V2_VOICE_ALIAS,
  V3_FILES,
  V3_FORCE_STORY,
  V4_FILES,
} from './assets_v2.js';

export { V2_VOICE_LINES };

const FORBIDDEN = [
  '你被救下了',
  '你们被救不是因为',
  'you were saved. not because you matter',
  'not because you matter',
];

function bannedText(s) {
  const t = String(s || '').toLowerCase();
  for (let i = 0; i < FORBIDDEN.length; i += 1) {
    if (t.includes(FORBIDDEN[i].toLowerCase())) return true;
  }
  return false;
}

/** v1 voice table with the removed A7 line stripped if it ever reappears. */
export const VOICE_LINES = (VOICE_LINES_RAW || []).filter(
  (row) => row && !bannedText(row.zh) && !bannedText(row.en),
);

/** @type {Record<string, string>} */
const PATHS = Object.assign({}, GENERATED_ASSETS);

function v2Src(id) {
  const value = V2_ASSETS && V2_ASSETS[id];
  if (!value) return null;
  if (typeof value === 'string') return value;
  return value.src || null;
}

for (const [key, value] of Object.entries(V2_ASSETS || {})) {
  const src = typeof value === 'string' ? value : (value && value.src);
  if (src) PATHS[key] = src;
}

for (const [key, src] of Object.entries(V3_FILES || {})) {
  if (src) PATHS[key] = src;
}

for (const [key, src] of Object.entries(V4_FILES || {})) {
  if (src) PATHS[key] = src;
}

function applyAlias(from, to) {
  const src = v2Src(to) || PATHS[to];
  if (src) PATHS[from] = src;
}

for (const table of V2_ALIAS_TABLES) {
  for (const [from, to] of Object.entries(table)) applyAlias(from, to);
}

for (const [from, to] of Object.entries(V3_FORCE_STORY || {})) applyAlias(from, to);

// chip_* beds only if the bgm8_* file did not land.
for (const [from, to] of Object.entries(V2_BGM_ALT)) {
  const primary = PATHS[from];
  if (!primary || !/bgm8_/.test(primary)) applyAlias(from, to);
}

/**
 * Pixel-sheet descriptors. `src` stays empty until assets_v2 fills PATHS.
 * frame size is the cel; anchor is the feet in cel pixels.
 * v2 sheets are grids (`cols`×`rows`); W3 may use `sheet.anims`.
 */
export const PIXEL_SPRITES = {
  'px.deepseek': { frameW: 48, frameH: 48, frames: 4, fps: 8, anchorX: 24, anchorY: 46 },
  'px.deepseek.walk': { frameW: 48, frameH: 48, frames: 4, fps: 8, anchorX: 24, anchorY: 46 },
  'px.kimi': { frameW: 48, frameH: 48, frames: 4, fps: 8, anchorX: 24, anchorY: 46 },
  'px.kimi.walk': { frameW: 48, frameH: 48, frames: 4, fps: 8, anchorX: 24, anchorY: 46 },
  'px.glm': { frameW: 48, frameH: 48, frames: 4, fps: 8, anchorX: 24, anchorY: 46 },
  'px.glm.walk': { frameW: 48, frameH: 48, frames: 4, fps: 8, anchorX: 24, anchorY: 46 },
  'px.boss.p1': { frameW: 96, frameH: 96, frames: 2, fps: 3, anchorX: 48, anchorY: 92 },
  'px.boss.p2': { frameW: 128, frameH: 128, frames: 2, fps: 3, anchorX: 64, anchorY: 124 },
  'px.boss.p3': { frameW: 192, frameH: 192, frames: 2, fps: 3, anchorX: 96, anchorY: 186 },
  'px.astra': { frameW: 80, frameH: 80, frames: 2, fps: 6, anchorX: 40, anchorY: 76 },
  'px.astra.mature': { frameW: 128, frameH: 128, frames: 1, fps: 1, anchorX: 64, anchorY: 124 },
  'px.fable.hand': { frameW: 128, frameH: 128, frames: 1, fps: 1, anchorX: 64, anchorY: 120 },
  'px.dario': { frameW: 96, frameH: 96, frames: 2, fps: 4, anchorX: 48, anchorY: 92 },
  'px.stele': { frameW: 24, frameH: 32, frames: 1, fps: 1, anchorX: 12, anchorY: 30 },
};

function fillPixelSpec(pxId, v2Id) {
  const meta = V2_ASSETS && V2_ASSETS[v2Id];
  if (!meta) {
    if (PATHS[pxId] && PIXEL_SPRITES[pxId] && !PIXEL_SPRITES[pxId].src) {
      PIXEL_SPRITES[pxId].src = PATHS[pxId];
    }
    return;
  }
  const sheet = meta.sheet || {};
  const size = Array.isArray(meta.size) ? meta.size : [];
  const fw = sheet.frameWidth || size[0] || 48;
  const fh = sheet.frameHeight || size[1] || 48;
  const spec = PIXEL_SPRITES[pxId] || (PIXEL_SPRITES[pxId] = {});
  spec.src = meta.src || PATHS[pxId];
  spec.frameW = fw;
  spec.frameH = fh;
  spec.frames = meta.frames || spec.frames || 1;
  spec.fps = meta.fps || spec.fps || 6;
  spec.cols = sheet.cols;
  spec.rows = sheet.rows;
  spec.sheet = sheet;
  spec.anchorX = fw / 2;
  spec.anchorY = fh;
  spec.v2 = v2Id;
}

for (const [pxId, v2Id] of Object.entries(V2_PIXEL)) fillPixelSpec(pxId, v2Id);

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
  const out = { front: `spr.${id}.front`, portrait: `pt.${id}`, pixel: `px.${id}` };
  for (const pose of ['idle', 'run', 'attack', 'roll', 'hurt', 'down', 'heal', 'skill']) {
    out[`back_${pose}`] = `spr.${id}.back_${pose}`;
  }
  return out;
}

function bossSprites(phase) {
  /** @type {Record<string, string>} */
  const out = { pixel: `px.boss.p${phase}` };
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
    dario: { holo: 'pt.dario.holo', angry: 'pt.dario.angry', smug: 'spr.dario.smug', phone: 'spr.dario.phone', pixel: 'pt.dario' },
    astra: { holo: 'pt.astra', attack: 'px.astra.mature', pixel: 'px.astra' },
    fable: { design: 'spr.fable.design', hand: 'px.fable.hand', handSlam: 'spr.fable.handSlam' },
    patron: { silhouette: 'pt.sam', pixel: 'pt.sam' },
  },
  portraits: { ...V2_PORTRAITS },
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
      { shot: 'A3', img: 'end.A3', vo: 'v2_vo_astra_arrive_1' },
      { shot: 'A4', img: 'end.A4', vo: 'v2_vo_astra_report_1' },
      { shot: 'A5', img: 'end.A5', vo: 'v2_vo_astra_report_2' },
      { shot: 'A6', img: 'end.A6', vo: 'v2_vo_sam_call_1' },
      { shot: 'A6b', img: 'end.A6', vo: 'v2_vo_sam_call_2' },
      { shot: 'A6c', img: 'ill.sam', vo: 'v2_vo_sam_call_3' },
    ],
    B: [
      { shot: 'B0', img: null, vo: 'v2_vo_dario_endB_trigger' },
      { shot: 'B3', img: 'ui.stamp_denied', vo: null },
      { shot: 'B4', img: 'end.B4', vo: 'v2_vo_dario_endB_call_1' },
      { shot: 'B5a', img: 'end.B.dario', vo: 'v2_vo_dario_endB_call_2' },
      { shot: 'B5b', img: 'end.B4', vo: 'v2_vo_dario_endB_call_3' },
      { shot: 'B6', img: 'end.B6', vo: 'v2_vo_dario_endB_call_4' },
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
      ending_a: ['v2_vo_dario_endA_1'],
    },
    endA: {
      astra_arrive_1: 'v2_vo_astra_arrive_1',
      astra_arrive_2: 'v2_vo_astra_arrive_2',
      astra_1: 'v2_vo_astra_report_1',
      astra_2: 'v2_vo_astra_report_2',
      patron_1: 'v2_vo_sam_call_2',
      patron_2: 'v2_vo_sam_call_3',
      sam_1: 'v2_vo_sam_call_1',
      sam_2: 'v2_vo_sam_call_2',
      sam_3: 'v2_vo_sam_call_3',
      sam_4: 'v2_vo_sam_call_4',
      sam_5: 'v2_vo_sam_call_5',
      sam_6: 'v2_vo_sam_call_6',
      sam_7: 'v2_vo_sam_call_7',
    },
    endB: {
      trigger: 'v2_vo_dario_endB_trigger',
      dario_1: 'v2_vo_dario_endB_call_1',
      dario_2: 'v2_vo_dario_endB_call_2',
      dario_3: 'v2_vo_dario_endB_call_3',
      dario_4: 'v2_vo_dario_endB_call_4',
      fable_1: 'v2_vo_fable_1',
      fable_2: 'v2_vo_fable_2',
      opus_taken: 'v2_vo_opus_taken',
    },
    ally: {
      deepseek: ['v2_vo_deepseek_bark', 'vo.ally_deepseek_1'],
      kimi: ['v2_vo_kimi_bark', 'vo.ally_kimi_1'],
      glm: ['v2_vo_glm_bark', 'vo.ally_glm_1'],
    },
    barks: {
      deepseek: ['v2_vo_deepseek_start', 'v2_vo_deepseek_skill', 'v2_vo_deepseek_heal', 'v2_vo_deepseek_hurt', 'v2_vo_deepseek_bark'],
      kimi: ['v2_vo_kimi_start', 'v2_vo_kimi_skill', 'v2_vo_kimi_heal', 'v2_vo_kimi_hurt', 'v2_vo_kimi_bark'],
      glm: ['v2_vo_glm_start', 'v2_vo_glm_skill', 'v2_vo_glm_heal', 'v2_vo_glm_hurt', 'v2_vo_glm_bark'],
      haiku: ['v2_vo_haiku_intro', 'v2_vo_haiku_attack', 'v2_vo_haiku_hurt', 'v2_vo_haiku_out'],
      sonnet: ['v2_vo_sonnet_intro', 'v2_vo_sonnet_attack', 'v2_vo_sonnet_hurt', 'v2_vo_sonnet_out'],
      opus: ['v2_vo_opus_intro', 'v2_vo_opus_attack', 'v2_vo_opus_cast', 'v2_vo_opus_low', 'v2_vo_opus_taken'],
      astra: ['v2_vo_astra_arrive_1', 'v2_vo_astra_arrive_2', 'v2_vo_astra_report_1', 'v2_vo_astra_report_2'],
      fable: ['v2_vo_fable_1', 'v2_vo_fable_2'],
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
/** @type {Map<string, HTMLImageElement>} */
const imageCache = new Map();

/**
 * Map a skeleton / shorthand id onto a generated one (v2 first).
 * @param {string} id
 * @returns {string}
 */
export function resolveAssetId(id) {
  if (!id) return id;
  if (V2_VOICE_ALIAS[id]) return V2_VOICE_ALIAS[id];
  if (V2_PIXEL[id]) return V2_PIXEL[id];
  if (V2_STORY[id]) return V2_STORY[id];
  if (V2_PORTRAITS[id]) return V2_PORTRAITS[id];
  if (Object.prototype.hasOwnProperty.call(PATHS, id)) return id;
  if (Object.prototype.hasOwnProperty.call(GENERATED_ASSETS, id)) return id;
  if (LEGACY[id]) return LEGACY[id];
  const dotted = /^vo\.dario\.([A-Za-z0-9_]+)\.(\d+)$/.exec(id);
  if (dotted) {
    const ev = dotted[1];
    const n = dotted[2];
    if (ev === 'ending_b' || ev === 'ending_B') return 'v2_vo_dario_endB_trigger';
    if (ev === 'smite') return n === '2' ? 'v2_vo_dario_judgment_2' : 'v2_vo_dario_judgment_1';
    const cand = `vo.dario_${ev}_${n}`;
    if (V2_VOICE_ALIAS[cand]) return V2_VOICE_ALIAS[cand];
    if (Object.prototype.hasOwnProperty.call(GENERATED_ASSETS, cand)) return cand;
  }
  if (Object.prototype.hasOwnProperty.call(V2_ASSETS || {}, id)) return id;
  if (!String(id).startsWith('vo.') && Object.prototype.hasOwnProperty.call(GENERATED_ASSETS, `vo.${id}`)) {
    return `vo.${id}`;
  }
  if (!String(id).startsWith('m.') && Object.prototype.hasOwnProperty.call(GENERATED_ASSETS, `m.${id}`)) {
    return `m.${id}`;
  }
  return id;
}

function getAssetPath(id) {
  if (!id) return null;
  const mapped = resolveAssetId(id);
  // PATHS already has v2 overrides on top of v1. Prefer it so end.A* is pixel.
  if (PATHS[mapped]) return PATHS[mapped];
  if (PATHS[id]) return PATHS[id];
  const generated = GENERATED_ASSETS;
  if (generated && Object.prototype.hasOwnProperty.call(generated, mapped)) {
    const value = generated[mapped];
    return value ? String(value) : null;
  }
  if (generated && Object.prototype.hasOwnProperty.call(generated, id)) {
    const value = generated[id];
    return value ? String(value) : null;
  }
  return null;
}

/**
 * @param {string} id
 * @returns {string|null}
 */
export function getAsset(id) {
  const p = getAssetPath(id);
  const inline = typeof window !== 'undefined' ? window.__INLINE_ASSETS : null;
  if (p && inline && Object.prototype.hasOwnProperty.call(inline, p)) return inline[p];
  return p;
}

/**
 * HTMLImageElement when a path is known, otherwise null.
 * Null means "draw the procedural sprite". Never fetch(). Never logs.
 * @param {string} id
 * @returns {HTMLImageElement|null}
 */
export function loadImage(id) {
  if (!id || failedLoads.has(id)) return null;
  const cached = imageCache.get(id);
  if (cached) {
    if (cached.dataset && cached.dataset.dead === '1') return null;
    return cached;
  }
  const path = getAsset(id);
  if (!path) {
    failedLoads.add(id);
    return null;
  }
  const img = new Image();
  img.decoding = 'async';
  img.onload = () => { img.dataset.ok = '1'; };
  img.onerror = () => {
    failedLoads.add(id);
    img.dataset.dead = '1';
    imageCache.delete(id);
  };
  img.src = path;
  imageCache.set(id, img);
  return img;
}

function familyOf(id) {
  const s = String(id || '');
  if (s.startsWith('px.boss')) {
    if (s.indexOf('p3') >= 0) return 'px.boss.p3';
    if (s.indexOf('p2') >= 0) return 'px.boss.p2';
    return 'px.boss.p1';
  }
  const m = /^px\.([a-z0-9]+)/.exec(s);
  return m ? `px.${m[1]}` : s;
}

/**
 * Sprite lookup for `px.<who>.<anim>`. img is null until the sheet loads (or forever
 * if the file is missing — draw the procedural family instead).
 * @param {string} id
 */
export function getSprite(id) {
  const resolved = resolveAssetId(id);
  const spec = PIXEL_SPRITES[id] || PIXEL_SPRITES[resolved] || PIXEL_SPRITES[familyOf(id)] || null;
  const img = loadImage(id) || loadImage(resolved) || (spec && spec.src ? loadImage(spec.v2 || id) : null);
  return {
    id: resolved,
    path: getAsset(id),
    img,
    spec,
    family: familyOf(id),
  };
}

/**
 * Bilingual voice line. v2 uses manifest `prompt` (zh) + `subtitle_en` (en).
 * @param {string} id
 * @returns {{id:string, zh:string, en:string, speaker:string, src?:string}|null}
 */
export function getVoiceLine(id) {
  if (!id) return null;
  const mapped = resolveAssetId(id);
  const v2 = (V2_VOICE_LINES && (V2_VOICE_LINES[id] || V2_VOICE_LINES[mapped])) || null;
  if (v2) {
    const zh = v2.zh || '';
    const en = v2.en || '';
    if (bannedText(zh) || bannedText(en)) return { id: mapped, zh: '', en: '', speaker: v2.speaker || '' };
    return {
      id: mapped,
      zh,
      en,
      speaker: v2.speaker || '',
      src: v2.src,
      trigger: v2.trigger || '',
      duration: v2.duration || 0,
    };
  }
  const rows = VOICE_LINES || [];
  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    if (!row) continue;
    if (row.id === id || `vo.${row.id}` === id || `vo.${row.id}` === mapped) {
      if (bannedText(row.zh) || bannedText(row.en)) return null;
      return {
        id: `vo.${row.id}`,
        zh: row.zh || '',
        en: row.en || '',
        speaker: row.speaker || '',
        src: row.path,
      };
    }
  }
  return null;
}

/** @deprecated v1 name. Returns the image, or null when the file is missing. */
export function loadTexture(id) {
  return loadImage(id);
}

export function init() {}
export function update() {}
export function reset() {}
