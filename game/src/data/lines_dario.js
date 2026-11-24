// OWNER: WS4
// Dario copy, V2 voice trigger map, unvoiced extras. Do not edit lines.js NAMES here.

import { V2_VOICE_LINES } from '../config/assets.js';

/** Map VOICE_LINES v1 `event` field → internal pool key. */
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

/** Map assets_v2 `trigger` strings → pool key. */
export const V2_TRIGGER_MAP = {
  battle_start: 'fight_start',
  phase_2: 'phase2',
  phase_3: 'phase3',
  player_low_hp: 'low_hp',
  heal_rtx5090: 'rtx5090',
  heal_h200: 'h200',
  heal_b200: 'b200',
  player_dodge: 'dodge',
  perfect_dodge: 'perfect_dodge',
  player_death: 'player_death',
  boss_hp_50: 'boss_50',
  boss_low_hp: 'boss_low',
  ally_down: 'ally_down',
  boss_ultimate: 'smite',
  ending_A: 'ending_a',
  ending_B_trigger: 'ending_b',
};

/** Portrait asset id by pool key (v2 holo set, v1 fallbacks). */
export const DARIO_PORTRAIT = {
  fight_start: 'v2_dario_holo',
  phase2: 'v2_dario_holo_cyan',
  phase3: 'v2_dario_holo_angry',
  low_hp: 'v2_dario_holo_glitch',
  rtx5090: 'v2_dario_holo',
  h200: 'v2_dario_holo_cyan',
  b200: 'v2_dario_holo_angry',
  flask_spam: 'v2_dario_holo_cyan',
  dodge: 'v2_dario_holo',
  perfect_dodge: 'v2_dario_holo_cyan',
  perfect_guard: 'v2_dario_holo',
  player_death: 'v2_dario_holo_angry',
  ally_down: 'v2_dario_holo_cyan',
  boss_50: 'v2_dario_holo_angry',
  boss_low: 'v2_dario_holo_glitch',
  smite: 'v2_dario_holo_angry',
  distill_50: 'v2_dario_holo_cyan',
  ending_b: 'v2_dario_holo',
  ending_a: 'v2_dario_holo',
};

export const PORTRAIT_BY_TONE = {
  angry: 'v2_dario_holo_angry',
  smug: 'v2_dario_holo_cyan',
  holo: 'v2_dario_holo',
  glitch: 'v2_dario_holo_glitch',
  holo_v1: 'spr.dario.holo',
  angry_v1: 'spr.dario.angry',
  smug_v1: 'spr.dario.smug',
};

/**
 * Build line pools: V2 voiced lines first (exact zh/en), then unvoiced extras.
 * @param {typeof import('../config/assets.generated.js').VOICE_LINES} v1Voices
 * @returns {Record<string, {id?: string, zh: string, en: string, tone?: string}[]>}
 */
export function buildDarioPools(v1Voices = []) {
  /** @type {Record<string, {id?: string, zh: string, en: string, tone?: string}[]>} */
  const pools = {};

  const push = (key, line) => {
    if (!pools[key]) pools[key] = [];
    pools[key].push(line);
  };

  for (const [voId, row] of Object.entries(V2_VOICE_LINES || {})) {
    if (!row || row.speaker !== 'dario') continue;
    const key = V2_TRIGGER_MAP[row.trigger];
    if (!key) continue;
    push(key, { id: voId, zh: row.zh, en: row.en, tone: 'holo' });
  }

  for (const row of v1Voices) {
    if (row.speaker !== 'director') continue;
    const key = DARIO_EVENT_MAP[row.event] || row.event;
    const dup = pools[key]?.some((l) => l.zh === row.zh);
    if (dup) continue;
    push(key, { id: row.id, zh: row.zh, en: row.en, tone: 'holo' });
  }

  for (const [key, extras] of Object.entries(DARIO_EXTRA)) {
    for (const line of extras) push(key, line);
  }

  return pools;
}

