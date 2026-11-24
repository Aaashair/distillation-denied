// OWNER: WS2
// Phase bands. boss.js is the only caller of tick(); update() stays a no-op
// so the timer is not drained twice. Size, banners, and the mecha unfold live
// on the boss — this file only answers "which phase" and drains invulnerability.

import { PHASE_P2_AT, PHASE_P3_AT } from '../config/balance_boss.js';

/** @param {number} ratio hp / maxHp. 1 at full. Crossing 0.70 enters phase 2, 0.40 enters phase 3. */
export function phaseForRatio(ratio) {
  if (ratio > PHASE_P2_AT) return 1;
  if (ratio > PHASE_P3_AT) return 2;
  return 3;
}

export function tick(boss, dt) {
  if (!boss || boss.phaseInvuln <= 0) return;
  boss.phaseInvuln -= dt;
  if (boss.phaseInvuln <= 0) {
    boss.phaseInvuln = 0;
    boss.invulnerable = false;
  }
}

export function init() {}
export function update() {}
export function reset() {}
