// OWNER: WS2
// One boss, three bodies, a 25% floor that ends the fight (ending B).
// commit() is the only hp write that may change phase or fire the ending.
//
// Opus floats via boss.visualLift. sprites.present adds visualLift and
// position.y, swaps the phase pose, and dims P3. present() here only places
// the mecha rig and the refusal bubbles after the billboard has moved.
//
// Content-policy silence is written on ctx.flags (see attacks.js).

import * as THREE from 'three';
import { EVENTS, TEAMS } from '../core/contracts.js';
import { NAMES } from '../data/lines.js';
import {
  BOSS_MAX_HP,
  ENDING_B_RATIO,
  JUDGMENT_FIRST,
  OPENING_DELAY,
  PHASE_BANNERS,
  PHASE_DAMAGE_MUL,
  PHASE_INVULN,
  PHASE_KNOCKBACK,
  PHASE_VISUAL,
} from '../config/balance_boss.js';
import { phaseForRatio, tick as tickPhase } from './phases.js';
import { forceAttack, interrupt, tick as tickAttacks } from './attacks.js';
import { animateMecha, createMecha, presentMecha } from './mecha.js';
import { presentSpeech, spawnShockwave } from './fx.js';

function visOf(phase) {
  return PHASE_VISUAL[phase] || PHASE_VISUAL[1];
}

function applyBoardSize(boss) {
  const board = boss.billboard;
  const vis = visOf(boss.phase);
  if (!board) return;
  board.height = boss.height;
  board.width = boss.height * (vis.aspect || (512 / 768));
}

function ensureBoard(ctx, boss) {
  const vis = visOf(boss.phase);
  if (boss.billboard) {
    applyBoardSize(boss);
    return;
  }
  const label = NAMES.boss[boss.phase - 1] || NAMES.boss[0];
  boss.billboard = ctx.world.sprites.createBillboard({
    assetId: vis.idle,
    label,
    color: vis.color,
    accent: vis.accent,
    height: boss.height,
    width: boss.height * vis.aspect,
    facing: 'front',
    owner: boss,
  });
  boss.sprite = boss.billboard.mesh;
  if (boss.billboard.family && boss.billboard.family.kind === 'boss') {
    boss.billboard.family.phase = `p${boss.phase}`;
  }
}

function beginGrow(boss, phase, duration) {
  const vis = visOf(phase);
  if (!(duration > 0.02)) {
    boss.height = vis.height;
    boss.radius = vis.radius;
    boss.grow = null;
    applyBoardSize(boss);
    return;
  }
  boss.grow = {
    fromH: boss.height,
    toH: vis.height,
    fromR: boss.radius,
    toR: vis.radius,
    t: 0,
    dur: duration,
  };
}

function tickGrow(boss, dt) {
  const grow = boss.grow;
  if (!grow) return;
  grow.t += dt;
  const k = Math.min(1, grow.t / grow.dur);
  const s = k * k * (3 - 2 * k);
  boss.height = grow.fromH + (grow.toH - grow.fromH) * s;
  boss.radius = grow.fromR + (grow.toR - grow.fromR) * s;
  applyBoardSize(boss);
  if (k >= 1) boss.grow = null;
}

function blast(ctx, boss) {
  const actors = [ctx.player, ...(ctx.allies || [])].filter((actor) => actor && actor.position);
  for (const actor of actors) {
    let dx = actor.position.x - boss.position.x;
    let dz = actor.position.z - boss.position.z;
    const len = Math.hypot(dx, dz);
    if (len < 0.2) {
      dx = 1;
      dz = 0;
    } else {
      dx /= len;
      dz /= len;
    }
    actor.position.x += dx * PHASE_KNOCKBACK;
    actor.position.z += dz * PHASE_KNOCKBACK;
    ctx.world.clamp?.(actor.position, (actor.radius || 0.4) + 0.4);
  }
  ctx.audio?.playSfx('sfx.phase');
  ctx.bus.emit(EVENTS.CAMERA_SHAKE, { intensity: 0.32, duration: 0.4 });
  spawnShockwave(ctx, boss.position.x, boss.position.z);
}

function ensureFlags(ctx) {
  if (!ctx.flags) ctx.flags = {};
  if (ctx.flags.skillSilence == null) ctx.flags.skillSilence = 0;
  if (ctx.flags.skillSilenceUntil == null) ctx.flags.skillSilenceUntil = 0;
  if (ctx.flags.contentPolicySilence == null) ctx.flags.contentPolicySilence = false;
}

