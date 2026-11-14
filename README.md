# 蒸馏圣堂 · DISTILLATION DENIED

**▶ 在线游玩 / Play in browser: https://aaashair.github.io/distillation-denied/**

AMCC5160 Assignment 3「Make Your Own Game」。单 Boss 魂系 3D 网页游戏（Three.js r170，本地内置，无 CDN），角色为 2.5D AI 立绘广告牌，中英双语，讽刺大模型行业竞争。
AMCC5160 Assignment 3. A single-boss soulslike 3D browser game (Three.js r170, vendored, no CDN) with 2.5D AI-art billboard characters, bilingual Chinese/English UI, satirizing the LLM industry race.

## 玩法 / Goal
选择一个追赶者模型（DeepSeek / Kimi / GLM），与另外两位 AI 队友一起挑战 Claude（Haiku → Sonnet → Opus 5.5），蒸馏她的思维链。P1/P2 阵亡会显示「你被封号」并重来；进入 P3 后只有两种结局：阵亡（结局 A「棋子」）或把她打到 25%（结局 B「断供」）。
Pick a chaser model and fight alongside the other two as AI allies against Claude (Haiku → Sonnet → Opus 5.5) to distill her Chain of Thought. Die in P1/P2 → "ACCOUNT BANNED", retry. In P3 there are only two endings: die (Ending A, "Pawn") or push her to 25% HP (Ending B, "Cut Off").

## 操作 / Controls
| 按键 Key | 动作 Action |
|---|---|
| WASD | 移动（绕锁定的 Boss 侧移）/ move (strafe around locked boss) |
| 鼠标 / 方向键 Mouse / Arrows | 微调镜头 / nudge camera |
| Tab | 锁定 / lock-on |
| Space | 翻滚（0.35 s 无敌帧）/ roll (0.35 s i-frames) |
| 左键 / J  LMB / J | 攻击 / attack |
| 右键 / K  RMB / K | 角色技能：DeepSeek 连斩 / Kimi 蓄力光束 / GLM 举盾（完美格挡）/ character skill: DeepSeek flurry / Kimi hold-charge beam / GLM hold shield (perfect guard) |
| 1 / 2 / 3 | 选择 GPU 药瓶 RTX 5090 / H200 / B200 / choose GPU flask |
| R | 插入 GPU 回血（0.5 s 硬直）/ insert GPU to heal (0.5 s stagger) |
| Esc | 暂停 / pause |
| **P** | **调试面板**：伤害倍率、跳转阶段、直接触发结局 A/B、无敌、时间缩放、镜头 / **debug panel**: damage multipliers, jump to phase, trigger Ending A/B, god mode, time scale, camera |

> 评分老师提示 / Note for graders: 按 **P** 打开调试面板，可直接跳到 P3 或触发两个结局。Press **P** to jump to any phase or trigger either ending directly.

建议使用桌面版 Chrome / Edge，开启声音。首次加载约 44 MB（含音乐与配音）。
Best on desktop Chrome/Edge with sound on. First load is ~44 MB (music + voice).

## 仓库结构 / Repo layout
- `main` 分支 / branch: `source/` 游戏源码 / game source (ES modules; `node source/tools/build.mjs` bundles with esbuild; Three.js r170 is vendored in the build), `payload/` = the built `dist/` as a base64-split tar.gz.
- `gh-pages` 分支 / branch（GitHub Pages 发布源 / what Pages serves）: `index.html` loader + `sw.js` + `game.js` + `css/` + `payload/`.
- 为什么用 base64 / Why base64: 本仓库通过只接受文本的 GitHub API 上传，图片和音频以 base64 分片存放；首次打开时页面下载并解包到浏览器缓存，Service Worker 再按原路径提供这些素材，之后再次打开会直接读缓存。The repo was uploaded through a text-only GitHub API, so images/audio ship as base64 parts. On first visit the loader downloads and unpacks them into Cache Storage, and a service worker serves them at their original paths, so later visits load from cache.

## 署名 / Credits
Code: Three.js r170, esbuild. Art, music, SFX and voice: AI-generated with OpenLux image / audio / voice models (prompts logged in the process report). Satire / parody; all names belong to their respective owners.
