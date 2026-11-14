# 蒸馏禁令 · DISTILLATION DENIED — v5.2

▶ **在线游玩 / Play:** https://aaashair.github.io/distillation-denied/

AMCC5160 Assignment3. Current source `8c73474`; build `pixel-v5-2-8c73474-ea7cc902`. Canvas2D pixel-art boss fight with illustrated ending CG. 中文/English choice persists; selected-language text only.

## V5.2: 技能就绪 / Skill Ready
- A compact diamond + player-attached **技能就绪 / Skill Ready** cue appears for **1.2 simulation seconds** only after a genuinely used skill cooldown completes; fixed readable14 CSS px. DeepSeek blue, GLM white, Kimi purple.
- Follows the controlled player; pause freezes its timer. Reuse, reset, death and CG/noncombat exits clear it. No extra audio, new media or gameplay-stat changes.

## Retained V5 + V5.1 corrections
- External left220px vertical HUD: labeled HP/skill/GPU, **Claude Combat / Claude战斗提示**, **Dario Comms / Dario全息通讯**, Controls and explicitly labeled Distillation progress. Readable14–16px DOM text, keyboard-scrollable lower controls, H full help. Viewports>=960×600 validated.
- Corrected gameplay/trial-room projection and trial-room size; **试炼石碑 / Trial Stele**. No home “unwinnable” tagline. One arena location and one boss/phase header; visible unclipped HP strip.
- Combat captions and ally bubbles clear on state exit and respect selected language. English suppresses Chinese Claude combat VO, not other characters' Chinese voices. No English dub.
- Coherent single mature-white-dragon Astra CG per scene, separate full-size Sam phone CG; no contact sheets as runtime art. Fable full illustrated CG retained.
- Every CG slide hard-cuts prior BGM/VO/SFX/WebAudio and cancels queued stale callbacks with ownership tokens. Haiku→Sonnet→Opus in-engine transformations restored; endings remain direct CG.
- Prior primary+40% / damaging-skill+50% buffs, whale/moon/Z glyphs, player rings, unlimited independent GPU5/10/20s cooldowns, hardcore retry all retained.

## Controls / 操作
WASD move · arrows/heldLMB aim/fire · Space roll · Shift/E/RMB skill ·1/2/3 GPU · **Q heal** · Esc pause · **H/? help** · **P debug panel** · Enter confirm/advance. Trial Stele precedes combat. Graders can use P to jump phases/trigger endings.

## Deployment / 发布
Serving branch `gh-pages`; build `pixel-v5-2-8c73474-ea7cc902`, source `8c73474`. Versioned runtime/SW with explicit VERSION/CLAIM handshake and the prior controller-takeover race fix retained. All339 runtime media files and all3CSS are byte-identical to V5.1 and reused at `releases/pixel-v5-1-cb050f5-ea7cc902/`; archive SHA-256 `ea7cc90228ca3fbdd7a2c68c3488e3f882c9fde2593ea005a76662d95a6ea113`.

Fresh first download ≈**65.53MB (62.49MiB)** including base64 overhead, JS/loader/CSS/SW. Existing complete V5.1 caches migrate locally into content-addressed `dd-media-ea7cc90228ca3fbd` with **zero media payload downloads**; only new JS(~642KB), loader and SW need fetching. Reload reuses cached media. Old caches remain intact; browser storage eviction can require downloading media again.

Existing tabs: refresh; if stale HTML persists, **Ctrl+Shift+R** or open https://aaashair.github.io/distillation-denied/?release=pixel-v5-2-8c73474-ea7cc902 . No cache clearing required. Previous V5.1 preserved in `v5-1-pages-archive`, all earlier archives/history/tags retained. No branch deletion, force push or custom Actions workflow. Authorized sequential connector publication, local Cursor CLI development.

## Current source / 当前源码
97-file current source/test/docs/tool snapshot (no raw media, logs, .env or secrets): `releases/pixel-v5-2-8c73474-ea7cc902/source-8c73474.tgz.b64`.
```sh
mkdir pixel-v5-2-source
base64 --decode releases/pixel-v5-2-8c73474-ea7cc902/source-8c73474.tgz.b64 | tar -xz -C pixel-v5-2-source
```
Old main `source/`/`payload/` are historical v1 archives, not current. Runtime media remain on gh-pages in the unchanged V5.1 media directory; V5.2 runtime and source are in the new release directory.

Prepublication V5.2 local baseline159/159 PASS (development evidence, not rerun during deploy). Publication tests cover real skill activation/natural cooldown completion for3 characters×2 languages,14px identity-colored cue, movement, pause/reuse/death/CG cleanup, preserved-V5.1 cache migration and fresh/reload paths. Deployment smoke uses labeled debug phase/HP/death setup, not normal-difficulty human playtesting. Assignment still requires two human testers. Credits: existing OpenLux AI art/Chinese voices/music/SFX, locally reused/composed; no media generation or spend during this release. Satire/parody; names belong to owners.
