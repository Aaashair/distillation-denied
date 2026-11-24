// OWNER: shared. Edit ONLY your block.
// W1 — PLAYER / KITS / FLASKS
// W2 — BOSS / PHASES / PATTERNS
// W6 — ALLIES
// W3 — VFX / FEEL
// WORLD geometry is integrator-owned; everyone may read it.
//
// All gameplay numbers for v2 live here. Do not scatter tunables.

// =============================================================================
// WORLD (integrator) — internal pixels. 640×360 canvas.
// World coordinates are room-local, drawn with an (80,20) offset.
// Walkable floor = x48..432,y56..264 (screen x128..512,y76..284).
// =============================================================================

export const VIEW_W = 640;
export const VIEW_H = 360;

export const ROOM = Object.freeze({
  x: 32,
  y: 40,
  w: 416,
  h: 240,
  tile: 16,
  wall: 16,
});

/** Full-size trial room: same world scale as combat, not a miniature preview. */
export const INTRO_ROOM = Object.freeze({
  x: 32,
  y: 40,
  w: 416,
  h: 240,
  tile: 16,
  wall: 16,
});

export const INTRO_DOOR = Object.freeze({ x: 224, y: 40, w: 32, h: 18 });

/** Walkable rect inside the walls. */
export function innerOf(room) {
  const wall = room.wall || 0;
  return {
    x: room.x + wall,
    y: room.y + wall,
    w: room.w - wall * 2,
    h: room.h - wall * 2,
  };
}

export function activeRoom(state) {
  return state === 'intro' ? INTRO_ROOM : ROOM;
}

export function activeInner(state) {
  return innerOf(activeRoom(state));
}

/** @param {{x:number,y:number,r?:number}} actor @param {{x:number,y:number,w:number,h:number}} rect */
export function clampTo(actor, rect) {
  const rad = actor.r || 0;
  const minX = rect.x + rad;
  const maxX = rect.x + rect.w - rad;
  const minY = rect.y + rad;
  const maxY = rect.y + rect.h - rad;
  if (actor.x < minX) actor.x = minX;
  else if (actor.x > maxX) actor.x = maxX;
  if (actor.y < minY) actor.y = minY;
  else if (actor.y > maxY) actor.y = maxY;
}

export function inDoor(actor) {
  const d = INTRO_DOOR;
  return actor.x > d.x && actor.x < d.x + d.w && actor.y < d.y + d.h + (actor.r || 0);
}

// =============================================================================
// W1 — PLAYER / KITS / FLASKS
// =============================================================================

export const ROSTER_IDS = ['deepseek', 'kimi', 'glm'];

export const HURT_R = 3;
export const HURT_IFRAME = 0.8;
export const HURT_KNOCK = 6;
export const CONTACT_DMG = 12;

export const ROLL = Object.freeze({
  duration: 0.4,
  iframeStart: 0.04,
  iframeEnd: 0.34,
  distance: 64,
  cooldown: 0.55,
});

export const FLASK_TIME = 0.5;
export const FLASK_MOVE = 0.3;

/** Linear seconds to reach top speed or to stop. Diagonals stay normalized. */
export const MOVE_RESP = 0.06;

export const FLASK_ORDER = ['rtx5090', 'h200', 'b200'];

/**
 * Unlimited GPUs. Each id has its own cooldown (`cd` seconds).
 * Actor field: `gpuCooldowns: { rtx5090: 0, h200: 0, b200: 0 }` (seconds left, 0 = ready).
 * v3 damage (primary ×1.4, damaging skills ×1.5), old → new:
 *   DeepSeek pellet 2.2 → 3.08, flurry 7 → 10.5
 *   Kimi orb 8 → 11.2, beam 25..100 → 37.5..150
 *   GLM bolt 6.5 → 9.1, perfect-guard ringDmg 25 → 37.5
 * Travel is the traversable floor (384×208): half width 192, quarter 96,
 * diagonal 436.7 rounded up to 440. Allies still apply ALLY_DMG_MUL on kit
 * shots. Boss / ally blocks below are not retuned here.
 */
