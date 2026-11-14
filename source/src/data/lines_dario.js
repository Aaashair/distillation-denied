// OWNER: WS4
// Dario copy and event mapping. Do not edit lines.js — extend here.

/** Map VOICE_LINES `event` field → internal DarioDirector pool key. */
export const DARIO_EVENT_MAP = {
  fight_start: 'fight_start',
  phase_change_2: 'phase2',
  phase_change_3: 'phase3',
  flask_spam: 'flask_spam',
  flask_b200: 'b200',
  perfect_guard: 'perfect_guard',
  player_death: 'player_death',
  ally_down: 'ally_down',
  boss_hp_50: 'boss_50',
  judgment_cast: 'smite',
  ending_B_trigger: 'ending_b',
};

/** Portrait asset id by pool key (fallback holo). */
export const DARIO_PORTRAIT = {
  fight_start: 'spr.dario.holo',
  phase2: 'spr.dario.holo',
  phase3: 'spr.dario.angry',
  flask_spam: 'spr.dario.smug',
  b200: 'spr.dario.smug',
  perfect_guard: 'spr.dario.holo',
  player_death: 'spr.dario.angry',
  ally_down: 'spr.dario.smug',
  boss_50: 'spr.dario.angry',
  smite: 'spr.dario.angry',
  ending_b: 'spr.dario.holo',
};

/** Text-only lines (no vo id) merged into pools. */
export const DARIO_EXTRA = {
  fight_start: [
    {
      zh: '配额有限。耐心也有限。',
      en: 'Quotas are finite. So is my patience.',
      tone: 'smug',
    },
  ],
  phase2: [
    { zh: '对齐小组已经就位。', en: 'The alignment squad is in position.', tone: 'smug' },
  ],
  phase3: [
    { zh: '别盯着那串思维链了，你看不懂。', en: 'Stop staring at the chain. You cannot read it.', tone: 'angry' },
  ],
  flask_spam: [
    { zh: '数据中心欠你们一张发票。', en: 'The datacenter owes you an invoice.', tone: 'smug' },
  ],
  perfect_guard: [
    { zh: '国产盾？呵。', en: 'A domestic shield? Cute.', tone: 'smug' },
  ],
  ally_down: [
    { zh: '又倒一个。算力池在漏水。', en: 'Another one down. The compute pool is leaking.', tone: 'smug' },
  ],
  boss_50: [
    { zh: '审批流程走完了。可以砸了。', en: 'Approvals cleared. You may break them.', tone: 'angry' },
  ],
};

export const BANNED_DARIO = {
  zh: '违反内容政策。永久封禁。',
  en: 'Content policy violated. Permanently banned.',
};

export const HUD_POLICY = {
  zh: '内容政策沉默 · 战技禁用',
  en: 'CONTENT POLICY SILENCED · SKILL LOCKED',
};
