// OWNER: INTEGRATOR
// The only place hp is subtracted. Healing, flasks, and the debug HP slider
// may write hp directly and then call boss.commit().

import { EVENTS, TEAMS } from './contracts.js';
import { ENDING_B_RATIO } from '../config/balance.js';

/** Wall-clock of the last small boss-hit juice burst. Scatter pellets must not freeze the sim. */
let lastSmallJuice = -1;

/**
 * @param {import('./contracts.js').GameContext} ctx
 * @param {import('./contracts.js').Actor|string|null|undefined} ref
 * @returns {import('./contracts.js').Actor|null}
 */
export function resolveActor(ctx, ref) {
  if (!ref) return null;
  if (typeof ref !== 'string') return ref;
  if (ref === 'player' || (ctx.player && ref === ctx.player.id)) return ctx.player || null;
  if (ref === 'boss' || (ctx.boss && ref === ctx.boss.id)) return ctx.boss || null;
  if (ref === 'stele') return ctx.stele || null;
  if (!ctx.allies) return null;
  return ctx.allies.find((a) => a.id === ref) || null;
}

function finiteMul(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 1;
  return n < 0 ? 0 : n;
}

/**
 * Apply damage from src to dst.
 * Order: attackId immunity → i-frames → truce → debug multiplier → god mode →
 * superarmor → hp subtract → boss commit (phase / 25% lock) → hit bus,
 * hit-stop, shake, flash, damage number.
 *
 * @param {import('./contracts.js').GameContext} ctx
 * @param {import('./contracts.js').Actor|string|null} src
 * @param {import('./contracts.js').Actor|string|null} dst
 * @param {number} dmg
 * @param {{
 *   heavy?: boolean,
 *   team?: string,
 *   ignoreInvuln?: boolean,
 *   ignoreGod?: boolean,
 *   noKnockback?: boolean,
 *   hitStopMs?: number,
 *   attackId?: string|number,
 *   knock?: number,
 *   shake?: number,
 *   flash?: string,
 *   immuneFor?: number,
 *   invulnFor?: number,
 *   allowEnding?: boolean,
 * }} [opts]
 * @returns {number} applied hp
 */
