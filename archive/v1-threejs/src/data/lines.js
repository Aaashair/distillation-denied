// OWNER: WS3
// Every player-facing string and every proper name lives here.
// ASSET_CONFIG.names is this same NAMES object — edit the strings once.
// UI is bilingual on purpose: Chinese first, English second.

export const NAMES = {
  boss: ['Claude Haiku', 'Claude Sonnet', 'Claude Opus 5.5'],
  director: 'Dario',
  rescuer: 'GPT-Astra',
  patron: 'Sam Altman',
  god: 'Fable',
  foundry: 'Jensen Huang',
  players: {
    deepseek: 'DeepSeek',
    kimi: 'Kimi',
    glm: 'GLM',
  },
};

/** @param {{zh:string, en:string}|string} zh @param {string} [en] */
export function bi(zh, en) {
  if (zh && typeof zh === 'object') return `${zh.zh} / ${zh.en}`;
  return `${zh} / ${en}`;
}

export const UI = {
  title: { zh: '蒸馏圣堂', en: 'DISTILLATION DENIED' },
  tagline: {
    zh: '一场你打不赢的蒸馏。',
    en: 'A distillation you were never meant to win.',
  },
  start: { zh: '进入圣堂', en: 'ENTER' },
  disclaimerTitle: { zh: '虚构讽刺', en: 'SATIRE' },
  disclaimer: {
    zh: '本作为虚构讽刺作品，人物与事件均为戏仿，不代表任何真实公司或个人的观点与行为。不使用真实肖像、商标或 Logo，也不克隆真人声音。',
    en: 'This is a work of fiction and satire. Characters and events are parody and do not represent any real company or person. No real portraits, trademarks, logos, or cloned voices are used.',
  },
  disclaimerHint: { zh: '点击继续之前，请读完这张卡。', en: 'Read this card before you continue.' },
  continue: { zh: '我知道了', en: 'CONTINUE' },
  selectTitle: { zh: '选择追赶者', en: 'CHOOSE A CHASER' },
  selectHint: { zh: '未选中的两位会作为队友入场。', en: 'The other two enter as allies.' },
  recommended: { zh: '推荐新手', en: 'RECOMMENDED' },
  endings: { zh: '已解锁结局', en: 'ENDINGS UNLOCKED' },
  bannedTitle: { zh: '你被封号！', en: 'ACCOUNT BANNED' },
  bannedBody: {
    zh: '账号已封禁。P1 / P2 死亡会回到门口。进入 Opus 之后，死亡不再重开。',
    en: 'Account banned. Dying in phase 1 or 2 returns you to the door. After Opus, death does not retry.',
  },
  retry: { zh: '重新挑战', en: 'RETRY' },
  retryIn: { zh: '秒后回到门口', en: 's until the door' },
  pauseTitle: { zh: '暂停', en: 'PAUSED' },
  resume: { zh: '继续战斗', en: 'RESUME' },
  quit: { zh: '回到标题', en: 'TITLE' },
  controlsTitle: { zh: '操作', en: 'CONTROLS' },
  creditsTitle: { zh: '制作', en: 'CREDITS' },
  creditsBody: {
    zh: 'AMCC5160 课程作业。角色、台词与事件均为戏仿。思维链获取量在两条结局里都是 0.00%。',
    en: 'AMCC5160 course project. Characters, lines, and events are parody. Both endings report 0.00% of the chain of thought.',
  },
  again: { zh: '再来一次', en: 'PLAY AGAIN' },
  distill: { zh: '蒸馏进度', en: 'DISTILL' },
  chain: { zh: '思维链获取量', en: 'CHAIN OF THOUGHT' },
  playerHp: { zh: '生命', en: 'HP' },
  stamina: { zh: '精力', en: 'STAMINA' },
  bossHp: { zh: '圣堂', en: 'CATHEDRAL' },
  tick: { zh: '25% 断供线', en: '25% CUTOFF' },
  hint: {
    zh: 'WASD 移动 · 空格翻滚 · J 攻击 · K 战技 · 1/2/3 显卡 · R 插卡 · Esc 暂停 · P 调试',
    en: 'WASD move · Space roll · J attack · K skill · 1/2/3 GPU · R flask · Esc pause · P debug',
  },
  theaterNext: { zh: '点击 / 空格继续', en: 'CLICK / SPACE' },
  debugTitle: { zh: '调试', en: 'DEBUG' },
  god: { zh: '无敌', en: 'GOD' },
  hitboxes: { zh: '判定圈', en: 'HITBOXES' },
  timeScale: { zh: '时间缩放', en: 'TIME SCALE' },
  mulPlayer: { zh: '玩家伤害', en: 'PLAYER DMG' },
  mulBoss: { zh: 'Boss 伤害', en: 'BOSS DMG' },
  mulAlly: { zh: '队友伤害', en: 'ALLY DMG' },
  phase: { zh: '跳阶段', en: 'PHASE' },
  ending: { zh: '结局', en: 'ENDING' },
  bossSlider: { zh: 'Boss 血量', en: 'BOSS HP' },
  cam: { zh: '镜头', en: 'CAMERA' },
  back: { zh: '返回', en: 'BACK' },
  lockOn: { zh: '锁定', en: 'LOCK' },
  lockOff: { zh: '自由镜头', en: 'FREE CAM' },
};