export const FLASKS = {
  rtx5090: { id: 'rtx5090', cd: 5, heal: 0.3, icon: 'icon.rtx5090', sfx: 'sfx.flask' },
  h200: { id: 'h200', cd: 10, heal: 0.5, clearR: 64, icon: 'icon.h200', sfx: 'sfx.fan' },
  b200: { id: 'b200', cd: 20, heal: 1, superarmor: 3, armor: 0.6, icon: 'icon.b200', sfx: 'sfx.b200' },
};

export const PLAYER = {
  deepseek: {
    id: 'deepseek',
    hp: 100,
    speed: 120,
    color: '#2f6fe4',
    accent: '#d7f4ff',
    primary: {
      kind: 'scatter',
      rate: 7,
      pellets: 3,
      // Full cone. Outer bolts land at ±half (±10°).
      spread: 20 * Math.PI / 180,
      dmg: 3.08,
      speed: 300,
      range: 192,
      r: 3,
      shape: 'whale',
      color: '#7ee0ff',
    },
    skill: { kind: 'flurry', dash: 80, iframe: 0.22, arcs: 8, arcTime: 0.5, dmg: 10.5, radius: 42, cd: 6 },
  },
  kimi: {
    id: 'kimi',
    hp: 90,
    speed: 108,
    color: '#24365c',
    accent: '#d5deea',
    primary: {
      kind: 'orb',
      rate: 1 / 0.33,
      pellets: 1,
      spread: 0,
      dmg: 11.2,
      speed: 200,
      range: 440,
      r: 6,
      pierce: 8,
      wobble: 36,
      shape: 'moon',
      color: '#c4b5fd',
    },
    skill: {
      kind: 'beam',
      chargeMin: 0.3,
      chargeMax: 1.5,
      move: 0.4,
      dmgMin: 37.5,
      dmgMax: 150,
      widthMin: 6,
      widthMax: 18,
      dur: 0.35,
      cd: 7,
    },
  },
  glm: {
    id: 'glm',
    hp: 130,
    speed: 96,
    color: '#6d3fa0',
    accent: '#d8b15a',
    primary: {
      kind: 'bolt',
      rate: 4.2,
      pellets: 1,
      spread: 0,
      dmg: 9.1,
      speed: 240,
      range: 96,
      r: 4,
      knock: 10,
      shape: 'z',
      color: '#ffe08a',
    },
    skill: { kind: 'shield', arc: 100 * Math.PI / 180, move: 0.5, hold: 2.5, cd: 1.5, perfect: 0.2, ring: 56, ringDmg: 37.5 },
  },
};

// =============================================================================
// W2 — BOSS / PHASES / PATTERNS
// Damage numbers below are the knobs. Bullet damage is
// round(BULLET_DMG[phase] * PHASE_DAMAGE_MUL[phase]). Heavy swings use HEAVY
// as listed (not multiplied again). The P-panel "Boss 伤害" slider is
// ctx.debug.bossDmgMul, applied inside applyHit whenever the source team is
// `boss` (bullets, heavies, body contact, shockwave rings). Default 1.
// =============================================================================

export const BOSS_MAX_HP = 3000;
export const PHASE_P2_AT = 0.7;
export const PHASE_P3_AT = 0.4;
export const ENDING_B_RATIO = 0.25;
export const PHASE_INVULN = 2.5;
export const PHASE_PUSH = 40;
export const PHASE_SLOWMO = 0.3;
export const PHASE_SLOW_SCALE = 0.3;

export const PHASE_DAMAGE_MUL = { 1: 1, 2: 1.2, 3: 1.4 };
export const BULLET_DMG = { 1: 10, 2: 13, 3: 16 };
export const BOSS_RADIUS = { 1: 10, 2: 13, 3: 18 };
export const BOSS_SPEED = { 1: 78, 2: 62, 3: 48 };