export function applyHit(ctx, src, dst, dmg, opts = {}) {
  const source = resolveActor(ctx, src);
  const target = resolveActor(ctx, dst);
  if (!target || target.alive === false) return 0;

  const now = ctx.time?.elapsed || 0;
  const unscaled = ctx.time?.unscaled || 0;
  if (!opts.ignoreInvuln && ctx.truceUntil && unscaled < ctx.truceUntil) return 0;

  const attackId = opts.attackId != null && opts.attackId !== '' ? String(opts.attackId) : '';
  if (attackId && !opts.ignoreInvuln) {
    const log = target.hurtLog || (target.hurtLog = {});
    if ((log[attackId] || 0) > now) return 0;
  }
  if (!opts.ignoreInvuln && target.invuln > 0) return 0;

  let amount = Number(dmg);
  if (!Number.isFinite(amount) || amount < 0) amount = 0;

  const team = source?.team || opts.team || null;
  const dbg = ctx.debug || {};
  if (team === TEAMS.PLAYER) amount *= finiteMul(dbg.playerDmgMul);
  else if (team === TEAMS.ALLY) amount *= finiteMul(dbg.allyDmgMul);
  else if (team === TEAMS.BOSS) amount *= finiteMul(dbg.bossDmgMul);

  // Allies may chip the boss down to just above the 25% ending. Only the player crosses it.
  if (team === TEAMS.ALLY && target.team === TEAMS.BOSS && target.maxHp > 0) {
    const keep = target.maxHp * ENDING_B_RATIO + 1;
    if (target.hp - amount < keep) amount = Math.max(0, target.hp - keep);
  }

  if (target.team === TEAMS.PLAYER && dbg.godMode && !opts.ignoreGod) return 0;
  if (target.superarmor > 0) {
    amount *= target.superarmorMul ?? 0.6;
    opts = { ...opts, noKnockback: true };
  }
  if (amount <= 0) return 0;

  if (target.team === TEAMS.BOSS && target.lockHpAt25) {
    const floor = target.maxHp * ENDING_B_RATIO;
    if (target.hp <= floor + 0.001) return 0;
  }

  const before = target.hp;
  target.hp = Math.max(0, before - amount);

  if (target.team === TEAMS.BOSS && typeof target.commit === 'function') {
    target.commit({ allowEnding: opts.allowEnding !== false });
  } else if (target.team === TEAMS.NEUTRAL) {
    target.hp = target.maxHp;
    target.alive = true;
  } else if (target.hp <= 0) {
    target.hp = 0;
    target.alive = false;
  }

  let applied = before - target.hp;
  if (target.team === TEAMS.BOSS) applied = Math.max(0, before - target.hp);
  if (target.team === TEAMS.NEUTRAL) applied = amount;

  if (attackId && applied > 0) {
    const log = target.hurtLog || (target.hurtLog = {});
    log[attackId] = now + (opts.immuneFor ?? 0.6);
  }

  ctx.bus?.emit(EVENTS.HIT, {
    src: source || src || null,
    dst: target,
    dmg: amount,
    applied,
    heavy: !!opts.heavy,
  });

  if (applied > 0) {
    const isFighter = target.team === TEAMS.PLAYER || target.team === TEAMS.ALLY;
    if (isFighter) {
      target.invuln = Math.max(target.invuln || 0, opts.invulnFor ?? 0.8);
      if (!opts.noKnockback && !(target.superarmor > 0)) {
        const sx = source && Number.isFinite(source.x) ? source.x : target.x;
        const sy = source && Number.isFinite(source.y) ? source.y : target.y - 1;
        const dx = target.x - sx;
        const dy = target.y - sy;
        const len = Math.hypot(dx, dy) || 1;
        const k = opts.knock ?? 6;
        target.x += (dx / len) * k;
        target.y += (dy / len) * k;
        ctx.world?.clamp?.(target);
      }
    } else if (opts.knock && source && Number.isFinite(source.x)) {
      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const len = Math.hypot(dx, dy) || 1;
      target.x += (dx / len) * opts.knock;
      target.y += (dy / len) * opts.knock;
      ctx.world?.clamp?.(target);
    }

    const tiny = !opts.heavy && target.team === TEAMS.BOSS && applied < 8;
    const nowU = ctx.time?.unscaled || 0;
    const juiceOk = !tiny || (nowU - lastSmallJuice) >= 0.12;
    target.flash = Math.max(target.flash || 0, tiny ? 0.04 : 0.08);
    let ms = opts.hitStopMs === 0 ? 0 : (opts.hitStopMs ?? (opts.heavy ? 70 : (target.team === TEAMS.PLAYER ? 60 : 40)));
    if (tiny) ms = juiceOk ? Math.min(ms, 16) : 0;
    if (ms > 0) {
      ctx.time?.requestHitStop(ms);
      ctx.bus?.emit(EVENTS.HIT_STOP, { ms });
    }
    if (juiceOk) {
      if (tiny) lastSmallJuice = nowU;
      const mag = opts.shake ?? (target.team === TEAMS.PLAYER ? 2 : (opts.heavy ? 3 : 1));
      ctx.bus?.emit(EVENTS.SHAKE, { mag, dur: 0.16 });
      ctx.bus?.emit(EVENTS.CAMERA_SHAKE, { intensity: mag / 24, duration: 0.16 });
      const flash = target.team === TEAMS.PLAYER ? 'rgba(194,59,59,0.45)' : (tiny ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.28)');
      ctx.bus?.emit(EVENTS.FLASH, { color: opts.flash || flash, dur: tiny ? 0.04 : 0.08 });
    }
    ctx.bus?.emit(EVENTS.VFX, {
      kind: 'num',
      x: target.x,
      y: target.y - 16,
      text: String(Math.max(1, Math.round(applied))),
      color: target.team === TEAMS.BOSS ? '#f4f1ea' : '#ffb4b4',
    });
    if (target.team === TEAMS.PLAYER) ctx.audio?.playSfx('sfx.hurt');
    else if (target.team === TEAMS.BOSS) ctx.audio?.playSfx(opts.heavy ? 'sfx.heavy' : 'sfx.hitBoss');

    if (typeof target.onHit === 'function') {
      target.onHit({
        dmg: amount,
        applied,
        heavy: !!opts.heavy,
        src: source || src || null,
        attackId,
      });
    }
    if (!target.alive && target.team === TEAMS.PLAYER) {
      ctx.bus.emit(EVENTS.PLAYER_DEATH, { phase: ctx.boss?.phase || 1, id: target.id });
    } else if (!target.alive && target.team === TEAMS.ALLY) {
      ctx.bus.emit(EVENTS.ALLY_DOWN, { id: target.id });
    }
  }

  return applied > 0 ? applied : 0;
}