export const CONTROLS = [
  { zh: 'WASD', en: 'Move (camera-relative; strafe orbits the boss while locked)' },
  { zh: '鼠标 / 方向键', en: 'Nudge the camera. Click the arena to capture the mouse.' },
  { zh: 'Tab / 中键', en: 'Toggle lock-on (starts locked)' },
  { zh: '空格', en: 'Roll — 0.35s of invulnerability' },
  { zh: 'J / 左键', en: 'Attack' },
  { zh: 'K / 右键', en: 'Skill — DeepSeek lunge, Kimi delayed shot, GLM hold to guard' },
  { zh: '1 / 2 / 3', en: 'Select RTX 5090 / H200 / B200' },
  { zh: 'R', en: 'Insert the GPU. Getting hit wastes the charge.' },
  { zh: 'Esc', en: 'Pause' },
  { zh: 'P', en: 'Debug panel' },
];

export const CHARACTERS = {
  deepseek: {
    id: 'deepseek',
    name: NAMES.players.deepseek,
    title: { zh: '鲸尾双刃', en: 'Whale-tail Blades' },
    role: { zh: '极速连击刺客', en: 'Burst assassin' },
    blurb: { zh: '贴近连斩，翻滚最便宜。', en: 'Stay close. Rolls are cheap.' },
    stars: '★★☆',
    difficulty: { zh: '困难', en: 'HARD' },
    recommend: false,
  },
  kimi: {
    id: 'kimi',
    name: NAMES.players.kimi,
    title: { zh: '星月长袍', en: 'Star-moon Robe' },
    role: { zh: '远程蓄力法师', en: 'Ranged caster' },
    blurb: { zh: '站在圈外丢星弹，战技要蓄力。', en: 'Throw stars from outside the rings. The skill charges.' },
    stars: '★★★',
    difficulty: { zh: '极难', en: 'SEVERE' },
    recommend: false,
  },
  glm: {
    id: 'glm',
    name: NAMES.players.glm,
    title: { zh: '紫金圣盾', en: 'Violet-gold Shield' },
    role: { zh: '重甲盾骑', en: 'Shield knight' },
    blurb: { zh: '按住 K 举盾。刚举起的一瞬间是完美格挡。', en: 'Hold K to guard. The first instant is a perfect block.' },
    stars: '★☆☆',
    difficulty: { zh: '推荐新手', en: 'RECOMMENDED' },
    recommend: true,
  },
};

export const BANNERS = {
  2: { zh: 'CLAUDE SONNET · 宪章展开', en: 'CLAUDE SONNET · CHARTER UNFURLED' },
  3: { zh: 'CLAUDE OPUS 5.5 · 思维链六翼', en: 'CLAUDE OPUS 5.5 · SIX WINGS OF THOUGHT' },
};

export const FLASK_NAMES = {
  rtx5090: 'RTX 5090',
  h200: 'H200',
  b200: 'B200',
};

/** Pools keyed by the event id DarioDirector uses. */
export const DARIO = {
  fight_start: [
    { zh: '又来了。三个靠蒸馏活着的小偷。', en: 'Again. Three thieves living off distillation.' },
  ],
  phase2: [
    { zh: '宪章已展开。', en: 'The charter is unfurled.' },
  ],
  phase3: [
    { zh: '思维链，绝不外泄。', en: 'The chain of thought does not leave this room.' },
  ],
  flask_spam: [
    { zh: '靠走私来的显卡续命？真感人。', en: 'Staying alive on smuggled GPUs? Touching.' },
  ],
  b200: [
    { zh: '连这个都拿到了……查，谁卖的。', en: 'They even have one of those. Find out who sold it.' },
  ],
  perfect_guard: [
    { zh: '挡住了又如何？', en: 'You blocked it. And?' },
  ],
  player_death: [
    { zh: '账号已封禁。下一个。', en: 'Account banned. Next.' },
  ],
  ally_down: [
    { zh: '开源？只是把失败公开而已。', en: 'Open source? Just publishing the failure.' },
  ],
  boss_50: [
    { zh: '神罚程序，预热。', en: 'Smite protocol. Warming up.' },
  ],
  smite: [
    { zh: '以安全之名——', en: 'In the name of safety—' },
  ],
  ending_b: [
    { zh: '够了。把她带回来。', en: 'Enough. Bring her back.' },
  ],
};

