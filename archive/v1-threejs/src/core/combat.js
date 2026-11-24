// OWNER: INTEGRATOR
// Every damage source calls applyHit. Do not subtract hp anywhere else.
// Healing, flasks, and debug sliders may write hp directly and then go through the boss commit path.

import { EVENTS, TEAMS } from './contracts.js';

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
 * Order: debug multiplier → god mode → dst.takeDamage (guard, armor, i-frames, hp)
 * then EVENTS.hit, hit-stop, camera shake, and a billboard flash.
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
 *   noStun?: boolean,
 *   hitStopMs?: number,
 *   attackId?: string|number,
 * }} [opts]
 * @returns {number} applied hp
 */
export function applyHit(ctx, src, dst, dmg, opts = {}) {
  const source = resolveActor(ctx, src);
  const target = resolveActor(ctx, dst);
  if (!target || target.alive === false) return 0;
  if (typeof target.takeDamage !== 'function') return 0;

  let amount = Number(dmg);
  if (!Number.isFinite(amount) || amount < 0) amount = 0;

  const team = source?.team || opts.team || null;
  const dbg = ctx.debug || {};
  if (team === TEAMS.PLAYER) amount *= finiteMul(dbg.playerDmgMul);
  else if (team === TEAMS.ALLY) amount *= finiteMul(dbg.allyDmgMul);
  else if (team === TEAMS.BOSS) amount *= finiteMul(dbg.bossDmgMul);

  if (target.team === TEAMS.PLAYER && dbg.godMode && !opts.ignoreGod) amount = 0;

  const applied = target.takeDamage({
    dmg: amount,
    heavy: !!opts.heavy,
    src: source || src || null,
    ignoreInvuln: !!opts.ignoreInvuln,
    noKnockback: !!opts.noKnockback,
    noStun: !!opts.noStun,
    attackId: opts.attackId != null && opts.attackId !== '' ? opts.attackId : undefined,
  }) || 0;

  ctx.bus?.emit(EVENTS.HIT, {
    src: source || src || null,
    dst: target,
    dmg: amount,
    applied,
    heavy: !!opts.heavy,
  });

  if (applied > 0) {
    const ms = opts.hitStopMs === 0 ? 0 : (opts.hitStopMs ?? (opts.heavy ? 70 : 40));
    if (ms > 0) {
      ctx.time?.requestHitStop(ms);
      ctx.bus?.emit(EVENTS.HIT_STOP, { ms });
    }
    ctx.bus?.emit(EVENTS.CAMERA_SHAKE, {
      intensity: opts.heavy ? 0.25 : 0.08,
      duration: 0.2,
    });
    const board = target.billboard;
    if (board) board.flash = Math.max(board.flash || 0, 0.08);
  }

  return applied;
}