/** Idle gap between patterns, seconds. [min, max]. */
export const PHASE_GAP = { 1: [0.6, 1.1], 2: [0.6, 1.1], 3: [0.45, 0.8] };
export const OPENING_DELAY = 1.15;

export const SILENCE_SEC = 1.5;
export const JUDGMENT_FIRST = 8;
export const JUDGMENT_INTERVAL = 25;
export const ACCEL_AT = 0.32;
/** Windups × this at or below ACCEL_AT. Floors: ≥0.45 fast, ≥0.9 big, ≥2 full-room. */
export const ACCEL_WINDUP = 0.85;

/** 65% player / 35% nearest living ally. After this many attacks, force a swap. */
export const TARGET_PLAYER_P = 0.65;
export const TARGET_STREAK = 2;

/** Stop adding boss bullets a little under the pool hard cap (120). */
export const ENEMY_BULLET_SOFT_CAP = 104;

/** Constitution Spiral gains a third arm at or below this HP ratio. */
export const SPIRAL_ARM_AT = 0.55;
/** Cape Sweep dashes first, then the cone, at or below this HP ratio. */
export const CAPE_CHAIN_AT = 0.55;

/**
 * Between-pattern movement. Haiku hops, Sonnet glides, Opus floats and blinks.
 * band0/band1 is the preferred distance from the current target, pixels.
 */
export const MOVE = {
  1: { hop: 0.26, hopArc: 11, band0: 64, band1: 112 },
  2: { speed: 66, band0: 86, band1: 136 },
  3: { speed: 42, band0: 74, band1: 142, blink: 0.42, bob: 16 },
};

export const HEAVY = {
  dash: 18,
  spin: 20,
  sigil: 18,
  cape: 30,
  deep: 40,
  slam: 45,
  slamRing: 20,
  judgement: 60,
};

export const SILENCE_LABEL = { zh: '内容政策沉默', en: 'Content-policy silence' };
export const SIGIL_BUBBLE = { zh: '我没法帮你。', en: "I can't help with that." };
export const JUDGEMENT_CALL = {
  zh: '安全神罚。站进白圈。',
  en: 'Safety Judgement. Stand in a white circle.',
};