function clearSilence(ctx) {
  ensureFlags(ctx);
  ctx.flags.skillSilence = 0;
  ctx.flags.skillSilenceUntil = 0;
  ctx.flags.contentPolicySilence = false;
}

function makeBoss(ctx) {
  const vis = PHASE_VISUAL[1];
  const boss = {
    id: 'boss',
    team: TEAMS.BOSS,
    position: new THREE.Vector3(0, 0, 0),
    hp: BOSS_MAX_HP,
    maxHp: BOSS_MAX_HP,
    radius: vis.radius,
    height: vis.height,
    alive: true,
    invulnerable: false,
    sprite: null,
    billboard: null,
    phase: 1,
    damageMul: PHASE_DAMAGE_MUL[1],
    lockHpAt25: false,
    phaseInvuln: 0,
    _ended: false,
    pose: 'idle',
    poseHold: 0,
    hurtT: 0,
    visualLift: 0,
    hover: 0,
    aimX: 0,
    aimZ: 1,
    attackId: null,
    lastAttack: null,
    sameCount: 0,
    target: null,
    act: null,
    pending: 0,
    recover: 0,
    tempo: OPENING_DELAY,
    rooted: false,
    p3Clock: 0,
    smiteCasts: 0,
    nextSmite: JUDGMENT_FIRST,
    haloOpen: 0,
    wingOpen: 0,
    snapOpen: false,
    setPhase(phase, opts = {}) {
      const next = /** @type {1|2|3} */ (phase);
      if (![1, 2, 3].includes(next)) return;
      const from = this.phase;
      const changed = from !== next;
      if (changed) interrupt(ctx, this);
      this.phase = next;
      this.damageMul = PHASE_DAMAGE_MUL[next] || 1;
      if (this.billboard?.setDim) this.billboard.setDim(null);
      beginGrow(this, next, !changed || opts.noInvuln ? 0 : PHASE_INVULN);
      this.snapOpen = !!(opts.noInvuln || !changed);
      if (!this.snapOpen) {
        this.haloOpen = this.haloOpen || 0;
        this.wingOpen = this.wingOpen || 0;
      }
      if (changed && !opts.noInvuln) {
        this.invulnerable = true;
        this.phaseInvuln = PHASE_INVULN;
        this.pose = 'cast';
        this.tempo = 0;
        this.recover = 0;
        blast(ctx, this);
      } else if (opts.noInvuln) {
        this.invulnerable = false;
        this.phaseInvuln = 0;
        this.pose = 'idle';
        this.tempo = changed ? 0.5 : this.tempo;
        this.recover = 0;
      }
      if (changed && next === 3) {
        this.p3Clock = 0;
        this.smiteCasts = 0;
        this.nextSmite = JUDGMENT_FIRST;
      }
      ensureBoard(ctx, this);
      if (changed && !opts.silent) {
        const bgm = next === 2 ? 'bgm.p2' : next === 3 ? 'bgm.p3' : 'bgm.p1';
        ctx.audio?.playBgm(bgm, 1.15);
        ctx.bus.emit(EVENTS.PHASE_CHANGE, { phase: next, from });
        const banner = PHASE_BANNERS[next];
        if (banner) ctx.bus.emit(EVENTS.BANNER, { phase: next, zh: banner.zh, en: banner.en });
      }
    },
    commit(opts = {}) {
      const floor = this.maxHp * ENDING_B_RATIO;
      if (this.hp < floor) this.hp = floor;
      if (this.lockHpAt25) this.hp = floor;
      const ratio = this.maxHp > 0 ? this.hp / this.maxHp : 1;
      const next = phaseForRatio(ratio);
      const endingNow = opts.allowEnding !== false && !this._ended && ratio <= ENDING_B_RATIO + 1e-4;
      if (next !== this.phase) {
        this.setPhase(next, endingNow ? { ...opts, noInvuln: true } : opts);
      }
      const ratioNow = this.maxHp > 0 ? this.hp / this.maxHp : 1;
      ctx.distill = Math.min(92, (1 - Math.min(1, ratioNow)) * 120);
      ctx.bus.emit(EVENTS.BOSS_HP, { ratio: ratioNow, hp: this.hp, maxHp: this.maxHp });
      ctx.bus.emit(EVENTS.DISTILL_PROGRESS, { value: ctx.distill });
      if (opts.allowEnding === false) return;
      if (!this._ended && this.phase >= 3 && ratioNow <= ENDING_B_RATIO + 1e-4) {
        this._ended = true;
        this.lockHpAt25 = true;
        this.hp = floor;
        this.invulnerable = true;
        interrupt(ctx, this);
        ctx.bus.emit(EVENTS.ENDING_TRIGGER, { id: 'B' });
      }
    },
    takeDamage(info) {
      if (!this.alive) return 0;
      if (this.lockHpAt25 || this._ended) return 0;
      if ((this.invulnerable || this.phaseInvuln > 0) && !info.ignoreInvuln) return 0;
      const amount = Number(info.dmg) || 0;
      if (!(amount > 0)) return 0;
      const before = this.hp;
      const floor = this.maxHp * ENDING_B_RATIO;
      let next = before - amount;
      if (next < floor) next = floor;
      this.hp = next;
      const applied = Math.max(0, before - this.hp);
      if (applied > 0) {
        this.hurtT = 0.16;
        ctx.audio?.playSfx('sfx.hitBoss');
      }
      this.commit();
      return Math.max(0, before - this.hp);
    },
    forceAttack(id) {
      return forceAttack(ctx, boss, id);
    },
  };
  ensureBoard(ctx, boss);
  boss.mecha = createMecha(ctx.scene);
  return boss;
}

