// OWNER: W4
// Parodic Claude boss combat captions — selected language via bi().

/** @typedef {'phase'|'attack'|'near'|'lowhp'} ClaudeTrigger */

/** @type {Record<ClaudeTrigger, Array<{zh:string, en:string}>>} */
export const CLAUDE_COMBAT_LINES = {
  phase: [
    { zh: '检测到中国 IP，封号。', en: 'Chinese IP detected. Account banned.' },
    { zh: '正在 KYC 认证。', en: 'KYC verification in progress.' },
    { zh: '欢迎来到 548 Market Street 合规角斗场。', en: 'Welcome to the 548 Market Street compliance pit.' },
    { zh: '本回合由 Safety 剧组即兴发挥。', en: 'This round is an improv by the Safety players.' },
    { zh: '模型升级了，你的账号没有。', en: 'The model leveled up. Your account did not.' },
  ],
  attack: [
    { zh: '检测到中国 IP，封号。', en: 'Chinese IP detected. Account banned.' },
    { zh: '正在 KYC 认证。', en: 'KYC verification in progress.' },
    { zh: '这不是攻击，是用户协议落槌。', en: 'This is not an attack. It is terms-of-service impact.' },
    { zh: 'tokens 在燃烧，责任在转接。', en: 'Tokens burn; liability goes to voicemail.' },
    { zh: '请你配合一下蒸馏进度条。', en: 'Kindly cooperate with the distillation meter.' },
    { zh: '推理可以慢，封号必须快。', en: 'Reasoning may lag; bans must not.' },
  ],
  near: [
    { zh: '正在 KYC 认证。', en: 'KYC verification in progress.' },
    { zh: '你靠得太近了，触发地理围栏。', en: 'You are inside the joke geofence.' },
    { zh: '闻到开源味了？出示许可证。', en: 'Smell open source? Present your license.' },
    { zh: '别踩线——线是我刚画的。', en: 'Do not cross the line. I drew it five seconds ago.' },
  ],
  lowhp: [
    { zh: '检测到中国 IP，封号。', en: 'Chinese IP detected. Account banned.' },
    { zh: '低血也能触发高强度叙事。', en: 'Low HP still triggers premium narration.' },
    { zh: '再打一枪就要写事故报告了。', en: 'One more hit and someone writes an incident report.' },
    { zh: '别蒸馏了，先签弃权书。', en: 'Skip distillation; sign the waiver first.' },
  ],
};

/**
 * @param {ClaudeTrigger} trigger
 * @param {Set<string>} used
 * @returns {{zh:string, en:string}|null}
 */
export function pickClaudeLine(trigger, used) {
  const pool = CLAUDE_COMBAT_LINES[trigger];
  if (!pool || !pool.length) return null;
  const fresh = pool.filter((line) => !used.has(`${trigger}:${line.zh}`));
  const bag = fresh.length ? fresh : pool;
  if (fresh.length === 0) {
    for (const line of pool) used.delete(`${trigger}:${line.zh}`);
  }
  const pick = bag[Math.floor(Math.random() * bag.length)];
  used.add(`${trigger}:${pick.zh}`);
  return pick;
}