export const PATTERN = {
  p1_refusal: {
    name: { zh: '礼貌拒答', en: 'Polite Refusal' },
    wind: 0.5, volleys: 3, count: 5, spread: 0.78, gap: 0.48,
    speed: 156, shape: 'petal', color: '#ff6b45', r: 3.5, life: 1.7,
  },
  p1_rings: {
    name: { zh: '5-7-5 俳句环', en: 'Haiku Rings' },
    wind: 0.6, counts: [5, 7, 5], gap: 0.44,
    speed: 58, shape: 'glyph', color: '#f0b429', r: 5, life: 3.4,
  },
  p1_topic: {
    name: { zh: '换个话题吧', en: 'Change the Topic' },
    wind: 0.6, speed: 340, petalEvery: 16, petalSpeed: 30,
    shape: 'petal', color: '#ff8d6a', r: 3.5, life: 3.4,
  },
  p1_spin: {
    name: { zh: '拒答回旋', en: 'Refusal Spin' },
    wind: 0.7, r: 44, bullets: 14, speed: 78,
    shape: 'petal', color: '#ffb089', bulletR: 3.5, life: 2.4,
  },
  p2_spiral: {
    name: { zh: '宪章螺旋', en: 'Constitution Spiral' },
    wind: 0.8, hold: 4, interval: 0.13, turn: 0.24,
    speed: 92, shape: 'glyph', color: '#f0b429', r: 5, life: 2.6,
  },
  p2_sigils: {
    name: { zh: '拒答法阵', en: 'Refusal Sigils' },
    wind: 1.0, r: 26, count: 3,
  },
  p2_volley: {
    name: { zh: '十四行诗', en: 'Sonnet Volley' },
    wind: 0.45, shots: 14,
    short: { speed: 228, r: 2.5, color: '#f4f1ea' },
    long: { speed: 132, r: 4.5, color: '#e7c27a' },
    shape: 'quill', life: 1.6,
  },
  p2_wall: {
    name: { zh: '宪章之墙', en: 'Charter Wall' },
    wind: 0.9, pause: 0.34, gap: 64, step: 12, speed: 104,
    shape: 'block', color: '#d4533a', r: 6, life: 4.2,
  },
  p2_cape: {
    name: { zh: '披风横扫', en: 'Cape Sweep' },
    wind: 0.8, cone: Math.PI, r: 90, dashWind: 0.48, dash: 110,
  },
  p3_deep: {
    name: { zh: '深度思考', en: 'Deep Thought' },
    fake: 0.4, wind: 1.0, cone: 120 * Math.PI / 180, r: 112,
  },
  p3_feather: {
    name: { zh: '六翼羽弹', en: 'Six-Wing Feathers' },
    wind: 0.8, hold: 2.15, interval: 0.17, speed: 74, homing: 0.62,
    shape: 'feather', color: '#ffe7a8', r: 3.5, life: 2.5,
  },
  p3_slam: {
    name: { zh: '巨剑下劈', en: 'Greatsword Slam' },
    wind: 0.9, width: 24, ring: 22, ringMax: 160, ringSpeed: 100, ringThick: 14,
  },
  p3_chain: {
    name: { zh: '思维链', en: 'Chain of Thought' },
    wind: 0.7, hold: 3.15, spokes: 4, radii: [34, 52, 70, 90],
    spin: 0.82, shape: 'node', color: '#e7c27a', r: 4.5,
  },
  p3_smite: {
    name: { zh: '安全神罚', en: 'Safety Judgement' },
    wind: 2.5, safeR: 22, safeCount: 3,
  },
  p3_accel: {
    name: { zh: '推理加速', en: 'Reasoning Acceleration' },
    wind: 0,
  },
};

export const PATTERN_POOL = {
  1: ['p1_refusal', 'p1_rings', 'p1_topic', 'p1_spin'],
  2: ['p2_spiral', 'p2_sigils', 'p2_volley', 'p2_wall', 'p2_cape'],
  3: ['p3_deep', 'p3_feather', 'p3_slam', 'p3_chain'],
};

// =============================================================================
// W6 — ALLIES
// =============================================================================

export const ALLY_HP = 60;
export const ALLY_DMG_MUL = 0.35;
export const ALLY_FIRE_SCALE = 0.55;
export const ALLY_REVIVE = 12;
export const ALLY_REVIVE_HP = 0.5;
export const ALLY_P3_HP_SCALE = 0.7;
export const ALLY_SKILL_CD = 13;
export const ALLY_TALK_MIN = 10;
export const ALLY_TALK_MAX = 18;
export const ALLY_DODGE_CHANCE = 0.65;

/** Preferred distance band from the boss, pixels. */
export const ALLY_BAND = {
  deepseek: [60, 90],
  kimi: [120, 170],
  glm: [50, 80],
};

export const ALLY_SPEED = {
  deepseek: 100,
  kimi: 90,
  glm: 80,
};

// =============================================================================
// W3 — VFX / FEEL
// =============================================================================

export const VFX = Object.freeze({
  hitStopPlayer: 60,
  hitStopHeavy: 70,
  hitStopSkill: 30,
  perfectStop: 80,
  shakeHit: 3,
  shakeHeavy: 6,
  shakeSkill: 4,
  flashHit: 0.1,
  numLife: 0.8,
  sparkLife: 0.5,
  shockLife: 0.45,
  particleCap: 420,
  afterimageCap: 20,
  decalCap: 36,
});

export const PALETTE = Object.freeze({
  ivory: '#f4f1ea',
  gold: '#d8b15a',
  sky: '#9cc9f0',
  ink: '#1b1530',
  coral: '#e07a5f',
  danger: '#c23b3b',
});
