# 蒸馏圣堂 · DISTILLATION DENIED — Pixel v2

▶ **在线游玩 / Play:** https://aaashair.github.io/distillation-denied/

AMCC5160 Assignment 3. **像素俯视角 Boss 战 / top-down pixel-art boss room**, Canvas2D 640×360 internal buffer, bilingual Chinese/English UI. No Three.js or WebGL in v2.

## 版本 / Release
- Build: `pixel-v2-4ba2c10-d8ab511a`. Source integration `11f1d1c`, final validation docs `4ba2c10` (local Cursor CLI workflow).
- v1 is preserved in Git history, remote branch **`v1-pages-archive`**, and local tag `v1-3d`. No remote branches were deleted.
- `gh-pages` is the serving branch. Its root loader points to immutable `releases/pixel-v2-4ba2c10-d8ab511a/` files and a version-specific service worker. SHA-256 is checked before unpacking. The worker uses only that build's cache, not the old v1 cache.
- Existing tabs: **refresh / 刷新页面** to get pixel v2. If a stale page persists, use Ctrl+Shift+R. First visit downloads roughly **52.4 MB / 50 MiB** including base64 assets; subsequent visits reuse the browser cache. Modern desktop Chrome/Edge recommended.
- No Actions workflow: GitHub Actions is unavailable on the account. Publishing uses sequential authorized GitHub connector text commits.

## 操作 / Controls
WASD 移动 / move · 方向键八方向射击 / arrows shoot (two keys diagonal) · 按住左键朝鼠标射击 / hold LMB to aim and shoot · Shift / E / RMB 角色技能 / character skill (DeepSeek flurry; Kimi hold-charge beam; GLM shield/perfect guard) · Space 翻滚 / roll · 1/2/3 选择 GPU 药瓶 / choose GPU flask · **Q 喝药 / heal** · Esc 暂停 / pause · **P 调试面板 / debug panel** · Enter 确认菜单，短暂锁定后可跳过过场 / confirm, skip cutscenes after short lock.

评分提示 / For graders: 按 **P** 可跳转 Boss 阶段、开启无敌、触发结局 A/B。Press **P** to jump phases, enable god mode or trigger either ending.

Hardcore: no checkpoints/story mode. Claude: Haiku → Sonnet → Opus 5.5. Die in P1/P2 → account banned/retry; die in P3 → Ending A; personally push Opus to 25% → Ending B. AI allies cannot cross the ending threshold themselves.

## 源码 / Source
`releases/pixel-v2-4ba2c10-d8ab511a/source-4ba2c10.tgz.b64` is the current text-uploaded source snapshot (57 files; no generated raw assets, secrets or logs). SHA-256 of decoded tar.gz: `91c5d5dbb1101c8de756777d9a47d02cfbff0a64902f4d7743e6ec5161f67023`.

```sh
mkdir pixel-v2-source
base64 --decode releases/pixel-v2-4ba2c10-d8ab511a/source-4ba2c10.tgz.b64 | tar -xz -C pixel-v2-source
```

The old `source/` and `payload/` directories on main are **v1 archives**, not the current game. Current assets/runtime are in `gh-pages/releases/pixel-v2-4ba2c10-d8ab511a/`. The archive there contains only shipped runtime assets, not high-resolution originals.

## Credits / 署名
Original AI art, voices, music and SFX made through OpenLux; game code developed with local Cursor CLI agents. Satire/parody; names belong to their owners. Human playtesting with two people remains an assignment requirement; automated tests are not human playtests.