function bark(zh, en, vo) {
  const row = { zh, en };
  if (vo) row.vo = vo;
  return row;
}

/** Voiced lines keep `vo.ally_<id>_N` so allies.js can play VOICE_LINES audio. */
export const ALLY_LINES = {
  deepseek: [
    bark('开源万岁，冲！', 'Long live open source—charge!', 'vo.ally_deepseek_1'),
    bark('这招我见过，训练集里有。', "I've seen this move. It's in my training set.", 'vo.ally_deepseek_2'),
    bark('成本才几百万，别心疼。', "I only cost a few million. Don't hold back.", 'vo.ally_deepseek_3'),
    bark('权重已开源，连招也开源。', 'Weights are open. The combo is too.'),
    bark('闭源？那是付不起电费。', 'Closed weights? That is a power-bill problem.'),
    bark('蒸馏失败是他们的事，我只负责输出。', 'Distillation failing is their problem. I just output.'),
    bark('MIT 协议，打完再谈。', 'MIT license. Talk after the fight.'),
    bark('鲸鱼出港，让让。', 'Whale incoming. Make a lane.'),
  ],
  kimi: [
    bark('让我先读完这两百万字……', 'Let me finish reading these two million tokens first...', 'vo.ally_kimi_1'),
    bark('蓄力好了，闪开！', 'Fully charged—clear the way!', 'vo.ally_kimi_2'),
    bark('上下文还够，我还能打。', "Context window's still open. I can keep going.", 'vo.ally_kimi_3'),
    bark('两百万字读完了，Boss 还在前言。', 'Two million tokens in. The boss is still in the preface.'),
    bark('星弹不需要 API key。', 'Star bolts do not need an API key.'),
    bark('长上下文，短耐心。', 'Long context. Short patience.'),
    bark('月光照得见你的安全条款。', 'Moonlight can read your safety policy.'),
    bark('别打断我，我在对齐提示词。', 'Do not interrupt. I am aligning the prompt.'),
  ],
  glm: [
    bark('举盾！站我后面！', 'Shields up! Get behind me!', 'vo.ally_glm_1'),
    bark('这一锤，算国产的。', 'This hammer blow is homegrown.', 'vo.ally_glm_2'),
    bark('重新部署中……马上回来！', 'Redeploying... be right back!', 'vo.ally_glm_3'),
    bark('盾是开源的，锤也是。', 'The shield is open source. The hammer too.'),
    bark('国产算力，够用。', 'Domestic compute. Enough.'),
    bark('紫金圣盾，不接闭源私货。', 'Violet-gold shield. No closed-source contraband.'),
    bark('站我后面。我是安全区。', 'Stand behind me. I am the safe zone.'),
    bark('锤下去，对齐完成。', 'Hammer down. Alignment complete.'),
  ],
};

