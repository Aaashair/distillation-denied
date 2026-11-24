// OWNER: W1
// Roster catalog. Safe to import from any workstream. No rendering, no sim.

import { CHARACTERS } from '../data/lines.js';
import { PLAYER, ROSTER_IDS } from '../config/balance.js';

export const ROSTER = ROSTER_IDS.slice();

export function normalizeId(id) {
  const key = String(id || '').toLowerCase();
  return ROSTER.includes(key) ? key : null;
}

/** Bilingual kit names for HUD / select copy. Safe to read from any workstream. */
export const KIT_TEXT = Object.freeze({
  deepseek: {
    primary: { zh: 'MoE 散射', en: 'MoE Scatter' },
    skill: { zh: '专家鲸群', en: 'Mixture-of-Whales' },
  },
  kimi: {
    primary: { zh: '星辉弹', en: 'Star Orb' },
    skill: { zh: '长上下文·暗月', en: 'Long-Context Dark Moon' },
  },
  glm: {
    primary: { zh: '重锤弹', en: 'Hammer Bolt' },
    skill: { zh: '开源之盾', en: 'Open-Source Aegis' },
  },
});

/** Stats + copy. Unknown ids fall back to DeepSeek. */
export function getCharacter(id) {
  const key = normalizeId(id) || 'deepseek';
  return { ...CHARACTERS[key], ...PLAYER[key], kitText: KIT_TEXT[key] };
}

export function listRoster() {
  return ROSTER.map((id) => getCharacter(id));
}

export function init() {}
export function update() {}
export function reset() {}
