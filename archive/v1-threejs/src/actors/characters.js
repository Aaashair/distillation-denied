// OWNER: WS1
// Roster catalog. Safe for other workstreams to import. No Three.js, no scene writes.

import { CHARACTERS } from '../data/lines.js';
import { PLAYER, ROSTER_IDS } from '../config/balance_player.js';

export const ROSTER = ROSTER_IDS.slice();

/** Pose names that map to spr.<id>.back_<pose>. */
export const POSE_IDS = ['idle', 'run', 'attack', 'skill', 'roll', 'hurt', 'heal', 'down'];

export function normalizeId(id) {
  const key = String(id || '').toLowerCase();
  return ROSTER.includes(key) ? key : null;
}

/** Stats + copy for one chaser. `id` falls back to deepseek when unknown. */
export function getCharacter(id) {
  const key = normalizeId(id) || 'deepseek';
  return { ...CHARACTERS[key], ...PLAYER[key] };
}

export function listRoster() {
  return ROSTER.map((id) => getCharacter(id));
}

/** Billboard id for a chaser pose. Unknown poses fall back to back_idle. */
export function poseAssetId(charId, pose) {
  const id = normalizeId(charId);
  if (!id) return null;
  const name = POSE_IDS.includes(pose) ? pose : 'idle';
  return `spr.${id}.back_${name}`;
}

export function init() {}
export function update() {}
export function reset() {}
