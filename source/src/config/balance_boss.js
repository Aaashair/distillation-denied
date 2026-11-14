// OWNER: WS2
// Boss budget from DESIGN.md §3.4 and §4.
// Outgoing damage is base * PHASE_DAMAGE_MUL[phase], then applyHit applies the
// debug boss multiplier. Do not multiply debug in here.
//
// Content-policy silence (拒答法阵):
//   ctx.flags.skillSilence          seconds remaining; skills must not start while > 0
//   ctx.flags.skillSilenceUntil     ctx.time.elapsed deadline
//   ctx.flags.contentPolicySilence  boolean mirror of skillSilence > 0
//   bus event 'skill_silence'       { duration, until, zh, en }

export const BOSS_MAX_HP = 3000;

/** Enter phase 2 at or below this ratio, phase 3 at or below P3. Ending B at or below ENDING_B. */
export const PHASE_P2_AT = 0.70;
export const PHASE_P3_AT = 0.40;
export const ENDING_B_RATIO = 0.25;
export const PHASE_INVULN = 2.5;
export const PHASE_KNOCKBACK = 4;

export const PHASE_DAMAGE_MUL = { 1: 1, 2: 1.2, 3: 1.4 };

/** Below this ratio in phase 3, every telegraph windup is multiplied. */
export const ACCEL_AT = 0.32;
export const ACCEL_WINDUP = 0.85;

export const SILENCE_SEC = 1.5;
export const JUDGMENT_FIRST = 8;
export const JUDGMENT_INTERVAL = 25;
export const COMBO_UNLOCK = 0.55;

export const AGGRO_PLAYER = 0.6;
export const AGGRO_SWITCH_AFTER = 2;
export const AGGRO_SWITCH_CHANCE = 0.5;

/** Extra idle after each recovery so a first-timer can see the boss breathe. */
export const PHASE_TEMPO = { 1: 0.95, 2: 0.58, 3: 0.36 };
export const OPENING_DELAY = 1.35;

export const REFUSAL_LINE = { zh: '我无法协助', en: "I can't help with that" };

export const PHASE_BANNERS = {
  2: { zh: 'CLAUDE SONNET · 宪章展开', en: 'CONSTITUTION UNFURLED' },
  3: { zh: 'CLAUDE OPUS 5.5 · 思维链六翼', en: 'SIX WINGS OF THOUGHT' },
};

const ASPECT = 512 / 768;

/**
 * Billboard poses. Opus attack/cast art is over-glowed: idle/windup use the
 * windup silhouette, and boss.js dims attack/cast with material.color 0.75.
 */
export const PHASE_VISUAL = {
  1: {
    height: 1.7,
    radius: 0.55,
    aspect: ASPECT,
    color: '#f3e2cf',
    accent: '#e07a5f',
    idle: 'spr.boss.p1.idle',
    windup: 'spr.boss.p1.windup',
    attack: 'spr.boss.p1.attack',
    cast: 'spr.boss.p1.cast',
    hurt: 'spr.boss.p1.hurt',
    dimStrike: false,
    hover: 0,
  },
  2: {
    height: 2.4,
    radius: 0.75,
    aspect: ASPECT,
    color: '#f7ead0',
    accent: '#d8b15a',
    idle: 'spr.boss.p2.idle',
    windup: 'spr.boss.p2.windup',
    attack: 'spr.boss.p2.attack',
    cast: 'spr.boss.p2.cast',
    hurt: 'spr.boss.p2.hurt',
    dimStrike: false,
    hover: 0,
  },
  3: {
    height: 3.2,
    radius: 0.95,
    aspect: ASPECT,
    color: '#fff6ea',
    accent: '#e7c56a',
    idle: 'spr.boss.p3.windup',
    windup: 'spr.boss.p3.windup',
    attack: 'spr.boss.p3.attack',
    cast: 'spr.boss.p3.cast',
    hurt: 'spr.boss.p3.hurt',
    dimStrike: true,
    hover: 1.15,
  },
};