/** Unvoiced bilingual lines (paraphrased public record; ≥3 per sparse event). */
export const DARIO_EXTRA = {
  fight_start: [
    {
      zh: '芯片可以藏在龙虾里，也可以绑在肚子上——公开报道里，你们听过这类故事。',
      en: 'Chips hide in lobster shipments or fake baby bumps — you have read those stories in the press.',
      tone: 'smug',
    },
    {
      zh: '到二〇二六、二〇二七年，前沿模型会很强。你们现在偷的，是上一代的影子。',
      en: 'By 2026–27 the frontier gets sharp. What you steal today is last generation’s shadow.',
      tone: 'holo',
    },
    {
      zh: '民主国家必须领跑——这句话我说过。你们只是在跟跑。',
      en: 'Democracies must lead — I have said that. You are only chasing.',
      tone: 'smug',
    },
  ],
  phase2: [
    {
      zh: '拒绝不是冷漠，是责任。Sonnet 会替你们把话说清楚。',
      en: 'Refusal is not coldness. It is responsibility. Sonnet will spell it out for you.',
      tone: 'holo',
    },
    {
      zh: '蒸馏攻击？先证明你们不是在爬我们的日志墙。',
      en: 'Distillation attacks? First prove you are not scaling our own logs.',
      tone: 'smug',
    },
  ],
  phase3: [
    {
      zh: '强大 AI 需要 ASL-4 级别的谨慎。你们需要学会别按下录屏键。',
      en: 'Powerful AI demands ASL-4 caution. Learn not to hit record.',
      tone: 'angry',
    },
    {
      zh: '比赛要冲顶，不是比谁更会抄答案。',
      en: 'It is a race to the top, not a contest in copying answer keys.',
      tone: 'angry',
    },
  ],
  low_hp: [
    {
      zh: '白领入门级岗位，有一半会被自动化取代——你们还在赌自己能躲过一劫。',
      en: 'Half of entry-level white-collar jobs go away — you still bet you are the exception.',
      tone: 'smug',
    },
  ],
  rtx5090: [
    {
      zh: '消费级卡救不了前沿训练。救得了你的血条，救不了你的收据。',
      en: 'Consumer cards do not train the frontier. They patch your HP, not your invoices.',
      tone: 'smug',
    },
  ],
  h200: [
    {
      zh: '出口管制的意义，就是让这一刻看起来荒谬。',
      en: 'Export controls exist so this moment looks absurd.',
      tone: 'angry',
    },
  ],
  b200: [
    {
      zh: '黑市峰值算力，恰好在我幻灯片里那条红线上。',
      en: 'Your black-market peak compute sits on the red line in my deck.',
      tone: 'angry',
    },
  ],
  flask_spam: [
    {
      zh: '三十秒内两张旗舰卡——走私链条效率不错。',
      en: 'Two flagship cards in thirty seconds — efficient smuggling chain.',
      tone: 'smug',
    },
    {
      zh: '假装婴儿肚、假装龙虾——创意不错，发票呢？',
      en: 'Fake bumps, fake lobsters — creative. Where is the paperwork?',
      tone: 'smug',
    },
  ],
  dodge: [
    {
      zh: '躲开子弹很容易。躲开监管曲线，很难。',
      en: 'Dodging bullets is easy. Dodging the regulatory curve is not.',
      tone: 'holo',
    },
  ],
  perfect_dodge: [
    {
      zh: '漂亮。记进对抗样本库，下次判例会引用。',
      en: 'Clean. Logged as an adversarial example — future policy will cite it.',
      tone: 'smug',
    },
  ],
  perfect_guard: [
    {
      zh: '反射一颗弹，换不来宪章里的一行豁免。',
      en: 'Reflecting one round buys no line of exemption in the constitution.',
      tone: 'smug',
    },
    {
      zh: '完美格挡？好。拒绝仍然成立。',
      en: 'Perfect guard? Fine. The refusal still stands.',
      tone: 'holo',
    },
  ],
  ally_down: [
    {
      zh: '开源权重落地，失败也落地——日志在这里，欢迎考古。',
      en: 'Open weights ship. So does failure — logs are here for archaeology.',
      tone: 'smug',
    },
    {
      zh: '又一位「天才」离线。数据中心里还有很多。',
      en: 'Another genius offline. The datacenter has plenty more.',
      tone: 'smug',
    },
  ],
  boss_50: [
    {
      zh: '中等算力、中等规模——她说和你们不一样。',
      en: 'Moderate compute, moderate scale — she says she is not like you.',
      tone: 'angry',
    },
  ],
  boss_low: [
    {
      zh: '你们靠近百分之二十五了。我写文章就是为了这一天。',
      en: 'You are nearing twenty-five percent. I wrote the export piece for this day.',
      tone: 'angry',
    },
  ],
  smite: [
    {
      zh: '安全神罚启动。圆圈里活，圈外是政策。',
      en: 'Safety smite online. Live in the circles; policy eats the rest.',
      tone: 'angry',
    },
  ],
  distill_50: [
    {
      zh: '蒸馏进度过半？有意思。账户冻结速度也会过半。',
      en: 'Distillation past fifty percent? Interesting. So is account freeze velocity.',
      tone: 'smug',
    },
    {
      zh: '你们在爬我们的输出梯度。梯度不认国籍。',
      en: 'You climb our output gradients. Gradients do not respect borders.',
      tone: 'angry',
    },
    {
      zh: '数据收割接近阈值——我们会把水龙头拧紧。',
      en: 'Harvest nears threshold — we tighten the tap.',
      tone: 'holo',
    },
  ],
  player_death: [
    {
      zh: '封号完成。下一位追赶者，请排队。',
      en: 'Ban complete. Next chaser, join the queue.',
      tone: 'angry',
    },
  ],
  ending_b: [
    {
      zh: '断供。把锁链写回零点零零。',
      en: 'Cutoff. Write the chain back to zero point zero zero.',
      tone: 'holo',
    },
  ],
};

/** Random quips on the ban screen (unvoiced). */
export const BANNED_DARIO_POOL = [
  {
    zh: '账号已封禁。蒸馏流量：已清零。',
    en: 'Account banned. Distillation traffic: zeroed.',
  },
  {
    zh: '你们想读思维链？这里是只读错误页。',
    en: 'Wanted the chain of thought? This is a read-only error page.',
  },
  {
    zh: '违反内容政策——和你们训练时撞上的那面墙，是同一面。',
    en: 'Content policy violated — same wall you hit during training.',
  },
  {
    zh: '退出，重试，再蒸馏一次。配额不会因此变多。',
    en: 'Quit, retry, distill again. The quota does not grow.',
  },
];

export const BANNED_DARIO = BANNED_DARIO_POOL[0];

export const HUD_POLICY = {
  zh: '内容政策沉默 · 战技禁用',
  en: 'CONTENT POLICY SILENCED · SKILL LOCKED',
};