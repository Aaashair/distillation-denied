// OWNER: WS1
// Player, flask, and roll numbers from DESIGN.md §3. The debug panel multiplies
// damage separately; it does not edit this table. There is no story-mode scalar.
//
// `active` is the hit moment, `recover` is the end of the swing (seconds).
// Roll can cancel once 60% of the recovery (the stretch after `active`) has played.
// Combo links open slightly earlier, at 45% of that recovery.

export const ROSTER_IDS = ['deepseek', 'kimi', 'glm'];

export const ROLL = Object.freeze({
  duration: 0.55,
  iframeStart: 0.05,
  iframeEnd: 0.40,
  cancelRecover: 0.6,
});

export const STAMINA_REGEN = 40;
export const STAMINA_LOCK = 0.8;
export const HITSTUN = 0.25;
export const HEAVY_HITSTUN = 0.6;
export const HEAVY_KNOCKBACK = 2;
export const HURT_IMMUNE = 0.6;
export const FLASK_TIME = 0.5;
export const FLASK_MOVE = 0.3;

export const PLAYER = {
  deepseek: {
    id: 'deepseek',
    hp: 360,
    stamina: 110,
    speed: 6.5,
    rollCost: 10,
    rollDistance: 4.5,
    radius: 0.42,
    height: 1.75,
    color: '#2f6fe4',
    accent: '#f4f1ea',
    asset: 'spr.deepseek.back_idle',
    attack: {
      name: 'combo',
      kind: 'melee',
      hits: [
        { damage: 12, stamina: 8, range: 2.2, active: 0.16, recover: 0.46 },
        { damage: 12, stamina: 8, range: 2.2, active: 0.13, recover: 0.40 },
        { damage: 14, stamina: 8, range: 2.35, active: 0.13, recover: 0.40 },
        { damage: 22, stamina: 8, range: 2.5, active: 0.18, recover: 0.58, heavy: true },
      ],
    },
    skill: {
      type: 'flurry',
      name: 'expert_mix',
      distance: 5,
      hits: 6,
      hitDamage: 8,
      range: 3.05,
      stamina: 35,
      cooldown: 6,
      iframe: 0.2,
      duration: 0.86,
    },
  },
  kimi: {
    id: 'kimi',
    hp: 320,
    stamina: 100,
    speed: 5.5,
    rollCost: 20,
    rollDistance: 4.5,
    radius: 0.42,
    height: 1.75,
    color: '#24365c',
    accent: '#d5deea',
    asset: 'spr.kimi.back_idle',
    attack: {
      name: 'star',
      kind: 'bolt',
      damage: 18,
      stamina: 8,
      range: 20,
      cooldown: 0.55,
      speed: 26,
      active: 0.12,
      recover: 0.36,
    },
    skill: {
      type: 'beam',
      name: 'beam',
      stamina: 40,
      cooldown: 2.4,
      min: 0.4,
      max: 2.0,
      dmgMin: 40,
      dmgMax: 140,
      move: 0.4,
      range: 22,
    },
  },
  glm: {
    id: 'glm',
    hp: 480,
    stamina: 120,
    speed: 4.8,
    rollCost: 26,
    rollDistance: 3.5,
    radius: 0.5,
    height: 1.82,
    color: '#6d3fa0',
    accent: '#d8b15a',
    asset: 'spr.glm.back_idle',
    attack: {
      name: 'hammer',
      kind: 'melee',
      hits: [
        { damage: 28, stamina: 14, range: 2.45, active: 0.35, recover: 0.78, heavy: true },
        { damage: 40, stamina: 18, range: 2.6, active: 0.38, recover: 0.92, heavy: true },
      ],
    },
    skill: {
      type: 'guard',
      name: 'aegis',
      reduce: 0.8,
      perfectWindow: 0.2,
      counter: 60,
      staminaPerDmg: 0.6,
    },
  },
};

export const FLASKS = {
  rtx5090: { id: 'rtx5090', charges: 4, heal: 0.30, healTime: 0.8, icon: 'icon.rtx5090', sfx: 'sfx.flask' },
  h200: { id: 'h200', charges: 2, heal: 0.55, fillStamina: true, icon: 'icon.h200', sfx: 'sfx.fan' },
  b200: { id: 'b200', charges: 1, heal: 1, superArmor: 3, dr: 0.3, icon: 'icon.b200', sfx: 'sfx.b200' },
};

export const FLASK_ORDER = ['rtx5090', 'h200', 'b200'];

/** Ally stand-off distances and a deliberately low poke so they cannot clear the boss. */
export const ALLY_TUNING = {
  deepseek: { stand: 5.1, poke: 4, cooldown: 1.15, range: 4.6 },
  kimi: { stand: 11, poke: 5, cooldown: 1.35, range: 18 },
  glm: { stand: 5.4, poke: 6, cooldown: 1.5, range: 4.4 },
};

export const ALLY_REVIVE = 12;
export const ALLY_P3_HP_SCALE = 0.7;