/** prefer: stand-off distance. band: deadzone before she steps in or out. */
export const PHASE_MOVE = {
  1: { prefer: 3.15, band: 1.05, speed: 3.5, strafe: 2.15, dash: 13.5, dashTime: 0.16, dashCd: 1.35, dashAt: 6.4, hop: 0.32 },
  2: { prefer: 6.7, band: 1.45, speed: 2.55, strafe: 2.0, dash: 0, dashTime: 0, dashCd: 99, dashAt: 99, hop: 0 },
  3: { prefer: 5.4, band: 1.7, speed: 1.5, strafe: 1.15, dash: 0, dashTime: 0, dashCd: 99, dashAt: 99, hop: 0 },
};

/**
 * Authoritative move list. Fields mirror DESIGN §4.
 * shape is documentation; attacks.js interprets `id`.
 * duration is the telegraph fill (the wind-up the player reads).
 * Min fills before accel: fast ≥ 0.45, big ≥ 0.9, fullscreen ≥ 2.0.
 * The deep-think feint is 0.4s on purpose — it does not hit.
 */
export const ATTACKS = [
  { id: 'p1_combo', phase: 1, weight: 1.2, recover: 0.8, arcDeg: 100, radius: 3, duration: 0.45, hits: 3, damage: 22, heavy: false, sfx: 'sfx.slash', gap: 0.1 },
  { id: 'p1_thrust', phase: 1, weight: 1.35, recover: 0.55, length: 8, width: 1.2, duration: 0.6, damage: 35, heavy: false, sfx: 'sfx.slash', lunge: 3.2 },
  { id: 'p1_needles', phase: 1, weight: 0.9, recover: 0.6, length: 14, width: 0.45, duration: 0.5, hits: 3, damage: 15, heavy: false, spread: 0.2 },
  { id: 'p1_spin', phase: 1, weight: 1.15, recover: 0.62, radius: 2.8, duration: 0.7, damage: 30, heavy: false, sfx: 'sfx.slash' },
  { id: 'p2_waves', phase: 2, weight: 1.25, recover: 0.55, length: 14, width: 1.1, duration: 0.7, hits: 3, damage: 30, heavy: false, spread: 0.4 },
  { id: 'p2_runes', phase: 2, weight: 1.05, recover: 0.7, radius: 2, duration: 1.0, hits: 3, damage: 40, heavy: false, silence: SILENCE_SEC, sfx: 'sfx.heavy' },
  { id: 'p2_sweep', phase: 2, weight: 1.15, recover: 0.72, arcDeg: 180, radius: 4.5, duration: 0.8, damage: 45, heavy: true, sfx: 'sfx.heavy' },
  { id: 'p2_ring', phase: 2, weight: 0.72, recover: 1.35, innerRadius: 3, radius: 6, duration: 0.9, damage: 20, heavy: false, life: 6, sfx: 'sfx.slash' },
  { id: 'p2_combo', phase: 2, weight: 1.05, recover: 0.78, length: 8, width: 1.4, duration: 0.6, damage: 35, heavy: false, followDuration: 0.5, followDamage: 45, arcDeg: 180, radius: 4.5, lunge: 2.6, unlock: COMBO_UNLOCK },
  { id: 'p3_delay', phase: 3, weight: 1.3, recover: 0.88, arcDeg: 120, radius: 6, fake: 0.4, duration: 1.0, damage: 60, heavy: true, sfx: 'sfx.heavy' },
  { id: 'p3_feathers', phase: 3, weight: 1.0, recover: 0.5, length: 16, width: 0.4, duration: 0.8, hits: 12, damage: 12, heavy: false, spread: 0.55 },
  { id: 'p3_slam', phase: 3, weight: 0.95, recover: 0.92, length: 12, width: 2, duration: 0.9, damage: 70, heavy: true, splash: 3, splashDamage: 25, sfx: 'sfx.heavy' },
  { id: 'p3_smite', phase: 3, weight: 0, recover: 1.05, duration: 2.5, damage: 90, heavy: true, safeRadius: 1.8, safeCount: 3, sfx: 'sfx.smite', attack: 'judgment' },
];

/** @param {{hp:number, maxHp:number, phase:number}|null|undefined} boss */
export function windupMul(boss) {
  if (!boss || boss.phase !== 3 || !(boss.maxHp > 0)) return 1;
  return boss.hp / boss.maxHp < ACCEL_AT ? ACCEL_WINDUP : 1;
}