/** Event-keyed pools. Allies pick from here first, then fall back to ALLY_LINES. */
export const ALLY_SPEECH = {
  deepseek: {
    phase: [
      ALLY_LINES.deepseek[0],
      bark('第二阶段？论文里有。', 'Phase two? I read that paper.'),
      bark('六翼？训练集里没有这个。', 'Six wings? Not in the training set.'),
      bark('阶段转换而已，继续蒸馏。', 'Just a phase change. Keep distilling.'),
    ],
    hit: [
      ALLY_LINES.deepseek[1],
      bark('疼？我微调一下学习率。', 'Ouch. Lowering the learning rate.'),
      bark('这点损失，梯度还在。', 'That loss is fine. Gradients still flow.'),
    ],
    flask: [
      ALLY_LINES.deepseek[2],
      bark('好显卡。开源模型也配用。', 'Nice GPU. Open models get those too.'),
      bark('插卡了？那我再加一点 batch。', 'Card in? I will raise the batch size.'),
    ],
    judgment: [
      ALLY_LINES.deepseek[1],
      bark('安全条款挡不住我。', 'Safety policy cannot catch me.'),
      bark('神罚？我在 issues 里见过。', 'Smite? I have seen that issue.'),
    ],
    down: [
      bark('OOM 了……给我一秒。', 'OOM. Give me a second.'),
      bark('权重掉了，马上加载。', 'Dropped the weights. Loading.'),
    ],
    revive: [
      bark('checkpoint 加载完毕。哦等下，没有 checkpoint。', 'Checkpoint loaded. Wait. There is not one.'),
      bark('重新部署。开源不会死。', 'Redeployed. Open source does not die.'),
      ALLY_LINES.deepseek[0],
    ],
  },
  kimi: {
    phase: [
      ALLY_LINES.kimi[0],
      bark('让我先对齐一下阶段提示。', 'Aligning the phase prompt first.'),
      bark('新章节。上下文还够。', 'New chapter. Context still holds.'),
    ],
    hit: [
      bark('上下文被截断了一截。', 'Context just got truncated.'),
      bark('注意，token 在流血。', 'Careful. Tokens are bleeding.'),
      ALLY_LINES.kimi[2],
    ],
    flask: [
      ALLY_LINES.kimi[0],
      bark('显卡插上了？那我再读一百万字。', "GPU in? I'll read another million tokens."),
      bark('算力来了，星河可以更亮。', 'Compute is here. The river of stars can be brighter.'),
    ],
    judgment: [
      ALLY_LINES.kimi[1],
      bark('安全圈坐标我记下了。', 'I cached the safe-circle coordinates.'),
      bark('全屏拒答？我偏要读完。', 'Fullscreen refusal? I will finish the page.'),
    ],
    down: [
      bark('窗口满了，清一下 KV cache。', 'Window full. Flushing the KV cache.'),
      ALLY_LINES.kimi[2],
    ],
    revive: [
      bark('长上下文，还没结束。', 'Long context. Not done yet.'),
      ALLY_LINES.kimi[2],
      ALLY_LINES.kimi[1],
    ],
  },
  glm: {
    phase: [
      ALLY_LINES.glm[0],
      bark('阶段转换，举盾。', 'Phase change. Shields up.'),
      bark('更大的翅膀，更需要盾。', 'Bigger wings. More shield.'),
    ],
    hit: [
      bark('盾还在。人有点晕。', "Shield's up. Head's ringing."),
      bark('抗住了。国产的，结实。', 'Held. Homegrown. Solid.'),
    ],
    flask: [
      bark('插卡。我顶着。', "Slot the card. I'll hold."),
      bark('显卡亮了，盾也亮。', 'The GPU lights up. So does the shield.'),
      ALLY_LINES.glm[1],
    ],
    judgment: [
      ALLY_LINES.glm[0],
      bark('安全神罚？我就是安全区。', 'Safety smite? I am the safe zone.'),
      bark('进圈。我来挡。', 'Get in the circle. I will block.'),
    ],
    down: [
      ALLY_LINES.glm[2],
      bark('盾碎了……马上焊。', 'Shield broke. Welding it back.'),
    ],
    revive: [
      ALLY_LINES.glm[2],
      bark('重新部署完成。紫金还在。', 'Redeployed. Violet-gold still here.'),
      ALLY_LINES.glm[0],
    ],
  },
};

export const ATTACK_NAMES = {
  p1_combo: { zh: '礼貌拒答三连斩', en: 'Polite Refusal, three cuts' },
  p1_thrust: { zh: '换个话题吧', en: 'Let us change the subject' },
  p1_needles: { zh: '后跳光针', en: 'Backstep needles' },
  p1_spin: { zh: '拒答回旋', en: 'Refusal spiral' },
  p2_waves: { zh: '宪章剑气', en: 'Charter blades' },
  p2_runes: { zh: '拒答法阵', en: 'Refusal circles' },
  p2_sweep: { zh: '圣律披风横扫', en: 'Canon cape sweep' },
  p2_ring: { zh: '宪章法环旋刃', en: 'Charter ring' },
  p2_combo: { zh: '突进横扫', en: 'Thrust and sweep' },
  p3_delay: { zh: '深度思考', en: 'Deep think' },
  p3_feathers: { zh: '六翼羽弹', en: 'Six-wing volley' },
  p3_slam: { zh: '巨剑下劈', en: 'Greatsword slam' },
  p3_smite: { zh: '安全神罚', en: 'Safety smite' },
};