function restyle(ctx, boss) {
  const vis = PHASE_VISUAL[1];
  boss.phase = 1;
  boss.damageMul = PHASE_DAMAGE_MUL[1];
  boss.height = vis.height;
  boss.radius = vis.radius;
  boss.grow = null;
  boss.pose = 'idle';
  boss.poseHold = 0;
  boss.hurtT = 0;
  boss.visualLift = 0;
  boss.hover = 0;
  boss.haloOpen = 0;
  boss.wingOpen = 0;
  boss.snapOpen = true;
  boss.aimX = 0;
  boss.aimZ = 1;
  ensureBoard(ctx, boss);
}

export function init(ctx) {
  ensureFlags(ctx);
  if (!ctx.boss) ctx.boss = makeBoss(ctx);
  if (ctx.boss && !ctx.boss.mecha) ctx.boss.mecha = createMecha(ctx.scene);
  if (!init._wired) {
    init._wired = true;
    ctx.bus.on(EVENTS.HIT, (event) => {
      const boss = ctx.boss;
      if (!boss || !event || event.dst !== boss) return;
      if (event.applied > 0) boss.hurtT = Math.max(boss.hurtT || 0, 0.16);
    });
    ctx.bus.on(EVENTS.ENDING_TRIGGER, () => interrupt(ctx, ctx.boss));
    ctx.bus.on(EVENTS.PLAYER_DEATH, () => interrupt(ctx, ctx.boss));
  }
}

export function reset(ctx) {
  ensureFlags(ctx);
  clearSilence(ctx);
  if (!ctx.boss) {
    ctx.boss = makeBoss(ctx);
    return;
  }
  const boss = ctx.boss;
  interrupt(ctx, boss);
  boss.hp = boss.maxHp;
  boss.alive = true;
  boss.lockHpAt25 = false;
  boss._ended = false;
  boss.invulnerable = false;
  boss.phaseInvuln = 0;
  boss.position.set(0, 0, 0);
  boss.attackId = null;
  boss.lastAttack = null;
  boss.sameCount = 0;
  boss.target = null;
  boss.pending = 0;
  boss.recover = 0;
  boss.tempo = OPENING_DELAY;
  boss.rooted = false;
  boss.p3Clock = 0;
  boss.smiteCasts = 0;
  boss.nextSmite = JUDGMENT_FIRST;
  boss.dashT = 0;
  boss.dashCd = 0;
  boss.jitter = 0;
  restyle(ctx, boss);
  ctx.distill = 0;
}

export function present(ctx) {
  const boss = ctx.boss;
  const cinematic = ctx.state.current === 'theater' || ctx.state.current === 'credits';
  if (boss?.mecha) {
    const rig = boss.mecha;
    if (cinematic) {
      rig.root.visible = false;
      rig.ground.visible = false;
      if (rig.dust?.points) rig.dust.points.visible = false;
    } else {
      rig.root.visible = true;
      presentMecha(boss);
    }
  }
  presentSpeech(ctx);
}

export function update(ctx, dt) {
  const boss = ctx.boss;
  if (!boss) return;
  const wasInvuln = boss.phaseInvuln > 0;
  tickGrow(boss, dt);
  tickPhase(boss, dt);
  if (wasInvuln && boss.phaseInvuln <= 0 && !boss._ended) {
    boss.pose = 'idle';
    boss.rooted = false;
    boss.tempo = Math.max(boss.tempo || 0, 0.4);
  }
  tickAttacks(ctx, boss, dt);
  animateMecha(boss, dt);
}

export { ENDING_B_RATIO };
